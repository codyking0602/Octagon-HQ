-- UFC's single monthly Championship replaces new weekly trophies beginning November 2026.
-- Historical Daily attempts, title adjustments, weekly winners and the existing season
-- Championship are deliberately preserved. Football and NBA are untouched.

-- A monthly UFC title is not final until the last 48-hour Daily board has closed.
-- November 30's board remains playable through December 1, so the first
-- monthly champion cannot be announced before December 2 Central.
create or replace function private.ufc_monthly_championship_release_day(p_month_start date)
returns date language sql immutable set search_path = '' as $$
  select greatest(
    (p_month_start + interval '1 month')::date,
    private.daily_challenge_active_day(
      ((p_month_start + interval '1 month')::date - 1), 'ufc'
    ) + 2
  );
$$;
revoke all on function private.ufc_monthly_championship_release_day(date) from public, anon, authenticated;

-- Reuse the canonical sport Championship placement/weight engine rather than
-- introducing a competing grade calculation. The period filter is a calendar
-- month of UFC Daily board OPENINGS and locally dated UFC Picks events.
create or replace function public.get_ufc_monthly_championship(p_season integer default 2026)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_today date := private.daily_challenge_central_day(now());
  v_first date;
  v_last date;
  v_month date;
  v_month_end date;
  v_months jsonb := '[]'::jsonb;
  v_projection jsonb;
  v_row jsonb;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  if p_season is null or p_season not between 2026 and 2100 then
    raise exception 'invalid UFC Championship season';
  end if;

  v_first := case when p_season = 2026 then date '2026-11-01'
                  else make_date(p_season,1,1) end;
  v_last := date_trunc('month', least(v_today, make_date(p_season,12,31))::timestamp)::date;
  if v_last < v_first then
    return jsonb_build_object('sport','ufc','season',p_season,'latest',null,'months',v_months);
  end if;

  for v_month in select d::date from generate_series(
    v_last::timestamp, v_first::timestamp, interval '-1 month'
  ) as d loop
    v_month_end := (v_month + interval '1 month')::date - 1;

    -- Don't award on December 1: the November 30 board is still open.
    if v_today < private.ufc_monthly_championship_release_day(v_month) then
      continue;
    end if;

    -- A missing or substituted official Daily board must never silently
    -- produce a champion from incomplete evidence.
    if exists (
      select 1
      from generate_series(v_month::timestamp, v_month_end::timestamp, interval '1 day') as d
      where private.daily_challenge_active_day(d::date,'ufc') = d::date
        and not exists (
          select 1 from private.daily_challenges challenge
          where challenge.central_day = d::date
            and challenge.schedule_version =
              private.daily_challenge_schedule_for_day(d::date,'ufc')
            and challenge.fallback_reason is null
        )
    ) then continue; end if;

    -- Holds the award if a UFC Picks card in the month still awaits settlement.
    -- Cancelled cards may not be treated as completed events by the scorer.
    if exists (
      select 1 from public.pick_events event
      where event.sport = 'mma' and event.season = p_season
        and (event.starts_at at time zone 'America/Chicago')::date
          between v_month and v_month_end
        and event.status <> 'complete'
    ) then continue; end if;

    v_projection := private.sport_championship_week_projection(
      'ufc', p_season, v_month, v_month_end
    );
    if jsonb_array_length(coalesce(v_projection->'entries','[]'::jsonb)) = 0
       or (coalesce((v_projection#>>'{event_counts,picks}')::integer,0) +
           coalesce((v_projection#>>'{event_counts,daily}')::integer,0)) = 0
    then continue; end if;

    v_row := jsonb_build_object(
      'month_start', v_month,
      'month_end', v_month_end,
      'winner', v_projection->'entries'->0,
      'entries', v_projection->'entries',
      'weights', v_projection->'weights',
      'event_counts', v_projection->'event_counts'
    );
    v_months := v_months || jsonb_build_array(v_row);
  end loop;

  return jsonb_build_object(
    'sport','ufc','season',p_season,
    'latest',case when jsonb_array_length(v_months)>0 then v_months->0 else null end,
    'months',v_months
  );
end;
$$;
revoke all on function public.get_ufc_monthly_championship(integer) from public, anon;
grant execute on function public.get_ufc_monthly_championship(integer) to authenticated;
comment on function public.get_ufc_monthly_championship(integer) is
  'UFC monthly overall winners from November 2026, scored by canonical Picks/Play placement, released only after 48-hour board close and settlement.';

-- Freeze the legacy UFC weekly title era after its last fully daily week,
-- Oct 12–18. This is a read-projection change; historical awards persist.
do $patch$
declare
  v_sig regprocedure;
  v_sql text;
  v_old text;
  v_new text;
begin
  v_sig := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  v_old := 'and week_start < v_week_start';
  v_new := 'and week_start < v_week_start' || chr(10) ||
           '          and (p_sport <> ''ufc'' or week_start < date ''2026-10-19'')';
  if position(v_new in v_sql)=0 then
    if position(v_old in v_sql)=0 then raise exception 'daily weekly title contract changed'; end if;
    execute replace(v_sql,v_old,v_new);
  end if;

  -- Archive old weekly overall champions without minting another one after
  -- the 48-hour cutover. Football's schedule and banners remain unchanged.
  v_sig := 'public.get_sport_championship_weekly(text,integer)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  v_old := 'v_latest_start := least(v_latest_start, make_date(p_season + 1,1,1)-7);';
  v_new := v_old || chr(10) ||
           '  if p_sport = ''ufc'' then' || chr(10) ||
           '    v_latest_start := least(v_latest_start, date ''2026-10-12'');' || chr(10) ||
           '  end if;';
  if position(v_new in v_sql)=0 then
    if position(v_old in v_sql)=0 then raise exception 'weekly overall contract changed'; end if;
    execute replace(v_sql,v_old,v_new);
  end if;

  -- The UFC Daily-only weekly popup retires now. Keep legacy recap view rows
  -- and the Football recap RPC/acknowledgment contract intact.
  v_sig := 'public.get_my_daily_challenge_weekly_recap(text)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  v_old := 'v_current_week_start := private.daily_challenge_week_start(v_today, p_sport);';
  v_new := 'if p_sport = ''ufc'' and v_today >= date ''2026-10-25'' then return null; end if;' ||
           chr(10) || '  ' || v_old;
  if position(v_new in v_sql)=0 then
    if position(v_old in v_sql)=0 then raise exception 'UFC weekly recap contract changed'; end if;
    execute replace(v_sql,v_old,v_new);
  end if;

  v_sig := 'public.acknowledge_my_daily_challenge_weekly_recap(text,date)'::regprocedure;
  v_sql := pg_get_functiondef(v_sig::oid);
  v_old := 'v_expected_week_start := private.daily_challenge_week_start(v_today, p_sport) - 7;';
  v_new := 'if p_sport = ''ufc'' and v_today >= date ''2026-10-25'' then' ||
           chr(10) || '    raise exception ''UFC weekly recap retired'';' ||
           chr(10) || '  end if;' || chr(10) || '  ' || v_old;
  if position(v_new in v_sql)=0 then
    if position(v_old in v_sql)=0 then raise exception 'weekly recap acknowledgment contract changed'; end if;
    execute replace(v_sql,v_old,v_new);
  end if;
end
$patch$;

-- Period invariants; no production history or results are rewritten.
do $verify$
begin
  if private.ufc_monthly_championship_release_day(date '2026-11-01') <> date '2026-12-02'
    or private.ufc_monthly_championship_release_day(date '2026-12-01') <> date '2027-01-01'
    or private.daily_challenge_active_day(date '2026-11-01','ufc') <> date '2026-10-31'
    or private.daily_challenge_active_day(date '2026-11-30','ufc') <> date '2026-11-30'
  then raise exception 'UFC monthly boundary/carryover contract drift'; end if;
end
$verify$;

notify pgrst,'reload schema';

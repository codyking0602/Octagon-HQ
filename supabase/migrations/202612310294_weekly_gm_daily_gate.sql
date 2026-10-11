-- Oct 13–19 featured week is Weekly NFL GM, not the earlier Impostor pilot.
-- Daily Challenges are never blocked on two full GM franchise playthroughs.
create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date;
  v_day integer;
  v_subject text;
  v_required boolean;
  v_field_locked boolean;
  v_capacity integer:=null;
  v_field_size integer:=null;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;

  if (p_at at time zone 'America/Chicago')::date >= date '2026-10-13'
     and (p_at at time zone 'America/Chicago')::date < date '2026-10-20' then
    return jsonb_build_object('required',false,'available',true,
      'featured_challenge','gm-football','week_start',date '2026-10-13',
      'day_index',((p_at at time zone 'America/Chicago')::date-date '2026-10-13')+1);
  end if;

  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(v_week_start,p_profile_id,p_at);

  select field_locked_at is not null,subject_key
  into v_field_locked,v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(v_week_start,p_at);
    select count(*)::integer into v_field_size
    from private.football_weekly_auction_participants
    where week_start=v_week_start;
  end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,'available',false,'field_locked',v_field_locked,
      'capacity_reached',coalesce(v_capacity is not null and v_field_size>=v_capacity,false),
      'week_start',v_week_start,'day_index',v_day,'eligible_week_start',v_week_start+7
    );
  end if;

  if v_subject='nfl-best-team-seasons-since-2000' and v_day>=7 then
    select not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=p_profile_id
    ) into v_required;
  else
    select not exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=p_profile_id
    ) into v_required;
  end if;

  return jsonb_build_object(
    'required',v_required,'available',true,'field_locked',v_field_locked,
    'week_start',v_week_start,'day_index',least(greatest(v_day,1),7)
  );
end;
$$;


comment on function public.football_weekly_auction_daily_gate(uuid,timestamptz) is
  'October 13–19 NFL Weekly GM does not gate Football Daily. Normal weeks retain Auction.';
create or replace function public.create_hq_impostor_event(p_member_names text[])
returns jsonb language plpgsql security definer set search_path='' as $$
begin
  raise exception 'HQ Impostor is on hold; the October Featured Challenge is Weekly NFL GM.';
end; $$;
revoke all on function public.create_hq_impostor_event(text[]) from public,anon;
grant execute on function public.create_hq_impostor_event(text[]) to authenticated;

begin;

do $weekly_recap_contract$
declare
  v_get text;
  v_ack text;
begin
  if to_regclass('private.daily_challenge_weekly_recap_views') is null then
    raise exception 'weekly recap acknowledgement table is missing';
  end if;

  if to_regprocedure('public.get_my_daily_challenge_weekly_recap(text)') is null
    or to_regprocedure('public.acknowledge_my_daily_challenge_weekly_recap(text,date)') is null then
    raise exception 'weekly recap RPC contract is missing';
  end if;

  if private.daily_challenge_week_start(date '2026-09-21', 'ufc') <> date '2026-09-21'
    or private.daily_challenge_week_start(date '2026-09-21', 'football') <> date '2026-09-15'
    or private.daily_challenge_week_start(date '2026-09-22', 'football') <> date '2026-09-22' then
    raise exception 'weekly recap sport cadence drifted';
  end if;

  select pg_get_functiondef('public.get_my_daily_challenge_weekly_recap(text)'::regprocedure)
  into v_get;
  select pg_get_functiondef('public.acknowledge_my_daily_challenge_weekly_recap(text,date)'::regprocedure)
  into v_ack;

  if position('stats.played > 0' in v_get) = 0
    or position('daily_challenge_weekly_recap_views' in v_get) = 0
    or position('private.daily_challenge_hit_number_distance' in v_get) = 0
    or position('football_daily_transition_adjustments' in v_get) = 0
    or position('maintain_football_weekly_auction' in v_get) = 0
    or position('auction_week.subject_key = ''cfb-best-teams-since-2000''' in v_get) = 0 then
    raise exception 'weekly recap canonical scoring or participation contract drifted';
  end if;

  if position('weekly championship recap is not current' in v_ack) = 0
    or position('daily_challenge_weekly_recap_views' in v_ack) = 0 then
    raise exception 'weekly recap acknowledgement contract drifted';
  end if;

  if has_function_privilege('anon', 'public.get_my_daily_challenge_weekly_recap(text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.acknowledge_my_daily_challenge_weekly_recap(text,date)', 'EXECUTE') then
    raise exception 'anonymous weekly recap access must remain denied';
  end if;
end
$weekly_recap_contract$;

rollback;

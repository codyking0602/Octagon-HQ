do $$
declare v_getter text; v_ack text;
begin
  if to_regclass('private.daily_challenge_weekly_recap_views') is null then
    raise exception 'weekly recap acknowledgement owner table is missing';
  end if;
  if to_regprocedure('public.get_my_daily_challenge_weekly_recap(text,timestamptz)') is null
    or to_regprocedure('public.acknowledge_my_daily_challenge_weekly_recap(text,date,timestamptz)') is null then
    raise exception 'weekly recap RPC contract is missing';
  end if;

  select pg_get_functiondef('public.get_my_daily_challenge_weekly_recap(text,timestamptz)'::regprocedure) into v_getter;
  select pg_get_functiondef('public.acknowledge_my_daily_challenge_weekly_recap(text,date,timestamptz)'::regprocedure) into v_ack;

  if position('((extract(isodow from v_today)::integer + 5) % 7)' in v_getter) = 0 then
    raise exception 'Football Tuesday-Monday recap cadence is missing';
  end if;
  if position('private.daily_challenge_hit_number_distance' in v_getter) = 0 then
    raise exception 'Hit the Number exact-distance winner contract is missing';
  end if;
  if position('weekly_stats_base' in v_getter) = 0 or position('count(*)::integer as played' in v_getter) = 0 then
    raise exception 'recap must be sourced from members who played a Daily game';
  end if;
  if position('private.football_daily_transition_adjustments' in v_getter) = 0 then
    raise exception 'Football transition carry is missing from recap wins';
  end if;
  if position('private.maintain_football_weekly_auction' in v_getter) = 0
    or position('auction_week.subject_key = ''cfb-best-teams-since-2000''' in v_getter) = 0 then
    raise exception 'Football CFB Weekly Auction bonus/finalization contract is missing';
  end if;
  if position('private.daily_challenge_weekly_recap_views' in v_getter) = 0
    or position('private.daily_challenge_weekly_recap_views' in v_ack) = 0 then
    raise exception 'cross-device one-time acknowledgement contract is missing';
  end if;

  if not has_function_privilege('authenticated','public.get_my_daily_challenge_weekly_recap(text,timestamptz)','EXECUTE')
    or not has_function_privilege('authenticated','public.acknowledge_my_daily_challenge_weekly_recap(text,date,timestamptz)','EXECUTE') then
    raise exception 'authenticated members cannot use weekly recap RPCs';
  end if;
  if has_function_privilege('anon','public.get_my_daily_challenge_weekly_recap(text,timestamptz)','EXECUTE')
    or has_function_privilege('anon','public.acknowledge_my_daily_challenge_weekly_recap(text,date,timestamptz)','EXECUTE') then
    raise exception 'anonymous users can access weekly recap RPCs';
  end if;
end
$$;

-- Keep one canonical Daily Challenge materialization request and make it sport-aware.
-- Existing zero/one-argument callers continue to resolve UFC through the defaults.

drop function if exists public.get_daily_challenge_materialization_request(timestamptz);

create function public.get_daily_challenge_materialization_request(
  p_at timestamptz default now(),
  p_sport text default 'ufc'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_day date;
  v_schedule_version text;
  v_expected_game text;
  v_daily private.daily_challenges;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to resolve daily challenge materialization';
  end if;

  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  v_day := private.daily_challenge_central_day(p_at);
  v_schedule_version := private.daily_challenge_schedule_for_day(v_day, p_sport);
  if v_schedule_version is null then
    raise exception 'no % daily challenge schedule is active for %', p_sport, v_day;
  end if;
  v_expected_game := private.daily_challenge_expected_game(v_schedule_version, v_day);

  select daily.*
  into v_daily
  from private.daily_challenges daily
  where daily.central_day = v_day
    and daily.schedule_version = v_schedule_version;

  return jsonb_build_object(
    'required', v_daily.id is null,
    'central_day', v_day,
    'schedule_version', v_schedule_version,
    'expected_game', v_expected_game,
    'daily_challenge_id', v_daily.id,
    'published_game', v_daily.game_type,
    'fallback_reason', v_daily.fallback_reason
  );
end;
$$;

revoke all on function public.get_daily_challenge_materialization_request(timestamptz, text)
  from public, anon, authenticated;
grant execute on function public.get_daily_challenge_materialization_request(timestamptz, text)
  to service_role;

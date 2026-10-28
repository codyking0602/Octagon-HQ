-- Resolve sport-scoped Daily identity before loading any generated Football runtime.
-- Published Daily rows remain immutable and are reused directly on normal reads.

create or replace function public.get_daily_challenge_materialization_request(
  p_sport text,
  p_at timestamptz default now()
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

revoke all on function public.get_daily_challenge_materialization_request(text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.get_daily_challenge_materialization_request(text, timestamptz)
  to service_role;

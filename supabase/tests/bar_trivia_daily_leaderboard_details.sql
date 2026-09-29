\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $test$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.get_daily_challenge_leaderboard(date,text,text)'::regprocedure::oid
  ) into v_definition;

  if position('when history.game_type = ''bar_trivia'' then' in v_definition) = 0
    or position('progress.public_state -> ''answers''' in v_definition) = 0
    or position('''question_id''' in v_definition) = 0
    or position('''choice''' in v_definition) = 0
    or position('''correct''' in v_definition) = 0
    or position('''points''' in v_definition) = 0
    or position('''double_round_bonus''' in v_definition) = 0
    or position('''streak_bonus''' in v_definition) = 0
    or position('''wager_delta''' in v_definition) = 0 then
    raise exception 'Bar Trivia leaderboard answer evidence is incomplete';
  end if;

  if position('history.profile_id = v_profile' in v_definition) = 0
    or position('security definer' in lower(v_definition)) = 0
    or position('set search_path = ''''' in lower(v_definition)) = 0 then
    raise exception 'Bar Trivia leaderboard detail bypassed the canonical spoiler/auth gate';
  end if;

  if has_function_privilege(
    'anon',
    'public.get_daily_challenge_leaderboard(date,text,text)',
    'EXECUTE'
  ) then
    raise exception 'anonymous role can execute the Daily leaderboard detail RPC';
  end if;
end
$test$;

rollback;

\echo 'Bar Trivia Daily leaderboard detail proof passed.'

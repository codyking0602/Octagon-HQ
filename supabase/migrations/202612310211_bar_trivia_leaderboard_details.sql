-- Add an explicit, sanitized Bar Trivia result-detail contract for the shared
-- Daily leaderboard viewer. The existing leaderboard completion gate remains
-- authoritative: no member result details are returned until the caller has
-- completed the same Daily.
do $bar_trivia_leaderboard$
declare
  v_signature constant regprocedure :=
    'public.get_daily_challenge_leaderboard(date,text,text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        else '{}'::jsonb
      end as result_detail,
$old$;
  v_replacement constant text := $new$
        when history.game_type = 'bar_trivia' then
          jsonb_build_object(
            'answers',
            coalesce((
              select jsonb_agg(
                jsonb_strip_nulls(jsonb_build_object(
                  'question_id', answer ->> 'questionId',
                  'choice', answer ->> 'choice',
                  'correct', answer -> 'correct',
                  'points', answer -> 'points',
                  'raw_points', answer -> 'rawPoints',
                  'base_points', answer -> 'basePoints',
                  'double_round_bonus', answer -> 'doubleRoundBonus',
                  'streak_bonus', answer -> 'streakBonus',
                  'wager_delta', answer -> 'wagerDelta',
                  'round_multiplier', answer -> 'roundMultiplier',
                  'streak_multiplier', answer -> 'streakMultiplier'
                ))
                order by ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.public_state -> 'answers') = 'array'
                    then progress.public_state -> 'answers'
                  else '[]'::jsonb
                end
              ) with ordinality as answer_rows(answer, ordinality)
            ), '[]'::jsonb),
            'double_round', progress.public_state ->> 'double_round',
            'wager', progress.public_state -> 'wager'
          )
        else '{}'::jsonb
      end as result_detail,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('when history.game_type = ''bar_trivia'' then' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily leaderboard result-detail branch changed before Bar Trivia integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('when history.game_type = ''bar_trivia'' then' in v_definition) = 0
    or position('progress.public_state -> ''answers''' in v_definition) = 0
    or position('''question_id''' in v_definition) = 0
    or position('''wager_delta''' in v_definition) = 0 then
    raise exception 'Bar Trivia Daily leaderboard detail patch did not apply exactly';
  end if;
end
$bar_trivia_leaderboard$;

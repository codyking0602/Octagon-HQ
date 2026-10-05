-- Preserve sanitized raw Sports Feud main-board attempts in the shared Daily
-- leaderboard result detail so grading and typo behavior can be audited after completion.
do $sports_feud_attempts$
declare
  v_signature constant regprocedure :=
    'public.get_daily_challenge_leaderboard(date,text,text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        when history.game_type = 'sports_feud' then
          jsonb_build_object(
            'fast_money_results',
$old$;
  v_replacement constant text := $new$
        when history.game_type = 'sports_feud' then
          jsonb_build_object(
            'main_board_attempts',
            coalesce((
              select jsonb_agg(
                jsonb_build_object(
                  'round', board_ordinality,
                  'attempts',
                  coalesce((
                    select jsonb_agg(
                      jsonb_strip_nulls(jsonb_build_object(
                        'submitted_text', attempt ->> 'submittedText',
                        'normalized_text', attempt ->> 'normalizedText',
                        'status', attempt ->> 'status',
                        'entity_id', attempt ->> 'entityId',
                        'match_kind', attempt ->> 'matchKind'
                      ))
                      order by attempt_ordinality
                    )
                    from jsonb_array_elements(
                      case
                        when jsonb_typeof(board -> 'attempts') = 'array'
                          then board -> 'attempts'
                        else '[]'::jsonb
                      end
                    ) with ordinality as attempt_rows(attempt, attempt_ordinality)
                  ), '[]'::jsonb)
                )
                order by board_ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.submission_state #> '{engine_state,mainBoards}') = 'array'
                    then progress.submission_state #> '{engine_state,mainBoards}'
                  else '[]'::jsonb
                end
              ) with ordinality as board_rows(board, board_ordinality)
            ), '[]'::jsonb),
            'fast_money_results',
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('''main_board_attempts''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily leaderboard Sports Feud branch changed before attempt persistence integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''main_board_attempts''' in v_definition) = 0
    or position('''submitted_text''' in v_definition) = 0
    or position('''match_kind''' in v_definition) = 0
    or position('engine_state,mainBoards' in v_definition) = 0 then
    raise exception 'Sports Feud Daily leaderboard attempt patch did not apply exactly';
  end if;
end
$sports_feud_attempts$;

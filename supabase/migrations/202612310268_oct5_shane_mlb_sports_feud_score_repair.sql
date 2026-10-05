-- Correct Shane's October 5, 2026 MLB Sports Feud result after the
-- five-letter surname typo tolerance fix. Cody confirmed the two rejected
-- Round 2 guesses were intended as Derek Jeter and David Ortiz and asked that
-- the best four of the six named Round 2 answers be scored.
--
-- Best four: Ohtani 10 + Jeter 7 + A-Rod 5 + Pujols 4 = 26.
-- Existing Round 2: 21. Official score: 81 -> 86.
do $oct5_shane_mlb_feud$
declare
  v_profile uuid;
  v_score numeric;
  v_detail jsonb;
  v_board jsonb;
  v_answers jsonb;
begin
  select profile.id
  into v_profile
  from public.profiles profile
  where profile.normalized_name = 'SHANE'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select result.raw_score, result.result_detail
  into v_score, v_detail
  from public.mlb_postseason_challenge_results result
  where result.season = 2026
    and result.challenge_key = 'mlb-2026-play-06'
    and result.profile_id = v_profile
  limit 1;

  if v_score is null then
    return;
  end if;

  if v_score not in (81, 86) then
    raise exception 'Oct. 5 Shane MLB Sports Feud score changed before correction: %', v_score;
  end if;

  if v_score = 86 then
    return;
  end if;

  v_board := coalesce(v_detail->'main_boards'->1, '{}'::jsonb);

  select coalesce(
    jsonb_agg(
      answer.value
      || jsonb_build_object(
        'found',
        lower(answer.value->>'name') in (
          'shohei ohtani',
          'derek jeter',
          'alex rodriguez',
          'albert pujols'
        )
      )
      order by answer.ordinality
    ),
    '[]'::jsonb
  )
  into v_answers
  from jsonb_array_elements(coalesce(v_board->'board_answers', '[]'::jsonb))
    with ordinality as answer(value, ordinality);

  v_board := v_board
    || jsonb_build_object(
      'points', 26,
      'strikes', 0,
      'found_answers', jsonb_build_array(
        'Shohei Ohtani',
        'Derek Jeter',
        'Alex Rodriguez',
        'Albert Pujols'
      ),
      'board_answers', v_answers,
      'score_correction',
        jsonb_build_object(
          'reason', 'Jeter and Ortiz misspellings should have matched under corrected typo tolerance; owner awarded best four of six named answers',
          'original_points', 21,
          'corrected_points', 26
        )
    );

  update public.mlb_postseason_challenge_results
  set raw_score = 86,
      public_result = public_result
        || jsonb_build_object(
          'score', 86,
          'main_points', 56,
          'fast_money_points', 30,
          'score_correction', '2026-10-05-mlb-feud-shane-typo-repair'
        ),
      result_detail = jsonb_set(
        v_detail
          || jsonb_build_object(
            'score_correction',
            jsonb_build_object(
              'reason', 'Jeter and Ortiz misspellings should have matched; best four of six named Round 2 answers awarded',
              'original_score', 81,
              'corrected_score', 86,
              'original_round_2_points', 21,
              'corrected_round_2_points', 26
            )
          ),
        '{main_boards,1}',
        v_board,
        false
      ),
      updated_at = now()
  where season = 2026
    and challenge_key = 'mlb-2026-play-06'
    and profile_id = v_profile
    and raw_score = 81;
end
$oct5_shane_mlb_feud$;

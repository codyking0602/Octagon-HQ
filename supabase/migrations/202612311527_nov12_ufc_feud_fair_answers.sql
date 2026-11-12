-- Nov 12 UFC Sports Feud: Cody's scored Fast Money answers missed two fair matches.
-- Preserve the immutable published pack, actual submissions, and raw graded attempt.
-- The signed correction ledger adjusts leaderboard/history; update only the public
-- result projection so the detailed completed result also reflects 86/100.
do $nov12_ufc_feud$
declare
  v_row record;
  v_count integer := 0;
  v_existing integer;
  v_updated integer;
  v_fast jsonb;
begin
  for v_row in
    select a.id as attempt_id, a.native_score, a.normalized_score,
           a.daily_challenge_id, a.profile_id,
           pr.public_state, pr.submission_state,
           s.private_setup_evidence
    from private.daily_challenge_attempts a
    join private.daily_challenges dc on dc.id=a.daily_challenge_id
    join private.daily_challenge_setups s on s.id=dc.setup_id
    join private.daily_challenge_progress pr
      on pr.daily_challenge_id=a.daily_challenge_id
     and pr.profile_id=a.profile_id
    join public.profiles p on p.id=a.profile_id
    where a.id='6684e6cb-0b67-4427-b51c-f1479bea578b'::uuid
      and dc.central_day=date '2026-11-12'
      and dc.game_type='sports_feud'
      and dc.schedule_version='ufc-daily-v22-higher-lower-oct29'
      and a.attempt_kind='official_first'
      and p.normalized_name='CODY'
  loop
    v_count := v_count + 1;
    if v_count <> 1
      or v_row.native_score <> 79 or v_row.normalized_score <> 79
      or v_row.public_state->>'phase' <> 'complete'
      or (v_row.public_state->>'main_points')::integer <> 57
      or (v_row.public_state#>>'{fast_money,points}')::integer not in (22,29)
      or (v_row.public_state->>'hq_score')::integer not in (79,86)
      or v_row.private_setup_evidence#>>'{pack,fastMoney,1,id}'
         <> 'ufc-v2-fast13-close-stoppage-debate'
      or v_row.private_setup_evidence#>>'{pack,fastMoney,2,id}'
         <> 'ufc-v2-fast-fight-sounds'
      or jsonb_array_length(v_row.submission_state#>'{engine_state,fastMoneyResults}') <> 5
      or jsonb_array_length(v_row.public_state#>'{fast_money,results}') <> 5
      or v_row.submission_state#>>'{engine_state,fastMoneyResults,1,submittedText}'
         <> 'Got Up Quick'
      or v_row.submission_state#>>'{engine_state,fastMoneyResults,2,submittedText}'
         <> 'Kick'
      or v_row.submission_state#>>'{engine_state,fastMoneyResults,1,points}' <> '0'
      or v_row.submission_state#>>'{engine_state,fastMoneyResults,2,points}' <> '0'
    then
      raise exception 'Nov 12 UFC Feud evidence differs from the verified original run';
    end if;

    select score_delta into v_existing
    from private.daily_challenge_score_corrections
    where attempt_id=v_row.attempt_id;
    if v_existing is not null and v_existing <> 7 then
      raise exception 'Nov 12 UFC Feud has a conflicting signed score correction';
    end if;

    insert into private.daily_challenge_score_corrections(
      attempt_id, score_delta, main_points_delta, fast_money_points_delta,
      editorial_details, reason
    ) values (
      v_row.attempt_id, 7, 0, 7,
      jsonb_build_object('feud_fast',jsonb_build_array(
        jsonb_build_object(
          'question_id','ufc-v2-fast13-close-stoppage-debate',
          'answer','Got Up Quick','matched','Fighter stood back up','points',6,'board_rank',3
        ),
        jsonb_build_object(
          'question_id','ufc-v2-fast-fight-sounds',
          'answer','Kick','matched','Kick landing','points',1,'board_rank',null
        )
      )),
      'Nov 12 UFC Feud: Got Up Quick is Fighter stood back up (+6); Kick landing is a fair off-board fight sound (+1). Preserve the original submitted answers and ranked publication.'
    ) on conflict (attempt_id) do nothing;

    select coalesce(jsonb_agg(
      case
        when item.value->>'question_id'='ufc-v2-fast13-close-stoppage-debate'
          and item.value->>'submitted_answer'='Got Up Quick'
        then item.value || jsonb_build_object(
          'points',6,'counted',true,'board_rank',3,
          'matched_answer','Fighter stood back up')
        when item.value->>'question_id'='ufc-v2-fast-fight-sounds'
          and item.value->>'submitted_answer'='Kick'
        then item.value || jsonb_build_object(
          'points',1,'counted',true,'board_rank',null,
          'matched_answer','Kick landing')
        else item.value end order by item.ordinality
    ),'[]'::jsonb) into v_fast
    from jsonb_array_elements(v_row.public_state#>'{fast_money,results}')
      with ordinality as item(value,ordinality);

    if jsonb_array_length(v_fast) <> 5
      or v_fast#>>'{1,points}' <> '6'
      or v_fast#>>'{2,points}' <> '1'
      or (select sum((value->>'points')::integer)
          from jsonb_array_elements(v_fast)) <> 29
    then
      raise exception 'Nov 12 UFC Feud corrected public results fail reconciliation';
    end if;

    update private.daily_challenge_progress pr
    set public_state = pr.public_state || jsonb_build_object(
      'hq_score',86,'raw_points',86,'main_points',57,
      'fast_money', (pr.public_state->'fast_money') ||
        jsonb_build_object('points',29,'results',v_fast),
      'editorial_correction','2026-11-12-verified-ufc-feud-fair-answers'
    ),updated_at=now()
    where pr.daily_challenge_id=v_row.daily_challenge_id
      and pr.profile_id=v_row.profile_id
      and (pr.public_state->>'hq_score')::integer in (79,86);
    get diagnostics v_updated=row_count;
    if v_updated <> 1 then
      raise exception 'Nov 12 UFC Feud corrected public result was not unique';
    end if;
  end loop;
  -- Fresh/legacy test databases have no Nov 12 player attempt; skip them.
  -- Production is separately verified for the single targeted corrected row.
end
$nov12_ufc_feud$;

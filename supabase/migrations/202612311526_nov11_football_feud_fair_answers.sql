-- November 11 CFB Football Feud: exact, signed Cody score correction (+13).
-- Immutable published question packs, recorded actions, and graded attempts are
-- never overwritten. Correct only the completed public result projection and
-- canonical history/leaderboards through the existing correction ledger.
do $nov11_feud$
declare
  v_row record;
  v_count integer := 0;
  v_existing integer;
  v_updated integer;
  v_fast jsonb;
begin
  for v_row in
    select
      a.id as attempt_id, a.native_score, a.normalized_score,
      a.daily_challenge_id, a.profile_id, dc.schedule_version,
      pr.public_state, pr.submission_state, s.private_setup_evidence
    from private.daily_challenge_attempts a
    join private.daily_challenges dc on dc.id=a.daily_challenge_id
    join private.daily_challenge_setups s on s.id=dc.setup_id
    join private.daily_challenge_progress pr
      on pr.daily_challenge_id=a.daily_challenge_id
     and pr.profile_id=a.profile_id
    join public.profiles p on p.id=a.profile_id
    where dc.central_day=date '2026-11-11'
      and dc.game_type='sports_feud'
      and dc.schedule_version='football-daily-v22-higher-lower-oct27'
      and a.attempt_kind='official_first'
      and p.normalized_name='CODY'
  loop
    v_count := v_count + 1;
    if v_count <> 1
       or v_row.native_score <> 69 or v_row.normalized_score <> 69
       or v_row.public_state->>'phase' <> 'complete'
       or (v_row.public_state->>'main_points')::integer <> 50
       or (v_row.public_state#>>'{fast_money,points}')::integer not in (19,32)
       or v_row.private_setup_evidence#>>'{pack,mainBoards,0,id}'
         <> 'cfb-feud-r2-main-cfb-davey-obrien'
       or v_row.private_setup_evidence#>>'{pack,mainBoards,1,id}'
         <> 'cfb-feud-r2-main-heisman-running-back-schools'
       or v_row.private_setup_evidence#>>'{pack,fastMoney,0,id}'
         <> 'cfb-feud-r2-fast-cfb-pregame-segments'
       or v_row.private_setup_evidence#>>'{pack,fastMoney,4,id}'
         <> 'cfb-feud-r2-fast-college-injury-sideline'
       or v_row.submission_state#>>'{engine_state,fastMoneyResults,0,submittedText}'
         <> 'Picks'
       or v_row.submission_state#>>'{engine_state,fastMoneyResults,4,submittedText}'
         <> 'Tape'
       or v_row.submission_state#>>'{engine_state,fastMoneyResults,0,points}' <> '0'
       or v_row.submission_state#>>'{engine_state,fastMoneyResults,4,points}' <> '0'
       or jsonb_array_length(v_row.submission_state#>'{engine_state,fastMoneyResults}') <> 5
       or jsonb_array_length(v_row.public_state#>'{fast_money,results}') <> 5
    then
      raise exception 'Nov 11 Football Feud original run differs from verified answer ledger';
    end if;

    select c.score_delta into v_existing
    from private.daily_challenge_score_corrections c
    where c.attempt_id=v_row.attempt_id;
    if v_existing is not null and v_existing <> 13 then
      raise exception 'Nov 11 Football Feud has conflicting signed score correction';
    end if;

    insert into private.daily_challenge_score_corrections(
      attempt_id, score_delta, main_points_delta, fast_money_points_delta,
      editorial_details, reason
    ) values (
      v_row.attempt_id, 13, 0, 13,
      jsonb_build_object('feud_fast', jsonb_build_array(
        jsonb_build_object('question_id','cfb-feud-r2-fast-cfb-pregame-segments',
          'answer','Picks','matched','Game predictions','points',8,'board_rank',1),
        jsonb_build_object('question_id','cfb-feud-r2-fast-college-injury-sideline',
          'answer','Tape','matched','Wrap injury','points',5,'board_rank',4))),
      'Nov 11 CFB Feud: Picks is Game predictions (+8), Tape is Wrap injury (+5). Preserve the original submitted answers and ranked publication.'
    ) on conflict (attempt_id) do nothing;

    select coalesce(jsonb_agg(
      case
        when item.value->>'question_id'='cfb-feud-r2-fast-cfb-pregame-segments'
          and item.value->>'submitted_answer'='Picks'
        then item.value || jsonb_build_object(
          'points',8,'counted',true,'board_rank',1,'matched_answer','Game predictions')
        when item.value->>'question_id'='cfb-feud-r2-fast-college-injury-sideline'
          and item.value->>'submitted_answer'='Tape'
        then item.value || jsonb_build_object(
          'points',5,'counted',true,'board_rank',4,'matched_answer','Wrap injury')
        else item.value end order by item.ordinality
    ), '[]'::jsonb) into v_fast
    from jsonb_array_elements(v_row.public_state#>'{fast_money,results}')
      with ordinality as item(value,ordinality);
    if jsonb_array_length(v_fast) <> 5
       or v_fast#>>'{0,points}' <> '8'
       or v_fast#>>'{4,points}' <> '5'
       or (select sum((value->>'points')::integer)
           from jsonb_array_elements(v_fast)) <> 32
    then
      raise exception 'Nov 11 Football Feud public correction failed score reconciliation';
    end if;

    update private.daily_challenge_progress pr
    set public_state = pr.public_state || jsonb_build_object(
      'hq_score',82,'raw_points',82,'main_points',50,
      'fast_money', (pr.public_state->'fast_money') ||
        jsonb_build_object('points',32,'results',v_fast),
      'editorial_correction','2026-11-11-verified-football-feud-fair-answers'
    ), updated_at=now()
    where pr.daily_challenge_id=v_row.daily_challenge_id
      and pr.profile_id=v_row.profile_id
      and (pr.public_state->>'hq_score')::integer in (69,82);
    get diagnostics v_updated=row_count;
    if v_updated <> 1 then
      raise exception 'Nov 11 Football Feud public correction was not unique';
    end if;
  end loop;
end
$nov11_feud$;

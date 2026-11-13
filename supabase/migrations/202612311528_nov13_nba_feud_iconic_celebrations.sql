-- Nov 13 NBA Sports Feud: the published celebrations list omitted Mutombo's
-- unmistakable finger wag. The owner approved a revised signature-ranked board
-- (Mutombo #1) and historical score 88 -> 96. Do not overwrite the immutable
-- published setup, final submission, or original graded attempt.
-- A signed editorial correction adjusts history/leaderboards, while the
-- completed public result shows the revised editorial board and score.
do $nov13_nba_feud$
declare
  v_row record;
  v_count integer := 0;
  v_existing integer;
  v_updated integer;
  v_fast jsonb;
  v_ranked jsonb;
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
    where a.id='8126112e-f594-43b3-873e-bc6a8c7d9075'::uuid
      and dc.central_day=date '2026-11-13'
      and dc.game_type='sports_feud'
      and dc.schedule_version='nba-daily-regular-v3-oct30-public'
      and a.attempt_kind='official_first'
      and p.normalized_name='CODY'
  loop
    v_count := v_count + 1;
    if v_count <> 1
      or v_row.native_score <> 88 or v_row.normalized_score <> 88
      or v_row.public_state->>'phase' <> 'complete'
      or (v_row.public_state->>'main_points')::integer <> 58
      or (v_row.public_state#>>'{fast_money,points}')::integer not in (30,38)
      or (v_row.public_state->>'hq_score')::integer not in (88,96)
      or v_row.private_setup_evidence#>>'{pack,fastMoney,2,id}'
         <> 'nba-feud-famous-celebrations'
      or jsonb_array_length(v_row.submission_state#>'{engine_state,fastMoneyResults}') <> 5
      or jsonb_array_length(v_row.public_state#>'{fast_money,results}') <> 5
      or v_row.submission_state#>>'{engine_state,fastMoneyResults,2,submittedText}' <> 'Mutumbo'
      or v_row.submission_state#>>'{engine_state,fastMoneyResults,2,points}' <> '0'
      or v_row.public_state#>>'{fast_money,results,2,submitted_answer}' <> 'Mutumbo'
    then
      raise exception 'Nov 13 NBA Feud evidence differs from the verified original run';
    end if;

    select score_delta into v_existing
    from private.daily_challenge_score_corrections
    where attempt_id=v_row.attempt_id;
    if v_existing is not null and v_existing <> 8 then
      raise exception 'Nov 13 NBA Feud has a conflicting signed score correction';
    end if;

    insert into private.daily_challenge_score_corrections(
      attempt_id, score_delta, main_points_delta, fast_money_points_delta,
      editorial_details, reason
    ) values (
      v_row.attempt_id, 8, 0, 8,
      jsonb_build_object(
        'feud_fast', jsonb_build_array(jsonb_build_object(
          'question_id','nba-feud-famous-celebrations',
          'answer','Mutumbo','matched','Dikembe Mutombo',
          'points',8,'board_rank',1,
          'signature','Finger wag after a block'
        )),
        'ranked_editorial_board',jsonb_build_array(
          'Dikembe Mutombo','Stephen Curry','Damian Lillard',
          'Carmelo Anthony','Michael Jordan','LeBron James',
          'Russell Westbrook','D''Angelo Russell'
        )
      ),
      'Nov 13 NBA Sports Feud: Mutumbo is Dikembe Mutombo, the revised #1 iconic celebration (finger wag). Historical signed editorial score correction +8; raw submission and publication remain immutable.'
    ) on conflict (attempt_id) do nothing;

    -- Rebuild only the completed result's visible answer reveal. Existing
    -- published identities are reused; the previously absent Mutombo gets an
    -- editorial display ID. This does not alter the signed grading proof.
    select jsonb_agg(
      jsonb_build_object(
        'entity',jsonb_build_object(
          'id',coalesce(found.entity_id,'nba-feud-famous-celebrations:editorial-mutombo'),
          'display_name',ranked.name
        ),
        'points',ranked.points
      ) order by ranked.ordinality
    ) into v_ranked
    from (values
      (1,'Dikembe Mutombo',8),
      (2,'Stephen Curry',7),
      (3,'Damian Lillard',6),
      (4,'Carmelo Anthony',5),
      (5,'Michael Jordan',4),
      (6,'LeBron James',3),
      (7,'Russell Westbrook',2),
      (8,'D''Angelo Russell',1)
    ) as ranked(ordinality,name,points)
    left join lateral (
      select e.value->>'id' as entity_id
      from jsonb_array_elements(v_row.private_setup_evidence#>'{pack,entities}') e(value)
      where e.value->>'displayName'=ranked.name
        and e.value->>'id' like 'nba-feud-famous-celebrations:%'
      limit 1
    ) found on true;

    if jsonb_array_length(v_ranked) <> 8
      or v_ranked#>>'{0,entity,display_name}' <> 'Dikembe Mutombo'
      or v_ranked#>>'{0,points}' <> '8'
    then
      raise exception 'Nov 13 NBA Feud revised board did not reconcile';
    end if;

    select coalesce(jsonb_agg(
      case
        when item.value->>'question_id'='nba-feud-famous-celebrations'
          and item.value->>'submitted_answer'='Mutumbo'
        then item.value || jsonb_build_object(
          'points',8,'counted',true,'board_rank',1,
          'matched_answer','Dikembe Mutombo',
          'accepted_answers',v_ranked
        )
        else item.value
      end order by item.ordinality
    ),'[]'::jsonb) into v_fast
    from jsonb_array_elements(v_row.public_state#>'{fast_money,results}')
      with ordinality as item(value,ordinality);

    if jsonb_array_length(v_fast) <> 5
      or v_fast#>>'{2,points}' <> '8'
      or v_fast#>>'{2,board_rank}' <> '1'
      or (select sum((value->>'points')::integer)
          from jsonb_array_elements(v_fast)) <> 38
    then
      raise exception 'Nov 13 NBA Feud corrected Fast Money fails reconciliation';
    end if;

    update private.daily_challenge_progress pr
    set public_state = pr.public_state || jsonb_build_object(
      'hq_score',96,'raw_points',96,'main_points',58,
      'fast_money',(pr.public_state->'fast_money') ||
        jsonb_build_object('points',38,'results',v_fast),
      'editorial_correction','2026-11-13-nba-iconic-celebrations'
    ),updated_at=now()
    where pr.daily_challenge_id=v_row.daily_challenge_id
      and pr.profile_id=v_row.profile_id
      and (pr.public_state->>'hq_score')::integer in (88,96);
    get diagnostics v_updated=row_count;
    if v_updated <> 1 then
      raise exception 'Nov 13 NBA Feud corrected public result was not unique';
    end if;
  end loop;
  -- CI fixture databases without this historical owner attempt skip the update.
end
$nov13_nba_feud$;

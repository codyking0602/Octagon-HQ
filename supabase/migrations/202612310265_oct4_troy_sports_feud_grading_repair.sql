-- Repair Troy's October 4, 2026 CFB Sports Feud run using the existing
-- four-correct-answer board rule. Kalen DeBoer and Dan Mullen are valid
-- 2-point off-board coach answers; Jadan Baugh is a valid 1-point Fast Money
-- answer. Original submitted action history remains untouched.

do $oct4_setup$
declare
  v_setup uuid;
  v_evidence jsonb;
  v_pack jsonb;
  v_entities jsonb;
  v_board jsonb;
  v_fast jsonb;
  v_fast_index integer;
begin
  select setup.id
  into v_setup
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = date '2026-10-04'
    and schedule.sport = 'football'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_setup is null then
    return;
  end if;

  select setup.private_setup_evidence
  into v_evidence
  from private.daily_challenge_setups setup
  where setup.id = v_setup;

  v_pack := v_evidence->'pack';
  if v_pack->'mainBoards'->0->>'id' is distinct from 'cfb-main-10-4' then
    raise exception 'Oct. 4 CFB Sports Feud first board identity changed before Troy repair';
  end if;

  select (fm.ordinality - 1)::integer
  into v_fast_index
  from jsonb_array_elements(v_pack->'fastMoney') with ordinality fm(value, ordinality)
  where fm.value->>'id' = 'cfb-fast5-03-2'
  limit 1;

  if v_fast_index is null then
    raise exception 'Oct. 4 CFB Sports Feud Baugh Fast Money prompt is missing';
  end if;

  v_entities := v_pack->'entities';

  if not exists (
    select 1
    from jsonb_array_elements(v_entities) entity
    where entity->>'id' = 'cfb-main-10-4:v10'
  ) then
    v_entities := v_entities || jsonb_build_array(
      jsonb_build_object(
        'id', 'cfb-main-10-4:v10',
        'kind', 'person',
        'aliases', '[]'::jsonb,
        'displayName', 'Kalen DeBoer'
      )
    );
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_entities) entity
    where entity->>'id' = 'cfb-main-10-4:v11'
  ) then
    v_entities := v_entities || jsonb_build_array(
      jsonb_build_object(
        'id', 'cfb-main-10-4:v11',
        'kind', 'person',
        'aliases', '[]'::jsonb,
        'displayName', 'Dan Mullen'
      )
    );
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_entities) entity
    where entity->>'id' = 'cfb-fast5-03-2:v8'
  ) then
    v_entities := v_entities || jsonb_build_array(
      jsonb_build_object(
        'id', 'cfb-fast5-03-2:v8',
        'kind', 'person',
        'aliases', '[]'::jsonb,
        'displayName', 'Jadan Baugh'
      )
    );
  end if;

  v_board := v_pack->'mainBoards'->0;
  if not (v_board->'candidateIds' ? 'cfb-main-10-4:v10') then
    v_board := jsonb_set(
      v_board,
      '{candidateIds}',
      (v_board->'candidateIds') || to_jsonb('cfb-main-10-4:v10'::text),
      false
    );
  end if;
  if not (v_board->'candidateIds' ? 'cfb-main-10-4:v11') then
    v_board := jsonb_set(
      v_board,
      '{candidateIds}',
      (v_board->'candidateIds') || to_jsonb('cfb-main-10-4:v11'::text),
      false
    );
  end if;
  if not (v_board->'alsoAcceptedEntityIds' ? 'cfb-main-10-4:v10') then
    v_board := jsonb_set(
      v_board,
      '{alsoAcceptedEntityIds}',
      (v_board->'alsoAcceptedEntityIds') || to_jsonb('cfb-main-10-4:v10'::text),
      false
    );
  end if;
  if not (v_board->'alsoAcceptedEntityIds' ? 'cfb-main-10-4:v11') then
    v_board := jsonb_set(
      v_board,
      '{alsoAcceptedEntityIds}',
      (v_board->'alsoAcceptedEntityIds') || to_jsonb('cfb-main-10-4:v11'::text),
      false
    );
  end if;

  v_fast := v_pack->'fastMoney'->v_fast_index;
  if not (v_fast->'candidateIds' ? 'cfb-fast5-03-2:v8') then
    v_fast := jsonb_set(
      v_fast,
      '{candidateIds}',
      (v_fast->'candidateIds') || to_jsonb('cfb-fast5-03-2:v8'::text),
      false
    );
  end if;
  if not (v_fast->'alsoAcceptedEntityIds' ? 'cfb-fast5-03-2:v8') then
    v_fast := jsonb_set(
      v_fast,
      '{alsoAcceptedEntityIds}',
      (v_fast->'alsoAcceptedEntityIds') || to_jsonb('cfb-fast5-03-2:v8'::text),
      false
    );
  end if;

  v_pack := jsonb_set(v_pack, '{entities}', v_entities, false);
  v_pack := jsonb_set(v_pack, '{mainBoards,0}', v_board, false);
  v_pack := jsonb_set(
    v_pack,
    array['fastMoney', v_fast_index::text],
    v_fast,
    false
  );
  v_evidence := jsonb_set(v_evidence, '{pack}', v_pack, false);

  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups
    set private_setup_evidence = v_evidence
    where id = v_setup;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
end
$oct4_setup$;

do $oct4_troy$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_score integer;
  v_state jsonb;
  v_actions jsonb;
  v_first_board jsonb;
  v_second_board jsonb;
  v_fast_results jsonb;
begin
  select profile.id
  into v_profile
  from public.profiles profile
  where profile.normalized_name = 'TROY'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select daily.id
  into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-04'
    and schedule.sport = 'football'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select attempt.id, attempt.normalized_score
  into v_attempt, v_score
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily
    and attempt.profile_id = v_profile
    and attempt.attempt_kind = 'official_first'
  limit 1;

  if v_attempt is null then
    return;
  end if;

  if v_score not in (79, 67) then
    raise exception 'Oct. 4 Troy Sports Feud score changed before correction: %', v_score;
  end if;

  select progress.public_state, progress.submission_state->'action_history'
  into v_state, v_actions
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily
    and progress.profile_id = v_profile;

  if v_state is null then
    raise exception 'Oct. 4 Troy Sports Feud progress is missing';
  end if;

  if jsonb_array_length(coalesce(v_actions, '[]'::jsonb)) < 15
    or lower(v_actions->0->>'answer') <> 'lane kiffin'
    or lower(v_actions->1->>'answer') <> 'kalen daebor'
    or lower(v_actions->2->>'answer') <> 'steve sarkisian'
    or lower(v_actions->3->>'answer') <> 'dan mullen'
    or lower(v_actions->4->>'answer') <> 'chip kelly'
    or lower(v_actions->5->>'answer') <> 'mike leech'
    or lower(v_actions->12->>'answer') <> 'jadan baugh' then
    raise exception 'Oct. 4 Troy Sports Feud correction evidence changed';
  end if;

  if v_score = 79 then
    execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
    begin
      update private.daily_challenge_attempts
      set native_score = 67,
          normalized_score = 67,
          public_result = public_result
            || jsonb_build_object(
              'score', 67,
              'main_points', 39,
              'fast_money_points', 28,
              'score_correction', '2026-10-04-cfb-feud-troy-grading-repair'
            ),
          grading_evidence_snapshot = grading_evidence_snapshot
            || jsonb_build_object(
              'score_correction',
              jsonb_build_object(
                'reason', 'audited coach alternates and fourth-quarter back acceptance',
                'original_score', 79,
                'corrected_score', 67,
                'corrected_main_points', 39,
                'corrected_fast_money_points', 28,
                'lane_kiffin_points', 3,
                'kalen_deboer_points', 2,
                'steve_sarkisian_points', 2,
                'dan_mullen_points', 2,
                'first_board_settled_after_four_correct', true,
                'jadan_baugh_points', 1
              )
            )
      where id = v_attempt
        and normalized_score = 79;
    exception when others then
      execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
  end if;

  v_first_board := (v_state->'main_boards'->0)
    || jsonb_build_object(
      'strikes', 0,
      'settled', true,
      'slots', jsonb_build_array(
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a6', 'display_name', 'Lane Kiffin'),
          'points', 3,
          'revealed', true,
          'slot_index', 0
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:v10', 'display_name', 'Kalen DeBoer'),
          'points', 2,
          'revealed', true,
          'slot_index', 1
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:v8', 'display_name', 'Steve Sarkisian'),
          'points', 2,
          'revealed', true,
          'slot_index', 2
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:v11', 'display_name', 'Dan Mullen'),
          'points', 2,
          'revealed', true,
          'slot_index', 3
        )
      ),
      'answer_reveal', jsonb_build_array(
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a1', 'display_name', 'Mike Leach'), 'points', 10),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a3', 'display_name', 'Steve Spurrier'), 'points', 8),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a2', 'display_name', 'Chip Kelly'), 'points', 7),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a9', 'display_name', 'Urban Meyer'), 'points', 5),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a10', 'display_name', 'Art Briles'), 'points', 5),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a4', 'display_name', 'Lincoln Riley'), 'points', 4),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a5', 'display_name', 'Gus Malzahn'), 'points', 4),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a6', 'display_name', 'Lane Kiffin'), 'points', 3)
      )
    );

  v_second_board := v_state->'main_boards'->1;

  select jsonb_agg(
    case
      when result.value->>'question_id' = 'cfb-fast5-03-2'
        and lower(result.value->>'submitted_answer') = 'jadan baugh'
        then result.value || jsonb_build_object(
          'points', 1,
          'counted', true,
          'board_rank', null,
          'accepted_as', 'Jadan Baugh'
        )
      else result.value
    end
    order by result.ordinality
  )
  into v_fast_results
  from jsonb_array_elements(coalesce(v_state->'fast_money'->'results', '[]'::jsonb))
    with ordinality as result(value, ordinality);

  update private.daily_challenge_progress
  set public_state =
    v_state
    || jsonb_build_object(
      'hq_score', 67,
      'raw_points', 67,
      'main_points', 39,
      'score_correction', '2026-10-04-cfb-feud-troy-grading-repair',
      'main_boards', jsonb_build_array(v_first_board, v_second_board),
      'fast_money',
        (v_state->'fast_money')
        || jsonb_build_object(
          'points', 28,
          'results', coalesce(v_fast_results, '[]'::jsonb)
        )
    )
  where daily_challenge_id = v_daily
    and profile_id = v_profile;
end
$oct4_troy$;

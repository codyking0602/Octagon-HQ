-- Correct Tyler's October 4, 2026 CFB Sports Feud run after the global
-- rivalry-nickname, person-name fuzzy-match, and coach-board acceptance fixes.
-- Original submission evidence remains immutable; only the audited result view
-- and official score are corrected.

-- Safely refresh today's already-materialized CFB coach board without
-- changing the identity of any existing entity id. This lets in-progress runs
-- inherit the audited board while preserving every stored guess.
do $oct4_setup$
declare
  v_setup uuid;
  v_evidence jsonb;
  v_pack jsonb;
  v_entities jsonb;
  v_board jsonb;
  v_reveal jsonb;
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

  select setup.private_setup_evidence, setup.reveal_setup
  into v_evidence, v_reveal
  from private.daily_challenge_setups setup
  where setup.id = v_setup;

  v_pack := v_evidence->'pack';
  if v_pack->'mainBoards'->0->>'id' is distinct from 'cfb-main-10-4' then
    raise exception 'Oct. 4 CFB Sports Feud first board identity changed before live repair';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_pack->'entities') entity
    where entity->>'id' = 'cfb-main-10-4:a9'
  ) then
    return;
  end if;

  v_entities := (v_pack->'entities') || jsonb_build_array(
    jsonb_build_object(
      'id', 'cfb-main-10-4:a9',
      'kind', 'person',
      'aliases', '[]'::jsonb,
      'displayName', 'Urban Meyer'
    ),
    jsonb_build_object(
      'id', 'cfb-main-10-4:a10',
      'kind', 'person',
      'aliases', '[]'::jsonb,
      'displayName', 'Art Briles'
    ),
    jsonb_build_object(
      'id', 'cfb-main-10-4:v7',
      'kind', 'person',
      'aliases', '[]'::jsonb,
      'displayName', 'Bobby Petrino'
    ),
    jsonb_build_object(
      'id', 'cfb-main-10-4:v8',
      'kind', 'person',
      'aliases', '[]'::jsonb,
      'displayName', 'Steve Sarkisian'
    ),
    jsonb_build_object(
      'id', 'cfb-main-10-4:v9',
      'kind', 'person',
      'aliases', '[]'::jsonb,
      'displayName', 'Tom Osborne'
    )
  );

  v_board := jsonb_build_object(
    'id', 'cfb-main-10-4',
    'prompt', 'Name a coach who made opposing defensive coordinators lose sleep.',
    'answers', jsonb_build_array(
      jsonb_build_object('entityId', 'cfb-main-10-4:a1', 'points', 10),
      jsonb_build_object('entityId', 'cfb-main-10-4:a3', 'points', 8),
      jsonb_build_object('entityId', 'cfb-main-10-4:a2', 'points', 7),
      jsonb_build_object('entityId', 'cfb-main-10-4:a9', 'points', 5),
      jsonb_build_object('entityId', 'cfb-main-10-4:a10', 'points', 5),
      jsonb_build_object('entityId', 'cfb-main-10-4:a4', 'points', 4),
      jsonb_build_object('entityId', 'cfb-main-10-4:a5', 'points', 4),
      jsonb_build_object('entityId', 'cfb-main-10-4:a6', 'points', 3)
    ),
    'candidateIds', jsonb_build_array(
      'cfb-main-10-4:a1',
      'cfb-main-10-4:a3',
      'cfb-main-10-4:a2',
      'cfb-main-10-4:a9',
      'cfb-main-10-4:a10',
      'cfb-main-10-4:a4',
      'cfb-main-10-4:a5',
      'cfb-main-10-4:a6',
      'cfb-main-10-4:a7',
      'cfb-main-10-4:v1',
      'cfb-main-10-4:v4',
      'cfb-main-10-4:a8',
      'cfb-main-10-4:v7',
      'cfb-main-10-4:v8',
      'cfb-main-10-4:v2',
      'cfb-main-10-4:v6',
      'cfb-main-10-4:v5',
      'cfb-main-10-4:v9',
      'cfb-main-10-4:v3'
    ),
    'alsoAcceptedEntityIds', jsonb_build_array(
      'cfb-main-10-4:a7',
      'cfb-main-10-4:v1',
      'cfb-main-10-4:v4',
      'cfb-main-10-4:a8',
      'cfb-main-10-4:v7',
      'cfb-main-10-4:v8',
      'cfb-main-10-4:v2',
      'cfb-main-10-4:v6',
      'cfb-main-10-4:v5',
      'cfb-main-10-4:v9',
      'cfb-main-10-4:v3'
    )
  );

  v_pack := jsonb_set(v_pack, '{entities}', v_entities, false);
  v_pack := jsonb_set(v_pack, '{mainBoards,0}', v_board, false);
  v_evidence := jsonb_set(v_evidence, '{pack}', v_pack, false);

  v_reveal := jsonb_set(
    v_reveal,
    '{main_boards,0,accepted_answers}',
    jsonb_build_array(
      jsonb_build_object('rank', 1, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a1', 'display_name', 'Mike Leach'), 'points', 10),
      jsonb_build_object('rank', 2, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a3', 'display_name', 'Steve Spurrier'), 'points', 8),
      jsonb_build_object('rank', 3, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a2', 'display_name', 'Chip Kelly'), 'points', 7),
      jsonb_build_object('rank', 4, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a9', 'display_name', 'Urban Meyer'), 'points', 5),
      jsonb_build_object('rank', 5, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a10', 'display_name', 'Art Briles'), 'points', 5),
      jsonb_build_object('rank', 6, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a4', 'display_name', 'Lincoln Riley'), 'points', 4),
      jsonb_build_object('rank', 7, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a5', 'display_name', 'Gus Malzahn'), 'points', 4),
      jsonb_build_object('rank', 8, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a6', 'display_name', 'Lane Kiffin'), 'points', 3)
    ),
    false
  );

  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups
    set private_setup_evidence = v_evidence,
        reveal_setup = v_reveal
    where id = v_setup;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
end
$oct4_setup$;

do $oct4_tyler$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_score integer;
  v_state jsonb;
  v_first_board jsonb;
  v_second_board jsonb;
  v_fast_results jsonb;
  v_actions jsonb;
begin
  select profile.id
  into v_profile
  from public.profiles profile
  where profile.normalized_name = 'TYLER'
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

  if v_score not in (70, 82) then
    raise exception 'Oct. 4 Tyler Sports Feud score changed before correction: %', v_score;
  end if;

  select progress.public_state, progress.submission_state->'action_history'
  into v_state, v_actions
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily
    and progress.profile_id = v_profile;

  if v_state is null then
    raise exception 'Oct. 4 Tyler Sports Feud progress is missing';
  end if;

  if jsonb_array_length(coalesce(v_actions, '[]'::jsonb)) < 14
    or lower(v_actions->0->>'answer') <> 'ben johnson'
    or lower(v_actions->1->>'answer') <> 'chip kelly'
    or lower(v_actions->2->>'answer') <> 'steve sarkisian'
    or lower(v_actions->3->>'answer') <> 'joe brady'
    or lower(v_actions->4->>'answer') <> 'urban meyer'
    or lower(v_actions->9->>'answer') <> 'the game' then
    raise exception 'Oct. 4 Tyler Sports Feud correction evidence changed';
  end if;

  if v_score = 70 then
    execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
    begin
      update private.daily_challenge_attempts
      set native_score = 82,
          normalized_score = 82,
          public_result = public_result
            || jsonb_build_object(
              'score', 82,
              'main_points', 44,
              'fast_money_points', 38,
              'score_correction', '2026-10-04-cfb-feud-global-grading-repair'
            ),
          grading_evidence_snapshot = grading_evidence_snapshot
            || jsonb_build_object(
              'score_correction',
              jsonb_build_object(
                'reason', 'shared rivalry nickname aliases, safer person fuzzy matching, and audited coach acceptance',
                'original_score', 70,
                'corrected_score', 82,
                'corrected_main_points', 44,
                'corrected_fast_money_points', 38,
                'ben_johnson_points', 0,
                'chip_kelly_points', 7,
                'steve_sarkisian_points', 2,
                'urban_meyer_points', 5,
                'the_game_points', 8
              )
            )
      where id = v_attempt
        and normalized_score = 70;
    exception when others then
      execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
  end if;

  v_first_board := (v_state->'main_boards'->0)
    || jsonb_build_object(
      'strikes', 2,
      'slots', jsonb_build_array(
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a2', 'display_name', 'Chip Kelly'),
          'points', 7,
          'revealed', true,
          'slot_index', 0
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:v8', 'display_name', 'Steve Sarkisian'),
          'points', 2,
          'revealed', true,
          'slot_index', 1
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a9', 'display_name', 'Urban Meyer'),
          'points', 5,
          'revealed', true,
          'slot_index', 2
        ),
        jsonb_build_object(
          'found', false,
          'entity', null,
          'points', null,
          'revealed', false,
          'slot_index', 3
        )
      ),
      'answer_reveal', jsonb_build_array(
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a1', 'display_name', 'Mike Leach'), 'points', 10),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a3', 'display_name', 'Steve Spurrier'), 'points', 8),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a2', 'display_name', 'Chip Kelly'), 'points', 7),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a9', 'display_name', 'Urban Meyer'), 'points', 5),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a10', 'display_name', 'Art Briles'), 'points', 5),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a4', 'display_name', 'Lincoln Riley'), 'points', 4),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a5', 'display_name', 'Gus Malzahn'), 'points', 4),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a6', 'display_name', 'Lane Kiffin'), 'points', 3)
      )
    );

  v_second_board := v_state->'main_boards'->1;

  select jsonb_agg(
    case
      when result.value->>'question_id' = 'cfb-fast3-04-3'
        and lower(result.value->>'submitted_answer') = 'the game'
        then result.value || jsonb_build_object(
          'points', 8,
          'counted', true,
          'board_rank', 1,
          'accepted_as', 'Ohio State-Michigan'
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
      'hq_score', 82,
      'raw_points', 82,
      'main_points', 44,
      'score_correction', '2026-10-04-cfb-feud-global-grading-repair',
      'main_boards', jsonb_build_array(v_first_board, v_second_board),
      'fast_money',
        (v_state->'fast_money')
        || jsonb_build_object(
          'points', 38,
          'results', coalesce(v_fast_results, '[]'::jsonb)
        )
    )
  where daily_challenge_id = v_daily
    and profile_id = v_profile;
end
$oct4_tyler$;

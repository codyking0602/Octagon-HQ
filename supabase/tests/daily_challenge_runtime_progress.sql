\set ON_ERROR_STOP on
begin;

select private.daily_challenge_central_day(now()) as today \gset

select set_config('request.jwt.claim.role', 'service_role', true);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data
)
values (
  '74000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'daily-runtime@login.octagon-hq.app',
  '',
  now(),
  now(),
  now(),
  jsonb_build_object('display_name', 'DAILY RUNTIME', 'historical_unclaimed', true)
)
on conflict (id) do nothing;

select public.register_unclaimed_pin_profile(
  '74000000-0000-4000-8000-000000000001'::uuid,
  'Daily Runtime',
  'DR'
);

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle
)
values (
  'test-daily-runtime-v1',
  'America/Chicago',
  :'today'::date,
  :'today'::date,
  array['keep_4_cut_4']::text[]
)
on conflict (version) do nothing;

do $$
declare
  v_request jsonb;
begin
  v_request := public.get_daily_challenge_materialization_request(now());
  if v_request->>'required' <> 'true'
    or v_request->>'expected_game' <> 'keep_4_cut_4'
    or v_request->>'schedule_version' <> 'test-daily-runtime-v1' then
    raise exception 'materialization request did not resolve the expected unpublished runtime: %', v_request;
  end if;
end
$$;

select public.publish_daily_challenge_setup(
  :'today'::date,
  'test-daily-runtime-v1',
  'keep_4_cut_4',
  'runtime-progress-proof',
  'keep-cut-v3',
  'play-official-score-v1',
  jsonb_build_object(
    'runtime_version', 'official-daily-runtime-v1',
    'initial_state', jsonb_build_object(
      'complete', false,
      'reveal_index', 0,
      'kept', jsonb_build_array(),
      'cut', jsonb_build_array(),
      'current_fighter', jsonb_build_object('id', 'f1', 'name', 'Fighter 1')
    )
  ),
  jsonb_build_object(
    'model_top_four_ids', jsonb_build_array('f1','f2','f3','f4')
  ),
  jsonb_build_object(
    'pack_id', 'ufc-careers',
    'fighter_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8')
  ),
  jsonb_build_object(
    'fighter_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8'),
    'ratings', jsonb_build_object(
      'f1', 99, 'f2', 94, 'f3', 90, 'f4', 85,
      'f5', 75, 'f6', 65, 'f7', 55, 'f8', 40
    ),
    'tolerance', 1
  ),
  null
) as publication \gset

select id as daily_id
from private.daily_challenges
where central_day = :'today'::date
  and schedule_version = 'test-daily-runtime-v1'
\gset

select set_config('octagon.test_daily_id', :'daily_id', true);

do $$
declare
  v_request jsonb;
  v_context jsonb;
  v_daily_id uuid := current_setting('octagon.test_daily_id')::uuid;
begin
  v_request := public.get_daily_challenge_materialization_request(now());
  if v_request->>'required' <> 'false'
    or v_request->>'daily_challenge_id' is null then
    raise exception 'published runtime was not idempotently discovered: %', v_request;
  end if;

  v_context := public.get_daily_challenge_runtime_context(
    v_daily_id,
    '74000000-0000-4000-8000-000000000001'::uuid
  );
  if v_context->>'progress_revision' <> '0'
    or v_context#>>'{public_state,reveal_index}' <> '0'
    or v_context#>>'{private_setup_evidence,pack_id}' <> 'ufc-careers'
    or v_context#>>'{private_grading_evidence,ratings,f1}' <> '99' then
    raise exception 'service runtime context did not preserve private and public boundaries: %', v_context;
  end if;
end
$$;

select public.save_daily_challenge_runtime_progress(
  :'daily_id'::uuid,
  '74000000-0000-4000-8000-000000000001'::uuid,
  0,
  jsonb_build_object(
    'choices', jsonb_build_array('keep'),
    'final_submission', null
  ),
  jsonb_build_object(
    'complete', false,
    'reveal_index', 1,
    'kept', jsonb_build_array(jsonb_build_object('id', 'f1', 'name', 'Fighter 1')),
    'cut', jsonb_build_array(),
    'current_fighter', jsonb_build_object('id', 'f2', 'name', 'Fighter 2')
  )
) as first_progress \gset

do $$
declare
  v_failed boolean := false;
  v_daily_id uuid := current_setting('octagon.test_daily_id')::uuid;
begin
  begin
    perform public.save_daily_challenge_runtime_progress(
      v_daily_id,
      '74000000-0000-4000-8000-000000000001'::uuid,
      0,
      '{}'::jsonb,
      '{}'::jsonb
    );
  exception when serialization_failure then
    v_failed := true;
  end;
  if not v_failed then
    raise exception 'stale initial runtime revision was accepted';
  end if;
end
$$;

select public.save_daily_challenge_runtime_progress(
  :'daily_id'::uuid,
  '74000000-0000-4000-8000-000000000001'::uuid,
  1,
  jsonb_build_object(
    'choices', jsonb_build_array('keep','keep','keep','keep','cut','cut','cut','cut'),
    'final_submission', jsonb_build_object('kept_ids', jsonb_build_array('f1','f2','f3','f4'))
  ),
  jsonb_build_object(
    'complete', true,
    'reveal_index', 8,
    'kept', jsonb_build_array(
      jsonb_build_object('id', 'f1'),
      jsonb_build_object('id', 'f2'),
      jsonb_build_object('id', 'f3'),
      jsonb_build_object('id', 'f4')
    ),
    'cut', jsonb_build_array(
      jsonb_build_object('id', 'f5'),
      jsonb_build_object('id', 'f6'),
      jsonb_build_object('id', 'f7'),
      jsonb_build_object('id', 'f8')
    ),
    'current_fighter', null
  )
) as completed_progress \gset

select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '74000000-0000-4000-8000-000000000001', true);

do $$
declare
  v_progress jsonb;
  v_today jsonb;
  v_failed boolean := false;
  v_daily_id uuid := current_setting('octagon.test_daily_id')::uuid;
begin
  v_progress := public.get_my_daily_challenge_progress(v_daily_id);
  if v_progress->>'revision' <> '2'
    or v_progress#>>'{public_state,complete}' <> 'true'
    or v_progress ? 'submission_state'
    or v_progress ? 'private_setup_evidence'
    or v_progress ? 'private_grading_evidence'
    or v_progress ? 'reveal_setup' then
    raise exception 'authenticated progress projection leaked or lost state: %', v_progress;
  end if;

  v_today := public.get_today_challenge_public();
  if v_today->>'progress_revision' <> '2'
    or v_today#>>'{public_state,complete}' <> 'true'
    or coalesce(v_today->'reveal_setup', 'null'::jsonb) <> 'null'::jsonb
    or v_today ? 'submission_state'
    or v_today ? 'private_setup_evidence'
    or v_today ? 'private_grading_evidence' then
    raise exception 'pre-attempt public Today projection leaked private evidence: %', v_today;
  end if;

  begin
    perform public.get_daily_challenge_runtime_context(
      v_daily_id,
      '74000000-0000-4000-8000-000000000001'::uuid
    );
  exception when others then
    if sqlerrm like '%service role required%' then
      v_failed := true;
    else
      raise;
    end if;
  end;
  if not v_failed then
    raise exception 'authenticated caller reached service-only runtime context';
  end if;
end
$$;

select public.submit_my_daily_challenge_attempt(
  :'daily_id'::uuid,
  jsonb_build_object('kept_ids', jsonb_build_array('f1','f2','f3','f4'))
) as submitted \gset

do $$
declare
  v_today jsonb;
  v_failed boolean := false;
  v_daily_id uuid := current_setting('octagon.test_daily_id')::uuid;
begin
  v_today := public.get_today_challenge_public();
  if v_today#>>'{official_attempt,normalized_score}' <> '100'
    or v_today#>>'{reveal_setup,model_top_four_ids,0}' <> 'f1' then
    raise exception 'completed public Today projection did not unlock result and reveal: %', v_today;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  begin
    perform public.save_daily_challenge_runtime_progress(
      v_daily_id,
      '74000000-0000-4000-8000-000000000001'::uuid,
      2,
      '{}'::jsonb,
      '{}'::jsonb
    );
  exception when others then
    if sqlerrm like '%immutable after completion%' then
      v_failed := true;
    else
      raise;
    end if;
  end;
  if not v_failed then
    raise exception 'completed official runtime progress remained writable';
  end if;
end
$$;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_health jsonb;
begin
  v_health := public.get_pick_monitoring_scheduler_health();
  if v_health->>'job_name' <> 'octagon-hq-pick-monitoring'
    or v_health->>'schedule' <> '7 * * * *'
    or v_health->>'daily_function_name' <> 'daily-challenge-runtime'
    or v_health->>'command_configured' <> 'true' then
    raise exception 'shared hourly scheduler does not own both canonical calls: %', v_health;
  end if;
end
$$;

rollback;

\echo 'Daily challenge runtime progress proof passed.'

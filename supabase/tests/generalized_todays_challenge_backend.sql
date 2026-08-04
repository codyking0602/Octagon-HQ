begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_cody uuid := extensions.gen_random_uuid();
  v_shane uuid := extensions.gen_random_uuid();
  v_day date := date '2199-08-04';
  v_daily_id uuid;
  v_setup_id uuid;
  v_first jsonb;
  v_replay jsonb;
  v_board jsonb;
  v_history jsonb;
  v_streak jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_cody,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','daily-cody@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','DAILY CODY','historical_unclaimed',true)),
    (v_shane,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','daily-shane@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','DAILY SHANE','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_cody,'Daily Cody','DC');
  perform public.register_unclaimed_pin_profile(v_shane,'Daily Shane','DS');

  perform public.publish_daily_challenge_setup(v_day,'find-leader-v1','find_leader','fl-2199-08-04','find-leader-content-v1','find-leader-score-v1',jsonb_build_object('category','wins'),jsonb_build_object('future_answer','secret'),jsonb_build_object('grader','secret'),null);
  perform public.publish_daily_challenge_setup(v_day,'find-leader-v1','find_leader','fl-2199-08-04','find-leader-content-v1','find-leader-score-v1',jsonb_build_object('category','wins'),jsonb_build_object('future_answer','secret'),jsonb_build_object('grader','secret'),null);

  select id, setup_id into v_daily_id, v_setup_id from public.daily_challenges where central_day = v_day and schedule_version = 'find-leader-v1';
  if (select count(*) from public.daily_challenges where central_day = v_day and schedule_version = 'find-leader-v1') <> 1 then raise exception 'daily setup publication was not idempotent'; end if;
  if v_setup_id is null then raise exception 'daily setup identity was not persisted'; end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  v_first := public.record_my_daily_challenge_attempt(v_daily_id, 7, jsonb_build_object('native','7/10'), jsonb_build_object('answer','hidden'), now());
  v_replay := public.record_my_daily_challenge_attempt(v_daily_id, 10, jsonb_build_object('native','10/10'), jsonb_build_object('answer','hidden'), now() + interval '1 minute');
  if v_first->>'attempt_kind' <> 'official_first' or (v_first->>'normalized_score')::int <> 70 then raise exception 'first attempt was not official normalized result: %', v_first; end if;
  if v_replay->>'attempt_kind' <> 'replay' or (v_replay->>'official_normalized_score')::int <> 70 or (v_replay->>'replay_normalized_score')::int <> 100 then raise exception 'replay replaced official result or was not isolated: %', v_replay; end if;
  if (select count(*) from private.daily_challenge_attempts where daily_challenge_id = v_daily_id and profile_id = v_cody and attempt_kind = 'official_first') <> 1 then raise exception 'concurrent uniqueness contract failed for official first attempts'; end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_shane::text,true);
  perform public.record_my_daily_challenge_attempt(v_daily_id, 7, '{}'::jsonb, '{}'::jsonb, now() + interval '5 minutes');

  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  v_board := public.get_daily_challenge_leaderboard(v_day,'find-leader-v1');
  if (select count(*) from jsonb_array_elements(v_board->'entries') e where (e->>'rank')::int = 1 and (e->>'normalized_score')::int = 70) <> 2 then raise exception 'tied scores did not share rank without completion-time tiebreaker: %', v_board; end if;
  if v_board::text like '%hidden%' or v_board::text like '%profile_id%' or v_board::text like '%completed_at%' then raise exception 'leaderboard exposed private evidence or identity fields: %', v_board; end if;

  v_history := public.list_my_daily_challenge_history();
  if v_history::text not like '%find-leader-content-v1%' or v_history::text not like '%find-leader-score-v1%' then raise exception 'history did not snapshot content/scoring versions: %', v_history; end if;

  v_streak := public.get_my_daily_challenge_streak();
  if (v_streak->>'current_streak')::int <> 1 or (v_streak->>'best_streak')::int <> 1 then raise exception 'generalized streak projection failed: %', v_streak; end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  insert into public.find_leader_history(profile_id,day,official_score,best_score,attempts,completed_at,updated_at)
  values (v_cody, date '2199-08-03', 9, 9, 1, now() - interval '1 day', now());
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  if not exists (select 1 from public.list_my_find_leader_history() h where h.day = date '2199-08-03' and h.official_score = 9) then raise exception 'legacy Find the Leader history was not visible unchanged'; end if;

  perform set_config('request.jwt.claim.role','anon',true);
  perform set_config('request.jwt.claim.sub','',true);
  if has_function_privilege('anon','public.record_my_daily_challenge_attempt(uuid,integer,jsonb,jsonb,timestamp with time zone)','EXECUTE') then raise exception 'anon can write official daily attempts'; end if;
  if has_table_privilege('authenticated','private.daily_challenge_setups','SELECT') or has_table_privilege('authenticated','private.daily_challenge_attempts','SELECT') then raise exception 'authenticated role can read private daily evidence tables'; end if;
end $$;

rollback;

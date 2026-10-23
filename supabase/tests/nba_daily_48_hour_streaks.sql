\set ON_ERROR_STOP on
begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $nba_slot_streak$
declare
  v_player uuid := '78000000-0000-4000-8000-000000000001';
  v_day date;
  v_game text;
  v_setup uuid;
  v_daily uuid;
  v_streak jsonb;
  v_standings jsonb;
  v_entry jsonb;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_player, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'nba-two-day-streak@octagon-hq.app',
    '', now(), now(), now(), '{}'::jsonb
  ) on conflict (id) do nothing;
  perform public.register_unclaimed_pin_profile(v_player, 'NBA SLOT STREAK', 'NS');

  -- One challenge per 48-hour slot, not a separate challenge each calendar day.
  -- The missed Nov 5 slot intentionally breaks the run; Nov 1 and Nov 3 do not.
  foreach v_day in array array[date '2026-11-01', date '2026-11-03', date '2026-11-07', date '2026-11-09', date '2026-11-17'] loop
    v_game := private.daily_challenge_expected_game('nba-daily-regular-v1', v_day);
    insert into private.daily_challenge_setups (
      game_type, setup_key, content_version, scoring_version, public_setup,
      reveal_setup, private_setup_evidence, private_grading_evidence
    ) values (
      v_game, 'nba-streak-proof:' || v_day::text, 'nba-streak-proof-v1',
      'play-official-score-v1', '{}'::jsonb, '{}'::jsonb,
      '{}'::jsonb, '{}'::jsonb
    ) returning id into v_setup;
    insert into private.daily_challenges (
      central_day, schedule_version, game_type, setup_id,
      content_version, scoring_version, fallback_reason
    ) values (
      v_day, 'nba-daily-regular-v1', v_game, v_setup,
      'nba-streak-proof-v1', 'play-official-score-v1', null
    ) returning id into v_daily;
    insert into private.daily_challenge_attempts (
      daily_challenge_id, profile_id, attempt_kind, native_score,
      normalized_score, completed_at, content_version, scoring_version,
      public_result, submission_evidence, grading_evidence_snapshot
    ) values (
      v_daily, v_player, 'official_first', 80, 80,
      v_day::timestamp at time zone 'America/Chicago',
      'nba-streak-proof-v1', 'play-official-score-v1',
      '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
    );
  end loop;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_player::text, true);
  v_streak := public.get_my_daily_challenge_streak('nba');
  if (v_streak->>'best_streak')::integer <> 2 then
    raise exception 'NBA 48-hour streak should be 2 across Nov 1/3 and 7/9, not %', v_streak;
  end if;

  v_standings := public.get_daily_challenge_standings('nba');
  select entry into v_entry from jsonb_array_elements(v_standings->'entries') as entry
  where entry->>'profile_id' = v_player::text;
  if v_entry is null
    or (v_entry->>'best_streak')::integer <> 2
    or (v_entry->'game_averages'->>'higher_lower')::numeric <> 80 then
    raise exception 'NBA standings slot streak / Higher or Lower average is wrong: %', v_entry;
  end if;
  if (v_entry->>'all_time_played')::integer <> 5 then
    raise exception 'NBA standings dropped official slot results';
  end if;
end;
$nba_slot_streak$;
rollback;

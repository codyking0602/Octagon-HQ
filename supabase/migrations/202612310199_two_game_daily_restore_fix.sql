-- Correct the composite-row select used by the two-game carryover restore.

create or replace function public.restore_daily_two_game_cutover_progress(
  p_daily_challenge_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_sport text;
  v_format constant text := 'daily-two-game-average-v1';
  v_scoring constant text := 'daily-two-game-average-score-v1';
  v_outer_initial jsonb;
  v_round_one_initial jsonb;
  v_round_two_initial jsonb;
  v_carry private.daily_two_game_cutover_carryover;
  v_submission jsonb;
  v_public jsonb;
  v_round_one_state jsonb;
  v_restored integer := 0;
begin
  select daily, schedule.sport
  into v_daily, v_sport
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.id = p_daily_challenge_id;

  if v_daily.id is null then
    raise exception 'two-game Daily restore challenge is unavailable';
  end if;

  if v_daily.scoring_version <> v_scoring
    or v_daily.game_type not in ('find_leader', 'wavelength', 'hit_the_number') then
    return jsonb_build_object(
      'status', 'not_two_game',
      'daily_challenge_id', p_daily_challenge_id
    );
  end if;

  select *
  into v_setup
  from private.daily_challenge_setups
  where id = v_daily.setup_id;

  if v_setup.public_setup->>'format_version' <> v_format
    or jsonb_typeof(v_setup.public_setup->'rounds') <> 'array'
    or jsonb_array_length(v_setup.public_setup->'rounds') <> 2 then
    raise exception 'two-game Daily restore setup is invalid';
  end if;

  v_outer_initial := v_setup.public_setup->'initial_state';
  v_round_one_initial := v_setup.public_setup->'rounds'->0->'initial_state';
  v_round_two_initial := v_setup.public_setup->'rounds'->1->'initial_state';

  for v_carry in
    select *
    from private.daily_two_game_cutover_carryover carry
    where carry.sport = v_sport
      and carry.central_day = v_daily.central_day
      and carry.game_type = v_daily.game_type
      and carry.restored_at is null
    order by carry.created_at, carry.profile_id
  loop
    v_round_one_state := coalesce(
      v_carry.legacy_submission_state,
      case
        when v_carry.legacy_submission_evidence is not null then
          jsonb_build_object('final_submission', v_carry.legacy_submission_evidence)
        else '{}'::jsonb
      end
    );

    if v_carry.legacy_normalized_score is not null then
      if v_round_one_state->'final_submission' is null
        and v_carry.legacy_submission_evidence is not null then
        v_round_one_state := v_round_one_state
          || jsonb_build_object('final_submission', v_carry.legacy_submission_evidence);
      end if;

      v_submission := jsonb_build_object(
        'rounds', jsonb_build_array(v_round_one_state),
        'final_submission', null
      );

      v_public := v_outer_initial || jsonb_build_object(
        'complete', false,
        'round_index', 1,
        'round_count', 2,
        'awaiting_next', false,
        'completed_rounds', jsonb_build_array(jsonb_build_object(
          'game_index', 0,
          'normalized_score', v_carry.legacy_normalized_score
        )),
        'round_scores', jsonb_build_array(v_carry.legacy_normalized_score),
        'active_round', v_round_two_initial,
        'active_reveal', null,
        'score', null
      );
    else
      v_submission := jsonb_build_object(
        'rounds', jsonb_build_array(v_round_one_state),
        'final_submission', null
      );

      v_public := v_outer_initial || jsonb_build_object(
        'complete', false,
        'round_index', 0,
        'round_count', 2,
        'awaiting_next', false,
        'completed_rounds', '[]'::jsonb,
        'round_scores', '[]'::jsonb,
        'active_round', coalesce(v_carry.legacy_public_state, v_round_one_initial),
        'active_reveal', null,
        'score', null
      );
    end if;

    insert into private.daily_challenge_progress (
      daily_challenge_id,
      profile_id,
      revision,
      submission_state,
      public_state,
      started_at,
      updated_at
    )
    values (
      v_daily.id,
      v_carry.profile_id,
      1,
      v_submission,
      v_public,
      coalesce(v_carry.legacy_completed_at, now()),
      now()
    )
    on conflict (daily_challenge_id, profile_id) do nothing;

    if found then
      update private.daily_two_game_cutover_carryover
      set
        restored_daily_challenge_id = v_daily.id,
        restored_at = now()
      where sport = v_carry.sport
        and central_day = v_carry.central_day
        and profile_id = v_carry.profile_id;
      v_restored := v_restored + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'status', 'restored',
    'daily_challenge_id', v_daily.id,
    'restored_profiles', v_restored
  );
end;
$$;

revoke all on function public.restore_daily_two_game_cutover_progress(uuid)
  from public, anon, authenticated;
grant execute on function public.restore_daily_two_game_cutover_progress(uuid)
  to service_role;

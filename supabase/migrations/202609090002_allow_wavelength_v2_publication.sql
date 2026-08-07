-- Repair Today’s Challenge publication after Wavelength scoring calibration.
-- Wavelength may publish either historical v1 or calibrated v2 scoring; every other game remains v1-only.
create or replace function public.publish_daily_challenge_setup(
  p_central_day date,
  p_schedule_version text,
  p_game_type text,
  p_setup_key text,
  p_content_version text,
  p_scoring_version text,
  p_public_setup jsonb default '{}'::jsonb,
  p_reveal_setup jsonb default '{}'::jsonb,
  p_private_setup_evidence jsonb default '{}'::jsonb,
  p_private_grading_evidence jsonb default '{}'::jsonb,
  p_fallback_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expected_game text;
  v_setup private.daily_challenge_setups;
  v_daily private.daily_challenges;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required to publish daily challenge setup';
  end if;

  if p_central_day is null
    or nullif(trim(p_schedule_version), '') is null
    or nullif(trim(p_setup_key), '') is null
    or nullif(trim(p_content_version), '') is null
    or nullif(trim(p_scoring_version), '') is null then
    raise exception 'complete daily identity is required';
  end if;

  v_expected_game := private.daily_challenge_expected_game(
    p_schedule_version,
    p_central_day
  );

  if p_game_type <> v_expected_game
    and not (
      p_game_type = 'find_leader'
      and nullif(trim(p_fallback_reason), '') is not null
    ) then
    raise exception 'game % does not match schedule % for %',
      p_game_type,
      p_schedule_version,
      p_central_day;
  end if;

  if not (
    (p_game_type = 'wavelength' and p_scoring_version in ('play-official-score-v1', 'play-official-score-v2'))
    or (p_game_type <> 'wavelength' and p_scoring_version = 'play-official-score-v1')
  ) then
    raise exception 'unsupported daily scoring version %', p_scoring_version;
  end if;

  insert into private.daily_challenge_setups (
    game_type,
    setup_key,
    content_version,
    scoring_version,
    public_setup,
    reveal_setup,
    private_setup_evidence,
    private_grading_evidence
  )
  values (
    p_game_type,
    p_setup_key,
    p_content_version,
    p_scoring_version,
    coalesce(p_public_setup, '{}'::jsonb),
    coalesce(p_reveal_setup, '{}'::jsonb),
    coalesce(p_private_setup_evidence, '{}'::jsonb),
    coalesce(p_private_grading_evidence, '{}'::jsonb)
  )
  on conflict (game_type, setup_key, content_version, scoring_version)
  do nothing
  returning * into v_setup;

  if v_setup.id is null then
    select *
    into v_setup
    from private.daily_challenge_setups
    where game_type = p_game_type
      and setup_key = p_setup_key
      and content_version = p_content_version
      and scoring_version = p_scoring_version;

    if v_setup.public_setup <> coalesce(p_public_setup, '{}'::jsonb)
      or v_setup.reveal_setup <> coalesce(p_reveal_setup, '{}'::jsonb)
      or v_setup.private_setup_evidence <> coalesce(p_private_setup_evidence, '{}'::jsonb)
      or v_setup.private_grading_evidence <> coalesce(p_private_grading_evidence, '{}'::jsonb) then
      raise exception 'setup identity already exists with different immutable evidence';
    end if;
  end if;

  insert into private.daily_challenges (
    central_day,
    schedule_version,
    game_type,
    setup_id,
    content_version,
    scoring_version,
    fallback_reason
  )
  values (
    p_central_day,
    p_schedule_version,
    p_game_type,
    v_setup.id,
    p_content_version,
    p_scoring_version,
    nullif(trim(p_fallback_reason), '')
  )
  on conflict (schedule_version, central_day)
  do nothing
  returning * into v_daily;

  if v_daily.id is null then
    select *
    into v_daily
    from private.daily_challenges
    where schedule_version = p_schedule_version
      and central_day = p_central_day;

    if v_daily.game_type <> p_game_type
      or v_daily.setup_id <> v_setup.id
      or v_daily.content_version <> p_content_version
      or v_daily.scoring_version <> p_scoring_version
      or v_daily.fallback_reason is distinct from nullif(trim(p_fallback_reason), '') then
      raise exception 'daily identity already exists with different immutable evidence';
    end if;
  end if;

  return jsonb_build_object(
    'id', v_daily.id,
    'central_day', v_daily.central_day,
    'schedule_version', v_daily.schedule_version,
    'game_type', v_daily.game_type,
    'setup_id', v_daily.setup_id,
    'setup_key', v_setup.setup_key,
    'content_version', v_daily.content_version,
    'scoring_version', v_daily.scoring_version,
    'fallback_reason', v_daily.fallback_reason
  );
end;
$$;

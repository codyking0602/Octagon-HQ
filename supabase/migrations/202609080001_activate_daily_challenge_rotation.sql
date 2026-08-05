-- PR 9: activate the one canonical Today’s Challenge schedule owner.
-- The first active day is chosen after every already-materialized official day so
-- this version cannot rewrite or supersede historical daily identities.
do $$
declare
  v_central_today date := private.daily_challenge_central_day(now());
  v_starts_on date;
begin
  select greatest(
    v_central_today + 1,
    coalesce(max(daily.central_day) + 1, v_central_today + 1)
  )
  into v_starts_on
  from private.daily_challenges daily;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  values (
    'play-rotation-v1',
    'America/Chicago',
    date '2026-08-06',
    v_starts_on,
    -- BEGIN OFFICIAL_DAILY_ROTATION_V1
    array[
      'find_leader',
      'wavelength',
      'find_leader',
      'blind_resume',
      'find_leader',
      'wavelength',
      'find_leader',
      'keep_4_cut_4',
      'find_leader',
      'wavelength',
      'find_leader',
      'blind_rank_5',
      'find_leader',
      'blind_resume',
      'find_leader',
      'wavelength',
      'keep_4_cut_4',
      'blind_rank_5',
      'wavelength',
      'blind_resume'
    ]::text[]
    -- END OFFICIAL_DAILY_ROTATION_V1
  )
  on conflict (version) do nothing;
end
$$;

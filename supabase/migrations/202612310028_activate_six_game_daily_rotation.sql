-- Activate the approved six-game 60-day Today’s Challenge rotation through the
-- existing immutable schedule-version owner. Published Daily history remains untouched;
-- the new version begins no earlier than the next Central day and after every already-
-- materialized Daily Challenge.
do $$
declare
  v_version constant text := 'play-rotation-v3';
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
    v_version,
    'America/Chicago',
    date '2026-08-06',
    v_starts_on,
    array[
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'keep_4_cut_4',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'blind_rank_5',
      'wavelength',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'blind_rank_5',
      'keep_4_cut_4',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader'
    ]::text[]
  )
  on conflict (version) do nothing;
end
$$;

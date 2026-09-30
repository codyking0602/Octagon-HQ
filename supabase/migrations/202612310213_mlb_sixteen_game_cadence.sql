-- Lock the approved 2026 MLB postseason Play calendar to an every-other-day
-- sixteen-game cadence from September 27 through October 27.
-- Existing challenge keys are preserved so prepared content and completed
-- results retain identity. Five new challenge keys are scheduled but remain
-- content_ready = false until their dedicated production content is wired.
--
-- The Play lane remains worth 25 championship points total, now spread equally
-- across sixteen official challenges.

alter table public.mlb_postseason_challenges
  drop constraint if exists mlb_postseason_challenges_slot_check;

alter table public.mlb_postseason_challenges
  add constraint mlb_postseason_challenges_slot_check
  check (slot between 1 and 16);

do $schedule$
declare
  v_existing integer;
  v_total integer;
begin
  -- Preserve the two already-played challenge keys and every prepared future
  -- key, while moving rows through temporary slots to avoid PK collisions.
  update public.mlb_postseason_challenges
  set scheduled_date = null,
      slot = slot + 100
  where season = 2026;

  get diagnostics v_existing = row_count;
  if v_existing <> 11 then
    raise exception 'expected eleven existing MLB postseason challenge rows, found %', v_existing;
  end if;

  update public.mlb_postseason_challenges challenge
  set slot = schedule.slot,
      scheduled_date = schedule.scheduled_date,
      game_type = schedule.game_type,
      title = schedule.title,
      kicker = schedule.kicker,
      description = schedule.description,
      content_ready = true
  from (
    values
      (1::smallint,  'mlb-2026-play-01'::text, date '2026-09-27', 'find_leader'::text, 'Find the Leader'::text, 'FIND THE LEADER'::text, 'Two boards. Eliminate decoys and leave the stat leader standing.'::text),
      (2::smallint,  'mlb-2026-play-02'::text, date '2026-09-29', 'wavelength'::text, 'Wavelength'::text, 'WAVELENGTH'::text, 'Two games. Four adaptive clues each.'::text),
      (3::smallint,  'mlb-2026-play-03'::text, date '2026-10-01', 'millionaire'::text, 'Who Wants to Be a Millionaire?'::text, 'MILLIONAIRE'::text, 'Eight questions. Three lifelines. One postseason run.'::text),
      (4::smallint,  'mlb-2026-play-04'::text, date '2026-10-03', 'who_am_i'::text, 'Who Am I'::text, 'WHO AM I'::text, 'Two identities. Progressive clues. One averaged final score.'::text),
      (5::smallint,  'mlb-2026-play-06'::text, date '2026-10-05', 'sports_feud'::text, 'Sports Feud'::text, 'SPORTS FEUD'::text, 'Clear two baseball boards, then finish with Fast Money.'::text),
      (7::smallint,  'mlb-2026-play-05'::text, date '2026-10-09', 'blind_resume'::text, 'Blind Resume'::text, 'BLIND RESUME'::text, 'Five head-to-head careers. Reveal only what you need.'::text),
      (8::smallint,  'mlb-2026-play-11'::text, date '2026-10-11', 'bar_trivia'::text, 'Bar Trivia'::text, 'BAR TRIVIA'::text, 'Three rounds. One Double Round. One Last Call wager.'::text),
      (10::smallint, 'mlb-2026-play-08'::text, date '2026-10-15', 'millionaire'::text, 'Who Wants to Be a Millionaire?'::text, 'MILLIONAIRE'::text, 'Eight questions. Three lifelines. One postseason run.'::text),
      (11::smallint, 'mlb-2026-play-07'::text, date '2026-10-17', 'hit_the_number'::text, 'Hit the Number'::text, 'HIT THE NUMBER'::text, 'Build a total without going over the target.'::text),
      (13::smallint, 'mlb-2026-play-09'::text, date '2026-10-21', 'wavelength'::text, 'Wavelength'::text, 'WAVELENGTH'::text, 'Two games. Four adaptive clues each.'::text),
      (15::smallint, 'mlb-2026-play-10'::text, date '2026-10-25', 'sports_feud'::text, 'Sports Feud'::text, 'SPORTS FEUD'::text, 'Clear two baseball boards, then finish with Fast Money.'::text)
  ) as schedule(slot, challenge_key, scheduled_date, game_type, title, kicker, description)
  where challenge.season = 2026
    and challenge.challenge_key = schedule.challenge_key;

  if not exists (
    select 1
    from public.mlb_postseason_challenges
    where season = 2026
      and slot > 100
  ) then
    null;
  else
    raise exception 'one or more existing MLB challenge keys were not remapped';
  end if;

  insert into public.mlb_postseason_challenges (
    season,
    slot,
    challenge_key,
    scheduled_date,
    game_type,
    title,
    kicker,
    description,
    content_ready
  )
  values
    (2026, 6,  'mlb-2026-play-12', date '2026-10-07', 'average_fan', 'Are You Smarter Than an Average Fan?', 'AVERAGE FAN', 'Five grades. Ten questions. One fan in your corner.', false),
    (2026, 9,  'mlb-2026-play-13', date '2026-10-13', 'find_leader', 'Find the Leader', 'FIND THE LEADER', 'Two boards. Eliminate decoys and leave the stat leader standing.', false),
    (2026, 12, 'mlb-2026-play-14', date '2026-10-19', 'who_am_i', 'Who Am I', 'WHO AM I', 'Two identities. Progressive clues. One averaged final score.', false),
    (2026, 14, 'mlb-2026-play-15', date '2026-10-23', 'average_fan', 'Are You Smarter Than an Average Fan?', 'AVERAGE FAN', 'Five grades. Ten questions. One fan in your corner.', false),
    (2026, 16, 'mlb-2026-play-16', date '2026-10-27', 'bar_trivia', 'Bar Trivia', 'BAR TRIVIA', 'Three rounds. One Double Round. One Last Call wager.', false)
  on conflict (season, challenge_key) do update
  set slot = excluded.slot,
      scheduled_date = excluded.scheduled_date,
      game_type = excluded.game_type,
      title = excluded.title,
      kicker = excluded.kicker,
      description = excluded.description,
      content_ready = excluded.content_ready;

  select count(*)
    into v_total
  from public.mlb_postseason_challenges
  where season = 2026;

  if v_total <> 16 then
    raise exception '2026 MLB Play must have exactly sixteen challenges, found %', v_total;
  end if;
end
$schedule$;

create or replace function public.score_mlb_postseason_play(
  p_season integer,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  with ranked as (
    select
      result.challenge_key,
      result.profile_id,
      rank() over (
        partition by result.challenge_key
        order by result.raw_score desc
      )::integer as rank_start,
      count(*) over (
        partition by result.challenge_key, result.raw_score
      )::integer as tie_count
    from public.mlb_postseason_challenge_results result
    join public.mlb_postseason_challenges challenge
      on challenge.season = result.season
     and challenge.challenge_key = result.challenge_key
    where result.season = p_season
  ),
  awarded as (
    select
      ranked.challenge_key,
      ranked.profile_id,
      (
        select avg(
          case place
            when 1 then 25::numeric / 16::numeric
            when 2 then 20::numeric / 16::numeric
            when 3 then 15::numeric / 16::numeric
            when 4 then 10::numeric / 16::numeric
            when 5 then 5::numeric / 16::numeric
            else 0::numeric
          end
        )
        from generate_series(
          ranked.rank_start,
          ranked.rank_start + ranked.tie_count - 1
        ) as place
      ) as points
    from ranked
  )
  select least(
    25::numeric,
    coalesce(sum(awarded.points) filter (where awarded.profile_id = p_profile_id), 0::numeric)
  )::numeric(6,2)
  from awarded
$$;

do $verify$
declare
  v_definition text;
  v_dates date[];
  v_new_not_ready integer;
begin
  select array_agg(scheduled_date order by scheduled_date)
    into v_dates
  from public.mlb_postseason_challenges
  where season = 2026;

  if v_dates <> array[
    date '2026-09-27',
    date '2026-09-29',
    date '2026-10-01',
    date '2026-10-03',
    date '2026-10-05',
    date '2026-10-07',
    date '2026-10-09',
    date '2026-10-11',
    date '2026-10-13',
    date '2026-10-15',
    date '2026-10-17',
    date '2026-10-19',
    date '2026-10-21',
    date '2026-10-23',
    date '2026-10-25',
    date '2026-10-27'
  ] then
    raise exception 'MLB sixteen-game cadence did not install exactly';
  end if;

  select count(*)
    into v_new_not_ready
  from public.mlb_postseason_challenges
  where season = 2026
    and challenge_key in (
      'mlb-2026-play-12',
      'mlb-2026-play-13',
      'mlb-2026-play-14',
      'mlb-2026-play-15',
      'mlb-2026-play-16'
    )
    and not content_ready;

  if v_new_not_ready <> 5 then
    raise exception 'all five new MLB challenge slots must remain not-ready until content is wired';
  end if;

  select pg_get_functiondef(
    'public.score_mlb_postseason_play(integer,uuid)'::regprocedure::oid
  ) into v_definition;

  if position('when 1 then 25::numeric / 16::numeric' in v_definition) = 0
    or position('when 5 then 5::numeric / 16::numeric' in v_definition) = 0 then
    raise exception 'MLB Play sixteen-game placement ladder did not install exactly';
  end if;
end
$verify$;

comment on table public.mlb_postseason_challenges is
  'The sixteen spoiler-free scoring slots that feed the MLB Postseason Championship Play lane.';

comment on function public.score_mlb_postseason_play(integer, uuid) is
  'Scores all sixteen MLB postseason Play challenges into the same 25-point championship lane using the 25/20/15/10/5 over 16 placement ladder.';

notify pgrst, 'reload schema';

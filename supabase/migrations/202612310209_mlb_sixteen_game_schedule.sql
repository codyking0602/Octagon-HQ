-- Lock the approved 16-game 2026 MLB postseason Play cadence through October 27.
-- Existing production challenges keep their challenge keys while their dates move.
-- Five newly-added challenges are scheduled now but remain content_ready=false until
-- their dedicated content is wired and verified.
-- The Play lane remains worth 25 championship points total across all 16 challenges.

alter table public.mlb_postseason_challenges
  drop constraint if exists mlb_postseason_challenges_slot_check;

alter table public.mlb_postseason_challenges
  add constraint mlb_postseason_challenges_slot_check
  check (slot between 1 and 16);

do $$
declare
  v_count integer;
begin
  -- Clear dates first so the season/date unique index cannot see transient collisions.
  update public.mlb_postseason_challenges
  set scheduled_date = null
  where season = 2026
    and slot between 1 and 16;

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
    (2026, 1,  'mlb-2026-play-01', date '2026-09-27', 'find_leader',   'Find the Leader',                         'FIND THE LEADER', 'Two boards. Eliminate decoys and leave the stat leader standing.', true),
    (2026, 2,  'mlb-2026-play-02', date '2026-09-29', 'wavelength',    'Wavelength',                              'WAVELENGTH',      'Two games. Four adaptive clues each.', true),
    (2026, 3,  'mlb-2026-play-03', date '2026-10-01', 'millionaire',   'Who Wants to Be a Millionaire?',          'MILLIONAIRE',     'Eight questions. Three lifelines. One postseason run.', true),
    (2026, 4,  'mlb-2026-play-04', date '2026-10-03', 'who_am_i',      'Who Am I',                                'WHO AM I',        'Two identities. Progressive clues. One averaged final score.', true),
    (2026, 6,  'mlb-2026-play-06', date '2026-10-05', 'sports_feud',   'Sports Feud',                             'SPORTS FEUD',     'Clear two baseball boards, then finish with Fast Money.', true),
    (2026, 12, 'mlb-2026-play-12', date '2026-10-07', 'average_fan',   'Are You Smarter Than an Average Fan?',    'AVERAGE FAN',     'Five grades. Ten questions. One baseball classroom.', false),
    (2026, 5,  'mlb-2026-play-05', date '2026-10-09', 'blind_resume',  'Blind Resume',                            'BLIND RESUME',    'Five head-to-head careers. Reveal only what you need.', true),
    (2026, 11, 'mlb-2026-play-11', date '2026-10-11', 'bar_trivia',    'Bar Trivia',                              'BAR TRIVIA',      'Three rounds. One Double Round. One Last Call wager.', true),
    (2026, 13, 'mlb-2026-play-13', date '2026-10-13', 'find_leader',   'Find the Leader',                         'FIND THE LEADER', 'Two boards. Eliminate decoys and leave the stat leader standing.', false),
    (2026, 8,  'mlb-2026-play-08', date '2026-10-15', 'millionaire',   'Who Wants to Be a Millionaire?',          'MILLIONAIRE',     'Eight questions. Three lifelines. One postseason run.', true),
    (2026, 7,  'mlb-2026-play-07', date '2026-10-17', 'hit_the_number','Hit the Number',                          'HIT THE NUMBER',  'Build a total without going over the target.', true),
    (2026, 14, 'mlb-2026-play-14', date '2026-10-19', 'who_am_i',      'Who Am I',                                'WHO AM I',        'Two identities. Progressive clues. One averaged final score.', false),
    (2026, 9,  'mlb-2026-play-09', date '2026-10-21', 'wavelength',    'Wavelength',                              'WAVELENGTH',      'Two games. Four adaptive clues each.', true),
    (2026, 15, 'mlb-2026-play-15', date '2026-10-23', 'average_fan',   'Are You Smarter Than an Average Fan?',    'AVERAGE FAN',     'Five grades. Ten questions. One baseball classroom.', false),
    (2026, 10, 'mlb-2026-play-10', date '2026-10-25', 'sports_feud',   'Sports Feud',                             'SPORTS FEUD',     'Clear two baseball boards, then finish with Fast Money.', true),
    (2026, 16, 'mlb-2026-play-16', date '2026-10-27', 'bar_trivia',    'Bar Trivia',                              'BAR TRIVIA',      'Three rounds. One Double Round. One Last Call wager.', false)
  on conflict (season, slot) do update
  set challenge_key = excluded.challenge_key,
      scheduled_date = excluded.scheduled_date,
      game_type = excluded.game_type,
      title = excluded.title,
      kicker = excluded.kicker,
      description = excluded.description,
      content_ready = excluded.content_ready;

  select count(*)
    into v_count
  from public.mlb_postseason_challenges
  where season = 2026;

  if v_count <> 16 then
    raise exception '2026 MLB Play must have exactly sixteen championship challenges, found %', v_count;
  end if;

  if (
    select count(*)
    from public.mlb_postseason_challenges
    where season = 2026
      and content_ready = false
      and challenge_key in (
        'mlb-2026-play-12',
        'mlb-2026-play-13',
        'mlb-2026-play-14',
        'mlb-2026-play-15',
        'mlb-2026-play-16'
      )
  ) <> 5 then
    raise exception 'the five new MLB Play slots must remain not-ready until content is wired';
  end if;
end;
$$;

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

comment on table public.mlb_postseason_challenges is
  'The sixteen spoiler-free scoring slots that feed the 2026 MLB Postseason Championship Play lane.';

comment on function public.score_mlb_postseason_play(integer, uuid) is
  'Scores all sixteen MLB postseason Play challenges into the same 25-point championship lane using the 25/20/15/10/5 over 16 placement ladder.';

notify pgrst, 'reload schema';

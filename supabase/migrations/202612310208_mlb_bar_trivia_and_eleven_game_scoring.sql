-- Add Bar Trivia to the 2026 MLB postseason Play calendar on October 21.
-- The Play lane remains worth 25 championship points total, now spread equally
-- across eleven official challenges instead of ten.

alter table public.mlb_postseason_challenges
  drop constraint if exists mlb_postseason_challenges_slot_check;

alter table public.mlb_postseason_challenges
  add constraint mlb_postseason_challenges_slot_check
  check (slot between 1 and 11);

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
values (
  2026,
  11,
  'mlb-2026-play-11',
  date '2026-10-21',
  'bar_trivia',
  'Bar Trivia',
  'BAR TRIVIA',
  'Three rounds. One Double Round. One Last Call wager.',
  true
)
on conflict (season, slot) do update
set challenge_key = excluded.challenge_key,
    scheduled_date = excluded.scheduled_date,
    game_type = excluded.game_type,
    title = excluded.title,
    kicker = excluded.kicker,
    description = excluded.description,
    content_ready = excluded.content_ready;

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
            when 1 then 25::numeric / 11::numeric
            when 2 then 20::numeric / 11::numeric
            when 3 then 15::numeric / 11::numeric
            when 4 then 10::numeric / 11::numeric
            when 5 then 5::numeric / 11::numeric
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
begin
  if (select count(*) from public.mlb_postseason_challenges where season = 2026) <> 11 then
    raise exception '2026 MLB Play must have exactly eleven championship challenges';
  end if;

  if not exists (
    select 1
    from public.mlb_postseason_challenges
    where season = 2026
      and slot = 11
      and challenge_key = 'mlb-2026-play-11'
      and scheduled_date = date '2026-10-21'
      and game_type = 'bar_trivia'
      and content_ready
  ) then
    raise exception 'October 21 MLB Bar Trivia challenge was not installed exactly';
  end if;

  select pg_get_functiondef(
    'public.score_mlb_postseason_play(integer,uuid)'::regprocedure::oid
  ) into v_definition;

  if position('when 1 then 25::numeric / 11::numeric' in v_definition) = 0
    or position('when 5 then 5::numeric / 11::numeric' in v_definition) = 0 then
    raise exception 'MLB Play eleven-game placement ladder did not install exactly';
  end if;
end
$verify$;

comment on table public.mlb_postseason_challenges is
  'The eleven spoiler-free scoring slots that feed the MLB Postseason Championship Play lane.';

comment on function public.score_mlb_postseason_play(integer, uuid) is
  'Scores all eleven MLB postseason Play challenges into the same 25-point championship lane using the 25/20/15/10/5 over 11 placement ladder.';

notify pgrst, 'reload schema';

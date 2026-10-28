-- Mark the three newly-authored MLB postseason Play additions production-ready.
-- The two Average Fan slots remain reserved but not ready until the shared
-- classroom experience is extended to MLB.

update public.mlb_postseason_challenges
set content_ready = true
where season = 2026
  and challenge_key in (
    'mlb-2026-play-13',
    'mlb-2026-play-14',
    'mlb-2026-play-16'
  );

do $$
begin
  if (
    select count(*)
    from public.mlb_postseason_challenges
    where season = 2026
      and content_ready
  ) <> 14 then
    raise exception 'expected fourteen production-ready 2026 MLB Play challenges';
  end if;

  if (
    select count(*)
    from public.mlb_postseason_challenges
    where season = 2026
      and not content_ready
  ) <> 2 then
    raise exception 'only the two MLB Average Fan slots should remain not ready';
  end if;

  if not exists (
    select 1 from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key = 'mlb-2026-play-13'
      and scheduled_date = date '2026-10-13'
      and game_type = 'find_leader'
      and content_ready
  ) then
    raise exception 'October 13 MLB Find the Leader is not ready exactly';
  end if;

  if not exists (
    select 1 from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key = 'mlb-2026-play-14'
      and scheduled_date = date '2026-10-19'
      and game_type = 'who_am_i'
      and content_ready
  ) then
    raise exception 'October 19 MLB Who Am I is not ready exactly';
  end if;

  if not exists (
    select 1 from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key = 'mlb-2026-play-16'
      and scheduled_date = date '2026-10-27'
      and game_type = 'bar_trivia'
      and content_ready
  ) then
    raise exception 'October 27 MLB Bar Trivia is not ready exactly';
  end if;

  if (
    select count(*)
    from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key in ('mlb-2026-play-12', 'mlb-2026-play-15')
      and game_type = 'average_fan'
      and not content_ready
  ) <> 2 then
    raise exception 'MLB Average Fan reservations changed before their content was wired';
  end if;
end;
$$;

notify pgrst, 'reload schema';

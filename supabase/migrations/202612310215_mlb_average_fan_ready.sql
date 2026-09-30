-- Activate the two MLB Average Fan postseason Play dates after wiring the
-- exact shared Average Fan classroom experience and immutable MLB content.

update public.mlb_postseason_challenges
set content_ready = true
where season = 2026
  and challenge_key in (
    'mlb-2026-play-12',
    'mlb-2026-play-15'
  )
  and game_type = 'average_fan';

do $$
begin
  if (
    select count(*)
    from public.mlb_postseason_challenges
    where season = 2026
      and content_ready
  ) <> 16 then
    raise exception 'all sixteen 2026 MLB Play challenges must be production-ready';
  end if;

  if exists (
    select 1
    from public.mlb_postseason_challenges
    where season = 2026
      and not content_ready
  ) then
    raise exception 'no 2026 MLB Play challenge may remain not ready';
  end if;

  if not exists (
    select 1
    from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key = 'mlb-2026-play-12'
      and scheduled_date = date '2026-10-07'
      and game_type = 'average_fan'
      and content_ready
  ) then
    raise exception 'October 7 MLB Average Fan is not ready exactly';
  end if;

  if not exists (
    select 1
    from public.mlb_postseason_challenges
    where season = 2026
      and challenge_key = 'mlb-2026-play-15'
      and scheduled_date = date '2026-10-23'
      and game_type = 'average_fan'
      and content_ready
  ) then
    raise exception 'October 23 MLB Average Fan is not ready exactly';
  end if;
end;
$$;

notify pgrst, 'reload schema';

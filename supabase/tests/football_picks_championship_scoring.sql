begin;

do $$ begin
  if public.football_pick_ats_points(true, 24, 20, -3, false) <> 1
    or public.football_pick_ats_points(true, 24, 20, -5, false) <> 0
    or public.football_pick_ats_points(true, 24, 20, -4, false) <> 0.5 then
    raise exception 'normal frozen-line ATS grading failed';
  end if;
  if public.football_pick_ats_points(true, 24, 20, -3, true) <> 3
    or public.football_pick_ats_points(true, 24, 20, -5, true) <> 0
    or public.football_pick_ats_points(true, 24, 20, -4, true) <> 0.5 then
    raise exception 'Lock ATS grading failed';
  end if;
  if public.football_pick_ats_points(true, null, null, -3, false) is not null then
    raise exception 'unresolved game was graded';
  end if;
  if public.football_pick_lock_allowance(12) <> 3 or public.football_pick_lock_allowance(6) <> 2
    or public.football_pick_lock_allowance(2) <> 1 or public.football_pick_lock_allowance(1) <> 0 then
    raise exception 'slate Lock allowance failed';
  end if;
  -- Immutable helpers must replay identically from the same canonical facts.
  if public.football_pick_ats_points(false, 20, 24, 3, true)
      is distinct from public.football_pick_ats_points(false, 20, 24, 3, true) then
    raise exception 'Football grading was not deterministic';
  end if;
end $$;

rollback;
\echo 'Football Picks championship scoring proof passed.'

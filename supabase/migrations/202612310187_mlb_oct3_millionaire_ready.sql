-- Mark the scheduled October 3 MLB Millionaire challenge production-ready.
-- The canonical schedule was created in 202612310184; this release only flips
-- the completed slot without changing any later postseason challenge.

do $$
declare
  v_updated integer;
begin
  update public.mlb_postseason_challenges
  set content_ready = true
  where season = 2026
    and slot = 3
    and challenge_key = 'mlb-2026-play-03'
    and scheduled_date = date '2026-10-03'
    and game_type = 'millionaire';

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'expected exactly one Oct 3 MLB Millionaire challenge row, updated %', v_updated;
  end if;
end;
$$;

notify pgrst, 'reload schema';

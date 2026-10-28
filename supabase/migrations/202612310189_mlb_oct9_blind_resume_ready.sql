-- Mark the scheduled October 9 MLB Blind Resume challenge production-ready.
-- The canonical schedule already owns the slot/date/type; this release only
-- flips the completed challenge to ready without touching later slots.

do $$
declare
  v_updated integer;
begin
  update public.mlb_postseason_challenges
  set content_ready = true,
      description = 'Five head-to-head careers. Reveal only what you need.'
  where season = 2026
    and slot = 5
    and challenge_key = 'mlb-2026-play-05'
    and scheduled_date = date '2026-10-09'
    and game_type = 'blind_resume';

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'expected exactly one Oct 9 MLB Blind Resume challenge row, updated %', v_updated;
  end if;
end;
$$;

notify pgrst, 'reload schema';

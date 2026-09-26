-- Mark the scheduled October 6 MLB Who Am I challenge production-ready.
-- The canonical schedule already owns the slot/date/type; this release only
-- flips the completed challenge to ready without touching later slots.

do $$
declare
  v_updated integer;
begin
  update public.mlb_postseason_challenges
  set content_ready = true,
      description = 'Two identities. Progressive clues. One averaged final score.'
  where season = 2026
    and slot = 4
    and challenge_key = 'mlb-2026-play-04'
    and scheduled_date = date '2026-10-06'
    and game_type = 'who_am_i';

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'expected exactly one Oct 6 MLB Who Am I challenge row, updated %', v_updated;
  end if;
end;
$$;

notify pgrst, 'reload schema';

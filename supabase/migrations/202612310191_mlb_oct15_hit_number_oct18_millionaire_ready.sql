-- Activate the finished October 15 Hit the Number and October 18 Millionaire
-- MLB postseason challenges without changing any other scheduled slot.

do $$
declare
  v_updated integer;
begin
  update public.mlb_postseason_challenges
  set content_ready = true
  where season = 2026
    and (
      (
        slot = 7
        and challenge_key = 'mlb-2026-play-07'
        and scheduled_date = date '2026-10-15'
        and game_type = 'hit_the_number'
      )
      or
      (
        slot = 8
        and challenge_key = 'mlb-2026-play-08'
        and scheduled_date = date '2026-10-18'
        and game_type = 'millionaire'
      )
    );

  get diagnostics v_updated = row_count;
  if v_updated <> 2 then
    raise exception 'expected exactly two MLB challenge rows, updated %', v_updated;
  end if;
end;
$$;

notify pgrst, 'reload schema';

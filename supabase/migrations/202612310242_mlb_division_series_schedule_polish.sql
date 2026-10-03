-- Correct final Division Series broadcast labels and the featured player-to-watch metadata.
-- This follows the transition migration so production reflects the official Oct. 3 MLB schedule.

do $$
declare
  v_updated integer;
begin
  update public.mlb_playoff_series
  set schedule = case series_id
    when 'nl-ds-2' then jsonb_build_array(
      'G1 · Sat Oct 3 · 3:00 PM CT · FOX',
      'G2 · Sun Oct 4 · 7:00 PM CT · FS1',
      'G3 · Tue Oct 6 · 5:00 PM CT · FS1',
      'G4 · Wed Oct 7 · 5:00 PM CT · FS1 · IF NEEDED',
      'G5 · Fri Oct 9 · 7:00 PM CT · FOX · IF NEEDED'
    )
    when 'nl-ds-1' then jsonb_build_array(
      'G1 · Sat Oct 3 · 7:30 PM CT · FS1',
      'G2 · Sun Oct 4 · 3:00 PM CT · FS1',
      'G3 · Tue Oct 6 · 8:30 PM CT · FS1',
      'G4 · Wed Oct 7 · 9:00 PM CT · FS1 · IF NEEDED',
      'G5 · Fri Oct 9 · 3:30 PM CT · FS1 · IF NEEDED'
    )
    else schedule
  end,
  updated_at = now()
  where season = 2026
    and series_id in ('nl-ds-1', 'nl-ds-2');

  get diagnostics v_updated = row_count;
  if v_updated <> 2 then
    raise exception 'expected two NLDS schedule rows, updated %', v_updated;
  end if;

  update public.mlb_playoff_seasons
  set spotlight = jsonb_set(
      jsonb_set(spotlight, '{player_to_watch}', to_jsonb('Tarik Skubal'::text), true),
      '{player_context}',
      to_jsonb('Los Angeles Dodgers · Game 1 starter'::text),
      true
    ),
    updated_at = now()
  where season = 2026
    and current_round = 'division_series';

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'expected one 2026 Division Series season row, updated %', v_updated;
  end if;
end;
$$;

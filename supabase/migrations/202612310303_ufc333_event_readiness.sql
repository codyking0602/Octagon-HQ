-- UFC 333 readiness repair. Verified 2026-10-20 from UFC.com fighter
-- profiles and UFC 333 event odds. Fill only currently absent odds; the
-- canonical DraftKings monitor retains ownership of subsequently available lines.
-- Guard against an already settled card or newer owner-authored Spotlight.
DO $$
DECLARE
  v_event_id constant text := 'ufc-333-alexander-volkanovski-vs-movsar-evloev-2026-10-24';
  v_yan jsonb := $yan${"bout_id":"main-petr-yan-merab-dvalishvili","preview":"Yan and Dvalishvili enter their title-fight trilogy tied 1-1: Merab controlled their 2023 meeting with pressure wrestling, but Yan beat him over five rounds at UFC 323 to regain the bantamweight belt. Yan needs crisp boxing and strong takedown defense; Merab must restore his trademark relentless chain wrestling, cage pressure and pace.","red":{"fighter_slug":"petr-yan","record":"20-5-0","age":"33","height":"5' 7\"","reach":"67\"","stance":"Switch","edges":["Precise combination boxing and body attacks","Five-round championship experience","Improved takedown defense from the rematch"]},"blue":{"fighter_slug":"merab-dvalishvili","record":"21-5-0","age":"35","height":"5' 6\"","reach":"68\"","stance":"Orthodox","edges":["Relentless chain wrestling and takedown volume","Championship-caliber conditioning","Cage pressure and positional control"]},"watch_spotlights":[],"source":"UFCStats","generated_at":"2026-10-20T15:00:00Z"}$yan$::jsonb;
  v_krylov jsonb := $krylov${"bout_id":"prelim-nikita-krylov-abdul-rakhman-yakhyaev","preview":"Krylov's veteran submission craft and experience against elite light heavyweights meet one of the division's most explosive young finishers. Yakhyaev is unbeaten with three straight first-round UFC finishes, including an eight-second knockout; Krylov must withstand the early onslaught and force a longer, more technical fight.","red":{"fighter_slug":"nikita-krylov","record":"31-12-0","age":"34","height":"6' 3\"","reach":"77.5\"","stance":"Orthodox","edges":["UFC veteran competition and experience","Versatile finishing arsenal on feet and mat","Experience weathering difficult fights"]},"blue":{"fighter_slug":"abdul-rakhman-yakhyaev","record":"10-0-0","age":"25","height":"6' 2\"","reach":"78\"","stance":"Orthodox","edges":["Three straight opening-round UFC finishes","Explosive entries, top control and submissions","Undefeated record and fight-ending power"]},"watch_spotlights":[{"fighter_slug":"abdul-rakhman-yakhyaev","url":"https://youtube.com/shorts/k5En_QDBACA?is=KeKmxuwmh7N1yb1N"}],"source":"UFCStats","generated_at":"2026-10-20T15:00:00Z"}$krylov$::jsonb;
  v_spotlights jsonb;
BEGIN
  SELECT coalesce(spotlights, '[]'::jsonb)
    INTO v_spotlights
    FROM public.pick_events
    WHERE event_id = v_event_id AND status = 'upcoming' AND starts_at > now()
    FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;

  -- Only replace the machine-generated Yan/Merab placeholder; never overwrite
  -- independently repaired editorial content.
  SELECT coalesce(jsonb_agg(
    CASE WHEN bout.item->>'bout_id' = v_yan->>'bout_id'
              AND (bout.item #>> '{red,record}') = '--'
         THEN v_yan ELSE bout.item END ORDER BY bout.ordinality
  ), '[]'::jsonb)
    INTO v_spotlights
    FROM jsonb_array_elements(v_spotlights) WITH ORDINALITY AS bout(item, ordinality);

  -- Shane's #3 prospect is on the prelims: attach a full verified Spotlight.
  IF NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(v_spotlights) item
    WHERE item->>'bout_id' = v_krylov->>'bout_id'
  ) THEN
    v_spotlights := v_spotlights || jsonb_build_array(v_krylov);
  END IF;

  IF NOT private.pick_event_spotlight_is_valid(v_event_id, v_spotlights) THEN
    RAISE EXCEPTION 'UFC 333 verified spotlights did not pass the canonical validator';
  END IF;

  UPDATE public.pick_events
    SET spotlights = v_spotlights
    WHERE event_id = v_event_id;
END $$;

-- UFC.com lists the following three market moneylines as of Oct 20, 2026.
-- Do not infer prices from probabilities or overwrite DraftKings prices.
UPDATE public.pick_bouts b SET
  red_american_odds = -110, blue_american_odds = -110,
  odds_source = 'UFC.com', odds_updated_at = now()
FROM public.pick_events e
WHERE b.event_id = e.event_id AND e.event_id = 'ufc-333-alexander-volkanovski-vs-movsar-evloev-2026-10-24'
  AND e.status = 'upcoming' AND e.starts_at > now()
  AND b.red_fighter_slug = 'alexander-volkanovski' AND b.blue_fighter_slug = 'movsar-evloev'
  AND b.red_american_odds IS NULL AND b.blue_american_odds IS NULL;

UPDATE public.pick_bouts b SET
  red_american_odds = -105, blue_american_odds = -115,
  odds_source = 'UFC.com', odds_updated_at = now()
FROM public.pick_events e
WHERE b.event_id = e.event_id AND e.event_id = 'ufc-333-alexander-volkanovski-vs-movsar-evloev-2026-10-24'
  AND e.status = 'upcoming' AND e.starts_at > now()
  AND b.red_fighter_slug = 'loneer-kavanagh' AND b.blue_fighter_slug IN ('ramazan-temirov','ramazonbek-temirov')
  AND b.red_american_odds IS NULL AND b.blue_american_odds IS NULL;

UPDATE public.pick_bouts b SET
  red_american_odds = -120, blue_american_odds = 100,
  odds_source = 'UFC.com', odds_updated_at = now()
FROM public.pick_events e
WHERE b.event_id = e.event_id AND e.event_id = 'ufc-333-alexander-volkanovski-vs-movsar-evloev-2026-10-24'
  AND e.status = 'upcoming' AND e.starts_at > now()
  AND b.red_fighter_slug = 'abus-magomedov' AND b.blue_fighter_slug = 'cam-rowston'
  AND b.red_american_odds IS NULL AND b.blue_american_odds IS NULL;

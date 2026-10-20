-- UFC 333: repair the published co-main Spotlight and spotlight Shane's #3
-- prospect. Preserve all picks, moneylines, card ordering and any later owner edits.
-- Sources reviewed 2026-10-20:
-- https://www.ufc.com/athlete/petr-yan
-- https://www.ufc.com/athlete/merab-dvalishvili
-- https://www.ufc.com/athlete/nikita-krylov
-- https://www.ufc.com/athlete/abdulrakhman-yakhyaev
-- https://www.mmafighting.com/ufc/516619/video-ufc-333-countdown-full-episode
do $repair$
declare
  v_id constant text := 'ufc-333-alexander-volkanovski-vs-movsar-evloev-2026-10-24';
  v_packs constant jsonb := $packs$[
  {
    "bout_id": "main-petr-yan-merab-dvalishvili",
    "preview": "With their series tied 1–1, champion Petr Yan must punish entries with precise boxing, body work and takedown defense. Merab Dvalishvili won their first meeting with relentless wrestling pressure; Yan took the 2025 rematch by disrupting that rhythm. The trilogy hinges on fence position, mat returns and how much clean striking space Yan can create.",
    "red": {
      "fighter_slug": "petr-yan",
      "record": "20-5-0",
      "age": "33",
      "height": "5' 7\"",
      "reach": "67\"",
      "stance": "Switch",
      "edges": [
        "Championship boxing and body attacks",
        "Defensive wrestling in the rematch",
        "Five-round tactical adjustments"
      ]
    },
    "blue": {
      "fighter_slug": "merab-dvalishvili",
      "record": "21-5-0",
      "age": "35",
      "height": "5' 6\"",
      "reach": "68\"",
      "stance": "Orthodox",
      "edges": [
        "Relentless chain wrestling",
        "Elite pace and repeated shots",
        "Clinch control and mat returns"
      ]
    },
    "watch_spotlights": [],
    "source": "UFCStats",
    "generated_at": "2026-10-20T15:00:00.000Z"
  },
  {
    "bout_id": "prelim-nikita-krylov-abdulrakhman-yakhyaev",
    "preview": "Nikita Krylov brings 43 professional fights, dangerous submissions and experience against ranked UFC opposition. Unbeaten Abdul Rakhman Yakhyaev is 3–0 in the UFC with three first-round finishes, including an eight-second knockout. Krylov needs to survive the initial rush and create longer exchanges; Yakhyaev gets his toughest test of whether the early finishing threat holds up against a seasoned veteran.",
    "red": {
      "fighter_slug": "nikita-krylov",
      "record": "31-12-0",
      "age": "34",
      "height": "6' 3\"",
      "reach": "77.5\"",
      "stance": "Orthodox",
      "edges": [
        "Experienced submission threat",
        "Long UFC résumé",
        "Striking and grappling versatility"
      ]
    },
    "blue": {
      "fighter_slug": "abdulrakhman-yakhyaev",
      "record": "10-0-0",
      "age": "25",
      "height": "6' 2\"",
      "reach": "78\"",
      "stance": "Orthodox",
      "edges": [
        "Unbeaten 10–0 record",
        "Three first-round UFC finishes",
        "Explosive wrestling and submission attacks"
      ]
    },
    "watch_spotlights": [
      {
        "fighter_slug": "abdulrakhman-yakhyaev",
        "url": "https://youtube.com/shorts/k5En_QDBACA?is=KeKmxuwmh7N1yb1N"
      }
    ],
    "source": "UFCStats",
    "generated_at": "2026-10-20T15:00:00.000Z"
  }
]$packs$::jsonb;
  v_current jsonb;
  v_result jsonb := '[]'::jsonb;
  v_item jsonb;
  v_yan jsonb := v_packs->0;
  v_krylov jsonb := v_packs->1;
  v_found_krylov boolean := false;
begin
  select coalesce(e.spotlights, '[]'::jsonb) into v_current
  from public.pick_events e
  where e.event_id = v_id and e.status = 'upcoming' and e.sport = 'mma'
  for update;
  if not found then return; end if;

  -- Fail if the fight IDs, contestants or card changed after editorial review.
  if not exists (
    select 1 from public.pick_bouts
    where event_id = v_id and bout_id = v_yan->>'bout_id'
      and red_fighter_slug = 'petr-yan' and blue_fighter_slug = 'merab-dvalishvili'
      and included_in_picks
  ) or not exists (
    select 1 from public.pick_bouts
    where event_id = v_id and bout_id = v_krylov->>'bout_id'
      and red_fighter_slug = 'nikita-krylov' and blue_fighter_slug = 'abdulrakhman-yakhyaev'
      and included_in_picks
  ) then
    raise exception 'UFC 333 card changed; re-review Spotlights before publishing';
  end if;

  for v_item in select value from jsonb_array_elements(v_current)
  loop
    if v_item->>'bout_id' = v_yan->>'bout_id'
       and (v_item->>'preview' ilike '%stay adaptable and impose the better phase%'
            or v_item#>>'{red,record}' = '--'
            or v_item#>>'{blue,record}' = '--') then
      -- Replace only the known machine-generated placeholder, not future owner edits.
      v_result := v_result || jsonb_build_array(v_yan);
    else
      v_result := v_result || jsonb_build_array(v_item);
    end if;
    if v_item->>'bout_id' = v_krylov->>'bout_id' then v_found_krylov := true; end if;
  end loop;
  if not v_found_krylov then
    v_result := v_result || jsonb_build_array(v_krylov);
  end if;

  if not private.pick_event_spotlight_is_valid(v_id, v_result) then
    raise exception 'UFC 333 Spotlight repair failed source identity/structure validation';
  end if;
  update public.pick_events e
  set spotlights = v_result, updated_at = now()
  where e.event_id = v_id and e.status = 'upcoming'
    and e.spotlights is distinct from v_result;
end
$repair$;

-- Restore the five UFC 331 Fight Spotlights that were dropped by a stale
-- published-card save after the fight-week migration. Preserve the three
-- already-live Spotlights and append only missing bout packages.

do $$
declare
  v_event_id constant text := 'ufc-331-joshua-van-vs-alexandre-pantoja-2026-09-19';
  v_missing jsonb := $spotlights$
[
  {
    "bout_id":"main-patricio-pitbull-dooho-choi",
    "preview":"Patricio Pitbull brings veteran counter craft, power, and a layered grappling threat against Dooho Choi’s clean high-output boxing. Choi can win minutes behind combinations; Pitbull can change the fight with counters, takedowns, or front-headlock attacks.",
    "red":{"fighter_slug":"patricio-pitbull","record":"37-9-0","age":"39","height":"5' 6\"","reach":"67\"","stance":"Orthodox","edges":["Veteran counter craft","Submission threat","Wrestling defense"]},
    "blue":{"fighter_slug":"dooho-choi","record":"17-4-1","age":"35","height":"5' 10\"","reach":"70\"","stance":"Orthodox","edges":["High-output boxing","Reach and range control","Recent finishing momentum"]},
    "watch_spotlights":[],
    "source":"UFCStats",
    "generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"main-alonzo-menifield-iwo-baraniewski",
    "preview":"Alonzo Menifield is the proven veteran with power and strong takedown defense. Unbeaten Iwo Baraniewski is an early-round accelerator; the key is whether Menifield can make the fight structured before Baraniewski’s blitz creates damage.",
    "red":{"fighter_slug":"alonzo-menifield","record":"18-6-1","age":"38","height":"6' 0\"","reach":"76\"","stance":"Orthodox","edges":["UFC veteran experience","Power countering","Takedown resistance"]},
    "blue":{"fighter_slug":"iwo-baraniewski","record":"9-0-0","age":"27","height":"6' 0.5\"","reach":"73.5\"","stance":"Orthodox","edges":["Unbeaten finishing record","Explosive early pace","Judo and grappling base"]},
    "watch_spotlights":[],
    "source":"UFCStats",
    "generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-marlon-vera-charles-jourdain",
    "preview":"Charles Jourdain brings the higher striking pace and cleaner defensive numbers, while Marlon Vera remains dangerous deep into fights. Jourdain wants movement and combinations; Vera can flip rounds with body work, leg kicks, and sudden power.",
    "red":{"fighter_slug":"marlon-vera","record":"23-12-1","age":"33","height":"5' 8\"","reach":"70.5\"","stance":"Switch","edges":["Fight-changing power","Deep-round experience","Submission threat"]},
    "blue":{"fighter_slug":"charles-jourdain","record":"18-8-1","age":"30","height":"5' 9\"","reach":"69\"","stance":"Switch","edges":["Higher striking volume","Defensive striking","Switch-stance movement"]},
    "watch_spotlights":[],
    "source":"UFCStats",
    "generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-tai-tuivasa-robelis-despaigne",
    "preview":"Tai Tuivasa has the UFC experience and proven pocket power, but Robelis Despaigne owns a massive reach advantage and dangerous straight-line offense. Tuivasa needs to get inside the long weapons; Despaigne wants clean space and first-contact damage.",
    "red":{"fighter_slug":"tai-tuivasa","record":"15-10-0","age":"33","height":"6' 2\"","reach":"75\"","stance":"Southpaw","edges":["UFC veteran experience","Pocket knockout power","Leg-kick threat"]},
    "blue":{"fighter_slug":"robelis-despaigne","record":"5-2-0","age":"38","height":"6' 7\"","reach":"84\"","stance":"Orthodox","edges":["Massive reach advantage","Long-range power","Efficient striking"]},
    "watch_spotlights":[],
    "source":"UFCStats",
    "generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-michael-aswell-jr-joosang-yoo",
    "preview":"Michael Aswell Jr. pushes one of the card’s fastest striking paces, while JooSang Yoo is the more accurate counter striker with a reach edge. Aswell wants sustained boxing volume; Yoo’s opportunity is making that pressure pay with cleaner counters.",
    "red":{"fighter_slug":"michael-aswell-jr","record":"11-5-0","age":"25","height":"5' 8\"","reach":"69\"","stance":"Orthodox","edges":["Relentless striking pace","Pressure boxing","Battle-tested volume"]},
    "blue":{"fighter_slug":"joosang-yoo","record":"9-1-0","age":"32","height":"5' 7\"","reach":"71\"","stance":"Orthodox","edges":["Accurate counter striking","Reach and range control","Counterpunching power"]},
    "watch_spotlights":[],
    "source":"UFCStats",
    "generated_at":"2026-09-15T04:45:00.000Z"
  }
]
$spotlights$::jsonb;
  v_item jsonb;
  v_spotlights jsonb;
begin
  if exists (
    select 1
    from public.pick_events
    where event_id = v_event_id
      and status = 'upcoming'
  ) then
    for v_item in select value from jsonb_array_elements(v_missing)
    loop
      update public.pick_events event
      set spotlights = coalesce(event.spotlights, '[]'::jsonb) || jsonb_build_array(v_item)
      where event.event_id = v_event_id
        and not exists (
          select 1
          from jsonb_array_elements(coalesce(event.spotlights, '[]'::jsonb)) current
          where current->>'bout_id' = v_item->>'bout_id'
        );
    end loop;

    select coalesce(event.spotlights, '[]'::jsonb)
    into v_spotlights
    from public.pick_events event
    where event.event_id = v_event_id;

    if jsonb_array_length(v_spotlights) <> 8 then
      raise exception 'UFC 331 must publish exactly eight active Fight Spotlights';
    end if;

    if not private.pick_event_spotlight_is_valid(v_event_id, v_spotlights) then
      raise exception 'UFC 331 Fight Spotlight collection is invalid after repair';
    end if;
  end if;
end $$;

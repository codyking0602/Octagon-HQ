-- UFC 331 fight-week repair and numbered-event Picks projection.
-- Moicano/Ortega was cancelled on Sep. 14 and Gable Steveson/Sean Sharaf
-- was promoted to the opening main-card bout. Numbered UFC Picks include
-- the main card plus standard prelims, not early prelims.

do $$
declare
  v_event_id constant text := 'ufc-331-joshua-van-vs-alexandre-pantoja-2026-09-19';
begin
  if exists (select 1 from public.pick_events where event_id = v_event_id) then
    -- Free the cancelled bout's main-card sequence before resequencing.
    update public.pick_bouts
    set included_in_picks = false,
        card_segment = null,
        segment_sequence = null,
        result_status = 'cancelled',
        winner_fighter_slug = null,
        result_recorded_at = coalesce(result_recorded_at, now())
    where event_id = v_event_id
      and bout_id = 'main-renato-moicano-brian-ortega';

    -- Menifield currently owns main-card sequence 1. Clear that slot first so
    -- the promoted Steveson bout can take it without tripping the unique key.
    update public.pick_bouts
    set segment_sequence = null
    where event_id = v_event_id
      and bout_id = 'main-alonzo-menifield-iwo-baraniewski';

    update public.pick_bouts
    set segment_sequence = 2,
        locks_at = '2026-09-20T01:30:00Z'::timestamptz
    where event_id = v_event_id
      and bout_id = 'main-alonzo-menifield-iwo-baraniewski';

    -- The promoted heavyweight bout now opens the 9 p.m. ET main card.
    update public.pick_bouts
    set card_segment = 'main',
        segment_sequence = 1,
        locks_at = '2026-09-20T01:00:00Z'::timestamptz
    where event_id = v_event_id
      and bout_id = 'prelim-gable-steveson-sean-sharaf';

    update public.pick_bouts
    set card_segment = 'prelim',
        segment_sequence = case bout_id
          when 'prelim-marlon-vera-charles-jourdain' then 3
          when 'prelim-tai-tuivasa-robelis-despaigne' then 2
          when 'prelim-michael-aswell-jr-joosang-yoo' then 1
          else segment_sequence
        end
    where event_id = v_event_id
      and bout_id in (
        'prelim-marlon-vera-charles-jourdain',
        'prelim-tai-tuivasa-robelis-despaigne',
        'prelim-michael-aswell-jr-joosang-yoo'
      );

    -- A cancelled fight cannot remain somebody's active Underdog Lock.
    delete from public.profile_event_underdog_locks
    where event_id = v_event_id
      and bout_id = 'main-renato-moicano-brian-ortega';

    update public.pick_events
    set spotlights = $spotlights$
[
  {
    "bout_id":"main-event-joshua-van-alexandre-pantoja",
    "preview":"Joshua Van brings relentless combination volume into a rematch with Alexandre Pantoja’s pressure grappling. Van wants long exchanges and clean exits; Pantoja’s clearest path is forcing clinches, takedowns, and back-control sequences.",
    "red":{"fighter_slug":"joshua-van","record":"17-2-0","age":"24","height":"5' 5\"","reach":"65\"","stance":"Orthodox","edges":["Elite combination volume","Five-round pace","Strong takedown defense"]},
    "blue":{"fighter_slug":"alexandre-pantoja","record":"30-6-0","age":"36","height":"5' 5\"","reach":"67\"","stance":"Orthodox","edges":["Championship grappling","Back-control and submissions","Pressure-fighting experience"]},
    "watch_spotlights":[{"fighter_slug":"joshua-van","url":"https://youtube.com/shorts/HZMxsqQpZJo?is=Gy2kfrzn2lEQJFKQ"},{"fighter_slug":"alexandre-pantoja","url":"https://youtube.com/shorts/SWNsHqqKulw?is=LiZkrkn6WQwZjDjL"}],
    "source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"main-arman-tsarukyan-mauricio-ruffy",
    "preview":"Arman Tsarukyan can turn a striking fight into repeated wrestling and control exchanges. Mauricio Ruffy’s threat is keeping space for his reach, accuracy, and knockout power; over five rounds, Ruffy must make every entry expensive.",
    "red":{"fighter_slug":"arman-tsarukyan","record":"23-3-0","age":"29","height":"5' 7\"","reach":"72.5\"","stance":"Orthodox","edges":["Chain wrestling","Damage avoidance","Five-round control game"]},
    "blue":{"fighter_slug":"mauricio-ruffy","record":"14-2-0","age":"30","height":"5' 11\"","reach":"75\"","stance":"Orthodox","edges":["Long-range striking","Knockout power","Takedown resistance"]},
    "watch_spotlights":[{"fighter_slug":"arman-tsarukyan","url":"https://youtube.com/shorts/MgrjL_kE80k?is=oLkHqD-qN0rfCorT"},{"fighter_slug":"mauricio-ruffy","url":"https://youtube.com/shorts/ZmxoPE47lc8?is=VHG9bT2u3ktffk_T"}],
    "source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"main-patricio-pitbull-dooho-choi",
    "preview":"Patricio Pitbull brings veteran counter craft, power, and a layered grappling threat against Dooho Choi’s clean high-output boxing. Choi can win minutes behind combinations; Pitbull can change the fight with counters, takedowns, or front-headlock attacks.",
    "red":{"fighter_slug":"patricio-pitbull","record":"37-9-0","age":"39","height":"5' 6\"","reach":"67\"","stance":"Orthodox","edges":["Veteran counter craft","Submission threat","Wrestling defense"]},
    "blue":{"fighter_slug":"dooho-choi","record":"17-4-1","age":"35","height":"5' 10\"","reach":"70\"","stance":"Orthodox","edges":["High-output boxing","Reach and range control","Recent finishing momentum"]},
    "watch_spotlights":[],"source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"main-alonzo-menifield-iwo-baraniewski",
    "preview":"Alonzo Menifield is the proven veteran with power and strong takedown defense. Unbeaten Iwo Baraniewski is an early-round accelerator; the key is whether Menifield can make the fight structured before Baraniewski’s blitz creates damage.",
    "red":{"fighter_slug":"alonzo-menifield","record":"18-6-1","age":"38","height":"6' 0\"","reach":"76\"","stance":"Orthodox","edges":["UFC veteran experience","Power countering","Takedown resistance"]},
    "blue":{"fighter_slug":"iwo-baraniewski","record":"9-0-0","age":"27","height":"6' 0.5\"","reach":"73.5\"","stance":"Orthodox","edges":["Unbeaten finishing record","Explosive early pace","Judo and grappling base"]},
    "watch_spotlights":[],"source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-gable-steveson-sean-sharaf",
    "preview":"Gable Steveson’s Olympic wrestling is the matchup’s defining weapon, but his heavyweight hands have been fast and damaging. Sean Sharaf is the taller, longer puncher; he needs to punish entries before Steveson can turn exchanges into clinch control.",
    "red":{"fighter_slug":"gable-steveson","record":"4-0-0","age":"26","height":"5' 11\"","reach":"74\"","stance":"Orthodox","edges":["Olympic wrestling","Explosive athleticism","Fast finishing power"]},
    "blue":{"fighter_slug":"sean-sharaf","record":"4-2-0","age":"33","height":"6' 2\"","reach":"76\"","stance":"Orthodox","edges":["Height and reach","Heavyweight knockout power","High striking output"]},
    "watch_spotlights":[],"source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-marlon-vera-charles-jourdain",
    "preview":"Charles Jourdain brings the higher striking pace and cleaner defensive numbers, while Marlon Vera remains dangerous deep into fights. Jourdain wants movement and combinations; Vera can flip rounds with body work, leg kicks, and sudden power.",
    "red":{"fighter_slug":"marlon-vera","record":"23-12-1","age":"33","height":"5' 8\"","reach":"70.5\"","stance":"Switch","edges":["Fight-changing power","Deep-round experience","Submission threat"]},
    "blue":{"fighter_slug":"charles-jourdain","record":"18-8-1","age":"30","height":"5' 9\"","reach":"69\"","stance":"Switch","edges":["Higher striking volume","Defensive striking","Switch-stance movement"]},
    "watch_spotlights":[],"source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-tai-tuivasa-robelis-despaigne",
    "preview":"Tai Tuivasa has the UFC experience and proven pocket power, but Robelis Despaigne owns a massive reach advantage and dangerous straight-line offense. Tuivasa needs to get inside the long weapons; Despaigne wants clean space and first-contact damage.",
    "red":{"fighter_slug":"tai-tuivasa","record":"15-10-0","age":"33","height":"6' 2\"","reach":"75\"","stance":"Southpaw","edges":["UFC veteran experience","Pocket knockout power","Leg-kick threat"]},
    "blue":{"fighter_slug":"robelis-despaigne","record":"5-2-0","age":"38","height":"6' 7\"","reach":"84\"","stance":"Orthodox","edges":["Massive reach advantage","Long-range power","Efficient striking"]},
    "watch_spotlights":[],"source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  },
  {
    "bout_id":"prelim-michael-aswell-jr-joosang-yoo",
    "preview":"Michael Aswell Jr. pushes one of the card’s fastest striking paces, while JooSang Yoo is the more accurate counter striker with a reach edge. Aswell wants sustained boxing volume; Yoo’s opportunity is making that pressure pay with cleaner counters.",
    "red":{"fighter_slug":"michael-aswell-jr","record":"11-5-0","age":"25","height":"5' 8\"","reach":"69\"","stance":"Orthodox","edges":["Relentless striking pace","Pressure boxing","Battle-tested volume"]},
    "blue":{"fighter_slug":"joosang-yoo","record":"9-1-0","age":"32","height":"5' 7\"","reach":"71\"","stance":"Orthodox","edges":["Accurate counter striking","Reach and range control","Counterpunching power"]},
    "watch_spotlights":[],"source":"UFCStats","generated_at":"2026-09-15T04:45:00.000Z"
  }
]
$spotlights$::jsonb
    where event_id = v_event_id;
  end if;
end $$;

-- Surface the canonical segment metadata so the player-facing card can label
-- main-card and prelim bouts correctly on numbered events.
create or replace function public.get_current_pick_event(p_sport text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with selected_event as (
    select event.*, event as event_row
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
      and event.sport = case lower(trim(p_sport))
        when 'mma' then 'mma'
        when 'football' then 'football'
        else null
      end
    order by event.starts_at
    limit 1
  )
  select jsonb_build_object(
    'event_id', event.event_id,
    'sport', event.sport,
    'league', event.league,
    'event_kind', event.event_kind,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', case
      when event.status = 'locked' then 'locked'
      when not exists (
        select 1
        from public.pick_bouts open_bout
        where open_bout.event_id = event.event_id
          and open_bout.included_in_picks
          and not private.pick_bout_is_locked(event.event_row, open_bout)
      ) then 'locked'
      else 'upcoming'
    end,
    'can_control', public.is_pick_control_owner(auth.uid()),
    'header_storage_path', event.header_storage_path,
    'header_natural_width', event.header_natural_width,
    'header_natural_height', event.header_natural_height,
    'spotlights', coalesce((
      select jsonb_agg(spotlight.value order by spotlight.ordinality)
      from jsonb_array_elements(coalesce(event.spotlights, '[]'::jsonb))
        with ordinality as spotlight(value, ordinality)
      where private.pick_event_spotlight_is_valid(event.event_id, jsonb_build_array(spotlight.value))
    ), '[]'::jsonb),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'locks_at', coalesce(bout.locks_at, event.locks_at),
        'is_locked', private.pick_bout_is_locked(event.event_row, bout),
        'position', bout.position,
        'card_segment', bout.card_segment,
        'segment_sequence', bout.segment_sequence,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'home_team_slug', bout.home_team_slug,
        'away_team_slug', bout.away_team_slug,
        'home_team_logo_url', home_asset.logo_url,
        'away_team_logo_url', away_asset.logo_url,
        'frozen_spread_home', bout.frozen_spread_home,
        'spread_source', bout.spread_source,
        'spread_frozen_at', bout.spread_frozen_at,
        'home_final_score', bout.home_final_score,
        'away_final_score', bout.away_final_score,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds,
        'odds_source', bout.odds_source,
        'odds_updated_at', bout.odds_updated_at,
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_status', bout.result_status,
        'result_recorded_at', bout.result_recorded_at,
        'included_in_picks', bout.included_in_picks,
        'repick_required', bout.included_in_picks
          and auth.uid() is not null
          and not exists (
            select 1 from public.profile_event_picks current_pick
            where current_pick.profile_id = auth.uid()
              and current_pick.event_id = bout.event_id
              and current_pick.bout_id = bout.bout_id
          )
          and exists (
            select 1
            from public.pick_card_change_actions action,
              jsonb_array_elements(action.before_state->'invalidated_picks') evidence
            where action.event_id = bout.event_id
              and action.bout_id = bout.bout_id
              and action.action_type = 'replace_fighter'
              and evidence->>'profile_id' = auth.uid()::text
          ),
        'group_picks', public.resolved_bout_group_picks(bout.event_id, bout.bout_id)
      ) order by bout.position)
      from public.pick_bouts bout
      left join public.football_team_assets home_asset on home_asset.team_slug = bout.home_team_slug
      left join public.football_team_assets away_asset on away_asset.team_slug = bout.away_team_slug
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from selected_event event;
$$;

revoke all on function public.get_current_pick_event(text) from public;
grant execute on function public.get_current_pick_event(text) to anon, authenticated;

notify pgrst, 'reload schema';

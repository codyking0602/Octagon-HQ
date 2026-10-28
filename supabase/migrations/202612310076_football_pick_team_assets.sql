-- Football Picks presentation assets stay owned by the existing ESPN sync.
-- Picks rows keep team identity by slug; this cache attaches ESPN's logo URL
-- without adding a second browser/provider lookup path.

create table if not exists public.football_team_assets (
  team_slug text primary key,
  team_name text not null,
  league text not null check (league in ('nfl', 'college-football')),
  logo_url text not null check (logo_url ~ '^https://'),
  source text not null default 'espn' check (source = 'espn'),
  updated_at timestamptz not null default now(),
  constraint football_team_assets_slug_shape check (team_slug = public.slugify_pick_text(team_slug))
);

alter table public.football_team_assets enable row level security;
revoke all on table public.football_team_assets from public, anon, authenticated;

create or replace function public.upsert_football_team_assets(p_assets jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_asset jsonb;
  v_count integer := 0;
  v_slug text;
  v_name text;
  v_league text;
  v_logo_url text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required';
  end if;
  if jsonb_typeof(coalesce(p_assets, '[]'::jsonb)) <> 'array' then
    raise exception 'football team assets must be an array';
  end if;

  for v_asset in select value from jsonb_array_elements(coalesce(p_assets, '[]'::jsonb)) loop
    v_slug := public.slugify_pick_text(v_asset->>'team_slug');
    v_name := nullif(trim(v_asset->>'team_name'), '');
    v_league := lower(trim(coalesce(v_asset->>'league', '')));
    v_logo_url := nullif(trim(v_asset->>'logo_url'), '');
    if nullif(v_slug, '') is null or v_name is null
      or v_league not in ('nfl', 'college-football')
      or v_logo_url is null or v_logo_url !~ '^https://' then
      raise exception 'football team asset is incomplete';
    end if;

    insert into public.football_team_assets(team_slug, team_name, league, logo_url, source, updated_at)
    values (v_slug, v_name, v_league, v_logo_url, 'espn', now())
    on conflict (team_slug) do update
    set team_name = excluded.team_name,
        league = excluded.league,
        logo_url = excluded.logo_url,
        source = 'espn',
        updated_at = now();
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;
revoke all on function public.upsert_football_team_assets(jsonb) from public, anon, authenticated;
grant execute on function public.upsert_football_team_assets(jsonb) to service_role;

-- Seed the already-published Week 1 dry-run slate. Future slates refresh this
-- cache from ESPN during the canonical Football staging call.
insert into public.football_team_assets(team_slug, team_name, league, logo_url, source)
values
  ('new-england-patriots','New England Patriots','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/ne.png','espn'),
  ('seattle-seahawks','Seattle Seahawks','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/sea.png','espn'),
  ('san-francisco-49ers','San Francisco 49ers','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/sf.png','espn'),
  ('los-angeles-rams','Los Angeles Rams','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/lar.png','espn'),
  ('atlanta-falcons','Atlanta Falcons','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/atl.png','espn'),
  ('pittsburgh-steelers','Pittsburgh Steelers','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/pit.png','espn'),
  ('baltimore-ravens','Baltimore Ravens','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/bal.png','espn'),
  ('indianapolis-colts','Indianapolis Colts','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/ind.png','espn'),
  ('buffalo-bills','Buffalo Bills','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/buf.png','espn'),
  ('houston-texans','Houston Texans','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/hou.png','espn'),
  ('chicago-bears','Chicago Bears','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/chi.png','espn'),
  ('carolina-panthers','Carolina Panthers','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/car.png','espn'),
  ('cleveland-browns','Cleveland Browns','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/cle.png','espn'),
  ('jacksonville-jaguars','Jacksonville Jaguars','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/jax.png','espn'),
  ('new-orleans-saints','New Orleans Saints','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/no.png','espn'),
  ('detroit-lions','Detroit Lions','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/det.png','espn'),
  ('new-york-jets','New York Jets','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png','espn'),
  ('tennessee-titans','Tennessee Titans','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/ten.png','espn'),
  ('tampa-bay-buccaneers','Tampa Bay Buccaneers','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/tb.png','espn'),
  ('cincinnati-bengals','Cincinnati Bengals','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/cin.png','espn'),
  ('arizona-cardinals','Arizona Cardinals','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/ari.png','espn'),
  ('los-angeles-chargers','Los Angeles Chargers','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/lac.png','espn'),
  ('green-bay-packers','Green Bay Packers','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/gb.png','espn'),
  ('minnesota-vikings','Minnesota Vikings','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/min.png','espn'),
  ('miami-dolphins','Miami Dolphins','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/mia.png','espn'),
  ('las-vegas-raiders','Las Vegas Raiders','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/lv.png','espn'),
  ('washington-commanders','Washington Commanders','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png','espn'),
  ('philadelphia-eagles','Philadelphia Eagles','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/phi.png','espn'),
  ('dallas-cowboys','Dallas Cowboys','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/dal.png','espn'),
  ('new-york-giants','New York Giants','nfl','https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png','espn'),
  ('oklahoma-sooners','Oklahoma Sooners','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/201.png','espn'),
  ('michigan-wolverines','Michigan Wolverines','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/130.png','espn'),
  ('oregon-ducks','Oregon Ducks','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/2483.png','espn'),
  ('oklahoma-state-cowboys','Oklahoma State Cowboys','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/197.png','espn'),
  ('ohio-state-buckeyes','Ohio State Buckeyes','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/194.png','espn'),
  ('texas-longhorns','Texas Longhorns','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/251.png','espn'),
  ('iowa-state-cyclones','Iowa State Cyclones','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/66.png','espn'),
  ('iowa-hawkeyes','Iowa Hawkeyes','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/2294.png','espn'),
  ('arkansas-razorbacks','Arkansas Razorbacks','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/8.png','espn'),
  ('utah-utes','Utah Utes','college-football','https://a.espncdn.com/i/teamlogos/ncaa/500/254.png','espn')
on conflict (team_slug) do update
set team_name=excluded.team_name, league=excluded.league, logo_url=excluded.logo_url, source='espn', updated_at=now();

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
        select 1 from public.pick_bouts open_bout
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
      left join public.football_team_assets home_asset on home_asset.team_slug=bout.home_team_slug
      left join public.football_team_assets away_asset on away_asset.team_slug=bout.away_team_slug
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from selected_event event;
$$;
revoke all on function public.get_current_pick_event(text) from public, anon;
grant execute on function public.get_current_pick_event(text) to authenticated;

notify pgrst, 'reload schema';

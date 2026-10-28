-- Narrowly permit private GitHub OIDC verified server to invoke the existing canonical preparation RPC.
-- Use genuine approved SeatGeek game artwork; preserve all Tuesday release gates.
create or replace function public.prepare_football_weekly_editorial(
  p_week_of date, p_sport text, p_spotlight jsonb, p_game jsonb, p_editorial jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_package public.football_weekly_content_packages;
  v_choice jsonb;
  v_stat jsonb;
  v_thing jsonb;
  v_section jsonb;
  v_player jsonb;
  v_key text;
  v_asset_prefix text;
begin
  if auth.role() is distinct from 'service_role'
     and (auth.uid() is null or not public.is_pick_control_owner(auth.uid())) then
    raise exception 'Football editorial owner access required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2 then
    raise exception 'Football weekly package must start Tuesday in America/Chicago';
  end if;
  if p_sport not in ('cfb','nfl') then raise exception 'Unsupported Football editorial sport'; end if;

  select * into v_package from public.football_weekly_content_packages
    where week_of = p_week_of for update;
  if not found or v_package.status <> 'draft' then
    raise exception 'Football weekly package is not an editable draft';
  end if;
  v_choice := v_package.choices->p_sport;
  if v_choice is null then raise exception 'Owner must select a player and matchup before production'; end if;
  if jsonb_typeof(p_spotlight) is distinct from 'object'
     or jsonb_typeof(p_game) is distinct from 'object'
     or jsonb_typeof(p_editorial) is distinct from 'object' then
    raise exception 'Football preparation requires spotlight, game and editorial objects';
  end if;

  -- Guard against incorrect player/team after selection. Four meaningful labeled stats required.
  if p_spotlight->>'name' is distinct from v_choice->'player'->>'name'
    or p_spotlight->>'team' is distinct from v_choice->'player'->>'team'
    or p_spotlight->>'position' is distinct from v_choice->'player'->>'position'
    or coalesce(trim(p_spotlight->>'result'),'') = ''
    or coalesce(trim(p_spotlight->>'measurements'),'') = ''
    or coalesce(p_spotlight->>'team_color','') !~ '^#[0-9a-fA-F]{6}$'
    or coalesce(p_spotlight->>'highlight_url','') !~ '^https://(www[.])?(youtube[.]com|youtu[.]be)/'
    or p_spotlight->>'photo_kind' not in ('action','portrait','manual')
    or coalesce(p_spotlight->>'photo_source','') not like 'https://%'
    or jsonb_typeof(p_spotlight->'stats') is distinct from 'array' then
    raise exception 'Featured Spotlight is incomplete or not the approved player';
  end if;
  if jsonb_array_length(p_spotlight->'stats') <> 4 then
    raise exception 'Featured Spotlight must have four verified labeled stats';
  end if;
  for v_stat in select value from jsonb_array_elements(p_spotlight->'stats') loop
    if jsonb_typeof(v_stat) <> 'object'
      or coalesce(trim(v_stat->>'value'),'') = ''
      or coalesce(trim(v_stat->>'label'),'') = '' then
      raise exception 'Featured Spotlight contains blank stats';
    end if;
  end loop;
  if (select count(distinct upper(trim(value->>'label')))
      from jsonb_array_elements(p_spotlight->'stats')) <> 4 then
    raise exception 'Featured Spotlight requires distinct stat categories';
  end if;

  v_asset_prefix := '/assets/football/weekly/' || p_week_of::text || '/' || p_sport || '/';
  if p_spotlight->>'photo_asset_path' is distinct from v_asset_prefix || 'spotlight.webp' then
    raise exception 'Spotlight must reference the canonical verified weekly image asset';
  end if;

  -- Match the EXACT selected contest, not a similarly named opponent/date.
  if p_game->>'home_team' is distinct from v_choice->'game'->>'home_team'
     or p_game->>'away_team' is distinct from v_choice->'game'->>'away_team'
     or (p_game->>'kickoff_at')::timestamptz
          is distinct from (v_choice->'game'->>'kickoff_at')::timestamptz
     or p_game->>'header_asset_path' is distinct from v_asset_prefix || 'game-header.webp'
     or jsonb_typeof(p_game->'header_photo_sources') is distinct from 'array' then
    raise exception 'Featured matchup does not match owner choice or prepared header asset';
  end if;
  -- Approved SeatGeek graphic includes both teams; no synthetic photo montages.
  if jsonb_array_length(p_game->'header_photo_sources') <> 1 then
    raise exception 'Featured header must cite one approved SeatGeek source';
  end if;
  for v_stat in select value from jsonb_array_elements(p_game->'header_photo_sources') loop
    if jsonb_typeof(v_stat) <> 'string'
       or (v_stat#>>'{}') !~ '^https://(www[.])?seatgeekimages[.]com/matchup/[^?#]+[.](jpg|jpeg|png|webp)([?][^#]*)?$' then
      raise exception 'Only approved SeatGeek matchup image sources are allowed';
    end if;
  end loop;

  -- Full HQ editorial structure: two setup paragraphs, 3 deciding battles,
  -- each team's victory path and 3 players, plus two unit-vs-unit edges.
  v_section := p_editorial->'breakdown';
  if jsonb_typeof(v_section) is distinct from 'object'
    or jsonb_typeof(v_section->'setup') is distinct from 'array'
    or jsonb_typeof(v_section->'things') is distinct from 'array'
    or jsonb_typeof(v_section->'paths_to_win') is distinct from 'array'
    or jsonb_typeof(v_section->'players_to_watch') is distinct from 'array'
    or jsonb_typeof(v_section->'unit_edges') is distinct from 'array'
    or jsonb_typeof(p_editorial->'source_urls') is distinct from 'array' then
    raise exception 'Full HQ matchup editorial is required';
  end if;
  if jsonb_array_length(v_section->'setup') <> 2
    or jsonb_array_length(v_section->'things') <> 3
    or jsonb_array_length(v_section->'paths_to_win') <> 2
    or jsonb_array_length(v_section->'players_to_watch') <> 2
    or jsonb_array_length(v_section->'unit_edges') <> 2
    or jsonb_array_length(p_editorial->'source_urls') < 2 then
    raise exception 'Editorial must include 2 setup, 3 battles, 2 win paths, 6 players, 2 edges, 2 sources';
  end if;
  for v_thing in select value from jsonb_array_elements(v_section->'setup') loop
    if jsonb_typeof(v_thing) <> 'string' or length(trim(v_thing#>>'{}')) < 40 then
      raise exception 'Matchup setup paragraph incomplete';
    end if;
  end loop;
  for v_thing in select value from jsonb_array_elements(v_section->'things') loop
    if coalesce(trim(v_thing->>'title'),'') = ''
      or length(trim(coalesce(v_thing->>'body',''))) < 35
      or coalesce(trim(v_thing->>'edge'),'') = '' then
      raise exception 'Missing deciding-matchup title, explanation or edge';
    end if;
  end loop;
  for v_thing in select value from jsonb_array_elements(v_section->'paths_to_win') loop
    if coalesce(trim(v_thing->>'team'),'') = ''
      or length(trim(coalesce(v_thing->>'body',''))) < 35 then
      raise exception 'Missing team win path';
    end if;
  end loop;
  for v_thing in select value from jsonb_array_elements(v_section->'players_to_watch') loop
    if coalesce(trim(v_thing->>'team'),'') = ''
      or jsonb_typeof(v_thing->'players') is distinct from 'array' then
      raise exception 'Missing team players';
    end if;
    if jsonb_array_length(v_thing->'players') <> 3 then
      raise exception 'Each team must have exactly three featured players';
    end if;
    for v_player in select value from jsonb_array_elements(v_thing->'players') loop
      if coalesce(trim(v_player->>'name'),'') = ''
        or coalesce(trim(v_player->>'position'),'') = ''
        or coalesce(trim(v_player->>'body'),'') = '' then
        raise exception 'Incomplete matchup player identity or role';
      end if;
    end loop;
  end loop;
  for v_thing in select value from jsonb_array_elements(v_section->'unit_edges') loop
    if coalesce(trim(v_thing->>'title'),'') = ''
      or coalesce(trim(v_thing->>'edge'),'') = ''
      or length(trim(coalesce(v_thing->>'body',''))) < 35 then
      raise exception 'Missing unit-vs-unit HQ edge';
    end if;
  end loop;
  for v_thing in select value from jsonb_array_elements(p_editorial->'source_urls') loop
    if jsonb_typeof(v_thing) <> 'string' or (v_thing#>>'{}') not like 'https://%' then
      raise exception 'Verified editorial sources need secure URLs';
    end if;
  end loop;

  -- Production references stay drafts; later Phase 4 separately verifies live URLs
  -- and atomically transitions the whole completed package at the intended midnight.
  update public.football_weekly_content_packages p
  set cfb_spotlight = case when p_sport='cfb' then p_spotlight else p.cfb_spotlight end,
      nfl_spotlight = case when p_sport='nfl' then p_spotlight else p.nfl_spotlight end,
      cfb_game_of_week = case when p_sport='cfb' then p_game else p.cfb_game_of_week end,
      nfl_game_of_week = case when p_sport='nfl' then p_game else p.nfl_game_of_week end,
      production = p.production || jsonb_build_object(p_sport,
        p_editorial || jsonb_build_object('prepared_at',now(), 'player_id',v_choice->'player'->>'id',
        'game_id',v_choice->'game'->>'id')),
      updated_at = now()
  where p.week_of=p_week_of and p.status='draft'
  returning p.* into v_package;
  if not found then raise exception 'Editorial package was modified during preparation'; end if;
  return to_jsonb(v_package) || jsonb_build_object(
    'release_at',v_package.week_of::timestamp at time zone 'America/Chicago');
end;
$$;
revoke all on function public.prepare_football_weekly_editorial(date,text,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.prepare_football_weekly_editorial(date,text,jsonb,jsonb,jsonb) to authenticated;
notify pgrst, 'reload schema';


-- Integration-only entry uses existing canonical preparation validations.
-- Only a GitHub-owner-signed, main-workflow OIDC handoff can reach this
-- server-held service-role RPC through the private Edge Function.
create or replace function public.ingest_football_weekly_editorial_preparation(
  p_week_of date, p_sport text,
  p_spotlight jsonb, p_game jsonb, p_editorial jsonb,
  p_actor_id text, p_source_sha text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_saved jsonb;
begin
  if auth.role() is distinct from 'service_role'
     or p_actor_id <> '284170760'
     or coalesce(p_source_sha,'') !~ '^[0-9a-f]{40}$'
     or p_week_of is null
     or now() >= (p_week_of::timestamp at time zone 'America/Chicago')
     or p_sport not in ('cfb','nfl') then
    raise exception 'Owner-signed editorial preparation authorization required';
  end if;
  -- Reuse the unchanged validated canonical preparation implementation;
  -- that function performs exact selected identity, four-stat, YouTube,
  -- ESPN, SeatGeek, six-section breakdown, and asset-path validation.
  v_saved := public.prepare_football_weekly_editorial(
    p_week_of,p_sport,p_spotlight,p_game,p_editorial
  );
  if v_saved->'production'->p_sport->>'prepared_at' is null then
    raise exception 'Canonical editorial preparation readback failed';
  end if;
  return v_saved;
end;
$$;
revoke all on function public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.ingest_football_weekly_editorial_preparation(date,text,jsonb,jsonb,jsonb,text,text) to service_role;
notify pgrst,'reload schema';

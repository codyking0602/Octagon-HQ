-- New weekly editorial: exact screenshot's three-section content.
-- Owner-supplied custom art remains independently optional.
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
      is distinct from (v_choice->'game'->>'kickoff_at')::timestamptz then
    raise exception 'Selected GOTW teams or kickoff do not match';
  end if;
  -- Owner-supplied headers use a separate versioned asset path, not this
  -- automated editorial preparation. Never generate a replacement header.
  if p_week_of >= date '2026-10-27' and
      (p_game ? 'header_asset_path' or p_game ? 'header_photo_sources'
       or p_game ? 'header_storage_path') then
    raise exception 'New GOTW header is supplied exclusively by the owner';
  end if;

  -- Preserve strict legacy SeatGeek source checks for historical packages.
  if p_week_of < date '2026-10-27' then
    if p_game->>'header_asset_path' is distinct from v_asset_prefix || 'game-header.webp'
      or jsonb_typeof(p_game->'header_photo_sources') is distinct from 'array'
      or jsonb_array_length(p_game->'header_photo_sources') <> 1 then
      raise exception 'Legacy matchup artwork is invalid';
    end if;
    for v_stat in select value from jsonb_array_elements(p_game->'header_photo_sources') loop
      if jsonb_typeof(v_stat) <> 'string'
        or (v_stat#>>'{}') !~ '^https://(www[.])?seatgeekimages[.]com/matchup/[^?#]+[.](jpg|jpeg|png|webp)([?][^#]*)?
  if jsonb_typeof(v_section) is distinct from 'object'
    or (select count(*) from jsonb_object_keys(v_section)) <> 3
    or not (v_section ? 'setup' and v_section ? 'things' and v_section ? 'bottom_line')
    or jsonb_typeof(v_section->'setup') is distinct from 'array'
    or jsonb_typeof(v_section->'things') is distinct from 'array'
    or jsonb_typeof(v_section->'bottom_line') is distinct from 'string'
    or jsonb_array_length(v_section->'setup') <> 1
    or jsonb_array_length(v_section->'things') <> 3
    or length(trim(v_section->>'bottom_line')) < 40 then
    raise exception 'GOTW requires Setup, 3 Things That Matter, and Bottom Line';
  end if;
  for v_thing in select value from jsonb_array_elements(v_section->'setup') loop
    if jsonb_typeof(v_thing) <> 'string' or length(trim(v_thing#>>'{}')) < 40 then
      raise exception 'GOTW Setup missing researched copy';
    end if;
  end loop;
  for v_thing in select value from jsonb_array_elements(v_section->'things') loop
    if jsonb_typeof(v_thing) is distinct from 'object'
      or (select count(*) from jsonb_object_keys(v_thing)) <> 2
      or coalesce(trim(v_thing->>'title'),'') = ''
      or length(trim(coalesce(v_thing->>'body',''))) < 35 then
      raise exception 'GOTW Thing That Matters is incomplete';
    end if;
  end loop;
  if jsonb_typeof(p_editorial->'source_urls') is distinct from 'array'
    or jsonb_array_length(p_editorial->'source_urls') < 2 then
    raise exception 'Verified GOTW sources required';
  end if;
  for v_thing in select value from jsonb_array_elements(p_editorial->'source_urls') loop
    if jsonb_typeof(v_thing) <> 'string' or (v_thing#>>'{}') not like 'https://%' then
      raise exception 'Unverified GOTW source URL';
    end if;
  end loop;
  else
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

  end if;

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

create or replace function public.arm_football_weekly_editorial(
  p_week_of date, p_sport text, p_verified_assets jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_package public.football_weekly_content_packages;
  v_spotlight jsonb;
  v_game jsonb;
  v_editorial jsonb;
  v_receipt jsonb;
  v_prefix text;
  v_other text;
  v_ready timestamptz;
begin
  -- Verify the deployed Spotlight portrait independently. The owner-supplied
  -- GOTW header is optional and may arrive after the content is published.
  if auth.role() is distinct from 'service_role'
     and (auth.uid() is null or not public.is_pick_control_owner(auth.uid())) then
    raise exception 'Football editorial owner access required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2
    or p_sport not in ('cfb','nfl') then
    raise exception 'Invalid Tuesday editorial week or sport';
  end if;

  select * into v_package from public.football_weekly_content_packages p
    where p.week_of=p_week_of for update;
  if not found or v_package.status not in ('draft','ready')
     or now() >= ((v_package.week_of + 7)::timestamp at time zone 'America/Chicago') then
    raise exception 'Football package must be armed during its editorial week';
  end if;
  if v_package.production->p_sport->>'ready_at' is not null then
    raise exception 'Sport already armed for this Football week';
  end if;

  v_spotlight := case when p_sport='cfb' then v_package.cfb_spotlight else v_package.nfl_spotlight end;
  v_game := case when p_sport='cfb' then v_package.cfb_game_of_week else v_package.nfl_game_of_week end;
  v_editorial := v_package.production->p_sport;
  v_receipt := v_package.choices->p_sport;
  v_prefix := '/assets/football/weekly/' || p_week_of::text || '/' || p_sport || '/';
  v_other := case when p_sport='cfb' then 'nfl' else 'cfb' end;

  if v_receipt is null or v_spotlight is null or v_game is null or v_editorial is null
     or v_spotlight->>'name' is distinct from v_receipt->'player'->>'name'
     or v_spotlight->>'team' is distinct from v_receipt->'player'->>'team'
     or v_spotlight->>'position' is distinct from v_receipt->'player'->>'position'
     or v_game->>'home_team' is distinct from v_receipt->'game'->>'home_team'
     or v_game->>'away_team' is distinct from v_receipt->'game'->>'away_team'
     or (v_game->>'kickoff_at')::timestamptz
          is distinct from (v_receipt->'game'->>'kickoff_at')::timestamptz
     or v_editorial->>'player_id' is distinct from v_receipt->'player'->>'id'
     or v_editorial->>'game_id' is distinct from v_receipt->'game'->>'id'
     or v_spotlight->>'photo_asset_path' is distinct from v_prefix || 'spotlight.webp'
     or jsonb_typeof(v_spotlight->'stats') is distinct from 'array'
     or jsonb_array_length(v_spotlight->'stats') <> 4
     or jsonb_typeof(v_editorial->'breakdown') is distinct from 'object'
     or jsonb_typeof(v_editorial->'source_urls') is distinct from 'array'
     or jsonb_array_length(v_editorial->'source_urls') < 2 then
    raise exception 'Selected Football content is incomplete or mismatched';
  end if;

  if p_verified_assets is null or jsonb_typeof(p_verified_assets) <> 'object'
     or p_verified_assets->>'spotlight_url'
          is distinct from 'https://octagon.hq-app.workers.dev' || v_prefix || 'spotlight.webp'
     or coalesce(p_verified_assets->>'deployed_sha','') !~ '^[0-9a-f]{40}$' then
    raise exception 'Exact deployed Football image URLs and commit SHA are required';
  end if;
  -- The binary WebP/dimension/identity checks are performed by the verified
  -- deployment checker before invoking this owner-only RPC, never by trusting a draft path.
  v_ready := now();
  update public.football_weekly_content_packages p
  set production = jsonb_set(p.production, array[p_sport],
        v_editorial || jsonb_build_object('ready_at',v_ready,
          'armed_by',auth.uid(),'media_verification',p_verified_assets), true),
      status = case when p.production->v_other->>'ready_at' is not null then 'ready' else 'draft' end,
      approved_at = coalesce(p.approved_at,v_ready),
      ready_at = case when p.production->v_other->>'ready_at' is not null then v_ready else p.ready_at end,
      updated_at = v_ready
  where p.week_of=p_week_of returning p.* into v_package;

  return to_jsonb(v_package) || jsonb_build_object(
    'release_at',(v_package.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago');
end;
$$;

revoke all on function public.prepare_football_weekly_editorial(date,text,jsonb,jsonb,jsonb) from public, anon;
grant execute on function public.prepare_football_weekly_editorial(date,text,jsonb,jsonb,jsonb) to authenticated, service_role;
revoke all on function public.arm_football_weekly_editorial(date,text,jsonb) from public, anon;
grant execute on function public.arm_football_weekly_editorial(date,text,jsonb) to authenticated, service_role;
notify pgrst,'reload schema';

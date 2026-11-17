-- Shift the *server-owned* weekly Football editorial publication from Tuesday

-- 08:00 to 06:00 America/Chicago. Preserve CST/CDT conversion, per-sport

-- independent readiness gates, immutability, and automatic late catch-up.

-- Keep owner-facing release_at metadata aligned with the public projection.

CREATE OR REPLACE FUNCTION public.arm_football_weekly_editorial(p_week_of date, p_sport text, p_verified_assets jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  -- Older published packages retain their original verified SeatGeek art contract.
  -- The owner-only/no-substitute rule is exclusive to October 27 and later.
  if p_week_of < date '2026-10-27' and
    (v_game->>'header_asset_path' is distinct from v_prefix || 'game-header.webp'
      or p_verified_assets->>'header_url' is distinct from
        'https://octagon.hq-app.workers.dev' || v_prefix || 'game-header.webp') then
    raise exception 'Legacy header verification is required for historical packages';
  end if;
  -- Verify only the Spotlight image for new weeks; the user's header is optional.
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
    'release_at',(v_package.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago');
end;
$function$


CREATE OR REPLACE FUNCTION public.live_football_weekly_editorial_at(p_as_of timestamp with time zone)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
select jsonb_build_object(
  'cfb', (
    select jsonb_build_object(
      'week_of',p.week_of,
      'release_at',(p.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago',
      'spotlight',p.cfb_spotlight,
      'game',p.cfb_game_of_week,
      'breakdown',p.production->'cfb'->'breakdown')
    from public.football_weekly_content_packages p
    where p.production->'cfb'->>'ready_at' is not null
      and (p.production->'cfb'->>'ready_at')::timestamptz <= p_as_of
      and p.cfb_spotlight is not null and p.cfb_game_of_week is not null
      and ((p.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago') <= p_as_of
    order by p.week_of desc limit 1
  ),
  'nfl', (
    select jsonb_build_object(
      'week_of',p.week_of,
      'release_at',(p.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago',
      'spotlight',p.nfl_spotlight,
      'game',p.nfl_game_of_week,
      'breakdown',p.production->'nfl'->'breakdown')
    from public.football_weekly_content_packages p
    where p.production->'nfl'->>'ready_at' is not null
      and (p.production->'nfl'->>'ready_at')::timestamptz <= p_as_of
      and p.nfl_spotlight is not null and p.nfl_game_of_week is not null
      and ((p.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago') <= p_as_of
    order by p.week_of desc limit 1
  )
);
$function$


CREATE OR REPLACE FUNCTION public.finalize_football_weekly_publication()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_count integer;
begin
  -- Per-sport publication receipts are independent. Preserve the other sport's
  -- draft/ready slot so an approved late package can still finish this week.
  update public.football_weekly_content_packages p
  set production =
    case when p.production->'nfl'->>'ready_at' is not null
      and p.production->'nfl'->>'published_at' is null
      and (p.production->'nfl'->>'ready_at')::timestamptz <= now()
      then jsonb_set(
        case when p.production->'cfb'->>'ready_at' is not null
          and p.production->'cfb'->>'published_at' is null
          and (p.production->'cfb'->>'ready_at')::timestamptz <= now()
          then jsonb_set(p.production,'{cfb,published_at}',to_jsonb(now()),true)
          else p.production end,
        '{nfl,published_at}',to_jsonb(now()),true)
      when p.production->'cfb'->>'ready_at' is not null
        and p.production->'cfb'->>'published_at' is null
        and (p.production->'cfb'->>'ready_at')::timestamptz <= now()
        then jsonb_set(p.production,'{cfb,published_at}',to_jsonb(now()),true)
      else p.production end,
      updated_at=now()
  where ((p.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago') <= now()
    and (p.week_of + 7)::timestamp at time zone 'America/Chicago' > now()
    and (
      (p.production->'cfb'->>'ready_at' is not null and p.production->'cfb'->>'published_at' is null)
      or (p.production->'nfl'->>'ready_at' is not null and p.production->'nfl'->>'published_at' is null)
    );
  get diagnostics v_count = row_count;
  update public.football_weekly_content_packages p
  set status='published', published_at=coalesce(p.published_at,now()),updated_at=now()
  where p.status in ('draft','ready')
    and p.production->'cfb'->>'published_at' is not null
    and p.production->'nfl'->>'published_at' is not null;
  return v_count;
end;
$function$


CREATE OR REPLACE FUNCTION public.get_football_weekly_content_package(p_week_of date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_result jsonb;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Football editorial owner access required';
  end if;
  select to_jsonb(p) || jsonb_build_object(
    'release_at', (p.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago'
  ) into v_result
  from public.football_weekly_content_packages p where p.week_of = p_week_of;
  return v_result;
end;
$function$


CREATE OR REPLACE FUNCTION public.save_football_weekly_content_draft(p_week_of date, p_patch jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_key text;
  v_item jsonb;
  v_saved public.football_weekly_content_packages;
begin
  if auth.uid() is null or not public.is_pick_control_owner(auth.uid()) then
    raise exception 'Football editorial owner access required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2 then
    raise exception 'Football editorial week must begin Tuesday in America/Chicago';
  end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
    raise exception 'Football editorial patch must be a nonempty object';
  end if;
  for v_key in select jsonb_object_keys(p_patch) loop
    if v_key not in ('cfb_spotlight','nfl_spotlight','cfb_game_of_week','nfl_game_of_week') then
      raise exception 'Unsupported Football editorial field: %',v_key;
    end if;
    v_item := p_patch->v_key;
    if v_item = 'null'::jsonb then continue; end if;
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Editorial slot % must be object or null',v_key;
    end if;
    if v_key in ('cfb_spotlight','nfl_spotlight') then
      if coalesce(trim(v_item->>'name'),'') = ''
        or coalesce(trim(v_item->>'team'),'') = ''
        or coalesce(trim(v_item->>'position'),'') = ''
        or coalesce(trim(v_item->>'result'),'') = ''
        or coalesce(trim(v_item->>'measurements'),'') = ''
        or coalesce(trim(v_item->>'team_color'),'') = ''
        or coalesce(trim(v_item->>'highlight_url'),'') not like 'https://%'
        or jsonb_typeof(v_item->'stats') is distinct from 'array' then
        raise exception 'Incomplete Football editorial Spotlight: %',v_key;
      end if;
      if jsonb_array_length(v_item->'stats') <> 4
        or exists (
          select 1 from jsonb_array_elements(v_item->'stats') stat
          where jsonb_typeof(stat) <> 'object'
            or coalesce(trim(stat->>'value'),'') = ''
            or coalesce(trim(stat->>'label'),'') = ''
        ) then
        raise exception 'Spotlight requires exactly four labeled stats: %',v_key;
      end if;
    else
      if coalesce(trim(v_item->>'home_team'),'') = ''
        or coalesce(trim(v_item->>'away_team'),'') = ''
        or coalesce(trim(v_item->>'kickoff_at'),'') = '' then
        raise exception 'Incomplete Football editorial matchup: %',v_key;
      end if;
      if v_item->>'home_team' = v_item->>'away_team' then
        raise exception 'Featured matchup requires two different teams';
      end if;
      perform (v_item->>'kickoff_at')::timestamptz;
    end if;
  end loop;

  insert into public.football_weekly_content_packages(week_of)
  values(p_week_of) on conflict(week_of) do nothing;
  update public.football_weekly_content_packages p set
    cfb_spotlight = case when p_patch ? 'cfb_spotlight' then nullif(p_patch->'cfb_spotlight','null'::jsonb) else p.cfb_spotlight end,
    nfl_spotlight = case when p_patch ? 'nfl_spotlight' then nullif(p_patch->'nfl_spotlight','null'::jsonb) else p.nfl_spotlight end,
    cfb_game_of_week = case when p_patch ? 'cfb_game_of_week' then nullif(p_patch->'cfb_game_of_week','null'::jsonb) else p.cfb_game_of_week end,
    nfl_game_of_week = case when p_patch ? 'nfl_game_of_week' then nullif(p_patch->'nfl_game_of_week','null'::jsonb) else p.nfl_game_of_week end,
    updated_at = now()
  where p.week_of = p_week_of and p.status = 'draft'
  returning p.* into v_saved;
  if not found then
    raise exception 'Football package is no longer an editable draft';
  end if;
  return to_jsonb(v_saved) || jsonb_build_object(
    'release_at', (v_saved.week_of::timestamp + interval '6 hours') at time zone 'America/Chicago'
  );
end;
$function$


-- Preserve owner/browser grants; CREATE OR REPLACE keeps existing function ACLs.

notify pgrst, 'reload schema';

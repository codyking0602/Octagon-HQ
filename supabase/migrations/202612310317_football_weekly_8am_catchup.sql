-- Tuesday 08:00 America/Chicago target with verified late catch-up, per sport.
-- Previously armed October 20 CFB remains immutable. No incomplete sports are published.
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
  -- The existing private scheduled Edge function uses the service role ONLY after
  -- authenticating the database-owned scheduler token and inspecting both live WebPs.
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
     or v_game->>'header_asset_path' is distinct from v_prefix || 'game-header.webp'
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
     or p_verified_assets->>'header_url'
          is distinct from 'https://octagon.hq-app.workers.dev' || v_prefix || 'game-header.webp'
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

create or replace function public.live_football_weekly_editorial_at(p_as_of timestamptz)
returns jsonb language sql stable security definer set search_path = ''
as $$
select jsonb_build_object(
  'cfb', (
    select jsonb_build_object(
      'week_of',p.week_of,
      'release_at',(p.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago',
      'spotlight',p.cfb_spotlight,
      'game',p.cfb_game_of_week,
      'breakdown',p.production->'cfb'->'breakdown')
    from public.football_weekly_content_packages p
    where p.production->'cfb'->>'ready_at' is not null
      and (p.production->'cfb'->>'ready_at')::timestamptz <= p_as_of
      and p.cfb_spotlight is not null and p.cfb_game_of_week is not null
      and ((p.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago') <= p_as_of
    order by p.week_of desc limit 1
  ),
  'nfl', (
    select jsonb_build_object(
      'week_of',p.week_of,
      'release_at',(p.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago',
      'spotlight',p.nfl_spotlight,
      'game',p.nfl_game_of_week,
      'breakdown',p.production->'nfl'->'breakdown')
    from public.football_weekly_content_packages p
    where p.production->'nfl'->>'ready_at' is not null
      and (p.production->'nfl'->>'ready_at')::timestamptz <= p_as_of
      and p.nfl_spotlight is not null and p.nfl_game_of_week is not null
      and ((p.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago') <= p_as_of
    order by p.week_of desc limit 1
  )
);
$$;

create or replace function public.ingest_football_weekly_editorial_handoff(
  p_week_of date, p_sport text, p_candidates jsonb,
  p_player_id text, p_game_id text, p_actor_id text, p_source_sha text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_package public.football_weekly_content_packages;
  v_kind text;
  v_array jsonb;
  v_item jsonb;
  v_player jsonb;
  v_game jsonb;
  v_choice jsonb;
  v_current jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Private editorial integration authorization required';
  end if;
  if p_week_of is null or extract(isodow from p_week_of) <> 2
     or p_sport not in ('cfb','nfl')
     or coalesce(p_source_sha,'') !~ '^[0-9a-f]{40}$'
     or coalesce(p_actor_id,'') !~ '^[0-9]{1,20}$' then
    raise exception 'Invalid signed editorial provenance, sport or Tuesday week';
  end if;
  if (p_player_id is null) <> (p_game_id is null) then
    raise exception 'Player and game choices must be supplied together';
  end if;
  if p_player_id is not null and p_actor_id <> '284170760' then
    raise exception 'A verified GitHub owner action is required to select';
  end if;
  if now() >= ((p_week_of + 7)::timestamp at time zone 'America/Chicago') then
    raise exception 'Football editorial week has closed';
  end if;
  if p_candidates is not null then
    if jsonb_typeof(p_candidates) is distinct from 'object'
       or (select count(*) from jsonb_object_keys(p_candidates)) <> 2
       or not (p_candidates ? 'players' and p_candidates ? 'games') then
      raise exception 'Exactly two candidate arrays required';
    end if;
    foreach v_kind in array array['players','games'] loop
      v_array := p_candidates->v_kind;
      if jsonb_typeof(v_array) is distinct from 'array'
         or jsonb_array_length(v_array) <> 5
         or (select count(distinct value->>'id') from jsonb_array_elements(v_array)) <> 5 then
        raise exception 'Exactly five distinct Football % candidates required',v_kind;
      end if;
      for v_item in select value from jsonb_array_elements(v_array) loop
        if jsonb_typeof(v_item) is distinct from 'object'
           or coalesce(v_item->>'id','') !~ '^[a-z0-9][a-z0-9-]{0,79}$'
           or coalesce(trim(v_item->>'summary'),'') = '' then
          raise exception 'Invalid Football % candidate',v_kind;
        end if;
        if v_kind = 'players' then
          if coalesce(trim(v_item->>'name'),'') = ''
             or coalesce(trim(v_item->>'team'),'') = ''
             or coalesce(trim(v_item->>'position'),'') = '' then
            raise exception 'Incomplete Spotlight identity';
          end if;
        else
          if coalesce(trim(v_item->>'home_team'),'') = ''
             or coalesce(trim(v_item->>'away_team'),'') = ''
             or v_item->>'home_team' = v_item->>'away_team'
             or coalesce(trim(v_item->>'kickoff_at'),'') = '' then
            raise exception 'Incomplete matchup identity';
          end if;
          perform (v_item->>'kickoff_at')::timestamptz;
        end if;
      end loop;
    end loop;
  end if;

  insert into public.football_weekly_content_packages(week_of)
    values (p_week_of) on conflict (week_of) do nothing;
  select * into v_package from public.football_weekly_content_packages
    where week_of = p_week_of for update;
  if v_package.status not in ('draft','ready') then raise exception 'Football editorial package is locked'; end if;
  v_current := v_package.proposals->p_sport;
  if p_candidates is not null then
    if v_current is not null and v_current <> p_candidates then
      raise exception 'Existing Football shortlist differs: refusing destructive overwrite';
    end if;
    if v_current is null then
      update public.football_weekly_content_packages
      set proposals=proposals || jsonb_build_object(p_sport,p_candidates), updated_at=now()
      where week_of=p_week_of;
      v_current := p_candidates;
    end if;
  end if;
  if p_player_id is not null then
    if v_current is null then raise exception 'Cannot approve absent shortlist'; end if;
    select value into v_player from jsonb_array_elements(v_current->'players')
      where value->>'id'=p_player_id;
    select value into v_game from jsonb_array_elements(v_current->'games')
      where value->>'id'=p_game_id;
    if v_player is null or v_game is null then
      raise exception 'Owner selection must match exact staged candidate IDs';
    end if;
    v_choice := v_package.choices->p_sport;
    if v_choice is not null then
      if v_choice->'player'->>'id' <> p_player_id
         or v_choice->'game'->>'id' <> p_game_id then
        raise exception 'Existing owner selection is immutable';
      end if;
    else
      update public.football_weekly_content_packages
      set choices=choices || jsonb_build_object(p_sport,
        jsonb_build_object('player',v_player,'game',v_game,
          'selected_at',now(),'selected_via','github-oidc-owner',
          'selected_by_github_id',p_actor_id,'source_sha',p_source_sha)),
          updated_at=now()
      where week_of=p_week_of;
    end if;
  end if;
  select * into v_package from public.football_weekly_content_packages where week_of=p_week_of;
  return to_jsonb(v_package) || jsonb_build_object(
    'release_at',v_package.week_of::timestamp at time zone 'America/Chicago');
end;
$$;

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
     or now() >= ((p_week_of + 7)::timestamp at time zone 'America/Chicago')
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

create or replace function public.finalize_football_weekly_publication()
returns integer language plpgsql security definer set search_path = ''
as $$
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
  where ((p.week_of::timestamp + interval '8 hours') at time zone 'America/Chicago') <= now()
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
$$;

revoke all on function public.finalize_football_weekly_publication() from public,anon,authenticated;
-- Poll the SAME guarded media verifier as before. This worker is cheap/no-op
-- until approved editorial plus both deployed image assets exist.
select cron.schedule(
  'octagon-hq-football-editorial-verify-assets',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/football-weekly-publisher',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-octagon-scheduler-token',(
          select decrypted_secret from vault.decrypted_secrets
          where name='octagon_pick_monitoring_scheduler_token'
        )
      ),
      body := '{"mode":"scheduled"}'::jsonb,
      timeout_milliseconds := 45000
    );
  $job$
);
notify pgrst,'reload schema';

-- Phase 4: Central-midnight, per-sport fail-closed Football editorial publication.
-- The public projection is time-gated in SQL: no browser timer or cron wakeup can leak early.
-- Publication does not mutate the existing Football Picks event, manual Spotlight or UFC systems.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- After a sport is armed, nobody can replace its approved names, photos or editorial.
create or replace function public.guard_armed_football_editorial()
returns trigger language plpgsql set search_path = '' as $$
declare v_sport text;
begin
  foreach v_sport in array array['cfb','nfl'] loop
    if old.production->v_sport->>'ready_at' is not null then
      if (case when v_sport='cfb' then new.cfb_spotlight else new.nfl_spotlight end)
           is distinct from
         (case when v_sport='cfb' then old.cfb_spotlight else old.nfl_spotlight end)
        or (case when v_sport='cfb' then new.cfb_game_of_week else new.nfl_game_of_week end)
           is distinct from
           (case when v_sport='cfb' then old.cfb_game_of_week else old.nfl_game_of_week end)
        or new.choices->v_sport is distinct from old.choices->v_sport
        or new.proposals->v_sport is distinct from old.proposals->v_sport
        or (new.production->v_sport - 'published_at') is distinct from
           (old.production->v_sport - 'published_at') then
        raise exception 'Armed Football editorial % is immutable',v_sport;
      end if;
    end if;
  end loop;
  return new;
end;
$$;
drop trigger if exists guard_armed_football_editorial on public.football_weekly_content_packages;
create trigger guard_armed_football_editorial
before update on public.football_weekly_content_packages
for each row execute function public.guard_armed_football_editorial();

-- Owner's arming receipt proves the generated binary assets were inspected at
-- their live deployment URL and matched the exact prepared content & commit SHA.
-- One sport may safely arm while the other remains a draft.
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
     or now() >= (v_package.week_of::timestamp at time zone 'America/Chicago') then
    raise exception 'Football package must be armed before Central midnight';
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
    'release_at',v_package.week_of::timestamp at time zone 'America/Chicago');
end;
$$;
revoke all on function public.arm_football_weekly_editorial(date,text,jsonb) from public, anon;
grant execute on function public.arm_football_weekly_editorial(date,text,jsonb) to authenticated, service_role;

-- Internal time-injectable projection for deterministic tests; caller never supplies
-- an as-of date to the public RPC. Each sport independently retains its last armed week.
create or replace function public.live_football_weekly_editorial_at(p_as_of timestamptz)
returns jsonb language sql stable security definer set search_path = ''
as $$
select jsonb_build_object(
  'cfb', (
    select jsonb_build_object(
      'week_of',p.week_of,
      'release_at',p.week_of::timestamp at time zone 'America/Chicago',
      'spotlight',p.cfb_spotlight,
      'game',p.cfb_game_of_week,
      'breakdown',p.production->'cfb'->'breakdown')
    from public.football_weekly_content_packages p
    where p.production->'cfb'->>'ready_at' is not null
      and p.cfb_spotlight is not null and p.cfb_game_of_week is not null
      and (p.week_of::timestamp at time zone 'America/Chicago') <= p_as_of
    order by p.week_of desc limit 1
  ),
  'nfl', (
    select jsonb_build_object(
      'week_of',p.week_of,
      'release_at',p.week_of::timestamp at time zone 'America/Chicago',
      'spotlight',p.nfl_spotlight,
      'game',p.nfl_game_of_week,
      'breakdown',p.production->'nfl'->'breakdown')
    from public.football_weekly_content_packages p
    where p.production->'nfl'->>'ready_at' is not null
      and p.nfl_spotlight is not null and p.nfl_game_of_week is not null
      and (p.week_of::timestamp at time zone 'America/Chicago') <= p_as_of
    order by p.week_of desc limit 1
  )
);
$$;
revoke all on function public.live_football_weekly_editorial_at(timestamptz) from public, anon, authenticated;
grant execute on function public.live_football_weekly_editorial_at(timestamptz) to service_role;

create or replace function public.get_live_football_weekly_editorial()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select public.live_football_weekly_editorial_at(now());
$$;
revoke all on function public.get_live_football_weekly_editorial() from public;
grant execute on function public.get_live_football_weekly_editorial() to anon, authenticated;

-- Cron is the audit/status reconciliation mechanism, not the activation clock:
-- the public projection above becomes eligible at exactly the Tuesday boundary.
create or replace function public.finalize_football_weekly_publication()
returns integer language plpgsql security definer set search_path = ''
as $$
declare v_count integer;
begin
  with eligible as (
    select p.week_of from public.football_weekly_content_packages p
    where p.week_of::timestamp at time zone 'America/Chicago' <= now()
      and ((p.production->'cfb'->>'ready_at' is not null
             and p.production->'cfb'->>'published_at' is null)
        or (p.production->'nfl'->>'ready_at' is not null
             and p.production->'nfl'->>'published_at' is null))
    for update
  )
  update public.football_weekly_content_packages p
  set production =
        case when p.production->'cfb'->>'ready_at' is not null then
          jsonb_set(p.production, '{cfb,published_at}',
            to_jsonb(coalesce((p.production->'cfb'->>'published_at')::timestamptz, now())),true)
        else p.production end,
      updated_at=now()
  where p.week_of in (select e.week_of from eligible);
  -- Set the other sport in a separate pass; armed sport content remains unchanged.
  update public.football_weekly_content_packages p
  set production = jsonb_set(p.production,'{nfl,published_at}',to_jsonb(now()),true),
      updated_at = now()
  where p.week_of::timestamp at time zone 'America/Chicago' <= now()
    and p.production->'nfl'->>'ready_at' is not null
    and p.production->'nfl'->>'published_at' is null;

  update public.football_weekly_content_packages p
  set status='published',
      published_at=coalesce(p.published_at,now()),
      updated_at=now()
  where p.status='ready'
    and p.week_of::timestamp at time zone 'America/Chicago' <= now()
    and p.production->'cfb'->>'published_at' is not null
    and p.production->'nfl'->>'published_at' is not null;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.finalize_football_weekly_publication() from public, anon, authenticated;
-- Do not expose a browser or arbitrary service endpoint for the cron reconciliation.
select cron.schedule(
  'octagon-hq-football-editorial-publish',
  '* * * * *',
  'select public.finalize_football_weekly_publication()'
);
-- On Monday night Central, verify newly deployed ESPN/WebP binaries using the
-- existing DB-owned scheduler token. UTC covers both 22:00–23:59 CDT and CST.
-- This is deliberately only 36 five-minute checks per week, not a 24/7 poll.
select cron.schedule(
  'octagon-hq-football-editorial-verify-assets',
  '*/5 3-5 * * 2',
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

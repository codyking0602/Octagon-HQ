-- Draft only: sport-specific Web Push choices on top of the canonical in-app inbox.
-- Do not use the legacy notification_preferences flags: they intentionally stay enabled
-- so disabling a sport's phone alerts never hides its bell notifications.
-- New profiles begin with all sport pushes off; current active subscriptions keep\n-- legacy UFC/Football/MLB delivery until the member explicitly changes their choices.
create table if not exists private.notification_push_sports (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  ufc boolean not null default false,
  football boolean not null default false,
  mlb boolean not null default false,
  nba boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Preserve established delivery choices of already-connected members. This runs
-- only once in the new migration; there is no automatic retroactive opt-in.
insert into private.notification_push_sports(profile_id,ufc,football,mlb,nba)
select distinct subscription.profile_id,true,true,true,false
from private.notification_push_subscriptions subscription
where subscription.enabled
on conflict (profile_id) do nothing;

alter table private.notification_push_sports enable row level security;
revoke all on private.notification_push_sports from public, anon, authenticated;

create or replace function public.get_my_notification_push_sports()
returns jsonb language plpgsql stable security definer set search_path = ''
as $fn$
declare
  v_id uuid := auth.uid();
  v_row private.notification_push_sports;
begin
  if v_id is null then raise exception 'sign in required'; end if;
  select * into v_row from private.notification_push_sports where profile_id = v_id;
  return jsonb_build_object(
    'ufc',coalesce(v_row.ufc,false),
    'football',coalesce(v_row.football,false),
    'mlb',coalesce(v_row.mlb,false),
    'nba',coalesce(v_row.nba,false)
  );
end;
$fn$;

create or replace function public.set_my_notification_push_sports(
  p_ufc boolean, p_football boolean, p_mlb boolean, p_nba boolean
)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $fn$
declare
  v_id uuid := auth.uid();
begin
  if v_id is null then raise exception 'sign in required'; end if;
  if p_ufc is null or p_football is null or p_mlb is null or p_nba is null then
    raise exception 'sport preferences must be explicit booleans';
  end if;
  insert into private.notification_push_sports(profile_id,ufc,football,mlb,nba)
  values (v_id,p_ufc,p_football,p_mlb,p_nba)
  on conflict (profile_id) do update
    set ufc = excluded.ufc,
        football = excluded.football,
        mlb = excluded.mlb,
        nba = excluded.nba,
        updated_at = now();
  return public.get_my_notification_push_sports();
end;
$fn$;

revoke all on function public.get_my_notification_push_sports() from public, anon;
revoke all on function public.set_my_notification_push_sports(boolean,boolean,boolean,boolean) from public, anon;
grant execute on function public.get_my_notification_push_sports() to authenticated;
grant execute on function public.set_my_notification_push_sports(boolean,boolean,boolean,boolean) to authenticated;

-- The exact push sport is resolved server-side from the canonical event kind and
-- route. A combined Daily event has multiple members and is the only exception
-- where the existing server-authored message is inspected. New ambiguous sport
-- kinds fail closed for push; their in-app copies remain untouched.
create or replace function private.notification_push_scope(
  p_kind text, p_route text, p_aggregation_key text, p_summary text
)
returns text[] language plpgsql stable set search_path = ''
as $fn$
declare
  v_route text := coalesce(p_route,'');
  v_path text := split_part(coalesce(p_route,''),'?',1);
  v_text text := upper(coalesce(p_summary,''));
  v_sports text[] := array[]::text[];
begin
  if p_aggregation_key = 'daily-closing-combined'
    and v_route = '/'
  then
    if v_text ~ '(^|[^A-Z])UFC([^A-Z]|$)' then v_sports := array_append(v_sports,'ufc'); end if;
    if v_text ~ '(^|[^A-Z])FOOTBALL([^A-Z]|$)' then v_sports := array_append(v_sports,'football'); end if;
    if v_text ~ '(^|[^A-Z])MLB([^A-Z]|$)' then v_sports := array_append(v_sports,'mlb'); end if;
    if v_text ~ '(^|[^A-Z])NBA([^A-Z]|$)' then v_sports := array_append(v_sports,'nba'); end if;
    return v_sports;
  end if;

  -- Owner-only monitoring warnings are universal operational alerts, not fan sport pushes.
  if p_kind in (
    'card_change_detected','fighter_replacement_detected','fight_cancellation_detected',
    'fight_order_changed','fight_moved_off_card','published_card_mismatch',
    'event_draft_ready','picks_card_missing','odds_match_failed',
    'monitoring_repeatedly_failed','provider_quota_low','all_results_entered',
    'event_ready_to_complete','post_lock_correction_review'
  ) then return array['universal']; end if;

  if v_path ~ '^/football(/|$)' then return array['football']; end if;
  if v_path ~ '^/mlb(/|$)' then return array['mlb']; end if;
  if v_path ~ '^/nba(/|$)'
    or v_path ~ '^/championship/nba(/|$)'
    or v_route like '/?hq-reveal=basketball-%'
  then return array['nba']; end if;
  if v_path ~ '^/(picks|play|rankings|intelligence)(/|$)'
    or v_path ~ '^/(fighters-to-watch|fight-night)(/|$)'
  then return array['ufc']; end if;

  if p_kind in ('war_room_mention','war_room_reply','war_room_invite_accepted')
    then return array['universal']; end if;

  if p_kind = 'football_picks_open' then return array['football']; end if;
  if p_kind like 'mlb_%' then return array['mlb']; end if;
  if p_kind like 'nba_%' then return array['nba']; end if;
  if p_kind in (
    'picks_repick_required','picks_fight_cancelled','picks_incomplete_near_lock',
    'picks_recap_ready','picks_season_result_changed','picks_card_updated',
    'ufc_event_starting','ranking_refresh_available','fighter_watchlist_added',
    'card_change_detected','fighter_replacement_detected','fight_cancellation_detected',
    'fight_order_changed','fight_moved_off_card','published_card_mismatch',
    'event_draft_ready','picks_card_missing','odds_match_failed',
    'monitoring_repeatedly_failed','provider_quota_low','all_results_entered',
    'event_ready_to_complete','post_lock_correction_review'
  ) then return array['ufc']; end if;

  -- No safe sport attribution for a generic route. Do not leak another sport's
  -- content through phone push merely because its kind is labelled generic.
  return array[]::text[];
end;
$fn$;

create or replace function private.notification_push_selection(
  p_profile_id uuid, p_kind text, p_route text, p_aggregation_key text, p_summary text
)
returns jsonb language plpgsql stable security definer set search_path = ''
as $fn$
declare
  v_sports text[] := private.notification_push_scope(p_kind,p_route,p_aggregation_key,p_summary);
  v_selected text[] := array[]::text[];
  v_prefs private.notification_push_sports;
  v_name text;
  v_names text;
  v_summary text := p_summary;
begin
  -- Owner-only control and monitoring actions remain critical independent of
  -- entertainment sport choices, matching the existing always-on contract.
  if private.notification_category_for_kind(p_kind) = 'operations' then
    return jsonb_build_object('allowed',true,'summary',coalesce(p_summary,''));
  end if;

  select * into v_prefs from private.notification_push_sports where profile_id = p_profile_id;

  if 'universal' = any(v_sports) then
    return jsonb_build_object('allowed',true,'summary',coalesce(p_summary,''));
  end if;

  if 'ufc' = any(v_sports) and coalesce(v_prefs.ufc,false) then
    v_selected := array_append(v_selected,'UFC');
  end if;
  if 'football' = any(v_sports) and coalesce(v_prefs.football,false) then
    v_selected := array_append(v_selected,'Football');
  end if;
  if 'mlb' = any(v_sports) and coalesce(v_prefs.mlb,false) then
    v_selected := array_append(v_selected,'MLB');
  end if;
  if 'nba' = any(v_sports) and coalesce(v_prefs.nba,false) then
    v_selected := array_append(v_selected,'NBA');
  end if;

  if cardinality(v_selected) = 0 then
    return jsonb_build_object('allowed',false,'summary','');
  end if;

  -- A combined push must NEVER mention a muted sport. The original single
  -- in-app group continues to show all unfinished challenges.
  if p_aggregation_key = 'daily-closing-combined'
    and p_route = '/'
    and cardinality(v_selected) < cardinality(v_sports)
  then
    if cardinality(v_selected) = 1 then
      v_summary := 'Your ' || v_selected[1]
        || ' challenge closes at midnight Central. Play it before the next challenge goes live.';
    else
      v_names := array_to_string(v_selected[1:cardinality(v_selected)-1], ', ')
        || ' and ' || v_selected[cardinality(v_selected)];
      v_summary := 'Your ' || v_names
        || ' challenges close at midnight Central. Play them before the next challenges go live.';
    end if;
  end if;
  return jsonb_build_object('allowed',true,'summary',v_summary);
end;
$fn$;

revoke all on function private.notification_push_scope(text,text,text,text) from public, anon, authenticated;
revoke all on function private.notification_push_selection(uuid,text,text,text,text) from public, anon, authenticated;

-- NBA notification kinds and classifications are defined once in migration 202612310327.

-- Recheck immediately before each delivery claim: revocation must be enforced on
-- the server, including stale subscriptions, trigger retries and disabled sports.
-- Do not change the canonical notification/event row or in-app unread state.
create or replace function public.claim_notification_push_delivery(p_notification_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $fn$
declare
  v_notification private.notification_groups;
  v_subscription private.notification_push_subscriptions;
  v_delivery_id uuid;
  v_deliveries jsonb := '[]'::jsonb;
  v_selection jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to claim push delivery';
  end if;

  select notification.* into v_notification from private.notification_groups notification
  where notification.id = p_notification_id;
  if not found or v_notification.priority <> 'push_candidate'
    or v_notification.read_at is not null
  then return jsonb_build_object('notification',null,'deliveries','[]'::jsonb); end if;

  v_selection := private.notification_push_selection(
    v_notification.recipient_profile_id,v_notification.kind,v_notification.route,
    v_notification.aggregation_key,v_notification.summary
  );
  if not coalesce((v_selection->>'allowed')::boolean,false) then
    return jsonb_build_object('notification',null,'deliveries','[]'::jsonb);
  end if;

  for v_subscription in
    select subscription.* from private.notification_push_subscriptions subscription
    where subscription.profile_id = v_notification.recipient_profile_id
      and subscription.enabled
    order by subscription.created_at,subscription.id
  loop
    v_delivery_id := null;
    insert into private.notification_push_deliveries (
      notification_id,subscription_id,notification_version,status,claimed_at
    ) values (
      v_notification.id,v_subscription.id,v_notification.latest_event_at,'claimed',now()
    )
    on conflict (notification_id,subscription_id,notification_version) do nothing
    returning id into v_delivery_id;
    if v_delivery_id is not null then
      v_deliveries := v_deliveries || jsonb_build_array(jsonb_build_object(
        'delivery_id',v_delivery_id,'subscription_id',v_subscription.id,
        'endpoint',v_subscription.endpoint,'p256dh',v_subscription.p256dh,
        'auth',v_subscription.auth_secret
      ));
    end if;
  end loop;

  return jsonb_build_object(
    'notification',jsonb_build_object(
      'id',v_notification.id,'title',v_notification.title,
      'summary',v_selection->>'summary',
      'route',coalesce(v_notification.route,'/notifications'),
      'category',v_notification.category,'kind',v_notification.kind,
      'aggregate_count',v_notification.aggregate_count,
      'latest_event_at',v_notification.latest_event_at
    ),
    'deliveries',v_deliveries
  );
end;
$fn$;

-- Skip the network wake-up when no selected sport will actually receive a push.
create or replace function private.enqueue_notification_push_delivery()
returns trigger language plpgsql security definer set search_path = ''
as $fn$
declare
  v_selection jsonb;
begin
  if new.priority <> 'push_candidate' or new.read_at is not null then return null; end if;
  if tg_op = 'UPDATE' then
    if new.latest_event_at is not distinct from old.latest_event_at
      and new.aggregate_count is not distinct from old.aggregate_count then
      return null;
    end if;
  end if;
  v_selection := private.notification_push_selection(
    new.recipient_profile_id,new.kind,new.route,new.aggregation_key,new.summary
  );
  if not coalesce((v_selection->>'allowed')::boolean,false) then return null; end if;
  if not exists (
    select 1 from private.notification_push_subscriptions subscription
    where subscription.profile_id = new.recipient_profile_id and subscription.enabled
  ) then return null; end if;

  perform net.http_post(
    url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/deliver-notification-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-octagon-push-token',(
        select secret.decrypted_secret from vault.decrypted_secrets secret
        where secret.name = 'octagon_notification_push_delivery_token'
      )
    ),
    body := jsonb_build_object('mode','deliver','notification_id',new.id),
    timeout_milliseconds := 10000
  );
  return null;
end;
$fn$;

revoke all on function public.claim_notification_push_delivery(uuid) from public, anon, authenticated;
grant execute on function public.claim_notification_push_delivery(uuid) to service_role;
revoke all on function private.enqueue_notification_push_delivery() from public, anon, authenticated;

comment on table private.notification_push_sports is
  'Private account-level Web Push sport choices; the in-app inbox never uses this table.';
notify pgrst, 'reload schema';

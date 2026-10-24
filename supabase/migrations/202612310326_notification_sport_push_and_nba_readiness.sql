-- DRAFT ONLY: personal sport push choices, NBA-capable notification kinds.
-- Keep the existing in-app feed, publisher, service worker and delivery worker.
-- Never deploy this without exact-head backend tests and an approved merge.

create table if not exists private.notification_push_sport_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  ufc boolean not null default true,
  football boolean not null default true,
  mlb boolean not null default true,
  nba boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table private.notification_push_sport_preferences enable row level security;
revoke all on private.notification_push_sport_preferences from public, anon, authenticated;

create or replace function public.get_my_notification_push_sports()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $function$
declare
  v_profile uuid := auth.uid();
  v_settings private.notification_push_sport_preferences;
begin
  if v_profile is null or not exists (select 1 from public.profiles where id = v_profile) then
    raise exception 'sign in required';
  end if;
  select * into v_settings
  from private.notification_push_sport_preferences
  where profile_id = v_profile;
  return jsonb_build_object(
    'ufc', coalesce(v_settings.ufc, true),
    'football', coalesce(v_settings.football, true),
    'mlb', coalesce(v_settings.mlb, true),
    'nba', coalesce(v_settings.nba, false)
  );
end;
$function$;

create or replace function public.set_my_notification_push_sports(
  p_ufc boolean, p_football boolean, p_mlb boolean, p_nba boolean
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $function$
declare
  v_profile uuid := auth.uid();
begin
  if v_profile is null or not exists (select 1 from public.profiles where id = v_profile) then
    raise exception 'sign in required';
  end if;
  if p_ufc is null or p_football is null or p_mlb is null or p_nba is null then
    raise exception 'all sport push settings are required';
  end if;
  insert into private.notification_push_sport_preferences
    (profile_id, ufc, football, mlb, nba, updated_at)
  values (v_profile, p_ufc, p_football, p_mlb, p_nba, now())
  on conflict (profile_id) do update
  set ufc = excluded.ufc,
      football = excluded.football,
      mlb = excluded.mlb,
      nba = excluded.nba,
      updated_at = now();
  return public.get_my_notification_push_sports();
end;
$function$;

revoke all on function public.get_my_notification_push_sports() from public, anon, authenticated;
revoke all on function public.set_my_notification_push_sports(boolean,boolean,boolean,boolean) from public, anon, authenticated;
grant execute on function public.get_my_notification_push_sports() to authenticated;
grant execute on function public.set_my_notification_push_sports(boolean,boolean,boolean,boolean) to authenticated;

-- Classify delivery from existing routes and kinds without altering producer or inbox storage.
-- For combined closing reminders, inspect the text of the canonical aggregated group.
create or replace function private.notification_push_sports_for_group(
  p_kind text, p_route text, p_aggregation_key text, p_title text, p_summary text
)
returns text[]
language plpgsql immutable
set search_path = ''
as $function$
declare
  v_route text := coalesce(p_route, '');
  v_copy text := coalesce(p_title, '') || ' ' || coalesce(p_summary, '');
  v_sports text[] := array[]::text[];
begin
  if p_aggregation_key = 'daily-closing-combined' then
    if v_copy ~* '\mUFC\M' then v_sports := array_append(v_sports, 'ufc'); end if;
    if v_copy ~* '\mFootball\M' then v_sports := array_append(v_sports, 'football'); end if;
    if v_copy ~* '\mMLB\M' then v_sports := array_append(v_sports, 'mlb'); end if;
    if v_copy ~* '\mNBA\M' then v_sports := array_append(v_sports, 'nba'); end if;
    return v_sports;
  end if;
  if v_route ~ '^/(football)(/|$|\\?)' or p_kind = 'football_picks_open' then
    return array['football']::text[];
  end if;
  if v_route ~ '^/(nba)(/|$|\\?)' or v_route ~ '^/championship/nba(/|$|\\?)'
    or p_kind like 'nba_%' then
    return array['nba']::text[];
  end if;
  if v_route ~ '^/(mlb)(/|$|\\?)' or p_kind like 'mlb_%' then
    return array['mlb']::text[];
  end if;
  if v_route ~ '^/(picks|play|rankings|intelligence|fighters-to-watch)(/|$|\\?)'
    or p_kind in (
      'picks_repick_required', 'picks_fight_cancelled', 'picks_incomplete_near_lock',
      'picks_recap_ready', 'picks_season_result_changed', 'picks_card_updated',
      'ufc_event_starting', 'ranking_refresh_available', 'fighter_watchlist_added'
    ) then
    return array['ufc']::text[];
  end if;
  -- Root-routed announcements may be sport-specific; avoid treating them as
  -- universal simply because their destination is the Home sport selector.
  if v_copy ~* '\mUFC\M' then v_sports := array_append(v_sports, 'ufc'); end if;
  if v_copy ~* '\m(Football|NFL|CFB)\M' then v_sports := array_append(v_sports, 'football'); end if;
  if v_copy ~* '\m(MLB|Baseball)\M' then v_sports := array_append(v_sports, 'mlb'); end if;
  if v_copy ~* '\m(NBA|Basketball)\M' then v_sports := array_append(v_sports, 'nba'); end if;
  return v_sports;
end;
$function$;
revoke all on function private.notification_push_sports_for_group(text,text,text,text,text)
  from public, anon, authenticated;

-- Add dormant NBA kinds; producer scheduling remains held behind NBA launch gates.
alter table private.notification_groups
  drop constraint if exists notification_groups_kind_valid;

alter table private.notification_groups
  add constraint notification_groups_kind_valid check (kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready',
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'nba_launch_available',
    'nba_daily_available',
    'nba_daily_four_hours',
    'nba_results_ready',
    'mlb_launch_available',
    'mlb_challenge_available',
    'mlb_challenge_four_hours',
    'mlb_round_available',
    'mlb_round_recap',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'ranking_refresh_available',
    'fighter_watchlist_added',
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ));

create or replace function private.notification_category_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring'
  ) then
    return 'social';
  end if;

  if v_kind in (
    'auction_action_required',
    'auction_result_ready',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'mlb_launch_available',
    'mlb_challenge_available',
    'mlb_challenge_four_hours',
    'nba_launch_available',
    'nba_daily_available',
    'nba_daily_four_hours',
    'nba_results_ready'
  ) then
    return 'games';
  end if;

  if v_kind in ('ranking_refresh_available', 'fighter_watchlist_added') then
    return 'rankings';
  end if;

  if v_kind in (
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'mlb_round_available',
    'mlb_round_recap'
  ) then
    return 'picks';
  end if;

  if v_kind in (
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ) then
    return 'operations';
  end if;

  raise exception 'unsupported notification kind: %', v_kind;
end;
$$;

create or replace function private.notification_priority_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if private.notification_category_for_kind(v_kind) = 'operations'
    or v_kind in (
      'war_room_mention',
      'war_room_reply',
      'game_challenge_received',
      'auction_action_required',
      'auction_result_ready',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'picks_card_updated',
      'ufc_event_starting',
      'football_picks_open',
      'new_game_available',
      'daily_challenge_four_hours',
      'mlb_launch_available',
      'mlb_challenge_available',
      'mlb_challenge_four_hours',
      'mlb_round_available',
      'nba_launch_available',
      'nba_daily_available',
      'nba_daily_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

-- The existing delivery claim is the one authoritative gate: suppressed
-- push never reaches a device endpoint or creates a delivery claim.
create or replace function public.claim_notification_push_delivery(p_notification_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification private.notification_groups;
  v_subscription private.notification_push_subscriptions;
  v_delivery_id uuid;
  v_deliveries jsonb := '[]'::jsonb;
  v_pref private.notification_push_sport_preferences;
  v_sports text[];
  v_visible_sports text[] := array[]::text[];
  v_sport text;
  v_push_title text;
  v_push_summary text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to claim push delivery';
  end if;

  select notification.* into v_notification
  from private.notification_groups notification
  where notification.id = p_notification_id;

  if not found
    or v_notification.priority <> 'push_candidate'
    or v_notification.read_at is not null
  then
    return jsonb_build_object('notification', null, 'deliveries', '[]'::jsonb);
  end if;

  v_push_title := v_notification.title;
  v_push_summary := v_notification.summary;
  v_sports := private.notification_push_sports_for_group(
    v_notification.kind, v_notification.route, v_notification.aggregation_key,
    v_notification.title, v_notification.summary
  );

  -- Member choices govern phone push only; the canonical in-app group stays intact.
  -- Owner-only operational notifications remain critical and unfiltered.
  if v_notification.category <> 'operations' then
    select * into v_pref
    from private.notification_push_sport_preferences
    where profile_id = v_notification.recipient_profile_id;

    foreach v_sport in array v_sports loop
      if case v_sport
        when 'ufc' then coalesce(v_pref.ufc, true)
        when 'football' then coalesce(v_pref.football, true)
        when 'mlb' then coalesce(v_pref.mlb, true)
        when 'nba' then coalesce(v_pref.nba, false)
        else false end
      then
        v_visible_sports := array_append(v_visible_sports, v_sport);
      end if;
    end loop;

    -- Mixed-sport reminders must never mention a muted sport on the device.
    if cardinality(v_sports) > 0 and cardinality(v_visible_sports) = 0 then
      return jsonb_build_object('notification', null, 'deliveries', '[]'::jsonb);
    end if;
    if v_notification.aggregation_key = 'daily-closing-combined' then
      if cardinality(v_sports) = 0 then
        -- Fail closed when a legacy mixed-sport reminder cannot be classified.
        return jsonb_build_object('notification', null, 'deliveries', '[]'::jsonb);
      end if;
      if cardinality(v_visible_sports) <> cardinality(v_sports) then
        v_push_title := 'Daily challenges close soon';
        v_push_summary := 'Your ' || array_to_string(
          array(select case sport
            when 'ufc' then 'UFC'
            when 'football' then 'Football'
            when 'mlb' then 'MLB'
            else 'NBA' end
            from unnest(v_visible_sports) sport), ' and '
        ) || case when cardinality(v_visible_sports) = 1
          then ' challenge closes at midnight Central.'
          else ' challenges close at midnight Central.' end;
      end if;
    end if;
  end if;

  for v_subscription in
    select subscription.*
    from private.notification_push_subscriptions subscription
    where subscription.profile_id = v_notification.recipient_profile_id
      and subscription.enabled
    order by subscription.created_at, subscription.id
  loop
    v_delivery_id := null;
    insert into private.notification_push_deliveries (
      notification_id,
      subscription_id,
      notification_version,
      status,
      claimed_at
    ) values (
      v_notification.id,
      v_subscription.id,
      v_notification.latest_event_at,
      'claimed',
      now()
    )
    on conflict (notification_id, subscription_id, notification_version) do nothing
    returning id into v_delivery_id;

    if v_delivery_id is not null then
      v_deliveries := v_deliveries || jsonb_build_array(jsonb_build_object(
        'delivery_id', v_delivery_id,
        'subscription_id', v_subscription.id,
        'endpoint', v_subscription.endpoint,
        'p256dh', v_subscription.p256dh,
        'auth', v_subscription.auth_secret
      ));
    end if;
  end loop;

  return jsonb_build_object(
    'notification', jsonb_build_object(
      'id', v_notification.id,
      'title', v_push_title,
      'summary', v_push_summary,
      'route', coalesce(v_notification.route, '/notifications'),
      'category', v_notification.category,
      'kind', v_notification.kind,
      'aggregate_count', v_notification.aggregate_count,
      'latest_event_at', v_notification.latest_event_at
    ),
    'deliveries', v_deliveries
  );
end;
$$;

revoke all on function public.claim_notification_push_delivery(uuid) from public, anon, authenticated;
grant execute on function public.claim_notification_push_delivery(uuid) to service_role;

comment on table private.notification_push_sport_preferences is
  'Private account-level UFC, Football, MLB, NBA device-push preferences; the in-app inbox is unaffected.';
notify pgrst, 'reload schema';

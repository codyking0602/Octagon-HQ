-- MANUAL, ONE TIME ONLY: NBA launch phone push catch-up for legacy subscribers.
-- Never apply as a migration or cron; never rerun the original NBA launch publisher.
-- Existing in-app events are reused. This script creates NO notification_events
-- or notification_groups and must not change any delivery recorded as sent.
-- It only upgrades NBA=false records seeded by the original Oct 24 migration;
-- any profile that changed preferences after migration is excluded.
begin;

select pg_advisory_xact_lock(20261029, 2026);

create temporary table nba_launch_catchup_targets on commit drop as
select distinct pref.profile_id, event.group_id
from private.notification_push_sports pref
join public.profiles profile on profile.id = pref.profile_id
join private.profile_pin_credentials pin on pin.profile_id = pref.profile_id
join private.notification_events event
  on event.recipient_profile_id = pref.profile_id
 and event.source_key = 'hq:nba:games-cup-public-launch:2026'
join private.notification_groups notification on notification.id = event.group_id
where pref.nba = false
  and pref.ufc and pref.football and pref.mlb
  and pref.updated_at = timestamptz '2026-10-24 21:00:40.626566+00'
  and upper(trim(coalesce(profile.display_name,''))) not in ('TEST','TEST2')
  and notification.kind = 'nba_launch_available'
  and notification.priority = 'push_candidate'
  and notification.route = '/?hq-reveal=basketball-2026'
  and notification.read_at is null
  and notification.dismissed_at is null
  and exists (
    select 1 from private.notification_push_subscriptions subscription
    where subscription.profile_id = pref.profile_id and subscription.enabled
  )
  and not exists (
    select 1 from private.notification_push_deliveries delivery
    where delivery.notification_id = event.group_id
  );

do $guard$
declare
  v_target_count integer;
  v_device_count integer;
  v_existing_event_count integer;
begin
  if not exists (
    select 1 from private.notification_nba_release_gate
    where singleton and public_enabled
  ) then raise exception 'NBA closing and launch notification gate is not enabled'; end if;
  if not exists (
    select 1 from private.daily_challenge_schedule_versions
    where version = 'nba-daily-regular-v3-oct30-public'
      and sport = 'nba' and anchor_day = date '2026-10-30'
  ) then raise exception 'Official NBA public schedule missing'; end if;
  select count(*) into v_existing_event_count
  from private.notification_events
  where source_key = 'hq:nba:games-cup-public-launch:2026';
  if v_existing_event_count <> 13 then
    raise exception 'Original NBA launch recipient count changed: %',v_existing_event_count;
  end if;
  select count(*) into v_target_count from pg_temp.nba_launch_catchup_targets;
  select count(*) into v_device_count
  from private.notification_push_subscriptions subscription
  join pg_temp.nba_launch_catchup_targets target
    on target.profile_id = subscription.profile_id
  where subscription.enabled;
  if v_target_count <> 5 or v_device_count <> 9 then
    raise exception 'Expected 5 untouched legacy profiles and 9 devices; found % profiles, % devices',
      v_target_count, v_device_count;
  end if;
  if exists (
    select 1 from pg_temp.nba_launch_catchup_targets
    group by profile_id having count(*) <> 1
  ) then raise exception 'Duplicate source event found for a catch-up recipient'; end if;
end;
$guard$;

update private.notification_push_sports pref
set nba = true, updated_at = clock_timestamp()
from pg_temp.nba_launch_catchup_targets target
where pref.profile_id = target.profile_id
  and pref.nba = false
  and pref.ufc and pref.football and pref.mlb
  and pref.updated_at = timestamptz '2026-10-24 21:00:40.626566+00';

do $verify$
declare v_confirmed integer;
begin
  select count(*) into v_confirmed
  from private.notification_push_sports pref
  join pg_temp.nba_launch_catchup_targets target on target.profile_id = pref.profile_id
  where pref.nba = true
    and pref.updated_at > timestamptz '2026-10-24 21:00:40.626566+00';
  if v_confirmed <> 5 then
    raise exception 'Catch-up preference update race: % of 5 profiles upgraded',v_confirmed;
  end if;
end;
$verify$;

-- Reuse the already-created, unread announcement groups. The existing Edge
-- service rechecks the NBA preference at claim time and enforces the unique
-- notification/subscription/version key. No new inbox event is created.
create temporary table nba_launch_catchup_requests (
  notification_id uuid primary key,
  request_id bigint
) on commit drop;

insert into pg_temp.nba_launch_catchup_requests(notification_id,request_id)
select target.group_id,
  net.http_post(
    url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/deliver-notification-push',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-octagon-push-token',(
        select secret.decrypted_secret from vault.decrypted_secrets secret
        where secret.name = 'octagon_notification_push_delivery_token'
      )
    ),
    body := jsonb_build_object('mode','deliver','notification_id',target.group_id),
    timeout_milliseconds := 10000
  )
from pg_temp.nba_launch_catchup_targets target;

select (select count(*) from pg_temp.nba_launch_catchup_targets) as members_nba_enabled,
  (select count(*) from pg_temp.nba_launch_catchup_requests) as existing_notifications_requeued,
  (select count(*) from private.notification_events
     where source_key='hq:nba:games-cup-public-launch:2026') as original_announcement_events_preserved;

commit;

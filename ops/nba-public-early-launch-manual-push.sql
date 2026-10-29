-- MANUAL GO-LIVE ONLY. NOT a migration, cron job, or automatic deployment.
-- Do NOT execute until:
-- 1. Cup public RPC and NBA Daily backend migration are applied and verified,
-- 2. exact production frontend + Edge runtime are live and tested on a non-owner PIN member,
-- 3. owner explicitly says GO LIVE and the current local date is confirmed.
--
-- Sends one in-app launch event per eligible PIN member, with push delivery
-- respecting each member's NBA sport/device notification preferences.
-- Unique source key prevents duplicates if this script is rerun.
begin;

do $guard$
begin
  if not exists (
    select 1 from private.daily_challenge_schedule_versions
    where version='nba-daily-regular-v3-oct30-public'
      and sport='nba' and anchor_day=date '2026-10-30'
  ) then
    raise exception 'NBA public 48-hour schedule has not been deployed';
  end if;
  if not exists (
    select 1 from private.notification_nba_release_gate where singleton
  ) then
    raise exception 'NBA notification release gate is missing';
  end if;
end $guard$;

-- Enables regular NBA closing reminders only AFTER the full public release.
update private.notification_nba_release_gate set public_enabled=true
where singleton;

with recipients as (
  select distinct profile.id
  from public.profiles profile
  join private.profile_pin_credentials credential
    on credential.profile_id=profile.id
), emitted as (
  select profile.id,
    private.publish_notification_to_profile(
      profile.id,
      'hq:nba:games-cup-public-launch:2026',
      'hq:nba:games-cup-public-launch:2026',
      'nba_launch_available',
      'NBA is live in The HQ',
      'NBA Play and Cup Picks have arrived. See what is new in Basketball HQ.',
      '/?hq-reveal=basketball-2026',
      'EXPLORE NBA',
      now()
    ) as result
  from recipients profile
)
select count(*) as eligible_members,
  count(*) filter(where coalesce((result->>'created')::boolean,false)) as newly_notified,
  count(*) filter(where not coalesce((result->>'created')::boolean,false)) as previously_notified
from emitted;

commit;

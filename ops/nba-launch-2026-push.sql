-- RUN ONCE only AFTER the Basketball public frontend and NBA backend pass
-- live production verification. Idempotent per member thanks to source_key.
-- This is NOT a migration: deployment must not emit the announcement early.
--
-- Title:   A New Era Begins.
-- Summary: The HQ is entering a new chapter. See what just arrived.
-- URL:     /?hq-reveal=basketball-2026 (shows the poster before the explainer)
--
-- One notification per member with PIN credentials, like the canonical MLB launch.
-- Existing new_game_available kind is generic, push-eligible, and doesn't spoil NBA
-- in the notification's category or visible label.
with recipients as (
  select profile.id
  from public.profiles profile
  join private.profile_pin_credentials credential on credential.profile_id = profile.id
), created as (
  select profile.id, private.publish_notification_to_profile(
    profile.id,
    'hq:basketball:launch:2026',
    'hq:basketball:launch:2026',
    'new_game_available',
    'A New Era Begins.',
    'The HQ is entering a new chapter. See what just arrived.',
    '/?hq-reveal=basketball-2026',
    'SEE THE REVEAL',
    now()
  ) as outcome
  from recipients profile
)
select
  count(*) as eligible_members,
  count(*) filter (where coalesce((outcome->>'created')::boolean,false)) as newly_notified,
  count(*) filter (where not coalesce((outcome->>'created')::boolean,false)) as already_notified
from created;

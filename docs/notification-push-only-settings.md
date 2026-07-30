# Push-Only Notification Settings

## Product split

The notification bell and device push are separate behaviors:

- The bell is the permanent in-app list for personal updates, reminders, and actions.
- Push notifications are optional phone alerts that can arrive while Octagon HQ is closed.

Turning push notifications off never removes, suppresses, or hides an item from the bell.

## Visible settings

The Notifications screen owns only the feed, unread state, and read actions. It does not contain category toggles or device setup.

The signed-in member's own Profile contains one setting:

- **Push notifications — On / Off**

No Picks, Daily Challenge, game-challenge, or War Room category switches are exposed.

## Initial state

Before the member requests permission or attempts a connection, the profile setting reads **Off**, not **Needs retry**. A retry state appears only after a real connection attempt fails.

## Ownership

- `private.publish_notification_to_profile(...)` remains the only in-app notification publisher and aggregation owner.
- The compatibility preference evaluator always permits bell publication.
- Per-device push subscriptions remain the only push on/off owner.
- No second inbox, scheduler, polling loop, local-storage fallback, or notification provider is added.

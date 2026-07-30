# Notification Preferences and Push Readiness

## Three-PR finish plan

This is PR 2 of the final notification sequence:

1. Remaining in-app producers — merged in PR #138.
2. **Preferences and push readiness — this PR.**
3. Actual device push registration and delivery — final PR.

The notification bell and private in-app center remain the one delivery product. This PR does not create another inbox, provider, scheduler, polling loop, or browser-storage owner.

## Member preferences

Four optional controls are stored privately on the signed-in profile and follow the member across devices:

- **Picks reminders** — incomplete-near-lock and event-start timing.
- **Daily Challenge** — the four-hours-left Find the Leader reminder.
- **Game challenges** — received, accepted, result-ready, and expiry activity.
- **War Room activity** — mentions, direct replies, and invite acceptance.

A profile with no saved row receives all four defaults as enabled. Each save writes the complete preference set through authenticated RPCs. The browser never reads or writes the private table directly and does not keep a local-storage fallback.

## Critical actions stay on

Optional preferences never suppress:

- required repicks;
- selected-fight cancellations;
- Picks recap and completed-result corrections;
- account or identity actions;
- Cody-only monitoring and Fight Night Control operations.

The settings screen labels this class **Always on** rather than displaying a misleading disabled switch.

## Canonical delivery eligibility

`private.publish_notification_to_profile(...)` remains the sole notification aggregation, idempotency, read-state, and unread-count owner.

For a new source event, that publisher evaluates the recipient's optional preference before creating the canonical source event or group update. Suppressed optional activity creates no event and therefore cannot appear later as a duplicate. Existing source keys still resolve through the established idempotency path first.

There is no retroactive delivery when a preference is re-enabled. Only future producer events are eligible.

## Device readiness

The notification page now reports whether the current browser can support the final push connection:

- secure-context availability;
- Notifications API support;
- Service Worker support;
- Push API support;
- service-worker registration readiness;
- browser versus installed-app mode;
- current browser notification permission;
- install-prompt availability when the browser exposes one.

Octagon HQ publishes a web app manifest and a minimal readiness service worker. The service worker only installs and claims the app scope. It does not handle push messages, show notifications, cache application routes, or register a device subscription.

On iPhone and iPad, the screen explains that Octagon HQ must first be added to the Home Screen. The app does not request notification permission in this PR.

## Explicit boundary

Device delivery is not active after this PR. The final PR owns:

- a deliberate user-triggered permission request;
- per-device push subscription registration and revocation;
- private device-subscription storage;
- delivery from the existing canonical notification events;
- provider credentials and failure handling;
- notification click routing and lifecycle cleanup.

Until that final connection is built and validated, the private in-app notification center remains the active delivery channel.

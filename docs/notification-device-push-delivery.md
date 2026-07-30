# Notification Device Push Delivery

## Final notification roadmap slice

This completes the three-PR notification plan:

1. Remaining in-app producers — merged in PR #138.
2. Notification preferences and push readiness — merged in PR #139.
3. **Actual per-device Web Push registration and delivery — this PR.**

The existing notification bell and private in-app notification center remain the one notification product. Device delivery is an additional output for selected existing notifications, not a second inbox or a second event model.

## Member-controlled device connection

A signed-in member deliberately selects **Turn on device notifications**. Only that user gesture may request browser notification permission and create a Push API subscription.

Each browser or installed app has its own private subscription. The member can disconnect the current device without changing another connected device or muting the in-app notification center.

On iPhone and iPad, Octagon HQ must be added to the Home Screen and opened as an installed web app before device notifications can be enabled.

No push subscription, endpoint, encryption key, or permission state is stored in local storage.

## Canonical ownership remains unchanged

`private.publish_notification_to_profile(...)` remains the sole owner of:

- notification source idempotency;
- aggregation;
- optional preference suppression;
- push-candidate versus in-app classification;
- unread state;
- Realtime notification-center updates.

Device delivery begins only after that canonical publisher creates or meaningfully updates an unread `push_candidate` notification group. Notifications classified as `in_app` never enter the device-delivery path.

There is no second scheduler. The delivery trigger makes one asynchronous request to the single `deliver-notification-push` Edge Function for the notification version that was just published.

## Private device and delivery storage

Two private tables own the additional delivery state:

- `private.notification_push_subscriptions` stores one encrypted Web Push endpoint/key set per device and profile.
- `private.notification_push_deliveries` records one claim per notification version and device.

The unique notification/version/device claim prevents duplicate delivery when the database trigger or Edge Function is retried. Browser roles cannot read either table or invoke service-only claim, secret, authorization, or delivery-result functions.

A newly registered endpoint is assigned to the currently signed-in profile. Reconnecting the same browser after changing profiles moves that endpoint to the new signed-in profile rather than allowing cross-profile delivery.

## VAPID and delivery security

The trusted Edge Function creates the Web Push VAPID key pair on first use. Supabase Vault retains the public key, private key, subject, and database-only delivery credential.

The browser receives only the VAPID public key. The private VAPID key, delivery token, service-role credential, push endpoint encryption keys, and provider responses never enter browser code or repository secrets.

The database trigger invokes delivery with a Vault-backed credential. Direct delivery requests without that credential are rejected before a notification or subscription can be claimed.

## Delivery behavior

For each currently enabled device subscription, the Edge Function:

1. claims the exact notification version;
2. encrypts and sends a standards-based Web Push payload;
3. records success, failure, or expiration;
4. disables endpoints rejected as expired (`404` or `410`);
5. disables repeatedly failing endpoints after five failed attempts.

The payload includes the existing notification title, summary, route, category, kind, aggregate count, and notification ID. No additional member data is sent.

When Octagon HQ is already visible, the service worker tells the existing notification provider to refresh instead of showing a duplicate operating-system alert. When the app is closed or hidden, it displays the device notification. Selecting it focuses or opens Octagon HQ at the canonical notification route.

## Preference and read-state behavior

Optional preferences still suppress activity before a notification group exists, so disabled optional events cannot leak through device push. Critical actions and Cody-only operational alerts remain always on.

Device delivery does not mark a notification read. The notification stays unread in the canonical center until the member opens or marks it there.

Turning device notifications off removes the current device’s server subscription and unsubscribes the browser. It does not delete notification history or affect another device.

## Deployment boundary

The canonical Supabase deployment workflow remains the only backend deployment owner. It:

- applies migration `202608200025`;
- deploys `deliver-notification-push` from the exact source SHA;
- creates or reuses private VAPID configuration;
- verifies the public-key response, exact deployed SHA, and production CORS;
- proves unauthenticated delivery is rejected.

No device notification should be described as live until the exact production backend and frontend deployment evidence is green and an installed device completes the explicit connection flow.

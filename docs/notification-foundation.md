# Notification Foundation

## Product placement

Notifications are Octagon HQ's single personal and actionable delivery layer.

- The top-right header bell is the permanent entry point.
- The bell replaces the former What's New header shortcut; the question-mark Octagon Verdict action remains unchanged.
- `/notifications` owns one flat notification list.
- Home keeps the complete What's New preview and `/whats-new` keeps the complete feed.
- Profile preferences and device push are later phases, not part of this foundation.

## One system, not feature inboxes

War Room, Picks, Play, monitoring, and future account features publish defined events into the same notification owner.

- No feature may build a separate notification center, unread store, polling loop, or local-storage fallback.
- Feature screens may show local badges or inline action states, but those must reflect the same canonical event and must not create a second inbox.
- `NotificationProvider` is the single browser owner.
- `notificationRepository.ts` is the only browser RPC and Realtime boundary.
- Supabase privately owns notification groups, idempotent source events, owner targeting, and cross-device read state.

## Flat list and aggregation

The center is one chronological list. It is not split into "Needs attention" and "Recent activity" or any other visual sections.

Every producer supplies:

- a unique `source_key` for idempotency;
- a stable `aggregation_key` for related unread activity;
- one defined notification kind;
- member-facing title, summary, route, and optional action label.

Repeated unread events sharing an aggregation key collapse into one row and increment `aggregate_count`. For example, two unread War Room mentions appear as one **You were mentioned ×2** notification. Replaying the same source key does not increment the count. After a group is read, the next event reopens it with a fresh count of one.

## Read and navigation behavior

- Members can mark one notification as read.
- Members can mark all notifications as read.
- Opening a notification's deep link marks that notification as read.
- Read state is stored on the canonical profile-targeted group and refreshes across devices through a private profile-scoped Realtime topic.
- A notification deep-links to the correct permanent action screen when a route exists.
- A notification never applies a card change, result correction, fighter replacement, cancellation, or other operational mutation automatically.

## Cody-only operational alerts

`private.notification_owner` identifies exactly one owner profile. The migration seeds the current `CODY` profile when present, and the service-only `set_notification_owner(...)` function can correct that binding without exposing it to the browser.

Operational kinds are rejected unless the recipient is the configured owner. `publish_owner_notification(...)` accepts operational alerts only.

Approved owner-only kinds:

- card change detected;
- fighter replacement detected;
- fight cancellation detected;
- fight order changed;
- fight moved off the monitored card;
- published card and monitored source no longer match;
- event draft ready for review;
- upcoming event has no published Picks card;
- odds failed to match a fight;
- monitoring repeatedly failed;
- provider quota is critically low;
- all fight results are entered;
- event is ready to be completed;
- post-lock correction requires review.

These alerts should route to Monitoring Inbox, Event Setup, Fight Night Control, or the specific affected event or fight.

## Member event kinds

### Social

- War Room mention;
- War Room reply;
- War Room invite accepted;
- game challenge received;
- challenge accepted;
- opponent finished;
- challenge result ready;
- challenge expires soon.

### Picks

- repick required after a fighter replacement;
- selected fight cancelled;
- Picks incomplete near lock;
- Picks recap ready;
- season result changed after completion;
- current UFC event starting soon.

### Games

- four hours remain for the Daily Challenge;
- daily streak at risk;
- new daily challenge available;
- achievement unlocked;
- new game available.

## Priority metadata

The list remains visually unified, but each kind stores future delivery metadata.

`push_candidate` by default:

- War Room mentions;
- direct replies;
- new game challenges;
- repick required;
- incomplete Picks near lock;
- Picks recap ready;
- all Cody-only operational review alerts.

Other defined kinds default to `in_app`. This metadata does not send device push in Step 1.

## Smart timing and noise

The producer that owns the underlying feature owns timing. The center does not invent reminders.

- Do not send overlapping messages for the same event window.
- When Picks are incomplete near lock, publish the finish-your-card message instead of the event-starting message.
- When Picks are complete, the event-starting message may be published.
- Both may exist only when lock time and event start are meaningfully different.
- Routine ranking movement, design updates, feature explanations, weekly summaries, and non-actionable announcements remain in What's New only.
- Favorite-fighter movement, new fighters, new games, Fighters to Watch, badges, and general app announcements remain in-app by default and should not create push noise.

## Initial slice boundary

This foundation creates the canonical storage, aggregation, read state, private Realtime refresh, owner-only enforcement, bell, and flat in-app center. Feature producers should be connected in later focused slices through the existing service-only publishers. They must not add another notification owner or browser path.

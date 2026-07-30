# Canonical share destinations

Octagon HQ uses `src/app/canonicalDestinations.ts` as the single owner for app-relative destinations that may be shared or opened from notifications.

## Destination formats

| Destination | Canonical path |
| --- | --- |
| Fighter profile | `/fighters/:fighterSlug` |
| Ranking position | `/rankings?fighter=:fighterSlug` |
| Comparison verdict | `/rankings?compareLeft=:fighterSlug&compareRight=:fighterSlug` |
| Game result | `/play/:gameSlug?result=:resultId` |
| Challenge invitation | `/play?challenge=:challengeId` |
| Picks event | `/picks?event=:eventId` |
| Picks recap | `/picks?event=:eventId&view=recap` |
| War Room reference | `/war-room?conversation=:conversationId&message=:messageId` |

Notification targets do not receive a separate canonical URL. They resolve to the destination owned by the relevant feature.

## Ownership boundary

- This module owns deterministic route construction and absolute same-origin share URLs.
- Feature screens own resolving their identifiers, permissions, loading states, and exact on-screen focus.
- Internal navigation, notifications, and native sharing should consume this contract rather than reconstructing paths.
- This first change does not add share buttons or duplicate any feature routing logic.

The next routing change should teach the existing feature owners to consume these destination parameters during cold starts and in-app navigation.

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
- No duplicate route or screen owner should be introduced solely for shared links.

## Implemented consumers

- Rankings resolves `/rankings?fighter=:fighterSlug`, opens the correct men's or women's board, filters to the requested fighter, and focuses that ranking row.
- Rankings hands `/rankings?compareLeft=:fighterSlug&compareRight=:fighterSlug` to the existing Intelligence comparison owner while preserving left/right orientation.
- Picks resolves archived `/picks?event=:eventId` destinations through the existing season archive, opens the Events view, expands the exact event, and focuses the archive.
- Picks recap links use the same archive owner and open the requested event's recap details without creating a second recap route.
- Active Picks-event links naturally land on the one current card already owned by the main Picks screen.
- Invalid, incomplete, unknown, or duplicate targets safely fall back to their normal feature screen.

The remaining feature owners should consume their canonical parameters in similarly small, tested batches.

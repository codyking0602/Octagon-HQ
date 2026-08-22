# Football Back Room game assets

Football game art is intentionally smaller in scope than the UFC fighter-photo system. The Back Room does not own football profiles, news, rosters, or a general media library.

## Canonical owner

`src/features/back-room/FootballSubjectVisual.tsx`

Game pages must use `FootballSubjectVisual`. Do not construct image URLs or create a second per-game registry.

## Asset types

- NFL and college players: one square headshot thumbnail.
- Coaches: one square headshot thumbnail.
- College programs: one transparent athletic/program mark.
- Team seasons: the program mark plus the year in game UI; no season-specific action photo is required.
- NFL teams, when team subjects are added: one transparent team mark.

No full-body player cutouts, profile images, stadium photography, or action-photo library is required for the Football Back Room.

## Paths

The canonical path helper is `footballSubjectAssetPath`.

- `/images/football/players/<subject-id>.webp`
- `/images/football/coaches/<subject-id>.webp`
- `/images/football/programs/<subject-id>.webp`
- `/images/football/teams/<subject-id>.webp`

Approved assets are registered once in `footballSubjectAssets`. Until an asset is registered, the visual owner renders a deliberate NFL/CFB + subject-type fallback rather than player initials.

## Presentation rule

Blind games may hide the visual until the identity is supposed to be revealed. Once an identity is visible, use the same canonical visual owner used by Blind Rank 5 and Keep 4 / Cut 4.

# Football Back Room game assets

Football game art is intentionally smaller in scope than the UFC fighter-photo system. The Back Room does not own football profiles, news, rosters, or a general media library.

## Canonical owner

- Rendering: `src/features/back-room/FootballSubjectVisual.tsx`
- Asset catalog: `src/features/back-room/footballSubjectAssets.ts`

Game pages must use `FootballSubjectVisual`. Do not construct image URLs or create a second per-game registry.

## Current production coverage

Every subject in the six current Football Rank 5 packs is registered in `footballSubjectAssets`.

- NFL players and coaches use the team mark most strongly associated with the version of that subject represented by the game data.
- College quarterbacks use their college program mark.
- College-program subjects use their program mark directly.
- Single-season team subjects use the program mark; the year stays in the game copy.

The current mark catalog uses the ESPN static image CDN only as an image host. It is not a football data/query provider and no game owns a second URL path. If an image cannot load, the canonical visual component renders the deliberate NFL/CFB + subject-type fallback.

## Future local headshots

Approved square player/coach headshots can replace team/program marks without changing any game page. The intended local paths remain owned by `footballSubjectAssetPath`:

- `/images/football/players/<subject-id>.webp`
- `/images/football/coaches/<subject-id>.webp`
- `/images/football/programs/<subject-id>.webp`
- `/images/football/teams/<subject-id>.webp`

When a local asset is approved, update the one canonical asset catalog rather than adding an image path to Blind Rank 5, Keep 4 / Cut 4, Blind Resume, or any future Football game.

## Scope rule

No full-body player cutouts, profile-image library, stadium photography, or action-photo library is required for the Football Back Room. The compact subject visual is the Football analogue to the UFC game thumbnail.

## Presentation rule

Blind games may hide the visual until the identity is supposed to be revealed. Once an identity is visible, use the same canonical visual owner used by Blind Rank 5 and Keep 4 / Cut 4.

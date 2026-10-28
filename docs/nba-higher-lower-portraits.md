# NBA shared player portraits

One canonical portrait registry serves Find the Leader, Higher or Lower, and Hit the Number across Casual and Official Daily. Leave acceptable portraits unchanged; only replace visually unsuitable examples.

## October 27, 2026 selective playing-era review

Replaced 14 unsuitable post-career, event, coaching, or non-basketball images with player-identified playing-era basketball portraits and approved historical headshots. The specifically replaced files get a face-first square crop at mobile size; preexisting acceptable images retain their original appearance. The same portraits serve every photo-bearing NBA game.

Sources and attribution are recorded per player in `nbaHigherLowerPortraits.ts`. Team/season information continues to come from the audited stats identity records, not from the uniform shown in the portrait.

An image returning HTTP 200 is not enough. The exact-head CI audits actual decoded pixels, placeholders and duplicates; human basketball-era/identity judgment remains an additional editorial check.

## Remaining limitations

The current image source system still uses approved remote URLs. Some older players lack high-quality team-and-year-matched portraits; accept identifiable playing-career images from another season instead of events or suits. Do not automatically substitute image search results or reintroduce generic silhouettes in published photo-based boards.

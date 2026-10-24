# UFC Sports Feud supplemental audit — no live activation

The production `main` SHA at task start was `f1d5634d3a8f9fa8bc26dae42f8aaa24cdac665e`. A separate chat is developing the main six-month candidate PR #2067 concurrently, so this change uses collision-safe filenames and stays off `main` to avoid competing integrations.

## Supplemental candidates
**16 authored editorial prompts:** 4 Main (UFC Hall of Fame Contributor Wing inductees, professional kickboxing crossovers, IBJJF/ADCC grappling world-title holders, and fighters returning to the UFC after stints elsewhere) plus 12 Fast covering fan logistics, streaming problems, MMA gym names, martial arts belt colors, travel paperwork, and UFC event context. Each has eight ranked editorial examples, more valid off-board responses, and curated aliases; these rankings are never represented as survey results.

**First editorial pass:** 8 advance to final review (3 Main + 5 Fast), 8 held owing to duplication or adjacent semantic families. The target is not met or certified merely by writing this file.

The official UFC Hall of Fame lists Joe Silva, Art Davie, Jeff Blatnick, Bob Meyrowitz, Marc Ratner, Craig Piligian, Charles "Mask" Lewis, Thomas Gerbasi and Bruce Connal in Contributor Wing: https://www.ufc.com/ufc-hall-of-fame

The kickboxing Main board is held as an alternative to other boxing crossovers, not counted as a new semantic topic. UFC source references for grappling world-title credentials: https://www.ufc.com/athlete/gilbert-burns, https://www.ufc.com/athlete/mackenzie-dern, https://www.ufc.com/athlete/rodolfo-vieira, and https://www.ufc.com/news/penns-prodigious-history. UFC source references for kickboxing careers: https://www.ufc.com/news/overeem-vs-hunt-lands-ufc-209-card, https://www.ufc.com/news/they-have-history-pre-ufc-rematches-ufc-281-adesanya-vs-pereira, and https://www.ufc.com/athlete/stephen-thompson.

Returning-veteran historical example and full UFC stint timeline: https://www.ufc.com/athlete/robbie-lawler; 2013 return narrative: https://www.ufc.com/news/robbie-lawler-ruthless-return; and UFC Josh Barnett return: https://www.ufc.com/video/37191. Returnees must have fought for another promotion between UFC stints, not merely returned from an injury layoff.

## Quality controls
- Tested each ranked canonical, extra accepted and nickname/alias through `matchFamilyFeudAnswer`.
- Guarded a known negative (non-Hall honoree), nonredundant canonical spellings, and first-pass semantic holds.
- Consolidated the red-black/Coral belt variant so the same martial arts rank is not rewarded twice.
- No live Daily imports, scoring changes, schema changes, historical result changes or activation. No claims that this fulfills the 20-appearance distinct topic requirement.
- The user authorized go-live for a **finished six-month bank**, not a partial bank. **Do not merge or activate this partial content until integrated with the other candidate bank and the semantic / answer acceptance release gates pass.**

## Review gate before release
The active UFC Daily rotation actually has **24 Sports Feud appearances in six months** (verified by the other audit PR #2067). At least **48 independent Main** topics and **120 independent Fast** topics are therefore needed for six months of consecutive 2+5 appearances without semantic reuse, alongside a deterministic versioned future-only selector and exact-head CI. Existing **staged row counts are insufficient evidence** after holds and topic-family collapses. Preserve all prior 350-bank snapshots.

## Safe six-month selection foundation (not activated)

Added `ufcSportsFeudFutureRotation.ts` and a pure deterministic planner regression test. A full six-month UFC Sports Feud run currently comprises **24 official appearances**, so the allocation needs 48 Main and 120 Fast boards, **168 distinct semantic families across the entire window**, not merely 168 different IDs. The planner intentionally fails closed if the candidate inventory cannot satisfy that constraint; it reserves cross-round overlapping families only once and generates the same selected boards for the same cycle. It never imports or changes the live Daily builder or previous scores.

The active UFC editorial staging at draft PR #2067 reports at most 29 potential Main and 78 Fast unique semantic families after holds; this supplemental branch proposes three further Main and five further Fast as **uncertified** candidates, not an approved solution. Full six-month certification and versioned future-only publishing remain blocked until sufficient unique topics and comprehensive answer review exist.

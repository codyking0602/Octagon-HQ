# Football Sports Feud — isolated rebuild progress (October 23, 2026)

**DRAFT STAGING ONLY. Never merge or deploy without separate authorization.** The current v1 NFL/CFB game, historical question IDs, fixed point ladders, Daily schedule, official published packs and stored results are unchanged.

## True distinct-content inventory

The old bank reported 350 authored prompts per sport, but each came from exactly 70 question families with five alternate phrasings. This rebuild counts a source ID as a question only when its underlying semantic topic is new. Only one original -1 prompt from each audited KEEP family survives in the candidate inventory; original alternate variants are not deleted.

| Candidate inventory | NFL | CFB |
| --- | ---: | ---: |
| Kept original concepts (one ID each) | 21 | 23 |
| New distinct editorial candidate topics | 120 | 117 |
| Main board candidates | 40 | 40 |
| Fast Money candidates | 101 | 100 |
| **Total concepts staged** | **141** | **140** |

New questions include objective NFL award and career-history topics, college CFP and award-specific questions, pass routes, field and special teams knowledge, fan culture, recruiting, college traditions and gameday operations. New questions have eight editorially ranked examples and explicit off-board candidates (NOT actual survey findings). Candidate does not mean all factual claims or aliases have received independent final primary-source certification.

## Technical rotation

`previewFootballFeudRebuildRotation(sport, appearances)` selects 2 Main + 5 Fast for **20 consecutive appearances of each sport**, deterministic by slot and sport, with no reused question ID over 20 appearances, and no same-lane collisions within an appearance. This is 40 combined alternating Football Daily appearances of content in preview. The staging preview is deliberately disconnected from the live Daily generator and does not change prior player results. Tests exercise exact IDs, candidate/alias matching, distinct lanes, and the 20-appearance constraint. The 21st same-sport appearance requires a fresh cycle or more content; there is no 6-month-per-sport no-repeat claim.

At four Football Sports Feud appearances per 22 days, alternating NFL/CFB, 40 combined appearances provide over six months of content before an exact question ID must repeat in this preview.

## Editorial standards and remaining release gates

1. Primary-source verification of every objective answer universe before activation (NFL/Pro Football Reference; NCAA/CFP; Davey O'Brien, Heisman, Doak Walker and related award records). A correct answer omitted from an authoritative list is a grading bug.
2. Audit plausible extra answers and spelling/short-name aliases with exact matcher behavior. Do not confuse rankings with empirical surveys.
3. Reconcile loosely related "game experience" questions and avoid turning the new bank into a pile of generic fan-life trivia at the expense of football identity.
4. Wire a **versioned future-only** selector/materializer that preserves already published challenge setups/results and archived IDs. The live v1 cardinality asserts must NOT simply be changed to 40/100, and the UFC implementation must remain untouched.
5. Run PR-head typecheck/unit tests, rotate each sport over multiple 20-appearance cycles, verify historical result continuity, then obtain explicit merge/go-live approval.

## Confirmed references reviewed during staging

- NFL AP 2025 season Honors and OPOY/Coach of Year: https://www.nfl.com/news/list-of-nfl-honors-award-winners-from-2025-nfl-season
- Pro Football Reference passing career leaders: https://www.pro-football-reference.com/leaders/pass_yds_career.htm
- Davey O'Brien official archive: https://www.daveyobrienaward.com/national-quarterback-award
- Heisman official archive: https://www.heisman.com/heisman-winners/
- NCAA 2025 College Football Playoff bracket: https://www.ncaa.com/brackets/football/fbs/2025

Everything remains unactivated. No main edits, merge or deployment.

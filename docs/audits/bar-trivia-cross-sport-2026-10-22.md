# NFL / CFB / UFC Bar Trivia — cross-game editorial audit
**Review-only staging — October 22, 2026**  
**Base:** `fa719561e3fbbc751996cb03b462c3e5e9b052dd` (current `main` resolved before this audit).  
**Owner approval required before merge.** No deployed or previously published Daily setup/result is modified by this PR.

## Findings and editorial actions

The source bank contains 899 authored questions (NFL 260, CFB 260, UFC 379), including 35 date-windowed current events. The original validation checks exact repeated prompts, answer membership, four choices, and declared round/difficulty; these tests **do not prove actual human difficulty**, semantic uniqueness, or independently verified facts.

The audit screened all Bar Trivia source entries and the 240 static NFL/CFB/UFC Millionaire questions, cross-referenced the prior Average Fan Stage 2 editorial/collision documentation, and considered Sports Feud's survey-style categories separately from multiple-choice factual trivia. Similar names/answers were reviewed as possible collisions, **not** automatically removed. Not every same-player question is the same sports fact, and the audit is not an independent source certification for all 899 rows or dynamic/generated banks.

| New Daily lineup decision | NFL | CFB | UFC | Total |
| --- | ---: | ---: | ---: | ---: |
| Same historical fact already asked in Millionaire | 10 | 7 | 37 | 54 |
| Duplicate/near-duplicate fact inside Bar Trivia | 5 | 0 | 10 | 15 |
| Prompt or answer itself gives away the answer | 2 | 5 | 1 | 8 |
| Weak, unmemorable or arbitrary detail | 7 | 12 | 9 | 28 |
| Niche older news still eligible | 0 | 0 | 2 | 2 |
| **Retired from future selection** | **24** | **24** | **59** | **107** |
| **Existing questions regraded** | **4** | **11** | **5** | **20** |
| **Remaining selectable inventory** | **236** | **236** | **320** | **792** |

Retirements, reason codes and round overrides are explicitly enumerated in `src/features/play/barTriviaEditorialCuration.ts`. Source definitions are not deleted: publication references and archival reveal evidence continue to work. No filler replacements are introduced to restore a previous number. Tests use minimum viable pool depths, not historical quota targets.

### Difficulty ladder and giveaways

- **CFB:** `cfb-r3-beamer-ball` is unacceptable as a third-round question; the queried coach's surname is inside “Beamer Ball.” Retire. The Bobby Bowden/Florida State, Tom Osborne/Nebraska, Barry Switzer/Oklahoma, Ralphie/Colorado and houndstooth/Bryant questions fit the middle round better, while title-winning **catchers**, the 1988 Notre Dame–Miami score, Auburn's 2010 Dyer run, and the 1966 10–10 Game of the Century are better higher-tier knowledge. Retain Marcus Randall/2002 Bluegrass Miracle as the Last Call benchmark.
- **NFL:** “Bear Down, Chicago Bears” literally contains the answer. “Ickey Shuffle”/Ickey Woods has the same giveaway problem for a supposedly hard question. A president attending an NFL game, a 30-second play clock's implementation year and the first 11–10 game are rote minutiae, not good sports trivia. Retire. Promote the Jerome Bettis Thanksgiving coin-toss and the Randy Moss Thanksgiving opponent; downgrade an easy Helmet Catch opponent question.
- **UFC:** UFC 1's year as a Last Call question is unacceptably easy; Hall of Fame administrative “wing” taxonomy and a prior stadium's commercial name are obscure trivia without a compelling moment. Retire. Nickname recognition such as “El Guapo” or “The Natural” moves to Round 2. The UFC 5 Gracie–Shamrock Superfight outcome and the location of the Rousey–Carmouche debut merit tougher placement.

### Genuine collisions, not just shared athletes

- **NFL vs Millionaire:** David Tyree Helmet Catch; first 50-TD passing season; the first QB to start Super Bowls for two franchises; Franco Harris Immaculate Reception; Stefon Diggs Minneapolis Miracle; Malcolm Butler goal-line interception.
- **CFB vs Millionaire:** Auburn's 2010 Heisman QB; inaugural CFP winner; Larry Coker's Miami championship; 2004 unbeaten Auburn team missing the BCS final; first BCS and last BCS champions.
- **UFC vs Millionaire:** McGregor's 13-second Aldo knockout; Khabib's 29–0 record/final opponent; first simultaneous double champion; Cejudo ending Demetrious Johnson's reign; Amanda Nunes as first female simultaneous champ; Diaz submitting McGregor at UFC 196; Matt Serra's win over GSP, Weidman's first Silva victory, and Adesanya's Stylebender nickname.
- **Inside Bar Trivia:** Philly Special team, cold-weather Super Bowl site, UFC Fight Island island, Bisping–Rockhold, Moreno–Figueiredo, UFC history questions restating the same championship outcomes in different rounds.

Previous Average Fan Stage 2 audit already retired several Bar Trivia same-fact copies; that protection exists but **does not certify** every dynamic player template or other game. Sports Feud permits broad associations and survey topics; a shared player's identity alone was *not* grounds for removing a valid Bar Trivia question.

### Live Daily / recent news

At the audit date only **seven** of 35 current-event questions are eligible under their existing active/expiry windows (NFL 1, CFB 2, UFC 4). Two older, low-recognition UFC Ultimate Fighter finals questions are removed from future selection, leaving **five** active (NFL 1, CFB 2, UFC 2). The original generator requests two events by default and falls back to evergreen when eligible content is exhausted; it is not a live news ingestion feed. This deficit needs a separate source-backed editorial replenishment and stronger protection against cross-day repeats. Published UFC Daily on September 29 and October 5 repeated two identical question IDs (Joshua Van/Pantoja and youngest UFC champion), proving current cross-day recurrence.

**Before merge**: assess source-backed current-event replenishment separately and validate a deterministic recent-question exclusion for future published boards. Do not silently add future fight results or unconfirmed stories, change historical Daily boards or infer that a publication date alone certifies the fact.

## Existing contract preserved
- NFL / CFB / UFC daily scope, ten questions, three scored rounds + Last Call, double round, wagers, score normalization and UI remain unchanged.
- `barTriviaQuestionBank.ts` filters only future selectable IDs and maps explicit regrades. The server-owned official Daily snapshots, archived public results, Daily scores, leaderboard and history do not need migration.
- Per-question ID, answer, choices, explanation and original source authority stay in the authored files.

## Required follow-up and acceptance
1. Inspect exact future seeded Daily boards and cross-day repeats, including forced thematic football boards; enforce no avoidable near-term repetition.
2. Verify new current-event answers against official published results, ensure event window accuracy, and keep easy current events recognizable rather than trivia about unknown prelims.
3. Extend semantic fact-key screening beyond the static Millionaire bank to actual selected Average Fan, generated subjects, and the rest of Daily. No blanket claim of full cross-game uniqueness until that review is completed.
4. Exact PR-head typecheck, content and runtime tests, CI green, owner review, then merge only with explicit approval.

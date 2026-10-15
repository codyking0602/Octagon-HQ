# Average Fan Stage 2S — generated UFC dated-bout fact-family deduplication

Date: October 15, 2026. Focus: **generated UFC fighter-opponent, method-of-victory, and title-opponent questions**, whose source IDs differ even when they ask for the same **specific fight**. This source/programmatic pass does not certify full UFC identity/Final facts or 133 fighters' independent official bout checks.

## Verified overlap within the 51-athlete expansion source

Examined each expansion athlete's selected deterministic **dated opponent, win-method, and most recent available title-bout sources**, against the pinned UFCStats ledger in `data/generated/ufc/factual-expansion-v1.json`. The 51-athlete expansion source contains **four examples** where the dated `g3:opponent` and `g4:method-win` templates resolve to the identical date, fighter and opponent:

| Expansion fighter | Dated opponent fact | Prior separate generator formats | Disposition |
| --- | --- | --- | --- |
| Jorge Masvidal | July 30, 2016 — Ross Pearson | `g3:opponent`, `g4:method-win` | **Merge one fact family** |
| Diego Lopes | September 13, 2025 — Jean Silva | Same | **Merge one fact family** |
| Urijah Faber | February 23, 2013 — Ivan Menjivar | Same | **Merge one fact family** |
| Kimbo Slice | December 5, 2009 — Houston Alexander | Same | **Merge one fact family** |

The other **47 expansion athlete rows** do not show this particular same-fighter `g3` / `g4` duplicated selected fight. This is a source-level count, **not a claimed bank-publish count**: the selection balancer may choose neither, one or both before the fix, and the separately curated ranked-core population still needs comprehensive editorial review. A fight involving two fighters (for example, Masvidal–Diaz at UFC 244) must also be considered one fact family regardless of which fighter is named.

## Fix

- `averageFanQuestionFactKey` now assigns each of the three dated question formats a **symmetric key for the bout's calendar date and both participant identities**. Reverse phrasing, extra method context, or the championship label cannot buy an extra question slot.
- Selection deduplicates these keys across grade buckets and subjects via the existing shared `balancedTake` fact registry; nothing new is created and no bank-size minimum is imposed.
- Tests inspect all four exact duplicate expansion fighter/date/opponent examples, a reversed historical bout, and every selected UFC bank question's canonical fact-key uniqueness. The existing 120-day deterministic Daily output test remains in force.
- This affects **future bank selection only**. Published Daily snapshots, player attempts, archived answers/scores, and rotation schedule are unchanged.

## Remaining Stage 2

Full individual 133-subject UFC fighter-ledger checks, generated fighter identities and Finals, full NFL/CFB ordinary sources, rolling production Daily snapshots, external factual checks of all final choices/aliases, and additional cross-game semantic collisions are still pending. **Stage 2 remains in progress.**

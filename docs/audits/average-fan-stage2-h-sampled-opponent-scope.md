# Average Fan Stage 2H — sampled opponent answer fairness and fifth-grade IQ

Date: 2026-10-14. **Future-only editorial correction. Stage 2 remains in progress; this is not a full-bank certification.**

## Independently observed scope problem

The UFC fighter authority covers 133 curated subjects, with ranked fighters drawn from selected ranking fight facts and expansion fighters from a pinned UFCStats-derived snapshot (`src/features/back-room/ufcFactualLedger.ts`, `data/generated/ufc/factual-expansion-v1.json`). That selection is useful factual evidence, **not an exhaustive guarantee that all of a fighter's actual UFC title opponents or finish victims are represented in the selected record**.

Previously, a generated short-answer tile asked `Name one opponent [fighter] beat by [method] in the UFC.` or `Name one fighter [fighter] faced in a UFC title fight.` The only accepted names were the sampled record's opponent(s). A player who supplied another correct real-career opponent outside the selected authority could be penalized. Structural alias tests could not detect this failure. The analogous generated four-choice `did [fighter] defeat?` tile lacked a bout anchor and could present a wrong option whom the subject also defeated in an omitted source bout.

**Editorial disposition: rewrite the three question families** into a *single, identified UFC bout* with a natural-language date clue. Retain natural short-answer recall for method victories and title-fight opponents, and four-choice recognition for the general fight question. The accepted answer now names the recorded opponent in the uniquely dated bout, rather than pretending that a selected career subset is an exhaustive answer list. Refuse generated dated questions when a subject's source data has multiple bouts on the same date (early UFC tournament scenario).

This makes the answer proposition narrow enough to judge using its pinned fight ID, outcome, date, method, and championship flag; it does not independently certify that every underlying imported fight record is historically correct. Official event pages (for example [UFC 192: Cormier vs Gustafsson](https://www.ufc.com/event/ufc-192)) are the authoritative corroborating sources for event identities. This is a **logic/fairness fix**, not a claim of individual source verification for every remaining UFC, NFL, or CFB fact.

## Difficulty check

The authored Octagon IQ questions `feint` and `switch-stance` explicitly define beginner-level concepts and should not appear in fifth grade. Regrade their source difficulty 5 → 2. Regrade `hip-escape` and `frame` 5 → 3: technical vocabulary, but neither is appropriate as the hardest possible sports-fan question. Selection remains quality-first; these questions are not backfilled into fifth grade.

## Regression and publication safety

- Verify the actual selected generated UFC opponent, method-win, and title-opponent questions each resolve to one dated factual bout and one recorded opponent, with the correct bout result/title state.
- Prohibit returning to the broad, under-graded `name one` prompts.
- Guard the four basic Octagon IQ facts against fifth-grade selection.
- Preserve the existing deterministic generation, question IDs, scoring, pre-existing published answer keys/results, and official Daily schedule. No database migration or retroactive publication rewrite.

## Still outstanding

Complete independent human review of **all selected** NFL, CFB and UFC bank entries against primary/reference sources, including athlete identity/team/season bindings; inspect all alternate valid answers and false alternatives; review each difficulty and important source provenance; inspect actual generated eight-tile boards and Finals. The existing published-fact ledger covers 54 previously published prompts, not every future eligible question.

**Do not mark Stage 2 complete, or start Stage 3 or the Stage 4 rotation, on the basis of this pass.**

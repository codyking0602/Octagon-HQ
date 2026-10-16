# Average Fan Stage 2X — generated CFB/UFC and future-board editorial audit

Date: October 15, 2026. Parent main: `24814f6a100e72b416a49cacaf09ac7d259d208e`. This pass reviews *actual generated and selected material*, not merely source-row counts. All changes affect future candidate generation/selection; the six persisted historic Average Fan Daily boards and user results remain unchanged.

## Audited source population and evidence

- **UFC:** 133 source-ledger fighters: 82 ranked fighters plus 51 recognizable expansion fighters. The expansion JSON includes UFCStats provenance and dated opponents, official results, finish categories, and title-bout flags. A cross-ledger check of all expansion subjects found **51 shared fighter-to-fighter fixtures; all 51 agreed on date, opponent, result direction, method and championship status**, after reconciling diacritics/stroke-letter names. The new regression runs against the complete expansion data at build time and also checks all *selected* generated dated-fight questions back to ledger evidence. It does not claim an independently opened external UFCStats bout page for each of the 133 fighters.
- **CFB:** Generated player-career and program questions are matched back to the canonical registry for school, primary position, draft slot/year, 2025-season conference alignment and Heisman boolean. The tests cover each *selected* generated template and reject a nonexistent registry subject or a claim that contradicts its recorded source.
- **Daily boards:** Emitted and individually examined the full prompts/answers/formats/distractors for the first five future **NFL**, five **CFB**, and five **UFC** Average Fan boards chosen within a 180-day deterministic rotation from October 16, 2026. Sample dates include CFB Oct 16, Oct 28, Nov 4, Nov 14, Nov 29; NFL Oct 18, Nov 2, Nov 12, Nov 24, Dec 1; UFC Oct 17, Oct 19, Oct 30, Nov 7, Nov 11. The test also validates the actual sequential publication path across the full 180-day window and preserves the preexisting 120-day no-repeat/topic checks.

## Editorial findings and changes made for future boards

| Problem observed on actual generated board | Correction | Why |
| --- | --- | --- |
| October 30, UFC: Holly Holm vs Ronda Rousey included **men** (Umar Nurmagomedov, Merab Dvalishvili, Cory Sandhagen) as wrong answers; Amanda Nunes title questions similarly used male opponents | Pass the canonical `men/women` ranking board into the factual ledger; derive the expansion subjects' gender; restrict fighter distractors to same-gender peers | The rank core can store a plain Bantamweight label even when the official roster board is **women**; string prefix is not a gender source |
| October 17 UFC Grade 2: Jamahal Hill (light heavyweight) offered Flyweight and Bantamweight; October 30 Brian Ortega (featherweight) offered Heavyweight | Author three *nearest available divisions within the same gender*; retain explicit primary-division wording | Unrelated extreme-weight distractors turn sports knowledge into a giveaway |
| UFC Grade 5: Darren Till vs Wendell Oliveira Marques (2015), Volkanovski vs Mizuto Hirota (2017), Hooker vs Nasrat Haqparast (2021) require remembering obscure exact undercard/date combinations | For generated dated opponent and finish questions, choose fights **against already recognized roster subjects**, and omit a template when none exists; Final supporting opponents must also be recognizable | Hardness should be recognition/deep sporting knowledge, not random match memorization or bait answer options |
| UFC dated opponent selection could fall back from no recognized *win* to a recognized **loss**, yet still word the prompt “defeat” because the fighter had won other fights | Determine “defeated” versus “faced” from the **selected bout's actual result**, and always exclude that selected opponent from incorrect choices | Prevents a provably false question and duplicate correct answer (discovered by backend bundler check on Greg Hardy) |
| UFC opponents could be represented as `Jan Błachowicz` or `Jan Blachowicz`, defeating same-bout de-duplication and topic diversity | Fold known non-decomposing Latin letters (ł, ø, đ), accents and spacing before bout identity and board topic comparisons | Same fighter and bout must not become different facts based on orthography |
| NFL Grade 5 “Freezer Bowl” demanded two exact team names in free text | Four plausible team-pair choices, three unique wrong options | Players should not fail for valid reversed order or a franchise alias |
| NFL Grade 5 stunt/twist asked for an entire prose *definition* typed verbatim | Four-choice definitions, all plausible football concepts | Natural paraphrases are valid; exact string grading is unfair |
| NFL Grade 5 two forward passes from behind the line and CFB Grade 5 straightforward 2021 Cincinnati / final BCS champ true-false | Move to more suitable lower grades | These are fundamentals or famous historical events, not hardest-tier trivia |
| CFB Grade 4 “What was Joe Burrow's position at LSU?” with punter, LB and OL wrong answers; equivalent Joey Bosa/Michael Crabtree questions | Regrade generated college player-position-with-school template to introductory Grade 2 | Famous athlete primary-position recognition cannot justify Grade 4 just because the code generated it at source grade 3 |

Examples are source-board observations, not fictional illustrations. Future deterministic boards may differ after changing candidate weights and eligibility. The newly added tests rerender sample ladders so revised content can be inspected again.

## Remaining Stage 2 acceptance gates

- [x] **Generated identity traceability:** CFB selected templates bound to canonical subjects; UFC sourced dated events/genders checked; 51 reciprocal expansion bouts matched, with regression tests
- [x] **Future Daily candidate editorial sample:** 15 complete selected eight-question-plus-Final boards examined and defect classes addressed; test replays 180-day scheduling
- [ ] **Review revised selected Daily boards from exact PR head** to ensure no newly surfaced anomalies; validate final-score fairness/aliases
- [ ] **Independently source-check remaining surviving authored facts and distractors**, including NFL historical and specialist definitions, not merely existence in a curated source row
- [ ] **Sample or individually verify any remaining non-sampled generated UFC Final/CFB families** beyond 15 seeded boards, especially uncommon title-fight role and identity ambiguity
- [ ] Exact-head green Validate V2 and generalized backend proof; merge and verify both production deployment lanes

**Do not close Stage 2 or advance to Stage 3 until these remaining checks are actually met.** No new arbitrary inventory quotas are imposed, and no published Daily results are edited.

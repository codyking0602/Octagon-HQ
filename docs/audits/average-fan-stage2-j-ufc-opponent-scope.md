# Average Fan Stage 2J — opponent-option scope for UFC Grade 4

2026-10-14 — **Additional editorial correction, not Stage 2 completion.**

## Finding
The generated UFC fight-recognition question formerly asked "Which of these fighters did [name] defeat in the UFC?" Its four choices were pulled from the **curated** 133-person factual ledger. The code excluded documented wins from the three incorrect options, but a curated fight sample cannot prove an athlete never defeated another candidate **outside** the sampled fights. That makes the unbounded all-career prompt unfair and unverifiable.

## Disposition
- **Rewrite** future generated `g3:*:opponent` prompts to identify a specific sourced bout by calendar date (including loss-based "faced" prompts). Three decoy fighters are necessarily incorrect for that distinct bout; retain existing same-gender/division/era-aware plausible choice selection.
- **Hold** a generated item if the same fighter's factual ledger records multiple fights on that day; never infer which one the question intended.
- **Retain** eight-tile Daily format, Grade 4, result scoring, historic IDs and immutable published snapshots. A previously published all-career question stays unchanged in its historic result record.
- **Regression** maps every selected new opponent prompt to exactly one canonical fighter/date/opponent record and verifies its answer/result/choice cardinality.

## Evidence and limitation
- UFC's official [UFC 192 results](https://www.ufc.com/news/ufc-192-cormier-vs-gustafsson-results) confirms Cormier's October 3, 2015 win over Gustafsson, illustrating a date-bounded official bout record.
- The canonical ranked-fighter source and pinned UFCStats expansion ledger retain curated identity/date/result evidence. This row-family validation **does not** independently source-verify every fighter/date, judge all individual distractors' plausibility, or certify the whole Average Fan bank. Continue the mandatory item-by-item audit. Do not bring forward Stage 3, Stage 4 rotation, or historical regrading.

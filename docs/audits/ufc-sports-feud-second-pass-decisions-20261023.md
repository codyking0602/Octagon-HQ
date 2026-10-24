# UFC Sports Feud — keep / rewrite / retire decisions (second-pass editorial review)

**Reviewed:** 2026-10-23; source: current production `main` `3d9d2f9fecb7ba0fa67f87f93d772d94a1542f97`. **Review-only: live code, official publication, past Daily results and source banks remain unchanged.** Supersedes the *candidate counts* in the initial conservative first-pass review (16 Main / 18 Fast). Those were never a final quality tally.

## How to read this audit

This is not a finding that 300 questions are terrible. The authored bank has **70 five-prompt families = 350 source entries**, and most question variants are paraphrases of the same underlying recall task. Using several paraphrases as 'new' challenges would undermine the requested six-to-ten-month semantic freshness. This review picks **one representative (the `-1` ID) per family for potential survival** and marks the other **280 variants** as duplicates. Some variant wordings or valid accepted answers may need to be moved into a rewritten canonical board; **do not delete/archive historical IDs**.

**Family-level editorial verdicts:** **20 KEEP AS A CONCEPT**, **31 REWRITE/MOVE BEFORE KEEP**, **19 RETIRE CONCEPT**. If every rewrite later passes, these yield up to **51 distinct concepts**, NOT a finished 210-question bank. To hit ~210 independently interesting prompts, **159 further unique concepts** would still be needed (or a carefully revisited different concept). Quality beats hitting that target. The ledger below has 350 individual ID decisions: 20 keep, 31 rewrite, 299 retire concept or redundant variant.

- **KEEP** = a meaningful, appropriate concept that may be reused after verifying the entire eight-answer ranked board, true accepted/off-board universe, names, aliases, misspellings and historical facts. It does **not** mean every current answer has been independently certified.
- **REWRITE** = worthwhile concept, but current prompt/scope/difficulty, answer list or round placement must change before use. A Main move is **not** approval to publish the old Fast version as-is.
- **RETIRE** = semantically duplicated across another source family, ambiguous/far too broad, insufficiently distinct, or inappropriate for a fair scored round.
- **RETIRE-VARIANT** = a redundant `-2…5` version of a shared concept. Some reordered answer lists in those variants are legitimate additions; merge appropriate valid off-board names into the canonical board before future use. The source/archived result should remain intact.

## 1. Keep concepts (existing, pending acceptance audit)

| Canonical question ID | Proposed round | Existing prompt | Why |
|---|---|---|---|
| `ufc-main-02-1` | Main | Name a UFC fighter famous for knockout power. | Recognizable knockout-power identity; audit omitted reasonable knockout artists and nicknames. |
| `ufc-main-03-1` | Main | Name a UFC fighter famous for submissions. | Recognizable submission specialists; accept all credible specialists and common fighter shorthand. |
| `ufc-main-04-1` | Main | Name a UFC fighter famous for wrestling. | Recognizable wrestler/grappling identities; test short names and late-era omissions. |
| `ufc-main-05-1` | Main | Name a UFC fighter known for elite striking. | Recognizable technical strikers; broaden plausible off-board answers to avoid unfair strikes. |
| `ufc-main-12-1` | Main | Name a gym or team strongly associated with UFC fighters. | Named gyms/teams create a distinctive UFC knowledge challenge; reject its off-topic nickname variant. |
| `ufc-main-13-1` | Main | Name a famous UFC rivalry. | Recognizable multi-fight UFC rivalries; pair order and surname shorthand must count. |
| `ufc-main-14-1` | Main | Name an iconic UFC fight. | Memorable specific UFC fights; rematch numbers, pair swaps, and common shorthand must count. |
| `ufc-main-20-1` | Main | Name a UFC fighter known for a memorable walkout or entrance. | Memorable fighter entrances are distinctive enough as a main topic; broaden valid examples/aliases. |
| `ufc-fast1-01-1` | Fast | Name a UFC weight class. | Immediate-recall division names; recognize shorthand such as 155/170 and women's divisions when unambiguous. |
| `ufc-fast2-06-1` | Fast | Name a famous Brazilian UFC fighter. | Easy famous-Brazilian-fighter association; broad, nationality-grounded acceptance needed. |
| `ufc-fast2-07-1` | Fast | Name a famous UFC fighter from the UK or Ireland. | Easy UK-or-Ireland fighter association; verify each eligible nationality and nicknames. |
| `ufc-fast2-09-1` | Fast | Name a famous women's UFC fighter. | Well-known women's UFC fighter is immediate recall and easier than a title-record question. |
| `ufc-fast2-10-1` | Fast | Name a famous UFC heavyweight. | Well-known UFC heavyweight is immediate recall; retire identical Main10 version. |
| `ufc-fast3-08-1` | Fast | Name a UFC commentator or analyst fans recognize. | Recognizable UFC announcers/commentators give intuitive names; accept analysts and pronunciation variants. |
| `ufc-fast4-02-1` | Fast | Name a common MMA submission. | Common MMA submissions are ideal timed immediate-recall terms; add acronyms and natural variants. |
| `ufc-fast4-03-1` | Fast | Name a punch or fist strike commonly used in MMA. | Basic punch names are ideal timed material; combine other variants' valid punches into acceptance. |
| `ufc-fast4-04-1` | Fast | Name a type of kick used in MMA. | Basic kicks are good easy recall; resolve low-kick/calf-kick and kick/head/leg term equivalence. |
| `ufc-fast4-08-1` | Fast | Name a UFC fight statistic. | Fight stat names are familiar via broadcasts; accept standard acronyms and variants. |
| `ufc-fast4-10-1` | Fast | Name something a fighter's corner does between rounds. | What corners do between rounds is fun, familiar and broad enough with synonym grading. |
| `ufc-fast5-05-1` | Fast | Name a UFC fighter famous for trash talk. | Famous trash-talkers are quick-recall; keep distinct from broader personality wording. |

## 2. Rewrite, re-scope or move from Fast to Main

| Canonical question ID | Original → proposed | Existing prompt | Required repair |
|---|---|---|---|
| `ufc-main-01-1` | Main | Name a fighter who belongs in almost any UFC all-time-great conversation. | All-time great is subjective; narrow to a defensible historical honor or establish much broader accepted roster. |
| `ufc-main-07-1` | Main | Name a UFC champion remembered for a dominant title reign. | Use verifiable title-defense/reign criteria, not an arbitrary 'dominant' subjective cutoff. |
| `ufc-main-08-1` | Main | Name a UFC lightweight star from the modern era. | Define a real lightweight eligibility window or accomplishment; 'modern era star' has no fair boundary. |
| `ufc-main-09-1` | Main | Name a UFC welterweight star from the modern era. | Define a real welterweight eligibility window or accomplishment; 'modern era star' has no fair boundary. |
| `ufc-main-11-1` | Main | Name a legendary women's UFC fighter. | Differentiate from Fast2-09 'famous women's fighter' by requiring a verifiable elite championship anchor. |
| `ufc-main-15-1` | Main | Name a UFC arena, host city, or named event site strongly associated with major cards. | The prompt mixes arena, city, and named site as answer types; restrict to arenas or another single category. |
| `ufc-fast1-02-1` | Fast → Main | Name an undisputed UFC lightweight champion from any era. | Undisputed lightweight championship is a specialist history list, not Fast; complete and date-check champions. |
| `ufc-fast1-03-1` | Fast → Main | Name an undisputed UFC welterweight champion from any era. | Undisputed welterweight championship is a specialist history list, not Fast; complete and date-check champions. |
| `ufc-fast1-04-1` | Fast → Main | Name an undisputed UFC middleweight champion from any era. | Undisputed middleweight championship is a specialist history list, not Fast; complete and date-check champions. |
| `ufc-fast1-05-1` | Fast → Main | Name an undisputed UFC heavyweight champion from any era. | Undisputed heavyweight championship is a specialist history list, not Fast; complete and date-check champions. |
| `ufc-fast1-06-1` | Fast → Main | Name a UFC fighter who won titles in two weight classes. | Multi-division UFC title history is a Main fact question; distinguish simultaneous vs any-time holders. |
| `ufc-fast2-01-1` | Fast → Main | Name a UFC fighter associated with American Top Team. | American Top Team alumni require camp-history recall and affiliation-source checks; not fast enough. |
| `ufc-fast2-02-1` | Fast → Main | Name a UFC fighter associated with AKA. | AKA alumni require camp-history recall and affiliation-source checks; not fast enough. |
| `ufc-fast2-03-1` | Fast → Main | Name a UFC fighter associated with City Kickboxing. | City Kickboxing alumni require affiliation-source checks and a clear time period. |
| `ufc-fast2-04-1` | Fast → Main | Name a UFC fighter associated with Team Alpha Male. | Team Alpha Male alumni require affiliation-source checks and a clear time period. |
| `ufc-fast2-05-1` | Fast → Main | Name a UFC fighter associated with Jackson Wink. | Jackson Wink alumni require affiliation-source checks and a clear time period. |
| `ufc-fast2-08-1` | Fast → Main | Name a UFC fighter from Dagestan or strongly associated with Dagestani MMA. | Dagestan or 'strongly associated' covers two different criteria; narrow to verified birth/representation and move to Main. |
| `ufc-fast3-02-1` | Fast → Main | Name a fighter who became famous through The Ultimate Fighter. | TUF alumni are a real historical category but require season/cast checks, not a 50-second answer. |
| `ufc-fast3-05-1` | Fast → Main | Name an early UFC pioneer. | Old-school UFC pioneers are factual historical trivia, not easy contemporary Fast recall. |
| `ufc-fast3-06-1` | Fast → Main | Name a PRIDE star who later fought in the UFC. | PRIDE-to-UFC stars are meaningful MMA history but require specialized crossover knowledge. |
| `ufc-fast3-07-1` | Fast → Main | Name a fighter inducted into the UFC Hall of Fame for their career. | Hall of Fame honorees are factual and suitable Main; distinguish individual induction from Fight Wing. |
| `ufc-fast3-09-1` | Fast → Main | Name a referee UFC fans recognize. | Recognizable referees are a narrower knowledge topic; consider Main and verify histories. |
| `ufc-fast4-01-1` | Fast | Name a broad way a UFC fight can end. | KO, TKO, doctor and corner stoppage overlap as outcome hierarchy; make outcomes mutually intelligible before Fast. |
| `ufc-fast4-05-1` | Fast | Name a wrestling or grappling position, action, or control term used in MMA. | Current prompt mixes positions, controls, takedowns and ground-and-pound; split into a clear, single-category easy prompt. |
| `ufc-fast4-06-1` | Fast | Name a foul in MMA. | Good intuitive fouls concept, but verify current jurisdiction/rule wording and synonym treatment. |
| `ufc-fast4-09-1` | Fast | Name something a fighter may deal with during or immediately after a difficult UFC weight cut. | Cut symptom, result and recovery into one category instead of a complicated three-category prompt. |
| `ufc-fast5-03-1` | Fast → Main | Name a UFC fighter known for elite cardio. | Elite cardio stars are less instant and partly subjective; specialize criteria or shift to Main. |
| `ufc-fast5-04-1` | Fast → Main | Name a UFC fighter famous for toughness or durability. | Toughness/durability reputation is more nuanced than easy Fast; bound the recognition criteria. |
| `ufc-fast5-06-1` | Fast → Main | Name a UFC fighter known for relentless pressure. | Pressure fighters require fighting-style knowledge; too specialist and overlaps wrestler themes. |
| `ufc-fast5-07-1` | Fast → Main | Name a UFC fighter known for counterstriking. | Counterstriking specialists are technical; niche Main candidate, avoid general elite-striker overlap. |
| `ufc-fast5-09-1` | Fast → Main | Name a fighter remembered for a huge UFC upset. | Major UFC upsets are historic named events, better suited to Main with verified bout contexts. |

## 3. Retire the underlying concept

| Representative question ID | Existing round | Existing prompt | Reason |
|---|---|---|---|
| `ufc-main-06-1` | Main | Name a UFC fighter famous for trash talk or personality. | Same trash-talk associations as better, shorter Fast5-05; 'or personality' also makes the valid universe vague. |
| `ufc-main-10-1` | Main | Name a famous UFC heavyweight. | Identical 'famous heavyweight' theme appears in Fast2-10, where it is more appropriate. |
| `ufc-main-16-1` | Main | Name a UFC accomplishment that can define a fighter's legacy. | A 'legacy-defining accomplishment' mixes incomparable achievements and arbitrary accepted answers. |
| `ufc-main-17-1` | Main | Name a UFC weight class. | Weight classes are already in easier Fast1-01; same-ranked board duplicates that prompt. |
| `ufc-main-18-1` | Main | Name a trait every elite UFC fighter needs. | Generic 'trait every elite fighter needs' creates nearly unbounded, subjective valid answers. |
| `ufc-main-19-1` | Main | Name a technique you might see finish a UFC fight. | Finishing techniques overlap with the clearer Fast4-02/03/04 attack questions. |
| `ufc-fast1-07-1` | Fast | Name a UFC fighter known for knockout power. | Same knockout-power fighter prompt as Main02, including very similar answer sets. |
| `ufc-fast1-08-1` | Fast | Name a UFC fighter known for submissions. | Same submission-specialist fighter prompt as Main03. |
| `ufc-fast1-09-1` | Fast | Name a UFC fighter known for wrestling. | Same wrestler fighter prompt as Main04. |
| `ufc-fast1-10-1` | Fast | Name a UFC fighter known for elite striking. | Same elite-striking fighter prompt as Main05. |
| `ufc-fast3-01-1` | Fast | Name a UFC champion known for a long or dominant reign. | Same dominant-title-reign board as Main07, with only cosmetic phrasing. |
| `ufc-fast3-03-1` | Fast | Name a famous UFC rivalry. | Exact same rivalry board as Main13 across multiple variants. |
| `ufc-fast3-04-1` | Fast | Name an iconic UFC fight. | Exact same iconic-fight board as Main14 across multiple variants. |
| `ufc-fast3-10-1` | Fast | Name a UFC arena, host city, or named event site fans know. | Same arena/site theme as Main15 and likewise mixes city with venue. |
| `ufc-fast4-07-1` | Fast | Name something judges or fans look at when deciding who won a round. | Rules-based judging criteria are easily misstated; fan opinion, takedowns, damage are not eight independent formal criteria. |
| `ufc-fast5-01-1` | Fast | Name a UFC fighter you associate with clutch championship moments. | Which champion is 'clutch' or 'trustworthy' is an unbounded opinion; not fair to strike. |
| `ufc-fast5-02-1` | Fast | Name a UFC fighter known for scary power. | Scary power is semantically the same knockout-power concept as Main02. |
| `ufc-fast5-08-1` | Fast | Name a UFC fighter known for elite grappling. | Elite grapplers broadly repeats submissions, wrestling and pressure subjects. |
| `ufc-fast5-10-1` | Fast | Name a UFC fighter known for a memorable walkout. | Memorable walkouts/entrances duplicate Main20 nearly word for word. |

## Confirmed high-value defects and checks

1. **Repeat inflation:** seven-player Daily game (2 Main, 5 Fast) cannot equate different phrasings of the same family with separate experiences. Initial inventory has 70 actual families, plus many cross-family duplicate subjects. Cross-game collision checks are still needed.
2. **Misclassified variant:** `ufc-main-12-5` asks for a fighter **nickname** but its family answers are gyms/teams. Retire the off-topic variant, keep Main12's first gym/team concept, and review how accepted gym team variants flow.
3. **Identical main/fast prompts:** `ufc-main-10-1` and `ufc-fast2-10-1` both say 'Name a famous UFC heavyweight'; `ufc-main-13-1` and `ufc-fast3-03-1` both say 'Name a famous UFC rivalry'; `ufc-main-17-1` and `ufc-fast1-01-1` both ask for a UFC weight class, among many more overlap families.
4. **Synonym/answer-universe care:** one variant each is only a *starting* point. `ufc-fast4-03` fist strikes has extra valid answers spread across variants; preserve them in the accepted list. `ufc-main-12` variants change subject to fighter nicknames in one case, so never blindly union all their names. The family expander already filters exact ranked/off-board duplicates; therefore the duplicate source entry for knee-to-grounded-head (`ufc-fast4-06`) is a *source hygiene* issue, **not** evidence of a live bank crash.
5. **Modern rule specificity:** `ufc-fast4-06` must be checked against *current* adopted MMA rules by jurisdiction; older UFC/ABC pages contain prior versions of grounded-fighter and 12–6-elbow language. Use the current ABC unified-rules reference at https://www.abcboxing.com/unified-rules/ and the event's sanctioning commission before stating a move is illegal.
6. **Name grading:** existing engine supports unique first names/surnames, many typos and per-name aliases; keep ambiguity safeguards. Add regression cases for each kept/reworked board, including GSP, Khabib, Jon, surnames, common typos, Brazilian spellings and shorthand. Current Fast boards' accepted candidate universes are especially important: *subjectively reasonable fan answers must not become arbitrary strikes*.
7. **Diversity:** Fast Money must be genuinely easy: recognizable fighters, weight classes, fight mechanics, broadcasts, corner routines, fans and event culture. Avoid historic title lists, specific gyms, specialist criteria, opinion-based titles, and multiple categories mixed into one prompt. Main should use the stronger recall/factual topics.

## Work remaining before any curation becomes active

- Independently fact-check all eight rankings and accepted extras of the 20 kept and 31 rewrite candidates; broaden valid categories, check aliases and typos, and prove all retained source IDs are historically safe.
- Invent additional genuinely different concept families toward ~70 Main / ~140 Fast, refusing filler and subjective yes/no boundaries. The number of new themes required is substantial; reconsider target if distinct quality topics run out.
- Implement future-only seven-question round generation with no repeat IDs or **semantic concepts** for at least **20 consecutive UFC Sports Feud Daily appearances** (2 Main + 5 Fast), cross-round distinct categories, recent cross-game fact keys, fixed historical publication/scores, and comprehensive rotation simulation. The current production selector hard-requires 100 Main/250 Fast, so no immediate delete or source-length change.
- Keep every past Daily published question/result immutable. Exact PR head must pass CI; separate explicit authorization needed before any merge/deployment.

## Complete source-by-source disposition

The companion CSV has **all 350 exact existing authored question IDs**, each existing prompt, original/proposed round, keep/rewrite/retire disposition, reason, current eight ranked names and current family-level extra-answer count. It is a review record, not a code-generated filter for the live app.

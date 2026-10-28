# UFC Sports Feud — bank quality audit, first editorial pass (review only)

Date: 2026-10-23. Source: `main` commit `3d9d2f9fecb7ba0fa67f87f93d772d94a1542f97`. This branch changes **no runtime selection, scoring, stored questions, daily history or production**. This is a staged shortlist and 350-item inventory, **not** a completed factual certification or authorization to activate a smaller pool.

## Objective and scope

Player requirement: Main contains **two challenging eight-answer boards**; **Fast Money is five considerably easier, immediate-recall prompts** in 50 seconds. Both need recognizable answers and robust legitimate aliases; wrong strikes on correct shorthand are defects. Quality beats quotas. Every source prompt belongs to one of 70 families (20 Main, 50 Fast), five variants per family, for 350 prompts. Existing live code requires 100 Main / 250 Fast, so **do not delete source rows or wire a shortlist without replacing those production cardinality assumptions**, a future-only release gate, repeat-history validation, and archived Daily results protection.

## First-pass results (proposals, not production changes)

- **16 Main concepts** pass first-pass novelty/format triage, **18 Fast concepts** appear suitable for quick single-answer recall; **three additional Fast concepts are on the difficulty border** (The Ultimate Fighter alumni, UFC pioneers, named referees). Source variants 2–5 are held for distinct-content proof, not automatically counted as separate questions.
- **Fast concepts needing Main rework/relocation** include 155/170/185/heavyweight titleholder lists, multi-division title histories, five specific training camps, PRIDE, Hall of Fame history, scoring nuances, and highly technical fighter attributes. Merely asking for one of eight does not make a historical-fact question 'easy'.
- **Cross-round collisions:** Main vs Fast separately ask knockout artists, submission fighters, famous heavyweights, famous rivalries, iconic bouts, trash talkers, dominant champions, striking/wrestling styles, famous arenas and walkouts. Main weight classes and Fast weight classes even share the exact opening prompt. Curating one concept to one round is preferable to disguising duplicates with wording.
- **Clear malformed semantic variant:** `ufc-main-12-5` is 'Name a famous UFC fighter nickname' inside a **gym/team** family with gym answers. It should never be offered in that form.
- Existing authored variants often shuffle their eight answer rankings: a different ranking is **not** proof of a different question. Those points are editorial preference, **not actual survey frequencies**; fairness of both ranked and off-board valid answers needs specific review.
- The current matching engine already handles case/diacritics, punctuation, many misspellings, explicitly curated aliases, and *unique* first names / surnames. It correctly returns ambiguity instead of awarding an unqualified short name to multiple people. Verify on real materialized packs, including off-board names and non-person answers. No blind global fuzzy allowance that can credit the wrong fighter.

**Coverage caution:** This read all 350 prompts and inspected question-family construction, selected ranked answers, common aliases and matching behavior. It has **not** independently checked every historical fact, ranked order, or off-board answer against primary sources, tested recent published repeats in the database, or certified all 34 candidates for release. Sample high-risk title check: UFC officially confirms Justin Gaethje won the *undisputed* lightweight championship at UFC Freedom 250 on June 14, 2026 (https://www.ufc.com/news/ufc-freedom-250-results-highlights-interviews). For judging questions prefer current official unified-rules text rather than treating old secondary scoring descriptions as authoritative.

## Family-by-family editorial triage

'candidate' means test further for future inclusion; 'move/hold' means rethink as a Main question; 'retire/hold' means likely semantic collision/unfair prompt, preserve for history until final decision. For any candidate family only variant `-1` is provisionally selected; `-2…5` remain on hold. The test file locks this narrow candidate population without changing the actual publisher.

| IDs in authored family | Round | Representative original prompt | First-pass status | Reason |
|---|---|---|---|---|
| `ufc-main-01-1…5` | Main | Name a fighter who belongs in almost any UFC all-time-great conversation. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-02-1…5` | Main | Name a UFC fighter famous for knockout power. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-03-1…5` | Main | Name a UFC fighter famous for submissions. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-04-1…5` | Main | Name a UFC fighter famous for wrestling. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-05-1…5` | Main | Name a UFC fighter known for elite striking. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-06-1…5` | Main | Name a UFC fighter famous for trash talk or personality. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-07-1…5` | Main | Name a UFC champion remembered for a dominant title reign. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-08-1…5` | Main | Name a UFC lightweight star from the modern era. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-09-1…5` | Main | Name a UFC welterweight star from the modern era. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-10-1…5` | Main | Name a famous UFC heavyweight. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-11-1…5` | Main | Name a legendary women's UFC fighter. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-12-1…5` | Main | Name a gym or team strongly associated with UFC fighters. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-13-1…5` | Main | Name a famous UFC rivalry. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-14-1…5` | Main | Name an iconic UFC fight. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-15-1…5` | Main | Name a UFC arena, host city, or named event site strongly associated with major cards. | **hold** | Venue + city + site mixed in one answer category; scope/grading concerns |
| `ufc-main-16-1…5` | Main | Name a UFC accomplishment that can define a fighter's legacy. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-main-17-1…5` | Main | Name a UFC weight class. | **hold** | Identical weight-class idea already proposed in Fast Money |
| `ufc-main-18-1…5` | Main | Name a trait every elite UFC fighter needs. | **hold** | Vague trait question creates an overly subjective answer universe |
| `ufc-main-19-1…5` | Main | Name a technique you might see finish a UFC fight. | **hold** | Finish techniques overlap easier Fast submission/technique questions |
| `ufc-main-20-1…5` | Main | Name a UFC fighter known for a memorable walkout or entrance. | **candidate** | Main candidate; check ranked/off-board completeness |
| `ufc-fast1-01-1…5` | Fast | Name a UFC weight class. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast1-02-1…5` | Fast | Name an undisputed UFC lightweight champion from any era. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast1-03-1…5` | Fast | Name an undisputed UFC welterweight champion from any era. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast1-04-1…5` | Fast | Name an undisputed UFC middleweight champion from any era. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast1-05-1…5` | Fast | Name an undisputed UFC heavyweight champion from any era. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast1-06-1…5` | Fast | Name a UFC fighter who won titles in two weight classes. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast1-07-1…5` | Fast | Name a UFC fighter known for knockout power. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast1-08-1…5` | Fast | Name a UFC fighter known for submissions. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast1-09-1…5` | Fast | Name a UFC fighter known for wrestling. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast1-10-1…5` | Fast | Name a UFC fighter known for elite striking. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast2-01-1…5` | Fast | Name a UFC fighter associated with American Top Team. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast2-02-1…5` | Fast | Name a UFC fighter associated with AKA. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast2-03-1…5` | Fast | Name a UFC fighter associated with City Kickboxing. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast2-04-1…5` | Fast | Name a UFC fighter associated with Team Alpha Male. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast2-05-1…5` | Fast | Name a UFC fighter associated with Jackson Wink. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast2-06-1…5` | Fast | Name a famous Brazilian UFC fighter. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast2-07-1…5` | Fast | Name a famous UFC fighter from the UK or Ireland. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast2-08-1…5` | Fast | Name a UFC fighter from Dagestan or strongly associated with Dagestani MMA. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast2-09-1…5` | Fast | Name a famous women's UFC fighter. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast2-10-1…5` | Fast | Name a famous UFC heavyweight. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast3-01-1…5` | Fast | Name a UFC champion known for a long or dominant reign. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast3-02-1…5` | Fast | Name a fighter who became famous through The Ultimate Fighter. | **hold** | Borderline for 50-second Fast Money; prove casual-fan recall or move to Main |
| `ufc-fast3-03-1…5` | Fast | Name a famous UFC rivalry. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast3-04-1…5` | Fast | Name an iconic UFC fight. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast3-05-1…5` | Fast | Name an early UFC pioneer. | **hold** | Borderline for 50-second Fast Money; prove casual-fan recall or move to Main |
| `ufc-fast3-06-1…5` | Fast | Name a PRIDE star who later fought in the UFC. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast3-07-1…5` | Fast | Name a fighter inducted into the UFC Hall of Fame for their career. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast3-08-1…5` | Fast | Name a UFC commentator or analyst fans recognize. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast3-09-1…5` | Fast | Name a referee UFC fans recognize. | **hold** | Borderline for 50-second Fast Money; prove casual-fan recall or move to Main |
| `ufc-fast3-10-1…5` | Fast | Name a UFC arena, host city, or named event site fans know. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-01-1…5` | Fast | Name a broad way a UFC fight can end. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-02-1…5` | Fast | Name a common MMA submission. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-03-1…5` | Fast | Name a punch or fist strike commonly used in MMA. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-04-1…5` | Fast | Name a type of kick used in MMA. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-05-1…5` | Fast | Name a wrestling or grappling position, action, or control term used in MMA. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-06-1…5` | Fast | Name a foul in MMA. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-07-1…5` | Fast | Name something judges or fans look at when deciding who won a round. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast4-08-1…5` | Fast | Name a UFC fight statistic. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-09-1…5` | Fast | Name something a fighter may deal with during or immediately after a difficult UFC weight cut. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast4-10-1…5` | Fast | Name something a fighter's corner does between rounds. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast5-01-1…5` | Fast | Name a UFC fighter you associate with clutch championship moments. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast5-02-1…5` | Fast | Name a UFC fighter known for scary power. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast5-03-1…5` | Fast | Name a UFC fighter known for elite cardio. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast5-04-1…5` | Fast | Name a UFC fighter famous for toughness or durability. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast5-05-1…5` | Fast | Name a UFC fighter famous for trash talk. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast5-06-1…5` | Fast | Name a UFC fighter known for relentless pressure. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast5-07-1…5` | Fast | Name a UFC fighter known for counterstriking. | **move/hold** | Specialist, historical, affiliation, or judgment topic is too demanding for timed Fast; consider Main rewrite |
| `ufc-fast5-08-1…5` | Fast | Name a UFC fighter known for elite grappling. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |
| `ufc-fast5-09-1…5` | Fast | Name a fighter remembered for a huge UFC upset. | **candidate** | Fast candidate; single intuitive answer, not a specialist roster |
| `ufc-fast5-10-1…5` | Fast | Name a UFC fighter known for a memorable walkout. | **retire/hold** | Cross-round semantic overlap, subjective boundary, or repeated fighter-style family; requires rewrite to become distinct |

## Required before activating a reduced bank

1. Individually assess **each of the eight ranked answers and every accepted/off-board answer** for the 34 shortlists (plus held-rewrite material), checking major omissions, misleading names, wrong era, ambiguity and ranking assumptions. Capture sources and specific keep/rewrite/retire dispositions, not just passing tests.
2. Generate **new genuinely distinct, easy Fast concepts** where needed; 18 Fast ideas can fill only three nonrepeating five-question Fast Money rounds (with three prompts left over), so publishing that bare shortlist would repeat too soon. Do not expand by rewording those same 18 questions.
3. Check complete 2+5 Daily packs; prove reasonable difficulty contrast, plausible valid answers, and representative typos and standalone names on **every retained board**. Closed lists must truly be complete. Resolve fuzzy-match false positives and main-board subjective strike boundaries.
4. Use **actual published Daily history** plus simulated future windows to prevent repeat facts *across separate Sports Feud Daily runs*, and semantic duplicates across Average Fan, Bar Trivia, Millionaire and other UFC games. Preserve old user-visible question snapshots, scores and leaderboard details.
5. When approved, implement versioned, future-only curation; remove exactly-sized 100/250 restrictions **for that version only**, keep historical source readers, confirm exact PR head green, then request owner-approved merge/deployment.

## All 350 authored questions: per-ID first-pass disposition

'hold-variant' means not independently different just because another five-question-family phrasing and rank order exists. These are draft proposals for review, not irreversible deletions.

| Question ID | First-pass disposition | Exact source prompt |
|---|---|---|
| `ufc-main-01-1` | candidate | Name a fighter who belongs in almost any UFC all-time-great conversation. |
| `ufc-main-01-2` | hold-variant | Name a UFC fighter whose career defines an era. |
| `ufc-main-01-3` | hold-variant | Name a fighter casual fans might still recognize as a UFC legend. |
| `ufc-main-01-4` | hold-variant | Name a UFC champion whose legacy goes far beyond one title win. |
| `ufc-main-01-5` | hold-variant | Name a fighter you would expect in a UFC Mount Rushmore debate. |
| `ufc-main-02-1` | candidate | Name a UFC fighter famous for knockout power. |
| `ufc-main-02-2` | hold-variant | Name a fighter whose hands make every exchange feel dangerous. |
| `ufc-main-02-3` | hold-variant | Name a UFC fighter fans associate with one-shot power. |
| `ufc-main-02-4` | hold-variant | Name a fighter you would never want to stand and trade with. |
| `ufc-main-02-5` | hold-variant | Name a UFC knockout artist almost every MMA fan recognizes. |
| `ufc-main-03-1` | candidate | Name a UFC fighter famous for submissions. |
| `ufc-main-03-2` | hold-variant | Name a fighter whose ground game can end a fight suddenly. |
| `ufc-main-03-3` | hold-variant | Name a UFC fighter you associate with dangerous submission offense. |
| `ufc-main-03-4` | hold-variant | Name a fighter you would hate to grapple with on the mat. |
| `ufc-main-03-5` | hold-variant | Name a submission specialist MMA fans recognize quickly. |
| `ufc-main-04-1` | candidate | Name a UFC fighter famous for wrestling. |
| `ufc-main-04-2` | hold-variant | Name a fighter whose takedowns became a major part of his identity. |
| `ufc-main-04-3` | hold-variant | Name a UFC star you associate with relentless grappling pressure. |
| `ufc-main-04-4` | hold-variant | Name a fighter opponents dreaded having on top of them. |
| `ufc-main-04-5` | hold-variant | Name a wrestler who turned elite grappling into UFC success. |
| `ufc-main-05-1` | candidate | Name a UFC fighter known for elite striking. |
| `ufc-main-05-2` | hold-variant | Name a fighter whose stand-up skill became part of his reputation. |
| `ufc-main-05-3` | hold-variant | Name a UFC star you would pick for a technical striking showcase. |
| `ufc-main-05-4` | hold-variant | Name a fighter opponents had to respect at kickboxing range. |
| `ufc-main-05-5` | hold-variant | Name a striker whose UFC style looked especially polished. |
| `ufc-main-06-1` | candidate | Name a UFC fighter famous for trash talk or personality. |
| `ufc-main-06-2` | hold-variant | Name a fighter who could sell a fight before entering the cage. |
| `ufc-main-06-3` | hold-variant | Name a UFC personality fans loved or hated hearing on the microphone. |
| `ufc-main-06-4` | hold-variant | Name a fighter whose words became part of the promotion. |
| `ufc-main-06-5` | hold-variant | Name a UFC star who knew how to create attention outside the cage. |
| `ufc-main-07-1` | candidate | Name a UFC champion remembered for a dominant title reign. |
| `ufc-main-07-2` | hold-variant | Name a fighter who made a UFC division feel like it belonged to them. |
| `ufc-main-07-3` | hold-variant | Name a champion whose title run created an aura of dominance. |
| `ufc-main-07-4` | hold-variant | Name a UFC fighter associated with repeated championship defenses. |
| `ufc-main-07-5` | hold-variant | Name a champion who ruled a division for a meaningful stretch. |
| `ufc-main-08-1` | candidate | Name a UFC lightweight star from the modern era. |
| `ufc-main-08-2` | hold-variant | Name a fighter you strongly associate with the UFC lightweight division. |
| `ufc-main-08-3` | hold-variant | Name a lightweight whose UFC career produced major fights. |
| `ufc-main-08-4` | hold-variant | Name a 155-pound fighter almost every MMA fan recognizes. |
| `ufc-main-08-5` | hold-variant | Name a lightweight you would expect in a division history conversation. |
| `ufc-main-09-1` | candidate | Name a UFC welterweight star from the modern era. |
| `ufc-main-09-2` | hold-variant | Name a fighter you strongly associate with the UFC welterweight division. |
| `ufc-main-09-3` | hold-variant | Name a welterweight whose UFC career produced major fights. |
| `ufc-main-09-4` | hold-variant | Name a 170-pound fighter almost every MMA fan recognizes. |
| `ufc-main-09-5` | hold-variant | Name a welterweight you would expect in a division history conversation. |
| `ufc-main-10-1` | candidate | Name a famous UFC heavyweight. |
| `ufc-main-10-2` | hold-variant | Name a fighter you strongly associate with the UFC heavyweight division. |
| `ufc-main-10-3` | hold-variant | Name a heavyweight whose UFC career produced major moments. |
| `ufc-main-10-4` | hold-variant | Name a big man almost every MMA fan recognizes. |
| `ufc-main-10-5` | hold-variant | Name a heavyweight you would expect in a division history conversation. |
| `ufc-main-11-1` | candidate | Name a legendary women's UFC fighter. |
| `ufc-main-11-2` | hold-variant | Name a woman whose career helped shape UFC history. |
| `ufc-main-11-3` | hold-variant | Name a female UFC star almost every MMA fan recognizes. |
| `ufc-main-11-4` | hold-variant | Name a women's champion you would include in an all-time UFC conversation. |
| `ufc-main-11-5` | hold-variant | Name a fighter who helped make women's MMA a major part of the UFC. |
| `ufc-main-12-1` | candidate | Name a gym or team strongly associated with UFC fighters. |
| `ufc-main-12-2` | hold-variant | Name a famous MMA camp that has produced UFC talent. |
| `ufc-main-12-3` | hold-variant | Name a training team serious UFC fans recognize. |
| `ufc-main-12-4` | hold-variant | Name a gym you would expect to hear mentioned during a UFC broadcast. |
| `ufc-main-12-5` | hold-variant | Name a famous UFC fighter nickname. |
| `ufc-main-13-1` | candidate | Name a famous UFC rivalry. |
| `ufc-main-13-2` | hold-variant | Name a pair of fighters whose bad blood made the fight bigger. |
| `ufc-main-13-3` | hold-variant | Name a UFC feud fans still remember. |
| `ufc-main-13-4` | hold-variant | Name a rivalry that produced major UFC promotion and drama. |
| `ufc-main-13-5` | hold-variant | Name two fighters whose rivalry became part of UFC history. |
| `ufc-main-14-1` | candidate | Name an iconic UFC fight. |
| `ufc-main-14-2` | hold-variant | Name a UFC fight fans still recommend to new viewers. |
| `ufc-main-14-3` | hold-variant | Name a bout that belongs in a UFC history montage. |
| `ufc-main-14-4` | hold-variant | Name a fight remembered for incredible action or stakes. |
| `ufc-main-14-5` | hold-variant | Name a UFC matchup people still talk about years later. |
| `ufc-main-15-1` | hold | Name a UFC arena, host city, or named event site strongly associated with major cards. |
| `ufc-main-15-2` | hold-variant | Name a UFC arena, host city, or named event site where you can picture a huge card. |
| `ufc-main-15-3` | hold-variant | Name an arena, host city, or named event site tied to memorable UFC nights. |
| `ufc-main-15-4` | hold-variant | Name a UFC arena, host city, or named event site fans associate with big fights. |
| `ufc-main-15-5` | hold-variant | Name an arena, host city, or named event site familiar to longtime UFC fans. |
| `ufc-main-16-1` | candidate | Name a UFC accomplishment that can define a fighter's legacy. |
| `ufc-main-16-2` | hold-variant | Name something a UFC fighter would love on a career résumé. |
| `ufc-main-16-3` | hold-variant | Name an achievement that can turn a great UFC career into a legendary one. |
| `ufc-main-16-4` | hold-variant | Name a milestone MMA fans use in legacy debates. |
| `ufc-main-16-5` | hold-variant | Name something a fighter can accomplish that fans remember for years. |
| `ufc-main-17-1` | hold | Name a UFC weight class. |
| `ufc-main-17-2` | hold-variant | Name a division on a UFC card. |
| `ufc-main-17-3` | hold-variant | Name a UFC weight class fans discuss constantly. |
| `ufc-main-17-4` | hold-variant | Name a division that has produced famous champions. |
| `ufc-main-17-5` | hold-variant | Name a weight class a UFC fighter can compete in. |
| `ufc-main-18-1` | hold | Name a trait every elite UFC fighter needs. |
| `ufc-main-18-2` | hold-variant | Name a quality that can separate a contender from the rest of the division. |
| `ufc-main-18-3` | hold-variant | Name something coaches want to see in a championship-level fighter. |
| `ufc-main-18-4` | hold-variant | Name a fighter trait fans notice quickly. |
| `ufc-main-18-5` | hold-variant | Name a quality that matters when a UFC fight gets difficult. |
| `ufc-main-19-1` | hold | Name a technique you might see finish a UFC fight. |
| `ufc-main-19-2` | hold-variant | Name a move that can end an MMA fight suddenly. |
| `ufc-main-19-3` | hold-variant | Name a technique fighters drill because it can produce a finish. |
| `ufc-main-19-4` | hold-variant | Name an MMA attack fans recognize immediately. |
| `ufc-main-19-5` | hold-variant | Name a finishing technique that can change a UFC fight in seconds. |
| `ufc-main-20-1` | candidate | Name a UFC fighter known for a memorable walkout or entrance. |
| `ufc-main-20-2` | hold-variant | Name a fighter whose walk to the cage feels like part of the show. |
| `ufc-main-20-3` | hold-variant | Name a UFC star with an entrance fans look forward to. |
| `ufc-main-20-4` | hold-variant | Name a fighter whose walkout helps create a big-fight atmosphere. |
| `ufc-main-20-5` | hold-variant | Name a UFC fighter whose entrance has become part of the fan experience. |
| `ufc-fast1-01-1` | candidate | Name a UFC weight class. |
| `ufc-fast1-01-2` | hold-variant | Name a division you can see on a UFC card. |
| `ufc-fast1-01-3` | hold-variant | Name a UFC division with famous champions. |
| `ufc-fast1-01-4` | hold-variant | Name a weight class MMA fans debate constantly. |
| `ufc-fast1-01-5` | hold-variant | Name a division a UFC fighter can compete in. |
| `ufc-fast1-02-1` | move/hold | Name an undisputed UFC lightweight champion from any era. |
| `ufc-fast1-02-2` | hold-variant | Name a fighter who has held the undisputed UFC lightweight title. |
| `ufc-fast1-02-3` | hold-variant | Name a former or current undisputed UFC 155-pound champion. |
| `ufc-fast1-02-4` | hold-variant | Name a lightweight whose résumé includes undisputed UFC gold. |
| `ufc-fast1-02-5` | hold-variant | Name another fighter on the undisputed UFC lightweight champions list. |
| `ufc-fast1-03-1` | move/hold | Name an undisputed UFC welterweight champion from any era. |
| `ufc-fast1-03-2` | hold-variant | Name a fighter who has held the undisputed UFC welterweight title. |
| `ufc-fast1-03-3` | hold-variant | Name a former or current undisputed UFC 170-pound champion. |
| `ufc-fast1-03-4` | hold-variant | Name a welterweight whose résumé includes undisputed UFC gold. |
| `ufc-fast1-03-5` | hold-variant | Name another fighter on the undisputed UFC welterweight champions list. |
| `ufc-fast1-04-1` | move/hold | Name an undisputed UFC middleweight champion from any era. |
| `ufc-fast1-04-2` | hold-variant | Name a fighter who has held the undisputed UFC middleweight title. |
| `ufc-fast1-04-3` | hold-variant | Name a former or current undisputed UFC 185-pound champion. |
| `ufc-fast1-04-4` | hold-variant | Name a middleweight whose résumé includes undisputed UFC gold. |
| `ufc-fast1-04-5` | hold-variant | Name another fighter on the undisputed UFC middleweight champions list. |
| `ufc-fast1-05-1` | move/hold | Name an undisputed UFC heavyweight champion from any era. |
| `ufc-fast1-05-2` | hold-variant | Name a fighter who has held the undisputed UFC heavyweight title. |
| `ufc-fast1-05-3` | hold-variant | Name a former or current undisputed UFC heavyweight champion. |
| `ufc-fast1-05-4` | hold-variant | Name a heavyweight whose résumé includes undisputed UFC gold. |
| `ufc-fast1-05-5` | hold-variant | Name another fighter on the undisputed UFC heavyweight champions list. |
| `ufc-fast1-06-1` | move/hold | Name a UFC fighter who won titles in two weight classes. |
| `ufc-fast1-06-2` | hold-variant | Name a fighter with UFC championships in two divisions. |
| `ufc-fast1-06-3` | hold-variant | Name a UFC champion who proved capable of winning gold at multiple weights. |
| `ufc-fast1-06-4` | hold-variant | Name a fighter whose UFC résumé includes titles in two weight classes. |
| `ufc-fast1-06-5` | hold-variant | Name a multi-division UFC champion. |
| `ufc-fast1-07-1` | retire/hold | Name a UFC fighter known for knockout power. |
| `ufc-fast1-07-2` | hold-variant | Name a fighter whose punches can end a fight instantly. |
| `ufc-fast1-07-3` | hold-variant | Name a UFC star fans associate with big knockouts. |
| `ufc-fast1-07-4` | hold-variant | Name a fighter you would never want to trade shots with. |
| `ufc-fast1-07-5` | hold-variant | Name a UFC knockout artist almost every MMA fan knows. |
| `ufc-fast1-08-1` | retire/hold | Name a UFC fighter known for submissions. |
| `ufc-fast1-08-2` | hold-variant | Name a fighter whose ground game can end a fight quickly. |
| `ufc-fast1-08-3` | hold-variant | Name a UFC star fans associate with dangerous submissions. |
| `ufc-fast1-08-4` | hold-variant | Name a fighter you would hate to grapple with. |
| `ufc-fast1-08-5` | hold-variant | Name a submission specialist serious MMA fans know. |
| `ufc-fast1-09-1` | retire/hold | Name a UFC fighter known for wrestling. |
| `ufc-fast1-09-2` | hold-variant | Name a fighter whose takedowns became part of his identity. |
| `ufc-fast1-09-3` | hold-variant | Name a UFC star associated with relentless grappling pressure. |
| `ufc-fast1-09-4` | hold-variant | Name a fighter opponents hated having on top of them. |
| `ufc-fast1-09-5` | hold-variant | Name a wrestler who turned elite grappling into UFC success. |
| `ufc-fast1-10-1` | retire/hold | Name a UFC fighter known for elite striking. |
| `ufc-fast1-10-2` | hold-variant | Name a fighter whose stand-up skill became part of his reputation. |
| `ufc-fast1-10-3` | hold-variant | Name a UFC star you would pick for a striking showcase. |
| `ufc-fast1-10-4` | hold-variant | Name a fighter opponents had to respect at kickboxing range. |
| `ufc-fast1-10-5` | hold-variant | Name a striker whose UFC style looked especially polished. |
| `ufc-fast2-01-1` | move/hold | Name a UFC fighter associated with American Top Team. |
| `ufc-fast2-01-2` | hold-variant | Name a notable fighter who has trained at American Top Team. |
| `ufc-fast2-01-3` | hold-variant | Name a UFC name you connect with ATT. |
| `ufc-fast2-01-4` | hold-variant | Name a fighter whose career has included American Top Team. |
| `ufc-fast2-01-5` | hold-variant | Name another UFC fighter associated with American Top Team. |
| `ufc-fast2-02-1` | move/hold | Name a UFC fighter associated with AKA. |
| `ufc-fast2-02-2` | hold-variant | Name a notable fighter who has trained at American Kickboxing Academy. |
| `ufc-fast2-02-3` | hold-variant | Name a UFC name you connect with AKA. |
| `ufc-fast2-02-4` | hold-variant | Name a fighter whose career has included AKA. |
| `ufc-fast2-02-5` | hold-variant | Name another UFC fighter associated with American Kickboxing Academy. |
| `ufc-fast2-03-1` | move/hold | Name a UFC fighter associated with City Kickboxing. |
| `ufc-fast2-03-2` | hold-variant | Name a notable fighter who has trained at City Kickboxing. |
| `ufc-fast2-03-3` | hold-variant | Name a UFC name you connect with City Kickboxing. |
| `ufc-fast2-03-4` | hold-variant | Name a fighter whose rise included the City Kickboxing team. |
| `ufc-fast2-03-5` | hold-variant | Name another UFC fighter associated with the Auckland-based City Kickboxing camp. |
| `ufc-fast2-04-1` | move/hold | Name a UFC fighter associated with Team Alpha Male. |
| `ufc-fast2-04-2` | hold-variant | Name a notable fighter who trained with Team Alpha Male. |
| `ufc-fast2-04-3` | hold-variant | Name a UFC name you connect with Team Alpha Male. |
| `ufc-fast2-04-4` | hold-variant | Name a fighter whose career included the Sacramento-based camp. |
| `ufc-fast2-04-5` | hold-variant | Name another UFC fighter associated with Team Alpha Male. |
| `ufc-fast2-05-1` | move/hold | Name a UFC fighter associated with Jackson Wink. |
| `ufc-fast2-05-2` | hold-variant | Name a notable fighter who trained with Jackson Wink MMA. |
| `ufc-fast2-05-3` | hold-variant | Name a UFC name you connect with the Albuquerque camp. |
| `ufc-fast2-05-4` | hold-variant | Name a fighter whose career included Jackson Wink. |
| `ufc-fast2-05-5` | hold-variant | Name another UFC fighter associated with Greg Jackson's team. |
| `ufc-fast2-06-1` | candidate | Name a famous Brazilian UFC fighter. |
| `ufc-fast2-06-2` | hold-variant | Name a Brazilian fighter who became a major UFC star. |
| `ufc-fast2-06-3` | hold-variant | Name a UFC legend from Brazil. |
| `ufc-fast2-06-4` | hold-variant | Name a Brazilian champion or contender MMA fans recognize. |
| `ufc-fast2-06-5` | hold-variant | Name a fighter who helped build Brazil's UFC legacy. |
| `ufc-fast2-07-1` | candidate | Name a famous UFC fighter from the UK or Ireland. |
| `ufc-fast2-07-2` | hold-variant | Name a British or Irish fighter who became a major UFC name. |
| `ufc-fast2-07-3` | hold-variant | Name a UFC star from the British Isles. |
| `ufc-fast2-07-4` | hold-variant | Name a UK or Irish fighter MMA fans recognize quickly. |
| `ufc-fast2-07-5` | hold-variant | Name another recognizable UFC fighter from the UK or Ireland. |
| `ufc-fast2-08-1` | move/hold | Name a UFC fighter from Dagestan or strongly associated with Dagestani MMA. |
| `ufc-fast2-08-2` | hold-variant | Name a fighter connected to the Dagestani wrestling pipeline. |
| `ufc-fast2-08-3` | hold-variant | Name a UFC name fans associate with Dagestan. |
| `ufc-fast2-08-4` | hold-variant | Name a UFC fighter from Dagestan or closely tied to its MMA scene. |
| `ufc-fast2-08-5` | hold-variant | Name a Dagestani fighter serious UFC fans recognize. |
| `ufc-fast2-09-1` | retire/hold | Name a famous women's UFC fighter. |
| `ufc-fast2-09-2` | hold-variant | Name a female fighter who became a major UFC star. |
| `ufc-fast2-09-3` | hold-variant | Name a women's champion or contender almost every MMA fan knows. |
| `ufc-fast2-09-4` | hold-variant | Name a fighter who helped shape women's MMA in the UFC. |
| `ufc-fast2-09-5` | hold-variant | Name a woman you would expect in a UFC history conversation. |
| `ufc-fast2-10-1` | retire/hold | Name a famous UFC heavyweight. |
| `ufc-fast2-10-2` | hold-variant | Name a heavyweight who became a major UFC star. |
| `ufc-fast2-10-3` | hold-variant | Name a big man whose UFC fights drew major attention. |
| `ufc-fast2-10-4` | hold-variant | Name a heavyweight almost every MMA fan recognizes. |
| `ufc-fast2-10-5` | hold-variant | Name a fighter you would expect in a UFC heavyweight history conversation. |
| `ufc-fast3-01-1` | move/hold | Name a UFC champion known for a long or dominant reign. |
| `ufc-fast3-01-2` | hold-variant | Name a fighter who defended a UFC title repeatedly. |
| `ufc-fast3-01-3` | hold-variant | Name a champion who made a division feel like it belonged to them. |
| `ufc-fast3-01-4` | hold-variant | Name a UFC titleholder associated with sustained dominance. |
| `ufc-fast3-01-5` | hold-variant | Name a champion whose reign became a major part of UFC history. |
| `ufc-fast3-02-1` | hold | Name a fighter who became famous through The Ultimate Fighter. |
| `ufc-fast3-02-2` | hold-variant | Name a notable UFC fighter who appeared on The Ultimate Fighter. |
| `ufc-fast3-02-3` | hold-variant | Name a UFC name strongly connected with TUF. |
| `ufc-fast3-02-4` | hold-variant | Name a fighter whose career got a major boost from The Ultimate Fighter. |
| `ufc-fast3-02-5` | hold-variant | Name a TUF alum MMA fans still remember. |
| `ufc-fast3-03-1` | move/hold | Name a famous UFC rivalry. |
| `ufc-fast3-03-2` | hold-variant | Name a pair of fighters whose bad blood made the fight bigger. |
| `ufc-fast3-03-3` | hold-variant | Name a UFC feud fans still remember. |
| `ufc-fast3-03-4` | hold-variant | Name a rivalry that produced major UFC promotion and drama. |
| `ufc-fast3-03-5` | hold-variant | Name two fighters whose rivalry became part of UFC history. |
| `ufc-fast3-04-1` | move/hold | Name an iconic UFC fight. |
| `ufc-fast3-04-2` | hold-variant | Name a UFC fight you would show a new MMA fan. |
| `ufc-fast3-04-3` | hold-variant | Name a bout that belongs in a UFC history montage. |
| `ufc-fast3-04-4` | hold-variant | Name a fight remembered for incredible action or stakes. |
| `ufc-fast3-04-5` | hold-variant | Name a UFC matchup people still talk about years later. |
| `ufc-fast3-05-1` | hold | Name an early UFC pioneer. |
| `ufc-fast3-05-2` | hold-variant | Name a fighter strongly associated with the UFC's early years. |
| `ufc-fast3-05-3` | hold-variant | Name an old-school UFC name longtime fans recognize. |
| `ufc-fast3-05-4` | hold-variant | Name a fighter who helped establish the UFC before the modern era. |
| `ufc-fast3-05-5` | hold-variant | Name a pioneer you would expect in a conversation about early UFC history. |
| `ufc-fast3-06-1` | move/hold | Name a PRIDE star who later fought in the UFC. |
| `ufc-fast3-06-2` | hold-variant | Name a fighter associated with both PRIDE and the UFC. |
| `ufc-fast3-06-3` | hold-variant | Name a Japanese-era MMA legend who eventually appeared in the UFC. |
| `ufc-fast3-06-4` | hold-variant | Name a fighter whose résumé connects PRIDE history with UFC history. |
| `ufc-fast3-06-5` | hold-variant | Name a former PRIDE standout UFC fans recognize. |
| `ufc-fast3-07-1` | move/hold | Name a fighter inducted into the UFC Hall of Fame for their career. |
| `ufc-fast3-07-2` | hold-variant | Name a UFC Hall of Famer honored for their career. |
| `ufc-fast3-07-3` | hold-variant | Name a fighter in the UFC Hall of Fame's Modern or Pioneer Wing. |
| `ufc-fast3-07-4` | hold-variant | Name a UFC legend individually inducted into the Hall of Fame. |
| `ufc-fast3-07-5` | hold-variant | Name a fighter whose career earned an individual UFC Hall of Fame induction. |
| `ufc-fast3-08-1` | candidate | Name a UFC commentator or analyst fans recognize. |
| `ufc-fast3-08-2` | hold-variant | Name a voice you associate with UFC broadcasts. |
| `ufc-fast3-08-3` | hold-variant | Name someone who has called or analyzed UFC fights. |
| `ufc-fast3-08-4` | hold-variant | Name a UFC broadcaster whose voice is familiar to MMA fans. |
| `ufc-fast3-08-5` | hold-variant | Name a commentator or analyst strongly connected with UFC coverage. |
| `ufc-fast3-09-1` | hold | Name a referee UFC fans recognize. |
| `ufc-fast3-09-2` | hold-variant | Name an MMA referee you have seen inside the Octagon. |
| `ufc-fast3-09-3` | hold-variant | Name a referee associated with major UFC fights. |
| `ufc-fast3-09-4` | hold-variant | Name an official serious UFC fans know by name. |
| `ufc-fast3-09-5` | hold-variant | Name a referee whose name UFC fans have heard before a major fight. |
| `ufc-fast3-10-1` | candidate | Name a UFC arena, host city, or named event site fans know. |
| `ufc-fast3-10-2` | hold-variant | Name a UFC arena, host city, or named event site you could picture on a major card. |
| `ufc-fast3-10-3` | hold-variant | Name an arena, host city, or named event site tied to memorable UFC nights. |
| `ufc-fast3-10-4` | hold-variant | Name a familiar UFC arena, host city, or named event site. |
| `ufc-fast3-10-5` | hold-variant | Name an arena, host city, or named event site strongly associated with major UFC events. |
| `ufc-fast4-01-1` | candidate | Name a broad way a UFC fight can end. |
| `ufc-fast4-01-2` | hold-variant | Name a basic result type you can see on a UFC fight result. |
| `ufc-fast4-01-3` | hold-variant | Name a common official outcome for an MMA fight. |
| `ufc-fast4-01-4` | hold-variant | Name a broad finish or result type in the UFC. |
| `ufc-fast4-01-5` | hold-variant | Name a simple UFC fight outcome. |
| `ufc-fast4-02-1` | candidate | Name a common MMA submission. |
| `ufc-fast4-02-2` | hold-variant | Name a submission you might see finish a UFC fight. |
| `ufc-fast4-02-3` | hold-variant | Name a grappling hold MMA fans recognize. |
| `ufc-fast4-02-4` | hold-variant | Name a submission fighters drill constantly. |
| `ufc-fast4-02-5` | hold-variant | Name a tap-out technique used in the UFC. |
| `ufc-fast4-03-1` | candidate | Name a punch or fist strike commonly used in MMA. |
| `ufc-fast4-03-2` | hold-variant | Name a striking technique you might see in the UFC. |
| `ufc-fast4-03-3` | hold-variant | Name a legal attack fighters throw on the feet. |
| `ufc-fast4-03-4` | hold-variant | Name a basic strike MMA athletes train. |
| `ufc-fast4-03-5` | hold-variant | Name a strike that can hurt an opponent in the Octagon. |
| `ufc-fast4-04-1` | candidate | Name a type of kick used in MMA. |
| `ufc-fast4-04-2` | hold-variant | Name a kicking technique you might see in the UFC. |
| `ufc-fast4-04-3` | hold-variant | Name a kick fighters use to attack at range. |
| `ufc-fast4-04-4` | hold-variant | Name a kick commentators identify during UFC fights. |
| `ufc-fast4-04-5` | hold-variant | Name a striking weapon that comes from the legs. |
| `ufc-fast4-05-1` | candidate | Name a wrestling or grappling position, action, or control term used in MMA. |
| `ufc-fast4-05-2` | hold-variant | Name a wrestling or grappling action a fighter might use after closing distance. |
| `ufc-fast4-05-3` | hold-variant | Name a wrestling or grappling position, action, or control term commentators mention in UFC fights. |
| `ufc-fast4-05-4` | hold-variant | Name a position, action, or control term from the wrestling or grappling side of MMA. |
| `ufc-fast4-05-5` | hold-variant | Name a wrestling or grappling term associated with controlling an opponent. |
| `ufc-fast4-06-1` | candidate | Name a foul in MMA. |
| `ufc-fast4-06-2` | hold-variant | Name something illegal inside the UFC Octagon. |
| `ufc-fast4-06-3` | hold-variant | Name an action that can draw a warning or point deduction. |
| `ufc-fast4-06-4` | hold-variant | Name a foul referees watch for in a UFC fight. |
| `ufc-fast4-06-5` | hold-variant | Name an illegal technique under the unified MMA rules. |
| `ufc-fast4-07-1` | move/hold | Name something judges or fans look at when deciding who won a round. |
| `ufc-fast4-07-2` | hold-variant | Name a factor that can influence how an MMA round is scored. |
| `ufc-fast4-07-3` | hold-variant | Name something that helps a fighter make a round look convincing. |
| `ufc-fast4-07-4` | hold-variant | Name a performance area people debate on UFC scorecards. |
| `ufc-fast4-07-5` | hold-variant | Name something that can matter when comparing two close MMA rounds. |
| `ufc-fast4-08-1` | candidate | Name a UFC fight statistic. |
| `ufc-fast4-08-2` | hold-variant | Name a number shown during or after an MMA fight. |
| `ufc-fast4-08-3` | hold-variant | Name a stat fans use to describe what happened in a bout. |
| `ufc-fast4-08-4` | hold-variant | Name a fight metric you might see on a UFC broadcast. |
| `ufc-fast4-08-5` | hold-variant | Name a statistic analysts use when breaking down a UFC fight. |
| `ufc-fast4-09-1` | candidate | Name something a fighter may deal with during or immediately after a difficult UFC weight cut. |
| `ufc-fast4-09-2` | hold-variant | Name a symptom, problem, or recovery step tied to a hard UFC weight cut. |
| `ufc-fast4-09-3` | hold-variant | Name a symptom, outcome, or recovery need after a rough UFC weight cut. |
| `ufc-fast4-09-4` | hold-variant | Name something a fighter might deal with while cutting a lot of weight or rehydrating afterward. |
| `ufc-fast4-09-5` | hold-variant | Name something fans watch for when a UFC weight cut goes badly or recovery begins. |
| `ufc-fast4-10-1` | candidate | Name something a fighter's corner does between rounds. |
| `ufc-fast4-10-2` | hold-variant | Name a job performed by a UFC corner team. |
| `ufc-fast4-10-3` | hold-variant | Name something coaches might do during the one-minute break. |
| `ufc-fast4-10-4` | hold-variant | Name a responsibility of the people in a fighter's corner. |
| `ufc-fast4-10-5` | hold-variant | Name something that can happen on the stool between rounds. |
| `ufc-fast5-01-1` | retire/hold | Name a UFC fighter you associate with clutch championship moments. |
| `ufc-fast5-01-2` | hold-variant | Name a fighter you would trust in a five-round title fight. |
| `ufc-fast5-01-3` | hold-variant | Name a UFC star who seemed built for the biggest stage. |
| `ufc-fast5-01-4` | hold-variant | Name a fighter whose legacy includes huge moments under pressure. |
| `ufc-fast5-01-5` | hold-variant | Name a champion you would want when everything is on the line. |
| `ufc-fast5-02-1` | retire/hold | Name a UFC fighter known for scary power. |
| `ufc-fast5-02-2` | hold-variant | Name a fighter whose one-shot power changes every exchange. |
| `ufc-fast5-02-3` | hold-variant | Name a UFC athlete opponents cannot afford to get hit clean by. |
| `ufc-fast5-02-4` | hold-variant | Name a fighter you associate with explosive knockout power. |
| `ufc-fast5-02-5` | hold-variant | Name a fighter whose power is part of the scouting report immediately. |
| `ufc-fast5-03-1` | candidate | Name a UFC fighter known for elite cardio. |
| `ufc-fast5-03-2` | hold-variant | Name a fighter you would trust to keep a brutal pace for five rounds. |
| `ufc-fast5-03-3` | hold-variant | Name a UFC athlete famous for not slowing down. |
| `ufc-fast5-03-4` | hold-variant | Name a fighter whose conditioning became part of the game plan. |
| `ufc-fast5-03-5` | hold-variant | Name a fighter you associate with relentless late-round pace. |
| `ufc-fast5-04-1` | candidate | Name a UFC fighter famous for toughness or durability. |
| `ufc-fast5-04-2` | hold-variant | Name a fighter you remember absorbing incredible punishment. |
| `ufc-fast5-04-3` | hold-variant | Name a UFC athlete with a reputation for being hard to put away. |
| `ufc-fast5-04-4` | hold-variant | Name a fighter whose chin became part of the legend. |
| `ufc-fast5-04-5` | hold-variant | Name a fighter fans associate with surviving wars. |
| `ufc-fast5-05-1` | retire/hold | Name a UFC fighter famous for trash talk. |
| `ufc-fast5-05-2` | hold-variant | Name a fighter who could sell a fight with a microphone. |
| `ufc-fast5-05-3` | hold-variant | Name a UFC personality known for talking before the cage door closes. |
| `ufc-fast5-05-4` | hold-variant | Name a fighter whose interviews became part of the entertainment. |
| `ufc-fast5-05-5` | hold-variant | Name a UFC star who knew how to create attention with words. |
| `ufc-fast5-06-1` | candidate | Name a UFC fighter known for relentless pressure. |
| `ufc-fast5-06-2` | hold-variant | Name a fighter who makes opponents work every second. |
| `ufc-fast5-06-3` | hold-variant | Name a UFC athlete you associate with walking opponents down. |
| `ufc-fast5-06-4` | hold-variant | Name a fighter whose pace can make the cage feel small. |
| `ufc-fast5-06-5` | hold-variant | Name a pressure fighter fans recognize immediately. |
| `ufc-fast5-07-1` | move/hold | Name a UFC fighter known for counterstriking. |
| `ufc-fast5-07-2` | hold-variant | Name a fighter who is dangerous when opponents overreach. |
| `ufc-fast5-07-3` | hold-variant | Name a UFC striker you associate with making people pay for mistakes. |
| `ufc-fast5-07-4` | hold-variant | Name a fighter whose timing can punish aggressive opponents. |
| `ufc-fast5-07-5` | hold-variant | Name a counterstriker serious MMA fans recognize. |
| `ufc-fast5-08-1` | retire/hold | Name a UFC fighter known for elite grappling. |
| `ufc-fast5-08-2` | hold-variant | Name a fighter whose ground game can dominate a matchup. |
| `ufc-fast5-08-3` | hold-variant | Name a UFC athlete you would hate to face in a scramble. |
| `ufc-fast5-08-4` | hold-variant | Name a fighter fans associate with control and submissions. |
| `ufc-fast5-08-5` | hold-variant | Name a grappler who turned mat skill into major UFC success. |
| `ufc-fast5-09-1` | candidate | Name a fighter remembered for a huge UFC upset. |
| `ufc-fast5-09-2` | hold-variant | Name a UFC underdog who shocked a champion or superstar. |
| `ufc-fast5-09-3` | hold-variant | Name a fighter whose upset win stunned MMA fans. |
| `ufc-fast5-09-4` | hold-variant | Name a UFC name tied to a major 'nobody saw that coming' moment. |
| `ufc-fast5-09-5` | hold-variant | Name a fighter who proved betting odds do not decide a fight. |
| `ufc-fast5-10-1` | retire/hold | Name a UFC fighter known for a memorable walkout. |
| `ufc-fast5-10-2` | hold-variant | Name a fighter whose walk to the cage feels like part of the show. |
| `ufc-fast5-10-3` | hold-variant | Name a UFC star with an entrance fans look forward to. |
| `ufc-fast5-10-4` | hold-variant | Name a fighter whose walkout helps create a big-fight atmosphere. |
| `ufc-fast5-10-5` | hold-variant | Name a UFC fighter whose entrance has become part of the fan experience. |

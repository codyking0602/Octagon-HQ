# Average Fan Stage 2W — complete Bar Trivia expansion-wave semantic overlap screen

Date: October 15, 2026. Parent main `c7a22bddf47263b84a505cf025aa3f308996e66e`, following Stage 2V PR #1934. All changes are to **future candidate selection only**; no archived official Daily questions, setups, scores, or player attempts are rewritten.

## Full cross-game bank source coverage

Earlier screening had emphasized the original Bar Trivia bank and the initial NFL/CFB/UFC evergreen and easy expansion waves. This pass also checked every subsequently imported `barTriviaEvergreenNflWave4`, `barTriviaEvergreenCfbWave4`, and `barTriviaEvergreenUfcWave4` through `Wave7` file, **270 additional Bar Trivia source rows across those six late-wave files**. These are imported by the current canonical `BAR_TRIVIA_QUESTION_BANK`, not hypothetical future content. Direct prompt equivalence is insufficient; question ID/fact/answer/outcome were compared to distinguish **one identical sports fact** from distinct facts about the same player, opponent or franchise.

Decisions: **20 newly identified authored Average Fan same-fact copies withdrawn: NFL 6, CFB 4, UFC 10.** The original Bar Trivia question remains. Related but substantively different facts (e.g. Royce Gracie won UFC 1 vs UFC 4, or a fighter faced someone in a different event) remain separate. Previously retired matches are not counted again.

| Sport | Retired Average Fan source fact | Existing Bar Trivia question | Duplicate sporting fact |
| --- | --- | --- | --- |
| NFL | `who-dat` | `nfl-r1-who-dat` | New Orleans Saints chant |
| NFL | `bills-mafia` | `nfl-r1-bills-mafia` | Buffalo Bills fan nickname |
| NFL | `skol-vikings` | `nfl-r1-skol` | Minnesota Vikings chant |
| NFL | `fly-eagles-fly` | `nfl-r1-fly-eagles-fly` | Philadelphia Eagles fight song |
| NFL | `bengals-who-dey` | `nfl-r1-who-dey` | Cincinnati Bengals chant |
| NFL | `wide-right` | `nfl-r2-wide-right-norwood` | Scott Norwood Super Bowl XXV missed kick |
| CFB | `white-out` | `cfb-easy-white-out` | Penn State stadium White Out |
| CFB | `midnight-yell` | `cfb-r1-midnight-yell` | Texas A&M Midnight Yell |
| CFB | `script-ohio` | `cfb-r1-script-ohio` | Ohio State marching band formation |
| CFB | `renfrow-title-catch` | `cfb-r2-2016-title-catch` | Hunter Renfrow 2016 title-winning touchdown |
| UFC | `title-rounds` | `ufc-easy2-title-rounds` | standard scheduled UFC championship bout: 5 rounds |
| UFC | `ufc3-winner` | `ufc-r1-ufc3-winner` | Steve Jennum won UFC 3 as an alternate |
| UFC | `ufc4-final` | `ufc-r2-ufc4-final` | Royce Gracie beat Dan Severn at UFC 4 |
| UFC | `ufc6-winner` | `ufc-r1-ufc6-winner` | Oleg Taktarov won UFC 6 |
| UFC | `first-wheel-kick` | `ufc-r3-first-wheel-kick-ko` | Edson Barboza first wheel-kick KO |
| UFC | `gonzaga-crocop` | `ufc-r1-gonzaga-crocop` | Gabriel Gonzaga head-kicked Cro Cop |
| UFC | `fox-first` | `ufc-r1-fox-first-winner` | Junior dos Santos won inaugural UFC on FOX bout |
| UFC | `lewis-volkov` | `ufc-final-lewis-volkov-quote` | Derrick Lewis's Volkov knockout and postfight quote |
| UFC | `daley-koscheck` | `ufc-final-daley-koscheck-release` | Paul Daley after-bell punch at UFC 113 |
| UFC | `first-125` | `ufc-r1-first-125-fight` | Demetrious Johnson–Ian McCall inaugural flyweight bout |

Bar Trivia question ids are checked in an automated regression; withdrawn future Average Fan source prefixes must be absent from selected banks. The source rows remain available for historic data reconstruction, if necessary; official published results are unchanged.

## Definitive Stage 2 content-source inventory

This separates authored **source rows** from balanced final playable inventory and dynamically generated subjects:

| Sport | Authored source collections | Authored rows | Generated scope |
| --- | --- | ---: | --- |
| NFL | 51 X’s & O’s, 23 true/false, 47 player, 46 team, 46 history, 15 Finals | **228** | Football candidate generator exists but present evergreen NFL bank deliberately selects authored `00-` and authored Finals, not generic player-registry filler |
| CFB | 25 tradition, 17 curated hard facts, 8 true/false, 13 Finals | **63** | Player-career and program-registry generator; school/position, Heisman, year/selection, conference, one-Final alternatives |
| UFC | 42 Octagon IQ, 31 history, 10 Final facts | **83** | **133 factual-ledger fighters** (82 ranked core + 51 expansion); division, dated bouts/results, identity and Final variants |
| **Total** | | **374 source rows** | Generated candidate variants and current events are **additional** |

Counts mean source-row inventory, not guarantee of selected playable bank size. Previous source passes documented authored UFC IQ/history, CFB traditions, authored Finals; Stage 2V screened all authored NFL rows. The new wave coverage exposes semantic repeats missed by earlier mechanically normalized-string checks. Automated similarity is a **candidate finding aid**, not evidence that two questions share a fact.

## Exactly what remains to close Stage 2

- [ ] **Surviving authored questions:** complete independently sourced fact, plausible distractor, aliases, and difficulty judgment of the remaining selected NFL/CFB/UFC questions, including checking that a “kept” source candidate really survives the capped selector. Prior source screens are not blanket factual certification.
- [ ] **Generated CFB:** validate canonical player-career/program facts and every generated template family against season/school affiliation and playable grade; spot-check rendered candidates across all grades and Finals.
- [ ] **Generated UFC:** inspect all 133 fighter ledgers (fight/date/opponent/finish/title-result) at the family level, verify uniqueness and gender/weight-appropriate distractors, avoid date-only obscurity, then check selected generated identities, dated bouts and Finals.
- [ ] **Future Daily boards:** editorially inspect deterministic future seeded Daily compositions (including all three sports and Final tiers) and supplement existing 120-day automated rotation/identity checks; verify question quality rather than merely absence of repeated ids.
- [ ] **Ship/verify:** exact PR-head typecheck, complete tests, SQL/runtime proof, merge, Cloudflare/Supabase delivery, live verification. Never mutate the six historical published Average Fan Daily setups (54 prompts) already audited in Stage 2U.

**Stage 2 remains in progress**. Stage 3 Blind Resume must not begin based on authored-source coverage alone. This finite checklist is the scope control: no new open-ended pass series without a concretely documented uncovered fact group, selected candidate or actual generated board defect.

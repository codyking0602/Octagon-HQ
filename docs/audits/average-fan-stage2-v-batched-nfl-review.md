# Average Fan Stage 2V — batched NFL authored-bank editorial screen

Date: October 15, 2026. Against main `721cb916d32b36fefab01506596d4affcdb91566`. This pass replaces micro-PR cleanup with a single NFL authored-bank screen and consolidated changes. Historical persisted Dailies and user results are immutable; only future Average Fan bank candidates change.

## Complete source-row inventory for this batch

| Source collection | Authored entries examined |
| --- | ---: |
| NFL X’s & O’s definitions | 51 |
| NFL true/false | 23 |
| NFL player records/landmarks | 47 |
| NFL franchise/fan/history prompts | 46 |
| NFL historical plays/games | 46 |
| NFL authored Final candidates | 15 |
| **Total source rows screened** | **228** |

**Batch decisions (source candidate level, before future pool balancing):** **205 unchanged**, **3 converted to four-choice**, **20 withdrawn** as direct semantic fact repeats with existing Bar Trivia or Millionaire material, **0 unresolved new changes**. “Unchanged” means no new defect identified during this source-row screen; it does **not** certify independent primary-source verification of every statistic in every surviving row, guarantee it is selected by the production balancing cap, or close the review of generated candidates. The source-review record is deliberately separate from the smaller selected playable inventory.

### Exact repeat withdrawals (20)

Keep the existing Bar Trivia or Millionaire version, not another rephrasing of the same sporting fact:

| Average Fan source ID fragment | Existing cross-game question/fact |
| --- | --- |
| `00-player:beast-mode` | Bar Trivia `nfl-easy-beast-mode`: Marshawn Lynch’s nickname |
| `00-player:megatron` | Bar Trivia `nfl-r1-megatron`: Calvin Johnson’s nickname |
| `00-player:gronk` | Bar Trivia `nfl-easy-gronk`: Rob Gronkowski’s nickname |
| `00-player:prime-time` | Bar Trivia `nfl-r1-prime-time`: Deion Sanders’s nickname |
| `00-player:sheriff` | Bar Trivia `nfl-easy-sheriff`: Peyton Manning’s nickname |
| `00-player:emmitt-record` | Millionaire: Emmitt Smith’s all-time NFL rushing record |
| `00-player:mahomes-drafted-chiefs` | Millionaire: franchise that drafted Patrick Mahomes |
| `00-team:lambeau` | Bar Trivia `nfl-easy2-lambeau-home`: Packers home at Lambeau |
| `00-team:arrowhead` | Bar Trivia `nfl-easy-arrowhead`: Chiefs home at Arrowhead |
| `00-team:dawg-pound` | Bar Trivia `nfl-easy2-dawg-pound`: Browns Dawg Pound |
| `00-team:steel-curtain` | Bar Trivia `nfl-r1-steel-curtain`: Pittsburgh’s nickname |
| `00-team:monsters-midway` | Bar Trivia `nfl-easy-monsters-midway`: Bears nickname |
| `00-team:orange-crush` | Bar Trivia `nfl-r1-orange-crush`: Denver defense |
| `00-team:hogs` | Bar Trivia `nfl-r1-the-hogs`: Washington offensive line |
| `00-team:85-bears` | Bar Trivia `nfl-easy2-super-bowl-shuffle`: 1985 Bears |
| `00-team:cowboys-three-four` | Millionaire: Dallas won three Super Bowls in four seasons |
| `00-history:holy-roller` | Bar Trivia `nfl-r2-holy-roller-opponent`: 1978 opponent |
| `00-history:first-sb-touchdown` | Bar Trivia `nfl-final-first-super-bowl-td`: first Super Bowl touchdown, Max McGee |
| `00-final-regraded:bucs-home` | Bar Trivia `nfl-r3-first-super-bowl-home-team` and `nfl-final-first-home-sb-winner`: Tampa Bay’s home Super Bowl |
| `final-authored:mike-jones` | Bar Trivia `nfl-r1-one-yard-short-tackle`: Super Bowl XXXIV final tackle |

All withdrawals are matched by source candidate **ID prefix** at the future bank selection gate, so source rows remain inspectable and archived official Daily questions/results are not changed.

### Three NFL prompt-format repairs

- `00-team:six-super-bowls`: Steelers + Patriots reached six wins; requiring a specifically ordered **two-team free-text string** was unfair. Use four authored, distinct team-pair choices. The Patriots’ [official 2019 game note](https://www.patriots.com/news/game-notes-patriots-tie-pittsburgh-with-six-super-bowl-wins) confirms the pair.
- `00-history:ice-bowl-teams`: Packers + Cowboys; swap two-team free text for four plausible pairs, with an additional Vikings/Packers distractor. [NFL official historical archive](https://nflmediaarchive.nfl.net/nflmedia/News/1997news/icebowl.htm) verifies the matchup.
- `00-history:first-mnf`: Browns + Jets; replace ordering-sensitive free text with four distinct pairings. The [Browns’ own historical article](https://www.clevelandbrowns.com/news/top-10-browns-season-openers-5-september-21-1970-13260769) confirms the original September 21, 1970 match.

Cross-game overlap judgments use **fact identity**, not only exact prompt strings. The 20 duplicates above are answered by the same underlying nickname, record, team, game, or play even when the other game inverts the wording. The audit also preserves genuinely different facts about shared people or games: e.g. Cooper Kupp’s 2021 triple crown and Super Bowl MVP are not treated as interchangeable achievements.

## Regression/quality gate

The existing bank tests already check allowed lengths, grading, aliases, distractors, cross-game automated overlap, and 120-day deterministic Daily simulations for football and UFC. This batch adds regressions for all 20 withdrawn source IDs and four-choice selected versions of the three unordered team pairs.

**Remaining before Stage 2 completion:** independently source-check the surviving NFL stats/distractors not explicitly corroborated here; audit CFB player/program generated candidate data and actual future deterministic Daily compositions; finish UFC ranked-core and expansion generated identity/fight/Final review across all subjects. Historic production Daily questions remain reviewed as documented in Stage 2U. Do not mark Stage 2 complete based on this source-row screening alone.

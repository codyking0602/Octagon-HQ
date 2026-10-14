# Average Fan Stage 2C — CFB same-fact Finals / identity format review

Date: 2026-10-14. **Editorial increment, not Stage 2 completion.**
Scope: reviewed duplicate authored families, one NFL rule wording, and the generated UFC multi-opponent answer format. Existing immutable published Daily challenges and grades are not rewritten.

## Source-checked CFB keep/retire decisions

The following are *three duplicated fact families*, not six genuinely independent questions. Preserve the harder authored four-choice Final and retire the overlapping ordinary Grade-5 candidate. Neither paraphrasing the question nor choosing a different grade makes the repeated fact new material.

| Shared factual anchor | Retire ordinary ID prefix | Preserve authored Final | Primary-source evidence |
| --- | --- | --- | --- |
| Indiana–Michigan State rivalry trophy = Old Brass Spittoon | `average-fan:cfb:authored:00-g5:old-brass-spittoon:` | `cfb-final-00-tradition-spittoon` | [Michigan State Athletics](https://msuspartans.com/news/2025/10/14/football-spartans-travel-to-no-3-indiana-in-battle-for-old-brass-spittoon) |
| Illinois–Ohio State wooden-turtle trophy = Illibuck | `average-fan:cfb:authored:00-g5:illibuck:` | `cfb-final-01-tradition-illibuck` | [Ohio State traditions](https://ohiostatebuckeyes.com/sports/2018/6/4/football-traditions) |
| 2015 Michigan State touchdown on Michigan botched punt = Jalen Watts-Jackson | `average-fan:cfb:authored:00-g5:watts-jackson-2015:` | `cfb-final-02-history-watts-jackson` | [Michigan State Oct. 17, 2015 game recap](https://msuspartans.com/news/2015/10/17/no_7_michigan_state_stuns_no_12_michigan_27_23_on_final_play) |

The CFB selected-bank ceiling falls from 161 to 158, and its ordinary Grade-5 ceiling from 26 to 23. **Do not refill** retired slots with lower-confidence source material to hit a round number.

## NFL rule wording

The old true/false prompt about a fourth-down fumble was overly easy to misread as forbidding *recovery* by a teammate. A teammate may recover the fumble, but cannot continue running; the play becomes dead (subject to rule details). The new prompt asks specifically about *advancing* after recovery and is false. [Official NFL 2026 rulebook landing page](https://operations.nfl.com/rules-officiating/2026-nfl-rulebook); [NFL playing rule 8, section 7, article 5](https://operations.nfl.com/media/ntif5hxb/2025-nfl-rulebook-final.pdf). The question ID is unchanged, so immutable previously published Daily evidence remains intact.

## UFC bounded fighter identity

The generated three-win puzzle and two generated protected Final identity families previously asked open-ended “Which UFC fighter…” with an unrestricted short-answer grader. Cross-ledger uniqueness is a useful safeguard, but the source ledger is a curated **133-subject** selection rather than the entire history of UFC fighters. An unbounded open-ended identity prompt could invite a defensible answer outside that 133-person universe.

Keep the existing full-signature ledger collision checks, and use a four-choice format for these three generated identity families. Distractors are still selected from the canonical fighter ledger, and all four candidates pass through the existing same-signature and schema checks. This prevents penalizing an outside-ledger answer when it was never presented as an answer option. The source of the UFC record is [the official UFC statistics reference](https://statleaders.ufc.com/); this PR does **not** claim that every fighter's individual bout history has been independently reverified.

## Same-surname alias collision in NFL Finals

Two separate protected Finals correctly answer **Mike Jones** (Super Bowl XXXIV goal-line tackle) and **Jacoby Jones** (Super Bowl XLVII kickoff-return score), but both authored `Jones` as a short-answer alias. This accepts the same underspecified answer for two different identities. Keep both source-backed questions and full-name answers; screen authored aliases against the existing cross-bank surname owner map and remove `Jones` as a standalone accepted answer for both. [NFL retrospective of the tackle](https://www.nfl.com/videos/nfl-100-greatest-no-11-rams-stop-titans-at-1-yard-line-in-sb-xxxiv); [NFL on Jacoby Jones](https://www.nfl.com/news/jacoby-jones-former-ravens-wr-and-super-bowl-xlvii-star-dies-at-40).

## Regression & remaining audit scope

Regression guards verify removal of the three CFB duplicate families, the smaller grade ceiling, the unambiguous fourth-down true/false item, and four-choice UFC generated multi-opponent identity questions. Existing broad bank tests continue to check answer/distractor/schema constraints, same-fact keys, current-event expiry, cross-game overlaps, and simulated Daily board runs.

**Outstanding Stage 2:** independent source checks and documented keep/rewrite/retire/hold disposition for *every remaining selected NFL, CFB and UFC question*, including automatically generated fighters and college programs; inspect actual seeded eight-tile Daily boards and Finals for meaningful difficulty, plausible-but-false distractors, aliases and repeats. Do not mark Stage 2 complete based on this narrow review.

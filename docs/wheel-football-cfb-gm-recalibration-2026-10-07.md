# CFB Wheel of Football / short-form The GM recalibration — October 7, 2026

## Locked methodology

Current demonstrated college ability at the player's real position. Approximately 55–60% current 2026 evidence, 30–35% 2025 stabilizer, remainder older context. No NIL or player price, recruiting stars, school prestige, NFL projection or potential bonus. The original October 3 full-board position audits remain historical snapshots.

## Approved grade changes

| School | Family | Player | Previous | Effective Oct 7 | Football reason |
| --- | --- | --- | ---: | ---: | --- |
| Alabama | QB | Keelon Russell | 90 | 93 | Five-game breakout with real current passing and creation; 93 aligns with Stockton/Sayin rather than overpaying for recruiting. |
| Missouri | QB | Austin Simmons | 86 | 91 | New 2026 starts and the Florida performance justify 91; nearby Maiava/Mestemaker remain 92. |
| Pittsburgh | QB | Holden Geriner | new | 79 | Current Pitt QB after Heintschel ACL; 19-of-26 for 219 yards and two touchdowns in 2026 relief but thin established starting evidence. |
| Tennessee | QB | George MacIntyre | new | 79 | Named current Tennessee starter for Arkansas; 14-of-20 for 148 yards and one touchdown before first start, so low starter grade. |
| Tennessee | RB | DeSean Bishop | 89 | 92 | Proven 2025 value and 220 rushing yards/three TDs against Auburn move Bishop into the Fletcher/Frazier 92 neighborhood. |
| Indiana | RB | Turbo Richard | 91 | 93 | Sustained explosive current running value, in the LJ Martin 93 tier. |
| Texas | Front Seven | Justin Cryer | 77 | 85 | Four Texas starts and nine-tackle games against ranked teams invalidate the previous limited-role 77 description. |
| Texas | Front Seven | Hero Kanu | 83 | 86 | Current Texas starting interior responsibility and disruption support a solid 86, independently of NIL. |
| Alabama | Front Seven | Devan Thompkins | 83 | 87 | Current starting impact has outgrown the previous rotation-grade wording. |
| Missouri | Front Seven | Nicholas Rodriguez | 88 | 90 | Sustained current SEC tackling leadership supports an impact-starter 90. |
| Alabama | Front Seven | Luke Metz | new | 87 | Current Alabama starting linebacker, with a 13-tackle game versus South Carolina and seven against Mississippi State; no projection credit. |
| Texas Tech | Secondary | Brice Pollock | 85 | 91 | Two interceptions against Colorado, Thorpe weekly recognition and a strong 2025 body justify low-90 coverage ability. |
| SMU | Secondary | Jarvis Lee | 76 | 86 | Current SMU responsibility and existing production are significantly beyond 76 depth level. |
| Notre Dame | Secondary | Luke Talich | 80 | 86 | Current starting assignment responsibility and documented ball production support 86. |
| Texas | Secondary | Jelani McDonald | 87 | 90 | 2026 coverage/safety work and 2025 stabilizer justify the low-90 neighborhood. |
| Texas | Secondary | Graceson Littleton | 86 | 89 | Current secondary role and demonstrated college work support a high-80s grade. |
| Texas Tech | Secondary | Malik Esquerra | 76 | 83 | Increased 2026 workload supports a low-80s starter/depth grade, with the newer sample still a cap. |

## Eligibility/role corrections

- Alabama: Luke Metz replaces Fatutoa Henry in the six-option Front Seven shortlist; Henry's previous grade remains archived.
- Pittsburgh: Holden Geriner is the current QB option after Mason Heintschel's season-ending ACL. Heintschel's original 84 remains preserved for historical snapshots.
- Tennessee: George MacIntyre becomes the current QB option after the October 7 first-team announcement. Faizon Brandon's underlying 77 is preserved; no injury-based ability penalty.

## AP Top 25

- October 4, 2026 poll, 1–25; Pittsburgh is No. 25, Kentucky is unranked. The 68-school National pool is untouched.
- The client snapshot and private database poll are updated together. The old **September 27** snapshot remains in historical database rows.

## Runtime contract

- New 2026-10-07 versioned rows are inserted into the private `wheel_football_grade_authority` table. `resolve_wheel_football_grade_snapshot` chooses latest effective row for new picks.
- Existing completed results, past grade versions and already frozen picks remain unchanged.
- The GM should consume these same position-specific grades when its short CFB implementation launches. No GM/NIL price changes are made in this PR.

## Relevant evidence

- AP October 4 poll: https://apnews.com/article/7db03c4123afa589863a8b53f4db520c
- Pitt statement: https://pittsburghpanthers.com/news/2026/10/3/statement-from-pitt-football-head-coach-pat-narduzzi-on-mason-heintschel
- Tennessee Oct. 7 starter report: https://www.reuters.com/sports/reports-tennessee-start-qb-george-macintyre-vs-arkansas--flm-2026-10-07/
- Existing October 3 positional audits and official five-game production, as recorded in `changeLog`.

# CFB The GM — October 8, 2026 player research calibration (partial, isolated PR)

## Explicit quality status

This PR does **not** complete the requested 468 individual performance/NIL/eligibility studies.
The 468-player source roster is preserved and still playable; **131 specific players** have sourced individual development/departure calibration records, while **337** use clearly marked provisional development and/or market priors. These fallbacks must never be called researched.
The existing Wheel of Football HQ grades are unchanged. There are **no new HQ grade proposals** in this isolated change.

## Measured calibration distribution (partial population)

These are computed from the ledger for the **131 individually researched** development profiles, **not** representative league-wide estimates for the remaining 337 generic-prior cases.

| Primary group | Total CFB GM roster | Individual profiles completed |
| --- | ---: | ---: |
| QB | 25 | 16 |
| RB | 57 | 17 |
| WR | 86 | 21 |
| TE | 28 | 8 |
| Front Seven | 145 | 36 |
| Secondary | 127 | 33 |
| **Total** | **468** | **131** |

- **Researched cohort development average:** breakout 9.2%, improve 28.3%, steady 46.8%, decline 15.6%; max annual gain 4.3 grade points and loss 5.1 grade points before HQ ceiling clipping. Distribution is intentionally skewed because obvious special cases were researched first, not a population benchmark.
- **NIL:** among the 48 On3 matched names, Year 1 market estimate range **$1.00m–$6.50m**, median **$1.80m**, mean **$2.12m**. These are ranked-source sampled stars, not full 468-player NIL medians, and cannot substitute for future research into the 420 unmatched athletes.
- **Eligibility:** 98 researched entries are considered eligible for the 2027 NFL Draft, 33 not eligible; **20** researched remaining-eligibility fields have explicit 2026 terminal/return assessment, 448 remain unknown. All 468 have a 2026 roster classification (202 SR / 139 JR / 17 5TH / 80 SO / 22 FR / 3 6TH / 2 7TH / 2 3RD / 1 8TH).

## Additional school-by-school sourced batches (same October 8 research window)

The existing research ledger contains exact URLs, full evidence notes and all individualized development/exit parameters. This document is a review index, not a replacement database:

- **Oregon — school pool complete.** Ten newly researched athletes: Aaron Flowers (2025 full-time safety, 70 tackles), A'Mauri Washington (2025 15-start run-stopping DL), Brandon Finney Jr. (2025 Freshman All-American corner), Carl Williams IV (Baylor injury-return transfer), Dierre Hill Jr. (656-yard 2025 explosive reserve RB), Elijah Rushing (three tackles in 2025, limited role), Ify Obidegwu (2025 twelve-start corner), Jamari Johnson (2025 510-yard TE), Jeremiah McClellan (2025 557-yard WR), Messiah Hampton (2026 freshman, **no verified college production**).
- **Texas — school pool complete.** Twelve newly researched athletes: Bo Mascoe, Emmett Mosley V, Graceson Littleton, Hero Kanu, Hollywood Smothers, Justin Cryer, Kade Phillips, Kobe Black, Maraad Watson, Raleek Brown, Spencer Shannon and Zina Umeozulu. Official 2026 Texas roster corrects **Kanu/Brown to 5TH** and **Smothers/Shannon to SR**. Injury, transfer history, 2025 statistics and 2026 starts drive distinct development risks.
- **Ohio State — school pool complete.** Fifteen newly researched athletes: Chris Henry Jr., Christian Alliegro, Devin McCuin, Devin Sanchez, Earl Little Jr., Eddrick Houston, Ja'Kobi Jackson, Jay Timmons, Jaylen McClain, Jermaine Mathews Jr., John Walker, Kenyatta Jackson Jr., Nate Roberts, Payton Pierce and Riley Pettijohn. Official biographies correct **Earl Little Jr., Ja'Kobi Jackson and Kenyatta Jackson Jr. to 5TH**; 2025 workload and 2026 completed-game evidence distinguish veterans and youth.
- **Alabama — school pool complete.** Twenty researched Alabama candidates, including sophomores with existing starts and freshmen explicitly lacking stable college production.
- **Miami — school pool complete.** Thirteen newly researched athletes: Armondo Blount (2025 2.5 sacks and rotation), Bryce Fitzgerald (2025 FWAA Freshman All-American, six INT), CharMar Brown (FCS freshman All-American to Miami production), Chase Smith (extended-year recovery case), Cooper Barkate (Harvard FCS honors, Duke 2025 All-ACC, then Miami), Damari Brown (injury interrupted CB starts), Elija Lofton (2025 23 catches), Javian Mallory (**2026 freshman, no verified college production**), Joshua Moore (2025 freshman receiver experience), Marquise Lightfoot (2025 5.5 TFL), Omar Thornton (Boston College 2025 82 tackles/8 TFL), Xavier Lucas (2025 13 starts, eight PBU), Zechariah Poyser (2024 FWAA Freshman All-American and 2025 All-ACC).


All five completed schools retain the exact roster IDs and canonical Wheel HQ grades. These are evidence-informed probabilistic gameplay evaluations, **not institutional projections or certified NCAA rulings**.

## Evidence inventory

- 468/468 exact CFB GM ID/classification rows; 97 official school class overrides, including the correction of Arch Manning's 2026 official Texas **senior** designation.
- 131 individual GM research entries in the **existing** `data/curated/football/cfb/gm-2026-classification-evidence.json` ledger, with dated source links and player-specific trajectory/risk judgments.
- 131 individually assessed 2027 NFL timing fields, including six newer players modeled ineligible to enter the 2027 Draft after entering college in 2025. Drew Mestemaker is a redshirt sophomore whose 2024 college entry makes a 2027 draft possible despite the class label.
- Twenty assessed remaining-season fields: normal final-year gameplay exits for Mohamed Toure, Gunner Stockton, Josh Hoover, Kevin Jennings, Trinidad Chambliss, Evan Stewart, Ahmad Moten, Bear Alexander, Devan Thompkins, Keon Sabb, Hero Kanu, Raleek Brown, Earl Little Jr., Ja'Kobi Jackson, Kenyatta Jackson Jr. and Cooper Barkate Arch Manning, Dante Moore, Sam Leavitt and Darian Mensah retain a plausible 2027 year if they do not declare. **All are evidence-supported gameplay inferences, not compliance-office certifications; Chambliss's court injunction makes his case unusually exceptional.**
- 337 players retain **null** for unresearched remaining seasons, draft timing and 2027 eligibility rather than a fabricated verified declaration.
- **48 exact-ID On3 October 8, 2026 NIL valuations** sourced from its [football valuation board](https://www.on3.com/nil/rankings/player/college/football/). On3 changed its model on July 1, 2026 to a **deal-based valuation**. We use this published market reference as a gameplay Year 1 estimate, **not as audit-confirmed cash paid under a private contract**. All 48 entries carry the source URL, rank, quoted valuation, and an explicit provisional +10% Year 2 assumption.
- Market shifts include Darian Mensah $6.5m, Dante Moore $5m, Trinidad Chambliss $5m, Jeremiah Smith $5m, Josh Hoover $4m, Cam Coleman $3m, Arch Manning $2.5m and Colin Simmons $2.5m. The 420 without On3 matched valuations retain either older named anchors or class/role/school estimates; **those are not independently verified NIL research**.
- Pricing is identical in both game budgets, independent of HQ grades. The economics must be stress-tested after these wider updates.

## Player-by-player research sources and football reasoning

Each of the 131 records has its own `calibration.summary` and `calibration.sources` in the existing ledger, not in a new standalone athlete database:

| Player | Key documented reason and game treatment |
| --- | --- |
| Colin Simmons | Texas 2025 SEC sack leader and 2026 impact; CBS mock projects near top of 2027; modeled 98% draft declaration |
| Jeremiah Smith | Unanimous 2025 All-American, record-setting Ohio State production, CBS mock at No. 1; 98% draft declaration |
| Arch Manning | Texas 2026 Senior (not previous ESPN Junior), more 2027 eligibility is plausible, declaration uncertain; 62% model |
| Dante Moore | Oregon opted out of a realistic 2026 draft candidacy; high but non-certain 2027 declaration, 86% |
| Sam Leavitt | LSU redshirt junior, productive ASU transfer; 77% declaration estimate |
| Ryan Wingo | Third-year Texas receiver and 2025 All-SEC selection; 56% declaration estimate |
| Cam Coleman | Productive Auburn past, 2026 Texas transfer and reported NIL demand, uneven four-game sample; market raised to $3m |
| Keelon Russell | First 2025 enrollment, emerged as Alabama starter in 2026; not modeled NFL eligible for 2027 |
| Dakorien Moore | Oregon sophomore with meaningful 2025 freshman production despite injury; volatility elevated |
| Mohamed Toure | Documented 2026 eighth/last season after medical/COVID exceptions; always leaves after Year 1 |
| Gunner Stockton | Official Georgia fifth-year QB, first enrolled 2022; modeled final season 2026 under normal rules |
| CJ Carr | 2024 matriculation and demonstrated 2025 Notre Dame production; 2027 draft choice possible, not certain |
| Darian Mensah | Duke 2025: 3,973 yards/34 TD, Tulane 2024: 2,723 yards/22 TD, Miami 2026 transfer; established near-ceiling QB, high draft risk |
| Trinidad Chambliss | 2025 SEC newcomer, 3,937 yards/22 TD; court injunction allows 2026 sixth season, no ordinary 2027 eligibility |
| Josh Hoover | Official Indiana fifth-year QB, 2022 TCU enrollment, 2025 3,472 yards/29 TD; bounded steady profile and 2026 graduation |
| Drew Mestemaker | Oklahoma State redshirt sophomore, 2025 Burlsworth Trophy and national passing lead; high 2026 output and moderate volatility |
| Kevin Jennings | Official SMU fifth-year QB, 2025 3,641 passing yards/26 TD; high playmaking mixed with turnover volatility |
| Julian Sayin | Ohio State 2025 national completion leader, 2026 junior; high steady probability and NFL exit risk |
| Bear Bachmeier | BYU 2025 true freshman dual-threat Big 12 freshman of year, high sophomore development upside; 2027 NFL ineligible |
| Kamario Taylor | Mississippi State 2025 true freshman QB, 2026 14 passing TD through Week 4; near-ceiling HQ but high young-QB volatility |
| Austin Simmons | Missouri new 2026 starting QB with strong Florida performance; higher breakout odds but short stable starting sample |
| George MacIntyre | Tennessee redshirt freshman elevated in October 2026, limited first-start evidence; developing QB, not proven superstar |
| Kewan Lacy | Ole Miss 2025 All-American RB, 1,567 yards/24 TD; 2026 shoulder injury, limited breakout/upside |
| Wayshawn Parker | Utah 2026 captain with 328 rushing/154 receiving yards and nine total TD in first four games |
| Malachi Toney | Miami 2025 freshman 109 catches/1,211 yards, 2026 564 yards in four games; near-ceiling WR, not yet draft eligible |
| Matayo Uiagalelei | Oregon veteran edge: 2025 52 pressures/9.5 TFL/six sacks; likely NFL exit |
| Koi Perich | Oregon junior transfer from Minnesota, 2025 all-conference safety; 2026 rebound opportunity with coverage variability |
| Leonard Moore | Notre Dame 2025 unanimous All-American CB and Thorpe finalist, five interceptions, strong 2026 status; high NFL exit risk |
| Jadan Baugh | Florida elite 2025-26 rushing scorer, at HQ 98 nearly capped for major breakouts |
| Nick Marsh | Indiana 2026 receiver after Michigan State starting experience; moderate growth with transfer-role risk |
| Ryan Coleman-Williams | Alabama junior WR with demonstrated 2024 peak and softer 2025 follow-up; greater decline variability |
| Evan Stewart | Oregon medical-redshirt comeback, now official fifth-year; large rebound potential and injury uncertainty |
| Mike Matthews | Tennessee junior WR, rising 2026 target production |
| Trey’Dez Green | LSU All-SEC 2025 record-scoring TE, near grade ceiling and high draft risk |
| Mark Bowman | USC 2026 early reclassified freshman TE; high uncertainty, separately flagged HQ ability grade |
| Whit Weeks | LSU 2024 tackling leader, injury-disrupted 2025 and comeback range |
| Yhonzae Pierre | Alabama veteran edge elected to return in 2026; modest further gain and high NFL exit risk |
| Ahmad Moten | Miami fifth-year interior DL, All-ACC 2025, normal eligibility exhaustion after 2026 |
| Damon Wilson II | Miami senior edge after Missouri 2025 nine-sack season, new-school fit risk |
| Rasheem Biles | Texas transfer with 2025 Pitt 17 TFL and strong 2026 production, high draft risk |
| Elijah Griffin | Georgia 2026 sophomore DL with limited demonstrated production, separately flagged HQ grade |
| Teitum Tuioti | Oregon 2025 16 TFL and 9.5 sacks, mature role and high draft probability |
| Bear Alexander | Oregon official fifth-year DL, 2025 50 tackles; normal eligibility exhaustion after 2026 |
| Boubacar Traore | Notre Dame senior DE returning from major injury, larger upside/downside band |
| Princewill Umanmielen | LSU elite pass-rushing senior at HQ 98, high NFL exit likelihood |
| Brice Pollock | Texas Tech senior CB with 2025 five interceptions and a two-pick Colorado game in 2026 |
| Ty Benefield | LSU transfer safety after Boise State 107 tackles/8.5 TFL in 2025 |
| Bo Jackson | Ohio State 2025 Freshman All-America, 1,090 rushing yards, 2026 5-game usage |
| KJ Bolden | Georgia junior safety 2025 second-team All-America, 76 tackles/two INT/five PBU |
| Mark Fletcher Jr. | Miami 2026 senior RB, 2025 third-team All-ACC and Cotton Bowl offensive MVP |
| Zabien Brown | Alabama junior corner, 2025 two pick-sixes and six PBUs, 2026 captain |
| Jelani McDonald | Texas senior DB 2025 13 starts and multiple INT, 2026 four starts |
| Jordon Davison | Oregon true sophomore RB, 2025 667 rush yards and team-leading 15 rushing TD |
| Nate Frazier | Georgia junior RB, 2025 861 yards, 2026 early game role and scoring |
| Brandon Inniss | Ohio State senior WR/return captain, 2025 35 catches/271yd and punt-return role |
| EJ Crowell | Alabama true freshman reclassified for 2026, 155 yards/three TD on 23 carries in four games |
| Lotzeir Brooks | Alabama 2025 32 catches/441 yards/two TD, plus kickoff return contribution |
| Daniel Hill | Alabama junior RB moved from 2025 75 rushes/284 yards to 2026 starting role |
| Devan Thompkins | Alabama official fifth-year defensive line transfer, 2026 3.5 TFL/three sacks in four starts |
| Luke Metz | Alabama sophomore, 2026 green-dot defense captain with 29 tackles/three pressures/pick-six |
| Keon Sabb | Alabama official fifth-year safety, 2025 54 tackles/15 starts, 2026 four starts |
| Kaleb Edwards | Alabama sophomore TE 2025 six starts, 2026 eight catches/99 yards/TD in four games |
| Red Morgan | Alabama junior husky DB: 2025 26 tackles, 2026 18 tackles/two INT in four games |
| Bray Hubbard | Alabama senior returning instead of 2026 draft, 2025 79 tackles/four INT, high NFL risk |
| Dijon Lee Jr. | Alabama sophomore CB 2025 freshman All-America with 34 tackles/two INT, 2026 four starts |
| Chauncey Bowens | Georgia junior RB, 2025 526 rush yards/six TD in three starts |
| Chris Cole | Georgia junior LB, 2025 59 tackles/seven TFL/4.5 sacks and 2026 SEC weekly honor |
| Lawson Luckie | Georgia senior TE, 2025 four TD and 2026 early-season red-zone usage |
| Raylen Wilson | Georgia senior ILB, 2026 11-tackle Oklahoma game and SEC starter experience |
| Demello Jones | Georgia junior DB, 2025 five PBU and 2026 interception vs WKU |
| Ellis Robinson IV | Georgia junior CB, 2025 four INT and FWAA national freshman defensive POY |
| Talyn Taylor | Georgia sophomore WR, 2025 reserve and 2026 three early TD catches |
| Khalil Barnes | Georgia senior transfer S, Clemson 2023–25 production and 2026 Georgia role |
| Jordan Hall | Georgia senior DL, injury-shortened 2025 followed by 2026 interior comeback |
| Craig Dandridge | Georgia freshman receiver, 2026 74 yards and first TD at Arkansas |
| Rico Scott | Alabama junior WR, 2025 11 catches/98 yards vs 2026 four starts/140 yards through four |
| Terrance Green | Alabama senior DL transfer from Oregon, 2026 two sacks/three TFL through four starts |
| Caleb Woodson | Alabama senior middle linebacker, 2026 30 tackles/two sacks after Virginia Tech tenure |
| London Simmons | Alabama sophomore DL after spring injury, two 2026 starts and emerging line role |
| Trae'shawn Brown | Alabama 2026 true freshman RB, high-school evidence only, collegiate production uncertain |
| Zyan Gibson | Alabama 2026 true freshman DB, speed/return profile but no verified college starting sample |

## Authority and engine

- The 468-player **curated research ledger** is authoritative for source notes and sourced vs provisional distinction.
- Existing `scripts/generate-cfb-gm-class-runtime.mjs` projects compact source-backed override data into the existing generated 468-player runtime; rejects negative/invalid probabilities and NIL amounts.
- `footballCfbGmDevelopment.ts` prioritizes individually researched outcome/bounds/volatility over class priors, with deterministic seeded rolls and unchanged Wheel HQ grades.
- `footballCfbGmNilMarket.ts` prioritizes 48 published On3 per-player estimates over prior named anchor/role formula and remains independent of HQ grade and game-budget mode.
- `footballCfbGmEngine.ts` prioritizes a researched player's NFL declaration and transfer risk, lets known remaining eligibility override synthetic senior-class exhaustion, and always exits known final-year players.
- Owner-save version upgraded from v5 to v6, preventing old result snapshots from silently inheriting changed outcomes.

## NCAA rules caution

The NCAA's June 23, 2026 [age-based eligibility model](https://www.ncaa.org/news/division-i-adopts-age-based-eligibility-model/) includes transitional protections for present athletes: prior four-seasons/five-year rules or the new age-based rule, whichever is more favorable. Thus an official school class label **cannot** itself establish exact remaining eligibility. Individual waivers, prior participation and time of original enrollment still matter.

NFL draft declaration odds are **game probability judgments**, not actual declarations or guaranteed draft outcomes. Individual source records distinguish public performance evidence from guessed likelihood.

## Outstanding 468-player quality gate

**This PR remains incomplete versus the owner-requested full calibration.** Development: 131/468 sourced. NIL: 48/468 sourced market anchors (source valuations are still estimates). Remaining work:
1. Review all 337 additional existing IDs using official biographies/statistics and capture 2025/2026 production, transfers, position roles, years first enrolled, redshirt history and actual remaining eligibility where documented.
2. Research 420 further personalized NIL price judgments, and independently evaluate the 48 market values against real game economics. Market-wide Year 2 10% baseline is still a placeholder, not a per-player prediction.
3. Set 337 individual breakout/improve/steady/decline and gain/loss/volatility assessments, without generating superficially varied numbers from a generic formula.
4. Research the remaining 337 per-player transfer and 2027 declaration risks; review all unusual sixth-to-eighth-year cases and NCAA transitional exceptions.
5. Run extended affordability simulations for both budgets and full two-year playthroughs, reconcile the grade and price distributions and any proposed HQ grade flags separately.
6. Run complete CI on exact PR head, then integration owner/owner decides on merge. This branch must not be deployed as a purported full 468-player research completion.

## Safety

No NFL GM runtime changes, no Wheel of Football grade changes, no unrelated migrations, no direct `main` edits, no merge/deploy.

# Stage 2AB — actual selected future Average Fan boards (editorial evidence)

Date: October 16, 2026. Captured from **exact-head CI** for PR #1942 at `b859d2d221426eec9891cde59bf1b745831c6d24`, before the further topic-diversity corrections. Source: [Validate V2 run 38990599094](https://github.com/codyking0602/Octagon-HQ/actions/runs/38990599094). This is an explicit source of what the player would see under the chosen deterministic audit schedule version, not an assertion these were historic live Daily boards or unchanged after fixes.

## Sample and audit finding

- All **15 complete board selections**, five each for NFL, CFB, UFC, included below; **135 distinct question placements**, 120 graded ordinary tiles and 15 protected Finals. The complete 180-day publication simulation also ran.
- Cross-grade 180-day assertion found **two named Chris Weidman facts on the April 1, 2027 UFC board**. Subject-diversity scoring previously ran before same-person diversity; now prefer no repeated named topic. Additional November 14 CFB topic collision showed the fresh-only grade pool can be narrower than safe 31+-day-old alternatives; now compare fresh and safely reusable questions together, with freshness as a tiebreak after topic diversity.
- NFL December 1 sample contained two questions about **the same Super Bowl XLIX goal-line interception**, first the interceptor Malcolm Butler and later the intended target Ricardo Lockette. These are distinct correct answers but a repetitive sporting incident in a nine-question board. Add semantic incident collision key.
- UFC November 11 sample had an **unanimous decision definition** plus **majority decision definition** on the same board. Add related vocabulary topic key so questions about judge-decision vocabulary do not crowd one board.
- **Exact-head 180-day follow-up (October 16 run):** The remaining name-only audit collision was *Alabama* appearing as the **opponent** in two unrelated CFB events on November 14: Watson leading Clemson past Alabama for the 2016 championship and Chris Davis returning Alabama's missed field goal for Auburn in the 2013 Kick Six. These are separate teams, players, seasons and sporting incidents. The regression now explicitly accepts only this identified pair, rather than misleadingly calling any shared school reference a repeated question. All other repeated player/program/incident collisions remain failures.
- CFB November 14 had three different rivalry/trophy facts. They are factual and distinct, but the concentration is an editorial variety concern. **Fix:** give this broad topic family a soft within-board selection penalty, preferring different football topics when suitable alternatives exist rather than retiring correct rivalry content.
- Verified representative source anchors against UFC official results: [UFC 204 Bisping–Henderson](https://www.ufc.com/event/ufc-204), [Morales–Burns 2025](https://www.ufc.com/event/ufc-fight-night-may-17-2025) and [Pereira–Gane 2026 title bout](https://www.ufc.com/video/157367). The factual ledger checks all selected generated UFC outcomes and dates. This does **not** assert externally re-opening all 135 official primary-source pages.
- Earlier Stage 2X fixed gender-mismatched UFC fighters, implausibly distant weight classes, unsupported bout-opponent anchors, and CFB grade errors. Stage 2Z further required recognized primary title opponents. These fixes are reflected in this sampling.

## Exact chosen board content before topic fixes


### CFB — 2026-10-16

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | For the 2025 season, which conference was Alabama in? | SEC | Big 12; ACC; American |
| 2 · four-choice | Which two programs play the rivalry commonly called “The Game”? | Michigan and Ohio State | Texas and Oklahoma; Florida and Georgia; Alabama and Auburn |
| 3 · true-false | Bo Nix's primary college football position was QB. | True | — |
| 3 · four-choice | Which two programs are associated with the Bedlam rivalry? | Oklahoma and Oklahoma State | Oklahoma and Texas; Oklahoma State and Texas Tech; Kansas and Kansas State |
| 4 · true-false | Amari Cooper won the Heisman Trophy. | False | — |
| 4 · four-choice | Which of these programs was in the Big Ten for the 2025 season? | Illinois | Tulane; Tulsa; UAB |
| 5 · short-answer | Which Florida quarterback won the 1996 Heisman Trophy and then led the Gators to the national championship? | Danny Wuerffel | — |
| 5 · true-false | LSU won the 2007 BCS national championship after entering the title game with two losses. | True | — |
| Final · four-choice | Which Auburn receiver caught the deflected touchdown known as the Prayer at Jordan-Hare in 2013? | Ricardo Louis | Sammie Coates; Quan Bray; Trovon Reed |

### NFL — 2026-10-18

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · true-false | The Detroit Lions traditionally host an NFL game on Thanksgiving Day. | True | — |
| 2 · four-choice | How many points is a successful field goal worth? | 3 | 1; 2; 6 |
| 3 · four-choice | The famous Tuck Rule playoff game matched New England against which team? | Oakland Raiders | Indianapolis Colts; Pittsburgh Steelers; New York Jets |
| 3 · true-false | Jerry Rice played his entire NFL career for the 49ers. | False | — |
| 4 · short-answer | How many primary deep zones are used in a basic Cover 3? | 3 | — |
| 4 · four-choice | Which quarterback was selected 199th overall in the 2000 NFL Draft? | Tom Brady | Peyton Manning; Drew Brees; Kurt Warner |
| 5 · short-answer | Which team beat Miami 41–38 in overtime in the 1981 playoff classic known as the “Epic in Miami”? | San Diego Chargers | — |
| 5 · four-choice | Which defending Super Bowl champion opened the 2011 season 13–0 before finishing 15–1? | Green Bay Packers | New Orleans Saints; New England Patriots; Indianapolis Colts |
| Final · four-choice | Which Steelers receiver caught a 73-yard touchdown from Terry Bradshaw in Super Bowl XIV? | John Stallworth | Lynn Swann; Theo Bell; Jim Smith |

### CFB — 2026-10-28

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | For the 2025 season, which conference was Notre Dame in? | Independent | Big 12; Big Ten; American |
| 2 · four-choice | Which programs play the Red River rivalry? | Texas and Oklahoma | USC and UCLA; Iowa and Iowa State; Oklahoma and Oklahoma State |
| 3 · true-false | Danny Wuerffel's primary college football position was DB. | False | — |
| 3 · four-choice | Minnesota and Wisconsin play for which trophy? | Paul Bunyan's Axe | Floyd of Rosedale; Heartland Trophy; Old Oaken Bucket |
| 4 · true-false | Baker Mayfield won the Heisman Trophy. | True | — |
| 4 · true-false | Florida State won the final BCS National Championship Game before the College Football Playoff era. | True | — |
| 5 · short-answer | Which Ohio State running back rushed for 246 yards against Oregon in the national championship game after the 2014 season? | Ezekiel Elliott | — |
| 5 · true-false | The 2003 season ended with LSU and USC recognized by major selectors as national champions. | True | — |
| Final · four-choice | Which unbeaten team capped the 2008 season by beating Alabama 31–17 in the Sugar Bowl? | Utah | Boise State; TCU; BYU |

### NFL — 2026-11-02

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which quarterback led Green Bay to victories in Super Bowls I and II? | Bart Starr | Len Dawson; Daryle Lamonica; Joe Namath |
| 2 · true-false | A pick-six is an interception returned for a touchdown. | True | — |
| 3 · true-false | The Houston Texans began NFL play in 2002. | True | — |
| 3 · four-choice | Which Ravens quarterback won the 2019 NFL MVP award? | Lamar Jackson | Josh Allen; Russell Wilson; Patrick Mahomes |
| 4 · short-answer | The famous “13 Seconds” finish in the 2021 playoffs came in Chiefs vs. which team? | Buffalo Bills | — |
| 4 · four-choice | What pass concept commonly lets the rush come upfield before throwing short to a receiver with blockers in front? | Screen pass | Slant; Fade; Hail Mary |
| 5 · true-false | Terrell Davis was a first-round NFL Draft pick. | False | — |
| 5 · four-choice | Which team won three straight NFC road playoff games after the 2010 season before winning Super Bowl XLV? | Green Bay Packers | New York Giants; Pittsburgh Steelers; Seattle Seahawks |
| Final · four-choice | Which passing concept commonly pairs a post route with a deep dig underneath it? | Mills | Mesh; Smash; Flood |

### CFB — 2026-11-04

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | For the 2025 season, which conference was Michigan in? | Big Ten | SEC; Sun Belt; Mountain West |
| 2 · four-choice | Which two programs play the Iron Bowl? | Alabama and Auburn | Georgia and Florida; Ole Miss and Mississippi State; Alabama and Tennessee |
| 3 · true-false | Ernie Davis's primary college football position was RB. | True | — |
| 3 · four-choice | Which two programs meet in South Carolina's Palmetto Bowl rivalry? | Clemson and South Carolina | Florida and Florida State; Kentucky and Louisville; Georgia and Georgia Tech |
| 4 · true-false | Brock Bowers won the Heisman Trophy. | False | — |
| 4 · true-false | Cincinnati was the No. 1 seed in the four-team College Football Playoff after the 2021 season. | False | — |
| 5 · true-false | DeVonta Smith was the first wide receiver to win the Heisman Trophy since Desmond Howard. | True | — |
| 5 · short-answer | Which powerhouse did Stanford upset 24-23 in 2007 during Jim Harbaugh's first season as head coach? | USC | — |
| Final · four-choice | Indiana and Michigan State play for which rivalry trophy? | Old Brass Spittoon | Old Oaken Bucket; Land Grant Trophy; Paul Bunyan Trophy |

### NFL — 2026-11-12

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | What play is commonly used by an offense to safely run out the clock at the end of a game? | Quarterback kneel | Onside kick; Spike the ball; Hail Mary |
| 2 · true-false | The first Super Bowl was played in Los Angeles. | True | — |
| 3 · true-false | Deion Sanders won Super Bowls with both the 49ers and Cowboys. | True | — |
| 3 · four-choice | What is pre-snap motion? | An eligible player moving before the snap | The quarterback scrambling; A lineman pulling after the snap; A defender substituting after the snap |
| 4 · short-answer | Which team had a 2017 defense nicknamed 'Sacksonville'? | Jacksonville Jaguars | — |
| 4 · true-false | Kurt Warner entered the NFL as a drafted player. | False | — |
| 5 · true-false | The Seattle Seahawks have played regular seasons as members of both the AFC and NFC. | True | — |
| 5 · short-answer | Which Raiders tight end made the 42-yard “Ghost to the Post” catch late in regulation against Baltimore in the 1977 playoffs? | Dave Casper | — |
| Final · four-choice | Who returned an interception 100 yards for a touchdown in Super Bowl XLIII? | James Harrison | Ryan Clark; Troy Polamalu; Ike Taylor |

### CFB — 2026-11-14

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | For the 2025 season, which conference was Ohio State in? | Big Ten | Independent; American; Big 12 |
| 2 · short-answer | What was Calvin Johnson's primary college football position? | WR | — |
| 3 · four-choice | Which two programs play for the Cy-Hawk Trophy? | Iowa and Iowa State | Iowa State and Kansas State; Iowa and Wisconsin; Iowa and Minnesota |
| 3 · true-false | Florida State was in the Independent for the 2025 season. | False | — |
| 4 · true-false | Brady Quinn won the Heisman Trophy. | False | — |
| 4 · four-choice | Michigan and Michigan State play for which trophy? | Paul Bunyan Trophy | Old Oaken Bucket; Floyd of Rosedale; Little Brown Jug |
| 5 · short-answer | Which Clemson quarterback threw for 420 yards in the national championship win over Alabama after the 2016 season? | Deshaun Watson | — |
| 5 · four-choice | Indiana and Purdue play for which trophy? | Old Oaken Bucket | Old Brass Spittoon; Illibuck; Little Brown Jug |
| Final · four-choice | During Georgia's 2021 championship run, who was named offensive MVP in both College Football Playoff games? | Stetson Bennett | Bryce Young; JT Daniels; Jake Fromm |

### NFL — 2026-11-24

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which position normally snaps the ball to begin an offensive play? | Center | Tackle; Guard; Tight end |
| 2 · true-false | Tom Brady played NFL games for both the Patriots and Buccaneers. | True | — |
| 3 · true-false | The AFL-NFL merger took full effect for the 1970 season. | True | — |
| 3 · four-choice | What is a hard count designed to make the defense do? | Jump early | Call timeout; Drop into zone; Switch defensive personnel |
| 4 · four-choice | Derrick Brooks, Warren Sapp, John Lynch and Ronde Barber anchored which championship defense in 2002? | Tampa Bay Buccaneers | Baltimore Ravens; Oakland Raiders; Pittsburgh Steelers |
| 4 · short-answer | Which team pulled off the “Mile High Miracle” against Denver in January 2013, following the 2012 NFL season? | Baltimore Ravens | — |
| 5 · short-answer | Which Ravens running back rushed for 295 yards in a 2003 game against Cleveland? | Jamal Lewis | — |
| 5 · four-choice | Which team handed the 1985 Bears their only regular-season loss? | Miami Dolphins | Dallas Cowboys; Green Bay Packers; New York Giants |
| Final · short-answer | Which quarterback became the first Black starting quarterback to win a Super Bowl and was named Super Bowl XXII MVP? | Doug Williams | — |

### CFB — 2026-11-29

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | For the 2025 season, which conference was USC in? | Big Ten | ACC; American; Big 12 |
| 2 · short-answer | What was Bijan Robinson's primary college football position? | RB | — |
| 3 · four-choice | Which two programs play the Egg Bowl? | Ole Miss and Mississippi State | Clemson and South Carolina; Arkansas and LSU; Alabama and Auburn |
| 3 · true-false | Georgia Southern was in the Sun Belt for the 2025 season. | True | — |
| 4 · true-false | DeVonta Smith won the Heisman Trophy. | True | — |
| 4 · four-choice | Stanford and California play for which trophy? | Stanford Axe | Victory Bell; Paul Bunyan's Axe; Territorial Cup |
| 5 · four-choice | Which LSU quarterback threw 60 touchdown passes during the 2019 national-championship season? | Joe Burrow | Trevor Lawrence; Jalen Hurts; Tua Tagovailoa |
| 5 · short-answer | Who returned Alabama's missed field goal for Auburn's Kick Six touchdown in 2013? | Chris Davis | — |
| Final · four-choice | Illinois and Ohio State play for which rivalry trophy? | Illibuck | Victory Bell; Old Brass Spittoon; Illini-Buckeye Cup |

### NFL — 2026-12-01

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | What is it called when a defense sends extra rushers after the quarterback? | Blitz | Spy; Contain; Stunt |
| 2 · four-choice | Which Hall of Fame running back was nicknamed 'Sweetness'? | Walter Payton | Barry Sanders; Emmitt Smith; Earl Campbell |
| 3 · four-choice | Who intercepted Russell Wilson at the goal line to seal Super Bowl XLIX? | Malcolm Butler | Darrelle Revis; Devin McCourty; Brandon Browner |
| 3 · true-false | An offense can throw two forward passes on the same play as long as both are released behind the line of scrimmage. | False | — |
| 4 · short-answer | Which franchise rode the famous '46 defense' to a Super Bowl XX championship? | Chicago Bears | — |
| 4 · true-false | Tony Romo was selected in the NFL Draft. | False | — |
| 5 · short-answer | Which Seahawks receiver was the intended target on Malcolm Butler's goal-line interception in Super Bowl XLIX in 2015? | Ricardo Lockette | — |
| 5 · true-false | The Baltimore Ravens officially inherited the original Cleveland Browns' historical records when the franchise moved in 1996. | False | — |
| Final · short-answer | In a classic Tampa 2, which defender is asked to carry the deep middle between the two safeties? | Middle linebacker | — |

### UFC — 2026-10-17

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which UFC division is Matt Serra primarily associated with? | Welterweight | Featherweight; Middleweight; Lightweight |
| 2 · four-choice | Which straight punch is normally thrown with the lead hand? | Jab | Uppercut; Hook; Cross |
| 3 · true-false | Vitor Belfort is primarily associated with the UFC Welterweight division. | False | — |
| 3 · four-choice | Under the 10-point must system, how many points does the round winner normally receive? | 10 | 8; 9; 11 |
| 4 · four-choice | Which of these fighters did Anthony Pettis defeat in the UFC on January 26, 2013? | Donald Cerrone | Rafael dos Anjos; B.J. Penn; Justin Gaethje |
| 4 · short-answer | Whom did TJ Dillashaw stop at UFC 217 in 2017 to regain the bantamweight title? | Cody Garbrandt | — |
| 5 · four-choice | Which fighter did Dricus du Plessis defeat by submission in the UFC on December 10, 2022? | Darren Till | Israel Adesanya; Chris Weidman; Kevin Holland |
| 5 · short-answer | Kamaru Usman's knockout at UFC 261 in 2021 came against which challenger? | Jorge Masvidal | — |
| Final · four-choice | Which UFC fighter faced Alexandre Pantoja in a title fight and also fought Deiveson Figueiredo and Brandon Royval? | Brandon Moreno | Demetrious Johnson; Henry Cejudo; Deiveson Figueiredo |

### UFC — 2026-10-19

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which UFC division is Umar Nurmagomedov primarily associated with? | Bantamweight | Lightweight; Flyweight; Featherweight |
| 2 · four-choice | What term describes striking an opponent while the fight is on the ground? | Ground-and-pound | Dirty boxing; Wall-and-stall; Lay-and-pray |
| 3 · true-false | Sean Strickland is primarily associated with the UFC Middleweight division. | True | — |
| 3 · four-choice | An armbar primarily attacks which joint? | Elbow | Knee; Ankle; Shoulder |
| 4 · four-choice | Which of these fighters did Alexa Grasso defeat in the UFC on March 4, 2023? | Valentina Shevchenko | Rose Namajunas; Miesha Tate; Carla Esparza |
| 4 · short-answer | What grappling term describes a bottom fighter using the legs to control or attack an opponent? | Guard | — |
| 5 · four-choice | Which fighter faced Joanna Jedrzejczyk in a UFC title fight on March 7, 2020? | Zhang Weili | Mackenzie Dern; Carla Esparza; Rose Namajunas |
| 5 · four-choice | Which fighter did Ilia Topuria defeat by KO/TKO in the UFC on October 26, 2024? | Max Holloway | Yair Rodriguez; Diego Lopes; Jose Aldo |
| Final · four-choice | Which UFC fighter faced Michael Bisping in a title fight and also fought Daniel Cormier and Vitor Belfort? | Dan Henderson | Robert Whittaker; Anderson Silva; Rich Franklin |

### UFC — 2026-10-30

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which UFC division is Diego Lopes primarily associated with? | Featherweight | Lightweight; Bantamweight; Welterweight |
| 2 · short-answer | What result is recorded when a fighter taps or verbally concedes to a hold? | Submission | — |
| 3 · true-false | Mauricio "Shogun" Rua is primarily associated with the UFC Light Heavyweight division. | True | — |
| 3 · four-choice | What defensive movement is commonly used to stop a wrestling shot by driving the hips back and down? | Sprawl | Granby roll; Sit-out; Shrimp |
| 4 · four-choice | Which of these fighters did Holly Holm defeat in the UFC on November 15, 2015? | Ronda Rousey | Kayla Harrison; Julianna Peña; Amanda Nunes |
| 4 · short-answer | Which body part is primarily used to form a triangle choke around an opponent? | Legs | — |
| 5 · four-choice | Which fighter faced Carla Esparza in a UFC title fight on November 12, 2022? | Zhang Weili | Jessica Andrade; Mackenzie Dern; Paige VanZant |
| 5 · four-choice | Which fighter did Khamzat Chimaev defeat by decision in the UFC on October 21, 2023? | Kamaru Usman | Chris Weidman; Yoel Romero; Robert Whittaker |
| Final · four-choice | Which UFC fighter faced Alex Pereira in a title fight and also fought Tom Aspinall and Jon Jones? | Ciryl Gane | Alistair Overeem; Stipe Miocic; Derrick Lewis |

### UFC — 2026-11-07

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which UFC division is Yair Rodriguez primarily associated with? | Featherweight | Bantamweight; Lightweight; Flyweight |
| 2 · short-answer | What abbreviation is used for a technical knockout? | TKO | — |
| 3 · true-false | Merab Dvalishvili is primarily associated with the UFC Featherweight division. | False | — |
| 3 · four-choice | What type of decision occurs when two judges pick one fighter and the third picks the other? | Split decision | Majority decision; Unanimous decision; Technical decision |
| 4 · four-choice | Which of these fighters did Anderson Silva defeat in the UFC on July 7, 2012? | Chael Sonnen | Tim Kennedy; Sean Strickland; Khamzat Chimaev |
| 4 · short-answer | What grappling term describes using the forearm or other skeletal structure to create and maintain space? | Frame | — |
| 5 · four-choice | Which fighter faced Dan Henderson in a UFC title fight on October 8, 2016? | Michael Bisping | Rich Franklin; Robert Whittaker; Anderson Silva |
| 5 · four-choice | Which fighter did Michael Morales defeat by KO/TKO in the UFC on May 17, 2025? | Gilbert Burns | Jorge Masvidal; Shavkat Rakhmonov; Kamaru Usman |
| Final · four-choice | Which UFC fighter faced Robbie Lawler in a title fight and also fought Tyron Woodley and Georges St-Pierre? | Carlos Condit | Tyron Woodley; Matt Hughes; Jack Della Maddalena |

### UFC — 2026-11-11

| Level | Prompt | Correct | Incorrect choices (when applicable) |
| --- | --- | --- | --- |
| 2 · four-choice | Which UFC division is Paige VanZant primarily associated with? | Women's Strawweight | Women's Bantamweight; Women's Featherweight; Women's Flyweight |
| 2 · short-answer | What scoring system is used for UFC rounds? | 10-point must system | — |
| 3 · true-false | Michael Bisping is primarily associated with the UFC Middleweight division. | True | — |
| 3 · short-answer | What type of decision occurs when all three judges pick the same winner? | Unanimous decision | — |
| 4 · four-choice | Which of these fighters did Derrick Lewis defeat in the UFC on July 7, 2018? | Francis Ngannou | Ciryl Gane; Greg Hardy; Stipe Miocic |
| 4 · short-answer | What type of decision occurs when two judges pick the same winner and the third scores the fight a draw? | Majority decision | — |
| 5 · four-choice | Which fighter faced Carlos Condit in a UFC title fight on January 2, 2016? | Robbie Lawler | Michael Morales; Nick Diaz; Colby Covington |
| 5 · four-choice | Which fighter did Dustin Poirier defeat by decision in the UFC on April 13, 2019? | Max Holloway | Justin Gaethje; B.J. Penn; Rafael dos Anjos |
| Final · four-choice | Which UFC fighter faced Sean O'Malley in a title fight and also fought Brian Ortega and Henry Cejudo? | Aljamain Sterling | Petr Yan; Merab Dvalishvili; T.J. Dillashaw |

## Gate still open

After this baseline, verify the **revised selected boards from the final PR head**, same-name/event diversity through 180 days, no recent repeats, exact-head green build/tests and live delivery. Remaining sourced authored facts not individually checked must not be represented as independently certified. Stage 2 status remains **in progress** until evidence supports closure; historical Daily results/earned points remain immutable.

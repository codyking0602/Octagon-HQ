# Who Am I Rebuild PR9 — CFB B-tier person identity audit

## Scope

- Scope: CFB B-tier person identity knowledge only.
- Canonical runtime owner: `src/features/back-room/footballPersonIdentityKnowledge.ts`.
- Data-only research module: `src/features/back-room/footballPersonIdentityCfbBResearch.ts`.
- Focused test owner: `src/features/back-room/footballPersonIdentityKnowledge.test.ts`.
- Authoritative research input: three completed PR9 packages supplied for integration on 2026-09-10.
- Launch membership, recognizability, clue wording/order/scoring, Who Am I gameplay, NFL knowledge, CFB A-tier knowledge, UFC behavior, routes, and backend ownership are explicitly out of scope.

## Deterministic ingestion audit

- Research identities: **129**.
- Retained concepts: **645**.
- Concepts per identity: **exactly 5**.
- Unique retained provenance URLs: **360**.
- Unique research subject IDs: **129**.
- Unique concept IDs: **645**.
- Duplicate normalized retained wording: **0**.
- Missing/invalid retained source URLs: **0** in the supplied packages (all retained concepts include HTTPS provenance).
- Exact canonical CFB B launch-set equality is enforced by the focused runtime test against `getFootballWhoAmILaunchPool("CFB")`; the audit ledger below uses the supplied research IDs until any runtime reconciliation is required.

## Research-ID reconciliation

Six supplied coach research IDs required CFB canonicalization on exact base main `38dfaf326140de2db9ef76b7554f3a699b720a5e`. The data-only module maps only the subject key; all retained concept IDs, wording, and provenance remain unchanged:

- `bill-snyder` → `bill-snyder-cfb`
- `bob-stoops` → `bob-stoops-cfb`
- `brian-kelly` → `brian-kelly-cfb`
- `chris-petersen` → `chris-petersen-cfb`
- `frank-beamer` → `frank-beamer-cfb`
- `deion-sanders` → `deion-sanders-cfb` (separates the CFB coach identity from the existing NFL player identity that already owns `deion-sanders`)

The Deion Sanders source-recognition row was canonicalized to the existing CFB `-cfb` identity namespace to remove the cross-league ID collision; his CFB coach name, tier, and launch membership are unchanged. No recognizability or launch-membership changes were made. The focused test requires the post-reconciliation 129-ID research set to equal the current exact CFB B-tier launch set.

## Research wording constraints

The supplied research already contains its own rejected/softened-claim decisions. PR9 preserves those decisions rather than re-researching or independently rewriting the concepts. In particular, controversy, legal/tabloid material, generic résumé statistics, and duplicate facets of one underlying concept were intentionally excluded where the research packages say so.

## Full retained research ledger

### A.J. Brown — WR — `cfbfast-r-player-4047646-a-j-brown`

1. **`cfbfast-r-player-4047646-a-j-brown--dual-under-armour-all-american`** — Brown was a high-level football and baseball prospect at Starkville High and became the second athlete, after Kyler Murray, to play in both the Under Armour All-America Football Game and the Under Armour All-America Baseball Game.
   - Why distinctive: The rare dual All-America-game distinction makes his baseball ability part of his football identity rather than a generic multi-sport note.
   - Source: New England Patriots player biography
   - URL: https://www.patriots.com/team/players-roster/a-j-brown/logs/2024/pre/
2. **`cfbfast-r-player-4047646-a-j-brown--padres-draft-and-summer-baseball`** — The San Diego Padres selected Brown in the 19th round of the 2016 MLB Draft; he signed and later participated in extended spring training during his Ole Miss summers.
   - Why distinctive: He maintained a real professional-baseball path while becoming an SEC receiver.
   - Source: Ole Miss Athletics player biography
   - URL: https://olemisssports.com/sports/football/roster/a-j-brown/270
3. **`cfbfast-r-player-4047646-a-j-brown--starkville-chooses-ole-miss`** — Brown grew up and starred in Starkville, Mississippi, but chose Ole Miss rather than hometown Mississippi State.
   - Why distinctive: Choosing the in-state rival while living in Mississippi State’s home city is unusually memorable recruiting context.
   - Source: Sports Illustrated commitment report
   - URL: https://www.si.com/college/2016/02/03/aj-brown-myers-commits-ole-miss
4. **`cfbfast-r-player-4047646-a-j-brown--starkville-state-title`** — As a senior, Brown helped Starkville High win a Mississippi Class 6A football state championship.
   - Why distinctive: The title anchors him to a recognizable Mississippi high-school setting before Ole Miss.
   - Source: New England Patriots player biography
   - URL: https://www.patriots.com/team/players-roster/a-j-brown/logs/2024/pre/
5. **`cfbfast-r-player-4047646-a-j-brown--middle-name-spelling-story`** — Brown’s middle name appears as “Juan” on his birth certificate, though his family has said “Jauan” was the intended spelling.
   - Why distinctive: It is a highly person-specific biographical detail unlikely to fit another player.
   - Source: New England Patriots player biography
   - URL: https://www.patriots.com/team/players-roster/a-j-brown/logs/2024/pre/
   - Research exclusions/constraints:
     - Routine Ole Miss receiving records and NFL production were not retained because they are structural résumé information.

### A.J. Hawk — LB — `cfb-aj-hawk`

1. **`cfb-aj-hawk--basketball-first-love`** — Hawk has said basketball was his first love growing up and that he once imagined becoming a point guard at Duke.
   - Why distinctive: That childhood ambition contrasts sharply with his later identity as an Ohio State linebacker.
   - Source: Ohio State Athletics profile, “No Time To Wait”
   - URL: https://ohiostatebuckeyes.com/news/2005/9/10/no-time-to-wait
2. **`cfb-aj-hawk--childhood-with-mike-nugent`** — Hawk grew up only minutes from future Ohio State kicker Mike Nugent and played football with him from grade-school age before they reunited as Buckeyes.
   - Why distinctive: A childhood-to-college teammate connection between two recognizable Ohio State players is highly identifying.
   - Source: New Haven Register / Associated Press feature
   - URL: https://www.nhregister.com/news/article/Connections-run-deep-for-Ohio-St-duo-11654413.php
3. **`cfb-aj-hawk--played-with-brother-ryan`** — At Centerville High, Hawk played running back and linebacker while his older brother Ryan played quarterback; they shared two varsity seasons.
   - Why distinctive: The sibling/position combination is more personal than a generic high-school accolade.
   - Source: Ohio State Athletics profile, “No Time To Wait”
   - URL: https://ohiostatebuckeyes.com/news/2005/9/10/no-time-to-wait
4. **`cfb-aj-hawk--community-park-upbringing`** — Hawk grew up with a community park directly behind the family home, and pickup sports with his brothers and neighborhood athletes were a major part of his childhood.
   - Why distinctive: It gives a specific picture of the competitive environment that shaped him.
   - Source: Ohio State Athletics profile, “No Time To Wait”
   - URL: https://ohiostatebuckeyes.com/news/2005/9/10/no-time-to-wait
5. **`cfb-aj-hawk--quinn-fiesta-family-rivalry`** — In the 2006 Fiesta Bowl, Hawk faced Notre Dame quarterback Brady Quinn while dating Quinn’s sister Laura; she famously wore a split Notre Dame/Ohio State jersey, and Hawk sacked Quinn twice.
   - Why distinctive: The family-rivalry angle became one of the most recognizable personal storylines of that bowl game.
   - Source: ESPN Fiesta Bowl retrospective
   - URL: https://www.espn.com/college-football/story/_/id/14458113/a-lot-changed-ohio-state-buckeyes-notre-dame-fighting-irish-last-met-fiesta-bowl
   - Research exclusions/constraints:
     - Lombardi Award, tackle totals and draft position were not retained because they are conventional résumé clues.

### Aaron Ross — DB — `cfb-aaron-ross`

1. **`cfb-aaron-ross--fox-tech-to-john-tyler`** — Ross played at San Antonio Fox Tech as a sophomore before finishing his prep career at John Tyler High in Tyler, Texas.
   - Why distinctive: The intra-state high-school move is a distinctive part of his path before Texas.
   - Source: Texas Athletics 2002 recruiting biography
   - URL: https://texaslonghorns.com/news/2002/2/6/020602aaa_208
2. **`cfb-aaron-ross--three-sport-sprinter`** — Ross lettered in football, track and basketball and was a four-year sprinter in track.
   - Why distinctive: His sustained track background helps explain the return ability that later became part of his Texas identity.
   - Source: Texas Athletics 2002 recruiting biography
   - URL: https://texaslonghorns.com/news/2002/2/6/020602aaa_208
3. **`cfb-aaron-ross--prep-kick-blocker`** — Ross was an unusually prolific kick blocker in high school, with his Texas recruiting bio crediting him with double-digit blocked kicks as a sophomore and more in later seasons.
   - Why distinctive: Blocked kicks are an uncommon prep specialty for a future star cornerback.
   - Source: Texas Athletics 2002 recruiting biography
   - URL: https://texaslonghorns.com/news/2002/2/6/020602aaa_208
4. **`cfb-aaron-ross--punt-return-identity`** — After becoming Texas’ primary punt returner, Ross scored his first Longhorn punt-return touchdown on an 88-yard return at Missouri.
   - Why distinctive: His punt-return role is a recognizable secondary identity beyond playing cornerback.
   - Source: Texas Athletics feature, “Take it to the house”
   - URL: https://texaslonghorns.com/news/2005/10/5/100505aab_420.aspx
5. **`cfb-aaron-ross--met-sanya-at-texas`** — Ross met Texas track star Sanya Richards while both were students at the University of Texas; they later married.
   - Why distinctive: The pairing of a Texas football star and an Olympic-level Texas sprinter is uniquely identifiable.
   - Source: Texas Athletics spring-game feature
   - URL: https://texaslonghorns.com/news/2012/3/30/033112aab_522
   - Research exclusions/constraints:
     - Jim Thorpe Award and interception totals were not retained because they are already ordinary structural career information.

### Abdul Carter — DL — `cfb-abdul-carter`

1. **`cfb-abdul-carter--11th-street-number-11`** — Carter grew up on 11th Street in North Philadelphia and later wore No. 11 at Penn State.
   - Why distinctive: The street-number and jersey-number coincidence is a memorable personal identifier.
   - Source: Philadelphia Inquirer profile
   - URL: https://www.inquirer.com/college-sports/penn-state/penn-state-abdul-carter-football-cfp-lasalle-glenside-north-philly-20241219.html
2. **`cfb-abdul-carter--father-bloomsburg-defender`** — His father, Chris Carter, played linebacker and defensive end at Bloomsburg University and is credited by the family with helping shape Abdul’s competitive approach.
   - Why distinctive: It supplies a direct football-family influence without relying on generic ancestry.
   - Source: Philadelphia Inquirer profile
   - URL: https://www.inquirer.com/college-sports/penn-state/penn-state-abdul-carter-football-cfp-lasalle-glenside-north-philly-20241219.html
3. **`cfb-abdul-carter--deion-barnes-same-street`** — Penn State defensive line coach Deion Barnes grew up only a couple of blocks from Carter on the same North Philadelphia street.
   - Why distinctive: The hyper-local connection between player and Penn State coach is unusually specific.
   - Source: Philadelphia Inquirer profile
   - URL: https://www.inquirer.com/college-sports/penn-state/penn-state-abdul-carter-football-cfp-lasalle-glenside-north-philly-20241219.html
4. **`cfb-abdul-carter--high-school-basketball-forward`** — Carter also lettered in basketball at La Salle College High School as a power forward.
   - Why distinctive: It adds a distinct athletic background beyond his football résumé.
   - Source: Penn State Athletics player biography
   - URL: https://gopsusports.com/sports/football/roster/season/2023/player/abdul-carter
5. **`cfb-abdul-carter--linebacker-to-edge-switch`** — After two seasons at linebacker, Carter moved to defensive end for the 2024 Penn State season.
   - Why distinctive: The late college position change is a major identity turning point and explains why he can be remembered as both an off-ball linebacker and edge defender.
   - Source: Penn State Athletics All-America release
   - URL: https://gopsusports.com/news/2024/12/18/carter-warren-selected-sporting-news-all-americans
   - Research exclusions/constraints:
     - Raw sack/tackle-for-loss totals and draft slot were not retained; they are résumé data rather than person-identity depth.

### Aidan Hutchinson — DL — `cfb-aidan-hutchinson`

1. **`cfb-aidan-hutchinson--michigan-legacy-no-97`** — Hutchinson’s father Chris was a Michigan captain and team MVP, and Aidan followed him to Michigan wearing the same No. 97.
   - Why distinctive: The father-son Michigan legacy and shared number are core identifiers for Hutchinson.
   - Source: Michigan Athletics player biography
   - URL: https://mgoblue.com/sports/football/roster/aidan-hutchinson/22005
2. **`cfb-aidan-hutchinson--four-prep-football-roles`** — At Divine Child High School, Hutchinson played defensive end, tight end, offensive line and long snapper.
   - Why distinctive: That unusually broad set of football jobs shows the versatility behind his later defensive-line identity.
   - Source: Detroit Lions player biography
   - URL: https://www.detroitlions.com/team/players-roster/aidan-hutchinson/logs/
3. **`cfb-aidan-hutchinson--lacrosse-captain`** — Hutchinson captained Divine Child’s lacrosse team and earned second-team all-state honors in the sport.
   - Why distinctive: A serious lacrosse background is a distinctive non-football marker for a future elite edge defender.
   - Source: Detroit Lions player biography
   - URL: https://www.detroitlions.com/team/players-roster/aidan-hutchinson/logs/
4. **`cfb-aidan-hutchinson--whole-family-michigan-tie`** — His mother Melissa also attended Michigan, and both of his sisters were enrolled at Michigan while he played there.
   - Why distinctive: The university connection extends beyond a single football-parent legacy and makes Michigan a family institution.
   - Source: Michigan Athletics player biography
   - URL: https://mgoblue.com/sports/football/roster/aidan-hutchinson/22005
5. **`cfb-aidan-hutchinson--injury-to-heisman-runner-up`** — Hutchinson’s 2020 season ended after only three games because of injury; he returned in 2021 and became only the third defensive player to finish second in Heisman voting.
   - Why distinctive: The injury-to-breakout arc is a defining college-career turning point rather than just an award total.
   - Source: Detroit Lions player biography
   - URL: https://www.detroitlions.com/team/players-roster/aidan-hutchinson/logs/
   - Research exclusions/constraints:
     - Routine sack totals, All-America labels and NFL draft information were not retained.

### Alex Mack — OL — `cfb-alex-mack`

1. **`cfb-alex-mack--two-way-prep-defensive-mvp`** — Mack played both ways at San Marcos High and was named his league’s co-MVP on defense after recording 93 tackles and eight sacks as a senior.
   - Why distinctive: A future All-American center being a high-school defensive MVP is a strong position-identity contrast.
   - Source: California Athletics Alex Mack biography
   - URL: https://calbears.com/sports/football/roster/coaches/alex-mack/194
2. **`cfb-alex-mack--cif-heavyweight-wrestler`** — Mack wrestled for four years, became a CIF heavyweight champion and went 26-1 as a senior.
   - Why distinctive: The heavyweight wrestling résumé is a highly relevant and memorable background for an interior lineman.
   - Source: California Athletics Alex Mack biography
   - URL: https://calbears.com/sports/football/roster/coaches/alex-mack/194
3. **`cfb-alex-mack--legal-studies-magna-cum-laude`** — Mack graduated magna cum laude from Cal with a legal studies degree.
   - Why distinctive: The specific academic path stands out for a nationally prominent lineman.
   - Source: National Football Foundation Campbell Trophy biography
   - URL: https://footballfoundation.org/sports/football/roster/alex-mack/573
4. **`cfb-alex-mack--graduate-student-education`** — He played his final Cal season as a graduate student studying education.
   - Why distinctive: Continuing into graduate school while starting at center adds distinct academic identity beyond simply earning a degree.
   - Source: California Athletics Alex Mack biography
   - URL: https://calbears.com/sports/football/roster/coaches/alex-mack/194
5. **`cfb-alex-mack--two-time-morris-peer-vote`** — Mack won the Morris Trophy twice, an award chosen by opposing Pac-10 defensive linemen for the conference’s top offensive lineman.
   - Why distinctive: The unusual peer-voted nature of the honor makes it more identity-rich than a generic All-America mention.
   - Source: National Football Foundation Campbell Trophy biography
   - URL: https://footballfoundation.org/sports/football/roster/alex-mack/573
   - Research exclusions/constraints:
     - Consecutive starts and sack-allowed team statistics were rejected as generic résumé material.

### Amari Cooper — WR — `cfb-amari-cooper`

1. **`cfb-amari-cooper--teddy-bridgewater-teammate`** — Cooper played at Miami Northwestern High School with quarterback Teddy Bridgewater.
   - Why distinctive: The high-school pairing links two later major college/NFL names from the same Miami program.
   - Source: Buffalo Bills player biography
   - URL: https://static.clubs.nfl.com/image/upload/bills/m8gerv5jb7nkovxkwmb6
2. **`cfb-amari-cooper--coconut-grove-barnyard-football`** — Cooper grew up in Miami’s Coconut Grove area and spent ages 5 to 12 at The Barnyard after-school program, where competitive football games on a blacktop were a formative part of his childhood.
   - Why distinctive: The Barnyard is a specific place-and-upbringing story repeatedly tied to how Cooper first developed his football identity.
   - Source: Oakland Raiders feature-clips compilation of Bay Area News Group profile
   - URL: https://static.clubs.nfl.com/image/upload/raiders/re0vrphviaskzjcnphx1.pdf
3. **`cfb-amari-cooper--chess-from-music-teacher`** — Cooper learned chess in elementary school from a music teacher who ran the school chess club and later became an avid player.
   - Why distinctive: Chess is one of Cooper’s best-known non-football interests and a distinctive intellectual motif in profiles of him.
   - Source: Buffalo Bills player biography / ESPN profile excerpt
   - URL: https://static.clubs.nfl.com/image/upload/bills/m8gerv5jb7nkovxkwmb6
4. **`cfb-amari-cooper--route-runner-brand`** — Cooper created a clothing brand called “Route Runner.”
   - Why distinctive: The brand name reinforces a public identity centered on his precise route-running craft.
   - Source: Buffalo Bills player biography
   - URL: https://static.clubs.nfl.com/image/upload/bills/m8gerv5jb7nkovxkwmb6
5. **`cfb-amari-cooper--alabama-camp-earned-saban-offer`** — At an Alabama camp, Cooper impressed Nick Saban during one-on-one work and was called into Saban’s office for a scholarship offer; his high-school coach had expected him to follow former teammates to Louisville, but Cooper wanted to make his own name.
   - Why distinctive: The camp-to-offer story and decision to forge a separate path give his Alabama recruitment a distinctive personal turning point.
   - Source: ESPN SEC profile on Cooper’s path to Alabama
   - URL: https://www.espn.com/blog/sec/post/_/id/96041/amari-cooper-paved-his-own-way-to-alabama
   - Research exclusions/constraints:
     - Alabama receiving records and Heisman voting placement were not retained because they duplicate structural résumé data.
     - The chess-to-route-running analogy was researched but not separately retained because it is part of the same underlying chess concept.

### Andre Johnson — WR — `cfb-andre-johnson`

1. **`cfb-andre-johnson--miami-native-stayed-home`** — Johnson attended Miami Senior High and stayed in his hometown to play for the Miami Hurricanes.
   - Why distinctive: The homegrown Miami-to-Miami path is a clear geographic identity marker.
   - Source: University of Miami Sports Hall of Fame biography
   - URL: https://www.umsportshalloffame.com/andre-johnson.html
2. **`cfb-andre-johnson--big-east-sprint-double`** — While also playing football, Johnson won the Big East indoor 60-meter title and outdoor 100-meter title in 2002.
   - Why distinctive: Winning conference sprint championships makes his track speed much more distinctive than simply saying he ran track.
   - Source: Miami Athletics 100-meter title release
   - URL: https://miamihurricanes.com/news/2002/05/05/205547137-2/
3. **`cfb-andre-johnson--rose-bowl-co-mvp`** — Johnson shared MVP honors with Ken Dorsey in Miami’s 2002 Rose Bowl national-championship win after a dominant receiving performance.
   - Why distinctive: That game is an iconic Miami moment strongly associated with him.
   - Source: Miami Athletics Pro Football Hall of Fame release
   - URL: https://miamihurricanes.com/news/2024/02/08/hester-johnson-named-to-pro-football-hall-of-fame/
4. **`cfb-andre-johnson--shoulder-surgery-return`** — During his Miami career, Johnson underwent shoulder surgery shortly after the Florida game and returned later that season.
   - Why distinctive: The midseason surgery-and-return story is a recognizable adversity point beyond his statistical résumé.
   - Source: Miami Hurricanes player biography
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/andre-johnson/
5. **`cfb-andre-johnson--foundation-single-parent-youth`** — Johnson established the Andre Johnson Foundation early in his pro career to support children and teenagers growing up in single-parent homes.
   - Why distinctive: The mission is a longstanding, person-specific part of his public identity.
   - Source: University of Miami Sports Hall of Fame biography
   - URL: https://www.umsportshalloffame.com/andre-johnson.html
   - Research exclusions/constraints:
     - Career receiving totals and NFL accolades were not retained.

### Andre Ware — QB — `cfb-andre-ware`

1. **`cfb-andre-ware--insisted-on-playing-quarterback`** — Ware drew scholarship interest after high school, but many schools did not want him as a quarterback; he held out for a chance to play the position.
   - Why distinctive: The insistence on remaining a quarterback is central to a career that later broke barriers at the position.
   - Source: Heisman Trust biography
   - URL: https://www.heisman.com/heisman-winners/andre-ware/
2. **`cfb-andre-ware--alvin-cc-two-jobs`** — After being ruled ineligible for his first Houston season, Ware attended Alvin Community College and worked two jobs to help pay tuition.
   - Why distinctive: The detour is a highly distinctive pre-stardom adversity story.
   - Source: Heisman Trust biography
   - URL: https://www.heisman.com/heisman-winners/andre-ware/
3. **`cfb-andre-ware--run-and-shoot-arrival`** — Ware’s arrival as an eligible Houston player coincided with Jack Pardee bringing the run-and-shoot offense to the Cougars.
   - Why distinctive: The system change is inseparable from why his college career became historically unusual.
   - Source: Heisman Trust biography
   - URL: https://www.heisman.com/heisman-winners/andre-ware/
4. **`cfb-andre-ware--first-black-heisman-qb`** — Ware became the first Black quarterback to win the Heisman Trophy.
   - Why distinctive: This is a historically distinctive identity fact, not merely an award count.
   - Source: Heisman Trust biography
   - URL: https://www.heisman.com/heisman-winners/andre-ware/
5. **`cfb-andre-ware--heisman-on-probation-team`** — Ware remains the only Heisman winner whose team was on NCAA probation during his winning season.
   - Why distinctive: The unusual context around the award makes his Houston season uniquely identifiable.
   - Source: Heisman Trust biography
   - URL: https://www.heisman.com/heisman-winners/andre-ware/
   - Research exclusions/constraints:
     - Passing-yard totals were rejected because the run-and-shoot context is more distinctive than raw statistics.

### Andrew Luck — QB — `cfb-andrew-luck`

1. **`cfb-andrew-luck--oliver-luck-football-family`** — Luck is the son of Oliver Luck, a former West Virginia and NFL quarterback who later became an athletic administrator.
   - Why distinctive: The father-son quarterback/administrator connection is a major part of Luck’s football background.
   - Source: Stanford Athletics Andrew Luck profile
   - URL: https://gostanford.com/news/2013/04/17/andrew-luck-profile
2. **`cfb-andrew-luck--high-school-valedictorian`** — Luck was the valedictorian of Stratford High School’s 2008 graduating class in Houston.
   - Why distinctive: It is a striking academic marker for an elite quarterback recruit.
   - Source: Stanford Athletics Andrew Luck profile
   - URL: https://gostanford.com/news/2013/04/17/andrew-luck-profile
3. **`cfb-andrew-luck--architectural-design-major`** — At Stanford, Luck earned his bachelor’s degree in architectural design.
   - Why distinctive: The uncommon major is one of his most recognizable off-field college details.
   - Source: Stanford Athletics staff biography
   - URL: https://gostanford.com/staff/andrew-luck
4. **`cfb-andrew-luck--academic-father-son-hall`** — Luck later joined his father Oliver as the first father-son duo in the College Sports Communicators Academic All-America Hall of Fame.
   - Why distinctive: It extends the Luck family connection into an unusually specific academic distinction.
   - Source: Stanford Athletics staff biography
   - URL: https://gostanford.com/staff/andrew-luck
5. **`cfb-andrew-luck--returned-to-run-stanford-football`** — After his NFL retirement and completion of a Stanford master’s degree in education, Luck returned to Stanford to oversee the football program in a general-manager role.
   - Why distinctive: Returning to lead his alma mater’s football operation gives him an unusually deep post-playing Stanford identity.
   - Source: Stanford Athletics staff biography
   - URL: https://gostanford.com/staff/andrew-luck
   - Research exclusions/constraints:
     - NFL draft status and Stanford win-loss records were not retained.

### Antoine Winfield Jr. — DB — `cfb-antoine-winfield-jr`

1. **`cfb-antoine-winfield-jr--father-ohio-state-thorpe-viking`** — Winfield’s father, Antoine Sr., won the Jim Thorpe Award at Ohio State and later played nine seasons for the Minnesota Vikings.
   - Why distinctive: His father links two competing geographic pulls in Winfield Jr.’s own college choice.
   - Source: Minnesota Athletics newcomer profile
   - URL: https://gophersports.com/news/2016/8/4/Meet_The_Newcomers_Antoine_Winfield_Jr_
2. **`cfb-antoine-winfield-jr--minnesota-to-texas-and-back`** — Winfield Jr. lived in Minnesota before moving to Texas for his final three years of high school, then returned to the Twin Cities for college.
   - Why distinctive: The leave-and-return geography is a distinctive personal path into the Gophers program.
   - Source: Minnesota Athletics newcomer profile
   - URL: https://gophersports.com/news/2016/8/4/Meet_The_Newcomers_Antoine_Winfield_Jr_
3. **`cfb-antoine-winfield-jr--carter-coughlin-childhood-friend`** — He grew up playing football with Carter Coughlin, who later reconnected with him and helped persuade him to visit Minnesota.
   - Why distinctive: A childhood teammate directly influencing his college recruitment is a strong relationship clue.
   - Source: Minnesota Athletics newcomer profile
   - URL: https://gophersports.com/news/2016/8/4/Meet_The_Newcomers_Antoine_Winfield_Jr_
4. **`cfb-antoine-winfield-jr--chose-minnesota-over-family-ohio-state-pull`** — Some relatives and friends urged Winfield Jr. toward Ohio State because of his father’s legacy, but he chose Minnesota.
   - Why distinctive: The decision differentiates him from a straightforward legacy recruit.
   - Source: Minnesota Athletics newcomer profile
   - URL: https://gophersports.com/news/2016/8/4/Meet_The_Newcomers_Antoine_Winfield_Jr_
5. **`cfb-antoine-winfield-jr--brother-austin-gopher-db`** — His brother Austin also played defensive back for Minnesota.
   - Why distinctive: The sibling overlap makes the Gophers connection a family story of its own.
   - Source: Minnesota Athletics player biography
   - URL: https://gophersports.com/sports/football/roster/antoine-winfield-jr/16427
   - Research exclusions/constraints:
     - Tackle totals and NFL achievements were not retained.

### Ashton Jeanty — RB — `cfb-ashton-jeanty`

1. **`cfb-ashton-jeanty--military-family-naples-italy`** — Jeanty spent part of his youth in Naples, Italy, because his father was stationed there with the U.S. Navy.
   - Why distinctive: Growing up overseas in a military family is an unusually distinctive origin for a major college running back.
   - Source: ESPN profile on Jeanty’s rise
   - URL: https://www.espn.com/college-football/story/_/id/41962943/boise-state-ashton-jeanty-dominant-running-back-heisman-2024
2. **`cfb-ashton-jeanty--football-began-overseas`** — His tackle-football journey began with the Naples Wildcats community connected to the U.S. military base in Italy.
   - Why distinctive: Starting football overseas, rather than in a typical American youth program, is a powerful identification clue.
   - Source: NFL.com draft profile feature
   - URL: https://www.nfl.com/news/2025-nfl-draft-get-to-know-ashton-jeanty
3. **`cfb-ashton-jeanty--moved-to-frisco-for-exposure`** — Jeanty’s family moved to Frisco, Texas, before high school in part so he could gain more football exposure.
   - Why distinctive: The deliberate Italy-to-Texas move explains how his recruiting path reached major college football.
   - Source: Idaho Statesman profile
   - URL: https://www.idahostatesman.com/sports/college/mountain-west/boise-state-university/boise-state-football/article295617584.html
4. **`cfb-ashton-jeanty--five-prep-positions`** — At Lone Star High School, Jeanty played running back, wide receiver, defensive end, linebacker and safety.
   - Why distinctive: Five distinct prep positions make his athletic versatility unusually memorable.
   - Source: NFL.com draft profile feature
   - URL: https://www.nfl.com/news/2025-nfl-draft-get-to-know-ashton-jeanty
5. **`cfb-ashton-jeanty--three-sport-high-school-athlete`** — Jeanty also competed in basketball and track in high school in addition to football.
   - Why distinctive: The multi-sport background complements, without duplicating, his unusual football-position versatility.
   - Source: Boise State Athletics player biography
   - URL: https://broncosports.com/sports/football/roster/jeantyashton/10215
   - Research exclusions/constraints:
     - 2024 rushing totals and Heisman placement were not retained because they are structural performance data.

### Baker Mayfield — QB — `cfb-baker-mayfield`

1. **`cfb-baker-mayfield--texas-tech-walk-on`** — After being passed over by most major programs for a scholarship, Mayfield walked on at Texas Tech in 2013.
   - Why distinctive: The walk-on origin is foundational to his college identity.
   - Source: Heisman Trust transfer history feature
   - URL: https://www.heisman.com/articles/transfers-and-the-heisman/
2. **`cfb-baker-mayfield--walk-on-wins-opening-job`** — Mayfield immediately won Texas Tech’s starting quarterback job as a true freshman walk-on.
   - Why distinctive: Winning the job right away makes the walk-on story more distinctive than merely lacking a scholarship.
   - Source: Heisman Trust transfer history feature
   - URL: https://www.heisman.com/articles/transfers-and-the-heisman/
3. **`cfb-baker-mayfield--transferred-and-walked-on-oklahoma`** — He transferred from Texas Tech to Oklahoma and initially joined the Sooners as a walk-on as well.
   - Why distinctive: Walking on at two Power Five programs is an exceptionally unusual college path.
   - Source: Heisman Trust transfer history feature
   - URL: https://www.heisman.com/articles/transfers-and-the-heisman/
4. **`cfb-baker-mayfield--sat-2014-transfer-rule`** — Mayfield had to sit out the 2014 season after his transfer to Oklahoma under the rules then in place.
   - Why distinctive: The lost season is an important transition point in his rise.
   - Source: Heisman Trust transfer history feature
   - URL: https://www.heisman.com/articles/transfers-and-the-heisman/
5. **`cfb-baker-mayfield--former-walk-on-heisman`** — He became the first Heisman Trophy winner of the modern scholarship era to begin his college career as a walk-on.
   - Why distinctive: The historic culmination makes the walk-on path uniquely identifiable.
   - Source: Heisman Trust Baker Mayfield biography
   - URL: https://www.heisman.com/heisman-winners/baker-mayfield/
   - Research exclusions/constraints:
     - Passing statistics and NFL draft position were not retained. The walk-on sequence is separated only where each step marks a different school/status transition.

### Barrett Jones — OL — `cfb-barrett-jones`

1. **`cfb-barrett-jones--started-three-line-positions`** — Jones started for Alabama at right guard, left tackle and center during his career.
   - Why distinctive: Elite-level starts at three different offensive-line positions are unusually identifying.
   - Source: Alabama Athletics Academic All-America release
   - URL: https://rolltide.com/news/2012/12/6/Barrett_Jones_Named_Capital_One_Academic_All_America_of_the_Year
2. **`cfb-barrett-jones--accounting-bachelors-and-masters`** — Jones completed an accounting bachelor’s degree and continued into graduate study while at Alabama.
   - Why distinctive: The accounting path is a specific off-field marker for a national-championship lineman.
   - Source: National Football Foundation Barrett Jones biography
   - URL: https://footballfoundation.org/sports/football/roster/barrett-jones/569
3. **`cfb-barrett-jones--four-time-academic-all-american`** — Jones became the first Alabama football player to earn Academic All-America recognition four times.
   - Why distinctive: The repeated academic distinction is rare enough to function as identity knowledge, not just another award.
   - Source: National Football Foundation Barrett Jones biography
   - URL: https://footballfoundation.org/sports/football/roster/barrett-jones/569
4. **`cfb-barrett-jones--brothers-alabama-football`** — His brothers Harrison and Walker also became Alabama football players.
   - Why distinctive: Three brothers tied to the same powerhouse program is a distinctive family connection.
   - Source: ESPN The Magazine profile of Barrett Jones
   - URL: https://www.espn.com/nfl/draft2013/story/_/id/9197435/2013-nfl-draft-alabama-barrett-jones-espn-magazine
5. **`cfb-barrett-jones--haiti-nicaragua-mission-trips`** — Jones took part in multiple mission trips to Haiti and Nicaragua while at Alabama, working at schools and orphanages and on construction projects.
   - Why distinctive: The repeated international service work is a recognizable off-field element of his college identity.
   - Source: Alabama Athletics Academic All-America release
   - URL: https://rolltide.com/news/2012/12/6/Barrett_Jones_Named_Capital_One_Academic_All_America_of_the_Year
   - Research exclusions/constraints:
     - Outland/Rimington-style award lists and national-title counts were not retained as standalone concepts.

### Bijan Robinson — RB — `cfb-bijan-robinson`

1. **`cfb-bijan-robinson--raised-with-grandfather-cleo`** — Robinson grew up in his grandparents’ Tucson home and has described grandfather Cleo Robinson as a father figure who brought football into his life.
   - Why distinctive: His relationship with Cleo is central to multiple long-form profiles of his upbringing.
   - Source: ESPN profile of Bijan Robinson
   - URL: https://www.espn.com/nfl/draft2023/story/_/id/36234668/why-bijan-robinson-break-nfl-draft-running-back-bias
2. **`cfb-bijan-robinson--grandfather-pac12-official`** — Cleo Robinson was a former athlete who spent decades as a football and basketball official, including work in the Pac-10/Pac-12 ecosystem.
   - Why distinctive: A grandfather who was a major-college game official is an unusual football-family connection.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/bijan-robinson/11507
3. **`cfb-bijan-robinson--great-uncle-paul-nfl-running-back`** — Robinson’s great-uncle Paul Robinson played running back at Arizona and later became a Pro Bowl NFL back.
   - Why distinctive: The running-back lineage is specific and directly connected to his own position.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/bijan-robinson/11507
4. **`cfb-bijan-robinson--childhood-near-drowning-swim-safety`** — A near-drowning experience when Robinson was five later helped inspire swim-safety work through his foundation.
   - Why distinctive: The experience connects a formative childhood event to a concrete public-service cause.
   - Source: Bijan Robinson Foundation
   - URL: https://www.bijanrobinson.com/foundation
5. **`cfb-bijan-robinson--bijan-mustardson`** — While at Texas in the NIL era, Robinson launched his own Dijon mustard brand, “Bijan Mustardson.”
   - Why distinctive: The name-based condiment became one of the more memorable early NIL branding stories in college football.
   - Source: Sports Illustrated NIL feature
   - URL: https://www.si.com/college/2022/12/15/college-athletes-top-food-related-nil-deals-2022
   - Research exclusions/constraints:
     - Rushing totals and draft projections were not retained.

### Bill Snyder — Coach — `bill-snyder-cfb`

1. **`bill-snyder--california-high-school-coaching-start`** — Snyder began his full-time coaching career in California high-school football before entering the college ranks.
   - Why distinctive: His path did not begin at a major college, which helps distinguish his long climb to Kansas State.
   - Source: Kansas State Athletics coach biography
   - URL: https://www.kstatesports.com/sports/football/roster/coaches/bill-snyder/1258
2. **`bill-snyder--austin-college-swimming-coach`** — At Austin College, Snyder served as offensive coordinator while also coaching the school’s swimming team.
   - Why distinctive: A future Hall of Fame football coach simultaneously coaching swimming is unusually distinctive.
   - Source: Kansas State Athletics coach biography
   - URL: https://www.kstatesports.com/sports/football/roster/coaches/bill-snyder/1258
3. **`bill-snyder--hayden-fry-apprenticeship`** — Snyder worked under Hayden Fry at North Texas and then followed him to Iowa, where Snyder spent a decade as offensive coordinator.
   - Why distinctive: The Fry coaching-tree path explains the foundation of Snyder’s later program-building identity.
   - Source: Kansas State Athletics coach biography
   - URL: https://www.kstatesports.com/sports/football/roster/coaches/bill-snyder/1258
4. **`bill-snyder--miracle-of-manhattan`** — Snyder took over a Kansas State program that had gone 0-26-1 immediately before his arrival and led the turnaround widely nicknamed the “Miracle of Manhattan.”
   - Why distinctive: The scale of the rebuild is the defining story of his coaching identity.
   - Source: Kansas Sports Hall of Fame biography
   - URL: https://www.kshof.org/team/bill-snyder
5. **`bill-snyder--retired-then-returned`** — After retiring following the 2005 season, Snyder returned as Kansas State head coach in 2009 and rebuilt the program a second time.
   - Why distinctive: A successful second tenure after retirement is a distinctive late-career chapter.
   - Source: Kansas State Athletics retirement release
   - URL: https://www.kstatesports.com/news/2018/12/2/football-bill-snyder-announces-retirement-from-kansas-state
   - Research exclusions/constraints:
     - Win totals, bowl totals and championship counts were not retained as standalone facts.

### Bob Stoops — Coach — `bob-stoops-cfb`

1. **`bob-stoops--youngstown-coaching-family`** — Stoops grew up in Youngstown, Ohio, in a football-coaching family; his father Ron was a longtime defensive coordinator at Cardinal Mooney High School.
   - Why distinctive: The Youngstown coaching household is the root of the Stoops family’s unusually deep coaching tree.
   - Source: Oklahoma Athletics profile
   - URL: https://soonersports.com/news/2001/1/3/208366339
2. **`bob-stoops--lightly-recruited-to-iowa`** — Stoops has said he was not heavily recruited as a player; Iowa’s connection to his father helped bring him to the Hawkeyes.
   - Why distinctive: A modest recruiting profile contrasts with his later prominence and gives his Iowa path a specific origin.
   - Source: Iowa Athletics profile
   - URL: https://hawkeyesports.com/news/2019/08/30/football-stoops
3. **`bob-stoops--three-stoops-brothers-at-iowa`** — Bob became the oldest of three Stoops brothers to play defensive back at Iowa and later helped recruit younger brothers Mike and Mark there.
   - Why distinctive: Three brothers at one program is a memorable family-college link.
   - Source: Iowa Athletics feature
   - URL: https://hawkeyesports.com/news/2011/12/5/wine-online-a-duel-of-friends-in-the-desert
4. **`bob-stoops--player-in-hayden-fry-turnaround`** — Stoops’ Iowa playing career began as Hayden Fry was starting the Hawkeyes’ program turnaround.
   - Why distinctive: He experienced a major rebuild as a player before becoming famous for rebuilding Oklahoma.
   - Source: Iowa Athletics profile
   - URL: https://hawkeyesports.com/news/2019/08/30/football-stoops
5. **`bob-stoops--stayed-at-iowa-to-coach`** — After his final Iowa playing season, Stoops stayed with the Hawkeyes as a graduate assistant and volunteer coach.
   - Why distinctive: The immediate player-to-coach transition at his alma mater marks the start of his coaching identity.
   - Source: Iowa Athletics feature
   - URL: https://hawkeyesports.com/news/2011/12/5/wine-online-a-duel-of-friends-in-the-desert
   - Research exclusions/constraints:
     - Oklahoma win totals and championship lists were not retained.

### Brady Quinn — QB — `cfb-brady-quinn`

1. **`cfb-brady-quinn--middle-school-notre-dame-visits`** — As a middle-schooler in Dublin, Ohio, Quinn regularly visited Notre Dame on football weekends with friend Chinedum Ndukwe because Ndukwe’s older brother was a student there.
   - Why distinctive: The school was part of his life well before he became a recruit, in a very specific way.
   - Source: Notre Dame Athletics Brady Quinn feature
   - URL: https://fightingirish.com/news/2006/06/26/summer-football-fix-brady-quinn-feature
2. **`cfb-brady-quinn--ndukwe-high-school-teammate`** — Quinn and Chinedum Ndukwe were high-school teammates at Dublin Coffman and then entered Notre Dame in the same class.
   - Why distinctive: Their Ohio-to-Notre-Dame connection is a strong relationship clue.
   - Source: Notre Dame Athletics feature on young combinations
   - URL: https://fightingirish.com/irish-enjoying-the-combo-platter/
3. **`cfb-brady-quinn--finance-political-science-double-major`** — Quinn pursued a double major in finance and political science at Notre Dame.
   - Why distinctive: The specific two-field academic combination is distinctive off-field college identity.
   - Source: Notre Dame Athletics player feature
   - URL: https://fightingirish.com/news/2006/11/17/player-feature
4. **`cfb-brady-quinn--law-school-aspiration`** — While at Notre Dame, Quinn discussed an interest in law school and eventually passing the bar after football.
   - Why distinctive: It adds a career aspiration beyond athletics that was documented during his college years.
   - Source: Notre Dame Athletics player feature
   - URL: https://fightingirish.com/news/2006/11/17/player-feature
5. **`cfb-brady-quinn--aj-hawk-sister-fiesta-bowl`** — Quinn’s sister Laura was dating Ohio State linebacker A.J. Hawk when Notre Dame faced Ohio State in the 2006 Fiesta Bowl, creating the game’s famous split-family storyline.
   - Why distinctive: The matchup is one of the most recognizable personal subplots of Quinn’s college career.
   - Source: ESPN Fiesta Bowl retrospective
   - URL: https://www.espn.com/college-football/story/_/id/14458113/a-lot-changed-ohio-state-buckeyes-notre-dame-fighting-irish-last-met-fiesta-bowl
   - Research exclusions/constraints:
     - Routine passing totals, draft status and award finishes were not retained.

### Brandin Cooks — WR — `cfb-brandin-cooks`

1. **`cfb-brandin-cooks--sonic-boom-nickname`** — Cooks’ Oregon State biography lists his nickname as “Sonic Boom.”
   - Why distinctive: The nickname is an immediately recognizable person-specific hook tied to his speed.
   - Source: Oregon State Athletics player biography
   - URL: https://osubeavers.com/sports/football/roster/brandin-cooks/2450
2. **`cfb-brandin-cooks--junior-olympics-sprinter`** — Cooks competed as a sprinter and participated in the Junior Olympics while in high school.
   - Why distinctive: That level of track participation makes his speed background more distinctive than simply being a fast receiver.
   - Source: Oregon State Athletics player biography
   - URL: https://osubeavers.com/sports/football/roster/brandin-cooks/2450
3. **`cfb-brandin-cooks--six-varsity-letters`** — He also played basketball and finished high school with six varsity letters across sports.
   - Why distinctive: The breadth of his prep athletic involvement adds a separate multi-sport identifier.
   - Source: Oregon State Athletics player biography
   - URL: https://osubeavers.com/sports/football/roster/brandin-cooks/2450
4. **`cfb-brandin-cooks--stepbrother-maurice-washington`** — Cooks’ stepbrother Maurice Washington played college football at Texas A&M-Kingsville and later attended an Oakland Raiders training camp.
   - Why distinctive: It is a specific family-football connection rarely associated with other receivers.
   - Source: Oregon State Athletics player biography
   - URL: https://osubeavers.com/sports/football/roster/brandin-cooks/2450
5. **`cfb-brandin-cooks--raised-by-mother-after-fathers-death`** — Cooks’ father died of a heart attack when Brandin was six, after which his mother Andrea raised Brandin and his three brothers.
   - Why distinctive: This well-documented childhood adversity is central to long-form profiles of his family background.
   - Source: NFL.com feature on Brandin Cooks
   - URL: https://www.nfl.com/news/brandin-cooks-robert-woods-lead-rolling-rams-wr-corps-0ap3000001014625
   - Research exclusions/constraints:
     - Oregon State receiving totals and NFL career statistics were not retained.

### Brandon Scherff — OL — `cfb-brandon-scherff`

1. **`cfb-brandon-scherff--295-pound-high-school-quarterback`** — Scherff played quarterback as a high-school sophomore and threw for roughly 1,200 yards despite already being close to 295 pounds.
   - Why distinctive: A future elite offensive tackle having been a very large quarterback is exceptionally memorable.
   - Source: Iowa Athletics Hall of Fame spotlight
   - URL: https://hawkeyesports.com/news/2025/08/6/2025-iowa-athletics-hall-of-fame-spotlight-brandon-scherff
2. **`cfb-brandon-scherff--recruited-at-shot-put-meet`** — Iowa assistant Reese Morgan first approached Scherff while Scherff was competing in the shot put at the Iowa state track meet.
   - Why distinctive: The recruiting encounter has a vivid, person-specific origin story.
   - Source: Iowa Athletics Hall of Fame spotlight
   - URL: https://hawkeyesports.com/news/2025/08/6/2025-iowa-athletics-hall-of-fame-spotlight-brandon-scherff
3. **`cfb-brandon-scherff--state-shot-put-champion`** — Scherff won an Iowa state high-school shot put championship and held his school’s shot put record.
   - Why distinctive: The field-event success is a strong non-football athletic marker for an offensive lineman.
   - Source: Iowa Athletics player biography
   - URL: https://hawkeyesports.com/sports/football/roster/player/brandon-scherff
4. **`cfb-brandon-scherff--four-sport-prep-athlete`** — Beyond football and track, Scherff earned all-state honors in baseball, all-conference recognition in basketball and also lettered in tennis.
   - Why distinctive: The unusually broad four-sport background distinguishes him from typical lineman profiles.
   - Source: Iowa Athletics player biography
   - URL: https://hawkeyesports.com/sports/football/roster/player/brandon-scherff
5. **`cfb-brandon-scherff--quarterback-to-two-way-line`** — After his sophomore quarterback season, Scherff shifted to offensive and defensive line for his final two high-school seasons before Iowa recruited him as a lineman.
   - Why distinctive: The drastic position transformation is a defining developmental story.
   - Source: Iowa Athletics player biography
   - URL: https://hawkeyesports.com/sports/football/roster/player/brandon-scherff
   - Research exclusions/constraints:
     - College blocking awards and NFL draft position were not retained.

### Braylon Edwards — WR — `cfb-braylon-edwards`

1. **`cfb-braylon-edwards--father-stan-michigan-player`** — Edwards’ father Stan also played football at Michigan.
   - Why distinctive: The father-son Wolverine connection makes Braylon part of a Michigan football family.
   - Source: Michigan Athletics No. 1 jersey feature
   - URL: https://mgoblue.com/news/2017/4/27/kornacki_braylon_edwards_has_new_no_1
2. **`cfb-braylon-edwards--anthony-carter-family-connection`** — Michigan receiving legend Anthony Carter had been a teammate of Braylon’s father, giving Edwards a personal connection to the receiver who made Michigan’s No. 1 jersey famous.
   - Why distinctive: It directly links Edwards’ family history to the program’s iconic receiver tradition.
   - Source: Michigan Athletics scholarship announcement
   - URL: https://mgoblue.com/news/2006/4/18/edwards_donates_500_000_to_athletic_department
3. **`cfb-braylon-edwards--earned-no-1-jersey`** — Edwards specifically asked to wear Michigan’s coveted No. 1, and Lloyd Carr made him earn the switch through his play before granting it.
   - Why distinctive: The number was a deliberate identity choice tied to Michigan receiver history.
   - Source: Michigan Athletics 2003 media-day quotes
   - URL: https://mgoblue.com/news/2003/8/9/2003_U_M_Football_Media_Day_Offensive_Player_Quotes
4. **`cfb-braylon-edwards--endowed-no-1-scholarship`** — After college, Edwards pledged $500,000 to endow a Michigan scholarship connected to the player wearing No. 1.
   - Why distinctive: He turned a jersey tradition into a lasting institutional legacy, making the number central to his identity beyond playing days.
   - Source: Michigan Athletics scholarship announcement
   - URL: https://mgoblue.com/news/2006/4/18/edwards_donates_500_000_to_athletic_department
5. **`cfb-braylon-edwards--returned-to-finish-degree`** — Years after leaving for the NFL, Edwards returned to Michigan to finish his degree after being encouraged to make education his next “No. 1” priority.
   - Why distinctive: The return-to-school story adds a later chapter to his relationship with Michigan.
   - Source: Michigan Athletics No. 1 jersey feature
   - URL: https://mgoblue.com/news/2017/4/27/kornacki_braylon_edwards_has_new_no_1
   - Research exclusions/constraints:
     - Receiving records and Biletnikoff Award were not retained as standalone résumé facts.

### Brian Kelly — Coach — `brian-kelly-cfb`

1. **`brian-kelly--assumption-linebacker-captain`** — Kelly was a four-year linebacker at Assumption College and captained the team in his final two seasons.
   - Why distinctive: His playing roots are at a small Massachusetts program rather than a major college power.
   - Source: University of Cincinnati Athletics coach biography
   - URL: https://gobearcats.com/staff/brian-kelly
2. **`brian-kelly--political-science-degree`** — Kelly earned a political science degree from Assumption in 1983.
   - Why distinctive: The academic background is a specific personal detail from before his coaching career.
   - Source: University of Cincinnati Athletics coach biography
   - URL: https://gobearcats.com/staff/brian-kelly
3. **`brian-kelly--coached-assumption-softball`** — Early in his career, Kelly coached football defense at Assumption and also served as the school’s head softball coach.
   - Why distinctive: A future major-college football coach having been a college softball head coach is highly distinctive.
   - Source: Assumption University stadium feature
   - URL: https://www.assumption.edu/news-and-events/news/multi-sport-stadium-named-notre-dame-football-coach-brian-kelly-83-hd-12
4. **`brian-kelly--grand-valley-13-year-head-coach`** — Kelly’s first college head-coaching job was at Division II Grand Valley State, where he remained head coach for 13 seasons.
   - Why distinctive: The long Division II apprenticeship is essential context for a coach later associated with Notre Dame and LSU.
   - Source: Grand Valley State Athletics Hall of Fame biography
   - URL: https://gvsulakers.com/honors/hall-of-fame/brian-kelly/26
5. **`brian-kelly--kelly-cares-foundation`** — Kelly and his family created the Kelly Cares Foundation, which has supported health, education and community causes.
   - Why distinctive: The foundation is a longstanding off-field public identity rather than a one-off charitable event.
   - Source: Kelly Cares Foundation history
   - URL: https://www.kellycaresfoundation.org/about/our-story/
   - Research exclusions/constraints:
     - Career win totals, playoff appearances and championship counts were not retained. Family medical specifics behind the foundation were deliberately not used as a clue.

### Brian Orakpo — DL — `cfb-brian-orakpo`

1. **`cfb-brian-orakpo--prep-basketball-star`** — Before fully focusing on football, Orakpo was a prominent high-school basketball player.
   - Why distinctive: The basketball background contrasts with his later identity as a power edge defender.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/brian-orakpo/748
2. **`cfb-brian-orakpo--late-football-focus`** — Orakpo shifted his athletic focus toward football relatively late in high school, after spending significant time on basketball.
   - Why distinctive: The timing helps explain a less conventional developmental path.
   - Source: Texas Athletics feature on Orakpo
   - URL: https://texaslonghorns.com/news/2009/4/16/041609aaa_26
3. **`cfb-brian-orakpo--fifty-pound-transformation`** — He arrived at Texas around 210 pounds and added roughly 50 pounds while developing into a defensive end.
   - Why distinctive: The physical transformation is a core part of his college development story.
   - Source: Texas Athletics feature on Orakpo
   - URL: https://texaslonghorns.com/news/2009/4/16/041609aaa_26
4. **`cfb-brian-orakpo--rak-nickname`** — Orakpo was widely known by the nickname “Rak.”
   - Why distinctive: The short nickname is a recognizable personal identifier tied directly to his surname.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/brian-orakpo/748
5. **`cfb-brian-orakpo--uncle-chike-iowa-football`** — His uncle Chike Orakpo played college football at Iowa.
   - Why distinctive: The family connection adds a distinct college-football lineage outside Texas.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/brian-orakpo/748
   - Research exclusions/constraints:
     - Workout numbers, sack totals and national defensive awards were not retained.

### Brian Urlacher — LB — `cfb-brian-urlacher`

1. **`cfb-brian-urlacher--only-fbs-offer-new-mexico`** — Urlacher has been described by New Mexico as having only one Division I-A scholarship offer: the Lobos.
   - Why distinctive: The one-offer recruiting story is fundamental to his unlikely path to stardom.
   - Source: New Mexico Athletics retirement feature
   - URL: https://golobos.com/news/2013/05/22/209066364
2. **`cfb-brian-urlacher--grew-from-small-receiver-safety`** — As a high-school sophomore he was about 5-foot-9 and 160 pounds while playing receiver and safety before a later growth spurt changed his football future.
   - Why distinctive: The physical-development arc helps explain why major programs overlooked him.
   - Source: New Mexico Athletics retirement feature
   - URL: https://golobos.com/news/2013/05/22/209066364
3. **`cfb-brian-urlacher--lobo-hybrid-position`** — At New Mexico, Rocky Long used Urlacher in the hybrid “Lobo” role, blending middle-linebacker and free-safety responsibilities.
   - Why distinctive: The position itself is unique to his college identity and foreshadows his unusual athletic profile.
   - Source: New Mexico Athletics retirement feature
   - URL: https://golobos.com/news/2013/05/22/209066364
4. **`cfb-brian-urlacher--three-way-senior-role`** — During his senior season he contributed on defense, at wide receiver and in the return game.
   - Why distinctive: True three-phase usage is unusually distinctive for a future NFL middle linebacker.
   - Source: New Mexico Athletics retirement feature
   - URL: https://golobos.com/news/2013/05/22/209066364
5. **`cfb-brian-urlacher--first-lobo-cfb-hall`** — Urlacher became the first New Mexico player inducted into the College Football Hall of Fame.
   - Why distinctive: The honor reflects how singularly identified he is with the Lobo program rather than merely adding another award to a list.
   - Source: New Mexico Athletics Hall of Fame announcement
   - URL: https://golobos.com/news/2017/01/09/brian-urlacher-named-to-nff-college-football-hall-of-fame
   - Research exclusions/constraints:
     - NFL résumé and basic tackle totals were not retained.

### Bryant McKinnie — OL — `cfb-bryant-mckinnie`

1. **`cfb-bryant-mckinnie--high-school-defensive-end`** — McKinnie played defensive end in high school before becoming an offensive lineman later in his development.
   - Why distinctive: The position change is a striking contrast with his college identity as a massive left tackle.
   - Source: Miami Hurricanes player biography
   - URL: https://miamihurricanes.com/roster/bryant-mckinnie/
2. **`cfb-bryant-mckinnie--lackawanna-juco-conversion`** — He attended Lackawanna Junior College, where he moved to offensive line before transferring to Miami.
   - Why distinctive: The junior-college route and position conversion are central to how he reached elite college football.
   - Source: Miami Hurricanes player biography
   - URL: https://miamihurricanes.com/roster/bryant-mckinnie/
3. **`cfb-bryant-mckinnie--400-meter-at-giant-size`** — In high school track and field, McKinnie threw the shot and discus and also ran the 400 meters despite eventually standing 6-foot-9.
   - Why distinctive: A future 300-plus-pound tackle with a 400-meter background is exceptionally memorable.
   - Source: Miami Hurricanes player biography
   - URL: https://miamihurricanes.com/roster/bryant-mckinnie/
4. **`cfb-bryant-mckinnie--no-sacks-at-miami`** — Miami credits McKinnie with not allowing a sack at left tackle during his two seasons with the Hurricanes.
   - Why distinctive: The perfect pass-protection claim is one of the defining football facts attached to his Miami identity.
   - Source: Miami Athletics Ring of Honor announcement
   - URL: https://miamihurricanes.com/news/2025/04/18/dorsey-johnson-mckinnie-morgan-selected-to-miami-football-ring-of-honor
5. **`cfb-bryant-mckinnie--knee-surgery-to-rose-bowl`** — McKinnie returned from knee surgery in time to play in Miami’s Rose Bowl national-championship victory.
   - Why distinctive: The recovery connects a personal adversity point directly to an iconic college moment.
   - Source: Miami Hurricanes player biography
   - URL: https://miamihurricanes.com/roster/bryant-mckinnie/
   - Research exclusions/constraints:
     - Draft position and standard All-America/Outland résumé items were not retained.

### Bryce Young — QB — `cfb-bryce-young`

1. **`cfb-bryce-young--philadelphia-to-pasadena`** — Young was born in Philadelphia and later grew up in the Pasadena, California, area.
   - Why distinctive: The cross-country childhood path is a more precise origin story than simply labeling him a Southern California quarterback.
   - Source: Los Angeles Times profile of Bryce Young’s roots
   - URL: https://www.latimes.com/sports/highschool/story/2021-12-11/bryce-young-heisman-trophy-roots-la-cathedral-mater-dei
2. **`cfb-bryce-young--cathedral-to-mater-dei`** — Young began high school at Cathedral in Los Angeles before transferring to Mater Dei in Santa Ana.
   - Why distinctive: The high-school move links two major Southern California programs in his development.
   - Source: Los Angeles Times recruiting profile
   - URL: https://www.latimes.com/sports/highschool/story/2020-01-11/bryce-young-father-scrutinizes-early-recruiting-process
3. **`cfb-bryce-young--father-craig-quarterback-tutor`** — His father, Craig Young, closely tutored and trained him as a quarterback during his youth.
   - Why distinctive: The father-son development relationship is a recurring theme in profiles of his rise.
   - Source: Los Angeles Times profile of Bryce Young’s roots
   - URL: https://www.latimes.com/sports/highschool/story/2021-12-11/bryce-young-heisman-trophy-roots-la-cathedral-mater-dei
4. **`cfb-bryce-young--usc-commitment-flipped-to-alabama`** — Young was committed to USC for more than a year before flipping his commitment to Alabama late in the 2020 recruiting cycle.
   - Why distinctive: A top Southern California quarterback leaving a long-standing USC pledge for Alabama was a major recruiting storyline.
   - Source: Los Angeles Times commitment report
   - URL: https://www.latimes.com/sports/usc/story/2019-09-22/bryce-young-changes-commitment-from-usc-to-alabama
5. **`cfb-bryce-young--first-alabama-qb-heisman`** — Young became the first quarterback from Alabama to win the Heisman Trophy.
   - Why distinctive: The distinction is historically specific within the program, not just another award count.
   - Source: Heisman Trust Bryce Young biography
   - URL: https://www.heisman.com/heisman-winners/bryce-young/
   - Research exclusions/constraints:
     - College passing totals and NFL draft position were not retained.

### Budda Baker — DB — `cfb-budda-baker`

1. **`cfb-budda-baker--budda-nickname-origin`** — Baker’s given name is Bishard, but his family nicknamed him “Budda” as a baby; the nickname became so universal that people sometimes assumed Bishard was someone else.
   - Why distinctive: The nickname origin is one of his most person-specific biographical details.
   - Source: Arizona Cardinals feature on Budda Baker
   - URL: https://www.azcardinals.com/news/mirror-image-budda-baker-joins-tyrann-mathieu-18849030
2. **`cfb-budda-baker--bellevue-three-way-star`** — At Bellevue High, Baker played safety, running back and return specialist on three consecutive undefeated state-championship teams.
   - Why distinctive: The two-way-plus-return role is a distinctive prep identity rather than a simple title count.
   - Source: Washington Athletics player biography
   - URL: https://gohuskies.com/sports/football/roster/budda-baker/2117
3. **`cfb-budda-baker--state-champion-sprinter`** — Baker won Washington state track titles in the 100 meters, 200 meters and relays during high school.
   - Why distinctive: Championship-level sprinting is a strong non-football identifier for a defensive back.
   - Source: Washington Athletics player biography
   - URL: https://gohuskies.com/sports/football/roster/budda-baker/2117
4. **`cfb-budda-baker--oregon-commitment-to-washington`** — Baker originally committed to Oregon before changing course and staying home to attend Washington.
   - Why distinctive: The late Pacific Northwest recruiting reversal is a major part of his college path.
   - Source: Arizona Cardinals homecoming feature
   - URL: https://www.azcardinals.com/news/budda-baker-heads-home-to-seattle-as-cardinal-20148657
5. **`cfb-budda-baker--wanted-to-stay-near-family`** — Baker has explained that remaining close to his Seattle-area family weighed heavily in choosing Washington.
   - Why distinctive: The family-centered reason gives meaning to the recruiting flip beyond a generic school choice.
   - Source: Arizona Cardinals homecoming feature
   - URL: https://www.azcardinals.com/news/budda-baker-heads-home-to-seattle-as-cardinal-20148657
   - Research exclusions/constraints:
     - Family legal/medical adversity mentioned in some profiles was excluded under the assignment’s safety/taste boundary. College tackle totals were also not retained.

### C.J. Mosley — LB — `cfb-cj-mosley`

1. **`cfb-cj-mosley--theodore-hometown-star`** — Mosley came to Alabama from Theodore High School in the Mobile area, where he became the school’s all-time leading tackler.
   - Why distinctive: Theodore is a specific Alabama-rooted origin tied closely to his Crimson Tide identity.
   - Source: Alabama Athletics 2010 signing class release
   - URL: https://rolltide.com/news/2010/2/3/Crimson_Tide_Ink_18_on_National_Signing_Day
2. **`cfb-cj-mosley--chose-alabama-over-national-offers`** — Despite offers from programs including Auburn, Florida State, Georgia, Stanford, Oklahoma and LSU, Mosley stayed in-state for Alabama.
   - Why distinctive: The decision frames him as a major in-state recruiting win rather than a generic five-star signing.
   - Source: Alabama Athletics 2010 signing class release
   - URL: https://rolltide.com/news/2010/2/3/Crimson_Tide_Ink_18_on_National_Signing_Day
3. **`cfb-cj-mosley--younger-brother-jamey-alabama-walkon`** — His younger brother Jamey Mosley later joined Alabama as a walk-on linebacker/edge player and earned a scholarship.
   - Why distinctive: The sibling connection created a second Mosley chapter in the same program.
   - Source: New York Jets undrafted free-agent release
   - URL: https://www.newyorkjets.com/news/jets-agree-to-terms-with-16-undrafted-free-agents
4. **`cfb-cj-mosley--mentored-reggie-ragland`** — Reggie Ragland, who succeeded him at Alabama, said Mosley mentored him, taught him about leadership and was the smartest player he had ever played with.
   - Why distinctive: The successor-mentor relationship captures Mosley’s cerebral leadership inside the Alabama linebacker room without relying on generic tackle totals.
   - Source: NFL.com report quoting Reggie Ragland
   - URL: https://amp.nfl.com/news/michael-bennett-says-returning-to-ohio-state-was-right-choice-0ap3000000452701
5. **`cfb-cj-mosley--returned-for-senior-season`** — Mosley chose to return to Alabama for his senior season rather than leave early for the NFL.
   - Why distinctive: The decision extended his role as the veteran face of the Crimson Tide defense and is a meaningful career-choice clue.
   - Source: ESPN report on Mosley returning to Alabama
   - URL: https://www.espn.com/college-football/story/_/id/8749314/cj-mosley-return-alabama-crimson-tide-senior-season
   - Research exclusions/constraints:
     - Tackle totals, All-America honors and NFL résumé were not retained.

### C.J. Stroud — QB — `cfbfast-r-player-4432577-c-j-stroud`

1. **`cfbfast-r-player-4432577-c-j-stroud--multi-sport-childhood`** — Before concentrating on football, Stroud played baseball, soccer and basketball; basketball was especially prominent in his family.
   - Why distinctive: The multi-sport childhood helps distinguish his development from a quarterback-only upbringing.
   - Source: ESPN long-form profile of C.J. Stroud
   - URL: https://www.espn.com/nfl/story/_/id/38834279/houston-texans-rookie-qb-cj-stroud-already-nfl-star
2. **`cfbfast-r-player-4432577-c-j-stroud--youngest-of-four-competitive-siblings`** — Stroud is the youngest of four children and has described competing with much older siblings as part of how he developed toughness and confidence.
   - Why distinctive: The age-gap family competition is a specific formative story.
   - Source: ESPN long-form profile of C.J. Stroud
   - URL: https://www.espn.com/nfl/story/_/id/38834279/houston-texans-rookie-qb-cj-stroud-already-nfl-star
3. **`cfbfast-r-player-4432577-c-j-stroud--late-recruiting-rise`** — Stroud’s national recruiting profile surged relatively late, especially after a breakout senior season at Rancho Cucamonga.
   - Why distinctive: The late rise is important because he was not always treated as an obvious blue-chip quarterback.
   - Source: Ohio State Athletics player biography
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/c-j-stroud/4470
4. **`cfbfast-r-player-4432577-c-j-stroud--elite-11-mvp`** — He won MVP honors at the Elite 11 Finals before enrolling at Ohio State.
   - Why distinctive: Winning the prominent quarterback competition is a recognizable waypoint in his late recruiting ascent.
   - Source: Ohio State Athletics player biography
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/c-j-stroud/4470
5. **`cfbfast-r-player-4432577-c-j-stroud--rancho-cucamonga-state-semifinal-run`** — In his senior season, Stroud led Rancho Cucamonga to a state-semifinal run while establishing himself as a national quarterback recruit.
   - Why distinctive: The specific high-school breakthrough ties the recruiting rise to a concrete team moment.
   - Source: Ohio State Athletics player biography
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/c-j-stroud/4470
   - Research exclusions/constraints:
     - Family legal-history material was excluded under the assignment’s safety/taste boundary. College passing totals and NFL achievements were also not retained.

### Caleb Downs — DB — `cfb-caleb-downs`

1. **`cfb-caleb-downs--deep-football-family`** — Downs comes from a prominent football family: his father Gary played NFL running back, his older brother Josh became an NFL receiver, and his uncle Dre Bly was a Pro Bowl cornerback.
   - Why distinctive: The unusually dense mix of offensive and defensive football relatives is central to his background.
   - Source: Ohio State Athletics player biography
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/caleb-downs/12257
2. **`cfb-caleb-downs--five-different-scoring-methods`** — As a high-school junior, Downs scored touchdowns five different ways: rushing, receiving, interception return, kickoff return and passing.
   - Why distinctive: That rare all-phase scoring versatility is one of the most memorable prep facts in the entire assignment.
   - Source: Alabama Athletics player biography
   - URL: https://rolltide.com/sports/football/roster/caleb-downs/8857
3. **`cfb-caleb-downs--basketball-and-baseball`** — Downs played basketball and baseball in high school in addition to starring in football.
   - Why distinctive: The multi-sport background adds breadth without repeating the five-way football scoring concept.
   - Source: Alabama Athletics player biography
   - URL: https://rolltide.com/sports/football/roster/caleb-downs/8857
4. **`cfb-caleb-downs--true-two-way-high-school-role`** — At Mill Creek, Downs was a genuine two-way football player, contributing heavily on offense as well as at defensive back.
   - Why distinctive: He was not simply a safety who took occasional offensive snaps; two-way use was a major part of his prep identity.
   - Source: Alabama Athletics player biography
   - URL: https://rolltide.com/sports/football/roster/caleb-downs/8857
5. **`cfb-caleb-downs--alabama-to-ohio-state-transfer`** — After a standout true freshman season at Alabama, Downs entered the transfer portal and joined Ohio State in January 2024.
   - Why distinctive: The Alabama-to-Ohio State move is a defining college-path pivot involving two national powers.
   - Source: Ohio State Athletics player biography
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/caleb-downs/12257
   - Research exclusions/constraints:
     - Recruiting rankings, tackle totals and award lists were not retained.

### Caleb Williams — QB — `cfb-caleb-williams`

1. **`cfb-caleb-williams--gonzaga-covid-senior-season`** — Williams attended Gonzaga College High School in Washington, D.C., and did not have a normal fall senior football season because of the COVID-19 pandemic.
   - Why distinctive: The lost senior season is an unusual recruiting-era context for a future Heisman quarterback.
   - Source: Heisman Trust Caleb Williams biography
   - URL: https://www.heisman.com/heisman-winners/caleb-williams/
2. **`cfb-caleb-williams--early-graduate-oklahoma`** — He graduated high school a semester early and enrolled at Oklahoma for the spring 2021 term.
   - Why distinctive: The accelerated transition put him in position to play as a true freshman despite the disrupted senior year.
   - Source: Heisman Trust Caleb Williams biography
   - URL: https://www.heisman.com/heisman-winners/caleb-williams/
3. **`cfb-caleb-williams--red-river-bench-spark`** — As an Oklahoma freshman, Williams replaced starter Spencer Rattler during the 2021 Red River game and helped lead a historic comeback over Texas.
   - Why distinctive: The midgame takeover is the iconic moment that announced him nationally.
   - Source: Oklahoma Athletics Red River recap
   - URL: https://soonersports.com/news/2021/10/9/football-sooners-top-longhorns-in-red-river-showdown
4. **`cfb-caleb-williams--followed-lincoln-riley-to-usc`** — After the season, Williams transferred from Oklahoma to USC, following head coach Lincoln Riley to Los Angeles.
   - Why distinctive: The coach-player transfer pairing became one of the highest-profile early portal moves.
   - Source: ESPN profile of Caleb Williams
   - URL: https://www.espn.com/college-football/story/_/id/38243587/2024-draft-the-moment-decision
5. **`cfb-caleb-williams--painted-fingernails-tradition`** — Williams has painted his fingernails as a form of self-expression since before college; his mother is a nail technician and helped make nail art part of his personal style.
   - Why distinctive: The nail-painting tradition is one of the most visually recognizable off-field elements of his public identity.
   - Source: ESPN profile of Caleb Williams
   - URL: https://www.espn.com/college-football/story/_/id/38243587/2024-draft-the-moment-decision
   - Research exclusions/constraints:
     - Heisman statistics and NFL draft position were not retained. Specific profane nail messages were not used.

### Carson Palmer — QB — `cfb-carson-palmer`

1. **`cfb-carson-palmer--football-and-basketball-champion`** — Palmer starred in both football and basketball at Santa Margarita High, with his school winning major championships during his time there.
   - Why distinctive: The two-sport prep background is a useful identity layer before USC.
   - Source: Heisman Trust Carson Palmer biography
   - URL: https://www.heisman.com/heisman-winners/6721/
2. **`cfb-carson-palmer--usc-dream-school`** — Palmer described USC as the school he most wanted despite recruiting interest from other national programs.
   - Why distinctive: The choice gives his Trojans career a personal hometown/dream-school dimension.
   - Source: USC Athletics Heritage Association spotlight
   - URL: https://usctrojans.com/news/2018/4/18/trojan-athletic-fund-heritage-association-spotlight-carson-palmer
3. **`cfb-carson-palmer--second-true-freshman-usc-qb-start`** — Palmer became only the second true freshman quarterback to start a game for USC at that time.
   - Why distinctive: The early entry into a traditionally veteran-heavy role is a distinctive Trojans milestone.
   - Source: USC Athletics 1999 season notes
   - URL: https://usctrojans.com/news/1999/11/22/Football_Closes_1999_Season_Friday
4. **`cfb-carson-palmer--collarbone-redshirt-reset`** — A broken collarbone in the third game of his sophomore season ended his year early and allowed him to redshirt.
   - Why distinctive: The injury created a major reset in a college career that later stretched across coaching changes.
   - Source: USC Athletics Carson Palmer feature
   - URL: https://usctrojans.com/news/2000/8/21/A_Look_At_Carson_Palmer
5. **`cfb-carson-palmer--troy-nickname-after-ucla-qb`** — High-school friends nicknamed Palmer “Troy” after Troy Aikman, even though Aikman was a UCLA alumnus and Palmer went on to star at USC.
   - Why distinctive: The cross-rival nickname irony is a highly memorable biographical detail.
   - Source: USC Athletics feature
   - URL: https://usctrojans.com/news/1999/6/21/palmer_poised_to_lead_trojans
   - Research exclusions/constraints:
     - USC passing records, Heisman vote details and NFL career were not retained.

### Cedric Benson — RB — `cfb-cedric-benson`

1. **`cfb-cedric-benson--midland-lee-three-peat`** — Benson led Midland Lee to three consecutive Texas state football championships from 1998 through 2000.
   - Why distinctive: The three-peat is a defining part of his pre-Texas identity and high-school legend.
   - Source: Texas High School Football Hall of Fame biography
   - URL: https://www.texasfootball.com/hof-cedric-benson
2. **`cfb-cedric-benson--first-high-school-dave-campbell-cover`** — In 2000, Benson became the first high-school player ever featured on the cover of Dave Campbell’s Texas Football magazine.
   - Why distinctive: That media milestone captures how famous he was in Texas before college.
   - Source: Texas High School Football Hall of Fame biography
   - URL: https://www.texasfootball.com/hof-cedric-benson
3. **`cfb-cedric-benson--dodgers-minor-league-baseball`** — The Los Angeles Dodgers selected Benson in the 12th round of the 2001 MLB Draft, and he played minor-league baseball during college offseasons.
   - Why distinctive: A real professional baseball career running parallel to Texas football is unusually distinctive.
   - Source: Texas Athletics announcement on Benson choosing football
   - URL: https://texaslonghorns.com/news/2004/3/5/030504aab_823
4. **`cfb-cedric-benson--dodgers-paid-college-scholarship`** — Because he was under contract in baseball, the Dodgers paid Benson’s college scholarship for his first three years rather than Texas football.
   - Why distinctive: The scholarship arrangement is a highly unusual NCAA-era detail.
   - Source: Texas Athletics announcement on Benson choosing football
   - URL: https://texaslonghorns.com/news/2004/3/5/030504aab_823
5. **`cfb-cedric-benson--quit-baseball-before-senior-year`** — Before his senior Texas season, Benson gave up professional baseball to focus entirely on football, after which Texas took over his scholarship.
   - Why distinctive: The decision marks a clear turning point where he chose one sport over the other.
   - Source: Texas Athletics announcement on Benson choosing football
   - URL: https://texaslonghorns.com/news/2004/3/5/030504aab_823
   - Research exclusions/constraints:
     - College rushing totals, Doak Walker Award and NFL draft position were not retained. Baseball facts are separated because the pro career, unusual scholarship arrangement and final sport-choice decision are distinct events.

### Champ Bailey — DB — `cfb-champ-bailey`

1. **`cfb-champ-bailey--roland-champ-nickname`** — Bailey’s given name is Roland Bailey Jr.; he received the nickname “Champ” as a baby, reportedly because he was so active.
   - Why distinctive: The nickname origin is a highly person-specific identifier.
   - Source: ESPN profile of Champ Bailey
   - URL: https://www.espn.com/nfl/playoffs/2013/story/_/id/10355918/super-bowl-xlviii-champ-bailey-gets-chance
2. **`cfb-champ-bailey--folkston-three-sport-star`** — Growing up in small-town Folkston, Georgia, Bailey earned all-state recognition in football, basketball and track.
   - Why distinctive: The small-town, three-sport origin is a distinctive pre-Georgia identity.
   - Source: Georgia Athletics feature on Champ Bailey
   - URL: https://georgiadogs.com/news/2019/10/2/champ-bailey-the-best-ever.aspx
3. **`cfb-champ-bailey--brother-boss-bailey`** — His younger brother Boss Bailey also became a Georgia defensive star and NFL player.
   - Why distinctive: The two brothers are one of Georgia’s most recognizable football families.
   - Source: Georgia Athletics Bailey family feature
   - URL: https://georgiadogs.com/news/2003/4/23/As_athlete_Bailey_is_the_boss
4. **`cfb-champ-bailey--three-phase-georgia-role`** — At Georgia, Champ Bailey played extensively on defense, offense and special teams rather than being limited to cornerback.
   - Why distinctive: His genuine three-phase workload is central to why he was considered such an unusual college athlete.
   - Source: Georgia Athletics Pro Football Hall of Fame release
   - URL: https://georgiadogs.com/news/2019/2/2/champ-bailey-named-to-pro-football-hall-of-fame
5. **`cfb-champ-bailey--indoor-long-jump-record`** — Bailey also competed in Georgia track and set a school indoor long-jump record.
   - Why distinctive: A school-level long-jump mark adds a concrete track identity beyond simply saying he was fast.
   - Source: Georgia Athletics Pro Football Hall of Fame release
   - URL: https://georgiadogs.com/news/2019/2/2/champ-bailey-named-to-pro-football-hall-of-fame
   - Research exclusions/constraints:
     - Interception totals, NFL career honors and generic All-America listings were not retained.

### Charlie Ward — QB — `cfb-charlie-ward`

1. **`cfb-charlie-ward--thomasville-near-tallahassee`** — Ward grew up in Thomasville, Georgia, only about 35 miles from Tallahassee before attending Florida State.
   - Why distinctive: The near-home geography helps explain how closely his identity became tied to FSU.
   - Source: Heisman Trust 25th-anniversary profile
   - URL: https://www.heisman.com/articles/25th-anniversary-heisman-winner-charlie-ward/
2. **`cfb-charlie-ward--many-sport-high-school-athlete`** — Ward was an unusually broad high-school athlete, excelling in football and basketball while also playing baseball, tennis, track and golf.
   - Why distinctive: Six-sport ability is far more distinctive than a generic “two-sport athlete” description.
   - Source: Heisman Trust 25th-anniversary profile
   - URL: https://www.heisman.com/articles/25th-anniversary-heisman-winner-charlie-ward/
3. **`cfb-charlie-ward--brewers-draft-out-of-high-school`** — Ward was good enough in baseball to be drafted by the Milwaukee Brewers out of high school.
   - Why distinctive: The MLB draft adds another concrete branch to his already rare multi-sport profile.
   - Source: Heisman Trust 25th-anniversary profile
   - URL: https://www.heisman.com/articles/25th-anniversary-heisman-winner-charlie-ward/
4. **`cfb-charlie-ward--fsu-basketball-ncaa-run`** — While quarterbacking Florida State, Ward also played point guard and helped the Seminoles basketball team reach multiple NCAA tournaments, including an Elite Eight run.
   - Why distinctive: Simultaneous high-level football and NCAA basketball success is one of the strongest identifiers in college sports history.
   - Source: Florida State Athletics Charlie Ward biography
   - URL: https://seminoles.com/news/2014/6/17/charlie-ward-bio/
5. **`cfb-charlie-ward--chose-nba-after-nfl-draft-uncertainty`** — After NFL teams declined to use an early pick on him, Ward pursued basketball and became a first-round NBA selection rather than beginning an NFL career.
   - Why distinctive: The Heisman quarterback-to-NBA path is essentially unique and central to his identity.
   - Source: ESPN 30-year retrospective on Charlie Ward
   - URL: https://www.espn.com/college-football/story/_/id/38431102/inside-two-sport-florida-state-star-charlie-ward-heisman-season-30-years-later
   - Research exclusions/constraints:
     - Heisman vote margin and football statistics were not retained; the dual-sport path is more identifying.

### Chase Coffman — TE — `cfb-chase-coffman`

1. **`cfb-chase-coffman--father-paul-kstate-nfl-te`** — Coffman’s father Paul was a standout tight end at Kansas State before a long NFL career.
   - Why distinctive: The father-son tight-end lineage is a direct positional family connection.
   - Source: Missouri Athletics player biography
   - URL: https://mutigers.com/sports/football/roster/season/2005/player/chase-coffman
2. **`cfb-chase-coffman--chose-missouri-over-kstate`** — Chase chose Missouri despite a scholarship option from Kansas State, his father’s alma mater.
   - Why distinctive: Choosing a nearby rival instead of the family legacy school is a distinctive recruiting decision.
   - Source: Missouri Athletics 2005 recruiting class release
   - URL: https://mutigers.com/news/2005/02/02/football-announces-2005-recruiting-class
3. **`cfb-chase-coffman--brother-carson-high-school-qb`** — At Raymore-Peculiar High, Chase caught passes from younger brother Carson Coffman, who later became a Kansas State quarterback.
   - Why distinctive: The brother-to-brother high-school passing connection is unusually identifying.
   - Source: Missouri Athletics player biography
   - URL: https://mutigers.com/sports/football/roster/season/2005/player/chase-coffman
4. **`cfb-chase-coffman--all-four-siblings-c-names`** — Coffman is the oldest of four siblings whose first names all begin with C: Chase, Carson, Cameron and Camille.
   - Why distinctive: It is a quirky but highly person-specific family detail.
   - Source: Missouri Athletics 2005 recruiting class release
   - URL: https://mutigers.com/news/2005/02/02/football-announces-2005-recruiting-class
5. **`cfb-chase-coffman--basketball-all-conference`** — He lettered three years in basketball and earned first-team all-conference honors in the sport.
   - Why distinctive: The legitimate basketball résumé adds a separate athletic identity beyond football family ties.
   - Source: Missouri Athletics 2005 recruiting class release
   - URL: https://mutigers.com/news/2005/02/02/football-announces-2005-recruiting-class
   - Research exclusions/constraints:
     - Career reception totals and Mackey Award were not retained.

### Chip Kelly — Coach — `chip-kelly`

1. **`chip-kelly--new-hampshire-qb-safety`** — Kelly is a New Hampshire native who played both quarterback and safety at the University of New Hampshire.
   - Why distinctive: The two-position playing background at an FCS-level program contrasts with his later offensive-coach fame.
   - Source: University of Oregon Athletics Chip Kelly biography
   - URL: https://goducks.com/staff-directory/chip-kelly/333
2. **`chip-kelly--physical-education-degree`** — Kelly graduated from New Hampshire with a degree in physical education.
   - Why distinctive: The degree fits his coaching path and gives a specific pre-coaching identity detail.
   - Source: University of Oregon Athletics Chip Kelly biography
   - URL: https://goducks.com/staff-directory/chip-kelly/333
3. **`chip-kelly--began-coaching-defense-special-teams`** — He began coaching at Columbia in the secondary and on special teams, then worked with outside linebackers and safeties.
   - Why distinctive: Starting on defense is an important contrast with the offensive innovator he later became.
   - Source: University of Oregon Athletics Chip Kelly biography
   - URL: https://goducks.com/staff-directory/chip-kelly/333
4. **`chip-kelly--johns-hopkins-defensive-coordinator`** — Kelly spent a season as the defensive coordinator at Johns Hopkins before returning to New Hampshire.
   - Why distinctive: A future spread-offense icon once being a Division III defensive coordinator is unusually distinctive.
   - Source: University of Oregon Athletics Chip Kelly biography
   - URL: https://goducks.com/staff-directory/chip-kelly/333
5. **`chip-kelly--new-hampshire-offensive-apprenticeship`** — At New Hampshire he coached running backs, then offensive line, before becoming offensive coordinator and developing the attack that helped lead to his Oregon opportunity.
   - Why distinctive: The step-by-step position-group progression explains how his offensive philosophy was built before the national spotlight.
   - Source: University of Oregon Athletics Chip Kelly biography
   - URL: https://goducks.com/staff-directory/chip-kelly/333
   - Research exclusions/constraints:
     - Oregon win totals, NFL coaching résumé and generic tempo statistics were not retained.

### Chris Long — DL — `cfb-chris-long`

1. **`cfb-chris-long--moved-to-charlottesville-age-nine`** — Long moved from Los Angeles to Charlottesville at age nine and later attended local St. Anne’s-Belfield before playing for Virginia.
   - Why distinctive: He became a hometown UVA star rather than simply the son of a famous player arriving from elsewhere.
   - Source: Virginia Athletics profile, “The Mayor of Charlottesville”
   - URL: https://virginiasports.com/news/2006/09/17/chris-long-the-mayor-of-charlottesville
2. **`cfb-chris-long--preferred-baseball-until-tenth-grade`** — Long preferred baseball to football until around 10th grade, when his growth and athletic projection made football look like the better scholarship path.
   - Why distinctive: A late shift from baseball is a distinctive developmental story for an elite defensive lineman.
   - Source: Virginia Athletics profile, “The Mayor of Charlottesville”
   - URL: https://virginiasports.com/news/2006/09/17/chris-long-the-mayor-of-charlottesville
3. **`cfb-chris-long--basketball-and-lacrosse-too`** — He also played basketball and lacrosse in high school.
   - Why distinctive: The additional sports reinforce his broad athletic background without repeating the baseball-to-football decision.
   - Source: Virginia Athletics profile, “The Mayor of Charlottesville”
   - URL: https://virginiasports.com/news/2006/09/17/chris-long-the-mayor-of-charlottesville
4. **`cfb-chris-long--howie-did-not-push-football`** — His Hall of Fame father Howie Long deliberately did not push him into football; once Chris chose it, Howie became a demanding mentor.
   - Why distinctive: The father-son relationship is more distinctive than merely saying his father was famous.
   - Source: Virginia Athletics profile, “The Mayor of Charlottesville”
   - URL: https://virginiasports.com/news/2006/09/17/chris-long-the-mayor-of-charlottesville
5. **`cfb-chris-long--mayor-of-charlottesville-identity`** — Virginia Athletics profiled Long under the nickname-like label “The Mayor of Charlottesville,” reflecting how closely he was identified with the local community and UVA.
   - Why distinctive: The local-personality identity is unusually specific and reinforces his hometown connection.
   - Source: Virginia Athletics profile, “The Mayor of Charlottesville”
   - URL: https://virginiasports.com/news/2006/09/17/chris-long-the-mayor-of-charlottesville
   - Research exclusions/constraints:
     - Draft pedigree, sacks and award totals were not retained.

### Chris Petersen — Coach — `chris-petersen-cfb`

1. **`chris-petersen--sacramento-city-to-uc-davis-qb`** — Petersen began his college playing career at Sacramento City College before transferring to UC Davis, where he became a standout quarterback.
   - Why distinctive: The junior-college-to-Division-II quarterback path is a distinctive origin for a major FBS coach.
   - Source: Washington Athletics coach biography
   - URL: https://gohuskies.com/sports/football/roster/coaches/chris-petersen/4183
2. **`chris-petersen--psychology-and-educational-psychology`** — He earned a bachelor’s degree in psychology and a master’s degree in educational psychology from UC Davis.
   - Why distinctive: The psychology background aligns unusually well with his later emphasis on culture and player development.
   - Source: Boise State Athletics coach biography
   - URL: https://broncosports.com/sports/football/roster/coaches/chris-petersen/1117
3. **`chris-petersen--coaching-started-at-uc-davis`** — Petersen began his coaching career at his alma mater as the freshman-team head coach before coaching receivers.
   - Why distinctive: Starting by running the freshman team is a specific early-career step rarely remembered in major-coach résumés.
   - Source: Boise State Athletics coach biography
   - URL: https://broncosports.com/sports/football/roster/coaches/chris-petersen/1117
4. **`chris-petersen--first-boise-season-fiesta`** — In his first season as Boise State head coach, Petersen went unbeaten and finished with the famous Fiesta Bowl upset of Oklahoma that used multiple trick plays.
   - Why distinctive: The immediate unbeaten season and iconic trick-play bowl ending became inseparable from his coaching identity.
   - Source: Boise State Athletics coach biography
   - URL: https://broncosports.com/sports/football/roster/coaches/chris-petersen/1117
5. **`chris-petersen--okg-recruiting-philosophy`** — Petersen described his recruiting target as “OKGs” — “Our Kind of Guys” — emphasizing character, football ability and academic fit.
   - Why distinctive: The phrase is a recognizable shorthand for his program-culture philosophy.
   - Source: Washington Athletics introductory press conference
   - URL: https://gohuskies.com/news/2013/12/9/209336083
   - Research exclusions/constraints:
     - Career win totals and generic bowl counts were not retained.

### Chris Weinke — QB — `cfb-chris-weinke`

1. **`cfb-chris-weinke--same-recruiting-class-charlie-ward`** — Weinke originally signed with Florida State in the same recruiting class that included future Heisman winner Charlie Ward.
   - Why distinctive: The fact that two future FSU Heisman quarterbacks nearly overlapped is a remarkable program-history connection.
   - Source: Heisman Trust Chris Weinke biography
   - URL: https://www.heisman.com/heisman-winners/chris-weinke/
2. **`cfb-chris-weinke--left-fsu-for-blue-jays`** — After only a few days on the Florida State campus in 1990, Weinke signed with the Toronto Blue Jays organization and chose professional baseball.
   - Why distinctive: Leaving an elite football program almost immediately for baseball is a major identity turn.
   - Source: Heisman Trust Chris Weinke biography
   - URL: https://www.heisman.com/heisman-winners/chris-weinke/
3. **`cfb-chris-weinke--six-years-minor-league-baseball`** — Weinke spent six seasons in the Blue Jays minor-league system, reaching Triple-A, before returning to college football.
   - Why distinctive: A six-year professional baseball career before becoming a college quarterback is extraordinarily unusual.
   - Source: Heisman Trust 25th-anniversary Weinke profile
   - URL: https://www.heisman.com/articles/heisman-profile-25th-anniversary-winner-chris-weinke/
4. **`cfb-chris-weinke--bowden-kept-scholarship-open`** — Bobby Bowden told Weinke that a Florida State football scholarship would remain available whenever he wanted to return, and honored that promise years later.
   - Why distinctive: The open-ended scholarship promise is a distinctive coach-player relationship story.
   - Source: Heisman Trust 25th-anniversary Weinke profile
   - URL: https://www.heisman.com/articles/heisman-profile-25th-anniversary-winner-chris-weinke/
5. **`cfb-chris-weinke--returned-as-25-year-old-freshman`** — Weinke returned to Florida State as a 25-year-old freshman and later became the oldest Heisman winner at age 28.
   - Why distinctive: The age gap created by his baseball career is one of the most recognizable facts about him.
   - Source: Heisman Trust Chris Weinke biography
   - URL: https://www.heisman.com/heisman-winners/chris-weinke/
   - Research exclusions/constraints:
     - Raw passing records and draft information were not retained. High-school hockey was researched but not retained because the baseball route was more distinctive.

### Christian McCaffrey — RB — `cfb-christian-mccaffrey`

1. **`cfb-christian-mccaffrey--both-parents-stanford-athletes`** — McCaffrey followed both parents to Stanford: father Ed played football there and mother Lisa played soccer there.
   - Why distinctive: Two Stanford-athlete parents make his college choice a particularly strong family legacy.
   - Source: Stanford Athletics player biography
   - URL: https://gostanford.com/sports/football/roster/season/2016/player/christian-mccaffrey
2. **`cfb-christian-mccaffrey--grandfather-dave-sime-olympian`** — His grandfather Dave Sime was a Duke track star, a 1960 Olympic silver medalist in the 100 meters and a former world-record holder in the 100-yard dash.
   - Why distinctive: The elite sprint lineage is unusually specific and directly relevant to McCaffrey’s athletic profile.
   - Source: Stanford Athletics player biography
   - URL: https://gostanford.com/sports/football/roster/season/2016/player/christian-mccaffrey
3. **`cfb-christian-mccaffrey--high-school-relay-record`** — McCaffrey was a four-year high-school track athlete who won a state 4x100 title and was part of a state-record 4x200 relay.
   - Why distinctive: The relay accomplishments provide concrete evidence of his own track background, separate from family lineage.
   - Source: Stanford Athletics player biography
   - URL: https://gostanford.com/sports/football/roster/season/2016/player/christian-mccaffrey
4. **`cfb-christian-mccaffrey--pianist`** — Stanford’s biography lists McCaffrey as a pianist.
   - Why distinctive: It is a concise, highly person-specific off-field interest that contrasts with his athletic image.
   - Source: Stanford Athletics player biography
   - URL: https://gostanford.com/sports/football/roster/season/2016/player/christian-mccaffrey
5. **`cfb-christian-mccaffrey--rwanda-mission-trip`** — McCaffrey spent part of the summer of 2013 on a mission trip to Rwanda.
   - Why distinctive: The international service experience is a distinctive pre-college personal detail.
   - Source: Stanford Athletics player biography
   - URL: https://gostanford.com/sports/football/roster/season/2016/player/christian-mccaffrey
   - Research exclusions/constraints:
     - Stanford all-purpose-yard records and NFL family members beyond the most distinctive lineage were not retained.

### Colt Brennan — QB — `cfb-colt-brennan`

1. **`cfb-colt-brennan--backed-up-matt-leinart`** — At Mater Dei High School, Brennan spent time backing up future Heisman quarterback Matt Leinart.
   - Why distinctive: The high-school quarterback room connection is a memorable pre-college link between two famous passers.
   - Source: Hawaii News Now profile
   - URL: https://www.hawaiinewsnow.com/story/23824344/brennan-signs-with-la-kiss-of-afl/
2. **`cfb-colt-brennan--worcester-academy-merit-scholarship`** — Although Utah State offered him a football scholarship out of high school, Brennan chose a postgraduate year at Worcester Academy on a merit scholarship.
   - Why distinctive: Choosing prep school despite an FBS offer is an unusual early-career decision.
   - Source: Colorado Athletics player biography
   - URL: https://cubuffs.com/sports/football/roster/colt-brennan/3699?path=football
3. **`cfb-colt-brennan--colorado-walk-on`** — Brennan first enrolled at Colorado as a walk-on, aided by a prior relationship with offensive coordinator Shawn Watson.
   - Why distinctive: His first FBS stop was not a scholarship-star path and sets up the later journey to Hawaii.
   - Source: Colorado Athletics player biography
   - URL: https://cubuffs.com/sports/football/roster/colt-brennan/3699?path=football
4. **`cfb-colt-brennan--saddleback-juco-reset`** — After Colorado, Brennan rebuilt his football career at Saddleback Community College, where he earned all-conference and state offensive-player recognition.
   - Why distinctive: The junior-college reset is a defining bridge between Colorado and Hawaii.
   - Source: Hawaii Athletics player biography
   - URL: https://hawaiiathletics.com/sports/football/roster/colt-brennan/7948
5. **`cfb-colt-brennan--hawaii-walk-on-to-island-icon`** — Brennan arrived at Hawaii via a walk-on opportunity and became the quarterback most closely associated with the program’s undefeated 2007 run to the Sugar Bowl.
   - Why distinctive: The walk-on-to-island-icon trajectory is the core college identity arc.
   - Source: University of Hawaii memorial feature
   - URL: https://www.hawaii.edu/news/2021/05/11/in-memoriam-colt-brennan/
   - Research exclusions/constraints:
     - Off-field legal history was excluded under the assignment’s safety/taste boundary. NCAA passing records were not retained because they are structural résumé information.

### Colt McCoy — QB — `cfb-colt-mccoy`

1. **`cfb-colt-mccoy--coached-by-father-at-jim-ned`** — McCoy was coached by his father Brad at Jim Ned High School in Tuscola, Texas.
   - Why distinctive: The coach-son relationship is central to his small-town football upbringing.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/colt-mccoy/3394
2. **`cfb-colt-mccoy--father-former-acu-safety`** — Brad McCoy had played safety at Abilene Christian before becoming a high-school coach.
   - Why distinctive: The father’s playing background adds a direct college-football lineage to the coaching relationship.
   - Source: Texas Athletics Colt McCoy biography
   - URL: https://texaslonghorns.com/sports/general/roster/colt-mccoy/5057
3. **`cfb-colt-mccoy--shipley-fathers-roommates`** — McCoy’s father Brad and Jordan Shipley’s father Bob were college roommates and football teammates at Abilene Christian; their sons later became a star Texas quarterback-receiver pair.
   - Why distinctive: The intergenerational roommate-to-QB/WR connection is exceptionally distinctive.
   - Source: Texas Athletics Colt McCoy biography
   - URL: https://texaslonghorns.com/sports/general/roster/colt-mccoy/5057
4. **`cfb-colt-mccoy--three-sport-small-town-athlete`** — At Jim Ned, McCoy was also a four-year basketball starter and a regional-level track athlete in addition to playing quarterback and punter.
   - Why distinctive: The small-school multi-sport workload is a strong prep identity marker.
   - Source: Texas Athletics player biography
   - URL: https://texaslonghorns.com/sports/football/roster/colt-mccoy/3394
5. **`cfb-colt-mccoy--peru-mission-work`** — While at Texas, McCoy spent spring break doing missionary work in Peru, following a family tradition established by his grandparents.
   - Why distinctive: The trip and explicit family connection make the service work more personal than a generic charity note.
   - Source: Texas Athletics Colt McCoy biography
   - URL: https://texaslonghorns.com/sports/general/roster/colt-mccoy/5057
   - Research exclusions/constraints:
     - Texas passing records, Heisman finishes and NFL résumé were not retained.

### Cooper DeJean — DB — `cfb-cooper-dejean`

1. **`cfb-cooper-dejean--odebolt-small-town-roots`** — DeJean grew up in Odebolt, Iowa, a town of fewer than 1,000 residents, and attended the consolidated OABCIG school system serving several small northwest Iowa communities.
   - Why distinctive: His small-town Iowa background is central to how he was discovered and to his unusual path to major-college football.
   - Source: ESPN — “Cooper DeJean is the latest NFL draft find from Iowa”
   - URL: https://www.espn.com/college-football/story/_/id/39833081/cooper-dejean-latest-nfl-draft-find-iowa
2. **`cfb-cooper-dejean--four-sport-prep-athlete`** — At OABCIG, DeJean played football, basketball, baseball and track; he scored 1,832 career basketball points and won Iowa state titles in the 100 meters and long jump.
   - Why distinctive: The breadth of his multi-sport résumé, especially elite basketball and track performance, helps explain the athletic profile that later made him unusually versatile.
   - Source: PFF — “Iowa CB Cooper DeJean’s path to becoming one of the best all-around defensive backs in college football”
   - URL: https://www.pff.com/news/college-football-iowa-cb-cooper-dejeans-path-to-becoming-one-of-the-best-all-around-defensive-backs-in-college-football
3. **`cfb-cooper-dejean--high-school-quarterback-to-college-db`** — DeJean was a high-school quarterback as well as a defensive back, but Iowa recruited him for defense; he has said he initially wanted a chance to play quarterback in college.
   - Why distinctive: A productive small-school quarterback becoming an elite Big Ten defensive back is a distinctive position-path story rather than ordinary résumé data.
   - Source: The Philadelphia Inquirer — Cooper DeJean Q&A
   - URL: https://www.inquirer.com/eagles/eagles-cooper-dejean-uncovering-the-birds-20250115.html
4. **`cfb-cooper-dejean--only-fbs-offer-iowa`** — Despite his production and athleticism, Iowa was DeJean’s only FBS scholarship offer; his other major opportunities came from FCS programs in the Dakotas.
   - Why distinctive: Being overlooked by nearly the entire FBS while growing into an Iowa star is a highly reusable identity marker.
   - Source: ESPN — “Cooper DeJean is the latest NFL draft find from Iowa”
   - URL: https://www.espn.com/college-football/story/_/id/39833081/cooper-dejean-latest-nfl-draft-find-iowa
5. **`cfb-cooper-dejean--state-title-two-way-finish`** — In OABCIG’s 2020 state championship game, DeJean blocked an extra point that preserved an eight-point deficit, later scored the tying touchdown and then broke tackles for the winning touchdown.
   - Why distinctive: The sequence captures his do-everything high-school identity in one unusually dramatic championship finish.
   - Source: The Philadelphia Inquirer — Cooper DeJean’s Iowa high-school legacy
   - URL: https://www.inquirer.com/eagles/eagles-cooper-dejean-odebolt-iowa-high-school-highlights-20250110.html
   - Research exclusions/constraints:
     - Ordinary Iowa interception, return and award totals were not retained because they are structural résumé data.
     - The comparison of his basketball scoring total to Harrison Barnes was folded into the broader four-sport concept rather than counted separately.
     - NFL draft position and professional-role projections were not retained because this package is CFB-oriented.

### D'Brickashaw Ferguson — OL — `cfb-dbrickashaw-ferguson`

1. **`cfb-dbrickashaw-ferguson--thorn-birds-name-origin`** — Ferguson’s first name was inspired by Father Ralph de Bricassart, a central character in the television miniseries “The Thorn Birds.”
   - Why distinctive: The origin of his unusually distinctive first name is a strong person-identity concept that is independent of football statistics.
   - Source: New York Jets — Nickelodeon feature
   - URL: https://www.newyorkjets.com/news/jets-provide-thrills-on-nickelodeon-2410482
2. **`cfb-dbrickashaw-ferguson--childhood-heart-surgery-football-clearance`** — Ferguson had heart surgery as a child and for years was restricted from contact sports; a later cardiology evaluation cleared him without restrictions, opening the door for him to play football.
   - Why distinctive: His route into football literally depended on a change in medical clearance after a childhood surgery, making it a distinctive origin story.
   - Source: New York Jets — Ferguson retirement feature
   - URL: https://www.newyorkjets.com/news/d-brickashaw-ferguson-s-heartfelt-goodbye-17023146
3. **`cfb-dbrickashaw-ferguson--karate-black-belt`** — Ferguson trained in karate from childhood and earned a black belt, later crediting martial arts with helping develop discipline that carried into football.
   - Why distinctive: A black-belt martial-arts background is unusual and meaningfully connected to his development as an offensive lineman.
   - Source: Yahoo Sports — Shutdown Corner interview with D’Brickashaw Ferguson
   - URL: https://ca.sports.yahoo.com/blogs/nfl-shutdown-corner/shutdown-corner-interview-dbrickashaw-ferguson--nfl.html
4. **`cfb-dbrickashaw-ferguson--uva-true-freshman-opener-start`** — In 2002 Ferguson became the first true freshman offensive lineman in Virginia history to start a season opener, then started all 14 games that year.
   - Why distinctive: That immediate jump into a technically demanding line position is a distinctive part of his Virginia identity.
   - Source: Virginia Athletics — “D’Brickashaw Ferguson Is Growing Force on Offensive Line”
   - URL: https://virginiasports.com/news/2003/04/21/d-brickashaw-ferguson-is-growing-force-on-offensive-line
5. **`cfb-dbrickashaw-ferguson--religious-studies-degree-early`** — Ferguson completed a Virginia degree in religious studies in three and a half years while becoming a first-team All-American.
   - Why distinctive: The combination of an unusual academic field and accelerated graduation distinguishes him beyond his playing résumé.
   - Source: Virginia Athletics — “Ferguson Completes Unique Athletic-Academic Triple”
   - URL: https://virginiasports.com/news/2006/05/20/ferguson-completes-unique-athletic-academic-triple
   - Research exclusions/constraints:
     - His later return to school for nursing was verified but not retained because it occurred well after his college-football career and the five stronger CFB-oriented concepts were sufficient.
     - NFL draft slot and professional durability were rejected as pro résumé data.
     - The childhood heart story was kept as one concept; the scar, initial restriction and later clearance were not split into separate concepts.

### Dak Prescott — QB — `cfbfast-r-player-512030-dak-prescott`

1. **`cfbfast-r-player-512030-dak-prescott--peggy-prescott-upbringing`** — Prescott was the youngest of three boys raised primarily by his mother, Peggy, and the family spent part of his childhood in a mobile home near Haughton, Louisiana.
   - Why distinctive: His close bond with his mother and modest Louisiana upbringing are recurring, well-documented parts of his personal identity.
   - Source: Sports Illustrated — profile of Dak Prescott and his mother Peggy
   - URL: https://www.si.com/nfl/2017/10/19/dak-prescott-dallas-cowboys-mom-cancer
2. **`cfbfast-r-player-512030-dak-prescott--number-15-tim-tebow-tribute`** — Prescott wore No. 15 at Mississippi State in tribute to Tim Tebow, one of the SEC quarterbacks he admired; he also named his white Labrador “Tibeaux.”
   - Why distinctive: The number choice directly connects his college identity to a specific SEC quarterback influence and includes a memorable personal detail.
   - Source: Sports Illustrated — Mississippi State inside-access feature
   - URL: https://www.si.com/college/2014/10/07/mississippi-state-inside-access
3. **`cfbfast-r-player-512030-dak-prescott--mississippi-state-early-faith-recruitment`** — Mississippi State offered Prescott before his senior high-school breakout; LSU pursued him later, but he remained committed to the Bulldogs.
   - Why distinctive: Loyalty to the program that evaluated him early is a more distinctive recruiting story than simply listing his offer sheet.
   - Source: Dallas Cowboys — “Dak’s Road to Dallas”
   - URL: https://www.dallascowboys.com/news/dak-s-road-to-dallas-why-prescott-s-rise-shouldn-t-be-a-surprise-417431
4. **`cfbfast-r-player-512030-dak-prescott--2013-egg-bowl-injury-return`** — After missing time with a nerve injury in his non-throwing arm, Prescott entered the 2013 Egg Bowl in the fourth quarter, tied the game and scored the winning overtime touchdown on fourth-and-1; the game came in the same month his mother died.
   - Why distinctive: It is a defining Mississippi State moment that combines injury return, rivalry pressure and a major personal loss without reducing the concept to statistics.
   - Source: ESPN — 2013 Egg Bowl recap
   - URL: https://www.espn.com/college-football/recap?gameId=333320344
5. **`cfbfast-r-player-512030-dak-prescott--two-mississippi-state-degrees`** — Prescott earned a bachelor’s degree in educational psychology in December 2014 and a master’s degree in workforce leadership in December 2015 while still at Mississippi State.
   - Why distinctive: Completing both undergraduate and graduate degrees during his college career is an unusually strong academic identity marker.
   - Source: Mississippi State Athletics — Dak Prescott bio
   - URL: https://hailstate.com/sports/football/roster/prescott-dak/2911
   - Research exclusions/constraints:
     - Ordinary passing, rushing, award and win totals were not retained.
     - His legal first name, Rayne, was verified but judged weaker than the five retained concepts.
     - Later professional achievements were not retained.

### Dallas Clark — TE — `cfb-dallas-clark`

1. **`cfb-dallas-clark--mother-died-before-graduation`** — Clark’s mother died four days before his high-school graduation; after he arrived at Iowa, he described the football program and teammates as an important support system.
   - Why distinctive: The loss and the community he found at Iowa form an important, well-sourced part of his personal college path.
   - Source: University of Iowa Magazine — Dallas Clark profile
   - URL: https://magazine.foriowa.org/story.php?ed=true&storyid=2552
2. **`cfb-dallas-clark--walk-on-linebacker-brother-motivation`** — Clark came to Iowa as a walk-on linebacker and was motivated in part by wanting to become a better linebacker than his older brother Derrik, who had played at Iowa State.
   - Why distinctive: The sibling rivalry and walk-on starting point provide a distinctive explanation for how his Iowa career began.
   - Source: University of Iowa Magazine — Dallas Clark profile
   - URL: https://magazine.foriowa.org/story.php?ed=true&storyid=2552
3. **`cfb-dallas-clark--linebacker-to-tight-end-conversion`** — Kirk Ferentz and Bret Bielema convinced Clark to move from linebacker to tight end, a switch he initially resisted; quarterback Kyle McCann then worked with him extensively that summer.
   - Why distinctive: The position change created the role for which Clark became known and is more useful than simply listing his tight-end production.
   - Source: University of Iowa Magazine — Dallas Clark profile
   - URL: https://magazine.foriowa.org/story.php?ed=true&storyid=2552
4. **`cfb-dallas-clark--purdue-95-yard-and-winning-touchdowns`** — Against Purdue in 2002, Clark caught a 95-yard touchdown and later caught the winning touchdown on fourth-and-goal from the 7-yard line.
   - Why distinctive: Two radically different touchdown plays in the same close game make this a signature Iowa moment rather than an ordinary stat line.
   - Source: Purdue Athletics — 2002 Iowa-Purdue recap
   - URL: https://purduesports.com/news/2002/10/5/boilermakers-fall-to-no-24-iowa-31-28
5. **`cfb-dallas-clark--century-family-farm-return`** — After his playing career, Clark bought the century-old family farm near Livermore, Iowa, when his grandmother’s estate required it to be sold, and returned to farming there.
   - Why distinctive: His return to the family farm reinforces the rural-Iowa identity that preceded and followed his Hawkeye career.
   - Source: Indianapolis Colts — “Where Are They Now? Dallas Clark”
   - URL: https://www.colts.com/news/where-are-they-now-for-dallas-clark-there-s-no-place-like-home-19547878
   - Research exclusions/constraints:
     - The walk-on story and linebacker-to-tight-end conversion were kept separate because one explains his entry to Iowa and the other is a later position-changing decision.
     - Routine Iowa receiving totals and national-award résumé were not retained.
     - NFL receiving records and Super Bowl material were rejected as professional résumé data.

### Dalvin Cook — RB — `cfbfast-r-player-3116593-dalvin-cook`

1. **`cfbfast-r-player-3116593-dalvin-cook--moved-to-grandmother-for-miami-central`** — As a seventh-grader, Cook moved in with his grandmother Betty in Opa-locka so he could attend Miami Central, making a long bus commute to school.
   - Why distinctive: The family and schooling decision is a distinctive part of the route that placed him in one of South Florida’s major football programs.
   - Source: Sports Illustrated — Dalvin Cook profile
   - URL: https://www.si.com/college/2016/03/10/dalvin-cook-fast-quiet-and-could-be-nations-top-rb
2. **`cfbfast-r-player-3116593-dalvin-cook--youth-handoffs-from-brother-deandre`** — Cook played youth football for the Carol City Chiefs while taking handoffs from his older brother DeAndre Burnett, who played quarterback.
   - Why distinctive: The sibling connection predates his college career and gives his football origin a recognizable family element.
   - Source: Sports Illustrated — Dalvin Cook profile
   - URL: https://www.si.com/college/2016/03/10/dalvin-cook-fast-quiet-and-could-be-nations-top-rb
3. **`cfbfast-r-player-3116593-dalvin-cook--waited-behind-devonta-freeman`** — Cook did not join Miami Central’s varsity as a freshman while future Florida State running back Devonta Freeman was the senior feature back; Cook moved up the following year.
   - Why distinctive: A future Florida State star initially sitting behind another future Seminole creates a distinctive continuity in his development.
   - Source: Sports Illustrated — 2017 Dalvin Cook profile
   - URL: https://www.si.com/nfl/2017/04/25/nfl-draft-dalvin-cook-red-flags-character-concerns-scouts-florida-state-miami-dade
4. **`cfbfast-r-player-3116593-dalvin-cook--joseph-yearby-friend-to-rival`** — Cook and Joseph Yearby were close friends and shared the Miami Central backfield before becoming college rivals at Florida State and Miami.
   - Why distinctive: The teammate-to-rival relationship links his South Florida roots directly to a major in-state college rivalry.
   - Source: CBS Miami — Cook and Yearby, former teammates turned rivals
   - URL: https://www.cbsnews.com/miami/news/miamis-yearby-fsus-cook-ex-teammates-now-rivals/
5. **`cfbfast-r-player-3116593-dalvin-cook--clemson-florida-fsu-recruiting-flips`** — Cook’s recruitment moved from a Clemson commitment to Florida and ultimately to Florida State; before signing, he had also signed financial-aid agreements with multiple Florida programs.
   - Why distinctive: The unusually fluid recruitment is a memorable path to Florida State that should be stored as one concept rather than several commitment clues.
   - Source: ESPN — recruiting flip feature
   - URL: https://www.espn.com/college-sports/recruiting/football/story/_/id/10391907/examining-pre-signing-day-flipping-epidemic-college-football-recruiting
   - Research exclusions/constraints:
     - Legal and character-controversy material appearing in some profiles was explicitly not retained.
     - The Clemson, Florida and Florida State commitment changes were treated as one recruiting concept rather than padded into multiple concepts.
     - Routine Florida State rushing records and NFL résumé facts were not retained.

### Dan Lanning — Coach — `dan-lanning`

1. **`dan-lanning--richmond-missouri-small-town-roots`** — Lanning grew up around Richmond, Missouri, in a small-town setting with teacher parents and time on his grandfather’s farm, while playing multiple sports.
   - Why distinctive: The rural Missouri and educator-family background helps explain both his early career in teaching and his coaching identity.
   - Source: Unafraid Show / iHeart — Dan Lanning interview
   - URL: https://www.iheart.com/podcast/1119-unafraid-show-with-george-43072275/episode/dan-lanning-interview-mahomes-v-allen-145653316/
2. **`dan-lanning--small-college-player-to-high-school-teacher`** — Lanning played linebacker at William Jewell College, earned degrees in physical education and secondary education, and began coaching at Park Hill South High School while working in education.
   - Why distinctive: His path started far from major-college football and directly connects his academic training to his first coaching work.
   - Source: Oregon Athletics — Dan Lanning staff bio
   - URL: https://goducks.com/staff-directory/dan-lanning/3041
3. **`dan-lanning--overnight-drive-to-pitt-opportunity`** — While still a high-school teacher and coach, Lanning drove roughly 13 hours overnight from Missouri to Pittsburgh without a scheduled appointment in an effort to create his first Division I coaching opportunity.
   - Why distinctive: The uninvited cross-country drive is the signature story of how he forced open the door to major-college coaching.
   - Source: ESPN — Dan Lanning journey to Oregon
   - URL: https://www.espn.com/college-football/story/_/id/40781349/dan-lanning-journey-commitment-oregon-big-ten-2024
4. **`dan-lanning--oregon-get-real-sessions`** — At Oregon, Lanning instituted “get real” sessions in which players and staff discuss personal histories, goals and life beyond football.
   - Why distinctive: The practice is a distinctive expression of his team-building philosophy rather than a win-loss or scheme fact.
   - Source: ESPN — Oregon and Dan Lanning culture feature
   - URL: https://www.espn.com/college-football/story/_/id/39012854/oregon-flashy-dan-lanning-playing-tough-pac-12-championship
5. **`dan-lanning--outback-relationship-and-story-tattoo`** — Lanning met his wife Sauphia while they were both working at Outback Steakhouse, and a large tattoo later incorporated symbols for her, their sons, Kansas City, Outback and stops on his coaching journey.
   - Why distinctive: The relationship origin and symbolic tattoo form an unusually recognizable visual summary of his personal and coaching path.
   - Source: Yahoo Sports — Dan and Sauphia Lanning feature
   - URL: https://sports.yahoo.com/articles/oregon-ducks-coach-dan-lannings-234500671.html
   - Research exclusions/constraints:
     - Sauphia Lanning’s medical history was not retained; the concept is limited to their relationship origin and Dan Lanning’s symbolic tattoo.
     - Ordinary coaching records, championships and rankings were not retained.
     - Individual tattoo symbols were intentionally combined into one concept.

### Dan Morgan — LB — `cfb-dan-morgan`

1. **`cfb-dan-morgan--miami-fan-before-hurricane`** — Morgan grew up in the Philadelphia area as a Miami Hurricanes fan and remembered wearing a white Steve Walsh jersey before his family later moved to South Florida.
   - Why distinctive: Being a Hurricanes fan before relocating into Miami’s recruiting footprint gives his eventual college choice a distinctive personal continuity.
   - Source: Miami Hurricanes — “A Dream Fulfilled: Morgan Enshrined in CFB Hall”
   - URL: https://miamihurricanes.com/news/2021/12/08/a-dream-fulfilled-morgan-enshrined-in-cfb-hof/
2. **`cfb-dan-morgan--recruited-fullback-to-linebacker`** — Miami recruited Morgan from Taravella High School as a fullback, but he switched to linebacker only days before the 1997 season opener.
   - Why distinctive: The late position conversion is the origin of the role that came to define his college career.
   - Source: Miami Hurricanes — Dan Morgan CFB Hall announcement
   - URL: https://miamihurricanes.com/news/2021/01/11/morgan-selected-to-cfb-hall-of-fame-class-of-2021/
3. **`cfb-dan-morgan--first-miami-sophomore-captain`** — Morgan became the first sophomore in Miami football history to be named a team captain and ultimately served as captain for three seasons.
   - Why distinctive: That unusually early leadership role is a stronger identity marker than ordinary tackle or award totals.
   - Source: Miami Hurricanes — Dan Morgan CFB Hall announcement
   - URL: https://miamihurricanes.com/news/2021/01/11/morgan-selected-to-cfb-hall-of-fame-class-of-2021/
4. **`cfb-dan-morgan--played-through-broken-thumb`** — As a sophomore in 1998, Morgan broke his left thumb against Boston College, underwent surgery the next day and returned to practice a day later without missing a down in the game.
   - Why distinctive: The episode is a concrete, well-sourced example of the toughness that became part of his Miami identity.
   - Source: Miami Hurricanes — “Even Morgan’s Pain Is Miami’s Gain”
   - URL: https://miamihurricanes.com/news/2001/01/01/205540190-2/
5. **`cfb-dan-morgan--first-defensive-award-triple-sweep`** — In 2000 Morgan became the first college football player to win the Bednarik, Butkus and Nagurski awards in the same season.
   - Why distinctive: The unprecedented three-award sweep is sufficiently rare to function as a distinctive identity concept rather than a generic award count.
   - Source: Miami Hurricanes — Dan Morgan CFB Hall announcement
   - URL: https://miamihurricanes.com/news/2021/01/11/morgan-selected-to-cfb-hall-of-fame-class-of-2021/
   - Research exclusions/constraints:
     - Career tackle totals were not retained because they are structural résumé data.
     - The three 2000 defensive awards were intentionally treated as one unprecedented sweep, not three concepts.
     - NFL draft position and Panthers career were not retained.

### Danny Wuerffel — QB — `cfb-danny-wuerffel`

1. **`cfb-danny-wuerffel--air-force-chaplain-childhood`** — Wuerffel’s father was an Air Force chaplain, and the family moved repeatedly during Danny’s childhood, including spending about three years in Spain before settling in Florida.
   - Why distinctive: A military-family childhood spanning multiple U.S. locations and Spain is a distinctive upbringing for a Florida football icon.
   - Source: Heisman Trophy — Danny Wuerffel profile
   - URL: https://www.heisman.com/profiling-our-recent-25th-anniversary-honoree-danny-wuerffel/
2. **`cfb-danny-wuerffel--valedictorian-multisport-fca-leader`** — At Fort Walton Beach High School, Wuerffel was valedictorian, played football and basketball, participated in track, and served for three years as president of the Fellowship of Christian Athletes chapter.
   - Why distinctive: The combination of academics, multiple sports and sustained student leadership gives a broader identity than his quarterback résumé alone.
   - Source: FHSAA Hall of Fame — Danny Wuerffel
   - URL: https://fhsaa.com/hof.aspx?hof=115
3. **`cfb-danny-wuerffel--heisman-winner-coached-by-heisman-winner`** — Wuerffel won the Heisman while playing for Steve Spurrier, himself a former Florida quarterback and Heisman winner.
   - Why distinctive: The Heisman-winner-to-Heisman-winner coach-quarterback lineage is a distinctive Florida relationship.
   - Source: Heisman Trophy — Danny Wuerffel
   - URL: https://www.heisman.com/heisman-winners/danny-wuerffel/
4. **`cfb-danny-wuerffel--heisman-and-campbell-scholar-athlete`** — Wuerffel combined the Heisman Trophy with the William V. Campbell Trophy, the National Football Foundation’s premier scholar-athlete honor.
   - Why distinctive: That rare combination captures both his football and academic identity without relying on ordinary award accumulation.
   - Source: DannyWuerffel.com — biography
   - URL: https://dannywuerffel.com/dannywuerffel/
5. **`cfb-danny-wuerffel--desire-street-ministries`** — After football, Wuerffel became deeply associated with Desire Street Ministries and community work connected to New Orleans.
   - Why distinctive: The ministry became a lasting public identity that distinguishes him well beyond his playing statistics.
   - Source: DannyWuerffel.com — biography
   - URL: https://dannywuerffel.com/dannywuerffel/
   - Research exclusions/constraints:
     - Ordinary Florida passing records, SEC titles and award counts were not retained.
     - His father’s military and ministry roles were kept together as one childhood-moving concept rather than split.
     - Professional football résumé data were not retained.

### Darqueze Dennard — DB — `cfb-darqueze-dennard`

1. **`cfb-darqueze-dennard--dry-branch-no-stars-no-offers`** — Dennard came from tiny Dry Branch, Georgia, and reached the end of his high-school career with essentially no recruiting profile, no major star ranking and no scholarship offers.
   - Why distinctive: The degree to which a future national award winner was overlooked makes his origin unusually recognizable.
   - Source: Michigan State Athletics — Darqueze Dennard Hall of Fame feature
   - URL: https://msuspartans.com/news/2024/9/11/darqueze-dennard-enters-the-msu-hall-of-fame
2. **`cfb-darqueze-dennard--discovered-while-scouting-mumphery`** — Michigan State assistant Dave Warner noticed Dennard while visiting to evaluate wide receiver Keith Mumphery; Dennard was not the original reason for the scouting trip, but the Spartans ultimately offered him.
   - Why distinctive: Being discovered almost incidentally while a coach evaluated another player is the defining recruiting story of his college path.
   - Source: Sports Illustrated — Michigan State hidden recruiting gems
   - URL: https://www.si.com/college/2015/12/28/michigan-state-spartans-secret-success-has-been-finding-hidden-recruiting-gems
3. **`cfb-darqueze-dennard--alfonzo-dennard-cousin`** — Dennard is a cousin of defensive back Alfonzo Dennard, who played at Nebraska before reaching the NFL.
   - Why distinctive: The family connection provides a genuine football lineage without simply listing professional achievements.
   - Source: NFL.com — “In the Green Room with Michigan State CB Darqueze Dennard”
   - URL: https://www.nfl.com/news/in-the-green-room-with-michigan-st-cb-darqueze-dennard-0ap2000000335826
4. **`cfb-darqueze-dennard--family-work-ethic-influences`** — Dennard has cited the work ethic of his mother and his grandfather, who worked in the kaolin mines around central Georgia, as formative influences.
   - Why distinctive: The local family-work story roots his football identity in the specific economy and culture of the area where he grew up.
   - Source: Los Angeles Times — Darqueze Dennard Rose Bowl profile
   - URL: https://www.latimes.com/sports/la-xpm-2013-dec-30-la-sp-rose-bowl-dennard-20131231-story.html
5. **`cfb-darqueze-dennard--first-msu-thorpe-winner`** — Dennard became Michigan State’s first winner of the Jim Thorpe Award as college football’s top defensive back.
   - Why distinctive: A program-first national honor is distinctive enough to retain, unlike a routine list of all-conference awards.
   - Source: Michigan State Athletics — Darqueze Dennard Hall of Fame feature
   - URL: https://msuspartans.com/news/2024/9/11/darqueze-dennard-enters-the-msu-hall-of-fame
   - Research exclusions/constraints:
     - The discovery, scholarship offer and immediate trip to Michigan State were treated as one recruiting concept rather than several clues.
     - Ordinary interception, tackle and draft totals were not retained.
     - Claims based only on unsourced recruiting databases were avoided.

### Darren Sproles — RB — `cfb-darren-sproles`

1. **`cfb-darren-sproles--tank-nickname-birthweight`** — Sproles’ father Larry nicknamed him “Tank” because Darren weighed about 10 pounds at birth.
   - Why distinctive: The nickname origin is memorable, well sourced and independent of his size-related football résumé.
   - Source: ESPN — “Incredible Heights: Darren Sproles’ journey to NFL greatness”
   - URL: https://www.espn.com/blog/philadelphia-eagles/post/_/id/28197/incredible-heights-darren-sproles-journey-to-nfl-greatness
2. **`cfb-darren-sproles--childhood-stutter-public-speaking`** — Sproles had a severe childhood stutter and later put significant work into public speaking, including preparing to speak after receiving a major college honor.
   - Why distinctive: The contrast between a significant speech difficulty and later public recognition adds a distinctive personal dimension.
   - Source: ESPN — “Incredible Heights: Darren Sproles’ journey to NFL greatness”
   - URL: https://www.espn.com/blog/philadelphia-eagles/post/_/id/28197/incredible-heights-darren-sproles-journey-to-nfl-greatness
3. **`cfb-darren-sproles--number-43-for-father`** — Sproles wore No. 43 because his father Larry had worn the number and Darren wanted to be like him.
   - Why distinctive: The jersey number has a direct family origin rather than being a random roster fact.
   - Source: Kansas State Athletics — Hall of Fame feature
   - URL: https://www.kstatesports.com/news/2021/10/3/sports-extra-se-class-of-2021-turns-opportunity-into-hall-of-fame-careers
4. **`cfb-darren-sproles--mother-annette-academics`** — Sproles credited his mother Annette with insisting on schoolwork and taking particular pride in his degree; she died of cancer before his senior season at Kansas State.
   - Why distinctive: Her academic influence and the timing of her death are central to how Sproles has described his family and college experience.
   - Source: Kansas State Athletics — Hall of Fame feature
   - URL: https://www.kstatesports.com/news/2021/10/3/sports-extra-se-class-of-2021-turns-opportunity-into-hall-of-fame-careers
5. **`cfb-darren-sproles--second-grade-olathe-north-dream`** — As a second-grader, Sproles was already telling people he would become the next standout running back at Olathe North; he later helped the school win three consecutive state championships.
   - Why distinctive: The childhood prediction becoming reality at his local high school is a distinctive Kansas football origin story.
   - Source: ESPN — “Incredible Heights: Darren Sproles’ journey to NFL greatness”
   - URL: https://www.espn.com/blog/philadelphia-eagles/post/_/id/28197/incredible-heights-darren-sproles-journey-to-nfl-greatness
   - Research exclusions/constraints:
     - His height and weight alone were not retained because those are physical/profile data rather than a person-first concept.
     - Kansas State rushing totals and Heisman placement were not retained.
     - His mother’s influence and her death were kept as one concept rather than separated.

### Davante Adams — WR — `cfb-davante-adams`

1. **`cfb-davante-adams--mother-worked-two-jobs`** — Adams was raised largely by his mother Pamela, who worked two jobs and also braided hair at night to support the family.
   - Why distinctive: The family-work story is a recurring part of Adams’ account of his upbringing and helps explain the responsibility he felt when choosing college.
   - Source: NFL.com — “Rise Above” Davante Adams feature
   - URL: https://www.nfl.com/news/rise-above
2. **`cfb-davante-adams--three-broken-arms-delayed-football`** — Adams broke the same arm three times growing up and did not play high-school football until his junior year.
   - Why distinctive: The repeated injury history helps explain why his football path began unusually late for an eventual elite receiver.
   - Source: ESPN — Davante Adams profile
   - URL: https://www.espn.com/nfl/story/_/id/34510902/davante-adams-finds-bliss-en-route-las-vegas-raiders
3. **`cfb-davante-adams--basketball-first-point-guard`** — Adams initially saw basketball as his primary sport and played point guard; a cousin helped convince him that his size and athletic profile offered a better path at wide receiver.
   - Why distinctive: The basketball-first identity and deliberate sport choice are more distinctive than a generic “multi-sport athlete” label.
   - Source: ESPN — Davante Adams profile
   - URL: https://www.espn.com/nfl/story/_/id/34510902/davante-adams-finds-bliss-en-route-las-vegas-raiders
4. **`cfb-davante-adams--fresno-state-discovered-scouting-another-player`** — Fresno State noticed Adams while a coach was evaluating another player, helping produce the scholarship opportunity that other programs had not yet offered.
   - Why distinctive: Being discovered incidentally after a late start in football gives his recruiting path a memorable, person-specific shape.
   - Source: NFL.com — “Rise Above” Davante Adams feature
   - URL: https://www.nfl.com/news/rise-above
5. **`cfb-davante-adams--first-scholarship-eased-family-burden`** — Adams accepted Fresno State’s football scholarship after it became his first scholarship opportunity, with the chance to avoid placing college costs on his mother factoring into the decision.
   - Why distinctive: The decision links his recruitment directly to his family circumstances rather than treating the offer as a generic résumé item.
   - Source: ESPN — Davante Adams profile
   - URL: https://www.espn.com/nfl/story/_/id/34510902/davante-adams-finds-bliss-en-route-las-vegas-raiders
   - Research exclusions/constraints:
     - His basketball identity and his eventual choice of football were kept together as one concept.
     - Routine Fresno State receiving totals and awards were not retained.
     - NFL production and team changes were not retained.

### David DeCastro — OL — `cfb-david-decastro`

1. **`cfb-david-decastro--south-african-rugby-family`** — DeCastro’s parents are from South Africa, and his father Colin played rugby and cricket; the family considered raising David in South Africa before settling in the United States.
   - Why distinctive: The South African and rugby family background is an unusual lineage for a Stanford offensive lineman.
   - Source: Pittsburgh Steelers — DeCastro South Africa feature
   - URL: https://www.steelers.com/news/decastro-it-was-amazing-i-would-do-it-again-12696780
2. **`cfb-david-decastro--mother-delayed-football-start`** — DeCastro’s mother initially did not allow him to play youth football, so he played sports such as baseball and basketball and did not begin football until high school; she later learned the sport through books and football clinics.
   - Why distinctive: A parent initially keeping a future first-team college lineman out of football is a distinctive entry story.
   - Source: Pittsburgh Steelers — “DeCastro likes to just do his job”
   - URL: https://www.steelers.com/news/decastro-likes-to-just-do-his-job-7255993
3. **`cfb-david-decastro--washington-shot-put-champion`** — At Bellevue High School, DeCastro won a Washington Class 3A state championship in the shot put.
   - Why distinctive: The throwing-event championship provides a concrete multi-sport athletic background well matched to his later line play.
   - Source: Stanford Athletics — David DeCastro profile
   - URL: https://gostanford.com/news/2013/04/17/david-decastro-profile
4. **`cfb-david-decastro--management-science-engineering-major`** — DeCastro studied management science and engineering at Stanford.
   - Why distinctive: The technically demanding academic field is a useful person-identity detail that supplements his football résumé.
   - Source: Stanford Athletics — David DeCastro profile
   - URL: https://gostanford.com/news/2013/04/17/david-decastro-profile
5. **`cfb-david-decastro--ultra-businesslike-playing-personality`** — Stanford teammates and later profiles described DeCastro as unusually businesslike and focused on the field, to the point that celebratory high-fives could be viewed as a distraction from the next assignment.
   - Why distinctive: The extreme “just do the job” temperament is a memorable personality marker, not an award or statistic.
   - Source: CBS Pittsburgh — David DeCastro draft feature
   - URL: https://www.cbsnews.com/pittsburgh/news/steelers-draft-offensive-guard-david-decastro-in-first-round/
   - Research exclusions/constraints:
     - His father’s rugby and cricket background was treated as one family-sports concept.
     - NFL draft position and professional honors were not retained.
     - Routine Stanford start totals were not retained.

### David Pollack — DL — `cfb-david-pollack`

1. **`cfb-david-pollack--pee-wee-teammate-david-greene`** — Pollack and future Georgia quarterback David Greene played Pee-Wee football together from about age eight through eighth grade and later became Bulldog teammates, roommates and close friends.
   - Why distinctive: The childhood-to-Georgia continuity between two major players on opposite sides of the ball is a distinctive relationship.
   - Source: Georgia Athletics — “Greene & Pollack: Before & After”
   - URL: https://georgiadogs.com/news/2002/10/9/Greene_amp_Pollack_Before_amp_After
2. **`cfb-david-pollack--three-star-recruit`** — Pollack arrived at Georgia from Shiloh High School as a three-star recruit rather than as one of the nation’s most heavily decorated prospects.
   - Why distinctive: The gap between his recruiting profile and eventual college stature is a recognizable development story.
   - Source: Georgia High School Football Hall of Fame — David Pollack
   - URL: https://www.ghsfhf.com/hall-of-fame-classes/2022-inaugural-class/david-pollack
3. **`cfb-david-pollack--tackle-to-defensive-end-transition`** — Pollack moved from defensive tackle to defensive end before the 2002 season and later recalled that the early days of learning the new technique were difficult.
   - Why distinctive: The move explains an important position-development step instead of merely naming the position he eventually starred at.
   - Source: Georgia Athletics — 2002 press conference
   - URL: https://georgiadogs.com/news/2002/9/17/Reactions_From_Tuesday_s_Press_Conference
4. **`cfb-david-pollack--south-carolina-goal-line-takeaway-touchdown`** — Against South Carolina in 2002, Pollack created Georgia’s only touchdown by taking the ball from quarterback Corey Jenkins in the end zone on a famous defensive play.
   - Why distinctive: The unusual goal-line takeaway became one of the signature moments of his Georgia career.
   - Source: Georgia Historic Newspapers — Red & Black, Sept. 17, 2002
   - URL: https://gahistoricnewspapers.galileo.usg.edu/lccn/gua1179162/2002-09-17/ed-1/seq-10/
5. **`cfb-david-pollack--three-time-first-team-all-american`** — Pollack became only the second Georgia player after Herschel Walker to earn first-team All-America recognition in three seasons.
   - Why distinctive: The direct link to one of Georgia’s defining legends makes this rare achievement more identity-specific than an ordinary award list.
   - Source: DavidPollack.com — biography
   - URL: https://davidpollack.com/meet-david/
   - Research exclusions/constraints:
     - A direct-interview claim that he originally signed as a fullback was not retained because stronger official sourcing was available for the later tackle-to-end transition.
     - Ordinary sack totals, SEC awards and NFL draft information were not retained.
     - His Georgia relationship with David Greene was kept as one concept rather than splitting childhood teammate, roommate and best-friend facts.

### DeAngelo Williams — RB — `cfb-deangelo-williams`

1. **`cfb-deangelo-williams--wynne-to-memphis-over-regional-offers`** — Williams starred at Wynne High School in Arkansas but chose Memphis despite recruitment from programs including Arkansas, Ole Miss and Iowa.
   - Why distinctive: Choosing Memphis from a strong regional offer set is a meaningful recruiting-path marker without relying on his later rushing totals.
   - Source: Memphis Athletics — DeAngelo Williams signing announcement
   - URL: https://gotigersgo.com/news/2002/2/25/DeAngelo_Williams_Signs_Scholarship_With_Memphis
2. **`cfb-deangelo-williams--arkansas-state-sprint-champion`** — Williams was an accomplished track sprinter, setting a state-class record in the 100 meters and winning a state title in the 200 meters.
   - Why distinctive: The speed background is a concrete second-sport identity, not just a scouting description.
   - Source: Memphis Athletics — DeAngelo Williams signing announcement
   - URL: https://gotigersgo.com/news/2002/2/25/DeAngelo_Williams_Signs_Scholarship_With_Memphis
3. **`cfb-deangelo-williams--state-title-game-three-way-touchdowns`** — In Wynne’s state championship run, Williams produced a championship-game performance that included rushing, receiving and return touchdowns.
   - Why distinctive: Scoring in three different ways in a title setting captures his high-school versatility in a single distinctive moment.
   - Source: Memphis Athletics — 2002 signing class
   - URL: https://gotigersgo.com/news/2002/2/6/Tigers_Land_24_On_National_Signing_Day
4. **`cfb-deangelo-williams--broken-foot-high-school-recovery`** — A broken foot caused Williams to miss much of his sophomore high-school season before he returned to become one of Arkansas’s top players.
   - Why distinctive: The injury interruption is a meaningful early-career turning point rather than ordinary statistical biography.
   - Source: Memphis Athletics — DeAngelo Williams signing announcement
   - URL: https://gotigersgo.com/news/2002/2/25/DeAngelo_Williams_Signs_Scholarship_With_Memphis
5. **`cfb-deangelo-williams--family-breast-cancer-advocacy`** — Williams’ mother Sandra and four of his aunts were diagnosed with breast cancer, a family history that drove his long-term public advocacy for breast-cancer awareness.
   - Why distinctive: The advocacy became one of his most recognizable off-field identities and is directly rooted in family experience.
   - Source: Sports Illustrated — DeAngelo Williams first-person breast-cancer awareness story
   - URL: https://www.si.com/nfl/2014/05/29/nfl-carolina-panthers-deangelo-williams-sandra-kay-hill-breast-cancer-awareness
   - Research exclusions/constraints:
     - The family cancer history was retained only as one advocacy concept and was not split by relative or campaign.
     - Routine Memphis rushing records and awards were not retained.
     - NFL production was not retained.

### Deion Sanders — Coach — `deion-sanders-cfb`

1. **`deion-sanders--prime-time-to-coach-prime`** — Sanders carried the “Prime Time” identity from his playing days into coaching as “Coach Prime,” making the Prime persona a deliberate part of his coaching brand.
   - Why distinctive: The evolution of a famous personal nickname into a coaching identity is uniquely recognizable and not dependent on wins or championships.
   - Source: Colorado Athletics — Deion Sanders staff bio
   - URL: https://cubuffs.com/staff-directory/deion-coach-prime-sanders/1138
2. **`deion-sanders--trinity-christian-high-school-coaching-start`** — Before becoming a college head coach, Sanders served as offensive coordinator at Trinity Christian School in Texas, where the program won three consecutive state championships during his stint.
   - Why distinctive: His formal coaching path began in high-school football rather than with an immediate college or NFL staff appointment.
   - Source: Colorado Athletics — Deion Sanders staff bio
   - URL: https://cubuffs.com/staff-directory/deion-coach-prime-sanders/1138
3. **`deion-sanders--jackson-state-hbcu-exposure-push`** — At Jackson State, Sanders made increasing HBCU player exposure a visible priority, including hosting a multi-school pro day and helping stage a nationally televised spring game.
   - Why distinctive: The exposure push was a distinctive part of his Jackson State coaching mission, separate from game results.
   - Source: Colorado Athletics — Deion Sanders staff bio
   - URL: https://cubuffs.com/staff-directory/deion-coach-prime-sanders/1138
4. **`deion-sanders--family-integrated-into-program`** — Sanders’ college programs became a family enterprise: sons Shedeur and Shilo played for him, daughter Shelomi was also a Jackson State athlete, and Deion Sanders Jr. contributed to the programs’ media presence.
   - Why distinctive: The unusually visible integration of his children into the football and media ecosystem is a defining part of his coaching-era public identity.
   - Source: Jackson State Athletics — Deion Sanders bio
   - URL: https://gojsutigers.com/sports/football/roster/coaches/deion-sanders/219
5. **`deion-sanders--travis-hunter-jackson-state-flip`** — Sanders and Jackson State signed No. 1-caliber prospect Travis Hunter after flipping him from a long-standing Florida State commitment.
   - Why distinctive: Landing an elite national recruit at an HBCU became a signature recruiting moment of Sanders’ college-coaching identity.
   - Source: ESPN — Deion Sanders recruiting feature
   - URL: https://www.espn.com/college-football/story/_/id/38555810/how-deion-sanders-recruits
   - Research exclusions/constraints:
     - Sanders’ playing résumé, two-sport professional career and NFL achievements were not retained because this identity is Coach.
     - Jackson State and Colorado win-loss records were not retained.
     - Individual family members’ later professional achievements were not retained.

### Derrick Johnson — LB — `cfb-derrick-johnson`

1. **`cfb-derrick-johnson--waco-baylor-brother-upbringing`** — Johnson grew up in Waco around the Baylor football program because his older brother Dwight played defensive tackle for the Bears.
   - Why distinctive: His earliest college-football environment was tied to a school he ultimately chose not to attend.
   - Source: Texas Athletics — “From Waco to Austin: Derrick Johnson”
   - URL: https://texaslonghorns.com/news/2004/10/1/100104aaa_127
2. **`cfb-derrick-johnson--brother-kept-recruitment-neutral`** — During Johnson’s recruitment, Dwight deliberately avoided pushing him toward Baylor and instead encouraged him to decide for himself; Derrick ultimately chose Texas.
   - Why distinctive: The older brother’s unusual neutrality adds a personal dimension to a major in-state recruiting decision.
   - Source: Texas Athletics — “From Waco to Austin: Derrick Johnson”
   - URL: https://texaslonghorns.com/news/2004/10/1/100104aaa_127
3. **`cfb-derrick-johnson--extended-college-football-family`** — Johnson comes from an extensive football family that includes cousins who played at Rice, UCLA, Oklahoma, Florida State and USC in addition to brother Dwight at Baylor.
   - Why distinctive: The breadth of the family’s college-football lineage across multiple major programs is distinctive.
   - Source: Texas Athletics — Derrick Johnson bio
   - URL: https://texaslonghorns.com/sports/general/roster/derrick-johnson/5218
4. **`cfb-derrick-johnson--track-speed-and-triple-jump`** — At Waco High, Johnson also ran a 10.5-second 100 meters and triple-jumped 48 feet.
   - Why distinctive: Elite sprint and jump numbers give a concrete picture of the athletic background behind an unusually fast linebacker.
   - Source: Texas Athletics — Derrick Johnson bio
   - URL: https://texaslonghorns.com/sports/general/roster/derrick-johnson/5218
5. **`cfb-derrick-johnson--waco-homesickness-and-tattoo`** — Johnson returned to Waco nearly every offseason weekend during his first years at Texas because he missed home, and he carried a tattoo tribute to Waco on his arm.
   - Why distinctive: The homesickness and permanent hometown tribute make his Waco identity much more personal than a birthplace field.
   - Source: Texas Athletics — “From Waco to Austin: Derrick Johnson”
   - URL: https://texaslonghorns.com/news/2004/10/1/100104aaa_127
   - Research exclusions/constraints:
     - His decision to return for his senior season rather than enter the NFL draft was verified but not retained because the five selected concepts were more person-first.
     - The family lineage was consolidated into one concept rather than creating separate concepts for individual cousins.
     - Routine tackle totals, awards and NFL draft data were not retained.

### Derwin James — DB — `cfb-derwin-james`

1. **`cfb-derwin-james--offense-to-safety-for-varsity`** — James played quarterback, running back and wide receiver in youth football and had never played safety until his freshman year at Auburndale High, when safety was the open varsity position and he chose to learn it rather than play junior varsity.
   - Why distinctive: The position he became known for began as a pragmatic attempt to get onto the varsity field immediately.
   - Source: NFL.com — “Super Freak” Derwin James profile
   - URL: https://www.nfl.com/news/super-freak
2. **`cfb-derwin-james--fsu-offer-at-fourteen`** — Florida State coach Jimbo Fisher offered James a scholarship when James was a 14-year-old high-school freshman.
   - Why distinctive: An FSU offer that early is a striking indicator of how unusually obvious his talent and maturity appeared.
   - Source: NFL.com — “Super Freak” Derwin James profile
   - URL: https://www.nfl.com/news/super-freak
3. **`cfb-derwin-james--father-blue-football-mentor`** — James’ father, Derwin Sr., nicknamed “Blue,” had been a standout linebacker and captain at Haines City High and became an early football coach and film-study influence for his son.
   - Why distinctive: The father-son football relationship directly shaped James’ aggressive, study-heavy approach to the sport.
   - Source: NFL.com — “Super Freak” Derwin James profile
   - URL: https://www.nfl.com/news/super-freak
4. **`cfb-derwin-james--edgerrin-james-family-lineage`** — Derwin James is related to former Miami running back Edgerrin James and is part of a broader extended family with multiple high-level football players.
   - Why distinctive: The link to another major Florida football name provides a recognizable family lineage.
   - Source: Bay News 9 — Derwin James recruiting profile
   - URL: https://baynews9.com/fl/tampa/sports/2013/7/17/top_recruit_2015_fsu
5. **`cfb-derwin-james--returned-to-haines-city`** — After beginning high school at Auburndale, James returned to Haines City, where his mother wanted his hometown attached to his achievements and where he rejoined the community in which he had grown up playing football.
   - Why distinctive: The return home was a deliberate family decision and reinforces his strong Haines City identity.
   - Source: NFL.com — “Super Freak” Derwin James profile
   - URL: https://www.nfl.com/news/super-freak
   - Research exclusions/constraints:
     - His extensive list of NFL-playing cousins was not broken into separate concepts.
     - Routine FSU tackles, honors and draft information were not retained.
     - The freshman offer and the later high-school return were kept separate because they represent different decisions.

### DeSean Jackson — WR — `cfb-desean-jackson`

1. **`cfb-desean-jackson--team-jackson-family-training`** — Jackson’s father Bill and older brother Byron built a family training operation known as “Team Jackson” around DeSean from about age eight.
   - Why distinctive: The organized family development system is a distinctive origin story for his football career.
   - Source: ESPN The Magazine — DeSean Jackson roots profile
   - URL: https://www.espn.com/nfl/story/_/id/11123688/washington-redskins-wr-desean-jackson-refuses-sever-ties-espn-magazine
2. **`cfb-desean-jackson--long-commute-to-long-beach-poly`** — While living with his father in South Central Los Angeles, Jackson made a demanding combination of walking, bus and train travel to attend Long Beach Poly because his father wanted him in a top football program.
   - Why distinctive: The daily commute shows the deliberate family investment behind his high-school football path.
   - Source: ESPN The Magazine — DeSean Jackson roots profile
   - URL: https://www.espn.com/nfl/story/_/id/11123688/washington-redskins-wr-desean-jackson-refuses-sever-ties-espn-magazine
3. **`cfb-desean-jackson--major-baseball-prospect`** — Jackson was also an accomplished baseball player whom Cal described as having big-league potential.
   - Why distinctive: Serious baseball ability gives him a distinct multi-sport identity rather than generic athletic versatility.
   - Source: California Athletics — DeSean Jackson staff bio
   - URL: https://calbears.com/sports/football/roster/coaches/desean-jackson/454
4. **`cfb-desean-jackson--emergency-defense-title-game-pick-six`** — In a high-school championship game, Jackson was pressed into emergency duty on defense and intercepted two passes, including a 68-yard touchdown return.
   - Why distinctive: A star receiver deciding a title game as an emergency defensive back is a memorable two-way moment.
   - Source: California Athletics — DeSean Jackson staff bio
   - URL: https://calbears.com/sports/football/roster/coaches/desean-jackson/454
5. **`cfb-desean-jackson--tennessee-punt-return-touchdown`** — Jackson opened Cal’s 2007 season against Tennessee with a 77-yard punt-return touchdown in a high-profile rematch of the previous season’s loss.
   - Why distinctive: The return became a signature expression of the explosive special-teams identity he carried at Cal.
   - Source: California Athletics — DeSean Jackson staff bio
   - URL: https://calbears.com/sports/football/roster/coaches/desean-jackson/454
   - Research exclusions/constraints:
     - Tabloid and gang-association discussion contained in some later profiles was not retained.
     - Ordinary Cal receiving totals and NFL résumé data were not retained.
     - The family training system and the commute to Long Beach Poly were kept separate because one is development and the other is schooling/logistics.

### Deshaun Watson — QB — `cfb-deshaun-watson`

1. **`cfb-deshaun-watson--815-gainesville-roots`** — Watson grew up in apartment 815 of the Harrison Square public-housing complex in Gainesville, Georgia, and later used “815” on game-day wristbands as a reminder of where he came from.
   - Why distinctive: The repeated 815 symbol is a highly specific, football-connected marker of his upbringing.
   - Source: ESPN — Deshaun Watson long-form profile
   - URL: https://www.espn.com/espn/feature/story/_/id/29824655/deshaun-watson-ready-heard
2. **`cfb-deshaun-watson--habitat-warrick-dunn-home`** — Watson’s mother applied for a Habitat for Humanity home and completed required sweat-equity work; the family’s house was also supported through Warrick Dunn’s home-furnishing charity program.
   - Why distinctive: The housing story is a distinctive intersection of family effort, community assistance and football philanthropy.
   - Source: ESPN — Deshaun Watson long-form profile
   - URL: https://www.espn.com/espn/feature/story/_/id/29824655/deshaun-watson-ready-heard
3. **`cfb-deshaun-watson--michael-perry-quarterback-mentor`** — Around age 14, Watson began working closely with Gainesville quarterback coach Michael Perry, a relationship he has credited with helping shape his development at the position.
   - Why distinctive: A specific early quarterback mentor gives useful person knowledge beyond generic recruiting rankings.
   - Source: The Players’ Tribune — “What You See”
   - URL: https://www.theplayerstribune.com/articles/deshaun-watson-texans-what-you-see
4. **`cfb-deshaun-watson--clemson-first-offer-chad-morris-pursuit`** — Clemson became Watson’s first scholarship offer after he impressed at a camp while still 14; offensive coordinator Chad Morris then recruited him for years, even attending high-school basketball games and practices.
   - Why distinctive: The unusually early offer and sustained coach-player relationship explain why Clemson became his college destination.
   - Source: ESPN — “Watson’s maturity comes naturally”
   - URL: https://www.espn.com/college-football/story/_/id/11939082/clemson-quarterback-deshaun-watson-draws-strength-maturity-past
5. **`cfb-deshaun-watson--championship-crush-to-renfrow`** — On Clemson’s final drive of the 2016 national championship game, Watson executed the play “Crush” and found Hunter Renfrow for the winning touchdown with one second remaining against Alabama.
   - Why distinctive: The specific final play is the clearest iconic college moment attached to Watson’s Clemson identity.
   - Source: ESPN — Deshaun Watson title-winning drive
   - URL: https://www.espn.com/college-football/story/_/id/18442248/clemson-tigers-deshaun-watson-cements-legacy-game-winning-drive-ages
   - Research exclusions/constraints:
     - All sexual-misconduct allegations, civil litigation and related controversy were explicitly excluded as inappropriate for this identity-knowledge package.
     - Ordinary Clemson career totals, awards and NFL résumé data were not retained.
     - The Clemson first offer and Chad Morris’s long recruitment were treated as one relationship concept.

### Devin White — LB — `cfb-devin-white`

1. **`cfb-devin-white--high-school-running-back-linebacker`** — White was a two-way star at North Webster High School, playing both running back and linebacker.
   - Why distinctive: His high-school offensive identity is important context for a player later known primarily as a linebacker.
   - Source: Minnesota Vikings — Devin White prospect profile
   - URL: https://www.vikings.com/news/prospect-profile-lsu-lb-devin-white
2. **`cfb-devin-white--lsu-running-back-to-linebacker`** — White arrived at LSU with a running-back background before converting full-time to linebacker.
   - Why distinctive: The college position conversion is a meaningful career turning point rather than a simple roster listing.
   - Source: LSU Athletics — Devin White bio
   - URL: https://lsusports.net/sports/fb/roster/player/devin-white
3. **`cfb-devin-white--daisy-mae-horseman`** — White was a lifelong horseman and kept his Tennessee Walking Horse, Daisy Mae, stabled only a short distance from LSU’s campus, regularly caring for and riding her during college.
   - Why distinctive: His equestrian life is one of the most distinctive off-field identities among major college linebackers.
   - Source: LSU Athletics — Devin White bio
   - URL: https://lsusports.net/sports/fb/roster/player/devin-white
4. **`cfb-devin-white--rode-horse-to-final-and-stadium`** — White once rode Daisy Mae to a final exam and later rode the horse into Tiger Stadium for a feature tied to his LSU career.
   - Why distinctive: The image of an LSU linebacker arriving on horseback is memorable enough to stand as a specific tradition/moment beyond the broader horseman concept.
   - Source: LSU Athletics — Devin White bio
   - URL: https://lsusports.net/sports/fb/roster/player/devin-white
5. **`cfb-devin-white--first-lsu-butkus-winner`** — White became the first LSU player to win the Butkus Award as the nation’s top linebacker.
   - Why distinctive: A program-first national honor is distinctive enough to retain without turning the package into an award list.
   - Source: LSU Athletics — Devin White bio
   - URL: https://lsusports.net/sports/fb/roster/player/devin-white
   - Research exclusions/constraints:
     - High-school disciplinary/legal allegations found in some internet results were not retained.
     - His general love of horses and the specific ride-to-final/stadium episode were retained separately because one is a lasting personal identity and the other is a singular college moment.
     - Routine LSU tackle totals and NFL draft information were not retained.

### Dez Bryant — WR — `cfb-dez-bryant`

1. **`cfb-dez-bryant--lufkin-track-hurdles-triple-jump`** — At Lufkin High School, Bryant competed in track and field as a hurdler and triple jumper; district results show him winning the 110-meter hurdles and finishing second in the triple jump.
   - Why distinctive: The track background gives a specific second-sport identity and helps distinguish his athletic development from his receiving résumé.
   - Source: KTRE / Lufkin ISD — District 15-5A track results
   - URL: https://www.ktre.com/story/6368172/15-5a-district-track-results/
2. **`cfb-dez-bryant--texas-recruit-to-oklahoma-state`** — Bryant was a highly regarded receiver from Lufkin, Texas, who signed with Oklahoma State after being recruited by regional powers including Oklahoma, Texas A&M and Texas Tech.
   - Why distinctive: His decision made him part of Mike Gundy’s early pipeline of prominent Texas talent to Stillwater.
   - Source: ESPN Recruiting — Dez Bryant profile
   - URL: https://www.espn.com/college-sports/football/recruiting/player/_/id/36113/dez-bryant
3. **`cfb-dez-bryant--freshman-role-expanded-after-bowman-injury`** — Bryant contributed immediately as a true freshman and became especially important late in the season when Oklahoma State was without injured veteran receiver Adarius Bowman.
   - Why distinctive: The early opportunity behind an established star is a concrete turning point in his college emergence.
   - Source: Oklahoma State Athletics — 2008 football media guide player profile
   - URL: https://okstate.com/documents/download/2015/5/26/08mediaguide_section6.pdf
4. **`cfb-dez-bryant--receiver-and-punt-return-star`** — In 2008 Bryant was recognized not only as an All-America receiver but also as the Big 12 Special Teams Player of the Year and an all-conference return specialist.
   - Why distinctive: The simultaneous receiver-returner identity captures an important dimension of his Oklahoma State role that ordinary receiving totals miss.
   - Source: Oklahoma State Athletics — Dez Bryant College Football Hall of Fame ballot announcement
   - URL: https://okstate.com/news/2025/6/2/cowboy-football-dez-bryant-added-to-college-football-hall-of-fame-ballot
5. **`cfb-dez-bryant--georgia-catch-sports-illustrated-cover`** — Bryant’s diving touchdown catch in Oklahoma State’s 2009 win over Georgia was used on a Sports Illustrated cover during a period when the magazine was featuring the Cowboys prominently.
   - Why distinctive: The image became a highly recognizable visual moment from his college career rather than merely another touchdown statistic.
   - Source: Oklahoma State Athletics — Cowboys featured on Sports Illustrated cover
   - URL: https://okstate.com/news/2009/9/8/Cowboys_Featured_On_Sports_Illustrated_Cover
   - Research exclusions/constraints:
     - Personal legal and off-field controversy from later profiles was not retained.
     - Track claims were limited to results published from Lufkin ISD rather than relying on unsourced biography aggregators.
     - Routine receiving records, draft information and NFL résumé facts were not retained.

### Drew Brees — QB — `cfb-drew-brees`

1. **`cfb-drew-brees--texas-am-family-but-no-texas-offer`** — Brees grew up in Austin as the son of two Texas A&M graduates and expected to attend a Texas college, but major in-state programs did not offer him a football scholarship.
   - Why distinctive: The mismatch between his Texas football roots and lack of a major Texas offer is the essential setup to his Purdue path.
   - Source: NCAA — “How Purdue changed Drew Brees’ life”
   - URL: https://www.ncaa.org/media-center-how-purdue-changed-drew-brees-life-ncaa-silver-anniversary-award-honors-boilermaker-legend/
2. **`cfb-drew-brees--acl-tear-recruiting-setback`** — Brees tore the ACL in his left knee late in his junior year at Westlake High School, entering his senior recruiting cycle as a relatively small quarterback coming off major knee surgery.
   - Why distinctive: The injury and size concerns help explain why his recruitment was far lighter than his later college stature would suggest.
   - Source: NCAA — “How Purdue changed Drew Brees’ life”
   - URL: https://www.ncaa.org/media-center-how-purdue-changed-drew-brees-life-ncaa-silver-anniversary-award-honors-boilermaker-legend/
3. **`cfb-drew-brees--joe-tiller-purdue-fit`** — New Purdue coach Joe Tiller saw Brees as a fit for the spread passing system he was bringing to West Lafayette and provided the opportunity that Texas programs had not.
   - Why distinctive: The match between an overlooked quarterback and a newly installed offensive system is a defining college-path concept.
   - Source: NCAA — “How Purdue changed Drew Brees’ life”
   - URL: https://www.ncaa.org/media-center-how-purdue-changed-drew-brees-life-ncaa-silver-anniversary-award-honors-boilermaker-legend/
4. **`cfb-drew-brees--holy-toledo-ohio-state-touchdown`** — In 2000 against Ohio State, Brees hit Seth Morales for a 64-yard late touchdown on the play remembered by the “Holy Toledo!” radio call, keeping Purdue’s Rose Bowl run alive.
   - Why distinctive: The play is one of the clearest signature moments attached to his Purdue identity.
   - Source: Purdue Athletics — Purdue Football Timeline
   - URL: https://purduesports.com/purdue-football-timeline
5. **`cfb-drew-brees--industrial-management-business-expectation`** — Brees earned a Purdue degree in industrial management and has said he arrived on campus expecting that his degree and a business career were more realistic long-term outcomes than professional football.
   - Why distinctive: That expectation highlights how unlikely his football trajectory appeared even to him when he entered college.
   - Source: Purdue University — “This Is Purdue” Drew Brees podcast
   - URL: https://stories.purdue.edu/podcast/drew-brees/
   - Research exclusions/constraints:
     - Purdue passing records, Heisman placement and NFL achievements were not retained.
     - His Texas family roots and the ACL-related recruiting setback were kept separate because one is background and the other is a specific turning point.
     - A later honorary doctorate was not retained because it falls well outside his CFB career.

### Dwayne Allen — TE — `cfb-dwayne-allen`

1. **`cfb-dwayne-allen--basketball-first-sport`** — Allen grew up especially devoted to basketball and considered it his favorite sport before football became his main athletic path.
   - Why distinctive: The basketball-first background is a useful person-level origin for a player later known as a tight end.
   - Source: Indianapolis Colts — Dwayne Allen Q&A
   - URL: https://www.colts.com/news/questions-with-the-colts-dwayne-allen-13173114
2. **`cfb-dwayne-allen--wayne-inman-football-mentor`** — Terry Sanford coach Wayne Inman introduced Allen to football during his freshman year and became a father-figure mentor to him.
   - Why distinctive: The relationship explains both how Allen entered football and why his college decision carried unusual personal weight.
   - Source: Clemson Athletics — “NFL Tiger Spotlight: Dwayne Allen”
   - URL: https://clemsontigers.com/news/2013/08/29/football-game-program-feature-nfl-tiger-spotlight-dwayne-allen
3. **`cfb-dwayne-allen--late-georgia-to-clemson-switch`** — Allen was committed to Georgia, visited Clemson late in his senior year despite barely knowing where the school was, and ultimately changed his decision to Clemson near signing day.
   - Why distinctive: The dramatic late reversal is a distinctive recruiting story and is best retained as one concept, not several cap/announcement clues.
   - Source: Clemson Athletics — “NFL Tiger Spotlight: Dwayne Allen”
   - URL: https://clemsontigers.com/news/2013/08/29/football-game-program-feature-nfl-tiger-spotlight-dwayne-allen
4. **`cfb-dwayne-allen--mentor-son-georgia-connection`** — Allen’s decision was emotionally complicated because mentor Wayne Inman’s own son had been a four-year starter at Georgia, yet Inman supported Allen choosing the school that felt right to him.
   - Why distinctive: The mentor’s Georgia family tie gives Allen’s Clemson choice an unusually personal layer independent of the commitment flip itself.
   - Source: Clemson Athletics — “NFL Tiger Spotlight: Dwayne Allen”
   - URL: https://clemsontigers.com/news/2013/08/29/football-game-program-feature-nfl-tiger-spotlight-dwayne-allen
5. **`cfb-dwayne-allen--first-clemson-mackey-winner`** — Allen became Clemson’s first winner of the John Mackey Award as the nation’s top tight end.
   - Why distinctive: A program-first honor is sufficiently distinctive to retain without relying on a generic list of awards.
   - Source: Clemson Athletics — Dwayne Allen bio
   - URL: https://clemsontigers.com/sports/football/roster/player/dwayne-allen
   - Research exclusions/constraints:
     - Detailed descriptions of childhood domestic violence from later profiles were not retained for taste reasons.
     - The Georgia commitment flip and Wayne Inman’s son having played at Georgia were kept separate because one is the recruiting event and the other is a distinct mentor relationship.
     - Routine Clemson receiving totals and NFL résumé data were not retained.

### Dwight Freeney — DL — `cfb-dwight-freeney`

1. **`cfb-dwight-freeney--soccer-first-four-sport-athlete`** — Freeney was a four-sport high-school athlete in football, basketball, baseball and soccer, and he played varsity soccer before football became his primary sport.
   - Why distinctive: The soccer background is a distinctive starting point for a future pass rusher known for footwork.
   - Source: Pro Football Hall of Fame — Dwight Freeney enshrinement profile
   - URL: https://www.profootballhof.com/news/countdown-to-2024-pro-football-hall-of-fame-enshrinement-dwight-freeney
2. **`cfb-dwight-freeney--coach-jack-cochran-recruited-him-to-football`** — At Bloomfield High School in Connecticut, coach Jack Cochran helped draw Freeney into football after seeing the athleticism he had shown in other sports.
   - Why distinctive: The coach-driven transition into football is a stronger identity concept than simply saying he was multi-sport.
   - Source: Syracuse Athletics — Dwight Freeney Day feature
   - URL: https://cuse.com/news/2007/4/2/freeneyhonor32607
3. **`cfb-dwight-freeney--and1-inspired-spin-move`** — Freeney has traced the development of his signature spin move to basketball and streetball footwork, including inspiration from AND1 Mixtape-era moves.
   - Why distinctive: The origin of one of football’s most recognizable pass-rush techniques is unusually specific and memorable.
   - Source: Indianapolis Colts — Dwight Freeney Reunion Podcast
   - URL: https://www.colts.com/news/dwight-freeney-reunion-podcast-and1-mixtape-spin-move-pass-rush
4. **`cfb-dwight-freeney--syracuse-locker-room-fit`** — Freeney said Syracuse appealed to him because the energy and personality in the locker room reminded him of the environment he knew at Bloomfield High School.
   - Why distinctive: The emotional reason for his college fit is more person-specific than a list of schools that recruited him.
   - Source: National Football Foundation — Dwight Freeney CFB Hall spotlight
   - URL: https://footballfoundation.org/news/2023/11/5/dwight-freeney-2023-college-football-hall-of-fame-spotlight.aspx
5. **`cfb-dwight-freeney--virginia-tech-four-and-a-half-sacks`** — Freeney recorded 4.5 sacks against Virginia Tech in 2001, one of the defining single-game performances of his Syracuse career.
   - Why distinctive: The performance is distinctive enough to function as a signature college moment rather than an ordinary career total.
   - Source: Syracuse Athletics — Dwight Freeney CFB Hall announcement
   - URL: https://cuse.com/news/2023/12/6/freeney-officially-joins-college-football-hall-of-fame
   - Research exclusions/constraints:
     - NFL sack totals and draft information were not retained.
     - His four high-school sports were consolidated into one concept, with the soccer-first element carrying the distinctiveness.
     - The spin move was treated as one concept despite multiple basketball/streetball influences.

### Earl Thomas — DB — `cfb-earl-thomas`

1. **`cfb-earl-thomas--miracle-baby-family-story`** — Thomas’ mother Debbie has described him as a “miracle baby” after she had earlier faced a serious medical scare and uncertainty about having another child.
   - Why distinctive: The family’s own framing of his birth is a distinctive personal origin story.
   - Source: Texas Athletics — “Earl Thomas: Never a doubt”
   - URL: https://texaslonghorns.com/news/2014/1/30/FB_0130141857
2. **`cfb-earl-thomas--four-sport-two-way-prep-athlete`** — At West Orange-Stark, Thomas lettered in football, basketball, baseball and track and played defensive back, running back and wide receiver in football.
   - Why distinctive: The breadth of sports and football roles captures his pre-college versatility better than isolated statistics.
   - Source: Texas Athletics — 2007 signing class
   - URL: https://texaslonghorns.com/news/2007/2/7/020707aab_651.aspx
3. **`cfb-earl-thomas--church-musician`** — Thomas was active in the church pastored by his grandfather Earl Thomas and played piano there; he had also played tenor saxophone in band when younger.
   - Why distinctive: The musical and church background provides a memorable off-field identity with a direct family connection.
   - Source: Texas Athletics — Earl Thomas bio
   - URL: https://texaslonghorns.com/sports/football/roster/earl-thomas/3417
4. **`cfb-earl-thomas--hurricane-rita-home-loss`** — Thomas’ family lost its home to Hurricane Rita in 2005, and helping his family obtain a new home became one of his stated goals when he later considered leaving college early.
   - Why distinctive: The hurricane’s effect on his family is an important Texas Gulf Coast life event that influenced a major career decision.
   - Source: Texas Athletics — “Earl Thomas: Never a doubt”
   - URL: https://texaslonghorns.com/news/2014/1/30/FB_0130141857
5. **`cfb-earl-thomas--pregame-pickle-watermelon-slush`** — In his Texas player questionnaire, Thomas listed a pregame ritual of eating a pickle and drinking a watermelon slush.
   - Why distinctive: The specific ritual is light, distinctive personality knowledge that is more reusable than another résumé fact.
   - Source: Texas Athletics — Earl Thomas bio
   - URL: https://texaslonghorns.com/sports/football/roster/earl-thomas/3417
   - Research exclusions/constraints:
     - His uncle Anthony Thomas’s college-football background was verified but not retained because the five selected concepts were stronger.
     - The mother’s medical history was phrased narrowly to the family’s documented “miracle baby” account rather than asserting a disputed diagnosis.
     - NFL draft and professional achievements were not retained.

### Ed Orgeron — Coach — `ed-orgeron`

1. **`ed-orgeron--larose-cajun-lsu-childhood`** — Orgeron grew up in Larose, Louisiana, in a Cajun family that organized fall weekends around LSU football; he has said that as a young child he already wanted to coach LSU.
   - Why distinctive: The Bayou upbringing and lifelong LSU attachment are inseparable from his public coaching identity.
   - Source: Sports Illustrated — Ed Orgeron Bayou-roots interview
   - URL: https://www.si.com/college/2020/09/18/ed-orgeron-lsu-60-minutes-daily-cover
2. **`ed-orgeron--bear-bryant-visit-turned-away`** — When Alabama coach Bear Bryant wanted to recruit Orgeron out of South Lafourche High School, Orgeron’s father told Bryant not to make the trip because his son was going to LSU.
   - Why distinctive: The story illustrates the depth of the family’s LSU loyalty in a uniquely memorable recruiting moment.
   - Source: ESPN — “Native son Ed Orgeron’s dream job starts with an LSU win”
   - URL: https://www.espn.com/college-football/story/_/id/17701529/lsu-tigers-ed-orgeron-starts-dream-job-audition-win
3. **`ed-orgeron--left-lsu-after-two-weeks-dug-ditches`** — Orgeron left LSU after about two weeks as a player because he was homesick; the next day his father put him to work digging telephone-cable ditches before Orgeron eventually continued his career at Northwestern State.
   - Why distinctive: The humiliating early exit and manual-labor reset became the central “unfinished business” chapter in his eventual return to LSU.
   - Source: ESPN — “Native son Ed Orgeron’s dream job starts with an LSU win”
   - URL: https://www.espn.com/college-football/story/_/id/17701529/lsu-tigers-ed-orgeron-starts-dream-job-audition-win
4. **`ed-orgeron--bobby-hebert-high-school-teammate`** — Orgeron and future NFL quarterback Bobby Hebert grew up together and were teammates on South Lafourche High School’s 1977 state championship team.
   - Why distinctive: The friendship ties Orgeron to another recognizable Bayou football figure from before either reached college.
   - Source: ESPN — “Native son Ed Orgeron’s dream job starts with an LSU win”
   - URL: https://www.espn.com/college-football/story/_/id/17701529/lsu-tigers-ed-orgeron-starts-dream-job-audition-win
5. **`ed-orgeron--coach-o-cajun-recruiting-identity`** — Orgeron’s gravelly Cajun voice, Louisiana cultural fluency and high-energy recruiting became defining elements of the “Coach O” persona, particularly at LSU.
   - Why distinctive: This is a recognizable coaching identity rooted in place and communication style, not a win-loss statistic.
   - Source: Sports Illustrated — Ed Orgeron Bayou-roots interview
   - URL: https://www.si.com/college/2020/09/18/ed-orgeron-lsu-60-minutes-daily-cover
   - Research exclusions/constraints:
     - Ordinary LSU win totals and the 2019 championship were not retained as standalone concepts.
     - Employment controversies and other tabloid material were not retained.
     - Orgeron’s 2026 return to LSU as a special assistant was verified but not retained because the five historical identity concepts are stronger.

### Eddie George — RB — `cfb-eddie-george`

1. **`cfb-eddie-george--childhood-heisman-speech-practice`** — George has said that by childhood he was telling his mother he would play football and win the Heisman, and by about age 11 he practiced a Heisman acceptance speech in the bathroom mirror.
   - Why distinctive: The unusually specific childhood ambition became reality years later and is a highly recognizable origin story.
   - Source: ESPN — Eddie George Heisman feature
   - URL: https://www.espn.com/ncf/features/heisman/_/year/1995/set/7
2. **`cfb-eddie-george--fork-union-reset`** — George left the Philadelphia area for Fork Union Military Academy as a teenager, where the structured environment served as an academic and personal reset before college.
   - Why distinctive: Fork Union was a major turning point in his path, not just another school on a résumé.
   - Source: Fork Union Military Academy — Eddie George feature
   - URL: https://athletics.forkunion.com/news/2017/11/2/football-post-graduate-last-chance-high-the-bleach-report.aspx
3. **`cfb-eddie-george--ohio-state-kept-him-at-running-back`** — Several colleges saw George’s size and projected him at linebacker, while Ohio State was willing to recruit him as a running back.
   - Why distinctive: The position promise helps explain why he chose the school where he became identified as a tailback.
   - Source: College Football Hall of Fame — Eddie George
   - URL: https://www.cfbhall.com/inductees/eddie-george-2011/
4. **`cfb-eddie-george--illinois-fumbles-cooper-stuck-with-him`** — As an Ohio State freshman, George lost two goal-line fumbles against Illinois, one of which was returned 96 yards, but coach John Cooper continued to believe in him.
   - Why distinctive: The early failure became a documented turning point in his relationship with Cooper and his development.
   - Source: College Football Hall of Fame — Eddie George
   - URL: https://www.cfbhall.com/inductees/eddie-george-2011/
5. **`cfb-eddie-george--yahtzee-recruiting-visit-horseshoe`** — George recalled being underwhelmed when an Ohio State recruiting visit included players sitting around playing Yahtzee, but said the experience of the Horseshoe helped sell him on the program.
   - Why distinctive: The contrast is an unusually human, memorable recruiting detail.
   - Source: Sporting News — Eddie George retrospective
   - URL: https://www.sportingnews.com/us/ncaa-football/news/unstoppable-eddie-george-reflects-on-annihilating-his-nemesis/19zjelot9xbtr1qy5hapwt48z6
   - Research exclusions/constraints:
     - Winning the Heisman itself was not retained as a separate concept because the childhood Heisman story is more distinctive.
     - Routine Ohio State rushing totals and NFL résumé data were not retained.
     - Fork Union academic and discipline details were kept as one reset concept rather than split.

### Eli Manning — QB — `cfb-eli-manning`

1. **`cfb-eli-manning--ole-miss-family-legacy-with-hands-off-father`** — Eli grew up with Ole Miss as part of the Manning family story, but Archie Manning publicly emphasized allowing his son to make his own college decision rather than requiring him to follow his father.
   - Why distinctive: The combination of an enormous family legacy and a deliberately hands-off parent is a distinctive recruiting context.
   - Source: PBS — Eli Manning profile
   - URL: https://www.pbs.org/video/eli-manning-xzwdp9/
2. **`cfb-eli-manning--cutcliffe-hire-sealed-ole-miss`** — Manning was seriously considering schools including Virginia and Texas before Ole Miss hired David Cutcliffe, Peyton Manning’s former Tennessee coach; that relationship helped seal Eli’s choice of Ole Miss.
   - Why distinctive: A coaching hire tied to his older brother directly altered his own college path.
   - Source: Los Angeles Times — Eli Manning/Ole Miss profile
   - URL: https://www.latimes.com/archives/la-xpm-2001-aug-29-sp-39623-story.html
3. **`cfb-eli-manning--cutcliffe-best-ever-challenge`** — As a redshirt freshman, Cutcliffe challenged Manning to define whether he wanted merely to start, become an All-American, or become the best quarterback in Ole Miss history; after several days, Manning chose the highest goal despite the Archie Manning benchmark.
   - Why distinctive: The exchange captures how he approached the pressure of the family name inside the same program.
   - Source: NFL.com — Eli Manning profile
   - URL: https://www.nfl.com/news/unflappable-eli-always-has-thrived-in-the-pressure-cooker-09000d5d826853a4
4. **`cfb-eli-manning--chose-different-jersey-number`** — Manning chose a different jersey number from the numbers most associated with Archie and Peyton, another small way he signaled that he intended to create his own identity.
   - Why distinctive: The jersey choice is meaningful because family comparison was unavoidable throughout his college career.
   - Source: CBS News — Ole Miss gets another Manning
   - URL: https://www.cbsnews.com/news/ole-miss-gets-another-manning/
5. **`cfb-eli-manning--archie-legacy-through-scrapbook`** — Because Eli was born long after Archie’s Ole Miss playing career, he learned much of his father’s college legacy through family stories and a scrapbook rather than by seeing Archie play live.
   - Why distinctive: The scrapbook detail explains how a famous inherited college identity was experienced inside the family.
   - Source: Los Angeles Times — Eli Manning/Ole Miss profile
   - URL: https://www.latimes.com/archives/la-xpm-2001-aug-29-sp-39623-story.html
   - Research exclusions/constraints:
     - Archie and Peyton’s professional accomplishments were not retained.
     - Ole Miss passing records and NFL draft controversy were not retained.
     - The family legacy and the Cutcliffe relationship were separated because they represent different influences on the college decision.

### Eric Crouch — QB — `cfb-eric-crouch`

1. **`cfb-eric-crouch--nebraska-dream-from-recruiting-letter`** — Crouch grew up in Nebraska and has described a sophomore-year recruiting letter from the Cornhuskers as the moment playing for Nebraska became a concrete dream.
   - Why distinctive: The local-player-to-state-program path has a specific origin beyond simply listing his hometown.
   - Source: Los Angeles Times — Eric Crouch profile
   - URL: https://www.latimes.com/archives/la-xpm-2002-jan-03-sp-crouch03-story.html
2. **`cfb-eric-crouch--number-seven-john-elway`** — Crouch wore No. 7 in tribute to John Elway, his favorite professional quarterback.
   - Why distinctive: The number connects his option-quarterback identity to a specific childhood quarterback influence.
   - Source: Los Angeles Times — Eric Crouch profile
   - URL: https://www.latimes.com/archives/la-xpm-2002-jan-03-sp-crouch03-story.html
3. **`cfb-eric-crouch--ankle-redshirt-title-season`** — An ankle injury caused Crouch to redshirt during Nebraska’s 1997 national championship season rather than immediately joining the quarterback rotation.
   - Why distinctive: The injury delayed his entry into the lineup at a moment when the program was at the top of college football.
   - Source: Heisman Trophy — Eric Crouch
   - URL: https://www.heisman.com/heisman-winners/eric-crouch/
4. **`cfb-eric-crouch--newcombe-qb-battle-nearly-left`** — After losing the quarterback job to Bobby Newcombe in 1999, Crouch briefly went home and considered leaving the team before coach Frank Solich persuaded him to return.
   - Why distinctive: The near-departure was a major career turning point that preceded his eventual rise at Nebraska.
   - Source: Los Angeles Times — Nebraska quarterback competition
   - URL: https://www.latimes.com/archives/la-xpm-1999-aug-31-sp-5499-story.html
5. **`cfb-eric-crouch--black-41-flash-reverse`** — Against No. 1 Oklahoma in 2001, Nebraska used “Black 41 Flash Reverse,” with Crouch catching a 63-yard touchdown pass on a trick play.
   - Why distinctive: The play is one of the signature visual moments of his Heisman season and unusually involved the quarterback as a receiver.
   - Source: Nebraska Athletics — “Black 41 Flash Reverse”
   - URL: https://huskers.com/news/2021/09/17/black-41-flash-reverse
   - Research exclusions/constraints:
     - Ordinary Nebraska rushing/passing totals and Heisman vote totals were not retained.
     - The quarterback competition and brief departure were treated as one turning-point concept.
     - Professional position-change discussion was not retained.

### Eric Weddle — DB — `cfb-eric-weddle`

1. **`cfb-eric-weddle--utah-only-scholarship-offer`** — Weddle has described Utah as his only college football scholarship offer and said he arrived from Southern California with a major chip on his shoulder.
   - Why distinctive: The lightly recruited path is central to the competitive identity he developed at Utah.
   - Source: Deseret News — Eric Weddle Utah profile
   - URL: https://www.deseret.com/2013/5/12/20519548/eric-weddle-former-ute-all-american-was-a-punk-freshman/
2. **`cfb-eric-weddle--lion-den-competitive-mantra`** — Weddle adopted a Brian Billick quote about entering a lion’s den with a spear as a competitive mantra while trying to prove programs wrong for overlooking him.
   - Why distinctive: The specific quote became part of the mindset he used to frame his under-recruited college path.
   - Source: Deseret News — Eric Weddle Utah profile
   - URL: https://www.deseret.com/2013/5/12/20519548/eric-weddle-former-ute-all-american-was-a-punk-freshman/
3. **`cfb-eric-weddle--played-all-three-phases`** — At Utah, Weddle played cornerback and safety while also taking snaps at quarterback and running back, returning kicks and punts, holding for kicks, and contributing on coverage teams.
   - Why distinctive: Few major college stars had a genuinely comparable three-phase role, making versatility itself a defining identity concept.
   - Source: Utah Athletics — Weddle consensus All-American announcement
   - URL: https://utahutes.com/news/2007/1/12/weddle_is_named_consensus_all_american
4. **`cfb-eric-weddle--san-diego-state-three-interception-three-touchdown-game`** — Against San Diego State in 2006, Weddle intercepted three passes and scored three touchdowns—two on interception returns and one on an offensive run.
   - Why distinctive: The game is a single-event demonstration of his two-way role and one of the strangest star defensive-back stat lines in college football.
   - Source: Utah Athletics — Eric Weddle National Player of the Week
   - URL: https://utahutes.com/news/2006/9/24/eric_weddle_is_named_national_player_of_the_week
5. **`cfb-eric-weddle--armed-forces-bowl-final-play-interception`** — In his final Utah game, the 2006 Armed Forces Bowl, Weddle contributed on defense, offense and as a holder, then intercepted a pass on the final play of his college career shortly after scoring a rushing touchdown.
   - Why distinctive: The final-play interception gave his famously all-purpose Utah career an unusually fitting ending.
   - Source: Utah Athletics — 2006 Armed Forces Bowl recap
   - URL: https://utahutes.com/news/2006/12/23/utes_stretch_bowl_winning_streak_to_six_games_with_25_13_triumph_over_tulsa
   - Research exclusions/constraints:
     - His high-school offensive and defensive MVP awards were not retained because the Utah concepts were more distinctive.
     - The many positions he played were consolidated into one versatility concept rather than split into separate quarterback/running-back/returner facts.
     - NFL résumé information was not retained.

### Ezekiel Elliott — RB — `cfb-ezekiel-elliott`

1. **`cfb-ezekiel-elliott--missouri-athlete-family`** — Elliott grew up in a Missouri athletics family: his father Stacy played football for Missouri, his mother Dawn competed in track and field there, and Elliott attended Missouri spring games as a child.
   - Why distinctive: His family ties made Missouri a genuine late recruiting pull even after he had committed to Ohio State, giving his college choice an unusually personal backdrop.
   - Source: Sports Illustrated
   - URL: https://www.si.com/college/2015/11/12/ohio-states-ezekiel-elliott-has-relied-many-blockers-his-path-stardom
2. **`cfb-ezekiel-elliott--four-state-track-titles`** — In his final high-school season at John Burroughs, Elliott won Missouri state titles in four different track-and-field events.
   - Why distinctive: Winning four state track titles shows that his prep identity extended well beyond being an elite running back.
   - Source: Sports Illustrated
   - URL: https://www.si.com/college/2014/03/26/spring-spotlight-ohio-state-ezekiel-elliott
3. **`cfb-ezekiel-elliott--gus-frerotte-high-school-coach`** — Elliott played at John Burroughs School for head football coach Gus Frerotte, the former NFL quarterback.
   - Why distinctive: A future star running back being developed by a longtime NFL quarterback is a memorable coaching connection from his pre-college path.
   - Source: Ohio State Athletics
   - URL: https://ohiostatebuckeyes.com/news/2013/2/6/ohio-state-signs-24-to-national-letters-of-intent
4. **`cfb-ezekiel-elliott--mizzou-late-recruiting-pull`** — Even after Elliott committed to Ohio State, his father kept pressing Urban Meyer about how the Buckeyes would use him, and the family's Missouri ties made Mizzou a serious late threat; Meyer later recalled nearly walking away from the recruitment before running-backs coach Stan Drayton helped steady it.
   - Why distinctive: This is a specific family-and-coach recruiting story that explains how close Elliott's college destination came to changing.
   - Source: Sports Illustrated
   - URL: https://www.si.com/college/2015/11/12/ohio-states-ezekiel-elliott-has-relied-many-blockers-his-path-stardom
5. **`cfb-ezekiel-elliott--sugar-bowl-85-yard-run`** — With Ohio State protecting a six-point fourth-quarter lead against No. 1 Alabama in the 2015 Sugar Bowl, Elliott broke an 85-yard touchdown run that effectively clinched the College Football Playoff semifinal.
   - Why distinctive: The 85-yard run is one of the signature individual plays of Ohio State's 2014 national-title run and one of Elliott's clearest college identifiers.
   - Source: Ohio State Athletics
   - URL: https://ohiostatebuckeyes.com/news/2015/1/2/sweet-as-sugar-buckeyes-defeat-alabama-42-35
   - Research exclusions/constraints:
     - Ordinary rushing totals, award counts and NFL draft information were not retained.
     - The 'Fifth Down' conversation between Stacy Elliott and Ohio State president Gordon Gee was interesting but not retained because the stronger family/recruiting concepts already cover that recruitment without overloading it.

### Fernando Mendoza — QB — `cfb-fernando-mendoza`

1. **`cfb-fernando-mendoza--fourth-grade-nearly-quit`** — As a fourth-grader in Miami, Mendoza joined a park football team as the fourth quarterback on the depth chart and considered quitting midway through the season; his parents required him to finish what he started, and he later said that was when he fell in love with football.
   - Why distinctive: It is a distinctive origin story for a quarterback who initially felt buried on the depth chart and nearly walked away from the sport.
   - Source: Indiana Daily Student
   - URL: https://www.idsnews.com/article/2025/12/indiana-football-fernando-mendozas-journey-to-the-heisman-trophy
2. **`cfb-fernando-mendoza--two-star-yale-only-offer`** — Late in his high-school development, Mendoza was a two-star prospect who at one point had only one college offer, from Yale, before his recruiting profile expanded.
   - Why distinctive: The overlooked recruiting start contrasts sharply with the level he eventually reached and is more identity-rich than a later ranking or award list.
   - Source: Indiana Daily Student
   - URL: https://www.idsnews.com/article/2025/12/indiana-football-fernando-mendozas-journey-to-the-heisman-trophy
3. **`cfb-fernando-mendoza--alberto-indiana-transfer-link`** — Mendoza's younger brother Alberto was already a quarterback at Indiana, and Fernando described Alberto as his best friend and one of the people who pushed him hardest; Alberto's experience with the staff and culture was a major factor in Fernando transferring to Indiana.
   - Why distinctive: The brother-to-brother connection directly shaped Mendoza's unusual Cal-to-Indiana path.
   - Source: Sporting News
   - URL: https://www.sportingnews.com/us/ncaa-football/news/fernando-mendoza-family-tree-qb-brother-mom/c248500f63aaa12e6594d1ae
4. **`cfb-fernando-mendoza--cal-degree-three-years`** — Mendoza earned his bachelor's degree in business administration from Cal in three years and personally paid for his final three Cal classes in summer 2025 while he was already enrolled at Indiana.
   - Why distinctive: The cross-school effort to finish his Cal degree while beginning at Indiana is a distinctive academic detail from his transfer story.
   - Source: Indiana University Athletics
   - URL: https://iuhoosiers.com/sports/football/roster/fernando-mendoza/20171
5. **`cfb-fernando-mendoza--cuban-family-service-trip`** — All four of Mendoza's grandparents immigrated to the United States from Cuba; in 2018 he and his brother Alberto traveled to Cuba with their maternal grandparents and did service work with Catholic charities in their grandfather's hometown of Santiago.
   - Why distinctive: The trip ties Mendoza's Cuban-American identity to a concrete family experience rather than a generic heritage label.
   - Source: Sporting News
   - URL: https://www.sportingnews.com/us/ncaa-football/news/fernando-mendoza-family-tree-qb-brother-mom/c248500f63aaa12e6594d1ae
   - Research exclusions/constraints:
     - His 2025 Heisman Trophy and ordinary passing statistics were not retained because they are structural résumé information.
     - His mother's medical condition was not retained; stronger football, family, academic and heritage concepts were available.

### Frank Beamer — Coach — `frank-beamer-cfb`

1. **`frank-beamer--fancy-gap-farm-upbringing`** — Beamer was born in Mount Airy, North Carolina, but grew up on a farm near Fancy Gap and Hillsville, Virginia, where he said hard work and the value of higher education were emphasized.
   - Why distinctive: His rural southwest-Virginia upbringing became part of the personal identity of the coach most associated with Virginia Tech.
   - Source: Virginia Tech Special Collections and University Archives
   - URL: https://digitalsc.lib.vt.edu/Ms2016-015/Ms2016-015_FrankBeamer
2. **`frank-beamer--eleven-varsity-letters`** — At Hillsville High School, Beamer played football, basketball and baseball and graduated with 11 varsity letters.
   - Why distinctive: The unusually broad three-sport résumé helps explain his identity as an all-around small-town athlete before coaching.
   - Source: Virginia Tech Special Collections and University Archives
   - URL: https://digitalsc.lib.vt.edu/Ms2016-015/Ms2016-015_FrankBeamer
3. **`frank-beamer--newspaper-articles-led-to-vpi`** — Several Roanoke Times articles about Beamer's high-school play caught the attention of VPI coaches and helped lead him to Virginia Tech as a player.
   - Why distinctive: It is an unusually specific pre-digital recruiting story linking local newspaper coverage directly to his lifelong Virginia Tech connection.
   - Source: Virginia Tech Special Collections and University Archives
   - URL: https://digitalsc.lib.vt.edu/Ms2016-015/Ms2016-015_FrankBeamer
4. **`frank-beamer--vocational-education-to-radford`** — Beamer majored in vocational education at Virginia Tech and, after graduating in 1969, taught math at Radford High School so he could begin his coaching career there.
   - Why distinctive: His first coaching step came directly through teaching, giving his career a distinctive education-to-coaching origin.
   - Source: Virginia Tech Special Collections and University Archives
   - URL: https://digitalsc.lib.vt.edu/Ms2016-015/Ms2016-015_FrankBeamer
5. **`frank-beamer--beamer-ball-identity`** — Virginia Tech's big-play approach across offense, defense and especially special teams became so associated with Beamer that it was widely known as 'Beamer Ball.'
   - Why distinctive: Few coaches have a tactical identity so closely tied to their own name, making this central person-identity knowledge rather than a generic win total.
   - Source: National Football Foundation
   - URL: https://footballfoundation.org/news/2018/10/5/2018-college-football-hall-of-fame-profile-coach-frank-beamer.aspx
   - Research exclusions/constraints:
     - Career win totals, bowl streaks and championship-game appearances were not retained as standalone concepts.
     - Shane Beamer's playing/coaching connection was considered but not retained because the five selected concepts better cover Frank Beamer's own path and coaching identity.

### George Rogers — RB — `cfb-george-rogers`

1. **`cfb-george-rogers--two-dollar-insurance-aunt-othella`** — As a child, Rogers wanted to play football but his family could not afford the $2 sports-insurance fee; his path changed when his aunt Othella Rogers took him in, required regular church and school attendance, and he then joined the Duluth High football team.
   - Why distinctive: The unusually modest financial barrier and his aunt's intervention form a memorable origin story for his football career.
   - Source: George Rogers Foundation of the Carolinas
   - URL: https://www.georgerogersfoundationofthecarolinas.org/board-of-directors-ceo
2. **`cfb-george-rogers--carlen-freshman-playing-time`** — Rogers chose South Carolina after coach Jim Carlen told him he would have an opportunity to play as a freshman.
   - Why distinctive: The promise of immediate opportunity, rather than a generic school preference, directly explains his college choice.
   - Source: Heisman
   - URL: https://www.heisman.com/heisman-winners/george-rogers/
3. **`cfb-george-rogers--fullback-frame-tailback-role`** — At roughly 6-foot-2 and 220 pounds, Rogers was widely viewed as having a fullback's build, but South Carolina used him at tailback and he moved into the starting role during his freshman season.
   - Why distinctive: The mismatch between how his body type was projected and the position that defined him is a distinctive part of his college identity.
   - Source: Heisman
   - URL: https://www.heisman.com/heisman-winners/george-rogers/
4. **`cfb-george-rogers--jersey-retired-while-active`** — South Carolina retired Rogers's No. 38 during halftime of his final home game in 1980, making him the first Gamecock to have his jersey retired while he was still an active player.
   - Why distinctive: A jersey retirement before his college career had even ended is an unusually strong program-relationship identifier.
   - Source: University of South Carolina Athletics
   - URL: https://gamecocksonline.com/news/2018/06/21/trads-scar-history-html/
5. **`cfb-george-rogers--foundation-first-generation-students`** — Rogers later founded the George Rogers Foundation of the Carolinas, which provides financial assistance to first-generation college students and supports community youth-development organizations.
   - Why distinctive: The foundation gives his public identity a durable education-and-youth focus connected to the barriers in his own early story.
   - Source: Heisman
   - URL: https://www.heisman.com/heisman-winners/george-rogers/
   - Research exclusions/constraints:
     - The Heisman win and ordinary rushing totals were not retained as standalone concepts.
     - A reported preference for South Carolina's game-day atmosphere over Clemson was considered too subjective and unnecessary once stronger recruiting material was established.

### Gerald McCoy — DL — `cfb-gerald-mccoy`

1. **`cfb-gerald-mccoy--oklahoma-city-homegrown-sooner`** — McCoy was an Oklahoma City native and national-level recruit out of Southeast High School who chose to stay in-state and play for Oklahoma.
   - Why distinctive: His identity as a hometown Oklahoma star who became a Sooner is a meaningful geographic and program connection, not merely a school listing.
   - Source: University of Oklahoma Athletics
   - URL: https://soonersports.com/news/2006/2/2/208390931
2. **`cfb-gerald-mccoy--elite-recruit-redshirted`** — Despite arriving as one of the nation's most celebrated defensive recruits, McCoy redshirted in 2006; he later said he was not technically or mentally ready, and credited the year of varsity practice and scout-team work with preparing him.
   - Why distinctive: A can't-miss recruit openly describing why he needed a developmental redshirt is a distinctive turning-point story.
   - Source: Sports Illustrated
   - URL: https://www.si.com/college/oklahoma/football/top-20-nfl-sooners-gerald-mccoy
3. **`cfb-gerald-mccoy--mother-patricia-confidence`** — McCoy said his mother Patricia predicted that he would become a top-ranked recruit, an All-American and a first-round pick; after she died before his first playing season at Oklahoma, he used her confidence in him as continuing motivation.
   - Why distinctive: This is a deeply personal source of motivation that McCoy himself connected to his development and goals.
   - Source: Sports Illustrated
   - URL: https://www.si.com/college/oklahoma/football/top-20-nfl-sooners-gerald-mccoy
4. **`cfb-gerald-mccoy--title-game-first-interception`** — McCoy made the first interception of his college career in the BCS National Championship Game against Florida, returning Tim Tebow's pass 12 yards.
   - Why distinctive: A defensive tackle recording his first career interception on the championship stage is a highly recognizable, position-specific college moment.
   - Source: University of Oklahoma Athletics
   - URL: https://soonersports.com/news/2009/4/28/208395803
5. **`cfb-gerald-mccoy--graduation-before-leaving`** — McCoy said graduation was his main college goal and timed his decision to leave Oklahoma for professional football around knowing he had enough credits; he participated in graduation and finished his Human Relations degree with online courses.
   - Why distinctive: The academic milestone was explicitly central to his decision-making, making it stronger person knowledge than simply listing a degree.
   - Source: University of Oklahoma Athletics
   - URL: https://soonersports.com/news/2009/12/18/208367194
   - Research exclusions/constraints:
     - NFL draft slot, Pro Bowls and ordinary Oklahoma award/stat totals were not retained.
     - His mother's death is retained only as part of McCoy's own stated motivation and not as sensational biographical trivia.

### Glenn Dorsey — DL — `cfb-glenn-dorsey`

1. **`cfb-glenn-dorsey--band-or-football-choice`** — At East Ascension High School, Dorsey participated in both band and football until the practice schedules began overlapping and forced him to choose; he chose football.
   - Why distinctive: A future dominant defensive lineman having to choose football over the school band is a distinctive early-athletic-path detail.
   - Source: LSU Athletics
   - URL: https://lsusports.net/news/2007/10/05/1255525
2. **`cfb-glenn-dorsey--florida-state-fan-to-local-lsu`** — Dorsey grew up a Florida State fan who enjoyed watching Charlie Ward and Warrick Dunn, but later began attending LSU games and was drawn to playing top-level football only about 20 minutes from home.
   - Why distinctive: The shift from childhood Seminoles fan to hometown LSU cornerstone gives his school connection a personal backstory.
   - Source: LSU Athletics
   - URL: https://lsusports.net/news/2007/10/05/1255525
3. **`cfb-glenn-dorsey--miles-recruited-before-saban-offer`** — Les Miles and Karl Dunbar recruited Dorsey hard for Oklahoma State before LSU offered; Dorsey said he liked Miles, but once Nick Saban offered him a scholarship to LSU, his decision was effectively made.
   - Why distinctive: The recruiting story unusually links three major coaches/program paths before Dorsey became an LSU star.
   - Source: Louisiana Sports Hall of Fame
   - URL: https://lasportshall.com/2021/08/17/glenn-dorsey-dream-like-lsu-career-destined-him-for-hall-of-fame-immortality/
4. **`cfb-glenn-dorsey--first-college-snap-forced-fumble`** — On the first collegiate snap of his LSU career, Dorsey forced a fumble against Oregon State.
   - Why distinctive: Making an immediate turnover play on his very first college snap is a compact, memorable signature moment for a defensive tackle.
   - Source: LSU Athletics
   - URL: https://lsusports.net/sports/fb/roster/season/2004/player/glenn-dorsey
5. **`cfb-glenn-dorsey--returned-for-unfinished-business`** — Dorsey returned to LSU for his senior season despite being projected as a first-round draft pick, saying he had unfinished business; that season ended with an SEC title, a national title and four major national defensive/lineman awards.
   - Why distinctive: The choice to return, followed by the exact team and individual goals he was chasing, is a distinctive career-turning-point story rather than a simple award list.
   - Source: LSU Athletics
   - URL: https://lsusports.net/news/2007/12/09/1350708/
   - Research exclusions/constraints:
     - Raw tackle/sack totals and NFL draft position were not retained.
     - The four 2007 awards are included only as the payoff to his 'unfinished business' return decision, not as four separate concepts.

### Haloti Ngata — DL — `cfb-haloti-ngata`

1. **`cfb-haloti-ngata--tongan-family-california-to-utah`** — Ngata was born Etuini Haloti Ngata in Inglewood, California, to Tongan immigrant parents Ofa and Solomone, and his family moved to Utah when he was six.
   - Why distinctive: His Tongan-American family background and childhood move to Utah are foundational to the path that eventually led him to Oregon.
   - Source: University of Oregon Alumni Association
   - URL: https://www.uoalumni.com/article/shout/2022/football-alumni-where-are-they-now
2. **`cfb-haloti-ngata--all-state-offensive-guard-too`** — Although recruited as an elite defensive lineman, Ngata also earned all-state recognition as an offensive guard at Highland High School.
   - Why distinctive: His two-way line dominance is a stronger personal football identifier than another recruiting ranking.
   - Source: University of Oregon Athletics
   - URL: https://goducks.com/sports/football/roster/haloti-ngata/1535
3. **`cfb-haloti-ngata--parents-lost-during-oregon-years`** — Ngata lost both parents during his Oregon years: his father died in a car accident late in Ngata's freshman season, and his mother died after a kidney illness during the period when Ngata was preparing to leave college.
   - Why distinctive: The family losses were a major part of Ngata's college-era personal path and are retained as one combined concept rather than being split for padding.
   - Source: University of Oregon Alumni Association
   - URL: https://www.uoalumni.com/article/shout/2022/football-alumni-where-are-they-now
4. **`cfb-haloti-ngata--season-ending-2003-knee-injury`** — Ngata suffered a season-ending knee injury in the opening quarter of Oregon's 2003 opener at Mississippi State and did not regain full strength until well into the following season.
   - Why distinctive: The injury interrupted an unusually fast start to his college career and became a significant resilience point in his Oregon path.
   - Source: University of Oregon Athletics
   - URL: https://goducks.com/sports/football/roster/haloti-ngata/1535
5. **`cfb-haloti-ngata--defensive-tackle-blocked-kicks`** — Despite playing defensive tackle at roughly 338 pounds, Ngata became a special-teams weapon, with Oregon crediting him with altering the course of five kicks over two seasons.
   - Why distinctive: A massive interior lineman repeatedly affecting kicks is an unusually distinctive piece of on-field identity.
   - Source: University of Oregon Athletics
   - URL: https://goducks.com/sports/football/roster/haloti-ngata/1535
   - Research exclusions/constraints:
     - Bench-press, clean and squat numbers were not retained because the blocked-kick concept captured his unusual athleticism more recognizably.
     - Professional draft and career information was not retained.

### Heath Miller — TE — `cfb-heath-miller`

1. **`cfb-heath-miller--fourth-generation-southwest-virginia`** — Miller was a fourth-generation southwest Virginian from Swords Creek, a small Appalachian community near the coal fields.
   - Why distinctive: His unusually deep roots in a tiny part of southwest Virginia remained central to his public identity throughout college and beyond.
   - Source: The Washington Post
   - URL: https://www.washingtonpost.com/archive/sports/2004/10/15/southwestern-va-follows-millers-rising-star/81e29738-3823-4a27-baf2-69adbf5b9316/
2. **`cfb-heath-miller--parents-work-ethic-example`** — Miller's father Earl was a home builder who was described as never missing a day of work, while his mother Denise was a counselor at Southwest Virginia Community College; their work ethic and family values were repeatedly tied to Miller's upbringing.
   - Why distinctive: The family work-ethic story provides concrete context for Miller's famously understated football persona.
   - Source: Pittsburgh Steelers
   - URL: https://www.steelers.com/news/labriola-on-heath-miller-16845875
3. **`cfb-heath-miller--three-sport-honaker-athlete`** — At tiny Honaker High School, Miller played quarterback in football, power forward in basketball and first base in baseball.
   - Why distinctive: The three-sport background shows the breadth of the athlete Virginia eventually converted into a tight end.
   - Source: Herald-Standard
   - URL: https://www.heraldstandard.com/sports/2005/apr/26/miller-says-all-the-right-things/
4. **`cfb-heath-miller--wanted-virginia-as-high-school-qb`** — During his senior season as Honaker's quarterback, Miller decided he wanted to play college football at Virginia; he later narrowed his choice to Virginia and Virginia Tech and said he felt most comfortable at UVA.
   - Why distinctive: His Virginia connection began before his position change and was a deliberate in-state choice, not simply the school where he later became known.
   - Source: Virginia Cavaliers Athletics
   - URL: https://virginiasports.com/news/2003/11/24/a-trio-of-tight-ends
5. **`cfb-heath-miller--quarterback-to-tight-end-conversion`** — Miller arrived at Virginia as a quarterback, then began working at tight end when the scout team needed help and made the full switch after Al Groh recommended it following fall camp.
   - Why distinctive: The quarterback-to-tight-end conversion is the defining developmental twist in his college identity.
   - Source: Virginia Cavaliers Athletics
   - URL: https://virginiasports.com/news/2003/11/24/a-trio-of-tight-ends
   - Research exclusions/constraints:
     - The Mackey Award, receiving records and NFL résumé were not retained as standalone concepts.
     - The nickname 'Big Money' was considered but not retained because its origin was less important than the stronger person-path concepts selected.

### Hunter Henry — TE — `cfb-hunter-henry`

1. **`cfb-hunter-henry--arkansas-family-football-lineage`** — Henry's father Mark lettered at Arkansas from 1988-91 and was a team captain, and Hunter's brothers Hayden and Hudson also later played football for the Razorbacks.
   - Why distinctive: The Henry family's multi-generation, multi-brother relationship with Arkansas makes Hunter's college identity unusually familial.
   - Source: New England Patriots
   - URL: https://www.patriots.com/team/players-roster/hunter-henry/logs/1973/reg/
2. **`cfb-hunter-henry--chose-arkansas-over-alabama`** — Henry, one of the nation's most highly regarded high-school tight ends, chose his home-state Arkansas program over Alabama.
   - Why distinctive: The decision reinforces that the Razorbacks were a personal destination despite an elite out-of-state option.
   - Source: Arkansas Razorbacks Athletics
   - URL: https://arkansasrazorbacks.com/roster/hunter-henry/
3. **`cfb-hunter-henry--two-way-high-school-player`** — As a sophomore at Pulaski Academy, Henry played on both sides of the ball, contributing as a receiving tight end and as a defender.
   - Why distinctive: His early two-way usage adds a distinct football-development layer beyond his later tight-end résumé.
   - Source: Arkansas Razorbacks Athletics
   - URL: https://arkansasrazorbacks.com/roster/hunter-henry/
4. **`cfb-hunter-henry--church-fca-food-drive`** — At Pulaski Academy, Henry was active in his church youth group and was an FCA leader who helped organize a food drive for people experiencing homelessness.
   - Why distinctive: This is a concrete, source-backed off-field identity detail from before college rather than generic community-service language.
   - Source: Arkansas Razorbacks Athletics
   - URL: https://arkansasrazorbacks.com/roster/hunter-henry/
5. **`cfb-hunter-henry--fourth-and-25-lateral`** — In overtime at Ole Miss in 2015, Henry threw a blind backward lateral just before being tackled short on fourth-and-25; Alex Collins recovered it and ran for the first down, extending the drive that produced Arkansas's 53-52 win.
   - Why distinctive: The fourth-and-25 lateral is one of the most recognizable improvised plays in modern Arkansas football and strongly identifies Henry.
   - Source: NFL.com
   - URL: https://www.nfl.com/news/wild-play-sparks-arkansas-upset-of-ole-miss-0ap3000000574738
   - Research exclusions/constraints:
     - The Mackey Award and ordinary receiving totals were not retained.
     - Pulaski Academy coach Kevin Kelley was noted but not retained as its own concept because the stronger family, community and signature-play material was more reusable.

### Isaiah Simmons — LB — `cfb-isaiah-simmons`

1. **`cfb-isaiah-simmons--track-first-football-after-move`** — Simmons was born in Omaha and initially focused on track; after his family moved to Kansas, he began playing football in second grade.
   - Why distinctive: Football was not his first sport, and the move to Kansas is directly tied to the beginning of his football path.
   - Source: Clemson Tigers Athletics
   - URL: https://clemsontigers.com/news/2019/09/20/isaiah-simmons-tiger-spotlight
2. **`cfb-isaiah-simmons--all-state-both-sides`** — In high school, Simmons earned first-team all-state recognition on both sides of the ball, starring as a defensive back while also producing as a receiver.
   - Why distinctive: His genuine two-way football background foreshadowed the position versatility that later defined him at Clemson.
   - Source: Clemson Tigers Athletics
   - URL: https://clemsontigers.com/sports/track-field/roster/player/isaiah-simmons-2
3. **`cfb-isaiah-simmons--state-long-jump-champion`** — Simmons was a two-time Kansas state champion in the long jump, with a high-school best of 23 feet, 8 inches, and he later appeared on Clemson's track-and-field roster as a long jumper.
   - Why distinctive: His high-level track background is a separate athletic identity from simply being a versatile football player.
   - Source: Clemson Tigers Athletics
   - URL: https://clemsontigers.com/sports/track-field/roster/player/isaiah-simmons-2
4. **`cfb-isaiah-simmons--recruiting-position-split`** — During recruiting, some schools wanted Simmons as a receiver while others, including Clemson, recruited him strictly for defense; Simmons said he preferred being the hitter rather than the player getting hit.
   - Why distinctive: The recruiting disagreement over his position captures how difficult his skill set was to categorize even before college.
   - Source: Clemson Tigers Athletics
   - URL: https://clemsontigers.com/news/2019/09/20/isaiah-simmons-tiger-spotlight
5. **`cfb-isaiah-simmons--roommates-sparked-linebacker-move`** — Simmons's move from safety to Clemson's hybrid linebacker role began after a conversation with his roommates convinced him to raise the idea with defensive coordinator Brent Venables.
   - Why distinctive: The casual roommate conversation that helped unlock his defining college role is a distinctive position-change story.
   - Source: Clemson Tigers Athletics
   - URL: https://clemsontigers.com/news/2019/09/20/isaiah-simmons-tiger-spotlight
   - Research exclusions/constraints:
     - Butkus Award and ordinary tackle totals were not retained.
     - The long-jump concept combines his high-school championships and continuation in Clemson track so the same underlying second-sport fact is not counted twice.

### J.J. Watt — DL — `cfb-jj-watt`

1. **`cfb-jj-watt--hockey-first-sport`** — Watt grew up as a serious hockey player in Pewaukee, Wisconsin, said he had been skating about as long as he had been walking, and gave up hockey at age 13; even as a Badger football player, he said hockey was his best sport.
   - Why distinctive: The hockey-first background is one of the clearest explanations for the unusual athletic path of a future defensive lineman.
   - Source: Wisconsin Badgers Athletics
   - URL: https://uwbadgers.com/news/2009/4/1/Spring_Spotlight_J_J_Watt
2. **`cfb-jj-watt--central-michigan-to-wisconsin-walk-on`** — Watt began college at Central Michigan as a tight end, left a scholarship and starting role, took community-college classes and delivered pizzas, then asked Wisconsin for a chance to walk on as a defensive end.
   - Why distinctive: The scholarship-tight-end to pizza-delivery to walk-on-defensive-end route is a defining and highly distinctive college-football path.
   - Source: Wisconsin Badgers Athletics
   - URL: https://uwbadgers.com/news/2010/10/8/Journey_has_shaped_Watt_on_and_off_the_field
3. **`cfb-jj-watt--childhood-badger-dream`** — Watt grew up around Wisconsin athletics, including skating with Badgers hockey players, and recalled wearing a little Badger jersey in his backyard while imagining himself running onto the Camp Randall field.
   - Why distinctive: His eventual walk-on return to Wisconsin fulfilled a specific childhood home-state dream rather than being an ordinary transfer destination.
   - Source: Wisconsin Badgers Athletics
   - URL: https://uwbadgers.com/news/2009/4/1/Spring_Spotlight_J_J_Watt
4. **`cfb-jj-watt--foundation-started-in-college`** — While still a Wisconsin player in 2010, Watt established the Justin J. Watt Foundation to help elementary and middle schools that lacked funding for athletics.
   - Why distinctive: Starting his signature youth-athletics foundation while still in college gives his off-field identity an unusually early origin.
   - Source: Wisconsin Badgers Athletics
   - URL: https://uwbadgers.com/news/2010/10/8/Journey_has_shaped_Watt_on_and_off_the_field
5. **`cfb-jj-watt--three-watt-brothers-wisconsin`** — J.J.'s younger brothers Derek and T.J. Watt both followed him into Wisconsin football, creating a three-brother Badgers lineage.
   - Why distinctive: The Watt brothers became one of the most recognizable family connections in Wisconsin football.
   - Source: Wisconsin Badgers Athletics
   - URL: https://uwbadgers.com/news/2014/8/2/Lucas_As_usual_Watt_brothers_are_in_this_together
   - Research exclusions/constraints:
     - NFL awards, draft information and professional statistics were not retained.
     - Watt's broader high-school recruiting sequence was considered but not retained separately because the Central Michigan-to-Wisconsin walk-on concept captures the stronger version of that underlying path.

### Ja'Marr Chase — WR — `cfb-jamarr-chase`

1. **`cfb-jamarr-chase--long-jump-state-title-record`** — Chase took up the long jump in high school and, as a junior, won the Louisiana state title with a 24-foot-2.5-inch jump that broke a 35-year-old Archbishop Rummel school record; he also played basketball and could dunk.
   - Why distinctive: The elite jumping background is an unusually direct athletic parallel to the contested-catch ability that later defined him.
   - Source: Sports Illustrated
   - URL: https://www.si.com/nfl/2022/02/12/jamarr-chase-super-bowl-cincinnati-bengals-path-to-success
2. **`cfb-jamarr-chase--wild-recruiting-path-to-lsu`** — Chase's recruitment included LSU coach Les Miles initially suggesting defensive back, a planned live TCU commitment that was bumped from a broadcast, brief commitments to Kansas and Florida, and finally a push from Ed Orgeron and receivers coach Mickey Joseph that brought him to LSU.
   - Why distinctive: The unusually winding sequence is a single distinctive recruiting-path concept explaining how a Louisiana receiver nearly ended up at several other schools.
   - Source: Sports Illustrated
   - URL: https://www.si.com/nfl/2022/02/12/jamarr-chase-super-bowl-cincinnati-bengals-path-to-success
3. **`cfb-jamarr-chase--father-jimmy-football-influence`** — Chase's father Jimmy was a former Alcorn State football player and a social worker who closely tracked his son's development, took him to scouting camps and deliberately compared his testing with top national recruits.
   - Why distinctive: His father's football background and hands-on approach were a specific influence on Chase's path from New Orleans prospect to national recruit.
   - Source: The Washington Post
   - URL: https://www.washingtonpost.com/sports/2022/02/12/jamarr-chase-lsu-bengals-super-bowl/
4. **`cfb-jamarr-chase--stingley-practice-rivalry`** — Chase and Derek Stingley Jr. had competed against each other since sharing a Louisiana 7-on-7 team, and at LSU their one-on-one practice battles became so notable that Ed Orgeron said their tape was the first thing he watched when he came in.
   - Why distinctive: The long-running receiver-cornerback rivalry is a highly specific teammate relationship from LSU's championship era.
   - Source: LSU Athletics
   - URL: https://lsusports.net/news/2019/10/09/football-for-ja-marr-chase-and-derek-stingley-iron-sharpens-iron
5. **`cfb-jamarr-chase--national-title-game-221-two-touchdowns`** — In LSU's win over Clemson in the 2019 season's national championship game, Chase caught nine passes for 221 yards and two touchdowns.
   - Why distinctive: The huge performance on the championship stage is a signature college moment rather than a generic career total.
   - Source: LSU Athletics
   - URL: https://lsusports.net/sports/fb/roster/season/2020/player/jamarr-chase
   - Research exclusions/constraints:
     - His 2020 opt-out and NFL records were not retained because they are less useful for CFB person identity than the selected material.
     - The recruiting stops are intentionally combined as one concept rather than counted as separate Kansas, Florida and TCU facts.

### Jabrill Peppers — DB — `cfb-jabrill-peppers`

1. **`cfb-jabrill-peppers--mother-enforced-grades`** — Peppers's mother Ivory Bryant enforced an all-A-and-B academic standard and pulled him out of a high-school game during his sophomore season after he received a C-plus in Spanish.
   - Why distinctive: The specific consequence makes his family's emphasis on education concrete and memorable rather than generic.
   - Source: University of Michigan Athletics
   - URL: https://mgoblue.com/news/2016/12/9/kornacki_mom_jabrill_soak_in_heisman_weekend
2. **`cfb-jabrill-peppers--new-jersey-sprint-champion`** — Peppers won both the 100- and 200-meter dashes at the New Jersey Meet of Champions as a junior and set a state record of 20.79 seconds in the 200 meters.
   - Why distinctive: His state-level sprint success provides a distinctive second-sport explanation for the speed behind his multi-role football identity.
   - Source: University of Michigan Athletics
   - URL: https://mgoblue.com/news/2014/2/5/Bios_for_2014_Michigan_Football_Signees
3. **`cfb-jabrill-peppers--four-straight-state-titles-two-schools`** — Peppers won four consecutive New Jersey state football championships: two at Don Bosco Prep and two more after transferring to Paramus Catholic.
   - Why distinctive: Winning two pairs of titles at two different high-school powers is an unusually recognizable prep-football path.
   - Source: University of Michigan Athletics
   - URL: https://mgoblue.com/news/2015/11/6/kornacki_peppers_honors_fallen_brother_who_inspired_him
4. **`cfb-jabrill-peppers--offense-natural-defense-by-choice`** — Peppers was a prolific high-school running back as well as a defensive back and later said offense came more naturally to him, but he preferred defense because he would rather deliver the hit than receive it.
   - Why distinctive: The contrast explains why an athlete with natural offensive ability embraced the defensive identity assigned here.
   - Source: University of Michigan Athletics
   - URL: https://mgoblue.com/news/2015/11/6/kornacki_peppers_honors_fallen_brother_who_inspired_him
5. **`cfb-jabrill-peppers--fifteen-michigan-positions`** — Michigan said Peppers lined up at 15 different positions during the 2016 season, including quarterback, tailback and receiver on offense and multiple defensive-back and linebacker roles.
   - Why distinctive: The sheer breadth of his college deployment is one of the strongest person-specific examples of versatility in modern CFB.
   - Source: Sports Illustrated
   - URL: https://www.si.com/college/2017/01/10/jabrill-peppers-michigan-nfl-draft-2017
   - Research exclusions/constraints:
     - Criminal/legal circumstances involving family members and violent family-loss details were not retained as identity concepts.
     - NFL draft information, generic award lists and ordinary college statistics were not retained.

### Jake Butt — TE — `cfb-jake-butt`

1. **`cfb-jake-butt--two-way-pickerington-north`** — At Pickerington North, Butt played both tight end and defensive end; as a senior he also produced 142 tackles, 39.5 tackles for loss and 20.5 sacks on defense.
   - Why distinctive: The two-way high-school résumé is a memorable pre-Michigan identity marker that is much more specific than his later tight-end awards.
   - Source: Michigan Athletics — Jake Butt roster
   - URL: https://mgoblue.com/sports/football/roster/jake-butt/1408
2. **`cfb-jake-butt--army-all-american-injury`** — Butt was selected for the U.S. Army All-American Bowl but did not play in the game because of an injury.
   - Why distinctive: Missing an elite all-star showcase after earning the invitation is a distinctive recruiting-era detail rather than a generic honor.
   - Source: Michigan Athletics — Jake Butt roster
   - URL: https://mgoblue.com/sports/football/roster/jake-butt/1408
3. **`cfb-jake-butt--second-acl-orange-bowl`** — Butt tore the ACL in his right knee in the Orange Bowl against Florida State, requiring the second right-knee surgery of his Michigan career.
   - Why distinctive: The injury happened in his final college game and became a defining turning point in how he talked about football and life after Michigan.
   - Source: Michigan Athletics — Kornacki: Butt Looking to Change Lives
   - URL: https://mgoblue.com/news/2017/4/20/kornacki_butt_looking_to_change_lives
4. **`cfb-jake-butt--medal-speech-rubadeau`** — After the Orange Bowl injury, Butt built his Big Ten Medal of Honor acceptance speech around the question of what he would do if football were taken away, refining the speech with English professor John Rubadeau.
   - Why distinctive: The professor collaboration and the speech theme reveal a specific academic and personal response to adversity, not just an award line.
   - Source: Michigan Athletics — Kornacki: Butt Looking to Change Lives
   - URL: https://mgoblue.com/news/2017/4/20/kornacki_butt_looking_to_change_lives
5. **`cfb-jake-butt--grant-perry-number-88-mentor`** — After Butt left Michigan, wide receiver Grant Perry wore Butt's No. 88 and described Butt as a mentor who continued helping him when Butt returned to campus.
   - Why distinctive: A former teammate carrying his number and still treating him as a mentor gives Butt a concrete post-playing connection to the Michigan program.
   - Source: Michigan Athletics — Perry Finds Meaning in Wearing Butt's No. 88
   - URL: https://mgoblue.com/news/2017/10/9/football-perry-finds-meaning-in-wearing-butts-no-88
   - Research exclusions/constraints:
     - Mackey Award and All-America selections were not retained because they are ordinary structural résumé honors.
     - Career reception and yardage totals were not retained because they are statistical résumé data.

### Jake Long — OL — `cfb-jake-long`

1. **`cfb-jake-long--three-sport-high-school-athlete`** — Long played football, basketball and baseball in high school.
   - Why distinctive: A future elite offensive tackle having a genuine three-sport background is a compact, recognizable athletic-origin concept.
   - Source: Michigan Athletics — Dolphins Sign Long, Make Him Top Pick in NFL Draft
   - URL: https://mgoblue.com/news/2008/4/22/dolphins_sign_long_make_him_top_pick_in_nfl_draft
2. **`cfb-jake-long--lloyd-carr-basketball-scout`** — Michigan coach Lloyd Carr specifically recalled watching Long play basketball while evaluating his size and athleticism.
   - Why distinctive: The image of Michigan's football coach scouting a massive future tackle on a basketball court is a distinctive recruiting story.
   - Source: Michigan Athletics — 2003 Signing Day Comments from Coach Lloyd Carr
   - URL: https://mgoblue.com/news/2003/2/5/2003_signing_day_comments_from_coach_lloyd_carr
3. **`cfb-jake-long--michigan-camp-quick-commit`** — Long attended Michigan's football camp and committed to the Wolverines a couple of weeks later.
   - Why distinctive: It gives his recruitment a simple, concrete turning point tied directly to Michigan rather than a list of offers.
   - Source: Michigan Athletics — 2003 Signing Day Comments from Coach Lloyd Carr
   - URL: https://mgoblue.com/news/2003/2/5/2003_signing_day_comments_from_coach_lloyd_carr
4. **`cfb-jake-long--whole-school-leadership-reputation`** — Carr recalled that during a high-school visit, students and faculty repeatedly came out to tell him what an unusual leader and person Long was.
   - Why distinctive: The school-wide reaction is a vivid personality marker that separates Long from a purely on-field offensive-line biography.
   - Source: Michigan Athletics — Dolphins Sign Long, Make Him Top Pick in NFL Draft
   - URL: https://mgoblue.com/news/2008/4/22/dolphins_sign_long_make_him_top_pick_in_nfl_draft
5. **`cfb-jake-long--survived-house-fire`** — During Long's Michigan years, he survived a serious house fire in which he was burned and escaped through a window before being hospitalized.
   - Why distinctive: This is a major formative adversity story that Michigan's own coach singled out when describing Long's toughness and character.
   - Source: Michigan Athletics — Dolphins Sign Long, Make Him Top Pick in NFL Draft
   - URL: https://mgoblue.com/news/2008/4/22/dolphins_sign_long_make_him_top_pick_in_nfl_draft
   - Research exclusions/constraints:
     - Being selected first overall in the NFL Draft was not retained because the set already had stronger college-era person identity material.
     - Michigan career start totals and All-America honors were rejected as résumé structure.

### Jake Matthews — OL — `cfb-jake-matthews`

1. **`cfb-jake-matthews--bruce-matthews-son`** — Matthews is the son of Pro Football Hall of Fame offensive lineman Bruce Matthews.
   - Why distinctive: The direct father-son connection to one of football's most famous lineages is central to Matthews's public identity.
   - Source: Texas A&M Athletics — Jake Matthews roster
   - URL: https://12thman.com/sports/football/roster/season/2010/player/jake-matthews
2. **`cfb-jake-matthews--four-brothers-aggies`** — Jake was one of four Matthews brothers — Kevin, Jake, Mike and Luke — who played football at Texas A&M.
   - Why distinctive: Four brothers playing for the same major-college program is unusually specific family-program continuity.
   - Source: Texas A&M Athletics — 2023 Hall of Fame class banquet
   - URL: https://12thman.com/news/2023/09/15/2023-texas-am-athletics-hall-of-fame-class-enshrined-at-45th-burgess-banquet
3. **`cfb-jake-matthews--fell-for-am-on-kevin-visits`** — Matthews said he fell in love with Texas A&M while making frequent visits to College Station when his older brother Kevin was playing there.
   - Why distinctive: His college choice grew from an existing family experience with the school rather than simply recruiting prestige.
   - Source: Texas A&M Athletics — Family First
   - URL: https://12thman.com/news/2013/09/11/family-first-1
4. **`cfb-jake-matthews--elkins-line-with-brother-mike`** — At Elkins High School, Jake and his younger brother Mike spent time together on the offensive line before both eventually became Aggies.
   - Why distinctive: The brothers sharing an offensive line before repeating the family connection at A&M is a concrete, memorable origin story.
   - Source: Texas A&M Athletics — Family Tradition
   - URL: https://12thman.com/news/2013/08/30/family-tradition
5. **`cfb-jake-matthews--returned-senior-moved-left-tackle`** — Matthews chose to return to Texas A&M for his senior season and moved from right tackle to left tackle after Luke Joeckel departed.
   - Why distinctive: The decision to stay and accept the premier tackle role marks a clear college-career transition tied to team continuity.
   - Source: Texas A&M Athletics — Jake Matthews to Return to Aggieland
   - URL: https://12thman.com/news/2013/01/10/jake-matthews-to-return-to-aggieland
   - Research exclusions/constraints:
     - Routine All-SEC and All-America honors were not retained because they are structural résumé facts.
     - The broader Matthews NFL family tree beyond the closest A&M relationships was not separately counted to avoid inflating one family concept.

### Jalen Carter — DL — `cfb-jalen-carter`

1. **`cfb-jalen-carter--apopka-three-way-football-role`** — At Apopka High School, Carter played defensive tackle, tight end and punter.
   - Why distinctive: A top defensive tackle also handling tight-end and punting duties is an unusually broad high-school football role.
   - Source: Georgia Athletics — Jalen Carter roster
   - URL: https://georgiadogs.com/roster.aspx?rp_id=4881
2. **`cfb-jalen-carter--state-weightlifting-runner-up`** — Carter competed in weightlifting and finished second in the FHSAA Class 2A heavyweight division; Georgia's bio lists a 395-pound bench press in that context.
   - Why distinctive: Competitive high-school weightlifting gives a person-specific explanation for the power that later defined his defensive-line identity.
   - Source: Georgia Athletics — Jalen Carter roster
   - URL: https://georgiadogs.com/roster.aspx?rp_id=4881
3. **`cfb-jalen-carter--apopka-basketball`** — Carter also played basketball at Apopka High School.
   - Why distinctive: Basketball adds a separate multi-sport component to the background of a player primarily known for interior-line size and power.
   - Source: Georgia Athletics — Jalen Carter roster
   - URL: https://georgiadogs.com/roster.aspx?rp_id=4881
4. **`cfb-jalen-carter--goal-line-receiving-touchdown`** — Georgia used Carter on offense near the goal line, and he caught a one-yard touchdown pass from Stetson Bennett against Tennessee.
   - Why distinctive: A defensive tackle catching a touchdown in a major SEC game is an immediately recognizable, non-statistical college moment.
   - Source: Georgia Athletics — Jalen Carter roster
   - URL: https://georgiadogs.com/roster.aspx?rp_id=4881
5. **`cfb-jalen-carter--apopka-warren-sapp-lineage`** — Carter came from Apopka High School, the same Central Florida program associated with star defensive tackle Warren Sapp.
   - Why distinctive: The shared high-school lineage with another famous interior defender is a memorable geographic and positional connection.
   - Source: Georgia Athletics — Jalen Carter roster
   - URL: https://georgiadogs.com/roster.aspx?rp_id=4881
   - Research exclusions/constraints:
     - Career sack and tackle-for-loss totals were rejected as ordinary statistics.
     - Draft-related incident and other legal or controversy material was intentionally excluded under the research rules.

### Jalen Ramsey — DB — `cfb-jalen-ramsey`

1. **`cfb-jalen-ramsey--late-usc-to-fsu-flip`** — Ramsey had been verbally committed to USC before changing course late and signing with Florida State, with new defensive coordinator Jeremy Pruitt helping establish the connection.
   - Why distinctive: The late coast-to-coast recruiting change is a distinctive origin point for his Seminole identity.
   - Source: Florida State Athletics — Signee Breakdown: Jalen Ramsey
   - URL: https://seminoles.com/news/2013/3/12/signee-breakdown-jalen-ramsey
2. **`cfb-jalen-ramsey--tennessee-decathlon-champion`** — In high school, Ramsey won a Tennessee state decathlon championship and was an elite long jumper.
   - Why distinctive: The decathlon background shows unusually broad track-and-field athleticism rather than just football speed.
   - Source: Florida State Athletics — Signee Breakdown: Jalen Ramsey
   - URL: https://seminoles.com/news/2013/3/12/signee-breakdown-jalen-ramsey
3. **`cfb-jalen-ramsey--acc-long-jump-and-relay-champion`** — While playing football at Florida State, Ramsey also competed in track and won ACC titles in the indoor and outdoor long jump and on a 4x100-meter relay.
   - Why distinctive: Remaining a championship-level two-sport athlete in college is a rare part of his Seminole identity.
   - Source: Florida State Athletics — Jalen Ramsey roster
   - URL: https://seminoles.com/sports/football/roster/jalen-ramsey/809
4. **`cfb-jalen-ramsey--first-freshman-corner-start-since-deion`** — Ramsey became Florida State's first true freshman to start a season opener at cornerback since Deion Sanders in 1985.
   - Why distinctive: The direct Deion Sanders benchmark immediately situates Ramsey in FSU's famous defensive-back tradition.
   - Source: Florida State Athletics — Jalen Ramsey roster
   - URL: https://seminoles.com/sports/football/roster/jalen-ramsey/809
5. **`cfb-jalen-ramsey--corner-to-safety-after-hunter-injury`** — Ramsey began his freshman season at cornerback and shifted to safety after Tyler Hunter was injured.
   - Why distinctive: The in-season position change shows the versatility that became a defining part of his college usage.
   - Source: Florida State Athletics — Jalen Ramsey roster
   - URL: https://seminoles.com/sports/football/roster/jalen-ramsey/809
   - Research exclusions/constraints:
     - Generic All-America selections and draft position were not retained.
     - Individual interception totals were not retained because the position-switch and track concepts carried more identity value.

### Jamaal Charles — RB — `cfb-jamaal-charles`

1. **`cfb-jamaal-charles--learning-disability-special-olympics`** — Charles was diagnosed with a learning disability in elementary school and participated in Special Olympics track before later becoming a Special Olympics Global Ambassador.
   - Why distinctive: This links a formative childhood experience to a long-running public identity beyond football.
   - Source: Special Olympics — Jamaal Charles ambassador profile
   - URL: https://www.specialolympics.org/about/ambassadors/jamaal-charles
2. **`cfb-jamaal-charles--raised-by-mother-aunt-grandmother`** — Charles has described being raised in Port Arthur by his mother, aunt and grandmother.
   - Why distinctive: The three-woman family support structure is a person-specific upbringing detail tied to his Texas roots.
   - Source: The Alcalde — Jamaal
   - URL: https://alcalde.texasexes.org/2016/05/jamaal
3. **`cfb-jamaal-charles--broke-joe-washington-port-arthur-record`** — At Memorial High School, Charles broke a Port Arthur rushing record that had been held by Joe Washington for more than 30 years.
   - Why distinctive: Breaking a long-standing local record held by another famous college football player gives his hometown rise a memorable reference point.
   - Source: Texas Athletics — 2005 signing class
   - URL: https://texaslonghorns.com/news/2005/2/2/020205aac_656
4. **`cfb-jamaal-charles--world-junior-400-hurdles-bronze`** — Charles won a bronze medal in the 400-meter hurdles at the World Junior Championships.
   - Why distinctive: International-level hurdling success distinguishes him from running backs whose track backgrounds were limited to high school.
   - Source: Texas Athletics — 2005 signing class
   - URL: https://texaslonghorns.com/news/2005/2/2/020205aac_656
5. **`cfb-jamaal-charles--texas-track-big12-100-champ`** — Charles competed for Texas track and field and won the Big 12 100-meter championship in 2006.
   - Why distinctive: Winning a major-conference sprint title while also starring at running back reinforces a rare two-sport college identity.
   - Source: Texas Sports Hall of Fame — Jamaal Charles
   - URL: https://tshof.org/inductee/jamaal-charles/
   - Research exclusions/constraints:
     - Texas career rushing totals were not retained because they are standard statistics.
     - Special Olympics participation, learning disability and later ambassadorship were treated as one connected concept rather than inflated into several.

### Jamal Adams — DB — `cfb-jamal-adams`

1. **`cfb-jamal-adams--father-george-adams`** — Adams's father, George Adams, was an All-SEC running back at Kentucky and a first-round NFL Draft pick.
   - Why distinctive: The father-son football lineage is a core family identifier that predates Jamal's LSU career.
   - Source: LSU Athletics — Jamal Adams roster
   - URL: https://lsusports.net/sports/fb/roster/season/2014/player/jamal-adams
2. **`cfb-jamal-adams--father-100-yards-at-lsu`** — George Adams rushed for 100 yards in Kentucky's 1983 win over LSU in Tiger Stadium, decades before his son became an LSU star.
   - Why distinctive: The unusual father-versus-future-school connection makes the family story specifically relevant to Jamal's LSU identity.
   - Source: LSU Athletics — Jamal Adams roster
   - URL: https://lsusports.net/sports/fb/roster/season/2014/player/jamal-adams
3. **`cfb-jamal-adams--president-prez-nickname`** — LSU teammates gave Adams the nickname 'President'/'Prez,' a play on sharing a surname with multiple U.S. presidents.
   - Why distinctive: The nickname is a recognizable personal label that follows him independently of awards or statistics.
   - Source: Las Vegas Raiders — Jamal Adams facts
   - URL: https://www.raiders.com/news/jamal-adams-facts-get-to-know-nfl-transactions-raiders-training-camp
4. **`cfb-jamal-adams--three-lsu-defensive-coordinators`** — Adams played for three different defensive coordinators during his three seasons at LSU.
   - Why distinctive: Continuing as a centerpiece through repeated scheme leadership changes is a distinctive part of his college arc.
   - Source: LSU Athletics — Jamal Adams roster
   - URL: https://lsusports.net/sports/fb/roster/season/2014/player/jamal-adams
5. **`cfb-jamal-adams--vocal-leader-permanent-captain`** — LSU described Adams as a vocal, emotional on-field leader, and he finished his career as a permanent team captain.
   - Why distinctive: The leadership style is a person-identity concept that explains how he was perceived inside the program.
   - Source: LSU Athletics — Jamal Adams roster
   - URL: https://lsusports.net/sports/fb/roster/season/2014/player/jamal-adams
   - Research exclusions/constraints:
     - All-SEC and All-America honors were not retained as standalone concepts.
     - NFL contract and pro-career developments were rejected as outside the college-centered scope.

### James Laurinaitis — LB — `cfb-james-laurinaitis`

1. **`cfb-james-laurinaitis--father-animal-road-warriors`** — Laurinaitis is the son of Joe Laurinaitis, the professional wrestler known as 'Animal' of the Road Warriors/Legion of Doom.
   - Why distinctive: The connection to one of pro wrestling's best-known tag teams is an unusually recognizable family identity.
   - Source: Ohio State Athletics — Under the Helmet
   - URL: https://ohiostatebuckeyes.com/news/2006/11/18/under-the-helmet-37
2. **`cfb-james-laurinaitis--wayzata-hockey-captain-shrek`** — Laurinaitis was a standout defenseman and senior captain for Wayzata High School hockey, where teammates and coaches nicknamed him 'Shrek.'
   - Why distinctive: The captaincy plus a sport-specific nickname creates a vivid Minnesota multi-sport identity.
   - Source: Ohio State Athletics — Under the Helmet
   - URL: https://ohiostatebuckeyes.com/news/2006/11/18/under-the-helmet-37
3. **`cfb-james-laurinaitis--declined-two-sport-hockey-offers`** — Minnesota and Notre Dame were among schools that offered Laurinaitis opportunities to play both football and hockey, but he chose to focus fully on football.
   - Why distinctive: Turning down a plausible two-sport college path is a distinctive fork in his athletic development.
   - Source: Ohio State Athletics — Under the Helmet
   - URL: https://ohiostatebuckeyes.com/news/2006/11/18/under-the-helmet-37
4. **`cfb-james-laurinaitis--first-minnesota-scholarship-buckeye-since-gillman`** — Ohio State's signing bio called Laurinaitis the first scholarship football player from Minnesota to join the Buckeyes since Sid Gillman, who played there in the early 1930s.
   - Why distinctive: That rare recruiting geography makes his move from Minnesota to Columbus more distinctive than a generic hometown fact.
   - Source: Ohio State Athletics — 2005 signing class
   - URL: https://ohiostatebuckeyes.com/news/2005/2/2/eighteen-student-athletes-sign-to-play-football-at-ohio-state
5. **`cfb-james-laurinaitis--returned-senior-for-teammates`** — After receiving strong NFL interest following his junior year, Laurinaitis returned to Ohio State for his senior season, saying he did not want to leave the teammates he had gone through so much with.
   - Why distinctive: The choice to return despite a clear professional path is a meaningful personal commitment to his college team.
   - Source: Ohio State Athletics — Spring Football Player Profile
   - URL: https://ohiostatebuckeyes.com/news/2008/3/27/spring-football-player-profile-james-laurinaitis
   - Research exclusions/constraints:
     - Nagurski, Butkus and other major awards were not separately retained because they are already résumé-like honors.
     - Hockey captaincy and the 'Shrek' nickname were kept together as one underlying high-school hockey identity concept.

### Jaylon Smith — LB — `cfb-jaylon-smith`

1. **`cfb-jaylon-smith--older-brother-rod-smith`** — Smith's older brother Rod Smith played running back at Ohio State, giving Jaylon an older sibling already in major college football.
   - Why distinctive: The sibling relationship shaped how Jaylon discussed establishing his own identity rather than simply following his brother.
   - Source: Notre Dame Athletics — Coming of Age
   - URL: https://fightingirish.com/news/2014/09/11/coming-of-age
2. **`cfb-jaylon-smith--four-straight-state-titles`** — Smith helped Bishop Luers win four consecutive Indiana Class 2A state championships.
   - Why distinctive: Four straight titles at the same high school is an unusually sustained winning backdrop to his recruitment.
   - Source: Notre Dame Athletics — Jaylon Smith roster
   - URL: https://fightingirish.com/sports/football/roster/player/jaylon-smith
3. **`cfb-jaylon-smith--high-school-running-back-linebacker`** — At Bishop Luers, Smith starred on both sides of the ball as a running back and linebacker.
   - Why distinctive: His offensive role is easy to recognize and contrasts with the linebacker identity he carried at Notre Dame.
   - Source: Notre Dame Athletics — Jaylon Smith roster
   - URL: https://fightingirish.com/sports/football/roster/player/jaylon-smith
4. **`cfb-jaylon-smith--basketball-with-deshaun-thomas`** — Smith also played high-school basketball alongside future Ohio State basketball standout Deshaun Thomas.
   - Why distinctive: The connection to another nationally known athlete gives his Fort Wayne multi-sport background a specific human link.
   - Source: Notre Dame Athletics — Jaylon Smith roster
   - URL: https://fightingirish.com/sports/football/roster/player/jaylon-smith
5. **`cfb-jaylon-smith--freshman-opener-after-spond`** — Smith became Notre Dame's first true freshman to start a season opener at linebacker since Kory Minor in 1995 after Danny Spond's medical retirement opened the position.
   - Why distinctive: The unusual immediate-start circumstance is a memorable turning point in how quickly he became a Notre Dame identity.
   - Source: Notre Dame Athletics — Coming of Age
   - URL: https://fightingirish.com/news/2014/09/11/coming-of-age
   - Research exclusions/constraints:
     - Routine tackle totals and award lists were not retained.
     - The Fiesta Bowl knee injury was not retained because the set already had five stronger identity concepts and the injury can dominate his biography.

### Jeff Okudah — DB — `cfb-jeff-okudah`

1. **`cfb-jeff-okudah--high-school-receiver-production`** — Although recruited as an elite defensive back, Okudah was also a productive high-school receiver, averaging more than 24 yards per catch as a junior and producing substantial offensive yardage as a senior.
   - Why distinctive: The offensive production adds a less obvious two-way dimension to a player remembered primarily as a lockdown corner.
   - Source: Ohio State Athletics — Jeff Okudah roster
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/jeff-okudah/449
2. **`cfb-jeff-okudah--nike-testing-behind-dobbins`** — At The Opening, Okudah finished second in Nike+ athletic testing to fellow future Ohio State signee J.K. Dobbins.
   - Why distinctive: Two future Buckeye stars finishing first and second in the same national testing event is a specific recruiting-era connection.
   - Source: Ohio State Athletics — Jeff Okudah roster
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/jeff-okudah/449
3. **`cfb-jeff-okudah--mother-and-obodo-guardians`** — Ohio State's bio identifies Okudah as the son of the late Marie Okudah and lists Jane and Patrick Obodo as his guardians.
   - Why distinctive: The family structure is a meaningful part of his personal background and appears in the university's official biography.
   - Source: Ohio State Athletics — Jeff Okudah roster
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/jeff-okudah/449
4. **`cfb-jeff-okudah--ranked-top-corner-and-safety`** — As a recruit, Okudah was evaluated at the very top of the class at both cornerback and safety rather than being viewed as a one-position defensive back.
   - Why distinctive: That dual-position recruiting identity foreshadows the versatility attached to him before he ever arrived in Columbus.
   - Source: Ohio State Athletics — Jeff Okudah roster
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/jeff-okudah/449
5. **`cfb-jeff-okudah--all-interceptions-junior-season`** — Okudah did not record a college interception until his junior season, then collected all three of his Ohio State interceptions that year, including two at Nebraska.
   - Why distinctive: The late interception breakthrough is a counterintuitive development arc for a corner who was already viewed as elite.
   - Source: Ohio State Athletics — Jeff Okudah Departs DBU
   - URL: https://ohiostatebuckeyes.com/news/2020/1/3/jeff-okudah-departs-dbu-as-an-all-time-top-cb
   - Research exclusions/constraints:
     - NFL Draft position and generic All-America recognition were not retained.
     - Raw coverage statistics were rejected in favor of the unusual timing of his interception breakthrough.

### Jeremy Shockey — TE — `cfb-jeremy-shockey`

1. **`cfb-jeremy-shockey--junior-college-late-miami-signing`** — Shockey spent one season at Northeastern Oklahoma A&M before becoming a late-summer 2000 addition to Miami's roster.
   - Why distinctive: The junior-college-to-late-signing route is a much less conventional path than the typical blue-chip Miami star story.
   - Source: Miami Athletics — Jeremy Shockey roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/jeremy-shockey/
2. **`cfb-jeremy-shockey--first-miami-td-won-fsu-game`** — Shockey's first touchdown for Miami was a 13-yard catch in the final minute that proved to be the winning score against Florida State.
   - Why distinctive: A first college touchdown doubling as a late rivalry game-winner is an unusually memorable career-launch moment.
   - Source: Miami Athletics — Jeremy Shockey roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/jeremy-shockey/
3. **`cfb-jeremy-shockey--returned-from-mcl-for-fsu-winner`** — Shockey suffered an MCL injury before the Florida State game, returned to play, and then caught the decisive touchdown.
   - Why distinctive: The injury-and-return backstory adds personal adversity and context to one of his signature Miami moments.
   - Source: Miami Athletics — Jeremy Shockey roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/jeremy-shockey/
4. **`cfb-jeremy-shockey--ada-two-way-returner`** — At Ada High School, Shockey played wide receiver and outside linebacker and also returned punts, including four punt-return touchdowns as a senior.
   - Why distinctive: His unusually broad high-school role shows that his playmaking identity was established well before he became a college tight end.
   - Source: Miami Athletics — Jeremy Shockey roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/jeremy-shockey/
5. **`cfb-jeremy-shockey--high-school-basketball`** — Shockey also played basketball during his senior year at Ada High School.
   - Why distinctive: Basketball provides a separate multi-sport element to the background of a player known for unusual movement skills at tight end.
   - Source: Miami Athletics — Jeremy Shockey roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/jeremy-shockey/
   - Research exclusions/constraints:
     - Career touchdown and reception totals were rejected as statistical résumé data.
     - NFL personality and pro-career material was not needed to establish his Miami identity.

### Jermaine Gresham — TE — `cfb-jermaine-gresham`

1. **`cfb-jermaine-gresham--ou-decision-day-before-signing`** — As a freshman, Gresham told Oklahoma's athletics site that he knew he was going to OU only the day before he signed.
   - Why distinctive: A decision arriving essentially at signing day gives his recruitment a clear and memorable last-minute character.
   - Source: Oklahoma Athletics — Freshman Tight End Jermaine Gresham
   - URL: https://soonersports.com/news/2006/8/21/208392693
2. **`cfb-jermaine-gresham--maintenance-job`** — Gresham listed maintenance work among the jobs he had held before college.
   - Why distinctive: The ordinary pre-college job is a grounded personal detail rarely present in star-player résumé summaries.
   - Source: Oklahoma Athletics — Freshman Tight End Jermaine Gresham
   - URL: https://soonersports.com/news/2006/8/21/208392693
3. **`cfb-jermaine-gresham--real-estate-interest`** — Gresham listed real estate as an interest outside football when Oklahoma profiled him as a freshman.
   - Why distinctive: It gives him a specific non-football interest rather than a generic personality description.
   - Source: Oklahoma Athletics — Freshman Tight End Jermaine Gresham
   - URL: https://soonersports.com/news/2006/8/21/208392693
4. **`cfb-jermaine-gresham--grandmother-shaped-life`** — Asked what event most shaped his life, Gresham pointed to the death of his grandmother.
   - Why distinctive: The answer comes directly from Gresham and identifies a formative family influence without relying on speculation.
   - Source: Oklahoma Athletics — Freshman Tight End Jermaine Gresham
   - URL: https://soonersports.com/news/2006/8/21/208392693
5. **`cfb-jermaine-gresham--ardmore-to-immediate-ou-buzz`** — Gresham arrived at Oklahoma directly from Ardmore High School and generated immediate preseason buzz because of the rare size-and-speed mismatch he created at tight end.
   - Why distinctive: An Oklahoma hometown product immediately being framed as a 'mismatch' gives his early Sooner identity a clear local and stylistic hook.
   - Source: Oklahoma Athletics — Freshman Tight End Jermaine Gresham
   - URL: https://soonersports.com/news/2006/8/21/208392693
   - Research exclusions/constraints:
     - All-America and Big 12 honors were not retained because they are standard résumé items.
     - High-school basketball claims found mainly through secondary summaries were rejected in favor of facts directly documented by Oklahoma.

### Joe Alt — OL — `cfb-joe-alt`

1. **`cfb-joe-alt--high-school-tight-end-defensive-end`** — Alt played both tight end and defensive end in high school before becoming an offensive tackle at Notre Dame.
   - Why distinctive: The position transformation from a two-way edge athlete to elite college tackle is central to his football development.
   - Source: Notre Dame Athletics — Joe Alt roster
   - URL: https://fightingirish.com/sports/football/roster/player/joe-alt
2. **`cfb-joe-alt--high-school-basketball`** — Alt also played high-school basketball.
   - Why distinctive: Basketball is a distinct part of the multi-sport background behind his movement skills at offensive tackle.
   - Source: Notre Dame Athletics — Joe Alt roster
   - URL: https://fightingirish.com/sports/football/roster/player/joe-alt
3. **`cfb-joe-alt--father-john-alt`** — Alt's father, John Alt, was an offensive lineman at Iowa and a first-round NFL Draft pick who became a Kansas City Chiefs Hall of Famer.
   - Why distinctive: The father-son offensive-line lineage is one of the most recognizable elements of Joe Alt's identity.
   - Source: Notre Dame Athletics — Joe Alt roster
   - URL: https://fightingirish.com/sports/football/roster/player/joe-alt
4. **`cfb-joe-alt--brother-mark-hockey`** — Alt's older brother Mark played college hockey at Minnesota and later professional hockey.
   - Why distinctive: A sibling reaching the professional level in a different major sport makes the Alt family's athletic background unusually distinctive.
   - Source: Notre Dame Athletics — Joe Alt roster
   - URL: https://fightingirish.com/sports/football/roster/player/joe-alt
5. **`cfb-joe-alt--mechanical-engineering`** — Notre Dame's bio listed mechanical engineering as Alt's intended academic field.
   - Why distinctive: The engineering track is a concrete academic identifier that complements rather than duplicates his football résumé.
   - Source: Notre Dame Athletics — Joe Alt roster
   - URL: https://fightingirish.com/sports/football/roster/player/joe-alt
   - Research exclusions/constraints:
     - Consensus All-America honors and draft position were not retained.
     - High-school catch totals were not separately counted because the position-change concept already captures the meaningful idea.

### Joe Thomas — OL — `cfb-joe-thomas`

1. **`cfb-joe-thomas--freshman-blocking-tight-end`** — Thomas began his Wisconsin career as a blocking tight end wearing No. 82 before becoming an offensive tackle.
   - Why distinctive: The tight-end beginning is an unusual starting point for one of Wisconsin's most famous offensive linemen.
   - Source: Wisconsin Athletics — Joe Thomas profile
   - URL: https://uwbadgers.com/sports/2015/8/21/GEN_20140101585
2. **`cfb-joe-thomas--music-city-bowl-defensive-end`** — Thomas started at defensive end against Auburn in the Music City Bowl and made seven tackles before his permanent move to offensive tackle.
   - Why distinctive: A future star left tackle starting a bowl game on the defensive line is a highly distinctive college-football fact.
   - Source: Wisconsin Athletics — Joe Thomas profile
   - URL: https://uwbadgers.com/sports/2015/8/21/GEN_20140101585
3. **`cfb-joe-thomas--wisconsin-shot-put-record`** — Thomas competed in track and field at Wisconsin, set the school's indoor shot-put record, and qualified for NCAA championship competition.
   - Why distinctive: High-level college throwing provides a separate athletic identity beyond offensive line.
   - Source: Wisconsin Athletics — Joe Thomas profile
   - URL: https://uwbadgers.com/sports/2015/8/21/GEN_20140101585
4. **`cfb-joe-thomas--three-sport-high-school-captain`** — In high school Thomas participated in football, basketball and track, and captained both the football and basketball teams.
   - Why distinctive: The combination of three sports and leadership in two of them is a richer origin concept than generic 'multi-sport athlete.'
   - Source: Wisconsin Athletics — Joe Thomas profile
   - URL: https://uwbadgers.com/sports/2015/8/21/GEN_20140101585
5. **`cfb-joe-thomas--learned-in-trenches-from-james-buenning`** — Wisconsin later highlighted how Thomas learned line play by working around veterans such as defensive end Erasmus James and guard Dan Buenning.
   - Why distinctive: The named teammate mentorship connects his unusual early position changes to the people who helped form his tackle identity.
   - Source: Wisconsin Athletics — Hall of Fame feature
   - URL: https://uwbadgers.com/news/2019/6/25/athletics-general-news-events-lucas-uw-athletic-hall-of-fame-2019-joe-thomas-football
   - Research exclusions/constraints:
     - Outland Trophy and All-America honors were not retained as standalone concepts.
     - Career start streaks and NFL durability were rejected as pro-oriented résumé material.

### Joey Bosa — DL — `cfb-joey-bosa`

1. **`cfb-joey-bosa--father-john-bosa-first-rounder`** — Bosa's father, John Bosa, was a first-round NFL Draft pick out of Boston College.
   - Why distinctive: The father-son defensive-line football lineage is a central family identifier.
   - Source: Ohio State Athletics — 2013 signing class
   - URL: https://ohiostatebuckeyes.com/news/2013/2/6/ohio-state-signs-24-to-national-letters-of-intent
2. **`cfb-joey-bosa--mother-and-uncle-ohio-state`** — Bosa's mother Cheryl attended Ohio State, and his uncle Eric Kumerow was an Ohio State linebacker and team captain.
   - Why distinctive: Those pre-existing family ties explain why Ohio State was more than simply another national recruiting destination.
   - Source: Ohio State Athletics — 2013 signing class
   - URL: https://ohiostatebuckeyes.com/news/2013/2/6/ohio-state-signs-24-to-national-letters-of-intent
3. **`cfb-joey-bosa--st-thomas-aquinas-state-title`** — Bosa led a St. Thomas Aquinas defense that won Florida's Class 7A state championship during his senior season.
   - Why distinctive: The famous South Florida program and state-title setting are a recognizable part of his pre-Buckeye identity.
   - Source: Ohio State Athletics — 2013 signing class
   - URL: https://ohiostatebuckeyes.com/news/2013/2/6/ohio-state-signs-24-to-national-letters-of-intent
4. **`cfb-joey-bosa--nick-bosa-followed-to-ohio-state`** — Joey's younger brother Nick later followed him from St. Thomas Aquinas to Ohio State and also became a Buckeye defensive end.
   - Why distinctive: Two brothers repeating the same high-school-to-Ohio-State defensive-line path is a distinctive family-program link.
   - Source: Ohio State Athletics — Nick Bosa roster
   - URL: https://ohiostatebuckeyes.com/sports/football/roster/nick-bosa/7994
5. **`cfb-joey-bosa--urban-meyer-energizer`** — Urban Meyer described Bosa as an 'energizer' who practiced with relentless effort from his first days at Ohio State.
   - Why distinctive: The coach's repeated emphasis on his day-one practice style gives a personality-and-work-habit concept rather than another award.
   - Source: Ohio State Athletics — Urban Meyer press conference, Sept. 29, 2014
   - URL: https://ohiostatebuckeyes.com/news/2014/9/29/urban-meyer-press-conference-transcript-09-29-14
   - Research exclusions/constraints:
     - Big Ten Defensive Lineman of the Year and All-America honors were rejected as structural awards.
     - NFL family members beyond father, mother/uncle, and Nick were not separately counted to avoid overloading one family concept.

### John Henderson — DL — `cfb-john-henderson`

1. **`cfb-john-henderson--partial-qualifier-1998`** — Henderson entered Tennessee as a partial qualifier in 1998 and was not eligible to play that season.
   - Why distinctive: The delayed start is a meaningful part of his path to becoming one of Tennessee's best-known defensive linemen.
   - Source: Tennessee Athletics — John Henderson roster
   - URL: https://utsports.com/sports/football/roster/john-henderson/14190
2. **`cfb-john-henderson--pearl-cohn-tight-end-defensive-tackle`** — At Pearl-Cohn High School in Nashville, Henderson played both defensive tackle and tight end.
   - Why distinctive: The two-way role shows an offensive skill component that is easy to miss in a biography centered on defensive tackle.
   - Source: Tennessee Athletics — John Henderson roster
   - URL: https://utsports.com/sports/football/roster/john-henderson/14190
3. **`cfb-john-henderson--back-to-back-high-school-state-titles`** — Henderson helped Pearl-Cohn win back-to-back Tennessee state championships.
   - Why distinctive: The Nashville state-title background gives his in-state path to Tennessee a strong local football identity.
   - Source: Tennessee Athletics — John Henderson roster
   - URL: https://utsports.com/sports/football/roster/john-henderson/14190
4. **`cfb-john-henderson--big-john-nickname`** — Henderson was widely known at Tennessee as 'Big John.'
   - Why distinctive: The nickname is a simple, durable personal identifier strongly associated with his imposing college presence.
   - Source: Tennessee Athletics — Vols Jersey Countdown: 98
   - URL: https://utsports.com/news/2012/5/25/Vols_Jersey_Countdown_98
5. **`cfb-john-henderson--played-through-ankle-2001`** — Henderson dealt with a lingering ankle injury during the 2001 season but still remained a major part of Tennessee's defensive front.
   - Why distinctive: The injury context adds adversity to his senior-season story without relying on legal or off-field material.
   - Source: Tennessee Athletics — Vols Jersey Countdown: 98
   - URL: https://utsports.com/news/2012/5/25/Vols_Jersey_Countdown_98
   - Research exclusions/constraints:
     - Outland Trophy and All-America honors were not retained as standalone concepts.
     - His later charitable foundation connected to a family tragedy was considered but not retained because the game can preserve his identity without using a painful family event.

### Jonathan Allen — DL — `cfb-jonathan-allen`

1. **`cfb-jonathan-allen--army-family-upbringing`** — Allen grew up in a military family; his father served in the U.S. Army for more than two decades, and military moves were part of Allen's childhood.
   - Why distinctive: The military-family background is a defining upbringing detail that helps explain his path through multiple places before Virginia.
   - Source: U.S. Army — Jonathan Allen youth camp feature
   - URL: https://www.army.mil/article/258443/nfl_football_star_spends_time_with_kids_at_fort_lee_procamp
2. **`cfb-jonathan-allen--foster-care-father-custody`** — Allen spent roughly ten months in foster care as a child before his father secured custody of him and his brother.
   - Why distinctive: This is a major formative adversity story that Allen and his family have discussed publicly and that shaped his upbringing.
   - Source: The Washington Post — From foster care to first round
   - URL: https://www.washingtonpost.com/sports/colleges/from-foster-care-to-first-round-alabamas-jonathan-allen-plows-forward/2016/12/22/9f61c5d4-c84f-11e6-bf4b-2c064d32a4bf_story.html
3. **`cfb-jonathan-allen--first-chair-trombone`** — Allen played trombone and reached first chair before football became his dominant extracurricular focus.
   - Why distinctive: Being a first-chair trombonist is a distinctive non-football skill rarely associated with an elite defensive lineman.
   - Source: The Washington Post — From foster care to first round
   - URL: https://www.washingtonpost.com/sports/colleges/from-foster-care-to-first-round-alabamas-jonathan-allen-plows-forward/2016/12/22/9f61c5d4-c84f-11e6-bf4b-2c064d32a4bf_story.html
4. **`cfb-jonathan-allen--wanted-running-back-before-defensive-line`** — Allen initially wanted to play running back or linebacker in high school, tried wide receiver, and eventually was moved to the defensive line.
   - Why distinctive: The winding position path is a strong origin story for a player later identified almost exclusively with defensive line.
   - Source: The Washington Post — From foster care to first round
   - URL: https://www.washingtonpost.com/sports/colleges/from-foster-care-to-first-round-alabamas-jonathan-allen-plows-forward/2016/12/22/9f61c5d4-c84f-11e6-bf4b-2c064d32a4bf_story.html
5. **`cfb-jonathan-allen--returned-for-senior-season`** — Allen chose to return to Alabama for his senior season instead of entering the NFL Draft after 2015, and he became a permanent team captain.
   - Why distinctive: The voluntary return and captaincy mark a clear commitment point in his Alabama identity.
   - Source: Alabama Athletics — Jonathan Allen roster
   - URL: https://rolltide.com/sports/football/roster/jonathan-allen/3077
   - Research exclusions/constraints:
     - Career sack totals and individual national awards were rejected as résumé structure.
     - Specific foster-care details beyond the broadly documented period and custody outcome were not expanded unnecessarily.

### Jordan Shipley — WR — `cfb-jordan-shipley`

1. **`cfb-jordan-shipley--childhood-with-colt-mccoy`** — Shipley and Colt McCoy knew each other as young children because their fathers had been roommates at Abilene Christian, and they played together during family visits.
   - Why distinctive: The childhood connection makes the later Texas quarterback-receiver partnership unusually personal and long-running.
   - Source: Texas Athletics — Texas vs. Oklahoma feature
   - URL: https://texaslonghorns.com/news/2008/10/11/101108aaa_21
2. **`cfb-jordan-shipley--college-roommates-with-mccoy`** — After reconnecting at Texas, Shipley and McCoy became roommates and close friends.
   - Why distinctive: The friendship extended the childhood story into the heart of the Longhorn offense, giving the pairing identity value beyond statistics.
   - Source: Texas Athletics — Texas vs. Oklahoma feature
   - URL: https://texaslonghorns.com/news/2008/10/11/101108aaa_21
3. **`cfb-jordan-shipley--injuries-delayed-texas-career`** — Shipley's early Texas career was repeatedly delayed by serious knee and hamstring injuries before he finally became a full-time receiving threat.
   - Why distinctive: The long injury delay is a defining adversity arc behind a player later remembered as a highly productive Longhorn.
   - Source: Texas Athletics — Texas vs. Oklahoma feature
   - URL: https://texaslonghorns.com/news/2008/10/11/101108aaa_21
4. **`cfb-jordan-shipley--96-yard-red-river-kick-return`** — Against No. 1 Oklahoma in 2008, Shipley returned a kickoff 96 yards for a touchdown in Texas's 45-35 Red River victory.
   - Why distinctive: The rivalry, No. 1 opponent and long return combine into one of his most instantly recognizable college moments.
   - Source: Texas Athletics — Texas vs. Oklahoma feature
   - URL: https://texaslonghorns.com/news/2008/10/11/101108aaa_21
5. **`cfb-jordan-shipley--west-texas-moves-and-stephen-mcgee`** — Shipley spent parts of his childhood in Abilene and Rotan before his family moved to Burnet, where he became close with future Texas A&M quarterback Stephen McGee.
   - Why distinctive: The small-town Texas moves and another major-college quarterback friendship give his background a distinctly Texas-football network.
   - Source: Texas Athletics — Jordan Shipley Q&A
   - URL: https://texaslonghorns.com/news/2006/11/16/111606aab_105.aspx
   - Research exclusions/constraints:
     - Career receptions and receiving-yard totals were not retained.
     - Generic All-Big 12 honors were rejected in favor of the McCoy relationship and rivalry moment.

### Julius Peppers — DL — `cfb-julius-peppers`

1. **`cfb-julius-peppers--unc-basketball-walk-on`** — Peppers played basketball for North Carolina while on a football scholarship, joining the Tar Heels basketball team as a walk-on.
   - Why distinctive: Playing meaningful basketball for one of the sport's signature programs makes his two-sport college identity exceptionally recognizable.
   - Source: North Carolina Athletics — Julius Peppers football roster
   - URL: https://goheels.com/sports/football/roster/julius-peppers/5459
2. **`cfb-julius-peppers--aau-title-with-haywood-lang`** — Before college, Peppers played on an AAU national championship basketball team with future North Carolina players Brendan Haywood and Kris Lang.
   - Why distinctive: The named future Tar Heel teammates make his basketball background a specific network rather than a generic second-sport fact.
   - Source: North Carolina Athletics — Julius Peppers football roster
   - URL: https://goheels.com/sports/football/roster/julius-peppers/5459
3. **`cfb-julius-peppers--division-one-basketball-recruit`** — Peppers was good enough in high-school basketball to be recruited by Division I basketball programs.
   - Why distinctive: Legitimate high-level basketball recruitment underscores that his second sport was not merely recreational.
   - Source: North Carolina Athletics — Julius Peppers football roster
   - URL: https://goheels.com/sports/football/roster/julius-peppers/5459
4. **`cfb-julius-peppers--high-school-running-back`** — In high school, Peppers was also a major offensive player and finished with more than 3,500 rushing yards and 38 rushing touchdowns.
   - Why distinctive: A future pass-rushing star having a substantial running-back résumé is an unusual position-history concept.
   - Source: North Carolina Athletics — Peppers joins basketball
   - URL: https://goheels.com/news/2000/1/22/205462922
5. **`cfb-julius-peppers--north-carolina-male-athlete-of-year`** — Peppers was named the North Carolina High School Athletic Association Male Athlete of the Year after excelling across sports.
   - Why distinctive: The statewide multi-sport recognition ties together his football and basketball identity before UNC without duplicating college honors.
   - Source: North Carolina Athletics — Julius Peppers football roster
   - URL: https://goheels.com/sports/football/roster/julius-peppers/5459
   - Research exclusions/constraints:
     - College sack totals and defensive awards were not retained as standalone concepts.
     - Multiple separate basketball stat lines were rejected to keep the two-sport material conceptually distinct rather than repetitive.

### Kayvon Thibodeaux — DL — `cfb-kayvon-thibodeaux`

1. **`cfb-kayvon-thibodeaux--dorsey-to-oaks-christian`** — Thibodeaux began high school at Dorsey in Los Angeles before transferring to Oaks Christian for his final two seasons.
   - Why distinctive: The move connects his South Central Los Angeles roots to the private-school powerhouse where his national recruiting profile exploded.
   - Source: Oregon Athletics — Kayvon Thibodeaux roster
   - URL: https://goducks.com/sports/football/roster/kayvon-thibodeaux/10601
2. **`cfb-kayvon-thibodeaux--high-school-tight-end`** — In addition to defensive line, Thibodeaux caught nine passes for 134 yards and three touchdowns as a high-school tight end.
   - Why distinctive: The offensive role provides a less obvious skill component for a player overwhelmingly identified as a pass rusher.
   - Source: Oregon Athletics — Kayvon Thibodeaux roster
   - URL: https://goducks.com/sports/football/roster/kayvon-thibodeaux/10601
3. **`cfb-kayvon-thibodeaux--four-sack-cif-title-game`** — Thibodeaux recorded four sacks in the CIF Southern Section Division 2 championship game while helping Oaks Christian win the title.
   - Why distinctive: A four-sack performance in a championship game is a specific pre-college signature moment rather than a season-total statistic.
   - Source: Oregon Athletics — Kayvon Thibodeaux roster
   - URL: https://goducks.com/sports/football/roster/kayvon-thibodeaux/10601
4. **`cfb-kayvon-thibodeaux--highest-rated-oregon-signee`** — Oregon described Thibodeaux as the highest-rated football signee in program history when he joined the Ducks.
   - Why distinctive: That recruiting distinction explains the extraordinary expectations surrounding him before his first Oregon snap.
   - Source: Oregon Athletics — Oregon Adds To Consensus Top 10 Class
   - URL: https://goducks.com/news/2019/2/5/football-nsd19
5. **`cfb-kayvon-thibodeaux--wants-to-start-school`** — While at Oregon, Thibodeaux said he wanted one day to start his own school and described a goal of giving younger people and peers wisdom and hope.
   - Why distinctive: The education-oriented ambition supplies a distinctive public-personality concept unrelated to sacks, awards or draft status.
   - Source: Los Angeles Times — Prep Rally interview
   - URL: https://www.latimes.com/sports/newsletter/2021-08-02/high-school-football-prep-rally
   - Research exclusions/constraints:
     - Career sack totals and Pac-12 awards were rejected as structural football résumé information.
     - Business and NIL ventures were not retained because the college and upbringing concepts above were cleaner identity markers.

### Keith Jackson — TE — `cfb-keith-jackson`

1. **`cfb-keith-jackson--little-rock-parkview`** — Jackson came to Oklahoma from Parkview High School in Little Rock, Arkansas.
   - Why distinctive: The Arkansas-to-Oklahoma path is a stable geographic identity marker for an older player whose recruiting story is otherwise less documented.
   - Source: National Football Foundation — Keith Jackson Hall of Fame profile
   - URL: https://footballfoundation.org/hof_search.aspx?hof=2065
2. **`cfb-keith-jackson--88-yard-nebraska-reverse`** — Against No. 2 Nebraska in 1985, Jackson scored on an 88-yard rushing play on a tight-end reverse.
   - Why distinctive: A tight end taking a reverse 88 yards in a rivalry-level national game is one of the most distinctive plays attached to his college identity.
   - Source: Oklahoma Athletics — Black History Month Spotlight
   - URL: https://soonersports.com/sports/2025/2/26/black-history-month-spotlight
3. **`cfb-keith-jackson--orange-bowl-two-touchdowns`** — Jackson caught two touchdowns, including a 71-yard score, in Oklahoma's Orange Bowl win over Penn State that secured the 1985 national championship.
   - Why distinctive: The national-title setting gives him a signature postseason moment directly tied to Oklahoma's championship history.
   - Source: College Football Hall of Fame — Keith Jackson
   - URL: https://www.cfbhall.com/inductees/keith-jackson-2001/
4. **`cfb-keith-jackson--four-time-academic-all-big-eight`** — Jackson was a four-time Academic All-Big Eight selection and later received NCAA Top Six recognition for combining athletics and academics.
   - Why distinctive: Sustained academic recognition across his whole college career is a meaningful identity concept beyond football production.
   - Source: National Football Foundation — Keith Jackson Hall of Fame profile
   - URL: https://footballfoundation.org/hof_search.aspx?hof=2065
5. **`cfb-keith-jackson--ou-radio-broadcast-crew`** — After his playing career, Jackson returned to the Oklahoma football orbit as part of the Sooners' radio broadcast crew.
   - Why distinctive: The broadcasting role gives him a durable post-playing connection to the university and fan base.
   - Source: Oklahoma Athletics — Black History Month Spotlight
   - URL: https://soonersports.com/sports/2025/2/26/black-history-month-spotlight
   - Research exclusions/constraints:
     - Career receiving totals and generic All-America honors were not retained.
     - The 88-yard reverse and Orange Bowl receiving performance were treated as separate concepts because they are distinct iconic games and roles.

### Kellen Winslow II — TE — `cfb-kellen-winslow-ii`

1. **`cfb-kellen-winslow-ii--father-kellen-winslow`** — Winslow is the son of Pro Football Hall of Fame tight end Kellen Winslow Sr., who played college football at Missouri.
   - Why distinctive: The same-name father-son tight-end lineage is the most obvious clean personal identifier attached to Winslow's football background.
   - Source: Miami Athletics — Kellen Winslow roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/kellen-winslow
2. **`cfb-kellen-winslow-ii--miami-receiver-to-tight-end`** — Winslow began his Miami career at wide receiver before moving to tight end.
   - Why distinctive: The early position change helps explain the receiving style that distinguished him from a traditional in-line tight end.
   - Source: Miami Athletics — Kellen Winslow roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/kellen-winslow
3. **`cfb-kellen-winslow-ii--true-freshman-title-team-special-teams`** — As a true freshman on Miami's 2001 national championship team, Winslow contributed heavily on special teams, including tackles in the Rose Bowl.
   - Why distinctive: The special-teams role shows how he entered a loaded championship roster before becoming a featured tight end.
   - Source: Miami Athletics — Kellen Winslow roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/kellen-winslow
4. **`cfb-kellen-winslow-ii--high-school-multi-role-kicker`** — In high school Winslow played receiver, tight end and defensive end and also handled punting, kickoffs, field goals and extra points.
   - Why distinctive: A future college tight end also serving as a kicker and punter is unusually broad and highly distinctive.
   - Source: Miami Athletics — Kellen Winslow roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/kellen-winslow
5. **`cfb-kellen-winslow-ii--uncle-david-basketball`** — Winslow's uncle David played professional basketball in the United States and Australia.
   - Why distinctive: The basketball connection adds a different branch to the family's athletic background without relying on any controversy.
   - Source: Miami Athletics — Kellen Winslow roster
   - URL: https://miamihurricanes.com/sports/football/roster/season/2001-02/player/kellen-winslow
   - Research exclusions/constraints:
     - All legal, criminal and sexual-misconduct material was deliberately excluded.
     - NFL career events were not retained because five clean college/family identity concepts were available.

### Khalil Mack — LB — `cfb-khalil-mack`

1. **`cfb-khalil-mack--basketball-first-patella-injury`** — Mack initially viewed basketball as his main sport, but a patella injury helped redirect his athletic path toward football.
   - Why distinctive: The basketball-to-football pivot is a formative origin story for a player who was not groomed as a lifelong football prospect.
   - Source: Sporting News — Khalil Mack college backstory
   - URL: https://www.sportingnews.com/us/nfl/news/khalil-mack-college-video-game-rating/1tp13tlo204d115tf2mhhlqkb2
2. **`cfb-khalil-mack--football-only-senior-year`** — Mack did not begin playing organized high-school football until late in his high-school career, with his senior season becoming the key recruiting window.
   - Why distinctive: Starting football unusually late helps explain why a future elite defender was so lightly recruited.
   - Source: Chicago Sun-Times — Before he was a Bear, Mack transformed Buffalo
   - URL: https://chicago.suntimes.com/2018/10/31/18480992/the-mack-effect-before-he-was-a-bear-olb-khalil-mack-transformed-buffalo
3. **`cfb-khalil-mack--wimberly-buffalo-connection`** — Assistant coach Robert Wimberly first recruited Mack while at Liberty and continued the relationship after joining Buffalo, helping lead Mack to the Bulls.
   - Why distinctive: One coach's move and continued belief in an overlooked player is the key human thread in Mack's unlikely college destination.
   - Source: Chicago Sun-Times — Before he was a Bear, Mack transformed Buffalo
   - URL: https://chicago.suntimes.com/2018/10/31/18480992/the-mack-effect-before-he-was-a-bear-olb-khalil-mack-transformed-buffalo
4. **`cfb-khalil-mack--number-46-video-game-motivation`** — Mack kept No. 46 at Buffalo in part because he remembered being rated only 46 overall in the NCAA football video game and used the number as motivation.
   - Why distinctive: The jersey-number origin tied to a low video-game rating is one of the most memorable identity stories in modern college football.
   - Source: Sports Illustrated — 2014 NFL Draft Top 64: Khalil Mack
   - URL: https://www.si.com/nfl/2014/04/25/2014-nfl-draft-top-64-khalil-mack
5. **`cfb-khalil-mack--competitive-multi-sport-family`** — Mack has described a highly competitive family sports environment that included basketball along with activities such as baseball, bowling and billiards.
   - Why distinctive: The broad family competition helps explain his athletic development without turning another football statistic into a concept.
   - Source: Sports Illustrated — Khalil Mack and Buffalo
   - URL: https://www.si.com/college/2013/11/19/khalil-mack-buffalo-bulls
   - Research exclusions/constraints:
     - NCAA tackle-for-loss and forced-fumble records were rejected as statistical résumé material.
     - Being lightly recruited and the Wimberly connection were kept separate only where one describes the timing of football participation and the other the specific recruiting relationship.

### Kyle Hamilton — DB — `cfb-kyle-hamilton`

1. **`cfb-kyle-hamilton--born-in-greece-father-basketball`** — Hamilton was born in Greece while his father, Derrek Hamilton, was playing professional basketball overseas.
   - Why distinctive: Being born abroad specifically because of a parent's pro basketball career is a memorable family-origin concept.
   - Source: Baltimore Ravens — Kyle Hamilton media guide bio
   - URL: https://www.ravenspr.com/player_bios/kyle_hamilton.pdf
2. **`cfb-kyle-hamilton--lived-across-europe-middle-east`** — Before settling in the Atlanta area as a young child, Hamilton's family lived in countries including Greece, Italy, Israel and Russia because of his father's basketball career.
   - Why distinctive: The unusually international early childhood distinguishes his upbringing from a typical U.S. football path.
   - Source: Baltimore Ravens — Kyle Hamilton media guide bio
   - URL: https://www.ravenspr.com/player_bios/kyle_hamilton.pdf
3. **`cfb-kyle-hamilton--brother-tyler-college-basketball`** — Hamilton's older brother Tyler played college basketball at Penn and William & Mary.
   - Why distinctive: The sibling's college basketball career extends the family's cross-sport identity beyond their father.
   - Source: Baltimore Ravens — Kyle Hamilton media guide bio
   - URL: https://www.ravenspr.com/player_bios/kyle_hamilton.pdf
4. **`cfb-kyle-hamilton--first-notre-dame-stadium-snap-pick-six`** — On Hamilton's first defensive snap in Notre Dame Stadium, he returned an interception for a touchdown against New Mexico.
   - Why distinctive: A pick-six on the first home defensive snap is an unusually clean and memorable beginning to a college identity.
   - Source: Notre Dame Athletics — Kyle Hamilton roster
   - URL: https://fightingirish.com/sports/football/roster/season/2020-21/player/kyle-hamilton
5. **`cfb-kyle-hamilton--inside-the-garage-podcast`** — At Notre Dame, Hamilton co-hosted the 'Inside the Garage' podcast with teammates and roommates.
   - Why distinctive: The teammate podcast gives him a recognizable media/personality identity tied directly to his college years.
   - Source: Baltimore Ravens — Kyle Hamilton media guide bio
   - URL: https://www.ravenspr.com/player_bios/kyle_hamilton.pdf
   - Research exclusions/constraints:
     - Draft position and generic All-America honors were not retained.
     - International childhood locations were kept as one concept rather than counted country by country.

### Kyle Pitts — TE — `cfb-kyle-pitts`

1. **`cfb-kyle-pitts--archbishop-wood-tight-end-defensive-end`** — At Archbishop Wood, Pitts played tight end and also spent time at defensive end.
   - Why distinctive: The two-way high-school role is a strong football-development concept for a player later viewed as a uniquely receiving-oriented tight end.
   - Source: Florida Athletics — Kyle Pitts signing bio
   - URL: https://nsd.floridagators.com/bio/15
2. **`cfb-kyle-pitts--state-title-two-interceptions-and-td`** — In Archbishop Wood's state championship game, Pitts recorded two interceptions on defense and a touchdown reception on offense.
   - Why distinctive: Producing turnovers and a receiving touchdown in the same title game is an unusually vivid two-way signature performance.
   - Source: Florida Athletics — Kyle Pitts signing bio
   - URL: https://nsd.floridagators.com/bio/15
3. **`cfb-kyle-pitts--track-basketball-high-school`** — Pitts competed in track and also spent time playing basketball in high school.
   - Why distinctive: The additional sports show that his movement skills developed in a broader athletic setting than football alone.
   - Source: Florida Athletics — Pitts Well-Equipped for Big Stage
   - URL: https://floridagators.com/news/2020/10/2/football-gators-tight-end-kyle-pitts-feature-story
4. **`cfb-kyle-pitts--grew-six-inches-high-school`** — Pitts's family recalled that he grew from about 6 feet as a freshman to 6-foot-6 by his senior year of high school.
   - Why distinctive: A six-inch high-school growth arc helps explain the unusual blend of guard-like movement and tight-end size that defined him.
   - Source: Florida Athletics — Pitts Well-Equipped for Big Stage
   - URL: https://floridagators.com/news/2020/10/2/football-gators-tight-end-kyle-pitts-feature-story
5. **`cfb-kyle-pitts--trask-second-team-connection`** — Pitts and quarterback Kyle Trask said their on-field chemistry began in 2018 when both worked together with Florida's second-team offense.
   - Why distinctive: The relationship shows how one of Florida's signature passing combinations was built before either became the public face of the offense.
   - Source: Florida Athletics — The Kyle Konnection: Trask and Pitts
   - URL: https://floridagators.com/news/2020/9/7/football-the-kyle-konnection-trask-and-pitts
   - Research exclusions/constraints:
     - Mackey Award, All-America honors and draft position were rejected as structural résumé facts.
     - His favorite-food item from the signing bio was not retained because stronger person-specific football and family-development material was available.

### LaDainian Tomlinson — RB — `cfb-ladainian-tomlinson`

1. **`cfb-ladainian-tomlinson--high-school-linebacker-fullback`** — Tomlinson spent much of high school playing linebacker and fullback rather than immediately being used as a featured tailback.
   - Why distinctive: The late offensive-position emergence contrasts sharply with the running-back identity he later built at TCU.
   - Source: Pro Football Hall of Fame — Gold Jacket Spotlight: LaDainian Tomlinson
   - URL: https://www.profootballhof.com/news/2025/03/gold-jacket-spotlight-ladainian-tomlinson-runs-idol%E2%80%99s-handoff-into-nfl-stardom/
2. **`cfb-ladainian-tomlinson--first-tailback-start-six-touchdowns`** — When Tomlinson finally got a high-school start at tailback as a senior, he scored six touchdowns.
   - Why distinctive: A six-touchdown first start is a dramatic turning point in the position switch that changed his football trajectory.
   - Source: Pro Football Hall of Fame — Gold Jacket Spotlight: LaDainian Tomlinson
   - URL: https://www.profootballhof.com/news/2025/03/gold-jacket-spotlight-ladainian-tomlinson-runs-idol%E2%80%99s-handoff-into-nfl-stardom/
3. **`cfb-ladainian-tomlinson--tcus-initial-fullback-plan`** — TCU initially asked Tomlinson to play fullback before moving him to tailback.
   - Why distinctive: Repeating the fullback-to-tailback transition in college is a distinctive part of his development rather than a simple recruiting fact.
   - Source: Pro Football Hall of Fame — Gold Jacket Spotlight: LaDainian Tomlinson
   - URL: https://www.profootballhof.com/news/2025/03/gold-jacket-spotlight-ladainian-tomlinson-runs-idol%E2%80%99s-handoff-into-nfl-stardom/
4. **`cfb-ladainian-tomlinson--406-yards-vs-utep`** — Tomlinson rushed for 406 yards against UTEP in 1999, at the time an NCAA single-game rushing record.
   - Why distinctive: The 406-yard game is the singular college performance most strongly associated with his TCU playing identity.
   - Source: National Football Foundation — LaDainian Tomlinson Hall of Fame profile
   - URL: https://footballfoundation.org/honors/hall-of-fame/ladainian-tomlinson/2370
5. **`cfb-ladainian-tomlinson--walter-payton-idol`** — Tomlinson has long identified Walter Payton as a childhood football idol.
   - Why distinctive: The Payton influence adds a personal football reference point to the development of his own running style and aspirations.
   - Source: Pro Football Hall of Fame — Gold Jacket Spotlight: LaDainian Tomlinson
   - URL: https://www.profootballhof.com/news/2025/03/gold-jacket-spotlight-ladainian-tomlinson-runs-idol%E2%80%99s-handoff-into-nfl-stardom/
   - Research exclusions/constraints:
     - Career rushing totals and Heisman voting were not retained as generic statistics/honors.
     - The high-school and TCU fullback phases were kept separate because the same unusual position obstacle recurred independently at two levels.

### LaMichael James — RB — `cfb-lamichael-james`

1. **`cfb-lamichael-james--raised-by-grandmother`** — James has described being raised largely by his grandmother after growing up without his father in the home.
   - Why distinctive: His grandmother's role is central to the personal upbringing story behind his route from Texas to Oregon.
   - Source: Oregon Athletics — James Hall of Fame induction feature
   - URL: https://goducks.com/news/2023/12/5/football-james-hall-of-fame-induction-becomes-official-tuesday
2. **`cfb-lamichael-james--lived-alone-senior-year`** — After his grandmother died, James lived on his own during his senior year of high school while completing the path that would take him to Oregon.
   - Why distinctive: Living independently as a high-school senior is a major formative adversity detail and a highly distinctive recruiting-era story.
   - Source: Oregon Athletics — James Hall of Fame induction feature
   - URL: https://goducks.com/news/2023/12/5/football-james-hall-of-fame-induction-becomes-official-tuesday
3. **`cfb-lamichael-james--kenjon-barner-friendship`** — Oregon teammate Kenjon Barner became one of James's close friends and an important part of his support system in Eugene.
   - Why distinctive: The named teammate relationship adds a human connection to the famous Oregon backfield era.
   - Source: Oregon Athletics — James Hall of Fame induction feature
   - URL: https://goducks.com/news/2023/12/5/football-james-hall-of-fame-induction-becomes-official-tuesday
4. **`cfb-lamichael-james--oregon-national-rise`** — James was a central figure in the Oregon teams that won three straight conference championships and reached three consecutive BCS bowls, including a national championship game.
   - Why distinctive: His identity is inseparable from the period when Oregon became a regular national-title-level program.
   - Source: Oregon Athletics — LaMichael James Hall of Fame
   - URL: https://goducks.com/honors/hall-of-fame/lamichael-james/1253
5. **`cfb-lamichael-james--returned-to-eugene-restaurants`** — After his playing career, James returned to the Eugene area and became a restaurant operator, maintaining a visible local connection to Oregon.
   - Why distinctive: The post-playing return to Eugene gives him a durable university-community identity rather than ending the story at the NFL.
   - Source: Oregon Athletics — James Hall of Fame induction feature
   - URL: https://goducks.com/news/2023/12/5/football-james-hall-of-fame-induction-becomes-official-tuesday
   - Research exclusions/constraints:
     - Heisman placement, rushing totals and All-America honors were not retained as standalone concepts.
     - The death of his grandmother was included only as context for the documented independent-living story, not as a separate concept.

### Malaki Starks — DB — `cfb-malaki-starks`

1. **`cfb-malaki-starks--high-school-two-way-star`** — At Jefferson High School, Starks was a major two-way player, producing heavily as a runner while also starring on defense.
   - Why distinctive: The offensive workload makes his pre-Georgia identity broader than a conventional safety prospect.
   - Source: Georgia Athletics — Malaki Starks roster
   - URL: https://georgiadogs.com/sports/football/roster/malaki-starks/8131
2. **`cfb-malaki-starks--state-long-jump-champion`** — Starks won a Georgia state championship in the long jump in high school.
   - Why distinctive: A state title in a field event is a clear second-sport identity marker tied to his explosiveness.
   - Source: Georgia Athletics — Malaki Starks roster
   - URL: https://georgiadogs.com/sports/football/roster/malaki-starks/8131
3. **`cfb-malaki-starks--elite-sprint-and-jump-marks`** — Starks's high-school track profile included a 10.55-second 100 meters and a long jump beyond 24 feet.
   - Why distinctive: The combination of sprint speed and elite jumping gives unusually concrete multi-event evidence of his athletic profile.
   - Source: Georgia Athletics — Malaki Starks roster
   - URL: https://georgiadogs.com/sports/football/roster/malaki-starks/8131
4. **`cfb-malaki-starks--number-one-athlete-recruit`** — Recruiting services commonly classified Starks as an 'athlete' rather than locking him into one position, and Georgia's bio notes he was rated No. 1 nationally at that designation by major services.
   - Why distinctive: The 'athlete' label fits his two-way and track background and is more identity-rich than a generic star ranking.
   - Source: Georgia Athletics — Malaki Starks roster
   - URL: https://georgiadogs.com/sports/football/roster/malaki-starks/8131
5. **`cfb-malaki-starks--jefferson-close-to-athens`** — Starks grew up in nearby Jefferson, Georgia, and has joked in a Georgia interview about being close enough to take laundry home.
   - Why distinctive: The close-to-home detail makes his Georgia connection concrete and personal rather than just an in-state recruiting fact.
   - Source: Georgia Athletics — Quick Chat: Malaki Starks
   - URL: https://georgiadogs.com/news/2023/9/19/football-quick-chat-malaki-starks
   - Research exclusions/constraints:
     - Routine All-America honors and interception totals were not retained.
     - Track results were split only between the state-title achievement and the unusually broad sprint/jump profile; duplicate meet results were rejected.

### Malcolm Jenkins — DB — `cfb-malcolm-jenkins`

1. **`cfb-malcolm-jenkins--recruited-as-wr-db`** — Ohio State signed Jenkins out of Piscataway as a two-way WR/DB prospect rather than as a one-role defensive back.
   - Why distinctive: The two-way recruiting identity is a useful origin point for a player later known almost entirely for defense.
   - Source: Ohio State Athletics — 2005 signing class
   - URL: https://ohiostatebuckeyes.com/news/2005/2/2/eighteen-student-athletes-sign-to-play-football-at-ohio-state
2. **`cfb-malcolm-jenkins--high-school-receiving-role`** — As a high-school senior, Jenkins contributed more than 300 receiving yards and seven offensive touchdowns in addition to playing defensive back.
   - Why distinctive: The real offensive production makes the WR/DB label substantive rather than a recruiting shorthand.
   - Source: Ohio State Athletics — 2005 signing class
   - URL: https://ohiostatebuckeyes.com/news/2005/2/2/eighteen-student-athletes-sign-to-play-football-at-ohio-state
3. **`cfb-malcolm-jenkins--back-to-back-state-championships`** — Jenkins helped Piscataway win state championships in both his junior and senior seasons.
   - Why distinctive: The repeat championship background is a strong local-football identity marker from New Jersey.
   - Source: Ohio State Athletics — 2005 signing class
   - URL: https://ohiostatebuckeyes.com/news/2005/2/2/eighteen-student-athletes-sign-to-play-football-at-ohio-state
4. **`cfb-malcolm-jenkins--state-400-meter-champion`** — Jenkins won a New Jersey high-school state championship in the 400 meters and also placed at state level in the 200.
   - Why distinctive: The 400-meter title shows that his speed background was independently elite, not merely football testing.
   - Source: Ohio State Athletics — 2005 signing class
   - URL: https://ohiostatebuckeyes.com/news/2005/2/2/eighteen-student-athletes-sign-to-play-football-at-ohio-state
5. **`cfb-malcolm-jenkins--ran-ohio-state-4x100`** — Jenkins continued track at Ohio State, running on a Buckeye 4x100-meter relay after spring football in 2007.
   - Why distinctive: Competing for Ohio State in a second varsity sport extends his multi-sport identity into college.
   - Source: Ohio State Athletics — Jesse Owens Classic
   - URL: https://ohiostatebuckeyes.com/news/2007/5/3/ohio-state-hosts-jesse-owens-classic
   - Research exclusions/constraints:
     - Thorpe Award and All-America honors were not retained as standalone concepts.
     - NFL championships and later humanitarian awards were not used because the college-era multi-sport material was stronger for this dataset.

### Marqise Lee — WR — `cfb-marqise-lee`

1. **`cfb-marqise-lee--deaf-parents-sign-language`** — Because both of Lee's parents were deaf, he became proficient in sign language.
   - Why distinctive: The family communication background is a highly distinctive personal fact independent of football production.
   - Source: USC Athletics — Marqise Lee track roster
   - URL: https://usctrojans.com/sports/track-and-field/roster/marqise-lee/3998
2. **`cfb-marqise-lee--football-basketball-track-star`** — At Junipero Serra, Lee excelled in football, basketball and track and was recognized for the breadth of that multi-sport performance.
   - Why distinctive: Three high-level sports are central to understanding the athletic identity he brought to USC.
   - Source: USC Athletics — Meet Marqise Lee
   - URL: https://usctrojans.com/sports/2017/6/15/blog-2011-08-meet-marqise-lee-html.aspx
3. **`cfb-marqise-lee--usc-long-jump-track`** — Lee competed for USC track and field in the long jump while also starring for the football team.
   - Why distinctive: Competing in a second sport at USC gives his multi-sport background direct college identity value.
   - Source: USC Athletics — Marqise Lee track roster
   - URL: https://usctrojans.com/sports/track-and-field/roster/marqise-lee/3998
4. **`cfb-marqise-lee--arrived-in-george-farmer-shadow`** — USC's own introduction noted that Lee arrived with less hype than Serra teammate George Farmer, who had been the more heralded recruit.
   - Why distinctive: Emerging from a teammate's recruiting shadow is a distinctive early-career narrative for someone who quickly became USC's bigger receiving star.
   - Source: USC Athletics — Meet Marqise Lee
   - URL: https://usctrojans.com/sports/2017/6/15/blog-2011-08-meet-marqise-lee-html.aspx
5. **`cfb-marqise-lee--earned-preferred-number-nine`** — Lee initially wore No. 17 at USC and later switched to his preferred No. 9 after earning the change.
   - Why distinctive: The jersey-number progression is a small but recognizable personal marker tied to his rise within the program.
   - Source: USC Athletics — Meet Marqise Lee
   - URL: https://usctrojans.com/sports/2017/6/15/blog-2011-08-meet-marqise-lee-html.aspx
   - Research exclusions/constraints:
     - Biletnikoff Award and receiving totals were rejected as résumé structure.
     - High-school defensive-back production was considered but not retained because the three-sport and recruiting-shadow concepts were more distinctive.

### Marvin Harrison Jr. — WR — `cfb-marvin-harrison-jr`

1. **`cfb-marvin-harrison-jr--father-marvin-harrison`** — Harrison is the son of Pro Football Hall of Fame wide receiver Marvin Harrison Sr.
   - Why distinctive: The same-position father-son link to an NFL Hall of Famer is a core part of Harrison Jr.'s public football identity.
   - Source: ESPN — Marvin Harrison Jr. profile
   - URL: https://www.espn.com/college-football/story/_/id/38703026/marvin-harrison-jr-ohio-state-draft-penn-state
2. **`cfb-marvin-harrison-jr--st-josephs-with-kyle-mccord`** — Harrison transferred from La Salle College High School to St. Joseph's Prep, where he formed a long-running quarterback-receiver partnership with Kyle McCord before both went to Ohio State.
   - Why distinctive: The high-school-to-college continuity with McCord is a distinctive relationship that predates their Buckeye careers.
   - Source: FOX Sports — McCord and Harrison's intertwined paths
   - URL: https://www.foxsports.com/stories/college-football/kyle-mccord-and-marvin-harrison-jrs-long-intertwined-paths-to-the-game
3. **`cfb-marvin-harrison-jr--grew-during-covid-shutdown`** — Harrison grew several inches during the COVID-era shutdown period before his final high-school season.
   - Why distinctive: The late physical growth helps explain how his frame changed from a skilled receiver prospect into the unusually large target seen at Ohio State.
   - Source: ESPN — Marvin Harrison Jr. profile
   - URL: https://www.espn.com/college-football/story/_/id/38703026/marvin-harrison-jr-ohio-state-draft-penn-state
4. **`cfb-marvin-harrison-jr--extreme-jugs-work-routine`** — Ohio State teammates and coaches repeatedly described Harrison's habit of doing extra JUGS-machine and route work at unusually early and late hours.
   - Why distinctive: The self-directed repetition became one of the strongest personality markers attached to his Buckeye identity.
   - Source: ESPN — Marvin Harrison Jr. profile
   - URL: https://www.espn.com/college-football/story/_/id/38703026/marvin-harrison-jr-ohio-state-draft-penn-state
5. **`cfb-marvin-harrison-jr--chris-olave-big-brother-mentor`** — When Harrison arrived at Ohio State, Chris Olave was assigned as his 'big brother' in the receiver room and became an early mentor.
   - Why distinctive: A named connection to the outgoing Buckeye receiver star gives Harrison's development a specific program lineage.
   - Source: PhillyVoice — Marvin Harrison Jr. at Ohio State
   - URL: https://www.phillyvoice.com/marvin-harrison-jr-wide-receiver-prospect-ohio-state-rose-bowl-st-josephs-prep-philadelphia/
   - Research exclusions/constraints:
     - Biletnikoff voting, All-America honors and receiving totals were not retained as standalone résumé concepts.
     - His father's NFL statistics were rejected; only the family relationship itself was needed.

### Micah Parsons — LB — `cfb-micah-parsons`

1. **`cfb-micah-parsons--central-dauphin-to-harrisburg`** — Parsons played at Central Dauphin before transferring to Harrisburg High School, where he finished his prep career.
   - Why distinctive: The in-city school change is a specific part of his Pennsylvania football path before Penn State.
   - Source: Penn State Athletics — Micah Parsons roster
   - URL: https://gopsusports.com/sports/football/roster/season/2018/player/micah-parsons
2. **`cfb-micah-parsons--high-school-running-back-defensive-end`** — At Harrisburg, Parsons was a two-way force who played defensive end and also carried a major rushing workload at running back.
   - Why distinctive: A future college linebacker being a genuine high-school running back is an unusually recognizable position background.
   - Source: Penn State Athletics — Micah Parsons roster
   - URL: https://gopsusports.com/sports/football/roster/season/2018/player/micah-parsons
3. **`cfb-micah-parsons--high-school-basketball`** — Parsons also played high-school basketball and was part of a district championship program.
   - Why distinctive: Basketball provides a distinct multi-sport element to his pre-Penn State athletic identity.
   - Source: Penn State Athletics — Micah Parsons roster
   - URL: https://gopsusports.com/sports/football/roster/season/2018/player/micah-parsons
4. **`cfb-micah-parsons--recruited-athlete-became-linebacker`** — Penn State signed Parsons after he had been viewed primarily as an edge/athlete prospect, then developed him as an off-ball linebacker.
   - Why distinctive: The move away from his more familiar high-school edge role is a key college-position transformation.
   - Source: Penn State Athletics — 2017 signing class
   - URL: https://gopsusports.com/news/2017/12/20/franklin-and-fb-inks-top-5-class
5. **`cfb-micah-parsons--first-penn-state-freshman-tackle-leader`** — As a true freshman, Parsons became the first freshman in Penn State history, true or redshirt, to lead the team in tackles for a season.
   - Why distinctive: Leading the defense immediately after learning a new linebacker role makes his freshman arrival unusually distinctive.
   - Source: Penn State Athletics — Brown and Parsons on Butkus Preseason Watch List
   - URL: https://gopsusports.com/news/2019/07/22/brown-and-parsons-on-butkus-preseason-watch-list
   - Research exclusions/constraints:
     - Big Ten awards and All-America selections were not retained as standalone concepts.
     - Career tackle-for-loss totals were rejected because the freshman-leadership milestone carried more identity value.

### Michael Huff — DB — `cfb-michael-huff`

1. **`cfb-michael-huff--grew-up-michigan-fan`** — Huff grew up in a family of Michigan fans and identified Charles Woodson as one of his favorite players before eventually starring for Texas.
   - Why distinctive: The childhood allegiance creates a memorable contrast with the Texas identity he later built.
   - Source: Texas Athletics — Family ties add intrigue to Rose Bowl
   - URL: https://texaslonghorns.com/news/2004/12/30/123004aaa_665
2. **`cfb-michael-huff--chose-texas-partly-for-track-weather`** — Huff said Texas's warmer weather appealed to him in part because he wanted the chance to keep running track.
   - Why distinctive: Track ambitions materially influencing a football recruiting decision is a distinctive college-choice story.
   - Source: Texas Athletics — Family ties add intrigue to Rose Bowl
   - URL: https://texaslonghorns.com/news/2004/12/30/123004aaa_665
3. **`cfb-michael-huff--track-first-love`** — Huff began competing in track at about age five and described track as his first athletic love.
   - Why distinctive: The early track identity predates football and helps explain the speed profile that followed him to Texas.
   - Source: Texas Athletics — Michael Huff Hall of Honor profile
   - URL: https://texaslonghorns.com/news/2015/9/24/FB_0924152019
4. **`cfb-michael-huff--texas-4x100-sprinter`** — Huff ran track for Texas and was part of a Longhorn 4x100-meter relay that placed second at the Big 12 meet.
   - Why distinctive: Competing for Texas in a second varsity sport gives his track background direct college relevance.
   - Source: Texas Athletics — Michael Huff Hall of Honor profile
   - URL: https://texaslonghorns.com/news/2015/9/24/FB_0924152019
5. **`cfb-michael-huff--corner-to-safety-football-iq`** — Huff arrived at Texas expecting to play cornerback, but the coaching staff moved him to safety because they valued his ability to diagnose the game.
   - Why distinctive: The position switch tied explicitly to football intelligence is a distinctive developmental concept.
   - Source: Texas Athletics — Mind over matter
   - URL: https://texaslonghorns.com/news/2005/8/30/083005aab_128
   - Research exclusions/constraints:
     - Thorpe Award and draft position were not retained as structural honors.
     - The fourth-down tackle in the national championship game was considered but omitted because five stronger person-origin concepts were already available.

### Mike Evans — WR — `cfb-mike-evans`

1. **`cfb-mike-evans--basketball-first-athlete`** — Evans focused primarily on basketball for most of high school and averaged 18.3 points, 8.4 rebounds and 5.2 assists as a senior.
   - Why distinctive: A serious basketball-first background is central to understanding why his football recruitment developed so late.
   - Source: Texas A&M Athletics — Mike Evans roster
   - URL: https://12thman.com/sports/football/roster/season/2012/player/mike-evans
2. **`cfb-mike-evans--only-one-high-school-football-season`** — Evans played only one season of high-school football, joining the team for his senior year.
   - Why distinctive: Becoming a major-college receiver after a single prep football season is one of the clearest distinctive facts in his biography.
   - Source: Texas A&M Athletics — Mike Evans roster
   - URL: https://12thman.com/sports/football/roster/season/2012/player/mike-evans
3. **`cfb-mike-evans--friends-convinced-him-to-play`** — Friends at Ball High School helped convince Evans to give football a try for his senior season.
   - Why distinctive: The peer-driven entry into football makes his late start a human story rather than merely a timeline fact.
   - Source: Texas A&M Athletics — The Rock from the Island
   - URL: https://12thman.com/news/2013/09/04/the-rock-from-the-island
4. **`cfb-mike-evans--texas-basketball-vs-am-football-choice`** — Evans has said he was weighing a basketball path, including interest from Texas, against the football opportunity at Texas A&M before choosing football.
   - Why distinctive: A real choice between major-college basketball aspirations and A&M football is a defining fork in his athletic path.
   - Source: Texas A&M Athletics — The Rock from the Island
   - URL: https://12thman.com/news/2013/09/04/the-rock-from-the-island
5. **`cfb-mike-evans--galveston-island-identity`** — Evans grew up in Galveston and played at Ball High School, a background Texas A&M profiled as part of his 'Island' identity.
   - Why distinctive: The Galveston setting is a strong geographic identifier tied directly to the story of his late football emergence.
   - Source: Texas A&M Athletics — The Rock from the Island
   - URL: https://12thman.com/news/2013/09/04/the-rock-from-the-island
   - Research exclusions/constraints:
     - Texas A&M receiving records and Johnny Manziel statistics were rejected as résumé data.
     - The basketball decision and basketball production were kept separate because one is an athletic background and the other is the actual college-choice fork.

### Morris Claiborne — DB — `cfb-morris-claiborne`

1. **`cfb-morris-claiborne--lsu-started-at-wide-receiver`** — Claiborne began his first LSU fall camp at wide receiver before moving to cornerback about a week later.
   - Why distinctive: The near-immediate college position change is a memorable origin for a player who became synonymous with LSU's defensive backfield.
   - Source: LSU Athletics — Morris Claiborne roster
   - URL: https://lsusports.net/sports/fb/roster/season/2010/player/morris-claiborne
2. **`cfb-morris-claiborne--high-school-quarterback`** — At Fair Park High School, Claiborne played quarterback as a senior and produced both passing and rushing offense.
   - Why distinctive: A future elite cornerback having a full quarterback season is a particularly distinctive position-history concept.
   - Source: LSU Athletics — Morris Claiborne roster
   - URL: https://lsusports.net/sports/fb/roster/season/2010/player/morris-claiborne
3. **`cfb-morris-claiborne--high-school-wr-db`** — Before his senior quarterback season, Claiborne also played wide receiver and defensive back in high school.
   - Why distinctive: The multiple skill-position roles help explain why LSU initially experimented with him on offense.
   - Source: LSU Athletics — Morris Claiborne roster
   - URL: https://lsusports.net/sports/fb/roster/season/2010/player/morris-claiborne
4. **`cfb-morris-claiborne--four-sport-high-school-athlete`** — Claiborne participated in basketball, baseball and track in addition to football at Fair Park.
   - Why distinctive: Competing across four sports is a broad athletic-background concept that stands apart from his cornerback résumé.
   - Source: LSU Athletics — Morris Claiborne roster
   - URL: https://lsusports.net/sports/fb/roster/season/2010/player/morris-claiborne
5. **`cfb-morris-claiborne--louisiana-100-meter-champion`** — Claiborne won a Louisiana state championship in the 100-meter dash with a 10.76-second time.
   - Why distinctive: A verified state sprint title provides a specific second-sport achievement behind his speed identity.
   - Source: LSU Athletics — Morris Claiborne roster
   - URL: https://lsusports.net/sports/fb/roster/season/2010/player/morris-claiborne
   - Research exclusions/constraints:
     - Thorpe Award and All-America recognition were not retained.
     - Draft position and Wonderlic-related coverage were rejected as pro-oriented or low-value for a fun college identity game.

### Nakobe Dean — LB — `cfb-nakobe-dean`

1. **`cfb-nakobe-dean--mechanical-engineering-major`** — Dean studied mechanical engineering at Georgia while playing linebacker.
   - Why distinctive: A demanding engineering program is a concrete academic identity marker beyond football honors.
   - Source: Georgia Athletics — Nakobe Dean roster
   - URL: https://georgiadogs.com/sports/football/roster/nakobe-dean/5425
2. **`cfb-nakobe-dean--returned-to-finish-degree`** — After turning professional, Dean returned to Georgia to continue work toward completing his mechanical engineering degree.
   - Why distinctive: Returning after leaving for the NFL demonstrates that the engineering identity was a sustained goal rather than a roster-bio label.
   - Source: Georgia Athletics — Dean Still Pursuing Mechanical Engineering Degree
   - URL: https://georgiadogs.com/news/2023/4/28/football-dean-still-pursuing-mechanical-engineering-degree
3. **`cfb-nakobe-dean--brother-nikolas-ole-miss`** — Dean's older brother Nikolas played tight end at Ole Miss.
   - Why distinctive: The sibling SEC connection gives his Mississippi-to-Georgia football path a specific family link.
   - Source: Georgia Athletics — Nakobe Dean roster
   - URL: https://georgiadogs.com/sports/football/roster/nakobe-dean/5425
4. **`cfb-nakobe-dean--high-school-running-back-linebacker`** — At Horn Lake, Dean played running back as well as linebacker and scored nine rushing touchdowns as a senior.
   - Why distinctive: The offensive role adds a two-way dimension to a player remembered almost exclusively as a linebacker.
   - Source: Georgia Athletics — Nakobe Dean roster
   - URL: https://georgiadogs.com/sports/football/roster/nakobe-dean/5425
5. **`cfb-nakobe-dean--horn-lake-first-state-title`** — Dean helped Horn Lake finish 15-0 and win the first state football championship in school history.
   - Why distinctive: Leading a school to its first title is a stronger identity marker than a generic winning high-school record.
   - Source: Georgia Athletics — Nakobe Dean roster
   - URL: https://georgiadogs.com/sports/football/roster/nakobe-dean/5425
   - Research exclusions/constraints:
     - Butkus Award and All-America honors were not retained as résumé facts.
     - Community-service honors were strong candidates but omitted because the engineering, family and high-school concepts already supplied five distinct ideas.

### Patrick Willis — LB — `cfb-patrick-willis`

1. **`cfb-patrick-willis--worked-young-to-help-family`** — Willis has described working from a very young age to help support his younger siblings in rural Tennessee.
   - Why distinctive: The early responsibility is a formative upbringing fact that helps explain the resilience central to his biography.
   - Source: Ole Miss Athletics — Patrick Willis commencement announcement
   - URL: https://olemisssports.com/news/2021/4/12/football-ole-miss-nfl-legend-patrick-willis-to-deliver-commencement-address.aspx
2. **`cfb-patrick-willis--moved-with-siblings-to-coach`** — As a teenager, Willis and three younger siblings moved in with his high-school coach's family.
   - Why distinctive: The coach-family support relationship is a major turning point in his personal path to college.
   - Source: Ole Miss Athletics — Patrick Willis commencement announcement
   - URL: https://olemisssports.com/news/2021/4/12/football-ole-miss-nfl-legend-patrick-willis-to-deliver-commencement-address.aspx
3. **`cfb-patrick-willis--small-school-light-recruitment`** — Willis came from a small Tennessee high school and was lightly recruited compared with the profile he eventually built at Ole Miss.
   - Why distinctive: The overlooked small-school route gives his rise to SEC stardom a distinctive recruiting narrative.
   - Source: Ole Miss Athletics — Patrick Willis commencement announcement
   - URL: https://olemisssports.com/news/2021/4/12/football-ole-miss-nfl-legend-patrick-willis-to-deliver-commencement-address.aspx
4. **`cfb-patrick-willis--two-way-high-school-player`** — Willis played on both sides of the ball in high school rather than being developed only as a linebacker.
   - Why distinctive: The two-way role broadens his football origin beyond the position that later defined him.
   - Source: Ole Miss Athletics — 2003 Signing Day transcript
   - URL: https://olemisssports.com/news/2003/2/5/2003_Ole_Miss_Signing_Day_Press_Conference_Transcript
5. **`cfb-patrick-willis--played-with-club-cast`** — At Ole Miss, Willis played through a hand injury using a large protective club-style cast.
   - Why distinctive: The instantly visible cast became a concrete toughness image tied to his college career.
   - Source: Ole Miss Athletics — Patrick Willis commencement announcement
   - URL: https://olemisssports.com/news/2021/4/12/football-ole-miss-nfl-legend-patrick-willis-to-deliver-commencement-address.aspx
   - Research exclusions/constraints:
     - The death of Willis's brother was not retained because the dataset did not need an additional painful family tragedy to identify him.
     - Butkus Award and tackle totals were rejected as standard résumé information.

### Paul Posluszny — LB — `cfb-paul-posluszny`

1. **`cfb-paul-posluszny--high-school-running-back-linebacker`** — Posluszny starred at Hopewell High School as both a linebacker and running back.
   - Why distinctive: A major offensive role provides a less obvious side of a player remembered almost entirely as a linebacker.
   - Source: WPIAL Hall of Fame — Paul Posluszny
   - URL: https://wpial.org/hof.aspx?hof=61
2. **`cfb-paul-posluszny--state-title-running-performance`** — In Hopewell's state championship season, Posluszny was a major rushing contributor and carried a large share of the offense in the title game.
   - Why distinctive: The championship-game offensive role is a specific high-school identity moment for a future defensive star.
   - Source: WPIAL Hall of Fame — Paul Posluszny
   - URL: https://wpial.org/hof.aspx?hof=61
3. **`cfb-paul-posluszny--finance-major-academic-all-america`** — Posluszny majored in finance, carried a strong GPA and became the Academic All-America Team Member of the Year.
   - Why distinctive: The combination of football prominence and high-level finance academics is one of the defining non-statistical parts of his Penn State identity.
   - Source: College Sports Communicators — Academic All-America announcement
   - URL: https://collegesportscommunicators.com/news/2006/11/30/GEN_1354.aspx?path=general
4. **`cfb-paul-posluszny--national-defense-and-academic-player-of-year`** — The National Football Foundation notes that Posluszny became the only defensive player to win a national defensive player-of-the-year honor and the Academic All-America Team Member of the Year in the same season.
   - Why distinctive: The rare overlap of top-tier football and academic recognition is more distinctive than listing either award alone.
   - Source: National Football Foundation — Paul Posluszny Hall of Fame profile
   - URL: https://footballfoundation.org/honors/hall-of-fame/paul-posluszny/2538
5. **`cfb-paul-posluszny--first-two-time-captain-since-1960s`** — Posluszny became Penn State's first two-time football captain since the 1968-69 seasons.
   - Why distinctive: The long gap makes his repeat captaincy a meaningful leadership marker within Penn State history.
   - Source: Penn State Athletics — Football Banquet
   - URL: https://gopsusports.com/news/2006/12/10/posluszny-named-mvp-at-nittany-lion-football-banquet
   - Research exclusions/constraints:
     - Career tackle totals and routine All-America selections were not retained.
     - The academic concepts were kept distinct because one concerns his personal course of study and academic honor, while the other is the rare same-season national football/academic combination.

### Peter Warrick — WR — `cfb-peter-warrick`

1. **`cfb-peter-warrick--returned-for-senior-season`** — Warrick returned to Florida State for his senior season despite being viewed as a likely early NFL Draft entrant.
   - Why distinctive: Staying for 1999 is pivotal because it placed him at the center of Florida State's wire-to-wire national championship season.
   - Source: Florida State Athletics — Peter Warrick Hall of Fame
   - URL: https://seminoles.com/honors/florida-state-athletics-hall-of-fame/peter-warrick/124
2. **`cfb-peter-warrick--wire-to-wire-number-one-season`** — Warrick and quarterback Chris Weinke helped Florida State become the first team to remain No. 1 in the AP poll from preseason through the final poll.
   - Why distinctive: The wire-to-wire No. 1 identity is a defining context for Warrick's final college season and Florida State legacy.
   - Source: Florida State Athletics — Peter Warrick Hall of Fame
   - URL: https://seminoles.com/honors/florida-state-athletics-hall-of-fame/peter-warrick/124
3. **`cfb-peter-warrick--sugar-bowl-three-score-performance`** — In the 2000 Sugar Bowl national championship game, Warrick scored on two receptions and a 59-yard punt return and also caught a two-point conversion.
   - Why distinctive: The multi-role title-game performance is the single most iconic game attached to his college identity.
   - Source: Sugar Bowl — Peter Warrick Hall of Fame
   - URL: https://allstatesugarbowl.org/sports/2023/11/28/peter-warrick.aspx
4. **`cfb-peter-warrick--fsu-number-nine-retired`** — Florida State retired Warrick's No. 9 jersey in 2018.
   - Why distinctive: A retired jersey is a durable school-specific identity marker that signals how permanently he is associated with the program.
   - Source: Florida State Athletics — Hall of Fame On-Campus Salute
   - URL: https://seminoles.com/news/2026/8/18/football-hall-of-fame-on-campus-salute-for-peter-warrick-set-for-october-31
5. **`cfb-peter-warrick--payton-warrick-foundation`** — Warrick later founded the Payton Warrick Foundation, named for his son, to assist children born with disabilities.
   - Why distinctive: The foundation gives him a distinctive public-service identity after football while remaining documented by a major bowl organization.
   - Source: Sugar Bowl — Three Sugar Bowl Alums Headed to College Football Hall of Fame
   - URL: https://allstatesugarbowl.org/news/2026/1/22/cfb-hall-of-fame.aspx
   - Research exclusions/constraints:
     - Receiving-yard and touchdown totals were not retained as standard statistics.
     - Legal/controversial material from his college years was deliberately excluded.

### Rolando McClain — LB — `cfb-rolando-mcclain`

1. **`cfb-rolando-mcclain--decatur-linebacker-tight-end`** — At Decatur High School, McClain played both linebacker and tight end.
   - Why distinctive: The two-way role supplies a clean pre-Alabama identity concept beyond his later linebacker awards.
   - Source: Alabama Athletics — Rolando McClain Freshman All-America
   - URL: https://rolltide.com/news/2008/1/8/Rolando_McClain_Named_Freshman_All_American
2. **`cfb-rolando-mcclain--high-school-basketball-center`** — McClain also played high-school basketball as a center.
   - Why distinctive: Basketball is a distinct multi-sport background detail for a player remembered for size and range at linebacker.
   - Source: MaxPreps — Rolando McClain basketball bio
   - URL: https://www.maxpreps.com/al/decatur/decatur-red-raiders/athletes/rolando-mcclain/bio/?careerid=a03uvbn8dor33
3. **`cfb-rolando-mcclain--true-freshman-opening-day-starter`** — McClain became Alabama's first true freshman linebacker to start a season opener since Saleem Rasheed in 1999.
   - Why distinctive: The immediate starting role is a strong college-arrival marker without relying on later awards.
   - Source: Alabama Athletics — Rolando McClain Freshman All-America
   - URL: https://rolltide.com/news/2008/1/8/Rolando_McClain_Named_Freshman_All_American
4. **`cfb-rolando-mcclain--fractured-thumb-bowl-interception`** — McClain played the Independence Bowl with a fractured thumb and intercepted Colorado on the first play of the game.
   - Why distinctive: The combination of playing through injury and making an immediate bowl-game interception is a distinctive college moment.
   - Source: Alabama Athletics — Rolando McClain Freshman All-America
   - URL: https://rolltide.com/news/2008/1/8/Rolando_McClain_Named_Freshman_All_American
5. **`cfb-rolando-mcclain--academic-excellence-award`** — Alabama recognized McClain with an Academic Excellence Award during his freshman season.
   - Why distinctive: The academic recognition adds a clean, less familiar dimension to an identity often reduced to on-field linebacker dominance.
   - Source: Alabama Athletics — Rolando McClain Freshman All-America
   - URL: https://rolltide.com/news/2008/1/8/Rolando_McClain_Named_Freshman_All_American
   - Research exclusions/constraints:
     - All arrests, criminal cases, suspensions and other controversy material were deliberately excluded.
     - Butkus Award, national-title résumé and NFL career were not retained because the assignment calls for distinctive person knowledge rather than a résumé summary.

### Roy Williams — WR — `cfb-roy-williams-wr`

1. **`cfb-roy-williams-wr--odessa-permian-product`** — Williams came to Texas from Odessa Permian, one of the most recognizable high-school football programs in Texas.
   - Why distinctive: The Permian background immediately anchors him in a distinctive West Texas football culture.
   - Source: Texas Athletics — Roy Williams Hall of Honor
   - URL: https://texaslonghorns.com/honors/hall-of-honor/roy-williams/860
2. **`cfb-roy-williams-wr--media-guide-record-goal`** — As a Permian senior, Williams studied a Texas media guide, saw the school receiving records and told his mother he wanted to own those marks before he left Austin.
   - Why distinctive: The unusually specific pre-college goal connects his recruitment directly to the records he later chased at Texas.
   - Source: Texas Athletics — Still a kid at heart
   - URL: https://texaslonghorns.com/news/2002/12/27/122702aaa_114
3. **`cfb-roy-williams-wr--older-brother-lloyd-hill`** — Williams's older brother Lloyd Hill had been a star wide receiver at Texas Tech before Roy chose Texas.
   - Why distinctive: A prominent sibling at a rival in-state program gives Roy's own Longhorn path a strong family contrast.
   - Source: Texas Athletics — Still a kid at heart
   - URL: https://texaslonghorns.com/news/2002/12/27/122702aaa_114
4. **`cfb-roy-williams-wr--chose-to-return-senior`** — Williams decided to return to Texas for his senior season despite having the option to enter the NFL Draft.
   - Why distinctive: The stay-or-go decision became an explicit part of his Longhorn story and was tied to goals he had set before college.
   - Source: Texas Athletics — Still a kid at heart
   - URL: https://texaslonghorns.com/news/2002/12/27/122702aaa_114
5. **`cfb-roy-williams-wr--returned-to-odessa-trucking`** — After his playing career, Williams returned to the Odessa area and became involved in the family trucking business.
   - Why distinctive: Returning to West Texas closes the loop on the Permian origin and gives him a lasting hometown identity beyond football.
   - Source: Texas Athletics — Roy Williams Hall of Honor
   - URL: https://texaslonghorns.com/honors/hall-of-honor/roy-williams/860
   - Research exclusions/constraints:
     - Texas receiving totals and draft position were not retained as résumé statistics.
     - Film/pop-culture associations with Odessa Permian were not used unless directly tied to Williams by a stronger primary source.

### Ryan Broyles — WR — `cfb-ryan-broyles`

1. **`cfb-ryan-broyles--norman-hometown-sooner`** — Broyles grew up in Norman and played at Norman High before staying home to play for Oklahoma.
   - Why distinctive: A hometown player becoming a major Sooners receiving identity gives him a stronger local connection than most recruits.
   - Source: Oklahoma Athletics — 2007 signing class
   - URL: https://soonersports.com/news/2007/2/7/208402679
2. **`cfb-ryan-broyles--high-school-running-back-receiver-returner`** — As a high-school senior, Broyles scored touchdowns as a running back, receiver and kick returner.
   - Why distinctive: Scoring from three different offensive/special-teams roles shows the all-purpose identity he carried into college.
   - Source: Oklahoma Athletics — 2007 signing class
   - URL: https://soonersports.com/news/2007/2/7/208402679
3. **`cfb-ryan-broyles--high-school-defensive-back-20-interceptions`** — Broyles also played defensive back and finished his high-school career with 20 interceptions.
   - Why distinctive: The large defensive role is a distinct counterpoint to his later identity as a record-setting receiver.
   - Source: Oklahoma Athletics — 2007 signing class
   - URL: https://soonersports.com/news/2007/2/7/208402679
4. **`cfb-ryan-broyles--basketball-recruit`** — Broyles was also a productive high-school basketball player who drew college basketball recruiting interest.
   - Why distinctive: Basketball adds another credible pathway that existed alongside football for the Norman athlete.
   - Source: Oklahoma Athletics — 2007 signing class
   - URL: https://soonersports.com/news/2007/2/7/208402679
5. **`cfb-ryan-broyles--returned-senior-to-finish-degree`** — Broyles chose to return to Oklahoma for his senior season, citing the team and the goal of finishing his degree among his reasons.
   - Why distinctive: The decision links football loyalty and academics in a concrete stay-or-leave moment.
   - Source: Oklahoma Athletics — Ryan Broyles to Return
   - URL: https://soonersports.com/news/2011/1/6/208390240
   - Research exclusions/constraints:
     - NCAA career reception record and Oklahoma receiving records were not retained because they are statistics already suited to structural résumé data.
     - Multiple return-game stat totals were rejected because the three-role touchdown concept captures the underlying idea.

### Sammy Watkins — WR — `cfb-sammy-watkins`

1. **`cfb-sammy-watkins--brother-jaylen-florida`** — Watkins's older brother Jaylen Watkins played defensive back at Florida while Sammy became a star at Clemson.
   - Why distinctive: Brothers at two major rival-region programs create a memorable family-college contrast.
   - Source: Clemson Athletics — Sammy Watkins roster
   - URL: https://clemsontigers.com/sports/football/roster/player/sammy-watkins
2. **`cfb-sammy-watkins--high-school-wildcat-quarterback-role`** — At South Fort Myers, Watkins took direct snaps in a Wildcat-style role and had a playoff game in which he ran for three touchdowns and threw another.
   - Why distinctive: A receiver functioning as a major rushing and passing threat in a playoff game is an unusual pre-college role.
   - Source: Clemson Athletics — Sammy Watkins roster
   - URL: https://clemsontigers.com/sports/football/roster/player/sammy-watkins
3. **`cfb-sammy-watkins--state-200-meter-champion`** — Watkins won a Florida high-school state championship in the 200 meters and also placed second in the 100 meters.
   - Why distinctive: A state sprint title gives a specific track credential behind his football speed.
   - Source: Clemson Athletics — Sammy Watkins roster
   - URL: https://clemsontigers.com/sports/football/roster/player/sammy-watkins
4. **`cfb-sammy-watkins--lee-county-receiving-records`** — Watkins finished high school holding Lee County career receiving marks for receptions, yards and touchdowns.
   - Why distinctive: County-wide records tie his rise to a specific Southwest Florida football identity rather than a generic recruiting ranking.
   - Source: Clemson Athletics — Sammy Watkins roster
   - URL: https://clemsontigers.com/sports/football/roster/player/sammy-watkins
5. **`cfb-sammy-watkins--scored-on-kicks-punts-interceptions`** — As a high-school senior, Watkins scored touchdowns on kickoff returns, punt returns and interception returns in addition to offense.
   - Why distinctive: Scoring in all three return phases shows an unusually complete playmaking profile before Clemson.
   - Source: Clemson Athletics — Sammy Watkins roster
   - URL: https://clemsontigers.com/sports/football/roster/player/sammy-watkins
   - Research exclusions/constraints:
     - Clemson receiving totals and All-America honors were rejected as structural résumé facts.
     - NFL production and draft position were not needed for the college-centered identity set.

## Release boundary

This document is audit/provenance documentation only. It is not a runtime data source and must not be imported by production code.

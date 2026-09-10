# Football person identity research audit

Reviewed: 2026-09-09

This document is the human-reviewable audit for the reusable football person identity knowledge owner in `src/features/back-room/footballPersonIdentityKnowledge.ts`. It is not a Who Am I clue bank or a second launch roster. Every record is keyed by the existing canonical football subject id, every stored item is neutral factual knowledge, and every item carries reviewed provenance through the existing `FootballFactSource` model.

The pre-existing Who Am I structured/resume fact bank remains unchanged. Structural facts and distinctive identity knowledge are separate quality dimensions.

## Coverage

| Research slice | NFL A-tier identities | Distinctive concepts |
| --- | ---: | ---: |
| PR4 pilot | 12 | 77 |
| PR5 batch 1 | 20 | 100 |
| Cumulative | 32 / 105 | 177 |

**NFL A-tier identities still without distinctive-person research after PR5: 73.**

PR4 remains unchanged and covers Patrick Mahomes, Barry Sanders, Jerry Rice, Bill Belichick, Jason Kelce, Aaron Donald, Lawrence Taylor, Ray Lewis, Deion Sanders, Walter Payton, Johnny Unitas, and Bill Walsh. Its 77 source-backed concepts remain in the canonical owner.

## PR5 batch census

| Person | Canonical role | New concepts |
| --- | --- | ---: |
| Tom Brady | QB | 5 |
| Peyton Manning | QB | 5 |
| Brett Favre | QB | 5 |
| Joe Montana | QB | 5 |
| Aaron Rodgers | QB | 5 |
| Jim Brown | RB | 5 |
| Emmitt Smith | RB | 5 |
| LaDainian Tomlinson | RB | 5 |
| Randy Moss | WR | 5 |
| Terrell Owens | WR | 5 |
| John Mackey | TE | 5 |
| Joe Thomas | OL | 5 |
| Orlando Pace | OL | 5 |
| Reggie White | DL | 5 |
| Dick Butkus | LB | 5 |
| Ed Reed | DB | 5 |
| J.J. Watt | DL | 5 |
| Vince Lombardi | Head coach | 5 |
| Don Shula | Head coach | 5 |
| Tom Landry | Head coach | 5 |

## Tom Brady — QB — 5 concepts

1. The Montreal Expos selected him as a catcher in the 18th round of the 1995 MLB Draft before he chose Michigan football.
2. He spent the 1997 national-championship season backing up Brian Griese at Michigan.
3. Even after becoming a starter, he had to keep competing for snaps with highly touted Drew Henson during his final Michigan seasons.
4. Michigan teammates elected him a captain for his final season, an honor he later described as especially meaningful.
5. New England drafted him 199th overall in 2000 and kept him as a fourth quarterback on the roster as a rookie.

Source summary: MLB.com, NFL.com, and Michigan Athletics.

Rejected / not stored: the famous combine-photo/body-composition angle was not stored because it is mostly visual shorthand and weaker reusable identity knowledge than the verified baseball, Michigan competition, and late-draft path.

## Peyton Manning — QB — 5 concepts

1. At Isidore Newman he also starred at shortstop and earned second-team all-state baseball honors.
2. As a true freshman he moved into Tennessee's quarterback job after injuries first to Jerry Colquitt and then to baseball star Todd Helton.
3. He went 7-1 in eight starts as a true freshman and was named SEC Freshman of the Year.
4. He completed his Tennessee bachelor's degree in speech communication in three years.
5. Already a top NFL prospect and a college graduate, he chose to return to Tennessee for his senior season in 1997.

Source summary: Tennessee Athletics roster and academic-history material.

Rejected / not stored: broad Manning-family lineage and generic award totals were left to existing structural/resume knowledge rather than duplicated here.

## Brett Favre — QB — 5 concepts

1. His father Irvin coached him in a wishbone offense at Hancock North Central that often asked him to throw only four or five times a game.
2. That run-heavy high-school role left him little known as a quarterback recruit before Southern Miss signed him.
3. As a Southern Miss freshman he came off the bench as the third-string quarterback against Tulane and seized the opportunity that launched his college career.
4. A serious 1990 car crash led to surgery that removed roughly 30 inches of his small intestine.
5. One month after that crash and surgery, he returned to quarterback Southern Miss in a victory over Alabama.

Source summary: Southern Miss Athletics Hall of Fame material.

Rejected / not stored: career-volume and iron-man streak facts were treated as resume/structural material rather than distinctive-person concepts for this batch.

## Joe Montana — QB — 5 concepts

1. As a young Notre Dame backup he seriously considered leaving before academic adviser Mike DeCicco convinced him to stay.
2. A shoulder injury cost him the 1976 season and left him third on Notre Dame's depth chart entering 1977.
3. Called on with Notre Dame down 24-14 at Purdue in 1977, he produced 17 points in the final 11 minutes and took control of the starting job.
4. In his final college game, the flu-stricken quarterback returned after being warmed with blankets and chicken soup and led a 34-12 comeback to beat Houston 35-34.
5. San Francisco selected him in the third round of the 1979 draft, 82nd overall.

Source summary: Notre Dame Athletics historical features and football-banquet history.

Rejected / not stored: a precise origin story for the “Joe Cool” nickname was not retained because the stronger material reviewed established the persona more clearly than a single reliable nickname-origin claim.

## Aaron Rodgers — QB — 5 concepts

1. He received no major college football recruitment out of high school and began at Butte College.
2. In his only Butte College season he earned junior-college All-America honors after throwing 28 touchdowns and four interceptions.
3. Cal discovered him while evaluating film of his Butte teammate, tight end Garrett Cross.
4. At 19, with almost no major-college experience, he immediately emerged as Cal's quarterback and set bowl passing records in the 2003 Insight Bowl.
5. After entering the 2005 draft with expectations of going near the top, he endured a long first-round wait before Green Bay selected him 24th.

Source summary: California Athletics and Green Bay Packers first-party draft material.

Rejected / not stored: draft-room promises and hindsight claims about which club “should” have selected him were omitted as speculative or evaluative rather than neutral identity facts.

## Jim Brown — RB — 5 concepts

1. In high school he was a multi-sport star who averaged roughly 38 points per game in basketball as a senior.
2. At Syracuse he lettered in football, lacrosse, basketball, and track.
3. He became a member of both the College and Pro Football Halls of Fame as well as the National Lacrosse Hall of Fame.
4. Syracuse Army ROTC commissioned him as a second lieutenant, and he served in the Army Reserve while beginning his NFL career.
5. He retired from football at age 30 while still at the top of the sport and built a substantial acting career.

Source summary: Syracuse Athletics biography, high-school Hall of Fame, Army ROTC, and alumni material.

Rejected / not stored: sensational personal-life material was excluded as unnecessary to football recognition and inappropriate for a reusable identity layer when stronger sports-path facts were available.

## Emmitt Smith — RB — 5 concepts

1. At Escambia High School he finished with 8,804 rushing yards and 106 touchdowns, among the highest prep totals of the era.
2. In only three seasons at Florida he established 58 school records.
3. Years after leaving for the NFL, he returned to Florida and completed his degree in 1996.
4. He opened the 1993 season in a contract holdout while the defending champion Cowboys started 0-2 without him.
5. In the 1993 regular-season finale against the Giants he played through a separated shoulder to help Dallas clinch the division and home-field advantage.

Source summary: Florida Athletics and Dallas Cowboys historical material.

Rejected / not stored: career rushing-record totals were not counted as distinctive concepts because they already belong in the structured/resume fact dimension.

## LaDainian Tomlinson — RB — 5 concepts

1. At a youth football camp, his idol Emmitt Smith unexpectedly handed him the ball for a rep and encouraged him, a moment Tomlinson later described as confidence-changing.
2. He played fullback and linebacker through his junior high-school season before getting his first running-back start as a senior.
3. In that first high-school start at running back, he scored six touchdowns.
4. TCU initially viewed him as a fullback before coach Dennis Franchione moved him to tailback.
5. At TCU he became the first major-college player to rush for 400 yards in a game, gaining 406 against UTEP.

Source summary: Pro Football Hall of Fame Gold Jacket Spotlight retrospective.

Rejected / not stored: 2006 award totals and touchdown-record summaries were left to resume/structural facts rather than used to inflate distinctive depth.

## Randy Moss — WR — 5 concepts

1. In high school he was named West Virginia player of the year in both football and basketball.
2. His first Marshall team went 15-0 and won the Division I-AA national championship while he caught 28 touchdown passes.
3. He joined Marshall's track team shortly before its conference meet and immediately won sprint events despite barely practicing with the team.
4. When Marshall moved to Division I-A in 1997, he remained dominant and became a Heisman finalist rather than fading against the higher level.
5. Minnesota selected him 21st in the 1998 draft, and he answered with 17 touchdown catches as a rookie.

Source summary: Marshall Athletics Hall of Fame and track retrospectives plus Pro Football Hall of Fame biography.

Rejected / not stored: broad retellings of pre-college legal/recruiting controversy were deliberately omitted; they are complex, frequently sensationalized, and not needed to make the identity recognizable.

## Terrell Owens — WR — 5 concepts

1. At Chattanooga he competed in football, men's basketball, and track and field.
2. He helped Chattanooga basketball win Southern Conference regular-season and tournament titles and reach consecutive NCAA tournaments.
3. San Francisco drafted him in the third round out of little-known Tennessee-Chattanooga in 1996.
4. He developed for most of his first eight San Francisco seasons alongside Jerry Rice.
5. When inducted into the Pro Football Hall of Fame, he chose to deliver his enshrinement speech at Chattanooga rather than attend the Canton ceremony.

Source summary: Chattanooga Athletics, Pro Football Hall of Fame, and NFL.com.

Rejected / not stored: locker-room and personality controversies were excluded as sensational and less useful than his unusual multi-sport, small-school, Rice, and Hall-of-Fame paths.

## John Mackey — TE — 5 concepts

1. He played running back for two seasons at Syracuse before moving to tight end, the position he would later help redefine in the NFL.
2. His breakaway speed helped change the tight end from primarily an extra blocker into a legitimate downfield receiving threat.
3. In 1966, six of his nine touchdown catches came on plays of at least 51 yards.
4. In Super Bowl V he caught a deflected Johnny Unitas pass and turned it into a 75-yard touchdown, then a Super Bowl record for touchdown-pass length.
5. He served as NFLPA president and later became the lead named plaintiff in Mackey v. NFL, the antitrust case that helped break the Rozelle Rule's control over player movement.

Source summary: Pro Football Hall of Fame career and memorial profiles plus the NFLPA's player-labor history.

Rejected / not stored: the later “88 Plan” named for Mackey was verified and remains strong supporting identity context, but was not counted as a sixth concept so PR5 keeps the same 20-identity / 100-concept scope.

## Joe Thomas — OL — 5 concepts

1. He played 10,363 consecutive offensive snaps, a streak the Browns describe as the longest believed in NFL history.
2. During one Cleveland career he blocked for 20 different starting quarterbacks.
3. He stayed with Cleveland for all 11 seasons even though the Browns produced only one winning season during his career.
4. He was selected to the Pro Bowl in each of his first 10 NFL seasons.
5. His durability and dominance made him a first-ballot Pro Football Hall of Famer, only the seventh offensive tackle to receive that distinction at the time.

Source summary: Cleveland Browns official Hall of Fame profile.

Rejected / not stored: the popular story about going fishing instead of attending the draft was not stored in this pass because the reviewed source set did not verify it strongly enough for canonical reuse.

## Orlando Pace — OL — 5 concepts

1. He broke into Ohio State's starting lineup on the first day of preseason camp as a freshman and started every game of his three-year college career.
2. His dominant style made the “pancake block” famous, with Ohio State crediting him with 80 such blocks in his junior season.
3. He became the first sophomore to win the Lombardi Award and then the first player to win it twice.
4. As a junior he finished fourth in Heisman voting, an exceptionally high finish for an offensive lineman.
5. He skipped his senior season and the St. Louis Rams selected him first overall in the 1997 NFL Draft.

Source summary: Ohio State Athletics historical profile.

Rejected / not stored: separate “Pancake Man” wording was not added as another concept because it is a derivative of the same pancake-block identity already represented.

## Reggie White — DL — 5 concepts

1. He was an ordained minister, a real-life identity that became inseparable from his football nickname.
2. His combination of ministry and pass-rushing dominance produced the enduring nickname “Minister of Defense.”
3. His 1993 signing with Green Bay was the signature star move at the dawn of modern unrestricted NFL free agency.
4. Green Bay's defense jumped from 23rd in the league before his arrival to No. 2 in his first Packers season.
5. The Packers retired his No. 92 after his death, recognizing the unusually large impact of only six seasons in Green Bay.

Source summary: Green Bay Packers NFL 100 and team Hall of Fame retrospectives.

Rejected / not stored: theology and personal-belief controversies were excluded as unnecessary to football recognition; the publicly documented minister identity is sufficient.

## Dick Butkus — LB — 5 concepts

1. His football path stayed close to home: Chicago high school, the University of Illinois, and then the Chicago Bears.
2. At Illinois he starred on both sides of the ball, playing center on offense and linebacker on defense.
3. He finished third in the 1964 Heisman Trophy voting as a linebacker.
4. In 1965 both the NFL's Bears and the AFL's Denver Broncos drafted him, giving him a direct choice between rival leagues.
5. The major annual award for college football's top linebacker carries his name: the Butkus Award.

Source summary: Illinois Athletics Hall of Fame and Chicago Bears historical material.

Rejected / not stored: intimidation quotations and broad “most feared ever” claims were excluded because they are subjective acclaim rather than neutral identity knowledge.

## Ed Reed — DB — 5 concepts

1. In high school he contributed at defensive back and kick returner while also seeing time at running back and quarterback.
2. He averaged about 20 points per game in basketball and was a state-level track athlete in events ranging from the javelin to relays and jumps.
3. He also competed for Miami's track and field program while building his football career.
4. Miami moved him from strong safety to free safety for his senior season.
5. Against Boston College in 2001, he took the ball from teammate Matt Walters after an interception and raced 80 yards for the clinching touchdown.

Source summary: University of Miami Athletics biography.

Rejected / not stored: generic “best safety ever” praise from coaches and opponents was excluded as evaluative rather than factual identity knowledge.

## J.J. Watt — DL — 5 concepts

1. He played organized hockey from early childhood into his teens before football became his full focus.
2. He began college on scholarship as a tight end at Central Michigan rather than as a defensive lineman.
3. After one Central Michigan season he gave up his scholarship and starting role to pursue a walk-on opportunity at Wisconsin as a defensive end.
4. Between schools he took community-college classes, delivered pizzas, and trained from about 245 to 285 pounds before arriving at Wisconsin.
5. His Wisconsin scout-team work was so strong that he earned a scholarship before playing a regular-season snap for the Badgers.

Source summary: Wisconsin Athletics long-form journey feature and Hall of Fame profile.

Rejected / not stored: generalized “hardest worker” language was excluded; the concrete transfer, pizza-delivery, weight-gain, walk-on, and scholarship sequence carries the same identity value without subjective labeling.

## Vince Lombardi — Head coach — 5 concepts

1. At Fordham he played guard on the celebrated “Seven Blocks of Granite” line.
2. After Fordham he briefly enrolled in law school before moving into teaching and coaching.
3. At St. Cecilia High School he taught physics, chemistry, and Latin while coaching football and basketball.
4. His path to Green Bay ran through assistant jobs at Fordham, Army under Red Blaik, and the New York Giants.
5. After retiring following the 1967 season, he returned to coaching with Washington rather than ending his career in Green Bay.

Source summary: Fordham Athletics Hall of Fame and the official Green Bay Packers media guide.

Rejected / not stored: broad motivational quotations were excluded because they are often detached from reliable original context and are weaker identity facts than his unusual teaching and coaching path.

## Don Shula — Head coach — 5 concepts

1. He forged his parents' signatures so he could play high-school football after they initially forbade it.
2. After college he spent a year coaching high-school football before the Cleveland Browns drafted him as a player.
3. Before becoming a famous coach, he played seven NFL seasons as a defensive back for Cleveland, Baltimore, and Washington.
4. Baltimore made him an NFL head coach at age 33, then the youngest head coach in league history.
5. His head-coaching legacy began with seven winning seasons in Baltimore before the move to Miami that defined the rest of his career.

Source summary: Pro Football Hall of Fame memorial biography.

Rejected / not stored: restaurant-brand and rivalry-trophy material was judged less useful to recognizing the football person than his unusual player-to-coach path.

## Tom Landry — Head coach — 5 concepts

1. Before coaching, he played professionally as a defensive back, punter, and kick returner.
2. The Giants made him a player-coach in 1954 and 1955 before he became a full-time defensive coach.
3. He introduced the flex defense, one of the schematic ideas most closely associated with his coaching identity.
4. He later revived the shotgun and helped popularize situational substitutions, continuing to change how teams organized offense and personnel.
5. His fedora became a trademark part of his sideline image during 29 seasons as the Cowboys' original head coach.

Source summary: Pro Football Hall of Fame and Dallas Cowboys Ring of Honor material.

Rejected / not stored: the overly absolute claim that Landry single-handedly “invented the 4-3 defense” was not stored; the reviewed sources support a more nuanced innovation history and directly support the flex, shotgun, and substitution concepts retained here.

## PR5 quality summary

- Identities added: **20**.
- Distinctive concepts added: **100**.
- Cumulative NFL A-tier research coverage: **32 / 105 identities (30.5%)**.
- Cumulative distinctive concepts: **177**.
- NFL A-tier identities still remaining: **73**.
- PR5 intentionally stopped at 20 instead of padding toward 30. This is the largest coherent batch completed at the same source and human-review standard in this slice.

## Architecture result

The PR4 model handled the larger batch cleanly. The existing open `tags` metadata, one `conceptId` per underlying idea, neutral fact `value`, canonical `subjectId`, and reusable `FootballFactSource` provenance were sufficient for multi-sport backgrounds, position changes, family/mentor relationships, draft paths, injuries, education, community/off-field identity, coaching innovations, iconic moments, and visual identity.

No recurring research dimension required a schema change. In particular, relationships did not need a new rigid field: source-backed neutral statements plus open tags represented them without turning the model into a checklist.

The module still does not import Who Am I, define launch membership, define recognizability tiers, generate clue prose, fetch the web at runtime, or ask an LLM to judge truth. Who Am I can consume this knowledge in a later PR, and the same owner can support other Games without duplicating the research.

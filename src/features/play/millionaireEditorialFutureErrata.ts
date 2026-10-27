/** Future-only semantic dedup candidates. Each remains HOLD pending full signoff.
 * The key is league:zeroBasedLegacyRunIndex:zeroBasedQuestionIndex.
 * All mapped slots retain original bank/history for dates before cutover.
 */
export type MillionaireFutureRewriteSeed = {
  id: string;
  type: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: string;
  statSheet: string | null;
  explanation: string;
  /** Primary-source discovery; not a substitute for distractor/fact review. */
  evidence: readonly { authority: string; url: string; supportingDetail: string }[];
};
export const MILLIONAIRE_FUTURE_TARGETED_REWRITES: Record<string, MillionaireFutureRewriteSeed> = {
  // The 2016 SEASON championship was won in January 2017, not at the January 2016 game.
  "cfb:0:2": {
    id: "millionaire-cfb-future-clemson-2016-season-title-q3",
    type: "championship-season",
    prompt: "Who did Clemson beat for the 2016 SEASON's CFP championship in January 2017?",
    choices: ["Alabama", "Ohio State", "Oklahoma", "Florida State"],
    answer: "Alabama",
    statSheet: "Deshaun Watson threw the winning touchdown with one second remaining in the title game.",
    explanation: "Clemson beat Alabama 35–31 on January 9, 2017, to win the 2016 season's championship; Alabama, by contrast, won the title game played in January 2016.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2021/9/7/ncg-recap-2017", supportingDetail: "Official 2017 championship recap: Clemson 35, Alabama 31, January 9, 2017; Watson threw the game winner with a second left." }],
  },
  // Avoid the active Bar Trivia inverse fact about Tua-to-Smith by using a distinct modern Cotton Bowl upset.
  "cfb:4:2": {
    id: "millionaire-cfb-future-tulane-cotton-bowl-usc-2023-q3",
    type: "modern-bowl-upsets",
    prompt: "Which team rallied from 15 points down in the fourth quarter to upset Caleb Williams and USC 46–45 in the January 2023 Cotton Bowl?",
    choices: ["Tulane", "UCF", "Houston", "Cincinnati"],
    answer: "Tulane",
    statSheet: "The winner recovered from a late 45–30 deficit to score 16 unanswered points, with the decisive touchdown coming in the final seconds.",
    explanation: "Tulane scored 16 unanswered points in the fourth quarter of the January 2, 2023 Cotton Bowl, capped by Michael Pratt's touchdown pass to Alex Bauman with nine seconds left, to stun USC 46–45.",
    evidence: [{ authority: "Tulane Athletics", url: "https://tulanegreenwave.com/news/2023/1/2/football-tulane-wins-the-cotton-bowl", supportingDetail: "Official Tulane recap and scoring log confirm the 45–30 fourth-quarter deficit, 16 unanswered points, 46–45 final, and Bauman's touchdown with nine seconds left." }],
  },
  // The Tide's LSU shutout was for the 2011 season, played January 2012.
  "cfb:6:1": {
    id: "millionaire-cfb-future-alabama-lsu-2011-season-title-q2",
    type: "championship-season",
    prompt: "Which team did Alabama shut out 21–0 for the 2011 season's BCS title in January 2012?",
    choices: ["LSU", "Oklahoma State", "Oregon", "Stanford"],
    answer: "LSU",
    statSheet: "The championship was a rematch of a 9–6 overtime regular-season meeting.",
    explanation: "Alabama defeated LSU 21–0 on January 9, 2012, for the 2011 season's BCS national championship, avenging its November 2011 overtime loss.",
    evidence: [{ authority: "Alabama Athletics", url: "https://rolltide.com/news/2012/1/9/Crimson_Tide_Wins_14th_National_Championship_21_0_Over_LSU", supportingDetail: "Official title-game account confirms Alabama's 21–0 victory over LSU on January 9, 2012." }],
  },
  // Avoid inverse of active Bar Trivia's 2001 Miami/Ken Dorsey identity fact.
  "cfb:5:2": {
    id: "millionaire-cfb-future-tcu-sonny-dykes-cfp-q3",
    type: "cfp-breakthrough",
    prompt: "Which school reached the 2022 season's CFP national-title game in Sonny Dykes' first year as head coach?",
    choices: ["TCU", "Baylor", "Oklahoma State", "Texas Tech"],
    answer: "TCU",
    statSheet: "The unranked preseason Big 12 team upset Michigan 51–45 in its semifinal.",
    explanation: "Sonny Dykes guided previously unranked TCU to a 13–2 campaign in his first season as head coach in 2022. The Horned Frogs beat Michigan 51–45 in the Fiesta Bowl semifinal and became the first Big 12 program to play in the College Football Playoff national-title game.",
    evidence: [{ authority: "TCU Athletics", url: "https://gofrogs.com/news/2023/1/11/football-dykes-named-afca-national-coach-of-the-year", supportingDetail: "TCU confirms Dykes took the Horned Frogs to their first CFP title game in his first season." }],
  },

  // Future-only repairs of verified selectable CFB Bar Trivia collisions.
  "cfb:7:6": {
    id: "millionaire-cfb-future-mason-taylor-bama-2022-q7",
    type: "classic-overtime",
    prompt: "Which LSU tight end caught Jayden Daniels' winning two-point pass to upset Alabama in overtime in 2022?",
    choices: ["Mason Taylor", "Malik Nabers", "Brian Thomas Jr.", "Jack Bech"],
    answer: "Mason Taylor",
    statSheet: "The Tigers opted to go for two after matching Alabama's overtime touchdown in Baton Rouge.",
    explanation: "LSU freshman tight end Mason Taylor caught Jayden Daniels' three-yard two-point pass just inside the front-right pylon in overtime against Alabama on November 5, 2022. Brian Kelly went for two after Daniels' 25-yard overtime touchdown, giving LSU a 32–31 win.",
    evidence: [{ authority: "Official school athletics", url: "https://lsusports.net/news/2022/11/5/lsu-tops-alabama-gutsy-ot-conversion-32-31", supportingDetail: "LSU's official 32–31 recap confirms Daniels' two-point pass to Mason Taylor." }],
  },
  "cfb:8:5": {
    id: "millionaire-cfb-future-chase-mcgrath-bama-2022-q6",
    type: "rivalry-clinchers",
    prompt: "Which Tennessee kicker hit the walk-off 40-yard field goal to beat Alabama 52–49 in October 2022?",
    choices: ["Chase McGrath", "Will Reichard", "Jack Podlesny", "Harrison Mevis"],
    answer: "Chase McGrath",
    statSheet: "The Vols ended a 15-game losing streak in the rivalry during the 2022 season.",
    explanation: "Chase McGrath made a 40-yard field goal as time expired at Neyland Stadium on October 15, 2022, giving Tennessee a 52–49 win over Alabama.",
    evidence: [{ authority: "Official school athletics", url: "https://utsports.com/news/2022/10/15/football-no-6-vols-take-down-3-tide-as-time-expires-52-49", supportingDetail: "University of Tennessee official recap confirms Chase McGrath's walk-off 40-yarder." }],
  },
  "cfb:8:6": {
    id: "millionaire-cfb-future-bud-clark-tcu-2022-q7",
    type: "cfp-defensive-moments",
    prompt: "Which TCU defender returned J.J. McCarthy's interception 41 yards for the game's first touchdown against Michigan in the 2022 CFP Fiesta Bowl?",
    choices: ["Bud Clark", "Dee Winters", "Tre'Vius Hodges-Tomlinson", "Mark Perry"],
    answer: "Bud Clark",
    statSheet: "The early pick-six set the tone for the Horned Frogs' 51–45 semifinal upset.",
    explanation: "TCU defensive back Bud Clark returned J.J. McCarthy's interception 41 yards for the first touchdown of the December 31, 2022 Fiesta Bowl against Michigan. Dee Winters later added a separate pick-six as the Horned Frogs prevailed 51–45 to reach the CFP final.",
    evidence: [{ authority: "Official school athletics", url: "https://gofrogs.com/news/2022/12/31/football-tcu-beats-michigan-advances-to-the-cfp-national-championship", supportingDetail: "TCU Athletics separately verifies Clark's 41-yard opening pick-six and Winters' later return; both are answer choices but only Clark satisfies the question." }],
  },
  "cfb:9:3": {
    id: "millionaire-cfb-future-vandy-bama-first-no1-q4",
    type: "signature-upsets",
    prompt: "Which SEC school recorded its first win over an AP No. 1 team by beating Alabama 40–35 in October 2024?",
    choices: ["Vanderbilt", "Tennessee", "Auburn", "Mississippi State"],
    answer: "Vanderbilt",
    statSheet: "Quarterback Diego Pavia led the upset in Nashville.",
    explanation: "Vanderbilt defeated No. 1 Alabama 40–35 in Nashville on October 5, 2024. It was the school's first victory over an AP top-ranked opponent after ten earlier losses to No. 1 teams. Quarterback Diego Pavia accounted for 308 total yards in the upset for coach Clark Lea.",
    evidence: [{ authority: "Official school athletics", url: "https://vucommodores.com/news/2024/10/05/this-magic-moment", supportingDetail: "Vanderbilt's official recap records the 40–35 score and the school's first No. 1-ranked victory." }],
  },

  // Future-only corrections to exact selectable Bar Trivia fact collisions.
  // The published legacy Millionaire boards remain immutable.
  "nfl:3:4": {
    id: "millionaire-nfl-future-malik-jackson-super-bowl-50-q5",
    type: "super-bowl-defensive-touchdowns",
    prompt: "Which Broncos defender recovered Von Miller's strip-sack of Cam Newton in the end zone for a touchdown in Super Bowl 50?",
    choices: ["Malik Jackson", "DeMarcus Ware", "Derek Wolfe", "Sylvester Williams"],
    answer: "Malik Jackson",
    statSheet: "The first-quarter scoop-and-score gave Denver a 10–0 lead over Carolina.",
    explanation: "Malik Jackson recovered the fumble in Carolina's end zone after Von Miller stripped Cam Newton in the first quarter of Super Bowl 50. The touchdown gave Denver a 10–0 lead on its way to a 24–10 championship victory.",
    evidence: [{ authority: "NFL official Super Bowl 50 analysis", url: "https://www.nfl.com/news/von-miller-broncos-defense-dominates-panthers-0ap3000000634501", supportingDetail: "NFL recaps Miller's strip, Malik Jackson's recovery touchdown and Denver's 10–0 lead." }],
  },
  "nfl:4:5": {
    id: "millionaire-nfl-future-geno-smith-comeback-2022-q6",
    type: "modern-comeback-awards",
    prompt: "Which quarterback won AP NFL Comeback Player of the Year for 2022 after leading Seattle to the playoffs?",
    choices: ["Geno Smith", "Jared Goff", "Baker Mayfield", "Marcus Mariota"],
    answer: "Geno Smith",
    statSheet: "The winner threw for a career-high 4,282 yards in his first full season as a starter since 2014.",
    explanation: "Geno Smith won the AP 2022 NFL Comeback Player of the Year award after replacing Russell Wilson as Seattle's starting quarterback and throwing 30 touchdown passes.",
    evidence: [{ authority: "NFL Honors", url: "https://www.nfl.com/news/seahawks-qb-geno-smith-earns-ap-nfl-comeback-player-of-the-year-honors", supportingDetail: "NFL's award announcement confirms Smith won the 2022 Comeback Player of the Year honor after 4,282 yards and 30 touchdowns." }],
  },

  // Preview-only rewrite of a verbatim active Bar Trivia "Notorious" nickname.
  // Future-only replacement: legacy UFC run 6 Q6 Stat Sheet named Jessica Andrade,
  // and active Bar Trivia V3 tests the identical UFC 237 Namajunas title-changing slam.
  // Future-only distinct fact: active Bar Trivia ufc-r3-first-flyweight already tests Demetrious Johnson first UFC flyweight title.
  // Future-only distinct fact: active Bar Trivia ufc-bt-v3-m-002 already tests Jon Jones defeated Mauricio Rua UFC128.
  // Future-only distinct fact: active Bar Trivia ufc-bt-v3-h-016 already tests Justin Gaethje interim title UFC249 over Tony Ferguson.
  // Future-only distinct fact: active Bar Trivia ufc-bt-v3-m-006 already tests Conor McGregor debut win versus Marcus Brimage.
  "ufc:5:1": {
    id: "millionaire-ufc-future-edwards-usman-ufc286-q2",
    type: "welterweight-trilogy-title-defenses",
    prompt: "Who retained the welterweight championship by majority decision over Kamaru Usman at UFC 286?",
    choices: ["Leon Edwards","Colby Covington","Belal Muhammad","Jorge Masvidal"],
    answer: "Leon Edwards",
    statSheet: "The March 2023 London rematch concluded with scorecards of 48–46, 48–46 and 47–47.",
    explanation: "Leon Edwards defended the welterweight title against Kamaru Usman in their third meeting at UFC 286 on March 18, 2023, winning a majority decision by scores of 48–46, 48–46 and 47–47 at London's O2 Arena.",
    evidence: [{"authority":"UFC 286 official results and scorecards","url":"https://www.ufc.com/news/results-ufc-286-edwards-vs-usman-3-results-highlights-winner-interview-o2-arena","supportingDetail":"Official UFC 286 summary confirms Leon Edwards retained title over Kamaru Usman by majority decision (48-46,48-46,47-47)."}],
  },

  "ufc:4:6": {
    id: "millionaire-ufc-future-yan-aldo-ufc251-q7",
    type: "bantamweight-vacant-title-finishes",
    prompt: "Who stopped José Aldo in Round 5 at UFC 251 to win the vacant bantamweight championship?",
    choices: ["Petr Yan","Aljamain Sterling","Marlon Moraes","Cory Sandhagen"],
    answer: "Petr Yan",
    statSheet: "The championship bout was fought on Fight Island and ended at 3:24 of the final round.",
    explanation: "Petr Yan defeated José Aldo by strikes at 3:24 of Round 5 at UFC 251 in July 2020 on Yas Island, Abu Dhabi, winning the vacant bantamweight title left open by Henry Cejudo's retirement.",
    evidence: [{"authority":"UFC 251 official full results","url":"https://www.ufc.com/news/ufc-251-results-usman-masvidal-yan-aldo-holloway-volkanovski-fight-island","supportingDetail":"Official UFC 251 result confirms Petr Yan stopped José Aldo at 3:24 of Round 5 for vacant bantamweight title."}],
  },

  "ufc:2:2": {
    id: "millionaire-ufc-future-griffin-jackson-ufc86-q3",
    type: "light-heavyweight-title-upsets",
    prompt: "Who defeated Quinton 'Rampage' Jackson by unanimous decision to win the light heavyweight title at UFC 86?",
    choices: ["Forrest Griffin","Rashad Evans","Lyoto Machida","Dan Henderson"],
    answer: "Forrest Griffin",
    statSheet: "The July 2008 title fight lasted all five rounds in Las Vegas.",
    explanation: "Forrest Griffin beat champion Quinton 'Rampage' Jackson by unanimous decision over five rounds at UFC 86 on July 5, 2008, becoming the UFC light heavyweight champion after his breakout on The Ultimate Fighter.",
    evidence: [{"authority":"UFC official light heavyweight title lineage","url":"https://www.ufc.com/news/ufc-light-heavyweight-title-lineage-jones-cormier-blachowicz-teixeira-prochazka","supportingDetail":"UFC title lineage lists Forrest Griffin defeating Quinton Jackson by unanimous decision at UFC 86 on July 5, 2008."}],
  },

  "ufc:1:2": {
    id: "millionaire-ufc-future-evans-liddell-ufc88-q3",
    type: "light-heavyweight-highlight-finishes",
    prompt: "Which light heavyweight knocked out Chuck Liddell with a right hand in the UFC 88 main event?",
    choices: ["Rashad Evans","Quinton Jackson","Keith Jardine","Tito Ortiz"],
    answer: "Rashad Evans",
    statSheet: "The September 2008 Atlanta main event ended at 1:51 of Round 2.",
    explanation: "Rashad Evans knocked out former champion Chuck Liddell with a right hand at 1:51 of Round 2 at UFC 88 in Atlanta on September 6, 2008. The victory extended Evans' unbeaten run and launched him toward the light heavyweight championship.",
    evidence: [{"authority":"UFC official UFC 88 recap","url":"https://www.ufc.com/news/evans-fires-perfect-game-knocks-liddell-out-ufc-88-main-event-0","supportingDetail":"Official UFC report confirms Evans KO'd Liddell at 1:51 of Round 2 at UFC 88, September 6 2008."}],
  },

  "ufc:5:5": {
    id: "millionaire-ufc-future-blanchfield-andrade-2023-q6",
    type: "flyweight-main-events",
    prompt: "Who submitted former strawweight champion Jéssica Andrade in the second round of their February 2023 UFC Vegas main event?",
    choices: ["Erin Blanchfield","Manon Fiorot","Alexa Grasso","Maycee Barber"],
    answer: "Erin Blanchfield",
    statSheet: "The bout ended by rear-naked choke at the UFC APEX in Las Vegas.",
    explanation: "Erin Blanchfield submitted former UFC strawweight champion Jéssica Andrade with a rear-naked choke at 1:37 of Round 2 in their February 18, 2023 UFC APEX main event in Las Vegas. The win improved Blanchfield's UFC record to 5–0 and established her as a flyweight title contender.",
    evidence: [{"authority":"UFC Andrade vs Blanchfield official result","url":"https://www.ufc.com/news/ufc-fight-night-andrade-vs-blanchfield-results-highlights-winner-interviews","supportingDetail":"UFC official event results confirm Blanchfield defeated former strawweight champion Andrade by rear-naked choke at 1:37 of round two on February 18, 2023."}],
  },

  "ufc:1:0": {
    id: "millionaire-ufc-future-218-ngannou-overeem-q1",
    type: "heavyweight-knockouts",
    prompt: "Who knocked out Alistair Overeem with a spectacular first-round uppercut at UFC 218?",
    choices: ["Francis Ngannou","Stipe Miocic","Curtis Blaydes","Derrick Lewis"],
    answer: "Francis Ngannou",
    statSheet: "The December 2017 Detroit finish earned the winner a shot at the heavyweight belt.",
    explanation: "Francis Ngannou knocked out Alistair Overeem with a crushing left uppercut in Round 1 of UFC 218 in Detroit on December 2, 2017. The stoppage extended Ngannou's UFC finishing streak and earned him a heavyweight title shot against Stipe Miocic.",
    evidence: [{"authority":"UFC 218 official final results","url":"https://www.ufc.com/news/ufc-218-holloway-vs-aldo-2-final-results","supportingDetail":"UFC confirms Ngannou's left-uppercut first-round KO against Alistair Overeem at UFC 218 in Detroit."}],
  },

  // The 2020 Notre Dame CFP answer was literally named in the legacy Stat Sheet.
  // Preserve published proofs; fix only the future candidate's identity clue.
  "cfb:7:5": {
    id: "millionaire-cfb-future-2020-acc-title-game-q6",
    type: "playoff-history",
    prompt: "Which team became the first CFP participant to make the field after losing its conference championship game?",
    choices: ["Notre Dame 2020", "Georgia 2021", "TCU 2022", "Wisconsin 2017"],
    answer: "Notre Dame 2020",
    statSheet: "The team fell to Clemson in the December 2020 ACC title game, but still made the four-team playoff as the No. 4 seed.",
    explanation: "Notre Dame lost the December 2020 ACC title game to Clemson 34–10 but still earned the No. 4 seed in the four-team College Football Playoff. It was the first playoff berth after a conference-title-game loss; Georgia 2021 and TCU 2022 also qualified following losses, but in later seasons.",
    evidence: [
      { authority: "College Football Playoff", url: "https://collegefootballplayoff.com/news/2020/12/20/cfp-rankings-122020", supportingDetail: "The selection committee ranked Notre Dame fourth after the 2020 conference championship weekend." },
      { authority: "Atlantic Coast Conference", url: "https://theacc.com/news/2020/12/19/football-clemson-rolls-notre-dame-34-10-for-6th-straight-acc-championship.aspx", supportingDetail: "Notre Dame lost 34–10 to Clemson in the 2020 ACC championship." },
    ],
  },

  // Published source/history stays immutable. Future preview clarifies season
  // instead of conflating the season year with the January championship date.
  "cfb:1:0": {
    id: "millionaire-cfb-future-2005-season-texas-q1",
    type: "championship-season",
    prompt: "Which school won the 2005 season's national title in the January 2006 Rose Bowl?",
    choices: ["Texas", "USC", "Penn State", "Ohio State"], answer: "Texas",
    statSheet: "The game ended 41–38 after a famous fourth-down touchdown run.",
    explanation: "Texas defeated USC 41–38 in the January 4, 2006 Rose Bowl for the 2005-season national championship. Quarterback Vince Young scored on an eight-yard fourth-and-five run with 19 seconds remaining and added the decisive two-point conversion.",
    evidence: [{ authority: "Texas Athletics", url: "https://texaslonghorns.com/sports/2013/7/21/FB_0721132407", supportingDetail: "The school documents Texas defeating USC in the January 4, 2006 Rose Bowl national-title game." }],
  },
  "cfb:2:0": {
    id: "millionaire-cfb-future-2023-season-michigan-q1",
    type: "championship-season",
    prompt: "Which team won the 2023 season's CFP national title in January 2024?",
    choices: ["Michigan", "Washington", "Alabama", "Texas"], answer: "Michigan",
    statSheet: "The undefeated winner beat Washington 34–13 in Houston.",
    explanation: "Michigan finished the 2023 season 15–0 and defeated Washington 34–13 in Houston on January 8, 2024 to win its first College Football Playoff national championship. Blake Corum earned the title game's offensive player of the game honor.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2024/1/31/ncg-recap-2024", supportingDetail: "The CFP confirms Michigan's 34–13 win over Washington in the January 2024 final." }],
  },
  "cfb:5:0": {
    id: "millionaire-cfb-future-2020-season-alabama-q1",
    type: "championship-season",
    prompt: "Which school won the 2020 season's CFP national title in January 2021?",
    choices: ["Alabama", "Ohio State", "Clemson", "LSU"], answer: "Alabama",
    statSheet: "The champion beat Ohio State 52–24 in Miami Gardens.",
    explanation: "Alabama beat Ohio State 52–24 at Hard Rock Stadium in Miami Gardens on January 11, 2021 to win the 2020-season national championship. Heisman winner DeVonta Smith caught 12 passes for 215 yards and three touchdowns in the title game.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2025/3/20/cfp-recap-2021", supportingDetail: "The CFP records Alabama beating Ohio State 52–24 in the 2020–21 postseason." }],
  },
  "cfb:7:0": {
    id: "millionaire-cfb-future-2019-season-lsu-q1",
    type: "championship-season",
    prompt: "Which school won the 2019 season's CFP national title in January 2020?",
    choices: ["LSU", "Clemson", "Alabama", "Ohio State"], answer: "LSU",
    statSheet: "The 15–0 champion defeated Clemson 42–25 in New Orleans.",
    explanation: "LSU finished the 2019 season 15–0 and defeated Clemson 42–25 in the January 13, 2020 CFP title game. Heisman Trophy winner Joe Burrow threw for 463 yards and five touchdowns, giving the Tigers their first CFP-era championship.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2026/8/10/ncg-history", supportingDetail: "The CFP's title history lists LSU's 42–25 January 2020 championship win." }],
  },
  "ufc:0:6": {
    id: "millionaire-ufc-future-maurice-smith-coleman-ufc14-q7",
    type: "heavyweight-history",
    prompt: "Who defeated Mark Coleman by decision at UFC 14 to become UFC heavyweight champion?",
    choices: ["Maurice Smith", "Bas Rutten", "Randy Couture", "Don Frye"], answer: "Maurice Smith",
    statSheet: "A former kickboxer survived the wrestler's early pressure to win in 1997.",
    explanation: "Maurice Smith, a decorated kickboxer, defeated wrestler Mark Coleman by unanimous decision at UFC 14 in Birmingham, Alabama on July 27, 1997. The upset earned Smith the UFC heavyweight championship.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/news/15-ufc-heavyweight-champions", supportingDetail: "The UFC heavyweight lineage identifies Smith's UFC 14 victory over Coleman." }],
  },
  "nfl:9:0": {
    id: "millionaire-nfl-2026-editorial-brees-first-team-q1",
    type: "career-history",
    prompt: "Which NFL team did Drew Brees play for before he joined the New Orleans Saints?",
    choices: ["Chargers", "Dolphins", "Colts", "Broncos"], answer: "Chargers",
    statSheet: "The 2001 second-round pick earned his first Pro Bowl selection and an NFL Comeback Player of the Year award for 2004.",
    explanation: "Drew Brees was selected 32nd overall by San Diego in 2001 and played five seasons (2001–2005) with the Chargers, earning a Pro Bowl selection in 2004. He joined New Orleans in 2006 and later led the Saints to a Super Bowl XLIV title.",
    evidence: [{ authority: "Chargers official Drew Brees retrospective", url: "https://www.chargers.com/news/drew-brees-chargers-days", supportingDetail: "The Chargers selected Brees in the second round in 2001, kept him for five seasons and awarded his 2004 breakout first Pro Bowl and Comeback Player of the Year honors." }],
  },
  "nfl:4:1": {
    id: "millionaire-nfl-future-stafford-rams-sb-lvi-q2",
    type: "super-bowl-quarterbacks",
    prompt: "Which quarterback led the Los Angeles Rams to victory in Super Bowl LVI?",
    choices: ["Matthew Stafford", "Jared Goff", "Joe Burrow", "Jimmy Garoppolo"], answer: "Matthew Stafford",
    statSheet: "The winning team took the lead for good on a late touchdown pass to Cooper Kupp.",
    explanation: "Matthew Stafford quarterbacked the Rams' 23–20 victory over Cincinnati in Super Bowl LVI following the 2021 season.",
    evidence: [{ authority: "Los Angeles Rams", url: "https://www.therams.com/news/super-bowl-lvi-game-recap-vs-bengals-matthew-stafford-cooper-kupp-aaron-donald", supportingDetail: "The team's official recap identifies Stafford as its quarterback and the game-winning touchdown passer against Cincinnati." }],
  },
  "nfl:7:5": {
    id: "millionaire-nfl-2009-woodson-dpoy-q6",
    type: "defensive-awards",
    prompt: "Which Green Bay Packers cornerback won AP NFL Defensive Player of the Year in 2009?",
    choices: ["Charles Woodson", "Darrelle Revis", "Troy Polamalu", "Ed Reed"], answer: "Charles Woodson",
    statSheet: "The defender tied for the league lead with nine interceptions that season.",
    explanation: "Charles Woodson won the AP's 2009 Defensive Player of the Year award while playing for Green Bay.",
    evidence: [{ authority: "NFL", url: "https://www.nfl.com/news/packers-cb-woodson-voted-defensive-player-of-the-year-09000d5d815ade86", supportingDetail: "NFL reporting lists Woodson's 2009 AP DPOY selection and nine interceptions." }],
  },
  "cfb:1:4": {
    id: "millionaire-cfb-1984-byu-coach-q5",
    type: "coaching-history",
    prompt: "Who coached BYU to its undefeated 1984 national championship season?",
    choices: ["LaVell Edwards", "Don James", "Barry Switzer", "Dennis Erickson"], answer: "LaVell Edwards",
    statSheet: "The independent program finished 13-0 with a victory over Michigan in the Holiday Bowl.",
    explanation: "LaVell Edwards coached BYU to a perfect 13–0 record and the 1984 national championship. Behind quarterback Robbie Bosco, the Cougars beat Michigan 24–17 in the Holiday Bowl to finish No. 1 in the national polls.",
    evidence: [{ authority: "BYU Athletics", url: "https://byucougars.com/staff/1984-national-champions", supportingDetail: "The school lists Edwards as 1984 coach and reports a 13-0 national-title season." }],
  },
  "cfb:2:3": {
    id: "millionaire-cfb-leach-before-miss-state-q4",
    type: "coaching-moves",
    prompt: "Which program did Mike Leach coach immediately before becoming Mississippi State's head coach?",
    choices: ["Washington State", "Texas Tech", "Houston", "Oregon State"], answer: "Washington State",
    statSheet: "The Air Raid coach's 2018 team won 11 games and finished in the AP Top 10.",
    explanation: "Mike Leach coached Washington State from 2012 to 2019, producing an 11–2 campaign in 2018 and a 55–47 overall record. Mississippi State named him head coach in January 2020; Texas Tech had been his earlier head-coaching stop from 2000 through 2009.",
    evidence: [{ authority: "Mississippi State university coach biography", url: "https://www.msstate.edu/newsroom/article/2022/12/msu-bulldog-family-college-football-community-mourn-death-coach-mike-leach", supportingDetail: "Mississippi State confirms Leach coached Washington State for eight seasons, including 11 wins in 2018, before taking its head-coaching position in January 2020." }],
  },
  "cfb:3:4": {
    id: "millionaire-cfb-auburn-2010-chizik-q5",
    type: "championship-coaches",
    prompt: "Who coached Auburn's undefeated 2010 national championship team?",
    choices: ["Gene Chizik", "Tommy Tuberville", "Gus Malzahn", "Nick Saban"], answer: "Gene Chizik",
    statSheet: "His second Auburn season ended with a 22–19 BCS title-game win over Oregon.",
    explanation: "Gene Chizik led Auburn to a 14–0 record in the 2010 season, capped by a 22–19 BCS national-title victory over Oregon in January 2011. Heisman winner Cam Newton quarterbacked the unbeaten Tigers.",
    evidence: [{ authority: "Auburn Athletics", url: "https://auburntigers.com/news/2020/10/29/auburn-unveils-2010-national-championship-banner-chizik-recalls-incredible-journey", supportingDetail: "The school's retrospective identifies Chizik as head coach of undefeated 2010 Auburn." }],
  },
  "cfb:6:7": {
    id: "millionaire-cfb-2018-rose-bowl-sony-michel-q8",
    type: "playoff-walkoff",
    prompt: "Which Georgia running back scored the 27-yard double-overtime walk-off touchdown against Oklahoma in the January 2018 Rose Bowl?",
    choices: ["Sony Michel", "Nick Chubb", "D'Andre Swift", "Elijah Holyfield"], answer: "Sony Michel",
    statSheet: null,
    explanation: "Sony Michel took a direct snap and ran 27 yards for Georgia's winning touchdown in the second overtime of the January 2018 Rose Bowl. The 54–48 semifinal victory over Oklahoma followed Lorenzo Carter's block of the Sooners' field-goal attempt.",
    evidence: [{ authority: "Georgia Athletics", url: "https://georgiadogs.com/news/2018/1/1/football-georgia-beats-oklahoma-to-win-rose-bowl-game?path=football", supportingDetail: "The official Rose Bowl recap documents Michel's 27-yard walk-off score following a blocked Oklahoma field goal." }],
  },
  "ufc:4:1": {
    id: "millionaire-ufc-287-adesanya-pereira-q2",
    type: "title-rematches",
    prompt: "Who knocked out Alex Pereira at UFC 287 to regain the middleweight championship?",
    choices: ["Israel Adesanya", "Robert Whittaker", "Sean Strickland", "Dricus du Plessis"], answer: "Israel Adesanya",
    statSheet: "The Miami title rematch ended late in Round 2 in April 2023.",
    explanation: "Israel Adesanya knocked out Alex Pereira with a right hand at 4:21 of Round 2 at UFC 287 in Miami on April 8, 2023. The comeback finish recaptured the UFC middleweight championship after Pereira had dethroned him in their previous UFC meeting.",
    evidence: [{ authority: "UFC 287 official results", url: "https://www.ufc.com/news/ufc-287-pereira-vs-adesanya-2-results-highlights-winner-interviews-miami?language_content_entity=en", supportingDetail: "Official fight results confirm Adesanya KO over Pereira, 4:21 of Round 2." }],
  },
  "ufc:9:3": {
    id: "millionaire-ufc-219-holm-cyborg-q4",
    type: "womens-featherweight",
    prompt: "Who challenged Cris Cyborg for the UFC women's featherweight championship at UFC 219?",
    choices: ["Holly Holm", "Ronda Rousey", "Amanda Nunes", "Germaine de Randamie"], answer: "Holly Holm",
    statSheet: "The Las Vegas main event in December 2017 went the full five rounds.",
    explanation: "Holly Holm challenged Cris Cyborg for the UFC women's featherweight championship in the December 30, 2017 UFC 219 main event in Las Vegas. Cyborg retained the belt after five rounds by unanimous decision, 49–46, 48–47 and 48–47.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/event/ufc-219", supportingDetail: "Official UFC 219 event result lists Cyborg vs Holm, five-round unanimous decision." }],
  },
  "ufc:9:7": {
    id: "millionaire-ufc-289-nunes-last-opponent-q8",
    type: "retirement-fights",
    prompt: "Who did Amanda Nunes defeat by unanimous decision at UFC 289 immediately before announcing her retirement in June 2023?",
    choices: ["Irene Aldana", "Julianna Peña", "Raquel Pennington", "Holly Holm"], answer: "Irene Aldana",
    statSheet: null,
    explanation: "Amanda Nunes defeated Irene Aldana by unanimous decision (50–44, 50–44, 50–43) at UFC 289 in Vancouver on June 10, 2023. She then announced her retirement in the Octagon after successfully defending the women's bantamweight title.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/news/ufc-289-nunes-vs-aldana-results-highlights-winner-interviews-vancouver", supportingDetail: "UFC 289 main-event report records Nunes' unanimous decision over Aldana." }],
  },
  // Second batch: future-only removals of answer-identical selected Bar Trivia questions.
  // Active Bar Trivia fact collision retired from future-preview run 1 Q3.
  "ufc:0:2": {
    id: "millionaire-ufc-future-rewrite-r1-q3",
    type: "vacant-lightweight-defense",
    prompt: "Who submitted Renato Moicano with a D’Arce choke to defend the UFC lightweight title at UFC 311?",
    choices: ["Islam Makhachev","Charles Oliveira","Arman Tsarukyan","Mateusz Gamrot"], answer: "Islam Makhachev",
    statSheet: "The challenger was a late replacement in the January 2025 main event.",
    explanation: "Islam Makhachev submitted Renato Moicano with a D'Arce choke at 4:05 of Round 1 at UFC 311 in Los Angeles, retaining his lightweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-311-makhachev-vs-moicano-los-angeles", supportingDetail: "Islam Makhachev submitted Renato Moicano with a D'Arce choke at 4:05 of Round 1 at UFC 311 in Los Angeles, retaining his lightweight championship." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 1 Q4.
  "ufc:0:3": {
    id: "millionaire-ufc-future-rewrite-r1-q4",
    type: "heavyweight-title-rematches",
    prompt: "Who stopped Curtis Blaydes in just one minute during their interim heavyweight title rematch at UFC 304?",
    choices: ["Tom Aspinall","Ciryl Gane","Sergei Pavlovich","Derrick Lewis"], answer: "Tom Aspinall",
    statSheet: "The rematch took place in Manchester in July 2024.",
    explanation: "Tom Aspinall stopped Curtis Blaydes by strikes at exactly 1:00 of Round 1 at UFC 304 in Manchester, retaining the interim UFC heavyweight championship. Their earlier 2022 bout ended when Aspinall suffered a knee injury.",
    evidence: [{ authority: "UFC official event/results", url: "https://www.ufc.com/news/official-judges-scorecards-ufc-304-edwards-vs-muhammad-2", supportingDetail: "Tom Aspinall stopped Curtis Blaydes by strikes at exactly 1:00 of Round 1 at UFC 304 in Manchester, retaining the interim UFC heavyweight championship. Their earlier 2022 bout ended when Aspinall suffered a knee injury." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 1 Q5.
  "ufc:0:4": {
    id: "millionaire-ufc-future-rewrite-r1-q5",
    type: "heavyweight-defense-record",
    prompt: "Who became the first UFC heavyweight champion to defend his title three straight times, defeating Francis Ngannou at UFC 220?",
    choices: ["Stipe Miocic","Cain Velasquez","Daniel Cormier","Fabricio Werdum"], answer: "Stipe Miocic",
    statSheet: "All three judges scored the January 2018 Boston fight 50–44 for the champion.",
    explanation: "Stipe Miocic defeated Francis Ngannou by unanimous decision (50–44 on all three scorecards) at UFC 220 in January 2018, becoming the first UFC heavyweight champion to defend his title successfully three consecutive times.",
    evidence: [{ authority: "UFC official result", url: "https://www.ufc.com/news/miocic-breaks-heavyweight-title-record-win-over-ngannou", supportingDetail: "Stipe Miocic defeated Francis Ngannou by unanimous decision (50–44 on all three scorecards) at UFC 220 in January 2018, becoming the first UFC heavyweight champion to defend his title successfully three consecutive times." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 1 Q6.
  "ufc:0:5": {
    id: "millionaire-ufc-future-rewrite-r1-q6",
    type: "bantamweight-defenses",
    prompt: "Who defended the UFC bantamweight title against Umar Nurmagomedov at UFC 311?",
    choices: ["Merab Dvalishvili","Sean O’Malley","Petr Yan","Aljamain Sterling"], answer: "Merab Dvalishvili",
    statSheet: "The champion won a five-round decision over a previously unbeaten challenger.",
    explanation: "Merab Dvalishvili beat Umar Nurmagomedov by unanimous decision (48–47, 48–47, 49–46) at UFC 311 on January 18, 2025, handing Umar his first professional loss.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-311-makhachev-vs-moicano-los-angeles", supportingDetail: "Merab Dvalishvili beat Umar Nurmagomedov by unanimous decision (48–47, 48–47, 49–46) at UFC 311 on January 18, 2025, handing Umar his first professional loss." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 2 Q4.
  "ufc:1:3": {
    id: "millionaire-ufc-future-rewrite-r2-q4",
    type: "light-heavyweight-comebacks",
    prompt: "Who stopped Jamahal Hill in Round 3 of their light heavyweight fight at UFC 311?",
    choices: ["Jiří Procházka","Alex Pereira","Magomed Ankalaev","Glover Teixeira"], answer: "Jiří Procházka",
    statSheet: "The January 2025 matchup featured two former light heavyweight champions.",
    explanation: "Jiří Procházka defeated Jamahal Hill by TKO at 3:01 of Round 3 at UFC 311 on January 18, 2025, in Los Angeles.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-311-makhachev-vs-moicano-los-angeles", supportingDetail: "Jiří Procházka defeated Jamahal Hill by TKO at 3:01 of Round 3 at UFC 311 on January 18, 2025, in Los Angeles." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 2 Q5.
  "ufc:1:4": {
    id: "millionaire-ufc-future-rewrite-r2-q5",
    type: "lightweight-submissions",
    prompt: "Who submitted Justin Gaethje in Round 1 of the UFC 274 main event?",
    choices: ["Charles Oliveira","Dustin Poirier","Islam Makhachev","Michael Chandler"], answer: "Charles Oliveira",
    statSheet: "The former champion missed weight before winning by rear-naked choke in Phoenix.",
    explanation: "Charles Oliveira submitted Justin Gaethje with a rear-naked choke at 3:22 of Round 1 at UFC 274 in May 2022; Oliveira had missed weight and was stripped of the lightweight belt beforehand.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-274-oliveira-vs-gaethje-namajunas-esparza-2-results-highlights-winner-interviews", supportingDetail: "Charles Oliveira submitted Justin Gaethje with a rear-naked choke at 3:22 of Round 1 at UFC 274 in May 2022; Oliveira had missed weight and was stripped of the lightweight belt beforehand." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 2 Q6.
  "ufc:1:5": {
    id: "millionaire-ufc-future-tsarukyan-dariush-austin-q6",
    type: "lightweight-knockouts",
    prompt: "Who knocked out Beneil Dariush in just 64 seconds during the December 2023 UFC Austin main event?",
    choices: ["Arman Tsarukyan","Mateusz Gamrot","Islam Makhachev","Rafael Fiziev"],
    answer: "Arman Tsarukyan",
    statSheet: "The decisive right hand came in the opening round at the Moody Center in Austin.",
    explanation: "Arman Tsarukyan knocked out top-five lightweight contender Beneil Dariush at 1:04 of Round 1 in the December 2, 2023 UFC Austin main event. The rapid finish at Moody Center gave Tsarukyan another high-profile result in the lightweight title race.",
    evidence: [{"authority":"UFC Austin official event results","url":"https://www.ufc.com/news/ufc-fight-night-dariush-vs-tsarukyan-results-highlights-interviews-ufc-austin","supportingDetail":"UFC records Tsarukyan knocking out Beneil Dariush at 1:04 of Round 1 on December 2, 2023."}],
  },
  // Active Bar Trivia fact collision retired from future-preview run 3 Q1.
  "ufc:2:0": {
    id: "millionaire-ufc-future-rewrite-r3-q1",
    type: "ufc-300-main-event",
    prompt: "Who knocked out Jamahal Hill in the first round to retain the light heavyweight belt at UFC 300?",
    choices: ["Alex Pereira","Jiří Procházka","Magomed Ankalaev","Jan Błachowicz"], answer: "Alex Pereira",
    statSheet: "The milestone Las Vegas event ended with a Round 1 knockout.",
    explanation: "Alex Pereira knocked out Jamahal Hill at 3:14 of Round 1 in the UFC 300 main event in April 2024, retaining his light heavyweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill?language_content_entity=en", supportingDetail: "Alex Pereira knocked out Jamahal Hill at 3:14 of Round 1 in the UFC 300 main event in April 2024, retaining his light heavyweight championship." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 3 Q4.
  "ufc:2:3": {
    id: "millionaire-ufc-future-rewrite-r3-q4",
    type: "flyweight-title-upsets",
    prompt: "Who submitted Valentina Shevchenko to take the women's flyweight title at UFC 285?",
    choices: ["Alexa Grasso","Manon Fiorot","Erin Blanchfield","Taila Santos"], answer: "Alexa Grasso",
    statSheet: "The champion missed a spinning attack before the challenger took her back.",
    explanation: "Alexa Grasso submitted Valentina Shevchenko with a rear-naked choke at 4:34 of Round 4 at UFC 285 in March 2023 to capture the women's flyweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-285-jones-vs-gane-results-highlights-winner-interviews-las-vegas", supportingDetail: "Alexa Grasso submitted Valentina Shevchenko with a rear-naked choke at 4:34 of Round 4 at UFC 285 in March 2023 to capture the women's flyweight championship." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 3 Q5.
  "ufc:2:4": {
    id: "millionaire-ufc-future-rewrite-r3-q5",
    type: "strawweight-title-changes",
    prompt: "Who stopped Jessica Andrade in just 42 seconds in Shenzhen to become UFC strawweight champion in 2019?",
    choices: ["Zhang Weili","Joanna Jędrzejczyk","Rose Namajunas","Carla Esparza"], answer: "Zhang Weili",
    statSheet: "The August 2019 strawweight title fight ended just 42 seconds into Round 1.",
    explanation: "Zhang Weili stopped Jessica Andrade with strikes at 0:42 of Round 1 in Shenzhen on August 31, 2019, winning the UFC strawweight title and becoming the first fighter from China to capture a UFC championship.",
    evidence: [{ authority: "UFC official event records", url: "https://www.ufc.com/news/ufc-shenzhen-results", supportingDetail: "Zhang Weili stopped Jessica Andrade with strikes at 0:42 of Round 1 in Shenzhen on August 31, 2019, winning the UFC strawweight title and becoming the first fighter from China to capture a UFC championship." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 4 Q1.
  "ufc:3:0": {
    id: "millionaire-ufc-future-rewrite-r4-q1",
    type: "middleweight-title-unifications",
    prompt: "Who knocked out Robert Whittaker in Round 2 at UFC 243 to unify the middleweight championship?",
    choices: ["Israel Adesanya","Yoel Romero","Alex Pereira","Dricus du Plessis"], answer: "Israel Adesanya",
    statSheet: "The October 2019 main event took place at Marvel Stadium in Melbourne.",
    explanation: "Israel Adesanya unified the UFC middleweight championship by knocking out Robert Whittaker at 3:33 of Round 2 of UFC 243 in Melbourne in October 2019. The stoppage ended Whittaker's nine-fight winning streak.",
    evidence: [{ authority: "UFC official event recap", url: "https://www.ufc.com/news/ufc-243-results-Whittaker-Adesanya", supportingDetail: "Israel Adesanya unified the UFC middleweight championship by knocking out Robert Whittaker at 3:33 of Round 2 of UFC 243 in Melbourne in October 2019. The stoppage ended Whittaker's nine-fight winning streak." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 4 Q4.
  "ufc:3:3": {
    id: "millionaire-ufc-future-rewrite-r4-q4",
    type: "ufc-300-debuts",
    prompt: "Who submitted Holly Holm in Round 2 of her UFC debut at UFC 300?",
    choices: ["Kayla Harrison","Raquel Pennington","Julianna Peña","Amanda Nunes"], answer: "Kayla Harrison",
    statSheet: "The two-time Olympic gold medalist won with a rear-naked choke on the landmark card.",
    explanation: "Kayla Harrison submitted Holly Holm by rear-naked choke at 1:47 of Round 2 at UFC 300 in April 2024, winning her UFC debut.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill?language_content_entity=en", supportingDetail: "Kayla Harrison submitted Holly Holm by rear-naked choke at 1:47 of Round 2 at UFC 300 in April 2024, winning her UFC debut." }],
  },

  // Third batch: fifteen more verified legacy/Bar-Trivia answer collisions removed.
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:3:4": {
    id: "millionaire-ufc-future-rewrite-r4-q5",
    type: "light-heavyweight-highlight-knockouts",
    prompt: "Who knocked out Dominick Reyes with a spinning back elbow late in Round 2 of their May 2021 UFC main event?",
    choices: ["Jiří Procházka","Jan Błachowicz","Aleksandar Rakić","Anthony Smith"], answer: "Jiří Procházka",
    statSheet: "The fight ended with 31 seconds remaining in Round 2.",
    explanation: "Jiří Procházka knocked out Dominick Reyes with a spinning left elbow at 4:29 of Round 2 of their May 1, 2021 UFC Fight Night main event in Las Vegas, producing one of that year's signature finishes.",
    evidence: [{ authority: "UFC official event records", url: "https://www.ufc.com/news/ufc-fight-night-reyes-vs-prochazka-results-highlights-interviews-winners-ufc-vegas-25", supportingDetail: "Jiří Procházka knocked out Dominick Reyes with a spinning left elbow at 4:29 of Round 2 of their May 1, 2021 UFC Fight Night main event in Las Vegas, producing one of that year's signature finishes." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:3:5": {
    id: "millionaire-ufc-future-rewrite-r4-q6",
    type: "middleweight-title-changes", prompt: "Who defeated Sean Strickland by split decision to win the UFC middleweight title at UFC 297?",
    choices: ["Dricus du Plessis","Israel Adesanya","Robert Whittaker","Jared Cannonier"], answer: "Dricus du Plessis",
    statSheet: "The January 2024 main event in Toronto went the full five rounds.", explanation: "Dricus du Plessis beat Sean Strickland by split decision at UFC 297 in January 2024, with the three judges scoring it 47–48, 48–47, and 48–47.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-297-strickland-vs-du-plessis-results-highlights-winner-interviews", supportingDetail: "Dricus du Plessis beat Sean Strickland by split decision at UFC 297 in January 2024, with the three judges scoring it 47–48, 48–47, and 48–47." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:3:6": {
    id: "millionaire-ufc-future-rewrite-r4-q7",
    type: "bantamweight-title-rematches",
    prompt: "Who avenged his 2020 defeat to Marlon Vera with a five-round title-defense victory at UFC 299?",
    choices: ["Sean O’Malley","Petr Yan","Aljamain Sterling","Cory Sandhagen"], answer: "Sean O’Malley",
    statSheet: "All three March 2024 judges scored the rematch decisively in Miami.",
    explanation: "Sean O’Malley defended the UFC bantamweight title with a unanimous decision over Marlon Vera at UFC 299 on March 9, 2024, by scores of 50–45, 50–45 and 50–44, avenging his 2020 stoppage loss to Vera.",
    evidence: [{ authority: "UFC official event records", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-299-omalley-vs-vera-2", supportingDetail: "Sean O’Malley defended the UFC bantamweight title with a unanimous decision over Marlon Vera at UFC 299 on March 9, 2024, by scores of 50–45, 50–45 and 50–44, avenging his 2020 stoppage loss to Vera." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:4:0": {
    id: "millionaire-ufc-future-rewrite-r5-q1",
    type: "noche-ufc-title-change", prompt: "Who dethroned Sean O’Malley by unanimous decision in the UFC 306 main event at Sphere?",
    choices: ["Merab Dvalishvili","Petr Yan","Cory Sandhagen","Henry Cejudo"], answer: "Merab Dvalishvili",
    statSheet: "The September 2024 title fight at a landmark Las Vegas venue went five rounds.", explanation: "Merab Dvalishvili defeated Sean O’Malley by unanimous decision at UFC 306 in September 2024, winning the bantamweight title by scores of 49–46, 48–47, and 48–47.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-306-omalley-vs-dvalishvili-noche-ufc-sphere", supportingDetail: "Merab Dvalishvili defeated Sean O’Malley by unanimous decision at UFC 306 in September 2024, winning the bantamweight title by scores of 49–46, 48–47, and 48–47." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:4:2": {
    id: "millionaire-ufc-future-rewrite-r5-q3",
    type: "ufc-300-lightweight-upsets", prompt: "Who defeated Charles Oliveira by split decision in their UFC 300 lightweight fight?",
    choices: ["Arman Tsarukyan","Islam Makhachev","Beneil Dariush","Dustin Poirier"], answer: "Arman Tsarukyan",
    statSheet: "The April 2024 contender bout went all three rounds, with two judges backing the challenger.", explanation: "Arman Tsarukyan beat Charles Oliveira by split decision (28–29, 29–28, 29–28) at UFC 300 in April 2024, earning an important lightweight contender victory.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill?language_content_entity=en", supportingDetail: "Arman Tsarukyan beat Charles Oliveira by split decision (28–29, 29–28, 29–28) at UFC 300 in April 2024, earning an important lightweight contender victory." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:4:3": {
    id: "millionaire-ufc-future-rewrite-r5-q4",
    type: "flyweight-trilogy", prompt: "Who beat Alexa Grasso by unanimous decision at UFC 306 to regain the women's flyweight title?",
    choices: ["Valentina Shevchenko","Manon Fiorot","Erin Blanchfield","Taila Santos"], answer: "Valentina Shevchenko",
    statSheet: "The third meeting occurred at Sphere and all three judges scored it 50–45.", explanation: "Valentina Shevchenko defeated Alexa Grasso by unanimous decision, 50–45 on all three cards, in their UFC 306 trilogy fight in September 2024, reclaiming her flyweight title.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-306-omalley-vs-dvalishvili-noche-ufc-sphere", supportingDetail: "Valentina Shevchenko defeated Alexa Grasso by unanimous decision, 50–45 on all three cards, in their UFC 306 trilogy fight in September 2024, reclaiming her flyweight title." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:4:4": {
    id: "millionaire-ufc-future-rewrite-r5-q5",
    type: "strawweight-title-defenses", prompt: "Who defeated Yan Xiaonan by unanimous decision in UFC 300's strawweight championship bout?",
    choices: ["Zhang Weili","Rose Namajunas","Jessica Andrade","Amanda Lemos"], answer: "Zhang Weili",
    statSheet: "Both fighters represented China in the five-round title matchup in Las Vegas.", explanation: "Zhang Weili defeated Yan Xiaonan by unanimous decision (49–45 on all three cards) at UFC 300 in April 2024, defending her strawweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill?language_content_entity=en", supportingDetail: "Zhang Weili defeated Yan Xiaonan by unanimous decision (49–45 on all three cards) at UFC 300 in April 2024, defending her strawweight championship." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:5:0": {
    id: "millionaire-ufc-future-rewrite-r6-q1",
    type: "bmf-championship-knockouts", prompt: "Who knocked out Dustin Poirier with a second-round head kick to win the BMF belt at UFC 291?",
    choices: ["Justin Gaethje","Max Holloway","Michael Chandler","Charles Oliveira"], answer: "Justin Gaethje",
    statSheet: "The rematch in Salt Lake City ended at 1:00 of the second round.", explanation: "Justin Gaethje knocked out Dustin Poirier with a right high kick at 1:00 of Round 2 at UFC 291 in July 2023, winning the BMF title.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-291-poirier-vs-gaethje-2-results-highlights-winner-interviews-salt-lake-city", supportingDetail: "Justin Gaethje knocked out Dustin Poirier with a right high kick at 1:00 of Round 2 at UFC 291 in July 2023, winning the BMF title." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:5:2": {
    id: "millionaire-ufc-future-rewrite-r6-q3",
    type: "ufc-300-bantamweight-finishes", prompt: "Who submitted former champion Cody Garbrandt at UFC 300?",
    choices: ["Deiveson Figueiredo","Dominick Cruz","Petr Yan","Sean O’Malley"], answer: "Deiveson Figueiredo",
    statSheet: "The flyweight-turned-bantamweight finished with a rear-naked choke in Round 2.", explanation: "Deiveson Figueiredo submitted Cody Garbrandt by rear-naked choke at 4:02 of Round 2 during UFC 300 in April 2024.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-300-pereira-vs-hill?language_content_entity=en", supportingDetail: "Deiveson Figueiredo submitted Cody Garbrandt by rear-naked choke at 4:02 of Round 2 during UFC 300 in April 2024." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:5:3": {
    id: "millionaire-ufc-future-rewrite-r6-q4",
    type: "welterweight-title-knockouts", prompt: "Who knocked out Jorge Masvidal in the second round of their UFC 261 title rematch?",
    choices: ["Kamaru Usman","Colby Covington","Gilbert Burns","Leon Edwards"], answer: "Kamaru Usman",
    statSheet: "The championship rematch finished at 1:02 of Round 2 in Jacksonville.", explanation: "Kamaru Usman knocked out Jorge Masvidal at 1:02 of Round 2 in the UFC 261 main event in April 2021, defending his welterweight title.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-261-usman-vs-masvidal-2-zhang-namajunas-results-highlights-interviews-winners", supportingDetail: "Kamaru Usman knocked out Jorge Masvidal at 1:02 of Round 2 in the UFC 261 main event in April 2021, defending his welterweight title." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:5:4": {
    id: "millionaire-ufc-future-rewrite-r6-q5",
    type: "featherweight-contenders", prompt: "Who defeated Brian Ortega by unanimous decision in the UFC 306 featherweight feature bout?",
    choices: ["Diego Lopes","Yair Rodriguez","Max Holloway","Ilia Topuria"], answer: "Diego Lopes",
    statSheet: "The September 2024 fight at Sphere lasted all three rounds.", explanation: "Diego Lopes defeated Brian Ortega by unanimous decision (30–26, 30–27, 30–27) at UFC 306 in September 2024, improving his featherweight contender standing.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-306-omalley-vs-dvalishvili-noche-ufc-sphere", supportingDetail: "Diego Lopes defeated Brian Ortega by unanimous decision (30–26, 30–27, 30–27) at UFC 306 in September 2024, improving his featherweight contender standing." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:9:0": {
    id: "millionaire-ufc-future-rewrite-r10-q1",
    type: "strawweight-title-rematches",
    prompt: "Who defended the UFC women's strawweight title against Zhang Weili by split decision at UFC 268?",
    choices: ["Rose Namajunas","Jessica Andrade","Joanna Jędrzejczyk","Carla Esparza"], answer: "Rose Namajunas",
    statSheet: "The November 2021 five-round rematch took place at Madison Square Garden.",
    explanation: "Rose Namajunas retained the UFC women's strawweight championship by split decision over Zhang Weili at UFC 268 in Madison Square Garden on November 6, 2021. The rematch followed Namajunas's knockout title win earlier that year.",
    evidence: [{ authority: "UFC official event records", url: "https://www.ufc.com/event/ufc-268", supportingDetail: "Rose Namajunas retained the UFC women's strawweight championship by split decision over Zhang Weili at UFC 268 in Madison Square Garden on November 6, 2021. The rematch followed Namajunas's knockout title win earlier that year." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:9:1": {
    id: "millionaire-ufc-future-rewrite-r10-q2",
    type: "bantamweight-title-rematches", prompt: "Who beat Julianna Peña by unanimous decision at UFC 277 to reclaim the women's bantamweight belt?",
    choices: ["Amanda Nunes","Holly Holm","Raquel Pennington","Miesha Tate"], answer: "Amanda Nunes",
    statSheet: "The July 2022 rematch took place in Dallas after a major upset seven months earlier.", explanation: "Amanda Nunes beat Julianna Peña by unanimous decision (50–45, 50–44, 50–43) at UFC 277 in July 2022 to regain the women's bantamweight title.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-277-pena-vs-nunes-2-results", supportingDetail: "Amanda Nunes beat Julianna Peña by unanimous decision (50–45, 50–44, 50–43) at UFC 277 in July 2022 to regain the women's bantamweight title." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:9:2": {
    id: "millionaire-ufc-future-rewrite-r10-q3",
    type: "interim-flyweight-titles", prompt: "Who stopped Kai Kara-France in Round 3 to win the UFC interim flyweight championship at UFC 277?",
    choices: ["Brandon Moreno","Alexandre Pantoja","Deiveson Figueiredo","Brandon Royval"], answer: "Brandon Moreno",
    statSheet: "The co-main event in Dallas concluded at 4:34 of Round 3 after a body kick.", explanation: "Brandon Moreno defeated Kai Kara-France by third-round TKO at 4:34 at UFC 277 in July 2022, winning the interim flyweight belt.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-277-pena-vs-nunes-2-results", supportingDetail: "Brandon Moreno defeated Kai Kara-France by third-round TKO at 4:34 at UFC 277 in July 2022, winning the interim flyweight belt." }],
  },
  // Future-only replacement of a selected Bar Trivia answer/fact repeat.
  "ufc:9:5": {
    id: "millionaire-ufc-future-rewrite-r10-q6",
    type: "flyweight-title-defenses", prompt: "Who stopped Jessica Andrade in Round 2 of their women's flyweight title bout at UFC 261?",
    choices: ["Valentina Shevchenko","Alexa Grasso","Manon Fiorot","Erin Blanchfield"], answer: "Valentina Shevchenko",
    statSheet: "The champion won by grounded strikes after securing a crucifix position.", explanation: "Valentina Shevchenko stopped Jessica Andrade by TKO at 3:19 of Round 2 at UFC 261 in April 2021, retaining her women's flyweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-261-usman-vs-masvidal-2-zhang-namajunas-results-highlights-interviews-winners", supportingDetail: "Valentina Shevchenko stopped Jessica Andrade by TKO at 3:19 of Round 2 at UFC 261 in April 2021, retaining her women's flyweight championship." }],
  },

  // Future-only NFL and CFB concept replacement batch.
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:1:4": {
    id: "millionaire-nfl-mcnair-2003-co-mvp-q5", type: "mvp-history", prompt: "Which quarterback shared the 2003 AP NFL MVP award with Peyton Manning?",
    choices: ["Steve McNair","Tom Brady","Rich Gannon","Brett Favre"], answer: "Steve McNair",
    statSheet: "The co-winner quarterbacked Tennessee to a 12–4 record in that season.", explanation: "Tennessee Titans quarterback Steve McNair shared the 2003 Associated Press NFL Most Valuable Player award with Indianapolis quarterback Peyton Manning. Both quarterbacks received 16 first-place votes as their teams finished 12–4.",
    evidence: [{ authority: "Tennessee Titans / Associated Press", url: "https://www.tennesseetitans.com/news/a-look-back-at-the-career-of-steve-mcnair-543596%26lang%3Den", supportingDetail: "Tennessee Titans quarterback Steve McNair shared the 2003 Associated Press NFL Most Valuable Player award with Indianapolis quarterback Peyton Manning. Both quarterbacks received 16 first-place votes as their teams finished 12–4." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:2:1": {
    id: "millionaire-nfl-stroud-2023-offensive-rookie-q2", type: "rookie-awards", prompt: "Which Texans quarterback won AP NFL Offensive Rookie of the Year for the 2023 season?",
    choices: ["C.J. Stroud","Bryce Young","Anthony Richardson","Will Levis"], answer: "C.J. Stroud",
    statSheet: "The No. 2 overall draft pick led Houston to an AFC South title and a playoff victory.", explanation: "C.J. Stroud won AP NFL Offensive Rookie of the Year after the 2023 season, his first with the Houston Texans. The Ohio State product was drafted second overall, passed for 4,108 yards and helped Houston win the AFC South.",
    evidence: [{ authority: "NFL official AP award announcement", url: "https://www.nfl.com/news/texans-qb-c-j-stroud-named-ap-2023-nfl-offensive-rookie-of-the-year", supportingDetail: "C.J. Stroud won AP NFL Offensive Rookie of the Year after the 2023 season, his first with the Houston Texans. The Ohio State product was drafted second overall, passed for 4,108 yards and helped Houston win the AFC South." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:4:6": {
    id: "millionaire-nfl-future-semantic-r5-q7",
    type: "defensive-awards", prompt: "Which New England cornerback won AP Defensive Player of the Year for the 2019 season?",
    choices: ["Stephon Gilmore","Devin McCourty","J.C. Jackson","Patrick Chung"], answer: "Stephon Gilmore",
    statSheet: "The winner intercepted six passes and broke up 20 during that season.", explanation: "Stephon Gilmore won the 2019 AP Defensive Player of the Year award as a Patriots cornerback after registering six interceptions and 20 passes defended.",
    evidence: [{ authority: "NFL official report", url: "https://www.nfl.com/_amp/stephon-gilmore-named-2019-defensive-player-of-year-0ap3000001100158", supportingDetail: "Stephon Gilmore won the 2019 AP Defensive Player of the Year award as a Patriots cornerback after registering six interceptions and 20 passes defended." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:5:5": {
    id: "millionaire-nfl-future-semantic-r6-q6",
    type: "super-bowl-defensive-tds", prompt: "Which Chiefs linebacker returned a Jalen Hurts fumble 36 yards for a touchdown in Super Bowl LVII?",
    choices: ["Nick Bolton","Willie Gay","Chris Jones","Leo Chenal"], answer: "Nick Bolton",
    statSheet: "The scoop-and-score came during the second quarter of the 2023 championship game.", explanation: "Nick Bolton scooped up Jalen Hurts' fumble and returned it 36 yards for a touchdown in Super Bowl LVII, a 38–35 Kansas City win against Philadelphia.",
    evidence: [{ authority: "NFL official report", url: "https://www.nfl.com/news/neil-reynolds-super-bowl-lvii-wrap-up", supportingDetail: "Nick Bolton scooped up Jalen Hurts' fumble and returned it 36 yards for a touchdown in Super Bowl LVII, a 38–35 Kansas City win against Philadelphia." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:6:1": {
    id: "millionaire-nfl-future-semantic-r7-q2",
    type: "rookie-awards", prompt: "Which Washington quarterback earned AP Offensive Rookie of the Year for the 2024 NFL season?",
    choices: ["Jayden Daniels","Bo Nix","Drake Maye","Caleb Williams"], answer: "Jayden Daniels",
    statSheet: "The dual-threat quarterback rushed for 891 yards and reached the NFC Championship Game.", explanation: "Jayden Daniels won AP Offensive Rookie of the Year for 2024 after throwing for 3,568 yards, rushing for 891 and taking Washington to the NFC title game.",
    evidence: [{ authority: "NFL official report", url: "https://www.nfl.com/news/commanders-qb-jayden-daniels-named-2024-ap-nfl-offensive-rookie-of-the-year", supportingDetail: "Jayden Daniels won AP Offensive Rookie of the Year for 2024 after throwing for 3,568 yards, rushing for 891 and taking Washington to the NFC title game." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:8:1": {
    id: "millionaire-nfl-future-semantic-r9-q2",
    type: "super-bowl-awards", prompt: "Who earned Super Bowl LIV MVP after Kansas City rallied past San Francisco in February 2020?",
    choices: ["Patrick Mahomes","Damien Williams","Travis Kelce","Tyrann Mathieu"], answer: "Patrick Mahomes",
    statSheet: "The winner led three fourth-quarter touchdown drives after trailing 20–10.", explanation: "Patrick Mahomes won Super Bowl LIV MVP as the Chiefs scored 21 fourth-quarter points to defeat San Francisco 31–20 in February 2020.",
    evidence: [{ authority: "NFL official report", url: "https://www.nfl.com/news/patrick-mahomes-is-super-bowl-mvp-after-comeback-0ap3000001100779", supportingDetail: "Patrick Mahomes won Super Bowl LIV MVP as the Chiefs scored 21 fourth-quarter points to defeat San Francisco 31–20 in February 2020." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "cfb:0:1": {
    id: "millionaire-cfb-future-semantic-r1-q2",
    type: "expanded-playoff-titles", prompt: "Which school won the first 12-team CFP national championship after the 2024 season?",
    choices: ["Ohio State","Notre Dame","Texas","Oregon"], answer: "Ohio State",
    statSheet: "The No. 8 seed defeated Notre Dame 34–23 in January 2025.", explanation: "Ohio State won the first expanded 12-team CFP championship with a 34–23 victory over Notre Dame on January 20, 2025, finishing the 2024 season 14–2.",
    evidence: [{ authority: "CFP/university athletics", url: "https://collegefootballplayoff.com/sports/2025/1/21/NCG-recap", supportingDetail: "Ohio State won the first expanded 12-team CFP championship with a 34–23 victory over Notre Dame on January 20, 2025, finishing the 2024 season 14–2." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "cfb:8:3": {
    id: "millionaire-cfb-future-semantic-r9-q4",
    type: "modern-championship-coaches", prompt: "Which head coach led Michigan to an undefeated 15–0 national-title season in 2023?",
    choices: ["Jim Harbaugh","Sherrone Moore","Ryan Day","Kirby Smart"], answer: "Jim Harbaugh",
    statSheet: "The Wolverines ended their 2023 season by defeating Washington 34–13.", explanation: "Jim Harbaugh led Michigan to the 2023 season's national championship and a 15–0 record, capped by a 34–13 win over Washington on January 8, 2024.",
    evidence: [{ authority: "CFP/university athletics", url: "https://mgoblue.com/news/2024/1/8/football-mission-accomplished-u-m-takes-down-no-2-washington-to-capture-cfp-national-championship", supportingDetail: "Jim Harbaugh led Michigan to the 2023 season's national championship and a 15–0 record, capped by a 34–13 win over Washington on January 8, 2024." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "cfb:3:5": {
    id: "millionaire-cfb-future-semantic-r4-q6",
    type: "modern-bowl-upsets", prompt: "Which team defeated Georgia 23–10 in the January 2025 Sugar Bowl CFP quarterfinal?",
    choices: ["Notre Dame","Ole Miss","Texas","Tennessee"], answer: "Notre Dame",
    statSheet: "The winner returned the second-half opening kickoff 98 yards for a touchdown.", explanation: "Notre Dame beat Georgia 23–10 in the January 2, 2025 CFP Sugar Bowl quarterfinal, aided by Jayden Harrison's 98-yard kickoff return touchdown.",
    evidence: [{ authority: "CFP/university athletics", url: "https://collegefootballplayoff.com/sports/2025/1/3/QF-Sugar-recap", supportingDetail: "Notre Dame beat Georgia 23–10 in the January 2, 2025 CFP Sugar Bowl quarterfinal, aided by Jayden Harrison's 98-yard kickoff return touchdown." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "cfb:6:6": {
    id: "millionaire-cfb-future-semantic-r7-q7",
    type: "modern-title-coaches", prompt: "Which coach guided Indiana to its 16–0 national-championship season in 2025?",
    choices: ["Curt Cignetti","Marcus Freeman","Mario Cristobal","Lane Kiffin"], answer: "Curt Cignetti",
    statSheet: "The undefeated champion beat Miami 27–21 in the title game in January 2026.", explanation: "Curt Cignetti led Indiana to a 16–0 record for the 2025 season and a 27–21 victory over Miami in the January 2026 College Football Playoff championship.",
    evidence: [{ authority: "CFP/university athletics", url: "https://iuhoosiers.com/news/2026/1/20/football-cfp-ncg-recap-PETE", supportingDetail: "Curt Cignetti led Indiana to a 16–0 record for the 2025 season and a 27–21 victory over Miami in the January 2026 College Football Playoff championship." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "cfb:8:1": {
    id: "millionaire-cfb-future-semantic-r9-q2",
    type: "expanded-playoff-quarterfinals", prompt: "Which school beat Boise State 31–14 in the 2024 season's Fiesta Bowl quarterfinal?",
    choices: ["Penn State","Arizona State","SMU","Clemson"], answer: "Penn State",
    statSheet: "Drew Allar threw three touchdown passes in the December 2024 win.", explanation: "Penn State defeated Boise State 31–14 in the December 31, 2024 Fiesta Bowl quarterfinal as quarterback Drew Allar threw three touchdown passes.",
    evidence: [{ authority: "CFP/university athletics", url: "https://collegefootballplayoff.com/sports/2025/1/1/QF-Fiesta-recap", supportingDetail: "Penn State defeated Boise State 31–14 in the December 31, 2024 Fiesta Bowl quarterfinal as quarterback Drew Allar threw three touchdown passes." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "cfb:8:2": {
    id: "millionaire-cfb-future-semantic-r9-q3",
    type: "modern-title-quarterbacks", prompt: "Which Notre Dame quarterback started the national-title game against Ohio State in January 2025?",
    choices: ["Riley Leonard","Drew Allar","Quinn Ewers","Will Howard"], answer: "Riley Leonard",
    statSheet: "The title-game starter transferred from Duke before the 2024 season.", explanation: "Riley Leonard started at quarterback for Notre Dame against Ohio State in the January 2025 CFP national championship after transferring from Duke.",
    evidence: [{ authority: "CFP/university athletics", url: "https://collegefootballplayoff.com/sports/2025/1/21/NCG-recap", supportingDetail: "Riley Leonard started at quarterback for Notre Dame against Ohio State in the January 2025 CFP national championship after transferring from Duke." }],
  },


  // A retained future run also revisited Grasso's UFC 285 submission, already
  // covered by another effective Millionaire run. Keep all historic seeds intact;
  // this distinct five-round comeback occupies the future-preview slot only.
  "ufc:9:6": {
    id: "millionaire-ufc-future-rozenstruik-overeem-dc-2019-q7",
    type: "heavyweight-comebacks",
    prompt: "Who knocked out Alistair Overeem with just four seconds remaining in their December 2019 UFC Washington, D.C. main event?",
    choices: ["Jairzinho Rozenstruik", "Francis Ngannou", "Derrick Lewis", "Alexander Volkov"],
    answer: "Jairzinho Rozenstruik",
    statSheet: "The heavyweight was trailing on all three judges' scorecards when the finish came at 4:56 of Round 5.",
    explanation: "Jairzinho Rozenstruik knocked out Alistair Overeem at 4:56 of the fifth round on December 7, 2019, in Washington, D.C. Overeem was ahead four rounds to zero on all three judges' cards before a last-second right hand forced the stoppage.",
    evidence: [{
      authority: "UFC official Washington, D.C. fight result and recap",
      url: "https://www.ufc.com/news/ufc-washington-dc-results-alistair-overeem-jairzinho-rozenstruik?language_content_entity=fr-ca",
      supportingDetail: "Official UFC recap names Rozenstruik, Overeem, and Round 5 at 4:56; states Overeem led all three judges' cards four rounds to zero at the stoppage.",
    }],
  },

  // The retained NFL run 1 Q2 repeats the Malcolm Butler Super Bowl XLIX
  // interception already authored in the NFL Average Fan bank. A new,
  // approachable, independently sourced roster-history fact replaces it in
  // the future preview while preserving the archival question.
  "nfl:0:1": {
    id: "millionaire-nfl-future-aj-brown-2022-titans-trade-q2",
    type: "receiver-team-history",
    prompt: "Which NFL team did wide receiver A.J. Brown play for before Philadelphia acquired him in the 2022 Draft?",
    choices: ["Titans", "Jets", "Vikings", "Chargers"],
    answer: "Titans",
    statSheet: "The receiver began his NFL career in 2019 and was traded for a first- and third-round draft pick.",
    explanation: "A.J. Brown played for the Tennessee Titans from 2019 to 2021 before Philadelphia acquired him in a trade on April 28, 2022. The Eagles sent Tennessee the No. 18 and No. 101 picks in that draft.",
    evidence: [{
      authority: "Philadelphia Eagles official 2022 transactions",
      url: "https://www.philadelphiaeagles.com/team/transactions/2022",
      supportingDetail: "April 28 records the Eagles trading first-round No. 18 and third-round No. 101 picks to the Tennessee Titans for A.J. Brown.",
    }, {
      authority: "NFL 2022 draft trade coverage",
      url: "https://www.nfl.com/news/eagles-receive-a-j-brown-in-trade-with-titans-wr-to-sign-four-year-100-million-c",
      supportingDetail: "NFL reports Brown spent his first three seasons with Tennessee and was traded to Philadelphia during the 2022 Draft.",
    }],
  },

  // The legacy 2003 LSU vs. USC split-title identity has already been tested
  // in still-selectable CFB Bar Trivia. For future-preview CFB run 4 Q7 use
  // a different, famous 2014-season CFP semifinal turning point.
  "cfb:3:6": {
    id: "millionaire-cfb-future-elliott-85-yard-sugar-bowl-q7",
    type: "cfp-semifinal-breakaways",
    prompt: "Which Ohio State running back broke an 85-yard touchdown run against Alabama late in the January 2015 Sugar Bowl semifinal?",
    choices: ["Ezekiel Elliott", "Carlos Hyde", "J.K. Dobbins", "Mike Weber"],
    answer: "Ezekiel Elliott",
    statSheet: "The Buckeyes upset the top-ranked Crimson Tide 42–35 and advanced to play Oregon for the national championship.",
    explanation: "Ezekiel Elliott rushed for 230 yards and two touchdowns as No. 4 Ohio State beat No. 1 Alabama 42–35 on January 1, 2015. His 85-yard fourth-quarter touchdown with 3:24 remaining put Ohio State ahead 42–28 before Alabama scored again.",
    evidence: [{
      authority: "College Football Playoff official Sugar Bowl scoring recap",
      url: "https://collegefootballplayoff.com/sports/2025/8/4/15-SF-Sugar-recap",
      supportingDetail: "Official 2014-season January 1, 2015 semifinal log names Ohio State running back Ezekiel Elliott's 85-yard score with 3:24 remaining and confirms the 42–35 final.",
    }, {
      authority: "Ohio State Athletics official 2015 Sugar Bowl box score",
      url: "https://ohiostatebuckeyes.com/sports/football/stats/2014-15/alabama/boxscore/17813",
      supportingDetail: "Ohio State play-by-play confirms Elliott ran 85 yards for a fourth-quarter touchdown and compiled 230 rushing yards.",
    }],
  },
  // Four supported retained-legacy future-preview questions; original bank/history remains immutable.
  "nfl:3:2": {
    id: "millionaire-nfl-future-blake-bortles-2017-afc-title-q3", type: "afc-playoff-quarterbacks",
    prompt: "Which Jacksonville quarterback led the Jaguars to the AFC Championship Game following the 2017 NFL season?",
    choices: ["Blake Bortles", "David Garrard", "Chad Henne", "Blaine Gabbert"], answer: "Blake Bortles",
    statSheet: "Jacksonville won the AFC South and beat Pittsburgh in the divisional round before falling to New England.",
    explanation: "Blake Bortles started all 16 games for the 2017 Jacksonville Jaguars and guided them to a 10–6 record and AFC South championship. He threw for 293 yards in the January 2018 AFC Championship Game, which Jacksonville lost to New England after a playoff upset of Pittsburgh.",
    evidence: [{ authority: "Jacksonville Jaguars", url: "https://www.jaguars.com/news/the-offseason-quarterbacks-20347940", supportingDetail: "Jaguars' official 2017 quarterback retrospective documents Bortles starting all 16, 10–6 AFC South title, divisional upset of Pittsburgh and 293 passing yards in AFC title game." }],
  },  "nfl:6:6": {
    id: "millionaire-nfl-tracy-porter-favre-nfc-2009-q7", type: "postseason-interceptions",
    prompt: "Which Saints cornerback intercepted Brett Favre late in the January 2010 NFC Championship Game against Minnesota?",
    choices: ["Tracy Porter","Jabari Greer","Malcolm Jenkins","Darren Sharper"], answer: "Tracy Porter",
    statSheet: "The fourth-quarter takeaway stopped a potential go-ahead Vikings field-goal drive.", explanation: "Tracy Porter intercepted Brett Favre late in the fourth quarter of the January 24, 2010 NFC Championship Game, ending Minnesota's last regulation possession. New Orleans won 31–28 in overtime to reach its first Super Bowl.",
    evidence: [{authority: "New Orleans Saints", url: "https://www.neworleanssaints.com/video/10-years-stronger-porter-intercepts-favre-15815000", supportingDetail: "Tracy Porter intercepted Brett Favre late in the fourth quarter of the January 24, 2010 NFC Championship Game, ending Minnesota's last regulation possession. New Orleans won 31–28 in overtime to reach its first Super Bowl."}],
  },
  "cfb:0:4": {
    id: "millionaire-cfb-future-harrison-2023-biletnikoff-q5", type: "receiver-awards",
    prompt: "Which college receiver won the 2023 Biletnikoff Award?",
    choices: ["Marvin Harrison Jr.", "Malik Nabers", "Rome Odunze", "Troy Franklin"], answer: "Marvin Harrison Jr.",
    statSheet: "The winner was his program's second recipient of the award, following a 1995 honoree.",
    explanation: "Ohio State receiver Marvin Harrison Jr. won the 2023 Biletnikoff Award as the nation's outstanding college receiver. Harrison joined fellow Buckeye Terry Glenn, who received the award in 1995, and he earned unanimous All-America recognition in both 2022 and 2023.",
    evidence: [{ authority: "Ohio State Athletics", url: "https://ohiostatebuckeyes.com/news/2023/12/8/football-marvin-harrison-jr-is-the-2023-biletnikoff-award-winner", supportingDetail: "University athletics confirms Harrison won the 2023 Biletnikoff and Ohio State's previous winner was Terry Glenn." }],
  },
  "cfb:9:0": {
    id: "millionaire-cfb-future-indiana-2025-season-title-q1", type: "championship-season",
    prompt: "Which college won the national championship for the 2025 FOOTBALL SEASON, decided in January 2026?",
    choices: ["Indiana", "Miami", "Ohio State", "Oregon"], answer: "Indiana",
    statSheet: "The champions finished 16–0 and won the title game 27–21 on January 19.",
    explanation: "Indiana went 16–0 during the 2025 college football season, defeating Miami 27–21 in the January 19, 2026 CFP national title game. Fernando Mendoza earned offensive player-of-the-game honors. Ohio State instead won the championship game held in January 2025 for the 2024 season.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2026/1/27/NCG-recap", supportingDetail: "CFP's January 2026 official recap establishes Indiana 27, Miami 21, Indiana 16–0 for the 2025 season." }],
  },

  // Exact active Trivia shared-event facts replaced only for future candidate preview.
  "nfl:7:0": {
    id: "millionaire-nfl-future-lynch-buffalo-draft-2007-q1", type: "draft-team-origins",
    prompt: "Which NFL franchise drafted Marshawn Lynch 12th overall in 2007, before his famous Seattle years?",
    choices: ["Bills", "Seahawks", "Raiders", "Saints"], answer: "Bills",
    statSheet: "He entered the league with an AFC East club before his 2010 trade west.",
    explanation: "The Buffalo Bills selected Marshawn Lynch from California with the 12th overall pick in the 2007 NFL Draft. He played for Buffalo until the Bills traded him to Seattle in October 2010, years before the famous Beast Quake touchdown run.",
    evidence: [{ authority: "Buffalo Bills", url: "https://www.buffalobills.com/news/bills-connections-to-super-bowl-xlviii-12555328", supportingDetail: "Bills team history states Lynch was its 12th overall selection in 2007, played for Buffalo through 2010 and later starred for Seattle." }],
  },
  "ufc:0:0": {
    id: "millionaire-ufc-future-oliveira-chandler-262-q1", type: "lightweight-champions",
    prompt: "Who stopped Michael Chandler just 19 seconds into Round 2 at UFC 262 to win the vacant lightweight title?",
    choices: ["Charles Oliveira", "Justin Gaethje", "Dustin Poirier", "Tony Ferguson"], answer: "Charles Oliveira",
    statSheet: "The May 2021 Houston title fight crowned a successor after Khabib Nurmagomedov retired.",
    explanation: "Charles Oliveira stopped Michael Chandler by TKO only 19 seconds into Round 2 of the UFC 262 main event in Houston on May 15, 2021. It made Oliveira the undisputed lightweight champion after Khabib Nurmagomedov vacated the belt.",
    evidence: [{ authority: "UFC official results", url: "https://www.ufc.com/news/ufc-262-oliveira-vs-chandler-results-highlights-interviews-winners-houston", supportingDetail: "UFC 262 results name Oliveira the winner by TKO at 0:19 of Round 2 over Chandler for the vacant lightweight belt." }],
  },
  "ufc:2:6": {
    id: "millionaire-ufc-future-jdm-burns-ufc299-q7", type: "welterweight-breakthroughs",
    prompt: "Who knocked out Gilbert Burns with a knee and follow-up elbows late in Round 3 at UFC 299?",
    choices: ["Jack Della Maddalena", "Michael Page", "Shavkat Rakhmonov", "Sean Brady"], answer: "Jack Della Maddalena",
    statSheet: "The Australian welterweight scored the finish at 3:43 of the final round in Miami.",
    explanation: "Jack Della Maddalena finished Gilbert Burns by knockout with a knee and follow-up elbows at 3:43 of Round 3 at UFC 299 on March 9, 2024. He remained unbeaten in his UFC appearances at the time and established himself as a leading welterweight contender.",
    evidence: [{ authority: "UFC official results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-299-omalley-vs-vera-2", supportingDetail: "UFC 299 official report confirms Jack Della Maddalena knocked out Gilbert Burns with a knee and elbows at 3:43 of Round 3." }],
  },

  // Primary-sourced late-October retained historical spot corrections; future preview only.
  "nfl:0:5": {
    id: "millionaire-nfl-future-stafford-2025-ap-all-pro-q6", type: "current-era-awards",
    prompt: "Which quarterback earned his first AP first-team All-Pro selection for the 2025 NFL season?",
    choices: ["Matthew Stafford", "Drake Maye", "Josh Allen", "Lamar Jackson"], answer: "Matthew Stafford",
    statSheet: "The 17th-year veteran led the league with 4,707 passing yards and 46 touchdowns.",
    explanation: "Los Angeles Rams quarterback Matthew Stafford earned his first Associated Press first-team All-Pro honor for the 2025 season, announced January 2026, after throwing for an NFL-leading 4,707 yards and 46 touchdowns. Drake Maye earned second-team honors; Josh Allen received another first-team vote and Lamar Jackson made the first team for 2024, not 2025.",
    evidence: [{ authority: "Associated Press via NFL", url: "https://www.nfl.com/news/2025-all-pro-team-matthew-stafford-bijan-robinson-jaxon-smith-njigba-highlight-roster", supportingDetail: "AP/NFL All-Pro announcement confirms Stafford was first-team quarterback in 2025, his first selection in 17 seasons; Maye was second team, Jackson previous year." }],
  },
  "ufc:2:1": {
    id: "millionaire-ufc-future-woodley-lawler-ufc201-q2", type: "welterweight-title-changes",
    prompt: "Who knocked out Robbie Lawler in the opening round of UFC 201 to capture the welterweight championship?",
    choices: ["Tyron Woodley", "Stephen Thompson", "Carlos Condit", "Johny Hendricks"], answer: "Tyron Woodley",
    statSheet: "An overhand right ended the July 2016 Atlanta main event after just over two minutes.",
    explanation: "Tyron Woodley knocked out Robbie Lawler at 2:12 of Round 1 in the UFC 201 main event on July 30, 2016, claiming the UFC welterweight championship. The former Strikeforce contender became the ninth undisputed champion in the 170-pound division.",
    evidence: [{ authority: "UFC official results", url: "https://www.ufc.com/news/woodley-kos-lawler-one-take-title", supportingDetail: "UFC reports Woodley knocked out Lawler in Round 1 at 2:12 in Atlanta in July 2016 to become welterweight champion." }],
  },
  "ufc:1:7": {
    id: "millionaire-ufc-future-ufc217-triple-title-changes-q8", type: "ufc-card-history",
    prompt: "Which UFC pay-per-view produced THREE new champions on one night: Georges St-Pierre, TJ Dillashaw and Rose Namajunas?",
    choices: ["UFC 217", "UFC 205", "UFC 259", "UFC 268"], answer: "UFC 217",
    statSheet: null,
    explanation: "At UFC 217 on November 4, 2017, in Madison Square Garden, Georges St-Pierre submitted Michael Bisping for the middleweight title, TJ Dillashaw stopped Cody Garbrandt for the bantamweight belt, and Rose Namajunas stopped Joanna Jędrzejczyk to capture strawweight gold. Three championship fights produced three new champions.",
    evidence: [{ authority: "UFC official event recap", url: "https://www.ufc.com/news/ufc-217-bisping-vs-st-pierre-final-results", supportingDetail: "UFC 217 results confirm St-Pierre, Dillashaw and Namajunas each dethroned the champion in their championship fights on November 4, 2017." }],
  },

  // All nine previously untracked retained UFC legacy slots; opt-in preview only.
  "ufc:0:1": {
    id: "millionaire-ufc-future-pereira-adesanya-ufc281-q2", type: "middleweight-title-comebacks",
    prompt: "Who stopped Israel Adesanya in Round 5 of their UFC 281 title fight to become UFC middleweight champion?",
    choices: ["Alex Pereira","Robert Whittaker","Sean Strickland","Marvin Vettori"], answer: "Alex Pereira",
    statSheet: "The November 2022 championship fight took place at Madison Square Garden, with the challenger trailing on the scorecards entering Round 5.", explanation: "Alex Pereira stopped Israel Adesanya by TKO with punches 2:01 into Round 5 of the UFC 281 main event on November 12, 2022. Pereira captured the middleweight championship in only his fourth UFC appearance after rallying late.",
    evidence: [{authority: "UFC 281 official results", url: "https://www.ufc.com/news/ufc-281-adesanya-vs-pereira-esparza-vs-zhang-results-winner-interviews", supportingDetail: "Alex Pereira stopped Israel Adesanya by TKO with punches 2:01 into Round 5 of the UFC 281 main event on November 12, 2022. Pereira captured the middleweight championship in only his fourth UFC appearance after rallying late."}],
  },
  "ufc:1:1": {
    id: "millionaire-ufc-jones-miocic-ufc309-q2", type: "heavyweight-title-finishes",
    prompt: "Who stopped Stipe Miocic with a spinning back kick and punches to defend the heavyweight title at UFC 309?", choices: ["Jon Jones","Francis Ngannou","Tom Aspinall","Daniel Cormier"], answer: "Jon Jones",
    statSheet: "The November 2024 fight at Madison Square Garden ended in Round 3.", explanation: "Jon Jones defended the UFC heavyweight championship by stopping Stipe Miocic with a spinning back kick followed by punches at 4:29 of Round 3 at UFC 309 on November 16, 2024. Miocic announced his retirement after the bout.",
    evidence: [{authority: "UFC 309 official results", url: "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-309-jones-vs-miocic", supportingDetail: "Jon Jones defended the UFC heavyweight championship by stopping Stipe Miocic with a spinning back kick followed by punches at 4:29 of Round 3 at UFC 309 on November 16, 2024. Miocic announced his retirement after the bout."}],
  },
  "ufc:1:6": {
    id: "millionaire-ufc-future-retained-benson-henderson-preceded-pettis-q7", type: "lightweight-lineage",
    prompt: "Who held the UFC lightweight championship immediately before Anthony Pettis captured it at UFC 164?",
    choices: ["Benson Henderson", "Frankie Edgar", "Rafael dos Anjos", "Gilbert Melendez"], answer: "Benson Henderson",
    statSheet: "The new champion submitted his former WEC rival by armbar in the first round in Milwaukee in August 2013.", explanation: "Anthony Pettis submitted incumbent lightweight champion Benson Henderson in Round 1 of UFC 164 on August 31, 2013. Henderson had previously held the belt after beating Frankie Edgar; Pettis' win began his 2013–15 UFC lightweight title reign.",
    evidence: [{ authority: "UFC lightweight title lineage", url: "https://www.ufc.com/news/ufc-lightweight-title-lineage-khabib-mcgregor-penn-poirier-oliveira", supportingDetail: "Anthony Pettis submitted incumbent lightweight champion Benson Henderson in Round 1 of UFC 164 on August 31, 2013. Henderson had previously held the belt after beating Frankie Edgar; Pettis' win began his 2013–15 UFC lightweight title reign." }],
  },
  "ufc:2:5": {
    id: "millionaire-ufc-ferguson-kevin-lee-ufc216-q6", type: "interim-lightweight-title-history",
    prompt: "Who submitted Kevin Lee in Round 3 at UFC 216 to win the interim UFC lightweight championship?",
    choices: ["Tony Ferguson","Dustin Poirier","Justin Gaethje","Eddie Alvarez"], answer: "Tony Ferguson",
    statSheet: "The October 2017 main event ended with a triangle choke at T-Mobile Arena.", explanation: "Tony Ferguson submitted Kevin Lee by triangle choke in the third round at UFC 216 on October 7, 2017, to claim the interim lightweight championship. It marked Ferguson's tenth consecutive win in the promotion.",
    evidence: [{authority: "UFC 216 official event recap", url: "https://www.ufc.com/news/ferguson-claims-interim-lightweight-belt-calls-out-mcgregor", supportingDetail: "Tony Ferguson submitted Kevin Lee by triangle choke in the third round at UFC 216 on October 7, 2017, to claim the interim lightweight championship. It marked Ferguson's tenth consecutive win in the promotion."}],
  },
  "ufc:3:1": {
    id: "millionaire-ufc-future-retained-joanna-loss-namajunas-217-q2", type: "strawweight-title-upsets",
    prompt: "Which previously unbeaten champion did Rose Namajunas knock out to capture the strawweight belt at UFC 217?",
    choices: ["Joanna Jedrzejczyk", "Jessica Andrade", "Zhang Weili", "Carla Esparza"], answer: "Joanna Jedrzejczyk",
    statSheet: "The Madison Square Garden upset came at 3:03 of Round 1 in November 2017.", explanation: "Rose Namajunas knocked out then-unbeaten strawweight champion Joanna Jędrzejczyk at 3:03 of the first round at UFC 217 on November 4, 2017, breaking one of the division's longest reigning champions' streaks.",
    evidence: [{ authority: "UFC 217 results", url: "https://www.ufc.com/news/ufc-217-bisping-vs-st-pierre-final-results", supportingDetail: "Rose Namajunas knocked out then-unbeaten strawweight champion Joanna Jędrzejczyk at 3:03 of the first round at UFC 217 on November 4, 2017, breaking one of the division's longest reigning champions' streaks." }],
  },
  "ufc:3:2": {
    id: "millionaire-ufc-future-retained-couture-first-two-divisions-q3", type: "two-weight-champions",
    prompt: "Who became the first UFC athlete to win championships in both heavyweight and light heavyweight?",
    choices: ["Randy Couture", "B.J. Penn", "Conor McGregor", "Dan Henderson"], answer: "Randy Couture",
    statSheet: "The pioneering champion captured UFC heavyweight gold in 1997 and a second division's belt in September 2003.", explanation: "Randy Couture first claimed UFC heavyweight gold at UFC Japan on December 21, 1997, and added the light heavyweight championship at UFC 44 on September 26, 2003, making him the first UFC champion in two weight classes.",
    evidence: [{ authority: "UFC's two-division champion history", url: "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250", supportingDetail: "Randy Couture first claimed UFC heavyweight gold at UFC Japan on December 21, 1997, and added the light heavyweight championship at UFC 44 on September 26, 2003, making him the first UFC champion in two weight classes." }],
  },
  "ufc:4:5": {
    id: "millionaire-ufc-future-retained-cruz-dillashaw-2016-title-q6", type: "bantamweight-comebacks",
    prompt: "Which defending champion did Dominick Cruz edge by split decision to reclaim the bantamweight title in January 2016?",
    choices: ["T.J. Dillashaw", "Cody Garbrandt", "Urijah Faber", "Renan Barao"], answer: "T.J. Dillashaw",
    statSheet: "The five-round Boston bout ended with scorecards of 48–47, 49–46, and 46–49.", explanation: "Dominick Cruz defeated T.J. Dillashaw by split decision at UFC Fight Night in Boston on January 17, 2016, reclaiming the UFC bantamweight belt after multiple years of injuries and inactivity. The judges scored the five-round matchup 48–47, 49–46 and 46–49.",
    evidence: [{ authority: "UFC official Dillashaw–Cruz results", url: "https://www.ufc.com/news/fight-night-dillashaw-vs-cruz-final-results", supportingDetail: "Dominick Cruz defeated T.J. Dillashaw by split decision at UFC Fight Night in Boston on January 17, 2016, reclaiming the UFC bantamweight belt after multiple years of injuries and inactivity. The judges scored the five-round matchup 48–47, 49–46 and 46–49." }],
  },
  "ufc:5:6": {
    id: "millionaire-ufc-future-retained-aldo-inaugural-ufc-featherweight-q7", type: "division-history",
    prompt: "Who was awarded the UFC's inaugural featherweight championship in 2010 when the WEC division joined the UFC?",
    choices: ["Jose Aldo", "Urijah Faber", "Chad Mendes", "Mike Brown"], answer: "Jose Aldo",
    statSheet: "The incoming champion won WEC gold in 2009 and defended it twice before the UFC transition.", explanation: "José Aldo received the UFC's first featherweight championship belt in November 2010 while already reigning as WEC featherweight champion. He had won that WEC belt in November 2009 and was unbeaten in all eight of his WEC appearances.",
    evidence: [{ authority: "José Aldo UFC official fighter history", url: "https://www.ufc.com/athlete/jose-aldo", supportingDetail: "José Aldo received the UFC's first featherweight championship belt in November 2010 while already reigning as WEC featherweight champion. He had won that WEC belt in November 2009 and was unbeaten in all eight of his WEC appearances." }],
  },
  "ufc:9:4": {
    id: "millionaire-ufc-future-retained-joanna-shevchenko-231-title-q5", type: "women-flyweight-lineage",
    prompt: "Who lost to Valentina Shevchenko by unanimous decision in the vacant flyweight title bout at UFC 231?",
    choices: ["Joanna Jedrzejczyk", "Jessica Eye", "Katlyn Chookagian", "Lauren Murphy"], answer: "Joanna Jedrzejczyk",
    statSheet: "The December 2018 co-main event in Toronto went all five rounds and ended 49–46 on every card.", explanation: "Valentina Shevchenko defeated former strawweight champion Joanna Jędrzejczyk by unanimous decision, 49–46 on all three cards, at UFC 231 on December 8, 2018, taking the women's flyweight belt vacated by Nicco Montaño.",
    evidence: [{ authority: "UFC women's flyweight title lineage", url: "https://www.ufc.com/news/ufc-womens-flyweight-title-lineage", supportingDetail: "Valentina Shevchenko defeated former strawweight champion Joanna Jędrzejczyk by unanimous decision, 49–46 on all three cards, at UFC 231 on December 8, 2018, taking the women's flyweight belt vacated by Nicco Montaño." }],
  },

  // End a late-round career-volume oddity with the Giants' documented Super Bowl XXV QB story.
  "nfl:0:6": {
    id: "millionaire-nfl-future-jeff-hostetler-super-bowl-xxv-q7", type: "super-bowl-backup-heroes",
    prompt: "Which backup quarterback replaced injured Phil Simms and started the Giants' Super Bowl XXV victory over Buffalo?",
    choices: ["Jeff Hostetler", "Kerry Collins", "Dave Brown", "Kent Graham"], answer: "Jeff Hostetler",
    statSheet: "The 1990 champions beat Buffalo 20–19 when Scott Norwood's last-second attempt missed wide right.",
    explanation: "After Phil Simms fractured his foot late in the 1990 season, Jeff Hostetler replaced him as New York's starter and guided the Giants through the playoffs to a 20–19 victory over Buffalo in Super Bowl XXV on January 27, 1991. He was the unlikely starting quarterback for the Giants' second Super Bowl title.",
    evidence: [{ authority: "New York Giants", url: "https://www.giants.com/news/phil-ing-the-void", supportingDetail: "Giants original 1990 season retrospective confirms Simms broke his foot December 15, Hostetler replaced him, and New York won Super Bowl XXV over Buffalo." }],
  },

  // Source-reviewed original NFL preview positions; run 1 Q3 diversifies early draft-heavy pacing.
  "nfl:0:0": {
    id: "millionaire-2020-burrow-first-overall-future-q1", type: "draft",
    prompt: "Which quarterback did Cincinnati select first overall in the 2020 NFL Draft?",
    choices: ["Joe Burrow", "Tua Tagovailoa", "Justin Herbert", "Chase Young"], answer: "Joe Burrow",
    statSheet: "The quarterback won the 2019 Heisman while leading LSU to a national championship.", explanation: "The Cincinnati Bengals selected Joe Burrow out of LSU with the No. 1 overall pick in the April 2020 NFL Draft. Burrow had won the Heisman and the national championship at LSU after throwing 60 touchdown passes in the 2019 college season.",
    evidence: [{ authority: "NFL / NFL statistics / Pro Football Hall of Fame / official club history", url: "https://www.nfl.com/news/cincinnati-bengals-pick-joe-burrow-no-1-in-2020-draft-0ap3000001110800", supportingDetail: "The Cincinnati Bengals selected Joe Burrow out of LSU with the No. 1 overall pick in the April 2020 NFL Draft. Burrow had won the Heisman and the national championship at LSU after throwing 60 touchdown passes in the 2019 college season." }],
  },
  "nfl:0:2": {
    id: "millionaire-josh-jacobs-2022-rushing-future-q3", type: "rushing-titles",
    prompt: "Who led the NFL in rushing yards in the 2022 regular season?",
    choices: ["Josh Jacobs", "Derrick Henry", "Nick Chubb", "Saquon Barkley"], answer: "Josh Jacobs",
    statSheet: "The Raiders running back logged 1,653 rushing yards and 12 rushing touchdowns.", explanation: "Josh Jacobs rushed for an NFL-leading 1,653 yards on 340 carries for Las Vegas during the 2022 regular season, finishing ahead of Derrick Henry (1,538), Nick Chubb (1,525), and Saquon Barkley (1,312).",
    evidence: [{ authority: "NFL / NFL statistics / Pro Football Hall of Fame / official club history", url: "https://www.nfl.com/stats/player-stats/category/rushing/2022/REG/all/rushingyards/desc", supportingDetail: "Josh Jacobs rushed for an NFL-leading 1,653 yards on 340 carries for Las Vegas during the 2022 regular season, finishing ahead of Derrick Henry (1,538), Nick Chubb (1,525), and Saquon Barkley (1,312)." }],
  },
  "nfl:1:0": {
    id: "millionaire-peyton-manning-1998-colts-future-q1", type: "draft",
    prompt: "Which franchise drafted Peyton Manning first overall in 1998?",
    choices: ["Colts", "Chargers", "Broncos", "Titans"], answer: "Colts",
    statSheet: "The quarterback spent 14 seasons with Indianapolis before finishing his career in Denver.", explanation: "Indianapolis drafted Peyton Manning with the first overall selection in 1998. Manning played 14 seasons for the Colts, winning Super Bowl XLI, before joining the Denver Broncos in 2012 for the final four seasons of his career.",
    evidence: [{ authority: "NFL / NFL statistics / Pro Football Hall of Fame / official club history", url: "https://www.profootballhof.com/players/peyton-manning", supportingDetail: "Indianapolis drafted Peyton Manning with the first overall selection in 1998. Manning played 14 seasons for the Colts, winning Super Bowl XLI, before joining the Denver Broncos in 2012 for the final four seasons of his career." }],
  },
  "nfl:1:1": {
    id: "millionaire-von-miller-super-bowl-50-mvp-future-q2", type: "super-bowl-awards",
    prompt: "Which Broncos defender earned Super Bowl 50 MVP after Denver defeated Carolina?",
    choices: ["Von Miller", "DeMarcus Ware", "Malik Jackson", "Danny Trevathan"], answer: "Von Miller",
    statSheet: "The winning edge rusher delivered 2.5 sacks and forced two fumbles in a 24–10 victory.", explanation: "Denver linebacker Von Miller was named Super Bowl 50 MVP on February 7, 2016, after his 2.5 sacks and two forced fumbles helped the Broncos beat Carolina 24–10. One of his strip-sacks led to the Broncos' first touchdown.",
    evidence: [{ authority: "NFL / NFL statistics / Pro Football Hall of Fame / official club history", url: "https://www.nfl.com/news/broncos-lb-von-miller-named-super-bowl-50-mvp-0ap3000000634374", supportingDetail: "Denver linebacker Von Miller was named Super Bowl 50 MVP on February 7, 2016, after his 2.5 sacks and two forced fumbles helped the Broncos beat Carolina 24–10. One of his strip-sacks led to the Broncos' first touchdown." }],
  },
  "nfl:1:2": {
    id: "millionaire-nfl-moss-vikings-first-round-draft-q3", type: "draft-history", prompt: "Which franchise drafted Randy Moss 21st overall in the 1998 NFL Draft?",
    choices: ["Vikings","Cowboys","Patriots","Raiders"], answer: "Vikings",
    statSheet: "The Marshall receiver caught 17 touchdown passes in his rookie season.", explanation: "Minnesota selected Randy Moss from Marshall with the 21st pick of the 1998 NFL Draft. Moss caught 17 touchdown passes as an offensive rookie sensation for the Vikings before his later record-setting stint with New England.",
    evidence: [{ authority: "Minnesota Vikings", url: "https://www.vikings.com/history/all-time-draft-classes", supportingDetail: "Minnesota selected Randy Moss from Marshall with the 21st pick of the 1998 NFL Draft. Moss caught 17 touchdown passes as an offensive rookie sensation for the Vikings before his later record-setting stint with New England." }],
  },
  "nfl:2:0": {
    id: "millionaire-nfl-andre-johnson-texans-career-q1", type: "franchise-history",
    prompt: "Which team did Hall of Fame receiver Andre Johnson play his first 12 NFL seasons for?",
    choices: ["Texans", "Colts", "Titans", "Jaguars"], answer: "Texans",
    statSheet: "The receiver entered the league as the No. 3 overall selection in the 2003 draft.",
    explanation: "Andre Johnson played his first 12 NFL seasons for the Houston Texans from 2003 through 2014. Houston drafted him third overall in 2003, and he later finished his career with Indianapolis and Tennessee.",
    evidence: [{ authority: "Pro Football Hall of Fame", url: "https://www.profootballhof.com/players/andre-johnson", supportingDetail: "Andre Johnson played his first 12 NFL seasons for the Houston Texans from 2003 through 2014. Houston drafted him third overall in 2003, and he later finished his career with Indianapolis and Tennessee." }],
  },
  "nfl:4:0": {
    id: "millionaire-jerry-rice-1985-draft-future-q1", type: "draft",
    prompt: "Which franchise selected Jerry Rice 16th overall in the 1985 NFL Draft?",
    choices: ["49ers", "Cowboys", "Raiders", "Seahawks"], answer: "49ers",
    statSheet: "San Francisco traded up to select the Mississippi Valley State receiver in Round 1.", explanation: "The San Francisco 49ers took Jerry Rice out of Mississippi Valley State at No. 16 in the 1985 NFL Draft. Rice became the centerpiece of three San Francisco Super Bowl winners and retired as the NFL's career receiving-yards leader.",
    evidence: [{ authority: "NFL / NFL statistics / Pro Football Hall of Fame / official club history", url: "https://www.profootballhof.com/football-history/nfl-draft-history/1940/1985", supportingDetail: "The San Francisco 49ers took Jerry Rice out of Mississippi Valley State at No. 16 in the 1985 NFL Draft. Rice became the centerpiece of three San Francisco Super Bowl winners and retired as the NFL's career receiving-yards leader." }],
  },
  "nfl:4:4": {
    id: "millionaire-calvin-johnson-2012-yards-future-q5", type: "receiving-records",
    prompt: "Which receiver set the NFL single-season receiving-yards record with 1,964 in 2012?",
    choices: ["Calvin Johnson", "Andre Johnson", "Brandon Marshall", "Demaryius Thomas"], answer: "Calvin Johnson",
    statSheet: "The Detroit wideout caught 122 passes that year but recorded only five receiving touchdowns.", explanation: "Calvin Johnson caught 122 passes for 1,964 yards with the Detroit Lions in 2012, setting the NFL's single-season receiving-yards record. Andre Johnson finished second that season with 1,598 yards, while Brandon Marshall had 1,508 and Demaryius Thomas 1,434.",
    evidence: [{ authority: "NFL / NFL statistics / Pro Football Hall of Fame / official club history", url: "https://www.nfl.com/stats/player-stats/category/receiving/2012/reg/all/receivingyards/desc", supportingDetail: "Calvin Johnson caught 122 passes for 1,964 yards with the Detroit Lions in 2012, setting the NFL's single-season receiving-yards record. Andre Johnson finished second that season with 1,598 yards, while Brandon Marshall had 1,508 and Demaryius Thomas 1,434." }],
  },
  "nfl:5:4": {
    id: "millionaire-nfl-malcolm-smith-super-bowl-xlviii-mvp-q5", type: "super-bowl-defense", prompt: "Which Seahawks linebacker was named MVP of Super Bowl XLVIII after returning an interception for a touchdown against Denver?",
    choices: ["Malcolm Smith","Bobby Wagner","K.J. Wright","Bruce Irvin"], answer: "Malcolm Smith",
    statSheet: "His 69-yard pick-six helped Seattle build a 22–0 first-half lead.", explanation: "Seattle linebacker Malcolm Smith intercepted Peyton Manning and returned it 69 yards for a touchdown in Super Bowl XLVIII on February 2, 2014. Smith added a fumble recovery and nine tackles to earn MVP honors in the Seahawks' 43–8 victory.",
    evidence: [{ authority: "Seattle Seahawks", url: "https://www.seahawks.com/news/super-bowl-xlviii-10-years-later-whenever-you-think-about-the-seattle-seahawks-you-re-going-to-think-about-this-team", supportingDetail: "Seattle linebacker Malcolm Smith intercepted Peyton Manning and returned it 69 yards for a touchdown in Super Bowl XLVIII on February 2, 2014. Smith added a fumble recovery and nine tackles to earn MVP honors in the Seahawks' 43–8 victory." }],
  },
  "nfl:6:0": {
    id: "millionaire-nfl-mccaffrey-2022-trade-q1", type: "roster-history",
    prompt: "Which NFL franchise acquired Christian McCaffrey in an October 2022 trade with Carolina?",
    choices: ["49ers", "Eagles", "Bills", "Dolphins"], answer: "49ers",
    statSheet: "The midseason acquisition involved 2023 draft picks and a 2024 fifth-rounder.",
    explanation: "San Francisco acquired running back Christian McCaffrey from the Carolina Panthers on October 21, 2022, for four draft picks. He joined the 49ers after spending his first six seasons in Carolina.",
    evidence: [{ authority: "San Francisco 49ers", url: "https://www.49ers.com/news/49ers-announce-trade-for-running-back-christian-mccaffrey-panthers-nfl", supportingDetail: "San Francisco acquired running back Christian McCaffrey from the Carolina Panthers on October 21, 2022, for four draft picks. He joined the 49ers after spending his first six seasons in Carolina." }],
  },

  "cfb:0:0": { id:"millionaire-cfb-heisman-reviewed-0-0", type:"awards", prompt:"Who won the 2019 Heisman Trophy?", choices:["Joe Burrow","Jalen Hurts","Justin Fields","Chase Young"], answer:"Joe Burrow", statSheet:"The winner led LSU to an undefeated national championship season.", explanation:"Joe Burrow won the 2019 Heisman Trophy as LSU's senior quarterback. He defeated Jalen Hurts, Justin Fields and Chase Young in balloting before leading LSU to a 15–0 national championship season.", evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Joe Burrow won the 2019 Heisman Trophy as LSU's senior quarterback. He defeated Jalen Hurts, Justin Fields and Chase Young in balloting before leading LSU to a 15–0 national championship season."}] },
  "cfb:0:3": { id:"millionaire-cfb-heisman-reviewed-0-3", type:"chronology", prompt:"Which of these Heisman winners won the award most recently?", choices:["Marcus Mariota","Baker Mayfield","Joe Burrow","Bryce Young"], answer:"Bryce Young", statSheet:"The answer became Alabama's first quarterback to win the Heisman.", explanation:"Bryce Young won the 2021 Heisman Trophy with Alabama, the most recent of the options. Marcus Mariota won in 2014, Baker Mayfield in 2017 and Joe Burrow in 2019.", evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Bryce Young won the 2021 Heisman Trophy with Alabama, the most recent of the options. Marcus Mariota won in 2014, Baker Mayfield in 2017 and Joe Burrow in 2019."}] },
  "cfb:1:1": { id:"millionaire-cfb-heisman-reviewed-1-1", type:"awards", prompt:"Who won the 2013 Heisman Trophy?", choices:["Jameis Winston","AJ McCarron","Jordan Lynch","Johnny Manziel"], answer:"Jameis Winston", statSheet:"The winner was a redshirt freshman quarterback for Florida State.", explanation:"Jameis Winston won the 2013 Heisman Trophy as Florida State's redshirt freshman quarterback, finishing ahead of Alabama quarterback AJ McCarron and fellow finalists Jordan Lynch and Johnny Manziel.", evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Jameis Winston won the 2013 Heisman Trophy as Florida State's redshirt freshman quarterback, finishing ahead of Alabama quarterback AJ McCarron and fellow finalists Jordan Lynch and Johnny Manziel."}] },
  "cfb:2:1": { id:"millionaire-cfb-heisman-reviewed-2-1", type:"awards", prompt:"Who won the 2020 Heisman Trophy?", choices:["DeVonta Smith","Mac Jones","Trevor Lawrence","Kyle Trask"], answer:"DeVonta Smith", statSheet:"The winner was Alabama's first wide receiver to take the award.", explanation:"DeVonta Smith became the first wide receiver to win the Heisman Trophy since 1991 when he earned the 2020 award for Alabama. The other finalists were quarterbacks.", evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"DeVonta Smith became the first wide receiver to win the Heisman Trophy since 1991 when he earned the 2020 award for Alabama. The other finalists were quarterbacks."}] },
  "cfb:3:1": { id:"millionaire-cfb-heisman-reviewed-3-1", type:"awards", prompt:"Who won the 2003 Heisman Trophy?", choices:["Jason White","Larry Fitzgerald","Eli Manning","Chris Perry"], answer:"Jason White", statSheet:"The winner quarterbacked Oklahoma.", explanation:"Jason White won the 2003 Heisman Trophy after directing the Oklahoma offense, ahead of Pittsburgh receiver Larry Fitzgerald, Ole Miss quarterback Eli Manning and Michigan running back Chris Perry.", evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Jason White won the 2003 Heisman Trophy after directing the Oklahoma offense, ahead of Pittsburgh receiver Larry Fitzgerald, Ole Miss quarterback Eli Manning and Michigan running back Chris Perry."}] },

  "cfb:4:1": {id:"millionaire-cfb-heisman-source-r4-q1",type:"awards",prompt:"Who won the 2014 Heisman Trophy?",choices:["Marcus Mariota","Amari Cooper","Melvin Gordon","Trevone Boykin"],answer:"Marcus Mariota",statSheet:"The winner was Oregon's first Heisman Trophy recipient.",explanation:"Marcus Mariota of Oregon won the 2014 Heisman Trophy, ahead of Alabama receiver Amari Cooper and Wisconsin running back Melvin Gordon.",evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Marcus Mariota of Oregon won the 2014 Heisman Trophy, ahead of Alabama receiver Amari Cooper and Wisconsin running back Melvin Gordon."}]},
  "cfb:5:1": {id:"millionaire-cfb-heisman-source-r5-q1",type:"awards",prompt:"Who won the 2022 Heisman Trophy?",choices:["Caleb Williams","C.J. Stroud","Max Duggan","Stetson Bennett"],answer:"Caleb Williams",statSheet:"The winner quarterbacked USC.",explanation:"USC quarterback Caleb Williams won the 2022 Heisman Trophy after transferring from Oklahoma; TCU's Max Duggan finished second.",evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"USC quarterback Caleb Williams won the 2022 Heisman Trophy after transferring from Oklahoma; TCU's Max Duggan finished second."}]},
  "cfb:6:0": {id:"millionaire-cfb-heisman-source-r6-q0",type:"awards",prompt:"Who won the 2008 Heisman Trophy?",choices:["Sam Bradford","Tim Tebow","Colt McCoy","Graham Harrell"],answer:"Sam Bradford",statSheet:"The winner quarterbacked Oklahoma to the BCS Championship Game.",explanation:"Oklahoma quarterback Sam Bradford won the 2008 Heisman Trophy, ahead of Colt McCoy and Tim Tebow in the final vote.",evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Oklahoma quarterback Sam Bradford won the 2008 Heisman Trophy, ahead of Colt McCoy and Tim Tebow in the final vote."}]},
  "cfb:7:1": {id:"millionaire-cfb-heisman-source-r7-q1",type:"awards",prompt:"Who won the 2015 Heisman Trophy?",choices:["Derrick Henry","Christian McCaffrey","Deshaun Watson","Baker Mayfield"],answer:"Derrick Henry",statSheet:"The winner broke the SEC single-season rushing record.",explanation:"Alabama running back Derrick Henry won the 2015 Heisman Trophy ahead of Christian McCaffrey and Deshaun Watson.",evidence:[{authority:"Heisman Trophy Trust",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Alabama running back Derrick Henry won the 2015 Heisman Trophy ahead of Christian McCaffrey and Deshaun Watson."}]},
  "cfb:9:1": {
    id: "millionaire-cfb-hurts-2019-transfer-q2", type: "college-transfers",
    prompt: "Which college did Jalen Hurts transfer to for his final football season in 2019?",
    choices: ["Oklahoma", "LSU", "Texas", "Florida State"], answer: "Oklahoma",
    statSheet: "The quarterback enrolled as a graduate transfer after three seasons at Alabama.",
    explanation: "Jalen Hurts transferred from Alabama to Oklahoma as a graduate student in January 2019. He started for Lincoln Riley's Sooners in his final college season, finishing as the 2019 Heisman Trophy runner-up.",
    evidence: [{ authority: "University of Oklahoma Athletics", url: "https://soonersports.com/news/2019/1/22/211787444?path=football", supportingDetail: "Jalen Hurts transferred from Alabama to Oklahoma as a graduate student in January 2019. He started for Lincoln Riley's Sooners in his final college season, finishing as the 2019 Heisman Trophy runner-up." }],
  },

  "nfl:2:2":{id:"millionaire-nfl-future-fact-review-2-2",type:"awards",prompt:"Who won AP Offensive Rookie of the Year in 1998?",choices:["Randy Moss","Peyton Manning","Fred Taylor","Robert Edwards"],answer:"Randy Moss",statSheet:"The winner led the NFL with 17 receiving touchdowns.",explanation:"Randy Moss won AP Offensive Rookie of the Year for Minnesota in 1998 after setting a rookie receiving-touchdown mark with a league-high 17 scores. He was the Vikings' 21st overall draft pick from Marshall.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/randy-moss-first-wr-named-to-nfl-100-all-time-team-0ap3000001088975",supportingDetail:"Randy Moss won AP Offensive Rookie of the Year for Minnesota in 1998 after setting a rookie receiving-touchdown mark with a league-high 17 scores. He was the Vikings' 21st overall draft pick from Marshall."}]},
  "nfl:2:4":{id:"millionaire-nfl-future-fact-review-2-4",type:"awards-history",prompt:"Which quarterback won three consecutive AP NFL MVP awards?",choices:["Brett Favre","Peyton Manning","Aaron Rodgers","Tom Brady"],answer:"Brett Favre",statSheet:"All three awards came while he was quarterbacking Green Bay.",explanation:"Brett Favre was voted the NFL's Most Valuable Player in three straight seasons from 1995 through 1997 while quarterbacking the Green Bay Packers, a unique streak in league history.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/players/brett-favre",supportingDetail:"Brett Favre was voted the NFL's Most Valuable Player in three straight seasons from 1995 through 1997 while quarterbacking the Green Bay Packers, a unique streak in league history."}]},
  "nfl:3:1":{id:"millionaire-nfl-future-fact-review-3-1",type:"team-era",prompt:"Who quarterbacked the 1999 \"Greatest Show on Turf\" Rams?",choices:["Kurt Warner","Trent Green","Marc Bulger","Steve McNair"],answer:"Kurt Warner",statSheet:"The quarterback also won league MVP that season.",explanation:"Kurt Warner led the 1999 St. Louis Rams' Greatest Show on Turf attack with 4,353 passing yards and 41 touchdowns. The team went 13–3 and defeated the Titans 23–16 in Super Bowl XXXIV.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/players/kurt-warner",supportingDetail:"Kurt Warner led the 1999 St. Louis Rams' Greatest Show on Turf attack with 4,353 passing yards and 41 touchdowns. The team went 13–3 and defeated the Titans 23–16 in Super Bowl XXXIV."}]},
  "nfl:4:2":{id:"millionaire-nfl-future-fact-review-4-2",type:"rookie-awards",prompt:"Who won AP Offensive Rookie of the Year in 2004?",choices:["Ben Roethlisberger","Eli Manning","Philip Rivers","Larry Fitzgerald"],answer:"Ben Roethlisberger",statSheet:"The winner went 13-0 as a rookie starter.",explanation:"Ben Roethlisberger won AP Offensive Rookie of the Year in 2004, becoming an undefeated 13–0 starter for Pittsburgh during the regular season after replacing Tommy Maddox.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/steelers-qb-ben-roethlisberger-officially-announces-retirement-after-18-seasons",supportingDetail:"Ben Roethlisberger won AP Offensive Rookie of the Year in 2004, becoming an undefeated 13–0 starter for Pittsburgh during the regular season after replacing Tommy Maddox."}]},
  "nfl:4:3":{id:"millionaire-nfl-future-fact-review-4-3",type:"career-history",prompt:"Which team did Randy Moss play for immediately before joining New England?",choices:["Raiders","Vikings","Titans","49ers"],answer:"Raiders",statSheet:"His stop there lasted two seasons.",explanation:"Randy Moss played for the Oakland Raiders in the 2005 and 2006 seasons after leaving Minnesota. New England acquired him by trade in 2007, when he caught a record 23 touchdown passes.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/randy-moss-first-wr-named-to-nfl-100-all-time-team-0ap3000001088975",supportingDetail:"Randy Moss played for the Oakland Raiders in the 2005 and 2006 seasons after leaving Minnesota. New England acquired him by trade in 2007, when he caught a record 23 touchdown passes."}]},
  "nfl:5:1": {
    id: "millionaire-nfl-joe-thomas-cleveland-career-q2", type: "hall-of-fame-careers", prompt: "Which NFL franchise did Hall of Fame offensive tackle Joe Thomas play his entire 11-season career for?",
    choices: ["Browns","Ravens","Steelers","Bengals"], answer: "Browns",
    statSheet: "He was the third overall selection in the 2007 NFL Draft and earned 10 Pro Bowl selections.", explanation: "Joe Thomas played all 11 NFL seasons from 2007 to 2017 with the Cleveland Browns. Cleveland picked him third overall in 2007; he went on to make ten consecutive Pro Bowls and was enshrined in Canton in 2023.",
    evidence: [{ authority: "Pro Football Hall of Fame", url: "https://www.profootballhof.com/players/joe-thomas", supportingDetail: "Joe Thomas played all 11 NFL seasons from 2007 to 2017 with the Cleveland Browns. Cleveland picked him third overall in 2007; he went on to make ten consecutive Pro Bowls and was enshrined in Canton in 2023." }],
  },
    "nfl:5:3":{id:"millionaire-nfl-future-fact-review-5-3",type:"mvp-season",prompt:"Which quarterback led a 15-1 team while winning AP MVP in 2011?",choices:["Aaron Rodgers","Drew Brees","Tom Brady","Eli Manning"],answer:"Aaron Rodgers",statSheet:"His team earned the NFC's No. 1 seed.",explanation:"Aaron Rodgers won the 2011 AP NFL MVP award after throwing 45 touchdown passes and six interceptions while leading the Packers to a 15–1 regular-season record, although Green Bay lost its first playoff game.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/green-bay-qb-aaron-rodgers-wins-mvp-award-09000d5d8269ea19",supportingDetail:"Aaron Rodgers won the 2011 AP NFL MVP award after throwing 45 touchdown passes and six interceptions while leading the Packers to a 15–1 regular-season record, although Green Bay lost its first playoff game."}]},
  "nfl:7:3": {
    id: "millionaire-nfl-terrell-davis-1998-ap-mvp-q4", type: "mvp-rushing-seasons", prompt: "Which Broncos running back won AP NFL MVP for the 1998 season after rushing for 2,008 yards?",
    choices: ["Terrell Davis","Jamal Anderson","Emmitt Smith","Barry Sanders"], answer: "Terrell Davis",
    statSheet: "Denver finished 14–2 and went on to win its second straight Super Bowl.", explanation: "Terrell Davis won the 1998 AP NFL MVP award after rushing for 2,008 yards and 21 touchdowns, helping Denver to a 14–2 regular season and a second consecutive Super Bowl title. He was the fourth player to rush for 2,000 yards in one season.",
    evidence: [{ authority: "NFL / Pro Football Hall of Fame", url: "https://www.nfl.com/_amp/national-football-league-mvps-09000d5d8269ea1b", supportingDetail: "Terrell Davis won the 1998 AP NFL MVP award after rushing for 2,008 yards and 21 touchdowns, helping Denver to a 14–2 regular season and a second consecutive Super Bowl title. He was the fourth player to rush for 2,000 yards in one season." }],
  },

  "cfb:0:6": {id:"millionaire-cfb-future-legacy-reviewed-0-6",type:"playoff-history",prompt:"Which CFP national champion did NOT win its conference championship?",choices:["2014 Ohio State","2016 Clemson","2017 Alabama","2019 LSU"],answer:"2017 Alabama",statSheet:"The answer won the national title on Tua Tagovailoa's overtime touchdown pass to DeVonta Smith.",explanation:"The 2017 Alabama team won the College Football Playoff national title despite not winning the SEC Championship. The Crimson Tide defeated Georgia 26–23 in overtime on January 8, 2018, when freshman Tua Tagovailoa hit DeVonta Smith for the decisive touchdown.",evidence:[{authority:"Official team, CFP, or Heisman Trust history",url:"https://collegefootballplayoff.com/sports/2021/9/7/ncg-recap-2018",supportingDetail:"The 2017 Alabama team won the College Football Playoff national title despite not winning the SEC Championship. The Crimson Tide defeated Georgia 26–23 in overtime on January 8, 2018, when freshman Tua Tagovailoa hit DeVonta Smith for the decisive touchdown."}]},
  "cfb:1:5": {id:"millionaire-cfb-future-legacy-reviewed-1-5",type:"awards-draft",prompt:"Which Heisman winner was selected latest in the NFL Draft?",choices:["Tim Tebow","Johnny Manziel","Lamar Jackson","Joe Burrow"],answer:"Lamar Jackson",statSheet:"The answer won the Heisman while playing at Louisville.",explanation:"Louisville quarterback Lamar Jackson was drafted 32nd overall by Baltimore in 2018. Among these Heisman winners, Tim Tebow was picked 25th, Johnny Manziel 22nd and Joe Burrow first overall; Jackson was selected latest within a single draft.",evidence:[{authority:"Official team, CFP, or Heisman Trust history",url:"https://www.heisman.com/articles/heisman-winners-in-the-nfl-draft/",supportingDetail:"Louisville quarterback Lamar Jackson was drafted 32nd overall by Baltimore in 2018. Among these Heisman winners, Tim Tebow was picked 25th, Johnny Manziel 22nd and Joe Burrow first overall; Jackson was selected latest within a single draft."}]},
  "cfb:1:6": {id:"millionaire-cfb-future-legacy-reviewed-1-6",type:"bcs-history",prompt:"Which BCS national champion won the title despite two regular-season losses?",choices:["2007 LSU","2008 Florida","2010 Auburn","2011 Alabama"],answer:"2007 LSU",statSheet:"The answer won the SEC Championship before beating Ohio State for the title.",explanation:"LSU finished the 2007 regular season with two triple-overtime losses, but beat Tennessee for the SEC title and defeated Ohio State 38–24 in the January 2008 BCS championship. The Tigers finished 12–2 under Les Miles.",evidence:[{authority:"Official team, CFP, or Heisman Trust history",url:"https://lsusports.net/news/2017/10/11/211672612",supportingDetail:"LSU finished the 2007 regular season with two triple-overtime losses, but beat Tennessee for the SEC title and defeated Ohio State 38–24 in the January 2008 BCS championship. The Tigers finished 12–2 under Les Miles."}]},
  "cfb:2:2": {id:"millionaire-cfb-future-legacy-reviewed-2-2",type:"championship",prompt:"Who did Florida State defeat for the 2013 national championship?",choices:["Auburn","Alabama","Oregon","Stanford"],answer:"Auburn",statSheet:"Jameis Winston threw the winning touchdown with 13 seconds left.",explanation:"Florida State beat Auburn 34–31 in the January 6, 2014 BCS title game for the 2013 season. Jameis Winston threw a two-yard winner to Kelvin Benjamin with 13 seconds left, completing a 14–0 championship campaign.",evidence:[{authority:"Official team, CFP, or Heisman Trust history",url:"https://seminoles.com/sports/football/roster/jameis-winston/3109",supportingDetail:"Florida State beat Auburn 34–31 in the January 6, 2014 BCS title game for the 2013 season. Jameis Winston threw a two-yard winner to Kelvin Benjamin with 13 seconds left, completing a 14–0 championship campaign."}]},
  "cfb:3:2": {id:"millionaire-cfb-future-legacy-reviewed-3-2",type:"bowl-history",prompt:"Which team upset Oklahoma in the 2007 Fiesta Bowl?",choices:["Boise State","Utah","TCU","West Virginia"],answer:"Boise State",statSheet:"The winning two-point conversion came on a Statue of Liberty play.",explanation:"Boise State upset Oklahoma 43–42 in overtime in the January 1, 2007 Fiesta Bowl, sealing an unbeaten 13–0 season with Ian Johnson's two-point Statue of Liberty conversion after a touchdown.",evidence:[{authority:"Official team, CFP, or Heisman Trust history",url:"https://broncosports.com/news/2007/1/2/tostitos_fiesta_bowl_champs_",supportingDetail:"Boise State upset Oklahoma 43–42 in overtime in the January 1, 2007 Fiesta Bowl, sealing an unbeaten 13–0 season with Ian Johnson's two-point Statue of Liberty conversion after a touchdown."}]},
  "cfb:5:3": {id:"millionaire-cfb-future-legacy-reviewed-5-3",type:"streak-history",prompt:"Which team ended USC's 34-game winning streak in the 2006 Rose Bowl?",choices:["Texas","UCLA","Notre Dame","Oregon"],answer:"Texas",statSheet:"The winning quarterback scored the decisive touchdown on fourth down.",explanation:"Texas stopped Southern California's 34-game winning streak with a 41–38 win at the January 4, 2006 Rose Bowl. Vince Young scored the decisive eight-yard touchdown on fourth-and-five with 19 seconds remaining.",evidence:[{authority:"Official team, CFP, or Heisman Trust history",url:"https://texaslonghorns.com/news/2006/1/4/010406aaa_835",supportingDetail:"Texas stopped Southern California's 34-game winning streak with a 41–38 win at the January 4, 2006 Rose Bowl. Vince Young scored the decisive eight-yard touchdown on fourth-and-five with 19 seconds remaining."}]},

  "cfb:6:2":{id:"millionaire-cfb-future-source-6-2",type:"playoff-history",prompt:"Who coached Ohio State to the first College Football Playoff title?",choices:["Urban Meyer","Ryan Day","Jim Tressel","Luke Fickell"],answer:"Urban Meyer",statSheet:"The title came in his third season in Columbus.",explanation:"Urban Meyer coached the 2014 Ohio State Buckeyes to the first College Football Playoff national championship, beating Oregon 42–20 on January 12, 2015, in Arlington, Texas.",evidence:[{authority:"Official CFP, NCAA or university athletics",url:"https://collegefootballplayoff.com/sports/2019/5/22/history",supportingDetail:"Urban Meyer coached the 2014 Ohio State Buckeyes to the first College Football Playoff national championship, beating Oregon 42–20 on January 12, 2015, in Arlington, Texas."}]},
  "cfb:6:3":{id:"millionaire-cfb-future-source-6-3",type:"playoff-matchup",prompt:"Who did Georgia defeat in the semifinal before winning the 2021 national championship?",choices:["Michigan","Cincinnati","Notre Dame","Oklahoma"],answer:"Michigan",statSheet:"The semifinal was played at the Orange Bowl.",explanation:"Georgia beat Michigan 34–11 in the December 31, 2021 Orange Bowl semifinal with Stetson Bennett named offensive player of the game. Georgia then defeated Alabama to win the 2021 season's CFP championship.",evidence:[{authority:"Official CFP, NCAA or university athletics",url:"https://collegefootballplayoff.com/sports/2025/8/4/21-SF-Orange-recap",supportingDetail:"Georgia beat Michigan 34–11 in the December 31, 2021 Orange Bowl semifinal with Stetson Bennett named offensive player of the game. Georgia then defeated Alabama to win the 2021 season's CFP championship."}]},
  "cfb:7:2":{id:"millionaire-cfb-future-source-7-2",type:"rose-bowl-comebacks",prompt:"Which team rallied from a 35–21 halftime deficit to beat Utah 48–45 in the January 2022 Rose Bowl?",choices:["Ohio State","Penn State","Michigan","USC"],answer:"Ohio State",statSheet:"The winners got six touchdown passes from C.J. Stroud and a last-minute field goal by Noah Ruggles.",explanation:"Ohio State overcame a 35–21 halftime deficit and defeated Utah 48–45 in the January 1, 2022 Rose Bowl. C.J. Stroud threw for 573 yards and six touchdowns and Noah Ruggles hit the deciding 19-yard field goal.",evidence:[{authority:"Official CFP, NCAA or university athletics",url:"https://ohiostatebuckeyes.com/news/2022/1/1/ohio-state-rose-bowl-recap",supportingDetail:"Ohio State overcame a 35–21 halftime deficit and defeated Utah 48–45 in the January 1, 2022 Rose Bowl. C.J. Stroud threw for 573 yards and six touchdowns and Noah Ruggles hit the deciding 19-yard field goal."}]},
  "cfb:7:4":{id:"millionaire-cfb-future-source-7-4",type:"playoff-history",prompt:"Which major conference had no team in the inaugural College Football Playoff?",choices:["Big 12","SEC","ACC","Big Ten"],answer:"Big 12",statSheet:"TCU and Baylor were both left outside the four-team field.",explanation:"The inaugural four-team College Football Playoff selected Alabama, Oregon, Florida State and Ohio State after the 2014 season; the Big 12 was excluded despite strong TCU and Baylor teams.",evidence:[{authority:"Official CFP, NCAA or university athletics",url:"https://collegefootballplayoff.com/sports/2019/5/22/history",supportingDetail:"The inaugural four-team College Football Playoff selected Alabama, Oregon, Florida State and Ohio State after the 2014 season; the Big 12 was excluded despite strong TCU and Baylor teams."}]},
  "cfb:9:2": {
    id: "millionaire-cfb-bill-snyder-2012-big12-q3", type: "coaching-history",
    prompt: "Which coach led Kansas State to a share of the 2012 Big 12 championship and a Fiesta Bowl berth?",
    choices: ["Bill Snyder", "Gary Patterson", "Mike Gundy", "Art Briles"], answer: "Bill Snyder",
    statSheet: "The Wildcats had an 11–1 regular season and were invited to face Oregon in January 2013.",
    explanation: "Bill Snyder coached Kansas State to an 11–1 regular season and a share of the 2012 Big 12 championship. The Wildcats accepted a Fiesta Bowl invitation to face Oregon after Snyder's second tenure had restored the program to national prominence.",
    evidence: [{ authority: "Kansas State University Athletics", url: "https://www.kstatesports.com/sports/football/roster/coaches/bill-snyder/1258", supportingDetail: "Bill Snyder coached Kansas State to an 11–1 regular season and a share of the 2012 Big 12 championship. The Wildcats accepted a Fiesta Bowl invitation to face Oregon after Snyder's second tenure had restored the program to national prominence." }],
  },
  "cfb:9:5":{id:"millionaire-cfb-future-source-9-5",type:"coaching-history",prompt:"Which coach defeated his former head coach to win his first national championship?",choices:["Kirby Smart","Dabo Swinney","Jimbo Fisher","Ryan Day"],answer:"Kirby Smart",statSheet:"The answer played defensive back at Georgia before beginning his coaching career.",explanation:"Kirby Smart guided Georgia to its first national championship under his leadership by beating Alabama and his former boss Nick Saban 33–18 in the January 2022 CFP final. Smart had been Alabama's defensive coordinator before taking over at Georgia.",evidence:[{authority:"Official CFP, NCAA or university athletics",url:"https://collegefootballplayoff.com/sports/2019/5/22/history",supportingDetail:"Kirby Smart guided Georgia to its first national championship under his leadership by beating Alabama and his former boss Nick Saban 33–18 in the January 2022 CFP final. Smart had been Alabama's defensive coordinator before taking over at Georgia."}]},

  "cfb:0:5":{id:"millionaire-cfb-future-source-pass-0-5",type:"awards-postseason",prompt:"Which Heisman-winning quarterback did NOT win his conference championship in his Heisman season?",choices:["Cam Newton","Joe Burrow","Baker Mayfield","Lamar Jackson"],answer:"Lamar Jackson",statSheet:"The answer became Louisville's first Heisman Trophy winner.",explanation:"Lamar Jackson's 2016 Louisville Cardinals did not win the ACC Atlantic Division. Cam Newton and Joe Burrow won SEC titles in their Heisman seasons, while Baker Mayfield and Oklahoma won the Big 12 in 2017.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://www.heisman.com/articles/lamar-jackson-of-louisville-wins-2016-heisman-trophy/",supportingDetail:"Lamar Jackson's 2016 Louisville Cardinals did not win the ACC Atlantic Division. Cam Newton and Joe Burrow won SEC titles in their Heisman seasons, while Baker Mayfield and Oklahoma won the Big 12 in 2017."}]},
  "cfb:1:2":{id:"millionaire-cfb-future-source-pass-1-2",type:"upset-history",prompt:"Which team pulled off the famous 2007 upset at Michigan?",choices:["Appalachian State","Boise State","Utah","TCU"],answer:"Appalachian State",statSheet:"The winner blocked a field goal on the final play.",explanation:"Appalachian State, then a Football Championship Subdivision program, stunned No. 5 Michigan 34–32 in Ann Arbor on September 1, 2007. Corey Lynch blocked a potential winning Michigan field goal as time ran out.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://appstatesports.com/news/2007/9/1/1544638.aspx",supportingDetail:"Appalachian State, then a Football Championship Subdivision program, stunned No. 5 Michigan 34–32 in Ann Arbor on September 1, 2007. Corey Lynch blocked a potential winning Michigan field goal as time ran out."}]},
  "cfb:1:3":{id:"millionaire-cfb-future-source-pass-1-3",type:"coaching-history",prompt:"Which program did Urban Meyer coach immediately before he became Florida's head coach?",choices:["Utah","Bowling Green","Notre Dame","Cincinnati"],answer:"Utah",statSheet:"Meyer led the Utes to an undefeated 2004 season before taking the Florida job.",explanation:"Urban Meyer coached Utah in 2003 and 2004 and led the Utes to a 12–0 2004 season before taking over at Florida for 2005. His prior head-coaching stop before Utah was Bowling Green.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://floridagators.com/news/2004/12/13/7821",supportingDetail:"Urban Meyer coached Utah in 2003 and 2004 and led the Utes to a 12–0 2004 season before taking over at Florida for 2005. His prior head-coaching stop before Utah was Bowling Green."}]},
  "cfb:2:4":{id:"millionaire-cfb-future-source-pass-2-4",type:"coaching-history",prompt:"Which coach won national championships at both LSU and Alabama?",choices:["Nick Saban","Urban Meyer","Les Miles","Jimbo Fisher"],answer:"Nick Saban",statSheet:"His first title came before he ever coached Alabama.",explanation:"Nick Saban coached LSU to the 2003 season's BCS national championship before taking over Alabama in 2007. He later won six more national championships with the Crimson Tide.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://rolltide.com/news/2007/1/4/Nick_Saban_Named_Head_Football_Coach_at_The_University_of_Alabama",supportingDetail:"Nick Saban coached LSU to the 2003 season's BCS national championship before taking over Alabama in 2007. He later won six more national championships with the Crimson Tide."}]},
  "cfb:2:5":{id:"millionaire-cfb-future-source-pass-2-5",type:"awards-postseason",prompt:"Which Heisman-winning quarterback's team did NOT play for the national championship that season?",choices:["Tim Tebow 2007","Cam Newton 2010","Jameis Winston 2013","Joe Burrow 2019"],answer:"Tim Tebow 2007",statSheet:"The answer became the first sophomore to win the Heisman Trophy.",explanation:"Tim Tebow became the first sophomore Heisman winner in 2007, but Florida did not reach that season's national championship. Cam Newton (2010), Jameis Winston (2013) and Joe Burrow (2019) each quarterbacked national champions during their Heisman seasons.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://www.heisman.com/heisman-winners/tim-tebow/",supportingDetail:"Tim Tebow became the first sophomore Heisman winner in 2007, but Florida did not reach that season's national championship. Cam Newton (2010), Jameis Winston (2013) and Joe Burrow (2019) each quarterbacked national champions during their Heisman seasons."}]},
  "cfb:2:6":{id:"millionaire-cfb-future-source-pass-2-6",type:"quarterback-path",prompt:"Which national champion was quarterbacked by a former walk-on who later returned to the program after a junior-college stop?",choices:["2021 Georgia","2014 Ohio State","2017 Alabama","2018 Clemson"],answer:"2021 Georgia",statSheet:"That quarterback became a Heisman finalist the following season.",explanation:"Former Georgia walk-on Stetson Bennett went to Jones College, a junior-college program in Mississippi, in 2018 before returning to the Bulldogs. He led Georgia to the 2021 season's national championship and returned as a Heisman finalist in 2022.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://georgiadogs.com/news/2023/1/23/football-national-champion-stetson-bennett-wins-manning-award",supportingDetail:"Former Georgia walk-on Stetson Bennett went to Jones College, a junior-college program in Mississippi, in 2018 before returning to the Bulldogs. He led Georgia to the 2021 season's national championship and returned as a Heisman finalist in 2022."}]},
  "cfb:3:0":{id:"millionaire-cfb-future-source-pass-3-0",type:"recognition",prompt:"Which school did Tim Tebow play for?",choices:["Florida","Georgia","Auburn","Tennessee"],answer:"Florida",statSheet:"He won both a Heisman Trophy and two national championships there.",explanation:"Tim Tebow played college football at the University of Florida from 2006 through 2009, winning the 2007 Heisman Trophy and helping the Gators to national titles after the 2006 and 2008 seasons.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://www.heisman.com/heisman-winners/tim-tebow/",supportingDetail:"Tim Tebow played college football at the University of Florida from 2006 through 2009, winning the 2007 Heisman Trophy and helping the Gators to national titles after the 2006 and 2008 seasons."}]},
  "cfb:3:3":{id:"millionaire-cfb-future-source-pass-3-3",type:"chronology",prompt:"Which famous college football moment happened earliest?",choices:["Miracle at Michigan","Bush Push","Appalachian State over Michigan","Kick Six"],answer:"Miracle at Michigan",statSheet:"The play was a last-second Colorado Hail Mary caught in Ann Arbor.",explanation:"Colorado's Miracle at Michigan came first on September 24, 1994, when Kordell Stewart launched a 64-yard Hail Mary caught by Michael Westbrook to beat Michigan 27–26. The Bush Push was 2005, Appalachian State's Michigan upset was 2007, and the Kick Six was 2013.",evidence:[{authority:"Heisman Trust / University or conference primary reporting",url:"https://cubuffs.com/news/2019/9/24/football-25-years-later-miracle-in-michigan-still-required-buffs-lore",supportingDetail:"Colorado's Miracle at Michigan came first on September 24, 1994, when Kordell Stewart launched a 64-yard Hail Mary caught by Michael Westbrook to beat Michigan 27–26. The Bush Push was 2005, Appalachian State's Michigan upset was 2007, and the Kick Six was 2013."}]},

  "cfb:4:0":{id:"millionaire-cfb-reviewed-history-4-0",type:"recognition",prompt:"Which school did Derrick Henry play for?",choices:["Alabama","Georgia","LSU","Florida"],answer:"Alabama",statSheet:"He became the school's second Heisman winner.",explanation:"Derrick Henry starred at Alabama from 2013 through 2015. He won the 2015 Heisman Trophy after rushing for an SEC-record 1,986 yards before the postseason, becoming Alabama's second winner after Mark Ingram.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://www.heisman.com/heisman-winners/derrick-henry/",supportingDetail:"Derrick Henry starred at Alabama from 2013 through 2015. He won the 2015 Heisman Trophy after rushing for an SEC-record 1,986 yards before the postseason, becoming Alabama's second winner after Mark Ingram."}]},
  "cfb:4:3":{id:"millionaire-cfb-reviewed-history-4-3",type:"coaching-chronology",prompt:"Which coach won his first national championship earliest?",choices:["Nick Saban","Urban Meyer","Jimbo Fisher","Dabo Swinney"],answer:"Nick Saban",statSheet:"His first title came at LSU.",explanation:"Nick Saban won his first major-college national championship coaching LSU's 2003 team. Urban Meyer first won with Florida in 2006, Jimbo Fisher with Florida State in 2013, and Dabo Swinney with Clemson in 2016.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://rolltide.com/news/2007/1/4/Nick_Saban_Named_Head_Football_Coach_at_The_University_of_Alabama",supportingDetail:"Nick Saban won his first major-college national championship coaching LSU's 2003 team. Urban Meyer first won with Florida in 2006, Jimbo Fisher with Florida State in 2013, and Dabo Swinney with Clemson in 2016."}]},
  "cfb:4:4":{id:"millionaire-cfb-reviewed-history-4-4",type:"playoff-history",prompt:"Which team became the first CFP participant to make the playoff without winning its conference?",choices:["Ohio State 2016","Alabama 2017","Notre Dame 2018","Georgia 2021"],answer:"Ohio State 2016",statSheet:"The answer lost 31-0 to Clemson in the semifinal.",explanation:"Ohio State reached the 2016 season College Football Playoff even though Penn State won the Big Ten title. The Buckeyes went 11–1 before Clemson defeated them 31–0 in the Fiesta Bowl semifinal.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://collegefootballplayoff.com/sports/2019/5/22/history",supportingDetail:"Ohio State reached the 2016 season College Football Playoff even though Penn State won the Big Ten title. The Buckeyes went 11–1 before Clemson defeated them 31–0 in the Fiesta Bowl semifinal."}]},
  "cfb:4:5":{id:"millionaire-cfb-reviewed-history-4-5",type:"draft-history",prompt:"Which Heisman-winning quarterback was NOT selected in the first round?",choices:["Troy Smith","Tim Tebow","Cam Newton","Baker Mayfield"],answer:"Troy Smith",statSheet:"The answer was drafted by Baltimore after a dominant senior season at Ohio State.",explanation:"Ohio State's 2006 Heisman quarterback Troy Smith was selected by Baltimore in the fifth round at No. 174 of the 2007 NFL draft. The other quarterbacks listed, Tim Tebow, Cam Newton, and Baker Mayfield, were all selected in Round 1.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://www.heisman.com/heisman-winners/troy-smith/",supportingDetail:"Ohio State's 2006 Heisman quarterback Troy Smith was selected by Baltimore in the fifth round at No. 174 of the 2007 NFL draft. The other quarterbacks listed, Tim Tebow, Cam Newton, and Baker Mayfield, were all selected in Round 1."}]},
  "cfb:4:6":{id:"millionaire-cfb-reviewed-history-4-6",type:"stat-comparison",prompt:"Which Heisman-winning quarterback threw for fewer than 3,000 yards in his Heisman season?",choices:["Cam Newton","Tim Tebow","Johnny Manziel","Lamar Jackson"],answer:"Cam Newton",statSheet:"The answer also rushed for more than 1,400 yards.",explanation:"Cam Newton threw for 2,854 yards over Auburn's full 14-game national championship season in 2010 while also rushing for 1,473 yards. The other listed Heisman quarterbacks cleared 3,000 passing yards in their award seasons.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://www.heisman.com/heisman-winners/cam-newton/",supportingDetail:"Cam Newton threw for 2,854 yards over Auburn's full 14-game national championship season in 2010 while also rushing for 1,473 yards. The other listed Heisman quarterbacks cleared 3,000 passing yards in their award seasons."}]},
  "cfb:5:4":{id:"millionaire-cfb-reviewed-history-5-4",type:"awards-history",prompt:"Which school produced back-to-back Heisman-winning quarterbacks in 2017 and 2018?",choices:["Oklahoma","Alabama","USC","Ohio State"],answer:"Oklahoma",statSheet:"Both winners later became No. 1 overall NFL draft picks.",explanation:"Oklahoma produced consecutive Heisman-winning quarterbacks in Baker Mayfield (2017) and Kyler Murray (2018). Cleveland drafted Mayfield No. 1 in 2018, and Arizona drafted Murray No. 1 in 2019.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Oklahoma produced consecutive Heisman-winning quarterbacks in Baker Mayfield (2017) and Kyler Murray (2018). Cleveland drafted Mayfield No. 1 in 2018, and Arizona drafted Murray No. 1 in 2019."}]},
  "cfb:5:5":{id:"millionaire-cfb-reviewed-history-5-5",type:"championship-path",prompt:"Which CFP champion lost its conference championship game before still winning the national title?",choices:["2021 Georgia","2018 Clemson","2019 LSU","2020 Alabama"],answer:"2021 Georgia",statSheet:"The answer was quarterbacked by former walk-on Stetson Bennett.",explanation:"Georgia lost the 2021 SEC championship game 41–24 to Alabama, then beat Michigan 34–11 in the Orange Bowl semifinal and avenged the Alabama loss 33–18 in the January 2022 CFP championship.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://collegefootballplayoff.com/sports/2022/1/20/ncg-recap-2022",supportingDetail:"Georgia lost the 2021 SEC championship game 41–24 to Alabama, then beat Michigan 34–11 in the Orange Bowl semifinal and avenged the Alabama loss 33–18 in the January 2022 CFP championship."}]},
  "cfb:5:6":{id:"millionaire-cfb-reviewed-history-5-6",type:"preseason-ranking",prompt:"Which national champion began its title season ranked No. 22 in the preseason AP poll?",choices:["2010 Auburn","2013 Florida State","2014 Ohio State","2019 LSU"],answer:"2010 Auburn",statSheet:"The team climbed behind a breakout junior-college-transfer quarterback.",explanation:"Auburn entered 2010 ranked No. 22 in the preseason AP poll, then went 14–0 behind Heisman-winning quarterback Cam Newton. The Tigers beat Oregon 22–19 to claim that season's BCS national championship.",evidence:[{authority:"Heisman / CFP / official football history",url:"https://www.collegepollarchive.com/football/ap/appearances-preseason-team.cfm?teamid=21",supportingDetail:"Auburn entered 2010 ranked No. 22 in the preseason AP poll, then went 14–0 behind Heisman-winning quarterback Cam Newton. The Tigers beat Oregon 22–19 to claim that season's BCS national championship."}]},

  "cfb:6:4":{id:"millionaire-cfb-reviewed-finals-6-4",type:"awards-history",prompt:"Which school produced Heisman-winning quarterbacks Danny Wuerffel and Tim Tebow?",choices:["Florida","Florida State","Miami","Georgia"],answer:"Florida",statSheet:"Both quarterbacks also won national championships as starters.",explanation:"Florida produced Heisman-winning quarterbacks Danny Wuerffel in 1996 and Tim Tebow in 2007. Wuerffel led the Gators to the 1996 season national title, while Tebow started for their 2008 national champion team.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Florida produced Heisman-winning quarterbacks Danny Wuerffel in 1996 and Tim Tebow in 2007. Wuerffel led the Gators to the 1996 season national title, while Tebow started for their 2008 national champion team."}]},
  "cfb:6:5":{id:"millionaire-cfb-reviewed-finals-6-5",type:"playoff-history",prompt:"Which program became the first to make four consecutive College Football Playoff appearances?",choices:["Alabama","Clemson","Oklahoma","Ohio State"],answer:"Alabama",statSheet:"Nick Saban's team reached each of the first four CFP fields.",explanation:"Alabama was selected for all four original College Football Playoff fields in 2014, 2015, 2016 and 2017 under Nick Saban. Clemson joined the streak later; the Crimson Tide went on to win the 2015 and 2017 season national championships.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://collegefootballplayoff.com/sports/2019/5/22/history",supportingDetail:"Alabama was selected for all four original College Football Playoff fields in 2014, 2015, 2016 and 2017 under Nick Saban. Clemson joined the streak later; the Crimson Tide went on to win the 2015 and 2017 season national championships."}]},
  "cfb:7:3":{id:"millionaire-cfb-reviewed-finals-7-3",type:"transfer-history",prompt:"Which school did Baker Mayfield play for before transferring to Oklahoma?",choices:["Texas Tech","TCU","Baylor","Oklahoma State"],answer:"Texas Tech",statSheet:"He began his FBS career as a walk-on.",explanation:"Baker Mayfield began his FBS career as a walk-on quarterback at Texas Tech in 2013 before transferring to Oklahoma. After sitting out 2014, he won the 2017 Heisman and was drafted first overall by Cleveland in 2018.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://soonersports.com/news/2018/4/26/211713543",supportingDetail:"Baker Mayfield began his FBS career as a walk-on quarterback at Texas Tech in 2013 before transferring to Oklahoma. After sitting out 2014, he won the 2017 Heisman and was drafted first overall by Cleveland in 2018."}]},
  "cfb:7:7":{id:"millionaire-cfb-reviewed-finals-7-7",type:"depth-chart-history",prompt:"Which championship-game starting quarterback began the season as his team's third-string quarterback?",choices:["Cardale Jones","Tua Tagovailoa","Stetson Bennett","Jake Coker"],answer:"Cardale Jones",statSheet:null,explanation:"Ohio State's Cardale Jones entered the 2014 season as the Buckeyes' third-string quarterback behind Braxton Miller and J.T. Barrett. Injuries elevated Jones into the starting role for postseason wins over Wisconsin, Alabama and Oregon, the last by 42–20 in the January 2015 championship.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://ohiostatebuckeyes.com/news/2015/1/2/sweet-as-sugar-buckeyes-defeat-alabama-42-35",supportingDetail:"Ohio State's Cardale Jones entered the 2014 season as the Buckeyes' third-string quarterback behind Braxton Miller and J.T. Barrett. Injuries elevated Jones into the starting role for postseason wins over Wisconsin, Alabama and Oregon, the last by 42–20 in the January 2015 championship."}]},
  "cfb:8:0":{id:"millionaire-cfb-reviewed-finals-8-0",type:"awards",prompt:"Which school did Reggie Bush play for?",choices:["USC","Texas","Miami","Oklahoma"],answer:"USC",statSheet:"He was part of one of the defining offenses of the mid-2000s.",explanation:"Reggie Bush starred at the University of Southern California from 2003 to 2005 and won the Heisman Trophy in 2005. With quarterback Matt Leinart, he led USC to consecutive AP championship seasons before the dramatic 2006 Rose Bowl loss to Texas.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://www.heisman.com/heisman-winners/reggie-bush/",supportingDetail:"Reggie Bush starred at the University of Southern California from 2003 to 2005 and won the Heisman Trophy in 2005. With quarterback Matt Leinart, he led USC to consecutive AP championship seasons before the dramatic 2006 Rose Bowl loss to Texas."}]},
  "cfb:8:4":{id:"millionaire-cfb-reviewed-finals-8-4",type:"awards-postseason",prompt:"Which Heisman-winning quarterback also won the national championship in his Heisman season?",choices:["Joe Burrow","Lamar Jackson","Baker Mayfield","Caleb Williams"],answer:"Joe Burrow",statSheet:"His team finished 15-0.",explanation:"Joe Burrow won the 2019 Heisman Trophy with LSU and quarterbacked the Tigers to a 15–0 record. LSU beat Oklahoma in the CFP semifinal and Clemson 42–25 in the January 2020 national title game.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://www.heisman.com/heisman-winners/joe-burrow/",supportingDetail:"Joe Burrow won the 2019 Heisman Trophy with LSU and quarterbacked the Tigers to a 15–0 record. LSU beat Oklahoma in the CFP semifinal and Clemson 42–25 in the January 2020 national title game."}]},
  "cfb:9:4":{id:"millionaire-cfb-reviewed-finals-9-4",type:"awards-history",prompt:"Which quarterback won the Heisman one year after his Oklahoma teammate Baker Mayfield?",choices:["Kyler Murray","Jalen Hurts","Sam Bradford","Landry Jones"],answer:"Kyler Murray",statSheet:"He also became the No. 1 overall NFL draft pick.",explanation:"Oklahoma's Kyler Murray won the 2018 Heisman Trophy immediately after former teammate Baker Mayfield won it in 2017. Mayfield went first overall to Cleveland in 2018 and Murray went first overall to Arizona in 2019.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://www.heisman.com/heisman-winners/",supportingDetail:"Oklahoma's Kyler Murray won the 2018 Heisman Trophy immediately after former teammate Baker Mayfield won it in 2017. Mayfield went first overall to Cleveland in 2018 and Murray went first overall to Arizona in 2019."}]},
  "cfb:9:6":{id:"millionaire-cfb-reviewed-finals-9-6",type:"heisman-history",prompt:"Which Heisman-winning quarterback was 28 years old when he won the award?",choices:["Chris Weinke","Joe Burrow","Baker Mayfield","Carson Palmer"],answer:"Chris Weinke",statSheet:"The answer had previously spent years in professional baseball.",explanation:"Florida State quarterback Chris Weinke won the Heisman Trophy in December 2000 at 28 years old. Before returning to college football, he had spent six years playing minor-league baseball.",evidence:[{authority:"Heisman Trust / CFP / school athletics",url:"https://seminoles.com/news/2000/12/9/chris-weinke-wins-the-65th-annual-heisman-trophy",supportingDetail:"Florida State quarterback Chris Weinke won the Heisman Trophy in December 2000 at 28 years old. Before returning to college football, he had spent six years playing minor-league baseball."}]},

  "nfl:0:3":{id:"millionaire-nfl-inherited-reviewed-0-3",type:"chronology",prompt:"Which quarterback was drafted most recently?",choices:["Jared Goff","Patrick Mahomes","Deshaun Watson","Josh Allen"],answer:"Josh Allen",statSheet:"The answer was drafted by Buffalo after the Bills traded up into the top 10.",explanation:"Josh Allen was selected No. 7 overall by Buffalo in 2018 after the Bills traded up with Tampa Bay. Jared Goff was drafted in 2016, while Patrick Mahomes and Deshaun Watson went in the 2017 draft.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/buffalo-bills-trade-up-to-draft-josh-allen-at-no-7-overall-0ap3000000928988",supportingDetail:"Josh Allen was selected No. 7 overall by Buffalo in 2018 after the Bills traded up with Tampa Bay. Jared Goff was drafted in 2016, while Patrick Mahomes and Deshaun Watson went in the 2017 draft."}]},
  "nfl:0:4":{id:"millionaire-nfl-inherited-reviewed-0-4",type:"awards",prompt:"Who was the most recent non-quarterback to win AP NFL MVP?",choices:["Adrian Peterson","LaDainian Tomlinson","Marshall Faulk","Shaun Alexander"],answer:"Adrian Peterson",statSheet:"The answer rushed for more than 2,000 yards in his MVP season.",explanation:"Adrian Peterson earned the 2012 Associated Press NFL MVP award after rushing for 2,097 yards with Minnesota, just eight yards shy of Eric Dickerson's record. He remained the most recent non-quarterback winner through the 2025 awards.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/nfl-mvp-dark-horses-jalen-hurts-trevor-lawrence-among-top-nine-candidates-in-2026",supportingDetail:"Adrian Peterson earned the 2012 Associated Press NFL MVP award after rushing for 2,097 yards with Minnesota, just eight yards shy of Eric Dickerson's record. He remained the most recent non-quarterback winner through the 2025 awards."}]},
  "nfl:1:3":{id:"millionaire-nfl-inherited-reviewed-1-3",type:"draft-chronology",prompt:"Which quarterback was drafted earliest?",choices:["Philip Rivers","Aaron Rodgers","Jay Cutler","Matthew Stafford"],answer:"Philip Rivers",statSheet:"The answer spent the bulk of his career with the Chargers.",explanation:"Philip Rivers was selected fourth overall in the 2004 NFL Draft by the New York Giants and immediately traded to the San Diego Chargers in the Eli Manning deal. Aaron Rodgers went in 2005, Jay Cutler in 2006 and Matthew Stafford in 2009.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/the-eli-manning-philip-rivers-trade-still-resonates-years-later-0ap3000000979322",supportingDetail:"Philip Rivers was selected fourth overall in the 2004 NFL Draft by the New York Giants and immediately traded to the San Diego Chargers in the Eli Manning deal. Aaron Rodgers went in 2005, Jay Cutler in 2006 and Matthew Stafford in 2009."}]},
  "nfl:1:5":{id:"millionaire-nfl-inherited-reviewed-1-5",type:"awards",prompt:"Which defender won both AP Defensive Rookie of the Year and AP Defensive Player of the Year as a rookie?",choices:["Lawrence Taylor","Von Miller","Ndamukong Suh","Patrick Willis"],answer:"Lawrence Taylor",statSheet:"The answer was the No. 2 overall pick in his draft.",explanation:"New York Giants linebacker Lawrence Taylor became the first rookie to win AP Defensive Player of the Year in 1981, the same year he won the Defensive Rookie of the Year award, after being drafted second overall by the Giants.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/players/lawrence-taylor",supportingDetail:"New York Giants linebacker Lawrence Taylor became the first rookie to win AP Defensive Player of the Year in 1981, the same year he won the Defensive Rookie of the Year award, after being drafted second overall by the Giants."}]},
  "nfl:1:6":{id:"millionaire-nfl-inherited-reviewed-1-6",type:"mvp-comparison",prompt:"Which MVP running back did NOT lead the NFL in rushing yards during his MVP season?",choices:["Marshall Faulk 2000","Shaun Alexander 2005","LaDainian Tomlinson 2006","Adrian Peterson 2012"],answer:"Marshall Faulk 2000",statSheet:"The answer scored 26 total touchdowns while powering one of the era's defining offenses.",explanation:"Marshall Faulk won AP NFL MVP for the 2000 St. Louis Rams with 26 touchdowns from scrimmage, but Indianapolis runner Edgerrin James led the league in rushing yards at 1,709 compared with Faulk's 1,359.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/stats/player-stats/category/rushing/2000/reg/all/rushingfirstdowns/desc",supportingDetail:"Marshall Faulk won AP NFL MVP for the 2000 St. Louis Rams with 26 touchdowns from scrimmage, but Indianapolis runner Edgerrin James led the league in rushing yards at 1,709 compared with Faulk's 1,359."}]},
  "nfl:2:3":{id:"millionaire-nfl-inherited-reviewed-2-3",type:"championship",prompt:"Which team did Drew Brees and the Saints defeat in Super Bowl XLIV?",choices:["Colts","Vikings","Bears","Chargers"],answer:"Colts",statSheet:"New Orleans sealed the game with a late pick-six.",explanation:"New Orleans defeated Peyton Manning's Indianapolis Colts 31–17 in Super Bowl XLIV on February 7, 2010. Drew Brees earned game MVP and Tracy Porter returned a Manning interception 74 yards for the clinching touchdown.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/saints-porter-jumps-wayne-s-route-runs-into-super-bowl-history-09000d5d81649927",supportingDetail:"New Orleans defeated Peyton Manning's Indianapolis Colts 31–17 in Super Bowl XLIV on February 7, 2010. Drew Brees earned game MVP and Tracy Porter returned a Manning interception 74 yards for the clinching touchdown."}]},
  "nfl:2:5":{id:"millionaire-nfl-inherited-reviewed-2-5",type:"defensive-awards",prompt:"Which of these defenders never won AP Defensive Player of the Year?",choices:["Von Miller","Khalil Mack","Aaron Donald","J.J. Watt"],answer:"Von Miller",statSheet:"Three choices won the award at least once during the 2010s.",explanation:"Von Miller won Super Bowl 50 MVP but not the AP regular-season Defensive Player of the Year award. The other options won that honor: J.J. Watt three times (2012, 2014, 2015), Khalil Mack in 2016 and Aaron Donald in 2017, 2018 and 2020.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://static.www.nfl.com/image/upload/league/f60ftapcsbynqgymw72q.pdf",supportingDetail:"Von Miller won Super Bowl 50 MVP but not the AP regular-season Defensive Player of the Year award. The other options won that honor: J.J. Watt three times (2012, 2014, 2015), Khalil Mack in 2016 and Aaron Donald in 2017, 2018 and 2020."}]},
  "nfl:2:6":{id:"millionaire-nfl-inherited-reviewed-2-6",type:"receiving-history",prompt:"Which Hall of Fame receiver never led the NFL in receiving yards in a season?",choices:["Terrell Owens","Randy Moss","Marvin Harrison","Calvin Johnson"],answer:"Terrell Owens",statSheet:"The answer still retired with more than 15,000 receiving yards and 150 receiving touchdowns.",explanation:"Terrell Owens finished his Hall of Fame receiving career with 15,934 yards and 153 receiving touchdowns across 15 seasons. Although he made five All-Pro teams, none of those seasons led the NFL in receiving yardage; the other choices each topped that annual category.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/players/terrell-owens",supportingDetail:"Terrell Owens finished his Hall of Fame receiving career with 15,934 yards and 153 receiving touchdowns across 15 seasons. Although he made five All-Pro teams, none of those seasons led the NFL in receiving yardage; the other choices each topped that annual category."}]},
  "nfl:3:0":{id:"millionaire-nfl-inherited-reviewed-3-0",type:"team-history",prompt:"Which franchise did Tom Brady play his first 20 NFL seasons for?",choices:["Patriots","Buccaneers","49ers","Colts"],answer:"Patriots",statSheet:"He was drafted by the franchise in the sixth round in 2000.",explanation:"Tom Brady spent his first 20 NFL seasons with the New England Patriots from 2000 through 2019, winning six Super Bowls, before moving to Tampa Bay for his final three seasons and a seventh title.",evidence:[{authority:"Official NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/players/tom-brady/stats/career",supportingDetail:"Tom Brady spent his first 20 NFL seasons with the New England Patriots from 2000 through 2019, winning six Super Bowls, before moving to Tampa Bay for his final three seasons and a seventh title."}]},

  "nfl:3:3":{id:"millionaire-nfl-future-reviewed-3-3",type:"draft",prompt:"Which of these No. 1 overall picks was NOT a quarterback?",choices:["Mario Williams","Cam Newton","Sam Bradford","Andrew Luck"],answer:"Mario Williams",statSheet:"The non-quarterback was selected first overall by Houston.",explanation:"The Houston Texans used the first overall pick of the 2006 NFL Draft on defensive end Mario Williams from NC State. Cam Newton (2011), Sam Bradford (2010), and Andrew Luck (2012) were all quarterbacks selected No. 1 in separate drafts.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/news/nfl-draft-no-1-selections-09000d5d8289a4c0",supportingDetail:"The Houston Texans used the first overall pick of the 2006 NFL Draft on defensive end Mario Williams from NC State. Cam Newton (2011), Sam Bradford (2010), and Andrew Luck (2012) were all quarterbacks selected No. 1 in separate drafts."}]},
  "nfl:3:5":{id:"millionaire-nfl-future-reviewed-3-5",type:"awards",prompt:"Which legendary quarterback never won AP NFL MVP?",choices:["Drew Brees","Tom Brady","Peyton Manning","Aaron Rodgers"],answer:"Drew Brees",statSheet:"The answer did win Super Bowl MVP.",explanation:"Drew Brees never won an Associated Press regular-season NFL Most Valuable Player award, despite prolific passing seasons in New Orleans. He did earn Super Bowl XLIV MVP for leading the Saints past Indianapolis 31–17 after the 2009 season.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/news/super-bowl-mvps-where-was-each-award-winner-drafted-0ap3000000464583",supportingDetail:"Drew Brees never won an Associated Press regular-season NFL Most Valuable Player award, despite prolific passing seasons in New Orleans. He did earn Super Bowl XLIV MVP for leading the Saints past Indianapolis 31–17 after the 2009 season."}]},
  "nfl:3:6":{id:"millionaire-nfl-future-reviewed-3-6",type:"mvp-comparison",prompt:"Which MVP quarterback did NOT lead the NFL in passing touchdowns during his MVP season?",choices:["Cam Newton 2015","Peyton Manning 2013","Tom Brady 2007","Patrick Mahomes 2018"],answer:"Cam Newton 2015",statSheet:"The answer also scored 10 rushing touchdowns that season.",explanation:"Cam Newton received the 2015 AP MVP award after accounting for 45 touchdowns with Carolina, including 10 on the ground. His 35 passing scores trailed league leader Tom Brady's 36 that season; the other quarterbacks each led the NFL in passing touchdowns in their selected MVP years.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/stats/player-stats/category/passing/2015/REG/all/passingtouchdowns/DESC",supportingDetail:"Cam Newton received the 2015 AP MVP award after accounting for 45 touchdowns with Carolina, including 10 on the ground. His 35 passing scores trailed league leader Tom Brady's 36 that season; the other quarterbacks each led the NFL in passing touchdowns in their selected MVP years."}]},
  "nfl:5:0":{id:"millionaire-nfl-future-reviewed-5-0",type:"draft",prompt:"Who was selected No. 1 overall in the 2011 NFL Draft?",choices:["Cam Newton","Von Miller","A.J. Green","Julio Jones"],answer:"Cam Newton",statSheet:"Carolina owned the first pick.",explanation:"Carolina selected Auburn quarterback Cam Newton with the No. 1 overall pick in the 2011 NFL Draft. Von Miller went second to Denver, A.J. Green fourth to Cincinnati, and Julio Jones sixth to Atlanta.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/news/nfl-draft-no-1-selections-09000d5d8289a4c0",supportingDetail:"Carolina selected Auburn quarterback Cam Newton with the No. 1 overall pick in the 2011 NFL Draft. Von Miller went second to Denver, A.J. Green fourth to Cincinnati, and Julio Jones sixth to Atlanta."}]},
  "nfl:5:2":{id:"millionaire-nfl-future-reviewed-5-2",type:"career-history",prompt:"Which team did Brett Favre first play for in the NFL?",choices:["Falcons","Packers","Jets","Vikings"],answer:"Falcons",statSheet:"He was traded after his rookie season.",explanation:"The Atlanta Falcons selected Brett Favre from Southern Mississippi with the 33rd pick of the 1991 NFL Draft, and he spent his rookie season as a reserve. They traded him to Green Bay before the 1992 season, where his three-MVP career took off.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.profootballhof.com/news/moments-in-nfl-history-no-4-leaps-to-green-bay",supportingDetail:"The Atlanta Falcons selected Brett Favre from Southern Mississippi with the 33rd pick of the 1991 NFL Draft, and he spent his rookie season as a reserve. They traded him to Green Bay before the 1992 season, where his three-MVP career took off."}]},
  "nfl:5:6":{id:"millionaire-nfl-future-reviewed-5-6",type:"rushing-comparison",prompt:"Which 2,000-yard rusher had the fewest rushing touchdowns in his 2,000-yard season?",choices:["Barry Sanders 1997","O.J. Simpson 1973","Eric Dickerson 1984","Derrick Henry 2020"],answer:"Barry Sanders 1997",statSheet:"The answer shared AP NFL MVP honors that season.",explanation:"Barry Sanders rushed for 2,053 yards and 11 touchdowns during his 1997 Lions season. Among the four listed 2,000-yard backs, his 11 rushing scores were fewest, compared with 12 for O.J. Simpson in 1973, 14 for Eric Dickerson in 1984 and 17 for Derrick Henry in 2020.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/players/barry-sanders/stats/career",supportingDetail:"Barry Sanders rushed for 2,053 yards and 11 touchdowns during his 1997 Lions season. Among the four listed 2,000-yard backs, his 11 rushing scores were fewest, compared with 12 for O.J. Simpson in 1973, 14 for Eric Dickerson in 1984 and 17 for Derrick Henry in 2020."}]},
  "nfl:6:2":{id:"millionaire-nfl-future-reviewed-6-2",type:"championship",prompt:"Which team did the 2000 Ravens defeat in Super Bowl XXXV?",choices:["Giants","Rams","Raiders","Eagles"],answer:"Giants",statSheet:"Baltimore's defense allowed no offensive touchdowns.",explanation:"The 2000 Baltimore Ravens beat the New York Giants 34–7 in Super Bowl XXXV on January 28, 2001. Baltimore's defense did not allow a Giants offensive touchdown and linebacker Ray Lewis received the game's MVP award.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/news/defensive-super-bowl-mvps-09000d5d8062ed8a",supportingDetail:"The 2000 Baltimore Ravens beat the New York Giants 34–7 in Super Bowl XXXV on January 28, 2001. Baltimore's defense did not allow a Giants offensive touchdown and linebacker Ray Lewis received the game's MVP award."}]},
  "nfl:6:3":{id:"millionaire-nfl-future-reviewed-6-3",type:"super-bowl",prompt:"Who was MVP of Super Bowl XLVII?",choices:["Joe Flacco","Ray Lewis","Anquan Boldin","Colin Kaepernick"],answer:"Joe Flacco",statSheet:"Baltimore defeated San Francisco.",explanation:"Baltimore quarterback Joe Flacco was named Super Bowl XLVII MVP after throwing three touchdown passes without an interception in the Ravens' 34–31 victory over San Francisco on February 3, 2013.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/news/joe-flacco-wins-super-bowl-mvp-ready-to-hit-jackpot-0ap1000000135355",supportingDetail:"Baltimore quarterback Joe Flacco was named Super Bowl XLVII MVP after throwing three touchdown passes without an interception in the Ravens' 34–31 victory over San Francisco on February 3, 2013."}]},
  "nfl:6:4":{id:"millionaire-nfl-future-reviewed-6-4",type:"dynasty-history",prompt:"Which franchise was the first to win three Super Bowls in a four-season span?",choices:["Cowboys","Patriots","Steelers","49ers"],answer:"Cowboys",statSheet:"The three titles came during the 1990s.",explanation:"The Dallas Cowboys became the first NFL club to win three Super Bowls in four seasons, claiming Super Bowls XXVII, XXVIII and XXX following the 1992, 1993 and 1995 seasons. Dallas beat Pittsburgh 27–17 in January 1996 for the third ring.",evidence:[{authority:"NFL / Pro Football Hall of Fame historical records",url:"https://www.nfl.com/_amp/two-decades-later-jerry-jones-still-has-tight-grip-on-cowboys-09000d5d80ee9a19",supportingDetail:"The Dallas Cowboys became the first NFL club to win three Super Bowls in four seasons, claiming Super Bowls XXVII, XXVIII and XXX following the 1992, 1993 and 1995 seasons. Dallas beat Pittsburgh 27–17 in January 1996 for the third ring."}]},

  "nfl:6:5":{id:"millionaire-nfl-reviewed-legacy-6-5",type:"defensive-awards",prompt:"Which defender won AP Defensive Player of the Year three times?",choices:["Aaron Donald","Ray Lewis","Reggie White","Deion Sanders"],answer:"Aaron Donald",statSheet:"The three awards came within a four-season span.",explanation:"Aaron Donald earned the Associated Press NFL Defensive Player of the Year award in 2017, 2018 and 2020, all with the Los Angeles Rams. His third award followed a 13.5-sack season and was his third in a four-season span.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/rams-dt-aaron-donald-wins-ap-defensive-player-of-the-year",supportingDetail:"Aaron Donald earned the Associated Press NFL Defensive Player of the Year award in 2017, 2018 and 2020, all with the Los Angeles Rams. His third award followed a 13.5-sack season and was his third in a four-season span."}]},
  "nfl:7:1":{id:"millionaire-nfl-reviewed-legacy-7-1",type:"career-history",prompt:"Which quarterback retired after winning Super Bowl 50?",choices:["Peyton Manning","Tom Brady","Drew Brees","Ben Roethlisberger"],answer:"Peyton Manning",statSheet:"The championship was his second with a different franchise.",explanation:"Peyton Manning retired in March 2016 after helping Denver beat Carolina 24–10 in Super Bowl 50. The victory gave Manning a second Super Bowl ring, following his Super Bowl XLI triumph with Indianapolis.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/players/peyton-manning",supportingDetail:"Peyton Manning retired in March 2016 after helping Denver beat Carolina 24–10 in Super Bowl 50. The victory gave Manning a second Super Bowl ring, following his Super Bowl XLI triumph with Indianapolis."}]},
  "nfl:7:2": {
    id: "millionaire-nfl-desean-miracle-meadowlands-2010-q3", type: "punt-return-walkoffs", prompt: "Who scored on a walk-off punt return in Philadelphia's 2010 'Miracle at the New Meadowlands' win over the Giants?",
    choices: ["DeSean Jackson","Jeremy Maclin","LeSean McCoy","Brent Celek"], answer: "DeSean Jackson",
    statSheet: "Philadelphia rallied from a 31–10 fourth-quarter deficit before the deciding return.", explanation: "DeSean Jackson scored on a 65-yard punt return as time expired on December 19, 2010, completing Philadelphia's comeback from 31–10 down to beat the Giants 38–31. It was the first NFL walk-off punt-return touchdown.",
    evidence: [{ authority: "Philadelphia Eagles", url: "https://www.philadelphiaeagles.com/news/miracle-nets-espy-award-for-best-game-5163338", supportingDetail: "DeSean Jackson scored on a 65-yard punt return as time expired on December 19, 2010, completing Philadelphia's comeback from 31–10 down to beat the Giants 38–31. It was the first NFL walk-off punt-return touchdown." }],
  },
  "nfl:7:4":{id:"millionaire-nfl-reviewed-legacy-7-4",type:"championship-history",prompt:"Which franchise won the first overtime game in Super Bowl history?",choices:["Patriots","Falcons","Chiefs","Rams"],answer:"Patriots",statSheet:"The game required a 25-point comeback.",explanation:"New England won the first overtime game in Super Bowl history, rallying from a 28–3 deficit to beat Atlanta 34–28 in Super Bowl LI. James White scored the winning two-yard touchdown run in the extra period.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/falcons-patriots-first-teams-to-play-in-sb-overtime-0ap3000000783676",supportingDetail:"New England won the first overtime game in Super Bowl history, rallying from a 28–3 deficit to beat Atlanta 34–28 in Super Bowl LI. James White scored the winning two-yard touchdown run in the extra period."}]},
  "nfl:7:6":{id:"millionaire-nfl-reviewed-legacy-7-6",type:"draft-awards",prompt:"Which AP Defensive Player of the Year was NOT a first-round draft pick?",choices:["Jason Taylor","Ray Lewis","Aaron Donald","J.J. Watt"],answer:"Jason Taylor",statSheet:"The answer entered the NFL from Akron and developed into a Hall of Fame pass rusher.",explanation:"Jason Taylor, drafted from Akron in the third round (73rd overall) by Miami in 1997, earned AP Defensive Player of the Year in 2006. Ray Lewis, Aaron Donald and J.J. Watt were all first-round draft selections.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/news/class-of-2017-finalists",supportingDetail:"Jason Taylor, drafted from Akron in the third round (73rd overall) by Miami in 1997, earned AP Defensive Player of the Year in 2006. Ray Lewis, Aaron Donald and J.J. Watt were all first-round draft selections."}]},
  "nfl:8:0":{id:"millionaire-nfl-reviewed-legacy-8-0",type:"draft",prompt:"Which franchise drafted Aaron Donald?",choices:["Rams","Steelers","Bengals","Giants"],answer:"Rams",statSheet:"He was selected in the first round in 2014.",explanation:"The St. Louis Rams drafted Pittsburgh defensive tackle Aaron Donald with the No. 13 overall pick in the first round of the 2014 NFL Draft, the same round in which St. Louis selected offensive tackle Greg Robinson second overall.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/greg-robinson-aaron-donald-drafted-by-st-louis-rams-0ap2000000348031",supportingDetail:"The St. Louis Rams drafted Pittsburgh defensive tackle Aaron Donald with the No. 13 overall pick in the first round of the 2014 NFL Draft, the same round in which St. Louis selected offensive tackle Greg Robinson second overall."}]},
  "nfl:8:2":{id:"millionaire-nfl-reviewed-legacy-8-2",type:"super-bowl",prompt:"Which quarterback led the Giants past the undefeated Patriots in Super Bowl XLII?",choices:["Eli Manning","Philip Rivers","Ben Roethlisberger","Tony Romo"],answer:"Eli Manning",statSheet:"The winning touchdown came in the final minute.",explanation:"Eli Manning quarterbacked the Giants to a 17–14 victory over the previously undefeated New England Patriots in Super Bowl XLII on February 3, 2008. He threw the winning 13-yard touchdown to Plaxico Burress with 35 seconds left.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/super-bowl-xlii-encore-on-nfl-network-sept-2-09000d5d80a564a3",supportingDetail:"Eli Manning quarterbacked the Giants to a 17–14 victory over the previously undefeated New England Patriots in Super Bowl XLII on February 3, 2008. He threw the winning 13-yard touchdown to Plaxico Burress with 35 seconds left."}]},
  "nfl:8:3":{id:"millionaire-nfl-reviewed-legacy-8-3",type:"draft-comparison",prompt:"Which of these defenders was selected No. 1 overall?",choices:["Myles Garrett","Khalil Mack","Aaron Donald","J.J. Watt"],answer:"Myles Garrett",statSheet:"Cleveland owned the first pick in his draft.",explanation:"Cleveland selected defensive end Myles Garrett of Texas A&M with the first overall pick of the 2017 NFL Draft. Khalil Mack, Aaron Donald and J.J. Watt were each selected outside the top spot in other draft years.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.nfl.com/news/browns-select-myles-garrett-no-1-overall-in-2017-draft-0ap3000000803258",supportingDetail:"Cleveland selected defensive end Myles Garrett of Texas A&M with the first overall pick of the 2017 NFL Draft. Khalil Mack, Aaron Donald and J.J. Watt were each selected outside the top spot in other draft years."}]},
  "nfl:8:4":{id:"millionaire-nfl-reviewed-legacy-8-4",type:"mvp-season",prompt:"Which running back rushed for 2,053 yards while sharing AP MVP honors in 1997?",choices:["Barry Sanders","Terrell Davis","Emmitt Smith","Curtis Martin"],answer:"Barry Sanders",statSheet:"The award was shared with a quarterback.",explanation:"Barry Sanders rushed for 2,053 yards for Detroit in 1997 while scoring 11 rushing touchdowns and sharing the AP NFL MVP award with Green Bay quarterback Brett Favre. Sanders set a career best with 6.1 yards per attempt that season.",evidence:[{authority:"NFL / Pro Football Hall of Fame",url:"https://www.profootballhof.com/players/barry-sanders",supportingDetail:"Barry Sanders rushed for 2,053 yards for Detroit in 1997 while scoring 11 rushing touchdowns and sharing the AP NFL MVP award with Green Bay quarterback Brett Favre. Sanders set a career best with 6.1 yards per attempt that season."}]},

  "nfl:8:5":{id:"millionaire-nfl-final-legacy-source-8-5",type:"awards",prompt:"Which receiver never won AP Offensive Player of the Year?",choices:["Randy Moss","Jerry Rice","Cooper Kupp","Michael Thomas"],answer:"Randy Moss",statSheet:"The answer did win AP Offensive Rookie of the Year.",explanation:"Randy Moss earned AP Offensive Rookie of the Year in 1998 and set the NFL single-season receiving touchdown mark with 23 in 2007, but he never won AP Offensive Player of the Year. Jerry Rice, Michael Thomas and Cooper Kupp each received that specific award.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/news/rams-wr-cooper-kupp-named-2021-ap-nfl-offensive-player-of-the-year",supportingDetail:"Randy Moss earned AP Offensive Rookie of the Year in 1998 and set the NFL single-season receiving touchdown mark with 23 in 2007, but he never won AP Offensive Player of the Year. Jerry Rice, Michael Thomas and Cooper Kupp each received that specific award."}]},
  "nfl:8:6":{id:"millionaire-nfl-final-legacy-source-8-6",type:"defensive-awards",prompt:"Which defender won AP Defensive Player of the Year in just his second NFL season?",choices:["J.J. Watt","Aaron Donald","Khalil Mack","Nick Bosa"],answer:"J.J. Watt",statSheet:"The answer recorded 20.5 sacks that season.",explanation:"J.J. Watt won AP NFL Defensive Player of the Year in his second season with Houston in 2012 after recording 20.5 sacks, 23 tackles for loss and 16 passes defended. He was a first-round draft selection in 2011.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/news/j-j-watt-near-unanimous-defensive-player-of-the-year-0ap1000000134299",supportingDetail:"J.J. Watt won AP NFL Defensive Player of the Year in his second season with Houston in 2012 after recording 20.5 sacks, 23 tackles for loss and 16 passes defended. He was a first-round draft selection in 2011."}]},
  "nfl:8:7":{id:"millionaire-nfl-final-legacy-source-8-7",type:"mvp-super-bowl",prompt:"Which MVP quarterback later lost that season's Super Bowl to his former head coach?",choices:["Rich Gannon","Kurt Warner","Cam Newton","Matt Ryan"],answer:"Rich Gannon",statSheet:null,explanation:"Rich Gannon won the AP NFL MVP award for the Oakland Raiders in the 2002 season, but then lost Super Bowl XXXVII 48–21 to Tampa Bay and former Raiders head coach Jon Gruden, whose Buccaneers intercepted Gannon five times.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://static.clubs.nfl.com/image/upload/raiders/baqqwycx0ibpmfh93yy6.pdf",supportingDetail:"Rich Gannon won the AP NFL MVP award for the Oakland Raiders in the 2002 season, but then lost Super Bowl XXXVII 48–21 to Tampa Bay and former Raiders head coach Jon Gruden, whose Buccaneers intercepted Gannon five times."}]},
  "nfl:9:1":{id:"millionaire-nfl-final-legacy-source-9-1",type:"super-bowl",prompt:"Who was MVP of Super Bowl XXXV for Baltimore?",choices:["Ray Lewis","Jamal Lewis","Trent Dilfer","Rod Woodson"],answer:"Ray Lewis",statSheet:"Baltimore's defense dominated the Giants.",explanation:"Baltimore Ravens linebacker Ray Lewis was named MVP of Super Bowl XXXV after Baltimore overwhelmed the New York Giants 34–7 in January 2001. The Ravens defense held New York's offense without a touchdown.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/news/defensive-super-bowl-mvps-09000d5d8062ed8a",supportingDetail:"Baltimore Ravens linebacker Ray Lewis was named MVP of Super Bowl XXXV after Baltimore overwhelmed the New York Giants 34–7 in January 2001. The Ravens defense held New York's offense without a touchdown."}]},
  "nfl:9:2":{id:"millionaire-nfl-final-legacy-source-9-2",type:"awards",prompt:"Who won AP Defensive Rookie of the Year in 2007?",choices:["Patrick Willis","Darrelle Revis","Jon Beason","LaMarr Woodley"],answer:"Patrick Willis",statSheet:"The winner was a first-round linebacker for San Francisco.",explanation:"Patrick Willis won the 2007 Associated Press NFL Defensive Rookie of the Year award for San Francisco after a 174-tackle season. He received 48 of 50 first-place votes, edging another standout first-year linebacker, Jon Beason.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/news/49ers-linebacker-willis-is-ap-s-top-defensive-rookie-09000d5d805b9fdf",supportingDetail:"Patrick Willis won the 2007 Associated Press NFL Defensive Rookie of the Year award for San Francisco after a 174-tackle season. He received 48 of 50 first-place votes, edging another standout first-year linebacker, Jon Beason."}]},
  "nfl:9:3":{id:"millionaire-nfl-final-legacy-source-9-3",type:"draft-chronology",prompt:"Which quarterback was selected first overall earliest?",choices:["Michael Vick","Eli Manning","Alex Smith","Matthew Stafford"],answer:"Michael Vick",statSheet:"The answer began his NFL career in Atlanta.",explanation:"Michael Vick went first overall to the Atlanta Falcons in the 2001 NFL Draft. Fellow quarterback choices Eli Manning, Alex Smith and Matthew Stafford were selected first in 2004, 2005 and 2009, respectively.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/news/nfl-draft-no-1-selections-09000d5d8289a4c0",supportingDetail:"Michael Vick went first overall to the Atlanta Falcons in the 2001 NFL Draft. Fellow quarterback choices Eli Manning, Alex Smith and Matthew Stafford were selected first in 2004, 2005 and 2009, respectively."}]},
  "nfl:9:4":{id:"millionaire-nfl-final-legacy-source-9-4",type:"draft-history",prompt:"Which quarterback was drafted No. 1 overall by the Baltimore Colts but never played for them?",choices:["John Elway","Dan Marino","Jim Kelly","Bernie Kosar"],answer:"John Elway",statSheet:"He was traded to Denver before his rookie season.",explanation:"The Baltimore Colts selected Stanford quarterback John Elway first overall in 1983, but he refused to play for them. Baltimore traded his rights to Denver six days later, where Elway became a Hall of Fame quarterback and two-time Super Bowl champion.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/photos/top-15-trades-in-nfl-history-0ap2000000336962",supportingDetail:"The Baltimore Colts selected Stanford quarterback John Elway first overall in 1983, but he refused to play for them. Baltimore traded his rights to Denver six days later, where Elway became a Hall of Fame quarterback and two-time Super Bowl champion."}]},
  "nfl:9:5":{id:"millionaire-nfl-final-legacy-source-9-5",type:"mvp-history",prompt:"Who is the most recent defensive player to win AP NFL MVP?",choices:["Lawrence Taylor","Reggie White","Ray Lewis","J.J. Watt"],answer:"Lawrence Taylor",statSheet:"The MVP season came in 1986.",explanation:"Lawrence Taylor was the most recent defensive player to win the AP NFL Most Valuable Player award, earning it for the New York Giants in 1986 after a 20.5-sack season. The other defensive NFL MVP was Alan Page in 1971.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://www.nfl.com/news/nfl-mvp-dark-horses-jalen-hurts-trevor-lawrence-among-top-nine-candidates-in-2026",supportingDetail:"Lawrence Taylor was the most recent defensive player to win the AP NFL Most Valuable Player award, earning it for the New York Giants in 1986 after a 20.5-sack season. The other defensive NFL MVP was Alan Page in 1971."}]},
  "nfl:9:6":{id:"millionaire-nfl-final-legacy-source-9-6",type:"mvp-postseason",prompt:"Which multiple-time AP MVP quarterback has made exactly one Super Bowl start?",choices:["Aaron Rodgers","Peyton Manning","Tom Brady","Joe Montana"],answer:"Aaron Rodgers",statSheet:"His lone Super Bowl appearance came during a postseason run that began as the NFC's No. 6 seed.",explanation:"Aaron Rodgers won AP NFL MVP four times for Green Bay (2011, 2014, 2020 and 2021), yet his lone Super Bowl start came in Super Bowl XLV. He led the sixth-seeded Packers to a 31–25 victory over Pittsburgh to finish the 2010 season.",evidence:[{authority:"NFL / official club or Pro Football Hall of Fame records",url:"https://static.clubs.nfl.com/image/upload/steelers/n3fjpudxwvzvrzsyxuuw.pdf",supportingDetail:"Aaron Rodgers won AP NFL MVP four times for Green Bay (2011, 2014, 2020 and 2021), yet his lone Super Bowl start came in Super Bowl XLV. He led the sixth-seeded Packers to a 31–25 victory over Pittsburgh to finish the 2010 season."}]},

};

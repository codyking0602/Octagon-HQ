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
    explanation: "Sonny Dykes led TCU to a 13–2 record and the January 2023 CFP championship game in his first season, beating Michigan in the Fiesta Bowl semifinal before losing to Georgia.",
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
    explanation: "LSU freshman tight end Mason Taylor caught Jayden Daniels' three-yard two-point conversion in overtime to defeat Alabama 32–31 on November 5, 2022.",
    evidence: [{ authority: "Official school athletics", url: "https://lsusports.net/news/2022/11/5/lsu-tops-alabama-gutsy-ot-conversion-32-31", supportingDetail: "LSU's official 32–31 recap confirms Daniels' two-point pass to Mason Taylor." }],
  },
  "cfb:8:5": {
    id: "millionaire-cfb-future-chase-mcgrath-bama-2022-q6",
    type: "rivalry-clinchers",
    prompt: "Which Tennessee kicker hit the walk-off 40-yard field goal to beat Alabama 52–49 in October 2022?",
    choices: ["Chase McGrath", "Will Reichard", "Peyton Woodring", "Harrison Mevis"],
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
    explanation: "TCU defensive back Bud Clark intercepted J.J. McCarthy and returned it 41 yards for the opening touchdown against Michigan on December 31, 2022. Dee Winters added a different pick-six later.",
    evidence: [{ authority: "Official school athletics", url: "https://gofrogs.com/news/2022/12/31/football-tcu-beats-michigan-advances-to-the-cfp-national-championship", supportingDetail: "TCU Athletics separately verifies Clark's 41-yard opening pick-six and Winters' later return; both are answer choices but only Clark satisfies the question." }],
  },
  "cfb:9:3": {
    id: "millionaire-cfb-future-vandy-bama-first-no1-q4",
    type: "signature-upsets",
    prompt: "Which SEC school recorded its first win over an AP No. 1 team by beating Alabama 40–35 in October 2024?",
    choices: ["Vanderbilt", "Tennessee", "Auburn", "Mississippi State"],
    answer: "Vanderbilt",
    statSheet: "Quarterback Diego Pavia led the upset in Nashville.",
    explanation: "Vanderbilt defeated top-ranked Alabama 40–35 on October 5, 2024, earning its first win in program history over an AP No. 1 opponent behind quarterback Diego Pavia.",
    evidence: [{ authority: "Official school athletics", url: "https://vucommodores.com/news/2024/10/05/this-magic-moment", supportingDetail: "Vanderbilt's official recap records the 40–35 score and the school's first No. 1-ranked victory." }],
  },

  // Future-only corrections to exact selectable Bar Trivia fact collisions.
  // The published legacy Millionaire boards remain immutable.
  "nfl:3:4": {
    id: "millionaire-nfl-future-graham-strip-sack-sblii-q5",
    type: "super-bowl-turning-points",
    prompt: "Which Eagles defender strip-sacked Tom Brady with just over two minutes left in Super Bowl LII?",
    choices: ["Brandon Graham", "Fletcher Cox", "Derek Barnett", "Chris Long"],
    answer: "Brandon Graham",
    statSheet: "The takeaway helped protect Philadelphia's 38–33 lead before an insurance field goal in the fourth quarter.",
    explanation: "Brandon Graham strip-sacked Tom Brady with 2:09 remaining in Super Bowl LII. Derek Barnett recovered the fumble, and Philadelphia defeated New England 41–33.",
    evidence: [{ authority: "NFL game analysis", url: "https://www.nfl.com/news/eagles-d-on-strip-sack-it-was-only-a-matter-of-time-0ap3000000914610", supportingDetail: "The NFL confirms Graham forced the fumble, Barnett recovered and the Eagles won 41–33." }],
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
  "ufc:1:0": {
    id: "millionaire-ufc-future-285-jones-heavyweight-q1",
    type: "heavyweight-title-return",
    prompt: "Which former light heavyweight champion submitted Ciryl Gane to win the UFC heavyweight title at UFC 285?",
    choices: ["Jon Jones", "Stipe Miocic", "Daniel Cormier", "Francis Ngannou"],
    answer: "Jon Jones",
    statSheet: "The March 2023 main event ended by guillotine choke just over two minutes into the first round.",
    explanation: "Jon Jones returned from a three-year absence to submit Ciryl Gane at 2:04 of Round 1 at UFC 285, earning his first UFC heavyweight title.",
    evidence: [{ authority: "UFC 285 official results", url: "https://www.ufc.com/news/official-judges-scorecards-ufc-285-jones-vs-gane", supportingDetail: "Jones defeated Gane by guillotine submission at 2:04 of the first round." }],
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
    explanation: "Notre Dame lost the December 2020 ACC championship to Clemson, 34–10, yet became the first team selected for the four-team CFP after a conference title-game defeat.",
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
    explanation: "Texas won the 2005 season's national championship, beating USC on January 4, 2006.",
    evidence: [{ authority: "Texas Athletics", url: "https://texaslonghorns.com/sports/2013/7/21/FB_0721132407", supportingDetail: "The school documents Texas defeating USC in the January 4, 2006 Rose Bowl national-title game." }],
  },
  "cfb:2:0": {
    id: "millionaire-cfb-future-2023-season-michigan-q1",
    type: "championship-season",
    prompt: "Which team won the 2023 season's CFP national title in January 2024?",
    choices: ["Michigan", "Washington", "Alabama", "Texas"], answer: "Michigan",
    statSheet: "The undefeated winner beat Washington 34–13 in Houston.",
    explanation: "Michigan won the 2023 season's national championship in the CFP final on January 8, 2024.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2024/1/31/ncg-recap-2024", supportingDetail: "The CFP confirms Michigan's 34–13 win over Washington in the January 2024 final." }],
  },
  "cfb:5:0": {
    id: "millionaire-cfb-future-2020-season-alabama-q1",
    type: "championship-season",
    prompt: "Which school won the 2020 season's CFP national title in January 2021?",
    choices: ["Alabama", "Ohio State", "Clemson", "LSU"], answer: "Alabama",
    statSheet: "The champion beat Ohio State 52–24 in Miami Gardens.",
    explanation: "Alabama won the 2020 season's national championship in the January 11, 2021 title game.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2025/3/20/cfp-recap-2021", supportingDetail: "The CFP records Alabama beating Ohio State 52–24 in the 2020–21 postseason." }],
  },
  "cfb:7:0": {
    id: "millionaire-cfb-future-2019-season-lsu-q1",
    type: "championship-season",
    prompt: "Which school won the 2019 season's CFP national title in January 2020?",
    choices: ["LSU", "Clemson", "Alabama", "Ohio State"], answer: "LSU",
    statSheet: "The 15–0 champion defeated Clemson 42–25 in New Orleans.",
    explanation: "LSU finished the 2019 season 15–0 and won the CFP title game on January 13, 2020.",
    evidence: [{ authority: "College Football Playoff", url: "https://collegefootballplayoff.com/sports/2026/8/10/ncg-history", supportingDetail: "The CFP's title history lists LSU's 42–25 January 2020 championship win." }],
  },
  "ufc:0:6": {
    id: "millionaire-ufc-future-maurice-smith-coleman-ufc14-q7",
    type: "heavyweight-history",
    prompt: "Who defeated Mark Coleman by decision at UFC 14 to become UFC heavyweight champion?",
    choices: ["Maurice Smith", "Bas Rutten", "Randy Couture", "Don Frye"], answer: "Maurice Smith",
    statSheet: "A former kickboxer survived the wrestler's early pressure to win in 1997.",
    explanation: "Maurice Smith defeated Mark Coleman by unanimous decision at UFC 14 to win the heavyweight title.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/news/15-ufc-heavyweight-champions", supportingDetail: "The UFC heavyweight lineage identifies Smith's UFC 14 victory over Coleman." }],
  },
  "nfl:9:0": {
    id: "millionaire-nfl-2026-editorial-brees-first-team-q1",
    type: "career-history",
    prompt: "Which NFL team did Drew Brees play for before he joined the New Orleans Saints?",
    choices: ["Chargers", "Dolphins", "Colts", "Broncos"], answer: "Chargers",
    statSheet: "The quarterback began his NFL career in California after being drafted in 2001.",
    explanation: "Brees spent his first five NFL seasons with the San Diego Chargers before joining New Orleans in 2006.",
    evidence: [],
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
    explanation: "LaVell Edwards led the 1984 BYU Cougars to a perfect 13-0 season and national championship.",
    evidence: [{ authority: "BYU Athletics", url: "https://byucougars.com/staff/1984-national-champions", supportingDetail: "The school lists Edwards as 1984 coach and reports a 13-0 national-title season." }],
  },
  "cfb:2:3": {
    id: "millionaire-cfb-leach-before-miss-state-q4",
    type: "coaching-moves",
    prompt: "Which program did Mike Leach coach immediately before becoming Mississippi State's head coach?",
    choices: ["Washington State", "Texas Tech", "Houston", "Oregon State"], answer: "Washington State",
    statSheet: "His previous team finished 11-2 during the 2018 season in the Pac-12.",
    explanation: "Mike Leach coached at Washington State from 2012 to 2019, then became Mississippi State's head coach.",
    evidence: [],
  },
  "cfb:3:4": {
    id: "millionaire-cfb-auburn-2010-chizik-q5",
    type: "championship-coaches",
    prompt: "Who coached Auburn's undefeated 2010 national championship team?",
    choices: ["Gene Chizik", "Tommy Tuberville", "Gus Malzahn", "Nick Saban"], answer: "Gene Chizik",
    statSheet: "His second Auburn season ended with a 22–19 BCS title-game win over Oregon.",
    explanation: "Gene Chizik coached Auburn to a 14–0 record and the 2010 season's national championship, won in January 2011.",
    evidence: [{ authority: "Auburn Athletics", url: "https://auburntigers.com/news/2020/10/29/auburn-unveils-2010-national-championship-banner-chizik-recalls-incredible-journey", supportingDetail: "The school's retrospective identifies Chizik as head coach of undefeated 2010 Auburn." }],
  },
  "cfb:6:7": {
    id: "millionaire-cfb-2018-rose-bowl-sony-michel-q8",
    type: "playoff-walkoff",
    prompt: "Which Georgia running back scored the 27-yard double-overtime walk-off touchdown against Oklahoma in the January 2018 Rose Bowl?",
    choices: ["Sony Michel", "Nick Chubb", "D'Andre Swift", "Elijah Holyfield"], answer: "Sony Michel",
    statSheet: null,
    explanation: "Sony Michel's 27-yard touchdown run ended Georgia's 54–48 double-overtime semifinal thriller against Oklahoma on January 1, 2018.",
    evidence: [{ authority: "Georgia Athletics", url: "https://georgiadogs.com/news/2018/1/1/football-georgia-beats-oklahoma-to-win-rose-bowl-game?path=football", supportingDetail: "The official Rose Bowl recap documents Michel's 27-yard walk-off score following a blocked Oklahoma field goal." }],
  },
  "ufc:4:1": {
    id: "millionaire-ufc-287-adesanya-pereira-q2",
    type: "title-rematches",
    prompt: "Who knocked out Alex Pereira at UFC 287 to regain the middleweight championship?",
    choices: ["Israel Adesanya", "Robert Whittaker", "Sean Strickland", "Dricus du Plessis"], answer: "Israel Adesanya",
    statSheet: "The Miami title rematch ended late in Round 2 in April 2023.",
    explanation: "Israel Adesanya knocked out Alex Pereira at 4:21 of Round 2 at UFC 287 to regain the UFC middleweight title.",
    evidence: [{ authority: "UFC 287 official results", url: "https://www.ufc.com/news/ufc-287-pereira-vs-adesanya-2-results-highlights-winner-interviews-miami?language_content_entity=en", supportingDetail: "Official fight results confirm Adesanya KO over Pereira, 4:21 of Round 2." }],
  },
  "ufc:9:3": {
    id: "millionaire-ufc-219-holm-cyborg-q4",
    type: "womens-featherweight",
    prompt: "Who challenged Cris Cyborg for the UFC women's featherweight championship at UFC 219?",
    choices: ["Holly Holm", "Ronda Rousey", "Amanda Nunes", "Germaine de Randamie"], answer: "Holly Holm",
    statSheet: "The Las Vegas main event in December 2017 went the full five rounds.",
    explanation: "Holly Holm challenged champion Cris Cyborg in UFC 219's main event, losing by decision.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/event/ufc-219", supportingDetail: "Official UFC 219 event result lists Cyborg vs Holm, five-round unanimous decision." }],
  },
  "ufc:9:7": {
    id: "millionaire-ufc-289-nunes-last-opponent-q8",
    type: "retirement-fights",
    prompt: "Who did Amanda Nunes defeat by decision in her final UFC fight before retiring in 2023?",
    choices: ["Irene Aldana", "Julianna Peña", "Raquel Pennington", "Holly Holm"], answer: "Irene Aldana",
    statSheet: null,
    explanation: "Amanda Nunes defeated Irene Aldana by unanimous decision at UFC 289 before announcing her retirement.",
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
    type: "middleweight-upsets",
    prompt: "Who upset Israel Adesanya by unanimous decision to win the UFC middleweight title at UFC 293?",
    choices: ["Sean Strickland","Dricus du Plessis","Robert Whittaker","Jared Cannonier"], answer: "Sean Strickland",
    statSheet: "All three judges scored the Sydney main event 49–46 for the challenger.",
    explanation: "Sean Strickland defeated Israel Adesanya by unanimous decision (49–46 on all three cards) at UFC 293 in Sydney on September 9, 2023, taking the middleweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-293-adesanya-vs-strickland-results-highlights-winner-interviews-sydney", supportingDetail: "Sean Strickland defeated Israel Adesanya by unanimous decision (49–46 on all three cards) at UFC 293 in Sydney on September 9, 2023, taking the middleweight championship." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 1 Q5.
  "ufc:0:4": {
    id: "millionaire-ufc-future-rewrite-r1-q5",
    type: "championship-upsets",
    prompt: "Who submitted Amanda Nunes to win the women's bantamweight championship at UFC 269?",
    choices: ["Julianna Peña","Holly Holm","Raquel Pennington","Miesha Tate"], answer: "Julianna Peña",
    statSheet: "The dramatic Las Vegas upset ended by rear-naked choke in Round 2.",
    explanation: "Julianna Peña shocked Amanda Nunes with a rear-naked choke at 3:23 of Round 2 at UFC 269 in December 2021 to claim the UFC women's bantamweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/10-biggest-best-upsets-2021-pena-poirier-dariush-blachowicz?language_content_entity=en", supportingDetail: "Julianna Peña shocked Amanda Nunes with a rear-naked choke at 3:23 of Round 2 at UFC 269 in December 2021 to claim the UFC women's bantamweight championship." }],
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
    id: "millionaire-ufc-future-rewrite-r2-q6",
    type: "highlight-reel-knockouts",
    prompt: "Who knocked out Tony Ferguson with a front kick early in Round 2 at UFC 274?",
    choices: ["Michael Chandler","Justin Gaethje","Charles Oliveira","Beneil Dariush"], answer: "Michael Chandler",
    statSheet: "The lightweight finish occurred just 17 seconds into the second round.",
    explanation: "Michael Chandler knocked out Tony Ferguson with a front kick at 0:17 of Round 2 at UFC 274 in Phoenix on May 7, 2022.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/event/ufc-274", supportingDetail: "Michael Chandler knocked out Tony Ferguson with a front kick at 0:17 of Round 2 at UFC 274 in Phoenix on May 7, 2022." }],
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
    type: "strawweight-rivalries",
    prompt: "Who knocked out Joanna Jędrzejczyk with a spinning backfist in their UFC 275 rematch?",
    choices: ["Zhang Weili","Rose Namajunas","Jessica Andrade","Carla Esparza"], answer: "Zhang Weili",
    statSheet: "The second meeting ended in Round 2 in Singapore, after the first had gone five rounds.",
    explanation: "Zhang Weili knocked out Joanna Jędrzejczyk by spinning backfist at 2:28 of Round 2 at UFC 275 in June 2022. Joanna announced her retirement afterward.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/knockouts-2022-ufc-awards-edwards-chandler-zhang-pereira", supportingDetail: "Zhang Weili knocked out Joanna Jędrzejczyk by spinning backfist at 2:28 of Round 2 at UFC 275 in June 2022. Joanna announced her retirement afterward." }],
  },
  // Active Bar Trivia fact collision retired from future-preview run 4 Q1.
  "ufc:3:0": {
    id: "millionaire-ufc-future-rewrite-r4-q1",
    type: "welterweight-comebacks",
    prompt: "Who scored the fifth-round head-kick knockout of Kamaru Usman at UFC 278?",
    choices: ["Leon Edwards","Colby Covington","Gilbert Burns","Jorge Masvidal"], answer: "Leon Edwards",
    statSheet: "The challenger was behind on the judges' scorecards late in the title fight.",
    explanation: "Leon Edwards knocked out Kamaru Usman with a left high kick at 4:04 of Round 5 at UFC 278 in August 2022, winning the UFC welterweight title.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-278-usman-vs-edwards-2-results-highlights-winner-interviews-salt-lake-city", supportingDetail: "Leon Edwards knocked out Kamaru Usman with a left high kick at 4:04 of Round 5 at UFC 278 in August 2022, winning the UFC welterweight title." }],
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
    type: "light-heavyweight-title-finishes", prompt: "Who submitted Glover Teixeira late in Round 5 to win the UFC light heavyweight belt at UFC 275?",
    choices: ["Jiří Procházka","Alex Pereira","Jan Błachowicz","Magomed Ankalaev"], answer: "Jiří Procházka",
    statSheet: "The closely contested championship ended with under 30 seconds left in the final round.", explanation: "Jiří Procházka submitted Glover Teixeira by rear-naked choke at 4:32 of Round 5 of their UFC 275 championship fight in June 2022.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-275-teixeira-vs-prochazka-fight-results-highlights-winner-interviews-singapore?language_content_entity=fr", supportingDetail: "Jiří Procházka submitted Glover Teixeira by rear-naked choke at 4:32 of Round 5 of their UFC 275 championship fight in June 2022." }],
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
    type: "bantamweight-title-upsets", prompt: "Who stopped Aljamain Sterling in Round 2 to win the bantamweight belt at UFC 292?",
    choices: ["Sean O’Malley","Merab Dvalishvili","Petr Yan","Cory Sandhagen"], answer: "Sean O’Malley",
    statSheet: "The new champion scored a 51-second finish early in Round 2 in Boston.", explanation: "Sean O’Malley defeated Aljamain Sterling by TKO at 0:51 of Round 2 of the UFC 292 main event in Boston in August 2023, winning the bantamweight championship.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-292-sterling-vs-omalley-results-highlights-winner-interviews-boston?language_content_entity=en", supportingDetail: "Sean O’Malley defeated Aljamain Sterling by TKO at 0:51 of Round 2 of the UFC 292 main event in Boston in August 2023, winning the bantamweight championship." }],
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
    type: "strawweight-title-knockouts", prompt: "Who knocked out Zhang Weili with a first-round head kick to regain the strawweight title at UFC 261?",
    choices: ["Rose Namajunas","Jessica Andrade","Joanna Jędrzejczyk","Carla Esparza"], answer: "Rose Namajunas",
    statSheet: "The knockout occurred just 78 seconds into the Jacksonville co-main event.", explanation: "Rose Namajunas knocked out Zhang Weili at 1:18 of Round 1 at UFC 261 in April 2021, using a left head kick to regain the strawweight title.",
    evidence: [{ authority: "UFC official event results", url: "https://www.ufc.com/news/ufc-261-usman-vs-masvidal-2-zhang-namajunas-results-highlights-interviews-winners", supportingDetail: "Rose Namajunas knocked out Zhang Weili at 1:18 of Round 1 at UFC 261 in April 2021, using a left head kick to regain the strawweight title." }],
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
    id: "millionaire-nfl-future-semantic-r2-q5",
    type: "rushing-seasons", prompt: "Which Tennessee running back rushed for 2,027 yards during the 2020 season?",
    choices: ["Derrick Henry","Jonathan Taylor","Saquon Barkley","Dalvin Cook"], answer: "Derrick Henry",
    statSheet: "He led the NFL in carries, rushing yards and rushing touchdowns.", explanation: "Derrick Henry rushed for 2,027 yards and 17 touchdowns for Tennessee in 2020, surpassing the 2,000-yard barrier.",
    evidence: [{ authority: "NFL official report", url: "https://www.nfl.com/players/derrick-henry/stats/career", supportingDetail: "Derrick Henry rushed for 2,027 yards and 17 touchdowns for Tennessee in 2020, surpassing the 2,000-yard barrier." }],
  },
  // Primary-source-supported future-only replacement for selected Bar Trivia fact collision.
  "nfl:2:1": {
    id: "millionaire-nfl-future-semantic-r3-q2",
    type: "super-bowl-mvps", prompt: "Which Eagles quarterback was named MVP of Super Bowl LIX after defeating Kansas City?",
    choices: ["Jalen Hurts","Patrick Mahomes","Nick Foles","Kenny Pickett"], answer: "Jalen Hurts",
    statSheet: "The champion won 40–22 and its quarterback rushed for 72 yards.", explanation: "Jalen Hurts was named Super Bowl LIX MVP in February 2025 after throwing for 221 yards and two touchdowns and rushing for 72 yards as Philadelphia beat Kansas City 40–22.",
    evidence: [{ authority: "NFL official report", url: "https://amp.nfl.com/news/eagles-qb-jalen-hurts-named-super-bowl-lix-most-valuable-player", supportingDetail: "Jalen Hurts was named Super Bowl LIX MVP in February 2025 after throwing for 221 yards and two touchdowns and rushing for 72 yards as Philadelphia beat Kansas City 40–22." }],
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

};

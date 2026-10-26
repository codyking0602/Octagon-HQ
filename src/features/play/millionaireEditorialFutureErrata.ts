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
};

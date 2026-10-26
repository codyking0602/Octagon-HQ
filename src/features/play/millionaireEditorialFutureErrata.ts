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
  "nfl:9:0": {
    id: "millionaire-nfl-2026-editorial-brees-first-team-q1",
    type: "career-history",
    prompt: "Which NFL team did Drew Brees play for before he joined the New Orleans Saints?",
    choices: ["Chargers", "Dolphins", "Colts", "Broncos"], answer: "Chargers",
    statSheet: "The quarterback began his NFL career in California after being drafted in 2001.",
    explanation: "Brees spent his first five NFL seasons with the San Diego Chargers before joining New Orleans in 2006.",
    evidence: [],
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
    id: "millionaire-cfb-oklahoma-2000-stoops-q5",
    type: "coaching-history",
    prompt: "Who coached Oklahoma to the 2000 season's national championship?",
    choices: ["Bob Stoops", "Barry Switzer", "Gary Gibbs", "Lincoln Riley"], answer: "Bob Stoops",
    statSheet: "The title came in the coach's second season with the Sooners.",
    explanation: "Bob Stoops led Oklahoma to a 13-0 season and victory over Florida State in the Orange Bowl.",
    evidence: [{ authority: "Oklahoma Athletics", url: "https://soonersports.com/news/2000/12/1/208393211", supportingDetail: "Oklahoma's December 2000 football report identifies Bob Stoops as coach en route to the Orange Bowl title game." }],
  },
  "cfb:6:7": {
    id: "millionaire-cfb-nebraska-2001-solich-q8",
    type: "coaching-history",
    prompt: "Who coached Nebraska when it reached the BCS title game after the 2001 season despite losing its final regular-season game?",
    choices: ["Frank Solich", "Tom Osborne", "Bo Pelini", "Bob Devaney"], answer: "Frank Solich",
    statSheet: null,
    explanation: "Frank Solich coached Nebraska to the 2001 season's Rose Bowl BCS championship game, losing to Miami.",
    evidence: [{ authority: "Nebraska Athletics", url: "https://huskers.com/sports/football/roster/season/2001/staff/frank-solich", supportingDetail: "Nebraska identifies Solich as 2001 head coach and describes its BCS title game appearance." }],
  },
  "ufc:0:6": {
    id: "millionaire-ufc-31-newton-champion-q7",
    type: "welterweight-history",
    prompt: "Who submitted Pat Miletich to become UFC welterweight champion at UFC 31?",
    choices: ["Carlos Newton", "B.J. Penn", "Matt Hughes", "Robbie Lawler"], answer: "Carlos Newton",
    statSheet: "The championship changed hands via a third-round submission in Atlantic City.",
    explanation: "Carlos Newton submitted Pat Miletich at UFC 31 on May 4, 2001, winning the welterweight championship.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/news/ufc-welterweight-title-lineage?language_content_entity=en", supportingDetail: "Official title lineage records Newton beating Miletich via submission at UFC 31." }],
  },
  "ufc:4:1": {
    id: "millionaire-ufc-189-lawler-macdonald-q2",
    type: "classic-fights",
    prompt: "Who challenged Robbie Lawler in the acclaimed UFC 189 welterweight championship bout?",
    choices: ["Rory MacDonald", "Carlos Condit", "Johny Hendricks", "Donald Cerrone"], answer: "Rory MacDonald",
    statSheet: "The champion retained his belt with a fifth-round stoppage after a brutal five-round battle.",
    explanation: "Robbie Lawler stopped Rory MacDonald in the fifth round of their celebrated UFC 189 fight.",
    evidence: [{ authority: "UFC", url: "https://www.ufc.com/athlete/robbie-lawler", supportingDetail: "UFC's bout ledger documents Lawler vs MacDonald at UFC 189 and fifth-round finish." }],
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

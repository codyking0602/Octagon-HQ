import type { FootballFindLeaderPresentationCandidate } from "../back-room/FootballFindLeaderPresentation";

export type MlbFindLeaderCandidate = FootballFindLeaderPresentationCandidate & {
  teamAbbreviation: string;
};

export type MlbFindLeaderBoard = {
  id: string;
  question: string;
  context: string;
  categoryLabel: string;
  statLabel: string;
  shortLabel: string;
  valueFormat: "integer" | "average";
  candidates: readonly MlbFindLeaderCandidate[];
};

export const MLB_FIND_LEADER_BURNED_CONTENT = {
  questionIds: [
    "mlb-preview-career-doubles",
    "mlb-preview-career-pitching-strikeouts",
  ],
  candidateIds: [
    "ken-griffey-jr",
    "cal-ripken-jr",
    "david-ortiz",
    "tony-gwynn",
    "stan-musial",
    "derek-jeter",
    "miguel-cabrera",
    "barry-bonds",
    "hank-aaron",
    "albert-pujols",
    "randy-johnson",
    "roger-clemens",
    "steve-carlton",
    "tom-seaver",
    "greg-maddux",
    "pedro-martinez",
    "bob-gibson",
    "curt-schilling",
    "john-smoltz",
    "sandy-koufax",
  ],
  candidateNames: [
    "Ken Griffey Jr.",
    "Cal Ripken Jr.",
    "David Ortiz",
    "Tony Gwynn",
    "Stan Musial",
    "Derek Jeter",
    "Miguel Cabrera",
    "Barry Bonds",
    "Hank Aaron",
    "Albert Pujols",
    "Randy Johnson",
    "Roger Clemens",
    "Steve Carlton",
    "Tom Seaver",
    "Greg Maddux",
    "Pedro Martinez",
    "Bob Gibson",
    "Curt Schilling",
    "John Smoltz",
    "Sandy Koufax",
  ],
} as const;

/**
 * Scheduled 2026 MLB Play content. These boards are intentionally separate
 * from every owner-review subject and board shown before launch.
 */
export const MLB_FIND_LEADER_PRODUCTION_BOARDS: readonly MlbFindLeaderBoard[] = [
  {
    id: "mlb-2026-play-01-career-home-runs",
    question: "Who has the most career MLB home runs?",
    context: "Career regular-season home runs.",
    categoryLabel: "MLB · CAREER HOME RUNS",
    statLabel: "career MLB home runs",
    shortLabel: "HR",
    valueFormat: "integer",
    candidates: [
      { id: "willie-mays", name: "Willie Mays", subtitle: "CF", value: 660, teamAbbreviation: "SF" },
      { id: "jim-thome", name: "Jim Thome", subtitle: "1B / DH", value: 612, teamAbbreviation: "CLE" },
      { id: "sammy-sosa", name: "Sammy Sosa", subtitle: "RF", value: 609, teamAbbreviation: "CHC" },
      { id: "frank-robinson", name: "Frank Robinson", subtitle: "OF", value: 586, teamAbbreviation: "BAL" },
      { id: "mark-mcgwire", name: "Mark McGwire", subtitle: "1B", value: 583, teamAbbreviation: "STL" },
      { id: "harmon-killebrew", name: "Harmon Killebrew", subtitle: "1B / 3B", value: 573, teamAbbreviation: "MIN" },
      { id: "reggie-jackson", name: "Reggie Jackson", subtitle: "RF", value: 563, teamAbbreviation: "ATH" },
      { id: "manny-ramirez", name: "Manny Ramirez", subtitle: "LF / RF", value: 555, teamAbbreviation: "BOS" },
      { id: "mike-schmidt", name: "Mike Schmidt", subtitle: "3B", value: 548, teamAbbreviation: "PHI" },
      { id: "frank-thomas", name: "Frank Thomas", subtitle: "1B / DH", value: 521, teamAbbreviation: "CWS" },
    ],
  },
  {
    id: "mlb-2026-play-01-career-average",
    question: "Who has the highest career MLB batting average?",
    context: "Career regular-season batting average.",
    categoryLabel: "MLB · CAREER BATTING AVERAGE",
    statLabel: "career MLB batting average",
    shortLabel: "AVG",
    valueFormat: "average",
    candidates: [
      { id: "ty-cobb", name: "Ty Cobb", subtitle: "CF", value: 0.367, teamAbbreviation: "DET" },
      { id: "rogers-hornsby", name: "Rogers Hornsby", subtitle: "2B", value: 0.358, teamAbbreviation: "STL" },
      { id: "shoeless-joe-jackson", name: "Shoeless Joe Jackson", subtitle: "LF", value: 0.356, teamAbbreviation: "CWS" },
      { id: "tris-speaker", name: "Tris Speaker", subtitle: "CF", value: 0.345, teamAbbreviation: "CLE" },
      { id: "ted-williams", name: "Ted Williams", subtitle: "LF", value: 0.344, teamAbbreviation: "BOS" },
      { id: "babe-ruth", name: "Babe Ruth", subtitle: "OF", value: 0.342, teamAbbreviation: "BOS" },
      { id: "wade-boggs", name: "Wade Boggs", subtitle: "3B", value: 0.328, teamAbbreviation: "BOS" },
      { id: "rod-carew", name: "Rod Carew", subtitle: "1B / 2B", value: 0.328, teamAbbreviation: "MIN" },
      { id: "roberto-clemente", name: "Roberto Clemente", subtitle: "RF", value: 0.317, teamAbbreviation: "PIT" },
      { id: "george-brett", name: "George Brett", subtitle: "3B", value: 0.305, teamAbbreviation: "KC" },
    ],
  },
] as const;


export const MLB_FIND_LEADER_SECOND_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-13" as const;
export const MLB_FIND_LEADER_SECOND_PRODUCTION_DATE = "2026-10-13" as const;

/**
 * October 13 production boards. The season is part of every season-based
 * candidate name so the identity remains visible even in compact/mobile cards.
 *
 * Career hits and single-season home runs are matched to MLB's official records.
 */
/**
 * October 13: household-name candidate field, deliberately weighted to
 * the 1990s–2020s rather than filling boards from obscure all-time rankings.
 * All totals are MLB regular-season records, and season years remain visible.
 * Sources: MLB all-time hits and MLB single-season home-run leaders.
 */
export const MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS: readonly MlbFindLeaderBoard[] = [
  {
    id: "mlb-2026-play-13-career-hits",
    question: "Which baseball legend finished with the most career MLB hits?",
    context: "Career regular-season hits. Ten household-name stars spanning multiple eras.",
    categoryLabel: "MLB · CAREER HITS",
    statLabel: "career MLB hits",
    shortLabel: "H",
    valueFormat: "integer",
    candidates: [
      { id: "pete-rose", name: "Pete Rose", subtitle: "1B / OF", value: 4256, teamAbbreviation: "CIN" },
      { id: "hank-aaron", name: "Hank Aaron", subtitle: "RF", value: 3771, teamAbbreviation: "ATL" },
      { id: "derek-jeter", name: "Derek Jeter", subtitle: "SS", value: 3465, teamAbbreviation: "NYY" },
      { id: "albert-pujols", name: "Albert Pujols", subtitle: "1B", value: 3384, teamAbbreviation: "STL" },
      { id: "willie-mays", name: "Willie Mays", subtitle: "CF", value: 3293, teamAbbreviation: "SF" },
      { id: "cal-ripken-jr", name: "Cal Ripken Jr.", subtitle: "SS", value: 3184, teamAbbreviation: "BAL" },
      { id: "miguel-cabrera", name: "Miguel Cabrera", subtitle: "1B", value: 3174, teamAbbreviation: "DET" },
      { id: "tony-gwynn", name: "Tony Gwynn", subtitle: "RF", value: 3141, teamAbbreviation: "SD" },
      { id: "alex-rodriguez", name: "Alex Rodriguez", subtitle: "SS / 3B", value: 3115, teamAbbreviation: "NYY" },
      { id: "ichiro-suzuki", name: "Ichiro Suzuki", subtitle: "RF", value: 3089, teamAbbreviation: "SEA" },
    ],
  },
  {
    id: "mlb-2026-play-13-single-season-home-runs",
    question: "Who hit the most home runs in a single MLB season?",
    context: "Regular-season home runs in the season shown. The year is part of each player's identity.",
    categoryLabel: "MLB · SINGLE-SEASON HOME RUNS",
    statLabel: "home runs that season",
    shortLabel: "HR",
    valueFormat: "integer",
    candidates: [
      { id: "barry-bonds-2001", name: "Barry Bonds (2001)", subtitle: "LF", value: 73, teamAbbreviation: "SF" },
      { id: "mark-mcgwire-1998", name: "Mark McGwire (1998)", subtitle: "1B", value: 70, teamAbbreviation: "STL" },
      { id: "sammy-sosa-1998", name: "Sammy Sosa (1998)", subtitle: "RF", value: 66, teamAbbreviation: "CHC" },
      { id: "aaron-judge-2022", name: "Aaron Judge (2022)", subtitle: "RF", value: 62, teamAbbreviation: "NYY" },
      { id: "cal-raleigh-2025", name: "Cal Raleigh (2025)", subtitle: "C", value: 60, teamAbbreviation: "SEA" },
      { id: "babe-ruth-1927", name: "Babe Ruth (1927)", subtitle: "RF", value: 60, teamAbbreviation: "NYY" },
      { id: "giancarlo-stanton-2017", name: "Giancarlo Stanton (2017)", subtitle: "RF", value: 59, teamAbbreviation: "MIA" },
      { id: "ryan-howard-2006", name: "Ryan Howard (2006)", subtitle: "1B", value: 58, teamAbbreviation: "PHI" },
      { id: "david-ortiz-2006", name: "David Ortiz (2006)", subtitle: "DH", value: 54, teamAbbreviation: "BOS" },
      { id: "shohei-ohtani-2024", name: "Shohei Ohtani (2024)", subtitle: "DH", value: 54, teamAbbreviation: "LAD" },
    ],
  },
] as const;

export function mlbFindLeaderProductionBoards(
  challengeKey: string,
  challengeDate: string,
): readonly MlbFindLeaderBoard[] | null {
  if (challengeKey === "mlb-2026-play-01" && challengeDate === "2026-09-27") {
    return MLB_FIND_LEADER_PRODUCTION_BOARDS;
  }
  if (
    challengeKey === MLB_FIND_LEADER_SECOND_PRODUCTION_CHALLENGE_KEY
    && challengeDate === MLB_FIND_LEADER_SECOND_PRODUCTION_DATE
  ) {
    return MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS;
  }
  return null;
}

export function formatMlbFindLeaderValue(board: MlbFindLeaderBoard, value: number) {
  return board.valueFormat === "average"
    ? value.toFixed(3).replace(/^0/, "")
    : value.toLocaleString("en-US");
}

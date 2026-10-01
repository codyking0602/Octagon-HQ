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
 * Career-hit values follow MLB.com's all-time totals. Stolen-base values use
 * MLB's Modern Era (since 1900) season records and team-season leader records.
 */
export const MLB_FIND_LEADER_SECOND_PRODUCTION_BOARDS: readonly MlbFindLeaderBoard[] = [
  {
    id: "mlb-2026-play-13-career-hits",
    question: "Who has the most career MLB hits?",
    context: "Official MLB career hit totals.",
    categoryLabel: "MLB · CAREER HITS",
    statLabel: "career MLB hits",
    shortLabel: "H",
    valueFormat: "integer",
    candidates: [
      { id: "pete-rose", name: "Pete Rose", subtitle: "1B / OF", value: 4256, teamAbbreviation: "CIN" },
      { id: "honus-wagner", name: "Honus Wagner", subtitle: "SS", value: 3430, teamAbbreviation: "PIT" },
      { id: "carl-yastrzemski", name: "Carl Yastrzemski", subtitle: "LF", value: 3419, teamAbbreviation: "BOS" },
      { id: "paul-molitor", name: "Paul Molitor", subtitle: "DH / 3B", value: 3319, teamAbbreviation: "MIL" },
      { id: "eddie-collins", name: "Eddie Collins", subtitle: "2B", value: 3314, teamAbbreviation: "CWS" },
      { id: "eddie-murray", name: "Eddie Murray", subtitle: "1B", value: 3255, teamAbbreviation: "BAL" },
      { id: "nap-lajoie", name: "Nap Lajoie", subtitle: "2B", value: 3252, teamAbbreviation: "CLE" },
      { id: "paul-waner", name: "Paul Waner", subtitle: "RF", value: 3152, teamAbbreviation: "PIT" },
      { id: "robin-yount", name: "Robin Yount", subtitle: "SS / CF", value: 3142, teamAbbreviation: "MIL" },
      { id: "dave-winfield", name: "Dave Winfield", subtitle: "RF", value: 3110, teamAbbreviation: "SD" },
    ],
  },
  {
    id: "mlb-2026-play-13-single-season-stolen-bases",
    question: "Who stole the most bases in a single MLB season?",
    context: "Modern Era single-season stolen bases. The season is part of each candidate identity.",
    categoryLabel: "MLB · SINGLE-SEASON STOLEN BASES",
    statLabel: "stolen bases that season",
    shortLabel: "SB",
    valueFormat: "integer",
    candidates: [
      { id: "rickey-henderson-1982", name: "Rickey Henderson (1982)", subtitle: "LF", value: 130, teamAbbreviation: "ATH" },
      { id: "lou-brock-1974", name: "Lou Brock (1974)", subtitle: "LF", value: 118, teamAbbreviation: "STL" },
      { id: "vince-coleman-1985", name: "Vince Coleman (1985)", subtitle: "LF", value: 110, teamAbbreviation: "STL" },
      { id: "maury-wills-1962", name: "Maury Wills (1962)", subtitle: "SS", value: 104, teamAbbreviation: "LAD" },
      { id: "ty-cobb-1915", name: "Ty Cobb (1915)", subtitle: "CF", value: 96, teamAbbreviation: "DET" },
      { id: "eric-davis-1986", name: "Eric Davis (1986)", subtitle: "CF", value: 80, teamAbbreviation: "CIN" },
      { id: "jose-reyes-2007", name: "José Reyes (2007)", subtitle: "SS", value: 78, teamAbbreviation: "NYM" },
      { id: "ronald-acuna-jr-2023", name: "Ronald Acuña Jr. (2023)", subtitle: "RF", value: 73, teamAbbreviation: "ATL" },
      { id: "tony-womack-1999", name: "Tony Womack (1999)", subtitle: "2B / OF", value: 72, teamAbbreviation: "ARI" },
      { id: "scott-podsednik-2004", name: "Scott Podsednik (2004)", subtitle: "CF", value: 70, teamAbbreviation: "MIL" },
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

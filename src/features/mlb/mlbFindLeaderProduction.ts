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

export function formatMlbFindLeaderValue(board: MlbFindLeaderBoard, value: number) {
  return board.valueFormat === "average"
    ? value.toFixed(3).replace(/^0/, "")
    : value.toLocaleString("en-US");
}

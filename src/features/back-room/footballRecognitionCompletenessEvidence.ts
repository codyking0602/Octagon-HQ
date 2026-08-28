export type FootballRecognitionCompletenessKind =
  | "player-career" | "player-season" | "team-season" | "franchise" | "program" | "coach" | "program-era" | "game";

export interface FootballRecognitionCompletenessCandidate {
  name: string;
  league: "NFL" | "CFB";
  kind: FootballRecognitionCompletenessKind;
  minimumTier: "A" | "B";
  evidenceFamily:
    | "pro-football-hall-of-fame"
    | "college-football-hall-of-fame"
    | "heisman"
    | "mvp-all-pro"
    | "championship-postseason"
    | "historical-statistical-prominence";
  source: string;
  season?: number;
}

const NFL_HOF = "https://www.profootballhof.com/hall-of-famers/";
const HEISMAN = "https://www.heisman.com/heisman-winners/";
const CFB_HOF = "https://footballfoundation.org/hof_search.aspx";

/**
 * Independent audit evidence. This list is deliberately not imported by footballSubjectRegistry.ts or by any game.
 * It exists to challenge the canonical recognition universe with external, reviewable historical evidence families.
 */
export const footballRecognitionCompletenessCandidates: readonly FootballRecognitionCompletenessCandidate[] = [
  ...[
    ["Jim Brown", "RB"], ["Johnny Unitas", "QB"], ["Otto Graham", "QB"], ["Don Hutson", "WR"],
    ["Walter Payton", "RB"], ["Joe Montana", "QB"], ["Jerry Rice", "WR"], ["Lawrence Taylor", "LB"],
    ["Reggie White", "DL"], ["Dick Butkus", "LB"], ["Deacon Jones", "DL"], ["Gale Sayers", "RB"],
    ["Alan Page", "DL"], ["Joe Greene", "DL"], ["Ronnie Lott", "DB"], ["Anthony Munoz", "OL"],
    ["John Mackey", "TE"], ["Ray Guy", "P"], ["Jan Stenerud", "K"],
  ].map(([name]) => ({ name, league: "NFL" as const, kind: "player-career" as const, minimumTier: "A" as const, evidenceFamily: "pro-football-hall-of-fame" as const, source: NFL_HOF })),

  ...[
    ["Archie Griffin", "heisman"], ["Tony Dorsett", "heisman"], ["Earl Campbell", "heisman"],
    ["Herschel Walker", "heisman"], ["Bo Jackson", "heisman"], ["Barry Sanders", "heisman"],
    ["Charles Woodson", "heisman"], ["Ricky Williams", "heisman"],
  ].map(([name]) => ({ name, league: "CFB" as const, kind: "player-career" as const, minimumTier: "A" as const, evidenceFamily: "heisman" as const, source: HEISMAN })),
  ...["Orlando Pace", "John Hannah", "Lee Roy Selmon", "Bruce Smith", "Derrick Thomas", "Deion Sanders"].map((name) => ({
    name, league: "CFB" as const, kind: "player-career" as const, minimumTier: "A" as const,
    evidenceFamily: "college-football-hall-of-fame" as const, source: CFB_HOF,
  })),
  { name: "Tim Brown", league: "CFB", kind: "player-career", minimumTier: "B", evidenceFamily: "heisman", source: HEISMAN },
  { name: "Keith Jackson", league: "CFB", kind: "player-career", minimumTier: "B", evidenceFamily: "college-football-hall-of-fame", source: CFB_HOF },

  ...["Vince Lombardi", "Don Shula", "Bill Walsh", "Tom Landry", "Paul Brown"].map((name) => ({
    name, league: "NFL" as const, kind: "coach" as const, minimumTier: "A" as const,
    evidenceFamily: "championship-postseason" as const, source: NFL_HOF,
  })),
  ...["Bear Bryant", "Woody Hayes", "Tom Osborne", "Barry Switzer"].map((name) => ({
    name, league: "CFB" as const, kind: "coach" as const, minimumTier: "A" as const,
    evidenceFamily: "championship-postseason" as const, source: CFB_HOF,
  })),
  { name: "Lou Holtz", league: "CFB", kind: "coach", minimumTier: "B", evidenceFamily: "championship-postseason", source: CFB_HOF },

  { name: "1972 Miami Dolphins", league: "NFL", kind: "team-season", season: 1972, minimumTier: "A", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "1985 Chicago Bears", league: "NFL", kind: "team-season", season: 1985, minimumTier: "A", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "2007 New England Patriots", league: "NFL", kind: "team-season", season: 2007, minimumTier: "A", evidenceFamily: "historical-statistical-prominence", source: NFL_HOF },
  { name: "1995 Nebraska", league: "CFB", kind: "team-season", season: 1995, minimumTier: "A", evidenceFamily: "championship-postseason", source: CFB_HOF },
  { name: "2001 Miami", league: "CFB", kind: "team-season", season: 2001, minimumTier: "A", evidenceFamily: "championship-postseason", source: CFB_HOF },
  { name: "2005 Texas", league: "CFB", kind: "team-season", season: 2005, minimumTier: "A", evidenceFamily: "championship-postseason", source: CFB_HOF },
  { name: "2019 LSU", league: "CFB", kind: "team-season", season: 2019, minimumTier: "A", evidenceFamily: "championship-postseason", source: CFB_HOF },

  ...["Green Bay Packers", "Dallas Cowboys", "San Francisco 49ers", "New England Patriots"].map((name) => ({
    name, league: "NFL" as const, kind: "franchise" as const, minimumTier: "B" as const,
    evidenceFamily: "championship-postseason" as const, source: NFL_HOF,
  })),
  ...["Alabama", "Ohio State", "Notre Dame", "Texas", "USC", "Michigan", "Oklahoma"].map((name) => ({
    name, league: "CFB" as const, kind: "program" as const, minimumTier: "B" as const,
    evidenceFamily: "championship-postseason" as const, source: CFB_HOF,
  })),

  { name: "New England Patriots — Belichick/Brady era", league: "NFL", kind: "program-era", minimumTier: "A", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "Dallas Cowboys — Triplets dynasty", league: "NFL", kind: "program-era", minimumTier: "A", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "San Francisco 49ers — Montana/Walsh dynasty", league: "NFL", kind: "program-era", minimumTier: "A", evidenceFamily: "championship-postseason", source: NFL_HOF },

  { name: "2006 Rose Bowl — Texas vs USC", league: "CFB", kind: "game", season: 2005, minimumTier: "A", evidenceFamily: "championship-postseason", source: HEISMAN },
  { name: "2007 Appalachian State at Michigan", league: "CFB", kind: "game", season: 2007, minimumTier: "A", evidenceFamily: "historical-statistical-prominence", source: CFB_HOF },
  { name: "2013 Iron Bowl — Alabama vs Auburn", league: "CFB", kind: "game", season: 2013, minimumTier: "A", evidenceFamily: "championship-postseason", source: CFB_HOF },
] as const;

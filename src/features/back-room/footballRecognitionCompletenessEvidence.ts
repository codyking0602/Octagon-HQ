export type FootballRecognitionCompletenessKind =
  | "player-career" | "player-season" | "team-season" | "franchise" | "program" | "coach" | "program-era" | "game";

export interface FootballRecognitionCompletenessCandidate {
  name: string;
  identityAliases?: readonly string[];
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

export type FootballRecognitionSourceDispositionTier = "A" | "B" | "C" | "D";

export interface FootballRecognitionSourceDisposition {
  name: string;
  awardYear: number;
  disposition: FootballRecognitionSourceDispositionTier;
  reason: string;
  source: string;
}

const NFL_HOF = "https://www.profootballhof.com/hall-of-famers/";
const HEISMAN = "https://www.heisman.com/heisman-winners/";
const CFB_HOF = "https://footballfoundation.org/hof_search.aspx";

function heismanDispositionReason(awardYear: number, disposition: FootballRecognitionSourceDispositionTier) {
  if (disposition === "D") {
    return "Heisman winner reviewed, but the player-career identity does not clear the strict pre-1980 A-only recognition bar.";
  }
  if (disposition === "A") {
    return awardYear < 1980
      ? "Heisman plus enduring national/historical identity clears the strict pre-1980 A recognition bar."
      : "Heisman plus enduring cross-era national recognition clears the A recognition bar.";
  }
  if (disposition === "B") {
    return awardYear < 2005
      ? "Heisman winner remains broadly recognizable enough for the historical B pool without requiring A-icon status."
      : "Modern Heisman winner remains broadly recognizable enough for the B pool without requiring A-icon status.";
  }
  return "Modern Heisman winner is recognizable enough for C depth without requiring broad B-level recognition.";
}

const HEISMAN_WINNER_ROWS = [
  [1935, "Jay Berwanger", "D"],
  [1936, "Larry Kelley", "D"],
  [1937, "Clinton Frank", "D"],
  [1938, "Davey O'Brien", "A"],
  [1939, "Nile Kinnick", "D"],
  [1940, "Tom Harmon", "D"],
  [1941, "Bruce Smith", "D"],
  [1942, "Frank Sinkwich", "D"],
  [1943, "Angelo Bertelli", "D"],
  [1944, "Les Horvath", "D"],
  [1945, "Felix \"Doc\" Blanchard", "D"],
  [1946, "Glenn Davis", "D"],
  [1947, "John Lujack", "D"],
  [1948, "Doak Walker", "A"],
  [1949, "Leon Hart", "D"],
  [1950, "Vic Janowicz", "D"],
  [1951, "Dick Kazmaier", "D"],
  [1952, "Billy Vessels", "D"],
  [1953, "John Lattner", "D"],
  [1954, "Alan Ameche", "D"],
  [1955, "Howard Cassady", "D"],
  [1956, "Paul Hornung", "A"],
  [1957, "John David Crow", "D"],
  [1958, "Pete Dawkins", "D"],
  [1959, "Billy Cannon", "A"],
  [1960, "Joe Bellino", "D"],
  [1961, "Ernie Davis", "A"],
  [1962, "Terry Baker", "D"],
  [1963, "Roger Staubach", "A"],
  [1964, "John Huarte", "D"],
  [1965, "Mike Garrett", "D"],
  [1966, "Steve Spurrier", "D"],
  [1967, "Gary Beban", "D"],
  [1968, "O.J. Simpson", "A"],
  [1969, "Steve Owens", "D"],
  [1970, "Jim Plunkett", "A"],
  [1971, "Pat Sullivan", "D"],
  [1972, "Johnny Rodgers", "D"],
  [1973, "John Cappelletti", "D"],
  [1974, "Archie Griffin", "A"],
  [1975, "Archie Griffin", "A"],
  [1976, "Tony Dorsett", "A"],
  [1977, "Earl Campbell", "A"],
  [1978, "Billy Sims", "A"],
  [1979, "Charles White", "D"],
  [1980, "George Rogers", "B"],
  [1981, "Marcus Allen", "A"],
  [1982, "Herschel Walker", "A"],
  [1983, "Mike Rozier", "B"],
  [1984, "Doug Flutie", "A"],
  [1985, "Bo Jackson", "A"],
  [1986, "Vinny Testaverde", "B"],
  [1987, "Tim Brown", "B"],
  [1988, "Barry Sanders", "A"],
  [1989, "Andre Ware", "B"],
  [1990, "Ty Detmer", "B"],
  [1991, "Desmond Howard", "A"],
  [1992, "Gino Torretta", "B"],
  [1993, "Charlie Ward", "B"],
  [1994, "Rashaan Salaam", "B"],
  [1995, "Eddie George", "B"],
  [1996, "Danny Wuerffel", "B"],
  [1997, "Charles Woodson", "A"],
  [1998, "Ricky Williams", "A"],
  [1999, "Ron Dayne", "B"],
  [2000, "Chris Weinke", "B"],
  [2001, "Eric Crouch", "B"],
  [2002, "Carson Palmer", "B"],
  [2003, "Jason White", "B"],
  [2004, "Matt Leinart", "A"],
  [2005, "Reggie Bush", "A"],
  [2006, "Troy Smith", "B"],
  [2007, "Tim Tebow", "A"],
  [2008, "Sam Bradford", "B"],
  [2009, "Mark Ingram", "B"],
  [2010, "Cam Newton", "A"],
  [2011, "Robert Griffin III", "B"],
  [2012, "Johnny Manziel", "A"],
  [2013, "Jameis Winston", "B"],
  [2014, "Marcus Mariota", "B"],
  [2015, "Derrick Henry", "A"],
  [2016, "Lamar Jackson", "A"],
  [2017, "Baker Mayfield", "B"],
  [2018, "Kyler Murray", "B"],
  [2019, "Joe Burrow", "A"],
  [2020, "DeVonta Smith", "B"],
  [2021, "Bryce Young", "B"],
  [2022, "Caleb Williams", "B"],
  [2023, "Jayden Daniels", "B"],
  [2024, "Travis Hunter", "A"],
  [2025, "Fernando Mendoza", "B"],
] as const satisfies readonly (readonly [number, string, FootballRecognitionSourceDispositionTier])[];

/**
 * Exhaustive, award-year-by-award-year review of the official Heisman winners archive through the latest completed
 * award (2025). D means deliberately reviewed/archive-only for player-career recognition; it is not a missing subject.
 * This is audit evidence only and is never imported by the runtime subject registry or by a game.
 */
export const footballHeismanWinnerDispositions: readonly FootballRecognitionSourceDisposition[] = HEISMAN_WINNER_ROWS.map(
  ([awardYear, name, disposition]) => ({
    name,
    awardYear,
    disposition,
    reason: heismanDispositionReason(awardYear, disposition),
    source: HEISMAN,
  }),
);

const heismanCareerTierRank = { A: 3, B: 2 } as const;
const heismanCareerCandidatesByName = new Map<string, FootballRecognitionCompletenessCandidate>();
for (const disposition of footballHeismanWinnerDispositions) {
  if (disposition.disposition !== "A" && disposition.disposition !== "B") continue;
  const candidate: FootballRecognitionCompletenessCandidate = {
    name: disposition.name,
    ...(disposition.name === "Mark Ingram" ? { identityAliases: ["Mark Ingram II"] } : {}),
    league: "CFB",
    kind: "player-career",
    minimumTier: disposition.disposition,
    evidenceFamily: "heisman",
    source: disposition.source,
  };
  const existing = heismanCareerCandidatesByName.get(disposition.name);
  if (!existing || heismanCareerTierRank[candidate.minimumTier] > heismanCareerTierRank[existing.minimumTier]) {
    heismanCareerCandidatesByName.set(disposition.name, candidate);
  }
}

export const footballHeismanCareerRecognitionCandidates = [...heismanCareerCandidatesByName.values()];

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

  ...footballHeismanCareerRecognitionCandidates,
  ...["Orlando Pace", "John Hannah", "Lee Roy Selmon", "Bruce Smith", "Derrick Thomas", "Deion Sanders"].map((name) => ({
    name, league: "CFB" as const, kind: "player-career" as const, minimumTier: "A" as const,
    evidenceFamily: "college-football-hall-of-fame" as const, source: CFB_HOF,
  })),
  { name: "Keith Jackson", league: "CFB", kind: "player-career", minimumTier: "B", evidenceFamily: "college-football-hall-of-fame", source: CFB_HOF },

  ...[
    ["Marcus Mariota 2014", 2014], ["Derrick Henry 2015", 2015], ["Lamar Jackson 2016", 2016],
    ["Baker Mayfield 2017", 2017], ["Kyler Murray 2018", 2018], ["Joe Burrow 2019", 2019],
    ["DeVonta Smith 2020", 2020], ["Bryce Young 2021", 2021], ["Caleb Williams 2022", 2022],
    ["Jayden Daniels 2023", 2023], ["Travis Hunter 2024", 2024],
  ].map(([name, season]) => ({
    name: name as string, league: "CFB" as const, kind: "player-season" as const, season: season as number,
    minimumTier: "A" as const, evidenceFamily: "heisman" as const, source: HEISMAN,
  })),

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

  { name: "Green Bay Packers", identityAliases: ["GB", "nfl-franchise-GB"], league: "NFL", kind: "franchise", minimumTier: "B", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "Dallas Cowboys", identityAliases: ["DAL", "nfl-franchise-DAL"], league: "NFL", kind: "franchise", minimumTier: "B", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "San Francisco 49ers", identityAliases: ["SF", "nfl-franchise-SF"], league: "NFL", kind: "franchise", minimumTier: "B", evidenceFamily: "championship-postseason", source: NFL_HOF },
  { name: "New England Patriots", identityAliases: ["NE", "nfl-franchise-NE"], league: "NFL", kind: "franchise", minimumTier: "B", evidenceFamily: "championship-postseason", source: NFL_HOF },
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
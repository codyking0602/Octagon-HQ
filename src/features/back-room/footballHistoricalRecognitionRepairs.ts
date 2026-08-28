import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

export interface FootballHistoricalRecognitionRepair {
  subject: FootballCanonicalSubject;
  tier: Exclude<FootballRecognizabilityTier, "D">;
  evidenceFamily: "pro-football-hall-of-fame" | "heisman" | "college-football-hall-of-fame" | "championship-coaching" | "championship-postseason";
}

const activeDecades = (startSeason: number, endSeason: number) => Array.from(
  { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
  (_, index) => (Math.floor(startSeason / 10) + index) * 10,
);

const player = (
  id: string,
  name: string,
  league: "NFL" | "CFB",
  position: NonNullable<FootballCanonicalSubject["position"]>,
  startSeason: number,
  endSeason: number,
  tier: "A" | "B",
  evidenceFamily: FootballHistoricalRecognitionRepair["evidenceFamily"],
  school?: string,
): FootballHistoricalRecognitionRepair => ({
  subject: {
    id,
    name,
    kind: "player-career",
    league,
    position,
    startSeason,
    endSeason,
    activeDecades: activeDecades(startSeason, endSeason),
    ...(school ? { school } : {}),
  },
  tier,
  evidenceFamily,
});

const playerSeason = (
  id: string,
  name: string,
  position: NonNullable<FootballCanonicalSubject["position"]>,
  school: string,
  season: number,
): FootballHistoricalRecognitionRepair => ({
  subject: {
    id,
    name: `${name} ${season}`,
    kind: "player-season",
    league: "CFB",
    position,
    school,
    season,
    startSeason: season,
    endSeason: season,
    activeDecades: [Math.floor(season / 10) * 10],
  },
  tier: "A",
  evidenceFamily: "heisman",
});

const coach = (
  id: string,
  name: string,
  league: "NFL" | "CFB",
  startSeason: number,
  endSeason: number,
  tier: "A" | "B",
): FootballHistoricalRecognitionRepair => ({
  subject: {
    id,
    name,
    kind: "coach",
    league,
    startSeason,
    endSeason,
    activeDecades: activeDecades(startSeason, endSeason),
  },
  tier,
  evidenceFamily: "championship-coaching",
});

const historicalSubject = (
  subject: FootballCanonicalSubject,
  tier: "A" | "B",
): FootballHistoricalRecognitionRepair => ({ subject, tier, evidenceFamily: "championship-postseason" });

/**
 * Stage 13.5 recognition repairs are reviewed source evidence feeding the existing canonical registry projection.
 * They are not a runtime roster, do not contain factual stats, and never bypass footballSubjectRegistry.ts.
 */
export const footballHistoricalRecognitionRepairs: readonly FootballHistoricalRecognitionRepair[] = [
  player("nfl-jim-brown", "Jim Brown", "NFL", "RB", 1957, 1965, "A", "pro-football-hall-of-fame"),
  player("nfl-johnny-unitas", "Johnny Unitas", "NFL", "QB", 1956, 1973, "A", "pro-football-hall-of-fame"),
  player("nfl-otto-graham", "Otto Graham", "NFL", "QB", 1946, 1955, "A", "pro-football-hall-of-fame"),
  player("nfl-don-hutson", "Don Hutson", "NFL", "WR", 1935, 1945, "A", "pro-football-hall-of-fame"),
  player("nfl-walter-payton", "Walter Payton", "NFL", "RB", 1975, 1987, "A", "pro-football-hall-of-fame"),
  player("nfl-joe-montana", "Joe Montana", "NFL", "QB", 1979, 1994, "A", "pro-football-hall-of-fame"),
  player("nfl-jerry-rice", "Jerry Rice", "NFL", "WR", 1985, 2004, "A", "pro-football-hall-of-fame"),
  player("nfl-lawrence-taylor", "Lawrence Taylor", "NFL", "LB", 1981, 1993, "A", "pro-football-hall-of-fame"),
  player("nfl-reggie-white", "Reggie White", "NFL", "DL", 1985, 1998, "A", "pro-football-hall-of-fame"),
  player("nfl-dick-butkus", "Dick Butkus", "NFL", "LB", 1965, 1973, "A", "pro-football-hall-of-fame"),
  player("nfl-deacon-jones", "Deacon Jones", "NFL", "DL", 1961, 1974, "A", "pro-football-hall-of-fame"),
  player("nfl-gale-sayers", "Gale Sayers", "NFL", "RB", 1965, 1971, "A", "pro-football-hall-of-fame"),
  player("nfl-alan-page", "Alan Page", "NFL", "DL", 1967, 1981, "A", "pro-football-hall-of-fame"),
  player("nfl-joe-greene", "Joe Greene", "NFL", "DL", 1969, 1981, "A", "pro-football-hall-of-fame"),
  player("nfl-ronnie-lott", "Ronnie Lott", "NFL", "DB", 1981, 1994, "A", "pro-football-hall-of-fame"),
  player("nfl-anthony-munoz", "Anthony Munoz", "NFL", "OL", 1980, 1992, "A", "pro-football-hall-of-fame"),
  player("nfl-john-mackey", "John Mackey", "NFL", "TE", 1963, 1972, "A", "pro-football-hall-of-fame"),
  player("nfl-ray-guy", "Ray Guy", "NFL", "P", 1973, 1986, "A", "pro-football-hall-of-fame"),
  player("nfl-jan-stenerud", "Jan Stenerud", "NFL", "K", 1967, 1985, "A", "pro-football-hall-of-fame"),
  player("barry-sanders", "Barry Sanders", "NFL", "RB", 1989, 1998, "A", "pro-football-hall-of-fame"),
  player("earl-campbell", "Earl Campbell", "NFL", "RB", 1978, 1985, "A", "pro-football-hall-of-fame"),
  player("marcus-allen", "Marcus Allen", "NFL", "RB", 1982, 1997, "A", "pro-football-hall-of-fame"),
  player("tony-dorsett", "Tony Dorsett", "NFL", "RB", 1977, 1988, "A", "pro-football-hall-of-fame"),

  player("cfb-archie-griffin", "Archie Griffin", "CFB", "RB", 1972, 1975, "A", "heisman", "Ohio State"),
  player("cfb-tony-dorsett", "Tony Dorsett", "CFB", "RB", 1973, 1976, "A", "heisman", "Pittsburgh"),
  player("cfb-earl-campbell", "Earl Campbell", "CFB", "RB", 1974, 1977, "A", "heisman", "Texas"),
  player("cfb-herschel-walker", "Herschel Walker", "CFB", "RB", 1980, 1982, "A", "heisman", "Georgia"),
  player("cfb-bo-jackson", "Bo Jackson", "CFB", "RB", 1982, 1985, "A", "heisman", "Auburn"),
  player("cfb-barry-sanders", "Barry Sanders", "CFB", "RB", 1986, 1988, "A", "heisman", "Oklahoma State"),
  player("cfb-tim-brown", "Tim Brown", "CFB", "WR", 1984, 1987, "B", "heisman", "Notre Dame"),
  player("cfb-charles-woodson", "Charles Woodson", "CFB", "DB", 1995, 1997, "A", "heisman", "Michigan"),
  player("cfb-ricky-williams", "Ricky Williams", "CFB", "RB", 1995, 1998, "A", "heisman", "Texas"),
  player("cfb-orlando-pace", "Orlando Pace", "CFB", "OL", 1994, 1996, "A", "college-football-hall-of-fame", "Ohio State"),
  player("cfb-john-hannah", "John Hannah", "CFB", "OL", 1970, 1972, "A", "college-football-hall-of-fame", "Alabama"),
  player("cfb-lee-roy-selmon", "Lee Roy Selmon", "CFB", "DL", 1972, 1975, "A", "college-football-hall-of-fame", "Oklahoma"),
  player("cfb-bruce-smith", "Bruce Smith", "CFB", "DL", 1981, 1984, "A", "college-football-hall-of-fame", "Virginia Tech"),
  player("cfb-derrick-thomas", "Derrick Thomas", "CFB", "LB", 1985, 1988, "A", "college-football-hall-of-fame", "Alabama"),
  player("cfb-deion-sanders", "Deion Sanders", "CFB", "DB", 1985, 1988, "A", "college-football-hall-of-fame", "Florida State"),
  player("cfb-keith-jackson", "Keith Jackson", "CFB", "TE", 1984, 1987, "B", "college-football-hall-of-fame", "Oklahoma"),
  player("cfb-danny-wuerffel", "Danny Wuerffel", "CFB", "QB", 1993, 1996, "B", "heisman", "Florida"),
  player("cfb-doug-flutie", "Doug Flutie", "CFB", "QB", 1981, 1984, "A", "heisman", "Boston College"),
  player("cfb-gino-torretta", "Gino Torretta", "CFB", "QB", 1989, 1992, "B", "heisman", "Miami"),
  player("cfb-jim-plunkett", "Jim Plunkett", "CFB", "QB", 1968, 1970, "A", "heisman", "Stanford"),
  player("cfb-roger-staubach", "Roger Staubach", "CFB", "QB", 1962, 1964, "A", "heisman", "Navy"),
  player("cfb-ty-detmer", "Ty Detmer", "CFB", "QB", 1988, 1991, "B", "heisman", "BYU"),
  player("cfb-eddie-george", "Eddie George", "CFB", "RB", 1992, 1995, "B", "heisman", "Ohio State"),
  player("cfb-ernie-davis", "Ernie Davis", "CFB", "RB", 1959, 1961, "A", "heisman", "Syracuse"),
  player("cfb-o-j-simpson", "O. J. Simpson", "CFB", "RB", 1967, 1968, "A", "heisman", "USC"),
  player("cfb-rashaan-salaam", "Rashaan Salaam", "CFB", "RB", 1992, 1994, "B", "heisman", "Colorado"),
  player("cfb-desmond-howard", "Desmond Howard", "CFB", "WR", 1989, 1991, "A", "heisman", "Michigan"),

  playerSeason("cfb-marcus-mariota-2014", "Marcus Mariota", "QB", "Oregon", 2014),
  playerSeason("cfb-derrick-henry-2015", "Derrick Henry", "RB", "Alabama", 2015),
  playerSeason("cfb-lamar-jackson-2016", "Lamar Jackson", "QB", "Louisville", 2016),
  playerSeason("cfb-baker-mayfield-2017", "Baker Mayfield", "QB", "Oklahoma", 2017),
  playerSeason("cfb-kyler-murray-2018", "Kyler Murray", "QB", "Oklahoma", 2018),
  playerSeason("cfb-joe-burrow-2019", "Joe Burrow", "QB", "LSU", 2019),
  playerSeason("cfb-devonta-smith-2020", "DeVonta Smith", "WR", "Alabama", 2020),
  playerSeason("cfb-bryce-young-2021", "Bryce Young", "QB", "Alabama", 2021),
  playerSeason("cfb-caleb-williams-2022", "Caleb Williams", "QB", "USC", 2022),
  playerSeason("cfb-jayden-daniels-2023", "Jayden Daniels", "QB", "LSU", 2023),
  playerSeason("cfb-travis-hunter-2024", "Travis Hunter", "DB", "Colorado", 2024),

  historicalSubject({ id: "program-oklahoma", name: "Oklahoma", kind: "program", league: "CFB" }, "B"),
  historicalSubject({ id: "program-usc", name: "USC", kind: "program", league: "CFB" }, "B"),
  historicalSubject({ id: "1995-nebraska", name: "1995 Nebraska", kind: "team-season", league: "CFB", season: 1995, startSeason: 1995, endSeason: 1995, activeDecades: [1990] }, "A"),

  coach("vince-lombardi", "Vince Lombardi", "NFL", 1959, 1969, "A"),
  coach("don-shula", "Don Shula", "NFL", 1963, 1995, "A"),
  coach("bill-walsh", "Bill Walsh", "NFL", 1979, 1988, "A"),
  coach("tom-landry", "Tom Landry", "NFL", 1960, 1988, "A"),
  coach("paul-brown", "Paul Brown", "NFL", 1946, 1975, "A"),
  coach("bear-bryant", "Bear Bryant", "CFB", 1945, 1982, "A"),
  coach("woody-hayes", "Woody Hayes", "CFB", 1946, 1978, "A"),
  coach("tom-osborne", "Tom Osborne", "CFB", 1973, 1997, "A"),
  coach("barry-switzer", "Barry Switzer", "CFB", 1973, 1988, "A"),
  coach("lou-holtz", "Lou Holtz", "CFB", 1969, 2004, "B"),
] as const;

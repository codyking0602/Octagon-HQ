import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

export interface FootballHistoricalRecognitionRepair {
  subject: FootballCanonicalSubject;
  tier: Exclude<FootballRecognizabilityTier, "D">;
  evidenceFamily: "pro-football-hall-of-fame" | "heisman" | "college-football-hall-of-fame" | "championship-coaching";
}

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
    activeDecades: Array.from(
      { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
      (_, index) => (Math.floor(startSeason / 10) + index) * 10,
    ),
    ...(school ? { school } : {}),
  },
  tier,
  evidenceFamily,
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
    activeDecades: Array.from(
      { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
      (_, index) => (Math.floor(startSeason / 10) + index) * 10,
    ),
  },
  tier,
  evidenceFamily: "championship-coaching",
});

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

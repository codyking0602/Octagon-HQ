import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

export interface FootballProgramEraSeed {
  id: string;
  name: string;
  school: string;
  /** Product subtitle and the primary natural boundary for the Program Era. */
  eraCoach: string;
  startSeason: number;
  endSeason: number;
  /** National-title seasons recognized by the NCAA championship-history table and contained inside this era. */
  titleSelectionSeasons: readonly number[];
  tier: Exclude<FootballRecognizabilityTier, "D">;
}

const activeDecades = (startSeason: number, endSeason: number) => Array.from(
  { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
  (_, index) => (Math.floor(startSeason / 10) + index) * 10,
);

/**
 * Reviewed CFB Program Eras.
 *
 * Identity rule:
 * - an era is normally at least three completed seasons;
 * - the head coach is the strongest natural boundary, though a long tenure may have distinct performance phases;
 * - "dynasty" is deliberately not an identity type here; it is a later evaluation of a Program Era;
 * - modern Tier C is reserved for culturally recognizable rise/decline/rebuild periods, not obscure coaching tenures.
 *
 * Coach windows are reviewed against school coaching histories / College Football at Sports-Reference.
 * titleSelectionSeasons come from the NCAA FBS championship-history table.
 */
export const footballProgramEraSeeds: readonly FootballProgramEraSeed[] = [
  { id: "minnesota-1932-1941", name: "Minnesota 1932–1941", school: "Minnesota", eraCoach: "Bernie Bierman", startSeason: 1932, endSeason: 1941, titleSelectionSeasons: [1934, 1935, 1936, 1940, 1941], tier: "A" },
  { id: "notre-dame-1946-1953", name: "Notre Dame 1946–1953", school: "Notre Dame", eraCoach: "Frank Leahy", startSeason: 1946, endSeason: 1953, titleSelectionSeasons: [1946, 1947, 1949], tier: "A" },
  { id: "army-1941-1958", name: "Army 1941–1958", school: "Army", eraCoach: "Earl Blaik", startSeason: 1941, endSeason: 1958, titleSelectionSeasons: [1944, 1945], tier: "A" },
  { id: "oklahoma-1947-1963", name: "Oklahoma 1947–1963", school: "Oklahoma", eraCoach: "Bud Wilkinson", startSeason: 1947, endSeason: 1963, titleSelectionSeasons: [1950, 1955, 1956], tier: "A" },
  { id: "ohio-state-1951-1978", name: "Ohio State 1951–1978", school: "Ohio State", eraCoach: "Woody Hayes", startSeason: 1951, endSeason: 1978, titleSelectionSeasons: [1954, 1957, 1961, 1968, 1970], tier: "A" },
  { id: "texas-1957-1976", name: "Texas 1957–1976", school: "Texas", eraCoach: "Darrell K Royal", startSeason: 1957, endSeason: 1976, titleSelectionSeasons: [1963, 1969, 1970], tier: "A" },
  { id: "alabama-1958-1982", name: "Alabama 1958–1982", school: "Alabama", eraCoach: "Bear Bryant", startSeason: 1958, endSeason: 1982, titleSelectionSeasons: [1961, 1964, 1965, 1978, 1979], tier: "A" },
  { id: "usc-1960-1975", name: "USC 1960–1975", school: "USC", eraCoach: "John McKay", startSeason: 1960, endSeason: 1975, titleSelectionSeasons: [1962, 1967, 1972, 1974], tier: "A" },
  { id: "nebraska-1962-1972", name: "Nebraska 1962–1972", school: "Nebraska", eraCoach: "Bob Devaney", startSeason: 1962, endSeason: 1972, titleSelectionSeasons: [1970, 1971], tier: "A" },
  { id: "michigan-1969-1989", name: "Michigan 1969–1989", school: "Michigan", eraCoach: "Bo Schembechler", startSeason: 1969, endSeason: 1989, titleSelectionSeasons: [], tier: "A" },
  { id: "oklahoma-1973-1988", name: "Oklahoma 1973–1988", school: "Oklahoma", eraCoach: "Barry Switzer", startSeason: 1973, endSeason: 1988, titleSelectionSeasons: [1974, 1975, 1985], tier: "A" },
  { id: "nebraska-1973-1997", name: "Nebraska 1973–1997", school: "Nebraska", eraCoach: "Tom Osborne", startSeason: 1973, endSeason: 1997, titleSelectionSeasons: [1994, 1995, 1997], tier: "A" },
  { id: "georgia-1980-1983", name: "Georgia 1980–1983", school: "Georgia", eraCoach: "Vince Dooley", startSeason: 1980, endSeason: 1983, titleSelectionSeasons: [1980], tier: "B" },
  { id: "penn-state-1982-1986", name: "Penn State 1982–1986", school: "Penn State", eraCoach: "Joe Paterno", startSeason: 1982, endSeason: 1986, titleSelectionSeasons: [1982, 1986], tier: "A" },
  { id: "miami-1979-1983", name: "Miami 1979–1983", school: "Miami", eraCoach: "Howard Schnellenberger", startSeason: 1979, endSeason: 1983, titleSelectionSeasons: [1983], tier: "B" },
  { id: "miami-1984-1988", name: "Miami 1984–1988", school: "Miami", eraCoach: "Jimmy Johnson", startSeason: 1984, endSeason: 1988, titleSelectionSeasons: [1987], tier: "A" },
  { id: "miami-1989-1994", name: "Miami 1989–1994", school: "Miami", eraCoach: "Dennis Erickson", startSeason: 1989, endSeason: 1994, titleSelectionSeasons: [1989, 1991], tier: "A" },
  { id: "notre-dame-1986-1993", name: "Notre Dame 1986–1993", school: "Notre Dame", eraCoach: "Lou Holtz", startSeason: 1986, endSeason: 1993, titleSelectionSeasons: [1988], tier: "A" },
  { id: "washington-1984-1992", name: "Washington 1984–1992", school: "Washington", eraCoach: "Don James", startSeason: 1984, endSeason: 1992, titleSelectionSeasons: [1991], tier: "B" },
  { id: "colorado-1985-1994", name: "Colorado 1985–1994", school: "Colorado", eraCoach: "Bill McCartney", startSeason: 1985, endSeason: 1994, titleSelectionSeasons: [1990], tier: "B" },
  { id: "florida-state-1987-2000", name: "Florida State 1987–2000", school: "Florida State", eraCoach: "Bobby Bowden", startSeason: 1987, endSeason: 2000, titleSelectionSeasons: [1993, 1999], tier: "A" },
  { id: "florida-1990-2001", name: "Florida 1990–2001", school: "Florida", eraCoach: "Steve Spurrier", startSeason: 1990, endSeason: 2001, titleSelectionSeasons: [1996], tier: "A" },
  { id: "tennessee-1992-2001", name: "Tennessee 1992–2001", school: "Tennessee", eraCoach: "Phillip Fulmer", startSeason: 1992, endSeason: 2001, titleSelectionSeasons: [1998], tier: "B" },
  { id: "michigan-1995-2007", name: "Michigan 1995–2007", school: "Michigan", eraCoach: "Lloyd Carr", startSeason: 1995, endSeason: 2007, titleSelectionSeasons: [1997], tier: "B" },
  { id: "kansas-state-1993-2003", name: "Kansas State 1993–2003", school: "Kansas State", eraCoach: "Bill Snyder", startSeason: 1993, endSeason: 2003, titleSelectionSeasons: [], tier: "B" },
  { id: "virginia-tech-1995-2011", name: "Virginia Tech 1995–2011", school: "Virginia Tech", eraCoach: "Frank Beamer", startSeason: 1995, endSeason: 2011, titleSelectionSeasons: [], tier: "B" },
  { id: "wisconsin-1993-2005", name: "Wisconsin 1993–2005", school: "Wisconsin", eraCoach: "Barry Alvarez", startSeason: 1993, endSeason: 2005, titleSelectionSeasons: [], tier: "B" },
  { id: "usc-2002-2008", name: "USC 2002–2008", school: "USC", eraCoach: "Pete Carroll", startSeason: 2002, endSeason: 2008, titleSelectionSeasons: [2003, 2004], tier: "A" },
  { id: "oklahoma-2000-2008", name: "Oklahoma 2000–2008", school: "Oklahoma", eraCoach: "Bob Stoops", startSeason: 2000, endSeason: 2008, titleSelectionSeasons: [2000], tier: "A" },
  { id: "texas-2004-2009", name: "Texas 2004–2009", school: "Texas", eraCoach: "Mack Brown", startSeason: 2004, endSeason: 2009, titleSelectionSeasons: [2005], tier: "A" },
  { id: "lsu-2000-2004", name: "LSU 2000–2004", school: "LSU", eraCoach: "Nick Saban", startSeason: 2000, endSeason: 2004, titleSelectionSeasons: [2003], tier: "B" },
  { id: "lsu-2005-2011", name: "LSU 2005–2011", school: "LSU", eraCoach: "Les Miles", startSeason: 2005, endSeason: 2011, titleSelectionSeasons: [2007], tier: "A" },
  { id: "florida-2005-2010", name: "Florida 2005–2010", school: "Florida", eraCoach: "Urban Meyer", startSeason: 2005, endSeason: 2010, titleSelectionSeasons: [2006, 2008], tier: "A" },
  { id: "auburn-2004-2007", name: "Auburn 2004–2007", school: "Auburn", eraCoach: "Tommy Tuberville", startSeason: 2004, endSeason: 2007, titleSelectionSeasons: [], tier: "B" },
  { id: "iowa-2002-2009", name: "Iowa 2002–2009", school: "Iowa", eraCoach: "Kirk Ferentz", startSeason: 2002, endSeason: 2009, titleSelectionSeasons: [], tier: "B" },
  { id: "wisconsin-2006-2012", name: "Wisconsin 2006–2012", school: "Wisconsin", eraCoach: "Bret Bielema", startSeason: 2006, endSeason: 2012, titleSelectionSeasons: [], tier: "B" },
  { id: "boise-state-2006-2013", name: "Boise State 2006–2013", school: "Boise State", eraCoach: "Chris Petersen", startSeason: 2006, endSeason: 2013, titleSelectionSeasons: [], tier: "B" },
  { id: "stanford-2007-2010", name: "Stanford 2007–2010", school: "Stanford", eraCoach: "Jim Harbaugh", startSeason: 2007, endSeason: 2010, titleSelectionSeasons: [], tier: "B" },
  { id: "tcu-2008-2014", name: "TCU 2008–2014", school: "TCU", eraCoach: "Gary Patterson", startSeason: 2008, endSeason: 2014, titleSelectionSeasons: [], tier: "B" },
  { id: "oregon-2009-2012", name: "Oregon 2009–2012", school: "Oregon", eraCoach: "Chip Kelly", startSeason: 2009, endSeason: 2012, titleSelectionSeasons: [], tier: "A" },
  { id: "oklahoma-2009-2016", name: "Oklahoma 2009–2016", school: "Oklahoma", eraCoach: "Bob Stoops", startSeason: 2009, endSeason: 2016, titleSelectionSeasons: [], tier: "B" },
  { id: "michigan-state-2010-2015", name: "Michigan State 2010–2015", school: "Michigan State", eraCoach: "Mark Dantonio", startSeason: 2010, endSeason: 2015, titleSelectionSeasons: [], tier: "B" },
  { id: "oklahoma-state-2010-2016", name: "Oklahoma State 2010–2016", school: "Oklahoma State", eraCoach: "Mike Gundy", startSeason: 2010, endSeason: 2016, titleSelectionSeasons: [], tier: "B" },
  { id: "stanford-2011-2015", name: "Stanford 2011–2015", school: "Stanford", eraCoach: "David Shaw", startSeason: 2011, endSeason: 2015, titleSelectionSeasons: [], tier: "B" },
  { id: "baylor-2011-2015", name: "Baylor 2011–2015", school: "Baylor", eraCoach: "Art Briles", startSeason: 2011, endSeason: 2015, titleSelectionSeasons: [], tier: "B" },
  { id: "clemson-2011-2014", name: "Clemson 2011–2014", school: "Clemson", eraCoach: "Dabo Swinney", startSeason: 2011, endSeason: 2014, titleSelectionSeasons: [], tier: "B" },
  { id: "ohio-state-2012-2018", name: "Ohio State 2012–2018", school: "Ohio State", eraCoach: "Urban Meyer", startSeason: 2012, endSeason: 2018, titleSelectionSeasons: [2014], tier: "A" },
  { id: "florida-state-2013-2017", name: "Florida State 2013–2017", school: "Florida State", eraCoach: "Jimbo Fisher", startSeason: 2013, endSeason: 2017, titleSelectionSeasons: [2013], tier: "B" },
  { id: "auburn-2013-2017", name: "Auburn 2013–2017", school: "Auburn", eraCoach: "Gus Malzahn", startSeason: 2013, endSeason: 2017, titleSelectionSeasons: [], tier: "B" },
  { id: "oregon-2013-2016", name: "Oregon 2013–2016", school: "Oregon", eraCoach: "Mark Helfrich", startSeason: 2013, endSeason: 2016, titleSelectionSeasons: [], tier: "C" },
  { id: "texas-2010-2013", name: "Texas 2010–2013", school: "Texas", eraCoach: "Mack Brown", startSeason: 2010, endSeason: 2013, titleSelectionSeasons: [], tier: "C" },
  { id: "texas-2014-2016", name: "Texas 2014–2016", school: "Texas", eraCoach: "Charlie Strong", startSeason: 2014, endSeason: 2016, titleSelectionSeasons: [], tier: "C" },
  { id: "nebraska-2008-2014", name: "Nebraska 2008–2014", school: "Nebraska", eraCoach: "Bo Pelini", startSeason: 2008, endSeason: 2014, titleSelectionSeasons: [], tier: "C" },
  { id: "nebraska-2015-2017", name: "Nebraska 2015–2017", school: "Nebraska", eraCoach: "Mike Riley", startSeason: 2015, endSeason: 2017, titleSelectionSeasons: [], tier: "C" },
  { id: "clemson-2015-2020", name: "Clemson 2015–2020", school: "Clemson", eraCoach: "Dabo Swinney", startSeason: 2015, endSeason: 2020, titleSelectionSeasons: [2016, 2018], tier: "A" },
  { id: "alabama-2009-2020", name: "Alabama 2009–2020", school: "Alabama", eraCoach: "Nick Saban", startSeason: 2009, endSeason: 2020, titleSelectionSeasons: [2009, 2011, 2012, 2015, 2017, 2020], tier: "A" },
  { id: "alabama-2021-2023", name: "Alabama 2021–2023", school: "Alabama", eraCoach: "Nick Saban", startSeason: 2021, endSeason: 2023, titleSelectionSeasons: [], tier: "B" },
  { id: "oklahoma-2017-2021", name: "Oklahoma 2017–2021", school: "Oklahoma", eraCoach: "Lincoln Riley", startSeason: 2017, endSeason: 2021, titleSelectionSeasons: [], tier: "B" },
  { id: "georgia-2016-2020", name: "Georgia 2016–2020", school: "Georgia", eraCoach: "Kirby Smart", startSeason: 2016, endSeason: 2020, titleSelectionSeasons: [], tier: "B" },
  { id: "georgia-2021-2024", name: "Georgia 2021–2024", school: "Georgia", eraCoach: "Kirby Smart", startSeason: 2021, endSeason: 2024, titleSelectionSeasons: [2021, 2022], tier: "A" },
  { id: "michigan-2015-2020", name: "Michigan 2015–2020", school: "Michigan", eraCoach: "Jim Harbaugh", startSeason: 2015, endSeason: 2020, titleSelectionSeasons: [], tier: "B" },
  { id: "michigan-2021-2023", name: "Michigan 2021–2023", school: "Michigan", eraCoach: "Jim Harbaugh", startSeason: 2021, endSeason: 2023, titleSelectionSeasons: [2023], tier: "A" },
  { id: "nebraska-2018-2022", name: "Nebraska 2018–2022", school: "Nebraska", eraCoach: "Scott Frost", startSeason: 2018, endSeason: 2022, titleSelectionSeasons: [], tier: "C" },
  { id: "notre-dame-2010-2021", name: "Notre Dame 2010–2021", school: "Notre Dame", eraCoach: "Brian Kelly", startSeason: 2010, endSeason: 2021, titleSelectionSeasons: [], tier: "B" },
  { id: "penn-state-2016-2025", name: "Penn State 2016–2025", school: "Penn State", eraCoach: "James Franklin", startSeason: 2016, endSeason: 2025, titleSelectionSeasons: [], tier: "B" },
  { id: "cincinnati-2018-2021", name: "Cincinnati 2018–2021", school: "Cincinnati", eraCoach: "Luke Fickell", startSeason: 2018, endSeason: 2021, titleSelectionSeasons: [], tier: "B" },
  { id: "utah-2018-2023", name: "Utah 2018–2023", school: "Utah", eraCoach: "Kyle Whittingham", startSeason: 2018, endSeason: 2023, titleSelectionSeasons: [], tier: "B" },
  { id: "lsu-2017-2021", name: "LSU 2017–2021", school: "LSU", eraCoach: "Ed Orgeron", startSeason: 2017, endSeason: 2021, titleSelectionSeasons: [2019], tier: "B" },
  { id: "ohio-state-2019-2024", name: "Ohio State 2019–2024", school: "Ohio State", eraCoach: "Ryan Day", startSeason: 2019, endSeason: 2024, titleSelectionSeasons: [2024], tier: "A" },
  { id: "oregon-2022-2025", name: "Oregon 2022–2025", school: "Oregon", eraCoach: "Dan Lanning", startSeason: 2022, endSeason: 2025, titleSelectionSeasons: [], tier: "B" },
  { id: "texas-2022-2025", name: "Texas 2022–2025", school: "Texas", eraCoach: "Steve Sarkisian", startSeason: 2022, endSeason: 2025, titleSelectionSeasons: [], tier: "B" },
  { id: "ole-miss-2020-2025", name: "Ole Miss 2020–2025", school: "Ole Miss", eraCoach: "Lane Kiffin", startSeason: 2020, endSeason: 2025, titleSelectionSeasons: [], tier: "C" },
  { id: "tennessee-2021-2025", name: "Tennessee 2021–2025", school: "Tennessee", eraCoach: "Josh Heupel", startSeason: 2021, endSeason: 2025, titleSelectionSeasons: [], tier: "C" },
  { id: "usc-2022-2025", name: "USC 2022–2025", school: "USC", eraCoach: "Lincoln Riley", startSeason: 2022, endSeason: 2025, titleSelectionSeasons: [], tier: "C" },
  { id: "washington-2014-2019", name: "Washington 2014–2019", school: "Washington", eraCoach: "Chris Petersen", startSeason: 2014, endSeason: 2019, titleSelectionSeasons: [], tier: "B" },
] as const;

export const footballProgramEraSubjects: readonly FootballCanonicalSubject[] =
  footballProgramEraSeeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    kind: "program-era",
    league: "CFB",
    school: seed.school,
    eraCoach: seed.eraCoach,
    startSeason: seed.startSeason,
    endSeason: seed.endSeason,
    activeDecades: activeDecades(seed.startSeason, seed.endSeason),
  }));

const seedById = new Map(footballProgramEraSeeds.map((seed) => [seed.id, seed]));

export function footballProgramEraRecognitionFor(subject: FootballCanonicalSubject) {
  if (subject.kind !== "program-era" || subject.league !== "CFB") return null;
  const seed = seedById.get(subject.id);
  if (!seed) return null;
  return {
    tier: seed.tier,
    sourceIdentityKey: { provider: "octagon-hq" as const, id: seed.id },
  };
}

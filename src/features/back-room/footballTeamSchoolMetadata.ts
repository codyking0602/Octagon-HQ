export type FootballMetadataLevel = "NFL" | "CFB";

export interface FootballHistoricalConferenceRange {
  from: number;
  to?: number;
  conference: string;
}

export interface FootballTeamSchoolMetadata {
  name: string;
  level: FootballMetadataLevel;
  aliases?: readonly string[];
  colors: readonly string[];
  region: string;
  nflConference?: "AFC" | "NFC";
  nflDivision?: "East" | "North" | "South" | "West";
  conferenceHistory?: readonly FootballHistoricalConferenceRange[];
}

const nfl = (
  name: string,
  code: string,
  conference: "AFC" | "NFC",
  division: "East" | "North" | "South" | "West",
  region: string,
  colors: readonly string[],
  aliases: readonly string[] = [],
): FootballTeamSchoolMetadata => ({
  name,
  level: "NFL",
  aliases: [code, ...aliases],
  colors,
  region,
  nflConference: conference,
  nflDivision: division,
});

const cfb = (
  name: string,
  region: string,
  colors: readonly string[],
  conferenceHistory: readonly FootballHistoricalConferenceRange[],
  aliases: readonly string[] = [],
): FootballTeamSchoolMetadata => ({ name, level: "CFB", aliases, colors, region, conferenceHistory });

const history = (...ranges: readonly FootballHistoricalConferenceRange[]) => ranges;
const stable = (conference: string, from = 1940): readonly FootballHistoricalConferenceRange[] => history({ from, conference });

export const footballTeamSchoolMetadata: readonly FootballTeamSchoolMetadata[] = [
  nfl("Arizona Cardinals", "ARI", "NFC", "West", "Southwest", ["red", "white", "black"], ["Cardinals"]),
  nfl("Atlanta Falcons", "ATL", "NFC", "South", "Southeast", ["red", "black", "white"], ["Falcons"]),
  nfl("Baltimore Ravens", "BAL", "AFC", "North", "Mid-Atlantic", ["purple", "black", "white"], ["Ravens"]),
  nfl("Buffalo Bills", "BUF", "AFC", "East", "Northeast", ["blue", "red", "white"], ["Bills"]),
  nfl("Carolina Panthers", "CAR", "NFC", "South", "Southeast", ["blue", "black", "white"], ["Panthers"]),
  nfl("Chicago Bears", "CHI", "NFC", "North", "Midwest", ["navy", "orange", "white"], ["Bears"]),
  nfl("Cincinnati Bengals", "CIN", "AFC", "North", "Midwest", ["orange", "black", "white"], ["Bengals"]),
  nfl("Cleveland Browns", "CLE", "AFC", "North", "Midwest", ["brown", "orange", "white"], ["Browns"]),
  nfl("Dallas Cowboys", "DAL", "NFC", "East", "Southwest", ["navy", "silver", "white"], ["Cowboys"]),
  nfl("Denver Broncos", "DEN", "AFC", "West", "Mountain", ["orange", "navy", "white"], ["Broncos"]),
  nfl("Detroit Lions", "DET", "NFC", "North", "Midwest", ["blue", "silver", "white"], ["Lions"]),
  nfl("Green Bay Packers", "GB", "NFC", "North", "Midwest", ["green", "gold", "white"], ["Packers", "GNB"]),
  nfl("Houston Texans", "HOU", "AFC", "South", "Southwest", ["navy", "red", "white"], ["Texans"]),
  nfl("Indianapolis Colts", "IND", "AFC", "South", "Midwest", ["blue", "white"], ["Colts"]),
  nfl("Jacksonville Jaguars", "JAX", "AFC", "South", "Southeast", ["teal", "black", "gold"], ["Jaguars", "JAC"]),
  nfl("Kansas City Chiefs", "KC", "AFC", "West", "Great Plains", ["red", "gold", "white"], ["Chiefs", "KAN"]),
  nfl("Las Vegas Raiders", "LV", "AFC", "West", "West", ["black", "silver", "white"], ["Raiders", "OAK", "LVR"]),
  nfl("Los Angeles Chargers", "LAC", "AFC", "West", "West Coast", ["blue", "gold", "white"], ["Chargers", "SD", "SDG"]),
  nfl("Los Angeles Rams", "LAR", "NFC", "West", "West Coast", ["blue", "gold", "white"], ["Rams", "STL"]),
  nfl("Miami Dolphins", "MIA", "AFC", "East", "Southeast", ["aqua", "orange", "white"], ["Dolphins"]),
  nfl("Minnesota Vikings", "MIN", "NFC", "North", "Midwest", ["purple", "gold", "white"], ["Vikings"]),
  nfl("New England Patriots", "NE", "AFC", "East", "Northeast", ["navy", "red", "silver"], ["Patriots", "NWE"]),
  nfl("New Orleans Saints", "NO", "NFC", "South", "Southeast", ["black", "gold", "white"], ["Saints", "NOR"]),
  nfl("New York Giants", "NYG", "NFC", "East", "Northeast", ["blue", "red", "white"], ["Giants"]),
  nfl("New York Jets", "NYJ", "AFC", "East", "Northeast", ["green", "white", "black"], ["Jets"]),
  nfl("Philadelphia Eagles", "PHI", "NFC", "East", "Northeast", ["green", "black", "white"], ["Eagles"]),
  nfl("Pittsburgh Steelers", "PIT", "AFC", "North", "Northeast", ["black", "gold", "white"], ["Steelers"]),
  nfl("San Francisco 49ers", "SF", "NFC", "West", "West Coast", ["red", "gold", "white"], ["49ers", "SFO"]),
  nfl("Seattle Seahawks", "SEA", "NFC", "West", "Pacific Northwest", ["navy", "green", "gray"], ["Seahawks"]),
  nfl("Tampa Bay Buccaneers", "TB", "NFC", "South", "Southeast", ["red", "black", "orange"], ["Buccaneers", "TAM"]),
  nfl("Tennessee Titans", "TEN", "AFC", "South", "Southeast", ["navy", "blue", "red"], ["Titans", "HOU Oilers", "Oilers"]),
  nfl("Washington Commanders", "WAS", "NFC", "East", "Mid-Atlantic", ["burgundy", "gold", "white"], ["Commanders", "Washington", "Redskins", "Football Team"]),

  cfb("Alabama", "Southeast", ["crimson", "white"], stable("SEC", 1933), ["Alabama Crimson Tide"]),
  cfb("Auburn", "Southeast", ["navy", "orange", "white"], stable("SEC", 1933)),
  cfb("Florida", "Southeast", ["blue", "orange", "white"], stable("SEC", 1933)),
  cfb("Georgia", "Southeast", ["red", "black", "white"], stable("SEC", 1933)),
  cfb("LSU", "Southeast", ["purple", "gold", "white"], stable("SEC", 1933), ["Louisiana State"]),
  cfb("Tennessee", "Southeast", ["orange", "white"], stable("SEC", 1933)),
  cfb("Kentucky", "Southeast", ["blue", "white"], stable("SEC", 1933)),
  cfb("Ole Miss", "Southeast", ["red", "navy", "blue"], stable("SEC", 1933), ["Mississippi"]),
  cfb("Mississippi State", "Southeast", ["maroon", "white"], stable("SEC", 1933)),
  cfb("Vanderbilt", "Southeast", ["black", "gold", "white"], stable("SEC", 1933)),
  cfb("Arkansas", "South", ["red", "white"], history({ from: 1915, to: 1991, conference: "SWC" }, { from: 1992, conference: "SEC" })),
  cfb("South Carolina", "Southeast", ["garnet", "black", "white"], history({ from: 1953, to: 1970, conference: "ACC" }, { from: 1971, to: 1991, conference: "Independent" }, { from: 1992, conference: "SEC" })),
  cfb("Texas A&M", "Southwest", ["maroon", "white"], history({ from: 1915, to: 1995, conference: "SWC" }, { from: 1996, to: 2011, conference: "Big 12" }, { from: 2012, conference: "SEC" })),
  cfb("Missouri", "Great Plains", ["black", "gold", "white"], history({ from: 1907, to: 1995, conference: "Big Eight" }, { from: 1996, to: 2011, conference: "Big 12" }, { from: 2012, conference: "SEC" })),
  cfb("Texas", "Southwest", ["orange", "white"], history({ from: 1915, to: 1995, conference: "SWC" }, { from: 1996, to: 2023, conference: "Big 12" }, { from: 2024, conference: "SEC" }), ["Texas Longhorns"]),
  cfb("Oklahoma", "Great Plains", ["crimson", "cream", "white"], history({ from: 1928, to: 1995, conference: "Big Eight" }, { from: 1996, to: 2023, conference: "Big 12" }, { from: 2024, conference: "SEC" })),
  cfb("Nebraska", "Great Plains", ["red", "white"], history({ from: 1928, to: 1995, conference: "Big Eight" }, { from: 1996, to: 2010, conference: "Big 12" }, { from: 2011, conference: "Big Ten" })),
  cfb("Colorado", "Mountain", ["black", "gold", "white"], history({ from: 1948, to: 1995, conference: "Big Eight" }, { from: 1996, to: 2010, conference: "Big 12" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big 12" })),
  cfb("Kansas", "Great Plains", ["blue", "red", "white"], history({ from: 1928, to: 1995, conference: "Big Eight" }, { from: 1996, conference: "Big 12" })),
  cfb("Kansas State", "Great Plains", ["purple", "white"], history({ from: 1928, to: 1995, conference: "Big Eight" }, { from: 1996, conference: "Big 12" })),
  cfb("Iowa State", "Great Plains", ["cardinal", "gold", "white"], history({ from: 1928, to: 1995, conference: "Big Eight" }, { from: 1996, conference: "Big 12" })),
  cfb("Oklahoma State", "Great Plains", ["orange", "black", "white"], history({ from: 1960, to: 1995, conference: "Big Eight" }, { from: 1996, conference: "Big 12" }), ["Oklahoma A&M"]),
  cfb("Texas Tech", "Southwest", ["red", "black", "white"], history({ from: 1960, to: 1995, conference: "SWC" }, { from: 1996, conference: "Big 12" })),
  cfb("Baylor", "Southwest", ["green", "gold", "white"], history({ from: 1915, to: 1995, conference: "SWC" }, { from: 1996, conference: "Big 12" })),
  cfb("TCU", "Southwest", ["purple", "white"], history({ from: 1923, to: 1995, conference: "SWC" }, { from: 1996, to: 2000, conference: "WAC" }, { from: 2001, to: 2004, conference: "Conference USA" }, { from: 2005, to: 2011, conference: "Mountain West" }, { from: 2012, conference: "Big 12" })),
  cfb("Houston", "Southwest", ["red", "white"], history({ from: 1976, to: 1995, conference: "SWC" }, { from: 1996, to: 2012, conference: "Conference USA" }, { from: 2013, to: 2022, conference: "American" }, { from: 2023, conference: "Big 12" })),
  cfb("West Virginia", "Appalachia", ["blue", "gold", "white"], history({ from: 1968, to: 1990, conference: "Independent" }, { from: 1991, to: 2011, conference: "Big East" }, { from: 2012, conference: "Big 12" })),
  cfb("BYU", "Mountain", ["blue", "white"], history({ from: 1962, to: 1998, conference: "WAC" }, { from: 1999, to: 2010, conference: "Mountain West" }, { from: 2011, to: 2022, conference: "Independent" }, { from: 2023, conference: "Big 12" }), ["Brigham Young"]),
  cfb("Utah", "Mountain", ["red", "white", "black"], history({ from: 1962, to: 1998, conference: "WAC" }, { from: 1999, to: 2010, conference: "Mountain West" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big 12" })),
  cfb("Arizona", "Southwest", ["red", "navy", "white"], history({ from: 1962, to: 1977, conference: "WAC" }, { from: 1978, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big 12" })),
  cfb("Arizona State", "Southwest", ["maroon", "gold", "white"], history({ from: 1962, to: 1977, conference: "WAC" }, { from: 1978, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big 12" })),
  cfb("UCF", "Southeast", ["black", "gold", "white"], history({ from: 1996, to: 2001, conference: "Independent" }, { from: 2002, to: 2004, conference: "MAC" }, { from: 2005, to: 2012, conference: "Conference USA" }, { from: 2013, to: 2022, conference: "American" }, { from: 2023, conference: "Big 12" }), ["Central Florida"]),
  cfb("Cincinnati", "Midwest", ["red", "black", "white"], history({ from: 1970, to: 1995, conference: "Independent" }, { from: 1996, to: 2004, conference: "Conference USA" }, { from: 2005, to: 2012, conference: "Big East" }, { from: 2013, to: 2022, conference: "American" }, { from: 2023, conference: "Big 12" })),

  cfb("Ohio State", "Midwest", ["scarlet", "gray", "white"], stable("Big Ten", 1912)),
  cfb("Michigan", "Midwest", ["blue", "maize"], stable("Big Ten", 1917)),
  cfb("Michigan State", "Midwest", ["green", "white"], stable("Big Ten", 1953)),
  cfb("Wisconsin", "Midwest", ["red", "white"], stable("Big Ten", 1896)),
  cfb("Iowa", "Midwest", ["black", "gold", "white"], stable("Big Ten", 1900)),
  cfb("Minnesota", "Midwest", ["maroon", "gold"], stable("Big Ten", 1896)),
  cfb("Illinois", "Midwest", ["orange", "blue", "white"], stable("Big Ten", 1896)),
  cfb("Northwestern", "Midwest", ["purple", "white"], stable("Big Ten", 1896)),
  cfb("Purdue", "Midwest", ["black", "gold", "white"], stable("Big Ten", 1896)),
  cfb("Indiana", "Midwest", ["crimson", "cream", "white"], stable("Big Ten", 1899)),
  cfb("Penn State", "Northeast", ["navy", "white"], history({ from: 1890, to: 1992, conference: "Independent" }, { from: 1993, conference: "Big Ten" })),
  cfb("Maryland", "Mid-Atlantic", ["red", "black", "gold", "white"], history({ from: 1953, to: 2013, conference: "ACC" }, { from: 2014, conference: "Big Ten" })),
  cfb("Rutgers", "Northeast", ["scarlet", "white"], history({ from: 1976, to: 1990, conference: "Independent" }, { from: 1991, to: 2012, conference: "Big East" }, { from: 2013, to: 2013, conference: "American" }, { from: 2014, conference: "Big Ten" })),

  cfb("USC", "West Coast", ["cardinal", "gold"], history({ from: 1922, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big Ten" }), ["Southern California"]),
  cfb("UCLA", "West Coast", ["blue", "gold"], history({ from: 1928, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big Ten" })),
  cfb("Oregon", "Pacific Northwest", ["green", "yellow", "white"], history({ from: 1916, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big Ten" })),
  cfb("Washington", "Pacific Northwest", ["purple", "gold"], history({ from: 1916, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Big Ten" })),
  cfb("Stanford", "West Coast", ["cardinal", "white"], history({ from: 1918, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "ACC" })),
  cfb("California", "West Coast", ["blue", "gold"], history({ from: 1916, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "ACC" }), ["Cal"]),
  cfb("Oregon State", "Pacific Northwest", ["orange", "black", "white"], history({ from: 1916, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Pac-12" })),
  cfb("Washington State", "Pacific Northwest", ["crimson", "gray", "white"], history({ from: 1917, to: 2010, conference: "Pac-10" }, { from: 2011, to: 2023, conference: "Pac-12" }, { from: 2024, conference: "Pac-12" })),

  cfb("Clemson", "Southeast", ["orange", "purple", "white"], stable("ACC", 1953)),
  cfb("Florida State", "Southeast", ["garnet", "gold"], history({ from: 1947, to: 1991, conference: "Independent" }, { from: 1992, conference: "ACC" })),
  cfb("Miami", "Southeast", ["orange", "green", "white"], history({ from: 1940, to: 1990, conference: "Independent" }, { from: 1991, to: 2003, conference: "Big East" }, { from: 2004, conference: "ACC" }), ["Miami (FL)", "Miami Florida"]),
  cfb("Virginia Tech", "Mid-Atlantic", ["maroon", "orange", "white"], history({ from: 1965, to: 1990, conference: "Independent" }, { from: 1991, to: 2003, conference: "Big East" }, { from: 2004, conference: "ACC" })),
  cfb("Louisville", "South", ["red", "black", "white"], history({ from: 1975, to: 1995, conference: "Independent" }, { from: 1996, to: 2004, conference: "Conference USA" }, { from: 2005, to: 2012, conference: "Big East" }, { from: 2013, to: 2013, conference: "American" }, { from: 2014, conference: "ACC" })),
  cfb("North Carolina", "Southeast", ["blue", "white"], stable("ACC", 1953), ["UNC"]),
  cfb("NC State", "Southeast", ["red", "white", "black"], stable("ACC", 1953), ["North Carolina State"]),
  cfb("Virginia", "Mid-Atlantic", ["orange", "navy", "white"], stable("ACC", 1953)),
  cfb("Duke", "Southeast", ["blue", "white"], stable("ACC", 1953)),
  cfb("Georgia Tech", "Southeast", ["gold", "white", "navy"], history({ from: 1933, to: 1963, conference: "SEC" }, { from: 1964, to: 1982, conference: "Independent" }, { from: 1983, conference: "ACC" })),
  cfb("Boston College", "Northeast", ["maroon", "gold"], history({ from: 1940, to: 1990, conference: "Independent" }, { from: 1991, to: 2004, conference: "Big East" }, { from: 2005, conference: "ACC" })),
  cfb("Syracuse", "Northeast", ["orange", "white"], history({ from: 1940, to: 1990, conference: "Independent" }, { from: 1991, to: 2012, conference: "Big East" }, { from: 2013, conference: "ACC" })),
  cfb("Pittsburgh", "Northeast", ["blue", "gold", "white"], history({ from: 1940, to: 1990, conference: "Independent" }, { from: 1991, to: 2012, conference: "Big East" }, { from: 2013, conference: "ACC" }), ["Pitt"]),
  cfb("Wake Forest", "Southeast", ["black", "gold", "white"], stable("ACC", 1953)),

  cfb("Notre Dame", "Midwest", ["navy", "gold", "green"], stable("Independent", 1940)),
  cfb("Boise State", "Mountain", ["blue", "orange", "white"], history({ from: 1996, to: 2000, conference: "Big West" }, { from: 2001, to: 2010, conference: "WAC" }, { from: 2011, conference: "Mountain West" })),
  cfb("SMU", "Southwest", ["red", "blue", "white"], history({ from: 1918, to: 1995, conference: "SWC" }, { from: 1996, to: 2004, conference: "WAC" }, { from: 2005, to: 2012, conference: "Conference USA" }, { from: 2013, to: 2023, conference: "American" }, { from: 2024, conference: "ACC" }), ["Southern Methodist"]),
  cfb("Jackson State", "South", ["blue", "white"], stable("SWAC", 1958)),
];

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

const metadataByAlias = new Map<string, FootballTeamSchoolMetadata>();
for (const row of footballTeamSchoolMetadata) {
  for (const alias of [row.name, ...(row.aliases ?? [])]) metadataByAlias.set(normalize(alias), row);
}

export function footballTeamSchoolMetadataFor(value: string) {
  return metadataByAlias.get(normalize(value)) ?? null;
}

export function footballHistoricalConferenceForProgram(program: string, season: number) {
  const metadata = footballTeamSchoolMetadataFor(program);
  if (!metadata || metadata.level !== "CFB") return null;
  return metadata.conferenceHistory?.find((range) => season >= range.from && (range.to == null || season <= range.to))?.conference ?? null;
}

export type FootballSubjectAssetKind = "team-mark" | "program-mark";

export interface FootballSubjectAsset {
  src: string;
  kind: FootballSubjectAssetKind;
  label: string;
}

function nflMark(team: string, label: string): FootballSubjectAsset {
  return {
    src: `https://a.espncdn.com/i/teamlogos/nfl/500/${team}.png`,
    kind: "team-mark",
    label,
  };
}

function cfbMark(teamId: number, label: string): FootballSubjectAsset {
  return {
    src: `https://a.espncdn.com/i/teamlogos/ncaa/500/${teamId}.png`,
    kind: "program-mark",
    label,
  };
}

/**
 * Canonical visual catalog for the current Football Back Room subjects.
 *
 * Player and coach cards use the mark of the team/program most strongly tied to the
 * version of the subject represented by the game data. Program and single-season-team
 * subjects use their program mark directly. If/when approved local headshots are added,
 * this remains the one registry that swaps the source; game pages do not own image URLs.
 */
export const footballSubjectAssets: Readonly<Record<string, FootballSubjectAsset>> = {
  // NFL quarterbacks
  "tom-brady": nflMark("ne", "New England Patriots"),
  "patrick-mahomes": nflMark("kc", "Kansas City Chiefs"),
  "joe-montana": nflMark("sf", "San Francisco 49ers"),
  "peyton-manning": nflMark("ind", "Indianapolis Colts"),
  "aaron-rodgers": nflMark("gb", "Green Bay Packers"),
  "drew-brees": nflMark("no", "New Orleans Saints"),
  "dan-marino": nflMark("mia", "Miami Dolphins"),
  "john-elway": nflMark("den", "Denver Broncos"),
  "brett-favre": nflMark("gb", "Green Bay Packers"),
  "steve-young": nflMark("sf", "San Francisco 49ers"),
  "roger-staubach": nflMark("dal", "Dallas Cowboys"),
  "kurt-warner": nflMark("lar", "Rams"),
  "ben-roethlisberger": nflMark("pit", "Pittsburgh Steelers"),
  "eli-manning": nflMark("nyg", "New York Giants"),
  "philip-rivers": nflMark("lac", "Chargers"),

  // NFL running backs
  "jim-brown": nflMark("cle", "Cleveland Browns"),
  "barry-sanders": nflMark("det", "Detroit Lions"),
  "walter-payton": nflMark("chi", "Chicago Bears"),
  "emmitt-smith": nflMark("dal", "Dallas Cowboys"),
  "adrian-peterson": nflMark("min", "Minnesota Vikings"),
  "ladainian-tomlinson": nflMark("lac", "Chargers"),
  "marshall-faulk": nflMark("lar", "Rams"),
  "derrick-henry": nflMark("ten", "Tennessee Titans"),
  "eric-dickerson": nflMark("lar", "Rams"),
  "oj-simpson": nflMark("buf", "Buffalo Bills"),
  "earl-campbell": nflMark("ten", "Oilers / Titans franchise"),
  "thurman-thomas": nflMark("buf", "Buffalo Bills"),
  "edgerrin-james": nflMark("ind", "Indianapolis Colts"),
  "frank-gore": nflMark("sf", "San Francisco 49ers"),
  "marshawn-lynch": nflMark("sea", "Seattle Seahawks"),

  // NFL head coaches
  "bill-belichick": nflMark("ne", "New England Patriots"),
  "andy-reid": nflMark("kc", "Kansas City Chiefs"),
  "mike-tomlin": nflMark("pit", "Pittsburgh Steelers"),
  "john-harbaugh": nflMark("bal", "Baltimore Ravens"),
  "pete-carroll": nflMark("sea", "Seattle Seahawks"),
  "sean-mcvay": nflMark("lar", "Los Angeles Rams"),
  "sean-payton": nflMark("no", "New Orleans Saints"),
  "tom-coughlin": nflMark("nyg", "New York Giants"),
  "tony-dungy": nflMark("ind", "Indianapolis Colts"),
  "mike-shanahan": nflMark("den", "Denver Broncos"),
  "bill-cowher": nflMark("pit", "Pittsburgh Steelers"),
  "mike-holmgren": nflMark("gb", "Green Bay Packers"),
  "mike-mccarthy": nflMark("gb", "Green Bay Packers"),
  "bruce-arians": nflMark("tb", "Tampa Bay Buccaneers"),
  "john-fox": nflMark("car", "Carolina Panthers"),

  // College quarterbacks
  "cam-newton-2010": cfbMark(2, "Auburn"),
  "joe-burrow-2019": cfbMark(99, "LSU"),
  "vince-young-2005": cfbMark(251, "Texas"),
  "tim-tebow-2007": cfbMark(57, "Florida"),
  "lamar-jackson-2016": cfbMark(97, "Louisville"),
  "matt-leinart-2004": cfbMark(30, "USC"),
  "baker-mayfield-2017": cfbMark(201, "Oklahoma"),
  "trevor-lawrence-2018": cfbMark(228, "Clemson"),
  "marcus-mariota-2014": cfbMark(2483, "Oregon"),
  "johnny-manziel-2012": cfbMark(245, "Texas A&M"),
  "colt-mccoy-2008": cfbMark(251, "Texas"),
  "sam-bradford-2008": cfbMark(201, "Oklahoma"),
  "caleb-williams-2022": cfbMark(30, "USC"),
  "bryce-young-2021": cfbMark(333, "Alabama"),
  "jameis-winston-2013": cfbMark(52, "Florida State"),

  // College programs
  "alabama-program": cfbMark(333, "Alabama"),
  "ohio-state-program": cfbMark(194, "Ohio State"),
  "georgia-program": cfbMark(61, "Georgia"),
  "lsu-program": cfbMark(99, "LSU"),
  "clemson-program": cfbMark(228, "Clemson"),
  "oklahoma-program": cfbMark(201, "Oklahoma"),
  "usc-program": cfbMark(30, "USC"),
  "florida-program": cfbMark(57, "Florida"),
  "texas-program": cfbMark(251, "Texas"),
  "florida-state-program": cfbMark(52, "Florida State"),
  "michigan-program": cfbMark(130, "Michigan"),
  "oregon-program": cfbMark(2483, "Oregon"),
  "auburn-program": cfbMark(2, "Auburn"),
  "miami-program": cfbMark(2390, "Miami"),
  "notre-dame-program": cfbMark(87, "Notre Dame"),

  // Single-season teams
  "2001-miami": cfbMark(2390, "Miami"),
  "2019-lsu": cfbMark(99, "LSU"),
  "2020-alabama": cfbMark(333, "Alabama"),
  "2005-texas": cfbMark(251, "Texas"),
  "2004-usc": cfbMark(30, "USC"),
  "2018-clemson": cfbMark(228, "Clemson"),
  "2013-florida-state": cfbMark(52, "Florida State"),
  "2022-georgia": cfbMark(61, "Georgia"),
  "2008-florida": cfbMark(57, "Florida"),
  "2010-auburn": cfbMark(2, "Auburn"),
  "2014-ohio-state": cfbMark(194, "Ohio State"),
  "2023-michigan": cfbMark(130, "Michigan"),
  "2009-alabama": cfbMark(333, "Alabama"),
  "2002-ohio-state": cfbMark(194, "Ohio State"),
  "2000-oklahoma": cfbMark(201, "Oklahoma"),
};

export function footballSubjectAsset(itemId: string) {
  return footballSubjectAssets[itemId] ?? null;
}

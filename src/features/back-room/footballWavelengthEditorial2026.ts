/** Future-only editorial adjustments. Legacy IDs and values stay addressable for published rounds. */
export const FOOTBALL_WAVELENGTH_EDITORIAL_CUTOVER_DAY = "2026-11-02" as const;
export const FOOTBALL_WAVELENGTH_EDITORIAL_VERSION = "football-wavelength-editorial-2026-11" as const;

export interface FootballWavelengthEditorialRevision {
  legacyId: string;
  category: string;
  text: string;
  rating: number;
  kind: "rewrite" | "replace";
}

/** 'rewrite' keeps the same subject with clearer context/calibration; 'replace' introduces a different anchor. */
export const FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS = [
  {
    "legacyId": "legacy-tebow",
    "category": "NFL LEGACY",
    "text": "Tim Tebow — 2011 Broncos playoff run",
    "rating": 22,
    "kind": "rewrite"
  },
  {
    "legacyId": "legacy-reggie-bush",
    "category": "NFL LEGACY",
    "text": "Reggie Bush — 11 NFL seasons",
    "rating": 38,
    "kind": "rewrite"
  },
  {
    "legacyId": "legacy-cam-newton",
    "category": "NFL LEGACY",
    "text": "Cam Newton — 2015 NFL MVP",
    "rating": 87,
    "kind": "rewrite"
  },
  {
    "legacyId": "legacy-lamar-jackson",
    "category": "NFL LEGACY",
    "text": "Lamar Jackson — two NFL MVP awards",
    "rating": 91,
    "kind": "rewrite"
  },
  {
    "legacyId": "legacy-eli-manning",
    "category": "NFL LEGACY",
    "text": "Eli Manning — two Super Bowl MVPs",
    "rating": 92,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-boise-state",
    "category": "PROGRAM TRADITION",
    "text": "Boise State — modern Fiesta Bowl legacy",
    "rating": 56,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-oregon",
    "category": "PROGRAM TRADITION",
    "text": "Oregon — sustained national contention",
    "rating": 67,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-miami",
    "category": "PROGRAM TRADITION",
    "text": "Miami Hurricanes — five national titles",
    "rating": 92,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-florida",
    "category": "PROGRAM TRADITION",
    "text": "Florida Gators — three national titles",
    "rating": 86,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-clemson",
    "category": "PROGRAM TRADITION",
    "text": "Clemson — three national titles",
    "rating": 85,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-georgia",
    "category": "PROGRAM TRADITION",
    "text": "Georgia — 1980, 2021 and 2022 titles",
    "rating": 91,
    "kind": "rewrite"
  },
  {
    "legacyId": "tradition-indiana",
    "category": "PROGRAM TRADITION",
    "text": "Indiana — 2025 national champion",
    "rating": 44,
    "kind": "rewrite"
  },
  {
    "legacyId": "terror-2023-panthers",
    "category": "DEFENSIVE TERROR",
    "text": "2023 Panthers — fourth-fewest yards allowed",
    "rating": 62,
    "kind": "rewrite"
  },
  {
    "legacyId": "bust-reggie-bush",
    "category": "DRAFT BUST",
    "text": "Reggie Bush — productive 11-year NFL career",
    "rating": 38,
    "kind": "rewrite"
  },
  {
    "legacyId": "clutch-jj-mccarthy",
    "category": "CLUTCH REPUTATION",
    "text": "J.J. McCarthy — Michigan's 2023 title run",
    "rating": 70,
    "kind": "rewrite"
  },
  {
    "legacyId": "franchise-chiefs",
    "category": "FRANCHISE TRADITION",
    "text": "Chiefs — AFL roots and Mahomes-era dynasty",
    "rating": 93,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-packers",
    "category": "FANBASE INSANITY",
    "text": "Green Bay's Packers faithful",
    "rating": 86,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-browns",
    "category": "FANBASE INSANITY",
    "text": "Cleveland Browns' long-suffering faithful",
    "rating": 84,
    "kind": "rewrite"
  },
  {
    "legacyId": "rivalry-army-navy",
    "category": "RIVALRY HATRED",
    "text": "Army–Navy — fierce rivalry, mutual respect",
    "rating": 76,
    "kind": "rewrite"
  },
  {
    "legacyId": "dysfunction-patriots",
    "category": "FRANCHISE DYSFUNCTION",
    "text": "New England Patriots, 2001–2019",
    "rating": 8,
    "kind": "rewrite"
  },
  {
    "legacyId": "arm-joe-milton",
    "category": "BIG ARM TALENT",
    "text": "Joe Milton — raw velocity, not accuracy",
    "rating": 99,
    "kind": "rewrite"
  },
  {
    "legacyId": "chaos-band-play",
    "category": "SCHEME & PLAY CREATIVITY",
    "text": "2019 Ravens option and QB run designs",
    "rating": 87,
    "kind": "replace"
  },
  {
    "legacyId": "innovation-modern-pro-style",
    "category": "OFFENSIVE INNOVATION",
    "text": "Modern play-action bootleg offense",
    "rating": 56,
    "kind": "replace"
  },
  {
    "legacyId": "terror-average-nfl-defense",
    "category": "DEFENSIVE TERROR",
    "text": "2022 Minnesota Vikings defense",
    "rating": 38,
    "kind": "replace"
  },
  {
    "legacyId": "weird-normal-punt",
    "category": "FOOTBALL WEIRDNESS",
    "text": "2015 Colts failed fake-punt formation",
    "rating": 99,
    "kind": "replace"
  },
  {
    "legacyId": "weird-victory-formation",
    "category": "FOOTBALL WEIRDNESS",
    "text": "1984 Orange Bowl failed two-point try",
    "rating": 69,
    "kind": "replace"
  },
  {
    "legacyId": "tailgate-generic-nfl",
    "category": "TAILGATE CULTURE",
    "text": "Baltimore Ravens pregame tailgating",
    "rating": 60,
    "kind": "replace"
  },
  {
    "legacyId": "genius-average-coordinator",
    "category": "COACHING GENIUS",
    "text": "Jason Garrett as Cowboys head coach",
    "rating": 48,
    "kind": "replace"
  },
  {
    "legacyId": "choke-average-contender",
    "category": "CHOKE REPUTATION",
    "text": "2010s Pittsburgh Steelers playoff exits",
    "rating": 49,
    "kind": "replace"
  },
  {
    "legacyId": "media-joe-buck",
    "category": "MEDIA ENERGY",
    "text": "Ryan Clark on NFL studio panels",
    "rating": 74,
    "kind": "replace"
  },
  {
    "legacyId": "fans-northwestern",
    "category": "FANBASE INSANITY",
    "text": "Virginia Tech's Lane Stadium crowd",
    "rating": 83,
    "kind": "replace"
  },
  {
    "legacyId": "fans-rams",
    "category": "FANBASE INSANITY",
    "text": "Rams fans at SoFi Stadium",
    "rating": 34,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-cardinals",
    "category": "FANBASE INSANITY",
    "text": "Arizona Cardinals home crowd",
    "rating": 37,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-chargers",
    "category": "FANBASE INSANITY",
    "text": "Chargers fans at SoFi Stadium",
    "rating": 36,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-falcons",
    "category": "FANBASE INSANITY",
    "text": "Atlanta Falcons home crowd",
    "rating": 43,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-texas-am",
    "category": "FANBASE INSANITY",
    "text": "Texas A&M's game-day rituals",
    "rating": 94,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-eagles",
    "category": "FANBASE INSANITY",
    "text": "Philadelphia Eagles fan culture",
    "rating": 93,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-bills",
    "category": "FANBASE INSANITY",
    "text": "Bills Mafia's game-day traditions",
    "rating": 94,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-raiders",
    "category": "FANBASE INSANITY",
    "text": "Raiders' traveling fan culture",
    "rating": 85,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-stanford",
    "category": "FANBASE INSANITY",
    "text": "Stanford game-day fan culture",
    "rating": 38,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-ohio-state",
    "category": "FANBASE INSANITY",
    "text": "Ohio State's game-day fan culture",
    "rating": 88,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-cowboys",
    "category": "FANBASE INSANITY",
    "text": "Dallas Cowboys fan culture",
    "rating": 79,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-west-virginia",
    "category": "FANBASE INSANITY",
    "text": "West Virginia Mountaineers fans",
    "rating": 85,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-alabama",
    "category": "FANBASE INSANITY",
    "text": "Alabama Crimson Tide fans",
    "rating": 88,
    "kind": "rewrite"
  },
  {
    "legacyId": "fans-lsu",
    "category": "FANBASE INSANITY",
    "text": "LSU's football fan culture",
    "rating": 94,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-jaguars-2013",
    "category": "UNIFORM QUALITY",
    "text": "2013 Jaguars two-tone helmet",
    "rating": 28,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-steelers-bumblebee",
    "category": "UNIFORM QUALITY",
    "text": "Steelers bumblebee throwbacks",
    "rating": 36,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-browns",
    "category": "UNIFORM QUALITY",
    "text": "Cleveland Browns classic uniforms",
    "rating": 64,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-commanders",
    "category": "UNIFORM QUALITY",
    "text": "Washington Commanders uniforms",
    "rating": 43,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-rams-current",
    "category": "UNIFORM QUALITY",
    "text": "Los Angeles Rams modern uniforms",
    "rating": 52,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-seahawks",
    "category": "UNIFORM QUALITY",
    "text": "Seattle Seahawks blue-and-green look",
    "rating": 74,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-oregon",
    "category": "UNIFORM QUALITY",
    "text": "Oregon's rotating uniform combinations",
    "rating": 78,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-cowboys",
    "category": "UNIFORM QUALITY",
    "text": "Dallas Cowboys classic uniforms",
    "rating": 84,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-raiders",
    "category": "UNIFORM QUALITY",
    "text": "Raiders silver-and-black uniforms",
    "rating": 91,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-michigan",
    "category": "UNIFORM QUALITY",
    "text": "Michigan's winged helmet",
    "rating": 92,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-texas",
    "category": "UNIFORM QUALITY",
    "text": "Texas Longhorns burnt-orange uniforms",
    "rating": 94,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-titans-current",
    "category": "UNIFORM QUALITY",
    "text": "Tennessee Titans modern uniforms",
    "rating": 45,
    "kind": "rewrite"
  },
  {
    "legacyId": "uniform-florida-state",
    "category": "UNIFORM QUALITY",
    "text": "Florida State's garnet-and-gold look",
    "rating": 87,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-jeff-saturday",
    "category": "COACHING GENIUS",
    "text": "Jeff Saturday as Colts interim coach",
    "rating": 15,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-dan-campbell",
    "category": "COACHING GENIUS",
    "text": "Dan Campbell's Lions coaching tenure",
    "rating": 63,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-lincoln-riley",
    "category": "COACHING GENIUS",
    "text": "Lincoln Riley's offensive coaching",
    "rating": 77,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-mike-tomlin",
    "category": "COACHING GENIUS",
    "text": "Mike Tomlin",
    "rating": 82,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-jim-harbaugh",
    "category": "COACHING GENIUS",
    "text": "Jim Harbaugh",
    "rating": 88,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-pete-carroll",
    "category": "COACHING GENIUS",
    "text": "Pete Carroll",
    "rating": 87,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-steve-spurrier",
    "category": "COACHING GENIUS",
    "text": "Steve Spurrier",
    "rating": 92,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-kirby-smart",
    "category": "COACHING GENIUS",
    "text": "Kirby Smart",
    "rating": 93,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-don-shula",
    "category": "COACHING GENIUS",
    "text": "Don Shula",
    "rating": 94,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-nick-saban",
    "category": "COACHING GENIUS",
    "text": "Nick Saban",
    "rating": 99,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-bill-walsh",
    "category": "COACHING GENIUS",
    "text": "Bill Walsh",
    "rating": 99,
    "kind": "rewrite"
  },
  {
    "legacyId": "genius-andy-reid",
    "category": "COACHING GENIUS",
    "text": "Andy Reid",
    "rating": 97,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-texas",
    "category": "FOOTBALL VILLAINY",
    "text": "Texas football to its rivals",
    "rating": 68,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-raiders",
    "category": "FOOTBALL VILLAINY",
    "text": "Raiders' silver-and-black persona",
    "rating": 72,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-lane-kiffin",
    "category": "FOOTBALL VILLAINY",
    "text": "Lane Kiffin's public football persona",
    "rating": 79,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-oklahoma",
    "category": "FOOTBALL VILLAINY",
    "text": "Oklahoma football to its rivals",
    "rating": 73,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-steelers-1970s",
    "category": "FOOTBALL VILLAINY",
    "text": "1970s Steelers dynasty",
    "rating": 72,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-aaron-rodgers",
    "category": "FOOTBALL VILLAINY",
    "text": "Aaron Rodgers' outspoken football persona",
    "rating": 74,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-michigan",
    "category": "FOOTBALL VILLAINY",
    "text": "Michigan football to its rivals",
    "rating": 78,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-miami-1980s",
    "category": "FOOTBALL VILLAINY",
    "text": "1980s Miami Hurricanes swagger",
    "rating": 92,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-nick-saban",
    "category": "FOOTBALL VILLAINY",
    "text": "Nick Saban's Alabama dynasty",
    "rating": 79,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-cowboys",
    "category": "FOOTBALL VILLAINY",
    "text": "Dallas Cowboys' America's Team image",
    "rating": 84,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-ohio-state",
    "category": "FOOTBALL VILLAINY",
    "text": "Ohio State football to its rivals",
    "rating": 82,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-tom-brady",
    "category": "FOOTBALL VILLAINY",
    "text": "Tom Brady's Patriots dynasty persona",
    "rating": 85,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-urban-meyer",
    "category": "FOOTBALL VILLAINY",
    "text": "Urban Meyer's polarizing coaching persona",
    "rating": 89,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-bill-belichick",
    "category": "FOOTBALL VILLAINY",
    "text": "Bill Belichick's Patriots dynasty image",
    "rating": 85,
    "kind": "rewrite"
  },
  {
    "legacyId": "villainy-patriots-dynasty",
    "category": "FOOTBALL VILLAINY",
    "text": "New England Patriots dynasty",
    "rating": 93,
    "kind": "rewrite"
  },
  {
    "legacyId": "clutch-dak-prescott",
    "category": "CLUTCH REPUTATION",
    "text": "Dak Prescott's big-game reputation",
    "rating": 46,
    "kind": "rewrite"
  },
  {
    "legacyId": "clutch-kirk-cousins",
    "category": "CLUTCH REPUTATION",
    "text": "Kirk Cousins' big-game reputation",
    "rating": 43,
    "kind": "rewrite"
  },
  {
    "legacyId": "choke-matt-ryan",
    "category": "CHOKE REPUTATION",
    "text": "Matt Ryan's postseason reputation",
    "rating": 57,
    "kind": "rewrite"
  },
  {
    "legacyId": "choke-bills-four-super-bowls",
    "category": "CHOKE REPUTATION",
    "text": "Bills' four straight Super Bowl defeats",
    "rating": 64,
    "kind": "rewrite"
  },
  {
    "legacyId": "choke-2007-patriots",
    "category": "CHOKE REPUTATION",
    "text": "2007 Patriots' Super Bowl upset loss",
    "rating": 72,
    "kind": "rewrite"
  },
  {
    "legacyId": "rivalry-rams-49ers",
    "category": "RIVALRY HATRED",
    "text": "Rams–49ers",
    "rating": 77,
    "kind": "rewrite"
  },
  {
    "legacyId": "rivalry-seahawks-49ers",
    "category": "RIVALRY HATRED",
    "text": "Seahawks–49ers",
    "rating": 82,
    "kind": "rewrite"
  },
  {
    "legacyId": "rivalry-usc-notre-dame",
    "category": "RIVALRY HATRED",
    "text": "USC–Notre Dame",
    "rating": 82,
    "kind": "rewrite"
  },
  {
    "legacyId": "rivalry-packers-bears",
    "category": "RIVALRY HATRED",
    "text": "Packers–Bears",
    "rating": 88,
    "kind": "rewrite"
  },
  {
    "legacyId": "coach-chaos-dan-campbell",
    "category": "COACHING CHAOS",
    "text": "Dan Campbell's coaching persona",
    "rating": 49,
    "kind": "rewrite"
  },
  {
    "legacyId": "coach-chaos-deion-sanders",
    "category": "COACHING CHAOS",
    "text": "Deion Sanders' coaching media orbit",
    "rating": 85,
    "kind": "rewrite"
  },
  {
    "legacyId": "atmosphere-notre-dame",
    "category": "STADIUM ATMOSPHERE",
    "text": "Notre Dame Stadium",
    "rating": 81,
    "kind": "rewrite"
  },
  {
    "legacyId": "atmosphere-chargers-sofi",
    "category": "STADIUM ATMOSPHERE",
    "text": "Chargers home game at SoFi Stadium",
    "rating": 36,
    "kind": "rewrite"
  },
  {
    "legacyId": "atmosphere-falcons-mbs",
    "category": "STADIUM ATMOSPHERE",
    "text": "Falcons home game at Mercedes-Benz Stadium",
    "rating": 42,
    "kind": "rewrite"
  },
  {
    "legacyId": "tailgate-rams",
    "category": "TAILGATE CULTURE",
    "text": "Rams pregame at SoFi Stadium",
    "rating": 38,
    "kind": "rewrite"
  },
  {
    "legacyId": "tailgate-chargers",
    "category": "TAILGATE CULTURE",
    "text": "Chargers pregame at SoFi Stadium",
    "rating": 36,
    "kind": "rewrite"
  }
] as const satisfies readonly FootballWavelengthEditorialRevision[];

export function usesFootballWavelengthEditorialPool(seed: string) {
  // Persisted Daily seeds contain an ISO day; an undated Casual seed uses the new pool.
  // Never change the candidate order or calibration for earlier published Daily boards.
  const day = seed.match(/(?:^|\|)(20\d{2}-\d{2}-\d{2})(?:\||$)/)?.[1];
  return !day || day >= FOOTBALL_WAVELENGTH_EDITORIAL_CUTOVER_DAY;
}

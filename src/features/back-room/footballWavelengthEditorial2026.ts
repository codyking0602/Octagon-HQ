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
    "text": "Gus Johnson's college football calls",
    "rating": 92,
    "kind": "replace"
  },
  {
    "legacyId": "fans-northwestern",
    "category": "FANBASE INSANITY",
    "text": "Virginia Tech's Lane Stadium crowd",
    "rating": 83,
    "kind": "replace"
  }
] as const satisfies readonly FootballWavelengthEditorialRevision[];

export function usesFootballWavelengthEditorialPool(seed: string) {
  // Persisted Daily seeds contain an ISO day; an undated Casual seed uses the new pool.
  // Never change the candidate order or calibration for earlier published Daily boards.
  const day = seed.match(/(?:^|\|)(20\d{2}-\d{2}-\d{2})(?:\||$)/)?.[1];
  return !day || day >= FOOTBALL_WAVELENGTH_EDITORIAL_CUTOVER_DAY;
}

export const BUILD_QB_HERO_IMAGE = "/assets/football/build-qb-andrew-luck-hero.webp" as const;

export interface BuildQbVisualIdentity {
  teamCode: string;
  teamName: string;
  primary: string;
  primaryRgb: string;
  secondary: string;
  logoSrc: string | null;
}

function team(
  teamCode: string,
  teamName: string,
  primary: string,
  primaryRgb: string,
  secondary: string,
  espnCode: string | null,
): BuildQbVisualIdentity {
  return {
    teamCode,
    teamName,
    primary,
    primaryRgb,
    secondary,
    logoSrc: espnCode ? `https://a.espncdn.com/i/teamlogos/nfl/500/${espnCode}.png` : null,
  };
}

const BUILD_QB_TEAMS = {
  ARI: team("ARI", "Arizona Cardinals", "#97233F", "151, 35, 63", "#FFB612", "ari"),
  ATL: team("ATL", "Atlanta Falcons", "#A71930", "167, 25, 48", "#000000", "atl"),
  BAL: team("BAL", "Baltimore Ravens", "#241773", "36, 23, 115", "#9E7C0C", "bal"),
  BUF: team("BUF", "Buffalo Bills", "#00338D", "0, 51, 141", "#C60C30", "buf"),
  CAR: team("CAR", "Carolina Panthers", "#0085CA", "0, 133, 202", "#101820", "car"),
  CHI: team("CHI", "Chicago Bears", "#0B162A", "11, 22, 42", "#C83803", "chi"),
  CIN: team("CIN", "Cincinnati Bengals", "#FB4F14", "251, 79, 20", "#000000", "cin"),
  DAL: team("DAL", "Dallas Cowboys", "#003594", "0, 53, 148", "#869397", "dal"),
  DEN: team("DEN", "Denver Broncos", "#FB4F14", "251, 79, 20", "#002244", "den"),
  DET: team("DET", "Detroit Lions", "#0076B6", "0, 118, 182", "#B0B7BC", "det"),
  GB: team("GB", "Green Bay Packers", "#203731", "32, 55, 49", "#FFB612", "gb"),
  HOU: team("HOU", "Houston Texans", "#03202F", "3, 32, 47", "#A71930", "hou"),
  IND: team("IND", "Indianapolis Colts", "#002C5F", "0, 44, 95", "#A2AAAD", "ind"),
  JAX: team("JAX", "Jacksonville Jaguars", "#006778", "0, 103, 120", "#D7A22A", "jax"),
  KC: team("KC", "Kansas City Chiefs", "#E31837", "227, 24, 55", "#FFB81C", "kc"),
  LAC: team("LAC", "Los Angeles Chargers", "#0080C6", "0, 128, 198", "#FFC20E", "lac"),
  LAR: team("LAR", "Los Angeles Rams", "#003594", "0, 53, 148", "#FFA300", "lar"),
  LV: team("LV", "Raiders", "#000000", "0, 0, 0", "#A5ACAF", "lv"),
  MIA: team("MIA", "Miami Dolphins", "#008E97", "0, 142, 151", "#FC4C02", "mia"),
  MIN: team("MIN", "Minnesota Vikings", "#4F2683", "79, 38, 131", "#FFC62F", "min"),
  NE: team("NE", "New England Patriots", "#002244", "0, 34, 68", "#C60C30", "ne"),
  NO: team("NO", "New Orleans Saints", "#D3BC8D", "211, 188, 141", "#101820", "no"),
  NYG: team("NYG", "New York Giants", "#0B2265", "11, 34, 101", "#A71930", "nyg"),
  NYJ: team("NYJ", "New York Jets", "#125740", "18, 87, 64", "#FFFFFF", "nyj"),
  OIL: team("HOU", "Houston Oilers", "#418FDE", "65, 143, 222", "#D50A0A", null),
  PHI: team("PHI", "Philadelphia Eagles", "#004C54", "0, 76, 84", "#A5ACAF", "phi"),
  PIT: team("PIT", "Pittsburgh Steelers", "#FFB612", "255, 182, 18", "#101820", "pit"),
  SEA: team("SEA", "Seattle Seahawks", "#002244", "0, 34, 68", "#69BE28", "sea"),
  SF: team("SF", "San Francisco 49ers", "#AA0000", "170, 0, 0", "#B3995D", "sf"),
  TB: team("TB", "Tampa Bay Buccaneers", "#D50A0A", "213, 10, 10", "#FF7900", "tb"),
  TEN: team("TEN", "Tennessee Titans", "#0C2340", "12, 35, 64", "#4B92DB", "ten"),
  WAS: team("WAS", "Washington", "#5A1414", "90, 20, 20", "#FFB612", null),
} as const;

type BuildQbTeamKey = keyof typeof BUILD_QB_TEAMS;

/**
 * Visual-only identity for Build a QB. Keys are the exact server-owned Auction
 * item references so presentation never has to infer a player's identity from
 * a display name. Each quarterback keeps one iconic franchise treatment
 * everywhere this mode renders team branding.
 */
export const BUILD_QB_TEAM_BY_ITEM_REFERENCE = {
  "build-qb-tom-brady": "NE",
  "build-qb-peyton-manning": "IND",
  "build-qb-joe-montana": "SF",
  "build-qb-patrick-mahomes": "KC",
  "build-qb-aaron-rodgers": "GB",
  "build-qb-dan-marino": "MIA",
  "build-qb-drew-brees": "NO",
  "build-qb-brett-favre": "GB",
  "build-qb-johnny-unitas": "IND",
  "build-qb-john-elway": "DEN",
  "build-qb-steve-young": "SF",
  "build-qb-roger-staubach": "DAL",
  "build-qb-terry-bradshaw": "PIT",
  "build-qb-bob-griese": "MIA",
  "build-qb-dan-fouts": "LAC",
  "build-qb-kurt-warner": "LAR",
  "build-qb-warren-moon": "OIL",
  "build-qb-trent-green": "KC",
  "build-qb-troy-aikman": "DAL",
  "build-qb-ben-roethlisberger": "PIT",
  "build-qb-philip-rivers": "LAC",
  "build-qb-matthew-stafford": "DET",
  "build-qb-lamar-jackson": "BAL",
  "build-qb-josh-allen": "BUF",
  "build-qb-eli-manning": "NYG",
  "build-qb-matt-ryan": "ATL",
  "build-qb-russell-wilson": "SEA",
  "build-qb-joe-burrow": "CIN",
  "build-qb-andrew-luck": "IND",
  "build-qb-cam-newton": "CAR",
  "build-qb-michael-vick": "ATL",
  "build-qb-jeff-garcia": "SF",
  "build-qb-donovan-mcnabb": "PHI",
  "build-qb-steve-mcnair": "TEN",
  "build-qb-tony-romo": "DAL",
  "build-qb-carson-palmer": "CIN",
  "build-qb-alex-smith": "KC",
  "build-qb-ken-anderson": "CIN",
  "build-qb-ken-stabler": "LV",
  "build-qb-joe-namath": "NYJ",
  "build-qb-sonny-jurgensen": "WAS",
  "build-qb-len-dawson": "KC",
  "build-qb-rich-gannon": "LV",
  "build-qb-joe-flacco": "BAL",
  "build-qb-drew-bledsoe": "NE",
  "build-qb-daunte-culpepper": "MIN",
  "build-qb-vinny-testaverde": "NYJ",
  "build-qb-mark-brunell": "JAX",
  "build-qb-andy-dalton": "CIN",
  "build-qb-matt-hasselbeck": "SEA",
  "build-qb-kirk-cousins": "MIN",
  "build-qb-dak-prescott": "DAL",
  "build-qb-jay-cutler": "CHI",
  "build-qb-jameis-winston": "TB",
  "build-qb-justin-herbert": "LAC",
  "build-qb-jalen-hurts": "PHI",
  "build-qb-kyler-murray": "ARI",
  "build-qb-jared-goff": "DET",
  "build-qb-baker-mayfield": "TB",
  "build-qb-matt-schaub": "HOU",
} as const satisfies Readonly<Record<string, BuildQbTeamKey>>;

export function buildQbVisualIdentity(itemReference: string | null | undefined): BuildQbVisualIdentity | null {
  if (!itemReference) return null;
  const teamKey = BUILD_QB_TEAM_BY_ITEM_REFERENCE[itemReference as keyof typeof BUILD_QB_TEAM_BY_ITEM_REFERENCE];
  return teamKey ? BUILD_QB_TEAMS[teamKey] : null;
}

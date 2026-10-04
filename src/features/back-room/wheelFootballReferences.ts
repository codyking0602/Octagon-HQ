import type { WheelFootballLeague } from "./wheelFootballModel";

export const WHEEL_FOOTBALL_REFERENCE_SEASON = 2026 as const;

const NFL_PFR_SLUGS: Readonly<Record<string, string>> = {
  ARI: "crd", ATL: "atl", BAL: "rav", BUF: "buf", CAR: "car", CHI: "chi", CIN: "cin", CLE: "cle",
  DAL: "dal", DEN: "den", DET: "det", GB: "gnb", HOU: "htx", IND: "clt", JAX: "jax", KC: "kan",
  LV: "rai", LAC: "sdg", LAR: "ram", MIA: "mia", MIN: "min", NE: "nwe", NO: "nor", NYG: "nyg",
  NYJ: "nyj", PHI: "phi", PIT: "pit", SF: "sfo", SEA: "sea", TB: "tam", TEN: "oti", WSH: "was",
};

const CFB_SPORTS_REFERENCE_SLUGS: Readonly<Record<string, string>> = {
  alabama: "alabama",
  arkansas: "arkansas",
  auburn: "auburn",
  florida: "florida",
  georgia: "georgia",
  kentucky: "kentucky",
  lsu: "louisiana-state",
  "mississippi-state": "mississippi-state",
  missouri: "missouri",
  oklahoma: "oklahoma",
  "ole-miss": "mississippi",
  "south-carolina": "south-carolina",
  tennessee: "tennessee",
  texas: "texas",
  "texas-am": "texas-am",
  vanderbilt: "vanderbilt",
  illinois: "illinois",
  indiana: "indiana",
  iowa: "iowa",
  maryland: "maryland",
  michigan: "michigan",
  "michigan-state": "michigan-state",
  minnesota: "minnesota",
  nebraska: "nebraska",
  northwestern: "northwestern",
  "ohio-state": "ohio-state",
  oregon: "oregon",
  "penn-state": "penn-state",
  purdue: "purdue",
  rutgers: "rutgers",
  ucla: "ucla",
  usc: "southern-california",
  washington: "washington",
  wisconsin: "wisconsin",
  arizona: "arizona",
  "arizona-state": "arizona-state",
  baylor: "baylor",
  byu: "brigham-young",
  cincinnati: "cincinnati",
  colorado: "colorado",
  houston: "houston",
  "iowa-state": "iowa-state",
  kansas: "kansas",
  "kansas-state": "kansas-state",
  "oklahoma-state": "oklahoma-state",
  tcu: "texas-christian",
  "texas-tech": "texas-tech",
  ucf: "central-florida",
  utah: "utah",
  "west-virginia": "west-virginia",
  "boston-college": "boston-college",
  california: "california",
  clemson: "clemson",
  duke: "duke",
  "florida-state": "florida-state",
  "georgia-tech": "georgia-tech",
  louisville: "louisville",
  miami: "miami-fl",
  "nc-state": "north-carolina-state",
  "north-carolina": "north-carolina",
  pittsburgh: "pittsburgh",
  smu: "southern-methodist",
  stanford: "stanford",
  syracuse: "syracuse",
  virginia: "virginia",
  "virginia-tech": "virginia-tech",
  "wake-forest": "wake-forest",
  "notre-dame": "notre-dame",
  "boise-state": "boise-state",
};

export function wheelFootballTeamSeasonReferenceUrl(
  league: WheelFootballLeague,
  teamCode: string,
) {
  if (league === "NFL") {
    const slug = NFL_PFR_SLUGS[teamCode.trim().toUpperCase()];
    return slug
      ? `https://www.pro-football-reference.com/teams/${slug}/${WHEEL_FOOTBALL_REFERENCE_SEASON}.htm`
      : null;
  }

  const slug = CFB_SPORTS_REFERENCE_SLUGS[teamCode.trim().toLowerCase()];
  return slug
    ? `https://www.sports-reference.com/cfb/schools/${slug}/${WHEEL_FOOTBALL_REFERENCE_SEASON}-schedule.html`
    : null;
}

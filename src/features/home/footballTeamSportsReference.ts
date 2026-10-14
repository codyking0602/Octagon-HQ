import { footballTeamSchoolMetadata, footballTeamSchoolMetadataFor, type FootballMetadataLevel } from "../back-room/footballTeamSchoolMetadata";

/**
 * Sports Reference's historical NFL ids do NOT match ESPN/NFL abbreviations.
 * The same resolver is used for every auto-published matchup; no weekly manual URLs.
 */
const NFL_PFR_IDS: Readonly<Record<string, string>> = {
  "Arizona Cardinals": "crd",
  "Atlanta Falcons": "atl",
  "Baltimore Ravens": "rav",
  "Buffalo Bills": "buf",
  "Carolina Panthers": "car",
  "Chicago Bears": "chi",
  "Cincinnati Bengals": "cin",
  "Cleveland Browns": "cle",
  "Dallas Cowboys": "dal",
  "Denver Broncos": "den",
  "Detroit Lions": "det",
  "Green Bay Packers": "gnb",
  "Houston Texans": "htx",
  "Indianapolis Colts": "clt",
  "Jacksonville Jaguars": "jax",
  "Kansas City Chiefs": "kan",
  "Las Vegas Raiders": "rai",
  "Los Angeles Chargers": "sdg",
  "Los Angeles Rams": "ram",
  "Miami Dolphins": "mia",
  "Minnesota Vikings": "min",
  "New England Patriots": "nwe",
  "New Orleans Saints": "nor",
  "New York Giants": "nyg",
  "New York Jets": "nyj",
  "Philadelphia Eagles": "phi",
  "Pittsburgh Steelers": "pit",
  "San Francisco 49ers": "sfo",
  "Seattle Seahawks": "sea",
  "Tampa Bay Buccaneers": "tam",
  "Tennessee Titans": "oti",
  "Washington Commanders": "was",
};

const CFB_SLUG_OVERRIDES: Readonly<Record<string, string>> = {
  BYU: "brigham-young",
  LSU: "louisiana-state",
  "Miami": "miami-fl",
  "NC State": "north-carolina-state",
  "Ole Miss": "mississippi",
  SMU: "southern-methodist",
  TCU: "texas-christian",
  "Texas A&M": "texas-am",
  UCF: "central-florida",
  USC: "southern-california",
};

const normalize = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Returns a verified canonical team identity, even when live Picks includes a mascot. */
export function sportsReferenceTeamIdentity(name: string, level: FootballMetadataLevel) {
  const exact = footballTeamSchoolMetadataFor(name);
  if (exact?.level === level) return exact;
  const subject = normalize(name);
  // Longest alias first: Michigan State vs Michigan; Texas Tech vs Texas.
  const candidates = footballTeamSchoolMetadata
    .filter((entry) => entry.level === level)
    .flatMap((entry) => [entry.name, ...(entry.aliases ?? [])].map((alias) => ({ entry, alias: normalize(alias) })))
    .filter(({ alias }) => alias.length > 2 && subject.startsWith(alias + " "))
    .sort((a, b) => b.alias.length - a.alias.length);
  return candidates[0]?.entry ?? null;
}

export function footballTeamSportsReferenceUrl(
  name: string,
  level: FootballMetadataLevel,
  season: number,
): string | null {
  // The football season, NOT today's calendar year, governs the destination.
  if (!Number.isInteger(season) || season < 1900 || season > 2100) return null;
  const team = sportsReferenceTeamIdentity(name, level);
  if (!team) return null; // No guessing unknown schools or ambiguous clubs.
  if (level === "NFL") {
    const id = NFL_PFR_IDS[team.name];
    return id ? `https://www.pro-football-reference.com/teams/${id}/${season}.htm` : null;
  }
  const slug = CFB_SLUG_OVERRIDES[team.name] ?? team.name.toLowerCase()
    .replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug ? `https://www.sports-reference.com/cfb/schools/${slug}/${season}.html` : null;
}

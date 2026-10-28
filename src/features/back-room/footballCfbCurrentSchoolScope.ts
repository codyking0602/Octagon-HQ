/**
 * Canonical current CFB school scope for Football HQ.
 *
 * This is intentionally current-season only. Historical/all-time program universes
 * remain separate. Add/remove schools here only when the approved current scope or
 * conference membership changes.
 *
 * Program IDs are the repository's existing ESPN-compatible sourceProgramId values
 * from the pinned cfbfastR relationship corpus. They own the stable ESPN logo and
 * roster URLs used by later current-roster curation.
 */

export const CFB_CURRENT_SCHOOL_SCOPE_SEASON = 2026 as const;

export const CFB_CURRENT_SCHOOL_CONFERENCES = [
  "SEC",
  "Big Ten",
  "Big 12",
  "ACC",
  "Independent",
] as const;

export type CfbCurrentSchoolConference =
  (typeof CFB_CURRENT_SCHOOL_CONFERENCES)[number];

export interface CfbCurrentSchool2026 {
  id: string;
  school: string;
  conference: CfbCurrentSchoolConference;
  season: typeof CFB_CURRENT_SCHOOL_SCOPE_SEASON;
  scope: "power-four" | "independent";
  espnId: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  rosterSource: {
    provider: "ESPN";
    url: string;
  };
  membershipSourceUrl: string;
}

const MEMBERSHIP_SOURCE_URLS: Readonly<Record<CfbCurrentSchoolConference, string>> = {
  SEC: "https://www.secsports.com/sport/football",
  "Big Ten": "https://bigten.org/sports/football",
  "Big 12": "https://big12sports.com/news/2019/7/31/big-12-conference.aspx",
  ACC: "https://theacc.com/sports/2026/1/30/GEN_0130260407.aspx",
  Independent: "https://fightingirish.com/sports/football/",
};

function slugifySchool(value: string) {
  return value
    .toLowerCase()
    .replace(/a\s*&\s*m/g, "am")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function currentSchool(
  espnId: string,
  school: string,
  conference: CfbCurrentSchoolConference,
  primaryColor: string,
  secondaryColor: string,
): CfbCurrentSchool2026 {
  return {
    id: slugifySchool(school),
    school,
    conference,
    season: CFB_CURRENT_SCHOOL_SCOPE_SEASON,
    scope: conference === "Independent" ? "independent" : "power-four",
    espnId,
    primaryColor,
    secondaryColor,
    logoUrl: `https://a.espncdn.com/i/teamlogos/ncaa/500/${espnId}.png`,
    rosterSource: {
      provider: "ESPN",
      url: `https://www.espn.com/college-football/team/roster/_/id/${espnId}`,
    },
    membershipSourceUrl: MEMBERSHIP_SOURCE_URLS[conference],
  };
}

export const CFB_CURRENT_SCHOOLS_2026: readonly CfbCurrentSchool2026[] = [
  currentSchool("333", "Alabama", "SEC", "#9E1B32", "#FFFFFF"),
  currentSchool("8", "Arkansas", "SEC", "#9D2235", "#FFFFFF"),
  currentSchool("2", "Auburn", "SEC", "#0C2340", "#F26522"),
  currentSchool("57", "Florida", "SEC", "#0021A5", "#FA4616"),
  currentSchool("61", "Georgia", "SEC", "#BA0C2F", "#000000"),
  currentSchool("96", "Kentucky", "SEC", "#0033A0", "#FFFFFF"),
  currentSchool("99", "LSU", "SEC", "#461D7C", "#FDD023"),
  currentSchool("344", "Mississippi State", "SEC", "#5D1725", "#FFFFFF"),
  currentSchool("142", "Missouri", "SEC", "#000000", "#F1B82D"),
  currentSchool("201", "Oklahoma", "SEC", "#841617", "#FDF9D8"),
  currentSchool("145", "Ole Miss", "SEC", "#CE1126", "#14213D"),
  currentSchool("2579", "South Carolina", "SEC", "#73000A", "#000000"),
  currentSchool("2633", "Tennessee", "SEC", "#FF8200", "#FFFFFF"),
  currentSchool("251", "Texas", "SEC", "#BF5700", "#FFFFFF"),
  currentSchool("245", "Texas A&M", "SEC", "#500000", "#FFFFFF"),
  currentSchool("238", "Vanderbilt", "SEC", "#000000", "#CFAE70"),
  currentSchool("356", "Illinois", "Big Ten", "#FF5F05", "#13294B"),
  currentSchool("84", "Indiana", "Big Ten", "#990000", "#EEEDEB"),
  currentSchool("2294", "Iowa", "Big Ten", "#000000", "#FFCD00"),
  currentSchool("120", "Maryland", "Big Ten", "#E03A3E", "#FFD520"),
  currentSchool("130", "Michigan", "Big Ten", "#00274C", "#FFCB05"),
  currentSchool("127", "Michigan State", "Big Ten", "#18453B", "#FFFFFF"),
  currentSchool("135", "Minnesota", "Big Ten", "#7A0019", "#FFCC33"),
  currentSchool("158", "Nebraska", "Big Ten", "#E41C38", "#FFFFFF"),
  currentSchool("77", "Northwestern", "Big Ten", "#4E2A84", "#FFFFFF"),
  currentSchool("194", "Ohio State", "Big Ten", "#BB0000", "#666666"),
  currentSchool("2483", "Oregon", "Big Ten", "#154733", "#FEE123"),
  currentSchool("213", "Penn State", "Big Ten", "#041E42", "#FFFFFF"),
  currentSchool("2509", "Purdue", "Big Ten", "#CEB888", "#000000"),
  currentSchool("164", "Rutgers", "Big Ten", "#CC0033", "#FFFFFF"),
  currentSchool("26", "UCLA", "Big Ten", "#2774AE", "#FFD100"),
  currentSchool("30", "USC", "Big Ten", "#990000", "#FFC72C"),
  currentSchool("264", "Washington", "Big Ten", "#4B2E83", "#B7A57A"),
  currentSchool("275", "Wisconsin", "Big Ten", "#C5050C", "#FFFFFF"),
  currentSchool("12", "Arizona", "Big 12", "#CC0033", "#003366"),
  currentSchool("9", "Arizona State", "Big 12", "#8C1D40", "#FFC627"),
  currentSchool("239", "Baylor", "Big 12", "#154734", "#FFB81C"),
  currentSchool("252", "BYU", "Big 12", "#002E5D", "#FFFFFF"),
  currentSchool("2132", "Cincinnati", "Big 12", "#E00122", "#000000"),
  currentSchool("38", "Colorado", "Big 12", "#CFB87C", "#000000"),
  currentSchool("248", "Houston", "Big 12", "#C8102E", "#FFFFFF"),
  currentSchool("66", "Iowa State", "Big 12", "#C8102E", "#F1BE48"),
  currentSchool("2305", "Kansas", "Big 12", "#0051BA", "#E8000D"),
  currentSchool("2306", "Kansas State", "Big 12", "#512888", "#FFFFFF"),
  currentSchool("197", "Oklahoma State", "Big 12", "#FF7300", "#000000"),
  currentSchool("2628", "TCU", "Big 12", "#4D1979", "#FFFFFF"),
  currentSchool("2641", "Texas Tech", "Big 12", "#CC0000", "#000000"),
  currentSchool("2116", "UCF", "Big 12", "#000000", "#FFC904"),
  currentSchool("254", "Utah", "Big 12", "#CC0000", "#FFFFFF"),
  currentSchool("277", "West Virginia", "Big 12", "#002855", "#EAAA00"),
  currentSchool("103", "Boston College", "ACC", "#8A100B", "#B29D6C"),
  currentSchool("25", "California", "ACC", "#003262", "#FDB515"),
  currentSchool("228", "Clemson", "ACC", "#F56600", "#522D80"),
  currentSchool("150", "Duke", "ACC", "#003087", "#FFFFFF"),
  currentSchool("52", "Florida State", "ACC", "#782F40", "#CEB888"),
  currentSchool("59", "Georgia Tech", "ACC", "#B3A369", "#003057"),
  currentSchool("97", "Louisville", "ACC", "#AD0000", "#000000"),
  currentSchool("2390", "Miami", "ACC", "#F47321", "#005030"),
  currentSchool("152", "NC State", "ACC", "#CC0000", "#000000"),
  currentSchool("153", "North Carolina", "ACC", "#7BAFD4", "#FFFFFF"),
  currentSchool("221", "Pittsburgh", "ACC", "#003594", "#FFB81C"),
  currentSchool("2567", "SMU", "ACC", "#C8102E", "#354CA1"),
  currentSchool("24", "Stanford", "ACC", "#8C1515", "#FFFFFF"),
  currentSchool("183", "Syracuse", "ACC", "#D44500", "#FFFFFF"),
  currentSchool("258", "Virginia", "ACC", "#232D4B", "#E57200"),
  currentSchool("259", "Virginia Tech", "ACC", "#861F41", "#E87722"),
  currentSchool("154", "Wake Forest", "ACC", "#9E7E38", "#000000"),
  currentSchool("87", "Notre Dame", "Independent", "#0C2340", "#C99700"),
] as const;

export const CFB_CURRENT_SCHOOL_BY_NAME_2026: Readonly<Record<string, CfbCurrentSchool2026>> =
  Object.freeze(Object.fromEntries(CFB_CURRENT_SCHOOLS_2026.map((entry) => [entry.school, entry])));

export const CFB_CURRENT_SCHOOL_COLORS_2026: Readonly<Record<string, readonly [string, string]>> =
  Object.freeze(Object.fromEntries(
    CFB_CURRENT_SCHOOLS_2026.map((entry) => [
      entry.school,
      [entry.primaryColor, entry.secondaryColor] as const,
    ]),
  ));

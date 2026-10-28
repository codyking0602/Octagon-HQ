// Picker vocabulary only. Weekly Football team identity/assets remain owned by the
// canonical football_team_assets ESPN sync; this list prevents free-text Futures
// team-name mismatches without adding another runtime data provider.
export const CFB_FUTURES_TEAMS = [
  "Air Force Falcons",
  "Akron Zips",
  "Alabama Crimson Tide",
  "Appalachian State Mountaineers",
  "Arizona Wildcats",
  "Arizona State Sun Devils",
  "Arkansas Razorbacks",
  "Arkansas State Red Wolves",
  "Army Black Knights",
  "Auburn Tigers",
  "Ball State Cardinals",
  "Baylor Bears",
  "Boise State Broncos",
  "Boston College Eagles",
  "Bowling Green Falcons",
  "Buffalo Bulls",
  "BYU Cougars",
  "California Golden Bears",
  "Central Michigan Chippewas",
  "Charlotte 49ers",
  "Cincinnati Bearcats",
  "Clemson Tigers",
  "Coastal Carolina Chanticleers",
  "Colorado Buffaloes",
  "Colorado State Rams",
  "Delaware Blue Hens",
  "Duke Blue Devils",
  "East Carolina Pirates",
  "Eastern Michigan Eagles",
  "Florida Gators",
  "Florida Atlantic Owls",
  "FIU Panthers",
  "Florida State Seminoles",
  "Fresno State Bulldogs",
  "Georgia Bulldogs",
  "Georgia Southern Eagles",
  "Georgia State Panthers",
  "Georgia Tech Yellow Jackets",
  "Hawai'i Rainbow Warriors",
  "Houston Cougars",
  "Illinois Fighting Illini",
  "Indiana Hoosiers",
  "Iowa Hawkeyes",
  "Iowa State Cyclones",
  "Jacksonville State Gamecocks",
  "James Madison Dukes",
  "Kansas Jayhawks",
  "Kansas State Wildcats",
  "Kennesaw State Owls",
  "Kent State Golden Flashes",
  "Kentucky Wildcats",
  "Liberty Flames",
  "Louisiana Ragin' Cajuns",
  "Louisiana Tech Bulldogs",
  "Louisville Cardinals",
  "LSU Tigers",
  "Marshall Thundering Herd",
  "Maryland Terrapins",
  "Memphis Tigers",
  "Miami Hurricanes",
  "Miami (OH) RedHawks",
  "Michigan Wolverines",
  "Michigan State Spartans",
  "Middle Tennessee Blue Raiders",
  "Minnesota Golden Gophers",
  "Mississippi State Bulldogs",
  "Missouri Tigers",
  "Missouri State Bears",
  "Navy Midshipmen",
  "NC State Wolfpack",
  "Nebraska Cornhuskers",
  "Nevada Wolf Pack",
  "New Mexico Lobos",
  "New Mexico State Aggies",
  "North Carolina Tar Heels",
  "North Texas Mean Green",
  "Northern Illinois Huskies",
  "Northwestern Wildcats",
  "Notre Dame Fighting Irish",
  "Ohio Bobcats",
  "Ohio State Buckeyes",
  "Oklahoma Sooners",
  "Oklahoma State Cowboys",
  "Old Dominion Monarchs",
  "Ole Miss Rebels",
  "Oregon Ducks",
  "Oregon State Beavers",
  "Penn State Nittany Lions",
  "Pittsburgh Panthers",
  "Purdue Boilermakers",
  "Rice Owls",
  "Rutgers Scarlet Knights",
  "Sam Houston Bearkats",
  "San Diego State Aztecs",
  "San Jose State Spartans",
  "SMU Mustangs",
  "South Alabama Jaguars",
  "South Carolina Gamecocks",
  "South Florida Bulls",
  "Southern Miss Golden Eagles",
  "Stanford Cardinal",
  "Syracuse Orange",
  "TCU Horned Frogs",
  "Temple Owls",
  "Tennessee Volunteers",
  "Texas Longhorns",
  "Texas A&M Aggies",
  "Texas State Bobcats",
  "Texas Tech Red Raiders",
  "Toledo Rockets",
  "Troy Trojans",
  "Tulane Green Wave",
  "Tulsa Golden Hurricane",
  "UAB Blazers",
  "UCF Knights",
  "UCLA Bruins",
  "UConn Huskies",
  "UL Monroe Warhawks",
  "UMass Minutemen",
  "UNLV Rebels",
  "USC Trojans",
  "UTEP Miners",
  "UTSA Roadrunners",
  "Utah Utes",
  "Utah State Aggies",
  "Vanderbilt Commodores",
  "Virginia Cavaliers",
  "Virginia Tech Hokies",
  "Wake Forest Demon Deacons",
  "Washington Huskies",
  "Washington State Cougars",
  "West Virginia Mountaineers",
  "Western Kentucky Hilltoppers",
  "Western Michigan Broncos",
  "Wisconsin Badgers",
  "Wyoming Cowboys",
] as const;

export const NFL_FUTURES_TEAMS = [
  "Arizona Cardinals",
  "Atlanta Falcons",
  "Baltimore Ravens",
  "Buffalo Bills",
  "Carolina Panthers",
  "Chicago Bears",
  "Cincinnati Bengals",
  "Cleveland Browns",
  "Dallas Cowboys",
  "Denver Broncos",
  "Detroit Lions",
  "Green Bay Packers",
  "Houston Texans",
  "Indianapolis Colts",
  "Jacksonville Jaguars",
  "Kansas City Chiefs",
  "Las Vegas Raiders",
  "Los Angeles Chargers",
  "Los Angeles Rams",
  "Miami Dolphins",
  "Minnesota Vikings",
  "New England Patriots",
  "New Orleans Saints",
  "New York Giants",
  "New York Jets",
  "Philadelphia Eagles",
  "Pittsburgh Steelers",
  "San Francisco 49ers",
  "Seattle Seahawks",
  "Tampa Bay Buccaneers",
  "Tennessee Titans",
  "Washington Commanders",
] as const;

export const CFB_POWER4_CONFERENCES = ["ACC", "Big Ten", "Big 12", "SEC"] as const;
export type CfbPower4Conference = (typeof CFB_POWER4_CONFERENCES)[number];

const CFB_POWER4_TEAMS: Record<CfbPower4Conference, readonly string[]> = {
  ACC: [
    "Boston College Eagles", "California Golden Bears", "Clemson Tigers", "Duke Blue Devils",
    "Florida State Seminoles", "Georgia Tech Yellow Jackets", "Louisville Cardinals", "Miami Hurricanes",
    "NC State Wolfpack", "North Carolina Tar Heels", "Pittsburgh Panthers", "SMU Mustangs",
    "Stanford Cardinal", "Syracuse Orange", "Virginia Cavaliers", "Virginia Tech Hokies",
    "Wake Forest Demon Deacons",
  ],
  "Big Ten": [
    "Illinois Fighting Illini", "Indiana Hoosiers", "Iowa Hawkeyes", "Maryland Terrapins",
    "Michigan Wolverines", "Michigan State Spartans", "Minnesota Golden Gophers", "Nebraska Cornhuskers",
    "Northwestern Wildcats", "Ohio State Buckeyes", "Oregon Ducks", "Penn State Nittany Lions",
    "Purdue Boilermakers", "Rutgers Scarlet Knights", "UCLA Bruins", "USC Trojans",
    "Washington Huskies", "Wisconsin Badgers",
  ],
  "Big 12": [
    "Arizona Wildcats", "Arizona State Sun Devils", "Baylor Bears", "BYU Cougars",
    "Cincinnati Bearcats", "Colorado Buffaloes", "Houston Cougars", "Iowa State Cyclones",
    "Kansas Jayhawks", "Kansas State Wildcats", "Oklahoma State Cowboys", "TCU Horned Frogs",
    "Texas Tech Red Raiders", "UCF Knights", "Utah Utes", "West Virginia Mountaineers",
  ],
  SEC: [
    "Alabama Crimson Tide", "Arkansas Razorbacks", "Auburn Tigers", "Florida Gators",
    "Georgia Bulldogs", "Kentucky Wildcats", "LSU Tigers", "Mississippi State Bulldogs",
    "Missouri Tigers", "Oklahoma Sooners", "Ole Miss Rebels", "South Carolina Gamecocks",
    "Tennessee Volunteers", "Texas Longhorns", "Texas A&M Aggies", "Vanderbilt Commodores",
  ],
};

const CFB_POWER4_LOOKUP = new Map<string, CfbPower4Conference>();
for (const conference of CFB_POWER4_CONFERENCES) {
  for (const team of CFB_POWER4_TEAMS[conference]) CFB_POWER4_LOOKUP.set(team.toLowerCase(), conference);
}

export function getCfbPower4Conference(team: string): CfbPower4Conference | null {
  return CFB_POWER4_LOOKUP.get(team.trim().toLowerCase()) ?? null;
}

export function isCfbPower4Team(team: string) {
  return getCfbPower4Conference(team) !== null;
}

export const NFL_CONFERENCES = ["AFC", "NFC"] as const;
export type NflConference = (typeof NFL_CONFERENCES)[number];
export const NFL_DIVISIONS = ["East", "North", "South", "West"] as const;
export type NflDivision = (typeof NFL_DIVISIONS)[number];

export interface NflTeamGroup {
  conference: NflConference;
  division: NflDivision;
  label: string;
}

export const NFL_DIVISION_GROUPS: readonly NflTeamGroup[] = NFL_CONFERENCES.flatMap((conference) =>
  NFL_DIVISIONS.map((division) => ({ conference, division, label: `${conference} ${division}` })),
);

const NFL_DIVISION_TEAMS: Record<string, readonly string[]> = {
  "AFC East": ["Buffalo Bills", "Miami Dolphins", "New England Patriots", "New York Jets"],
  "AFC North": ["Baltimore Ravens", "Cincinnati Bengals", "Cleveland Browns", "Pittsburgh Steelers"],
  "AFC South": ["Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Tennessee Titans"],
  "AFC West": ["Denver Broncos", "Kansas City Chiefs", "Las Vegas Raiders", "Los Angeles Chargers"],
  "NFC East": ["Dallas Cowboys", "New York Giants", "Philadelphia Eagles", "Washington Commanders"],
  "NFC North": ["Chicago Bears", "Detroit Lions", "Green Bay Packers", "Minnesota Vikings"],
  "NFC South": ["Atlanta Falcons", "Carolina Panthers", "New Orleans Saints", "Tampa Bay Buccaneers"],
  "NFC West": ["Arizona Cardinals", "Los Angeles Rams", "San Francisco 49ers", "Seattle Seahawks"],
};

const NFL_TEAM_GROUP_LOOKUP = new Map<string, NflTeamGroup>();
for (const group of NFL_DIVISION_GROUPS) {
  for (const team of NFL_DIVISION_TEAMS[group.label] ?? []) NFL_TEAM_GROUP_LOOKUP.set(team.toLowerCase(), group);
}

export function getNflTeamGroup(team: string): NflTeamGroup | null {
  return NFL_TEAM_GROUP_LOOKUP.get(team.trim().toLowerCase()) ?? null;
}

export function getNflConference(team: string): NflConference | null {
  return getNflTeamGroup(team)?.conference ?? null;
}

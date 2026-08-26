import fs from "node:fs";

const root = new URL("../", import.meta.url);
const read = (path) => JSON.parse(fs.readFileSync(new URL(path, root), "utf8"));
const n = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const normalize = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ixFor = (corpus) => Object.fromEntries(corpus.columns.map((column, index) => [column, index]));
const at = (row, ix, name) => ix[name] == null ? undefined : row[ix[name]];

const nfl = read("data/generated/football/nfl/player-seasons-1999-2025.json");
const cfb = read("data/generated/football/cfb/player-seasons-2014-2025.json");
const cfbPrograms = read("data/generated/football/relationships/cfb-programs-2002-2025.json");
const cfbTeamSeasons = read("data/generated/football/relationships/cfb-team-season-results-2002-2025.json");
const cfbChampionships = read("data/generated/football/relationships/cfb-national-championships-2002-2025.json");
const cfbCoachStints = read("data/generated/football/relationships/cfb-coach-stints-2002-2025.json");
const cfbEras = read("data/generated/football/relationships/cfb-championship-eras-2002-2025.json");
const nflFranchises = read("data/generated/football/relationships/nfl-franchises-1999-2025.json");
const nflTeamSeasons = read("data/generated/football/relationships/nfl-team-season-results-1999-2025.json");
const nflCoachStints = read("data/generated/football/relationships/nfl-coach-stints-1999-2025.json");
const nflGames = read("data/generated/football/relationships/nfl-games-1999-2025.json");
const cfbGames = read("data/generated/football/relationships/cfb-games-2002-2025.json");

const approvedAPlayers = new Set([
  "Tom Brady", "Peyton Manning", "Patrick Mahomes", "Aaron Rodgers", "Brett Favre", "Drew Brees",
  "Randy Moss", "Terrell Owens", "Adrian Peterson", "LaDainian Tomlinson", "Ray Lewis", "Aaron Donald",
  "J.J. Watt", "Cam Newton", "Tim Tebow", "Reggie Bush", "Vince Young", "Johnny Manziel",
]);
const approvedBPlayers = new Set([
  "Matt Ryan", "Jamaal Charles", "Dez Bryant", "Luke Kuechly", "Calvin Johnson", "Andrew Luck",
  "Colt McCoy", "Michael Crabtree", "Darren McFadden", "Justin Blackmon", "Baker Mayfield", "Lamar Jackson",
  "Derrick Henry", "Saquon Barkley", "Christian McCaffrey", "Joe Burrow", "Trevor Lawrence", "Bijan Robinson",
  "Ashton Jeanty", "Caleb Williams", "Jayden Daniels", "Travis Hunter", "Bo Nix", "A.J. Brown",
]);
const approvedCfbBIdentityWindows = new Map([
  ["a-j-brown", [2016, 2018]], ["ashton-jeanty", [2022, 2024]], ["baker-mayfield", [2015, 2017]],
  ["bijan-robinson", [2020, 2022]], ["bo-nix", [2019, 2023]], ["caleb-williams", [2021, 2023]],
  ["christian-mccaffrey", [2014, 2016]], ["derrick-henry", [2014, 2015]], ["jayden-daniels", [2019, 2023]],
  ["lamar-jackson", [2015, 2017]], ["saquon-barkley", [2015, 2017]], ["travis-hunter", [2022, 2024]],
  ["trevor-lawrence", [2018, 2020]], ["c-j-stroud", [2021, 2022]], ["travis-etienne", [2017, 2020]],
  ["amari-cooper", [2014, 2014]], ["ezekiel-elliott", [2014, 2015]], ["marcus-mariota", [2014, 2014]],
  ["jameis-winston", [2014, 2014]], ["melvin-gordon", [2014, 2014]], ["dak-prescott", [2014, 2015]],
  ["deshaun-watson", [2014, 2016]], ["leonard-fournette", [2014, 2016]], ["nick-chubb", [2014, 2017]],
  ["myles-garrett", [2014, 2016]], ["jalen-hurts", [2016, 2019]], ["kyler-murray", [2015, 2018]],
  ["ja-marr-chase", [2018, 2019]], ["devonta-smith", [2017, 2020]], ["brock-bowers", [2021, 2023]],
  ["marvin-harrison-jr", [2021, 2023]], ["will-anderson-jr", [2020, 2022]], ["micah-parsons", [2018, 2019]],
  ["chase-young", [2017, 2019]], ["joey-bosa", [2014, 2015]], ["nick-bosa", [2016, 2018]],
  ["dalvin-cook", [2014, 2016]], ["todd-gurley", [2014, 2014]],
]);
const majorCfbPrograms = new Set([
  "alabama", "auburn", "clemson", "florida", "florida-state", "georgia", "lsu", "miami", "michigan",
  "michigan-state", "nebraska", "notre-dame", "ohio-state", "oklahoma", "oklahoma-state", "oregon",
  "penn-state", "tennessee", "texas", "texas-a-m", "usc", "ucla", "virginia-tech", "washington", "wisconsin",
]);
const iconicPrograms = new Set(["alabama", "michigan", "notre-dame", "ohio-state", "oklahoma", "texas", "usc"]);
const veryRecognizablePrograms = new Set(["auburn", "clemson", "florida", "florida-state", "georgia", "lsu", "miami", "oregon", "penn-state", "tennessee", "texas-a-m"]);

function aggregate(corpus, league) {
  const ix = ixFor(corpus);
  const people = new Map();
  for (const row of corpus.rows) {
    const sourceId = String(at(row, ix, "sourcePlayerId") ?? "");
    const name = at(row, ix, "playerDisplayName") ?? at(row, ix, "playerName");
    if (!sourceId || sourceId === "0" || !name) continue;
    const personKey = league === "CFB" ? `${sourceId}:${normalize(name)}` : sourceId;
    const p = people.get(personKey) ?? { sourceId, name: String(name), league, seasons: new Set(), teams: new Set(), position: "", totals: {}, peaks: {} };
    const season = n(at(row, ix, "season")); if (season) p.seasons.add(season);
    const team = at(row, ix, "recentTeam") ?? at(row, ix, "team"); if (team) p.teams.add(String(team));
    p.position ||= String(at(row, ix, "positionGroup") ?? at(row, ix, "position") ?? "");
    for (const field of ["games", "gamesPlayed", "attempts", "passAttempts", "passingYards", "passYards", "passingTouchdowns", "passTouchdowns", "carries", "rushAttempts", "rushingYards", "rushYards", "rushingTouchdowns", "rushTouchdowns", "receptions", "receivingYards", "receivingTouchdowns", "defensiveSacks", "sacks", "defensiveInterceptions", "fieldGoalsMade", "puntingAttempts"]) {
      const value = n(at(row, ix, field));
      p.totals[field] = n(p.totals[field]) + value;
      p.peaks[field] = Math.max(n(p.peaks[field]), value);
    }
    people.set(personKey, p);
  }
  return [...people.values()];
}

const exactPositionGroups = new Map([
  ["QB", "QB"], ["RB", "RB"], ["FB", "RB"], ["HB", "RB"], ["WR", "WR"], ["TE", "TE"],
  ["OL", "OL"], ["C", "OL"], ["G", "OL"], ["OG", "OL"], ["T", "OL"], ["OT", "OL"],
  ["DL", "DL"], ["DE", "DL"], ["DT", "DL"], ["NT", "DL"], ["EDGE", "DL"],
  ["LB", "LB"], ["ILB", "LB"], ["OLB", "LB"], ["DB", "DB"], ["CB", "DB"], ["S", "DB"], ["FS", "DB"], ["SS", "DB"],
  ["K", "K"], ["PK", "K"], ["P", "P"],
]);

function exactPosition(p) {
  const raw = String(p.position ?? "").trim().toUpperCase();
  if (!raw) return undefined;
  if (exactPositionGroups.has(raw)) return exactPositionGroups.get(raw);
  for (const token of raw.split(/[\s/,-]+/).filter(Boolean)) if (exactPositionGroups.has(token)) return exactPositionGroups.get(token);
  return undefined;
}

function inferredCollegeSkillPosition(p) {
  const t = p.totals;
  if (n(t.fieldGoalsMade) >= 5) return "K";
  if (n(t.passAttempts) >= 50) return "QB";
  if (n(t.receptions) >= 20) return "WR";
  if (n(t.rushAttempts) >= 50) return "RB";
  return undefined;
}

const yearsFor = (p) => [...p.seasons].filter(Boolean).sort((a, b) => a - b);
const total = (p, ...fields) => fields.reduce((sum, field) => sum + n(p.totals[field]), 0);
const peak = (p, ...fields) => Math.max(0, ...fields.map((field) => n(p.peaks[field])));

function projectNflPlayer(p) {
  const position = exactPosition(p);
  const games = total(p, "games");
  const passAttempts = total(p, "attempts");
  const passYards = total(p, "passingYards");
  const passTds = total(p, "passingTouchdowns");
  const carries = total(p, "carries");
  const rushYards = total(p, "rushingYards");
  const receptions = total(p, "receptions");
  const recYards = total(p, "receivingYards");
  const sacks = total(p, "defensiveSacks");
  const ints = total(p, "defensiveInterceptions");
  const fgm = total(p, "fieldGoalsMade");
  const punts = total(p, "puntingAttempts");
  const evidence = [];
  let tier = "D";
  const scrimmageYards = rushYards + recYards;
  const b =
    (position === "QB" && games >= 80 && (passYards >= 30000 || passTds >= 220)) ||
    (position === "RB" && games >= 70 && (rushYards >= 9000 || scrimmageYards >= 11000)) ||
    ((position === "WR" || position === "TE") && games >= 80 && (recYards >= 10000 || receptions >= 750)) ||
    ((position === "DL" || position === "LB") && games >= 100 && sacks >= 90) ||
    (position === "DB" && games >= 100 && ints >= 35) ||
    (position === "K" && games >= 200 && fgm >= 350);
  const c =
    (position === "QB" && games >= 40 && (passYards >= 10000 || passAttempts >= 1500)) ||
    (position === "RB" && games >= 50 && (rushYards >= 3000 || carries >= 700)) ||
    ((position === "WR" || position === "TE") && games >= 50 && (recYards >= 3000 || receptions >= 250)) ||
    (["DL", "LB", "DB"].includes(position) && games >= 70 && (sacks >= 20 || ints >= 8 || games >= 120)) ||
    (position === "OL" && games >= 120) ||
    (position === "K" && games >= 120 && fgm >= 150) ||
    (position === "P" && games >= 120 && punts >= 500);
  if (b) { tier = "B"; evidence.push("sustained nationally prominent NFL career"); }
  else if (c) { tier = "C"; evidence.push("substantial multi-year NFL role"); }
  if (approvedBPlayers.has(p.name) && tier !== "A") { tier = "B"; evidence.push("explicit football-culture B approval"); }
  if (approvedAPlayers.has(p.name)) { tier = "A"; evidence.push("explicit iconic-player approval"); }
  const years = yearsFor(p);
  return { id: `nflverse-player-${p.sourceId}`, kind: "player-career", name: p.name, league: "NFL", position, startSeason: years[0], endSeason: years.at(-1), tier, evidence, sourceProvider: "nflverse", sourceId: p.sourceId, manualA: tier === "A" };
}

const nflPeople = aggregate(nfl, "NFL");
const nflProjected = nflPeople.map(projectNflPlayer);
const nflByNormalizedName = new Map();
for (const record of nflProjected) {
  const key = normalize(record.name);
  const list = nflByNormalizedName.get(key) ?? [];
  list.push(record); nflByNormalizedName.set(key, list);
}
const uniqueNflMatch = (name) => {
  const list = nflByNormalizedName.get(normalize(name)) ?? [];
  return list.length === 1 ? list[0] : null;
};

function projectCfbPlayer(p) {
  const years = yearsFor(p);
  const collegeEndSeason = years.at(-1);
  const nflNameMatch = uniqueNflMatch(p.name);
  const nflMatch = nflNameMatch && collegeEndSeason != null && nflNameMatch.startSeason != null && nflNameMatch.startSeason >= collegeEndSeason && nflNameMatch.startSeason <= collegeEndSeason + 2 ? nflNameMatch : null;
  const position = nflMatch?.position ?? inferredCollegeSkillPosition(p);
  const passAttempts = total(p, "passAttempts");
  const passYards = total(p, "passYards");
  const rushAttempts = total(p, "rushAttempts");
  const rushYards = total(p, "rushYards");
  const receptions = total(p, "receptions");
  const recYards = total(p, "receivingYards");
  const defensiveImpact = total(p, "sacks", "defensiveInterceptions");
  const school = [...p.teams].sort()[0];
  const major = [...p.teams].some((team) => majorCfbPrograms.has(normalize(team)));
  const singleMajorProgram = p.teams.size === 1 && major;
  const meaningful =
    (position === "QB" && passAttempts >= 250) || (position === "RB" && rushAttempts >= 180) ||
    ((position === "WR" || position === "TE") && receptions >= 80) ||
    (["DL", "LB", "DB"].includes(position) && defensiveImpact >= 8);
  const strong =
    (position === "QB" && passAttempts >= 500 && passYards >= 6500) ||
    (position === "RB" && rushAttempts >= 400 && rushYards >= 2500) ||
    ((position === "WR" || position === "TE") && receptions >= 150 && recYards >= 1800);
  const extreme =
    (position === "QB" && passYards >= 9000) || (position === "RB" && rushYards >= 3500) ||
    ((position === "WR" || position === "TE") && recYards >= 2800);
  const eliteMajorPeak =
    singleMajorProgram && ((position === "QB" && passYards >= 9000 && peak(p, "passYards") >= 3500) ||
      (position === "RB" && rushYards >= 3500 && peak(p, "rushYards") >= 1500) ||
      ((position === "WR" || position === "TE") && recYards >= 2800 && peak(p, "receivingYards") >= 1100));
  const headlineMajor =
    singleMajorProgram && ((position === "QB" && passYards >= 6500 && peak(p, "passYards") >= 3000) ||
      (position === "RB" && rushYards >= 2500 && peak(p, "rushYards") >= 1200) ||
      ((position === "WR" || position === "TE") && recYards >= 1800 && peak(p, "receivingYards") >= 900));
  const evidence = [];
  let tier = "D";
  const approvedBWindow = approvedCfbBIdentityWindows.get(normalize(p.name));
  const approvedBIdentity = approvedBWindow?.[0] === years[0] && approvedBWindow?.[1] === years.at(-1);
  if (approvedBIdentity) { tier = "B"; evidence.push("explicit source-window CFB star approval"); }
  else if (singleMajorProgram && strong) { tier = "C"; evidence.push("sustained high-end production at one observed nationally prominent program"); }
  else if (nflMatch && ["A", "B", "C"].includes(nflMatch.tier) && meaningful) { tier = "C"; evidence.push("recognized NFL crossover with meaningful college role"); }
  return { id: `cfbfast-r-player-${p.sourceId}-${normalize(p.name)}`, kind: "player-career", name: p.name, league: "CFB", position, school, startSeason: years[0], endSeason: years.at(-1), tier, evidence, sourceProvider: "cfbfastR", sourceId: p.sourceId, manualA: tier === "A" };
}

const cfbPeople = aggregate(cfb, "CFB");
const cfbNameCounts = new Map();
for (const person of cfbPeople) { const key = normalize(person.name); cfbNameCounts.set(key, (cfbNameCounts.get(key) ?? 0) + 1); }
const cfbProjected = cfbPeople.map(projectCfbPlayer).map((record) => cfbNameCounts.get(normalize(record.name)) > 1 ? { ...record, tier: "D", evidence: ["ambiguous duplicate CFB source name; no safe canonical merge"], manualA: false } : record);

function recordsFromRows(corpus, mapper) {
  const ix = ixFor(corpus);
  return corpus.rows.map((row, rowIndex) => mapper(row, ix, rowIndex));
}

const programRecords = recordsFromRows(cfbPrograms, (row, ix) => {
  const sourceId = String(at(row, ix, "sourceProgramId"));
  const name = String(at(row, ix, "programName"));
  const division = String(at(row, ix, "latestDivision") ?? "").toLowerCase();
  const key = normalize(name);
  let tier = division === "fbs" ? "C" : "D";
  if (veryRecognizablePrograms.has(key)) tier = "B";
  if (iconicPrograms.has(key)) tier = "A";
  return { id: `cfb-program-${sourceId}`, kind: "program", name, league: "CFB", tier, sourceProvider: "cfbfastR", sourceId, startSeason: n(at(row, ix, "firstSeason")), endSeason: n(at(row, ix, "lastSeason")), evidence: [tier === "D" ? "non-FBS source program" : tier === "C" ? "current FBS program" : "explicit program-brand classification"], manualA: tier === "A" };
});

const franchiseA = new Set(["DAL", "GB", "NE", "PIT", "SF"]);
const franchiseRecords = recordsFromRows(nflFranchises, (row, ix) => {
  const sourceId = String(at(row, ix, "franchiseId"));
  const tier = franchiseA.has(sourceId) ? "A" : "B";
  return { id: `nfl-franchise-${sourceId}`, kind: "franchise", name: sourceId, league: "NFL", tier, sourceProvider: "nflverse", sourceId, startSeason: n(at(row, ix, "firstSeason")), endSeason: n(at(row, ix, "lastSeason")), evidence: [tier === "A" ? "explicit iconic franchise approval" : "current NFL franchise"], manualA: tier === "A" };
});

const championKeys = new Set(recordsFromRows(cfbChampionships, (row, ix) => `${at(row, ix, "season")}:${at(row, ix, "sourceProgramId")}`));
const iconicCfbTeamSeasons = new Set(["2005:251", "2019:99"]);
const cfbTeamSeasonRecords = recordsFromRows(cfbTeamSeasons, (row, ix) => {
  const season = n(at(row, ix, "season")); const sourceId = String(at(row, ix, "sourceProgramId")); const name = String(at(row, ix, "programName"));
  const key = `${season}:${sourceId}`; const fbs = String(at(row, ix, "division") ?? "").toLowerCase() === "fbs"; const wins = n(at(row, ix, "overallWins"));
  let tier = "D"; if (championKeys.has(key)) tier = "B"; else if (fbs && wins >= 12) tier = "C"; if (iconicCfbTeamSeasons.has(key)) tier = "A";
  return { id: `cfb-team-season-${key}`, kind: "team-season", name: `${season} ${name}`, league: "CFB", tier, sourceProvider: "cfbfastR", sourceId: key, startSeason: season, endSeason: season, evidence: [tier === "A" ? "explicit iconic team-season approval" : championKeys.has(key) ? "NCAA championship season" : tier === "C" ? "11+ win FBS season" : "ordinary source team season"], manualA: tier === "A" };
});

const iconicNflTeamSeasons = new Set(["2007:NE"]);
const nflTeamSeasonRecords = recordsFromRows(nflTeamSeasons, (row, ix) => {
  const season = n(at(row, ix, "season")); const franchise = String(at(row, ix, "franchiseId")); const key = `${season}:${franchise}`;
  const champion = Boolean(at(row, ix, "superBowlChampion")); const appearance = Boolean(at(row, ix, "superBowlAppearance")); const wins = n(at(row, ix, "regularSeasonWins"));
  let tier = champion ? "B" : appearance || wins >= 13 ? "C" : "D"; if (iconicNflTeamSeasons.has(key)) tier = "A";
  return { id: `nfl-team-season-${key}`, kind: "team-season", name: `${season} ${franchise}`, league: "NFL", tier, sourceProvider: "nflverse", sourceId: key, startSeason: season, endSeason: season, evidence: [tier === "A" ? "explicit iconic team-season approval" : champion ? "Super Bowl champion" : tier === "C" ? "Super Bowl appearance or exceptional regular season" : "ordinary source team season"], manualA: tier === "A" };
});

const cfbProgramTier = new Map(programRecords.map((record) => [normalize(record.name), record.tier]));
const cfbCoachA = new Set(["nick-saban", "urban-meyer", "pete-carroll", "bobby-bowden"]);
const cfbCoachB = new Set(["bob-stoops", "dabo-swinney", "kirby-smart", "mack-brown", "jim-harbaugh", "gary-patterson", "frank-beamer", "kirk-ferentz", "mike-leach"]);
const cfbCoachRecords = recordsFromRows(cfbCoachStints, (row, ix) => {
  const sourceId = String(at(row, ix, "sourceCoachStintKey")); const name = String(at(row, ix, "coachName")); const program = String(at(row, ix, "programName")); const seasons = n(at(row, ix, "seasonCount"));
  const nameKey = normalize(name); const programTier = cfbProgramTier.get(normalize(program)) ?? "D";
  let tier = seasons >= 5 && programTier !== "D" ? "C" : "D"; if ((cfbCoachB.has(nameKey) && (seasons >= 4 || ["A", "B"].includes(programTier))) || (seasons >= 8 && ["A", "B"].includes(programTier))) tier = "B"; const iconicStop = (nameKey === "nick-saban" && normalize(program) === "alabama") || (nameKey === "urban-meyer" && ["florida", "ohio-state"].includes(normalize(program))) || (nameKey === "pete-carroll" && normalize(program) === "usc") || (nameKey === "bobby-bowden" && normalize(program) === "florida-state"); if (iconicStop) tier = "A";
  return { id: `cfb-coach-stop-${sourceId}`, kind: "coach-stop", name, league: "CFB", tier, sourceProvider: "cfb-coaches", sourceId, identityScope: "source-name-within-program", startSeason: n(at(row, ix, "startSeason")), endSeason: n(at(row, ix, "endSeason")), evidence: [tier === "D" ? "short/low-salience FBS coaching stop" : tier === "C" ? "meaningful multi-year FBS head-coach stop" : "prominent coaching identity/stop"], manualA: tier === "A" };
});

const nflCoachA = new Set(["bill-belichick", "andy-reid", "pete-carroll"]);
const nflCoachB = new Set(["mike-tomlin", "sean-payton", "john-harbaugh", "tom-coughlin", "tony-dungy", "mike-shanahan", "bill-cowher", "jon-gruden"]);
const nflCoachRecords = recordsFromRows(nflCoachStints, (row, ix) => {
  const sourceId = String(at(row, ix, "sourceCoachStintKey")); const name = String(at(row, ix, "coachName")); const nameKey = normalize(name); const seasons = n(at(row, ix, "seasonCount")); const wins = n(at(row, ix, "regularSeasonWins")); const playoffs = n(at(row, ix, "playoffSeasons")); const sbApps = n(at(row, ix, "superBowlAppearances")); const sbTitles = n(at(row, ix, "superBowlChampionships"));
  const franchise = String(at(row, ix, "franchiseId")); let tier = seasons >= 5 && (wins >= 40 || playoffs >= 3) ? "C" : "D"; if ((nflCoachB.has(nameKey) && seasons >= 4) || (seasons >= 6 && (sbTitles >= 1 || sbApps >= 2))) tier = "B"; if ((nameKey === "bill-belichick" && franchise === "NE") || (nameKey === "andy-reid" && franchise === "KC")) tier = "A";
  return { id: `nfl-coach-stop-${sourceId}`, kind: "coach-stop", name, league: "NFL", tier, sourceProvider: "nflverse", sourceId, identityScope: "source-name-within-franchise", startSeason: n(at(row, ix, "startSeason")), endSeason: n(at(row, ix, "endSeason")), evidence: [tier === "D" ? "short/low-salience NFL head-coach stop" : tier === "C" ? "meaningful multi-year NFL head-coach stop" : "prominent NFL head-coaching success"], manualA: tier === "A" };
});

const cfbEraRecords = recordsFromRows(cfbEras, (row, ix) => {
  const sourceId = String(at(row, ix, "sourceEraKey")); const name = String(at(row, ix, "programName")); const startSeason = n(at(row, ix, "startSeason")); const endSeason = n(at(row, ix, "endSeason")); const tier = name === "Alabama" ? "A" : "B";
  return { id: `cfb-era-${sourceId}`, kind: "era", name: `${name} ${startSeason}–${endSeason}`, league: "CFB", tier, sourceProvider: "ncaa", sourceId, startSeason, endSeason, evidence: [tier === "A" ? "explicit iconic multi-title era approval" : "objective multi-title championship cluster"], manualA: tier === "A" };
});
const nflEraRecords = nflCoachRecords.map((coach) => { const iconic = coach.sourceId === "bill-belichick@NE:2000-2023" || coach.sourceId === "andy-reid@KC:2013-2025"; const seasons = n(coach.endSeason) - n(coach.startSeason) + 1; const tier = iconic ? "A" : coach.tier === "A" || (coach.tier === "B" && seasons >= 6) ? "B" : coach.tier === "C" && seasons >= 5 ? "C" : "D"; return { ...coach, id: coach.id.replace("coach-stop", "era"), kind: "era", name: `${coach.name} ${coach.startSeason}–${coach.endSeason}`, tier, evidence: [iconic ? "explicit iconic NFL coaching-era approval" : "objective contiguous coach-within-franchise stint used as NFL era basis"] }; });

const nflGameRecords = recordsFromRows(nflGames, (row, ix) => {
  const sourceId = String(at(row, ix, "sourceGameId")); const season = n(at(row, ix, "season")); const away = String(at(row, ix, "awayFranchiseId")); const home = String(at(row, ix, "homeFranchiseId")); const superBowl = Boolean(at(row, ix, "superBowl"));
  const iconic = superBowl && ((season === 2016 && new Set([away, home]).has("NE") && new Set([away, home]).has("ATL")) || (season === 2007 && new Set([away, home]).has("NE") && new Set([away, home]).has("NYG")));
  const tier = iconic ? "A" : superBowl ? "C" : "D";
  return { id: `nfl-game-${sourceId}`, kind: "game", name: sourceId, league: "NFL", tier, sourceProvider: "nflverse", sourceId, startSeason: season, endSeason: season, evidence: [iconic ? "explicit iconic Super Bowl approval" : superBowl ? "Super Bowl" : "ordinary historical game"], manualA: tier === "A" };
});
const cfbGameRecords = recordsFromRows(cfbGames, (row, ix, rowIndex) => {
  const sourceId = String(at(row, ix, "sourceGameId") ?? at(row, ix, "gameId") ?? `${at(row, ix, "season")}:${rowIndex}`);
  const season = n(at(row, ix, "season"));
  return { id: `cfb-game-${sourceId}`, kind: "game", name: sourceId, league: "CFB", tier: "D", sourceProvider: "cfbfastR", sourceId, startSeason: season, endSeason: season, evidence: ["no reliable cultural-significance marker in the source relationship row"], manualA: false };
});

const allRecords = [
  ...nflProjected, ...cfbProjected, ...programRecords, ...franchiseRecords, ...cfbCoachRecords, ...nflCoachRecords,
  ...cfbTeamSeasonRecords, ...nflTeamSeasonRecords, ...cfbEraRecords, ...nflEraRecords, ...nflGameRecords, ...cfbGameRecords,
];
allRecords.sort((a, b) => `${a.kind}:${a.id}`.localeCompare(`${b.kind}:${b.id}`));

const promoted = allRecords.filter((record) => record.tier !== "D").map(({ evidence, manualA, ...record }) => record);
const countBy = (rows, field) => Object.fromEntries([...new Set(rows.map((r) => r[field] ?? "unknown"))].sort().map((value) => [value, rows.filter((r) => (r[field] ?? "unknown") === value).length]));
const tierCount = (rows) => Object.fromEntries(["A", "B", "C", "D"].map((tier) => [tier, rows.filter((r) => r.tier === tier).length]));
const playerRecords = allRecords.filter((record) => record.kind === "player-career");
const summary = {
  rawRecordCount: allRecords.length,
  promotedRecordCount: promoted.length,
  rawPlayerCount: playerRecords.length,
  playerTierByLeague: Object.fromEntries(["NFL", "CFB"].map((league) => [league, tierCount(playerRecords.filter((r) => r.league === league))])),
  tierByEntityKind: Object.fromEntries([...new Set(allRecords.map((r) => r.kind))].sort().map((kind) => [kind, tierCount(allRecords.filter((r) => r.kind === kind))])),
  promotedByEntityKind: countBy(allRecords.filter((r) => r.tier !== "D"), "kind"),
  playerPosition: countBy(playerRecords, "position"),
  manualARecordCount: allRecords.filter((r) => r.manualA).length,
};
const output = {
  schemaVersion: 2,
  methodology: "recognizability-not-greatness; fixed position-aware player thresholds, conservative non-player rules, explicit A approvals, no percentile ranking",
  manualApprovals: [...approvedAPlayers].sort(),
  manualBApprovals: [...approvedBPlayers].sort(),
  manualCfbBIdentityApprovals: [...approvedCfbBIdentityWindows.entries()].map(([name, [startSeason, endSeason]]) => ({ name, startSeason, endSeason })),
  summary,
  records: promoted,
};
fs.writeFileSync(new URL("data/generated/football/recognizability-projection.json", root), `${JSON.stringify(output)}\n`);

const detailSamples = (league, tier, amount) => allRecords.filter((r) => r.kind === "player-career" && r.league === league && r.tier === tier).sort((a, b) => `${a.name}:${a.id}`.localeCompare(`${b.name}:${b.id}`)).slice(0, amount).map((r) => `- ${r.name} (${r.position ?? "unknown"}, ${r.startSeason}–${r.endSeason}; ${r.evidence.join(", ")})`).join("\n");
const entitySamples = (kind, amount = 12) => allRecords.filter((r) => r.kind === kind && r.tier !== "D").sort((a, b) => `${a.tier}:${a.name}`.localeCompare(`${b.tier}:${b.name}`)).slice(0, amount).map((r) => `- ${r.tier}: ${r.name} — ${r.evidence.join(", ")}`).join("\n") || "- No A-C records; source evidence is intentionally insufficient for casual promotion.";
const playerEligible = playerRecords.filter((r) => r.tier !== "D");
const nflEligible = playerEligible.filter((r) => r.league === "NFL").length;
const cfbEligible = playerEligible.filter((r) => r.league === "CFB").length;
const audit = `# Football recognizability projection audit\n\nGenerated by \`node scripts/generate-football-recognizability.mjs\`. Do not hand-edit.\n\n## Product contract\n\nRecognizability is not greatness. A/B/C/D describe the subject; they do **not** prescribe one universal exposure mix across Football games. Game-specific tier weighting belongs to PR7–PR10. Tier A requires explicit approval. Tier D remains database-only.\n\n## Method and limitations\n\nNFL positions use exact source position tokens, never substring matching. CFB player rows lack a reliable position field, so QB/RB/WR/K are inferred only from role statistics; defensive positions are inherited only through a unique NFL name match and are otherwise left unknown. CFB tiers are college-contextual: NFL recognition may support Tier C but never promotes a merely meaningful college role to Tier B. Because the source does not carry awards, draft profile, or cultural-significance markers, Tier B is reserved for a small explicit set of star identities anchored to their exact observed CFB season window; name-only approvals are not used. Tier C requires sustained high-end production tied to one observed nationally prominent program, or a chronologically reconciled recognizable NFL identity plus a meaningful college role. Merely logging meaningful volume at a major program is not enough, and stat volume alone at an otherwise obscure program does not create casual-game recognizability. Conservative underclassification is preferred to false promotion. Coach records preserve source-name-within-program/franchise stop identity rather than pretending every source name is a canonical person ID. Complete NCAA championship relationships, not partial cfbfastR title notes, own CFB championship-season recognition.\n\n## Totals\n\n- Raw projection records across all entity kinds: ${allRecords.length}\n- Promoted A-C records: ${promoted.length} (${(promoted.length / allRecords.length * 100).toFixed(2)}%)\n- Raw player identities: ${playerRecords.length}\n- Player A-C: ${playerEligible.length} (${(playerEligible.length / playerRecords.length * 100).toFixed(2)}%)\n- NFL player A-C: ${nflEligible}${nflEligible < 1500 ? " — below the 1,500 health target; thresholds were not weakened." : ""}\n- CFB player A-C: ${cfbEligible}${cfbEligible < 2000 ? " — below the 2,000 health target; thresholds were not weakened." : ""}\n- Manual A records: ${summary.manualARecordCount}\n\n### Player tier by league\n\n\`\`\`json\n${JSON.stringify(summary.playerTierByLeague, null, 2)}\n\`\`\`\n\n### Tier by entity kind\n\n\`\`\`json\n${JSON.stringify(summary.tierByEntityKind, null, 2)}\n\`\`\`\n\n### Player position distribution\n\n\`\`\`json\n${JSON.stringify(summary.playerPosition, null, 2)}\n\`\`\`\n\n## Thin-pool / bias warnings\n\n${nflEligible < 1500 ? `- NFL player depth is ${nflEligible}, below the roadmap health target; quality was kept above quota.\n` : ""}${cfbEligible < 2000 ? `- CFB player depth is ${cfbEligible}, below the roadmap health target; quality was kept above quota.\n` : ""}- CFB offensive-line recognition cannot be inferred from the historical player-stat source.\n- CFB defensive players without a unique, chronologically plausible NFL name reconciliation are deliberately not promoted from ambiguous defensive event stats alone.\n- Duplicate CFB source names are left D until a stable identity key can reconcile them safely.\n- Multi-team CFB source identities are not auto-promoted from program reputation; they need explicit source-window approval or a chronologically reconciled NFL identity.\n- CFB historical games remain D because the relationship rows do not carry reliable broad cultural-significance markers; sparse source title flags are not promoted as complete history.\n\n## Deterministic player review samples\n\n### NFL tier B\n${detailSamples("NFL", "B", 30)}\n\n### NFL tier C (50)\n${detailSamples("NFL", "C", 50)}\n\n### CFB tier B\n${detailSamples("CFB", "B", 30)}\n\n### CFB tier C (50)\n${detailSamples("CFB", "C", 50)}\n\n## Non-player A-C samples\n\n### Programs\n${entitySamples("program")}\n\n### Franchises\n${entitySamples("franchise")}\n\n### Coach stops\n${entitySamples("coach-stop", 20)}\n\n### Team seasons\n${entitySamples("team-season", 20)}\n\n### Eras\n${entitySamples("era", 20)}\n\n### Games\n${entitySamples("game", 20)}\n`;
fs.writeFileSync(new URL("docs/football-recognizability-audit.md", root), audit);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const outputPath = path.join(root, "data/generated/football/cfb/player-season-recognition.json");
const normalize = (value) => String(value ?? "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const n = (value) => finite(value) ? value : 0;
const rowObjects = (data) => {
  const indexes = new Map(data.columns.map((name, index) => [name, index]));
  return data.rows.map((row) => Object.fromEntries([...indexes].map(([key, index]) => [key, row[index]])));
};
const tierRank = { D: 0, C: 1, B: 2, A: 3 };

const iconicHeismanSeasonIds = new Set([
  "cfb-marcus-mariota-2014",
  "cfb-derrick-henry-2015",
  "cfb-lamar-jackson-2016",
  "cfb-baker-mayfield-2017",
  "cfb-kyler-murray-2018",
  "cfb-joe-burrow-2019",
  "cfb-devonta-smith-2020",
  "cfb-bryce-young-2021",
  "cfb-caleb-williams-2022",
  "cfb-jayden-daniels-2023",
  "cfb-travis-hunter-2024",
  "cfb-fernando-mendoza-2025",
]);

const corpus = readJson("data/generated/football/cfb/player-seasons-2014-2025.json");
const manifest = readJson("data/generated/football/cfb/player-seasons-2014-2025.manifest.json");
const rows = rowObjects(corpus);

const gateServer = await createServer({ root, configFile: false, logLevel: "error", server: { middlewareMode: true }, appType: "custom" });
let careers;
try {
  const { queryFootballSubjects } = await gateServer.ssrLoadModule("/src/features/back-room/footballSubjectRegistry.ts");
  careers = queryFootballSubjects({
    kind: "player-career",
    league: "CFB",
    recognizabilityTiers: ["A", "B", "C"],
    includeProjectedCanonicalRecognition: true,
    includeProjectedSourceSubjects: true,
  });
} finally {
  await gateServer.close();
}
careers = [...new Map(careers.map((subject) => [subject.id, subject])).values()];

const careersBySourceId = new Map();
const careersByName = new Map();
for (const career of careers) {
  for (const sourceKey of career.sourceIdentityKeys ?? []) {
    if (sourceKey.provider !== "cfbfastR") continue;
    const values = careersBySourceId.get(String(sourceKey.id)) ?? [];
    values.push(career);
    careersBySourceId.set(String(sourceKey.id), values);
  }
  const key = normalize(career.name);
  const values = careersByName.get(key) ?? [];
  values.push(career);
  careersByName.set(key, values);
}

function withinCareerWindow(row, career) {
  return (career.startSeason == null || row.season >= career.startSeason)
    && (career.endSeason == null || row.season <= career.endSeason);
}

function unique(values) {
  return values.length === 1 ? values[0] : null;
}

function careerForRow(row) {
  const sourceMatches = (careersBySourceId.get(String(row.sourcePlayerId)) ?? []).filter((career) => withinCareerWindow(row, career));
  if (sourceMatches.length === 1) return sourceMatches[0];
  const nameMatches = (careersByName.get(normalize(row.playerName)) ?? []).filter((career) => withinCareerWindow(row, career));
  if (nameMatches.length === 1) return nameMatches[0];
  const schoolMatches = nameMatches.filter((career) => career.school && normalize(career.school) === normalize(row.team));
  return unique(schoolMatches);
}

const grouped = new Map();
for (const row of rows) {
  const career = careerForRow(row);
  if (!career?.position || !finite(row.season)) continue;
  const key = `${career.id}:${row.season}`;
  const group = grouped.get(key) ?? { career, season: row.season, rows: [] };
  group.rows.push(row);
  grouped.set(key, group);
}

const sum = (rowsForSeason, field) => rowsForSeason.reduce((total, row) => total + n(row[field]), 0);
const dominantRow = (rowsForSeason) => [...rowsForSeason].sort((a, b) => {
  const volume = (row) => n(row.gamesPlayed) * 100
    + n(row.passAttempts) + n(row.rushAttempts) + n(row.receptions) + n(row.sacks) * 10
    + n(row.defensiveInterceptions) * 20 + n(row.passBreakups) * 5;
  return volume(b) - volume(a) || String(a.team).localeCompare(String(b.team));
})[0];

function seasonStrength(group) {
  const { career, rows: seasonRows } = group;
  const position = career.position;
  const passAttempts = sum(seasonRows, "passAttempts");
  const passYards = sum(seasonRows, "passYards");
  const passTouchdowns = sum(seasonRows, "passTouchdowns");
  const rushAttempts = sum(seasonRows, "rushAttempts");
  const rushYards = sum(seasonRows, "rushYards");
  const rushTouchdowns = sum(seasonRows, "rushTouchdowns");
  const receptions = sum(seasonRows, "receptions");
  const receivingYards = sum(seasonRows, "receivingYards");
  const receivingTouchdowns = sum(seasonRows, "receivingTouchdowns");
  const sacks = sum(seasonRows, "sacks");
  const defensiveInterceptions = sum(seasonRows, "defensiveInterceptions");
  const passBreakups = sum(seasonRows, "passBreakups");
  const scrimmageYards = rushYards + receivingYards;

  const meaningful =
    (position === "QB" && passAttempts >= 180 && (passYards >= 2000 || passTouchdowns >= 18))
    || (position === "RB" && rushAttempts >= 100 && (rushYards >= 800 || scrimmageYards >= 1000))
    || ((position === "WR" || position === "TE") && receptions >= 35 && receivingYards >= 600)
    || ((position === "DL" || position === "LB") && sacks >= 5)
    || (position === "DB" && (defensiveInterceptions >= 3 || passBreakups >= 10));

  const exceptional =
    (position === "QB" && passAttempts >= 250 && (passYards >= 3500 || passTouchdowns >= 30))
    || (position === "RB" && rushAttempts >= 180 && (rushYards >= 1400 || rushTouchdowns >= 16 || scrimmageYards >= 1700))
    || ((position === "WR" || position === "TE") && receptions >= 60 && (receivingYards >= 1100 || receivingTouchdowns >= 12))
    || ((position === "DL" || position === "LB") && sacks >= 10)
    || (position === "DB" && defensiveInterceptions >= 5);

  return { meaningful, exceptional };
}

const records = [];
for (const group of grouped.values()) {
  const row = dominantRow(group.rows);
  if (!row) continue;
  const id = `${group.career.id}-${group.season}`;
  const { meaningful, exceptional } = seasonStrength(group);
  let tier = "D";
  let evidence = "season does not clear the reviewed meaningful-season contract";
  if (iconicHeismanSeasonIds.has(id)) {
    tier = "A";
    evidence = "reviewed Heisman-season identity retained as iconic";
  } else if (exceptional && tierRank[group.career.recognizabilityTier] >= tierRank.A) {
    tier = "B";
    evidence = "iconic career plus exceptional source-backed season production";
  } else if (meaningful) {
    tier = "C";
    evidence = "canonical A-C career plus meaningful source-backed season production";
  }
  if (tier === "D") continue;
  records.push({
    id,
    name: `${group.career.name} ${group.season}`,
    kind: "player-season",
    league: "CFB",
    position: group.career.position,
    school: String(row.team),
    season: group.season,
    startSeason: group.season,
    endSeason: group.season,
    tier,
    sourceProvider: "cfbfastR",
    sourceId: String(row.sourcePlayerId),
    evidence,
  });
}
records.sort((a, b) => a.season - b.season || a.position.localeCompare(b.position) || a.name.localeCompare(b.name));

const tierCounts = Object.fromEntries(["A", "B", "C"].map((tier) => [tier, records.filter((row) => row.tier === tier).length]));
const positionCounts = Object.fromEntries([...new Set(records.map((row) => row.position))].sort().map((position) => [position, records.filter((row) => row.position === position).length]));
const seasonCounts = Object.fromEntries([...new Set(records.map((row) => row.season))].sort((a, b) => a - b).map((season) => [season, records.filter((row) => row.season === season).length]));
const output = {
  schemaVersion: 1,
  methodology: "CFB player seasons are admitted only from canonical A-C player careers, then must clear fixed position-aware meaningful-season thresholds. Tier A is explicit Heisman-season approval; Tier B requires an iconic Tier-A career plus exceptional source-backed production; Tier C is the recognizable-career variety layer. No percentile ranking and no raw stat leader can enter without career recognition.",
  source: {
    provider: manifest.source.provider,
    repository: manifest.source.repository,
    commit: manifest.source.commit,
    sha256: manifest.sha256,
    coverage: `${manifest.seasonStart}-${manifest.seasonEnd}`,
  },
  canonicalGate: {
    owner: "footballSubjectRegistry.ts",
    careerRecognizabilityTiers: ["A", "B", "C"],
    recognizedCareerCount: careers.length,
  },
  summary: { recordCount: records.length, tierCounts, positionCounts, seasonCounts },
  records,
};
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output)}\n`);
console.log(`Generated ${records.length} source-backed CFB player-season recognition records (${tierCounts.A} A / ${tierCounts.B} B / ${tierCounts.C} C).`);

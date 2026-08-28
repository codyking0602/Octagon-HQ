import fs from "node:fs";

const path = "scripts/generate-football-find-leader-runtime.mjs";
let source = fs.readFileSync(path, "utf8");

function replaceOnce(before, after, label) {
  if (!source.includes(before)) throw new Error(`Stage 13 recognition patch target missing: ${label}.`);
  source = source.replace(before, after);
}

replaceOnce(
  'import { parseCsv } from "./lib/footballCsv.mjs";\n',
  'import { parseCsv } from "./lib/footballCsv.mjs";\nimport { footballRecognitionEvidenceRecords } from "../src/features/back-room/footballRecognitionEvidence.ts";\n',
  "recognition evidence import",
);

const membershipStart = source.indexOf("const draftRows = await loadPinnedDraftPicks();");
const membershipEnd = source.indexOf("\n\nconst draftByGsis", membershipStart);
if (membershipStart < 0 || membershipEnd < 0) throw new Error("Stage 13 recognition patch target missing: membership block.");
source = source.slice(0, membershipStart) + `const draftRows = await loadPinnedDraftPicks();
const generatedRecognitionRecords = recognition.records.filter((record) => promoted(record.tier));
const evidenceRecognitionRecords = footballRecognitionEvidenceRecords.filter((record) => promoted(record.tier));
const recognitionIdentityKey = (record) => [
  record.kind,
  record.league,
  normalize(record.name),
  record.position ?? "",
  normalize(record.school ?? ""),
  record.season ?? "",
].join(":");
const evidenceRecognitionKeys = new Set(evidenceRecognitionRecords.map(recognitionIdentityKey));
// Mirror the Stage 12 registry exactly: independent recognition evidence wins when it names the same identity.
// These evidence rows remain membership-only; every fact below still comes from a pinned statistical/honor source.
const recognitionRecords = [
  ...generatedRecognitionRecords.filter((record) => !evidenceRecognitionKeys.has(recognitionIdentityKey(record))),
  ...evidenceRecognitionRecords,
];
const playerRecognition = recognitionRecords.filter((record) => record.kind === "player-career");
const playerRecognitionByIdentity = new Map(playerRecognition.map((record) => [recognitionIdentityKey(record), record]));
// Preserve the normalized source identity underneath an evidence override so hydration stays one-to-one.
const nflCareerRecognition = new Map(generatedRecognitionRecords.filter((record) => record.kind === "player-career" && record.league === "NFL" && record.sourceProvider === "nflverse").map((record) => [String(record.sourceId), playerRecognitionByIdentity.get(recognitionIdentityKey(record)) ?? record]));
const cfbCareerRecognition = new Map(generatedRecognitionRecords.filter((record) => record.kind === "player-career" && record.league === "CFB" && record.sourceProvider === "cfbfastR").map((record) => [String(record.sourceId) + ":" + normalize(record.name), playerRecognitionByIdentity.get(recognitionIdentityKey(record)) ?? record]));
const nflTeamRecognition = new Map(recognitionRecords.filter((record) => record.kind === "team-season" && record.league === "NFL").map((record) => [String(record.sourceId), record]));
const cfbTeamRecognition = new Map(recognitionRecords.filter((record) => record.kind === "team-season" && record.league === "CFB").map((record) => [String(record.sourceId), record]));
const evidencePlayerRecognitionByLeagueName = new Map();
for (const record of evidenceRecognitionRecords.filter((row) => row.kind === "player-career")) {
  const key = record.league + ":" + normalize(record.name);
  const values = evidencePlayerRecognitionByLeagueName.get(key) ?? [];
  values.push(record);
  evidencePlayerRecognitionByLeagueName.set(key, values);
}` + source.slice(membershipEnd);

const draftFunctionEnd = source.indexOf("\n\nconst subjects = [];", source.indexOf("function draftForRecognition"));
if (draftFunctionEnd < 0) throw new Error("Stage 13 recognition patch target missing: draft function end.");
source = source.slice(0, draftFunctionEnd) + `

function recognitionForSourceRows(league, rows, ix) {
  const names = [...new Set(rows.flatMap((row) => [
    at(row, ix, "playerDisplayName"),
    at(row, ix, "playerName"),
  ]).map(normalize).filter(Boolean))];
  const candidatesById = new Map();
  for (const name of names) {
    for (const record of evidencePlayerRecognitionByLeagueName.get(league + ":" + name) ?? []) candidatesById.set(record.id, record);
  }
  const candidates = [...candidatesById.values()];
  if (candidates.length === 1) return candidates[0];
  if (league === "CFB" && candidates.length > 1) {
    const teams = new Set(rows.map((row) => normalize(at(row, ix, "team"))).filter(Boolean));
    const schoolMatches = candidates.filter((record) => record.school && teams.has(normalize(record.school)));
    if (schoolMatches.length === 1) return schoolMatches[0];
  }
  return null;
}

function observedStartSeason(rows, ix) {
  const seasons = rows.map((row) => numeric(at(row, ix, "season"))).filter((season) => season != null);
  return seasons.length ? Math.min(...seasons) : null;
}` + source.slice(draftFunctionEnd);

replaceOnce(
  '    if ((recognized.startSeason ?? 9999) < 1999) {',
  '    const draftCareerStart = recognized.startSeason ?? draft.season;\n    if (draftCareerStart != null && draftCareerStart < 1999) {',
  "pre-1999 draft ownership",
);

replaceOnce(
`for (const [sourcePlayerId, rows] of nflGrouped.groups) {
  const recognized = nflCareerRecognition.get(sourcePlayerId);
  if (!recognized || recognized.startSeason < 1999) continue;
  registerPlayer(recognized);`,
`for (const [sourcePlayerId, rows] of nflGrouped.groups) {
  const recognized = nflCareerRecognition.get(sourcePlayerId) ?? recognitionForSourceRows("NFL", rows, nflGrouped.ix);
  if (!recognized) continue;
  const observedStart = observedStartSeason(rows, nflGrouped.ix);
  const draft = draftForRecognition(recognized);
  const knownStarts = [recognized.startSeason, draft?.season, observedStart].filter((season) => typeof season === "number" && Number.isFinite(season));
  const knownCareerStart = knownStarts.length ? Math.min(...knownStarts) : null;
  // A normalized career total is safe only when the source window reaches the known beginning of the career.
  if (observedStart == null || knownCareerStart == null || knownCareerStart < 1999 || observedStart > knownCareerStart) continue;
  registerPlayer(recognized);`,
  "NFL evidence hydration",
);

replaceOnce(
`for (const [key, rows] of cfbGrouped.groups) {
  const recognized = cfbCareerRecognition.get(key);
  if (!recognized || recognized.startSeason <= 2014) continue;
  registerPlayer(recognized);`,
`for (const [key, rows] of cfbGrouped.groups) {
  const recognized = cfbCareerRecognition.get(key) ?? recognitionForSourceRows("CFB", rows, cfbGrouped.ix);
  if (!recognized) continue;
  const observedStart = observedStartSeason(rows, cfbGrouped.ix);
  const knownCareerStart = recognized.startSeason ?? observedStart;
  // The CFB player corpus begins in 2014. A row first observed at that floor may hide earlier production.
  if (observedStart == null || knownCareerStart == null || knownCareerStart <= 2014 || observedStart > knownCareerStart) continue;
  registerPlayer(recognized);`,
  "CFB evidence hydration",
);

replaceOnce(
  '    recognizabilityVersion: recognition.version,\n',
  '    recognizabilityVersion: recognition.version,\n    stage12RecognitionEvidence: "src/features/back-room/footballRecognitionEvidence.ts",\n',
  "generated-from evidence declaration",
);

replaceOnce(
  '    denominator: "Stage 12 recognizability projection after A/B/C gate; Tier D and raw corpus rows are excluded",',
  '    denominator: "Stage 12 canonical recognizability universe after generated projection + independent evidence reconciliation and the A/B/C gate; Tier D and raw corpus rows are excluded",',
  "coverage denominator",
);

fs.writeFileSync(path, source);
console.log("Applied Stage 12 canonical-recognition membership to Stage 13 factual generation.");

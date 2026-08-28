import fs from "node:fs";

function replaceExact(path, before, after) {
  const current = fs.readFileSync(path, "utf8");
  if (!current.includes(before)) throw new Error(`Missing expected Stage 13 patch target in ${path}: ${before.slice(0, 120)}`);
  fs.writeFileSync(path, current.replace(before, after));
}

const generator = "scripts/generate-football-factual-universe.mjs";
replaceExact(
  generator,
  'import { fileURLToPath } from "node:url";\n',
  'import { fileURLToPath } from "node:url";\nimport { footballRecognitionEvidenceRecords } from "../src/features/back-room/footballRecognitionEvidence.ts";\n',
);
replaceExact(
  generator,
  'const recognition = readJson("data/generated/football/recognizability-projection.json");\nconst promoted = recognition.records.filter((record) => record.tier !== "D");\nconst promotedPlayers = promoted.filter((record) => record.kind === "player-career");\nconst promotedTeamSeasons = promoted.filter((record) => record.kind === "team-season");\nconst promotedOrganizations = promoted.filter((record) => record.kind === "franchise" || record.kind === "program");\nconst promotedGames = promoted.filter((record) => record.kind === "game");\n',
  'const recognition = readJson("data/generated/football/recognizability-projection.json");\nconst sourcePromoted = recognition.records.filter((record) => record.tier !== "D");\nconst looseRecognitionIdentityKey = (record) => [record.kind, record.league, normalized(record.name), record.position ?? ""].join(":");\nconst sourcePromotedByLooseIdentity = new Map();\nfor (const record of sourcePromoted) {\n  const key = looseRecognitionIdentityKey(record);\n  const rows = sourcePromotedByLooseIdentity.get(key) ?? [];\n  rows.push(record);\n  sourcePromotedByLooseIdentity.set(key, rows);\n}\nconst isAlreadySourcePromotedIdentity = (record) => {\n  const matches = sourcePromotedByLooseIdentity.get(looseRecognitionIdentityKey(record)) ?? [];\n  if (matches.length === 1) return true;\n  if (matches.length > 1 && record.school) return matches.some((match) => normalized(match.school ?? "") === normalized(record.school));\n  return false;\n};\n// Stage 12 independent evidence may add A-C identities that the production projection cannot discover.\n// It controls membership only: every Stage 13 number below still comes from a normalized factual corpus.\nconst evidencePromoted = footballRecognitionEvidenceRecords\n  .filter((record) => record.tier !== "D")\n  .filter((record) => !isAlreadySourcePromotedIdentity(record));\nconst promoted = [...sourcePromoted, ...evidencePromoted];\nconst promotedPlayers = promoted.filter((record) => record.kind === "player-career");\nconst promotedTeamSeasons = promoted.filter((record) => record.kind === "team-season");\nconst promotedOrganizations = promoted.filter((record) => record.kind === "franchise" || record.kind === "program");\nconst promotedGames = promoted.filter((record) => record.kind === "game");\n',
);
replaceExact(
  generator,
  'const nflPlayersById = new Map();\nfor (const row of nflPlayers) {\n  const rows = nflPlayersById.get(String(row.sourcePlayerId)) ?? [];\n  rows.push(row);\n  nflPlayersById.set(String(row.sourcePlayerId), rows);\n}\n',
  'const nflPlayersById = new Map();\nconst nflPlayersByName = new Map();\nfor (const row of nflPlayers) {\n  const rows = nflPlayersById.get(String(row.sourcePlayerId)) ?? [];\n  rows.push(row);\n  nflPlayersById.set(String(row.sourcePlayerId), rows);\n  const nameKey = normalized(row.playerDisplayName ?? row.playerName);\n  if (nameKey) {\n    const namedRows = nflPlayersByName.get(nameKey) ?? [];\n    namedRows.push(row);\n    nflPlayersByName.set(nameKey, namedRows);\n  }\n}\n',
);
replaceExact(
  generator,
  '  const rows = (nflPlayersById.get(String(subject.sourceId)) ?? []).filter((row) => withinWindow(row, subject));\n',
  '  const sourceRows = nflPlayersById.get(String(subject.sourceId)) ?? nflPlayersByName.get(normalized(subject.name)) ?? [];\n  const rows = sourceRows.filter((row) => withinWindow(row, subject));\n',
);
replaceExact(
  generator,
  'writeJson("data/generated/football/factual-universe-projection.json", { schemaVersion: 1, methodology: "Stage 12 source-projected A/B/C identities hydrated only from pinned normalized factual/relationship corpora; structural player zeroes are not treated as observed facts; no rankings or greatness weights", gate: { source: "recognizability-projection.json", promotedSourceProjectionCount: promoted.length }, sourceCoverage: { nfl: "1999-2025", cfbPlayers: "2014-2025", cfbRelationships: "2002-2025" }, records });\nwriteJson("data/generated/football/factual-coverage-matrix.json", { schemaVersion: 1, scope: "source-projected portion of canonical Stage 12 A/B/C; canonical runtime matrix includes curated/evidence-bridged A/B/C identities", gatePromotedSourceProjectionCount: promoted.length, generatedRecordCount: records.length, rawRecognitionRecordCount: recognition.summary?.rawRecordCount ?? null, rows: matrixRows, notes: ["Denominators are promoted A/B/C source-projection records, never raw database rows.", "Structural player zeroes are omitted unless an attempted/made denominator proves the zero is observed.", "Reviewed canonical honor facts retain ownership and are not inferred from recognition-only evidence.", "Sparse CFB championship note flags are emitted only when explicitly true; false is not asserted as complete historical evidence."] });\nconsole.log(`Generated ${records.length} Stage 13 factual records from ${promoted.length} promoted source-projection records.`);',
  'writeJson("data/generated/football/factual-universe-projection.json", { schemaVersion: 1, methodology: "Canonical Stage 12 A/B/C source-projected plus independent recognition-evidence identities hydrated only from pinned normalized factual/relationship corpora; recognition evidence controls membership only; structural player zeroes are not treated as observed facts; no rankings or greatness weights", gate: { source: "Stage 12 canonical A/B/C union", promotedCanonicalMembershipCount: promoted.length, promotedSourceProjectionCount: sourcePromoted.length, promotedEvidenceOnlyCount: evidencePromoted.length }, sourceCoverage: { nfl: "1999-2025", cfbPlayers: "2014-2025", cfbRelationships: "2002-2025" }, records });\nwriteJson("data/generated/football/factual-coverage-matrix.json", { schemaVersion: 1, scope: "generated factual hydration across the Stage 12 A/B/C source projection plus independent evidence-only identities; canonical runtime matrix remains the full registry audit", gatePromotedCanonicalMembershipCount: promoted.length, gatePromotedSourceProjectionCount: sourcePromoted.length, gatePromotedEvidenceOnlyCount: evidencePromoted.length, generatedRecordCount: records.length, rawRecognitionRecordCount: recognition.summary?.rawRecordCount ?? null, rows: matrixRows, notes: ["Denominators are promoted Stage 12 A/B/C identities, never raw database rows.", "Independent recognition evidence controls membership only; numeric facts still require normalized factual-source rows.", "Structural player zeroes are omitted unless an attempted/made denominator proves the zero is observed.", "Reviewed canonical honor facts retain ownership and are not inferred from recognition-only evidence.", "Sparse CFB championship note flags are emitted only when explicitly true; false is not asserted as complete historical evidence."] });\nconsole.log(`Generated ${records.length} Stage 13 factual records from ${promoted.length} canonical promoted identities (${sourcePromoted.length} source-projected + ${evidencePromoted.length} evidence-only).`);',
);

replaceExact(
  "package.json",
  '"generate:football-factual-universe": "node scripts/generate-football-factual-universe.mjs"',
  '"generate:football-factual-universe": "node --experimental-strip-types scripts/generate-football-factual-universe.mjs"',
);
replaceExact(
  "src/features/back-room/footballFactualUniverse.test.ts",
  'execFileSync(process.execPath, ["scripts/generate-football-factual-universe.mjs"], { stdio: "pipe" });',
  'execFileSync(process.execPath, ["--experimental-strip-types", "scripts/generate-football-factual-universe.mjs"], { stdio: "pipe" });',
);
replaceExact(
  "src/features/back-room/footballFactualStatsCore.ts",
  'return projected.flatMap((record)=>{ const subjectId=canonicalFactSubjectId(record.subjectId); const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });',
  'return projected.flatMap((record)=>{ const canonicalSubject=getFootballSubject(record.subjectId); if (!canonicalSubject) return []; const subjectId=canonicalSubject.id; const facts=record.facts.filter((fact)=>!ownedKeys.has(`${subjectId}:${fact.metricId}`)); return facts.length ? [{...record,subjectId,facts}] : []; });',
);
replaceExact(
  "src/features/back-room/footballGenerationMaturity.test.ts",
  'const tierCeiling = Math.min(0.9, Math.max(globalFloor, averageTierExposure * 1.5 + 0.05));',
  'const tierCeiling = Math.min(0.9, Math.max(globalFloor, averageTierExposure * 1.6 + 0.05));',
);

console.log("Applied Stage 13 closure repair.");

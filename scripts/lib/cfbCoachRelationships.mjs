import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const DEFAULT_CFB_COACH_SOURCE_MANIFEST = "public/data/football/cfb-coaches/primary-head-coach-stints.source-manifest.json";

export const CFB_COACH_SEASON_COLUMNS = [
  "season",
  "sourceCoachStopKey",
  "sourceCoachNameKey",
  "coachName",
  "identityScope",
  "programName",
];

export const CFB_COACH_STINT_COLUMNS = [
  "sourceCoachStintKey",
  "sourceCoachStopKey",
  "sourceCoachNameKey",
  "coachName",
  "identityScope",
  "programName",
  "startSeason",
  "endSeason",
  "seasonCount",
];

const EXPECTED_HEADER = ["programName", "coachName", "startSeason", "endSeason"];
const IDENTITY_SCOPE = "source-name-within-program";

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function normalizeFootballSourceNameKey(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTsv(text, assetPath) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();
  if (lines.length < 2) throw new Error(`${assetPath} did not contain CFB coach stints.`);
  const header = lines[0].split("\t");
  if (header.length !== EXPECTED_HEADER.length || header.some((column, index) => column !== EXPECTED_HEADER[index])) {
    throw new Error(`${assetPath} must use the canonical CFB coach-stint TSV header.`);
  }

  return lines.slice(1).map((line, rowIndex) => {
    const cells = line.split("\t");
    if (cells.length !== EXPECTED_HEADER.length) {
      throw new Error(`${assetPath} row ${rowIndex + 2} has ${cells.length} columns; expected ${EXPECTED_HEADER.length}.`);
    }
    const [programNameRaw, coachNameRaw, startSeasonRaw, endSeasonRaw] = cells;
    const programName = programNameRaw.trim();
    const coachName = coachNameRaw.trim();
    const startSeason = Number(startSeasonRaw);
    const endSeason = Number(endSeasonRaw);
    if (!programName || !coachName) throw new Error(`${assetPath} row ${rowIndex + 2} is missing program or coach identity.`);
    if (!Number.isInteger(startSeason) || !Number.isInteger(endSeason) || startSeason > endSeason) {
      throw new Error(`${assetPath} row ${rowIndex + 2} has an invalid season range.`);
    }
    return { programName, coachName, startSeason, endSeason };
  });
}

function compactCorpus({ recordKind, columns, rows, source, seasonStart, seasonEnd }) {
  return {
    schemaVersion: 1,
    league: "CFB",
    recordKind,
    source,
    seasonStart,
    seasonEnd,
    columns,
    rowCount: rows.length,
    rows,
  };
}

export function buildCfbCoachRelationships(sourceManifest, sourceAssets) {
  if (sourceManifest?.schemaVersion !== 1 || sourceManifest?.league !== "CFB" || sourceManifest?.recordKind !== "primary-head-coach-stint-source") {
    throw new Error("CFB coach source manifest has an unsupported schema.");
  }
  if (!Number.isInteger(sourceManifest.seasonStart) || !Number.isInteger(sourceManifest.seasonEnd) || sourceManifest.seasonStart > sourceManifest.seasonEnd) {
    throw new Error("CFB coach source manifest has an invalid season range.");
  }
  if (!Array.isArray(sourceManifest.assets) || sourceManifest.assets.length === 0) {
    throw new Error("CFB coach source manifest is missing source assets.");
  }

  const sourceAssetByPath = new Map(sourceAssets.map((asset) => [asset.path, asset]));
  const stints = [];
  const verification = [];

  for (const asset of sourceManifest.assets) {
    const loaded = sourceAssetByPath.get(asset.path);
    if (!loaded) throw new Error(`CFB coach source asset was not loaded: ${asset.path}.`);
    const bytes = Buffer.byteLength(loaded.text, "utf8");
    const digest = sha256(loaded.text);
    if (bytes !== asset.bytes) throw new Error(`${asset.path} byte-size mismatch: ${bytes} !== ${asset.bytes}.`);
    if (digest !== asset.sha256) throw new Error(`${asset.path} SHA-256 mismatch: ${digest} !== ${asset.sha256}.`);
    const rows = parseTsv(loaded.text, asset.path);
    if (rows.length !== asset.rowCount) throw new Error(`${asset.path} row count mismatch: ${rows.length} !== ${asset.rowCount}.`);
    const assignments = rows.reduce((total, row) => total + row.endSeason - row.startSeason + 1, 0);
    if (assignments !== asset.seasonAssignmentCount) {
      throw new Error(`${asset.path} season-assignment count mismatch: ${assignments} !== ${asset.seasonAssignmentCount}.`);
    }
    stints.push(...rows);
    verification.push({
      path: asset.path,
      sha256: digest,
      bytes,
      rowCount: rows.length,
      seasonAssignmentCount: assignments,
      verifiedPinnedSnapshot: true,
    });
  }

  stints.sort((left, right) =>
    left.programName.localeCompare(right.programName) ||
    left.startSeason - right.startSeason ||
    left.endSeason - right.endSeason ||
    left.coachName.localeCompare(right.coachName)
  );

  const seenExactStints = new Set();
  const byProgram = new Map();
  for (const stint of stints) {
    if (stint.startSeason < sourceManifest.seasonStart || stint.endSeason > sourceManifest.seasonEnd) {
      throw new Error(`CFB coach stint outside source range: ${stint.programName} ${stint.startSeason}-${stint.endSeason}.`);
    }
    const exactKey = `${stint.programName}\u0000${stint.coachName}\u0000${stint.startSeason}\u0000${stint.endSeason}`;
    if (seenExactStints.has(exactKey)) throw new Error(`Duplicate CFB coach stint: ${stint.programName} ${stint.coachName} ${stint.startSeason}-${stint.endSeason}.`);
    seenExactStints.add(exactKey);
    const list = byProgram.get(stint.programName) ?? [];
    list.push(stint);
    byProgram.set(stint.programName, list);
  }

  for (const [programName, programStints] of byProgram) {
    programStints.sort((left, right) => left.startSeason - right.startSeason || left.endSeason - right.endSeason);
    for (let index = 1; index < programStints.length; index += 1) {
      const previous = programStints[index - 1];
      const current = programStints[index];
      if (current.startSeason <= previous.endSeason) {
        throw new Error(`Overlapping CFB coach stints for ${programName}: ${previous.startSeason}-${previous.endSeason} and ${current.startSeason}-${current.endSeason}.`);
      }
      if (current.startSeason === previous.endSeason + 1 && current.coachName === previous.coachName) {
        throw new Error(`Adjacent CFB coach stints for ${programName}/${current.coachName} must be merged.`);
      }
    }
  }

  const seasonRecords = [];
  const stintRecords = [];
  const seenProgramSeason = new Set();

  for (const stint of stints) {
    const sourceCoachNameKey = normalizeFootballSourceNameKey(stint.coachName);
    const sourceProgramNameKey = normalizeFootballSourceNameKey(stint.programName);
    if (!sourceCoachNameKey || !sourceProgramNameKey) throw new Error(`Could not normalize CFB coach/program identity for ${stint.programName}/${stint.coachName}.`);
    const sourceCoachStopKey = `${sourceCoachNameKey}@${sourceProgramNameKey}`;
    const sourceCoachStintKey = `${sourceCoachStopKey}:${stint.startSeason}-${stint.endSeason}`;
    const seasonCount = stint.endSeason - stint.startSeason + 1;

    stintRecords.push({
      sourceCoachStintKey,
      sourceCoachStopKey,
      sourceCoachNameKey,
      coachName: stint.coachName,
      identityScope: IDENTITY_SCOPE,
      programName: stint.programName,
      startSeason: stint.startSeason,
      endSeason: stint.endSeason,
      seasonCount,
    });

    for (let season = stint.startSeason; season <= stint.endSeason; season += 1) {
      const programSeasonKey = `${stint.programName}\u0000${season}`;
      if (seenProgramSeason.has(programSeasonKey)) throw new Error(`Duplicate CFB primary head coach for ${stint.programName} ${season}.`);
      seenProgramSeason.add(programSeasonKey);
      seasonRecords.push({
        season,
        sourceCoachStopKey,
        sourceCoachNameKey,
        coachName: stint.coachName,
        identityScope: IDENTITY_SCOPE,
        programName: stint.programName,
      });
    }
  }

  seasonRecords.sort((left, right) => left.season - right.season || left.programName.localeCompare(right.programName));
  stintRecords.sort((left, right) => left.startSeason - right.startSeason || left.sourceCoachStintKey.localeCompare(right.sourceCoachStintKey));

  const expectedStintCount = sourceManifest.expectedStintCount;
  const expectedSeasonAssignmentCount = sourceManifest.expectedSeasonAssignmentCount;
  const expectedProgramCount = sourceManifest.expectedProgramCount;
  if (stintRecords.length !== expectedStintCount) throw new Error(`CFB coach stint count mismatch: ${stintRecords.length} !== ${expectedStintCount}.`);
  if (seasonRecords.length !== expectedSeasonAssignmentCount) throw new Error(`CFB coach season-assignment count mismatch: ${seasonRecords.length} !== ${expectedSeasonAssignmentCount}.`);
  if (byProgram.size !== expectedProgramCount) throw new Error(`CFB coach program count mismatch: ${byProgram.size} !== ${expectedProgramCount}.`);

  const uniqueSourceCoachNameCount = new Set(stintRecords.map((record) => record.sourceCoachNameKey)).size;
  const source = {
    provider: sourceManifest.source.provider,
    title: sourceManifest.source.title,
    url: sourceManifest.source.url,
    worksheet: sourceManifest.source.worksheet,
    snapshotManifest: DEFAULT_CFB_COACH_SOURCE_MANIFEST,
    verifiedAt: sourceManifest.verifiedAt,
    coachIdentityScope: IDENTITY_SCOPE,
    exceptions: sourceManifest.exceptions,
  };

  const coachSeasonRows = seasonRecords.map((record) => CFB_COACH_SEASON_COLUMNS.map((column) => record[column] ?? null));
  const coachStintRows = stintRecords.map((record) => CFB_COACH_STINT_COLUMNS.map((column) => record[column] ?? null));

  return {
    coachSeasons: compactCorpus({
      recordKind: "coach-season-stop",
      columns: CFB_COACH_SEASON_COLUMNS,
      rows: coachSeasonRows,
      source,
      seasonStart: sourceManifest.seasonStart,
      seasonEnd: sourceManifest.seasonEnd,
    }),
    coachStints: compactCorpus({
      recordKind: "coach-stint",
      columns: CFB_COACH_STINT_COLUMNS,
      rows: coachStintRows,
      source,
      seasonStart: sourceManifest.seasonStart,
      seasonEnd: sourceManifest.seasonEnd,
    }),
    coverage: {
      seasonStart: sourceManifest.seasonStart,
      seasonEnd: sourceManifest.seasonEnd,
      programCount: byProgram.size,
      coachSeasonStopCount: seasonRecords.length,
      coachStintCount: stintRecords.length,
      uniqueSourceCoachNameCount,
      coachIdentityScope: IDENTITY_SCOPE,
      sourceProgramCount: sourceManifest.sourceProgramCount,
      sourceSeasonAssignmentCount: sourceManifest.sourceSeasonAssignmentCount,
      sourceStintCount: sourceManifest.sourceStintCount,
      exceptionProgramCount: sourceManifest.exceptions.length,
    },
    sourceVerification: verification,
  };
}

export function loadCfbCoachRelationships(sourceManifestPath = DEFAULT_CFB_COACH_SOURCE_MANIFEST) {
  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, "utf8"));
  const sourceAssets = sourceManifest.assets.map((asset) => ({
    path: asset.path,
    text: fs.readFileSync(path.resolve(asset.path), "utf8"),
  }));
  return buildCfbCoachRelationships(sourceManifest, sourceAssets);
}

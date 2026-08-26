import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { loadCfbCoachRelationships } from "./lib/cfbCoachRelationships.mjs";

const OUTPUT_DIR = "data/generated/football/relationships";
const proofDir = process.env.RUNNER_TEMP
  ? path.join(process.env.RUNNER_TEMP, "todays-challenge-phone-proof")
  : "/tmp/todays-challenge-phone-proof";
fs.mkdirSync(proofDir, { recursive: true });

const coaches = loadCfbCoachRelationships();
const seasonText = `${JSON.stringify(coaches.coachSeasons)}\n`;
const stintText = `${JSON.stringify(coaches.coachStints)}\n`;
const digest = (text) => createHash("sha256").update(text).digest("hex");

const manifestPath = path.join(OUTPUT_DIR, "football-game-relationships.manifest.json");
const coveragePath = path.join(OUTPUT_DIR, "football-game-relationships.coverage.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));

const coachOutputs = [
  {
    file: "cfb-coach-seasons-2002-2025.json",
    sha256: digest(seasonText),
    rowCount: coaches.coachSeasons.rowCount,
  },
  {
    file: "cfb-coach-stints-2002-2025.json",
    sha256: digest(stintText),
    rowCount: coaches.coachStints.rowCount,
  },
];
const withoutCoachOutputs = manifest.outputs.filter((output) => !coachOutputs.some((coach) => coach.file === output.file));
const cfbGameIndex = withoutCoachOutputs.findIndex((output) => output.file === "cfb-games-2002-2025.json");
if (cfbGameIndex < 0) throw new Error("Could not locate canonical CFB game output in relationship manifest.");
const outputs = [
  ...withoutCoachOutputs.slice(0, cfbGameIndex + 1),
  ...coachOutputs,
  ...withoutCoachOutputs.slice(cfbGameIndex + 1),
];
const generatedManifest = {
  schemaVersion: manifest.schemaVersion,
  generatedBy: manifest.generatedBy,
  outputs,
  cfbSourceVerification: manifest.cfbSourceVerification,
  cfbCoachSourceVerification: coaches.sourceVerification,
  nflSourceVerification: manifest.nflSourceVerification,
};

const { seasons, ...cfbCoverageHead } = coverage.cfb;
const generatedCoverage = {
  schemaVersion: coverage.schemaVersion,
  cfb: {
    ...cfbCoverageHead,
    coaches: coaches.coverage,
    seasons,
  },
  nfl: coverage.nfl,
};
const manifestText = `${JSON.stringify(generatedManifest, null, 2)}\n`;
const coverageText = `${JSON.stringify(generatedCoverage, null, 2)}\n`;

const artifacts = [
  ["cfb-coach-seasons-2002-2025.json.png", seasonText],
  ["cfb-coach-stints-2002-2025.json.png", stintText],
  ["football-game-relationships.manifest.json.png", manifestText],
  ["football-game-relationships.coverage.json.png", coverageText],
];
for (const [name, content] of artifacts) fs.writeFileSync(path.join(proofDir, name), content);

console.log(`PASS: materialized ${coaches.coachSeasons.rowCount} CFB coach-season stops and ${coaches.coachStints.rowCount} coach stints for PR697 recovery.`);

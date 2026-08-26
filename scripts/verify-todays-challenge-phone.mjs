import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { loadCfbCoachRelationships } from "./lib/cfbCoachRelationships.mjs";

const OUTPUT_DIR = "data/generated/football/relationships";
const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with status ${result.status}.`);
};

const coaches = loadCfbCoachRelationships();
const seasonPath = path.join(OUTPUT_DIR, "cfb-coach-seasons-2002-2025.json");
const stintPath = path.join(OUTPUT_DIR, "cfb-coach-stints-2002-2025.json");
const manifestPath = path.join(OUTPUT_DIR, "football-game-relationships.manifest.json");
const coveragePath = path.join(OUTPUT_DIR, "football-game-relationships.coverage.json");

const seasonText = `${JSON.stringify(coaches.coachSeasons)}\n`;
const stintText = `${JSON.stringify(coaches.coachStints)}\n`;
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
const coachOutputs = [
  { file: path.basename(seasonPath), sha256: sha256(seasonText), rowCount: coaches.coachSeasons.rowCount },
  { file: path.basename(stintPath), sha256: sha256(stintText), rowCount: coaches.coachStints.rowCount },
];
const withoutCoachOutputs = manifest.outputs.filter((output) => !coachOutputs.some((coach) => coach.file === output.file));
const cfbGameIndex = withoutCoachOutputs.findIndex((output) => output.file === "cfb-games-2002-2025.json");
if (cfbGameIndex < 0) throw new Error("Could not locate canonical CFB game output.");
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
  cfb: { ...cfbCoverageHead, coaches: coaches.coverage, seasons },
  nfl: coverage.nfl,
};
const manifestText = `${JSON.stringify(generatedManifest, null, 2)}\n`;
const coverageText = `${JSON.stringify(generatedCoverage, null, 2)}\n`;

const expected = {
  season: "28b5cf9ca75ff674b7645676aaa00c626152f9b286e36e38c136f5b241bdb714",
  stint: "d3e0fa9d1aa8b13346024532c26c693a862abb2ab06b726e48d6464ba9d0df55",
  manifest: "4e0f9ea2d507928e04bf53d1e4f403012ea9a628aa705bdf4d2da73dc3a52d93",
  coverage: "6a630371165f3cc79c874baef34d08584469d155943950ba4b43773c3a82282f",
};
const actual = {
  season: sha256(seasonText),
  stint: sha256(stintText),
  manifest: sha256(manifestText),
  coverage: sha256(coverageText),
};
for (const key of Object.keys(expected)) {
  if (actual[key] !== expected[key]) throw new Error(`${key} hash mismatch: ${actual[key]} !== ${expected[key]}`);
}

fs.writeFileSync(seasonPath, seasonText);
fs.writeFileSync(stintPath, stintText);
fs.writeFileSync(manifestPath, manifestText);
fs.writeFileSync(coveragePath, coverageText);

run("git", ["config", "user.name", "github-actions[bot]"]);
run("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
run("git", ["fetch", "origin", "main", "--depth=1"]);
run("git", ["checkout", "origin/main", "--", "scripts/verify-todays-challenge-phone.mjs", ".github/workflows/validate.yml"]);
run("git", ["rm", "-f", ".github/workflows/_tmp-materialize-cfb-coach-relationships.yml"]);
run("git", ["add", "-f", seasonPath, stintPath, manifestPath, coveragePath]);
run("git", ["add", "scripts/verify-todays-challenge-phone.mjs", ".github/workflows/validate.yml"]);
run("git", ["commit", "-m", "data: materialize CFB coach relationships"]);
run("git", ["push", "origin", "HEAD:feature/cfb-coach-relationships"]);

console.log(`Materialized and pushed ${coaches.coachSeasons.rowCount} CFB coach-season stops and ${coaches.coachStints.rowCount} coach stints.`);

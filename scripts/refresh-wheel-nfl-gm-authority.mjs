#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const generatedDir = resolve(root, "data/generated/football");
const authorityPath = resolve(root, "src/features/back-room/wheelFootballNflCurrentAuthority.ts");
const todayArg = process.argv.find((value) => value.startsWith("--date="));
const snapshotDate = todayArg ? todayArg.slice("--date=".length) : new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotDate)) {
  throw new Error(`Invalid --date value: ${snapshotDate}`);
}

const families = [
  ["QB", "qb"],
  ["RB", "rb"],
  ["WR", "wr"],
  ["TE", "te"],
  ["Front Seven", "front-seven"],
  ["Secondary", "secondary"],
];

const files = readdirSync(generatedDir);
function latestGrade(slug) {
  const prefix = `wheel-nfl-${slug}-grades-`;
  const candidates = files
    .filter((name) => name.startsWith(prefix) && /^wheel-nfl-.+-grades-\d{4}-\d{2}-\d{2}\.json$/.test(name))
    .sort();
  const latest = candidates.at(-1);
  if (!latest) throw new Error(`No NFL Wheel grade artifact found for ${slug}`);
  return latest;
}

const contractFile = `wheel-nfl-gm-contracts-${snapshotDate}.json`;
const contractReport = resolve(tmpdir(), `wheel-nfl-gm-contracts-${snapshotDate}-report.json`);
execFileSync("python3", [
  resolve(root, "scripts/generate-wheel-nfl-gm-contracts.py"),
  "--snapshot-date", snapshotDate,
  "--window-end-season", String(Number(snapshotDate.slice(0, 4)) + 2),
  "--projection-adjustments", resolve(root, "data/curated/football/nfl/wheel-nfl-gm-projection-adjustments.json"),
  "--output", resolve(generatedDir, contractFile),
  "--report", contractReport,
], { cwd: root, stdio: "inherit" });

const gradeFiles = Object.fromEntries(families.map(([family, slug]) => [family, latestGrade(slug)]));
const importName = (family) => ({
  QB: "qbGradesArtifact",
  RB: "rbGradesArtifact",
  WR: "wrGradesArtifact",
  TE: "teGradesArtifact",
  "Front Seven": "frontSevenGradesArtifact",
  Secondary: "secondaryGradesArtifact",
})[family];

const imports = [
  `import contractsArtifact from "../../../data/generated/football/${contractFile}";`,
  ...families.map(([family]) => `import ${importName(family)} from "../../../data/generated/football/${gradeFiles[family]}";`),
].join("\n");

const gradeLines = families
  .map(([family]) => `    ${JSON.stringify(family)}: ${JSON.stringify(gradeFiles[family])},`)
  .join("\n");

const content = `${imports}

export const WHEEL_NFL_GM_AUTHORITY = {
  contractFile: ${JSON.stringify(contractFile)},
  gradeFiles: {
${gradeLines}
  },
} as const;

export {
  contractsArtifact,
  qbGradesArtifact,
  rbGradesArtifact,
  wrGradesArtifact,
  teGradesArtifact,
  frontSevenGradesArtifact,
  secondaryGradesArtifact,
};
`;

writeFileSync(authorityPath, content);
console.log(JSON.stringify({ snapshotDate, contractFile, gradeFiles }, null, 2));

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relativePath = "docs/football-ledger-stage13-5-review.md";
const outputPath = path.join(root, relativePath);

if (!fs.existsSync(outputPath)) {
  throw new Error(`${relativePath} was not generated.`);
}

const status = execFileSync(
  "git",
  ["status", "--porcelain", "--untracked-files=all", "--", relativePath],
  { cwd: root, encoding: "utf8" },
).trim();

if (status) {
  const report = fs.readFileSync(outputPath, "utf8");
  // Temporary recovery aid for the first stale-artifact CI run. Remove once the generated file is checked in.
  console.error(`FOOTBALL_LEDGER_STAGE13_5_GZIP_BASE64=${gzipSync(report).toString("base64")}`);
  throw new Error(`${relativePath} is stale or missing from the repository. Run npm run generate:football-ledger-audit and commit the result.`);
}

console.log(`${relativePath} is current.`);

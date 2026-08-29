import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";
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
  console.error("GENERATED_LEDGER_AUDIT_GZIP_BASE64_BEGIN");
  console.error(zlib.gzipSync(fs.readFileSync(outputPath)).toString("base64"));
  console.error("GENERATED_LEDGER_AUDIT_GZIP_BASE64_END");
  throw new Error(`${relativePath} is stale or missing from the repository. Run npm run generate:football-ledger-audit and commit the result.`);
}

console.log(`${relativePath} is current.`);

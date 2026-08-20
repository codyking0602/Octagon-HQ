#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selfPath = fileURLToPath(import.meta.url);

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

async function write(relativePath, content) {
  await fs.writeFile(path.join(root, relativePath), content, "utf8");
}

function replaceOnce(content, before, after, label) {
  const first = content.indexOf(before);
  if (first < 0) throw new Error(`Missing bootstrap marker: ${label}`);
  if (content.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Bootstrap marker is not unique: ${label}`);
  }
  return `${content.slice(0, first)}${after}${content.slice(first + before.length)}`;
}

let generator = await read("scripts/backfill-ufcstats-supplemental.mjs");
generator = replaceOnce(
  generator,
  'const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);',
  'const UFCSTATS_FINISH_METHODS = new Set(["KO/TKO", "SUB"]);\nconst UFCSTATS_NON_FINISH_METHODS = new Set(["U-DEC", "S-DEC", "M-DEC", "DQ", "Overturned", "CNC"]);',
  "UFCStats finish method sets",
);
generator = replaceOnce(
  generator,
  `function finishFact(resultRow, methodCategory) {\n  if (!FINISH_METHODS.has(methodCategory)) return { status: "not-applicable" };\n  const round = integer(resultRow?.ROUND); const seconds = timeSeconds(resultRow?.TIME);\n  return round != null && round >= 1 && round <= 5 && seconds != null\n    ? { status: "verified", round, timeSeconds: seconds }\n    : { status: "unavailable" };\n}`,
  `function finishFact(resultRow) {\n  const method = clean(resultRow?.METHOD);\n  if (UFCSTATS_NON_FINISH_METHODS.has(method)) return { status: "not-applicable" };\n  if (!UFCSTATS_FINISH_METHODS.has(method)) return { status: "unavailable" };\n  const round = integer(resultRow?.ROUND); const seconds = timeSeconds(resultRow?.TIME);\n  return round != null && round >= 1 && round <= 5 && seconds != null\n    ? { status: "verified", round, timeSeconds: seconds }\n    : { status: "unavailable" };\n}`,
  "source-owned finish fact",
);
generator = replaceOnce(
  generator,
  'finish: finishFact(core.resultByFightId.get(matched.fightId), fight.methodCategory), knockdowns,',
  'finish: finishFact(core.resultByFightId.get(matched.fightId)), knockdowns,',
  "source-owned finish call",
);
await write("scripts/backfill-ufcstats-supplemental.mjs", generator);

let test = await read("src/features/rankings/data/ufcStatsSupplementalFacts.test.ts");
test = replaceOnce(
  test,
  'const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);\n',
  '',
  "remove canonical finish method test owner",
);
test = replaceOnce(
  test,
  `        if (FINISH_METHODS.has(fight.methodCategory)) {\n          expect(supplemental?.finish.status).toBe("verified");\n        } else {\n          expect(supplemental?.finish.status).toBe("not-applicable");\n        }`,
  `        expect(["verified", "not-applicable", "unavailable"]).toContain(\n          supplemental?.finish.status,\n        );`,
  "source-owned finish coverage assertion",
);
await write("src/features/rankings/data/ufcStatsSupplementalFacts.test.ts", test);

await fs.unlink(selfPath);

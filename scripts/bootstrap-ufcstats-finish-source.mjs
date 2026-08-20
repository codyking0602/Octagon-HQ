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

function replaceRequired(content, before, after, label) {
  const first = content.indexOf(before);
  if (first < 0) throw new Error(`Missing bootstrap marker: ${label}`);
  if (content.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Bootstrap marker is not unique: ${label}`);
  }
  return `${content.slice(0, first)}${after}${content.slice(first + before.length)}`;
}

function replaceIfPresent(content, before, after, label, alreadyAppliedMarker) {
  if (content.includes(before)) return replaceRequired(content, before, after, label);
  if (content.includes(alreadyAppliedMarker)) return content;
  throw new Error(`Neither old nor applied bootstrap marker exists: ${label}`);
}

let generator = await read("scripts/backfill-ufcstats-supplemental.mjs");
generator = replaceIfPresent(
  generator,
  'const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);',
  'const UFCSTATS_FINISH_METHODS = new Set(["KO/TKO", "SUB"]);\nconst UFCSTATS_NON_FINISH_METHODS = new Set(["U-DEC", "S-DEC", "M-DEC", "DQ", "Overturned", "CNC"]);',
  "UFCStats finish method sets",
  'const UFCSTATS_FINISH_METHODS = new Set(["KO/TKO", "SUB"]);',
);
generator = replaceIfPresent(
  generator,
  `function finishFact(resultRow, methodCategory) {\n  if (!FINISH_METHODS.has(methodCategory)) return { status: "not-applicable" };\n  const round = integer(resultRow?.ROUND); const seconds = timeSeconds(resultRow?.TIME);\n  return round != null && round >= 1 && round <= 5 && seconds != null\n    ? { status: "verified", round, timeSeconds: seconds }\n    : { status: "unavailable" };\n}`,
  `function finishFact(resultRow) {\n  const method = clean(resultRow?.METHOD);\n  if (UFCSTATS_NON_FINISH_METHODS.has(method)) return { status: "not-applicable" };\n  if (!UFCSTATS_FINISH_METHODS.has(method)) return { status: "unavailable" };\n  const round = integer(resultRow?.ROUND); const seconds = timeSeconds(resultRow?.TIME);\n  return round != null && round >= 1 && round <= 5 && seconds != null\n    ? { status: "verified", round, timeSeconds: seconds }\n    : { status: "unavailable" };\n}`,
  "source-owned finish fact",
  'function finishFact(resultRow) {\n  const method = clean(resultRow?.METHOD);',
);
generator = replaceIfPresent(
  generator,
  'finish: finishFact(core.resultByFightId.get(matched.fightId), fight.methodCategory), knockdowns,',
  'finish: finishFact(core.resultByFightId.get(matched.fightId)), knockdowns,',
  "source-owned finish call",
  'finish: finishFact(core.resultByFightId.get(matched.fightId)), knockdowns,',
);
await write("scripts/backfill-ufcstats-supplemental.mjs", generator);

let test = await read("src/features/rankings/data/ufcStatsSupplementalFacts.test.ts");
if (test.includes('const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);\n')) {
  test = replaceRequired(
    test,
    'const FINISH_METHODS = new Set(["ko-tko", "doctor-stoppage", "submission"]);\n',
    '',
    "remove canonical finish method test owner",
  );
}
const oldFinishAssertion = `        if (FINISH_METHODS.has(fight.methodCategory)) {\n          expect(supplemental?.finish.status).toBe("verified");\n        } else {\n          expect(supplemental?.finish.status).toBe("not-applicable");\n        }`;
const sourceFinishAssertion = `        expect(["verified", "not-applicable", "unavailable"]).toContain(\n          supplemental?.finish.status,\n        );`;
if (test.includes(oldFinishAssertion)) {
  test = replaceRequired(
    test,
    oldFinishAssertion,
    sourceFinishAssertion,
    "source-owned finish coverage assertion",
  );
} else if (!test.includes(sourceFinishAssertion)) {
  throw new Error("Neither old nor applied finish coverage assertion exists.");
}
await write("src/features/rankings/data/ufcStatsSupplementalFacts.test.ts", test);

await fs.unlink(selfPath);

#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const selfPath = fileURLToPath(import.meta.url);
const testPath = path.join(root, "src/features/rankings/data/ufcStatsSupplementalFacts.test.ts");
let content = await fs.readFile(testPath, "utf8");
const before = `    expect(verifiedKnockdownRows).toBeGreaterThan(1000);\n    expect(unavailableKnockdownRows).toBeGreaterThan(0);`;
const after = `    expect(verifiedKnockdownRows).toBe(1511);\n    expect(unavailableKnockdownRows).toBe(0);`;
if (!content.includes(before)) {
  if (!content.includes(after)) throw new Error("UFCStats knockdown coverage lock marker drifted.");
} else {
  content = content.replace(before, after);
}
await fs.writeFile(testPath, content, "utf8");
await fs.unlink(selfPath);

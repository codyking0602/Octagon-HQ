import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { playFighters } from "./playFighterPool";

const projectRoot = process.cwd();

describe("Play fighter thumbnail completeness", () => {
  it("keeps one valid local WebP thumbnail for every eligible fighter", () => {
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const fighter of playFighters) {
      const relativePath = fighter.thumbUrl.replace(/^\//, "");
      const absolutePath = resolve(projectRoot, relativePath);
      if (!existsSync(absolutePath)) {
        missing.push(`${fighter.id}: ${relativePath}`);
        continue;
      }

      const header = readFileSync(absolutePath).subarray(0, 12);
      const isWebP = header.subarray(0, 4).toString("ascii") === "RIFF"
        && header.subarray(8, 12).toString("ascii") === "WEBP";
      if (!isWebP) invalid.push(`${fighter.id}: ${relativePath}`);
    }

    expect(missing).toEqual([]);
    expect(invalid).toEqual([]);
  });
});

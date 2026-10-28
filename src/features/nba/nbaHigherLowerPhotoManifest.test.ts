import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS } from "./nbaHigherLowerModel";
import { nbaHigherLowerPortraitSource } from "./nbaHigherLowerPortraits";

describe("NBA Higher or Lower full eligible portrait manifest", () => {
  it("includes every possible eligible player instead of samples from completed boards", () => {
    const manifest = NBA_HIGHER_LOWER_ELIGIBLE_PHOTO_SUBJECTS.map(subject => ({
      name: subject.name, nbaId: subject.nbaId,
      url: nbaHigherLowerPortraitSource(subject),
    }));
    expect(manifest.length).toBeGreaterThan(100);
    expect(new Set(manifest.map(x=>x.name)).size).toBe(manifest.length);
    if (process.env.NBA_PHOTO_AUDIT === "1") {
      writeFileSync("nba-photo-audit-manifest.json", JSON.stringify(manifest, null, 2));
      console.log("NBA photo audit source: " + manifest.length + " distinct eligible players");
    }
  });
});

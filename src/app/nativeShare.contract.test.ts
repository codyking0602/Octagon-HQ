import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
}

const fighterProfile = source("../features/rankings/FighterProfilePage.tsx");
const intelligencePage = source("../features/intelligence/IntelligencePage.tsx");
const picksRecap = source("../features/picks/LatestEventRecap.tsx");

describe("native share rollout ownership", () => {
  it("routes the three approved surfaces through one native share owner", () => {
    expect(fighterProfile).toContain("shareCanonicalDestination");
    expect(intelligencePage).toContain("shareCanonicalDestination");
    expect(picksRecap).toContain("shareCanonicalDestination");
    expect(intelligencePage).toContain("Share Matchup");
  });

  it("reuses existing buttons instead of keeping private share implementations", () => {
    expect(fighterProfile).not.toContain("navigator.share");
    expect(picksRecap).not.toContain("navigator.share");
    expect(fighterProfile).not.toContain("navigator.clipboard");
    expect(picksRecap).not.toContain("navigator.clipboard");
  });

  it("leaves Play sharing for the one remaining PR", () => {
    expect(fighterProfile).not.toContain('kind: "challenge"');
    expect(intelligencePage).not.toContain('kind: "game-result"');
    expect(picksRecap).not.toContain('kind: "challenge"');
  });
});

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8");
}

const fighterProfile = source("../features/rankings/FighterProfilePage.tsx");
const intelligencePage = source("../features/intelligence/IntelligencePage.tsx");
const picksRecap = source("../features/picks/LatestEventRecap.tsx");
const challengeProvider = source("../features/challenges/ChallengeProvider.tsx");
const challengeCenter = source("../features/challenges/ChallengeCenter.tsx");

describe("native share rollout ownership", () => {
  it("routes every approved surface through one native share owner", () => {
    expect(fighterProfile).toContain("shareCanonicalDestination");
    expect(intelligencePage).toContain("shareCanonicalDestination");
    expect(picksRecap).toContain("shareCanonicalDestination");
    expect(challengeProvider).toContain("shareAppLink");
    expect(challengeProvider).toContain("shareCanonicalDestination");
    expect(intelligencePage).toContain("Share Matchup");
    expect(challengeProvider).toContain("SHARE RESULTS");
  });

  it("reuses existing buttons instead of keeping private share implementations", () => {
    expect(fighterProfile).not.toContain("navigator.share");
    expect(picksRecap).not.toContain("navigator.share");
    expect(challengeProvider).not.toContain("navigator.share");
    expect(fighterProfile).not.toContain("navigator.clipboard");
    expect(picksRecap).not.toContain("navigator.clipboard");
    expect(challengeProvider).not.toContain("navigator.clipboard");
  });

  it("resolves shared challenge links through the existing Challenge Center owner", () => {
    expect(challengeCenter).toContain('searchParams.get("challenge")');
    expect(challengeCenter).toContain("viewResults(requested.code)");
    expect(challengeCenter).toContain("challengePlayRoute(requested)");
    expect(challengeCenter).not.toContain("window.location.assign");
    expect(challengeCenter).not.toContain("localStorage");
  });
});

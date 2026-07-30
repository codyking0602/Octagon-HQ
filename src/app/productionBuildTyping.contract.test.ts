import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const challengeCenter = readFileSync("src/features/challenges/ChallengeCenter.tsx", "utf8");
const fighterProfile = readFileSync("src/features/rankings/FighterProfilePage.tsx", "utf8");
const worker = readFileSync("worker/index.ts", "utf8");

describe("production frontend build typing", () => {
  it("narrows destination and fighter values before typed state and share work", () => {
    expect(challengeCenter).toContain("const direction = challengeDirection(requested, activeProfile.id);\n    if (!direction) return;");
    expect(fighterProfile).toContain("async function handleShare() {\n    if (!fighter) return;");
  });

  it("keeps HTMLRewriter callback types through chained handlers", () => {
    expect(worker).toContain("interface HtmlRewriterInstance");
    expect(worker).toContain("): HtmlRewriterInstance;");
    expect(worker).toContain("declare const HTMLRewriter: new () => HtmlRewriterInstance;");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts","utf8");
describe("gated NBA official Daily Edge runtime",()=>{
  it("keeps public NBA Daily closed pending completed UI and leaderboards",()=>{
    expect(edge).toContain("const NBA_DAILY_EDGE_RELEASE_READY = false;");
    expect(edge).toContain('if (body.sport === "nba")');
    expect(edge).toContain('if (!NBA_DAILY_EDGE_RELEASE_READY)');
    expect(edge).toContain('"NBA_DAILY_NOT_LAUNCHED"');
  });
  it("shares the canonical server-owned publication and grading flow",()=>{
    expect(edge).toContain('"./nba-publication.generated.mjs"');
    expect(edge).toContain('"./nba-advance.generated.mjs"');
    expect(edge).toContain('p_sport: "nba"');
    expect(edge).toContain('"save_daily_challenge_runtime_progress"');
    expect(edge).toContain('"submit_my_daily_challenge_attempt"');
    expect(edge).toContain('"publish_daily_challenge_setup"');
  });
  it("checks immutable ID and revision rather than trusting a submitted score",()=>{
    expect(edge).toContain("requestedId !== materialized.dailyChallengeId");
    expect(edge).toContain('body.revision');
    expect(edge).toContain("advanced.submissionState");
    expect(edge).not.toContain("p_normalized_score: body.score");
  });
});

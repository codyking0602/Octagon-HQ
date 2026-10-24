import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const script = readFileSync("scripts/generate-nba-weekly-spotlight.mjs","utf8");
const flow = readFileSync(".github/workflows/nba-weekly-spotlights.yml","utf8");
describe("NBA unattended editorial safeguards", () => {
  it("passes offline ESPN box-score and verified YouTube fixture tests", () => {
    expect(() => execFileSync("node", ["--test", "scripts/generate-nba-weekly-spotlight.fixtures.mjs"],
      { encoding: "utf8", timeout: 30_000 })).not.toThrow();
  });
  it("uses finished ESPN boxscores and official YouTube videos, never synthetic weekly winners", () => {
    expect(script).toContain("/scoreboard?dates=");
    expect(script).toContain("/summary?event=");
    expect(script).toContain("UCWJ2lWNubArHWmf3FIHbfcQ");
    expect(script).toContain("No eligible weekly player has a verified matching");
    expect(script).toContain("Missing complete boxscore");
  });
  it("runs at local 5 AM with retries and merges only after exact-head green checks", () => {
    expect(flow).toContain("cron: '0 10,11 * * *'");
    expect(flow).toContain("actions/cache/restore@v4");
    expect(flow).toContain("actions/cache/save@v4");
    expect(flow).toContain("--collect-only");
    expect(script).toContain("mergeOfficialVideos");
    expect(flow).toContain("TZ=America/Chicago");
    expect(flow).toContain("workflow run validate.yml --ref");
    expect(flow).toContain("completed success");
    expect(flow).toContain("--match-head-commit");
    expect(flow).toContain("workflow run deploy-cloudflare.yml --ref main");
    expect(flow).toContain("no unverified claims.");
    expect(flow).toContain('current" != "$EXPECTED_MAIN');
  });
});

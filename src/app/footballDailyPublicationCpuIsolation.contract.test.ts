import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const bundler = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
const deploy = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");

const publications = [
  ["bar_trivia", "bar-trivia", "2026-10-29"],
  ["sports_feud", "sports-feud", "2026-10-30"],
  ["who_am_i", "who-am-i", "2026-11-01"],
  ["find_leader", "find-leader", "2026-11-03"],
  ["hit_the_number", "hit-the-number", "2026-11-08"],
  ["higher_lower", "higher-lower", "2026-11-05"],
] as const;

describe("Football Daily publication CPU isolation", () => {
  it("routes every remaining future game family away from the all-game publisher", () => {
    const loader = edge.slice(
      edge.indexOf("function loadFootballPublicationRuntime("),
      edge.indexOf("function loadFootballAdvanceRuntime("),
    );
    for (const [gameType, file] of publications) {
      expect(loader).toContain(`if (gameType === "${gameType}")`);
      expect(loader).toContain(`import("./football-${file}-publication.generated.mjs")`);
    }
    // Historical legacy modes remain supported, without loading their catalog
    // during any of the six active game families' normal publications.
    expect(loader).toContain('import("./football-publication.generated.mjs")');
    expect(loader).toContain('if (gameType === "millionaire")');
    expect(loader).toContain('if (gameType === "wavelength")');
  });

  it("generates, executes a current-schedule smoke and requires each artifact in deployment", () => {
    for (const [gameType, file, day] of publications) {
      expect(bundler).toContain(`fileName: "football-${file}-publication.generated.mjs"`);
      expect(bundler).toContain(
        `{ day: "${day}", gameType: "${gameType}", scheduleVersion: "football-daily-v22-higher-lower-oct27" }`,
      );
      expect(deploy).toContain(
        `test -f supabase/functions/daily-challenge-runtime/football-${file}-publication.generated.mjs`,
      );
    }
    expect(bundler).toContain("generatedRuntime.buildFootballDailyPersistenceSetup(");
    expect(bundler).toContain("failed its deterministic smoke proof");
  });
});

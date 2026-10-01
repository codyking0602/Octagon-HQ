import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const bundlerSource = readFileSync(resolve(process.cwd(), "scripts/bundle-daily-challenge-runtime.mjs"), "utf8");
const careerMediaSource = readFileSync(
  resolve(process.cwd(), "src/features/back-room/footballCareerMediaContext.ts"),
  "utf8",
);

describe("daily challenge runtime bundle prerequisites", () => {
  it("rebuilds every canonical Football projection before bundling", () => {
    expect(careerMediaSource).toContain(
      'import careerMediaJson from "../../../data/generated/football/career-media-context.json";',
    );

    const generationOrder = [
      "./generate-football-recognizability.mjs",
      "./generate-football-cfb-player-season-recognition.mjs",
      "./generate-football-career-media-context.mjs",
      "./generate-football-factual-universe.mjs",
      "./enrich-football-hit-number-peak-seasons.mjs",
      "./generate-football-who-am-i-daily-universes.mjs",
    ];
    const bundleLoopIndex = bundlerSource.indexOf("for (const bundle of bundles)");

    for (let index = 0; index < generationOrder.length; index += 1) {
      const generatorIndex = bundlerSource.indexOf(generationOrder[index]);
      expect(generatorIndex, generationOrder[index]).toBeGreaterThan(-1);
      expect(bundleLoopIndex, generationOrder[index]).toBeGreaterThan(generatorIndex);
      if (index > 0) {
        expect(generatorIndex, generationOrder[index]).toBeGreaterThan(
          bundlerSource.indexOf(generationOrder[index - 1]),
        );
      }
    }
  });

  it("executes every generated Football publication artifact before deployment can accept it", () => {
    expect(bundlerSource).toContain("pathToFileURL(output).href");
    expect(bundlerSource).toContain("generatedRuntime.buildFootballDailyPersistenceSetup(");
    expect(bundlerSource).toContain('fileName: "average-fan.generated.mjs"');
    expect(bundlerSource).toContain('"advanceAverageFanDailyRuntime", "buildAverageFanDailySetup"');
    expect(bundlerSource).toContain('fileName: "football-publication.generated.mjs"');
    for (const gameType of [
      "who_am_i",
      "wavelength",
      "find_leader",
      "blind_resume",
      "hit_the_number",
      "millionaire",
      "sports_feud",
      "bar_trivia",
      "average_fan",
      "keep_4_cut_4",
    ]) {
      expect(bundlerSource).toContain(`gameType: "${gameType}"`);
    }
    expect(bundlerSource).toContain("failed its deterministic smoke proof for ${smoke.gameType}.");
  });
});

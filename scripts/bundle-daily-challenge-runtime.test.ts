import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const bundlerSource = readFileSync(resolve(process.cwd(), "scripts/bundle-daily-challenge-runtime.mjs"), "utf8");
const careerMediaSource = readFileSync(
  resolve(process.cwd(), "src/features/back-room/footballCareerMediaContext.ts"),
  "utf8",
);

describe("daily challenge runtime bundle prerequisites", () => {
  it("generates the canonical Football career media projection before bundling", () => {
    expect(careerMediaSource).toContain(
      'import careerMediaJson from "../../../data/generated/football/career-media-context.json";',
    );

    const generatorIndex = bundlerSource.indexOf(
      'await import("./generate-football-career-media-context.mjs");',
    );
    const bundleLoopIndex = bundlerSource.indexOf("for (const bundle of bundles)");

    expect(generatorIndex).toBeGreaterThan(-1);
    expect(bundleLoopIndex).toBeGreaterThan(generatorIndex);
  });
});

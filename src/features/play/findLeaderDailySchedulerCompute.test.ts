import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Find the Leader Daily scheduler compute", () => {
  const engine = readFileSync("src/features/play/findLeaderEngine.ts", "utf8");
  const schedulerStart = engine.indexOf("export function scheduledFindLeaderDefinition");
  const schedulerEnd = engine.indexOf("export function dailyFindLeaderBoard", schedulerStart);
  const scheduler = engine.slice(schedulerStart, schedulerEnd);

  it("computes target-day question availability once before replaying selection history", () => {
    const availabilityBuild = scheduler.indexOf("const available = findLeaderQuestions.filter");
    const historyLoop = scheduler.indexOf("for (let slot = 0; slot <= target; slot += 1)");

    expect(availabilityBuild).toBeGreaterThan(-1);
    expect(historyLoop).toBeGreaterThan(availabilityBuild);
    expect(scheduler.slice(historyLoop)).not.toContain("const available = findLeaderQuestions.filter");
  });
});

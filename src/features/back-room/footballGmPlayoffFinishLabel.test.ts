import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { footballGmPlayoffFinishLabel, type FootballGmPlayoffFinish } from "./footballGmEngine";

const labelCases: readonly [FootballGmPlayoffFinish, string][] = [
  ["Missed Playoffs", "Missed Playoffs"],
  ["Wild Card", "Lost Wild Card Round"],
  ["Divisional", "Lost Divisional Round"],
  ["Conference Championship", "Lost Conference Championship"],
  ["Super Bowl Loss", "Lost Super Bowl"],
  ["Champion", "Super Bowl Champion"],
];

describe("NFL GM postseason presentation vocabulary", () => {
  it.each(labelCases)('renders "%s" as the unambiguous "%s"', (stored, label) => {
    expect(footballGmPlayoffFinishLabel(stored)).toBe(label);
  });

  it("uses the display-only mapping on year reveals, comparisons and solo reports", () => {
    const headToHead = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmHeadToHeadPage.tsx"), "utf8");
    const franchise = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmFinalExperience.tsx"), "utf8");
    const solo = readFileSync(resolve(process.cwd(), "src/features/back-room/FootballGmModePage.tsx"), "utf8");

    expect(headToHead).toContain("footballGmPlayoffFinishLabel(left.finish)");
    expect(headToHead).toContain("footballGmPlayoffFinishLabel(right.finish)");
    expect(franchise).toContain("footballGmPlayoffFinishLabel(season.finish)");
    expect(franchise).toContain("footballGmPlayoffFinishLabel(rival.finish)");
    expect(solo).toContain("footballGmPlayoffFinishLabel(result.finish)");
    expect(franchise).not.toContain("<small>{season.finish}</small>");
    expect(headToHead).not.toContain("<b>{left.finish}</b>");
  });
});

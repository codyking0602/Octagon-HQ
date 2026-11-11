import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaRegularSeasonDaily } from "../features/nba/nbaDailySchedule";

describe("NBA production Edge bundle release smoke", () => {
  it("only executes NBA publication smokes on actual scheduled public opening days", () => {
    const bundle = readFileSync("scripts/bundle-daily-challenge-runtime.mjs", "utf8");
    const groups = [...bundle.matchAll(/nbaSmokes:\s*\[([^\]]*)\]/g)];
    expect(groups.length).toBeGreaterThanOrEqual(9);
    let total = 0;
    for (const group of groups) {
      const rows = [...group[1]!.matchAll(/day:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})",\s*gameType:\s*"([a-z_]+)"/g)];
      expect(rows.length).toBeGreaterThan(0);
      for (const [, day, game] of rows) {
        const slot = nbaRegularSeasonDaily(day!);
        expect(slot, `No live NBA Daily for ${day} ${game}`).toMatchObject({
          day, gameType: game, isPublicationDay: true,
        });
        total++;
      }
    }
    expect(total).toBeGreaterThanOrEqual(16);
    expect(bundle).not.toContain('{ day: "2026-10-30", gameType: "average_fan" }');
    expect(bundle).toContain('{ day: "2026-11-15", gameType: "average_fan" }');
  });
});

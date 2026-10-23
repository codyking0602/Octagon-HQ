import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildNbaSportsFeudDailyPack, NBA_SPORTS_FEUD_DAILY_UNIQUE_SLOTS } from "./nbaSportsFeudDailyRotation";
import { NBA_SPORTS_FEUD_MAIN, NBA_SPORTS_FEUD_FAST, nbaSportsFeudEditorialLane } from "./nbaSportsFeudBank";

describe("NBA Sports Feud is Daily-only with a shared four-month no-repeat rotation", () => {
  it("builds 20 consecutive Daily appearances without repeating a single question", () => {
    expect(NBA_SPORTS_FEUD_DAILY_UNIQUE_SLOTS).toBe(20);
    expect(NBA_SPORTS_FEUD_MAIN).toHaveLength(71);
    expect(NBA_SPORTS_FEUD_FAST).toHaveLength(130);

    const byId = new Map([...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST]
      .map(q => ["nba-feud-" + q.id, q] as const));
    // Eight independent 20-appearance windows validate future cycle reuse.
    for (let cycle = 0; cycle < 8; cycle++) {
      const mainSeen = new Set<string>();
      const fastSeen = new Set<string>();
      for (let slot = 0; slot < 20; slot++) {
        const index = cycle * 20 + slot;
        const pack = buildNbaSportsFeudDailyPack(index);
        expect(pack.sport).toBe("nba");
        expect(pack.mainBoards).toHaveLength(2);
        expect(pack.fastMoney).toHaveLength(5);
        const allBoards = [...pack.mainBoards, ...pack.fastMoney];
        const lanes = allBoards.map(q => nbaSportsFeudEditorialLane(byId.get(q.id)!.category));
        expect(new Set(lanes).size).toBe(7);
        for (const q of pack.mainBoards) {
          expect(mainSeen.has(q.id), `repeated Main in cycle ${cycle}: ${q.id}`).toBe(false);
          mainSeen.add(q.id);
        }
        for (const q of pack.fastMoney) {
          expect(fastSeen.has(q.id), `repeated Fast in cycle ${cycle}: ${q.id}`).toBe(false);
          fastSeen.add(q.id);
        }
        // The official slot never depends on which player loads the same game.
        expect(buildNbaSportsFeudDailyPack(index)).toBe(pack);
      }
      expect(mainSeen.size).toBe(40);
      expect(fastSeen.size).toBe(100);
    }
  }, 120_000);

  it("rejects invalid ordinals rather than secretly returning another day's board", () => {
    for (const bad of [-1, 0.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => buildNbaSportsFeudDailyPack(bad)).toThrow();
    }
  });

  it("provides only a Daily Feud preview link and no Casual selection or backend reservation", () => {
    const page = readFileSync("src/features/nba/NbaPlayPage.tsx", "utf8");
    const preview = page.slice(page.indexOf('aria-label="NBA Sports Feud owner preview"'));
    expect(preview.slice(0, 800)).toContain("DAILY PREVIEW");
    expect(preview.slice(0, 800)).not.toContain("PLAY CASUAL");

    const scene = readFileSync("src/features/play/FamilyFeudPrototypePage.tsx", "utf8");
    expect(scene).toContain("buildNbaSportsFeudDailyPack");
    expect(scene).not.toContain("claimNbaCasualFeudPack");
    expect(scene).not.toContain("OWNER CASUAL PREVIEW");

    const sql = readFileSync("supabase/migrations/202612310321_retire_nba_feud_casual_rotation.sql", "utf8");
    expect(sql).toContain("revoke execute on function public.reserve_nba_feud_casual_pack");
    expect(sql).toContain("revoke execute on function public.get_nba_feud_casual_rotation");
  });
});

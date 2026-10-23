import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NBA_SPORTS_FEUD_MAIN, NBA_SPORTS_FEUD_FAST, buildNbaSportsFeudPack,
  nbaSportsFeudEditorialLane } from "./nbaSportsFeudBank";

/** Four months at five plays/month = 20 distinct 2-Main/5-Fast packs.
 * This intentionally treats even an abandoned run as consumed. */
describe("NBA Sports Feud four-month no-repeat rotation", () => {
  it("proves 100 independent players each get 20 complete unshared-question Casual runs", () => {
    expect(NBA_SPORTS_FEUD_MAIN.length).toBeGreaterThanOrEqual(40);
    expect(NBA_SPORTS_FEUD_FAST.length).toBeGreaterThanOrEqual(100);
    for (let player = 0; player < 100; player++) {
      const main = new Set<string>();
      const fast = new Set<string>();
      for (let run = 0; run < 20; run++) {
        let pack: ReturnType<typeof buildNbaSportsFeudPack> | null = null;
        for (let trial = 0; trial < 128; trial++) {
          try {
            pack = buildNbaSportsFeudPack(`rotation-${player}-${run}-${trial}`, { main, fast });
            break;
          } catch (caught) {
            if (!(caught instanceof Error) || !caught.message.includes("insufficient distinct editorial topics")) throw caught;
          }
        }
        expect(pack, `player ${player} run ${run}`).not.toBeNull();
        if (!pack) continue;
        expect(pack.mainBoards).toHaveLength(2);
        expect(pack.fastMoney).toHaveLength(5);
        const all = [...pack.mainBoards, ...pack.fastMoney];
        const authored = [...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST];
        const categories = all.map(q => authored.find(x => "nba-feud-" + x.id === q.id)!.category);
        expect(new Set(categories).size).toBe(7);
        expect(new Set(categories.map(nbaSportsFeudEditorialLane)).size).toBe(7);
        for (const q of pack.mainBoards) {
          expect(main.has(q.id.replace(/^nba-feud-/, "")), q.id).toBe(false);
          main.add(q.id.replace(/^nba-feud-/, ""));
        }
        for (const q of pack.fastMoney) {
          expect(fast.has(q.id.replace(/^nba-feud-/, "")), q.id).toBe(false);
          fast.add(q.id.replace(/^nba-feud-/, ""));
        }
      }
      expect(main.size).toBe(40);
      expect(fast.size).toBe(100);
    }
  }, 120_000);

  it("leaves non-rotation Daily packs deterministic and stable on a repeated seed", () => {
    const daily = "daily:2026-11-14";
    expect(buildNbaSportsFeudPack(daily)).toEqual(buildNbaSportsFeudPack(daily));
    expect(buildNbaSportsFeudPack(daily).mainBoards).toHaveLength(2);
    expect(buildNbaSportsFeudPack(daily).fastMoney).toHaveLength(5);
  });

  it("has account-scoped, serialized cross-device reservation with a hard 20-run reset floor", () => {
    const sql = readFileSync("supabase/migrations/202612310320_nba_feud_casual_rotation.sql", "utf8");
    expect(sql).toContain("references public.profiles(id) on delete cascade");
    expect(sql).toMatch(/row level security/i);
    expect(sql).toMatch(/security definer/g);
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("for update");
    expect(sql).toContain("completed_reservations < 20");
    expect(sql).toContain("seen_main && p_main");
    expect(sql).toContain("seen_fast && p_fast");
    expect(sql).toContain("grant execute on function public.reserve_nba_feud_casual_pack");
    expect(sql).not.toMatch(/grant (?:select|insert|update|delete) on public.nba_feud_casual_rotation to authenticated/i);
  });
});

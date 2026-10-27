import { describe, expect, it } from "vitest";
import priorities from "../../../data/generated/football/wheel-football-priorities.json";
import contracts from "../../../data/generated/football/wheel-nfl-gm-contracts-2026-10-05.json";
import wr from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import { FOOTBALL_GM_PLAYER_POOL } from "./footballGmEngine";
import { readFileSync } from "node:fs";

describe("October 2026 Marvin Harrison Jr. verified ARI -> HOU trade", () => {
  const mhj = "Marvin Harrison Jr.";
  it("selects the WR on Houston, not Arizona, without changing 32 clubs / 626 non-Flex records", () => {
    expect(priorities.teams.ARI.WR).not.toContain(mhj);
    expect(priorities.teams.ARI.Flex).not.toContain(mhj);
    expect(priorities.teams.HOU.WR[0]).toBe(mhj);
    expect(priorities.teams.HOU.Flex[0]).toBe(mhj);
    expect(Object.keys(priorities.teams)).toHaveLength(32);
    const all = Object.values(priorities.teams).reduce((sum, t) =>
      sum + Object.entries(t).filter(([slot]) => slot !== "Flex")
        .reduce((n, [,names]) => n + names.length, 0), 0);
    expect(all).toBe(626);
  });
  it("keeps 594 GM identities, player grade/salary/term, and original saved playerId", () => {
    expect(contracts.players).toHaveLength(594);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
    const c = contracts.players.filter(x => x.player === mhj);
    expect(c).toHaveLength(1);
    expect(c[0].team).toBe("HOU");
    expect(c[0].stablePlayerId).toBe("ARI|WR|marvinharrison");
    expect(c[0].salaryApy).toBe(8843686);
    expect(c[0].gameContract).toBe("1YR");
    expect(wr.grades.filter(x => x.player === mhj)).toEqual([
      expect.objectContaining({team:"HOU",player:mhj,grade:85})
    ]);
    expect(FOOTBALL_GM_PLAYER_POOL.find(x => x.name === mhj)).toEqual(
      expect.objectContaining({id:"ARI|WR|marvinharrison",team:"HOU",currentGrade:85,salaryApy:8843686})
    );
    expect(new Set(FOOTBALL_GM_PLAYER_POOL.map(x => x.id)).size).toBe(594);
  });
  it("appends new HOU version without modifying ARI grade or historical results", () => {
    const sql = readFileSync("supabase/migrations/202612310415_nfl_mhj_hou_current_grade_binding.sql","utf8");
    expect(sql).toContain("nfl-wheel-mhj-hou-trade-2026-10-26-v1");
    expect(sql).toContain("raise exception 'Harrison HOU authority already present");
    expect(sql).toContain("date '2026-10-26'");
    expect(sql).not.toMatch(/\bupdate\s+private\.wheel_football_grade_authority/i);
    expect(sql).not.toMatch(/\bdelete\s+from\s+private\.wheel_football_grade_authority/i);
  });
});

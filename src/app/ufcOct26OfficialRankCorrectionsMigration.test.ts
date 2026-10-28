import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";

const sql = readFileSync("supabase/migrations/202612310413_ufc_verified_standard_rankings_oct26.sql", "utf8");

describe("Oct 26 verified UFC rank authority application", () => {
  it("publishes exactly the reviewed fighter and division facts with conservative tie treatment", () => {
    const rows = [...sql.matchAll(/^  \('(Bantamweight|Heavyweight|Light Heavyweight|Welterweight)','([^']+)',(null|\d+),(null|\d+)\)[,;]/gm)];
    expect(rows).toHaveLength(21);
    expect(new Set(rows.map(x => x[1] + "|" + x[2])).size).toBe(21);
    expect(sql).toContain("('Bantamweight','bryce-mitchell',null,15)");
    expect(sql).toContain("('Light Heavyweight','muhammad-saidov',null,13)");
    expect(sql).toContain("('Light Heavyweight','reinier-de-ridder',null,14)");
    expect(sql).toContain("('Bantamweight','farid-basharat',13,null)");
    expect(sql).toContain("('Light Heavyweight','jamahal-hill',7,null)");
    expect(sql).toContain("('Light Heavyweight','johnny-walker',13,null)");
    expect(sql).not.toMatch(/\('Heavyweight','derrick-lewis',/);
  });
  it("is guarded against unexpected authority changes and preserves game economics", () => {
    expect(sql).toContain("matched %");
    expect(sql).toContain("v_census <> 170");
    expect(sql).toContain("champions<>1 or ranked<>15 or distinct_ranked<>15");
    expect(sql).toContain("fighter.ranking is not distinct from correction.previous_rank");
    expect(sql).not.toMatch(/\bhidden_grade\s*=/);
    expect(sql).not.toContain("update private.wheel_ufc_picks");
    expect(sql).not.toContain("delete from private.wheel_ufc_fighters");
  });
});

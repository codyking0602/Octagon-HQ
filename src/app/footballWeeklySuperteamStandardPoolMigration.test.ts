import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310194_cfb_superteam_standard_pool_generator.sql",
  "utf8",
);

describe("CFB Superteam deep pool + Standard generator correction", () => {
  it("restores the locked reusable positional populations", () => {
    expect(migration).toContain("CFB Superteam canonical pool must contain 329 candidates");
    for (const [group, count] of [
      ["QB", 50],
      ["RB", 50],
      ["WR", 50],
      ["TE", 24],
      ["Front Seven", 60],
      ["Secondary", 60],
      ["Head Coach", 35],
    ] as const) {
      expect(migration).toContain(`group_key='${group}')<>${count}`);
    }
  });

  it("uses one generated Standard authority per week instead of the compressed launch snapshot", () => {
    expect(migration).toContain("create table if not exists private.cfb_superteam_week_authority");
    expect(migration).toContain("private.generate_cfb_superteam_standard_authority");
    expect(migration).toContain("from private.cfb_superteam_week_authority authority");
    expect(migration).toContain("new.hidden_shape<>'Standard'");
    expect(migration).not.toContain("'Wide'");
    expect(migration).not.toContain("'Compressed'");
    expect(migration).not.toContain("'Trap'");
    expect(migration).not.toContain("'Chaos'");
  });

  it("hard-blocks compressed boards while allowing controlled natural variance", () => {
    expect(migration).toContain("array[97,95,94,92,91,90,89,88]");
    expect(migration).toContain("array[100,96,94,93,91,90,89,88]");
    expect(migration).toContain("array[98,95,93,92,91,90,89,88]");
    expect(migration).toContain("max(authority.hidden_grade)-min(authority.hidden_grade)<7");
    expect(migration).toContain("count(*) filter(where authority.hidden_grade>=96)>3");
    expect(migration).toContain("count(distinct authority.school)<>8");
  });

  it("regenerates only the untouched future Sep 29 board and refuses member-impacting rewrites", () => {
    expect(migration).toContain("Sep. 29 CFB Superteam cannot be regenerated after member activity exists");
    expect(migration).toContain("delete from private.football_weekly_auction_board");
    expect(migration).toContain("where week_start=date '2026-09-29'");
    expect(migration).toContain("perform private.materialize_football_weekly_superteam_week(date '2026-09-29')");
  });
});

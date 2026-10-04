import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310264_wheel_ufc_official_rankings_audit.sql",
  "utf8",
);

describe("Wheel of UFC official rankings audit", () => {
  it("switches category eligibility from Meta rankings to UFC All Rankings", () => {
    expect(migration).toContain("ranking_source text not null default 'ufc-all-rankings'");
    expect(migration).toContain("ranking_source = 'ufc-all-rankings'");
    expect(migration).toContain("standard \"All Rankings\" table");
  });

  it("audits all eight men's divisions with one champion plus 15 contenders each", () => {
    expect(migration).toContain("Expected 128 official Wheel of UFC ranking rows");
    expect(migration).toContain("champions <> 1");
    expect(migration).toContain("ranked <> 15");
    expect(migration).toContain("distinct_ranked <> 15");
    expect(migration).toContain("min_rank <> 1");
    expect(migration).toContain("max_rank <> 15");
  });

  it("corrects Payton Talbott to the official #12 bantamweight ranking", () => {
    expect(migration).toContain("('Bantamweight','payton-talbott',12,false)");
    expect(migration).toContain("Payton Talbott official ranking expected #12");
  });

  it("refreshes existing result labels without rewriting historical spin categories", () => {
    expect(migration).toContain("update private.wheel_ufc_picks pick");
    expect(migration).toContain("when fighter.ranking is not null then '#' || fighter.ranking::text");
    expect(migration).toContain("The recorded spin_category remains untouched");
    expect(migration).not.toContain("set spin_category");
  });

  it("does not alter hidden HQ grades", () => {
    expect(migration).not.toContain("hidden_grade =");
    expect(migration).not.toContain("grade_version =");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310182_mlb_postseason_championship.sql",
  "utf8",
);

describe("MLB postseason championship scoring", () => {
  it("locks the 43 / 32 / 25 calibration", () => {
    expect(migration).toContain("43 points from round-by-round series picks");
    expect(migration).toContain("32 points from the one-time bracket");
    expect(migration).toContain("25 points from ten featured Play challenges");
    expect(migration).toContain("'total_max', 100");
    expect(migration).toContain("'series_max', 43");
    expect(migration).toContain("'bracket_max', 32");
    expect(migration).toContain("'play_max', 25");
  });

  it("weights live series picks most", () => {
    expect(migration).toContain("when 'wild_card' then 2");
    expect(migration).toContain("when 'division_series' then 4");
    expect(migration).toContain("when 'championship_series' then 5");
    expect(migration).toContain("when 'world_series' then 9");
  });

  it("recalibrates the one-time bracket to 32 points", () => {
    expect(migration).toContain("when 'wild_card' then 1");
    expect(migration).toContain("when 'division_series' then 2");
    expect(migration).toContain("when 'championship_series' then 5");
    expect(migration).toContain("when 'world_series' then 10");
  });

  it("splits challenge placement points across tied occupied places", () => {
    expect(migration).toContain("generate_series(");
    expect(migration).toContain("when 1 then 2.5::numeric");
    expect(migration).toContain("when 2 then 2.0::numeric");
    expect(migration).toContain("when 3 then 1.5::numeric");
    expect(migration).toContain("when 4 then 1.0::numeric");
    expect(migration).toContain("when 5 then 0.5::numeric");
    expect(migration).toContain("ranked.rank_start + ranked.tie_count - 1");
  });

  it("keeps exactly ten spoiler-free challenge scoring slots", () => {
    expect(migration).toContain("slot between 1 and 10");
    expect(migration).toContain("from generate_series(1, 10) as slot");
    expect(migration).not.toContain("October Legend");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202609140004_fill_vegas_120_missing_odds.sql",
  "utf8",
);

describe("UFC Vegas 120 missing odds repair", () => {
  it("fills only the three requested currently-null upcoming bouts", () => {
    expect(migration.match(/update public\.pick_bouts bout/g)).toHaveLength(3);
    expect(migration.match(/event\.status = 'upcoming'/g)).toHaveLength(3);
    expect(migration.match(/event\.starts_at > now\(\)/g)).toHaveLength(3);
    expect(migration.match(/red_american_odds is null/g)).toHaveLength(3);
    expect(migration.match(/blue_american_odds is null/g)).toHaveLength(3);
  });

  it("uses the verified Aug. 7 moneylines for each matchup", () => {
    expect(migration).toContain("billy-quarantillo");
    expect(migration).toContain("diego-ferreira");
    expect(migration).toContain("red_american_odds = 136");
    expect(migration).toContain("blue_american_odds = -162");

    expect(migration).toContain("darren-elkins");
    expect(migration).toContain("yadier-del-valle");
    expect(migration).toContain("red_american_odds = 500");
    expect(migration).toContain("blue_american_odds = -700");

    expect(migration).toContain("billy-ray-goff");
    expect(migration).toContain("ty-miller");
    expect(migration).toContain("red_american_odds = 230");
    expect(migration).toContain("blue_american_odds = -285");
    expect(migration.match(/odds_source = 'MMA Mania'/g)).toHaveLength(3);
  });
});

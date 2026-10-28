import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310257_oct4_tyler_sports_feud_grading_repair.sql",
  "utf8",
);

describe("October 4 Tyler Sports Feud grading repair", () => {
  it("locks the rebuilt live coach-board entity identities", () => {
    const identities = [
      ["cfb-main-10-4:a1", "Mike Leach"],
      ["cfb-main-10-4:a3", "Steve Spurrier"],
      ["cfb-main-10-4:a2", "Chip Kelly"],
      ["cfb-main-10-4:a9", "Urban Meyer"],
      ["cfb-main-10-4:a10", "Art Briles"],
      ["cfb-main-10-4:a4", "Lincoln Riley"],
      ["cfb-main-10-4:a5", "Gus Malzahn"],
      ["cfb-main-10-4:a6", "Lane Kiffin"],
      ["cfb-main-10-4:v8", "Steve Sarkisian"],
    ] as const;

    for (const [entityId, name] of identities) {
      expect(migration).toContain(`'id', '${entityId}'`);
      expect(migration).toContain(`'display_name', '${name}'`);
    }
  });

  it("preserves setup immutability around the targeted Oct 4 live repair", () => {
    expect(migration).toContain("daily.central_day = date '2026-10-04'");
    expect(migration).toContain("schedule.sport = 'football'");
    expect(migration).toContain("daily.game_type = 'sports_feud'");
    expect(migration).toContain(
      "alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable",
    );
    expect(migration).toContain(
      "alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable",
    );
  });

  it("corrects Tyler only from the audited 70-point run to 82", () => {
    expect(migration).toContain("profile.normalized_name = 'TYLER'");
    expect(migration).toContain("if v_score not in (70, 82)");
    expect(migration).toContain("set native_score = 82");
    expect(migration).toContain("'main_points', 44");
    expect(migration).toContain("'fast_money_points', 38");
    expect(migration).toContain("'ben_johnson_points', 0");
    expect(migration).toContain("'steve_sarkisian_points', 2");
    expect(migration).toContain("'urban_meyer_points', 5");
    expect(migration).toContain("'the_game_points', 8");
  });
});

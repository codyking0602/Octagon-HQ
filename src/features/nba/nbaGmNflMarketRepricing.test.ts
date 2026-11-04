import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310927_nba_gm_nfl_market_repricing.sql", "utf8",
);
const regression = readFileSync(
  "supabase/tests/nba_gm_nfl_market_repricing.sql", "utf8",
);
const nflEconomy = readFileSync(
  "src/features/back-room/wheelFootballGmEconomy.ts", "utf8",
);
const nbaRepo = readFileSync(
  "src/features/nba/nbaGmDevRepository.ts", "utf8",
);

describe("NBA GM new-franchise NFL market repricing parity", () => {
  it("uses independent grade-to-market interpolation, age, position and variance", () => {
    expect(nflEconomy).toContain("interpolateMarketApy(role, yearTwoGrade)");
    expect(migration).toContain("private.nba_gm_v11_market_apy(");
    expect(migration).toContain("v_grade<=v_grades[v_i]");
    expect(migration).toContain("v_player.positions[1]");
    expect(migration).toContain("v_player.verified_birth_date");
    expect(migration).toContain("private.nba_gm_v3_grade(p_state,p_id,2)");
    expect(migration).not.toContain("v_start*1.065");
    expect(migration).toContain("v_roll*2-1");
  });

  it("uses market forecasts for all cap/selection callers without a second backend", () => {
    expect(migration).toContain("private.nba_gm_v11_forecast_grade(p_id)");
    expect(migration).toContain("private.nba_gm_v4_salary(jsonb,text,integer)");
    expect(migration).toContain("EXECUTE v_def;");
    expect(nbaRepo).toContain('client.rpc("nba_gm_dev_action"');
    expect(nbaRepo).toContain('client.rpc("nba_gm_dev_catalog"');
    expect(regression).toContain("v_draft_y2");
    expect(regression).toContain("v_total<>330");
  });

  it("locks 3YR salaries, only renews 1YR once and preserves all old saves", () => {
    expect(migration).toContain("p_state->>'repriceModelVersion'='2'");
    expect(migration).toContain("'repriceModelVersion',2,'phase','draft'");
    expect(regression).toContain("v_y2<>v_y3");
    expect(regression).toContain("v_y1<>v_row.provisional_average_salary");
    expect(regression).toContain("v_old");
    expect(regression).toContain("nba-gm-draft-deniavdija");
  });
});

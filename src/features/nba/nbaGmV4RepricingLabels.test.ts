import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaGmRepriceLabel } from "./nbaGmScouting";

const migration = readFileSync(
  "supabase/migrations/202612310926_nba_gm_v4_repricing_labels.sql", "utf8",
);
const regression = readFileSync("supabase/tests/nba_gm_v4_repricing_labels.sql", "utf8");
const repo = readFileSync("src/features/nba/nbaGmDevRepository.ts", "utf8");

describe("NBA GM V4 repricing labels / NFL contract presentation parity", () => {
  it("restores server-authored risk to the existing V4 catalog response", () => {
    expect(migration).toContain("'repriceRisk',case when v_state->>'economyVersion'='4'");
    expect(migration).toContain("then private.nba_gm_v10_reprice_risk(v_state,p.id)");
    expect(migration).toContain("else private.nba_gm_v5_reprice_risk(v_state,p.id)");
    expect(repo).toContain('repriceRisk:z.enum(["LOW","MEDIUM","HIGH","LOCKED"])');
  });
  it("prices a single V4 extension over the certified salary forecast without seeded future leaks", () => {
    expect(migration).toContain("private.nba_gm_v4_contract(p_state,p_id)");
    expect(migration).toContain("v_start*1.065");
    expect(migration).toContain("private.nba_gm_v4_odds(p_state,p_id,1,v_player.overall)");
    expect(migration).not.toContain("p_state->>'seed'");
    expect(migration).not.toContain("update private.football_gm_runs");
    expect(migration).not.toContain("nba_gm_v3_final_score");
    expect(regression).toContain("count_risk+count_locked<>330");
  });
  it("preserves NFL-style copy with clear 1YR/3YR differentiation", () => {
    expect(nbaGmRepriceLabel("LOW","1YR").label).toBe("LOW REPRICE");
    expect(nbaGmRepriceLabel("MEDIUM","1YR").label).toBe("MED REPRICE");
    expect(nbaGmRepriceLabel("HIGH","1YR").label).toBe("HIGH REPRICE");
    expect(nbaGmRepriceLabel("LOCKED","3YR").label).toBe("SALARY LOCKED");
    expect(nbaGmRepriceLabel(null,"1YR").label).toBe("REPRICE RISK");
  });
});

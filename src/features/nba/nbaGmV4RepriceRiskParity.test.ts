import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { nbaGmRepriceLabel } from "./nbaGmScouting";

const migration=readFileSync(
  "supabase/migrations/202612310930_nba_gm_v4_reprice_risk_parity.sql","utf8");
const backendTest=readFileSync(
  "supabase/tests/nba_gm_v4_reprice_risk_parity.sql","utf8");

describe("NBA GM V4 signed-contract reprice parity",()=>{
  it("keeps the established NFL-equivalent labels, never a generic live V4 placeholder",()=>{
    expect(nbaGmRepriceLabel("LOW","1YR").label).toBe("LOW REPRICE");
    expect(nbaGmRepriceLabel("MEDIUM","1YR").label).toBe("MED REPRICE");
    expect(nbaGmRepriceLabel("HIGH","1YR").label).toBe("HIGH REPRICE");
    expect(nbaGmRepriceLabel("LOCKED","1YR").label).toBe("SALARY LOCKED");
    expect(nbaGmRepriceLabel(null,"3YR").label).toBe("SALARY LOCKED");
  });
  it("adds the authoritative forecast field to current catalog without replacing its V4 salary routing",()=>{
    expect(migration).toContain("private.nba_gm_v5_reprice_risk(v_state,p.id)");
    expect(migration).toContain("private.nba_gm_v3_contract_for_state(v_state,p.id)");
    expect(migration).toContain("NBA GM catalog contract binding drifted");
    expect(migration).toContain("NBA GM catalog already has repricing");
  });
  it("uses source-verified V4 averages and the actual one-time salary reserve, without seeded outcomes",()=>{
    expect(migration).toContain("p_state->>'economyVersion'='4'");
    expect(migration).toContain("c.provisional_average_salary");
    expect(migration).toContain("c.independently_verified and c.salary_schedule_verified");
    expect(migration).toContain("v_salary_start*1.065/100000");
    expect(migration).toContain("if v_economy4 and p_state->>'phase'='offseason' then return 'LOCKED'");
    expect(migration).not.toContain("p_state->>'seed'");
    expect(backendTest).toContain("Seed leaked into NBA salary forecast");
    expect(backendTest).toContain("V4 risk tiers collapsed");
    expect(backendTest).toContain("Old V3 economy lost its existing repricing behavior");
  });
});

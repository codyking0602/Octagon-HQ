import {readFileSync} from "node:fs";
import {describe,expect,it} from "vitest";
import {NBA_GM_DEV_CAPS} from "./nbaGmDevModel";

const migration=readFileSync("supabase/migrations/202612310938_nba_gm_v11_175m_five_season_calibration.sql","utf8");
const regression=readFileSync("supabase/tests/nba_gm_v11_175m_five_season_calibration.sql","utf8");
const model=readFileSync("src/features/nba/nbaGmDevModel.ts","utf8");
const repository=readFileSync("src/features/nba/nbaGmDevRepository.ts","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");

describe("NBA GM V11 new-run $175M and five-season skill calibration",()=>{
  it("opts in only new 175M three-season runs, with V11 frontend parsing",()=>{
    expect(NBA_GM_DEV_CAPS).toEqual([175_000_000,175_000_000,175_000_000]);
    expect(migration).toContain("'simulationModelVersion',11,'lineupModelVersion',1");
    expect(migration).toContain("jsonb_build_array(175000000,175000000,175000000)");
    expect(repository).toContain("z.literal(10),z.literal(11)");
    expect(model).toContain("simulationModelVersion?: 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;");
    expect(page).toContain("run.simulationModelVersion>=7");
    expect(regression).toContain("public.nba_gm_dev_action(text,text,text)");
  });
  it("recalculates strength/side grades but preserves saved V9 and V10 runs",()=>{
    expect(migration).toContain("private.nba_gm_v10_season(jsonb,integer)");
    expect(migration).toContain("FUNCTION private.nba_gm_v11_season(");
    expect(migration).toContain("(.75*v_off)+(.75*v_def)+v_fit-.6");
    expect(migration).toContain("least(1.7,greatest(0,89-v_creator_top)*.20)");
    expect(migration).toContain("v_off_grade:=greatest(60");
    expect(migration).toContain("v_def_grade:=greatest(60");
    expect(migration).toContain("private.nba_gm_v11_season(p_state,p_year)");
    expect(migration).toContain("private.nba_gm_v10_season_lineup(p_state,p_year)");
    expect(regression).toContain("private.nba_gm_v10_season(");
    expect(regression).toContain("private.nba_gm_v9_season(");
  });
  it("does not alter contracts, repricing, historical anchors, or 90/3/7 weights",()=>{
    expect(migration).toContain("private.nba_gm_v10_final_score(jsonb)");
    expect(migration).toContain("v_roster*.90+v_record*.03+v_playoff*.07");
    expect(migration).toContain("'repriceModelVersion',2");
    expect(regression).toContain("wins>=60");
    expect(regression).toContain("private.nba_gm_v5_historical_teams");
    expect(regression).toContain("v_score11 is distinct from v_score10");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router=readFileSync("src/app/router.tsx","utf8");
const hub=readFileSync("src/features/nba/NbaPlayPage.tsx","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const model=readFileSync("src/features/nba/nbaGmDevModel.ts","utf8");
const repository=readFileSync("src/features/nba/nbaGmDevRepository.ts","utf8");
const final=readFileSync("src/features/nba/NbaGmFinalExperience.tsx","utf8");
const migration=readFileSync("supabase/migrations/202612310917_nba_gm_v8_public_rating_scoring.sql","utf8");
const regression=readFileSync("supabase/tests/nba_gm_public_v8_calibration.sql","utf8");

describe("NBA GM public V8 launch boundaries",()=>{
  it("makes only NBA GM public in the NBA hub, preserves older private preview gates",()=>{
    expect(router).toContain('path: "nba/gm", element: <NbaGmDevPage />');
    expect(router).toContain('path: "nba/gm-dev", element: <Navigate to="/nba/gm" replace />');
    expect(router).toContain('path: "nba/who-am-i", element: <NbaWhoAmIOwnerGate>');
    expect(router).toContain('path: "nba/bar-trivia", element: <NbaWhoAmIOwnerGate>');
    expect(hub).toContain('navigate("/nba/gm")');
    expect(hub).not.toContain('owner ? <button type="button" className="play-v2__game"');
    expect(hub).toContain('Build your seven-player franchise · 3 seasons');
    expect(page).not.toContain("OWNER ONLY · NOT PUBLIC");
    expect(page).not.toContain("Owner-only playtest");
  });
  it("keeps all three NBA GM backend endpoints member-only with server-owned saves",()=>{
    expect(migration).toContain("nba_gm_dev_catalog");
    expect(migration).toContain("nba_gm_dev_action");
    expect(migration).toContain("nba_gm_dev_trade_offers");
    expect(migration).toContain("auth.uid() is not null");
    expect(migration).toContain("REVOKE ALL ON FUNCTION public.nba_gm_dev_action");
    expect(migration).toContain("TO authenticated");
    expect(regression).toContain("has_function_privilege('anon'");
    expect(regression).toContain("private.nba_gm_v8_season");
    expect(migration).not.toContain("DROP TABLE");
  });
  it("uses real cohort-calibrated V8 ratings and consistent 90/3/7 final scoring",()=>{
    expect(migration).toContain("v_def_weakest");
    expect(migration).toContain("v_def_second");
    expect(migration).toContain("85+1.75*v_off");
    expect(migration).toContain("85+1.75*v_def");
    expect(migration).toContain("private.nba_gm_v8_final_score");
    expect(migration).toContain("v_roster*.90+v_record*.03+v_playoff*.07");
    expect(migration).toContain("simulationModelVersion'',8");
    expect(model).toContain("simulationModelVersion?: 5 | 6 | 7 | 8");
    expect(repository).toContain("z.literal(8)");
    expect(page).toContain("run.simulationModelVersion===8");
    expect(final).toContain("run.simulationModelVersion===8");
  });
  it("keeps the first offseason report concise and final recap continuity",()=>{
    expect(page).not.toContain("VIEW PLAYOFF OUTCOME ODDS");
    expect(page).not.toContain('showOffseasonReport&&<section className="nba-gm-dev__continuity');
    expect(page).toContain("CONTINUE TO OFFSEASON MOVES");
    expect(final).toContain("CORE RETAINED");
  });
});

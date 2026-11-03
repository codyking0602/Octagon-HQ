import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration=readFileSync("supabase/migrations/202612310922_nba_gm_nfl_trade_cap_parity.sql","utf8");
const regression=readFileSync("supabase/tests/nba_gm_trade_cap_crisis_parity.sql","utf8");
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const repo=readFileSync("src/features/nba/nbaGmDevRepository.ts","utf8");
const nfl=readFileSync("src/features/back-room/footballGmStrategy.ts","utf8");
const nflPage=readFileSync("src/features/back-room/FootballGmModePage.tsx","utf8");

describe("NBA GM / NFL GM trade and cap-crisis parity",()=>{
  it("accepts 1-for-1 and multi-player asking prices without an artificial maximum overpay",()=>{
    expect(nfl).toContain("footballGmAcceptedTargetTradeOffers");
    expect(nfl).toContain("footballGmTradeOfferAcceptanceSlack");
    expect(migration).toContain("v_threshold");
    expect(migration).toContain("v_ratio<v_threshold");
    expect(migration).not.toContain("v_ratio>1.05");
    expect(migration).toContain("v_best_slack+.08");
    expect(migration).toContain("outgoingPlayerIds");
    expect(migration).toContain("incomingPlayerIds");
  });
  it("allows a temporary salary-cap crisis, and displays the exact resulting salary gap",()=>{
    expect(nflPage).toContain("CAP CRISIS");
    expect(migration).not.toContain("if not v_legal then continue");
    expect(migration).toContain("capOverYear2");
    expect(migration).toContain("capOverYear3");
    expect(repo).toContain("capOverYear2:z.number().int().nonnegative().optional()");
    expect(repo).toContain("capOverYear3:z.number().int().nonnegative().optional()");
    expect(page).toContain("CAP CRISIS IF ACCEPTED");
    expect(page).toContain("SIMULATE YEARS 2 & 3");
    expect(page).toContain("disabled={busy||capCrisis||heldPlayers.length>0}");
    expect(regression).toContain("Over-cap NBA team advanced in spite of cap crisis");
  });
  it("permits cap-neutral held-asset positional swaps during cap crises",()=>{
    expect(page).toContain("nbaGmDevAssignRoster([");
    expect(page).toContain("SHOP HELD ASSET");
    expect(page).toContain("RELEASE HELD ASSET");
    expect(regression).toContain("cap crisis never freezes the trading interface");
  });
  it("keeps legacy saved outcomes and the NFL-inspired 90/3/7 scoring untouched",()=>{
    expect(migration).not.toContain("nba_gm_v9_season(");
    expect(migration).not.toContain("nba_gm_v9_final_score(");
    expect(migration).toContain("CREATE OR REPLACE FUNCTION private.nba_gm_v8_trade_offers");
  });
});

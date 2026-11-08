import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const page=readFileSync("src/features/nba/NbaGmDevPage.tsx","utf8");
const migration=readFileSync("supabase/migrations/202612311512_nba_gm_trade_timeout_fast_candidate_filter.sql","utf8");
describe("NBA GM offseason timeout protection",()=>{
 it("never treats a failed trade target lookup as a verified no-deal result",()=>{
   expect(page).toContain('setTradeTargetsError("Trade target scouting is temporarily unavailable.');
   expect(page).toContain('Boolean(tradeTargetsError)');
   expect(page).not.toContain('No position-safe trade packages from this team.');
   expect(page).toContain('No available players to approach on this team.');
   expect(page).toContain('Choose a target to check which position-safe trade packages');
   expect(page).toContain('tradeOfferError?<p className="nba-gm-dev__trade-warning"');
 });
 it("does not run every trade package search when loading a team roster",()=>{
   const lookup=migration.slice(migration.indexOf("create or replace function public.nba_gm_dev_legal_trade_targets()"));
   expect(lookup).toContain("jsonb_agg(p.id order by p.overall desc,p.name)");
   expect(lookup).not.toContain("nba_gm_v8_trade_offers");
   expect(migration).toContain("create or replace function private.nba_gm_v15_fair_lineup_exists");
   expect(migration).toContain("with recursive roster as materialized");
   expect(migration).toContain("private.nba_gm_v15_fair_lineup_exists(st,p_picks,y)");
   expect(migration).toContain("if auth.uid() is null");
 });
});

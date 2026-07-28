import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608150001_approved_live_fight_removals.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/approved_live_fight_removals.sql",
  "utf8",
);
const controlPage = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const picksPage = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const monitoring = readFileSync("src/features/picks-monitoring/manualMonitoringRunner.ts", "utf8");

describe("approved pre-lock live fight removal", () => {
  it("adds one explicit inclusion state without overloading official result state", () => {
    expect(sql).toContain("add column if not exists included_in_picks boolean");
    expect(sql).toContain("alter column included_in_picks set not null");
    expect(sql).toContain("create or replace function public.approve_pick_bout_inclusion");
    expect(sql).toContain("only a pending bout can be removed from or restored to Picks");
    expect(sql).not.toContain("set result_status = case when p_included_in_picks");
  });

  it("uses owner approval, stale inclusion and fighter guards, and immutable audit actions", () => {
    expect(sql).toContain("public.is_pick_control_owner(auth.uid())");
    expect(sql).toContain("Picks inclusion changed; reload Fight Night Control");
    expect(sql).toContain("matchup changed; reload Fight Night Control");
    expect(sql).toContain("the final included bout cannot be removed from Picks");
    expect(sql).toContain("'remove_bout_from_picks'");
    expect(sql).toContain("'restore_bout_to_picks'");
    expect(sql).toContain("'preserved_picks'");
    expect(sql).toContain("'cleared_mutable_underdog_locks'");
  });

  it("preserves Picks while excluding removed bouts from choices, progress, scoring, results, and odds", () => {
    expect(sql).toContain("raise exception 'fight is removed from Picks'");
    expect(sql).toContain("and bout.included_in_picks");
    expect(sql).toContain("not bout.included_in_picks then 'excluded'");
    expect(sql).toContain("removed bout must be restored to Picks before matchup or result changes");
    expect(sql).toContain("new.red_american_odds := old.red_american_odds");
    expect(sql).toContain("all included bout results must be resolved before completion");
  });

  it("keeps control and player presentation explicit rather than silently hiding the bout", () => {
    expect(controlPage).toContain("REMOVE FROM PICKS");
    expect(controlPage).toContain("RESTORE TO PICKS");
    expect(controlPage).toContain("submitted picks stay preserved");
    expect(picksPage).toContain("REMOVED FROM PICKS · EXCLUDED FROM SCORING");
    expect(picksPage).toContain("bout.includedInPicks === false");
    expect(picksPage).toContain("Excluded from scoring");
  });

  it("keeps monitoring advisory and removes only intentional exclusions from active comparison", () => {
    expect(monitoring).toContain("included_in_picks?: boolean");
    expect(monitoring).toContain("ignoredMatchupIdentities");
    expect(monitoring).toContain("source.bouts.filter");
    expect(monitoring).not.toContain("approve_pick_bout_inclusion");
  });

  it("keeps executable rollback coverage for authorization, preservation, privacy, restoration, scoring, and completion", () => {
    expect(integrationSql).toContain("non-owner removed a live bout");
    expect(integrationSql).toContain("approved removal did not preserve submitted picks");
    expect(integrationSql).toContain("pre-lock removal exposed private group picks");
    expect(integrationSql).toContain("restoration did not reactivate preserved picks");
    expect(integrationSql).toContain("remove restore remove did not append independent immutable audits");
    expect(integrationSql).toContain("removed pending bout blocked event completion");
    expect(integrationSql).toContain("season scoring included the removed bout");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});

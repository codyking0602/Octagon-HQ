import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const rootFile = (path: string) => readFileSync(new URL(`../../../${path}`, import.meta.url), "utf8");

describe("Football pick auto-settlement ownership", () => {
  it("reuses the canonical monitoring wake and football current-event RPC", () => {
    const monitoring = rootFile("supabase/functions/run-pick-monitoring/index.ts");
    const footballSync = rootFile("supabase/functions/sync-next-football-event/index.ts");

    expect(monitoring).toContain('/functions/v1/sync-next-football-event');
    expect(monitoring).toContain('mode: "scheduled-finals"');
    expect(footballSync).toContain('admin.rpc("get_current_pick_event", { p_sport: "football" })');
    expect(footballSync).toContain('admin.rpc("record_football_pick_final"');
    expect(footballSync).not.toContain('.from("pick_events")');
    expect(footballSync).not.toContain('.from("pick_bouts")');
  });

  it("exposes final scores without creating a second cron invocation", () => {
    const migration = rootFile("supabase/migrations/20260908133000_football_pick_auto_settlement.sql");

    expect(migration).toContain("'home_final_score', bout.home_final_score");
    expect(migration).toContain("'away_final_score', bout.away_final_score");
    expect(migration).not.toContain("cron.");
    expect(migration).not.toContain("/functions/v1/sync-next-football-event");
  });
});
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationPath = "supabase/migrations/202612310086_automatic_football_pick_settlement.sql";
const source = readFileSync(migrationPath, "utf8");

describe("automatic Football pick settlement migration", () => {
  it("keeps one five-minute Picks scheduler and adds Football settlement to the existing wake-up", () => {
    expect(source.match(/cron\.schedule\(/g)).toHaveLength(1);
    expect(source).toContain("'octagon-hq-pick-monitoring'");
    expect(source).toContain("'*/5 * * * *'");
    expect(source).toContain("/functions/v1/daily-challenge-runtime");
    expect(source).toContain("/functions/v1/run-pick-monitoring");
    expect(source).toContain("/functions/v1/sync-next-football-event");
    expect(source).toContain("'{\"mode\":\"scheduled\"}'::jsonb");
  });

  it("projects official Football scores through the existing current-event RPC", () => {
    expect(source).toContain("'home_final_score', bout.home_final_score");
    expect(source).toContain("'away_final_score', bout.away_final_score");
    expect(source).toContain("create or replace function public.get_current_pick_event(p_sport text)");
  });
});

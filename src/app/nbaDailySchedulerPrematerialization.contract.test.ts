import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/202612310942_nba_daily_five_minute_prematerialization.sql", "utf8",
);
const databaseProof = readFileSync(
  "supabase/tests/nba_daily_scheduler_prematerialization.sql", "utf8",
);

describe("NBA official Daily unattended publication before the first player", () => {
  it("uses the existing scheduler and never creates a second cron owner", () => {
    expect(migration).toContain("octagon-hq-pick-monitoring");
    expect(migration).toContain("cron.alter_job(");
    expect(migration).not.toContain("cron.schedule(");
    expect(migration).toContain("nba_daily_challenge_request_id");
    for (const name of ["ufc_daily_challenge_request_id", "football_daily_challenge_request_id",
      "pick_monitoring_request_id"]) {
      expect(migration).toContain(name);
    }
    expect(databaseProof).toContain("Exactly one NBA Daily scheduled invocation required");
    expect(databaseProof).toContain("NBA Daily offseason guard");
  });

  it("honors the NBA release boundary, including prelaunch midnight and April offseason", () => {
    expect(migration).toContain("between date '2026-10-28' and date '2027-04-11'");
    const nbaStart = runtime.indexOf('if (scheduledSport === "nba") {');
    const nextSport = runtime.indexOf('if (scheduledSport !== "ufc" && scheduledSport !== "football")', nbaStart);
    expect(nbaStart).toBeGreaterThan(0);
    expect(nextSport).toBeGreaterThan(nbaStart);
    const nba = runtime.slice(nbaStart, nextSport);
    expect(nba).toContain('const inSeason = (day: string) => day >= "2026-10-29" && day <= "2027-04-11"');
    expect(nba).toContain('status: "outside_nba_daily_season"');
    expect(nba).toContain("const materialized = inSeason(today) ? await materializeNbaToday(admin) : null");
    expect(nba).toContain("if (upcoming !== today && inSeason(upcoming))");
    expect(nba).toContain("await materializeNbaToday(admin, soon.toISOString())");
    expect(nba).toContain("next_day: nextDay");
    expect(nba).not.toContain("handleNbaDaily(");
  });

  it("keeps the existing content authority and private scoring on the server", () => {
    expect(migration).toContain("octagon_pick_monitoring_scheduler_token");
    expect(runtime).toContain('authorize_pick_monitoring_scheduler');
    const publisher = runtime.slice(
      runtime.indexOf("async function materializeNbaToday("),
      runtime.indexOf("async function handleNbaDaily("),
    );
    expect(publisher).toContain('get_daily_challenge_materialization_request');
    expect(publisher).toContain('publish_daily_challenge_setup');
    expect(publisher).toContain("p_private_setup_evidence");
    expect(publisher).toContain("p_private_grading_evidence");
  });
});

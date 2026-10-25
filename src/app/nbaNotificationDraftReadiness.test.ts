import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/202612310403_nba_notification_kind_preparation.sql", "utf8");
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");
const nbaSchedule = readFileSync("src/features/nba/nbaDailySchedule.ts", "utf8");
const center = readFileSync("src/features/notifications/NotificationCenterPage.tsx", "utf8");

describe("NBA notification definitions: dormant before official launch", () => {
  it("permits all four NBA kinds in the single canonical notification contract", () => {
    for (const kind of ["nba_launch_available", "nba_daily_four_hours", "nba_results_ready"]) {
      expect(sql).toContain("'" + kind + "'");
      expect(model).toContain('"' + kind + '"');
    }
    expect(sql).toContain("notification_groups_kind_valid");
    expect(sql).toContain("notification_category_for_kind");
    expect(sql).toContain("notification_priority_for_kind");
    expect(sql).toContain("return 'push_candidate'");
    expect(sql).toContain("return 'in_app'");
    expect(sql).not.toContain("'nba_daily_available'");
    expect(model).not.toContain('"nba_daily_available"');
  });

  it("uses NBA identity but never releases owner-preview games from a calendar date", () => {
    expect(model).toContain('return "nba"');
    expect(center).toContain("Basketball");
    expect(nbaSchedule).toContain('NBA_GAMES_LAUNCH_DAY = "2026-11-01"');
    expect(nbaSchedule).toContain("NBA_OFFICIAL_GAMES_RELEASE_READY = false");
    expect(sql).not.toContain("publish_notification_to_profile(");
    expect(sql).not.toContain("cron.schedule");
    expect(sql).not.toContain("net.http_post");
  });
});

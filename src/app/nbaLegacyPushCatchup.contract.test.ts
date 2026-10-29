import {describe, expect, it} from "vitest";
import {readFileSync} from "node:fs";

const source = readFileSync("ops/nba-public-launch-legacy-push-catchup-20261029.sql", "utf8");
const original = readFileSync("ops/nba-public-early-launch-manual-push.sql", "utf8");

describe("NBA existing-subscriber launch push catch-up", () => {
  it("targets only untouched October 24 legacy settings, not intentional opt-outs", () => {
    expect(source).toContain("pref.nba = false");
    expect(source).toContain("pref.ufc and pref.football and pref.mlb");
    expect(source).toContain("2026-10-24 21:00:40.626566+00");
    expect(source).toContain("pref.updated_at = timestamptz");
    expect(source).toContain("not in ('TEST','TEST2')");
    expect(source).toContain("v_target_count <> 5 or v_device_count <> 9");
  });
  it("reuses existing unread original events with no second inbox event", () => {
    expect(source).toContain("event.source_key = 'hq:nba:games-cup-public-launch:2026'");
    expect(source).toContain("notification.read_at is null");
    expect(source).toContain("notification.dismissed_at is null");
    expect(source).toContain("notification.priority = 'push_candidate'");
    expect(source).toContain("not exists (");
    expect(source).toContain("private.notification_push_deliveries");
    expect(source).toContain("net.http_post(");
    expect(source).not.toMatch(/\b(?:insert\s+into|update|delete\s+from)\s+private\.notification_(?:events|groups)\b/i);
    expect(source).not.toContain("publish_notification_to_profile(");
    expect(original).toContain("MANUAL GO-LIVE ONLY");
  });
  it("fails closed when the release is not fully installed", () => {
    expect(source).toContain("notification_nba_release_gate");
    expect(source).toContain("nba-daily-regular-v3-oct30-public");
    expect(source).toContain("v_existing_event_count <> 13");
    expect(source).toContain("v_confirmed <> 5");
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("on commit drop");
  });
});

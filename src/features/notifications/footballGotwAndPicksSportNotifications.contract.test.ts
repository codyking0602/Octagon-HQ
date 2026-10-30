import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { notificationKinds, notificationSport } from "./notificationModel";

const sql = readFileSync(
  "supabase/migrations/202612310891_sport_correct_picks_and_football_gotw_notifications.sql",
  "utf8",
);

describe("UFC event and Football GOTW kickoff notifications", () => {
  it("keeps the UFC one-hour alert but excludes the Football slate start", () => {
    expect(sql).toContain("if v_event.sport = 'mma'");
    expect(sql).toContain("'ufc_event_starting'");
    expect(sql).toContain("Your Picks are in. The main card starts in under one hour.");
    expect(sql).toContain("and v_event.starts_at <= p_now + interval '1 hour'");
  });

  it("sends only the published, owner-selected NFL and CFB Games of the Week", () => {
    expect(sql).toContain("public.football_weekly_content_packages");
    expect(sql).toContain("package.cfb_game_of_week");
    expect(sql).toContain("package.nfl_game_of_week");
    expect(sql).toContain("package.status = 'published'");
    expect(sql).toContain("package.published_at is not null");
    expect(sql).toContain("(selected.game->>'kickoff_at')::timestamptz > p_now");
    expect(sql).toContain("(selected.game->>'kickoff_at')::timestamptz <= p_now + interval '1 hour'");
    expect(sql).toContain("'football-gotw-starting:' || v_gotw.week_of::text || ':' || v_gotw.league");
    expect(sql).toContain("upper(v_gotw.league) || ' Game of the Week starts soon'");
    expect(sql).toContain("'football_gotw_starting'");
  });

  it("fixes both incomplete Picks reminders without restricting the current audience", () => {
    expect(sql).toContain("v_event.sport = 'football'");
    expect(sql).toContain("then '/football/picks' else '/picks' end");
    expect(sql).toContain("Finish any remaining picks before their games kick off.");
    expect(sql).toContain("'picks_incomplete_near_lock'");
    expect(sql).toContain("v_event.locks_at <= p_now + interval '4 hours'");
    expect(sql).toContain("from public.profiles profile");
    expect(sql).toContain("join private.profile_pin_credentials credential");
  });

  it("retires misclassified historic Football kickoff notices without losing push records", () => {
    expect(sql).toContain("set dismissed_at = now(),");
    expect(sql).toContain("read_at = coalesce(read_at, now())");
    expect(sql).toContain("title like 'Football Picks ·% starts soon'");
    expect(sql).toContain("set route = '/football/picks',");
    expect(sql).toContain("summary like 'Football Picks ·%'");
    expect(sql).not.toContain("delete from private.notification_groups");
  });

  it("routes the GOTW and incomplete-pick phone alerts by the opt-in sport", () => {
    expect(sql).toContain("'football_gotw_starting', '/football'");
    expect(sql).toContain("'picks_incomplete_near_lock', '/football/picks'");
    expect(sql).toContain("'picks_incomplete_near_lock', '/picks'");
    expect(sql).toContain("array['football']::text[]");
    expect(sql).toContain("array['ufc']::text[]");
    expect(sql).not.toContain("cron.schedule(");
    expect(sql).not.toContain("net.http_post(");
    expect(notificationKinds).toContain("football_gotw_starting");
    expect(notificationSport({ kind: "football_gotw_starting", route: "/football" })).toBe("football");
    expect(notificationSport({ kind: "football_gotw_starting", route: null })).toBe("football");
    expect(notificationSport({ kind: "picks_incomplete_near_lock", route: "/football/picks" })).toBe("football");
    expect(notificationSport({ kind: "picks_incomplete_near_lock", route: "/picks" })).toBe("ufc");
  });
});

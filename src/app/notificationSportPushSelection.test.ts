import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310326_notification_sport_push_and_nba_readiness.sql", "utf8",
);
const sqlProof = readFileSync(
  "supabase/tests/notification_sport_push_and_nba_readiness.sql", "utf8",
);
const model = readFileSync("src/features/notifications/notificationModel.ts", "utf8");
const repository = readFileSync("src/features/notifications/notificationRepository.ts", "utf8");
const provider = readFileSync("src/features/notifications/NotificationProvider.tsx", "utf8");
const setting = readFileSync("src/features/notifications/NotificationPushSetting.tsx", "utf8");
const center = readFileSync("src/features/notifications/NotificationCenterPage.tsx", "utf8");
const nbaSchedule = readFileSync("src/features/nba/nbaDailySchedule.ts", "utf8");

describe("Draft: safe sport-level device push and NBA preparation", () => {
  it("stores a single private profile-scoped choice for all devices", () => {
    expect(migration).toContain("create table if not exists private.notification_push_sport_preferences");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on private.notification_push_sport_preferences from public, anon, authenticated");
    expect(migration).toContain("v_profile uuid := auth.uid()");
    expect(migration).toContain("get_my_notification_push_sports");
    expect(migration).toContain("set_my_notification_push_sports");
    expect(migration).toContain("grant execute on function public.get_my_notification_push_sports() to authenticated");
    expect(migration).toContain("grant execute on function public.set_my_notification_push_sports(boolean,boolean,boolean,boolean) to authenticated");
    expect(repository).toContain('client.rpc("get_my_notification_push_sports")');
    expect(repository).toContain('client.rpc("set_my_notification_push_sports"');
    expect(repository).not.toContain("localStorage");
  });

  it("keeps legacy sports opted in, with future NBA off by default", () => {
    expect(model).toContain("ufc: true");
    expect(model).toContain("football: true");
    expect(model).toContain("mlb: true");
    expect(model).toContain("nba: false");
    expect(migration).toContain("nba boolean not null default false");
    expect(sqlProof).toContain('{"ufc":true,"football":true,"mlb":true,"nba":false}');
    expect(nbaSchedule).toContain("NBA_OFFICIAL_GAMES_RELEASE_READY = false");
  });

  it("suppresses device push server-side without filtering the in-app feed", () => {
    expect(migration).toContain("private.notification_push_sports_for_group");
    expect(migration).toContain("private.notification_push_sport_preferences");
    expect(migration).toContain("v_notification.category <> 'operations'");
    expect(migration).toContain("cardinality(v_visible_sports) = 0");
    expect(migration).toContain("return jsonb_build_object('notification', null, 'deliveries', '[]'::jsonb)");
    expect(migration).toContain("v_push_title");
    expect(migration).toContain("v_push_summary");
    expect(migration).not.toContain("cron.schedule");
    expect(provider).not.toContain("setInterval");
    expect(center).toContain("notifications.items");
    expect(center).toContain("visibleItems");
    expect(setting).toContain("In-app notifications are unaffected.");
  });

  it("prevents combined reminders from mentioning disabled sports in phone push", () => {
    expect(migration).toContain("p_aggregation_key = 'daily-closing-combined'");
    expect(migration).toContain("v_visible_sports");
    expect(migration).toContain("v_push_summary := 'Your '");
    expect(sqlProof).toContain("combined push leaked muted sports or modified the inbox");
    expect(sqlProof.trimEnd()).toMatch(/rollback;$/);
  });

  it("prepares NBA kinds without enabling public daily notifications", () => {
    for (const kind of ["nba_launch_available", "nba_daily_available", "nba_daily_four_hours", "nba_results_ready"]) {
      expect(model).toContain(kind);
      expect(migration).toContain("'" + kind + "'");
    }
    expect(migration).toContain("notification_groups_kind_valid");
    expect(migration).toContain("notification_category_for_kind");
    expect(migration).toContain("notification_priority_for_kind");
    expect(nbaSchedule).toContain('NBA_GAMES_LAUNCH_DAY = "2026-11-01"');
    expect(sqlProof).toContain("future NBA push opted in without user approval");
  });

  it("keeps the bell in control, and existing profile is only a secondary shortcut", () => {
    expect(setting).toContain('role="switch"');
    expect(setting).toContain('className="notification-push-control__choices"');
    expect(setting).toContain("notifications.updatePushSports");
    expect(center).toContain("<NotificationPushSetting compact />");
    expect(center).not.toContain("OPEN PROFILE");
    expect(provider).toContain("refreshPushSports");
  });
});

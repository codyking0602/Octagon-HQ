import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { defaultNotificationPushSports, notificationSport, pushNotificationSports } from "../features/notifications/notificationModel";

const migration = readFileSync(
  "supabase/migrations/202612310326_notification_sport_push_controls.sql", "utf8",
);
const provider = readFileSync("src/features/notifications/NotificationProvider.tsx", "utf8");
const repository = readFileSync("src/features/notifications/notificationRepository.ts", "utf8");
const inbox = readFileSync("src/features/notifications/NotificationCenterPage.tsx", "utf8");
const pushControl = readFileSync("src/features/notifications/NotificationPushSetting.tsx", "utf8");
const pushFn = readFileSync("supabase/functions/deliver-notification-push/index.ts", "utf8");
const existingPrefs = readFileSync(
  "supabase/migrations/202608200026_notification_bell_independent_of_push.sql", "utf8",
);

describe("notification sport push controls — draft contract", () => {
  it("provides four opt-in sport options for new members", () => {
    expect(pushNotificationSports).toEqual(["ufc", "football", "mlb", "nba"]);
    expect(defaultNotificationPushSports).toEqual({
      ufc: false, football: false, mlb: false, nba: false,
    });
    expect(notificationSport({ kind: "new_game_available", route: "/?hq-reveal=basketball-2026" }))
      .toBe("nba");
  });

  it("saves preferences against the current profile, never browser storage or another inbox", () => {
    expect(migration).toContain("create table if not exists private.notification_push_sports");
    expect(migration).toContain("alter table private.notification_push_sports enable row level security");
    expect(migration).toContain("revoke all on private.notification_push_sports from public, anon, authenticated");
    expect(migration).toContain("v_id uuid := auth.uid()");
    expect(migration).toContain("from private.notification_push_subscriptions subscription");
    expect(migration).toContain("where subscription.enabled");
    expect(migration).toContain("private.notification_push_selection");
    expect(migration).toContain("grant execute on function public.get_my_notification_push_sports() to authenticated");
    expect(repository).toContain('client.rpc("get_my_notification_push_sports")');
    expect(repository).toContain('client.rpc("set_my_notification_push_sports"');
    expect(repository).not.toContain("localStorage");
    expect(provider).toContain("pushSportRevisionRef");
  });

  it("filters at both enqueue and service-owned claim, never by client-only CSS", () => {
    expect(migration).toContain("create or replace function private.enqueue_notification_push_delivery()");
    expect(migration).toContain("create or replace function public.claim_notification_push_delivery(");
    expect(migration.match(/private.notification_push_selection\(/g)?.length).toBeGreaterThanOrEqual(3);
    expect(migration).toContain("v_selection->>'allowed'");
    expect(migration).toContain("v_selection->>'summary'");
    expect(migration).toContain("if cardinality(v_selected) = 0 then");
    expect(pushFn).toContain('claim_notification_push_delivery');
  });

  it("never leaks excluded sports in combined Daily phone alert copy", () => {
    expect(migration).toContain("p_aggregation_key = 'daily-closing-combined'");
    expect(migration).toContain("cardinality(v_selected) < cardinality(v_sports)");
    expect(migration).toContain("v_summary := 'Your ' || v_selected[1]");
    expect(migration).toContain("v_text ~ '(^|[^A-Z])UFC([^A-Z]|$)'");
    expect(migration).toContain("v_text ~ '(^|[^A-Z])NBA([^A-Z]|$)'");
  });

  it("maintains every canonical in-app notification, unread count, and read operations", () => {
    expect(existingPrefs).toContain("in-app bell notifications are always enabled");
    expect(inbox).toContain("notifications.markAllRead()");
    expect(inbox).toContain("notifications.clearRead()");
    expect(inbox).toContain("notifications.markRead(item.id)");
    expect(inbox).toContain("notificationSport(item) === sportFilter");
    expect(migration).not.toContain("delete from private.notification_groups");
    expect(migration).not.toContain("update private.notification_groups");
    expect(pushControl).toContain("In-app notifications are unaffected.");
  });

  it("prepares the four dormant NBA notification kinds without starting producers", () => {
    for (const kind of ["nba_launch_available", "nba_daily_available", "nba_daily_four_hours", "nba_results_ready"]) {
      expect(migration).toContain("'" + kind + "'");
    }
    expect(migration).toContain("notification_groups_kind_valid");
    expect(migration).toContain("notification_category_for_kind");
    expect(migration).toContain("notification_priority_for_kind");
  });

  it("does not create a new notification scheduler or send messages in the migration", () => {
    expect(migration).not.toContain("cron.schedule");
    expect(migration).not.toContain("publish_notification_to_profile(");
    expect(migration).not.toContain("create trigger");
    expect(migration).not.toContain("insert into private.notification_groups");
  });
});

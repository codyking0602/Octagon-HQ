import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const originalMigration = readFileSync(
  "supabase/migrations/202608200023_notification_preferences_and_push_readiness.sql",
  "utf8",
);
const privilegeMigration = readFileSync(
  "supabase/migrations/202608200024_notification_preferences_private_privileges.sql",
  "utf8",
);
const simplificationMigration = readFileSync(
  "supabase/migrations/202608200026_notification_bell_independent_of_push.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/notifications/notificationRepository.ts",
  "utf8",
);
const provider = readFileSync(
  "src/features/notifications/NotificationProvider.tsx",
  "utf8",
);
const center = readFileSync(
  "src/features/notifications/NotificationCenterPage.tsx",
  "utf8",
);
const profilePush = readFileSync(
  "src/features/notifications/NotificationPushSetting.tsx",
  "utf8",
);
const appShell = readFileSync("src/app/AppShell.tsx", "utf8");
const readiness = readFileSync(
  "src/features/notifications/notificationDeviceReadiness.ts",
  "utf8",
);
const manifest = readFileSync("public/app.webmanifest", "utf8");
const serviceWorker = readFileSync("public/push-readiness-sw.js", "utf8");
const indexHtml = readFileSync("index.html", "utf8");

const parsedManifest = JSON.parse(manifest) as Record<string, unknown>;

describe("notification settings simplification", () => {
  it("keeps the original private preference storage inaccessible to browser code", () => {
    expect(originalMigration).toContain("create table if not exists private.notification_preferences");
    expect(originalMigration).toContain(
      "revoke all on private.notification_preferences from public, anon, authenticated",
    );
    expect(privilegeMigration).toContain(
      "revoke all on function private.notification_preference_enabled(uuid, text)",
    );
    expect(repository).not.toContain("localStorage");
    expect(provider).not.toContain("localStorage");
  });

  it("makes the in-app bell independent of the old category preferences", () => {
    expect(simplificationMigration).toContain("picks_reminders = true");
    expect(simplificationMigration).toContain("daily_challenge_reminders = true");
    expect(simplificationMigration).toContain("game_challenge_activity = true");
    expect(simplificationMigration).toContain("war_room_activity = true");
    expect(simplificationMigration).toContain(
      "create or replace function private.notification_preference_enabled",
    );
    expect(simplificationMigration).toContain("return true;");
    expect(simplificationMigration).toContain("in-app bell notifications are always enabled");
    expect(simplificationMigration).not.toContain("cron.schedule");
    expect(simplificationMigration).not.toContain("create table");
  });

  it("keeps the notification center focused only on the bell feed", () => {
    expect(center).toContain("Personal updates, reminders, and actions from across the app.");
    expect(center).toContain("Mark all as read");
    expect(center).toContain("notification-list");
    expect(center).not.toContain("What should reach you?");
    expect(center).not.toContain("Picks reminders");
    expect(center).not.toContain("Daily Challenge");
    expect(center).not.toContain("Game challenges");
    expect(center).not.toContain("War Room activity");
    expect(center).not.toContain("Device notifications");
  });

  it("places one push-only switch on the signed-in member profile route", () => {
    expect(appShell).toContain("ProfilePushSettingRoute");
    expect(appShell).toContain("memberProfilePath(identity.profile.displayName)");
    expect(appShell).toContain("<NotificationPushSetting />");
    expect(profilePush).toContain("Push notifications");
    expect(profilePush).toContain('role="switch"');
    expect(profilePush).toContain("notifications.enableDevicePush()");
    expect(profilePush).toContain("notifications.disableDevicePush()");
    expect(profilePush).toContain("Bell notifications still appear inside Octagon HQ.");
    expect(profilePush).not.toContain("picksReminders");
    expect(profilePush).not.toContain("dailyChallengeReminders");
    expect(profilePush).not.toContain("gameChallengeActivity");
    expect(profilePush).not.toContain("warRoomActivity");
  });

  it("does not show a failed initial state before permission or a connection attempt", () => {
    expect(profilePush).toContain("attemptedConnection");
    expect(profilePush).toContain('readiness.permission === "default"');
    expect(profilePush).toContain('? "off"');
    expect(profilePush).toContain("The last connection attempt did not finish");
  });

  it("keeps installability and passive readiness detection intact", () => {
    expect(parsedManifest.name).toBe("Octagon HQ");
    expect(parsedManifest.display).toBe("standalone");
    expect(parsedManifest.start_url).toBe("/");
    expect(indexHtml).toContain('<link rel="manifest" href="/app.webmanifest"');
    expect(indexHtml).toContain('name="apple-mobile-web-app-capable"');
    expect(readiness).toContain('navigator.serviceWorker.register("/push-readiness-sw.js"');
    expect(readiness).toContain('"PushManager" in window');
    expect(readiness).toContain('"Notification" in window');
    expect(readiness).not.toContain("Notification.requestPermission");
    expect(serviceWorker).toContain('addEventListener("push"');
    expect(serviceWorker).toContain('addEventListener("notificationclick"');
    expect(profilePush).toContain("Add Octagon HQ to your Home Screen");
  });
});

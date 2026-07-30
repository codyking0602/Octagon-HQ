import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200022_notification_preferences_and_push_readiness.sql",
  "utf8",
);
const privilegeMigration = readFileSync(
  "supabase/migrations/202608200023_notification_preferences_private_privileges.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/notification_preferences_and_push_readiness.sql",
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
const page = readFileSync(
  "src/features/notifications/NotificationCenterPage.tsx",
  "utf8",
);
const readiness = readFileSync(
  "src/features/notifications/notificationDeviceReadiness.ts",
  "utf8",
);
const manifest = readFileSync("public/app.webmanifest", "utf8");
const serviceWorker = readFileSync("public/push-readiness-sw.js", "utf8");
const indexHtml = readFileSync("index.html", "utf8");
const contract = readFileSync(
  "docs/notification-preferences-and-push-readiness.md",
  "utf8",
);

const parsedManifest = JSON.parse(manifest) as Record<string, unknown>;

describe("notification preferences and push readiness", () => {
  it("stores one private cross-device preference set", () => {
    expect(migration).toContain("create table if not exists private.notification_preferences");
    expect(migration).toContain("picks_reminders boolean not null default true");
    expect(migration).toContain("daily_challenge_reminders boolean not null default true");
    expect(migration).toContain("game_challenge_activity boolean not null default true");
    expect(migration).toContain("war_room_activity boolean not null default true");
    expect(migration).toContain("create or replace function public.get_my_notification_preferences");
    expect(migration).toContain("create or replace function public.set_my_notification_preferences");
    expect(repository).toContain('client.rpc("get_my_notification_preferences"');
    expect(repository).toContain('client.rpc("set_my_notification_preferences"');
    expect(repository).not.toContain("localStorage");
    expect(contract).toContain("follow the member across devices");
  });

  it("maps only optional kinds and preserves critical actions", () => {
    expect(migration).toContain("private.notification_preference_key_for_kind");
    expect(migration).toContain("'picks_incomplete_near_lock', 'ufc_event_starting'");
    expect(migration).toContain("v_kind = 'daily_challenge_four_hours'");
    expect(migration).toContain("'game_challenge_received'");
    expect(migration).toContain("'war_room_mention', 'war_room_reply', 'war_room_invite_accepted'");
    expect(migration).toContain("return null;");
    expect(page).toContain("Critical actions");
    expect(page).toContain("ALWAYS ON");
    expect(integrationSql).toContain("critical action was incorrectly suppressed");
    expect(integrationSql).toContain("owner operation was incorrectly suppressed");
  });

  it("keeps preference suppression inside the canonical publisher", () => {
    expect(migration).toContain("create or replace function private.publish_notification_to_profile");
    expect(migration).toContain("private.notification_preference_enabled");
    expect(migration).toContain("'suppressed', true");
    expect(migration).not.toContain("create table if not exists public.notification");
    expect(migration).not.toContain("cron.schedule");
    expect(integrationSql).toContain("suppressed optional activity created a source event");
    expect(integrationSql).toContain("re-enabled optional activity did not publish");
    expect(contract).toContain("There is no retroactive delivery");
  });

  it("keeps private helper and table privileges out of the browser", () => {
    expect(migration).toContain(
      "revoke all on private.notification_preferences from public, anon, authenticated",
    );
    expect(privilegeMigration).toContain(
      "revoke all on function private.notification_preference_key_for_kind(text)",
    );
    expect(privilegeMigration).toContain(
      "revoke all on function private.notification_preference_enabled(uuid, text)",
    );
    expect(integrationSql).toContain(
      "authenticated clients can invoke the private preference evaluator",
    );
    expect(integrationSql).toContain(
      "authenticated role can access private notification preferences directly",
    );
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });

  it("places four accessible optional switches in the existing center", () => {
    expect(page).toContain('key: "picksReminders"');
    expect(page).toContain('key: "dailyChallengeReminders"');
    expect(page).toContain('key: "gameChallengeActivity"');
    expect(page).toContain('key: "warRoomActivity"');
    expect(page).toContain('role="switch"');
    expect(page).toContain("aria-checked={enabled}");
    expect(provider).toContain("repository.savePreferences(nextPreferences)");
    expect(provider).toContain("preferenceStatus");
    expect(provider).not.toContain("setInterval");
  });

  it("publishes installability and reports readiness without enabling push", () => {
    expect(parsedManifest.name).toBe("Octagon HQ");
    expect(parsedManifest.display).toBe("standalone");
    expect(parsedManifest.start_url).toBe("/");
    expect(indexHtml).toContain('<link rel="manifest" href="/app.webmanifest"');
    expect(indexHtml).toContain('name="apple-mobile-web-app-capable"');
    expect(readiness).toContain('navigator.serviceWorker.register("/push-readiness-sw.js"');
    expect(readiness).toContain('"PushManager" in window');
    expect(readiness).toContain('"Notification" in window');
    expect(readiness).toContain("beforeinstallprompt");
    expect(readiness).toContain("promptNotificationAppInstall");
    expect(page).toContain("Device delivery is not active yet");
    expect(page).toContain("Share → Add to Home Screen");
    expect(page).toContain("Permission has not been requested yet");
  });

  it("keeps the readiness worker inert until the final delivery PR", () => {
    expect(serviceWorker).toContain('addEventListener("install"');
    expect(serviceWorker).toContain('addEventListener("activate"');
    expect(serviceWorker).not.toContain('addEventListener("push"');
    expect(serviceWorker).not.toContain('addEventListener("notificationclick"');
    expect(readiness).not.toContain("Notification.requestPermission");
    expect(readiness).not.toContain("pushManager.subscribe");
    expect(readiness).not.toContain("applicationServerKey");
    expect(contract).toContain("Device delivery is not active after this PR");
    expect(contract).toContain("Actual device push registration and delivery — final PR");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pushConnection = readFileSync(
  "src/features/notifications/notificationDevicePush.ts",
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
const migration = readFileSync(
  "supabase/migrations/202608200031_notification_read_history_cleanup.sql",
  "utf8",
);

describe("notification reliability repair", () => {
  it("repairs stale push connections without overriding an explicit device opt-out", () => {
    expect(pushConnection).toContain("subscription.options.applicationServerKey");
    expect(pushConnection).toContain("if (!existingKey) return false");
    expect(pushConnection).toContain("subscriptionUsesPublicKey(existing, publicKey)");
    expect(pushConnection).toContain("await existing.unsubscribe().catch(() => false)");
    expect(pushConnection).toContain("usableExistingSubscription(registration, publicKey)");
    expect(pushConnection).not.toContain("if (!existingKey) return true");

    expect(pushConnection).toContain('pushIntentStorageKey = "octagon-notification-push-intent"');
    expect(pushConnection).toContain('window.localStorage.getItem(pushIntentStorageKey)');
    expect(pushConnection).toContain('window.localStorage.setItem(pushIntentStorageKey, intent)');
    expect(pushConnection).not.toContain("subscription.endpoint, intent");
    expect(pushConnection).not.toContain("subscription.p256dh");
    expect(pushConnection).not.toContain("subscription.auth");

    expect(provider).toContain("getNotificationDevicePushIntent()");
    expect(provider).toContain('pushIntent === "enabled"');
    expect(provider).toContain("pushIntent === null && pushStatus.activeDeviceCount > 0");
    expect(provider).toContain("!pushStatus.currentDeviceRegistered");
    expect(provider).toContain('readiness.permission === "granted"');
    expect(provider).toContain("await repository.loadPushConfiguration()");
    expect(provider).toContain("await repository.registerPushSubscription(connected.input)");
    expect(provider).toContain('setNotificationDevicePushIntent("enabled")');
    expect(provider).toContain('setNotificationDevicePushIntent("disabled")');
    expect(provider).not.toContain("setInterval");
  });

  it("adds one canonical clear-read action without deleting idempotency history", () => {
    expect(repository).toContain("clearRead: () => Promise<number>");
    expect(repository).toContain('client.rpc("dismiss_read_notifications")');
    expect(provider).toContain("clearRead: () => Promise<boolean>");
    expect(provider).toContain("current.filter((item) => !item.isRead)");
    expect(page).toContain("Clear read");
    expect(page).toContain("notifications.clearRead()");
    expect(migration).toContain("add column if not exists dismissed_at timestamptz");
    expect(migration).toContain("create or replace function public.dismiss_read_notifications()");
    expect(migration).toContain("notification.read_at >= now() - interval '30 days'");
    expect(migration).toContain("notification_group_reopen_clears_dismissal");
    expect(migration).not.toContain("delete from private.notification_groups");
  });

  it("keeps read cleanup private and lets new activity reopen a dismissed group", () => {
    expect(migration).toContain("v_profile_id uuid := auth.uid()");
    expect(migration).toContain("notification.recipient_profile_id = v_profile_id");
    expect(migration).toContain("new.dismissed_at := null");
    expect(migration).toContain("grant execute on function public.dismiss_read_notifications() to authenticated");
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });
});

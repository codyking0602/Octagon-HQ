import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/notifications/NotificationCenterPage.tsx", "utf8");
const header = readFileSync("src/features/notifications/NotificationHeaderAction.tsx", "utf8");
const provider = readFileSync("src/features/notifications/NotificationProvider.tsx", "utf8");
const repository = readFileSync("src/features/notifications/notificationRepository.ts", "utf8");
const pushSetting = readFileSync("src/features/notifications/NotificationPushSetting.tsx", "utf8");
const providers = readFileSync("src/app/providers.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const shell = readFileSync("src/app/AppShell.tsx", "utf8");

describe("PR 13 universal notification ownership", () => {
  it("frames the existing inbox as The HQ and renders every sport through one list", () => {
    expect(center).toContain('<p className="eyebrow">THE HQ</p>');
    expect(center).toContain("UFC, Football, and account updates in one inbox.");
    expect(center).toContain("notifications.items.map((item) => <NotificationRow");
    expect(center).toContain("data-notification-sport={sport ?? \"universal\"}");
    expect(center).not.toContain("YOUR OCTAGON HQ");
  });

  it("keeps unread count and header entry on the canonical NotificationProvider", () => {
    expect(header).toContain("useNotifications()");
    expect(header).toContain("notifications.unreadCount");
    expect(shell.match(/<NotificationHeaderAction\s*\/>/g)).toHaveLength(1);
    expect(providers.match(/<NotificationProvider(?:\s|>)/g)).toHaveLength(1);
  });

  it("keeps settings and push registration on the existing notification owner", () => {
    expect(pushSetting).toContain("useNotifications()");
    expect(pushSetting).toContain("notifications.enableDevicePush()");
    expect(pushSetting).toContain("notifications.disableDevicePush()");
    expect(provider).toContain("updatePreference");
    expect(repository).toContain("savePreferences");
    expect(shell.match(/<NotificationPushSetting\s*\/>/g)).toHaveLength(1);
  });

  it("does not introduce a second repository, snapshot query, route, or initialization", () => {
    expect(provider.match(/createNotificationRepository\(/g)).toHaveLength(1);
    expect(repository.match(/get_notification_snapshot/g)).toHaveLength(1);
    expect(router.match(/path: \"notifications\"/g)).toHaveLength(1);
    expect(providers.match(/<NotificationProvider(?:\s|>)/g)).toHaveLength(1);
  });
});

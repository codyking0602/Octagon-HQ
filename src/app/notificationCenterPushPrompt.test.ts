import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/notifications/NotificationCenterPage.tsx", "utf8");
const pushControl = readFileSync("src/features/notifications/NotificationPushSetting.tsx", "utf8");
const styles = readFileSync("src/styles/notification-push-prompt.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

describe("notification bell direct push controls", () => {
  it("enables device alerts directly in the bell without forcing Profile navigation", () => {
    expect(center).toContain("<NotificationPushSetting compact />");
    expect(center).not.toContain("memberProfilePath(");
    expect(center).not.toContain("OPEN PROFILE");
    expect(pushControl).toContain('role="switch"');
    expect(pushControl).toContain("notifications.enableDevicePush()");
    expect(pushControl).toContain("notifications.disableDevicePush()");
  });

  it("keeps the iPhone permission prompt tied to the switch's user tap", () => {
    expect(pushControl).toContain("requestNotificationDevicePermission()");
    expect(pushControl).toContain('readiness.isIos && !readiness.installed');
    expect(pushControl).toContain("Add The HQ to your Home Screen");
    expect(pushControl).toContain('effectiveStatus === "blocked"');
    expect(pushControl).toContain("Your in-app inbox still works.");
  });

  it("exposes distinct sport choices and a separate inbox filter", () => {
    expect(pushControl).toContain('notifications.updatePushSports("all", !allSelected)');
    expect(pushControl).toContain('notifications.updatePushSports(sport, !notifications.pushSports[sport])');
    expect(center).toContain("Filter in-app notifications by sport");
    expect(center).toContain("visibleItems.map((item)");
    expect(pushControl).toContain("In-app notifications are unaffected.");
  });

  it("retains sport colors and compact iPhone layout", () => {
    expect(main).toContain('import "./styles/notification-push-prompt.css"');
    expect(styles).toContain(".notification-push-control--compact");
    expect(styles).toContain(".notification-push-sport.is-selected");
    expect(styles).toContain(".notification-feed-filter.is-selected");
    expect(styles).toContain("@media (max-width: 520px)");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync(
  "src/features/notifications/NotificationCenterPage.tsx",
  "utf8",
);
const profileSetting = readFileSync(
  "src/features/notifications/NotificationPushSetting.tsx",
  "utf8",
);
const styles = readFileSync("src/styles/notification-push-prompt.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

describe("Notification Center push profile prompt", () => {
  it("routes push setup to the signed-in member's existing profile", () => {
    expect(center).toContain("memberProfilePath(identity.profile.displayName)");
    expect(center).toContain('notifications.devicePush.status');
    expect(center).toContain('status === "off"');
    expect(center).toContain("Turn on push notifications");
    expect(center).toContain("OPEN PROFILE");
  });

  it("gives accurate profile guidance for failed or blocked delivery", () => {
    expect(center).toContain('status === "error"');
    expect(center).toContain("Push notifications need attention");
    expect(center).toContain("RETRY IN PROFILE");
    expect(center).toContain('status === "blocked"');
    expect(center).toContain("Push notifications are blocked");
  });

  it("keeps the one actual push switch on Profile", () => {
    expect(center).not.toContain('role="switch"');
    expect(profileSetting).toContain('role="switch"');
    expect(profileSetting).toContain("notifications.enableDevicePush()");
    expect(profileSetting).toContain("notifications.disableDevicePush()");
  });

  it("loads a compact dedicated prompt treatment", () => {
    expect(main).toContain('import "./styles/notification-push-prompt.css"');
    expect(styles).toContain(".notification-push-profile-prompt");
    expect(styles).toContain("grid-template-columns: 42px minmax(0, 1fr) auto");
    expect(styles).toContain("@media (max-width: 520px)");
  });
});

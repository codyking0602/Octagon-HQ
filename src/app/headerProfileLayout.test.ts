import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const identityCss = readFileSync("src/styles/identity.css", "utf8");
const globalCss = readFileSync("src/styles/global.css", "utf8");
const appShell = readFileSync("src/app/AppShell.tsx", "utf8");

describe("universal header profile layout", () => {
  it("keeps a larger 62px rounded-square avatar visible on mobile", () => {
    expect(identityCss).toContain(".app-header--universal .identity-trigger.is-ready span { display: none; }");
    expect(identityCss).toContain(".app-header--universal .identity-trigger.is-ready > .identity-trigger__photo");
    expect(identityCss).toContain("width: 62px; min-width: 62px; max-width: 62px; height: 62px;");
    expect(identityCss).toContain("border-radius: 17px; background: transparent;");
    expect(identityCss).toContain("border: 2px solid rgba(255, 255, 255, .78)");
  });

  it("retains the HQ brand and notifications, but removes the question-mark action", () => {
    expect(appShell).toContain("<BackRoomLogoLink enabled={location.pathname === \"/play\"} />");
    expect(appShell).toContain("<NotificationHeaderAction />");
    expect(appShell).toContain("<IdentityControl />");
    expect(appShell).not.toContain("app-ask-action");
    expect(appShell).not.toContain('aria-label="Open UFC Intelligence"');
    expect(globalCss).toContain("min-height: calc(70px + var(--safe-top))");
    expect(globalCss).toContain("background: transparent;");
    expect(globalCss).toContain(".app-header--universal .app-notification-action:focus-visible");
  });
});

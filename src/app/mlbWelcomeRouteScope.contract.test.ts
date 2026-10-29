import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("src/app/AppShell.tsx", "utf8");

describe("MLB welcome takeover route scope", () => {
  it("keeps the MLB welcome off Home after the 2026 offseason closeout", () => {
    const condition = shell.slice(shell.indexOf("const showMlbWelcome"), shell.indexOf("const mlbWelcomeMode"));
    expect(condition).toContain('location.pathname === "/mlb"');
    expect(condition).not.toContain('location.pathname === "/"');
    expect(shell).toContain("<MlbPlayoffsWelcomeTakeover");
  });

  it("does not make Notifications or game deep links part of the welcome condition", () => {
    const condition = shell.slice(
      shell.indexOf("const showMlbWelcome"),
      shell.indexOf("const mlbWelcomeMode"),
    );
    expect(condition).not.toContain("/notifications");
    expect(condition).not.toContain("/mlb/challenge");
    expect(condition).not.toContain("/play/");
  });
});

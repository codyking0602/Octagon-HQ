import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const shell = readFileSync("src/app/AppShell.tsx", "utf8");

describe("MLB welcome takeover route scope", () => {
  it("shows only on Home or the MLB landing page", () => {
    expect(shell).toContain('location.pathname === "/" || location.pathname === "/mlb"');
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

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/features/back-room/FootballGmHeadToHeadPage.tsx", "utf8");

describe("GM multiplayer egress guardrails", () => {
  it("retains five-second live-turn syncing but skips background or settled matches", () => {
    expect(source).toContain("window.setInterval(() => {");
    expect(source).toContain('document.visibilityState !== "visible" || matchFinished');
    expect(source).toContain("}, 5_000);");
    expect(source).toContain('next.phase === "complete"');
    expect(source).toContain("Boolean(next.completed_at || next.declined_at)");
  });

  it("avoids duplicate in-flight requests and focus/visibility double refreshes", () => {
    expect(source).toContain("if (!active || inFlight) return;");
    expect(source).toContain("lastSyncedAt = Date.now();");
    expect(source).toContain("Date.now() - lastSyncedAt < 5_000");
    expect(source).toContain('window.addEventListener("focus", onFocus)');
    expect(source).toContain('document.addEventListener("visibilitychange", onFocus)');
    expect(source).toContain('document.removeEventListener("visibilitychange", onFocus)');
  });
});

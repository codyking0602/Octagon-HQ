import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const handoff = readFileSync("docs/HANDOFF.md", "utf8");
const monitoringInbox = readFileSync(
  "src/features/picks-monitoring/MonitoringInboxPage.tsx",
  "utf8",
);

describe("current Octagon HQ handoff and monitoring copy", () => {
  it("does not embed a brittle production main SHA", () => {
    expect(handoff).toContain("Resolve the current `main` HEAD from GitHub before every branch");
    expect(handoff).not.toContain("Current production `main` SHA:");
  });

  it("records the merged Picks capabilities and the next controlled-card phase", () => {
    expect(handoff).toContain("Automatic validated pre-lock sportsbook odds applied");
    expect(handoff).toContain("Fight Night Control for official result entry and event completion");
    expect(handoff).toContain("Completed-event recaps");
    expect(handoff).toContain("## Current major phase — controlled live-card changes");
    expect(handoff).toContain("### 1. Approved cancelled-fight handling");
    expect(handoff).toContain("### 2. Fighter-replacement handling");
    expect(handoff).toContain("### 3. Reorder and removal handling");
    expect(handoff).toContain("### 4. Audited post-lock corrections");
  });

  it("distinguishes automatic odds from owner-reviewed card changes", () => {
    expect(monitoringInbox).toContain(
      "Eligible pre-lock odds apply automatically. Event-card changes stay review-only and are never published automatically.",
    );
    expect(monitoringInbox).not.toContain(
      "Findings stay here for review; nothing is applied or published automatically.",
    );
  });
});

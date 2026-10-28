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

  it("records current Picks, Football Daily, and stabilization ownership", () => {
    expect(handoff).toContain("Automatic validated pre-lock sportsbook odds applied");
    expect(handoff).toContain("ESPN live-state-aware Fight Night behavior");
    expect(handoff).toContain("current five-minute cadence (`*/5 * * * *`)");
    expect(handoff).toContain("## Football Today's Challenge");
    expect(handoff).toContain("shared `daily-challenge-runtime` owns private setup/actions/grading");
    expect(handoff).toContain("## Stabilization priority");
    expect(handoff).not.toContain("## Current major phase — controlled live-card changes");
    expect(handoff).not.toContain("cron job at minute 7 of each hour");
  });

  it("distinguishes automatic odds, structured approvals, and review-only findings", () => {
    expect(monitoringInbox).toContain(
      "Eligible pre-lock odds continue to apply automatically. These UFC card changes use the existing owner-approved mutation path only after final confirmation.",
    );
    expect(monitoringInbox).toContain(
      "These findings do not have a supported live-card repair action. Dismissing one records the review without implying a backend fix.",
    );
    expect(monitoringInbox).not.toContain(
      "Event-card changes stay review-only and are never published automatically.",
    );
  });
});

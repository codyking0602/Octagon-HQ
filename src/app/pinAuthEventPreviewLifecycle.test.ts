import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const verifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("production WebKit Event Setup lifecycle proof", () => {
  it("observes the actual sync response instead of assuming one completed card", () => {
    expect(verifier).toContain("page.waitForResponse(");
    expect(verifier).toContain('previewResponse.status() === 200');
    expect(verifier).toContain('previewResponse.status() === 502');
    expect(verifier).toContain("assertSafeEventSourceRollover(previewBody)");
    expect(verifier).not.toContain("446488");
    expect(verifier).not.toContain("Belgrade Arena");
    expect(verifier).not.toContain("Uroš Medić vs. Daniel Rodriguez");
  });

  it("proves the fail-closed rollover remains staged and unapplied inside the visible setup owner", () => {
    expect(verifier).toContain('const setupSection = page.locator("#setup")');
    expect(verifier).toContain('setupSection.getByText("STAGED CARD · NOT LIVE").waitFor');
    expect(verifier).toContain('setupSection.getByText("SOURCE REVIEW · NOT APPLIED").waitFor');
    expect(verifier).toContain("Event Setup opened a source review after the backend rejected the event identity.");
    expect(verifier).toContain("Event Setup changed the persisted source field after a safe source rollover rejection.");
  });

  it("still proves the visible live owner surface and exact deployment markers", () => {
    expect(verifier).toContain('const monitoringSection = page.locator("#monitoring")');
    expect(verifier).toContain('monitoringSection.getByRole("button", { name: "RUN CHECK NOW" }).waitFor');
    expect(verifier).toContain('monitoringSection.getByRole("button", { name: "REFRESH INBOX" }).waitFor');
    expect(verifier).not.toContain('page.getByRole("heading", { name: "Monitoring Inbox", exact: true })');
    expect(verifier).toContain("expectedDeploymentSha");
    expect(verifier).toContain("expectedSyncSourceSha");
    expect(verifier).toContain("Temporary Event Setup owner grant");
  });
});

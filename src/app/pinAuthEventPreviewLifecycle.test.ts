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

  it("uses the current visible unified Event Setup boundary", () => {
    expect(verifier).toContain('page.getByRole("region", { name: "Card scope" })');
    expect(verifier).toContain('page.getByRole("heading", { name: "Choose what counts", exact: true })');
    expect(verifier).not.toContain('page.getByRole("heading", { name: "Event Setup" })');
  });

  it("proves the fail-closed rollover remains staged and unapplied", () => {
    expect(verifier).toContain('page.getByText("STAGED CARD · NOT LIVE")');
    expect(verifier).toContain('page.getByText("SOURCE REVIEW · NOT APPLIED")');
    expect(verifier).toContain("Event Setup opened a source review after the backend rejected the event identity.");
    expect(verifier).toContain("Event Setup changed the persisted source field after a safe source rollover rejection.");
  });

  it("still proves the live owner-only surfaces and exact deployment markers", () => {
    expect(verifier).toContain('const monitoringRegion = page.getByRole("region", {');
    expect(verifier).toContain('name: "Automatic monitoring and card review"');
    expect(verifier).toContain("expectedDeploymentSha");
    expect(verifier).toContain("expectedSyncSourceSha");
    expect(verifier).toContain("Temporary Event Setup owner grant");
  });
});

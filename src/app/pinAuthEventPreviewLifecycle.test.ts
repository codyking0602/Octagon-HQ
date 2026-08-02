import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const verifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("production WebKit Picks Control Center lifecycle proof", () => {
  it("follows the legacy setup redirect into the one canonical owner route", () => {
    expect(verifier).toContain("/picks/setup?browser-pin-check=");
    expect(verifier).toContain('url.pathname === "/picks/control"');
    expect(verifier).toContain('url.hash === "#setup"');
    expect(verifier).toContain('page.getByText("PRIVATE PICKS OWNER", { exact: true })');
    expect(verifier).not.toContain("deep link redirected before sign-in");
  });

  it("preserves the canonical destination through real PIN sign-in at 390x844", () => {
    expect(verifier).toContain("viewport: { width: 390, height: 844 }");
    expect(verifier).toContain("Browser PIN login failed");
    expect(verifier).toContain("preserved that canonical destination through owner sign-in at 390x844");
    expect(verifier).toContain("Temporary Picks control owner grant");
  });

  it("resolves the canonical header status before testing the matching visible section owner", () => {
    expect(verifier).toContain('page.locator(".picks-control-center__status")');
    expect(verifier).toContain('"OWNER SIGN-IN REQUIRED", "LOADING CONTROL CENTER", "CHECKING NEXT EVENT"');
    expect(verifier).toContain('status === "CONTROL UNAVAILABLE" || status === "SETUP UNAVAILABLE"');
    expect(verifier).toContain('status === "SET UP NEXT EVENT" || status === "REVIEW CARD"');
    expect(verifier).toContain('status === "PICKS OPEN"');
    expect(verifier).toContain("FIGHT(?:S)? NEED RESULTS|PICKS CLOSED · RESULTS OPEN|EVENT COMPLETE");
    expect(verifier).toContain('page.locator("#setup")');
    expect(verifier).toContain('page.locator("#monitoring")');
    expect(verifier).toContain('page.locator("#fight-night")');
    expect(verifier).toContain('fightNightSection.locator(".picks-control-hero")');
    expect(verifier).toContain("INBOX UNAVAILABLE");
    expect(verifier).toContain("Fight Night Control rendered its unavailable state");
    expect(verifier).not.toContain('{ name: "Event Setup", exact: true }');
    expect(verifier).not.toContain('{ name: "Monitoring Inbox", exact: true }');
    expect(verifier).not.toContain('{ name: "Fight Night Control", exact: true }');
  });

  it("retains actionable diagnostics instead of an opaque lifecycle timeout", () => {
    expect(verifier).toContain("The unified Picks Control Center lifecycle did not resolve. Status: ${status}.");
    expect(verifier).toContain("Headings: ${headings.map");
    expect(verifier).toContain("page.screenshot({ path: screenshotPath, fullPage: true })");
    expect(verifier).toContain("The unified Picks Control Center returned an unrecognized lifecycle status");
  });

  it("remains read-only and verifies the live deployment marker", () => {
    expect(verifier).toContain("expectedDeploymentSha");
    expect(verifier).toContain('setupSection.getByRole("button", { name: "CHECK FOR CARD UPDATES" }).waitFor');
    expect(verifier).toContain('monitoringSection.getByRole("button", { name: "RUN CHECK NOW" }).waitFor');
    expect(verifier).not.toContain("/functions/v1/sync-next-ufc-event");
    expect(verifier).not.toContain("page.waitForResponse(");
    expect(verifier).not.toContain('getByRole("button", { name: "CHECK FOR CARD UPDATES" }).click');
    expect(verifier).not.toContain('getByRole("button", { name: "PUBLISH CARD" }).click');
    expect(verifier).not.toContain('getByRole("button", { name: "RUN CHECK NOW" }).click');
  });
});

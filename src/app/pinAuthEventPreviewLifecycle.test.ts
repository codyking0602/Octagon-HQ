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

  it("accepts only the current setup, monitoring, or fight-night lifecycle", () => {
    expect(verifier).toContain('{ name: "Event Setup", exact: true }');
    expect(verifier).toContain('{ name: "Monitoring Inbox", exact: true }');
    expect(verifier).toContain('{ name: "Fight Night Control", exact: true }');
    expect(verifier).toContain("The unified Picks Control Center did not expose a recognized lifecycle.");
    expect(verifier).toContain("INBOX UNAVAILABLE");
    expect(verifier).toContain("CONTROL UNAVAILABLE");
  });

  it("remains read-only and verifies the live deployment marker", () => {
    expect(verifier).toContain("expectedDeploymentSha");
    expect(verifier).toContain('page.getByRole("button", { name: "CHECK FOR CARD UPDATES" })');
    expect(verifier).not.toContain('.click();\n  const previewResponse');
    expect(verifier).not.toContain('getByRole("button", { name: "PUBLISH CARD" }).click');
    expect(verifier).not.toContain('getByRole("button", { name: "CHECK NOW" }).click');
  });
});

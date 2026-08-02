import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync("src/app/router.tsx", "utf8");
const verifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("production Picks Control Center WebKit verification", () => {
  it("keeps the legacy owner links as safe redirects to the one canonical route", () => {
    expect(router).toContain('{ path: "picks/setup", element: <Navigate to="/picks/control#setup" replace /> }');
    expect(router).toContain('{ path: "picks/monitoring", element: <Navigate to="/picks/control#monitoring" replace /> }');
    expect(verifier).toContain("`${productionOrigin}/picks/monitoring?browser-pin-check=${suffix}`");
    expect(verifier).toContain("`${productionOrigin}/picks/setup?event-preview-check=${suffix}`");
  });

  it("verifies the canonical monitoring and setup anchors before exercising owner UI", () => {
    expect(occurrences(verifier, /url\.pathname === "\/picks\/control"/g)).toBe(3);
    expect(occurrences(verifier, /url\.hash === "#monitoring"/g)).toBe(2);
    expect(occurrences(verifier, /url\.hash === "#setup"/g)).toBe(1);
    expect(verifier).not.toContain('url.pathname === "/picks/monitoring"');
    expect(verifier).not.toContain('url.pathname === "/picks/setup"');
    expect(verifier).toContain('getByText("PRIVATE PICKS OWNER", { exact: true })');
  });

  it("uses one stable lifecycle reader for both redirected owner surfaces", () => {
    expect(verifier).toContain("async function waitForControlStatus(page)");
    expect(occurrences(verifier, /await waitForControlStatus\(page\)/g)).toBe(2);
    expect(verifier).toContain('function isSetupLifecycle(status)');
    expect(verifier).toContain('status === "SET UP NEXT EVENT" || status === "REVIEW CARD"');
    expect(verifier).toContain('function isActiveEventLifecycle(status)');
    expect(verifier).toContain('status === "PICKS OPEN"');
    expect(verifier).toContain('status === "PICKS CLOSED · RESULTS OPEN"');
    expect(verifier).toContain('status === "EVENT COMPLETE"');
    expect(verifier).toContain('/^\\d+ FIGHTS? NEED RESULTS$/.test(status)');
  });

  it("requires the visible monitoring section only for a published open card", () => {
    expect(verifier).toContain('if (controlStatus === "PICKS OPEN")');
    expect(verifier).toContain('const monitoringSection = page.locator("#monitoring")');
    expect(verifier).toContain('monitoringSection.getByRole("button", { name: "RUN CHECK NOW" }).waitFor');
    expect(verifier).toContain('monitoringSection.getByRole("button", { name: "REFRESH INBOX" }).waitFor');
    expect(verifier).toContain('page.getByText("ACTIVE", { exact: true }).count()');
    expect(verifier).toContain('page.locator("#monitoring").count()');
    expect(verifier).toContain("Monitoring Inbox rendered during the ${controlStatus} lifecycle.");
    expect(verifier).toContain("Picks Control Center did not reach a valid owner lifecycle");
    expect(verifier).not.toContain('getByRole("heading", { name: "Monitoring Inbox", exact: true })');
  });

  it("scopes Event Setup review to the visible setup owner and avoids provider calls for an active card", () => {
    expect(verifier).toContain("if (isSetupLifecycle(setupStatus))");
    expect(verifier).toContain('const setupSection = page.locator("#setup")');
    expect(verifier).toContain('setupSection.getByRole("button", { name: "CHECK FOR CARD UPDATES" }).click()');
    expect(verifier).toContain("} else if (isActiveEventLifecycle(setupStatus)) {");
    expect(verifier).toContain('page.locator("#setup").count()');
    expect(verifier).toContain("Event Setup rendered during the ${setupStatus} lifecycle.");
    expect(verifier).toContain("correctly omits Event Setup without calling the sync provider");
    expect(verifier).toContain("Picks Control Center did not reach a valid setup lifecycle");
    expect(verifier).not.toContain('getByRole("heading", { name: "Event Setup" })');
  });

  it("retains the 390x844 proof and guaranteed disposable-owner cleanup", () => {
    expect(verifier).toContain("viewport: { width: 390, height: 844 }");
    expect(verifier).toContain("} finally {");
    expect(verifier).toContain("/rest/v1/pick_control_owners?profile_id=eq.");
    expect(verifier).toContain("/auth/v1/admin/users/${userId}");
    expect(verifier).toContain("canonical Picks Control Center monitoring and setup anchors through sign-in");
  });
});

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

  it("requires truthful monitoring and the compact fight dashboard only for an open card", () => {
    expect(verifier).toContain('const monitoringRegion = page.getByRole("region", {');
    expect(verifier).toContain('name: "Automatic monitoring and card review"');
    expect(verifier).toContain('if (controlStatus === "PICKS OPEN")');
    expect(verifier).toContain('name: /^AUTO-SYNC (CHECKED THE EVENT|IS WAITING FOR ITS NEXT CHECK|HAS PARTIAL COVERAGE|NEEDS ATTENTION)$/');
    expect(verifier).toContain('getByRole("button", { name: "CHECK NOW" })');
    expect(verifier).toContain('getByRole("button", { name: "REFRESH STATUS" })');
    expect(verifier).toContain('getByLabel("Pending changes all clear")');
    expect(verifier).toContain('getByRole("heading", { name: "One finding, one clear decision" })');
    expect(verifier).toContain('getByRole("region", { name: /compact fight controls$/ })');
    expect(verifier).toContain('fightRegion.locator(".open-pick-row__summary")');
    expect(verifier).toContain("Manage Open Picks rendered ${fightRowCount} compact fight rows; expected multiple rows.");
    expect(verifier).toContain("Collapsed fight rows exposed permanent lock controls.");
    expect(verifier).toContain("Opening a second fight did not collapse the first fight.");
    expect(verifier).toContain("Automation status did not render before the compact fight list.");
    expect(verifier).toContain("Monitoring Inbox rendered during the ${controlStatus} lifecycle.");
    expect(verifier).toContain("Picks Control Center did not reach a valid owner lifecycle");
  });

  it("runs the correct Event Setup proof for staged and no-draft setup lifecycles", () => {
    expect(verifier).toContain("if (isSetupLifecycle(setupStatus))");
    expect(verifier).toContain('getByRole("region", { name: "Card scope" })');
    expect(verifier).toContain('getByRole("heading", { name: "Choose what counts", exact: true })');
    expect(verifier).toContain('const updateButton = page.getByRole("button", { name: "CHECK FOR CARD UPDATES" });');
    expect(verifier).toContain('const syncButton = page.getByRole("button", { name: "SYNC NEXT UFC EVENT" });');
    expect(verifier).toContain("if (await updateButton.count())");
    expect(verifier).toContain("await updateButton.click()");
    expect(verifier).toContain("} else if (await syncButton.count())");
    expect(verifier).toContain('getByText("NO STAGED CARD", { exact: true })');
    expect(verifier).toContain("syncRequestCount !== syncRequestsBeforeSetup");
    expect(verifier).toContain("} else if (isActiveEventLifecycle(setupStatus)) {");
    expect(verifier).toContain("Event Setup rendered during the ${setupStatus} lifecycle.");
    expect(verifier).toContain("correctly omits Event Setup without calling the sync provider");
    expect(verifier).toContain("Picks Control Center did not reach a valid setup lifecycle");
  });

  it("retains the 390x844 proof and guaranteed disposable-owner cleanup", () => {
    expect(verifier).toContain("viewport: { width: 390, height: 844 }");
    expect(verifier).toContain("} finally {");
    expect(verifier).toContain("/rest/v1/pick_control_owners?profile_id=eq.");
    expect(verifier).toContain("/auth/v1/admin/users/${userId}");
    expect(verifier).toContain("canonical Picks Control Center monitoring and setup anchors through sign-in");
  });
});
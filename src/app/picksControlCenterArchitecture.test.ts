import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync("src/app/router.tsx", "utf8");
const center = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
const openDashboard = readFileSync("src/features/picks-control/OpenPicksDashboard.tsx", "utf8");
const controlPage = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const controlRepository = readFileSync("src/features/picks-control/pickControlRepository.ts", "utf8");
const setupPage = readFileSync("src/features/picks-setup/PicksSetupPage.tsx", "utf8");
const monitoringPage = readFileSync("src/features/picks-monitoring/MonitoringInboxPage.tsx", "utf8");
const monitoringRepository = readFileSync("src/features/picks-monitoring/monitoringInboxRepository.ts", "utf8");
const centerStyles = readFileSync("src/styles/picks-control-center.css", "utf8");
const dashboardStyles = readFileSync("src/styles/open-picks-dashboard.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("Unified Picks Control Center architecture", () => {
  it("keeps one canonical owner route and redirects old owner bookmarks", () => {
    expect(occurrences(router, /path:\s*["']picks\/control["']/g)).toBe(1);
    expect(router).toContain('path: "picks/control", element: <PicksControlCenterPage />');
    expect(router).toContain('<Navigate to="/picks/control#setup" replace />');
    expect(router).toContain('<Navigate to="/picks/control#monitoring" replace />');
    expect(router).not.toContain('const PicksSetupPage = lazy');
    expect(router).not.toContain('const MonitoringInboxPage = lazy');
    expect(router).toContain('path: "picks", element: <PicksPage />');
  });

  it("composes one compact open workflow and preserves the canonical results workflow", () => {
    expect(occurrences(center, /<OpenPicksDashboard/g)).toBe(1);
    expect(occurrences(center, /<PicksControlPage/g)).toBe(1);
    expect(occurrences(center, /<PicksSetupPage/g)).toBe(1);
    expect(occurrences(center, /<MonitoringInboxPage/g)).toBe(1);
    expect(center.indexOf("<MonitoringInboxPage")).toBeLessThan(center.indexOf("<OpenPicksDashboard"));
    expect(center).toContain("activeEvent?.status === \"locked\"");
    expect(controlPage).toContain("recordResult");
    expect(controlPage).toContain("correctResult");
    expect(controlPage).toContain("completeEvent");
  });

  it("does not add another repository, Supabase client, provider path, or polling loop", () => {
    expect(center).not.toMatch(/getSupabaseClient|\.rpc\(|functions\.invoke|createClient|setInterval/);
    expect(openDashboard).not.toMatch(/getSupabaseClient|\.rpc\(|functions\.invoke|createClient|createPickControlRepository|setInterval|setTimeout/);
    expect(openDashboard).toContain("repository.loadControlEvent");
    expect(openDashboard).toContain("repository!.reorderCard");
    expect(openDashboard).toContain("repository!.replaceFighter");
    expect(openDashboard).toContain("repository!.setCancellation");
    expect(openDashboard).toContain("repository!.setBoutInclusion");
    expect(controlRepository.match(/getSupabaseClient\(\)/g)).toHaveLength(1);
    expect(monitoringRepository.match(/get_pick_monitoring_inbox/g)).toHaveLength(1);
    expect(`${center}\n${openDashboard}\n${controlPage}\n${setupPage}\n${monitoringPage}`).not.toContain("setInterval");
    expect(occurrences(center, /window\.setTimeout/g)).toBe(1);
    expect(occurrences(center, /window\.clearTimeout/g)).toBe(1);
    expect(center).toContain("nextProgressiveLockClockAt");
  });

  it("delegates each lifecycle read and publication to the existing owners", () => {
    expect(center.match(/controlRepository\.loadControlEvent\(eventId\)/g)).toHaveLength(1);
    expect(openDashboard.match(/repository\.loadControlEvent\(eventId\)/g)).toHaveLength(1);
    expect(center.match(/setupRepository\.loadDraft\(\)/g)).toHaveLength(1);
    expect(center).not.toContain("monitoringRepository.loadInbox");
    expect(monitoringPage.match(/repository\.loadInbox\(\)/g)).toHaveLength(1);
    expect(center).not.toContain("onInboxChange");
    expect(center.match(/setupRepository\.publishDraft\(draftId\)/g)).toHaveLength(1);
    expect(setupPage).toContain('navigate("/picks/control")');
  });

  it("keeps technical evidence out while supported changes remain confirmation-only and owner-only", () => {
    expect(monitoringPage).not.toContain("SYSTEM DETAILS");
    expect(monitoringPage).not.toContain("RAW DIAGNOSTICS");
    expect(monitoringPage).not.toContain("RECENT CHECKS");
    expect(monitoringPage).not.toContain("REVIEWED FINDINGS");
    expect(monitoringPage).toContain("PENDING CHANGES");
    expect(monitoringPage).toContain("Review only what changed");
    expect(monitoringPage).toContain(
      "Supported event-card changes apply only after your confirmation; everything else remains review-only.",
    );
    expect(monitoringPage).toContain("repository.approveFinding!");
    expect(monitoringPage).toContain('repository.reviewFinding(finding.findingId, status)');
  });

  it("keeps automation visible, refreshes canonical rows after approval, and protects the 390 pixel compact layout", () => {
    expect(main.match(/styles\/picks-control-center\.css/g)).toHaveLength(1);
    expect(main.match(/styles\/open-picks-dashboard\.css/g)).toHaveLength(1);
    expect(centerStyles).toContain("@media (max-width: 480px)");
    expect(dashboardStyles).toContain("@media (max-width: 390px)");
    expect(centerStyles).toContain("overflow-wrap: anywhere");
    expect(dashboardStyles).toContain("open-pick-row__summary");
    expect(dashboardStyles).toContain("monitoring-inbox-page--embedded");
    expect(centerStyles).not.toMatch(/#monitoring[^}]+monitoring-status[^}]+display:\s*none/s);
    expect(center).toContain("<MonitoringInboxPage");
    expect(center).toContain("repository={monitoringRepository}");
    expect(center).toContain("embedded");
    expect(center).toContain("onAppliedChange={() => setControlRevision");
    expect(center).toContain("<OpenPicksDashboard key={controlRevision}");
    expect(center).toContain("<PicksControlPage key={controlRevision}");
  });
});

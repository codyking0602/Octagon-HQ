import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const router = readFileSync("src/app/router.tsx", "utf8");
const center = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
const controlPage = readFileSync("src/features/picks-control/PicksControlPage.tsx", "utf8");
const setupPage = readFileSync("src/features/picks-setup/PicksSetupPage.tsx", "utf8");
const monitoringPage = readFileSync("src/features/picks-monitoring/MonitoringInboxPage.tsx", "utf8");
const monitoringRepository = readFileSync("src/features/picks-monitoring/monitoringInboxRepository.ts", "utf8");
const styles = readFileSync("src/styles/picks-control-center.css", "utf8");
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

  it("composes existing pages without creating another data owner", () => {
    expect(occurrences(center, /<PicksControlPage/g)).toBe(1);
    expect(occurrences(center, /<PicksSetupPage/g)).toBe(1);
    expect(occurrences(center, /<MonitoringInboxPage/g)).toBe(1);
    expect(center).not.toMatch(/getSupabaseClient|\.rpc\(|functions\.invoke|createClient|setInterval|setTimeout/);
    expect(controlPage).not.toContain("onEventState");
    expect(monitoringRepository.match(/get_pick_monitoring_inbox/g)).toHaveLength(1);
  });

  it("delegates each lifecycle read and publication to the existing repository exactly once", () => {
    expect(center.match(/controlRepository\.loadControlEvent\(eventId\)/g)).toHaveLength(1);
    expect(center.match(/setupRepository\.loadDraft\(\)/g)).toHaveLength(1);
    expect(center).not.toContain("monitoringRepository.loadInbox");
    expect(monitoringPage.match(/repository\.loadInbox\(\)/g)).toHaveLength(1);
    expect(center).toContain("onInboxChange={receiveInbox}");
    expect(center.match(/setupRepository\.publishDraft\(draftId\)/g)).toHaveLength(1);
    expect(setupPage).toContain('navigate("/picks/control")');
  });

  it("keeps technical evidence collapsed and card changes review-only", () => {
    expect(center).toContain('<details className="picks-control-center__system-details">');
    expect(center).toContain("SYSTEM DETAILS");
    expect(center).toContain("JSON.stringify(inbox.latestRun.diagnostics, null, 2)");
    expect(monitoringPage).toContain("card-change findings stay here for owner review and are never published automatically");
  });

  it("adds mobile-first layout without browser polling or per-fight locks", () => {
    expect(main.match(/styles\/picks-control-center\.css/g)).toHaveLength(1);
    expect(styles).toContain("@media (max-width: 480px)");
    expect(styles).toContain("grid-template-columns: 1fr");
    expect(styles).toContain("overflow-wrap: anywhere");
    expect(`${center}\n${styles}`).not.toMatch(/effective.?lock|lock.?override|partially.?locked/i);
    expect(`${center}\n${controlPage}\n${setupPage}\n${monitoringPage}`).not.toContain("setInterval");
  });
});

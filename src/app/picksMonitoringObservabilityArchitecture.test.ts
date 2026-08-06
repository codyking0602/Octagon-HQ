import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const center = readFileSync("src/features/picks-control/PicksControlCenterPage.tsx", "utf8");
const monitoringPage = readFileSync("src/features/picks-monitoring/MonitoringInboxPage.tsx", "utf8");
const monitoringRepository = readFileSync(
  "src/features/picks-monitoring/monitoringInboxRepository.ts",
  "utf8",
);
const monitoringRunner = readFileSync(
  "supabase/functions/run-pick-monitoring/index.ts",
  "utf8",
);

function occurrences(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

describe("observable Picks monitoring architecture", () => {
  it("removes the redundant owner action while preserving player access", () => {
    expect(center).not.toContain("MANAGE OPEN PICKS");
    expect(center).toContain("OPEN PLAYER PICKS");
  });

  it("distinguishes scheduler, provider, source, comparison, application, review, and quota evidence", () => {
    for (const label of [
      "NEXT SCHEDULER WAKE",
      "NEXT PROVIDER CALL",
      "LAST SCHEDULER WAKE",
      "LAST UFC CARD CHECK",
      "LAST ODDS CHECK",
      "LAST SUCCESSFUL PROVIDER CALL",
      "LAST PROVIDER FAILURE",
      "MONITORED UFC EVENT",
      "EXACT UFC EVENT SOURCE",
      "FIGHT MATCHING",
      "ODDS APPLICATION",
      "CARD COMPARISON",
      "OWNER FINDINGS",
      "MONTHLY REQUESTS USED",
      "MONTHLY REQUESTS REMAINING",
      "MONTHLY RESET",
      "NEXT WAKE USES REQUEST",
      "LATEST RECEIPT",
    ]) {
      expect(monitoringPage).toContain(label);
    }
    expect(monitoringPage).toContain("Odds provider not called.");
    expect(monitoringPage).toContain("No current card changes need confirmation.");
  });

  it("keeps Check Now on the canonical complete runner and Refresh Status read-only", () => {
    expect(monitoringPage).toContain('runAction("manual", repository.runManualCheck)');
    expect(monitoringPage).toContain('onClick={() => void loadInbox()}');
    expect(monitoringPage).toContain("use one provider request");
    expect(monitoringRepository.match(/functions\.invoke\("run-pick-monitoring"/g)).toHaveLength(1);
    expect(monitoringRepository.match(/get_pick_monitoring_inbox/g)).toHaveLength(1);
    expect(monitoringPage).not.toMatch(/getSupabaseClient|\.rpc\(|functions\.invoke|createClient/);
  });

  it("uses the same event state, provider, comparison, and persistence owner for scheduled and manual checks", () => {
    expect(monitoringRunner).toContain("Manual CHECK NOW and the scheduler resolve the same canonical monitoring state.");
    expect(occurrences(monitoringRunner, /get_pick_monitoring_event_state/g)).toBe(2);
    expect(occurrences(monitoringRunner, /THE_ODDS_API_KEY/g)).toBe(1);
    expect(occurrences(monitoringRunner, /buildTheOddsApiRequestUrl/g)).toBeGreaterThanOrEqual(1);
    expect(occurrences(monitoringRunner, /buildManualMonitoringPayload/g)).toBeGreaterThanOrEqual(1);
    expect(monitoringRunner).not.toMatch(/setInterval|new Cron|createClient\([^\n]+THE_ODDS_API_KEY/);
  });

  it("makes operational failures impossible to collapse into an all-clear state", () => {
    expect(monitoringPage).toContain("The UFC event source failed before an odds-provider call.");
    expect(monitoringPage).toContain("The monthly provider quota is exhausted.");
    expect(monitoringPage).toContain("The scheduler credential is missing or stale.");
    expect(monitoringPage).toContain("is unmatched and needs review.");
    expect(monitoringPage).toContain("AUTO-SYNC NEEDS ATTENTION");
  });
});

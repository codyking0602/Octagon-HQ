import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adaptTheOddsApiResponse } from "./theOddsApi";
import { buildManualMonitoringPayload, filterOddsToMonitoredEvent, resolveMonitoringEvent } from "./manualMonitoringRunner";

const observed = "2026-08-10T12:06:00Z";
const event = { event_id: "published-id", source_event_key: "events/ufc-330", source_url: "https://www.mmamania.com/card", name: "UFC 330", subtitle: "Medic vs. Rodriguez", venue: "Arena", location: "City", starts_at: "2026-08-15T22:00:00Z", locks_at: "2026-08-15T22:00:00Z", bouts: [{ bout_id: "main-event-1", red_fighter_name: "Uros Medic", blue_fighter_name: "Daniel Rodriguez", red_american_odds: 110, blue_american_odds: -130 }] };
const source = { ...event, event_id: "generated-source-id", source: "UFC.com metadata + MMA Mania card", source_url: "https://www.mmamania.com/card", bouts: event.bouts };
const fixture = JSON.parse(readFileSync("src/features/picks-monitoring/__fixtures__/draftkings-primary.json", "utf8"));
const odds = (body = fixture, remaining = "100") => adaptTheOddsApiResponse({ status: 200, body, headers: { "x-requests-remaining": remaining } }, observed);
const build = (overrides: Partial<Parameters<typeof buildManualMonitoringPayload>[0]> = {}) => buildManualMonitoringPayload({ resolved: resolveMonitoringEvent(null, event), source, scope: "full", odds: odds(), startedAt: observed, completedAt: observed, ...overrides });

function unrelatedProviderFight() {
  const unrelated = structuredClone(fixture[0]);
  unrelated.id = "unrelated-same-time-fight";
  unrelated.home_team = "Other One";
  unrelated.away_team = "Other Two";
  for (const bookmaker of unrelated.bookmakers) {
    bookmaker.markets[0].outcomes = [
      { name: "Other One", price: 120 },
      { name: "Other Two", price: -140 },
    ];
  }
  return unrelated;
}

describe("monitoring event resolution", () => {
  it("prefers a valid staged draft and does not represent it as published", () => { const resolved = resolveMonitoringEvent({ ...event, event_id: "draft-id" }, event); const payload = build({ resolved }); expect(resolved.kind).toBe("staged"); expect(resolved.storageEventId).toBeUndefined(); expect(payload.event_id).toBeUndefined(); expect(payload.locks_at).toBe(event.locks_at); expect(payload.odds_snapshots[0].bout_id).toBeUndefined(); });
  it("uses current when no staged draft exists and fails closed for conflicts or no event", () => { expect(resolveMonitoringEvent(null, event).storageEventId).toBe("published-id"); expect(() => resolveMonitoringEvent({ ...event, name: "UFC 331", subtitle: "Other vs. Card" }, event)).toThrow(/conflict/); expect(() => resolveMonitoringEvent(null, null)).toThrow(/No monitorable/); });
  it("matches stable identity despite different generated IDs", () => expect(() => build()).not.toThrow());
});

describe("provider selection and deterministic evidence", () => {
  it("excludes unrelated MMA fights even when they share the monitored event time", () => {
    const filtered = filterOddsToMonitoredEvent(odds([...fixture, unrelatedProviderFight()]), event);
    expect(filtered.snapshots).toHaveLength(1);
    expect(filtered.snapshots[0].matchupIdentity).toBe("daniel rodriguez|uros medic");
    expect(filtered.coverage).toEqual({ providerEvents: 1, completeSnapshots: 1, missingSnapshots: 0 });
  });
  it("records a missing monitored bout instead of an unrelated provider fight", () => {
    const secondBout = { bout_id: "main-2", red_fighter_name: "Missing One", blue_fighter_name: "Missing Two" };
    const monitored = { ...event, bouts: [...event.bouts, secondBout] };
    const payload = build({
      resolved: resolveMonitoringEvent(null, monitored),
      source: { ...source, bouts: monitored.bouts },
      odds: odds([...fixture, unrelatedProviderFight()]),
    });
    const unmatched = payload.findings.filter((finding) => finding.finding_type === "unmatched_fight");
    expect(unmatched).toHaveLength(1);
    expect(unmatched[0].bout_id).toBe("main-2");
    expect(JSON.stringify(payload)).not.toContain("unrelated-same-time-fight");
  });
  it("keeps keys stable across run timestamps", () => { const first = build(); const second = build({ startedAt: "2026-08-11T00:00:00Z", completedAt: "2026-08-11T00:00:01Z" }); expect(first.findings.map((finding) => finding.finding_key)).toEqual(second.findings.map((finding) => finding.finding_key)); });
  it("aligns prices by identity across red/blue and provider outcome reversal", () => { const reversedEvent = { ...event, bouts: [{ ...event.bouts[0], red_fighter_name: "Daniel Rodriguez", blue_fighter_name: "Uros Medic", red_american_odds: -130, blue_american_odds: 110 }] }; const reversedProvider = structuredClone(fixture); reversedProvider[0].bookmakers[1].markets[0].outcomes.reverse(); const payload = build({ resolved: resolveMonitoringEvent(null, reversedEvent), odds: odds(reversedProvider), source: { ...source, bouts: reversedEvent.bouts } }); expect(payload.findings.some((finding) => finding.finding_type === "odds_change")).toBe(false); });
});

describe("card scope and run status", () => {
  const withPrelim = { ...event, bouts: [...event.bouts, { bout_id: "prelim-1", red_fighter_name: "Prelim One", blue_fighter_name: "Prelim Two" }] };
  it("does not report omitted prelims for main-card scope", () => { const mainSource = { ...source, bouts: [source.bouts[0]] }; expect(build({ resolved: resolveMonitoringEvent(null, withPrelim), source: mainSource, scope: "main" }).findings.filter((finding) => finding.finding_type === "card_change")).toHaveLength(0); });
  it("reports legitimate full-card changes", () => expect(build({ resolved: resolveMonitoringEvent(null, withPrelim), source: { ...source, bouts: [source.bouts[0]] }, scope: "full" }).findings.some((finding) => finding.finding_type === "card_change")).toBe(true));
  it("centralizes provider failure and quota semantics", () => { const failure = adaptTheOddsApiResponse({ status: 401, body: { message: "https://bad.test?apiKey=secret" }, headers: { "x-requests-remaining": "0" } }, observed); const failed = build({ odds: failure }); expect(failed.status).toBe("failed"); expect(JSON.stringify(failed)).not.toContain("secret"); const partial = build({ odds: odds(fixture, "0") }); expect(partial.status).toBe("partial"); expect(partial.findings.some((finding) => finding.finding_type === "quota_warning")).toBe(true); });
});

describe("runtime and storage contracts", () => {
  const edge = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
  it("uses owner reads and the atomic writer without direct inserts or mutations", () => { expect(edge).toContain('owner.rpc("get_pick_event_setup")'); expect(edge).toContain('owner.rpc("get_current_pick_event")'); expect(edge).toContain('admin.rpc("record_pick_monitoring_run"'); expect(edge).not.toMatch(/\.from\(|stage_pick|publish_pick|update_pick|submit_pick|record_pick_result|setInterval|cron/); });
  it("keeps provider credentials backend-only and denies nonowners", () => { expect(edge).toContain('Deno.env.get("THE_ODDS_API_KEY")'); expect(edge).not.toContain("input.THE_ODDS_API_KEY"); expect(edge).toContain("OWNER_ACCESS_REQUIRED"); });
});

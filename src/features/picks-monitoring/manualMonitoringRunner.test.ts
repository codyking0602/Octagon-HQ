import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { adaptTheOddsApiResponse } from "./theOddsApi";
import { buildManualMonitoringPayload, filterOddsToMonitoredEvent, resolveMonitoringEvent } from "./manualMonitoringRunner";

const observed = "2026-08-10T12:06:00Z";
const event = { event_id: "published-id", source_event_key: "events/ufc-330", source_url: "https://www.mmamania.com/card", name: "UFC 330", subtitle: "Medic vs. Rodriguez", venue: "Arena", location: "City", starts_at: "2026-08-15T22:00:00Z", locks_at: "2026-08-15T22:00:00Z", bouts: [{ bout_id: "main-event-1", red_fighter_slug: "uros-medic", red_fighter_name: "Uros Medic", blue_fighter_slug: "daniel-rodriguez", blue_fighter_name: "Daniel Rodriguez", red_american_odds: 110, blue_american_odds: -130 }] };
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
  it("prefers the published event when a staged draft mirrors it so live odds retain canonical storage", () => {
    const resolved = resolveMonitoringEvent({ ...event, event_id: "draft-id" }, event);
    const payload = build({ resolved });
    expect(resolved.kind).toBe("current");
    expect(resolved.storageEventId).toBe("published-id");
    expect(payload.event_id).toBe("published-id");
    expect(payload.locks_at).toBe(event.locks_at);
    expect(payload.odds_snapshots[0]).toMatchObject({
      bout_id: "main-event-1",
      canonical_red_fighter_slug: "uros-medic",
      canonical_blue_fighter_slug: "daniel-rodriguez",
    });
  });
  it("uses a staged draft only when no current event exists and fails closed for conflicts or no event", () => {
    const staged = resolveMonitoringEvent({ ...event, event_id: "draft-id" }, null);
    expect(staged.kind).toBe("staged");
    expect(staged.storageEventId).toBeUndefined();
    expect(resolveMonitoringEvent(null, event).storageEventId).toBe("published-id");
    expect(() => resolveMonitoringEvent({ ...event, name: "UFC 331", subtitle: "Other vs. Card" }, event)).toThrow(/conflict/);
    expect(() => resolveMonitoringEvent(null, null)).toThrow(/No monitorable/);
  });
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
    const secondBout = { bout_id: "main-2", red_fighter_slug: "missing-one", red_fighter_name: "Missing One", blue_fighter_slug: "missing-two", blue_fighter_name: "Missing Two" };
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
  it("orients complete provider prices to the canonical red and blue corners", () => {
    expect(build().odds_snapshots[0]).toMatchObject({
      bout_id: "main-event-1",
      canonical_red_fighter_slug: "uros-medic",
      canonical_red_fighter_identity: "uros medic",
      canonical_red_american_odds: 110,
      canonical_blue_fighter_slug: "daniel-rodriguez",
      canonical_blue_fighter_identity: "daniel rodriguez",
      canonical_blue_american_odds: -130,
      sportsbook: "draftkings",
      sportsbook_title: "DraftKings",
    });
  });
  it("keeps keys stable across run timestamps", () => { const first = build(); const second = build({ startedAt: "2026-08-11T00:00:00Z", completedAt: "2026-08-11T00:00:01Z" }); expect(first.findings.map((finding) => finding.finding_key)).toEqual(second.findings.map((finding) => finding.finding_key)); });
  it("aligns prices by identity across red/blue and provider outcome reversal", () => { const reversedEvent = { ...event, bouts: [{ ...event.bouts[0], red_fighter_slug: "daniel-rodriguez", red_fighter_name: "Daniel Rodriguez", blue_fighter_slug: "uros-medic", blue_fighter_name: "Uros Medic", red_american_odds: -130, blue_american_odds: 110 }] }; const reversedProvider = structuredClone(fixture); reversedProvider[0].bookmakers[1].markets[0].outcomes.reverse(); const payload = build({ resolved: resolveMonitoringEvent(null, reversedEvent), odds: odds(reversedProvider), source: { ...source, bouts: reversedEvent.bouts } }); expect(payload.findings.some((finding) => finding.finding_type === "odds_change")).toBe(false); expect(payload.odds_snapshots[0]).toMatchObject({ canonical_red_fighter_slug: "daniel-rodriguez", canonical_red_american_odds: -130, canonical_blue_fighter_slug: "uros-medic", canonical_blue_american_odds: 110 }); });
  it("stores changed odds without creating odds-change receipts", () => {
    const staleOddsEvent = {
      ...event,
      bouts: [{ ...event.bouts[0], red_american_odds: 105, blue_american_odds: -125 }],
    };
    const payload = build({
      resolved: resolveMonitoringEvent(null, staleOddsEvent),
      source: { ...source, bouts: staleOddsEvent.bouts },
    });
    expect(payload.findings.some((finding) => finding.finding_type === "odds_change")).toBe(false);
    expect(payload.odds_snapshots).toHaveLength(1);
    expect(payload.odds_snapshots[0]).toMatchObject({
      canonical_red_american_odds: 110,
      canonical_blue_american_odds: -130,
    });
  });
  it("uses the same payload builder for scheduled runs and suppresses repeated meaningful findings", () => {
    const first = build({ triggerKind: "scheduled", odds: odds(fixture, "0") });
    const repeated = build({
      triggerKind: "scheduled",
      odds: odds(fixture, "0"),
      suppressFindingKeys: new Set(first.findings.map((finding) => finding.finding_key)),
    });
    expect(first.trigger_kind).toBe("scheduled");
    expect(first.findings.length).toBeGreaterThan(0);
    expect(repeated.findings).toHaveLength(0);
  });
});

describe("card scope and run status", () => {
  const withPrelim = { ...event, bouts: [...event.bouts, { bout_id: "prelim-1", red_fighter_slug: "prelim-one", red_fighter_name: "Prelim One", blue_fighter_slug: "prelim-two", blue_fighter_name: "Prelim Two" }] };
  it("does not report omitted prelims for main-card scope", () => { const mainSource = { ...source, bouts: [source.bouts[0]] }; expect(build({ resolved: resolveMonitoringEvent(null, withPrelim), source: mainSource, scope: "main" }).findings.filter((finding) => finding.finding_type === "card_change")).toHaveLength(0); });
  it("reports legitimate full-card changes", () => expect(build({ resolved: resolveMonitoringEvent(null, withPrelim), source: { ...source, bouts: [source.bouts[0]] }, scope: "full" }).findings.some((finding) => finding.finding_type === "card_change")).toBe(true));
  it("centralizes provider failure and quota semantics without an applyable snapshot", () => { const failure = adaptTheOddsApiResponse({ status: 401, body: { message: "https://bad.test?apiKey=secret" }, headers: { "x-requests-remaining": "0" } }, observed); const failed = build({ odds: failure }); expect(failed.status).toBe("failed"); expect(failed.odds_snapshots).toHaveLength(0); expect(JSON.stringify(failed)).not.toContain("secret"); const partial = build({ odds: odds(fixture, "0") }); expect(partial.status).toBe("partial"); expect(partial.findings.some((finding) => finding.finding_type === "quota_warning")).toBe(true); });
});

describe("removed-bout comparison identity", () => {
  it("keeps a fight promoted from Early Prelims when its supported-card bout ID changes", () => {
    const included = event.bouts[0];
    const removedEarlyPrelim = {
      bout_id: "early-prelim-vicente-luque-tresean-gore",
      red_fighter_slug: "vicente-luque",
      red_fighter_name: "Vicente Luque",
      blue_fighter_slug: "tresean-gore",
      blue_fighter_name: "Tresean Gore",
      weight_class: "Middleweight",
      card_segment: "prelim" as const,
      segment_sequence: 1,
      included_in_picks: false,
    };
    const current = { ...event, bouts: [included, removedEarlyPrelim] };
    const promoted = {
      ...removedEarlyPrelim,
      bout_id: "prelim-vicente-luque-tresean-gore",
      segment_sequence: 4,
      included_in_picks: true,
    };
    const payload = build({
      resolved: resolveMonitoringEvent(null, current),
      source: { ...source, bouts: [included, promoted] },
    });
    const cardChanges = payload.findings.filter((finding) => finding.finding_type === "card_change");

    expect(cardChanges).toHaveLength(1);
    expect(cardChanges[0]).toMatchObject({
      bout_id: promoted.bout_id,
      summary: "Add Vicente Luque vs. Tresean Gore to Picks.",
      source_details: {
        change_field: "included_in_picks",
        approval_proposal: {
          action: "add_bout",
          card_segment: "prelim",
          segment_sequence: 4,
          expected_bout_ids: [included.bout_id],
        },
      },
    });
  });
});

describe("runtime and storage contracts", () => {
  const edge = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
  it("uses one canonical event projection for scheduled and owner-authorized manual checks", () => {
    expect(edge).toContain('owner.rpc("get_pick_event_setup")');
    expect(edge).toContain('admin.rpc("get_pick_monitoring_event_state")');
    expect(edge).not.toContain('owner.rpc("get_current_pick_event")');
    expect(edge).toContain('mode: "monitoring-preview"');
    expect(edge).toContain('source_url: sourceUrl');
    expect(edge).toContain('admin.rpc("record_pick_monitoring_run_and_apply_odds"');
    expect(edge).toContain('admin.rpc("record_scheduled_pick_monitoring_run"');
    expect(edge).toContain('admin.rpc("claim_pick_monitoring_schedule"');
    expect(edge.match(/stage_pick_event_draft/g)).toHaveLength(1);
    expect(edge).toContain("shouldAttemptAutomaticEventStaging");
    expect(edge).toContain("eventIsInAutomaticStagingWindow");
    expect(edge).not.toMatch(/\.from\(|publish_pick|update_pick|submit_pick|record_pick_result|setInterval/);
  });
  it("allows Supabase browser invocation headers and keeps provider credentials backend-only", () => { expect(edge).toContain('"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"'); expect(edge).toContain('Deno.env.get("THE_ODDS_API_KEY")'); expect(edge).not.toContain("input.THE_ODDS_API_KEY"); expect(edge).toContain("OWNER_ACCESS_REQUIRED"); expect(edge).toContain("SCHEDULER_AUTH_REQUIRED"); });
});

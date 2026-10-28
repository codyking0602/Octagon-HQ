import { describe, expect, it } from "vitest";
import { adaptTheOddsApiResponse } from "../../../src/features/picks-monitoring/theOddsApi";
import { buildManualMonitoringPayload, resolveMonitoringEvent } from "../../../src/features/picks-monitoring/manualMonitoringRunner";

const observed = "2026-08-13T21:15:00Z";
const included = {
  bout_id: "main-event-islam-makhachev-ian-machado-garry",
  red_fighter_slug: "islam-makhachev",
  red_fighter_name: "Islam Makhachev",
  blue_fighter_slug: "ian-machado-garry",
  blue_fighter_name: "Ian Machado Garry",
  weight_class: "Welterweight",
  card_segment: "main" as const,
  segment_sequence: 1,
};
const excluded = {
  bout_id: "prelim-intentionally-excluded-one-two",
  red_fighter_slug: "intentionally-excluded-one",
  red_fighter_name: "Intentionally Excluded One",
  blue_fighter_slug: "intentionally-excluded-two",
  blue_fighter_name: "Intentionally Excluded Two",
  weight_class: "Middleweight",
  card_segment: "prelim" as const,
  segment_sequence: 1,
  included_in_picks: false,
};
const current = {
  event_id: "published-id",
  source_event_key: "events/ufc-330",
  source_url: "https://www.mmamania.com/card",
  name: "UFC 330",
  subtitle: "Makhachev vs. Machado Garry",
  venue: "T-Mobile Arena",
  location: "Las Vegas, NV",
  starts_at: "2026-08-15T22:00:00Z",
  locks_at: "2026-08-15T22:00:00Z",
  bouts: [included, excluded],
};
const source = {
  ...current,
  event_id: "generated-source-id",
  source: "MMA Mania event + card",
  bouts: [included, { ...excluded, included_in_picks: true }],
};

describe("exact bout-id monitoring exclusions", () => {
  it("still suppresses a deliberately excluded bout when the source bout id is unchanged", () => {
    const resolved = resolveMonitoringEvent(null, current);
    const payload = buildManualMonitoringPayload({
      resolved,
      source,
      scope: "full",
      odds: adaptTheOddsApiResponse({
        status: 401,
        body: { message: "provider unavailable for card-comparison test" },
        headers: { "x-requests-remaining": "100" },
      }, observed),
      startedAt: observed,
      completedAt: observed,
    });

    expect(resolved.ignoredBoutIds).toEqual([excluded.bout_id]);
    expect(payload.findings.filter((finding) => finding.finding_type === "card_change")).toHaveLength(0);
    expect(JSON.stringify(payload.findings)).not.toContain("Intentionally Excluded");
  });
});

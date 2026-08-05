import { describe, expect, it } from "vitest";
import { buildCardChangeFindings } from "./cardChangeApproval";

const first = {
  bout_id: "main-event-alpha-beta",
  red_fighter_slug: "alpha",
  red_fighter_name: "Alpha",
  blue_fighter_slug: "beta",
  blue_fighter_name: "Beta",
  weight_class: "Lightweight",
};
const second = {
  bout_id: "main-gamma-delta",
  red_fighter_slug: "gamma",
  red_fighter_name: "Gamma",
  blue_fighter_slug: "delta",
  blue_fighter_name: "Delta",
  weight_class: "Welterweight",
};
const canonical = {
  event_id: "ufc-approval",
  name: "UFC Fight Night",
  subtitle: "Alpha vs. Beta",
  venue: "Test Arena",
  location: "Dallas, Texas",
  source_url: "https://www.mmamania.com/test",
  starts_at: "2099-08-10T01:00:00.000Z",
  locks_at: "2099-08-10T00:00:00.000Z",
  bouts: [first, second],
};
const source = {
  ...canonical,
  source_event_key: "events/ufc-approval",
  source: "UFC.com + MMA Mania",
};

function findings(nextSource: typeof source, kind: "current" | "staged" = "current") {
  return buildCardChangeFindings({
    identity: "ufc:events/ufc-approval",
    kind,
    eventId: kind === "current" ? canonical.event_id : undefined,
    canonical,
    source: nextSource,
    scope: "main",
    detectedAt: "2099-08-01T12:00:00.000Z",
  });
}

describe("monitoring card-change approval proposals", () => {
  it("creates one stale-guarded fighter replacement proposal", () => {
    const result = findings({
      ...source,
      bouts: [{
        ...first,
        blue_fighter_slug: "replacement",
        blue_fighter_name: "Replacement",
      }, second],
    });

    expect(result).toHaveLength(1);
    expect(result[0]!).toMatchObject({
      bout_id: first.bout_id,
      summary: "Replace Beta with Replacement.",
      source_details: {
        approval_proposal: {
          action: "replace_fighter",
          event_id: canonical.event_id,
          corner: "blue",
          expected_red_fighter_slug: "alpha",
          expected_blue_fighter_slug: "beta",
          replacement_fighter_slug: "replacement",
        },
      },
    });
  });

  it("creates explicit removal, reorder, and deadline proposals", () => {
    const removal = findings({ ...source, bouts: [second] });
    expect(removal).toHaveLength(1);
    expect(removal[0]!.source_details?.approval_proposal).toMatchObject({
      action: "remove_bout",
      bout_id: first.bout_id,
      expected_included_in_picks: true,
    });

    const reorder = findings({ ...source, bouts: [second, first] });
    expect(reorder).toHaveLength(1);
    expect(reorder[0]!.source_details?.approval_proposal).toEqual({
      action: "reorder_card",
      event_id: canonical.event_id,
      expected_bout_ids: [first.bout_id, second.bout_id],
      proposed_bout_ids: [second.bout_id, first.bout_id],
    });

    const deadline = findings({
      ...source,
      locks_at: "2099-08-10T00:30:00.000Z",
    });
    expect(deadline).toHaveLength(1);
    expect(deadline[0]!.source_details?.approval_proposal).toMatchObject({
      action: "adjust_event_lock",
      expected_locks_at: canonical.locks_at,
      proposed_locks_at: "2099-08-10T00:30:00.000Z",
    });
  });

  it("fails closed for staged cards and ambiguous source changes", () => {
    const staged = findings({ ...source, bouts: [second, first] }, "staged");
    expect(staged.some((item) => item.source_details?.approval_proposal)).toBe(false);

    const ambiguousReplacement = findings({
      ...source,
      bouts: [second, {
        ...first,
        red_fighter_slug: "replacement-red",
        red_fighter_name: "Replacement Red",
        blue_fighter_slug: "replacement-blue",
        blue_fighter_name: "Replacement Blue",
      }],
    });
    expect(ambiguousReplacement.map((item) => item.summary)).toEqual(expect.arrayContaining([
      "Removed Alpha vs. Beta.",
      "Added Replacement Red vs. Replacement Blue.",
    ]));
    expect(ambiguousReplacement.some((item) => item.source_details?.approval_proposal)).toBe(false);

    const movedEvent = findings({
      ...source,
      starts_at: "2099-08-10T02:00:00.000Z",
      locks_at: "2099-08-10T01:00:00.000Z",
    });
    expect(movedEvent.map((item) => item.summary)).toEqual(expect.arrayContaining([
      "Main-card time changed.",
      "Picks lock changed.",
    ]));
    expect(movedEvent.some((item) => item.source_details?.approval_proposal)).toBe(false);
  });
});

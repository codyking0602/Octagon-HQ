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

function findings(
  nextSource: typeof source,
  kind: "current" | "staged" = "current",
  nextCanonical = canonical,
) {
  return buildCardChangeFindings({
    identity: "ufc:events/ufc-approval",
    kind,
    eventId: kind === "current" ? canonical.event_id : undefined,
    canonical: nextCanonical,
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
        change_field: "fighters",
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

  it("creates audited venue, location, and weight-class approval proposals", () => {
    const changed = findings({
      ...source,
      venue: "New Arena",
      location: "Austin, Texas",
      bouts: [{ ...first, weight_class: "Catchweight" }, second],
    });

    expect(changed).toEqual(expect.arrayContaining([
      expect.objectContaining({
        summary: "Venue changed.",
        before_value: "Test Arena",
        after_value: "New Arena",
        source_details: expect.objectContaining({
          change_field: "venue",
          approval_proposal: {
            action: "update_event_metadata",
            event_id: canonical.event_id,
            field: "venue",
            expected_value: "Test Arena",
            proposed_value: "New Arena",
          },
        }),
      }),
      expect.objectContaining({
        summary: "Location changed.",
        before_value: "Dallas, Texas",
        after_value: "Austin, Texas",
        source_details: expect.objectContaining({
          change_field: "location",
          approval_proposal: expect.objectContaining({
            action: "update_event_metadata",
            field: "location",
          }),
        }),
      }),
      expect.objectContaining({
        summary: "Weight class changed for Alpha vs. Beta.",
        before_value: "Lightweight",
        after_value: "Catchweight",
        bout_id: first.bout_id,
        source_details: expect.objectContaining({
          change_field: "weight_class",
          approval_proposal: expect.objectContaining({
            action: "update_bout_weight_class",
            bout_id: first.bout_id,
            expected_weight_class: "Lightweight",
            proposed_weight_class: "Catchweight",
          }),
        }),
      }),
    ]));
  });

  it("uses discovery wording and set proposals when prior values are unavailable", () => {
    const result = findings(source, "current", {
      ...canonical,
      venue: "",
      location: "",
      bouts: [{ ...first, weight_class: "" }, second],
    });

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        summary: "Venue found.",
        before_value: null,
        after_value: "Test Arena",
      }),
      expect.objectContaining({
        summary: "Location found.",
        before_value: null,
        after_value: "Dallas, Texas",
      }),
      expect.objectContaining({
        summary: "Weight class found for Alpha vs. Beta.",
        before_value: null,
        after_value: "Lightweight",
      }),
    ]));
    expect(result.every((item) => !item.summary.includes("changed") || item.before_value !== null)).toBe(true);
  });

  it("collapses equivalent repeated work behind a deterministic proposed-value key", () => {
    const firstRun = findings({ ...source, venue: "New Arena" });
    const repeatedRun = findings({ ...source, venue: "New Arena" });
    const newerProposal = findings({ ...source, venue: "Newest Arena" });

    const venueFirst = firstRun.find((item) => item.source_details?.change_field === "venue");
    const venueRepeated = repeatedRun.find((item) => item.source_details?.change_field === "venue");
    const venueNewer = newerProposal.find((item) => item.source_details?.change_field === "venue");
    expect(venueFirst?.finding_key).toBe(venueRepeated?.finding_key);
    expect(venueFirst?.source_details?.finding_identity).toBe(venueNewer?.source_details?.finding_identity);
    expect(venueFirst?.finding_key).not.toBe(venueNewer?.finding_key);
  });

  it("ignores cosmetic text differences", () => {
    expect(findings({
      ...source,
      venue: "  TEST   ARENA ",
      location: "DALLAS TEXAS",
      bouts: [{ ...first, weight_class: "LIGHTWEIGHT" }, second],
    })).toEqual([]);
  });

  it("fails closed for staged cards and ambiguous source changes", () => {
    const staged = findings({ ...source, bouts: [second, first] }, "staged");
    expect(staged.some((item) => item.source_details?.approval_proposal)).toBe(false);
    expect(staged[0]).toMatchObject({
      summary: "Fight order changed.",
      before_value: ["Alpha vs. Beta", "Gamma vs. Delta"],
      after_value: ["Gamma vs. Delta", "Alpha vs. Beta"],
    });

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
      "Removed main event: Alpha vs. Beta.",
      "Added main event: Replacement Red vs. Replacement Blue.",
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

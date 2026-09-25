import { describe, expect, it } from "vitest";
import { buildCardChangeFindings, type ApprovalMonitoringEvent } from "./cardChangeApproval";

const first = {
  bout_id: "main-event-alpha-beta",
  red_fighter_slug: "alpha",
  red_fighter_name: "Alpha",
  blue_fighter_slug: "beta",
  blue_fighter_name: "Beta",
  weight_class: "Lightweight",
  card_segment: "main" as const,
  segment_sequence: 2,
};
const second = {
  bout_id: "main-gamma-delta",
  red_fighter_slug: "gamma",
  red_fighter_name: "Gamma",
  blue_fighter_slug: "delta",
  blue_fighter_name: "Delta",
  weight_class: "Welterweight",
  card_segment: "main" as const,
  segment_sequence: 1,
};
const canonical: ApprovalMonitoringEvent = {
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
const source: ApprovalMonitoringEvent & {
  source_url: string;
  source_event_key: string;
  source: string;
} = {
  ...canonical,
  source_url: "https://www.mmamania.com/test",
  source_event_key: "events/ufc-approval",
  source: "UFC.com + MMA Mania",
};

function proposalAction(item: ReturnType<typeof buildCardChangeFindings>[number]) {
  return (item.source_details?.approval_proposal as { action?: string } | undefined)?.action;
}

function findings(
  nextSource: typeof source,
  kind: "current" | "staged" = "current",
  nextCanonical: ApprovalMonitoringEvent = canonical,
  scope: "main" | "full" = "main",
) {
  return buildCardChangeFindings({
    identity: "ufc:events/ufc-approval",
    kind,
    eventId: kind === "current" ? canonical.event_id : undefined,
    canonical: nextCanonical,
    source: nextSource,
    scope,
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
    const removalProposal = removal.find((item) => proposalAction(item) === "remove_bout");
    expect(removalProposal?.source_details?.approval_proposal).toMatchObject({
      action: "remove_bout",
      bout_id: first.bout_id,
      expected_included_in_picks: true,
    });
    expect(removal.some((item) => proposalAction(item) === "reorder_card")).toBe(true);

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

  it("creates one exact proposal when UFC moves fights between main card and prelims", () => {
    const mainBout = {
      ...first,
      bout_id: "main-alpha-beta",
      card_segment: "main" as const,
      segment_sequence: 1,
    };
    const prelimBout = {
      ...second,
      bout_id: "prelim-gamma-delta",
      card_segment: "prelim" as const,
      segment_sequence: 1,
    };
    const segmentedCanonical = { ...canonical, bouts: [mainBout, prelimBout] };
    const result = findings(
      {
        ...source,
        bouts: [
          { ...mainBout, bout_id: "prelim-alpha-beta", card_segment: "prelim", segment_sequence: 1 },
          { ...prelimBout, bout_id: "main-gamma-delta", card_segment: "main", segment_sequence: 1 },
        ],
      },
      "current",
      segmentedCanonical,
      "full",
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      summary: "Apply the detected main/prelim placement.",
      source_details: {
        change_field: "card_segments",
        approval_proposal: {
          action: "sync_card_segments",
          event_id: canonical.event_id,
          expected_segments: [
            { bout_id: "main-alpha-beta", card_segment: "main", segment_sequence: 1 },
            { bout_id: "prelim-gamma-delta", card_segment: "prelim", segment_sequence: 1 },
          ],
          proposed_segments: [
            { bout_id: "main-alpha-beta", card_segment: "prelim", segment_sequence: 1 },
            { bout_id: "prelim-gamma-delta", card_segment: "main", segment_sequence: 1 },
          ],
        },
      },
    });
  });

  it("creates one canonical proposal for a single detected main-card addition", () => {
    const added = {
      bout_id: "main-epsilon-zeta",
      red_fighter_slug: "epsilon",
      red_fighter_name: "Epsilon",
      blue_fighter_slug: "zeta",
      blue_fighter_name: "Zeta",
      weight_class: "Bantamweight",
      card_segment: "main" as const,
      segment_sequence: 3,
    };
    const result = findings({ ...source, bouts: [first, second, added] });

    expect(result).toHaveLength(1);
    expect(result[0]!).toMatchObject({
      bout_id: added.bout_id,
      summary: "Add Epsilon vs. Zeta to Picks.",
      source_details: {
        change_field: "included_in_picks",
        approval_proposal: {
          action: "add_bout",
          event_id: canonical.event_id,
          bout_id: added.bout_id,
          weight_class: "Bantamweight",
          red_fighter_slug: "epsilon",
          red_fighter_name: "Epsilon",
          blue_fighter_slug: "zeta",
          blue_fighter_name: "Zeta",
          card_segment: "main",
          segment_sequence: 3,
          locks_at: canonical.locks_at,
          expected_bout_ids: [first.bout_id, second.bout_id],
        },
      },
    });
  });

  it("keeps a single main-card addition approvable during numbered full-card monitoring", () => {
    const prelim = {
      bout_id: "prelim-eta-theta",
      red_fighter_slug: "eta",
      red_fighter_name: "Eta",
      blue_fighter_slug: "theta",
      blue_fighter_name: "Theta",
      weight_class: "Featherweight",
      card_segment: "prelim" as const,
      segment_sequence: 1,
    };
    const added = {
      bout_id: "main-epsilon-zeta",
      red_fighter_slug: "epsilon",
      red_fighter_name: "Epsilon",
      blue_fighter_slug: "zeta",
      blue_fighter_name: "Zeta",
      weight_class: "Bantamweight",
      card_segment: "main" as const,
      segment_sequence: 3,
    };
    const fullCanonical = { ...canonical, bouts: [first, second, prelim] };
    const result = findings(
      { ...source, bouts: [first, second, added, prelim] },
      "current",
      fullCanonical,
      "full",
    );

    const addProposal = result.find((item) => proposalAction(item) === "add_bout");
    expect(addProposal?.source_details?.approval_proposal).toEqual({
      action: "add_bout",
      event_id: canonical.event_id,
      bout_id: added.bout_id,
      weight_class: "Bantamweight",
      red_fighter_slug: "epsilon",
      red_fighter_name: "Epsilon",
      blue_fighter_slug: "zeta",
      blue_fighter_name: "Zeta",
      card_segment: "main",
      segment_sequence: 3,
      locks_at: canonical.locks_at,
      expected_bout_ids: [first.bout_id, second.bout_id, prelim.bout_id],
    });
    expect(result.some((item) => proposalAction(item) === "reorder_card")).toBe(true);
  });

  it("creates one complete add proposal for a missing Late Prelim during full-card monitoring", () => {
    const existingPrelims = Array.from({ length: 6 }, (_, index) => ({
      bout_id: `prelim-existing-${index + 1}`,
      red_fighter_slug: `existing-red-${index + 1}`,
      red_fighter_name: `Existing Red ${String.fromCharCode(65 + index)}`,
      blue_fighter_slug: `existing-blue-${index + 1}`,
      blue_fighter_name: `Existing Blue ${String.fromCharCode(65 + index)}`,
      weight_class: "Lightweight",
      card_segment: "prelim" as const,
      segment_sequence: index + 1,
    }));
    const missingLatePrelim = {
      bout_id: "prelim-late-red-late-blue",
      red_fighter_slug: "late-red",
      red_fighter_name: "Late Red",
      blue_fighter_slug: "late-blue",
      blue_fighter_name: "Late Blue",
      weight_class: "Featherweight",
      card_segment: "prelim" as const,
      segment_sequence: 7,
    };
    const fullCanonical = { ...canonical, bouts: [first, second, ...existingPrelims] };
    const result = findings(
      { ...source, bouts: [first, second, ...existingPrelims, missingLatePrelim] },
      "current",
      fullCanonical,
      "full",
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      summary: "Add Late Red vs. Late Blue to Picks.",
      bout_id: missingLatePrelim.bout_id,
      source_details: {
        approval_proposal: {
          action: "add_bout",
          event_id: canonical.event_id,
          bout_id: missingLatePrelim.bout_id,
          weight_class: "Featherweight",
          red_fighter_slug: "late-red",
          red_fighter_name: "Late Red",
          blue_fighter_slug: "late-blue",
          blue_fighter_name: "Late Blue",
          card_segment: "prelim",
          segment_sequence: 7,
          locks_at: canonical.locks_at,
          expected_bout_ids: [first.bout_id, second.bout_id, ...existingPrelims.map((bout) => bout.bout_id)],
        },
      },
    });
  });

  it("surfaces the ninth replacement-annotated source fight as one Add Fight decision", () => {
    const sourceBouts = [
      ["Max Holloway", "Charles Oliveira", "main", 5],
      ["Sean O'Malley", "Song Yadong", "main", 4],
      ["Paulo Costa", "Roman Dolidze", "main", 3],
      ["Vicente Luque", "Kevin Holland", "main", 2],
      ["Alexa Grasso", "Maycee Barber", "main", 1],
      ["Johnny Walker", "Dominick Reyes", "prelim", 4],
      ["Bryce Mitchell", "Jean Silva", "prelim", 2],
      ["Rob Font", "Kyler Phillips", "prelim", 1],
      ["Chidi Njokuani", "Joel Alvarez", "prelim", 3],
    ].map(([red, blue, segment, sequence]) => ({
      bout_id: `${segment}-${String(red).toLowerCase().replace(/[^a-z]+/g, "-")}-${String(blue).toLowerCase().replace(/[^a-z]+/g, "-")}`,
      red_fighter_slug: String(red).toLowerCase().replace(/[^a-z]+/g, "-"),
      red_fighter_name: String(red),
      blue_fighter_slug: String(blue).toLowerCase().replace(/[^a-z]+/g, "-"),
      blue_fighter_name: String(blue),
      weight_class: "Middleweight",
      card_segment: segment as "main" | "prelim",
      segment_sequence: Number(sequence),
    }));
    const missing = sourceBouts.at(-1)!;
    const canonicalEight = { ...canonical, bouts: sourceBouts.slice(0, -1) };

    const result = findings(
      { ...source, bouts: sourceBouts },
      "current",
      canonicalEight,
      "full",
    );

    expect(canonicalEight.bouts).toHaveLength(8);
    expect(sourceBouts).toHaveLength(9);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      finding_type: "card_change",
      summary: "Add Chidi Njokuani vs. Joel Alvarez to Picks.",
      bout_id: missing.bout_id,
      source_details: {
        approval_proposal: {
          action: "add_bout",
          red_fighter_name: "Chidi Njokuani",
          blue_fighter_name: "Joel Alvarez",
        },
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/poll|Geoff Neal/i);
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

  it("turns a complete full-matchup swap into guarded remove/add/order work", () => {
    const replacement = {
      ...first,
      bout_id: "main-replacement-red-replacement-blue",
      red_fighter_slug: "replacement-red",
      red_fighter_name: "Replacement Red",
      blue_fighter_slug: "replacement-blue",
      blue_fighter_name: "Replacement Blue",
    };
    const result = findings({ ...source, bouts: [second, replacement] });
    const actions = result
      .map((item) => item.source_details?.approval_proposal)
      .filter(Boolean)
      .map((proposal) => proposal?.action);

    expect(actions).toEqual(expect.arrayContaining(["remove_bout", "add_bout", "reorder_card"]));
    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ summary: "Remove Alpha vs. Beta from Picks." }),
      expect.objectContaining({ summary: "Add Replacement Red vs. Replacement Blue to Picks." }),
    ]));
  });

  it("reconciles multiple simultaneous UFC card changes instead of dropping to generic review", () => {
    const amayaReplacement = {
      bout_id: "main-melissa-amaya-tina-black",
      red_fighter_slug: "melissa-amaya",
      red_fighter_name: "Melissa Amaya",
      blue_fighter_slug: "tina-black",
      blue_fighter_name: "Tina Black",
      weight_class: "Strawweight",
      card_segment: "main" as const,
      segment_sequence: 2,
    };
    const hernandezDumas = {
      bout_id: "main-luis-hernandez-sedriques-dumas",
      red_fighter_slug: "luis-hernandez",
      red_fighter_name: "Luis Hernandez",
      blue_fighter_slug: "sedriques-dumas",
      blue_fighter_name: "Sedriques Dumas",
      weight_class: "Light Heavyweight",
      card_segment: "main" as const,
      segment_sequence: 4,
    };
    const dumontPerez = {
      bout_id: "main-norma-dumont-ailin-perez",
      red_fighter_slug: "norma-dumont",
      red_fighter_name: "Norma Dumont",
      blue_fighter_slug: "ailin-perez",
      blue_fighter_name: "Ailin Perez",
      weight_class: "Bantamweight",
      card_segment: "main" as const,
      segment_sequence: 5,
    };
    const rosBar = { ...first, red_fighter_name: "Raul Rosas Jr", red_fighter_slug: "raul-rosas-jr", blue_fighter_name: "Raoni Barcelos", blue_fighter_slug: "raoni-barcelos", bout_id: "main-event-raul-rosas-jr-raoni-barcelos", segment_sequence: 6 };
    const vieira = { ...second, red_fighter_name: "Rodolfo Vieira", red_fighter_slug: "rodolfo-vieira", blue_fighter_name: "Robert Bryczek", blue_fighter_slug: "robert-bryczek", bout_id: "main-rodolfo-vieira-robert-bryczek", segment_sequence: 5 };
    const hiestand = { ...first, red_fighter_name: "Brady Hiestand", red_fighter_slug: "brady-hiestand", blue_fighter_name: "Rinya Nakamura", blue_fighter_slug: "rinya-nakamura", bout_id: "main-brady-hiestand-rinya-nakamura", segment_sequence: 4 };
    const osmanli = { ...second, red_fighter_name: "Mehemmedeli Osmanli", red_fighter_slug: "mehemmedeli-osmanli", blue_fighter_name: "Ilimbek Akylbek", blue_fighter_slug: "ilimbek-akylbek", bout_id: "main-mehemmedeli-osmanli-ilimbek-akylbek", segment_sequence: 3 };
    const amaya = { ...first, red_fighter_name: "Melissa Amaya", red_fighter_slug: "melissa-amaya", blue_fighter_name: "Valesca Machado", blue_fighter_slug: "valesca-machado", bout_id: "main-melissa-amaya-valesca-machado", segment_sequence: 2 };
    const harrell = { ...second, red_fighter_name: "Josiah Harrell", red_fighter_slug: "josiah-harrell", blue_fighter_name: "Elves Brener", blue_fighter_slug: "elves-brener", bout_id: "main-josiah-harrell-elves-brener", segment_sequence: 1 };
    const liveCanonical = { ...canonical, bouts: [rosBar, vieira, hiestand, osmanli, amaya, harrell] };
    const liveSource = { ...source, bouts: [rosBar, dumontPerez, hernandezDumas, osmanli, amayaReplacement] };

    const result = findings(liveSource, "current", liveCanonical);
    const actions = result
      .map((item) => item.source_details?.approval_proposal)
      .filter(Boolean)
      .map((proposal) => proposal?.action);

    expect(actions.filter((action) => action === "replace_fighter")).toHaveLength(1);
    expect(actions.filter((action) => action === "add_bout")).toHaveLength(2);
    expect(actions.filter((action) => action === "remove_bout")).toHaveLength(3);
    expect(actions).toContain("reorder_card");
    expect(result.some((item) => item.summary === "Replace Valesca Machado with Tina Black.")).toBe(true);
    expect(result.some((item) => item.summary.startsWith("Added main card:"))).toBe(false);
    expect(result.some((item) => item.summary.startsWith("Removed main card:"))).toBe(false);
  });

  it("fails closed for staged cards and event-time ambiguity", () => {
    const staged = findings({ ...source, bouts: [second, first] }, "staged");
    expect(staged.some((item) => item.source_details?.approval_proposal)).toBe(false);
    expect(staged[0]).toMatchObject({
      summary: "Fight order changed.",
      before_value: ["Alpha vs. Beta", "Gamma vs. Delta"],
      after_value: ["Gamma vs. Delta", "Alpha vs. Beta"],
    });

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

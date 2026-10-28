import { describe, expect, it } from "vitest";
import type { CardChangeApprovalProposal } from "./cardChangeApproval";
import { monitoringDecisionPresentation } from "./monitoringDecisionPresentation";
import type { MonitoringFinding } from "./monitoringInboxModel";

function finding(
  approvalProposal: CardChangeApprovalProposal,
  overrides: Partial<MonitoringFinding> = {},
): MonitoringFinding {
  return {
    findingId: "11111111-1111-4111-8111-111111111111",
    runId: "22222222-2222-4222-8222-222222222222",
    triggerKind: "scheduled",
    runStatus: "completed",
    findingKey: "structured-decision",
    findingType: "card_change",
    severity: "warning",
    reviewStatus: "new",
    matchupIdentity: "alpha|beta",
    boutId: "alpha-beta",
    summary: "UFC card change detected.",
    beforeValue: null,
    afterValue: null,
    sourceDetails: { change_field: "test" },
    approvalProposal,
    detectedAt: "2099-01-01T00:00:00.000Z",
    reviewedAt: null,
    ...overrides,
  };
}

function impactValue(presentation: NonNullable<ReturnType<typeof monitoringDecisionPresentation>>, label: string) {
  return presentation.impacts.find((impact) => impact.label === label);
}

describe("monitoring decision presentation", () => {
  it("keeps event metadata and weight-class changes player-safe", () => {
    const venue = monitoringDecisionPresentation(finding({
      action: "update_event_metadata",
      event_id: "ufc-test",
      field: "venue",
      expected_value: "Old Arena",
      proposed_value: "Meta APEX",
    }))!;
    const weight = monitoringDecisionPresentation(finding({
      action: "update_bout_weight_class",
      event_id: "ufc-test",
      bout_id: "alpha-beta",
      expected_weight_class: "Lightweight",
      proposed_weight_class: "Catchweight",
      expected_red_fighter_slug: "alpha",
      expected_blue_fighter_slug: "beta",
    }))!;

    expect(venue.currentValue).toBe("Old Arena");
    expect(venue.proposedValue).toBe("Meta APEX");
    expect(impactValue(venue, "PLAYER PICKS")).toMatchObject({ value: "VALID", affected: false });
    expect(impactValue(weight, "PLAYER PICKS")).toMatchObject({ value: "VALID", affected: false });
  });

  it("marks event deadline and card order effects without inventing repicks", () => {
    const deadline = monitoringDecisionPresentation(finding({
      action: "adjust_event_lock",
      event_id: "ufc-test",
      expected_locks_at: "2099-01-01T00:00:00.000Z",
      proposed_locks_at: "2099-01-01T01:00:00.000Z",
    }))!;
    const reorder = monitoringDecisionPresentation(finding({
      action: "reorder_card",
      event_id: "ufc-test",
      expected_bout_ids: ["alpha-beta", "gamma-delta"],
      proposed_bout_ids: ["gamma-delta", "alpha-beta"],
    }))!;

    expect(impactValue(deadline, "DEADLINE")).toMatchObject({ value: "CHANGES", affected: true });
    expect(deadline.playerResult).toContain("No repick is required");
    expect(impactValue(reorder, "FIGHT ORDER")).toMatchObject({ value: "CHANGES", affected: true });
    expect(reorder.playerResult).toContain("No repick is required");
  });

  it("makes a detected fight addition explicit without invalidating existing picks", () => {
    const addition = monitoringDecisionPresentation(finding({
      action: "add_bout",
      event_id: "ufc-test",
      bout_id: "epsilon-zeta",
      weight_class: "Bantamweight",
      red_fighter_slug: "epsilon",
      red_fighter_name: "Epsilon",
      blue_fighter_slug: "zeta",
      blue_fighter_name: "Zeta",
      card_segment: "main",
      segment_sequence: 3,
      locks_at: "2099-01-01T01:00:00.000Z",
      expected_bout_ids: ["alpha-beta", "gamma-delta"],
    }, {
      matchupIdentity: "epsilon|zeta",
      boutId: "epsilon-zeta",
    }))!;

    expect(impactValue(addition, "PLAYER PICKS")).toMatchObject({ value: "NEW PICK REQUIRED", affected: true });
    expect(impactValue(addition, "CARD MEMBERSHIP")).toMatchObject({ value: "ADDED", affected: true });
    expect(addition.playerResult).toContain("existing picks remain valid");
    expect(addition.requiresAcknowledgment).toBe(true);
  });

  it("states the canonical preservation and repick boundaries for removal and replacement", () => {
    const removal = monitoringDecisionPresentation(finding({
      action: "remove_bout",
      event_id: "ufc-test",
      bout_id: "alpha-beta",
      expected_included_in_picks: true,
      expected_red_fighter_slug: "alpha",
      expected_blue_fighter_slug: "beta",
    }))!;
    const replacement = monitoringDecisionPresentation(finding({
      action: "replace_fighter",
      event_id: "ufc-test",
      bout_id: "alpha-beta",
      corner: "blue",
      expected_red_fighter_slug: "alpha",
      expected_blue_fighter_slug: "beta",
      replacement_fighter_slug: "replacement",
      replacement_fighter_name: "Replacement",
    }, {
      beforeValue: { red_fighter_name: "Alpha", blue_fighter_name: "Beta" },
    }))!;

    expect(impactValue(removal, "PLAYER PICKS")).toMatchObject({ value: "PRESERVED / EXCLUDED", affected: true });
    expect(removal.consequence).toContain("excluded from choices, progress, scoring, results, and odds");
    expect(impactValue(replacement, "PLAYER PICKS")).toMatchObject({ value: "REPICK REQUIRED", affected: true });
    expect(replacement.playerResult).toContain("Affected members must repick");
    expect(removal.requiresAcknowledgment).toBe(true);
    expect(replacement.requiresAcknowledgment).toBe(true);
  });
});

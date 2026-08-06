import type { CardChangeApprovalProposal } from "./cardChangeApproval";
import { compactMonitoringValue } from "./monitoringChangeValues";
import type { MonitoringFinding } from "./monitoringInboxModel";

export interface MonitoringDecisionImpact {
  label: "PLAYER PICKS" | "FIGHT ORDER" | "DEADLINE" | "ODDS" | "CARD MEMBERSHIP";
  value: string;
  affected: boolean;
}

export interface MonitoringDecisionPresentation {
  action: CardChangeApprovalProposal["action"];
  fieldLabel: string;
  subject: string;
  currentValue: string;
  proposedValue: string;
  consequence: string;
  playerResult: string;
  auditReason: string;
  requiresAcknowledgment: boolean;
  impacts: MonitoringDecisionImpact[];
}

function readableValue(value: unknown, fallback = "NOT SET") {
  if (value === null || value === undefined || value === "") return fallback;
  return compactMonitoringValue(value);
}

function matchupLabel(finding: MonitoringFinding) {
  return finding.matchupIdentity?.replaceAll("|", " vs. ")
    ?? (finding.boutId ? `Fight ${finding.boutId}` : "Current UFC event");
}

function fighterName(value: unknown, corner: "red" | "blue", fallback: string) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const name = (value as Record<string, unknown>)[`${corner}_fighter_name`];
    if (typeof name === "string" && name.trim()) return name.trim();
  }
  return fallback;
}

function orderValue(value: string[]) {
  return value.join(" → ");
}

function impacts(values: Record<MonitoringDecisionImpact["label"], [string, boolean]>) {
  return (Object.entries(values) as [MonitoringDecisionImpact["label"], [string, boolean]][])
    .map(([label, [value, affected]]) => ({ label, value, affected }));
}

export function monitoringDecisionPresentation(
  finding: MonitoringFinding,
): MonitoringDecisionPresentation | null {
  const proposal = finding.approvalProposal;
  if (!proposal) return null;

  if (proposal.action === "adjust_event_lock") {
    return {
      action: proposal.action,
      fieldLabel: "EVENT DEADLINE",
      subject: "Current UFC event",
      currentValue: readableValue(proposal.expected_locks_at),
      proposedValue: readableValue(proposal.proposed_locks_at),
      consequence: "Moves the event-wide Picks deadline. Existing picks remain valid, but the time available to submit or edit them changes.",
      playerResult: "No repick is required. The submission window changes for every member.",
      auditReason: "Owner confirmed the UFC-source event deadline.",
      requiresAcknowledgment: true,
      impacts: impacts({
        "PLAYER PICKS": ["VALID", false],
        "FIGHT ORDER": ["UNCHANGED", false],
        DEADLINE: ["CHANGES", true],
        ODDS: ["AUTOMATIC", false],
        "CARD MEMBERSHIP": ["UNCHANGED", false],
      }),
    };
  }

  if (proposal.action === "update_event_metadata") {
    const field = proposal.field === "venue" ? "VENUE" : "LOCATION";
    return {
      action: proposal.action,
      fieldLabel: field,
      subject: "Current UFC event",
      currentValue: readableValue(proposal.expected_value),
      proposedValue: proposal.proposed_value,
      consequence: `Updates the event ${proposal.field} to the UFC-source value. No fight or Picks state changes.`,
      playerResult: "Existing picks stay valid. No player action is required.",
      auditReason: `Owner confirmed the UFC-source event ${proposal.field}.`,
      requiresAcknowledgment: false,
      impacts: impacts({
        "PLAYER PICKS": ["VALID", false],
        "FIGHT ORDER": ["UNCHANGED", false],
        DEADLINE: ["UNCHANGED", false],
        ODDS: ["AUTOMATIC", false],
        "CARD MEMBERSHIP": ["UNCHANGED", false],
      }),
    };
  }

  if (proposal.action === "update_bout_weight_class") {
    return {
      action: proposal.action,
      fieldLabel: "WEIGHT CLASS",
      subject: matchupLabel(finding),
      currentValue: readableValue(proposal.expected_weight_class),
      proposedValue: proposal.proposed_weight_class,
      consequence: "Updates the displayed weight class for this fight. The matchup and Picks state stay unchanged.",
      playerResult: "Existing picks stay valid. No player action is required.",
      auditReason: "Owner confirmed the UFC-source weight class.",
      requiresAcknowledgment: false,
      impacts: impacts({
        "PLAYER PICKS": ["VALID", false],
        "FIGHT ORDER": ["UNCHANGED", false],
        DEADLINE: ["UNCHANGED", false],
        ODDS: ["AUTOMATIC", false],
        "CARD MEMBERSHIP": ["UNCHANGED", false],
      }),
    };
  }

  if (proposal.action === "remove_bout") {
    const subject = matchupLabel(finding);
    return {
      action: proposal.action,
      fieldLabel: "CARD MEMBERSHIP",
      subject,
      currentValue: `${subject} · INCLUDED IN PICKS`,
      proposedValue: `${subject} · REMOVED FROM PICKS`,
      consequence: "Removes this fight from active Picks. Submitted picks are preserved but excluded from choices, progress, scoring, results, and odds until the fight is restored.",
      playerResult: "No repick is requested while the fight is excluded. Preserved picks reactivate if it is restored.",
      auditReason: "Owner confirmed the UFC-source fight removal.",
      requiresAcknowledgment: true,
      impacts: impacts({
        "PLAYER PICKS": ["PRESERVED / EXCLUDED", true],
        "FIGHT ORDER": ["FIGHT REMOVED", true],
        DEADLINE: ["UNCHANGED", false],
        ODDS: ["EXCLUDED", true],
        "CARD MEMBERSHIP": ["REMOVED", true],
      }),
    };
  }

  if (proposal.action === "replace_fighter") {
    const current = fighterName(
      finding.beforeValue,
      proposal.corner,
      proposal.corner === "red"
        ? proposal.expected_red_fighter_slug
        : proposal.expected_blue_fighter_slug,
    );
    return {
      action: proposal.action,
      fieldLabel: `${proposal.corner.toUpperCase()} CORNER FIGHTER`,
      subject: matchupLabel(finding),
      currentValue: current,
      proposedValue: proposal.replacement_fighter_name,
      consequence: "Replaces one fighter in the existing matchup through the canonical Picks replacement action.",
      playerResult: "Picks on this fight are invalidated. Affected members must repick.",
      auditReason: "Owner confirmed the UFC-source fighter replacement.",
      requiresAcknowledgment: true,
      impacts: impacts({
        "PLAYER PICKS": ["REPICK REQUIRED", true],
        "FIGHT ORDER": ["UNCHANGED", false],
        DEADLINE: ["UNCHANGED", false],
        ODDS: ["MATCHUP AFFECTED", true],
        "CARD MEMBERSHIP": ["UNCHANGED", false],
      }),
    };
  }

  return {
    action: proposal.action,
    fieldLabel: "FIGHT ORDER",
    subject: "Current UFC event",
    currentValue: orderValue(proposal.expected_bout_ids),
    proposedValue: orderValue(proposal.proposed_bout_ids),
    consequence: "Applies the UFC-source fight order through the existing canonical reorder action.",
    playerResult: "Existing fighter selections stay attached to their fights. No repick is required.",
    auditReason: "Owner confirmed the UFC-source fight order.",
    requiresAcknowledgment: false,
    impacts: impacts({
      "PLAYER PICKS": ["VALID", false],
      "FIGHT ORDER": ["CHANGES", true],
      DEADLINE: ["UNCHANGED", false],
      ODDS: ["AUTOMATIC", false],
      "CARD MEMBERSHIP": ["UNCHANGED", false],
    }),
  };
}

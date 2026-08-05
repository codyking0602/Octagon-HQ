import { sourceChanges } from "../../../supabase/functions/sync-next-ufc-event/cardChanges.ts";
import { canonicalFightPair } from "../../../supabase/functions/sync-next-ufc-event/normalization.ts";
import { fighterOddsIdentity } from "./oddsModel.ts";
import type { MonitoringFindingInput } from "./monitoringStorageModel.ts";

export type CardChangeApprovalProposal =
  | {
      action: "adjust_event_lock";
      event_id: string;
      expected_locks_at: string;
      proposed_locks_at: string;
    }
  | {
      action: "remove_bout";
      event_id: string;
      bout_id: string;
      expected_included_in_picks: true;
      expected_red_fighter_slug: string;
      expected_blue_fighter_slug: string;
    }
  | {
      action: "replace_fighter";
      event_id: string;
      bout_id: string;
      corner: "red" | "blue";
      expected_red_fighter_slug: string;
      expected_blue_fighter_slug: string;
      replacement_fighter_slug: string;
      replacement_fighter_name: string;
    }
  | {
      action: "reorder_card";
      event_id: string;
      expected_bout_ids: string[];
      proposed_bout_ids: string[];
    };

export interface ApprovalMonitoringBout {
  bout_id: string;
  red_fighter_slug: string;
  red_fighter_name: string;
  blue_fighter_slug: string;
  blue_fighter_name: string;
  included_in_picks?: boolean;
  weight_class?: string;
}

export interface ApprovalMonitoringEvent {
  event_id: string;
  name: string;
  subtitle: string;
  venue?: string;
  location?: string;
  source_url?: string;
  prelims_starts_at?: string;
  starts_at: string;
  locks_at: string;
  bouts: ApprovalMonitoringBout[];
}

interface ApprovalSourceEvent extends ApprovalMonitoringEvent {
  source_url: string;
}

function stableKey(...values: unknown[]) {
  return values
    .map((value) => JSON.stringify(value))
    .join(":")
    .toLowerCase()
    .replace(/[^a-z0-9|:+-]+/g, "-")
    .replace(/^-|-$/g, "");
}

function matchup(bout: ApprovalMonitoringBout) {
  return canonicalFightPair(bout.red_fighter_name, bout.blue_fighter_name);
}

function inScope(bout: ApprovalMonitoringBout, scope: "main" | "full") {
  return scope === "full" || !/^(?:early-)?prelim-/.test(bout.bout_id);
}

function finding(input: {
  identity: string;
  kind: "staged" | "current";
  detectedAt: string;
  summary: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  boutId?: string;
  matchupIdentity?: string;
  proposal?: CardChangeApprovalProposal;
}): MonitoringFindingInput {
  return {
    finding_key: stableKey(
      input.identity,
      "card_change",
      input.proposal?.action ?? "review_only",
      input.summary,
      input.beforeValue ?? null,
      input.afterValue ?? null,
    ),
    finding_type: "card_change",
    severity: "warning",
    summary: input.summary,
    detected_at: input.detectedAt,
    bout_id: input.boutId,
    matchup_identity: input.matchupIdentity,
    before_value: input.beforeValue,
    after_value: input.afterValue,
    source_details: {
      source_event_identity: input.identity,
      monitored_event_kind: input.kind,
      ...(input.proposal ? { approval_proposal: input.proposal } : {}),
    },
  };
}

function replacementProposal(
  eventId: string,
  current: ApprovalMonitoringBout,
  proposed: ApprovalMonitoringBout,
): CardChangeApprovalProposal | null {
  const sameRed = fighterOddsIdentity(current.red_fighter_name)
    === fighterOddsIdentity(proposed.red_fighter_name);
  const sameBlue = fighterOddsIdentity(current.blue_fighter_name)
    === fighterOddsIdentity(proposed.blue_fighter_name);

  if (sameRed === sameBlue) return null;
  const corner = sameRed ? "blue" : "red";
  const replacementName = corner === "red"
    ? proposed.red_fighter_name
    : proposed.blue_fighter_name;
  const replacementSlug = corner === "red"
    ? proposed.red_fighter_slug
    : proposed.blue_fighter_slug;
  if (!replacementName.trim() || !replacementSlug.trim()) return null;

  return {
    action: "replace_fighter",
    event_id: eventId,
    bout_id: current.bout_id,
    corner,
    expected_red_fighter_slug: current.red_fighter_slug,
    expected_blue_fighter_slug: current.blue_fighter_slug,
    replacement_fighter_slug: replacementSlug,
    replacement_fighter_name: replacementName,
  };
}

export function buildCardChangeFindings(input: {
  identity: string;
  kind: "staged" | "current";
  eventId?: string;
  canonical: ApprovalMonitoringEvent;
  source: ApprovalSourceEvent;
  scope: "main" | "full";
  detectedAt: string;
}): MonitoringFindingInput[] {
  const canonicalBouts = input.canonical.bouts.filter((bout) => inScope(bout, input.scope));
  const sourceBouts = input.source.bouts.filter((bout) => inScope(bout, input.scope));
  const cardReference = { ...input.canonical, bouts: canonicalBouts };
  const summaries = sourceChanges(
    cardReference,
    { ...input.source, bouts: sourceBouts } as never,
    input.scope,
  );

  if (input.kind !== "current" || !input.eventId) {
    return summaries.map((summary) => finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary,
    }));
  }

  const result: MonitoringFindingInput[] = [];
  const currentByMatchup = new Map(canonicalBouts.map((bout) => [matchup(bout), bout]));
  const sourceByMatchup = new Map(sourceBouts.map((bout) => [matchup(bout), bout]));
  const unmatchedCurrent = canonicalBouts.filter((bout) => !sourceByMatchup.has(matchup(bout)));
  const unmatchedSource = sourceBouts.filter((bout) => !currentByMatchup.has(matchup(bout)));
  const consumedCurrent = new Set<string>();
  const consumedSource = new Set<string>();

  if (unmatchedCurrent.length === 1 && unmatchedSource.length === 1
    && canonicalBouts.indexOf(unmatchedCurrent[0]) === sourceBouts.indexOf(unmatchedSource[0])) {
    const proposal = replacementProposal(input.eventId, unmatchedCurrent[0], unmatchedSource[0]);
    if (proposal?.action === "replace_fighter") {
      const current = unmatchedCurrent[0];
      const proposed = unmatchedSource[0];
      consumedCurrent.add(matchup(current));
      consumedSource.add(matchup(proposed));
      const beforeName = proposal.corner === "red"
        ? current.red_fighter_name
        : current.blue_fighter_name;
      result.push(finding({
        identity: input.identity,
        kind: input.kind,
        detectedAt: input.detectedAt,
        summary: `Replace ${beforeName} with ${proposal.replacement_fighter_name}.`,
        beforeValue: {
          red_fighter_name: current.red_fighter_name,
          blue_fighter_name: current.blue_fighter_name,
        },
        afterValue: {
          red_fighter_name: proposed.red_fighter_name,
          blue_fighter_name: proposed.blue_fighter_name,
        },
        boutId: current.bout_id,
        matchupIdentity: matchup(current),
        proposal,
      }));
    }
  }

  const hasUnresolvedAddedFight = unmatchedSource.some((bout) => !consumedSource.has(matchup(bout)));
  if (!hasUnresolvedAddedFight) {
    for (const current of unmatchedCurrent) {
      if (consumedCurrent.has(matchup(current))) continue;
      result.push(finding({
        identity: input.identity,
        kind: input.kind,
        detectedAt: input.detectedAt,
        summary: `Remove ${current.red_fighter_name} vs. ${current.blue_fighter_name} from Picks.`,
        beforeValue: { included_in_picks: true },
        afterValue: { included_in_picks: false },
        boutId: current.bout_id,
        matchupIdentity: matchup(current),
        proposal: {
          action: "remove_bout",
          event_id: input.eventId,
          bout_id: current.bout_id,
          expected_included_in_picks: true,
          expected_red_fighter_slug: current.red_fighter_slug,
          expected_blue_fighter_slug: current.blue_fighter_slug,
        },
      }));
    }
  }

  const expectedOrder = canonicalBouts.map((bout) => bout.bout_id);
  const proposedOrder = sourceBouts
    .map((bout) => currentByMatchup.get(matchup(bout))?.bout_id ?? null)
    .filter((boutId): boutId is string => Boolean(boutId));
  const canReorder = proposedOrder.length === expectedOrder.length
    && proposedOrder.every((boutId) => expectedOrder.includes(boutId));
  if (canReorder && proposedOrder.some((boutId, index) => boutId !== expectedOrder[index])) {
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: "Apply the detected fight order.",
      beforeValue: expectedOrder,
      afterValue: proposedOrder,
      proposal: {
        action: "reorder_card",
        event_id: input.eventId,
        expected_bout_ids: expectedOrder,
        proposed_bout_ids: proposedOrder,
      },
    }));
  }

  const canonicalStart = Date.parse(input.canonical.starts_at);
  const sourceStart = Date.parse(input.source.starts_at);
  if (canonicalStart === sourceStart
    && Date.parse(input.canonical.locks_at) !== Date.parse(input.source.locks_at)) {
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: "Update the event-wide Picks deadline.",
      beforeValue: input.canonical.locks_at,
      afterValue: input.source.locks_at,
      proposal: {
        action: "adjust_event_lock",
        event_id: input.eventId,
        expected_locks_at: input.canonical.locks_at,
        proposed_locks_at: input.source.locks_at,
      },
    }));
  }

  for (const summary of summaries) {
    if (summary === "Fight order changed." && canReorder) continue;
    if (summary === "Picks lock changed." && canonicalStart === sourceStart) continue;
    if (summary.startsWith("Removed ")) {
      const consumed = unmatchedCurrent.some((bout) => (
        consumedCurrent.has(matchup(bout))
        && summary.includes(`${bout.red_fighter_name} vs. ${bout.blue_fighter_name}`)
      ));
      const proposedRemoval = !hasUnresolvedAddedFight && unmatchedCurrent.some((bout) => (
        summary.includes(`${bout.red_fighter_name} vs. ${bout.blue_fighter_name}`)
      ));
      if (consumed || proposedRemoval) continue;
    }
    if (summary.startsWith("Added ") && unmatchedSource.some((bout) => (
      consumedSource.has(matchup(bout))
      && summary.includes(`${bout.red_fighter_name} vs. ${bout.blue_fighter_name}`)
    ))) continue;
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary,
    }));
  }

  return result;
}

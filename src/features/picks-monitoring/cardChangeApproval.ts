import { sourceChangeDetails } from "../../../supabase/functions/sync-next-ufc-event/cardChanges.ts";
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
      action: "update_event_metadata";
      event_id: string;
      field: "venue" | "location";
      expected_value: string | null;
      proposed_value: string;
    }
  | {
      action: "update_bout_weight_class";
      event_id: string;
      bout_id: string;
      expected_weight_class: string | null;
      proposed_weight_class: string;
      expected_red_fighter_slug: string;
      expected_blue_fighter_slug: string;
    }
  | {
      action: "add_bout";
      event_id: string;
      bout_id: string;
      weight_class: string;
      red_fighter_slug: string;
      red_fighter_name: string;
      blue_fighter_slug: string;
      blue_fighter_name: string;
      card_segment: "prelim" | "main";
      segment_sequence: number;
      locks_at: string;
      expected_bout_ids: string[];
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
  card_segment?: "prelim" | "main";
  segment_sequence?: number;
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

type ChangeField = "venue" | "location" | "weight_class" | "locks_at" | "fight_order" | "fighters" | "included_in_picks" | "other";

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

function textValue(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function changeField(summary: string): ChangeField {
  if (/^Venue (?:found|changed)\./.test(summary)) return "venue";
  if (/^Location (?:found|changed)\./.test(summary)) return "location";
  if (/^Weight class (?:found|changed) for /.test(summary)) return "weight_class";
  if (summary === "Picks lock changed." || summary === "Picks lock found.") return "locks_at";
  if (summary === "Fight order changed.") return "fight_order";
  return "other";
}

function finding(input: {
  identity: string;
  kind: "staged" | "current";
  detectedAt: string;
  summary: string;
  subjectKey: string;
  field: ChangeField;
  beforeValue?: unknown;
  afterValue?: unknown;
  boutId?: string;
  matchupIdentity?: string;
  proposal?: CardChangeApprovalProposal;
}): MonitoringFindingInput {
  const findingIdentity = stableKey(input.identity, "card_change", input.subjectKey, input.field);
  return {
    finding_key: stableKey(findingIdentity, input.afterValue ?? null),
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
      finding_identity: findingIdentity,
      change_field: input.field,
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

function genericSubject(summary: string, boutId?: string) {
  const field = changeField(summary);
  if (field === "venue" || field === "location" || field === "locks_at" || field === "fight_order") {
    return `event:${field}`;
  }
  if (field === "weight_class") return `bout:${boutId ?? summary}:weight_class`;
  return `review:${summary.replace(/\.$/, "")}`;
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
  const changes = sourceChangeDetails(
    cardReference,
    { ...input.source, bouts: sourceBouts } as never,
    input.scope,
  );

  if (input.kind !== "current" || !input.eventId) {
    return changes.map((change) => {
      const field = changeField(change.summary);
      return finding({
        identity: input.identity,
        kind: input.kind,
        detectedAt: input.detectedAt,
        summary: change.summary,
        subjectKey: genericSubject(change.summary),
        field,
        beforeValue: change.beforeValue,
        afterValue: change.afterValue,
      });
    });
  }

  const result: MonitoringFindingInput[] = [];
  const currentByMatchup = new Map(canonicalBouts.map((bout) => [matchup(bout), bout]));
  const sourceByMatchup = new Map(sourceBouts.map((bout) => [matchup(bout), bout]));
  const unmatchedCurrent = canonicalBouts.filter((bout) => !sourceByMatchup.has(matchup(bout)));
  const unmatchedSource = sourceBouts.filter((bout) => !currentByMatchup.has(matchup(bout)));
  const consumedCurrent = new Set<string>();
  const consumedSource = new Set<string>();
  const handledSummaries = new Set<string>();

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
        subjectKey: `bout:${current.bout_id}:fighters`,
        field: "fighters",
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

  const safeAddedFight = unmatchedCurrent.length === 0 && unmatchedSource.length === 1
    ? unmatchedSource[0]
    : null;
  const addedWeightClass = textValue(safeAddedFight?.weight_class);
  const addedCardSegment = safeAddedFight?.card_segment === "main" || safeAddedFight?.card_segment === "prelim"
    ? safeAddedFight.card_segment
    : null;
  const addedSegmentSequence = safeAddedFight && addedCardSegment
    && Number.isInteger(safeAddedFight.segment_sequence)
    && (safeAddedFight.segment_sequence ?? 0) > 0
    ? safeAddedFight.segment_sequence!
    : null;
  if (safeAddedFight && addedWeightClass && addedCardSegment && addedSegmentSequence
    && safeAddedFight.bout_id.trim()
    && safeAddedFight.red_fighter_slug.trim()
    && safeAddedFight.red_fighter_name.trim()
    && safeAddedFight.blue_fighter_slug.trim()
    && safeAddedFight.blue_fighter_name.trim()) {
    consumedSource.add(matchup(safeAddedFight));
    const expectedBoutIds = canonicalBouts.map((bout) => bout.bout_id);
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: `Add ${safeAddedFight.red_fighter_name} vs. ${safeAddedFight.blue_fighter_name} to Picks.`,
      subjectKey: `bout:${safeAddedFight.bout_id}:included_in_picks`,
      field: "included_in_picks",
      beforeValue: null,
      afterValue: {
        red_fighter_name: safeAddedFight.red_fighter_name,
        blue_fighter_name: safeAddedFight.blue_fighter_name,
        weight_class: addedWeightClass,
      },
      boutId: safeAddedFight.bout_id,
      matchupIdentity: matchup(safeAddedFight),
      proposal: {
        action: "add_bout",
        event_id: input.eventId,
        bout_id: safeAddedFight.bout_id,
        weight_class: addedWeightClass,
        red_fighter_slug: safeAddedFight.red_fighter_slug,
        red_fighter_name: safeAddedFight.red_fighter_name,
        blue_fighter_slug: safeAddedFight.blue_fighter_slug,
        blue_fighter_name: safeAddedFight.blue_fighter_name,
        card_segment: addedCardSegment,
        segment_sequence: addedSegmentSequence,
        locks_at: input.canonical.locks_at,
        expected_bout_ids: expectedBoutIds,
      },
    }));
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
        subjectKey: `bout:${current.bout_id}:included_in_picks`,
        field: "included_in_picks",
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
      subjectKey: "event:fight_order",
      field: "fight_order",
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
      subjectKey: "event:locks_at",
      field: "locks_at",
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

  for (const field of ["venue", "location"] as const) {
    const label = field === "venue" ? "Venue" : "Location";
    const change = changes.find((item) => item.summary === `${label} changed.` || item.summary === `${label} found.`);
    const proposedValue = textValue(change?.afterValue);
    if (!change || !proposedValue) continue;
    handledSummaries.add(change.summary);
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: change.summary,
      subjectKey: `event:${field}`,
      field,
      beforeValue: change.beforeValue,
      afterValue: change.afterValue,
      proposal: {
        action: "update_event_metadata",
        event_id: input.eventId,
        field,
        expected_value: textValue(change.beforeValue),
        proposed_value: proposedValue,
      },
    }));
  }

  for (const sourceBout of sourceBouts) {
    const currentBout = currentByMatchup.get(matchup(sourceBout));
    if (!currentBout) continue;
    const label = `${sourceBout.red_fighter_name} vs. ${sourceBout.blue_fighter_name}`;
    const change = changes.find((item) => (
      item.summary === `Weight class changed for ${label}.`
      || item.summary === `Weight class found for ${label}.`
    ));
    const proposedWeightClass = textValue(change?.afterValue);
    if (!change || !proposedWeightClass) continue;
    handledSummaries.add(change.summary);
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: change.summary,
      subjectKey: `bout:${currentBout.bout_id}:weight_class`,
      field: "weight_class",
      beforeValue: change.beforeValue,
      afterValue: change.afterValue,
      boutId: currentBout.bout_id,
      matchupIdentity: matchup(currentBout),
      proposal: {
        action: "update_bout_weight_class",
        event_id: input.eventId,
        bout_id: currentBout.bout_id,
        expected_weight_class: textValue(change.beforeValue),
        proposed_weight_class: proposedWeightClass,
        expected_red_fighter_slug: currentBout.red_fighter_slug,
        expected_blue_fighter_slug: currentBout.blue_fighter_slug,
      },
    }));
  }

  for (const change of changes) {
    const summary = change.summary;
    if (handledSummaries.has(summary)) continue;
    if (summary === "Fight order changed." && canReorder) continue;
    if ((summary === "Picks lock changed." || summary === "Picks lock found.") && canonicalStart === sourceStart) continue;
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
    const field = changeField(summary);
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary,
      subjectKey: genericSubject(summary),
      field,
      beforeValue: change.beforeValue,
      afterValue: change.afterValue,
    }));
  }

  return result;
}

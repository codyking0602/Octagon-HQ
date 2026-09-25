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
    }
  | {
      action: "sync_card_segments";
      event_id: string;
      expected_segments: Array<{
        bout_id: string;
        card_segment: "prelim" | "main" | null;
        segment_sequence: number | null;
      }>;
      proposed_segments: Array<{
        bout_id: string;
        card_segment: "prelim" | "main";
        segment_sequence: number;
      }>;
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

type ChangeField = "venue" | "location" | "weight_class" | "locks_at" | "fight_order" | "card_segments" | "fighters" | "included_in_picks" | "other";

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
  allBoutIds?: string[];
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
  const allBoutIds = input.allBoutIds?.length
    ? [...input.allBoutIds]
    : canonicalBouts.map((bout) => bout.bout_id);
  const sourceMappedBoutId = new Map<string, string>();

  for (const sourceBout of sourceBouts) {
    const current = currentByMatchup.get(matchup(sourceBout));
    if (current) sourceMappedBoutId.set(matchup(sourceBout), current.bout_id);
  }

  // Multiple simultaneous opponent swaps are safe when each unmatched source bout
  // has exactly one one-fighter-overlap candidate and that candidate is mutual.
  // Anything less specific remains review-only.
  for (const current of unmatchedCurrent) {
    const candidates = unmatchedSource.filter((proposed) => (
      replacementProposal(input.eventId!, current, proposed)?.action === "replace_fighter"
    ));
    if (candidates.length !== 1) continue;

    const proposed = candidates[0]!;
    const reverseCandidates = unmatchedCurrent.filter((candidate) => (
      replacementProposal(input.eventId!, candidate, proposed)?.action === "replace_fighter"
    ));
    if (reverseCandidates.length !== 1) continue;

    const proposal = replacementProposal(input.eventId!, current, proposed);
    if (proposal?.action !== "replace_fighter") continue;

    consumedCurrent.add(matchup(current));
    consumedSource.add(matchup(proposed));
    sourceMappedBoutId.set(matchup(proposed), current.bout_id);
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

  const remainingSource = unmatchedSource.filter((bout) => !consumedSource.has(matchup(bout)));
  for (const addedFight of remainingSource) {
    const addedWeightClass = textValue(addedFight.weight_class);
    const addedCardSegment = addedFight.card_segment === "main" || addedFight.card_segment === "prelim"
      ? addedFight.card_segment
      : null;
    const addedSegmentSequence = addedCardSegment
      && Number.isInteger(addedFight.segment_sequence)
      && (addedFight.segment_sequence ?? 0) > 0
      ? addedFight.segment_sequence!
      : null;

    if (!addedWeightClass || !addedCardSegment || !addedSegmentSequence
      || !addedFight.bout_id.trim()
      || !addedFight.red_fighter_slug.trim()
      || !addedFight.red_fighter_name.trim()
      || !addedFight.blue_fighter_slug.trim()
      || !addedFight.blue_fighter_name.trim()) {
      continue;
    }

    consumedSource.add(matchup(addedFight));
    sourceMappedBoutId.set(matchup(addedFight), addedFight.bout_id);
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: `Add ${addedFight.red_fighter_name} vs. ${addedFight.blue_fighter_name} to Picks.`,
      subjectKey: `bout:${addedFight.bout_id}:included_in_picks`,
      field: "included_in_picks",
      beforeValue: null,
      afterValue: {
        red_fighter_name: addedFight.red_fighter_name,
        blue_fighter_name: addedFight.blue_fighter_name,
        weight_class: addedWeightClass,
      },
      boutId: addedFight.bout_id,
      matchupIdentity: matchup(addedFight),
      proposal: {
        action: "add_bout",
        event_id: input.eventId,
        bout_id: addedFight.bout_id,
        weight_class: addedWeightClass,
        red_fighter_slug: addedFight.red_fighter_slug,
        red_fighter_name: addedFight.red_fighter_name,
        blue_fighter_slug: addedFight.blue_fighter_slug,
        blue_fighter_name: addedFight.blue_fighter_name,
        card_segment: addedCardSegment,
        segment_sequence: addedSegmentSequence,
        locks_at: input.canonical.locks_at,
        expected_bout_ids: allBoutIds,
      },
    }));
  }

  const hasUnresolvedAddedFight = remainingSource.some((bout) => !consumedSource.has(matchup(bout)));
  const remainingCurrent = unmatchedCurrent.filter((bout) => !consumedCurrent.has(matchup(bout)));
  if (!hasUnresolvedAddedFight) {
    for (const current of remainingCurrent) {
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

  const structuralSetChanged = remainingCurrent.length > 0 || remainingSource.length > 0;
  const exactSegmentSet = !structuralSetChanged
    && sourceMappedBoutId.size === sourceBouts.length
    && canonicalBouts.length === sourceBouts.length;
  const expectedSegments = canonicalBouts.map((bout) => ({
    bout_id: bout.bout_id,
    card_segment: bout.card_segment === "main" || bout.card_segment === "prelim"
      ? bout.card_segment
      : null,
    segment_sequence: Number.isInteger(bout.segment_sequence) && (bout.segment_sequence ?? 0) > 0
      ? bout.segment_sequence!
      : null,
  }));
  const proposedSegments = exactSegmentSet
    ? sourceBouts.map((sourceBout) => ({
        bout_id: sourceMappedBoutId.get(matchup(sourceBout))!,
        card_segment: sourceBout.card_segment,
        segment_sequence: sourceBout.segment_sequence,
      }))
    : [];
  const validProposedSegments = exactSegmentSet
    && proposedSegments.every((item) => (
      (item.card_segment === "main" || item.card_segment === "prelim")
      && Number.isInteger(item.segment_sequence)
      && (item.segment_sequence ?? 0) > 0
    ));
  const expectedSegmentMap = new Map(expectedSegments.map((item) => [item.bout_id, item]));
  const cardSegmentsChanged = validProposedSegments && proposedSegments.some((item) => {
    const expected = expectedSegmentMap.get(item.bout_id);
    return expected?.card_segment !== item.card_segment
      || expected?.segment_sequence !== item.segment_sequence;
  });
  if (cardSegmentsChanged) {
    changes
      .filter((change) => change.summary.startsWith("Moved "))
      .forEach((change) => handledSummaries.add(change.summary));
    result.push(finding({
      identity: input.identity,
      kind: input.kind,
      detectedAt: input.detectedAt,
      summary: "Apply the detected main/prelim placement.",
      subjectKey: "event:card_segments",
      field: "card_segments",
      beforeValue: expectedSegments,
      afterValue: proposedSegments,
      proposal: {
        action: "sync_card_segments",
        event_id: input.eventId,
        expected_segments: expectedSegments,
        proposed_segments: proposedSegments.map((item) => ({
          bout_id: item.bout_id,
          card_segment: item.card_segment as "prelim" | "main",
          segment_sequence: item.segment_sequence as number,
        })),
      },
    }));
  }

  const eventualActiveIds = sourceBouts
    .map((bout) => sourceMappedBoutId.get(matchup(bout)) ?? null)
    .filter((boutId): boutId is string => Boolean(boutId));
  const addedIds = eventualActiveIds.filter((boutId) => !allBoutIds.includes(boutId));
  const expectedOrder = [...allBoutIds, ...addedIds.filter((boutId, index) => addedIds.indexOf(boutId) === index)];
  const proposedOrder = [
    ...eventualActiveIds,
    ...expectedOrder.filter((boutId) => !eventualActiveIds.includes(boutId)),
  ];
  const canReorder = !hasUnresolvedAddedFight
    && eventualActiveIds.length === sourceBouts.length
    && proposedOrder.length === expectedOrder.length
    && new Set(proposedOrder).size === proposedOrder.length;
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

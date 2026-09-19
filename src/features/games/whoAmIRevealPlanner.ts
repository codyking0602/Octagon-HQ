import {
  assembleWhoAmIClues,
  whoAmIClueFacet,
  whoAmIClueSelectionClass,
} from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueBand, WhoAmIClueFacet } from "./whoAmIEngine";
import {
  whoAmIClueHasHardEditorialFailure,
  whoAmICluesShareInformation,
  whoAmISemanticClueKey,
} from "./whoAmISemanticQuality";

const REVEAL_SHORTLIST_EXTRA = 4;

const REVEAL_TARGETS = {
  broad: 2,
  helpful: 2,
  strong: 4,
  final: 2,
} as const;

const BAND_RANK: Readonly<Record<WhoAmIClueBand, number>> = {
  broad: 0,
  helpful: 1,
  strong: 2,
  giveaway: 3,
};

function recognitionStrength(clue: WhoAmIClue) {
  const facet = whoAmIClueFacet(clue);
  const base: Readonly<Record<WhoAmIClueFacet, number>> = {
    role: 20,
    era: 20,
    background: 40,
    style: 55,
    "career-path": 75,
    accomplishments: 85,
    relationships: 80,
    nickname: 100,
    "off-field": 35,
    production: 25,
    identity: 60,
  };
  let strength = base[facet];
  const text = clue.text.toLowerCase();
  const selectionClass = whoAmIClueSelectionClass(clue);

  if (selectionClass === "sports-identity") strength += 10;
  else if (selectionClass === "identity-color") strength -= 10;
  else strength -= 35;

  if (/\b(?:heisman|mvp|hall of fame|no\. 1 overall|first overall|first quarterback|champion|championship|title|all-america|all-american|all-pro)\b/.test(text)) strength += 15;
  if (/\b(?:defeated|lost to|fought|shared the octagon|played for|head coach for|transferred from|transferred to|drafted|selected no\.)\b/.test(text)) strength += 12;
  if (/\b(?:signature|celebration|nickname|moniker|jersey number|wore no\.)\b/.test(text)) strength += 18;
  if (/\b\d{2,4}\b/.test(text) && facet === "production") strength -= 5;
  if (/\b\d+\s+(?:ufc\s+)?(?:wins|fights|games|starts)\b/.test(text) && facet === "production") strength -= 8;

  return strength;
}

type RankedClue = {
  value: WhoAmIClue;
  index: number;
  variationRank: number;
};

function ranked(values: readonly WhoAmIClue[], random?: () => number): RankedClue[] {
  return values.map((value, index) => ({
    value,
    index,
    variationRank: random ? random() : 0.5,
  }));
}

function qualityFirst(left: RankedClue, right: RankedClue) {
  const strengthDifference = recognitionStrength(right.value) - recognitionStrength(left.value);
  if (Math.abs(strengthDifference) > 30) return strengthDifference;
  return left.variationRank - right.variationRank
    || strengthDifference
    || left.index - right.index;
}

function revealOrder(left: RankedClue, right: RankedClue) {
  const bandDifference = BAND_RANK[left.value.band] - BAND_RANK[right.value.band];
  if (bandDifference !== 0) return bandDifference;
  const strengthDifference = recognitionStrength(left.value) - recognitionStrength(right.value);
  if (strengthDifference !== 0) return strengthDifference;
  return left.index - right.index;
}

function isGenericCareerGames(clue: WhoAmIClue) {
  return /fact:(?:nfl|cfb)-career-games$/.test(clue.id);
}

function eligibleRevealPool(clues: readonly WhoAmIClue[], limit: number) {
  if (clues.length <= 12) return clues;
  const withoutGenericCareerGames = clues.filter((clue) => !isGenericCareerGames(clue));
  return withoutGenericCareerGames.length >= limit ? withoutGenericCareerGames : clues;
}

type ReplaySwapOption = {
  current: WhoAmIClue;
  candidate: WhoAmIClue;
  selectedIndex: number;
};

function qualityCompatibleReplayOptions(
  planned: readonly WhoAmIClue[],
  eligibleClues: readonly WhoAmIClue[],
): ReplaySwapOption[] {
  return planned.flatMap((current, selectedIndex): ReplaySwapOption[] => {
    if (current.band !== "helpful" && current.band !== "strong") return [];
    const currentClass = whoAmIClueSelectionClass(current);
    const otherSelected = planned.filter((_clue, index) => index !== selectedIndex);

    return eligibleClues
      .filter((candidate) => !planned.includes(candidate))
      .filter((candidate) => candidate.band === current.band)
      .filter((candidate) => whoAmIClueSelectionClass(candidate) === currentClass)
      .filter((candidate) => !isGenericCareerGames(candidate))
      .filter((candidate) => !whoAmIClueHasHardEditorialFailure(candidate))
      .filter((candidate) => Math.abs(recognitionStrength(candidate) - recognitionStrength(current)) <= 20)
      .filter((candidate) => !whoAmICluesShareInformation(current, candidate))
      .filter((candidate) => !otherSelected.some((other) => (
        (other.conceptId ?? other.id) === (candidate.conceptId ?? candidate.id)
        || whoAmICluesShareInformation(other, candidate)
      )))
      .filter((candidate) => {
        const prospective = [...planned];
        prospective[selectedIndex] = candidate;
        const prospectiveClasses = prospective.map(whoAmIClueSelectionClass);
        const prospectiveFacets = prospective.map(whoAmIClueFacet);
        return (
          prospectiveClasses.filter((selectionClass) => selectionClass === "sports-identity").length >= 7
          && prospectiveClasses.filter((selectionClass) => selectionClass === "deep-biography").length <= 1
          && new Set(prospectiveFacets).size >= 4
          && prospectiveFacets.filter((facet) => facet === "relationships").length <= 1
          && prospectiveFacets.filter((facet) => facet === "production").length <= 2
        );
      })
      .map((candidate) => ({ current, candidate, selectedIndex }));
  });
}

function boardReachedReplayPlanning(planned: readonly WhoAmIClue[]) {
  if (planned.length !== 10) return false;
  if (!planned.slice(0, 2).every((clue) => clue.band === "broad")) return false;
  if (!planned.slice(2, 4).every((clue) => clue.band === "helpful")) return false;
  if (!planned.slice(4).every((clue) => clue.band === "strong" || clue.band === "giveaway")) return false;
  if (planned.slice(4).filter((clue) => clue.band === "strong").length < 4) return false;
  if (planned.some((clue) => whoAmIClueHasHardEditorialFailure(clue))) return false;

  const selectionClasses = planned.map(whoAmIClueSelectionClass);
  const facets = planned.map(whoAmIClueFacet);
  if (
    selectionClasses.filter((selectionClass) => selectionClass === "sports-identity").length < 7
    || selectionClasses.filter((selectionClass) => selectionClass === "deep-biography").length > 1
    || new Set(facets).size < 4
    || facets.filter((facet) => facet === "relationships").length > 1
    || facets.filter((facet) => facet === "production").length > 2
  ) {
    return false;
  }

  return !planned.some((left, leftIndex) => (
    planned.some((right, rightIndex) => (
      rightIndex > leftIndex && whoAmICluesShareInformation(left, right)
    ))
  ));
}

export function whoAmIQualityCompatibleReplayTargets(
  clues: readonly WhoAmIClue[],
  boards: readonly (readonly WhoAmIClue[])[],
) {
  const boardSize = boards[0]?.length ?? 0;
  const eligibleClues = eligibleRevealPool(clues, boardSize);
  const distinctBoards = [...new Map(
    boards.map((planned) => [
      planned.map((clue) => clue.id).sort().join("|"),
      planned,
    ]),
  ).values()];
  const baselineSurfaced = distinctBoards.reduce((best, planned) => (
    Math.max(best, new Set(planned.map(whoAmISemanticClueKey)).size)
  ), 0);
  const hasReplayDepth = distinctBoards.some((planned) => (
    boardReachedReplayPlanning(planned)
    && qualityCompatibleReplayOptions(planned, eligibleClues).length > 0
  ));

  return {
    // Legacy-safe boards can still contain fewer than ten independent facts.
    // Replay depth is measured from the semantic information actually available
    // on a quality-safe board, not from its raw ten clue slots.
    surfaced: baselineSurfaced + (hasReplayDepth ? 1 : 0),
    rotated: hasReplayDepth ? 1 : 0,
    boards: hasReplayDepth ? 2 : 1,
  };
}

export function assembleWhoAmIRevealClues(
  clues: readonly WhoAmIClue[],
  limit: number,
  random: () => number = () => 0.5,
) {
  const eligibleClues = eligibleRevealPool(clues, limit);
  if (limit !== 10) return assembleWhoAmIClues(eligibleClues, limit, random);

  const shortlist = assembleWhoAmIClues(
    eligibleClues,
    Math.min(eligibleClues.length, limit + REVEAL_SHORTLIST_EXTRA),
    random,
  );

  const broad = shortlist.filter((clue) => clue.band === "broad").slice(0, REVEAL_TARGETS.broad);
  const helpful = ranked(shortlist.filter((clue) => clue.band === "helpful"), random)
    .sort(qualityFirst)
    .slice(0, REVEAL_TARGETS.helpful)
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.value);
  const latePool = shortlist.filter((clue) => clue.band === "strong" || clue.band === "giveaway");
  const strongCount = latePool.filter((clue) => clue.band === "strong").length;

  if (
    broad.length < REVEAL_TARGETS.broad
    || helpful.length < REVEAL_TARGETS.helpful
    || strongCount < REVEAL_TARGETS.strong
    || latePool.length < REVEAL_TARGETS.strong + REVEAL_TARGETS.final
  ) {
    return assembleWhoAmIClues(eligibleClues, limit, random);
  }

  const rankedLate = ranked(latePool, random).sort(qualityFirst);
  const final: RankedClue[] = [];
  let unreservedStrong = strongCount;

  for (const candidate of rankedLate) {
    if (final.length >= REVEAL_TARGETS.final) break;
    if (
      candidate.value.band === "strong"
      && unreservedStrong - 1 < REVEAL_TARGETS.strong
    ) {
      continue;
    }
    final.push(candidate);
    if (candidate.value.band === "strong") unreservedStrong -= 1;
  }

  if (final.length < REVEAL_TARGETS.final) {
    return assembleWhoAmIClues(eligibleClues, limit, random);
  }

  const finalIds = new Set(final.map((entry) => entry.value.id));
  const coreStrong = rankedLate
    .filter((entry) => entry.value.band === "strong" && !finalIds.has(entry.value.id))
    .slice(0, REVEAL_TARGETS.strong);

  if (coreStrong.length < REVEAL_TARGETS.strong) {
    return assembleWhoAmIClues(eligibleClues, limit, random);
  }

  const orderedStrong = [...coreStrong].sort(revealOrder).map((entry) => entry.value);
  const orderedFinal = [...final].sort(revealOrder).map((entry) => entry.value);
  const planned = [...broad, ...helpful, ...orderedStrong, ...orderedFinal];
  const repeatsSemanticInformation = planned.some((left, leftIndex) => (
    planned.some((right, rightIndex) => (
      rightIndex > leftIndex && whoAmICluesShareInformation(left, right)
    ))
  ));
  if (repeatsSemanticInformation) {
    return assembleWhoAmIClues(eligibleClues, limit, random);
  }

  const selectionClasses = planned.map(whoAmIClueSelectionClass);
  const facets = planned.map(whoAmIClueFacet);

  if (
    selectionClasses.filter((selectionClass) => selectionClass === "sports-identity").length < 7
    || selectionClasses.filter((selectionClass) => selectionClass === "deep-biography").length > 1
    || new Set(facets).size < 4
    || facets.filter((facet) => facet === "relationships").length > 1
  ) {
    return assembleWhoAmIClues(eligibleClues, limit, random);
  }

  // Replay must rotate information, not merely reorder the same ten clues.
  // Use the same quality-compatible option set that validation inspects.
  const replayOptions = qualityCompatibleReplayOptions(planned, eligibleClues).map((option) => ({
    ...option,
    candidateVariationRank: random(),
    currentVariationRank: random(),
  }));

  if (replayOptions.length) {
    replayOptions.sort((left, right) => (
      (left.candidateVariationRank - left.currentVariationRank)
        - (right.candidateVariationRank - right.currentVariationRank)
      || Math.abs(recognitionStrength(left.candidate) - recognitionStrength(left.current))
        - Math.abs(recognitionStrength(right.candidate) - recognitionStrength(right.current))
      || left.selectedIndex - right.selectedIndex
    ));
    const swap = replayOptions[0]!;
    if (swap.candidateVariationRank < swap.currentVariationRank) {
      const varied = [...planned];
      varied[swap.selectedIndex] = swap.candidate;
      return varied;
    }
  }

  return planned;
}

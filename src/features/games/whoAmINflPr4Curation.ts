import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueBand } from "./whoAmIEngine";
import { whoAmIRevealProfile } from "./whoAmIRevealArchitecture";
import { whoAmIClueHasHardEditorialFailure, whoAmICluesShareInformation } from "./whoAmISemanticQuality";

const GENERIC_VOLUME = /\b(?:career|across \d+ seasons?|in \d+ games?|for my career)\b.*\b\d[\d,]*(?:\.\d+)?\b/i;
const SUPERLATIVE_SIGNAL = /\b(?:record|leader|most|fewest|first|only|single-season|single game|nfl record|league record|all-time)\b/i;
const SIGNATURE_SIGNAL = /\b(?:super bowl mvp|nfl mvp|defensive player of the year|offensive player of the year|rookie of the year|hall of fame|record|all-time|first player|only player|game-winning|last-second|walk-off|miracle|nickname|known as|called the|wore no\.|no\. \d{1,2}\b)\b/i;
const ACCOMPLISHMENT_SIGNAL = /\b(?:super bowl|mvp|all-pro|pro bowl|player of the year|rookie of the year|hall of fame|championship|award|record)\b/i;

function bandRank(band: WhoAmIClueBand) {
  return ({ broad: 0, helpful: 1, strong: 2, giveaway: 3 } as const)[band];
}

function atLeastBand(clue: WhoAmIClue, band: WhoAmIClueBand): WhoAmIClue {
  return bandRank(clue.band) >= bandRank(band) ? clue : { ...clue, band };
}

function atMostBand(clue: WhoAmIClue, band: WhoAmIClueBand): WhoAmIClue {
  return bandRank(clue.band) <= bandRank(band) ? clue : { ...clue, band };
}

function annotateNflMetadata(clue: WhoAmIClue): WhoAmIClue {
  if (clue.id === "position" || clue.id === "role" || clue.id === "pr4:position" || clue.id === "pr4:role") {
    return { ...clue, facet: "role" };
  }
  if (
    clue.id === "era"
    || clue.id === "pr4:era"
    || clue.id === "player-career-start"
    || clue.id === "player-career-end"
    || clue.id === "coach-start"
    || clue.id === "coach-end"
  ) {
    return { ...clue, facet: "era" };
  }
  if (clue.id === "school" || clue.id === "pr4:school") return { ...clue, facet: "background" };
  if (clue.id === "career-path" || clue.id.startsWith("affiliation:")) {
    return { ...clue, facet: "career-path" };
  }
  if (!clue.facet) return { ...clue, facet: whoAmIClueFacet(clue) };
  return clue;
}

function ensureOrientationClues(subject: FootballSubjectProfile, clues: readonly WhoAmIClue[]) {
  const next = [...clues];

  if (!next.some((clue) => clue.id === "pr4:role")) {
    next.unshift({
      id: "pr4:role",
      conceptId: "pr4:generic-role",
      text: subject.kind === "coach"
        ? "I coached in the NFL."
        : "I played in the NFL.",
      band: "broad",
      facet: "role",
      revealPriority: 0,
    });
  }

  if (!next.some((clue) => clue.id === "era" || clue.id === "pr4:era")) {
    const decades = subject.activeDecades ?? [];
    if (decades.length === 1) {
      next.push({
        id: "pr4:era",
        conceptId: "pr4:era",
        text: subject.kind === "coach"
          ? `My NFL head-coaching career came in the ${decades[0]}s.`
          : `My NFL career came in the ${decades[0]}s.`,
        band: "helpful",
        facet: "era",
        revealPriority: 20,
      });
    } else if (decades.length > 1) {
      next.push({
        id: "pr4:era",
        conceptId: "pr4:era",
        text: subject.kind === "coach"
          ? `My NFL head-coaching career spanned the ${decades[0]}s and ${decades[decades.length - 1]}s.`
          : `My NFL career spanned the ${decades[0]}s and ${decades[decades.length - 1]}s.`,
        band: "helpful",
        facet: "era",
        revealPriority: 20,
      });
    }
  }

  if (
    subject.kind !== "coach"
    && subject.school
    && !next.some((clue) => (
      clue.id === "school"
      || clue.id === "pr4:school"
      || clue.text.toLowerCase().includes(subject.school!.toLowerCase())
    ))
  ) {
    next.push({
      id: "pr4:school",
      conceptId: `pr4:school:${subject.school.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      text: `I played college football at ${subject.school}.`,
      band: "helpful",
      facet: "background",
      revealPriority: 12,
    });
  }

  return next;
}

function nflOrientationReband(clue: WhoAmIClue) {
  if (clue.id === "pr4:role") {
    return { ...clue, band: "broad" as const, revealPriority: 0 };
  }
  if (
    clue.id === "position"
    || clue.id === "role"
    || clue.id === "pr4:position"
    || clue.id === "era"
    || clue.id === "pr4:era"
  ) {
    return { ...clue, band: "helpful" as const };
  }

  const category = whoAmIRevealProfile(clue).category;
  if (category === "role" || category === "era") return atMostBand(clue, "helpful");
  return clue;
}

function nflFoundationReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category === "school") return { ...clue, band: "helpful" as const };
  if (profile.category === "sports-biography") {
    return profile.identifyingPower === "signature"
      ? atLeastBand(clue, "strong")
      : { ...clue, band: "helpful" as const };
  }
  if (profile.category === "draft-entry") {
    return profile.identifyingPower === "specific"
      ? atLeastBand(clue, "strong")
      : atLeastBand(clue, "helpful");
  }
  return clue;
}

function nflLateAnchorReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category === "nickname-persona" || profile.category === "jersey-number") {
    return { ...clue, band: "giveaway" as const };
  }
  if (profile.category === "signature-moment") return atLeastBand(clue, "giveaway");
  if (profile.category === "records" && profile.identifyingPower === "signature") {
    return atLeastBand(clue, "giveaway");
  }
  if (
    (profile.category === "accomplishments" || profile.category === "championships")
    && SIGNATURE_SIGNAL.test(clue.text)
  ) {
    return atLeastBand(clue, "giveaway");
  }
  if (
    (profile.category === "accomplishments" || profile.category === "championships")
    && ACCOMPLISHMENT_SIGNAL.test(clue.text)
  ) {
    return atLeastBand(clue, "strong");
  }
  if (
    (profile.category === "team-path" || profile.category === "sports-biography")
    && profile.identifyingPower === "signature"
  ) {
    return atLeastBand(clue, "giveaway");
  }
  if (
    clue.band === "strong"
    && whoAmIClueSelectionClass(clue) === "sports-identity"
    && (clue.revealPriority ?? 50) <= 20
    && profile.category !== "production"
    && profile.category !== "school"
    && profile.category !== "draft-entry"
    && profile.category !== "role"
    && profile.category !== "era"
  ) {
    return atLeastBand(clue, "giveaway");
  }
  return clue;
}

function nflProductionReband(clue: WhoAmIClue) {
  if (whoAmIRevealProfile(clue).category !== "production") return clue;
  if (GENERIC_VOLUME.test(clue.text) && !SUPERLATIVE_SIGNAL.test(clue.text)) {
    return atMostBand(clue, "strong");
  }
  if (SUPERLATIVE_SIGNAL.test(clue.text)) return atLeastBand(clue, "strong");
  return clue;
}

function isPersonalBiography(clue: WhoAmIClue) {
  return whoAmIRevealProfile(clue).category === "personal-biography";
}

function personalBiographyValue(clue: WhoAmIClue) {
  const selectionClass = whoAmIClueSelectionClass(clue);
  let score = selectionClass === "sports-identity" ? 100 : selectionClass === "identity-color" ? 35 : 0;
  if (SIGNATURE_SIGNAL.test(clue.text)) score += 35;
  if (clue.facet === "off-field") score -= 20;
  score += bandRank(clue.band) * 5;
  return score;
}

function capPersonalBiography(clues: readonly WhoAmIClue[]) {
  const personal = clues
    .map((clue, index) => ({ clue, index, score: personalBiographyValue(clue) }))
    .filter(({ clue }) => isPersonalBiography(clue))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (!personal.length) return [...clues];
  const nonPersonal = clues.filter((clue) => !isPersonalBiography(clue));
  if (nonPersonal.length >= 12) return nonPersonal;
  const keepId = personal[0]!.clue.id;
  return clues.filter((clue) => !isPersonalBiography(clue) || clue.id === keepId);
}

function productionValue(clue: WhoAmIClue) {
  const text = `${clue.id} ${clue.text}`.toLowerCase();
  let score = 0;
  if (SUPERLATIVE_SIGNAL.test(text)) score += 100;
  if (/best-season|single-season|in \d{4}/.test(text)) score += 35;
  if (/career/.test(text)) score -= 25;
  if (clue.band === "giveaway") score += 20;
  if (clue.band === "strong") score += 10;
  return score;
}

function capGenericProduction(clues: readonly WhoAmIClue[]) {
  const production = clues
    .map((clue, index) => ({ clue, index, score: productionValue(clue) }))
    .filter(({ clue }) => whoAmIRevealProfile(clue).category === "production")
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (production.length <= 2) return [...clues];
  const keep = new Set(production.slice(0, 2).map(({ clue }) => clue.id));
  return clues.filter((clue) => whoAmIRevealProfile(clue).category !== "production" || keep.has(clue.id));
}

function semanticClueValue(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  let score = bandRank(clue.band) * 30;
  if (profile.category === "role") score += 220;
  if (profile.category === "era") score += 180;
  if (
    profile.category === "school"
    || profile.category === "sports-biography"
    || profile.category === "draft-entry"
    || profile.category === "style"
  ) score += 110;
  if (whoAmIClueSelectionClass(clue) === "sports-identity") score += 40;
  if (profile.identifyingPower === "signature") score += 35;
  if (profile.category === "signature-moment" || profile.category === "records") score += 25;
  if (profile.category === "production") score -= 55;
  if (isPersonalBiography(clue)) score -= 30;
  score -= clue.revealPriority ?? 50;
  return score;
}

function trimSemanticRepeats(clues: readonly WhoAmIClue[]) {
  const ranked = clues
    .map((clue, index) => ({ clue, index, score: semanticClueValue(clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected: WhoAmIClue[] = [];

  for (const { clue } of ranked) {
    if (selected.some((existing) => whoAmICluesShareInformation(existing, clue))) continue;
    selected.push(clue);
  }

  if (selected.length < 10) return [...clues];
  const selectedIds = new Set(selected.map((clue) => clue.id));
  return clues.filter((clue) => selectedIds.has(clue.id));
}

function capCategory(clues: readonly WhoAmIClue[], category: "jersey-number" | "nickname-persona", max = 1) {
  const matches = clues.filter((clue) => whoAmIRevealProfile(clue).category === category);
  if (matches.length <= max) return [...clues];
  const keep = [...matches]
    .sort((left, right) => (
      bandRank(right.band) - bandRank(left.band)
      || (left.revealPriority ?? 50) - (right.revealPriority ?? 50)
    ))
    .slice(0, max);
  const keepIds = new Set(keep.map((clue) => clue.id));
  const filtered = clues.filter((clue) => whoAmIRevealProfile(clue).category !== category || keepIds.has(clue.id));
  return filtered.length >= 10 ? filtered : [...clues];
}

function trimRepeatedLateSignatures(clues: readonly WhoAmIClue[]) {
  return capCategory(capCategory(clues, "jersey-number"), "nickname-persona");
}

function rebandNflClue(clue: WhoAmIClue) {
  let next = annotateNflMetadata(clue);
  next = nflOrientationReband(next);
  next = nflFoundationReband(next);
  next = nflLateAnchorReband(next);
  next = nflProductionReband(next);
  if (isPersonalBiography(next)) next = { ...next, band: "giveaway" as const };
  return next;
}

function capRelationshipClues(clues: readonly WhoAmIClue[]) {
  const relationships = clues
    .map((clue, index) => ({ clue, index, score: semanticClueValue(clue) }))
    .filter(({ clue }) => whoAmIClueFacet(clue) === "relationships")
    .sort((left, right) => right.score - left.score || left.index - right.index);
  if (relationships.length <= 1) return [...clues];

  const keepId = relationships[0]!.clue.id;
  return clues.filter((clue) => whoAmIClueFacet(clue) !== "relationships" || clue.id === keepId);
}

function sourceBackedReplayCandidates(
  curatedRebanded: readonly WhoAmIClue[],
  sourceClues: readonly WhoAmIClue[],
) {
  const seenIds = new Set(curatedRebanded.map((clue) => clue.id));
  const candidates = [...curatedRebanded];

  for (const sourceClue of sourceClues) {
    // Batch-specific curation remains authoritative for metrics and structural
    // chronology. PR4 may only recover verified identity-knowledge facts that
    // were omitted by an older batch's shortlist.
    if (!sourceClue.identityKnowledge || seenIds.has(sourceClue.id)) continue;
    const clue = rebandNflClue(sourceClue);
    if (whoAmIClueHasHardEditorialFailure(clue, "NFL")) continue;
    candidates.push(clue);
    seenIds.add(clue.id);
  }
  return candidates;
}

function restoreReplayDepth(
  cleaned: readonly WhoAmIClue[],
  candidates: readonly WhoAmIClue[],
) {
  if (cleaned.length >= 12) return [...cleaned];
  const retained = new Set(cleaned.map((clue) => clue.id));
  const restored = [...cleaned];

  const rankedCandidates = candidates
    .filter((clue) => !retained.has(clue.id))
    .filter((clue) => whoAmIClueSelectionClass(clue) !== "deep-biography")
    .filter((clue) => !isPersonalBiography(clue))
    .filter((clue) => whoAmIRevealProfile(clue).category !== "jersey-number")
    .filter((clue) => whoAmIRevealProfile(clue).category !== "nickname-persona")
    .filter((clue) => !whoAmIClueHasHardEditorialFailure(clue, "NFL"))
    .sort((left, right) => {
      const leftProduction = whoAmIRevealProfile(left).category === "production" ? 1 : 0;
      const rightProduction = whoAmIRevealProfile(right).category === "production" ? 1 : 0;
      return leftProduction - rightProduction
        || semanticClueValue(right) - semanticClueValue(left);
    });

  for (const clue of rankedCandidates) {
    if (restored.length >= 12) break;
    const selectionClass = whoAmIClueSelectionClass(clue);
    if (
      selectionClass === "identity-color"
      && restored.some((candidate) => whoAmIClueSelectionClass(candidate) === "identity-color")
    ) continue;
    if (
      whoAmIClueFacet(clue) === "relationships"
      && restored.some((candidate) => whoAmIClueFacet(candidate) === "relationships")
    ) continue;
    if (
      whoAmIRevealProfile(clue).category === "production"
      && restored.filter((candidate) => whoAmIRevealProfile(candidate).category === "production").length >= 2
    ) continue;
    if (restored.some((candidate) => whoAmICluesShareInformation(candidate, clue))) continue;
    restored.push(clue);
    retained.add(clue.id);
  }
  return restored;
}

function capNflPlayablePool(clues: readonly WhoAmIClue[], target = 16) {
  if (clues.length <= target) return [...clues];

  const ranked = clues
    .map((clue, index) => ({ clue, index, score: semanticClueValue(clue) }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  const selected = new Set(ranked.slice(0, target).map(({ clue }) => clue.id));
  return clues.filter((clue) => selected.has(clue.id));
}

/**
 * PR4 is the NFL population editorial pass.
 *
 * The existing four curated 50-subject batches remain the authority for facts.
 * This layer fixes how those facts function as a guessing game: orientation stays
 * early, school/draft context works as foundation, awards/team paths/signature
 * moments become late anchors, generic stat volume is capped, and personal
 * biography is rare. It does not invent research facts or change PR2 ordering.
 */
export function refineNflWhoAmIContent(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
  sourceClues: readonly WhoAmIClue[] = clues,
): WhoAmIClue[] {
  if (subject.league !== "NFL") return [...clues];

  const withOrientation = ensureOrientationClues(subject, clues);
  const rebanded = withOrientation.map(rebandNflClue);
  const replayCandidates = sourceBackedReplayCandidates(rebanded, sourceClues);
  const semanticallyDistinct = trimSemanticRepeats(rebanded);
  const withoutStatSoup = capGenericProduction(semanticallyDistinct);
  const withoutRepeatedSignatures = trimRepeatedLateSignatures(withoutStatSoup);
  const withoutPersonalBiography = capPersonalBiography(withoutRepeatedSignatures);
  const withoutRepeatedRelationships = capRelationshipClues(withoutPersonalBiography);
  const replayable = restoreReplayDepth(withoutRepeatedRelationships, replayCandidates);
  return capNflPlayablePool(replayable);
}

import {
  assembleWhoAmIClues,
  whoAmIClueFacet,
  whoAmIClueSelectionClass,
} from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueBand, WhoAmIClueFacet } from "./whoAmIEngine";

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

function indexed<T>(values: readonly T[]) {
  return values.map((value, index) => ({ value, index }));
}

function revealOrder(left: { value: WhoAmIClue; index: number }, right: { value: WhoAmIClue; index: number }) {
  const bandDifference = BAND_RANK[left.value.band] - BAND_RANK[right.value.band];
  if (bandDifference !== 0) return bandDifference;

  const strengthDifference = recognitionStrength(left.value) - recognitionStrength(right.value);
  if (strengthDifference !== 0) return strengthDifference;

  return left.index - right.index;
}

export function assembleWhoAmIRevealClues(
  clues: readonly WhoAmIClue[],
  limit: number,
  random: () => number = () => 0.5,
) {
  if (limit !== 10) return assembleWhoAmIClues(clues, limit, random);

  const shortlist = assembleWhoAmIClues(
    clues,
    Math.min(clues.length, limit + REVEAL_SHORTLIST_EXTRA),
    random,
  );

  const broad = shortlist.filter((clue) => clue.band === "broad").slice(0, REVEAL_TARGETS.broad);
  const helpful = shortlist.filter((clue) => clue.band === "helpful").slice(0, REVEAL_TARGETS.helpful);
  const strong = shortlist.filter((clue) => clue.band === "strong");
  const giveaway = shortlist.filter((clue) => clue.band === "giveaway");

  if (
    broad.length < REVEAL_TARGETS.broad
    || helpful.length < REVEAL_TARGETS.helpful
    || strong.length < REVEAL_TARGETS.strong
    || strong.length + giveaway.length < REVEAL_TARGETS.strong + REVEAL_TARGETS.final
  ) {
    return assembleWhoAmIClues(clues, limit, random);
  }

  const rankedStrong = indexed(strong).sort((left, right) => (
    recognitionStrength(left.value) - recognitionStrength(right.value)
    || left.index - right.index
  ));

  const coreStrong = rankedStrong
    .slice(0, REVEAL_TARGETS.strong)
    .map((entry) => entry.value);
  const coreStrongIds = new Set(coreStrong.map((clue) => clue.id));

  const finalPool = indexed([
    ...strong.filter((clue) => !coreStrongIds.has(clue.id)),
    ...giveaway,
  ]).sort((left, right) => (
    recognitionStrength(right.value) - recognitionStrength(left.value)
    || BAND_RANK[right.value.band] - BAND_RANK[left.value.band]
    || left.index - right.index
  ));

  const final = finalPool
    .slice(0, REVEAL_TARGETS.final)
    .sort(revealOrder)
    .map((entry) => entry.value);

  if (final.length < REVEAL_TARGETS.final) {
    return assembleWhoAmIClues(clues, limit, random);
  }

  const orderedStrong = indexed(coreStrong).sort(revealOrder).map((entry) => entry.value);
  return [...broad, ...helpful, ...orderedStrong, ...final];
}

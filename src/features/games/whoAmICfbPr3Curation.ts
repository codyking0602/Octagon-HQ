import type { FootballSubjectProfile } from "../back-room/footballSubjectRegistry";
import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueBand } from "./whoAmIEngine";
import { whoAmIRevealProfile } from "./whoAmIRevealArchitecture";

const POWERHOUSE_SCHOOL_TERMS = [
  "alabama",
  "ohio state",
  "georgia",
  "lsu",
  "clemson",
  "oklahoma",
  "texas",
  "usc",
  "michigan",
  "notre dame",
  "florida",
  "florida state",
  "miami",
  "penn state",
  "tennessee",
  "auburn",
  "oregon",
  "texas a&m",
] as const;

const STRONG_IDENTITY_SIGNALS = /\b(?:heisman|all-america|all-american|player of the year|national championship|conference championship|bowl|playoff|record|first player|only player|unanimous|consensus|draft|selected no\.|overall pick|transferred|transfer|junior college|juco|walk-on|walk on|position change|converted from|switched from)\b/i;
const SIGNATURE_SIGNALS = /\b(?:nickname|known as|called the|jersey number|wore no\.|wear no\.|no\. \d{1,2}\b|historic play|game-winning|last-second|walk-off|miracle)\b/i;
const GENERIC_VOLUME = /\b(?:career|across \d+ seasons?|in \d+ games?|for my career)\b.*\b\d[\d,]*(?:\.\d+)?\b/i;
const SUPERLATIVE_SIGNAL = /\b(?:record|leader|most|fewest|first|only|single-season|single game|school record|conference record|ncaa|nation|nationally)\b/i;

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

function bandRank(band: WhoAmIClueBand) {
  return ({ broad: 0, helpful: 1, strong: 2, giveaway: 3 } as const)[band];
}

function atLeastBand(clue: WhoAmIClue, band: WhoAmIClueBand): WhoAmIClue {
  return bandRank(clue.band) >= bandRank(band) ? clue : { ...clue, band };
}

function atMostBand(clue: WhoAmIClue, band: WhoAmIClueBand): WhoAmIClue {
  return bandRank(clue.band) <= bandRank(band) ? clue : { ...clue, band };
}

function cfbSchoolReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "school") return clue;

  const text = `${clue.id} ${clue.conceptId ?? ""} ${clue.text}`.toLowerCase();
  if (includesAny(text, POWERHOUSE_SCHOOL_TERMS)) {
    return atLeastBand(atMostBand(clue, "helpful"), "helpful");
  }

  // A non-powerhouse school usually shrinks the answer universe far more than
  // Alabama/Ohio State/Georgia. Treat that as real narrowing content rather
  // than an early orientation clue.
  return atLeastBand(clue, "strong");
}

function cfbSportsBiographyReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "sports-biography") return clue;
  return atLeastBand(clue, "strong");
}

function cfbLateAnchorReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category === "nickname-persona" || profile.category === "jersey-number") {
    return { ...clue, band: "giveaway" as const };
  }
  if (profile.category === "signature-moment") {
    return atLeastBand(clue, "strong");
  }
  if (profile.category === "records" && profile.identifyingPower === "signature") {
    return atLeastBand(clue, "strong");
  }
  return clue;
}

function cfbProductionReband(clue: WhoAmIClue) {
  if (whoAmIClueFacet(clue) !== "production") return clue;
  if (!GENERIC_VOLUME.test(clue.text) || SUPERLATIVE_SIGNAL.test(clue.text)) return clue;

  // Raw career volume is supporting information, not a near-giveaway merely
  // because the number is large. Preserve genuinely record-setting totals.
  return atMostBand(clue, "helpful");
}

function cfbAccomplishmentReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "accomplishments" && profile.category !== "championships") return clue;
  if (SIGNATURE_SIGNALS.test(clue.text)) return { ...clue, band: "giveaway" as const };
  if (STRONG_IDENTITY_SIGNALS.test(clue.text)) return atLeastBand(clue, "strong");
  return clue;
}

function cfbOrientationReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category === "role" || profile.category === "era") {
    return atMostBand(clue, "helpful");
  }
  return clue;
}

function isPersonalBiography(clue: WhoAmIClue) {
  return whoAmIRevealProfile(clue).category === "personal-biography";
}

function personalBiographyValue(clue: WhoAmIClue) {
  const selectionClass = whoAmIClueSelectionClass(clue);
  let score = selectionClass === "sports-identity" ? 100 : selectionClass === "identity-color" ? 40 : 0;
  if (STRONG_IDENTITY_SIGNALS.test(clue.text) || SIGNATURE_SIGNALS.test(clue.text)) score += 40;
  if (clue.facet === "off-field") score -= 15;
  score += bandRank(clue.band) * 5;
  return score;
}

function capPersonalBiography(clues: readonly WhoAmIClue[]) {
  const personal = clues
    .map((clue, index) => ({ clue, index, score: personalBiographyValue(clue) }))
    .filter(({ clue }) => isPersonalBiography(clue))
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (personal.length <= 1) return [...clues];
  const keepId = personal[0]!.clue.id;
  return clues.filter((clue) => !isPersonalBiography(clue) || clue.id === keepId);
}

function rebandCfbClue(clue: WhoAmIClue) {
  let next = clue;
  next = cfbOrientationReband(next);
  next = cfbSchoolReband(next);
  next = cfbSportsBiographyReband(next);
  next = cfbAccomplishmentReband(next);
  next = cfbLateAnchorReband(next);
  next = cfbProductionReband(next);

  if (isPersonalBiography(next)) {
    next = { ...next, band: "giveaway" as const };
  }

  return next;
}

/**
 * PR3 is a CFB content pass, not planner rescue logic.
 *
 * The four existing 50-subject curation batches remain the authority for which
 * facts are available. This pass fixes the editorial meaning of those facts:
 * reband overly-identifying schools/routes, keep orientation clues early,
 * demote generic volume, force true signature clues late, and cap personal
 * biography. PR2 then orders the already-selected clue set normally.
 */
export function refineCfbWhoAmIContent(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
): WhoAmIClue[] {
  if (subject.league !== "CFB") return [...clues];
  return capPersonalBiography(clues.map(rebandCfbClue));
}

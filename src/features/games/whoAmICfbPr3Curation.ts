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

const DISTINCTIVE_CFB_SCHOOL_TERMS = [
  "oregon state",
  "mississippi valley state",
  "hawaii",
  "boston college",
  "fresno state",
  "marshall",
  "northern illinois",
  "boise state",
  "memphis",
  "utah state",
  "san diego state",
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

function annotateCfbCategoryMetadata(clue: WhoAmIClue): WhoAmIClue {
  if (clue.id === "position" || clue.id === "role" || clue.id === "pr3:position" || clue.id === "pr3:role") {
    return { ...clue, facet: "role" };
  }
  if (
    clue.id === "era"
    || clue.id === "pr3:era"
    || clue.id === "player-career-start"
    || clue.id === "player-career-end"
    || clue.id === "coach-start"
    || clue.id === "coach-end"
  ) {
    return { ...clue, facet: "era" };
  }
  if (clue.id === "school" || clue.id === "conference") {
    return { ...clue, facet: "background" };
  }
  if (!clue.facet) {
    return { ...clue, facet: whoAmIClueFacet(clue) };
  }
  return clue;
}

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function normalizeCfbDraftCopy(clue: WhoAmIClue): WhoAmIClue {
  if (!/draft|overall pick/i.test(`${clue.id} ${clue.text}`)) return clue;
  const match = clue.text.match(/\bNo\.\s*(\d+)\s+overall\b/i);
  if (!match) return clue;
  const pick = Number(match[1]);
  if (!Number.isFinite(pick)) return clue;
  const replacement = pick === 1 ? "first overall" : `${ordinal(pick)} overall`;
  return { ...clue, text: clue.text.replace(match[0], replacement) };
}

function cfbSchoolReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "school") return clue;

  const text = `${clue.id} ${clue.conceptId ?? ""} ${clue.text}`.toLowerCase();
  if (clue.id === "conference" || clue.id === "pr3:conference") {
    return { ...clue, band: "helpful" as const };
  }
  if (includesAny(text, DISTINCTIVE_CFB_SCHOOL_TERMS)) {
    return atLeastBand(clue, "strong");
  }
  if (includesAny(text, POWERHOUSE_SCHOOL_TERMS)) {
    return { ...clue, band: "helpful" as const };
  }

  // Most school clues are useful foundation at clue 4. Only unusually
  // identifying programs are promoted into the strong band above.
  return { ...clue, band: "helpful" as const };
}

function cfbSportsBiographyReband(clue: WhoAmIClue) {
  const profile = whoAmIRevealProfile(clue);
  if (profile.category !== "sports-biography") return clue;
  return profile.identifyingPower === "signature"
    ? atLeastBand(clue, "strong")
    : atLeastBand(clue, "helpful");
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
  return atMostBand(clue, "strong");
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

function ensureOrientationClues(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
) {
  const next = [...clues];

  if (subject.kind === "coach") {
    if (!next.some((clue) => clue.id === "role" || whoAmIClueFacet(clue) === "role")) {
      next.unshift({
        id: "pr3:role",
        conceptId: "pr3:role",
        text: "I am a college football head coach.",
        band: "broad",
        facet: "role",
        revealPriority: 10,
      });
    }
  } else if (
    subject.position
    && !next.some((clue) => clue.id === "position")
  ) {
    next.unshift({
      id: "pr3:position",
      conceptId: "pr3:position",
      text: `I played ${subject.position}.`,
      band: "broad",
      facet: "role",
      revealPriority: 10,
    });
  }

  if (!next.some((clue) => clue.id === "era" || clue.id === "pr3:era")) {
    const decades = subject.activeDecades ?? [];
    if (decades.length === 1) {
      next.push({
        id: "pr3:era",
        conceptId: "pr3:era",
        text: `My college football career came in the ${decades[0]}s.`,
        band: "broad",
        facet: "era",
        revealPriority: 20,
      });
    } else if (decades.length > 1) {
      next.push({
        id: "pr3:era",
        conceptId: "pr3:era",
        text: `My college football career spanned the ${decades[0]}s and ${decades[decades.length - 1]}s.`,
        band: "broad",
        facet: "era",
        revealPriority: 20,
      });
    }
  }

  return next;
}

function productionValue(clue: WhoAmIClue) {
  const text = `${clue.id} ${clue.text}`.toLowerCase();
  let score = 0;
  if (SUPERLATIVE_SIGNAL.test(text)) score += 100;
  if (/best-season|single-season|in \d{4}/.test(text)) score += 45;
  if (/career/.test(text)) score -= 20;
  if (clue.band === "giveaway") score += 20;
  if (clue.band === "strong") score += 10;
  return score;
}

function capGenericProduction(clues: readonly WhoAmIClue[]) {
  const production = clues
    .map((clue, index) => ({ clue, index, score: productionValue(clue) }))
    .filter(({ clue }) => whoAmIClueFacet(clue) === "production")
    .sort((left, right) => right.score - left.score || left.index - right.index);

  if (production.length <= 2) return [...clues];
  const nonProductionCount = clues.length - production.length;
  const keepCount = Math.max(2, Math.min(production.length, 12 - nonProductionCount));
  const keep = new Set(production.slice(0, keepCount).map(({ clue }) => clue.id));
  return clues.filter((clue) => whoAmIClueFacet(clue) !== "production" || keep.has(clue.id));
}

function capSignatureCategory(
  clues: readonly WhoAmIClue[],
  category: "jersey-number" | "nickname-persona",
) {
  const matches = clues.filter((clue) => whoAmIRevealProfile(clue).category === category);
  if (matches.length <= 1) return [...clues];

  const keep = [...matches].sort((left, right) => (
    bandRank(right.band) - bandRank(left.band)
    || (right.revealPriority ?? 50) - (left.revealPriority ?? 50)
  ))[0]!;
  const filtered = clues.filter((clue) => (
    whoAmIRevealProfile(clue).category !== category || clue.id === keep.id
  ));
  return filtered.length >= 12 ? filtered : [...clues];
}

function trimCategoryRepetition(clues: readonly WhoAmIClue[]) {
  return capSignatureCategory(
    capSignatureCategory(clues, "jersey-number"),
    "nickname-persona",
  );
}

function ensureConferenceFoundation(
  subject: FootballSubjectProfile,
  clues: readonly WhoAmIClue[],
) {
  if (!subject.conference || clues.some((clue) => clue.id === "conference" || clue.id === "pr3:conference")) {
    return [...clues];
  }
  return [
    ...clues,
    {
      id: "pr3:conference",
      conceptId: "pr3:conference",
      text: `I competed in the ${subject.conference}.`,
      band: "helpful" as const,
      facet: "background" as const,
      revealPriority: 30,
    },
  ];
}

function rebandCfbClue(clue: WhoAmIClue) {
  let next = annotateCfbCategoryMetadata(normalizeCfbDraftCopy(clue));
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
  const withOrientation = ensureOrientationClues(subject, clues);
  const withConference = ensureConferenceFoundation(subject, withOrientation);
  const rebanded = withConference.map(rebandCfbClue);
  const withoutStatSoup = capGenericProduction(rebanded);
  const withoutRepeatedSignatures = trimCategoryRepetition(withoutStatSoup);
  return capPersonalBiography(withoutRepeatedSignatures);
}

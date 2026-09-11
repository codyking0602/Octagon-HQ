import type {
  WhoAmIClue,
  WhoAmIClueBand,
  WhoAmIClueFacet,
  WhoAmILeague,
  WhoAmISubjectKind,
} from "./whoAmIEngine";

const BAND_ORDER: readonly WhoAmIClueBand[] = ["broad", "helpful", "strong", "giveaway"];
const BAND_TARGETS: Readonly<Record<WhoAmIClueBand, number>> = {
  broad: 2,
  helpful: 3,
  strong: 3,
  giveaway: 2,
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "became", "been", "before", "by", "for", "from",
  "had", "has", "have", "he", "her", "his", "i", "in", "into", "is", "it", "me", "my", "of",
  "on", "or", "she", "that", "the", "their", "they", "this", "to", "was", "were", "with",
]);

const FACET_LIMITS: Readonly<Partial<Record<WhoAmIClueFacet, number>>> = {
  relationships: 1,
  "off-field": 1,
  era: 2,
  production: 2,
  background: 2,
  identity: 2,
};

export interface WhoAmIIdentityKnowledgeClueInput {
  subjectId: string;
  subjectName: string;
  subjectKind: WhoAmISubjectKind;
  league?: WhoAmILeague;
  factId: string;
  conceptId: string;
  value: string;
  tags?: readonly string[];
}

function bandRank(band: WhoAmIClueBand) {
  return BAND_ORDER.indexOf(band);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function significantTokens(value: string) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 2 && !STOP_WORDS.has(token)));
}

function effectivelyRepeated(left: string, right: string) {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  if (!normalizedLeft || !normalizedRight) return true;
  if (normalizedLeft === normalizedRight) return true;

  const shorter = normalizedLeft.length <= normalizedRight.length ? normalizedLeft : normalizedRight;
  const longer = normalizedLeft.length > normalizedRight.length ? normalizedLeft : normalizedRight;
  if (shorter.length >= 24 && longer.includes(shorter) && shorter.length / longer.length >= 0.72) return true;

  const leftTokens = significantTokens(left);
  const rightTokens = significantTokens(right);
  if (leftTokens.size < 4 || rightTokens.size < 4) return false;
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }
  return overlap / Math.min(leftTokens.size, rightTokens.size) >= 0.8;
}

export function whoAmIClueFacet(clue: WhoAmIClue): WhoAmIClueFacet {
  if (clue.facet) return clue.facet;
  const haystack = `${clue.id} ${clue.text}`.toLowerCase();

  if (/\b(?:nickname|moniker)\b|called me|known as/.test(haystack)) return "nickname";
  if (/beat:|lost:|faced:|faced-any|\bopponents?\b|shared the octagon|defeated |lost to |fought /.test(haystack)) return "relationships";
  if (/\b(?:titles?|champions?|championships?|mvp|heisman|all-pro|player of the year)\b|national championship/.test(haystack)) return "accomplishments";
  if (/\b(?:knockouts?|submissions?|striking|grappling|wrestling)\b|finish-style|ko-wins|submission-wins/.test(haystack)) return "style";
  if (/\b(?:games?|starts?|yards?|touchdowns?|receptions?|sacks?|interceptions?|tackles?|wins?|losses?|ties?)\b|fight-count|win-count|recorded/.test(haystack)) return "production";
  if (/\b(?:positions?|divisions?|roles?)\b|head coach/.test(haystack)) return "role";
  if (/\b(?:era|decades?|debut)\b|career-span|active-window|coach-start|coach-end/.test(haystack)) return "era";
  if (/\bdraft\b|\baffiliations?\b|career-path|\bteam\b|\bfranchise\b/.test(haystack)) return "career-path";
  if (/\b(?:school|college|conference|hometown|recruit)\b/.test(haystack)) return "background";
  return "identity";
}

function defaultRevealPriority(clue: WhoAmIClue, facet: WhoAmIClueFacet) {
  if (clue.revealPriority != null) return clue.revealPriority;
  if (clue.band === "broad") {
    if (facet === "role") return 10;
    if (facet === "era") return 20;
    if (facet === "background") return 30;
    return 40;
  }
  if (clue.band === "helpful") {
    if (facet === "style") return 10;
    if (facet === "career-path") return 15;
    if (facet === "background") return 20;
    if (facet === "era") return 30;
    if (facet === "accomplishments") return 35;
    if (facet === "production") return 55;
    if (facet === "off-field") return 65;
    return 45;
  }
  if (clue.band === "strong") {
    if (facet === "career-path") return 10;
    if (facet === "accomplishments") return 15;
    if (facet === "relationships") return 25;
    if (facet === "style") return 30;
    if (facet === "identity") return 35;
    if (facet === "production") return 55;
    if (facet === "off-field") return 65;
    return 45;
  }
  if (facet === "production") return 60;
  if (facet === "off-field") return 55;
  if (facet === "background") return 40;
  if (facet === "relationships") return 30;
  if (facet === "career-path") return 20;
  if (facet === "accomplishments") return 15;
  if (facet === "nickname") return 10;
  return 35;
}

function identityFacet(conceptId: string, tags: readonly string[] = []): WhoAmIClueFacet {
  const haystack = `${conceptId} ${tags.join(" ")}`.toLowerCase();

  if (/\b(?:nickname|moniker)\b|called-|alter-ego/.test(haystack)) return "nickname";
  if (/\b(?:brothers?|sisters?|fathers?|mothers?|sons?|daughters?|family|mentor|teammates?|friends?|caregiver|relationships?)\b/.test(haystack)) {
    return "relationships";
  }
  if (/\b(?:style|boxing|kickboxing|jiu|judo|sambo|training|technique|stance|movement|speed|power|versatility)\b|free-lance|freelance|\bstrik\w*|\bgrappl\w*|\bwrestl\w*|\bslams?\b/.test(haystack)) {
    return "style";
  }
  if (/\b(?:production|stats?|games?|starts?|tackles?|sacks?|interceptions?|receptions?|yards?|touchdowns?)\b|forced-fumbles|fumble-recoveries|pass-breakups|career-wins|coaching-record|regular-season-record/.test(haystack)) {
    return "production";
  }
  if (/\b(?:champions?|championships?|titles?|records?|hall|awards?|heisman|all-american|all-pro|olympian|olympic|milestones?)\b|super-bowl/.test(haystack)) {
    return "accomplishments";
  }
  if (/\b(?:born|birth|childhood|upbringing|hometown|town|farm|migration|immigration|school|college|degree|education|university|amateur|recruit)\b|high-school|junior-college/.test(haystack)) {
    return "background";
  }
  if (/\b(?:job|work|business|acting|media|streaming|military|army|foundation|charity|restaurant|barber|bartending|mine|model|faith)\b|off-field/.test(haystack)) {
    return "off-field";
  }
  if (/\b(?:draft|team|promotion|camp|gym|career|route|transfer|trade|holdout|retire|retired|retirement|move|ufc|nfl|cfb)\b|career-path|ultimate-fighter/.test(haystack)) {
    return "career-path";
  }
  return "identity";
}

function identityBand(
  facet: WhoAmIClueFacet,
  conceptId: string,
  tags: readonly string[] = [],
  value = "",
): WhoAmIClueBand {
  if (facet === "nickname") return "giveaway";
  const strengthSignals = `${conceptId} ${tags.join(" ")} ${value}`.toLowerCase();
  if (
    /first[- ]overall|no\. 1 overall|heisman|hall[- ]of[- ]fame|iconic[- ]moment|historic|super[- ]bowl|championship|game[- ]winning|last[- ]second|final[- ]play/.test(strengthSignals)
  ) return "giveaway";
  if (facet === "relationships" || facet === "accomplishments" || facet === "identity") return "strong";
  if (
    /turning[- ]point|breakthrough|comeback|all[- ]america|player of the year|\brecord\b|undefeated|retir(?:ed|ement)|suspension|\bdraft(?:ed)?\b|first[- ]round|milestone/.test(strengthSignals)
  ) return "strong";
  if (facet === "career-path" && /founder|owner|first-|iconic|defining/.test(conceptId.toLowerCase())) return "strong";
  return "helpful";
}

function leagueFacetAdjustment(league: WhoAmILeague | undefined, facet: WhoAmIClueFacet) {
  if (league === "UFC") {
    if (facet === "style" || facet === "accomplishments" || facet === "relationships") return -10;
    if (facet === "production") return 10;
    if (facet === "background") return 12;
    if (facet === "off-field") return 20;
  }
  if (league === "NFL") {
    if (facet === "career-path" || facet === "accomplishments") return -10;
    if (facet === "production") return 2;
    if (facet === "relationships") return 5;
    if (facet === "off-field") return 18;
  }
  if (league === "CFB") {
    if (facet === "career-path" || facet === "accomplishments") return -10;
    if (facet === "background") return -4;
    if (facet === "production") return 6;
    if (facet === "relationships") return 8;
    if (facet === "off-field") return 18;
  }
  return 0;
}

function identityRevealPriority(
  facet: WhoAmIClueFacet,
  band: WhoAmIClueBand,
  league?: WhoAmILeague,
) {
  let priority = 35;
  if (band === "giveaway") {
    if (facet === "nickname") priority = 10;
    else if (facet === "accomplishments" || facet === "career-path") priority = 15;
    else if (facet === "relationships") priority = 25;
    else priority = 35;
  } else if (band === "strong") {
    if (facet === "accomplishments" || facet === "career-path") priority = 10;
    else if (facet === "relationships") priority = 20;
    else if (facet === "style") priority = 25;
    else if (facet === "identity") priority = 30;
    else if (facet === "production") priority = 50;
    else if (facet === "off-field") priority = 60;
  } else {
    if (facet === "style") priority = 10;
    else if (facet === "career-path") priority = 15;
    else if (facet === "background") priority = 20;
    else if (facet === "production") priority = 45;
    else if (facet === "off-field") priority = 55;
  }
  return priority + leagueFacetAdjustment(league, facet);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
}

function sentenceCase(value: string) {
  if (!value) return value;
  return value[0]!.toUpperCase() + value.slice(1);
}

function tightenIdentityCopy(value: string) {
  let text = value
    .replace(/, reflecting .+$/i, ".")
    .replace(/, a detail that .+$/i, ".")
    .replace(/, an episode that .+$/i, ".")
    .replace(/, something that .+$/i, ".")
    .replace(/\s+/g, " ")
    .trim();

  if (wordCount(text) > 30) {
    const semicolon = text.indexOf(";");
    if (semicolon > 45) text = `${text.slice(0, semicolon).trim()}.`;
  }
  return text;
}

function firstPersonIdentityCopy(value: string, subjectKind: WhoAmISubjectKind) {
  const label = subjectKind === "coach" ? "head coach" : subjectKind;
  let text = value.trim();
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} and ([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\\b`, "i"), "$1 and I");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)}'s `, "i"), "My ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} has described `, "i"), "I've described ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} (?:has|had) `, "i"), "I ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} `, "i"), "I ");
  text = text.replace(/^His /, "My ").replace(/^Her /, "My ");
  text = text.replace(/^He /, "I ").replace(/^She /, "I ");
  return sentenceCase(text);
}

function anonymizeIdentityValue(
  value: string,
  subjectName: string,
  subjectKind: WhoAmISubjectKind,
  facet: WhoAmIClueFacet,
) {
  const label = subjectKind === "coach" ? "head coach" : subjectKind;
  const cleanedName = subjectName.replace(/[“”"]/g, "").trim();
  const nameParts = cleanedName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.at(-1) ?? "";
  let text = value.trim();

  if (facet === "relationships" && lastName.length >= 3) {
    const relation = "(?:father|mother|brother|sister|twin brother|twin sister|son|daughter|uncle|aunt)";
    text = text.replace(
      new RegExp(`\\b(His|Her) (${relation}),?\\s+[A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+\\s+${escapeRegExp(lastName)}\\b,?`, "gi"),
      "$1 $2",
    );
    text = text.replace(
      new RegExp(`\\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\\s+${escapeRegExp(lastName)}\\b`, "g"),
      "$1",
    );
  }

  const protectedNames: Array<[string, string]> = [];
  const otherFullName = /\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\b/g;
  text = text.replace(otherFullName, (match, givenName: string, surname: string) => {
    const normalizedMatch = match.replace(/[“”"]/g, "").trim().toLowerCase();
    if (normalizedMatch === cleanedName.toLowerCase()) return match;
    if (
      givenName.toLowerCase() !== firstName.toLowerCase()
      && surname.toLowerCase() !== lastName.toLowerCase()
    ) {
      const token = `__WHO_AM_I_PROTECTED_NAME_${protectedNames.length}__`;
      protectedNames.push([token, match]);
      return token;
    }
    return match;
  });

  const terms = [...new Set([subjectName, cleanedName, firstName, lastName].filter((term) => term.length >= 2))]
    .sort((left, right) => right.length - left.length);

  for (const term of terms) {
    const escaped = escapeRegExp(term);
    text = text.replace(new RegExp(`${escaped}(?:'s|’s)`, "gi"), `this ${label}'s`);
    text = text.replace(new RegExp(`\\b${escaped}\\b`, "gi"), `this ${label}`);
  }

  for (const [token, original] of protectedNames) text = text.replace(token, original);

  text = text.replace(new RegExp(`\\bthe this ${escapeRegExp(label)}\\b`, "gi"), `this ${label}'s namesake`);
  text = text.replace(/^this /, "This ");
  return firstPersonIdentityCopy(tightenIdentityCopy(text), subjectKind);
}

function playabilityPenalty(text: string, identityKnowledge: boolean) {
  const words = wordCount(text);
  let penalty = 0;
  if (words > 24) penalty += 8;
  if (words > 30) penalty += 14;
  if (words > 36) penalty += 20;
  if (identityKnowledge && /\b(?:has described|has explained|has credited|reflecting|according to)\b/i.test(text)) penalty += 10;
  return penalty;
}

function semanticFamily(entry: Pick<PreparedClue, "facet" | "conceptId" | "clue">) {
  const haystack = `${entry.conceptId} ${entry.clue.text}`.toLowerCase();
  if (entry.facet === "relationships" && /\b(?:family|father|mother|brother|sister|twin|parent|son|daughter|uncle|aunt)\b/.test(haystack)) {
    return "relationships:family";
  }
  if (entry.facet === "background" && /\b(?:recruit|commit|high school|high-school|prep|elite 11)\b/.test(haystack)) {
    return "background:recruiting";
  }
  if (entry.facet === "background" && /\b(?:childhood|upbringing|hometown|born|grew up)\b/.test(haystack)) {
    return "background:origin";
  }
  if (entry.facet === "career-path" && /\bdraft/.test(haystack)) return "career-path:draft";
  return null;
}

function recognitionStrength(entry: Pick<PreparedClue, "facet" | "clue">) {
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
  let strength = base[entry.facet];
  const text = entry.clue.text.toLowerCase();
  if (/\b(?:heisman|mvp|hall of fame|no\. 1 overall|first overall|first quarterback|champion|title)\b/.test(text)) strength += 10;
  if (/\b(?:defeated|lost to|fought|shared the octagon|played for|head coach for|transferred to)\b/.test(text)) strength += 10;
  if (/\b\d{2,4}\b/.test(text) && entry.facet === "production") strength -= 5;
  return strength;
}

export function whoAmIIdentityKnowledgeClue(input: WhoAmIIdentityKnowledgeClueInput): WhoAmIClue {
  const facet = identityFacet(input.conceptId, input.tags);
  const band = identityBand(facet, input.conceptId, input.tags, input.value);
  const text = anonymizeIdentityValue(input.value, input.subjectName, input.subjectKind, facet);
  return {
    id: `identity:${input.factId}`,
    text,
    band,
    conceptId: `identity:${input.conceptId}`,
    facet,
    revealPriority: identityRevealPriority(facet, band, input.league) + playabilityPenalty(text, true),
    identityKnowledge: true,
    knowledgeSubjectId: input.subjectId,
    sourceFactId: input.factId,
  };
}

interface PreparedClue {
  clue: WhoAmIClue;
  index: number;
  facet: WhoAmIClueFacet;
  conceptId: string;
  priority: number;
  variationRank: number;
  semanticFamily: string | null;
  strength: number;
}

function preparedClues(clues: readonly WhoAmIClue[], random: () => number) {
  return clues
    .map((clue, index): PreparedClue => {
      const facet = whoAmIClueFacet(clue);
      const base: PreparedClue = {
        clue,
        index,
        facet,
        conceptId: clue.conceptId?.trim() || clue.id,
        priority: defaultRevealPriority(clue, facet) + playabilityPenalty(clue.text, Boolean(clue.identityKnowledge)),
        variationRank: random(),
        semanticFamily: null,
        strength: 0,
      };
      base.semanticFamily = semanticFamily(base);
      base.strength = recognitionStrength(base);
      return base;
    })
    .filter((entry) => entry.clue.text.trim().length > 0);
}

export function assembleWhoAmIClues(
  clues: readonly WhoAmIClue[],
  limit: number,
  random: () => number = () => 0.5,
) {
  const prepared = preparedClues(clues, random);
  const selected: PreparedClue[] = [];
  const selectedConcepts = new Set<string>();
  const selectedFamilies = new Set<string>();
  const selectedTexts: string[] = [];
  const facetCounts = new Map<WhoAmIClueFacet, number>();

  const canUse = (
    entry: PreparedClue,
    options: { allowNearDuplicate: boolean; relaxFacetLimit: boolean; relaxSemanticFamily: boolean },
  ) => {
    if (selectedConcepts.has(entry.conceptId)) return false;
    const normalizedText = normalize(entry.clue.text);
    if (selectedTexts.some((text) => normalize(text) === normalizedText)) return false;
    if (!options.allowNearDuplicate && selectedTexts.some((text) => effectivelyRepeated(text, entry.clue.text))) return false;
    if (!options.relaxSemanticFamily && entry.semanticFamily && selectedFamilies.has(entry.semanticFamily)) return false;
    const facetLimit = FACET_LIMITS[entry.facet];
    if (!options.relaxFacetLimit && facetLimit != null && (facetCounts.get(entry.facet) ?? 0) >= facetLimit) return false;
    return true;
  };

  const take = (
    pool: readonly PreparedClue[],
    count: number,
    options = { allowNearDuplicate: false, relaxFacetLimit: false, relaxSemanticFamily: false },
  ) => {
    const remaining = [...pool];
    while (remaining.length && selected.length < limit && count > 0) {
      const usable = remaining.filter((entry) => canUse(entry, options));
      if (!usable.length) return;
      usable.sort((left, right) => {
        const facetDifference = (facetCounts.get(left.facet) ?? 0) - (facetCounts.get(right.facet) ?? 0);
        if (facetDifference !== 0) return facetDifference;
        const priorityDifference = left.priority - right.priority;
        if (priorityDifference !== 0) return priorityDifference;
        const identityDifference = Number(Boolean(left.clue.identityKnowledge)) - Number(Boolean(right.clue.identityKnowledge));
        if (identityDifference !== 0) return identityDifference;
        const variationDifference = left.variationRank - right.variationRank;
        if (variationDifference !== 0) return variationDifference;
        return left.index - right.index;
      });
      const picked = usable[0]!;
      selected.push(picked);
      selectedConcepts.add(picked.conceptId);
      if (picked.semanticFamily) selectedFamilies.add(picked.semanticFamily);
      selectedTexts.push(picked.clue.text);
      facetCounts.set(picked.facet, (facetCounts.get(picked.facet) ?? 0) + 1);
      remaining.splice(remaining.indexOf(picked), 1);
      count -= 1;
    }
  };

  for (const band of BAND_ORDER) {
    take(prepared.filter((entry) => entry.clue.band === band), BAND_TARGETS[band]);
  }

  const lateFirst = (left: PreparedClue, right: PreparedClue) => (
    bandRank(right.clue.band) - bandRank(left.clue.band)
    || left.priority - right.priority
    || left.index - right.index
  );

  if (selected.length < limit) {
    take(
      prepared.filter((entry) => !selected.includes(entry)).sort(lateFirst),
      limit - selected.length,
    );
  }

  if (selected.length < limit) {
    take(
      prepared.filter((entry) => !selected.includes(entry)).sort(lateFirst),
      limit - selected.length,
      { allowNearDuplicate: false, relaxFacetLimit: true, relaxSemanticFamily: true },
    );
  }

  if (selected.length < limit) {
    take(
      prepared.filter((entry) => !selected.includes(entry)).sort(lateFirst),
      limit - selected.length,
      { allowNearDuplicate: true, relaxFacetLimit: true, relaxSemanticFamily: true },
    );
  }

  return selected
    .sort((left, right) => {
      const bandDifference = bandRank(left.clue.band) - bandRank(right.clue.band);
      if (bandDifference !== 0) return bandDifference;

      if (left.clue.band === "strong" || left.clue.band === "giveaway") {
        const strengthDifference = left.strength - right.strength;
        if (strengthDifference !== 0) return strengthDifference;
      }

      const priorityDifference = left.priority - right.priority;
      if (Math.abs(priorityDifference) > 5) return priorityDifference;
      const variationDifference = left.variationRank - right.variationRank;
      if (variationDifference !== 0) return variationDifference;
      if (priorityDifference !== 0) return priorityDifference;
      return left.index - right.index;
    })
    .slice(0, limit)
    .map((entry) => entry.clue);
}

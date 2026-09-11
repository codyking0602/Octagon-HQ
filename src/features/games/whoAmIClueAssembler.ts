import type {
  WhoAmIClue,
  WhoAmIClueBand,
  WhoAmIClueFacet,
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

export interface WhoAmIIdentityKnowledgeClueInput {
  subjectId: string;
  subjectName: string;
  subjectKind: WhoAmISubjectKind;
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
  return overlap / Math.min(leftTokens.size, rightTokens.size) >= 0.85;
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
  if (/\b(?:school|college|conference|hometown)\b/.test(haystack)) return "background";
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
    if (facet === "era") return 10;
    if (facet === "background") return 20;
    if (facet === "style") return 25;
    if (facet === "career-path") return 30;
    if (facet === "off-field") return 35;
    if (facet === "production") return 50;
    return 40;
  }
  if (clue.band === "strong") {
    if (facet === "accomplishments") return 10;
    if (facet === "relationships") return 20;
    if (facet === "style") return 25;
    if (facet === "career-path") return 30;
    if (facet === "identity") return 35;
    if (facet === "production") return 50;
    return 40;
  }
  if (facet === "nickname") return 10;
  if (facet === "relationships") return 40;
  return 30;
}

function identityFacet(conceptId: string, tags: readonly string[] = []): WhoAmIClueFacet {
  const haystack = `${conceptId} ${tags.join(" ")}`.toLowerCase();

  if (/\b(?:nickname|moniker)\b|called-/.test(haystack)) return "nickname";
  if (/\b(?:brothers?|sisters?|fathers?|mothers?|sons?|daughters?|family|mentor|teammates?|friends?|caregiver|relationships?)\b/.test(haystack)) {
    return "relationships";
  }
  if (/\b(?:style|boxing|kickboxing|jiu|judo|sambo|training|technique|stance|movement|speed|power)\b|\bstrik\w*|\bgrappl\w*|\bwrestl\w*|\bslams?\b/.test(haystack)) {
    return "style";
  }
  if (/\b(?:production|stats?|games?|starts?|tackles?|sacks?|interceptions?|receptions?|yards?|touchdowns?)\b|forced-fumbles|fumble-recoveries|pass-breakups|career-wins|coaching-record|regular-season-record/.test(haystack)) {
    return "production";
  }
  if (/\b(?:champions?|championships?|titles?|records?|hall|awards?|heisman|all-american|all-pro|olympian|olympic|milestones?)\b|super-bowl/.test(haystack)) {
    return "accomplishments";
  }
  if (/\b(?:born|birth|childhood|upbringing|hometown|town|farm|migration|immigration|school|college|degree|education|university|amateur)\b|high-school|junior-college/.test(haystack)) {
    return "background";
  }
  if (/\b(?:job|work|business|acting|media|streaming|military|army|foundation|charity|restaurant|barber|bartending|mine|model)\b|off-field/.test(haystack)) {
    return "off-field";
  }
  if (/\b(?:draft|team|promotion|camp|gym|career|route|transfer|retire|retired|retirement|move|ufc|nfl|cfb)\b|career-path|ultimate-fighter/.test(haystack)) {
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
  if (facet === "relationships" || facet === "accomplishments" || facet === "identity") return "strong";

  const strengthSignals = `${conceptId} ${tags.join(" ")} ${value}`.toLowerCase();
  if (
    /iconic[- ]moment|turning[- ]point|breakthrough|comeback|championship|hall[- ]of[- ]fame|all[- ]america|player of the year|\brecord\b|game[- ]winning|winning touchdown|last[- ]second|final[- ]play|undefeated|retir(?:ed|ement)|suspension|\bdraft(?:ed)?\b|first[- ]round|first overall|historic|milestone/.test(strengthSignals)
  ) return "strong";

  if (facet === "career-path" && /founder|owner|first-|iconic|defining/.test(conceptId.toLowerCase())) return "strong";
  return "helpful";
}

function identityRevealPriority(facet: WhoAmIClueFacet, band: WhoAmIClueBand) {
  if (band === "giveaway") return facet === "nickname" ? 10 : 30;
  if (band === "strong") {
    if (facet === "accomplishments") return 10;
    if (facet === "relationships") return 20;
    if (facet === "career-path") return 25;
    return 30;
  }
  if (facet === "style") return 10;
  if (facet === "background") return 20;
  if (facet === "off-field") return 25;
  if (facet === "career-path") return 30;
  return 35;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
}

function anonymizeIdentityValue(value: string, subjectName: string, subjectKind: WhoAmISubjectKind) {
  const label = subjectKind === "coach" ? "head coach" : subjectKind;
  const cleanedName = subjectName.replace(/[“”"]/g, "").trim();
  const nameParts = cleanedName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.at(-1) ?? "";
  let text = value.trim();

  const protectedNames: Array<[string, string]> = [];
  const otherFullName = /\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\b/g;
  text = text.replace(otherFullName, (match, givenName: string, surname: string) => {
    const normalizedMatch = match.replace(/[“”"]/g, "").trim().toLowerCase();
    if (normalizedMatch === cleanedName.toLowerCase()) return match;
    if (
      givenName.toLowerCase() !== firstName.toLowerCase()
      && surname.toLowerCase() !== lastName.toLowerCase()
    ) return match;
    const token = `__WHO_AM_I_PROTECTED_NAME_${protectedNames.length}__`;
    protectedNames.push([token, match]);
    return token;
  });

  const terms = [...new Set([subjectName, cleanedName, firstName, lastName].filter((term) => term.length >= 2))]
    .sort((left, right) => right.length - left.length);

  for (const term of terms) {
    const escaped = escapeRegExp(term);
    text = text.replace(new RegExp(`${escaped}(?:'s|’s)`, "gi"), `this ${label}'s`);
    text = text.replace(new RegExp(escaped, "gi"), `this ${label}`);
  }

  for (const [token, original] of protectedNames) {
    text = text.replace(token, original);
  }

  text = text.replace(
    new RegExp(`\\bthe this ${escapeRegExp(label)}\\b`, "gi"),
    `this ${label}'s namesake`,
  );

  return text.replace(/^this /, "This ");
}

export function whoAmIIdentityKnowledgeClue(input: WhoAmIIdentityKnowledgeClueInput): WhoAmIClue {
  const facet = identityFacet(input.conceptId, input.tags);
  const band = identityBand(facet, input.conceptId, input.tags, input.value);
  return {
    id: `identity:${input.factId}`,
    text: anonymizeIdentityValue(input.value, input.subjectName, input.subjectKind),
    band,
    conceptId: `identity:${input.conceptId}`,
    facet,
    revealPriority: identityRevealPriority(facet, band),
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
}

function preparedClues(clues: readonly WhoAmIClue[], random: () => number) {
  return clues
    .map((clue, index): PreparedClue => ({
      clue,
      index,
      facet: whoAmIClueFacet(clue),
      conceptId: clue.conceptId?.trim() || clue.id,
      priority: defaultRevealPriority(clue, whoAmIClueFacet(clue)),
      variationRank: random(),
    }))
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
  const selectedTexts: string[] = [];
  const facetCounts = new Map<WhoAmIClueFacet, number>();

  const canUse = (entry: PreparedClue, allowNearDuplicate: boolean) => {
    if (selectedConcepts.has(entry.conceptId)) return false;
    const normalizedText = normalize(entry.clue.text);
    if (selectedTexts.some((text) => normalize(text) === normalizedText)) return false;
    if (!allowNearDuplicate && selectedTexts.some((text) => effectivelyRepeated(text, entry.clue.text))) return false;
    return true;
  };

  const take = (pool: readonly PreparedClue[], count: number, allowNearDuplicate: boolean) => {
    const remaining = [...pool];
    while (remaining.length && selected.length < limit && count > 0) {
      const usable = remaining.filter((entry) => canUse(entry, allowNearDuplicate));
      if (!usable.length) return;
      usable.sort((left, right) => {
        const facetDifference = (facetCounts.get(left.facet) ?? 0) - (facetCounts.get(right.facet) ?? 0);
        if (facetDifference !== 0) return facetDifference;
        const identityDifference = Number(Boolean(right.clue.identityKnowledge)) - Number(Boolean(left.clue.identityKnowledge));
        if (identityDifference !== 0) return identityDifference;
        const priorityDifference = left.priority - right.priority;
        if (Math.abs(priorityDifference) > 5) return priorityDifference;
        const variationDifference = left.variationRank - right.variationRank;
        if (variationDifference !== 0) return variationDifference;
        if (priorityDifference !== 0) return priorityDifference;
        return left.index - right.index;
      });
      const picked = usable[0]!;
      selected.push(picked);
      selectedConcepts.add(picked.conceptId);
      selectedTexts.push(picked.clue.text);
      facetCounts.set(picked.facet, (facetCounts.get(picked.facet) ?? 0) + 1);
      remaining.splice(remaining.indexOf(picked), 1);
      count -= 1;
    }
  };

  for (const band of BAND_ORDER) {
    take(prepared.filter((entry) => entry.clue.band === band), BAND_TARGETS[band], false);
  }

  if (selected.length < limit) {
    take(
      prepared
        .filter((entry) => !selected.includes(entry))
        .sort((left, right) => bandRank(left.clue.band) - bandRank(right.clue.band) || left.index - right.index),
      limit - selected.length,
      false,
    );
  }

  if (selected.length < limit) {
    take(
      prepared
        .filter((entry) => !selected.includes(entry))
        .sort((left, right) => bandRank(left.clue.band) - bandRank(right.clue.band) || left.index - right.index),
      limit - selected.length,
      true,
    );
  }

  return selected
    .sort((left, right) => {
      const bandDifference = bandRank(left.clue.band) - bandRank(right.clue.band);
      if (bandDifference !== 0) return bandDifference;

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

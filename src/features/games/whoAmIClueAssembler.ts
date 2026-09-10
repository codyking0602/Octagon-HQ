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
  return overlap / Math.min(leftTokens.size, rightTokens.size) >= 0.8;
}

function inferFacet(clue: WhoAmIClue): WhoAmIClueFacet {
  if (clue.facet) return clue.facet;
  const haystack = `${clue.id} ${clue.text}`.toLowerCase();
  if (/nickname|called me|known as/.test(haystack)) return "nickname";
  if (/beat:|lost:|faced:|faced-any|opponent|shared the octagon|defeated |lost to |fought /.test(haystack)) return "relationships";
  if (/position|division|head coach|role/.test(haystack)) return "role";
  if (/era|decade|career-span|active-window|debut|coach-start|coach-end/.test(haystack)) return "era";
  if (/school|college|conference/.test(haystack)) return "background";
  if (/draft|affiliation|career-path|team/.test(haystack)) return "career-path";
  if (/knockout|submission|finish-style|ko-wins|submission-wins|strik|grappl|wrestl/.test(haystack)) return "style";
  if (/title|champion|mvp|heisman|all-pro|player of the year|national championship/.test(haystack)) return "accomplishments";
  if (/games|yards|touchdowns|receptions|sacks|interceptions|fight-count|win-count|recorded/.test(haystack)) return "production";
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
  if (/nickname|moniker|called-/.test(haystack)) return "nickname";
  if (/brother|sister|father|mother|son|daughter|family|mentor|teammate|friend|caregiver/.test(haystack)) {
    return "relationships";
  }
  if (/champion|title|record|hall|award|heisman|super-bowl|all-american|all-pro|olympian|olympic|milestone|first-/.test(haystack)) {
    return "accomplishments";
  }
  if (/style|strik|grappl|wrestl|boxing|kickbox|jiu|judo|sambo|training|technique|stance|movement|slams|speed|power/.test(haystack)) {
    return "style";
  }
  if (/born|birth|child|upbring|hometown|town|farm|migration|immig|school|college|degree|education|university|high-school|junior-college|amateur/.test(haystack)) {
    return "background";
  }
  if (/job|work|business|acting|media|stream|military|army|foundation|charity|restaurant|barber|bartend|mine|model/.test(haystack)) {
    return "off-field";
  }
  if (/draft|team|promotion|camp|gym|career|route|transfer|retire|move|ultimate-fighter|ufc|nfl|cfb/.test(haystack)) {
    return "career-path";
  }
  return "identity";
}

function identityBand(facet: WhoAmIClueFacet, conceptId: string): WhoAmIClueBand {
  if (facet === "nickname") return "giveaway";
  if (facet === "relationships" || facet === "accomplishments" || facet === "identity") return "strong";
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
  if (lastName.length >= 3) {
    const otherSameSurname = new RegExp(`\\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\\s+${escapeRegExp(lastName)}\\b`, "g");
    text = text.replace(otherSameSurname, (match, givenName: string) => {
      if (givenName.toLowerCase() === firstName.toLowerCase()) return match;
      const token = `__WHO_AM_I_PROTECTED_NAME_${protectedNames.length}__`;
      protectedNames.push([token, match]);
      return token;
    });
  }

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

  return text.replace(/^this /, "This ");
}

export function whoAmIIdentityKnowledgeClue(input: WhoAmIIdentityKnowledgeClueInput): WhoAmIClue {
  const facet = identityFacet(input.conceptId, input.tags);
  const band = identityBand(facet, input.conceptId);
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
}

function preparedClues(clues: readonly WhoAmIClue[]) {
  return clues
    .map((clue, index): PreparedClue => ({
      clue,
      index,
      facet: inferFacet(clue),
      conceptId: clue.conceptId?.trim() || clue.id,
      priority: defaultRevealPriority(clue, inferFacet(clue)),
    }))
    .filter((entry) => entry.clue.text.trim().length > 0);
}

export function assembleWhoAmIClues(clues: readonly WhoAmIClue[], limit: number) {
  const prepared = preparedClues(clues);
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
    .sort((left, right) => (
      bandRank(left.clue.band) - bandRank(right.clue.band)
      || left.priority - right.priority
      || left.index - right.index
    ))
    .slice(0, limit)
    .map((entry) => entry.clue);
}

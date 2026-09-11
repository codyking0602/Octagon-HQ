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

export type WhoAmIClueSelectionClass = "sports-identity" | "identity-color" | "deep-biography";

export function whoAmIClueSelectionClass(clue: WhoAmIClue): WhoAmIClueSelectionClass {
  const facet = whoAmIClueFacet(clue);
  const haystack = `${clue.conceptId ?? clue.id} ${clue.text}`.toLowerCase();
  const signatureIdentity = /\b(?:nickname|moniker|signature|celebration|persona|known for|called me|called the)\b/.test(haystack);
  const strongSportsAnchor = /\b(?:heisman|all-america|all-american|all-pro|mvp|champion|championship|title|draft|drafted|transfer|transferred|jersey|hall of fame|super bowl|record|award|tournament)\b/.test(haystack);
  const sportsRelationship = /\b(?:teammate|opponent|fought|defeated|lost to|shared the octagon|same team|nfl player|college player|ufc fighter|coach|training partner)\b/.test(haystack);
  const sportsBackground = /\b(?:school|college|university|conference|recruit|recruited|commit|committed|high-school|high school|junior college|football|wrestling|boxing|kickboxing|judo|sambo)\b/.test(haystack);
  const sportsIdentity = /\b(?:quarterback|running back|receiver|tight end|lineman|linebacker|defensive back|fighter|striker|grappler|wrestler|position|division|team|gym|touchdowns?|yards?|sacks?|tackles?|receptions?|interceptions?|knockouts?|submissions?)\b/.test(haystack);
  const sportsCareerEvent = /\b(?:injur(?:y|ed)|comeback|preseason|regular-season|postseason|playoff|season opener)\b/.test(haystack);
  const deepBiography = /\b(?:childhood|upbringing|foster|group homes?|grandparents?|immigrat\w*|fourth[- ]grade|grade school|elementary school|tuition|classes|academic degree|left home|grew up|birthplace)\b/.test(haystack);

  if (signatureIdentity || sportsRelationship || strongSportsAnchor || sportsCareerEvent) return "sports-identity";
  if (
    deepBiography
    && (facet === "background" || facet === "relationships" || facet === "off-field" || facet === "identity")
  ) return "deep-biography";
  if (!clue.identityKnowledge) return "sports-identity";

  if (
    facet === "role"
    || facet === "era"
    || facet === "style"
    || facet === "career-path"
    || facet === "accomplishments"
    || facet === "nickname"
    || facet === "production"
  ) return "sports-identity";
  if (facet === "background" && sportsBackground) return "sports-identity";
  if (facet === "identity" && sportsIdentity) return "sports-identity";
  return "identity-color";
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
  if (
    facet === "career-path"
    && /founder|owner|first-|iconic|defining|multi[- ]stop|coaching[- ]partnership|\bsucceeded\b/.test(strengthSignals)
  ) return "strong";
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
  if (wordCount(text) > 36) {
    text = text.replace(/,\s+which\b.*$/i, ".");
  }
  if (wordCount(text) > 36) {
    const firstSentenceEnd = text.indexOf(". ");
    if (firstSentenceEnd >= 45) text = text.slice(0, firstSentenceEnd + 1);
  }
  if (wordCount(text) > 36) {
    for (const marker of [", and ", ", but ", ", while ", ", material "]) {
      const markerIndex = text.indexOf(marker);
      if (markerIndex < 0) continue;
      const prefix = text.slice(0, markerIndex).trim();
      const prefixWords = wordCount(prefix);
      if (prefixWords >= 14 && prefixWords <= 32) {
        text = `${prefix.replace(/[,:;]+$/, "")}.`;
        break;
      }
    }
  }
  if (wordCount(text) > 36) {
    const words = text.split(/\s+/).filter(Boolean);
    text = `${words.slice(0, 34).join(" ").replace(/[,:;]+$/, "")}…`;
  }
  return text;
}

function firstPersonIdentityCopy(value: string, subjectKind: WhoAmISubjectKind) {
  const label = subjectKind === "coach" ? "head coach" : subjectKind;
  let text = value.trim();
  text = text.replace(
    new RegExp(`^This ${escapeRegExp(label)} and ([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+(?:\\s+[A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)+)\\b`),
    "$1 and I",
  );
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} and ([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\\b`, "i"), "$1 and I");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} has been `, "i"), "I've been ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)}, (?:his|her) `, "i"), "I, my ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)},`, "i"), "I,");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)}'s `, "i"), "My ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} has described `, "i"), "I've described ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} (?:has|had) `, "i"), "I ");
  text = text.replace(new RegExp(`^This ${escapeRegExp(label)} `, "i"), "I ");
  text = text.replace(/^His /, "My ").replace(/^Her /, "My ");
  text = text.replace(/^He /, "I ").replace(/^She /, "I ");

  const labelPattern = escapeRegExp(label);
  text = text.replace(
    new RegExp(`\\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\\s+this ${labelPattern}'s\\b`, "g"),
    "$1's",
  );
  text = text.replace(new RegExp(`\\bthis ${labelPattern}'s\\b`, "gi"), "my");
  text = text.replace(
    new RegExp(
      `\\bthis ${labelPattern}\\b(?=\\s+(?:is|was|has|had|became|left|spent|won|earned|played|fought|transferred|joined|returned|started|made|recorded|served|worked|trained|competed|grew|moved|signed|retired|reached|took|paid))`,
      "gi",
    ),
    "I",
  );
  text = text.replace(new RegExp(`\\bthis ${labelPattern}\\b`, "gi"), "me");
  text = text.replace(/\bI's\b/g, "my");

  // Identity knowledge is authored as research prose, but the game speaks in first person.
  // Normalize residual subject pronouns after answer anonymization without touching named people.
  text = text
    .replace(/\b(?:he|she)\s+has\b/gi, "I have")
    .replace(/\b(?:he|she)\s+is\b/gi, "I am")
    .replace(/\b(?:he|she)\b/gi, "I")
    .replace(/\b(?:himself|herself)\b/gi, "myself")
    .replace(/\bhim\b/gi, "me")
    .replace(/\b(?:his|hers)\b/gi, "my")
    .replace(/\bI\s+is\b/g, "I am")
    .replace(/\bI\s+has\b/g, "I have")
    .replace(
      /\bme\b(?=\s+(?:(?:later|eventually|also|then|personally|deliberately|ultimately)\s+)?(?:began|became|developed|diversified|earned|grew|joined|made|moved|played|recorded|returned|signed|spent|started|transferred|won|worked)\b)/gi,
      "I",
    );
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

  if (firstName.length >= 2) {
    text = text.replace(
      new RegExp(`\\bBorn\\s+${escapeRegExp(firstName)}\\s+[A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+\\b`, "gi"),
      `This ${label} was born under a different surname`,
    );
  }

  if (lastName.length >= 3) {
    text = text.replace(
      new RegExp(`\\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\\s+${escapeRegExp(lastName)}\\b`, "g"),
      (match, otherFirst: string) => normalize(otherFirst) === normalize(firstName) ? match : otherFirst,
    );
  }

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

  const subjectFullName = escapeRegExp(cleanedName);
  text = text.replace(
    new RegExp(`${subjectFullName}(?:'s|’s|['’])?`, "gi"),
    (match) => /(?:'s|’s|['’])$/i.test(match) ? `this ${label}'s` : `this ${label}`,
  );

  const protectedNames: Array<[string, string]> = [];
  const otherFullName = /\b([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\s+([A-Z][A-Za-zÀ-ÖØ-öø-ÿ.'’-]+)\b/g;
  text = text.replace(otherFullName, (match) => {
    const normalizedMatch = match.replace(/[“”"]/g, "").trim().toLowerCase();
    if (normalizedMatch === cleanedName.toLowerCase()) return match;
    const normalizedLastName = normalize(lastName);
    if (normalizedLastName && normalize(match).split(" ").includes(normalizedLastName)) return match;
    const token = `__WHO_AM_I_PROTECTED_NAME_${protectedNames.length}__`;
    protectedNames.push([token, match]);
    return token;
  });

  const terms = [...new Set([firstName, lastName].filter((term) => term.length >= 2))]
    .sort((left, right) => right.length - left.length);

  for (const term of terms) {
    const escaped = escapeRegExp(term);
    text = text.replace(new RegExp(`\\b${escaped}(?:'s|’s|['’])`, "g"), `this ${label}'s`);
    text = text.replace(new RegExp(`\\b${escaped}\\b`, "g"), `this ${label}`);
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
  if (entry.facet === "era") return "era:chronology";
  if (
    entry.facet === "accomplishments"
    && /\b(?:title-fights?|title-wins?|ufc title fights?|title fight wins?)\b/.test(haystack)
  ) return "accomplishments:title-fight-record";
  if (entry.facet === "career-path" && /\bdraft/.test(haystack)) return "career-path:draft";
  return null;
}

function tokenOverlapStillDistinct(left: PreparedClue, right: PreparedClue) {
  const pair = new Set([left.facet, right.facet]);
  if (!pair.has("accomplishments")) return false;
  if (!pair.has("background") && !pair.has("career-path")) return false;
  const accomplishment = left.facet === "accomplishments" ? left : right;
  return /\b(?:hall of fame|heisman|all-america|all-american|championship|title|mvp)\b/i.test(
    accomplishment.clue.text,
  );
}

function selectionPriorityPenalty(selectionClass: WhoAmIClueSelectionClass) {
  if (selectionClass === "identity-color") return 20;
  if (selectionClass === "deep-biography") return 40;
  return 0;
}

function isGenericCareerTargets(clue: WhoAmIClue) {
  if (/fact:(?:nfl|cfb)-career-targets$/.test(clue.id)) return true;
  return /\b(?:recorded|had|received)\s+[\d,]+\s+(?:career\s+)?targets\b/.test(clue.text.toLowerCase());
}

function isGenericCareerGames(clue: WhoAmIClue) {
  if (/fact:(?:nfl|cfb)-career-games$/.test(clue.id)) return true;
  return /\b(?:played|appeared in|recorded)\s+[\d,]+\s+(?:regular-season\s+)?(?:nfl\s+|college\s+)?games\b/.test(
    clue.text.toLowerCase(),
  );
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
  const selectionClass = whoAmIClueSelectionClass(entry.clue);
  if (selectionClass === "sports-identity") strength += 10;
  else if (selectionClass === "identity-color") strength -= 10;
  else strength -= 35;

  if (/\b(?:heisman|mvp|hall of fame|no\. 1 overall|first overall|first quarterback|champion|championship|title|all-america|all-american|all-pro)\b/.test(text)) strength += 15;
  if (/\b(?:defeated|lost to|fought|shared the octagon|played for|head coach for|transferred from|transferred to|drafted|selected no\.)\b/.test(text)) strength += 12;
  if (/\b(?:signature|celebration|nickname|moniker|jersey number|wore no\.)\b/.test(text)) strength += 18;
  if (/\b\d{2,4}\b/.test(text) && entry.facet === "production") strength -= 5;
  if (/\b\d+\s+(?:ufc\s+)?(?:wins|fights|games|starts)\b/.test(text) && entry.facet === "production") strength -= 8;
  return strength;
}

export function whoAmIIdentityKnowledgeClue(input: WhoAmIIdentityKnowledgeClueInput): WhoAmIClue {
  const facet = identityFacet(input.conceptId, input.tags);
  let band = identityBand(facet, input.conceptId, input.tags, input.value);
  if (
    input.league === "CFB"
    && /\b(?:selected|drafted)\b.*\boverall\b.*\bNFL Draft\b/i.test(input.value)
  ) {
    band = "giveaway";
  }
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
  selectionClass: WhoAmIClueSelectionClass;
}

function preparedClues(clues: readonly WhoAmIClue[], random: () => number) {
  return clues
    .map((clue, index): PreparedClue => {
      const facet = whoAmIClueFacet(clue);
      const selectionClass = whoAmIClueSelectionClass(clue);
      const base: PreparedClue = {
        clue,
        index,
        facet,
        conceptId: clue.conceptId?.trim() || clue.id,
        priority: defaultRevealPriority(clue, facet)
          + playabilityPenalty(clue.text, Boolean(clue.identityKnowledge))
          + selectionPriorityPenalty(selectionClass)
          + (isGenericCareerGames(clue) ? 80 : 0),
        variationRank: random(),
        semanticFamily: null,
        strength: 0,
        selectionClass,
      };
      base.semanticFamily = semanticFamily(base);
      base.strength = recognitionStrength(base);
      return base;
    })
    .filter((entry) => entry.clue.text.trim().length > 0)
    .filter((entry) => !isGenericCareerTargets(entry.clue));
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

  type SelectionOptions = {
    allowNearDuplicate: boolean;
    relaxFacetLimit: boolean;
    relaxSemanticFamily: boolean;
    relaxPersonalLimit: boolean;
    relaxBiographyLimit: boolean;
    relaxChronologyLimit?: boolean;
    allowCareerGamesFallback?: boolean;
  };

  const canUse = (
    entry: PreparedClue,
    options: SelectionOptions,
  ) => {
    if (isGenericCareerGames(entry.clue) && !options.allowCareerGamesFallback) return false;
    if (selectedConcepts.has(entry.conceptId)) return false;
    const normalizedText = normalize(entry.clue.text);
    if (selectedTexts.some((text) => normalize(text) === normalizedText)) return false;
    if (
      !options.allowNearDuplicate
      && selected.some((other) => (
        effectivelyRepeated(other.clue.text, entry.clue.text)
        && !tokenOverlapStillDistinct(other, entry)
      ))
    ) return false;
    if (
      entry.semanticFamily === "era:chronology"
      && selectedFamilies.has(entry.semanticFamily)
      && !options.relaxChronologyLimit
    ) return false;
    if (!options.relaxSemanticFamily && entry.semanticFamily && selectedFamilies.has(entry.semanticFamily)) return false;
    const personalCount = selected.filter((candidate) => candidate.selectionClass !== "sports-identity").length;
    const biographyCount = selected.filter((candidate) => candidate.selectionClass === "deep-biography").length;
    if (!options.relaxPersonalLimit && entry.selectionClass !== "sports-identity" && personalCount >= 3) return false;
    if (entry.selectionClass === "deep-biography" && biographyCount >= 1) return false;
    const facetLimit = FACET_LIMITS[entry.facet];
    const facetCount = facetCounts.get(entry.facet) ?? 0;
    if (entry.facet === "relationships" && facetCount >= 1) return false;
    if (!options.relaxFacetLimit && facetLimit != null && facetCount >= facetLimit) return false;
    return true;
  };

  const take = (
    pool: readonly PreparedClue[],
    count: number,
    options: SelectionOptions = {
      allowNearDuplicate: false,
      relaxFacetLimit: false,
      relaxSemanticFamily: false,
      relaxPersonalLimit: false,
      relaxBiographyLimit: false,
    },
  ) => {
    const remaining = [...pool];
    while (remaining.length && selected.length < limit && count > 0) {
      const usable = remaining.filter((entry) => canUse(entry, options));
      if (!usable.length) return;
      usable.sort((left, right) => {
        const priorityDifference = left.priority - right.priority;
        if (Math.abs(priorityDifference) >= 10) return priorityDifference;
        const strengthDifference = right.strength - left.strength;
        if (Math.abs(strengthDifference) >= 15) return strengthDifference;
        const facetDifference = (facetCounts.get(left.facet) ?? 0) - (facetCounts.get(right.facet) ?? 0);
        if (facetDifference !== 0) return facetDifference;
        const identityDifference = Number(Boolean(right.clue.identityKnowledge)) - Number(Boolean(left.clue.identityKnowledge));
        if (identityDifference !== 0) return identityDifference;
        const variationDifference = left.variationRank - right.variationRank;
        if (variationDifference !== 0) return variationDifference;
        if (priorityDifference !== 0) return priorityDifference;
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
      {
        allowNearDuplicate: false,
        relaxFacetLimit: true,
        relaxSemanticFamily: true,
        relaxPersonalLimit: false,
        relaxBiographyLimit: false,
      },
    );
  }

  // Healthy clue pools keep chronology to one slot. If the canonical pool is genuinely
  // shallow after every normal quality pass, permit up to two extra chronology clues only
  // to finish the 10-clue board before relaxing personal/biography protections.
  // Generic games/targets remain excluded in every case.
  if (selected.length < limit) {
    take(
      prepared
        .filter((entry) => !selected.includes(entry) && entry.semanticFamily === "era:chronology")
        .sort(lateFirst),
      2,
      {
        allowNearDuplicate: true,
        relaxFacetLimit: true,
        relaxSemanticFamily: true,
        relaxPersonalLimit: false,
        relaxBiographyLimit: false,
        relaxChronologyLimit: true,
      },
    );
  }

  if (selected.length < limit) {
    take(
      prepared.filter((entry) => !selected.includes(entry)).sort(lateFirst),
      limit - selected.length,
      {
        allowNearDuplicate: true,
        relaxFacetLimit: true,
        relaxSemanticFamily: true,
        relaxPersonalLimit: true,
        relaxBiographyLimit: true,
      },
    );
  }

  // Generic game-count facts are emergency depth only. They should never beat real
  // identity clues, but a shallow canonical pool may use one rather than add a second
  // biography/relationship clue or return an incomplete round. Targets stay excluded.
  if (selected.length < limit) {
    take(
      prepared
        .filter((entry) => !selected.includes(entry) && isGenericCareerGames(entry.clue))
        .sort(lateFirst),
      limit - selected.length,
      {
        allowNearDuplicate: true,
        relaxFacetLimit: true,
        relaxSemanticFamily: true,
        relaxPersonalLimit: true,
        relaxBiographyLimit: false,
        relaxChronologyLimit: false,
        allowCareerGamesFallback: true,
      },
    );
  }

  const lateStageCount = () => selected.filter((entry) => (
    entry.clue.band === "strong" || entry.clue.band === "giveaway"
  )).length;

  while (lateStageCount() < 3) {
    const upgrades = prepared.flatMap((candidate) => {
      if (selected.includes(candidate)) return [];
      if (candidate.clue.band !== "strong" && candidate.clue.band !== "giveaway") return [];

      return selected.flatMap((current, selectedIndex) => {
        if (current.clue.band !== "helpful") return [];
        const otherSelected = selected.filter((_entry, index) => index !== selectedIndex);
        const otherPersonalCount = otherSelected.filter((entry) => entry.selectionClass !== "sports-identity").length;
        const otherBiographyCount = otherSelected.filter((entry) => entry.selectionClass === "deep-biography").length;
        if (candidate.selectionClass !== "sports-identity" && otherPersonalCount >= 3) return [];
        if (candidate.selectionClass === "deep-biography" && otherBiographyCount >= 1) return [];
        if (otherSelected.some((entry) => entry.conceptId === candidate.conceptId)) return [];
        if (otherSelected.some((entry) => (
          normalize(entry.clue.text) === normalize(candidate.clue.text)
          || effectivelyRepeated(entry.clue.text, candidate.clue.text)
        ))) return [];
        if (
          candidate.semanticFamily
          && otherSelected.some((entry) => entry.semanticFamily === candidate.semanticFamily)
        ) return [];
        const otherFacetCount = otherSelected.filter((entry) => entry.facet === candidate.facet).length;
        if (candidate.facet === "relationships" && otherFacetCount >= 1) return [];
        const facetLimit = FACET_LIMITS[candidate.facet];
        if (facetLimit != null && otherFacetCount >= facetLimit) return [];
        return [{ current, candidate, selectedIndex }];
      });
    });

    if (!upgrades.length) break;
    upgrades.sort((left, right) => (
      bandRank(right.candidate.clue.band) - bandRank(left.candidate.clue.band)
      || right.candidate.strength - left.candidate.strength
      || left.candidate.priority - right.candidate.priority
      || Number(Boolean(right.candidate.clue.identityKnowledge)) - Number(Boolean(left.candidate.clue.identityKnowledge))
      || right.current.priority - left.current.priority
      || left.candidate.index - right.candidate.index
    ));
    const upgrade = upgrades[0]!;
    selected[upgrade.selectedIndex] = upgrade.candidate;
  }

  const sportsIdentityTarget = Math.min(
    7,
    limit,
    prepared.filter((entry) => entry.selectionClass === "sports-identity").length,
  );

  while (selected.filter((entry) => entry.selectionClass === "sports-identity").length < sportsIdentityTarget) {
    const quotaSwaps = selected.flatMap((current, selectedIndex) => {
      if (current.selectionClass === "sports-identity") return [];
      const otherSelected = selected.filter((_entry, index) => index !== selectedIndex);

      return prepared
        .filter((candidate) => !selected.includes(candidate))
        .filter((candidate) => candidate.selectionClass === "sports-identity")
        .filter((candidate) => bandRank(candidate.clue.band) >= bandRank(current.clue.band))
        .filter((candidate) => !otherSelected.some((entry) => entry.conceptId === candidate.conceptId))
        .filter((candidate) => !otherSelected.some((entry) => (
          normalize(entry.clue.text) === normalize(candidate.clue.text)
          || (
            effectivelyRepeated(entry.clue.text, candidate.clue.text)
            && !tokenOverlapStillDistinct(entry, candidate)
          )
        )))
        .filter((candidate) => (
          !candidate.semanticFamily
          || !otherSelected.some((entry) => entry.semanticFamily === candidate.semanticFamily)
        ))
        .filter((candidate) => {
          const otherFacetCount = otherSelected.filter((entry) => entry.facet === candidate.facet).length;
          if (candidate.facet === "relationships" && otherFacetCount >= 1) return false;
          const facetLimit = FACET_LIMITS[candidate.facet];
          return facetLimit == null || otherFacetCount < facetLimit;
        })
        .map((candidate) => ({ current, candidate, selectedIndex }));
    });

    if (!quotaSwaps.length) break;
    quotaSwaps.sort((left, right) => (
      Number(right.current.selectionClass === "deep-biography") - Number(left.current.selectionClass === "deep-biography")
      || Math.abs(bandRank(left.candidate.clue.band) - bandRank(left.current.clue.band))
        - Math.abs(bandRank(right.candidate.clue.band) - bandRank(right.current.clue.band))
      || left.candidate.priority - right.candidate.priority
      || right.candidate.strength - left.candidate.strength
      || left.candidate.index - right.candidate.index
    ));
    const quotaSwap = quotaSwaps[0]!;
    selected[quotaSwap.selectedIndex] = quotaSwap.candidate;
  }

  const selectedSnapshot = [...selected];
  const replaySwapOptions = selectedSnapshot.flatMap((current, selectedIndex) => {
    if (current.clue.band !== "helpful" && current.clue.band !== "strong") return [];

    const comparableFacetClues = prepared.filter((candidate) => (
      candidate !== current
      && candidate.clue.band === current.clue.band
      && candidate.facet === current.facet
      && candidate.selectionClass === current.selectionClass
    ));
    const isPriorityAnchor = current.facet === "production"
      && comparableFacetClues.length > 0
      && comparableFacetClues.every((candidate) => candidate.priority >= current.priority + 10);
    if (isPriorityAnchor) return [];

    return prepared
      .filter((candidate) => !selectedSnapshot.includes(candidate))
      .filter((candidate) => candidate.clue.band === current.clue.band)
      .filter((candidate) => {
        const equivalentQuality = Math.abs(candidate.priority - current.priority) <= 20
          && Math.abs(candidate.strength - current.strength) <= 20;
        if (equivalentQuality) return true;
        return current.selectionClass !== "sports-identity"
          && candidate.selectionClass === "sports-identity"
          && candidate.priority <= current.priority + 40;
      })
      .filter((candidate) => {
        const otherSelected = selectedSnapshot.filter((_other, index) => index !== selectedIndex);
        const sportsIdentityCount = otherSelected.filter((entry) => entry.selectionClass === "sports-identity").length
          + Number(candidate.selectionClass === "sports-identity");
        const personalCount = otherSelected.filter((entry) => entry.selectionClass !== "sports-identity").length
          + Number(candidate.selectionClass !== "sports-identity");
        const biographyCount = otherSelected.filter((entry) => entry.selectionClass === "deep-biography").length
          + Number(candidate.selectionClass === "deep-biography");
        if (sportsIdentityCount < sportsIdentityTarget) return false;
        if (personalCount > 3 || biographyCount > 1) return false;

        const otherFacetCount = otherSelected.filter((other) => other.facet === candidate.facet).length;
        if (candidate.facet === "relationships" && otherFacetCount >= 1) return false;
        const replayFacetLimit = FACET_LIMITS[candidate.facet] ?? 2;
        return otherFacetCount < replayFacetLimit;
      })
      .filter((candidate) => !selectedSnapshot.some((other) => (
        other !== current && other.conceptId === candidate.conceptId
      )))
      .filter((candidate) => !selectedSnapshot.some((other) => (
        other !== current
        && (
          normalize(other.clue.text) === normalize(candidate.clue.text)
          || effectivelyRepeated(other.clue.text, candidate.clue.text)
        )
      )))
      .filter((candidate) => (
        !candidate.semanticFamily
        || candidate.semanticFamily === current.semanticFamily
        || !selectedSnapshot.some((other) => other !== current && other.semanticFamily === candidate.semanticFamily)
      ))
      .map((candidate) => ({ current, candidate, selectedIndex }));
  });

  if (replaySwapOptions.length) {
    replaySwapOptions.sort((left, right) => (
      Math.min(left.current.variationRank, left.candidate.variationRank)
      - Math.min(right.current.variationRank, right.candidate.variationRank)
      || left.selectedIndex - right.selectedIndex
      || left.candidate.index - right.candidate.index
    ));
    const swap = replaySwapOptions[0]!;
    if (swap.candidate.variationRank < swap.current.variationRank) {
      selected[swap.selectedIndex] = swap.candidate;
    }
  }

  return selected
    .sort((left, right) => {
      const bandDifference = bandRank(left.clue.band) - bandRank(right.clue.band);
      if (bandDifference !== 0) return bandDifference;

      if (left.clue.band === "giveaway") {
        const productionDifference = Number(right.facet === "production") - Number(left.facet === "production");
        if (productionDifference !== 0) return productionDifference;
      }

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

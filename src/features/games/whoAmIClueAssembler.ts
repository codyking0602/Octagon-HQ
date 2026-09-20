import type {
  WhoAmIClue,
  WhoAmIClueBand,
  WhoAmIClueFacet,
  WhoAmILeague,
  WhoAmISubjectKind,
} from "./whoAmIEngine";
import {
  whoAmIClueHasHardEditorialFailure,
  whoAmICluesShareInformation,
  whoAmISemanticIndependentCapacity,
} from "./whoAmISemanticQuality";

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

const SPORTS_IDENTITY_TARGET = 8;

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

const EFFECTIVE_REPEAT_CACHE = new WeakMap<WhoAmIClue, WeakMap<WhoAmIClue, boolean>>();

function cluesEffectivelyRepeated(left: WhoAmIClue, right: WhoAmIClue) {
  if (left === right) return true;

  const cached = EFFECTIVE_REPEAT_CACHE.get(left)?.get(right);
  if (cached != null) return cached;

  const result = effectivelyRepeated(left.text, right.text);

  const leftCache = EFFECTIVE_REPEAT_CACHE.get(left) ?? new WeakMap<WhoAmIClue, boolean>();
  leftCache.set(right, result);
  EFFECTIVE_REPEAT_CACHE.set(left, leftCache);

  const rightCache = EFFECTIVE_REPEAT_CACHE.get(right) ?? new WeakMap<WhoAmIClue, boolean>();
  rightCache.set(left, result);
  EFFECTIVE_REPEAT_CACHE.set(right, rightCache);

  return result;
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
  const competitiveRelationship = /\b(?:teammate|opponent|fought|defeated|lost to|shared the octagon|same team|nfl player|college player|ufc fighter|training partner)\b/.test(haystack);
  const sportsRelationship = competitiveRelationship || /\bcoach(?:ed|ing)?\b/.test(haystack);
  const sportsBackground = /\b(?:school|college|university|conference|recruit|recruited|commit|committed|high-school|high school|junior college|football|wrestling|boxing|kickboxing|judo|sambo)\b/.test(haystack);
  const sportsIdentity = /\b(?:quarterback|running back|receiver|tight end|lineman|linebacker|defensive back|fighter|striker|grappler|wrestler|position|division|team|gym|touchdowns?|yards?|sacks?|tackles?|receptions?|interceptions?|knockouts?|submissions?)\b/.test(haystack);
  const sportsCareerEvent = /\b(?:injur(?:y|ed)|comeback|preseason|regular-season|postseason|playoff|season opener)\b/.test(haystack);
  const deepLifeBiography = /\b(?:childhood|upbringing|foster|group homes?|grandparents?|youth|immigrat\w*|fourth[- ]grade|grade school|elementary school|tuition|classes|academic degree|left home|grew up|birthplace)\b/.test(haystack);
  const familyBiography = /\b(?:parents?|father|mother|brother|sister|family)\b/.test(haystack);
  const personalFacet = facet === "background" || facet === "relationships" || facet === "off-field" || facet === "identity";

  // Deep life-history remains biography even when research prose happens to mention
  // generic sports vocabulary. Family facts are different: an actual football/MMA
  // relationship (for example, a famous sibling matchup or shared college path) is
  // sports identity, while a purely personal family story stays biography.
  if (deepLifeBiography && personalFacet && !competitiveRelationship && !signatureIdentity) return "deep-biography";
  if (
    familyBiography
    && personalFacet
    && !competitiveRelationship
    && !signatureIdentity
    && !strongSportsAnchor
    && !sportsRelationship
    && !sportsBackground
    && !sportsIdentity
  ) return "deep-biography";
  if (signatureIdentity || sportsRelationship || strongSportsAnchor || sportsCareerEvent) return "sports-identity";
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
  const normalizedTags = new Set(tags.map((tag) => tag.toLowerCase()));
  const hasTag = (...values: readonly string[]) => values.some((value) => normalizedTags.has(value));

  // Authored semantic tags are the highest-authority contract. Do not feed them
  // back through a bag-of-words classifier: a production tag stays production,
  // while a deliberate award/record tag can identify a separate accomplishment.
  if (hasTag("nickname", "moniker", "persona", "alter-ego", "media-identity")) return "nickname";
  if (hasTag("award", "awards", "championship", "championships", "title", "titles", "record", "records", "hall-of-fame", "heisman", "all-american", "all-pro", "milestone", "iconic-moment")) {
    return "accomplishments";
  }
  if (hasTag("career-path", "career-start", "career-turning-point", "transition", "draft", "transfer", "trade", "franchise", "playing-career", "coaching-path", "position-path")) {
    return "career-path";
  }
  if (hasTag("production", "stat", "stats", "statistics")) return "production";
  if (hasTag("relationship", "relationships", "family", "teammate", "teammates", "mentor")) return "relationships";
  if (hasTag("style", "technique", "training", "boxing", "kickboxing", "wrestling", "grappling", "striking")) return "style";
  if (hasTag("off-field", "work", "business", "media", "military", "community", "faith")) return "off-field";
  if (hasTag("background", "childhood", "hometown", "high-school", "college", "junior-college", "recruiting", "education")) return "background";

  const haystack = conceptId.toLowerCase();

  // Specific semantic concepts must win over incidental vocabulary inside the
  // concept id (for example, "one college start / undrafted" is a career-path
  // fact, not production merely because it contains "start").
  if (/\b(?:nickname|moniker)\b|called-|alter-ego/.test(haystack)) return "nickname";
  if (/\b(?:brothers?|sisters?|fathers?|mothers?|sons?|daughters?|family|mentor|teammates?|friends?|caregiver|relationships?)\b/.test(haystack)) {
    return "relationships";
  }
  if (/\b(?:style|boxing|kickboxing|jiu|judo|sambo|training|technique|stance|movement|speed|power|versatility)\b|free-lance|freelance|\bstrik\w*|\bgrappl\w*|\bwrestl\w*|\bslams?\b/.test(haystack)) {
    return "style";
  }
  if (
    /\b(?:champions?|championships?|titles?|records?|hall|awards?|heisman|all-american|all-pro|pro-bowls?|mvp|olympian|olympic|milestones?|breakthrough)\b|super-bowl|game-winning|last-second|final-play|first-football-play|historic-.*(?:game|play|season)/.test(haystack)
  ) {
    return "accomplishments";
  }
  if (
    /\b(?:draft|drafted|undrafted|transfer|transferred|trade|traded|holdout|retire|retired|retirement|roster|cut|waived|signed)\b|career-path|career-turning-point|career-revival|second-career|position-path|ultimate-fighter/.test(haystack)
  ) {
    return "career-path";
  }
  if (/\b(?:production|stats?|games?|starts?|tackles?|sacks?|interceptions?|receptions?|yards?|touchdowns?)\b|forced-fumbles|fumble-recoveries|pass-breakups|career-wins|coaching-record|regular-season-record/.test(haystack)) {
    return "production";
  }
  if (/\b(?:born|birth|childhood|upbringing|hometown|town|farm|migration|immigration|school|college|degree|education|university|amateur|recruit)\b|high-school|junior-college/.test(haystack)) {
    return "background";
  }
  if (/\b(?:job|work|business|acting|media|streaming|military|army|foundation|charity|restaurant|barber|bartending|mine|model|faith)\b|off-field/.test(haystack)) {
    return "off-field";
  }
  // Broad context words are only a final legacy-style hint. League/source
  // prefixes such as NFL/CFB/UFC are intentionally excluded: they identify the
  // source namespace, not the clue's meaning.
  if (/\b(?:team|promotion|camp|gym|route|move)\b/.test(haystack)) return "career-path";
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
    /turning[- ]point|breakthrough|comeback|all[- ]america|player of the year|\brecord\b|undefeated|retir(?:ed|ement)|suspension|\b(?:draft(?:ed)?|undrafted)\b|first[- ]round|milestone/.test(strengthSignals)
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
    .replace(/\bwhile still young\b/gi, "early in my football development")
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
    .replace(/\bme\s+myself\b/gi, "I")
    .replace(
      /\bme\b(?=\s+(?:(?:affectionately|later|eventually|also|then|personally|deliberately|ultimately)\s+)?(?:adopted|began|became|called|chose|continued|credited|developed|diversified|earned|established|felt|grew|handled|hurled|joined|made|moved|played|recorded|remained|returned|said|signed|spoke|spent|started|thought|threw|trained|transferred|used|won|worked)\b)/gi,
      "I",
    )
    .replace(
      /\badopted\s+['"“”‘’]?(?:me|my)\s+myself\b/gi,
      "adopted a distinctive nickname myself",
    )
    .replace(/\bI\s+approaches\b/gi, "I approach")
    .replace(/\bI\s+continues\b/gi, "I continue")
    .replace(/\bI\s+remains\b/gi, "I remain")
    .replace(/\bI\s+uses\b/gi, "I use")
    .replace(/\bI\s+trains\b/gi, "I train")
    .replace(/\bI\s+plays\b/gi, "I play")
    .replace(/\bI\s+works\b/gi, "I work")
    .replace(/\bI\s+says\b/gi, "I say")
    .replace(/\bI\s+credits\b/gi, "I credit")
    .replace(/\bI\s+calls\b/gi, "I call")
    .replace(/\bI\b([^.!?;]{0,160})\band has\b/gi, "I$1 and I have")
    .replace(/\bI met ([^;.!?]+);\s*they later married\b/gi, "I met $1; we later married");
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

  // Pronouns in the same clause after a named third party belong to that person,
  // not automatically to the hidden subject. Protect them from the first-person
  // transform so "train with him" can never become "train with me".
  const protectedPronouns: Array<[string, string]> = [];
  const subjectReferenceTerms = [`this ${label}`, firstName, lastName].filter((term) => term.length >= 2);
  for (const [nameToken] of protectedNames) {
    const tokenPattern = escapeRegExp(nameToken);
    text = text.replace(
      new RegExp(`(${tokenPattern}[^.!?;]{0,120})\\b(him|her|his|hers)\\b`, "gi"),
      (_match, prefix: string, pronoun: string) => {
        const afterThirdPartyName = prefix.slice(nameToken.length);
        const subjectRestated = subjectReferenceTerms.some((term) => (
          new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(afterThirdPartyName)
        ));
        if (subjectRestated) return `${prefix}${pronoun}`;

        const pronounToken = `__WHO_AM_I_PROTECTED_PRONOUN_${protectedPronouns.length}__`;
        protectedPronouns.push([pronounToken, pronoun]);
        return `${prefix}${pronounToken}`;
      },
    );
  }

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
  let transformed = firstPersonIdentityCopy(tightenIdentityCopy(text), subjectKind);
  for (const [token, original] of protectedPronouns) transformed = transformed.replace(token, original);
  return transformed;
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
  if (entry.facet === "accomplishments" && /\bheisman\b/.test(haystack)) return "accomplishments:heisman";
  if (entry.facet === "accomplishments" && /\ball[- ]america(?:n)?\b/.test(haystack)) return "accomplishments:all-america";
  if (entry.facet === "accomplishments" && /\ball[- ]pro\b/.test(haystack)) return "accomplishments:all-pro";
  if (entry.facet === "accomplishments" && /\bpro[- ]bowl\b/.test(haystack)) return "accomplishments:pro-bowl";
  if (entry.facet === "accomplishments" && /\bhall of fame\b/.test(haystack)) return "accomplishments:hall-of-fame";
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

const SEMANTIC_CAPACITY_INPUT_CACHE = new WeakMap<readonly WhoAmIClue[], readonly WhoAmIClue[]>();

function semanticCapacityInput(clues: readonly WhoAmIClue[]) {
  const cached = SEMANTIC_CAPACITY_INPUT_CACHE.get(clues);
  if (cached) return cached;

  const eligible = clues
    .filter((clue) => clue.text.trim().length > 0)
    .filter((clue) => !whoAmIClueHasHardEditorialFailure(clue))
    .filter((clue) => !isGenericCareerTargets(clue));
  SEMANTIC_CAPACITY_INPUT_CACHE.set(clues, eligible);
  return eligible;
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

type PreparedClueStatic = Omit<PreparedClue, "variationRank">;

const PREPARED_CLUE_STATIC_CACHE = new WeakMap<
  readonly WhoAmIClue[],
  readonly PreparedClueStatic[]
>();

function preparedClueStatics(clues: readonly WhoAmIClue[]) {
  const cached = PREPARED_CLUE_STATIC_CACHE.get(clues);
  if (cached) return cached;

  const prepared = clues
    .map((clue, index): PreparedClueStatic => {
      const facet = whoAmIClueFacet(clue);
      const selectionClass = whoAmIClueSelectionClass(clue);
      const base: PreparedClueStatic = {
        clue,
        index,
        facet,
        conceptId: clue.conceptId?.trim() || clue.id,
        priority: defaultRevealPriority(clue, facet)
          + playabilityPenalty(clue.text, Boolean(clue.identityKnowledge))
          + selectionPriorityPenalty(selectionClass)
          + (isGenericCareerGames(clue) ? 80 : 0),
        semanticFamily: null,
        strength: 0,
        selectionClass,
      };
      base.semanticFamily = semanticFamily(base);
      base.strength = recognitionStrength(base);
      return base;
    })
    .filter((entry) => entry.clue.text.trim().length > 0)
    .filter((entry) => !whoAmIClueHasHardEditorialFailure(entry.clue))
    .filter((entry) => !isGenericCareerTargets(entry.clue));

  PREPARED_CLUE_STATIC_CACHE.set(clues, prepared);
  return prepared;
}

function preparedClues(clues: readonly WhoAmIClue[], random: () => number) {
  return preparedClueStatics(clues).map((entry): PreparedClue => ({
    ...entry,
    variationRank: random(),
  }));
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
    allowSemanticOverlap?: boolean;
  };

  const canUse = (
    entry: PreparedClue,
    options: SelectionOptions,
  ) => {
    if (isGenericCareerGames(entry.clue) && !options.allowCareerGamesFallback) return false;
    if (selectedConcepts.has(entry.conceptId)) return false;
    if (
      !options.allowSemanticOverlap
      && selected.some((other) => whoAmICluesShareInformation(other.clue, entry.clue))
    ) return false;
    const normalizedText = normalize(entry.clue.text);
    if (selectedTexts.some((text) => normalize(text) === normalizedText)) return false;
    if (
      !options.allowNearDuplicate
      && selected.some((other) => (
        cluesEffectivelyRepeated(other.clue, entry.clue)
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

  // PR1 makes semantic uniqueness the normal path, but the existing population
  // still contains a few pools with fewer than ten independent information lanes.
  // Keep those rounds playable until their sport cleanup replaces the debt rather
  // than returning a nine-clue game. Exact/near-copy protections remain active.
  if (selected.length < limit) {
    take(
      prepared.filter((entry) => !selected.includes(entry)).sort(lateFirst),
      limit - selected.length,
      {
        allowNearDuplicate: false,
        relaxFacetLimit: true,
        relaxSemanticFamily: true,
        relaxPersonalLimit: true,
        relaxBiographyLimit: true,
        relaxChronologyLimit: true,
        allowCareerGamesFallback: true,
        allowSemanticOverlap: true,
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
        if (otherSelected.some((entry) => whoAmICluesShareInformation(entry.clue, candidate.clue))) return [];
        if (otherSelected.some((entry) => (
          normalize(entry.clue.text) === normalize(candidate.clue.text)
          || cluesEffectivelyRepeated(entry.clue, candidate.clue)
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
    SPORTS_IDENTITY_TARGET,
    limit,
    prepared.filter((entry) => (
      entry.selectionClass === "sports-identity"
      && !isGenericCareerGames(entry.clue)
    )).length,
  );

  while (selected.filter((entry) => entry.selectionClass === "sports-identity").length < sportsIdentityTarget) {
    const quotaSwaps = selected.flatMap((current, selectedIndex) => {
      if (current.selectionClass === "sports-identity") return [];
      const otherSelected = selected.filter((_entry, index) => index !== selectedIndex);

      return prepared
        .filter((candidate) => !selected.includes(candidate))
        .filter((candidate) => candidate.selectionClass === "sports-identity")
        .filter((candidate) => !isGenericCareerGames(candidate.clue))
        .filter((candidate) => {
          const candidateRank = bandRank(candidate.clue.band);
          const currentRank = bandRank(current.clue.band);
          if (candidateRank >= currentRank) return true;
          if (currentRank - candidateRank > 1) return false;

          // Sports-facing composition may replace one over-classified personal clue with
          // a slightly earlier-band sports clue, but never at the expense of the minimum
          // three-clue strong/giveaway finish.
          const lateAfterSwap = otherSelected.filter((entry) => (
            entry.clue.band === "strong" || entry.clue.band === "giveaway"
          )).length + Number(candidate.clue.band === "strong" || candidate.clue.band === "giveaway");
          return lateAfterSwap >= 3;
        })
        .filter((candidate) => !otherSelected.some((entry) => entry.conceptId === candidate.conceptId))
        .filter((candidate) => !otherSelected.some((entry) => whoAmICluesShareInformation(entry.clue, candidate.clue)))
        .filter((candidate) => !otherSelected.some((entry) => (
          normalize(entry.clue.text) === normalize(candidate.clue.text)
          || (
            cluesEffectivelyRepeated(entry.clue, candidate.clue)
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

  // Greedy selection can occasionally need the legacy playability fallback even
  // when the full candidate pool contains a clean replacement. Repair any remaining
  // semantic collision before replay variation so a duplicate lane never survives
  // merely because it was chosen earlier in the pass.
  for (let repairPass = 0; repairPass < limit; repairPass += 1) {
    let repaired = false;

    for (let leftIndex = 0; leftIndex < selected.length && !repaired; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < selected.length && !repaired; rightIndex += 1) {
        const left = selected[leftIndex]!;
        const right = selected[rightIndex]!;
        if (!whoAmICluesShareInformation(left.clue, right.clue)) continue;

        const victims = [
          { entry: left, index: leftIndex },
          { entry: right, index: rightIndex },
        ].sort((a, b) => {
          const aComposite = Number(/role-school/i.test(`${a.entry.clue.id} ${a.entry.clue.conceptId ?? ""}`));
          const bComposite = Number(/role-school/i.test(`${b.entry.clue.id} ${b.entry.clue.conceptId ?? ""}`));
          return bComposite - aComposite
            || b.entry.priority - a.entry.priority
            || a.entry.strength - b.entry.strength;
        });

        for (const victim of victims) {
          const others = selected.filter((_entry, index) => index !== victim.index);
          const currentLate = others.filter((entry) => (
            entry.clue.band === "strong" || entry.clue.band === "giveaway"
          )).length;
          const currentSports = others.filter((entry) => entry.selectionClass === "sports-identity").length;

          const replacements = prepared
            .filter((candidate) => !selected.includes(candidate))
            .filter((candidate) => !others.some((other) => other.conceptId === candidate.conceptId))
            .filter((candidate) => !others.some((other) => whoAmICluesShareInformation(other.clue, candidate.clue)))
            .filter((candidate) => !others.some((other) => (
              normalize(other.clue.text) === normalize(candidate.clue.text)
              || cluesEffectivelyRepeated(other.clue, candidate.clue)
            )))
            .filter((candidate) => {
              const lateAfter = currentLate + Number(
                candidate.clue.band === "strong" || candidate.clue.band === "giveaway",
              );
              if (lateAfter < 3) return false;

              const sportsAfter = currentSports + Number(candidate.selectionClass === "sports-identity");
              if (sportsAfter < sportsIdentityTarget) return false;

              const personalAfter = others.filter((entry) => entry.selectionClass !== "sports-identity").length
                + Number(candidate.selectionClass !== "sports-identity");
              const biographyAfter = others.filter((entry) => entry.selectionClass === "deep-biography").length
                + Number(candidate.selectionClass === "deep-biography");
              if (personalAfter > 3 || biographyAfter > 1) return false;

              const sameFacet = others.filter((entry) => entry.facet === candidate.facet).length;
              if (candidate.facet === "relationships" && sameFacet >= 1) return false;
              const facetLimit = FACET_LIMITS[candidate.facet];
              return facetLimit == null || sameFacet < facetLimit;
            })
            .sort((a, b) => (
              Math.abs(bandRank(a.clue.band) - bandRank(victim.entry.clue.band))
              - Math.abs(bandRank(b.clue.band) - bandRank(victim.entry.clue.band))
              || a.priority - b.priority
              || b.strength - a.strength
              || a.index - b.index
            ));

          if (!replacements.length) continue;
          selected[victim.index] = replacements[0]!;
          repaired = true;
          break;
        }
      }
    }

    if (!repaired) break;
  }

  const hasSemanticCollision = (entries: readonly PreparedClue[]) => (
    entries.some((left, leftIndex) => entries.some((right, rightIndex) => (
      rightIndex > leftIndex && whoAmICluesShareInformation(left.clue, right.clue)
    )))
  );

  if (
    hasSemanticCollision(selected)
    && whoAmISemanticIndependentCapacity(semanticCapacityInput(clues), limit) >= limit
  ) {
    const selectedSet = new Set(selected);
    const ordered = [
      ...selected,
      ...prepared
        .filter((entry) => !selectedSet.has(entry))
        .sort((left, right) => (
          left.priority - right.priority
          || right.strength - left.strength
          || left.index - right.index
        )),
    ];

    let visited = 0;
    const maxVisited = 50_000;
    let cleanBoard: PreparedClue[] | null = null;
    const chosen: PreparedClue[] = [];

    const searchCleanBoard = (start: number) => {
      visited += 1;
      if (visited > maxVisited || cleanBoard) return;

      if (chosen.length === limit) {
        const lateCount = chosen.filter((entry) => (
          entry.clue.band === "strong" || entry.clue.band === "giveaway"
        )).length;
        const sportsCount = chosen.filter((entry) => entry.selectionClass === "sports-identity").length;
        const biographyCount = chosen.filter((entry) => entry.selectionClass === "deep-biography").length;
        const relationshipCount = chosen.filter((entry) => entry.facet === "relationships").length;
        if (
          lateCount >= 3
          && sportsCount >= sportsIdentityTarget
          && biographyCount <= 1
          && relationshipCount <= 1
        ) {
          cleanBoard = [...chosen];
        }
        return;
      }

      if (chosen.length + (ordered.length - start) < limit) return;

      for (let index = start; index < ordered.length; index += 1) {
        const candidate = ordered[index]!;
        if (chosen.some((entry) => entry.conceptId === candidate.conceptId)) continue;
        if (chosen.some((entry) => whoAmICluesShareInformation(entry.clue, candidate.clue))) continue;
        if (chosen.some((entry) => (
          normalize(entry.clue.text) === normalize(candidate.clue.text)
          || cluesEffectivelyRepeated(entry.clue, candidate.clue)
        ))) continue;

        chosen.push(candidate);
        searchCleanBoard(index + 1);
        chosen.pop();
        if (cleanBoard) return;
      }
    };

    searchCleanBoard(0);
    const recoveredBoard = cleanBoard as PreparedClue[] | null;
    if (recoveredBoard) selected.splice(0, selected.length, ...recoveredBoard);
  }

  const selectedSnapshot = [...selected];
  const replaySwapOptions = selectedSnapshot.flatMap((current, selectedIndex) => {
    const chronologyReplay = current.semanticFamily === "era:chronology";
    if (
      current.clue.band !== "helpful"
      && current.clue.band !== "strong"
      && !(chronologyReplay && current.clue.band === "broad")
    ) return [];

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
      .filter((candidate) => !isGenericCareerGames(candidate.clue))
      .filter((candidate) => (
        candidate.clue.band === current.clue.band
        || (
          chronologyReplay
          && candidate.semanticFamily === "era:chronology"
          && bandRank(candidate.clue.band) >= bandRank(current.clue.band)
          && bandRank(candidate.clue.band) <= Math.min(bandRank(current.clue.band) + 1, bandRank("strong"))
        )
      ))
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
      .filter((candidate) => !whoAmICluesShareInformation(current.clue, candidate.clue))
      .filter((candidate) => !selectedSnapshot.some((other) => (
        other !== current && other.conceptId === candidate.conceptId
      )))
      .filter((candidate) => !selectedSnapshot.some((other) => (
        other !== current && whoAmICluesShareInformation(other.clue, candidate.clue)
      )))
      .filter((candidate) => !selectedSnapshot.some((other) => (
        other !== current
        && (
          normalize(other.clue.text) === normalize(candidate.clue.text)
          || cluesEffectivelyRepeated(other.clue, candidate.clue)
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
    const chronologyReplay = (
      swap.current.semanticFamily === "era:chronology"
      && swap.candidate.semanticFamily === "era:chronology"
    );
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

import type {
  WhoAmIClue,
  WhoAmIClueBand,
  WhoAmIIdentityCoordinate,
  WhoAmILeague,
} from "./whoAmIEngine";
import { whoAmICluesShareInformation } from "./whoAmISemanticQuality";

export type WhoAmIRevealCategory =
  | "role"
  | "era"
  | "school"
  | "sports-biography"
  | "draft-entry"
  | "team-path"
  | "production"
  | "accomplishments"
  | "championships"
  | "records"
  | "style"
  | "relationships"
  | "signature-moment"
  | "jersey-number"
  | "nickname-persona"
  | "personal-biography"
  | "nationality"
  | "ufc-division"
  | "ufc-gym"
  | "identity";

export type WhoAmIIdentifyingPower = "broad" | "specific" | "signature";

export interface WhoAmIRevealProfile {
  category: WhoAmIRevealCategory;
  identifyingPower: WhoAmIIdentifyingPower;
  earliestClue: number;
  latestClue: number;
}

const DISTINCTIVE_SCHOOLS = [
  "oregon state",
  "mississippi valley state",
] as const;

const POWERHOUSE_SCHOOLS = [
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

const WINDOWS: Readonly<Record<
  WhoAmIRevealCategory,
  Readonly<Record<WhoAmIIdentifyingPower, readonly [number, number]>>
>> = {
  role: { broad: [1, 4], specific: [3, 6], signature: [5, 8] },
  era: { broad: [1, 4], specific: [3, 6], signature: [5, 8] },
  school: { broad: [3, 6], specific: [4, 8], signature: [6, 10] },
  "sports-biography": { broad: [1, 6], specific: [2, 8], signature: [4, 10] },
  "draft-entry": { broad: [1, 6], specific: [2, 8], signature: [4, 10] },
  "team-path": { broad: [1, 6], specific: [2, 8], signature: [5, 10] },
  production: { broad: [2, 8], specific: [3, 9], signature: [5, 10] },
  accomplishments: { broad: [1, 8], specific: [2, 9], signature: [5, 10] },
  championships: { broad: [2, 8], specific: [3, 9], signature: [5, 10] },
  records: { broad: [2, 9], specific: [3, 10], signature: [5, 10] },
  style: { broad: [1, 6], specific: [2, 9], signature: [5, 10] },
  relationships: { broad: [5, 8], specific: [7, 10], signature: [8, 10] },
  "signature-moment": { broad: [3, 10], specific: [5, 10], signature: [8, 10] },
  "jersey-number": { broad: [8, 10], specific: [8, 10], signature: [8, 10] },
  "nickname-persona": { broad: [9, 10], specific: [9, 10], signature: [9, 10] },
  "personal-biography": { broad: [8, 10], specific: [8, 10], signature: [9, 10] },
  nationality: { broad: [2, 5], specific: [4, 7], signature: [6, 9] },
  "ufc-division": { broad: [1, 4], specific: [3, 6], signature: [5, 8] },
  "ufc-gym": { broad: [4, 7], specific: [5, 8], signature: [7, 10] },
  identity: { broad: [2, 7], specific: [4, 9], signature: [7, 10] },
};

const BAND_RANK: Readonly<Record<WhoAmIClueBand, number>> = {
  broad: 0,
  helpful: 1,
  strong: 2,
  giveaway: 3,
};

function clueText(clue: WhoAmIClue) {
  return `${clue.id} ${clue.conceptId ?? ""} ${clue.text}`.toLowerCase();
}

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

function categoryFor(clue: WhoAmIClue): WhoAmIRevealCategory {
  const text = clueText(clue);
  const facet = clue.facet ?? "identity";

  if (/\b(?:nickname|moniker|persona|alter ego|legally changed|changed (?:my|his|her) (?:name|surname)|name change)\b/.test(text)) {
    return "nickname-persona";
  }
  if (/\b(?:jersey number|wore no\.|wear no\.|number \d{1,2}\b|no\. \d{1,2}\b)\b/.test(text)) {
    return "jersey-number";
  }
  if (/\b(?:draft|drafted|selected no\.|overall pick|undrafted|first-round pick|first round pick)\b/.test(text)) {
    return "draft-entry";
  }
  if (/\b(?:walk-on|walk on|junior college|juco|transfer portal|transferred|position change|converted from|switched from|recruited as|two-sport|multi-sport|multisport|ball boy|ballboy)\b/.test(text)) {
    return "sports-biography";
  }
  if (
    facet === "off-field"
    || /\b(?:childhood|upbringing|grandmother|grandfather|parents?|father|mother|brother|sister|family|married|marriage|grew up|raised by|worked as|job before)\b/.test(text)
  ) {
    return "personal-biography";
  }
  if (/\b(?:weight class|division|flyweight|bantamweight|featherweight|lightweight|welterweight|middleweight|light heavyweight|heavyweight|strawweight)\b/.test(text)) {
    return "ufc-division";
  }
  if (/\b(?:gym|camp|american top team|kill cliff|city kickboxing|xtreme couture)\b/.test(text)) {
    return "ufc-gym";
  }
  if (/\b(?:college football at|played at|attended|committed to|university|college)\b/.test(text) && facet === "background") {
    return "school";
  }
  if (/\b(?:played for|spent \d+ seasons? (?:with|for)|joined the|career stops?|franchise)\b/.test(text) || facet === "career-path") {
    return "team-path";
  }
  if (/\b(?:super bowl|national championship|championship|champion|title fight|ufc title|won the title|held the title)\b/.test(text)) {
    return "championships";
  }
  if (/\b(?:record|milestone|all-time leader|career leader|single-season leader)\b/.test(text)) {
    return "records";
  }
  if (/\b(?:heisman|mvp|all-pro|pro bowl|all-america|all-american|player of the year|award|honors?)\b/.test(text) || facet === "accomplishments") {
    return "accomplishments";
  }
  if (/\b(?:game-winning|last-second|walk-off|iconic moment|famous moment|signature moment|miracle|historic play)\b/.test(text)) {
    return "signature-moment";
  }
  if (/\b(?:defeated|lost to|fought|opponent|teammate|shared the octagon|training partner|rival)\b/.test(text) || facet === "relationships") {
    return "relationships";
  }
  if (/\b(?:style|striking|striker|grappling|grappler|wrestling|wrestler|boxing|kickboxing|submission|pass rush|route running|scrambler|mobility)\b/.test(text) || facet === "style") {
    return "style";
  }
  if (/\b(?:nationality|born in)\b/.test(text) && facet === "background") {
    return "nationality";
  }
  if (facet === "production") return "production";
  if (facet === "role") return "role";
  if (facet === "era") return "era";
  if (facet === "background") return "school";
  return "identity";
}

export function whoAmIMajorIdentityCoordinates(
  clue: WhoAmIClue,
  league?: WhoAmILeague,
): readonly WhoAmIIdentityCoordinate[] {
  if (league !== "CFB" && league !== "NFL") return [];

  // Football authority annotates every generated clue with subject-aware coordinate
  // exposure. Unit/legacy clues without annotations fall back to the reveal category.
  if (clue.identityCoordinates) {
    return clue.identityCoordinates.filter((coordinate) => (
      coordinate === "role"
      || coordinate === "era"
      || (league === "CFB" && coordinate === "school")
      || (league === "NFL" && coordinate === "team")
    ));
  }

  const category = categoryFor(clue);
  const coordinates = new Set<WhoAmIIdentityCoordinate>();
  if (category === "role") coordinates.add("role");
  if (category === "era") coordinates.add("era");
  if (league === "CFB" && category === "school") coordinates.add("school");
  if (league === "NFL" && category === "team-path") coordinates.add("team");
  return [...coordinates];
}

function coordinateBudgetForPosition(position: number) {
  if (position <= 4) return 1;
  if (position <= 6) return 2;
  return 3;
}

function coordinateBudgetAllows(
  chosen: readonly WhoAmIClue[],
  candidate: WhoAmIClue,
  position: number,
  league?: WhoAmILeague,
) {
  if (league !== "CFB" && league !== "NFL") return true;
  const coordinates = new Set<WhoAmIIdentityCoordinate>();
  for (const clue of [...chosen, candidate]) {
    for (const coordinate of whoAmIMajorIdentityCoordinates(clue, league)) {
      coordinates.add(coordinate);
    }
  }
  return coordinates.size <= coordinateBudgetForPosition(position);
}

export function whoAmIRevealCoordinateProgressionSatisfied(
  clues: readonly WhoAmIClue[],
  league?: WhoAmILeague,
) {
  if (league !== "CFB" && league !== "NFL") return true;
  const coordinates = new Set<WhoAmIIdentityCoordinate>();
  for (let index = 0; index < clues.length; index += 1) {
    for (const coordinate of whoAmIMajorIdentityCoordinates(clues[index]!, league)) {
      coordinates.add(coordinate);
    }
    if (coordinates.size > coordinateBudgetForPosition(index + 1)) return false;
  }
  return true;
}

function identifyingPowerFor(
  clue: WhoAmIClue,
  category: WhoAmIRevealCategory,
): WhoAmIIdentifyingPower {
  const text = clueText(clue);

  if (category === "nickname-persona" || category === "jersey-number") return "signature";
  if (category === "signature-moment") return clue.band === "giveaway" ? "signature" : "specific";

  if (category === "school") {
    if (includesAny(text, DISTINCTIVE_SCHOOLS)) return "signature";
    if (includesAny(text, POWERHOUSE_SCHOOLS)) return "broad";
    if (/\b(?:college football at|played at|attended|committed to|university|college)\b/.test(text)) return "specific";
    return "broad";
  }

  if (category === "sports-biography") {
    if (/\b(?:junior college|juco)\b/.test(text)) return "signature";
    if (/\b(?:transferred|transfer portal)\b/.test(text) && /\b(?:to|from|at)\b/.test(text)) {
      return "signature";
    }
    return clue.band === "giveaway" ? "signature" : "specific";
  }

  if (category === "team-path") {
    if (
      /\b(?:before joining|then joined|later joined|after \d+ seasons?|spent \d+ seasons?).*\b(?:joined|with|for)\b/.test(text)
      || (text.match(/\b(?:played for|joined|with the)\b/g)?.length ?? 0) >= 2
    ) {
      return "signature";
    }
    if (/\b(?:played for|joined the|spent \d+ seasons? (?:with|for))\b/.test(text)) return "specific";
    return "broad";
  }

  if (category === "draft-entry") {
    return /\b(?:selected no\. \d+|no\. \d+ overall|first overall|top-\d+|top \d+)\b/.test(text)
      ? "specific"
      : "broad";
  }

  if (category === "accomplishments") {
    if (/\b(?:heisman|mvp|hall of fame|player of the year|first-team all-pro|first team all-pro)\b/.test(text)) {
      return "specific";
    }
    return clue.band === "giveaway" ? "specific" : "broad";
  }

  if (category === "records") {
    return /\b(?:all-time|career leader|single-season|first player|only player)\b/.test(text)
      ? "signature"
      : "specific";
  }

  if (category === "personal-biography" || category === "relationships" || category === "ufc-gym" || category === "nationality") {
    return clue.band === "giveaway" ? "signature" : "specific";
  }

  if (category === "production") return clue.band === "giveaway" ? "specific" : "broad";
  if (clue.band === "giveaway") return "signature";
  if (clue.band === "strong") return "specific";
  return "broad";
}

export function whoAmIRevealProfile(clue: WhoAmIClue): WhoAmIRevealProfile {
  const category = categoryFor(clue);
  const identifyingPower = identifyingPowerFor(clue, category);
  const [earliestClue, latestClue] = WINDOWS[category][identifyingPower];
  return { category, identifyingPower, earliestClue, latestClue };
}

export function whoAmIClueAllowedAtRevealPosition(clue: WhoAmIClue, zeroBasedIndex: number) {
  return zeroBasedIndex + 1 >= whoAmIRevealProfile(clue).earliestClue;
}

export function whoAmIRevealArchitectureSatisfied(
  clues: readonly WhoAmIClue[],
  league?: WhoAmILeague,
) {
  return clues.every((clue, index) => whoAmIClueAllowedAtRevealPosition(clue, index))
    && clues.filter((clue) => whoAmIRevealProfile(clue).category === "personal-biography").length <= 1
    && whoAmIRevealCoordinateProgressionSatisfied(clues, league);
}

function preferredBandRank(position: number, band: WhoAmIClueBand) {
  const preferred: readonly WhoAmIClueBand[] = position <= 2
    ? ["broad", "helpful", "strong", "giveaway"]
    : position <= 4
      ? ["helpful", "broad", "strong", "giveaway"]
      : position <= 8
        ? ["strong", "helpful", "giveaway", "broad"]
        : ["giveaway", "strong", "helpful", "broad"];
  return preferred.indexOf(band);
}

function scheduleRevealArchitecture(
  clues: readonly WhoAmIClue[],
  league?: WhoAmILeague,
  targetLength = clues.length,
) {
  if (targetLength !== 10 || clues.length < targetLength) return null;
  if (
    clues.length === targetLength
    && clues.filter((clue) => whoAmIRevealProfile(clue).category === "personal-biography").length > 1
  ) {
    return null;
  }

  const strongAvailable = clues.filter((clue) => (
    clue.band === "strong" || clue.band === "giveaway"
  )).length;
  const preserveStrongFinalTwo = strongAvailable >= 2;
  const preserveStrongFinalFour = strongAvailable >= 3;
  const entries = clues.map((clue, originalIndex) => ({ clue, originalIndex }));
  const chosen: typeof entries = [];
  let explored = 0;
  const MAX_NODES = clues.length > targetLength ? 25_000 : 5_000;

  const search = (position: number, remaining: typeof entries): WhoAmIClue[] | null => {
    explored += 1;
    if (explored > MAX_NODES) return null;
    if (position > targetLength) {
      const ordered = chosen.map((entry) => entry.clue);
      if (
        preserveStrongFinalFour
        && ordered.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length < 3
      ) {
        return null;
      }
      return ordered;
    }

    const candidates = remaining
      .filter(({ clue }) => whoAmIClueAllowedAtRevealPosition(clue, position - 1))
      .filter(({ clue }) => coordinateBudgetAllows(chosen.map((entry) => entry.clue), clue, position, league))
      .filter(({ clue }) => (
        whoAmIRevealProfile(clue).category !== "personal-biography"
        || chosen.every((entry) => whoAmIRevealProfile(entry.clue).category !== "personal-biography")
      ))
      .filter(({ clue }) => chosen.every((entry) => (
        (entry.clue.conceptId ?? entry.clue.id) !== (clue.conceptId ?? clue.id)
        && !whoAmICluesShareInformation(entry.clue, clue)
      )))
      .filter(({ clue }) => (
        !preserveStrongFinalTwo
        || position < 9
        || clue.band === "strong"
        || clue.band === "giveaway"
      ))
      .sort((left, right) => {
        const leftPower = whoAmIRevealProfile(left.clue).identifyingPower;
        const rightPower = whoAmIRevealProfile(right.clue).identifyingPower;
        const powerRank = { broad: 0, specific: 1, signature: 2 } as const;
        const powerPreference = position >= 7
          ? powerRank[rightPower] - powerRank[leftPower]
          : powerRank[leftPower] - powerRank[rightPower];
        return preferredBandRank(position, left.clue.band) - preferredBandRank(position, right.clue.band)
          || powerPreference
          || Math.abs(left.originalIndex - (position - 1)) - Math.abs(right.originalIndex - (position - 1))
          || BAND_RANK[left.clue.band] - BAND_RANK[right.clue.band]
          || left.originalIndex - right.originalIndex;
      });

    for (const candidate of candidates) {
      chosen.push(candidate);
      const nextRemaining = remaining.filter((entry) => entry !== candidate);
      const result = search(position + 1, nextRemaining);
      if (result) return result;
      chosen.pop();
    }

    return null;
  };

  return search(1, entries);
}

export function whoAmIRevealArchitectureCanOrder(
  clues: readonly WhoAmIClue[],
  league?: WhoAmILeague,
) {
  return whoAmIRevealArchitectureSatisfied(clues, league) || scheduleRevealArchitecture(clues, league) !== null;
}

export function selectAndOrderWhoAmICluesByRevealArchitectureIfPossible(
  clues: readonly WhoAmIClue[],
  league?: WhoAmILeague,
) {
  return scheduleRevealArchitecture(clues, league, 10);
}

/**
 * PR2 is ordering-only. It never swaps facts, changes the selected clue set, or
 * changes replay selection. Thin source pools that cannot satisfy the reveal
 * rules remain unchanged for the league cleanup PRs.
 */
export function orderWhoAmICluesByRevealArchitectureIfPossible(
  clues: readonly WhoAmIClue[],
  league?: WhoAmILeague,
) {
  if (whoAmIRevealArchitectureSatisfied(clues, league)) return [...clues];
  return scheduleRevealArchitecture(clues, league) ?? [...clues];
}

import type { WhoAmIClue, WhoAmIClueBand } from "./whoAmIEngine";

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
  "sports-biography": { broad: [3, 6], specific: [4, 8], signature: [6, 10] },
  "draft-entry": { broad: [3, 6], specific: [5, 8], signature: [6, 10] },
  "team-path": { broad: [3, 6], specific: [5, 8], signature: [7, 10] },
  production: { broad: [4, 8], specific: [5, 9], signature: [6, 10] },
  accomplishments: { broad: [4, 8], specific: [5, 9], signature: [6, 10] },
  championships: { broad: [5, 8], specific: [5, 9], signature: [6, 10] },
  records: { broad: [6, 9], specific: [6, 10], signature: [7, 10] },
  style: { broad: [2, 6], specific: [5, 9], signature: [6, 10] },
  relationships: { broad: [5, 8], specific: [7, 10], signature: [8, 10] },
  "signature-moment": { broad: [7, 10], specific: [8, 10], signature: [9, 10] },
  "jersey-number": { broad: [8, 10], specific: [8, 10], signature: [8, 10] },
  "nickname-persona": { broad: [9, 10], specific: [9, 10], signature: [9, 10] },
  "personal-biography": { broad: [8, 10], specific: [8, 10], signature: [9, 10] },
  nationality: { broad: [2, 5], specific: [4, 7], signature: [6, 9] },
  "ufc-division": { broad: [1, 4], specific: [3, 6], signature: [5, 8] },
  "ufc-gym": { broad: [4, 7], specific: [5, 8], signature: [7, 10] },
  identity: { broad: [3, 7], specific: [5, 9], signature: [7, 10] },
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

export function whoAmIRevealArchitectureSatisfied(clues: readonly WhoAmIClue[]) {
  return clues.every((clue, index) => whoAmIClueAllowedAtRevealPosition(clue, index))
    && clues.filter((clue) => whoAmIRevealProfile(clue).category === "personal-biography").length <= 1;
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

function scheduleRevealArchitecture(clues: readonly WhoAmIClue[]) {
  if (clues.length !== 10) return null;
  if (clues.filter((clue) => whoAmIRevealProfile(clue).category === "personal-biography").length > 1) {
    return null;
  }

  const preserveStrongFinalTwo = clues.slice(-2).every((clue) => (
    clue.band === "strong" || clue.band === "giveaway"
  ));
  const preserveStrongFinalFour = clues.slice(-4).filter((clue) => (
    clue.band === "strong" || clue.band === "giveaway"
  )).length >= 3;
  const entries = clues.map((clue, originalIndex) => ({ clue, originalIndex }));
  const chosen: typeof entries = [];
  let explored = 0;
  const MAX_NODES = 30_000;

  const search = (position: number, remaining: typeof entries): WhoAmIClue[] | null => {
    explored += 1;
    if (explored > MAX_NODES) return null;
    if (position > clues.length) {
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

export function whoAmIRevealArchitectureCanOrder(clues: readonly WhoAmIClue[]) {
  return whoAmIRevealArchitectureSatisfied(clues) || scheduleRevealArchitecture(clues) !== null;
}

/**
 * PR2 is ordering-only. It never swaps facts, changes the selected clue set, or
 * changes replay selection. Thin source pools that cannot satisfy the reveal
 * rules remain unchanged for the league cleanup PRs.
 */
export function orderWhoAmICluesByRevealArchitectureIfPossible(clues: readonly WhoAmIClue[]) {
  if (whoAmIRevealArchitectureSatisfied(clues)) return [...clues];
  return scheduleRevealArchitecture(clues) ?? [...clues];
}

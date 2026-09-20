import { whoAmIClueFacet, whoAmIClueSelectionClass } from "./whoAmIClueAssembler";
import type { WhoAmIClue, WhoAmIClueBand, WhoAmIRevealCoordinate } from "./whoAmIEngine";
import { whoAmICluesShareInformation, whoAmISemanticIndependentCapacity } from "./whoAmISemanticQuality";

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

const LATE_ANCHOR_CATEGORIES = new Set<WhoAmIRevealCategory>([
  "school",
  "sports-biography",
  "draft-entry",
  "team-path",
  "accomplishments",
  "championships",
  "records",
  "style",
  "signature-moment",
  "jersey-number",
  "nickname-persona",
  "identity",
]);

function revealCoordinateBudget(position: number) {
  if (position <= 4) return 1;
  if (position <= 6) return 2;
  if (position <= 8) return 3;
  return Number.POSITIVE_INFINITY;
}

export function isStrongLateAnchor(clue: WhoAmIClue) {
  return (clue.band === "strong" || clue.band === "giveaway")
    && LATE_ANCHOR_CATEGORIES.has(whoAmIRevealProfile(clue).category);
}

export function whoAmIRevealCoordinateWindowSatisfied(clues: readonly WhoAmIClue[]) {
  const exposed = new Set<WhoAmIRevealCoordinate>();
  for (let index = 0; index < clues.length; index += 1) {
    for (const coordinate of clues[index]!.revealCoordinates ?? []) exposed.add(coordinate);
    if (exposed.size > revealCoordinateBudget(index + 1)) return false;
  }
  return true;
}

function clueText(clue: WhoAmIClue) {
  return `${clue.id} ${clue.conceptId ?? ""} ${clue.text}`.toLowerCase();
}

function includesAny(text: string, values: readonly string[]) {
  return values.some((value) => text.includes(value));
}

function categoryForCanonicalFacet(
  clue: WhoAmIClue,
  text: string,
): WhoAmIRevealCategory | null {
  const facet = clue.facet;
  if (!facet) return null;

  switch (facet) {
    case "nickname":
      return "nickname-persona";
    case "production":
      // Explicit production metadata is authoritative. Text such as "record" or
      // a strong/giveaway band never promotes a raw production clue into a finale
      // identity anchor.
      return "production";
    case "role":
      return "role";
    case "era":
      return "era";
    case "style":
      return "style";
    case "relationships":
      return "relationships";
    case "off-field":
      return "personal-biography";
    case "accomplishments":
      if (/\b(?:super bowl|national championship|championship|champion|title fight|ufc title|won the title|held the title)\b/.test(text)) {
        return "championships";
      }
      if (/\b(?:record|milestone|all-time leader|career leader|single-season leader)\b/.test(text)) {
        return "records";
      }
      if (/\b(?:game-winning|last-second|walk-off|iconic moment|famous moment|signature moment|miracle|historic play)\b/.test(text)) {
        return "signature-moment";
      }
      return "accomplishments";
    case "career-path":
      if (/\b(?:draft|drafted|selected no\.|overall pick|undrafted|first-round pick|first round pick)\b/.test(text)) {
        return "draft-entry";
      }
      if (/\b(?:walk-on|walk on|junior college|juco|transfer portal|transferred|position change|converted from|switched from|recruited as|two-sport|multi-sport|multisport|ball boy|ballboy)\b/.test(text)) {
        return "sports-biography";
      }
      return "team-path";
    case "background":
      if (/\b(?:nationality|born in)\b/.test(text)) return "nationality";
      if (/\b(?:walk-on|walk on|junior college|juco|transfer portal|transferred|position change|converted from|switched from|recruited as|two-sport|multi-sport|multisport|ball boy|ballboy)\b/.test(text)) {
        return "sports-biography";
      }
      return "school";
    case "identity":
      if (/\b(?:jersey number|wore no\.|wear no\.|number \d{1,2}\b|no\. \d{1,2}\b)\b/.test(text)) {
        return "jersey-number";
      }
      if (/\b(?:nickname|moniker|persona|alter ego|legally changed|changed (?:my|his|her) (?:name|surname)|name change|known as|called me)\b/.test(text)) {
        return "nickname-persona";
      }
      if (/\b(?:game-winning|last-second|walk-off|iconic moment|famous moment|signature moment|miracle|historic play)\b/.test(text)) {
        return "signature-moment";
      }
      return "identity";
  }
}

function legacyCategoryFor(clue: WhoAmIClue, text: string): WhoAmIRevealCategory {
  const facet = whoAmIClueFacet(clue);

  if (
    facet === "nickname"
    || /\b(?:nickname|moniker|persona|alter ego|legally changed|changed (?:my|his|her) (?:name|surname)|name change)\b/.test(text)
  ) {
    return "nickname-persona";
  }
  if (/\b(?:jersey number|wore no\.|wear no\.|number \d{1,2}\b|no\. \d{1,2}\b)\b/.test(text)) {
    return "jersey-number";
  }
  if (facet === "production") return "production";
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
  if (facet === "role") return "role";
  if (facet === "era") return "era";
  if (facet === "background") return "school";
  return "identity";
}

function categoryFor(clue: WhoAmIClue): WhoAmIRevealCategory {
  const text = clueText(clue);
  return categoryForCanonicalFacet(clue, text) ?? legacyCategoryFor(clue, text);
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

function footballSchedulingEarliestClue(
  clue: WhoAmIClue,
  profile: WhoAmIRevealProfile,
) {
  const { category, identifyingPower, earliestClue } = profile;

  const byPower = (broad: number, specific: number, signature: number) => (
    identifyingPower === "broad" ? broad : identifyingPower === "specific" ? specific : signature
  );

  switch (category) {
    case "personal-biography":
    case "jersey-number":
    case "nickname-persona":
      return earliestClue;
    case "relationships":
      return Math.min(earliestClue, byPower(2, 3, 5));
    case "signature-moment":
      return Math.min(earliestClue, byPower(3, 4, 6));
    default:
      // Football's major identity coordinates are budgeted separately, so
      // sports-first clues may orient early without the old per-category
      // restriction accidentally blocking the one allowed early coordinate.
      return Math.min(earliestClue, byPower(1, 2, 4));
  }
}

export function whoAmIClueAllowedAtRevealPosition(clue: WhoAmIClue, zeroBasedIndex: number) {
  const profile = whoAmIRevealProfile(clue);
  const earliestClue = clue.revealCoordinates === undefined
    ? profile.earliestClue
    : footballSchedulingEarliestClue(clue, profile);
  return zeroBasedIndex + 1 >= earliestClue;
}

export function whoAmIRevealArchitectureSatisfied(clues: readonly WhoAmIClue[]) {
  const isFootballBoard = clues.length === 10
    && clues.some((clue) => clue.revealCoordinates !== undefined);
  const late = clues.slice(-4);
  const footballLateQualitySatisfied = !isFootballBoard || (
    isStrongLateAnchor(clues.at(-1)!)
    && clues.slice(-2).every((clue) => clue.band === "strong" || clue.band === "giveaway")
    && late.filter((clue) => clue.band === "strong" || clue.band === "giveaway").length >= 3
    && late.filter(isStrongLateAnchor).length >= 2
  );

  return clues.every((clue, index) => whoAmIClueAllowedAtRevealPosition(clue, index))
    && clues.filter((clue) => whoAmIRevealProfile(clue).category === "personal-biography").length <= 1
    && whoAmIRevealCoordinateWindowSatisfied(clues)
    && footballLateQualitySatisfied;
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
  targetLength = 10,
) {
  if (targetLength !== 10 || clues.length < targetLength) return null;
  if (clues.filter((clue) => clue.band === "strong" || clue.band === "giveaway").length < 3) return null;
  if (clues.filter(isStrongLateAnchor).length < 2) return null;

  const isFootballPool = clues.some((clue) => clue.revealCoordinates !== undefined);
  const entries = clues
    .map((clue, originalIndex) => ({ clue, originalIndex }))
    .filter(({ clue }) => {
      for (let position = 1; position <= targetLength; position += 1) {
        if (!whoAmIClueAllowedAtRevealPosition(clue, position - 1)) continue;
        if (position >= 9 && clue.band !== "strong" && clue.band !== "giveaway") continue;
        if (isFootballPool && position === targetLength && !isStrongLateAnchor(clue)) continue;
        return true;
      }
      return false;
    });
  if (entries.length < targetLength) return null;
  const chosen: typeof entries = [];
  const deadStates = new Set<string>();
  const requireSemanticIndependence = whoAmISemanticIndependentCapacity(clues, targetLength) >= targetLength;
  let explored = 0;
  const MAX_NODES = 1_000_000;

  const search = (position: number, remaining: typeof entries): WhoAmIClue[] | null => {
    explored += 1;
    if (explored > MAX_NODES) return null;

    if (position > targetLength) {
      const ordered = chosen.map((entry) => entry.clue);
      if (ordered.slice(-2).some((clue) => clue.band !== "strong" && clue.band !== "giveaway")) {
        return null;
      }
      if (ordered.slice(-4).filter((clue) => clue.band === "strong" || clue.band === "giveaway").length < 3) {
        return null;
      }
      if (ordered.slice(-4).filter(isStrongLateAnchor).length < 2) {
        return null;
      }
      if (isFootballPool && !isStrongLateAnchor(ordered.at(-1)!)) {
        return null;
      }

      // Selection during coordinate rescue must preserve the same canonical
      // clue-quality contract as normal assembly rather than treating reveal
      // architecture as permission to bypass semantic/facet protections.
      const selectionClasses = ordered.map(whoAmIClueSelectionClass);
      const facets = ordered.map(whoAmIClueFacet);
      if (
        selectionClasses.filter((selectionClass) => selectionClass === "sports-identity").length < 7
        || selectionClasses.filter((selectionClass) => selectionClass === "deep-biography").length > 1
        || new Set(facets).size < 4
        || facets.filter((facet) => facet === "relationships").length > 1
        || facets.filter((facet) => facet === "production").length > 2
      ) {
        return null;
      }

      return ordered;
    }

    if (remaining.length < targetLength - chosen.length) return null;

    const chosenClues = chosen.map((entry) => entry.clue);
    const personalAlreadyChosen = chosenClues.some((clue) => (
      whoAmIRevealProfile(clue).category === "personal-biography"
    ));
    const chosenFacets = chosenClues.map(whoAmIClueFacet);
    const chosenClasses = chosenClues.map(whoAmIClueSelectionClass);
    const productionChosen = chosenFacets.filter((facet) => facet === "production").length;
    const relationshipsChosen = chosenFacets.filter((facet) => facet === "relationships").length;
    const deepBiographyChosen = chosenClasses.filter((selectionClass) => selectionClass === "deep-biography").length;

    const semanticallyAvailable = remaining.filter(({ clue }) => {
      const profile = whoAmIRevealProfile(clue);
      const facet = whoAmIClueFacet(clue);
      const selectionClass = whoAmIClueSelectionClass(clue);
      if (personalAlreadyChosen && profile.category === "personal-biography") return false;
      if (productionChosen >= 2 && facet === "production") return false;
      if (relationshipsChosen >= 1 && facet === "relationships") return false;
      if (deepBiographyChosen >= 1 && selectionClass === "deep-biography") return false;
      if (
        requireSemanticIndependence
        && chosen.some((entry) => (
          (entry.clue.conceptId ?? entry.clue.id) === (clue.conceptId ?? clue.id)
          || whoAmICluesShareInformation(entry.clue, clue)
        ))
      ) {
        return false;
      }
      return true;
    });

    const slotsRemaining = targetLength - chosen.length;
    const sportsIdentityChosen = chosenClasses.filter((selectionClass) => selectionClass === "sports-identity").length;
    const sportsIdentityAvailable = semanticallyAvailable.filter(({ clue }) => (
      whoAmIClueSelectionClass(clue) === "sports-identity"
    )).length;
    const sportsIdentityNeeded = Math.max(0, 7 - sportsIdentityChosen);
    if (
      sportsIdentityChosen + sportsIdentityAvailable < 7
      || sportsIdentityNeeded > slotsRemaining
    ) return null;

    const chosenFacetSet = new Set(chosenFacets);
    const possibleFacets = new Set([
      ...chosenFacets,
      ...semanticallyAvailable.map(({ clue }) => whoAmIClueFacet(clue)),
    ]);
    if (
      possibleFacets.size < 4
      || Math.max(0, 4 - chosenFacetSet.size) > slotsRemaining
    ) return null;

    const exposed = new Set(chosen.flatMap((entry) => entry.clue.revealCoordinates ?? []));
    for (const windowEnd of [4, 6, 8] as const) {
      if (position > windowEnd) continue;
      const slotsRemainingInWindow = windowEnd - position + 1;
      const compatible = semanticallyAvailable.filter(({ clue }) => {
        if (!whoAmIClueAllowedAtRevealPosition(clue, windowEnd - 1)) return false;
        const nextExposed = new Set(exposed);
        for (const coordinate of clue.revealCoordinates ?? []) nextExposed.add(coordinate);
        return nextExposed.size <= revealCoordinateBudget(windowEnd);
      });
      if (compatible.length < slotsRemainingInWindow) return null;
    }

    const lateChosen = chosen.slice(6).map((entry) => entry.clue);
    const lateSlotsRemaining = Math.max(0, 4 - lateChosen.length);
    const strongLateNeeded = Math.max(
      0,
      3 - lateChosen.filter((clue) => clue.band === "strong" || clue.band === "giveaway").length,
    );
    const anchorLateNeeded = Math.max(0, 2 - lateChosen.filter(isStrongLateAnchor).length);
    if (
      strongLateNeeded > lateSlotsRemaining
      || anchorLateNeeded > lateSlotsRemaining
      || semanticallyAvailable.filter(({ clue }) => clue.band === "strong" || clue.band === "giveaway").length < strongLateNeeded
      || semanticallyAvailable.filter(({ clue }) => isStrongLateAnchor(clue)).length < anchorLateNeeded
    ) {
      return null;
    }

    const lateStrongCount = lateChosen.filter((clue) => clue.band === "strong" || clue.band === "giveaway").length;
    const lateAnchorCount = lateChosen.filter(isStrongLateAnchor).length;
    const stateKey = [
      position,
      lateStrongCount,
      lateAnchorCount,
      [...exposed].sort().join("+"),
      remaining.map((entry) => entry.originalIndex).sort((a, b) => a - b).join(","),
    ].join(":");
    if (deadStates.has(stateKey)) return null;

    const candidates = semanticallyAvailable
      .filter(({ clue }) => whoAmIClueAllowedAtRevealPosition(clue, position - 1))
      .filter(({ clue }) => whoAmIRevealCoordinateWindowSatisfied([
        ...chosen.map((entry) => entry.clue),
        clue,
      ]))
      .filter(({ clue }) => (
        position < 9
        || clue.band === "strong"
        || clue.band === "giveaway"
      ))
      .filter(({ clue }) => (
        !isFootballPool
        || position < targetLength
        || isStrongLateAnchor(clue)
      ))
      .filter(({ clue }) => (
        position < 7
        || strongLateNeeded < lateSlotsRemaining
        || clue.band === "strong"
        || clue.band === "giveaway"
      ))
      .filter(({ clue }) => (
        position < 7
        || anchorLateNeeded < lateSlotsRemaining
        || isStrongLateAnchor(clue)
      ))
      .sort((left, right) => {
        const leftProfile = whoAmIRevealProfile(left.clue);
        const rightProfile = whoAmIRevealProfile(right.clue);
        const powerRank = { broad: 0, specific: 1, signature: 2 } as const;
        const coordinatePreference = position <= 4
          ? (left.clue.revealCoordinates?.length ?? 0) - (right.clue.revealCoordinates?.length ?? 0)
          : 0;
        const lateAnchorPreference = position >= 7
          ? Number(isStrongLateAnchor(right.clue)) - Number(isStrongLateAnchor(left.clue))
          : 0;
        const powerPreference = position >= 7
          ? powerRank[rightProfile.identifyingPower] - powerRank[leftProfile.identifyingPower]
          : powerRank[leftProfile.identifyingPower] - powerRank[rightProfile.identifyingPower];
        return coordinatePreference
          || lateAnchorPreference
          || preferredBandRank(position, left.clue.band) - preferredBandRank(position, right.clue.band)
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

    deadStates.add(stateKey);
    return null;
  };

  return search(1, entries);
}

export function selectWhoAmICluesByRevealArchitectureIfPossible(
  clues: readonly WhoAmIClue[],
  targetLength = 10,
) {
  return scheduleRevealArchitecture(clues, targetLength);
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

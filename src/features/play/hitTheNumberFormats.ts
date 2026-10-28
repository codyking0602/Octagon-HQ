import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import {
  HIT_THE_NUMBER_GENERATION_PROFILE,
  HIT_THE_NUMBER_MAX_PICKS,
  HIT_THE_NUMBER_MIN_PICKS,
  createGeneratedHitTheNumberBoard,
  hitTheNumberEligibleFighters,
  hitTheNumberRandomPoolSize,
  hitTheNumberStatRows,
  type HitTheNumberBoardType,
  type HitTheNumberStatId,
  type HitTheNumberStatRow,
} from "./hitTheNumberEngine";
import { seededLineupRandom, shuffleLineup } from "./lineupModel";
import { playFighters, type PlayFighter } from "./playFighterPool";

export type HitTheNumberFormatId = "classic" | "themed-lineup" | "one-from-each" | "build-the-team";

export type HitTheNumberConstraintRule =
  | { kind: "any" }
  | { kind: "division"; division: string }
  | { kind: "champion"; value: boolean }
  | { kind: "ufc-fights-at-least"; count: number }
  | { kind: "stat-at-least"; statId: HitTheNumberStatId; value: number };

export interface HitTheNumberThemeDefinition {
  id: string;
  label: string;
  rules: readonly HitTheNumberConstraintRule[];
}

export interface HitTheNumberSlotDefinition {
  id: string;
  label: string;
  rules: readonly HitTheNumberConstraintRule[];
}

export interface HitTheNumberSlotSetDefinition {
  id: string;
  label: string;
  slots: readonly HitTheNumberSlotDefinition[];
}

export interface HitTheNumberFormatSetup {
  formatId: HitTheNumberFormatId;
  label: string;
  configurationId: string | null;
  configurationLabel: string | null;
  rules: readonly HitTheNumberConstraintRule[];
  slots: readonly HitTheNumberSlotDefinition[];
}

export interface HitTheNumberFormatPlan {
  boardType: HitTheNumberBoardType;
  statId: HitTheNumberStatId;
  target: number;
  pickCount: number;
  fighterIds: string[];
  solutionFighterIds: string[];
  format: HitTheNumberFormatSetup;
}

export interface CreateHitTheNumberFormatPlanOptions {
  seed: string;
  boardType: HitTheNumberBoardType;
  statRows?: readonly HitTheNumberStatRow[];
}

export const HIT_THE_NUMBER_FORMAT_GENERATION_PROFILE = {
  formats: [
    { value: "classic", weight: 40 },
    { value: "themed-lineup", weight: 25 },
    { value: "one-from-each", weight: 20 },
    { value: "build-the-team", weight: 15 },
  ] satisfies readonly { value: HitTheNumberFormatId; weight: number }[],
} as const;

export const HIT_THE_NUMBER_THEME_CATALOG: readonly HitTheNumberThemeDefinition[] = [
  { id: "ufc-champions", label: "UFC Champions", rules: [{ kind: "champion", value: true }] },
  { id: "never-ufc-champion", label: "Never Won a UFC Title", rules: [{ kind: "champion", value: false }] },
  { id: "ufc-veterans", label: "UFC Veterans", rules: [{ kind: "ufc-fights-at-least", count: 15 }] },
  { id: "prolific-finishers", label: "Prolific Finishers", rules: [{ kind: "stat-at-least", statId: "ufc-finishes", value: 6 }] },
  { id: "knockout-artists", label: "Knockout Artists", rules: [{ kind: "stat-at-least", statId: "ufc-ko-tko-wins", value: 4 }] },
  { id: "submission-threats", label: "Submission Threats", rules: [{ kind: "stat-at-least", statId: "ufc-submission-wins", value: 3 }] },
  {
    id: "lightweight-veterans",
    label: "Lightweight Veterans",
    rules: [
      { kind: "division", division: "Lightweight" },
      { kind: "ufc-fights-at-least", count: 10 },
    ],
  },
  {
    id: "welterweight-veterans",
    label: "Welterweight Veterans",
    rules: [
      { kind: "division", division: "Welterweight" },
      { kind: "ufc-fights-at-least", count: 10 },
    ],
  },
];

function divisionSlot(id: string, label: string): HitTheNumberSlotDefinition {
  return { id, label, rules: [{ kind: "division", division: label }] };
}

export const HIT_THE_NUMBER_ONE_FROM_EACH_CATALOG: readonly HitTheNumberSlotSetDefinition[] = [
  {
    id: "flyweight-to-welterweight",
    label: "Flyweight to Welterweight",
    slots: [
      divisionSlot("flyweight", "Flyweight"),
      divisionSlot("bantamweight", "Bantamweight"),
      divisionSlot("featherweight", "Featherweight"),
      divisionSlot("lightweight", "Lightweight"),
      divisionSlot("welterweight", "Welterweight"),
    ],
  },
  {
    id: "bantamweight-to-middleweight",
    label: "Bantamweight to Middleweight",
    slots: [
      divisionSlot("bantamweight", "Bantamweight"),
      divisionSlot("featherweight", "Featherweight"),
      divisionSlot("lightweight", "Lightweight"),
      divisionSlot("welterweight", "Welterweight"),
      divisionSlot("middleweight", "Middleweight"),
    ],
  },
  {
    id: "lightweight-to-heavyweight",
    label: "Lightweight to Heavyweight",
    slots: [
      divisionSlot("lightweight", "Lightweight"),
      divisionSlot("welterweight", "Welterweight"),
      divisionSlot("middleweight", "Middleweight"),
      divisionSlot("light-heavyweight", "Light Heavyweight"),
      divisionSlot("heavyweight", "Heavyweight"),
    ],
  },
];

export const HIT_THE_NUMBER_BUILD_TEAM_CATALOG: readonly HitTheNumberSlotSetDefinition[] = [
  {
    id: "balanced-team",
    label: "Build a Balanced Team",
    slots: [
      { id: "champion", label: "Champion", rules: [{ kind: "champion", value: true }] },
      { id: "veteran", label: "Veteran", rules: [{ kind: "ufc-fights-at-least", count: 15 }] },
      { id: "finisher", label: "Finisher", rules: [{ kind: "stat-at-least", statId: "ufc-finishes", value: 6 }] },
      { id: "ko-threat", label: "KO Threat", rules: [{ kind: "stat-at-least", statId: "ufc-ko-tko-wins", value: 4 }] },
      { id: "wild-card", label: "Wild Card", rules: [{ kind: "any" }] },
    ],
  },
  {
    id: "finish-team",
    label: "Build a Finish Team",
    slots: [
      { id: "champion", label: "Champion", rules: [{ kind: "champion", value: true }] },
      { id: "veteran", label: "Veteran", rules: [{ kind: "ufc-fights-at-least", count: 15 }] },
      { id: "finisher", label: "Finisher", rules: [{ kind: "stat-at-least", statId: "ufc-finishes", value: 6 }] },
      { id: "submission-threat", label: "Submission Threat", rules: [{ kind: "stat-at-least", statId: "ufc-submission-wins", value: 3 }] },
      { id: "wild-card", label: "Wild Card", rules: [{ kind: "any" }] },
    ],
  },
];

const UFC_CHAMPIONSHIP_WIN_TYPES = new Set([
  "normal",
  "interim",
  "vacant-undisputed",
  "second-division-undisputed",
  "vacant-second-division",
]);
const rankingInputBySlug = new Map(
  canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter]),
);
const playFighterById = new Map(playFighters.map((fighter) => [fighter.id, fighter]));

function rowMap(rows: readonly HitTheNumberStatRow[]) {
  return new Map(rows.map((row) => [row.fighterId, row]));
}

function valueFor(
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
  fighterId: string,
  statId: HitTheNumberStatId,
) {
  return rowsById.get(fighterId)?.values[statId] ?? -1;
}

function fighterWonUfcTitle(fighterId: string) {
  const input = rankingInputBySlug.get(fighterId);
  return input?.facts.fights.some(
    (fight) => fight.officialResult === "win" && UFC_CHAMPIONSHIP_WIN_TYPES.has(fight.championshipType),
  ) ?? false;
}

function normalizedDivision(value: string) {
  return value.trim().toLowerCase();
}

function fighterMatchesRule(
  fighter: PlayFighter,
  rule: HitTheNumberConstraintRule,
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
) {
  switch (rule.kind) {
    case "any":
      return true;
    case "division":
      return fighter.divisions.some(
        (division) => normalizedDivision(division) === normalizedDivision(rule.division),
      );
    case "champion":
      return fighterWonUfcTitle(fighter.id) === rule.value;
    case "ufc-fights-at-least":
      return (rankingInputBySlug.get(fighter.id)?.facts.fights.length ?? 0) >= rule.count;
    case "stat-at-least":
      return valueFor(rowsById, fighter.id, rule.statId) >= rule.value;
  }
}

function fighterMatchesRules(
  fighter: PlayFighter,
  rules: readonly HitTheNumberConstraintRule[],
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
) {
  return rules.every((rule) => fighterMatchesRule(fighter, rule, rowsById));
}

export function hitTheNumberSlotAcceptsFighter(
  slot: HitTheNumberSlotDefinition,
  fighterId: string,
  statRows: readonly HitTheNumberStatRow[] = hitTheNumberStatRows,
) {
  const fighter = playFighterById.get(fighterId);
  if (!fighter) return false;
  return fighterMatchesRules(fighter, slot.rules, rowMap(statRows));
}

function weightedValue<T>(rows: readonly { value: T; weight: number }[], random: () => number): T {
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  let cursor = random() * totalWeight;
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor < 0) return row.value;
  }
  return rows[rows.length - 1]!.value;
}

function generatedPickOptions(
  maximumPicks: number,
  boardType: HitTheNumberBoardType,
  eligibleCount: number,
) {
  return HIT_THE_NUMBER_GENERATION_PROFILE.picks.filter(
    (row) => row.value <= maximumPicks
      && (
        boardType === "open-roster"
        || eligibleCount >= hitTheNumberRandomPoolSize(row.value)
      ),
  );
}

function generatedPickCount(
  maximumPicks: number,
  boardType: HitTheNumberBoardType,
  eligibleCount: number,
  random: () => number,
) {
  const options = generatedPickOptions(maximumPicks, boardType, eligibleCount);
  return options.length ? weightedValue(options, random) : null;
}

function generatedSolution(
  fighters: readonly PlayFighter[],
  statId: HitTheNumberStatId,
  pickCount: number,
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
  random: () => number,
) {
  const positive = fighters.filter((fighter) => valueFor(rowsById, fighter.id, statId) > 0);
  if (positive.length < pickCount) return null;
  return shuffleLineup(positive, random).slice(0, pickCount).map((fighter) => fighter.id);
}

function slotSolution(
  slots: readonly HitTheNumberSlotDefinition[],
  fighters: readonly PlayFighter[],
  statId: HitTheNumberStatId,
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
  random: () => number,
) {
  const candidateLists = slots.map((slot) => shuffleLineup(
    fighters.filter(
      (fighter) => valueFor(rowsById, fighter.id, statId) > 0
        && fighterMatchesRules(fighter, slot.rules, rowsById),
    ),
    random,
  ));
  if (candidateLists.some((candidates) => candidates.length === 0)) return null;

  const order = candidateLists
    .map((candidates, index) => ({ index, size: candidates.length }))
    .sort((left, right) => left.size - right.size || left.index - right.index);
  const assigned = new Array<string>(slots.length);
  const used = new Set<string>();

  function visit(orderIndex: number): boolean {
    if (orderIndex === order.length) return true;
    const slotIndex = order[orderIndex]!.index;
    for (const fighter of candidateLists[slotIndex]!) {
      if (used.has(fighter.id)) continue;
      used.add(fighter.id);
      assigned[slotIndex] = fighter.id;
      if (visit(orderIndex + 1)) return true;
      used.delete(fighter.id);
    }
    return false;
  }

  return visit(0) ? assigned : null;
}

function selectionCanFillSlots(
  slots: readonly HitTheNumberSlotDefinition[],
  fighters: readonly PlayFighter[],
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
) {
  if (fighters.length !== slots.length) return false;
  return slots.every((slot, index) => fighterMatchesRules(fighters[index]!, slot.rules, rowsById));
}

function formatSetup(
  formatId: HitTheNumberFormatId,
  definition?: HitTheNumberThemeDefinition | HitTheNumberSlotSetDefinition,
): HitTheNumberFormatSetup {
  if (formatId === "classic") {
    return {
      formatId,
      label: "Classic",
      configurationId: null,
      configurationLabel: null,
      rules: [],
      slots: [],
    };
  }
  if (formatId === "themed-lineup") {
    const theme = definition as HitTheNumberThemeDefinition;
    return {
      formatId,
      label: "Themed Lineup",
      configurationId: theme.id,
      configurationLabel: theme.label,
      rules: theme.rules,
      slots: [],
    };
  }
  const slotSet = definition as HitTheNumberSlotSetDefinition;
  return {
    formatId,
    label: formatId === "one-from-each" ? "One From Each" : "Build the Team",
    configurationId: slotSet.id,
    configurationLabel: slotSet.label,
    rules: [],
    slots: slotSet.slots,
  };
}

function slotEligibleFighters(
  slotSet: HitTheNumberSlotSetDefinition,
  baseEligible: readonly PlayFighter[],
  rowsById: ReadonlyMap<string, HitTheNumberStatRow>,
) {
  return baseEligible.filter((fighter) => (
    slotSet.slots.some((slot) => fighterMatchesRules(fighter, slot.rules, rowsById))
  ));
}

function fighterPool(
  boardType: HitTheNumberBoardType,
  eligible: readonly PlayFighter[],
  solutionFighterIds: readonly string[],
  random: () => number,
) {
  if (boardType === "open-roster") return eligible.map((fighter) => fighter.id);
  const poolSize = hitTheNumberRandomPoolSize(solutionFighterIds.length);
  if (eligible.length < poolSize) {
    throw new Error(`Hit the Number format needs ${poolSize} eligible fighters to preserve decoys.`);
  }
  const solutionSet = new Set(solutionFighterIds);
  const extras = shuffleLineup(
    eligible.filter((fighter) => !solutionSet.has(fighter.id)),
    random,
  ).slice(0, poolSize - solutionFighterIds.length);
  return shuffleLineup(
    [...solutionFighterIds, ...extras.map((fighter) => fighter.id)],
    random,
  );
}

function buildSpecialPlan(
  formatId: Exclude<HitTheNumberFormatId, "classic">,
  statId: HitTheNumberStatId,
  options: CreateHitTheNumberFormatPlanOptions,
  random: () => number,
): HitTheNumberFormatPlan | null {
  const statRows = options.statRows ?? hitTheNumberStatRows;
  const rowsById = rowMap(statRows);
  const baseEligible = hitTheNumberEligibleFighters(statId, {}, statRows);

  if (formatId === "themed-lineup") {
    const viableThemes = HIT_THE_NUMBER_THEME_CATALOG.filter((theme) => {
      const eligible = baseEligible.filter((fighter) => fighterMatchesRules(fighter, theme.rules, rowsById));
      const positiveCount = eligible.filter(
        (fighter) => valueFor(rowsById, fighter.id, statId) > 0,
      ).length;
      return generatedPickOptions(
        Math.min(HIT_THE_NUMBER_MAX_PICKS, positiveCount),
        options.boardType,
        eligible.length,
      ).length > 0;
    });
    if (!viableThemes.length) return null;
    const theme = viableThemes[Math.floor(random() * viableThemes.length)]!;
    const eligible = baseEligible.filter((fighter) => fighterMatchesRules(fighter, theme.rules, rowsById));
    const positiveCount = eligible.filter((fighter) => valueFor(rowsById, fighter.id, statId) > 0).length;
    const pickCount = generatedPickCount(
      Math.min(HIT_THE_NUMBER_MAX_PICKS, positiveCount),
      options.boardType,
      eligible.length,
      random,
    );
    if (pickCount == null) return null;
    const solutionFighterIds = generatedSolution(eligible, statId, pickCount, rowsById, random);
    if (!solutionFighterIds) return null;
    return {
      boardType: options.boardType,
      statId,
      target: solutionFighterIds.reduce((sum, fighterId) => sum + valueFor(rowsById, fighterId, statId), 0),
      pickCount,
      fighterIds: fighterPool(options.boardType, eligible, solutionFighterIds, random),
      solutionFighterIds,
      format: formatSetup(formatId, theme),
    };
  }

  const catalog = formatId === "one-from-each"
    ? HIT_THE_NUMBER_ONE_FROM_EACH_CATALOG
    : HIT_THE_NUMBER_BUILD_TEAM_CATALOG;
  const viabilityRandom = () => 0.5;
  const viableSets = catalog.filter((slotSet) => {
    if (slotSolution(slotSet.slots, baseEligible, statId, rowsById, viabilityRandom) == null) return false;
    if (options.boardType === "open-roster") return true;
    return slotEligibleFighters(slotSet, baseEligible, rowsById).length
      >= hitTheNumberRandomPoolSize(slotSet.slots.length);
  });
  if (!viableSets.length) return null;
  const slotSet = viableSets[Math.floor(random() * viableSets.length)]!;
  const solutionFighterIds = slotSolution(slotSet.slots, baseEligible, statId, rowsById, random);
  if (!solutionFighterIds) return null;
  const eligible = slotEligibleFighters(slotSet, baseEligible, rowsById);
  return {
    boardType: options.boardType,
    statId,
    target: solutionFighterIds.reduce((sum, fighterId) => sum + valueFor(rowsById, fighterId, statId), 0),
    pickCount: slotSet.slots.length,
    fighterIds: fighterPool(options.boardType, eligible, solutionFighterIds, random),
    solutionFighterIds,
    format: formatSetup(formatId, slotSet),
  };
}

export function createHitTheNumberFormatPlan(
  options: CreateHitTheNumberFormatPlanOptions,
): HitTheNumberFormatPlan {
  const random = seededLineupRandom("hit-the-number-format-plan", options.seed, options.boardType);
  const formatId = weightedValue(HIT_THE_NUMBER_FORMAT_GENERATION_PROFILE.formats, random);

  if (formatId === "classic") {
    const board = createGeneratedHitTheNumberBoard(options);
    return {
      boardType: options.boardType,
      statId: board.publicSetup.statId,
      target: board.publicSetup.target,
      pickCount: board.publicSetup.pickCount,
      fighterIds: [...board.publicSetup.fighterIds],
      solutionFighterIds: [...board.privateSetup.solutionFighterIds],
      format: formatSetup("classic"),
    };
  }

  const firstStat = weightedValue(HIT_THE_NUMBER_GENERATION_PROFILE.stats, random);
  const remainingStats = shuffleLineup(
    HIT_THE_NUMBER_GENERATION_PROFILE.stats.map((row) => row.value).filter((statId) => statId !== firstStat),
    random,
  );
  for (const statId of [firstStat, ...remainingStats]) {
    const plan = buildSpecialPlan(formatId, statId, options, random);
    if (plan) return plan;
  }
  throw new Error(`Hit the Number ${formatId} has no verified solvable format plan.`);
}

export function hitTheNumberFormatSelectionSatisfies(
  format: HitTheNumberFormatSetup,
  selectedFighterIds: readonly string[],
  statRows: readonly HitTheNumberStatRow[] = hitTheNumberStatRows,
) {
  if (format.formatId === "classic") return true;
  if (new Set(selectedFighterIds).size !== selectedFighterIds.length) return false;
  const rowsById = rowMap(statRows);
  const fighters = selectedFighterIds.map((fighterId) => playFighterById.get(fighterId));
  if (fighters.some((fighter) => !fighter)) return false;
  const resolved = fighters as PlayFighter[];

  if (format.formatId === "themed-lineup") {
    return resolved.every((fighter) => fighterMatchesRules(fighter, format.rules, rowsById));
  }
  return selectionCanFillSlots(format.slots, resolved, rowsById);
}

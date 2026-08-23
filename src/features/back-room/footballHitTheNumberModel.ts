import {
  HIT_THE_NUMBER_GENERATION_PROFILE,
  hitTheNumberScore,
  type HitTheNumberResultStatus,
} from "../play/hitTheNumberEngine";
import {
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  formatFootballFindLeaderFact,
  getFootballFindLeaderFact,
  type FootballFindLeaderMetricId,
} from "./footballFactualStats";

export const FOOTBALL_HIT_THE_NUMBER_GAME_ID = "football-hit-the-number";
export const FOOTBALL_HIT_THE_NUMBER_VERSION = "football-hit-the-number-v2" as const;
export const FOOTBALL_HIT_THE_NUMBER_MIN_PICKS = 4;
export const FOOTBALL_HIT_THE_NUMBER_MAX_PICKS = 7;
export const FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE = "open-roster" as const;

export type FootballHitTheNumberFormatId =
  | "classic"
  | "themed-lineup"
  | "one-from-each"
  | "build-the-team";

export type FootballHitTheNumberBoardType = "open-roster" | "random-pool";
export type FootballHitTheNumberLeague = "NFL" | "CFB";
export type FootballHitTheNumberDomainId = "volume" | "efficiency" | "dominance";
type FootballHitTheNumberSubjectGroup = "qb" | "rb" | "cfb";

export interface FootballHitTheNumberSubject {
  id: string;
  name: string;
  subtitle: string;
  group: FootballHitTheNumberSubjectGroup;
  era: string;
}

export interface FootballHitTheNumberSlot {
  id: string;
  label: string;
  accepts: (subject: FootballHitTheNumberSubject, value: number) => boolean;
}

interface FootballHitTheNumberMetricBoard {
  metricId: FootballFindLeaderMetricId;
  league: FootballHitTheNumberLeague;
  group: FootballHitTheNumberSubjectGroup;
  boardLabel: string;
  themeLabel: string;
}

interface FootballHitTheNumberDomain {
  id: FootballHitTheNumberDomainId;
  metrics: readonly FootballHitTheNumberMetricBoard[];
}

export interface FootballHitTheNumberPlan {
  version: typeof FOOTBALL_HIT_THE_NUMBER_VERSION;
  seed: string;
  boardType: FootballHitTheNumberBoardType;
  league: FootballHitTheNumberLeague;
  formatId: FootballHitTheNumberFormatId;
  formatLabel: string;
  configurationLabel: string | null;
  domainId: FootballHitTheNumberDomainId;
  domainLabel: string;
  metricId: FootballFindLeaderMetricId;
  metricLabel: string;
  target: number;
  pickCount: number;
  subjectIds: string[];
  solutionSubjectIds: string[];
  slots: readonly Pick<FootballHitTheNumberSlot, "id" | "label">[];
}

export interface FootballHitTheNumberRun {
  plan: FootballHitTheNumberPlan;
  identity: PlayLineupIdentity;
}

export interface FootballHitTheNumberResult {
  status: HitTheNumberResultStatus;
  target: number;
  total: number;
  distance: number;
  score: number;
  selections: Array<{ subjectId: string; value: number }>;
}

export interface FootballHitTheNumberQualityResult {
  passes: boolean;
  legalSelectionCount: number;
  hasGoodUnder: boolean;
  hasMiddlingOutcome: boolean;
  hasMeaningfulBust: boolean;
}

export const FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE = [
  { value: "classic", weight: 40 },
  { value: "themed-lineup", weight: 25 },
  { value: "one-from-each", weight: 20 },
  { value: "build-the-team", weight: 15 },
] as const satisfies readonly { value: FootballHitTheNumberFormatId; weight: number }[];

export const FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE = HIT_THE_NUMBER_GENERATION_PROFILE.picks;

const qb = (id: string, name: string, era: string): FootballHitTheNumberSubject => ({
  id,
  name,
  subtitle: era,
  group: "qb",
  era,
});
const rb = (id: string, name: string, era: string): FootballHitTheNumberSubject => ({
  id,
  name,
  subtitle: era,
  group: "rb",
  era,
});
const cfb = (id: string, name: string, era: string): FootballHitTheNumberSubject => ({
  id,
  name,
  subtitle: `${id.slice(0, 4)} national champion`,
  group: "cfb",
  era,
});

const quarterbackSubjects = [
  qb("dan-marino", "Dan Marino", "1980s icon"),
  qb("john-elway", "John Elway", "1980s icon"),
  qb("warren-moon", "Warren Moon", "1980s icon"),
  qb("brett-favre", "Brett Favre", "1990s icon"),
  qb("steve-young", "Steve Young", "1990s icon"),
  qb("troy-aikman", "Troy Aikman", "1990s icon"),
  qb("peyton-manning", "Peyton Manning", "2000s icon"),
  qb("drew-brees", "Drew Brees", "2000s icon"),
  qb("kurt-warner", "Kurt Warner", "2000s icon"),
  qb("ben-roethlisberger", "Ben Roethlisberger", "2010s icon"),
  qb("matt-ryan", "Matt Ryan", "2010s icon"),
  qb("eli-manning", "Eli Manning", "2010s icon"),
] as const;

const runningBackSubjects = [
  rb("jim-brown", "Jim Brown", "1960s/70s icon"),
  rb("walter-payton", "Walter Payton", "1960s/70s icon"),
  rb("tony-dorsett", "Tony Dorsett", "1960s/70s icon"),
  rb("barry-sanders", "Barry Sanders", "1980s/90s icon"),
  rb("eric-dickerson", "Eric Dickerson", "1980s/90s icon"),
  rb("emmitt-smith", "Emmitt Smith", "1980s/90s icon"),
  rb("curtis-martin", "Curtis Martin", "1990s/2000s icon"),
  rb("jerome-bettis", "Jerome Bettis", "1990s/2000s icon"),
  rb("marshall-faulk", "Marshall Faulk", "1990s/2000s icon"),
  rb("ladainian-tomlinson", "LaDainian Tomlinson", "2000s/2010s icon"),
  rb("adrian-peterson", "Adrian Peterson", "2000s/2010s icon"),
  rb("frank-gore", "Frank Gore", "2000s/2010s icon"),
] as const;

const collegeSubjects = [
  cfb("1995-nebraska", "1995 Nebraska", "pre-BCS"),
  cfb("2001-miami", "2001 Miami", "pre-BCS/early BCS"),
  cfb("2005-texas", "2005 Texas", "BCS 2005-10"),
  cfb("2008-florida", "2008 Florida", "BCS 2005-10"),
  cfb("2010-auburn", "2010 Auburn", "BCS 2005-10"),
  cfb("2013-florida-state", "2013 Florida State", "late BCS/early CFP"),
  cfb("2014-ohio-state", "2014 Ohio State", "late BCS/early CFP"),
  cfb("2018-clemson", "2018 Clemson", "late BCS/early CFP"),
  cfb("2019-lsu", "2019 LSU", "modern CFP"),
  cfb("2020-alabama", "2020 Alabama", "modern CFP"),
  cfb("2022-georgia", "2022 Georgia", "modern CFP"),
] as const;

export const footballHitTheNumberSubjects: readonly FootballHitTheNumberSubject[] = [
  ...quarterbackSubjects,
  ...runningBackSubjects,
  ...collegeSubjects,
];
const subjectById = new Map(footballHitTheNumberSubjects.map((subject) => [subject.id, subject]));

const metric = (
  metricId: FootballFindLeaderMetricId,
  league: FootballHitTheNumberLeague,
  group: FootballHitTheNumberSubjectGroup,
  boardLabel: string,
  themeLabel: string,
): FootballHitTheNumberMetricBoard => ({ metricId, league, group, boardLabel, themeLabel });

const domains: readonly FootballHitTheNumberDomain[] = [
  {
    id: "volume",
    metrics: [
      metric("qb-passing-yards", "NFL", "qb", "NFL QB Career Passing Yards", "Post-1990 Passing Legends"),
      metric("rb-rushing-yards", "NFL", "rb", "NFL RB Career Rushing Yards", "Modern Rushing Legends"),
      metric("rb-scrimmage-yards", "NFL", "rb", "NFL RB Career Scrimmage Yards", "Modern Scrimmage Legends"),
      metric("cfb-points-for", "CFB", "cfb", "Champion-Season Points Scored", "BCS + CFP Champions"),
      metric("cfb-points-against", "CFB", "cfb", "Champion-Season Points Allowed", "BCS + CFP Champions"),
      metric("cfb-point-differential", "CFB", "cfb", "Champion-Season Point Differential", "BCS + CFP Champions"),
    ],
  },
  {
    id: "efficiency",
    metrics: [
      metric("qb-passer-rating", "NFL", "qb", "NFL QB Career Passer Rating", "Post-1990 Passing Legends"),
      metric("qb-completion-pct", "NFL", "qb", "NFL QB Career Completion Rate", "Post-1990 Passing Legends"),
      metric("qb-td-int-ratio", "NFL", "qb", "NFL QB Career TD:INT Ratio", "Post-1990 Passing Legends"),
      metric("cfb-points-per-game", "CFB", "cfb", "Champion-Season Points Per Game", "BCS + CFP Champions"),
      metric("cfb-opponent-points-per-game", "CFB", "cfb", "Champion-Season Opponent PPG", "BCS + CFP Champions"),
      metric("cfb-scoring-margin-per-game", "CFB", "cfb", "Champion-Season Scoring Margin", "BCS + CFP Champions"),
    ],
  },
  {
    id: "dominance",
    metrics: [
      metric("qb-passing-touchdowns", "NFL", "qb", "NFL QB Career Passing TD", "Post-1990 Passing Legends"),
      metric("rb-rushing-touchdowns", "NFL", "rb", "NFL RB Career Rushing TD", "Modern Rushing Legends"),
      metric("rb-scrimmage-touchdowns", "NFL", "rb", "NFL RB Career Scrimmage TD", "Modern Scoring Legends"),
      metric("cfb-srs", "CFB", "cfb", "Champion-Season SRS", "BCS + CFP Champions"),
      metric("cfb-sos", "CFB", "cfb", "Champion-Season Strength of Schedule", "BCS + CFP Champions"),
      metric("cfb-points-ratio", "CFB", "cfb", "Champion-Season Points For : Against", "BCS + CFP Champions"),
    ],
  },
] as const;

export const FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG = domains.flatMap((domain) =>
  domain.metrics.map((row) => ({
    domainId: domain.id,
    metricId: row.metricId,
    league: row.league,
    boardLabel: row.boardLabel,
  })),
);

const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const metricBoardById = new Map(domains.flatMap((domain) => domain.metrics).map((row) => [row.metricId, row]));

function weightedValue<T>(rows: readonly { value: T; weight: number }[], random: () => number): T {
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  let cursor = random() * total;
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor < 0) return row.value;
  }
  return rows[rows.length - 1]!.value;
}

function valueFor(subjectId: string, metricId: FootballFindLeaderMetricId) {
  const resolved = getFootballFindLeaderFact(subjectId, metricId);
  if (!resolved) throw new Error(`Missing canonical Football fact ${metricId} for ${subjectId}.`);
  return resolved.value;
}

function subjectFor(subjectId: string) {
  const subject = subjectById.get(subjectId);
  if (!subject) throw new Error(`Unknown Football Hit the Number subject: ${subjectId}`);
  return subject;
}

function subjectsFor(group: FootballHitTheNumberSubjectGroup) {
  return footballHitTheNumberSubjects.filter((subject) => subject.group === group);
}

function metricBoardFor(metricId: FootballFindLeaderMetricId) {
  const board = metricBoardById.get(metricId);
  if (!board) throw new Error(`Unknown Football Hit the Number metric: ${metricId}`);
  return board;
}

function eraSlotsFor(group: FootballHitTheNumberSubjectGroup): readonly FootballHitTheNumberSlot[] {
  const any = (subject: FootballHitTheNumberSubject) => subject.group === group;
  if (group === "qb") {
    return [
      { id: "1980s", label: "1980s Icon", accepts: (subject) => subject.era === "1980s icon" },
      { id: "1990s", label: "1990s Icon", accepts: (subject) => subject.era === "1990s icon" },
      { id: "2000s", label: "2000s Icon", accepts: (subject) => subject.era === "2000s icon" },
      { id: "2010s", label: "2010s Icon", accepts: (subject) => subject.era === "2010s icon" },
      { id: "wild-card", label: "Wild Card", accepts: any },
    ];
  }
  if (group === "rb") {
    return [
      { id: "60s-70s", label: "1960s/70s Icon", accepts: (subject) => subject.era === "1960s/70s icon" },
      { id: "80s-90s", label: "1980s/90s Icon", accepts: (subject) => subject.era === "1980s/90s icon" },
      { id: "90s-00s", label: "1990s/2000s Icon", accepts: (subject) => subject.era === "1990s/2000s icon" },
      { id: "00s-10s", label: "2000s/2010s Icon", accepts: (subject) => subject.era === "2000s/2010s icon" },
      { id: "wild-card", label: "Wild Card", accepts: any },
    ];
  }
  return [
    { id: "early", label: "1990s / Early BCS", accepts: (subject) => subject.id === "1995-nebraska" || subject.id === "2001-miami" },
    { id: "bcs", label: "BCS 2005–10", accepts: (subject) => subject.era === "BCS 2005-10" },
    { id: "bridge", label: "Late BCS / Early CFP", accepts: (subject) => subject.era === "late BCS/early CFP" },
    { id: "modern", label: "Modern CFP", accepts: (subject) => subject.era === "modern CFP" },
    { id: "wild-card", label: "Wild Card", accepts: any },
  ];
}

function buildSlotsFor(
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFindLeaderMetricId,
): readonly FootballHitTheNumberSlot[] {
  const ordered = [...subjects].sort((left, right) =>
    valueFor(right.id, metricId) - valueFor(left.id, metricId) || left.id.localeCompare(right.id));
  const groups = Array.from({ length: 4 }, (_, index) => {
    const start = Math.floor(index * ordered.length / 4);
    const end = Math.floor((index + 1) * ordered.length / 4);
    return new Set(ordered.slice(start, end).map((subject) => subject.id));
  });
  const labels = ["Elite Tier", "High Tier", "Middle Tier", "Value Tier"] as const;
  return [
    ...groups.map((ids, index) => ({
      id: `tier-${index + 1}`,
      label: labels[index]!,
      accepts: (subject: FootballHitTheNumberSubject) => ids.has(subject.id),
    })),
    { id: "wild-card", label: "Wild Card", accepts: () => true },
  ];
}

function themeSubjects(board: FootballHitTheNumberMetricBoard) {
  const subjects = subjectsFor(board.group);
  if (board.group === "qb") return subjects.filter((subject) => subject.era !== "1980s icon");
  if (board.group === "rb") return subjects.filter((subject) => subject.era !== "1960s/70s icon");
  return subjects.filter((subject) => subject.id !== "1995-nebraska");
}

function assignSlots(
  slots: readonly FootballHitTheNumberSlot[],
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFindLeaderMetricId,
) {
  if (subjects.length !== slots.length) return false;
  const used = new Set<number>();

  function visit(slotIndex: number): boolean {
    if (slotIndex === slots.length) return true;
    const slot = slots[slotIndex]!;
    for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
      if (used.has(subjectIndex)) continue;
      const subject = subjects[subjectIndex]!;
      if (!slot.accepts(subject, valueFor(subject.id, metricId))) continue;
      used.add(subjectIndex);
      if (visit(slotIndex + 1)) return true;
      used.delete(subjectIndex);
    }
    return false;
  }

  return visit(0);
}

function slotSolution(
  slots: readonly FootballHitTheNumberSlot[],
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFindLeaderMetricId,
  random: () => number,
) {
  const candidates = slots.map((slot) => shuffleLineup(
    subjects.filter((subject) => slot.accepts(subject, valueFor(subject.id, metricId))),
    random,
  ));
  if (candidates.some((rows) => rows.length === 0)) return null;
  const used = new Set<string>();
  const assigned: FootballHitTheNumberSubject[] = new Array(slots.length);
  const order = candidates
    .map((rows, index) => ({ index, size: rows.length }))
    .sort((left, right) => left.size - right.size || left.index - right.index);

  function visit(orderIndex: number): boolean {
    if (orderIndex === order.length) return true;
    const slotIndex = order[orderIndex]!.index;
    for (const subject of candidates[slotIndex]!) {
      if (used.has(subject.id)) continue;
      used.add(subject.id);
      assigned[slotIndex] = subject;
      if (visit(orderIndex + 1)) return true;
      used.delete(subject.id);
    }
    return false;
  }

  return visit(0) ? assigned : null;
}

function combinations<T>(items: readonly T[], count: number, visit: (selection: readonly T[]) => void) {
  const selected: T[] = [];
  function walk(start: number) {
    if (selected.length === count) {
      visit([...selected]);
      return;
    }
    const remaining = count - selected.length;
    for (let index = start; index <= items.length - remaining; index += 1) {
      selected.push(items[index]!);
      walk(index + 1);
      selected.pop();
    }
  }
  walk(0);
}

export function footballHitTheNumberRandomPoolSize(pickCount: number) {
  if (!Number.isInteger(pickCount) || pickCount < FOOTBALL_HIT_THE_NUMBER_MIN_PICKS || pickCount > FOOTBALL_HIT_THE_NUMBER_MAX_PICKS) {
    throw new Error(`Football Hit the Number pick count must be ${FOOTBALL_HIT_THE_NUMBER_MIN_PICKS}-${FOOTBALL_HIT_THE_NUMBER_MAX_PICKS}.`);
  }
  return Math.min(12, pickCount * 2);
}

function slotsForPlan(plan: FootballHitTheNumberPlan) {
  const board = metricBoardFor(plan.metricId);
  const subjects = subjectsFor(board.group);
  if (plan.formatId === "one-from-each") return eraSlotsFor(board.group);
  if (plan.formatId === "build-the-team") return buildSlotsFor(subjects, plan.metricId);
  return [];
}

export function footballHitTheNumberSelectionSatisfies(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (selectedSubjectIds.length !== plan.pickCount) return false;
  if (new Set(selectedSubjectIds).size !== selectedSubjectIds.length) return false;
  if (selectedSubjectIds.some((subjectId) => !plan.subjectIds.includes(subjectId))) return false;
  if (plan.formatId === "classic" || plan.formatId === "themed-lineup") return true;
  return assignSlots(slotsForPlan(plan), selectedSubjectIds.map(subjectFor), plan.metricId);
}

export function footballHitTheNumberPlanQuality(plan: FootballHitTheNumberPlan): FootballHitTheNumberQualityResult {
  let legalSelectionCount = 0;
  let hasGoodUnder = false;
  let hasMiddlingOutcome = false;
  let hasMeaningfulBust = false;

  combinations(plan.subjectIds, plan.pickCount, (subjectIds) => {
    if (!footballHitTheNumberSelectionSatisfies(plan, subjectIds)) return;
    const total = subjectIds.reduce((sum, subjectId) => sum + valueFor(subjectId, plan.metricId), 0);
    if (Math.abs(total - plan.target) < 1e-9) return;
    legalSelectionCount += 1;
    const status: HitTheNumberResultStatus = total > plan.target ? "bust" : "under";
    const score = hitTheNumberScore({
      status,
      target: plan.target,
      distance: Math.abs(plan.target - total),
      pickCount: plan.pickCount,
    });
    if (status === "under" && score >= 90) hasGoodUnder = true;
    if (
      (status === "under" && score >= 75 && score <= 89)
      || (status === "bust" && score >= 66)
    ) hasMiddlingOutcome = true;
    if (status === "bust") hasMeaningfulBust = true;
  });

  return {
    passes: legalSelectionCount >= 6 && hasGoodUnder && hasMiddlingOutcome && hasMeaningfulBust,
    legalSelectionCount,
    hasGoodUnder,
    hasMiddlingOutcome,
    hasMeaningfulBust,
  };
}

function formatLabel(formatId: FootballHitTheNumberFormatId) {
  if (formatId === "classic") return "Classic";
  if (formatId === "themed-lineup") return "Themed Lineup";
  if (formatId === "one-from-each") return "One From Each";
  return "Build the Team";
}

function pickCountFor(formatId: FootballHitTheNumberFormatId, random: () => number) {
  if (formatId === "one-from-each" || formatId === "build-the-team") return 5;
  return weightedValue(FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE, random);
}

function buildCandidate(
  seed: string,
  boardType: FootballHitTheNumberBoardType,
  formatId: FootballHitTheNumberFormatId,
  domain: FootballHitTheNumberDomain,
  metricBoard: FootballHitTheNumberMetricBoard,
  pickCount: number,
  attempt: number,
): FootballHitTheNumberPlan | null {
  const random = seededLineupRandom(
    FOOTBALL_HIT_THE_NUMBER_GAME_ID,
    "candidate",
    seed,
    boardType,
    formatId,
    domain.id,
    metricBoard.metricId,
    pickCount,
    attempt,
  );
  const metricId = metricBoard.metricId;
  let eligible = subjectsFor(metricBoard.group);
  let solution: FootballHitTheNumberSubject[] | null = null;
  let slots: readonly FootballHitTheNumberSlot[] = [];
  let configurationLabel: string | null = null;

  if (formatId === "themed-lineup") {
    eligible = themeSubjects(metricBoard);
    configurationLabel = metricBoard.themeLabel;
    solution = shuffleLineup(eligible, random).slice(0, pickCount);
  } else if (formatId === "one-from-each") {
    slots = eraSlotsFor(metricBoard.group);
    configurationLabel = "One from every era + wild card";
    solution = slotSolution(slots, eligible, metricId, random);
  } else if (formatId === "build-the-team") {
    slots = buildSlotsFor(eligible, metricId);
    configurationLabel = "Four production tiers + wild card";
    solution = slotSolution(slots, eligible, metricId, random);
  } else {
    solution = shuffleLineup(eligible, random).slice(0, pickCount);
  }

  if (!solution || solution.length !== pickCount) return null;
  const solutionIds = solution.map((subject) => subject.id);
  const solutionSet = new Set(solutionIds);
  let subjectIds: string[];

  if (boardType === "open-roster") {
    subjectIds = eligible.map((subject) => subject.id);
  } else {
    const poolSize = footballHitTheNumberRandomPoolSize(pickCount);
    const extras = shuffleLineup(
      eligible.filter((subject) => !solutionSet.has(subject.id)),
      random,
    ).slice(0, poolSize - solutionIds.length);
    if (extras.length !== poolSize - solutionIds.length) return null;
    subjectIds = shuffleLineup([...solution, ...extras], random).map((subject) => subject.id);
  }

  const target = solutionIds.reduce((sum, subjectId) => sum + valueFor(subjectId, metricId), 0);
  const fact = getFootballFindLeaderFact(solutionIds[0]!, metricId);
  if (!fact) return null;

  return {
    version: FOOTBALL_HIT_THE_NUMBER_VERSION,
    seed,
    boardType,
    league: metricBoard.league,
    formatId,
    formatLabel: formatLabel(formatId),
    configurationLabel,
    domainId: domain.id,
    domainLabel: metricBoard.boardLabel,
    metricId,
    metricLabel: fact.definition.label,
    target,
    pickCount,
    subjectIds,
    solutionSubjectIds: solutionIds,
    slots: slots.map(({ id, label }) => ({ id, label })),
  };
}

export function createFootballHitTheNumberPlan(
  seed: string,
  boardType: FootballHitTheNumberBoardType = FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE,
): FootballHitTheNumberPlan {
  const choiceRandom = seededLineupRandom(FOOTBALL_HIT_THE_NUMBER_GAME_ID, "choice", seed, boardType);
  const formatId = weightedValue(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE, choiceRandom);
  const domain = domains[Math.floor(choiceRandom() * domains.length)]!;
  const league: FootballHitTheNumberLeague = choiceRandom() < 0.5 ? "NFL" : "CFB";
  const leagueMetrics = domain.metrics.filter((row) => row.league === league);
  const metricBoard = leagueMetrics[Math.floor(choiceRandom() * leagueMetrics.length)]!;
  const pickCount = pickCountFor(formatId, choiceRandom);

  for (let attempt = 0; attempt < 128; attempt += 1) {
    const candidate = buildCandidate(seed, boardType, formatId, domain, metricBoard, pickCount, attempt);
    if (candidate && footballHitTheNumberPlanQuality(candidate).passes) return candidate;
  }
  throw new Error(`Football Hit the Number could not build a balanced ${formatId} ${metricBoard.metricId} board.`);
}

function planSignature(plan: FootballHitTheNumberPlan) {
  const pool = plan.boardType === "random-pool" ? [...plan.subjectIds].sort().join(",") : "open";
  return [
    plan.domainId,
    plan.metricId,
    plan.formatId,
    plan.boardType,
    plan.pickCount,
    plan.target,
    pool,
  ].join("|");
}

export function createFootballHitTheNumberRun(
  boardType: FootballHitTheNumberBoardType = FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE,
): FootballHitTheNumberRun {
  const selected = selectReplayLineup({
    gameId: FOOTBALL_HIT_THE_NUMBER_GAME_ID,
    scopeId: boardType,
    lineupSize: 1,
    attempts: 12,
    build: (seed) => {
      const plan = createFootballHitTheNumberPlan(seed, boardType);
      return {
        value: plan,
        itemIds: [planSignature(plan)],
        fighterIds: boardType === "random-pool" ? plan.subjectIds : [],
      };
    },
  });
  return { plan: selected.value, identity: selected.identity };
}

export function gradeFootballHitTheNumberSelection(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
): FootballHitTheNumberResult {
  if (!footballHitTheNumberSelectionSatisfies(plan, selectedSubjectIds)) {
    throw new Error("Football Hit the Number selection does not satisfy this board.");
  }
  const selections = selectedSubjectIds.map((subjectId) => ({
    subjectId,
    value: valueFor(subjectId, plan.metricId),
  }));
  const total = selections.reduce((sum, selection) => sum + selection.value, 0);
  const distance = Math.abs(plan.target - total);
  const status: HitTheNumberResultStatus = distance < 1e-9
    ? "perfect"
    : total > plan.target
      ? "bust"
      : "under";
  return {
    status,
    target: plan.target,
    total,
    distance,
    score: hitTheNumberScore({ status, target: plan.target, distance, pickCount: plan.pickCount }),
    selections,
  };
}

export function getFootballHitTheNumberSubject(subjectId: string) {
  return subjectById.get(subjectId) ?? null;
}

export function formatFootballHitTheNumberValue(plan: FootballHitTheNumberPlan, value: number) {
  return formatFootballFindLeaderFact(plan.metricId, value);
}

export function footballHitTheNumberValue(subjectId: string, metricId: FootballFindLeaderMetricId) {
  return valueFor(subjectId, metricId);
}

export function getFootballHitTheNumberDomain(domainId: FootballHitTheNumberDomainId) {
  return domainById.get(domainId) ?? null;
}

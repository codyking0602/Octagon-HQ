import { hitTheNumberScore, type HitTheNumberResultStatus } from "../play/hitTheNumberEngine";
import {
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  formatFootballFact,
  getFootballFact,
  type FootballFactMetricId,
} from "./footballFactualStats";

export const FOOTBALL_HIT_THE_NUMBER_GAME_ID = "football-hit-the-number";
export const FOOTBALL_HIT_THE_NUMBER_VERSION = "football-hit-the-number-v1" as const;
export const FOOTBALL_HIT_THE_NUMBER_PICK_COUNT = 4;
export const FOOTBALL_HIT_THE_NUMBER_POOL_SIZE = 8;

export type FootballHitTheNumberFormatId =
  | "classic"
  | "themed-lineup"
  | "one-from-each"
  | "build-the-team";

export type FootballHitTheNumberDomainId =
  | "nfl-qb-passing"
  | "nfl-rb-rushing"
  | "cfb-champion-scoring";

export interface FootballHitTheNumberSubject {
  id: string;
  name: string;
  subtitle: string;
  domainId: FootballHitTheNumberDomainId;
  era: string;
}

export interface FootballHitTheNumberSlot {
  id: string;
  label: string;
  accepts: (subject: FootballHitTheNumberSubject, value: number) => boolean;
}

interface FootballHitTheNumberDomain {
  id: FootballHitTheNumberDomainId;
  label: string;
  metricId: FootballFactMetricId;
  subjects: readonly FootballHitTheNumberSubject[];
  theme: {
    id: string;
    label: string;
    subjectIds: readonly string[];
  };
  eraSlots: readonly FootballHitTheNumberSlot[];
  buildSlots: readonly FootballHitTheNumberSlot[];
}

export interface FootballHitTheNumberPlan {
  version: typeof FOOTBALL_HIT_THE_NUMBER_VERSION;
  seed: string;
  formatId: FootballHitTheNumberFormatId;
  formatLabel: string;
  configurationLabel: string | null;
  domainId: FootballHitTheNumberDomainId;
  domainLabel: string;
  metricId: FootballFactMetricId;
  metricLabel: string;
  target: number;
  pickCount: typeof FOOTBALL_HIT_THE_NUMBER_PICK_COUNT;
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

const qb = (
  id: string,
  name: string,
  era: string,
): FootballHitTheNumberSubject => ({ id, name, subtitle: era, domainId: "nfl-qb-passing", era });
const rb = (
  id: string,
  name: string,
  era: string,
): FootballHitTheNumberSubject => ({ id, name, subtitle: era, domainId: "nfl-rb-rushing", era });
const cfb = (
  id: string,
  name: string,
  era: string,
): FootballHitTheNumberSubject => ({ id, name, subtitle: `${id.slice(0, 4)} national champion`, domainId: "cfb-champion-scoring", era });

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

function eraSlot(id: string, label: string, era: string): FootballHitTheNumberSlot {
  return { id, label, accepts: (subject) => subject.era === era };
}

function rangeSlot(id: string, label: string, min: number, max = Number.POSITIVE_INFINITY): FootballHitTheNumberSlot {
  return { id, label, accepts: (_subject, value) => value >= min && value < max };
}

const domains: readonly FootballHitTheNumberDomain[] = [
  {
    id: "nfl-qb-passing",
    label: "NFL QB Careers",
    metricId: "nfl-career-passing-yards",
    subjects: quarterbackSubjects,
    theme: {
      id: "post-1990-passers",
      label: "Post-1990 Passing Legends",
      subjectIds: quarterbackSubjects.filter((subject) => subject.era !== "1980s icon").map((subject) => subject.id),
    },
    eraSlots: [
      eraSlot("1980s", "1980s Icon", "1980s icon"),
      eraSlot("1990s", "1990s Icon", "1990s icon"),
      eraSlot("2000s", "2000s Icon", "2000s icon"),
      eraSlot("2010s", "2010s Icon", "2010s icon"),
    ],
    buildSlots: [
      rangeSlot("70k", "70K+ Passer", 70000),
      rangeSlot("60-70k", "60K–70K Passer", 60000, 70000),
      rangeSlot("45-60k", "45K–60K Passer", 45000, 60000),
      rangeSlot("under-45k", "Under 45K Passer", 0, 45000),
    ],
  },
  {
    id: "nfl-rb-rushing",
    label: "NFL RB Careers",
    metricId: "nfl-career-rushing-yards",
    subjects: runningBackSubjects,
    theme: {
      id: "post-1989-rushers",
      label: "Modern Rushing Legends",
      subjectIds: runningBackSubjects.slice(3).map((subject) => subject.id),
    },
    eraSlots: [
      eraSlot("60s-70s", "1960s/70s Icon", "1960s/70s icon"),
      eraSlot("80s-90s", "1980s/90s Icon", "1980s/90s icon"),
      eraSlot("90s-00s", "1990s/2000s Icon", "1990s/2000s icon"),
      eraSlot("00s-10s", "2000s/2010s Icon", "2000s/2010s icon"),
    ],
    buildSlots: [
      rangeSlot("15k", "15K+ Rusher", 15000),
      rangeSlot("14-15k", "14K–15K Rusher", 14000, 15000),
      rangeSlot("13-14k", "13K–14K Rusher", 13000, 14000),
      rangeSlot("under-13k", "Under 13K Rusher", 0, 13000),
    ],
  },
  {
    id: "cfb-champion-scoring",
    label: "National-Champion Seasons",
    metricId: "cfb-team-points-per-game",
    subjects: collegeSubjects,
    theme: {
      id: "bcs-cfp-champions",
      label: "BCS + CFP Champions",
      subjectIds: collegeSubjects.filter((subject) => subject.id !== "1995-nebraska").map((subject) => subject.id),
    },
    eraSlots: [
      { id: "early", label: "1990s / Early BCS", accepts: (subject) => subject.id === "1995-nebraska" || subject.id === "2001-miami" },
      { id: "bcs", label: "BCS 2005–10", accepts: (subject) => subject.era === "BCS 2005-10" },
      { id: "bridge", label: "Late BCS / Early CFP", accepts: (subject) => subject.era === "late BCS/early CFP" },
      { id: "modern", label: "Modern CFP", accepts: (subject) => subject.era === "modern CFP" },
    ],
    buildSlots: [
      rangeSlot("50", "50+ PPG Offense", 50),
      rangeSlot("48-50", "48–50 PPG Offense", 48, 50),
      rangeSlot("43-48", "43–48 PPG Offense", 43, 48),
      rangeSlot("under-43", "Under 43 PPG Offense", 0, 43),
    ],
  },
] as const;

export const footballHitTheNumberSubjects: readonly FootballHitTheNumberSubject[] = domains.flatMap((domain) => domain.subjects);
const subjectById = new Map(footballHitTheNumberSubjects.map((subject) => [subject.id, subject]));
const domainById = new Map(domains.map((domain) => [domain.id, domain]));

function weightedValue<T>(rows: readonly { value: T; weight: number }[], random: () => number): T {
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  let cursor = random() * total;
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor < 0) return row.value;
  }
  return rows[rows.length - 1]!.value;
}

function valueFor(subjectId: string, metricId: FootballFactMetricId) {
  const resolved = getFootballFact(subjectId, metricId);
  if (!resolved) throw new Error(`Missing canonical Football fact ${metricId} for ${subjectId}.`);
  return resolved.fact.value;
}

function subjectFor(subjectId: string) {
  const subject = subjectById.get(subjectId);
  if (!subject) throw new Error(`Unknown Football Hit the Number subject: ${subjectId}`);
  return subject;
}

function domainFor(domainId: FootballHitTheNumberDomainId) {
  const domain = domainById.get(domainId);
  if (!domain) throw new Error(`Unknown Football Hit the Number domain: ${domainId}`);
  return domain;
}

function assignSlots(
  slots: readonly FootballHitTheNumberSlot[],
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
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
  metricId: FootballFactMetricId,
  random: () => number,
) {
  const candidates = slots.map((slot) => shuffleLineup(
    subjects.filter((subject) => slot.accepts(subject, valueFor(subject.id, metricId))),
    random,
  ));
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

export function footballHitTheNumberSelectionSatisfies(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (selectedSubjectIds.length !== plan.pickCount) return false;
  if (new Set(selectedSubjectIds).size !== selectedSubjectIds.length) return false;
  if (selectedSubjectIds.some((subjectId) => !plan.subjectIds.includes(subjectId))) return false;
  if (plan.formatId === "classic" || plan.formatId === "themed-lineup") return true;
  const domain = domainFor(plan.domainId);
  const slots = plan.formatId === "one-from-each" ? domain.eraSlots : domain.buildSlots;
  return assignSlots(slots, selectedSubjectIds.map(subjectFor), plan.metricId);
}

export function footballHitTheNumberPlanQuality(plan: FootballHitTheNumberPlan): FootballHitTheNumberQualityResult {
  let legalSelectionCount = 0;
  let hasGoodUnder = false;
  let hasMiddlingOutcome = false;
  let hasMeaningfulBust = false;

  combinations(plan.subjectIds, plan.pickCount, (subjectIds) => {
    if (!footballHitTheNumberSelectionSatisfies(plan, subjectIds)) return;
    const total = subjectIds.reduce((sum, subjectId) => sum + valueFor(subjectId, plan.metricId), 0);
    if (total === plan.target) return;
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

function buildCandidate(
  seed: string,
  formatId: FootballHitTheNumberFormatId,
  domain: FootballHitTheNumberDomain,
  attempt: number,
): FootballHitTheNumberPlan | null {
  const random = seededLineupRandom(FOOTBALL_HIT_THE_NUMBER_GAME_ID, "candidate", seed, formatId, domain.id, attempt);
  const metricId = domain.metricId;
  let eligible = [...domain.subjects];
  let solution: FootballHitTheNumberSubject[] | null = null;
  let slots: readonly FootballHitTheNumberSlot[] = [];
  let configurationLabel: string | null = null;

  if (formatId === "themed-lineup") {
    const themedIds = new Set(domain.theme.subjectIds);
    eligible = domain.subjects.filter((subject) => themedIds.has(subject.id));
    configurationLabel = domain.theme.label;
    solution = shuffleLineup(eligible, random).slice(0, FOOTBALL_HIT_THE_NUMBER_PICK_COUNT);
  } else if (formatId === "one-from-each") {
    slots = domain.eraSlots;
    configurationLabel = "One from every era";
    solution = slotSolution(slots, eligible, metricId, random);
  } else if (formatId === "build-the-team") {
    slots = domain.buildSlots;
    configurationLabel = "Fill every production tier";
    solution = slotSolution(slots, eligible, metricId, random);
  } else {
    solution = shuffleLineup(eligible, random).slice(0, FOOTBALL_HIT_THE_NUMBER_PICK_COUNT);
  }

  if (!solution || solution.length !== FOOTBALL_HIT_THE_NUMBER_PICK_COUNT) return null;
  const solutionIds = solution.map((subject) => subject.id);
  const solutionSet = new Set(solutionIds);
  const extras = shuffleLineup(
    eligible.filter((subject) => !solutionSet.has(subject.id)),
    random,
  ).slice(0, FOOTBALL_HIT_THE_NUMBER_POOL_SIZE - solutionIds.length);
  if (extras.length !== FOOTBALL_HIT_THE_NUMBER_POOL_SIZE - solutionIds.length) return null;
  const subjectIds = shuffleLineup([...solution, ...extras], random).map((subject) => subject.id);
  const target = solutionIds.reduce((sum, subjectId) => sum + valueFor(subjectId, metricId), 0);
  const metric = getFootballFact(solutionIds[0]!, metricId)?.definition;
  if (!metric) return null;

  return {
    version: FOOTBALL_HIT_THE_NUMBER_VERSION,
    seed,
    formatId,
    formatLabel: formatLabel(formatId),
    configurationLabel,
    domainId: domain.id,
    domainLabel: domain.label,
    metricId,
    metricLabel: metric.label,
    target,
    pickCount: FOOTBALL_HIT_THE_NUMBER_PICK_COUNT,
    subjectIds,
    solutionSubjectIds: solutionIds,
    slots: slots.map(({ id, label }) => ({ id, label })),
  };
}

export function createFootballHitTheNumberPlan(seed: string): FootballHitTheNumberPlan {
  const choiceRandom = seededLineupRandom(FOOTBALL_HIT_THE_NUMBER_GAME_ID, "format", seed);
  const formatId = weightedValue(FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE, choiceRandom);
  const domain = domains[Math.floor(choiceRandom() * domains.length)]!;

  for (let attempt = 0; attempt < 96; attempt += 1) {
    const candidate = buildCandidate(seed, formatId, domain, attempt);
    if (candidate && footballHitTheNumberPlanQuality(candidate).passes) return candidate;
  }
  throw new Error(`Football Hit the Number could not build a balanced ${formatId} ${domain.id} board.`);
}

export function createFootballHitTheNumberRun(): FootballHitTheNumberRun {
  const validIds = new Set(footballHitTheNumberSubjects.map((subject) => subject.id));
  const selected = selectReplayLineup({
    gameId: FOOTBALL_HIT_THE_NUMBER_GAME_ID,
    lineupSize: FOOTBALL_HIT_THE_NUMBER_POOL_SIZE,
    attempts: 12,
    validItemIds: validIds,
    build: (seed) => {
      const plan = createFootballHitTheNumberPlan(seed);
      return { value: plan, itemIds: plan.subjectIds };
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
  const status: HitTheNumberResultStatus = total === plan.target
    ? "perfect"
    : total > plan.target
      ? "bust"
      : "under";
  const distance = Math.abs(plan.target - total);
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
  return formatFootballFact(plan.metricId, value);
}

export function footballHitTheNumberValue(subjectId: string, metricId: FootballFactMetricId) {
  return valueFor(subjectId, metricId);
}

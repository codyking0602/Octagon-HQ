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
  footballFactualRecords,
  formatFootballFact,
  getFootballFact,
  getFootballFactualRecord,
  type FootballFactMetricId,
  type FootballFactScope,
} from "./footballFactualStats";
import {
  getFootballSubject,
  queryFootballSubjects,
  type FootballSubjectProfile,
  type FootballSubjectQuery,
} from "./footballSubjectRegistry";

export const FOOTBALL_HIT_THE_NUMBER_GAME_ID = "football-hit-the-number";
export const FOOTBALL_HIT_THE_NUMBER_VERSION = "football-hit-the-number-v2" as const;
export const FOOTBALL_HIT_THE_NUMBER_MIN_PICKS = 4;
export const FOOTBALL_HIT_THE_NUMBER_MAX_PICKS = 7;
export const FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE = "random-pool" as const;

export type FootballHitTheNumberFormatId =
  | "classic"
  | "themed-lineup"
  | "one-from-each"
  | "build-the-team";

export type FootballHitTheNumberBoardType = "open-roster" | "random-pool";
export type FootballHitTheNumberLeague = "NFL" | "CFB";
export type FootballHitTheNumberDomainId = "volume" | "efficiency" | "dominance";
export type FootballHitTheNumberSubjectGroup =
  | "nfl-qb-career"
  | "nfl-rb-career"
  | "nfl-receiving-career"
  | "nfl-defense-career"
  | "nfl-qb-season"
  | "cfb";

type FootballHitTheNumberSubjectDomainId = FootballHitTheNumberSubjectGroup;

export interface FootballHitTheNumberSubject extends FootballSubjectProfile {
  subtitle: string;
  group: FootballHitTheNumberSubjectGroup;
  domainId: FootballHitTheNumberSubjectDomainId;
}

export interface FootballHitTheNumberThemeDefinition {
  id: string;
  label: string;
  league: FootballHitTheNumberLeague;
  group: FootballHitTheNumberSubjectGroup;
  queries: readonly FootballSubjectQuery[];
}

export interface FootballHitTheNumberSlot {
  id: string;
  label: string;
  accepts: (subject: FootballHitTheNumberSubject, value: number) => boolean;
}

interface FootballHitTheNumberMetricBoard {
  metricId: FootballFactMetricId;
  league: FootballHitTheNumberLeague;
  group: FootballHitTheNumberSubjectGroup;
  boardLabel: string;
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
  metricId: FootballFactMetricId;
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

const decades = (...values: number[]): FootballSubjectQuery[] => values.map((decade) => ({ decade }));
const championSeasons = (...values: number[]): FootballSubjectQuery[] => values.map((season) => ({
  league: "CFB",
  kind: "team-season",
  season,
  nationalChampion: true,
}));

/** Declarative configurations over the canonical registry; never HTN-owned rosters. */
export const FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG: readonly FootballHitTheNumberThemeDefinition[] = [
  { id: "nfl-qbs", label: "NFL Quarterbacks", league: "NFL", group: "nfl-qb-career", queries: [{ league: "NFL", kind: "player-career", position: "QB" }] },
  { id: "nfl-qbs-2000s-2020s", label: "2000s–2020s QBs", league: "NFL", group: "nfl-qb-career", queries: decades(2000, 2010, 2020) },
  { id: "nfl-qbs-1990s-2020s", label: "1990s–2020s QBs", league: "NFL", group: "nfl-qb-career", queries: decades(1990, 2000, 2010, 2020) },
  { id: "nfl-qbs-1960s-1990s", label: "1960s–1990s QBs", league: "NFL", group: "nfl-qb-career", queries: decades(1960, 1970, 1980, 1990) },
  { id: "nfl-qbs-first-round", label: "First-Round QBs", league: "NFL", group: "nfl-qb-career", queries: [{ league: "NFL", kind: "player-career", position: "QB", firstRoundPick: true }] },
  { id: "nfl-qbs-1990s-2000s", label: "1990s–2000s QBs", league: "NFL", group: "nfl-qb-career", queries: decades(1990, 2000) },
  { id: "nfl-rbs", label: "NFL Running Backs", league: "NFL", group: "nfl-rb-career", queries: [{ league: "NFL", kind: "player-career", position: "RB" }] },
  { id: "nfl-rbs-2000s-2020s", label: "2000s–2020s RBs", league: "NFL", group: "nfl-rb-career", queries: decades(2000, 2010, 2020) },
  { id: "nfl-rbs-1990s-2020s", label: "1990s–2020s RBs", league: "NFL", group: "nfl-rb-career", queries: decades(1990, 2000, 2010, 2020) },
  { id: "nfl-rbs-1960s-1990s", label: "1960s–1990s RBs", league: "NFL", group: "nfl-rb-career", queries: decades(1960, 1970, 1980, 1990) },
  { id: "cfb-champions", label: "National Champions", league: "CFB", group: "cfb", queries: [{ league: "CFB", kind: "team-season", nationalChampion: true }] },
  { id: "cfb-bcs-cfp", label: "BCS + CFP Champions", league: "CFB", group: "cfb", queries: championSeasons(1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2017,2018,2019,2020,2021,2022) },
  { id: "cfb-2000s", label: "2000s Champions", league: "CFB", group: "cfb", queries: championSeasons(2000,2001,2002,2003,2004,2005,2006,2007,2008,2009) },
  { id: "cfb-2010-2022", label: "2010–2022 Champions", league: "CFB", group: "cfb", queries: championSeasons(2010,2011,2012,2013,2014,2015,2017,2018,2019,2020,2021,2022) },
  { id: "cfb-pre-cfp", label: "Pre-CFP Champions", league: "CFB", group: "cfb", queries: championSeasons(1995,1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013) },
  { id: "cfb-21st-century", label: "21st-Century Champions", league: "CFB", group: "cfb", queries: championSeasons(2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2017,2018,2019,2020,2021,2022) },
  { id: "cfb-early-bcs", label: "Early BCS Champions", league: "CFB", group: "cfb", queries: championSeasons(1998,1999,2000,2001,2002,2003,2004,2005,2006,2007,2008,2009) },
  { id: "cfb-bcs-to-cfp", label: "BCS-to-CFP Bridge Champions", league: "CFB", group: "cfb", queries: championSeasons(2008,2009,2010,2011,2012,2013,2014,2015,2017,2018,2019) },
] as const;

function hasScope(subjectId: string, scope: FootballFactScope) {
  const record = getFootballFactualRecord(subjectId);
  return Boolean(record && (record.scopes ?? [record.scope]).includes(scope));
}

function groupAcceptsSubject(group: FootballHitTheNumberSubjectGroup, subject: FootballSubjectProfile) {
  if (group === "nfl-qb-career") return subject.kind === "player-career" && subject.position === "QB" && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-rb-career") return subject.kind === "player-career" && subject.position === "RB" && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-receiving-career") return subject.kind === "player-career" && (subject.position === "WR" || subject.position === "TE") && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-defense-career") return subject.kind === "player-career" && (subject.position === "DL" || subject.position === "LB" || subject.position === "DB") && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-qb-season") return subject.kind === "player-season" && subject.position === "QB" && hasScope(subject.id, "nfl-player-season");
  return subject.kind === "team-season" && hasScope(subject.id, "cfb-team-season");
}

function subtitleFor(subject: FootballSubjectProfile) {
  if (subject.kind === "player-season") return `${subject.season ?? "Season"} ${subject.position ?? "player"} season`;
  if (subject.kind === "team-season") {
    return subject.nationalChampion
      ? `${subject.season ?? "Season"} national champion`
      : `${subject.season ?? "Season"} team season`;
  }
  return `${subject.position ?? "Player"} career`;
}

function canonicalSubject(subject: FootballSubjectProfile, group: FootballHitTheNumberSubjectGroup): FootballHitTheNumberSubject {
  return {
    ...subject,
    subtitle: subtitleFor(subject),
    group,
    domainId: group,
  };
}

const groupOrder: readonly FootballHitTheNumberSubjectGroup[] = [
  "nfl-qb-career",
  "nfl-rb-career",
  "nfl-receiving-career",
  "nfl-defense-career",
  "nfl-qb-season",
  "cfb",
];

const subjectsByGroup = new Map<FootballHitTheNumberSubjectGroup, readonly FootballHitTheNumberSubject[]>(
  groupOrder.map((group) => [
    group,
    footballFactualRecords
      .map((record) => getFootballSubject(record.subjectId))
      .filter((subject): subject is FootballSubjectProfile => Boolean(subject && groupAcceptsSubject(group, subject)))
      .map((subject) => canonicalSubject(subject, group)),
  ]),
);

const uniqueSubjects = new Map<string, FootballHitTheNumberSubject>();
for (const group of groupOrder) {
  for (const subject of subjectsByGroup.get(group) ?? []) {
    if (!uniqueSubjects.has(subject.id)) uniqueSubjects.set(subject.id, subject);
  }
}
export const footballHitTheNumberSubjects: readonly FootballHitTheNumberSubject[] = [...uniqueSubjects.values()];
const subjectById = new Map(footballHitTheNumberSubjects.map((subject) => [subject.id, subject]));

function subjectsFor(group: FootballHitTheNumberSubjectGroup) {
  return subjectsByGroup.get(group) ?? [];
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

const metric = (
  metricId: FootballFactMetricId,
  league: FootballHitTheNumberLeague,
  group: FootballHitTheNumberSubjectGroup,
  boardLabel: string,
): FootballHitTheNumberMetricBoard => ({ metricId, league, group, boardLabel });

const domains: readonly FootballHitTheNumberDomain[] = [
  {
    id: "volume",
    metrics: [
      metric("nfl-career-passing-yards", "NFL", "nfl-qb-career", "NFL QB Career Passing Yards"),
      metric("nfl-career-rushing-yards", "NFL", "nfl-rb-career", "NFL RB Career Rushing Yards"),
      metric("nfl-career-receptions", "NFL", "nfl-receiving-career", "NFL Career Receptions"),
      metric("nfl-career-receiving-yards", "NFL", "nfl-receiving-career", "NFL Career Receiving Yards"),
      metric("nfl-season-passing-yards", "NFL", "nfl-qb-season", "NFL QB Season Passing Yards"),
      metric("cfb-team-points-for", "CFB", "cfb", "CFB Team-Season Points Scored"),
      metric("cfb-team-points-against", "CFB", "cfb", "CFB Team-Season Points Allowed"),
      metric("cfb-team-wins", "CFB", "cfb", "CFB Team-Season Wins"),
    ],
  },
  {
    id: "efficiency",
    metrics: [
      metric("nfl-season-passer-rating", "NFL", "nfl-qb-season", "NFL QB Season Passer Rating"),
      metric("cfb-team-points-per-game", "CFB", "cfb", "CFB Team-Season Points Per Game"),
      metric("cfb-team-srs", "CFB", "cfb", "CFB Team-Season SRS"),
      metric("cfb-team-sos", "CFB", "cfb", "CFB Team-Season Strength of Schedule"),
    ],
  },
  {
    id: "dominance",
    metrics: [
      metric("nfl-career-passing-touchdowns", "NFL", "nfl-qb-career", "NFL QB Career Passing TD"),
      metric("nfl-career-rushing-touchdowns", "NFL", "nfl-rb-career", "NFL RB Career Rushing TD"),
      metric("nfl-career-receiving-touchdowns", "NFL", "nfl-receiving-career", "NFL Career Receiving TD"),
      metric("nfl-season-passing-touchdowns", "NFL", "nfl-qb-season", "NFL QB Season Passing TD"),
      metric("nfl-season-interceptions", "NFL", "nfl-qb-season", "NFL QB Season Interceptions Thrown"),
      metric("nfl-defensive-player-of-year-awards", "NFL", "nfl-defense-career", "NFL Defensive Player of the Year Awards"),
      metric("nfl-career-sacks", "NFL", "nfl-defense-career", "NFL Career Sacks"),
      metric("cfb-team-losses", "CFB", "cfb", "CFB Team-Season Losses"),
    ],
  },
] as const;

export const FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG = domains.flatMap((domain) =>
  domain.metrics.map((row) => ({
    domainId: domain.id,
    metricId: row.metricId,
    league: row.league,
    group: row.group,
    boardLabel: row.boardLabel,
  })),
);

const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const metricBoardById = new Map(domains.flatMap((domain) => domain.metrics).map((row) => [row.metricId, row]));

function metricSubjects(board: FootballHitTheNumberMetricBoard) {
  return subjectsFor(board.group).filter((subject) => getFootballFact(subject.id, board.metricId) != null);
}

export function footballHitTheNumberThemeSubjects(theme: FootballHitTheNumberThemeDefinition) {
  const canonicalIds = new Set(theme.queries.flatMap((query) => queryFootballSubjects(query).map((subject) => subject.id)));
  return subjectsFor(theme.group).filter((subject) => canonicalIds.has(subject.id));
}

function themeMetricSubjects(theme: FootballHitTheNumberThemeDefinition, board: FootballHitTheNumberMetricBoard) {
  const metricIds = new Set(metricSubjects(board).map((subject) => subject.id));
  return footballHitTheNumberThemeSubjects(theme).filter((subject) => metricIds.has(subject.id));
}

export const FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH = 10;

function themeSignature(theme: FootballHitTheNumberThemeDefinition) {
  return footballHitTheNumberThemeSubjects(theme).map((subject) => subject.id).sort().join(",");
}

export function footballHitTheNumberPlayableThemes(group?: FootballHitTheNumberSubjectGroup) {
  const seen = new Set<string>();
  return FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG.filter((theme) => group == null || theme.group === group)
    .filter((theme) => footballHitTheNumberThemeSubjects(theme).length >= FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH)
    .filter((theme) => {
      const signature = themeSignature(theme);
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
}

function weightedValue<T>(rows: readonly { value: T; weight: number }[], random: () => number): T {
  const total = rows.reduce((sum, row) => sum + row.weight, 0);
  let cursor = random() * total;
  for (const row of rows) {
    cursor -= row.weight;
    if (cursor < 0) return row.value;
  }
  return rows[rows.length - 1]!.value;
}

function buildSlotsFor(
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
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

function oneFromEachSlots(): readonly FootballHitTheNumberSlot[] {
  const season = (subject: FootballHitTheNumberSubject) => subject.kind === "team-season" ? subject.season : undefined;
  const champion = (subject: FootballHitTheNumberSubject) => subject.nationalChampion === true;
  return [
    { id: "1990s", label: "1990s Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 1990 && (season(subject) ?? 0) <= 1999 },
    { id: "2000-06", label: "2000–06 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 2000 && (season(subject) ?? 0) <= 2006 },
    { id: "2007-13", label: "2007–13 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 2007 && (season(subject) ?? 0) <= 2013 },
    { id: "2014-22", label: "2014–22 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 2014 && (season(subject) ?? 0) <= 2022 },
    { id: "wild-card", label: "Wild Card", accepts: (subject) => champion(subject) },
  ];
}

function oneFromEachSubjects(board: FootballHitTheNumberMetricBoard) {
  return metricSubjects(board).filter((subject) => subject.nationalChampion === true);
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

function combinations<T>(items: readonly T[], count: number, visit: (selection: readonly T[]) => boolean | void) {
  const selected: T[] = [];
  function walk(start: number): boolean {
    if (selected.length === count) return visit([...selected]) === true;
    const remaining = count - selected.length;
    for (let index = start; index <= items.length - remaining; index += 1) {
      selected.push(items[index]!);
      if (walk(index + 1)) return true;
      selected.pop();
    }
    return false;
  }
  walk(0);
}

export function footballHitTheNumberRandomPoolSize(pickCount: number) {
  if (!Number.isInteger(pickCount) || pickCount < FOOTBALL_HIT_THE_NUMBER_MIN_PICKS || pickCount > FOOTBALL_HIT_THE_NUMBER_MAX_PICKS) {
    throw new Error(`Football Hit the Number pick count must be ${FOOTBALL_HIT_THE_NUMBER_MIN_PICKS}-${FOOTBALL_HIT_THE_NUMBER_MAX_PICKS}.`);
  }
  return Math.min(12, pickCount * 2);
}

function requiredPoolSize(boardType: FootballHitTheNumberBoardType, pickCount: number) {
  return boardType === "random-pool" ? footballHitTheNumberRandomPoolSize(pickCount) : pickCount;
}

function themesForMetric(
  board: FootballHitTheNumberMetricBoard,
  boardType: FootballHitTheNumberBoardType,
  pickCount: number,
) {
  const minimum = Math.max(FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH, requiredPoolSize(boardType, pickCount));
  return footballHitTheNumberPlayableThemes(board.group)
    .filter((theme) => themeMetricSubjects(theme, board).length >= minimum);
}

function pickOptionsFor(
  formatId: FootballHitTheNumberFormatId,
  boardType: FootballHitTheNumberBoardType,
  board: FootballHitTheNumberMetricBoard,
) {
  if (formatId === "one-from-each") {
    if (board.group !== "cfb") return [];
    const subjects = oneFromEachSubjects(board);
    if (subjects.length < requiredPoolSize(boardType, 5)) return [];
    const slots = oneFromEachSlots();
    if (slots.some((slot) => !subjects.some((subject) => slot.accepts(subject, valueFor(subject.id, board.metricId))))) return [];
    return [5];
  }

  if (formatId === "build-the-team") {
    return metricSubjects(board).length >= requiredPoolSize(boardType, 5) ? [5] : [];
  }

  return FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE
    .filter((row) => {
      if (formatId === "themed-lineup") return themesForMetric(board, boardType, row.value).length > 0;
      return metricSubjects(board).length >= requiredPoolSize(boardType, row.value);
    })
    .map((row) => row.value);
}

function viableMetricBoards(
  domain: FootballHitTheNumberDomain,
  league: FootballHitTheNumberLeague,
  formatId: FootballHitTheNumberFormatId,
  boardType: FootballHitTheNumberBoardType,
) {
  return domain.metrics.filter((board) => board.league === league && pickOptionsFor(formatId, boardType, board).length > 0);
}

function metricBoardFor(metricId: FootballFactMetricId) {
  const board = metricBoardById.get(metricId);
  if (!board) throw new Error(`Unknown Football Hit the Number metric: ${metricId}`);
  return board;
}

function slotsForPlan(plan: FootballHitTheNumberPlan) {
  const board = metricBoardFor(plan.metricId);
  if (plan.formatId === "one-from-each") return oneFromEachSlots();
  if (plan.formatId === "build-the-team") return buildSlotsFor(metricSubjects(board), plan.metricId);
  return [];
}

export function footballHitTheNumberActiveBuildSlot(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (plan.formatId !== "build-the-team" || selectedSubjectIds.length >= plan.pickCount) return null;
  return plan.slots[selectedSubjectIds.length] ?? null;
}

export function footballHitTheNumberAvailableBuildSubjectIds(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (plan.formatId !== "build-the-team" || selectedSubjectIds.length >= plan.pickCount) return [];
  const selected = new Set(selectedSubjectIds);
  const activeSlot = slotsForPlan(plan)[selectedSubjectIds.length];
  if (!activeSlot) return [];
  return plan.subjectIds.filter((subjectId) => {
    if (selected.has(subjectId)) return false;
    const subject = subjectFor(subjectId);
    return activeSlot.accepts(subject, valueFor(subject.id, plan.metricId));
  });
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
    return legalSelectionCount >= 6 && hasGoodUnder && hasMiddlingOutcome && hasMeaningfulBust;
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

function pickCountFor(
  formatId: FootballHitTheNumberFormatId,
  boardType: FootballHitTheNumberBoardType,
  metricBoard: FootballHitTheNumberMetricBoard,
  random: () => number,
) {
  const options = pickOptionsFor(formatId, boardType, metricBoard);
  if (!options.length) return null;
  if (formatId === "one-from-each" || formatId === "build-the-team") return 5;
  const weighted = FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE.filter((row) => options.includes(row.value));
  return weightedValue(weighted, random);
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
  let eligible = metricSubjects(metricBoard);
  let solution: FootballHitTheNumberSubject[] | null = null;
  let slots: readonly FootballHitTheNumberSlot[] = [];
  let configurationLabel: string | null = null;

  if (formatId === "themed-lineup") {
    const themes = themesForMetric(metricBoard, boardType, pickCount);
    const theme = themes[Math.floor(random() * themes.length)];
    if (!theme) return null;
    eligible = themeMetricSubjects(theme, metricBoard);
    configurationLabel = theme.label;
    solution = shuffleLineup(eligible, random).slice(0, pickCount);
  } else if (formatId === "one-from-each") {
    eligible = oneFromEachSubjects(metricBoard);
    slots = oneFromEachSlots();
    configurationLabel = "One champion from each era + wild card";
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
  if (!(target > 0)) return null;
  const fact = getFootballFact(solutionIds[0]!, metricId);
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
  const league: FootballHitTheNumberLeague = formatId === "one-from-each"
    ? "CFB"
    : choiceRandom() < 0.5 ? "NFL" : "CFB";
  const viableDomains = domains.filter((domain) => viableMetricBoards(domain, league, formatId, boardType).length > 0);
  const domain = viableDomains[Math.floor(choiceRandom() * viableDomains.length)];
  if (!domain) throw new Error(`Football Hit the Number has no viable ${league} ${formatId} domain.`);
  const leagueMetrics = viableMetricBoards(domain, league, formatId, boardType);
  const metricBoard = leagueMetrics[Math.floor(choiceRandom() * leagueMetrics.length)];
  if (!metricBoard) throw new Error(`Football Hit the Number has no viable ${league} ${domain.id} metric.`);
  const pickCount = pickCountFor(formatId, boardType, metricBoard, choiceRandom);
  if (pickCount == null) {
    throw new Error(`Football Hit the Number does not have enough ${metricBoard.metricId} depth for ${boardType}.`);
  }

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
  return formatFootballFact(plan.metricId, value);
}

export function footballHitTheNumberValue(subjectId: string, metricId: FootballFactMetricId) {
  return valueFor(subjectId, metricId);
}

export function getFootballHitTheNumberDomain(domainId: FootballHitTheNumberDomainId) {
  return domainById.get(domainId) ?? null;
}

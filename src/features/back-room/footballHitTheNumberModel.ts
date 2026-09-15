import {
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
export const FOOTBALL_HIT_THE_NUMBER_VERSION = "football-hit-the-number-v5" as const;
export const FOOTBALL_HIT_THE_NUMBER_MIN_PICKS = 4;
export const FOOTBALL_HIT_THE_NUMBER_MAX_PICKS = 6;
export const FOOTBALL_HIT_THE_NUMBER_DEFAULT_BOARD_TYPE = "random-pool" as const;

export type FootballHitTheNumberFormatId =
  | "classic"
  | "themed-lineup"
  | "one-from-each"
  | "build-the-team";

export type FootballHitTheNumberBoardType = "open-roster" | "random-pool";
export type FootballHitTheNumberLeague = "NFL" | "CFB";
export type FootballHitTheNumberDomainId = "volume" | "efficiency" | "dominance";
export type FootballHitTheNumberContentKind =
  | "peak-season"
  | "team-season"
  | "accomplishment"
  | "career-special";
export type FootballHitTheNumberSubjectGroup =
  | "nfl-qb-career"
  | "nfl-rb-career"
  | "nfl-receiving-career"
  | "nfl-defense-career"
  | "nfl-qb-season"
  | "nfl-team-season"
  | "cfb-player-peak"
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
  contentKind: FootballHitTheNumberContentKind;
  weight: number;
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
  hasBadUnder: boolean;
  hasMeaningfulBust: boolean;
}

export const FOOTBALL_HIT_THE_NUMBER_FORMAT_PROFILE = [
  { value: "classic", weight: 40 },
  { value: "themed-lineup", weight: 25 },
  { value: "one-from-each", weight: 20 },
  { value: "build-the-team", weight: 15 },
] as const satisfies readonly { value: FootballHitTheNumberFormatId; weight: number }[];

export const FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE = [
  { value: 4, weight: 20 },
  { value: 5, weight: 40 },
  { value: 6, weight: 40 },
] as const satisfies readonly { value: number; weight: number }[];

export const FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS = {
  "peak-season": 8,
  "team-season": 6,
  accomplishment: 5,
  "career-special": 2,
} as const satisfies Readonly<Record<FootballHitTheNumberContentKind, number>>;

export const FOOTBALL_HIT_THE_NUMBER_BUILD_TEAM_MIN_DEPTH = 16;
export const FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH = 3;
export const FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE = 14;
export const FOOTBALL_HIT_THE_NUMBER_RECOGNIZABLE_POOL_DEPTH = 24;

export const FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY = {
  minimumLegalSelections: 6,
  goodUnderMinScore: 90,
  badUnderMaxScore: 85,
  meaningfulBustMaxScore: 49,
  midScoreMin: 75,
  midScoreMax: 89,
} as const;

function careerSpecialSubjectEligible(subject: FootballSubjectProfile) {
  return subject.casualEligible
    && (subject.recognizabilityTier === "A" || subject.recognizabilityTier === "B");
}

const decades = (...values: number[]): FootballSubjectQuery[] => values.map((decade) => ({ decade }));
const championSeasons = (...values: number[]): FootballSubjectQuery[] => values.map((season) => ({
  league: "CFB",
  kind: "team-season",
  season,
  nationalChampion: true,
}));

/** Declarative configurations over the canonical registry; never HTN-owned rosters. */
export const FOOTBALL_HIT_THE_NUMBER_THEME_CATALOG: readonly FootballHitTheNumberThemeDefinition[] = [
  {
    id: "nfl-qb-seasons",
    label: "Notable NFL QB Seasons",
    league: "NFL",
    group: "nfl-qb-season",
    queries: [{ league: "NFL", kind: "player-season", position: "QB", includeProjectedSourceSubjects: true }],
  },
  {
    id: "nfl-qbs-modern",
    label: "Modern Era QBs",
    league: "NFL",
    group: "nfl-qb-career",
    queries: decades(2000, 2010, 2020),
  },
  {
    id: "nfl-qbs-old-school",
    label: "Old School QBs",
    league: "NFL",
    group: "nfl-qb-career",
    queries: decades(1960, 1970, 1980, 1990),
  },
  {
    id: "nfl-qbs-first-round",
    label: "First-Round QBs",
    league: "NFL",
    group: "nfl-qb-career",
    queries: [{ league: "NFL", kind: "player-career", position: "QB", firstRoundPick: true }],
  },
  {
    id: "nfl-team-seasons",
    label: "NFL Team Seasons",
    league: "NFL",
    group: "nfl-team-season",
    queries: [{ league: "NFL", kind: "team-season", includeProjectedSourceSubjects: true }],
  },
  {
    id: "cfb-champions",
    label: "National Champions",
    league: "CFB",
    group: "cfb",
    queries: [{ league: "CFB", kind: "team-season", nationalChampion: true }],
  },
  {
    id: "cfb-bcs-era",
    label: "BCS Era Champions",
    league: "CFB",
    group: "cfb",
    queries: championSeasons(1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013),
  },
  {
    id: "cfb-cfp-era",
    label: "CFP Era Champions",
    league: "CFB",
    group: "cfb",
    queries: championSeasons(2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022),
  },
  {
    id: "cfb-modern-champions",
    label: "Modern Champions",
    league: "CFB",
    group: "cfb",
    queries: championSeasons(2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022),
  },
] as const;

function hasScope(subjectId: string, scope: FootballFactScope) {
  const record = getFootballFactualRecord(subjectId);
  return Boolean(record && (record.scopes ?? [record.scope]).includes(scope));
}

function groupAcceptsSubject(group: FootballHitTheNumberSubjectGroup, subject: FootballSubjectProfile) {
  if (group === "nfl-qb-career") return subject.kind === "player-career" && subject.league === "NFL" && subject.position === "QB" && careerSpecialSubjectEligible(subject) && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-rb-career") return subject.kind === "player-career" && subject.league === "NFL" && subject.position === "RB" && careerSpecialSubjectEligible(subject) && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-receiving-career") return subject.kind === "player-career" && subject.league === "NFL" && (subject.position === "WR" || subject.position === "TE") && careerSpecialSubjectEligible(subject) && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-defense-career") return subject.kind === "player-career" && subject.league === "NFL" && (subject.position === "DL" || subject.position === "LB" || subject.position === "DB") && careerSpecialSubjectEligible(subject) && hasScope(subject.id, "nfl-player-career");
  if (group === "nfl-qb-season") return subject.kind === "player-season" && subject.league === "NFL" && subject.position === "QB" && hasScope(subject.id, "nfl-player-season");
  if (group === "nfl-team-season") return subject.kind === "team-season" && subject.league === "NFL" && hasScope(subject.id, "nfl-team-season");
  if (group === "cfb-player-peak") return subject.kind === "player-career" && subject.league === "CFB" && hasScope(subject.id, "cfb-player-career");
  return subject.kind === "team-season" && subject.league === "CFB" && hasScope(subject.id, "cfb-team-season");
}

function subtitleFor(subject: FootballSubjectProfile, group: FootballHitTheNumberSubjectGroup) {
  if (group === "cfb-player-peak") return `${subject.position ?? "Player"} college career`;
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
    subtitle: subtitleFor(subject, group),
    group,
    domainId: group,
  };
}

function normalizedIdentityPart(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

/** One real player/team season may have compatibility and projected ids; gameplay treats it as one subject. */
export function footballHitTheNumberSubjectIdentityKey(subject: FootballSubjectProfile) {
  if ((subject.kind === "team-season" || subject.kind === "player-season") && subject.season != null) {
    const seasonText = String(subject.season);
    const baseName = normalizedIdentityPart(subject.name.replace(new RegExp(`\\b${seasonText}\\b`, "g"), ""));
    return `${subject.league}:${subject.kind}:${subject.season}:${baseName || subject.teamId || subject.playerId || subject.id}`;
  }
  return `${subject.league}:${subject.kind}:${subject.id}`;
}

function preferredDuplicateSubject(left: FootballHitTheNumberSubject, right: FootballHitTheNumberSubject) {
  if (left.kind === "team-season" && right.kind === "team-season" && left.nationalChampion !== right.nationalChampion) {
    return left.nationalChampion ? left : right;
  }

  const leftFacts = getFootballFactualRecord(left.id)?.facts.length ?? 0;
  const rightFacts = getFootballFactualRecord(right.id)?.facts.length ?? 0;
  if (leftFacts !== rightFacts) return leftFacts > rightFacts ? left : right;
  const leftIdentity = Number(Boolean(left.teamId || left.playerId));
  const rightIdentity = Number(Boolean(right.teamId || right.playerId));
  if (leftIdentity !== rightIdentity) return leftIdentity > rightIdentity ? left : right;
  return left.id.length <= right.id.length ? left : right;
}

function dedupeSemanticSubjects(subjects: readonly FootballHitTheNumberSubject[]) {
  const byIdentity = new Map<string, FootballHitTheNumberSubject>();
  for (const subject of subjects) {
    const key = footballHitTheNumberSubjectIdentityKey(subject);
    const current = byIdentity.get(key);
    byIdentity.set(key, current ? preferredDuplicateSubject(current, subject) : subject);
  }
  return [...byIdentity.values()];
}

const groupOrder: readonly FootballHitTheNumberSubjectGroup[] = [
  "nfl-qb-career",
  "nfl-qb-season",
  "nfl-team-season",
  "cfb",
];

const subjectsByGroup = new Map<FootballHitTheNumberSubjectGroup, readonly FootballHitTheNumberSubject[]>(
  groupOrder.map((group) => [
    group,
    dedupeSemanticSubjects(
      footballFactualRecords
        .map((record) => getFootballSubject(record.subjectId))
        .filter((subject): subject is FootballSubjectProfile => Boolean(subject && groupAcceptsSubject(group, subject)))
        .map((subject) => canonicalSubject(subject, group)),
    ),
  ]),
);

const allSubjectIdentities = new Map<string, FootballHitTheNumberSubject>();
for (const group of groupOrder) {
  for (const subject of subjectsByGroup.get(group) ?? []) {
    const key = footballHitTheNumberSubjectIdentityKey(subject);
    const current = allSubjectIdentities.get(key);
    allSubjectIdentities.set(key, current ? preferredDuplicateSubject(current, subject) : subject);
  }
}
const allFootballHitTheNumberSubjects: readonly FootballHitTheNumberSubject[] = [...allSubjectIdentities.values()];
const subjectById = new Map(allFootballHitTheNumberSubjects.map((subject) => [subject.id, subject]));

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
  contentKind: FootballHitTheNumberContentKind,
): FootballHitTheNumberMetricBoard => ({
  metricId,
  league,
  group,
  boardLabel,
  contentKind,
  weight: FOOTBALL_HIT_THE_NUMBER_CONTENT_WEIGHTS[contentKind],
});

const domains: readonly FootballHitTheNumberDomain[] = [
  {
    id: "volume",
    metrics: [
      metric("nfl-season-passing-yards", "NFL", "nfl-qb-season", "NFL QB Season Passing Yards", "peak-season"),
      metric("nfl-team-overall-wins", "NFL", "nfl-team-season", "NFL Team-Season Wins", "team-season"),
      metric("nfl-team-points-for", "NFL", "nfl-team-season", "NFL Team-Season Points Scored", "team-season"),
      metric("cfb-team-points-for", "CFB", "cfb", "CFB Team-Season Points Scored", "team-season"),
      metric("cfb-team-points-against", "CFB", "cfb", "CFB Team-Season Points Allowed", "team-season"),
      metric("cfb-team-wins", "CFB", "cfb", "CFB Team-Season Wins", "team-season"),
    ],
  },
  {
    id: "efficiency",
    metrics: [
      metric("nfl-season-passer-rating", "NFL", "nfl-qb-season", "NFL QB Season Passer Rating", "peak-season"),
      metric("nfl-team-points-per-game", "NFL", "nfl-team-season", "NFL Team Points Per Game", "team-season"),
      metric("cfb-team-points-per-game", "CFB", "cfb", "CFB Team Points Per Game", "team-season"),
    ],
  },
  {
    id: "dominance",
    metrics: [
      metric("nfl-season-passing-touchdowns", "NFL", "nfl-qb-season", "NFL QB Season Passing Touchdowns", "peak-season"),
      metric("nfl-season-interceptions", "NFL", "nfl-qb-season", "NFL QB Season Interceptions Thrown", "peak-season"),
      metric("nfl-career-passing-touchdowns", "NFL", "nfl-qb-career", "NFL QB Career Passing Touchdowns", "career-special"),
      metric("cfb-team-point-differential", "CFB", "cfb", "CFB Team Point Differential", "team-season"),
    ],
  },
] as const;

const playableRecognitionById = new Map(
  queryFootballSubjects({
    casualEligible: true,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  }).map((subject) => [subject.id, subject]),
);

const metricSubjectsCache = new Map<string, readonly FootballHitTheNumberSubject[]>();

function metricSubjects(board: FootballHitTheNumberMetricBoard) {
  const key = `${board.group}:${board.metricId}`;
  const cached = metricSubjectsCache.get(key);
  if (cached) return cached;

  const casualSubjects = subjectsFor(board.group).flatMap((subject) => {
    const recognition = playableRecognitionById.get(subject.id);
    if (!recognition || recognition.recognizabilityTier === "D" || getFootballFact(subject.id, board.metricId) == null) {
      return [];
    }
    return [{
      ...subject,
      recognizabilityTier: recognition.recognizabilityTier,
      casualEligible: recognition.casualEligible,
      sourceIdentityKeys: recognition.sourceIdentityKeys,
    }];
  });
  const highlyRecognizable = casualSubjects.filter((subject) => (
    subject.recognizabilityTier === "A" || subject.recognizabilityTier === "B"
  ));
  const subjects = highlyRecognizable.length >= FOOTBALL_HIT_THE_NUMBER_RECOGNIZABLE_POOL_DEPTH
    ? highlyRecognizable
    : casualSubjects;

  metricSubjectsCache.set(key, subjects);
  return subjects;
}

function metricBoardEnabled(board: FootballHitTheNumberMetricBoard) {
  return metricSubjects(board).length >= 12;
}

export const footballHitTheNumberSubjects: readonly FootballHitTheNumberSubject[] = dedupeSemanticSubjects(
  domains.flatMap((domain) => domain.metrics.filter(metricBoardEnabled).flatMap(metricSubjects)),
);

export const FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG = domains.flatMap((domain) =>
  domain.metrics.filter(metricBoardEnabled).map((row) => ({
    domainId: domain.id,
    metricId: row.metricId,
    league: row.league,
    group: row.group,
    boardLabel: row.boardLabel,
    contentKind: row.contentKind,
    weight: row.weight,
  })),
);

const domainById = new Map(domains.map((domain) => [domain.id, domain]));
const metricBoardById = new Map(domains.flatMap((domain) => domain.metrics).map((row) => [row.metricId, row]));

const themeSubjectsCache = new Map<string, readonly FootballHitTheNumberSubject[]>();

export function footballHitTheNumberThemeSubjects(theme: FootballHitTheNumberThemeDefinition) {
  const cached = themeSubjectsCache.get(theme.id);
  if (cached) return cached;
  const canonicalIds = new Set(theme.queries.flatMap((query) => queryFootballSubjects(query).map((subject) => subject.id)));
  const subjects = subjectsFor(theme.group).filter((subject) => canonicalIds.has(subject.id));
  themeSubjectsCache.set(theme.id, subjects);
  return subjects;
}

function themeMetricSubjects(theme: FootballHitTheNumberThemeDefinition, board: FootballHitTheNumberMetricBoard) {
  const themeIds = new Set(footballHitTheNumberThemeSubjects(theme).map((subject) => subject.id));
  return metricSubjects(board).filter((subject) => themeIds.has(subject.id));
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

function recognizabilityWeight(subject: FootballHitTheNumberSubject) {
  if (subject.recognizabilityTier === "A") return 5;
  if (subject.recognizabilityTier === "B") return 3;
  if (subject.recognizabilityTier === "C") return 1;
  return 0.05;
}

function recognizabilityWeightedShuffle(
  subjects: readonly FootballHitTheNumberSubject[],
  random: () => number,
) {
  return subjects
    .map((subject) => ({
      subject,
      key: -Math.log(Math.max(random(), Number.EPSILON)) / recognizabilityWeight(subject),
    }))
    .sort((left, right) => left.key - right.key || left.subject.id.localeCompare(right.subject.id))
    .map(({ subject }) => subject);
}

function buildTierGroups(
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
) {
  const ordered = [...subjects].sort((left, right) =>
    valueFor(right.id, metricId) - valueFor(left.id, metricId) || left.id.localeCompare(right.id));
  return Array.from({ length: 4 }, (_, index) => {
    const start = Math.floor(index * ordered.length / 4);
    const end = Math.floor((index + 1) * ordered.length / 4);
    return ordered.slice(start, end);
  });
}

function buildSlotsFor(
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
): readonly FootballHitTheNumberSlot[] {
  const groups = buildTierGroups(subjects, metricId);
  const labels = ["Tier 1", "Tier 2", "Tier 3", "Tier 4"] as const;
  return [
    ...groups.map((group, index) => {
      const ids = new Set(group.map((subject) => subject.id));
      return {
        id: `tier-${index + 1}`,
        label: labels[index]!,
        accepts: (subject: FootballHitTheNumberSubject) => ids.has(subject.id),
      };
    }),
    { id: "wild-card", label: "Wild Card", accepts: () => true },
  ];
}

function oneFromEachSlots(): readonly FootballHitTheNumberSlot[] {
  const season = (subject: FootballHitTheNumberSubject) => subject.kind === "team-season" ? subject.season : undefined;
  const champion = (subject: FootballHitTheNumberSubject) => subject.nationalChampion === true;
  return [
    { id: "1995-2002", label: "1995–2002 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 1995 && (season(subject) ?? 0) <= 2002 },
    { id: "2003-08", label: "2003–08 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 2003 && (season(subject) ?? 0) <= 2008 },
    { id: "2009-14", label: "2009–14 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 2009 && (season(subject) ?? 0) <= 2014 },
    { id: "2015-22", label: "2015–22 Champion", accepts: (subject) => champion(subject) && (season(subject) ?? 0) >= 2015 && (season(subject) ?? 0) <= 2022 },
    { id: "wild-card", label: "Wild Card", accepts: (subject) => champion(subject) },
  ];
}

function oneFromEachSubjects(board: FootballHitTheNumberMetricBoard) {
  return metricSubjects(board).filter((subject) => subject.nationalChampion === true);
}

function subjectsAssignedToSlots(
  slots: readonly FootballHitTheNumberSlot[],
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
) {
  if (subjects.length !== slots.length) return null;
  const used = new Set<number>();
  const assigned: FootballHitTheNumberSubject[] = new Array(slots.length);

  function visit(slotIndex: number): boolean {
    if (slotIndex === slots.length) return true;
    const slot = slots[slotIndex]!;
    for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
      if (used.has(subjectIndex)) continue;
      const subject = subjects[subjectIndex]!;
      if (!slot.accepts(subject, valueFor(subject.id, metricId))) continue;
      used.add(subjectIndex);
      assigned[slotIndex] = subject;
      if (visit(slotIndex + 1)) return true;
      used.delete(subjectIndex);
    }
    return false;
  }

  return visit(0) ? assigned : null;
}

function assignSlots(
  slots: readonly FootballHitTheNumberSlot[],
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
) {
  return subjectsAssignedToSlots(slots, subjects, metricId) != null;
}

function progressionSlotsHaveDepth(
  slots: readonly FootballHitTheNumberSlot[],
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
) {
  return slots.slice(0, 4).every((slot) => (
    subjects.filter((subject) => slot.accepts(subject, valueFor(subject.id, metricId))).length
      >= FOOTBALL_HIT_THE_NUMBER_PROGRESSION_VISIBLE_SLOT_DEPTH
  ));
}

function stratifiedProgressionSample(
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
  count: number,
  random: () => number,
) {
  const ordered = [...subjects].sort((left, right) =>
    valueFor(left.id, metricId) - valueFor(right.id, metricId) || left.id.localeCompare(right.id));
  if (ordered.length < count) return [];
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor(index * ordered.length / count);
    const end = Math.floor((index + 1) * ordered.length / count);
    return recognizabilityWeightedShuffle(ordered.slice(start, end), random)[0]!;
  });
}

function balancedProgressionRandomPool(
  subjects: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
  slots: readonly FootballHitTheNumberSlot[],
  random: () => number,
) {
  const capacities = [3, 4, 4, 3] as const;
  const pool = slots.slice(0, 4).flatMap((slot, index) => {
    const group = subjects.filter((subject) => slot.accepts(subject, valueFor(subject.id, metricId)));
    return stratifiedProgressionSample(group, metricId, capacities[index]!, random);
  });
  if (pool.length !== FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE) return null;
  if (new Set(pool.map((subject) => subject.id)).size !== pool.length) return null;
  return shuffleLineup(pool, random);
}

function balancedProgressionTargetSolution(
  pool: readonly FootballHitTheNumberSubject[],
  slots: readonly FootballHitTheNumberSlot[],
  metricId: FootballFactMetricId,
) {
  const legal: { subjects: FootballHitTheNumberSubject[]; total: number; signature: string }[] = [];
  combinations(pool, 5, (selection) => {
    if (!assignSlots(slots, selection, metricId)) return;
    const total = selection.reduce((sum, subject) => sum + valueFor(subject.id, metricId), 0);
    if (!(total > 0)) return;
    legal.push({
      subjects: [...selection],
      total,
      signature: selection.map((subject) => subject.id).sort().join("|"),
    });
  });
  if (!legal.length) return null;
  legal.sort((left, right) => left.total - right.total || left.signature.localeCompare(right.signature));
  const selected = legal[Math.floor((legal.length - 1) / 2)]!.subjects;
  return subjectsAssignedToSlots(slots, selected, metricId);
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
  return pickCount * 2 + 4;
}

function requiredPoolSize(_boardType: FootballHitTheNumberBoardType, pickCount: number) {
  return footballHitTheNumberRandomPoolSize(pickCount);
}

function curatedRandomPool(
  subjects: readonly FootballHitTheNumberSubject[],
  solution: readonly FootballHitTheNumberSubject[],
  metricId: FootballFactMetricId,
  poolSize: number,
  random: () => number,
) {
  const ordered = [...subjects].sort((left, right) =>
    valueFor(left.id, metricId) - valueFor(right.id, metricId) || left.id.localeCompare(right.id));
  const bands = Array.from({ length: 4 }, (_, index) => {
    const start = Math.floor(index * ordered.length / 4);
    const end = Math.floor((index + 1) * ordered.length / 4);
    return ordered.slice(start, end);
  });
  const desired = poolSize === 12
    ? [3, 3, 3, 3]
    : poolSize === 14
      ? [3, 4, 4, 3]
      : [4, 4, 4, 4];
  const selected = [...solution];
  const selectedIds = new Set(selected.map((subject) => subject.id));

  for (let bandIndex = 0; bandIndex < bands.length; bandIndex += 1) {
    const band = bands[bandIndex]!;
    const alreadyInBand = band.filter((subject) => selectedIds.has(subject.id)).length;
    const needed = Math.max(0, desired[bandIndex]! - alreadyInBand);
    const extras = recognizabilityWeightedShuffle(
      band.filter((subject) => !selectedIds.has(subject.id)),
      random,
    ).slice(0, needed);
    for (const subject of extras) {
      selected.push(subject);
      selectedIds.add(subject.id);
    }
  }

  if (selected.length < poolSize) {
    const extras = recognizabilityWeightedShuffle(
      subjects.filter((subject) => !selectedIds.has(subject.id)),
      random,
    ).slice(0, poolSize - selected.length);
    for (const subject of extras) {
      selected.push(subject);
      selectedIds.add(subject.id);
    }
  }

  if (selected.length !== poolSize || selectedIds.size !== poolSize) return null;
  return shuffleLineup(selected, random);
}

const themesForMetricCache = new Map<string, readonly FootballHitTheNumberThemeDefinition[]>();

function themesForMetric(
  board: FootballHitTheNumberMetricBoard,
  boardType: FootballHitTheNumberBoardType,
  pickCount: number,
) {
  const key = `${board.metricId}:${boardType}:${pickCount}`;
  const cached = themesForMetricCache.get(key);
  if (cached) return cached;
  const minimum = Math.max(FOOTBALL_HIT_THE_NUMBER_MIN_THEME_DEPTH, requiredPoolSize(boardType, pickCount));
  const themes = footballHitTheNumberPlayableThemes(board.group)
    .filter((theme) => themeMetricSubjects(theme, board).length >= minimum);
  themesForMetricCache.set(key, themes);
  return themes;
}

const pickOptionsCache = new Map<string, readonly number[]>();

function pickOptionsFor(
  formatId: FootballHitTheNumberFormatId,
  boardType: FootballHitTheNumberBoardType,
  board: FootballHitTheNumberMetricBoard,
) {
  const cacheKey = `${formatId}:${boardType}:${board.metricId}`;
  const cached = pickOptionsCache.get(cacheKey);
  if (cached) return cached;
  if (!metricBoardEnabled(board)) return [];
  if (formatId !== "classic" && board.contentKind === "accomplishment") return [];
  if (formatId === "build-the-team" && board.contentKind === "career-special") return [];
  // Champion-only CFB win totals are too compressed to create the full scoring
  // spectrum in capped pools. Keep the metric in Classic, where all recognizable
  // CFB team seasons provide the value spread the quality gate requires.
  if (board.metricId === "cfb-team-wins" && formatId !== "classic") return [];
  if (formatId === "one-from-each") {
    if (board.group !== "cfb") return [];
    const subjects = oneFromEachSubjects(board);
    const slots = oneFromEachSlots();
    if (!progressionSlotsHaveDepth(slots, subjects, board.metricId)) return [];
    if (subjects.length < FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE) return [];
    return [5];
  }

  if (formatId === "build-the-team") {
    // Season wins are intentionally narrow count stats. They remain fully playable
    // in Classic/Themed/One From Each, but four stat tiers cannot reliably create
    // the required good-under / bad-under / meaningful-bust spread in only 14 choices.
    if (board.metricId === "nfl-team-overall-wins" || board.metricId === "cfb-team-wins") return [];
    const subjects = metricSubjects(board);
    if (subjects.length < FOOTBALL_HIT_THE_NUMBER_BUILD_TEAM_MIN_DEPTH) return [];
    const slots = buildSlotsFor(subjects, board.metricId);
    if (!progressionSlotsHaveDepth(slots, subjects, board.metricId)) return [];
    if (subjects.length < FOOTBALL_HIT_THE_NUMBER_PROGRESSION_RANDOM_POOL_SIZE) return [];
    return [5];
  }

  const options = FOOTBALL_HIT_THE_NUMBER_PICK_PROFILE
    .filter((row) => {
      if (formatId === "themed-lineup") return themesForMetric(board, boardType, row.value).length > 0;
      return metricSubjects(board).length >= requiredPoolSize(boardType, row.value);
    })
    .map((row) => row.value);
  pickOptionsCache.set(cacheKey, options);
  return options;
}

function viableMetricBoards(
  domain: FootballHitTheNumberDomain,
  league: FootballHitTheNumberLeague,
  formatId: FootballHitTheNumberFormatId,
  boardType: FootballHitTheNumberBoardType,
) {
  return domain.metrics.filter((board) => board.league === league && metricBoardEnabled(board) && pickOptionsFor(formatId, boardType, board).length > 0);
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

function isProgressionFormat(plan: FootballHitTheNumberPlan) {
  return plan.formatId === "one-from-each" || plan.formatId === "build-the-team";
}

export function footballHitTheNumberActiveProgressionSlot(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (!isProgressionFormat(plan) || selectedSubjectIds.length >= plan.pickCount) return null;
  return plan.slots[selectedSubjectIds.length] ?? null;
}

export function footballHitTheNumberAvailableProgressionSubjectIds(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (!isProgressionFormat(plan) || selectedSubjectIds.length >= plan.pickCount) return [];
  const selected = new Set(selectedSubjectIds);
  const activeSlot = slotsForPlan(plan)[selectedSubjectIds.length];
  if (!activeSlot) return [];
  return plan.subjectIds.filter((subjectId) => {
    if (selected.has(subjectId)) return false;
    const subject = subjectFor(subjectId);
    return activeSlot.accepts(subject, valueFor(subject.id, plan.metricId));
  });
}

export function footballHitTheNumberActiveBuildSlot(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (plan.formatId !== "build-the-team") return null;
  return footballHitTheNumberActiveProgressionSlot(plan, selectedSubjectIds);
}

export function footballHitTheNumberAvailableBuildSubjectIds(
  plan: FootballHitTheNumberPlan,
  selectedSubjectIds: readonly string[],
) {
  if (plan.formatId !== "build-the-team") return [];
  return footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedSubjectIds);
}

export function footballHitTheNumberProgressionSlotSubjectIds(
  plan: FootballHitTheNumberPlan,
) {
  if (!isProgressionFormat(plan)) return [] as string[][];
  const slots = slotsForPlan(plan);
  return slots.slice(0, plan.pickCount).map((slot) =>
    plan.subjectIds.filter((subjectId) => {
      const subject = subjectFor(subjectId);
      return slot.accepts(subject, valueFor(subject.id, plan.metricId));
    }),
  );
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

function minimumGoodUnderScore(plan: FootballHitTheNumberPlan) {
  const fact = getFootballFact(plan.subjectIds[0]!, plan.metricId);
  if (!fact) return 90;
  const resolution = 10 ** -fact.definition.decimals;
  return Math.min(90, hitTheNumberScore({
    status: "under",
    target: plan.target,
    distance: resolution,
    pickCount: plan.pickCount,
  }));
}

export function footballHitTheNumberPlanQuality(plan: FootballHitTheNumberPlan): FootballHitTheNumberQualityResult {
  let legalSelectionCount = 0;
  let hasGoodUnder = false;
  let hasMiddlingOutcome = false;
  let hasBadUnder = false;
  let hasMeaningfulBust = false;
  const requiresBadUnder = !isProgressionFormat(plan);
  const goodUnderMinimum = Math.min(
    FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.goodUnderMinScore,
    minimumGoodUnderScore(plan),
  );

  const inspectSelection = (subjectIds: readonly string[]) => {
    if (!footballHitTheNumberSelectionSatisfies(plan, subjectIds)) return false;
    const total = subjectIds.reduce((sum, subjectId) => sum + valueFor(subjectId, plan.metricId), 0);
    if (Math.abs(total - plan.target) < 1e-9) return false;
    legalSelectionCount += 1;
    const status: HitTheNumberResultStatus = total > plan.target ? "bust" : "under";
    const score = hitTheNumberScore({
      status,
      target: plan.target,
      distance: Math.abs(plan.target - total),
      pickCount: plan.pickCount,
    });
    if (status === "under") {
      if (score >= goodUnderMinimum) hasGoodUnder = true;
      if (score <= FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.badUnderMaxScore) hasBadUnder = true;
    }
    if (
      (status === "under"
        && score >= FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.midScoreMin
        && score <= FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.midScoreMax)
      || (status === "bust" && score >= 35)
    ) {
      hasMiddlingOutcome = true;
    }
    if (
      status === "bust"
      && score <= FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.meaningfulBustMaxScore
    ) {
      hasMeaningfulBust = true;
    }
    return (
      legalSelectionCount >= FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.minimumLegalSelections
      && hasGoodUnder
      && hasMiddlingOutcome
      && (!requiresBadUnder || hasBadUnder)
      && hasMeaningfulBust
    );
  };

  combinations(plan.subjectIds, plan.pickCount, inspectSelection);

  return {
    passes: (
      legalSelectionCount >= FOOTBALL_HIT_THE_NUMBER_POOL_QUALITY.minimumLegalSelections
      && hasGoodUnder
      && hasMiddlingOutcome
      && (!requiresBadUnder || hasBadUnder)
      && hasMeaningfulBust
    ),
    legalSelectionCount,
    hasGoodUnder,
    hasMiddlingOutcome,
    hasBadUnder,
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
    solution = recognizabilityWeightedShuffle(eligible, random).slice(0, pickCount);
  } else if (formatId === "one-from-each") {
    eligible = oneFromEachSubjects(metricBoard);
    slots = oneFromEachSlots();
    configurationLabel = "One champion from each era + wild card";
  } else if (formatId === "build-the-team") {
    slots = buildSlotsFor(eligible, metricId);
    configurationLabel = "4 stat tiers + wild card";
  } else {
    solution = recognizabilityWeightedShuffle(eligible, random).slice(0, pickCount);
  }

  let subjectIds: string[];
  if (formatId === "one-from-each" || formatId === "build-the-team") {
    const balancedPool = balancedProgressionRandomPool(eligible, metricId, slots, random);
    if (!balancedPool) return null;
    solution = balancedProgressionTargetSolution(balancedPool, slots, metricId);
    if (!solution || solution.length !== pickCount) return null;
    subjectIds = balancedPool.map((subject) => subject.id);
  } else {
    if (!solution || solution.length !== pickCount) return null;
    const poolSize = footballHitTheNumberRandomPoolSize(pickCount);
    const curatedPool = curatedRandomPool(eligible, solution, metricId, poolSize, random);
    if (!curatedPool) return null;
    subjectIds = curatedPool.map((subject) => subject.id);
  }

  if (!solution || solution.length !== pickCount) return null;
  const solutionIds = solution.map((subject) => subject.id);
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

const viableDomainChoicesCache = new Map<string, readonly { domain: FootballHitTheNumberDomain; boards: readonly FootballHitTheNumberMetricBoard[] }[]>();

function viableDomainChoices(
  league: FootballHitTheNumberLeague,
  formatId: FootballHitTheNumberFormatId,
  boardType: FootballHitTheNumberBoardType,
) {
  const key = `${league}:${formatId}:${boardType}`;
  const cached = viableDomainChoicesCache.get(key);
  if (cached) return cached;
  const choices = domains
    .map((domain) => ({
      domain,
      boards: viableMetricBoards(domain, league, formatId, boardType),
    }))
    .filter((choice) => choice.boards.length > 0);
  viableDomainChoicesCache.set(key, choices);
  return choices;
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
  const choices = viableDomainChoices(league, formatId, boardType);
  if (!choices.length) throw new Error(`Football Hit the Number has no viable ${league} ${formatId} metrics.`);
  const selected = choices[Math.floor(choiceRandom() * choices.length)]!;
  const domain = selected.domain;
  const metricBoard = weightedValue(
    selected.boards.map((board) => ({ value: board, weight: board.weight })),
    choiceRandom,
  );
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
  const pool = [...plan.subjectIds].sort().join(",");
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

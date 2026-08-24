import {
  createReplaySeed,
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
import {
  getFootballRankFivePack,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

export const FOOTBALL_BLIND_RESUME_GAME_ID = "football-blind-resume";
export const FOOTBALL_BLIND_RESUME_ROUNDS = 5;
export const FOOTBALL_BLIND_RESUME_REVEAL_COUNTS = [0, 2, 4, 6, 8] as const;
export const FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES = ["villain", "hard", "villain", "hard", "medium"] as const;

export type FootballBlindResumeLeague = "NFL" | "CFB";
export type FootballBlindResumeRevealCount = typeof FOOTBALL_BLIND_RESUME_REVEAL_COUNTS[number];
export type FootballBlindResumeDifficulty = "easy" | "medium" | "hard" | "villain";

export interface FootballBlindResumeFactSource {
  owner: "footballFactualStats";
  metricId: FootballFactMetricId;
}

export interface FootballBlindResumeStat {
  label: string;
  valueA: string;
  valueB: string;
  source?: FootballBlindResumeFactSource;
}

export interface FootballBlindResumeMatchup {
  id: string;
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  prompt: string;
  leftId: string;
  rightId: string;
  difficulty: FootballBlindResumeDifficulty;
  stats: readonly FootballBlindResumeStat[];
}

export interface FootballBlindResumeRound extends FootballBlindResumeMatchup {
  leftName: string;
  rightName: string;
  leftSubtitle: string;
  rightSubtitle: string;
  leftRating: number;
  rightRating: number;
  winnerId: string;
}

export interface FootballBlindResumeRun {
  rounds: FootballBlindResumeRound[];
  identity: PlayLineupIdentity;
}

interface MatchupFamily {
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  prompt: string;
}

const MATCHUP_FAMILIES: readonly MatchupFamily[] = [
  { packId: "nfl-quarterbacks", league: "NFL", prompt: "Which NFL quarterback resume is greater?" },
  { packId: "nfl-running-backs", league: "NFL", prompt: "Which NFL running back resume is greater?" },
  { packId: "nfl-wide-receivers", league: "NFL", prompt: "Which NFL wide receiver resume is greater?" },
  { packId: "nfl-tight-ends", league: "NFL", prompt: "Which NFL tight end resume is greater?" },
  { packId: "nfl-defensive-players", league: "NFL", prompt: "Which NFL defensive resume is greater?" },
  { packId: "nfl-head-coaches", league: "NFL", prompt: "Which NFL head-coaching resume is greater?" },
  { packId: "nfl-qb-seasons", league: "NFL", prompt: "Which NFL quarterback single-season resume is greater?" },
  { packId: "nfl-team-seasons", league: "NFL", prompt: "Which single-season team resume is greater?" },
  { packId: "college-quarterbacks", league: "CFB", prompt: "Which college quarterback resume is greater?" },
  { packId: "college-head-coaches", league: "CFB", prompt: "Which college head-coaching resume is greater?" },
  { packId: "college-programs", league: "CFB", prompt: "Which program has the stronger resume since 2000?" },
  { packId: "college-program-eras", league: "CFB", prompt: "Which defined college program era is greater?" },
  { packId: "college-team-seasons", league: "CFB", prompt: "Which single-season team resume is greater?" },
] as const;

const FACT_METRICS_BY_PACK: Partial<Record<FootballRankFivePackId, readonly FootballFactMetricId[]>> = {
  "nfl-quarterbacks": [
    "nfl-career-passing-yards",
    "nfl-career-passing-touchdowns",
    "nfl-ap-mvp-awards",
    "nfl-super-bowl-titles",
  ],
  "nfl-running-backs": [
    "nfl-career-rushing-yards",
    "nfl-career-rushing-touchdowns",
  ],
  "college-team-seasons": [
    "cfb-team-wins",
    "cfb-team-losses",
    "cfb-team-points-per-game",
    "cfb-team-srs",
    "cfb-national-title",
  ],
};

const FACT_FIRST_PAIRS: readonly {
  packId: FootballRankFivePackId;
  leftId: string;
  rightId: string;
}[] = [
  { packId: "nfl-quarterbacks", leftId: "dan-marino", rightId: "john-elway" },
  { packId: "nfl-running-backs", leftId: "barry-sanders", rightId: "emmitt-smith" },
  { packId: "college-team-seasons", leftId: "2005-texas", rightId: "2013-florida-state" },
];

const AUTO_MATCHUPS_PER_FAMILY = 8;
const AUTO_SUBJECT_LIMIT = AUTO_MATCHUPS_PER_FAMILY * 2;

function pairKey(packId: FootballRankFivePackId, leftId: string, rightId: string) {
  return `${packId}:${[leftId, rightId].sort().join("|")}`;
}

function trimClause(value: string) {
  return value.trim().replace(/[.]+$/g, "");
}

function qualitativeText(value: string) {
  return trimClause(value)
    .replace(/\d[\d,.]*(?:\.\d+)?(?:%|×)?/g, "")
    .replace(/\s*[-–—]\s*(?=yard|game|season|year|time)/gi, " ")
    .replace(/\s+/g, " ")
    .replace(/^\s*[·/:]+\s*|\s*[·/:]+\s*$/g, "")
    .trim();
}

function resumePieces(item: FootballRankFiveItem) {
  const basisPieces = (item.ratingBasis ?? "")
    .split(/[,;]+|\band\b|\bwith\b|\bwithout\b|\bbut\b|\bacross\b|\boffset by\b|\bbalanced by\b|\bdespite\b/gi)
    .map(qualitativeText)
    .filter(Boolean);
  const sourcePieces = [item.subtitle, ...basisPieces, item.ratingBasis ?? ""]
    .map(qualitativeText)
    .filter(Boolean)
    .filter((value, index, rows) => rows.indexOf(value) === index);
  const combinations = sourcePieces.flatMap((first, firstIndex) =>
    sourcePieces.flatMap((second, secondIndex) =>
      firstIndex === secondIndex ? [] : [trimClause(`${first}; ${second}`)]));
  const unique = [...sourcePieces, ...combinations]
    .filter(Boolean)
    .filter((value, index, rows) => rows.indexOf(value) === index);
  while (unique.length < 8) unique.push(unique.at(-1) ?? "Qualitative resume context");
  return unique.slice(0, 8);
}

function factualStats(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
) {
  return (FACT_METRICS_BY_PACK[packId] ?? []).flatMap((metricId) => {
    const left = getFootballFact(leftId, metricId);
    const right = getFootballFact(rightId, metricId);
    if (!left || !right) return [];
    return [{
      label: left.definition.label,
      valueA: formatFootballFact(metricId, left.fact.value),
      valueB: formatFootballFact(metricId, right.fact.value),
      source: { owner: "footballFactualStats", metricId } as const,
    }];
  });
}

const QUALITATIVE_LABELS = [
  "Resume headline",
  "Primary resume marker",
  "Secondary resume marker",
  "Peak / production case",
  "Longevity / context",
  "Supporting context",
  "Additional context",
  "Signature edge",
] as const;

function difficultyFor(
  family: MatchupFamily,
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
): FootballBlindResumeDifficulty {
  const gap = Math.abs(left.rating - right.rating);
  if (gap >= 3) return "easy";
  if (gap === 2) return "medium";
  const villainRoll = seededLineupRandom(
    FOOTBALL_BLIND_RESUME_GAME_ID,
    "difficulty",
    family.packId,
    left.id,
    right.id,
  )();
  return villainRoll < 0.45 ? "villain" : "hard";
}

function matchupStats(
  packId: FootballRankFivePackId,
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
  difficulty: FootballBlindResumeDifficulty,
) {
  const facts = factualStats(packId, left.id, right.id);
  const leftPieces = resumePieces(left);
  const rightPieces = resumePieces(right);
  const qualitative = QUALITATIVE_LABELS.map((label, index) => ({
    label,
    valueA: leftPieces[index]!,
    valueB: rightPieces[index]!,
  }));

  const ordered = difficulty === "easy"
    ? [...facts, ...qualitative]
    : difficulty === "medium"
      ? [qualitative[0]!, qualitative[1]!, ...facts, ...qualitative.slice(2)]
      : difficulty === "hard"
        ? [qualitative[0]!, qualitative[1]!, qualitative[3]!, qualitative[4]!, ...facts, qualitative[2]!, ...qualitative.slice(5)]
        : [qualitative[0]!, qualitative[3]!, qualitative[1]!, qualitative[4]!, qualitative[2]!, ...facts, ...qualitative.slice(5)];

  return ordered.slice(0, 8);
}

function makeMatchup(
  family: MatchupFamily,
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
): FootballBlindResumeMatchup {
  if (left.rating === right.rating) {
    throw new Error(
      `Football Blind Resume cannot build tied canonical matchup ${family.packId}:${left.id}:${right.id}.`,
    );
  }
  const difficulty = difficultyFor(family, left, right);
  return {
    id: `${family.packId}-${left.id}-v-${right.id}`,
    packId: family.packId,
    league: family.league,
    prompt: family.prompt,
    leftId: left.id,
    rightId: right.id,
    difficulty,
    stats: matchupStats(family.packId, left, right, difficulty),
  };
}

function buildMatchupCatalog() {
  const matchups: FootballBlindResumeMatchup[] = [];
  const seenPairs = new Set<string>();

  const add = (
    family: MatchupFamily,
    left: FootballRankFiveItem | undefined,
    right: FootballRankFiveItem | undefined,
  ) => {
    if (!left || !right || left.id === right.id || left.rating === right.rating) return;
    const key = pairKey(family.packId, left.id, right.id);
    if (seenPairs.has(key)) return;
    seenPairs.add(key);
    matchups.push(makeMatchup(family, left, right));
  };

  for (const preferred of FACT_FIRST_PAIRS) {
    const family = MATCHUP_FAMILIES.find((row) => row.packId === preferred.packId)!;
    const pack = getFootballRankFivePack(preferred.packId);
    add(
      family,
      pack.items.find((item) => item.id === preferred.leftId),
      pack.items.find((item) => item.id === preferred.rightId),
    );
  }

  for (const family of MATCHUP_FAMILIES) {
    const items = getFootballRankFivePack(family.packId).items.slice(0, AUTO_SUBJECT_LIMIT);
    for (let index = 0; index + 1 < items.length; index += 2) {
      add(family, items[index], items[index + 1]);
    }
  }

  return matchups;
}

export const footballBlindResumeMatchups: readonly FootballBlindResumeMatchup[] = buildMatchupCatalog();

function resolveMatchup(matchup: FootballBlindResumeMatchup): FootballBlindResumeRound {
  const pack = getFootballRankFivePack(matchup.packId);
  const left = pack.items.find((item) => item.id === matchup.leftId);
  const right = pack.items.find((item) => item.id === matchup.rightId);
  if (!left || !right) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} references an item outside ${matchup.packId}.`);
  }
  if (left.rating === right.rating) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} cannot use a tied canonical rating.`);
  }
  return {
    ...matchup,
    leftName: left.name,
    rightName: right.name,
    leftSubtitle: left.subtitle,
    rightSubtitle: right.subtitle,
    leftRating: left.rating,
    rightRating: right.rating,
    winnerId: left.rating > right.rating ? left.id : right.id,
  };
}

export function resolvedFootballBlindResumeMatchups() {
  return footballBlindResumeMatchups.map(resolveMatchup);
}

const nflQuarterbackCareerIds = new Set(
  getFootballRankFivePack("nfl-quarterbacks").items.map((item) => item.id),
);

export function footballBlindResumeSubjectIdentityId(subjectId: string) {
  for (const careerId of nflQuarterbackCareerIds) {
    if (subjectId === careerId || subjectId.startsWith(`${careerId}-`)) return careerId;
  }
  return subjectId;
}

export function footballBlindResumeDifficultyLabel(difficulty: FootballBlindResumeDifficulty) {
  if (difficulty === "villain") return "VILLAIN";
  return difficulty.toUpperCase();
}

function canUseRound(
  matchup: FootballBlindResumeRound,
  usedMatchupIds: ReadonlySet<string>,
  usedSubjectIds: ReadonlySet<string>,
) {
  return !usedMatchupIds.has(matchup.id)
    && !usedSubjectIds.has(footballBlindResumeSubjectIdentityId(matchup.leftId))
    && !usedSubjectIds.has(footballBlindResumeSubjectIdentityId(matchup.rightId));
}

export function buildFootballBlindResumeRounds(
  seed: string,
  requestedDifficulties?: readonly FootballBlindResumeDifficulty[],
) {
  if (requestedDifficulties && requestedDifficulties.length !== FOOTBALL_BLIND_RESUME_ROUNDS) {
    throw new Error("Football Blind Resume difficulty slate must contain exactly five rounds.");
  }

  const random = seededLineupRandom(FOOTBALL_BLIND_RESUME_GAME_ID, seed);
  const shuffled = shuffleLineup(resolvedFootballBlindResumeMatchups(), random);
  const leagueOrder: readonly (FootballBlindResumeLeague | null)[] = random() < 0.5
    ? ["NFL", "CFB", "NFL", "CFB", null]
    : ["CFB", "NFL", "CFB", "NFL", null];

  const search = (
    index: number,
    selected: FootballBlindResumeRound[],
    usedMatchupIds: Set<string>,
    usedSubjectIds: Set<string>,
    usedPackIds: Set<FootballRankFivePackId>,
  ): FootballBlindResumeRound[] | null => {
    if (index === FOOTBALL_BLIND_RESUME_ROUNDS) {
      if (!requestedDifficulties && new Set(selected.map((round) => round.difficulty)).size < 2) return null;
      return selected;
    }
    const desiredDifficulty = requestedDifficulties?.[index] ?? null;
    const desiredLeague = leagueOrder[index];
    const candidates = shuffled.filter((matchup) =>
      (!desiredDifficulty || matchup.difficulty === desiredDifficulty)
      && (!desiredLeague || matchup.league === desiredLeague)
      && !usedPackIds.has(matchup.packId)
      && canUseRound(matchup, usedMatchupIds, usedSubjectIds));

    for (const matchup of candidates) {
      const nextMatchupIds = new Set(usedMatchupIds).add(matchup.id);
      const nextSubjectIds = new Set(usedSubjectIds);
      nextSubjectIds.add(footballBlindResumeSubjectIdentityId(matchup.leftId));
      nextSubjectIds.add(footballBlindResumeSubjectIdentityId(matchup.rightId));
      const nextPackIds = new Set(usedPackIds).add(matchup.packId);
      const result = search(index + 1, [...selected, matchup], nextMatchupIds, nextSubjectIds, nextPackIds);
      if (result) return result;
    }
    return null;
  };

  const selected = search(0, [], new Set(), new Set(), new Set());
  if (!selected) {
    const requested = requestedDifficulties ? ` difficulty slate ${requestedDifficulties.join("/")}` : " mixed casual slate";
    throw new Error(`Football Blind Resume catalog cannot satisfy${requested}.`);
  }
  return selected;
}

export function createFootballBlindResumeRun(): FootballBlindResumeRun {
  const resolved = resolvedFootballBlindResumeMatchups();
  const validMatchupIds = new Set(resolved.map((row) => row.id));
  const validSubjectIds = new Set(resolved.flatMap((row) => [
    footballBlindResumeSubjectIdentityId(row.leftId),
    footballBlindResumeSubjectIdentityId(row.rightId),
  ]));
  const selected = selectReplayLineup({
    gameId: FOOTBALL_BLIND_RESUME_GAME_ID,
    lineupSize: FOOTBALL_BLIND_RESUME_ROUNDS,
    attempts: 12,
    validItemIds: validMatchupIds,
    validFighterIds: validSubjectIds,
    seedFactory: () => createReplaySeed(FOOTBALL_BLIND_RESUME_GAME_ID),
    build: (seed) => {
      const rounds = buildFootballBlindResumeRounds(seed);
      return {
        value: rounds,
        itemIds: rounds.map((round) => round.id),
        fighterIds: rounds.flatMap((round) => [
          footballBlindResumeSubjectIdentityId(round.leftId),
          footballBlindResumeSubjectIdentityId(round.rightId),
        ]),
      };
    },
  });
  return { rounds: selected.value, identity: selected.identity };
}

export function footballBlindResumeNextRevealCount(value: FootballBlindResumeRevealCount) {
  const index = FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.indexOf(value);
  return index >= 0 ? FOOTBALL_BLIND_RESUME_REVEAL_COUNTS[index + 1] ?? null : null;
}

export function footballBlindResumeRoundPoints(
  revealedCount: FootballBlindResumeRevealCount,
  correct: boolean,
) {
  const index = FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.indexOf(revealedCount);
  if (index < 0) throw new Error(`Unsupported Football Blind Resume reveal count ${revealedCount}.`);
  return correct ? [20, 15, 10, 5, 2][index]! : 0;
}

export function footballBlindResumeScore(correct: number) {
  return Math.max(0, Math.min(100, correct * 20));
}

export function footballBlindResumeTier(correct: number) {
  if (correct === 5) return "FRONT OFFICE SAVANT";
  if (correct === 4) return "ELITE BALL KNOWER";
  if (correct === 3) return "SOLID TAPE";
  if (correct === 2) return "GROUP CHAT GM";
  return "BACK TO THE FILM";
}

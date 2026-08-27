import { blindResumeV3RoundPoints } from "../play/blindResumeV3";
import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  buildFootballBlindResumeCanonicalEvidencePair,
  type FootballBlindResumeArchetype,
} from "./footballFactualStats";
import {
  buildFootballComparisonCandidatePool,
  type FootballComparisonCandidate,
} from "./footballComparisonAuthority";
import {
  getFootballRankFivePack,
  type FootballRankFivePackId,
} from "./footballRankFiveModel";

export const FOOTBALL_BLIND_RESUME_GAME_ID = "football-blind-resume";
export const FOOTBALL_BLIND_RESUME_ROUNDS = 5;
export const FOOTBALL_BLIND_RESUME_REVEAL_COUNTS = [2, 4, 6, 8] as const;
export const FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES = ["villain", "hard", "villain", "hard", "medium"] as const;

export type FootballBlindResumeLeague = "NFL" | "CFB";
export type FootballBlindResumeRevealCount = typeof FOOTBALL_BLIND_RESUME_REVEAL_COUNTS[number];
export type FootballBlindResumeDifficulty = "easy" | "medium" | "hard" | "villain";

export interface FootballBlindResumeFactSource {
  owner: "footballFactualStats";
  dimensionId: string;
}

export interface FootballBlindResumeStat {
  label: string;
  valueA: string;
  valueB: string;
  source: FootballBlindResumeFactSource;
}

export interface FootballBlindResumeMatchup {
  id: string;
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  archetype: FootballBlindResumeArchetype;
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
  archetype: FootballBlindResumeArchetype;
  prompt: string;
}

const MATCHUP_FAMILIES: readonly MatchupFamily[] = [
  { packId: "nfl-quarterbacks", league: "NFL", archetype: "player-career", prompt: "Which NFL quarterback career was greater?" },
  { packId: "nfl-running-backs", league: "NFL", archetype: "player-career", prompt: "Which NFL running back career was greater?" },
  { packId: "nfl-wide-receivers", league: "NFL", archetype: "player-career", prompt: "Which NFL wide receiver career was greater?" },
  { packId: "nfl-tight-ends", league: "NFL", archetype: "player-career", prompt: "Which NFL tight end career was greater?" },
  { packId: "nfl-defensive-players", league: "NFL", archetype: "player-career", prompt: "Which NFL defensive career was greater?" },
  { packId: "nfl-head-coaches", league: "NFL", archetype: "coach", prompt: "Which NFL head-coaching career was greater?" },
  { packId: "nfl-qb-seasons", league: "NFL", archetype: "player-season", prompt: "Which NFL quarterback season was greater?" },
  { packId: "nfl-team-seasons", league: "NFL", archetype: "team-season", prompt: "Which NFL team season was greater?" },
  { packId: "college-quarterbacks", league: "CFB", archetype: "player-season", prompt: "Which college quarterback season was greater?" },
  { packId: "college-head-coaches", league: "CFB", archetype: "coach", prompt: "Which college head-coaching career was greater?" },
  { packId: "college-programs", league: "CFB", archetype: "program-era", prompt: "Which program has the stronger resume since 2000?" },
  { packId: "college-program-eras", league: "CFB", archetype: "program-era", prompt: "Which defined college program era was greater?" },
  { packId: "college-team-seasons", league: "CFB", archetype: "team-season", prompt: "Which college team season was greater?" },
] as const;

function pairKey(packId: FootballRankFivePackId, leftId: string, rightId: string) {
  return `${packId}:${[leftId, rightId].sort().join("|")}`;
}

const VILLAIN_TIGHT_PAIRS = new Set<string>([
  pairKey("nfl-quarterbacks", "joe-montana", "peyton-manning"),
  pairKey("nfl-quarterbacks", "drew-brees", "dan-marino"),
  pairKey("nfl-running-backs", "barry-sanders", "walter-payton"),
  pairKey("nfl-wide-receivers", "terrell-owens", "calvin-johnson"),
  pairKey("nfl-defensive-players", "lawrence-taylor", "reggie-white"),
  pairKey("nfl-defensive-players", "ray-lewis", "jj-watt"),
  pairKey("nfl-head-coaches", "bill-belichick", "vince-lombardi"),
  pairKey("nfl-head-coaches", "don-shula", "bill-walsh"),
  pairKey("nfl-qb-seasons", "tom-brady-2007", "aaron-rodgers-2011"),
  pairKey("nfl-qb-seasons", "patrick-mahomes-2022", "steve-young-1994"),
  pairKey("nfl-team-seasons", "1972-miami-dolphins", "1985-chicago-bears"),
  pairKey("college-quarterbacks", "cam-newton-2010", "joe-burrow-2019"),
  pairKey("college-quarterbacks", "vince-young-2005", "tim-tebow-2007"),
  pairKey("college-programs", "ohio-state-program", "georgia-program"),
  pairKey("college-program-eras", "georgia-2021-2024", "usc-2002-2008"),
  pairKey("college-team-seasons", "2020-alabama", "2005-texas"),
]);

const comparisonCandidatesByPack = new Map<FootballRankFivePackId, readonly FootballComparisonCandidate[]>();

export function footballBlindResumeCandidatesForPack(packId: FootballRankFivePackId) {
  const existing = comparisonCandidatesByPack.get(packId);
  if (existing) return existing;
  const reviewed = getFootballRankFivePack(packId).items;
  const candidates = buildFootballComparisonCandidatePool(packId, reviewed);
  comparisonCandidatesByPack.set(packId, candidates);
  return candidates;
}

function normalizedEvidenceRow(row: FootballBlindResumeStat) {
  return `${row.label}|${row.valueA}|${row.valueB}`.trim().toLowerCase().replace(/\s+/g, " ");
}

function tryBuildFootballBlindResumeEvidence(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
  archetype: FootballBlindResumeArchetype,
) {
  const pair = buildFootballBlindResumeCanonicalEvidencePair(packId, leftId, rightId, archetype);
  if (!pair || pair.left.length !== 8 || pair.right.length !== 8) return null;

  const stats = pair.left.map((leftRow, index) => {
    const rightRow = pair.right[index];
    if (!rightRow || leftRow.dimensionId !== rightRow.dimensionId || leftRow.label !== rightRow.label) return null;
    return {
      label: leftRow.label,
      valueA: leftRow.value,
      valueB: rightRow.value,
      source: {
        owner: "footballFactualStats",
        dimensionId: leftRow.dimensionId,
      } as const,
    };
  });
  if (stats.some((row) => row == null)) return null;
  const complete = stats as FootballBlindResumeStat[];
  const dimensions = new Set(complete.map((row) => row.source.dimensionId));
  const labels = new Set(complete.map((row) => row.label.trim().toLowerCase()));
  const rows = new Set(complete.map(normalizedEvidenceRow));
  if (dimensions.size !== 8 || labels.size !== 8 || rows.size !== 8) return null;
  return complete;
}

export function buildFootballBlindResumeEvidence(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
  archetype: FootballBlindResumeArchetype,
) {
  const stats = tryBuildFootballBlindResumeEvidence(packId, leftId, rightId, archetype);
  if (!stats) {
    throw new Error(`Football Blind Resume ${packId}:${leftId}:${rightId} does not have eight truthful aligned evidence rows.`);
  }
  return stats;
}

function difficultyFor(
  family: MatchupFamily,
  left: FootballComparisonCandidate,
  right: FootballComparisonCandidate,
): FootballBlindResumeDifficulty {
  const gap = Math.abs(left.rating - right.rating);
  if (gap >= 3) return "easy";
  if (gap === 2) return "medium";
  if (gap !== 1) {
    throw new Error(`Football Blind Resume cannot build tied canonical matchup ${family.packId}:${left.id}:${right.id}.`);
  }
  return VILLAIN_TIGHT_PAIRS.has(pairKey(family.packId, left.id, right.id)) ? "villain" : "hard";
}

function makeMatchup(
  family: MatchupFamily,
  left: FootballComparisonCandidate,
  right: FootballComparisonCandidate,
  stats: readonly FootballBlindResumeStat[],
): FootballBlindResumeMatchup {
  return {
    id: `${family.packId}-${left.id}-v-${right.id}`,
    packId: family.packId,
    league: family.league,
    archetype: family.archetype,
    prompt: family.prompt,
    leftId: left.id,
    rightId: right.id,
    difficulty: difficultyFor(family, left, right),
    stats,
  };
}

const NFL_MATCHUP_DIFFICULTY_TARGETS = [
  { difficulty: "hard", target: 6 },
  { difficulty: "medium", target: 6 },
  { difficulty: "easy", target: 12 },
] as const;
const CFB_MATCHUP_DIFFICULTY_TARGETS = [
  { difficulty: "hard", target: 2 },
  { difficulty: "medium", target: 2 },
  { difficulty: "easy", target: 20 },
] as const;

function stableCatalogHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shouldFlipPair(key: string) {
  let parity = 0;
  for (let index = 0; index < key.length; index += 1) parity ^= key.charCodeAt(index) & 1;
  return parity === 1;
}

interface MatchupOption {
  first: FootballComparisonCandidate;
  second: FootballComparisonCandidate;
  key: string;
}

function buildMatchupCatalog() {
  const matchups: FootballBlindResumeMatchup[] = [];
  const seenPairs = new Set<string>();

  for (const family of MATCHUP_FAMILIES) {
    const items = footballBlindResumeCandidatesForPack(family.packId);
    if (items.length < 4) {
      throw new Error(`Football Blind Resume ${family.packId} requires at least four canonical A-C candidates.`);
    }

    const familyStart = matchups.length;
    const itemById = new Map(items.map((item) => [item.id, item] as const));
    const subjectDegrees = new Map<string, number>();
    const maxSubjectDegree = family.league === "CFB" ? 2 : Number.POSITIVE_INFINITY;

    const addPair = (
      first: FootballComparisonCandidate,
      second: FootballComparisonCandidate,
      subjectDegreeLimit = maxSubjectDegree,
    ) => {
      if (first.rating === second.rating) return null;
      if ((subjectDegrees.get(first.id) ?? 0) >= subjectDegreeLimit || (subjectDegrees.get(second.id) ?? 0) >= subjectDegreeLimit) return null;
      const key = pairKey(family.packId, first.id, second.id);
      if (seenPairs.has(key)) return null;
      const [left, right] = shouldFlipPair(key) ? [second, first] : [first, second];
      const stats = tryBuildFootballBlindResumeEvidence(family.packId, left.id, right.id, family.archetype);
      if (!stats) return null;
      const matchup = makeMatchup(family, left, right, stats);
      seenPairs.add(key);
      subjectDegrees.set(first.id, (subjectDegrees.get(first.id) ?? 0) + 1);
      subjectDegrees.set(second.id, (subjectDegrees.get(second.id) ?? 0) + 1);
      matchups.push(matchup);
      return matchup.difficulty;
    };

    const villainPrefix = `${family.packId}:`;
    for (const key of VILLAIN_TIGHT_PAIRS) {
      if (!key.startsWith(villainPrefix)) continue;
      const [firstId, secondId] = key.slice(villainPrefix.length).split("|");
      const first = firstId ? itemById.get(firstId) : null;
      const second = secondId ? itemById.get(secondId) : null;
      if (first && second) addPair(first, second);
    }

    const plans = family.league === "CFB" ? CFB_MATCHUP_DIFFICULTY_TARGETS : NFL_MATCHUP_DIFFICULTY_TARGETS;
    for (const plan of plans) {
      let addedForDifficulty = 0;
      const options: MatchupOption[] = [];
      for (let leftIndex = 0; leftIndex < items.length - 1; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
          const first = items[leftIndex]!;
          const second = items[rightIndex]!;
          if (first.rating === second.rating) continue;
          const key = pairKey(family.packId, first.id, second.id);
          if (seenPairs.has(key) || difficultyFor(family, first, second) !== plan.difficulty) continue;
          options.push({ first, second, key });
        }
      }

      while (options.length && addedForDifficulty < plan.target) {
        options.sort((left, right) => {
          const leftFirstDegree = subjectDegrees.get(left.first.id) ?? 0;
          const leftSecondDegree = subjectDegrees.get(left.second.id) ?? 0;
          const rightFirstDegree = subjectDegrees.get(right.first.id) ?? 0;
          const rightSecondDegree = subjectDegrees.get(right.second.id) ?? 0;
          const maxDegreeDelta = Math.max(leftFirstDegree, leftSecondDegree) - Math.max(rightFirstDegree, rightSecondDegree);
          if (maxDegreeDelta !== 0) return maxDegreeDelta;
          const totalDegreeDelta = leftFirstDegree + leftSecondDegree - rightFirstDegree - rightSecondDegree;
          if (totalDegreeDelta !== 0) return totalDegreeDelta;
          return stableCatalogHash(left.key) - stableCatalogHash(right.key);
        });

        const option = options.shift()!;
        const addedDifficulty = addPair(option.first, option.second);
        if (addedDifficulty === plan.difficulty) addedForDifficulty += 1;
      }
    }

    if (matchups.length - familyStart < 5) {
      const fallbackOptions: MatchupOption[] = [];
      for (let leftIndex = 0; leftIndex < items.length - 1; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
          const first = items[leftIndex]!;
          const second = items[rightIndex]!;
          if (first.rating === second.rating) continue;
          const key = pairKey(family.packId, first.id, second.id);
          if (!seenPairs.has(key)) fallbackOptions.push({ first, second, key });
        }
      }
      while (fallbackOptions.length && matchups.length - familyStart < 5) {
        fallbackOptions.sort((left, right) => {
          const leftDegree = (subjectDegrees.get(left.first.id) ?? 0) + (subjectDegrees.get(left.second.id) ?? 0);
          const rightDegree = (subjectDegrees.get(right.first.id) ?? 0) + (subjectDegrees.get(right.second.id) ?? 0);
          return leftDegree - rightDegree || stableCatalogHash(left.key) - stableCatalogHash(right.key);
        });
        const option = fallbackOptions.shift()!;
        addPair(option.first, option.second, Math.max(maxSubjectDegree, 3));
      }
    }

    if (matchups.length - familyStart < 5) {
      throw new Error(`Football Blind Resume ${family.packId} does not have enough complete matchup inventory.`);
    }
  }

  if (matchups.length < 80) {
    throw new Error(`Football Blind Resume factual catalog is too shallow: ${matchups.length} matchups.`);
  }
  return matchups;
}

export const footballBlindResumeMatchups: readonly FootballBlindResumeMatchup[] = buildMatchupCatalog();

function resolveMatchup(matchup: FootballBlindResumeMatchup): FootballBlindResumeRound {
  const candidates = footballBlindResumeCandidatesForPack(matchup.packId);
  const left = candidates.find((item) => item.id === matchup.leftId);
  const right = candidates.find((item) => item.id === matchup.rightId);
  if (!left || !right) {
    throw new Error(`Football Blind Resume matchup ${matchup.id} references an item outside canonical ${matchup.packId}.`);
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

const resolvedFootballBlindResumeMatchupCatalog: readonly FootballBlindResumeRound[] = footballBlindResumeMatchups.map(resolveMatchup);

export function resolvedFootballBlindResumeMatchups() {
  return resolvedFootballBlindResumeMatchupCatalog;
}

const MATCHUP_INDEX_ANY = "*" as const;
const matchupSelectionIndex = new Map<string, readonly FootballBlindResumeRound[]>();

function matchupSelectionKey(
  league: FootballBlindResumeLeague | null,
  difficulty: FootballBlindResumeDifficulty | null,
) {
  return `${league ?? MATCHUP_INDEX_ANY}|${difficulty ?? MATCHUP_INDEX_ANY}`;
}

function buildMatchupSelectionIndex() {
  const mutable = new Map<string, FootballBlindResumeRound[]>();
  for (const matchup of resolvedFootballBlindResumeMatchupCatalog) {
    for (const league of [null, matchup.league] as const) {
      for (const difficulty of [null, matchup.difficulty] as const) {
        const key = matchupSelectionKey(league, difficulty);
        const rows = mutable.get(key) ?? [];
        rows.push(matchup);
        mutable.set(key, rows);
      }
    }
  }
  for (const [key, rows] of mutable) matchupSelectionIndex.set(key, rows);
}

buildMatchupSelectionIndex();

const nflQuarterbackCareerIds = new Set(footballBlindResumeCandidatesForPack("nfl-quarterbacks").map((item) => item.id));

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

function chooseEligibleMatchup(
  pool: readonly FootballBlindResumeRound[],
  eligible: readonly FootballBlindResumeRound[],
  random: () => number,
) {
  const eligibleByPack = new Map<FootballRankFivePackId, FootballBlindResumeRound[]>();
  for (const matchup of eligible) {
    const rows = eligibleByPack.get(matchup.packId) ?? [];
    rows.push(matchup);
    eligibleByPack.set(matchup.packId, rows);
  }

  const baselineCounts = new Map<FootballRankFivePackId, number>();
  const subjectDegreesByPack = new Map<FootballRankFivePackId, Map<string, number>>();
  for (const matchup of pool) {
    if (!eligibleByPack.has(matchup.packId)) continue;
    baselineCounts.set(matchup.packId, (baselineCounts.get(matchup.packId) ?? 0) + 1);
    const degrees = subjectDegreesByPack.get(matchup.packId) ?? new Map<string, number>();
    for (const subjectId of [
      footballBlindResumeSubjectIdentityId(matchup.leftId),
      footballBlindResumeSubjectIdentityId(matchup.rightId),
    ]) {
      degrees.set(subjectId, (degrees.get(subjectId) ?? 0) + 1);
    }
    subjectDegreesByPack.set(matchup.packId, degrees);
  }

  const weightedPacks = [...eligibleByPack.entries()].map(([packId, rows]) => {
    const baselineCount = baselineCounts.get(packId) ?? rows.length;
    const degrees = subjectDegreesByPack.get(packId);
    const maxSubjectDegree = degrees?.size ? Math.max(...degrees.values()) : 1;
    return {
      rows,
      weight: baselineCount / maxSubjectDegree,
    };
  });
  const totalWeight = weightedPacks.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = random() * totalWeight;
  let chosenRows = weightedPacks[weightedPacks.length - 1]!.rows;
  for (const entry of weightedPacks) {
    if (roll < entry.weight) {
      chosenRows = entry.rows;
      break;
    }
    roll -= entry.weight;
  }

  return chosenRows[Math.floor(random() * chosenRows.length)]!;
}

const ROUND_BUILD_ATTEMPTS = 12;

export function buildFootballBlindResumeRounds(
  seed: string,
  requestedDifficulties?: readonly FootballBlindResumeDifficulty[],
) {
  if (requestedDifficulties && requestedDifficulties.length !== FOOTBALL_BLIND_RESUME_ROUNDS) {
    throw new Error("Football Blind Resume difficulty slate must contain exactly five rounds.");
  }

  for (let attempt = 0; attempt < ROUND_BUILD_ATTEMPTS; attempt += 1) {
    const random = seededLineupRandom(FOOTBALL_BLIND_RESUME_GAME_ID, seed, attempt);
    const leagueOrder: readonly (FootballBlindResumeLeague | null)[] = random() < 0.5
      ? ["NFL", "CFB", "NFL", "CFB", null]
      : ["CFB", "NFL", "CFB", "NFL", null];
    const selected: FootballBlindResumeRound[] = [];
    const usedMatchupIds = new Set<string>();
    const usedSubjectIds = new Set<string>();
    const usedPackIds = new Set<FootballRankFivePackId>();
    let failed = false;

    for (let index = 0; index < FOOTBALL_BLIND_RESUME_ROUNDS; index += 1) {
      const league = leagueOrder[index]!;
      const difficulty = requestedDifficulties?.[index] ?? null;
      const pool = matchupSelectionIndex.get(matchupSelectionKey(league, difficulty)) ?? [];
      if (!pool.length) {
        throw new Error(`Football Blind Resume has no ${league ?? "mixed"} ${difficulty ?? "mixed"} matchup inventory.`);
      }
      const eligible = pool.filter((matchup) => {
        if (usedPackIds.has(matchup.packId)) return false;
        return canUseRound(matchup, usedMatchupIds, usedSubjectIds);
      });
      if (!eligible.length) {
        failed = true;
        break;
      }

      const matchup = chooseEligibleMatchup(pool, eligible, random);
      selected.push(matchup);
      usedMatchupIds.add(matchup.id);
      usedSubjectIds.add(footballBlindResumeSubjectIdentityId(matchup.leftId));
      usedSubjectIds.add(footballBlindResumeSubjectIdentityId(matchup.rightId));
      usedPackIds.add(matchup.packId);
    }

    if (!failed && selected.length === FOOTBALL_BLIND_RESUME_ROUNDS) {
      if (!requestedDifficulties && new Set(selected.map((round) => round.difficulty)).size === 1) continue;
      return selected;
    }
  }

  const requested = requestedDifficulties ? ` difficulty slate ${requestedDifficulties.join("/")}` : " mixed casual slate";
  throw new Error(`Football Blind Resume catalog cannot satisfy${requested}.`);
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
  return blindResumeV3RoundPoints(revealedCount, correct);
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

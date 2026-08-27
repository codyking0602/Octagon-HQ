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
    throw new Error(
      `Football Blind Resume cannot build tied canonical matchup ${family.packId}:${left.id}:${right.id}.`,
    );
  }
  return VILLAIN_TIGHT_PAIRS.has(pairKey(family.packId, left.id, right.id)) ? "villain" : "hard";
}

function makeMatchup(
  family: MatchupFamily,
  left: FootballComparisonCandidate,
  right: FootballComparisonCandidate,
  stats: readonly FootballBlindResumeStat[],
): FootballBlindResumeMatchup {
  // The canonical query is the league gate. Multi-league people can carry a different primary profile league
  // while still qualifying this pack through their canonical `leagues` membership and pack-specific facts.
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

const MATCHUP_DIFFICULTY_TARGETS = [
  { difficulty: "hard", gaps: [1], target: 60 },
  { difficulty: "medium", gaps: [2], target: 60 },
  { difficulty: "easy", gaps: [3, 5, 8, 13, 21], target: 120 },
] as const;
const MAX_PARTNERS_PER_RATING_GAP = 2;

function greatestCommonDivisor(left: number, right: number) {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }
  return a;
}

function stableCatalogHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicIndexScan(length: number, key: string) {
  if (length <= 1) return { start: 0, step: 1 };
  const start = stableCatalogHash(`${key}|start`) % length;
  let step = 1 + (stableCatalogHash(`${key}|step`) % (length - 1));
  while (greatestCommonDivisor(step, length) !== 1) {
    step += 1;
    if (step >= length) step = 1;
  }
  return { start, step };
}

function shouldFlipPair(key: string) {
  let parity = 0;
  for (let index = 0; index < key.length; index += 1) parity ^= key.charCodeAt(index) & 1;
  return parity === 1;
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
    const byRating = new Map<number, FootballComparisonCandidate[]>();
    for (const item of items) {
      const rows = byRating.get(item.rating) ?? [];
      rows.push(item);
      byRating.set(item.rating, rows);
    }

    const addPair = (first: FootballComparisonCandidate, second: FootballComparisonCandidate) => {
      if (first.rating === second.rating) return null;
      const key = pairKey(family.packId, first.id, second.id);
      if (seenPairs.has(key)) return null;
      const [left, right] = shouldFlipPair(key) ? [second, first] : [first, second];
      const stats = tryBuildFootballBlindResumeEvidence(family.packId, left.id, right.id, family.archetype);
      if (!stats) return null;
      const matchup = makeMatchup(family, left, right, stats);
      seenPairs.add(key);
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

    for (const plan of MATCHUP_DIFFICULTY_TARGETS) {
      let addedForDifficulty = 0;
      const targetPerGap = Math.ceil(plan.target / plan.gaps.length);

      for (const gap of plan.gaps) {
        let addedForGap = 0;
        const itemScan = deterministicIndexScan(items.length, `${family.packId}|${plan.difficulty}|${gap}|items`);

        for (let itemOffset = 0; itemOffset < items.length; itemOffset += 1) {
          if (addedForDifficulty >= plan.target || addedForGap >= targetPerGap) break;
          const first = items[(itemScan.start + itemOffset * itemScan.step) % items.length]!;
          const partners = byRating.get(first.rating - gap) ?? [];
          if (!partners.length) continue;

          const partnerScan = deterministicIndexScan(
            partners.length,
            `${family.packId}|${plan.difficulty}|${gap}|${first.id}|partners`,
          );
          let addedForFirst = 0;
          for (let partnerOffset = 0; partnerOffset < partners.length; partnerOffset += 1) {
            const second = partners[(partnerScan.start + partnerOffset * partnerScan.step) % partners.length]!;
            const addedDifficulty = addPair(first, second);
            if (addedDifficulty === plan.difficulty) {
              addedForDifficulty += 1;
              addedForGap += 1;
              addedForFirst += 1;
            }
            if (
              addedForDifficulty >= plan.target
              || addedForGap >= targetPerGap
              || addedForFirst >= MAX_PARTNERS_PER_RATING_GAP
            ) break;
          }
        }
      }
    }

    if (matchups.length - familyStart < 5) {
      for (let leftIndex = 0; leftIndex < items.length - 1 && matchups.length - familyStart < 5; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < items.length && matchups.length - familyStart < 5; rightIndex += 1) {
          addPair(items[leftIndex]!, items[rightIndex]!);
        }
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

const resolvedFootballBlindResumeMatchupCatalog: readonly FootballBlindResumeRound[] =
  footballBlindResumeMatchups.map(resolveMatchup);

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

const nflQuarterbackCareerIds = new Set(
  footballBlindResumeCandidatesForPack("nfl-quarterbacks").map((item) => item.id),
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

      const matchup = eligible[Math.floor(random() * eligible.length)]!;
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

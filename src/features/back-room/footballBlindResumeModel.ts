import { blindResumeV3RoundPoints } from "../play/blindResumeV3";
import {
  createReplaySeed,
  seededLineupRandom,
  selectReplayLineup,
  shuffleLineup,
  type PlayLineupIdentity,
} from "../play/lineupModel";
import {
  getFootballBlindResumeEvidenceProfile,
  type FootballBlindResumeArchetype,
} from "./footballFactualStats";
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

interface FootballBlindResumeMatchupDefinition {
  packId: FootballRankFivePackId;
  league: FootballBlindResumeLeague;
  archetype: FootballBlindResumeArchetype;
  prompt: string;
  leftId: string;
  rightId: string;
  difficulty: FootballBlindResumeDifficulty;
}

const MATCHUP_DEFINITIONS: readonly FootballBlindResumeMatchupDefinition[] = [
  {
    packId: "nfl-quarterbacks",
    league: "NFL",
    archetype: "player-career",
    prompt: "Which NFL quarterback career was greater?",
    leftId: "tom-brady",
    rightId: "peyton-manning",
    difficulty: "villain",
  },
  {
    packId: "nfl-quarterbacks",
    league: "NFL",
    archetype: "player-career",
    prompt: "Which NFL quarterback career was greater?",
    leftId: "peyton-manning",
    rightId: "joe-montana",
    difficulty: "villain",
  },
  {
    packId: "nfl-running-backs",
    league: "NFL",
    archetype: "player-career",
    prompt: "Which NFL running back career was greater?",
    leftId: "barry-sanders",
    rightId: "emmitt-smith",
    difficulty: "medium",
  },
  {
    packId: "nfl-running-backs",
    league: "NFL",
    archetype: "player-career",
    prompt: "Which NFL running back career was greater?",
    leftId: "emmitt-smith",
    rightId: "walter-payton",
    difficulty: "medium",
  },
  {
    packId: "nfl-head-coaches",
    league: "NFL",
    archetype: "coach",
    prompt: "Which NFL head-coaching career was greater?",
    leftId: "bill-belichick",
    rightId: "don-shula",
    difficulty: "hard",
  },
  {
    packId: "nfl-head-coaches",
    league: "NFL",
    archetype: "coach",
    prompt: "Which NFL head-coaching career was greater?",
    leftId: "don-shula",
    rightId: "bill-walsh",
    difficulty: "hard",
  },
  {
    packId: "nfl-qb-seasons",
    league: "NFL",
    archetype: "player-season",
    prompt: "Which NFL quarterback season was greater?",
    leftId: "aaron-rodgers-2011",
    rightId: "patrick-mahomes-2022",
    difficulty: "hard",
  },
  {
    packId: "nfl-qb-seasons",
    league: "NFL",
    archetype: "player-season",
    prompt: "Which NFL quarterback season was greater?",
    leftId: "patrick-mahomes-2022",
    rightId: "steve-young-1994",
    difficulty: "hard",
  },
  {
    packId: "nfl-team-seasons",
    league: "NFL",
    archetype: "team-season",
    prompt: "Which NFL team season was greater?",
    leftId: "1972-miami-dolphins",
    rightId: "1985-chicago-bears",
    difficulty: "villain",
  },
  {
    packId: "nfl-team-seasons",
    league: "NFL",
    archetype: "team-season",
    prompt: "Which NFL team season was greater?",
    leftId: "1985-chicago-bears",
    rightId: "1991-washington",
    difficulty: "villain",
  },
  {
    packId: "college-quarterbacks",
    league: "CFB",
    archetype: "player-season",
    prompt: "Which college quarterback season was greater?",
    leftId: "cam-newton-2010",
    rightId: "joe-burrow-2019",
    difficulty: "villain",
  },
  {
    packId: "college-quarterbacks",
    league: "CFB",
    archetype: "player-season",
    prompt: "Which college quarterback season was greater?",
    leftId: "joe-burrow-2019",
    rightId: "vince-young-2005",
    difficulty: "villain",
  },
  {
    packId: "college-head-coaches",
    league: "CFB",
    archetype: "coach",
    prompt: "Which college head-coaching career was greater?",
    leftId: "nick-saban-cfb",
    rightId: "urban-meyer-cfb",
    difficulty: "hard",
  },
  {
    packId: "college-head-coaches",
    league: "CFB",
    archetype: "coach",
    prompt: "Which college head-coaching career was greater?",
    leftId: "urban-meyer-cfb",
    rightId: "bob-stoops-cfb",
    difficulty: "hard",
  },
  {
    packId: "college-program-eras",
    league: "CFB",
    archetype: "program-era",
    prompt: "Which defined college program era was greater?",
    leftId: "alabama-2009-2020",
    rightId: "usc-2002-2008",
    difficulty: "villain",
  },
  {
    packId: "college-program-eras",
    league: "CFB",
    archetype: "program-era",
    prompt: "Which defined college program era was greater?",
    leftId: "usc-2002-2008",
    rightId: "clemson-2015-2020",
    difficulty: "villain",
  },
  {
    packId: "college-team-seasons",
    league: "CFB",
    archetype: "team-season",
    prompt: "Which college team season was greater?",
    leftId: "2020-alabama",
    rightId: "2005-texas",
    difficulty: "hard",
  },
  {
    packId: "college-team-seasons",
    league: "CFB",
    archetype: "team-season",
    prompt: "Which college team season was greater?",
    leftId: "2005-texas",
    rightId: "2013-florida-state",
    difficulty: "hard",
  },
] as const;

function normalizedEvidenceRow(row: FootballBlindResumeStat) {
  return `${row.label}|${row.valueA}|${row.valueB}`.trim().toLowerCase().replace(/\s+/g, " ");
}

export function buildFootballBlindResumeEvidence(
  packId: FootballRankFivePackId,
  leftId: string,
  rightId: string,
  archetype: FootballBlindResumeArchetype,
) {
  const left = getFootballBlindResumeEvidenceProfile(packId, leftId);
  const right = getFootballBlindResumeEvidenceProfile(packId, rightId);
  if (left.archetype !== archetype || right.archetype !== archetype) {
    throw new Error(
      `Football Blind Resume ${packId}:${leftId}:${rightId} evidence does not match archetype ${archetype}.`,
    );
  }
  if (left.league !== right.league) {
    throw new Error(
      `Football Blind Resume ${packId}:${leftId}:${rightId} mixes factual evidence leagues.`,
    );
  }
  if (left.evidence.length !== 8 || right.evidence.length !== 8) {
    throw new Error(
      `Football Blind Resume ${packId}:${leftId}:${rightId} requires exactly 8 evidence rows per side.`,
    );
  }

  const stats = left.evidence.map((leftRow, index) => {
    const rightRow = right.evidence[index];
    if (
      !rightRow
      || leftRow.dimensionId !== rightRow.dimensionId
      || leftRow.label !== rightRow.label
    ) {
      throw new Error(
        `Football Blind Resume ${packId}:${leftId}:${rightId} evidence dimensions are misaligned at row ${index + 1}.`,
      );
    }
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

  const dimensions = new Set(stats.map((row) => row.source.dimensionId));
  const labels = new Set(stats.map((row) => row.label.trim().toLowerCase()));
  const rows = new Set(stats.map(normalizedEvidenceRow));
  if (dimensions.size !== 8 || labels.size !== 8 || rows.size !== 8) {
    throw new Error(
      `Football Blind Resume ${packId}:${leftId}:${rightId} contains duplicate evidence dimensions or rows.`,
    );
  }
  return stats;
}

function resolveDefinition(
  definition: FootballBlindResumeMatchupDefinition,
): FootballBlindResumeMatchup {
  const pack = getFootballRankFivePack(definition.packId);
  const left = pack.items.find((item) => item.id === definition.leftId);
  const right = pack.items.find((item) => item.id === definition.rightId);
  if (!left || !right) {
    throw new Error(
      `Football Blind Resume matchup ${definition.packId}:${definition.leftId}:${definition.rightId} references an item outside its canonical Rank 5 pack.`,
    );
  }
  if (left.league !== definition.league || right.league !== definition.league) {
    throw new Error(
      `Football Blind Resume matchup ${definition.packId}:${definition.leftId}:${definition.rightId} has a league mismatch.`,
    );
  }
  if (left.rating === right.rating) {
    throw new Error(
      `Football Blind Resume cannot build tied canonical matchup ${definition.packId}:${definition.leftId}:${definition.rightId}.`,
    );
  }
  const stats = buildFootballBlindResumeEvidence(
    definition.packId,
    definition.leftId,
    definition.rightId,
    definition.archetype,
  );
  return {
    ...definition,
    id: `${definition.packId}-${definition.leftId}-v-${definition.rightId}`,
    stats,
  };
}

function buildMatchupCatalog() {
  const ids = new Set<string>();
  const pairs = new Set<string>();
  return MATCHUP_DEFINITIONS.map((definition) => {
    const matchup = resolveDefinition(definition);
    const pair = `${matchup.packId}:${[matchup.leftId, matchup.rightId].sort().join("|")}`;
    if (ids.has(matchup.id) || pairs.has(pair)) {
      throw new Error(`Football Blind Resume duplicate matchup definition ${matchup.id}.`);
    }
    ids.add(matchup.id);
    pairs.add(pair);
    return matchup;
  });
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
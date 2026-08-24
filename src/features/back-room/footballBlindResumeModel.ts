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
  getFootballBlindResumeEvidenceProfilesForPack,
  type FootballBlindResumeArchetype,
} from "./footballFactualStats";
import {
  getFootballRankFivePack,
  type FootballRankFiveItem,
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

function difficultyFor(
  family: MatchupFamily,
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
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
  left: FootballRankFiveItem,
  right: FootballRankFiveItem,
): FootballBlindResumeMatchup {
  if (left.league !== family.league || right.league !== family.league) {
    throw new Error(
      `Football Blind Resume matchup ${family.packId}:${left.id}:${right.id} has a league mismatch.`,
    );
  }
  const difficulty = difficultyFor(family, left, right);
  return {
    id: `${family.packId}-${left.id}-v-${right.id}`,
    packId: family.packId,
    league: family.league,
    archetype: family.archetype,
    prompt: family.prompt,
    leftId: left.id,
    rightId: right.id,
    difficulty,
    stats: buildFootballBlindResumeEvidence(family.packId, left.id, right.id, family.archetype),
  };
}

function buildMatchupCatalog() {
  const matchups: FootballBlindResumeMatchup[] = [];
  const seenPairs = new Set<string>();

  for (const family of MATCHUP_FAMILIES) {
    const pack = getFootballRankFivePack(family.packId);
    const profiles = getFootballBlindResumeEvidenceProfilesForPack(family.packId);
    if (profiles.length < 4) {
      throw new Error(
        `Football Blind Resume ${family.packId} requires at least four complete factual evidence profiles.`,
      );
    }
    if (profiles.some((profile) => profile.league !== family.league || profile.archetype !== family.archetype)) {
      throw new Error(
        `Football Blind Resume ${family.packId} contains a factual evidence profile with the wrong league or archetype.`,
      );
    }

    const items = profiles.map((profile) => {
      const item = pack.items.find((row) => row.id === profile.subjectId);
      if (!item) {
        throw new Error(
          `Football Blind Resume factual evidence ${family.packId}:${profile.subjectId} has no canonical Rank 5 subject.`,
        );
      }
      return item;
    });

    const familyStart = matchups.length;
    for (let leftIndex = 0; leftIndex < items.length - 1; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
        const left = items[leftIndex]!;
        const right = items[rightIndex]!;
        const key = pairKey(family.packId, left.id, right.id);
        if (seenPairs.has(key)) {
          throw new Error(`Football Blind Resume duplicate matchup pair ${key}.`);
        }
        seenPairs.add(key);
        matchups.push(makeMatchup(family, left, right));
      }
    }

    if (matchups.length - familyStart < 5) {
      throw new Error(
        `Football Blind Resume ${family.packId} does not have enough complete matchup inventory.`,
      );
    }
  }

  if (matchups.length < 80) {
    throw new Error(
      `Football Blind Resume factual catalog is too shallow: ${matchups.length} matchups.`,
    );
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

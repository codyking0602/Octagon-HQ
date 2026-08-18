import {
  BLIND_RESUME_ROUNDS,
  blindResumeStats,
  blindResumeWinner,
  createBlindResumeRounds,
  type BlindResumePair,
  type BlindResumeStat,
} from "./blindResumeEngine";
import {
  blindRankPacks,
  blindRankTier,
  createBlindRankLineup,
} from "./blindRankEngine";
import { dailyFindLeaderBoard } from "./findLeaderEngine";
import {
  advanceOfficialHitTheNumberDailyRuntime,
  buildOfficialHitTheNumberDailySetup,
} from "./hitTheNumberDailyRuntime";
import {
  KEEP_CUT_PACKS,
  createKeepCutLineup,
  keepCutRating,
  keepCutTier,
} from "./keepCutEngine";
import { seededLineupRandom } from "./lineupModel";
import {
  blindRankRating,
  getPlayFighter,
  type PlayFighter,
} from "./playFighterPool";
import {
  OFFICIAL_SCORE_CONTRACT_VERSION,
  WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION,
} from "./officialScoreContract";
import {
  WAVELENGTH_CONTRACT_VERSIONS,
  createWavelengthRound,
  nextWavelengthClue,
  wavelengthClues,
  type WavelengthClue,
  type WavelengthRound,
} from "./wavelengthEngine";

export type OfficialDailyGameType =
  | "find_leader"
  | "blind_resume"
  | "wavelength"
  | "blind_rank_5"
  | "keep_4_cut_4"
  | "hit_the_number";

export const OFFICIAL_DAILY_RUNTIME_VERSION = "official-daily-runtime-v1";
export const OFFICIAL_DAILY_SCORING_VERSION = OFFICIAL_SCORE_CONTRACT_VERSION;
export const WAVELENGTH_OFFICIAL_DAILY_SCORING_VERSION = WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION;
export const BLIND_RESUME_V3_CONTENT_VERSION = "blind-resume-v3";
export const BLIND_RESUME_V3_OFFICIAL_DAILY_SCORING_VERSION = "play-official-score-v3";

export interface OfficialDailySetupPublication {
  setupKey: string;
  contentVersion: string;
  scoringVersion:
    | typeof OFFICIAL_DAILY_SCORING_VERSION
    | typeof WAVELENGTH_OFFICIAL_DAILY_SCORING_VERSION
    | typeof BLIND_RESUME_V3_OFFICIAL_DAILY_SCORING_VERSION;
  publicSetup: Record<string, unknown>;
  revealSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  privateGradingEvidence: Record<string, unknown>;
}

export interface OfficialDailyRuntimeContext {
  gameType: OfficialDailyGameType;
  setupKey: string;
  publicSetup: Record<string, unknown>;
  revealSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  privateGradingEvidence: Record<string, unknown>;
  submissionState: Record<string, unknown>;
  publicState: Record<string, unknown>;
}

export interface OfficialDailyAdvanceResult {
  submissionState: Record<string, unknown>;
  publicState: Record<string, unknown>;
  complete: boolean;
  finalSubmission: Record<string, unknown> | null;
}

type JsonRecord = Record<string, unknown>;
type BlindResumeDifficulty = "readable" | "competitive" | "tight" | "nightmare";

export const BLIND_RESUME_V3_REVEAL_COUNTS = [2, 4, 6, 8] as const;
export const BLIND_RESUME_V3_CORRECT_POINTS = [20, 19, 18, 17] as const;
export const BLIND_RESUME_V3_MISS_POINTS = [2, 4, 6, 8] as const;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Official daily runtime evidence must be an object.");
  }
  return value as JsonRecord;
}

function stringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${label} must be a string array.`);
  }
  return value as string[];
}

function recordArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return value as number;
}

function fighterPresentation(fighter: PlayFighter) {
  return {
    id: fighter.id,
    name: fighter.name,
    gender: fighter.gender,
    divisions: [...fighter.divisions],
    main_era: fighter.mainEra,
    thumb_url: fighter.thumbUrl,
    profile_url: fighter.profileUrl,
  };
}

function fighterFor(id: string) {
  const fighter = getPlayFighter(id);
  if (!fighter) throw new Error(`Official daily fighter ${id} is unavailable.`);
  return fighter;
}

function cluePresentation(clue: WavelengthClue) {
  return { id: clue.id, category: clue.category, text: clue.text };
}

function choosePack<T extends { id: string }>(
  rows: readonly T[],
  gameType: OfficialDailyGameType,
  day: string,
  scheduleVersion: string,
) {
  const random = seededLineupRandom(
    OFFICIAL_DAILY_RUNTIME_VERSION,
    gameType,
    scheduleVersion,
    day,
    "pack",
  );
  return rows[Math.floor(random() * rows.length)] ?? rows[0]!;
}

function buildFindLeaderSetup(day: string): OfficialDailySetupPublication {
  const board = dailyFindLeaderBoard(day);
  if (!board) throw new Error(`Find the Leader could not build the official ${day} board.`);
  const candidates = board.candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    division: candidate.division,
    thumb_url: candidate.thumbUrl,
  }));
  const revealCandidates = board.candidates.map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    division: candidate.division,
    thumb_url: candidate.thumbUrl,
    value: candidate.value,
  }));

  return {
    setupKey: `${board.version}:${day}:${board.definitionId}`,
    contentVersion: board.version,
    scoringVersion: OFFICIAL_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: OFFICIAL_DAILY_RUNTIME_VERSION,
      question: board.question,
      context: board.context,
      stat_label: board.statLabel,
      short_label: board.shortLabel,
      family: board.family,
      candidates,
      initial_state: {
        complete: false,
        eliminated_ids: [],
        native_progress: 0,
      },
    },
    revealSetup: {
      leader_id: board.leaderId,
      leader_value: board.leaderValue,
      candidates: revealCandidates,
    },
    privateSetupEvidence: {
      candidate_ids: board.candidates.map((candidate) => candidate.id),
      leader_id: board.leaderId,
    },
    privateGradingEvidence: {
      candidate_ids: board.candidates.map((candidate) => candidate.id),
      leader_id: board.leaderId,
    },
  };
}

function buildWavelengthSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const random = seededLineupRandom(
    OFFICIAL_DAILY_RUNTIME_VERSION,
    "wavelength",
    scheduleVersion,
    day,
    "round",
  );
  const round = createWavelengthRound({ random });
  const firstClue = round.clues[0];
  if (!firstClue) throw new Error("Wavelength did not create an opening clue.");

  return {
    setupKey: `${WAVELENGTH_CONTRACT_VERSIONS.generator}:${scheduleVersion}:${day}`,
    contentVersion: WAVELENGTH_CONTRACT_VERSIONS.generator,
    scoringVersion: WAVELENGTH_OFFICIAL_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: OFFICIAL_DAILY_RUNTIME_VERSION,
      versions: WAVELENGTH_CONTRACT_VERSIONS,
      clue_count: 4,
      initial_state: {
        complete: false,
        guesses: [],
        clues: [cluePresentation(firstClue)],
        next_guess_number: 1,
      },
    },
    revealSetup: {
      target: round.target,
      versions: WAVELENGTH_CONTRACT_VERSIONS,
    },
    privateSetupEvidence: {
      target: round.target,
      opening_clue_id: firstClue.id,
    },
    privateGradingEvidence: { target: round.target },
  };
}

function hiddenResumeRoundV2(roundIndex: number, stats: ReturnType<typeof blindResumeStats>) {
  return {
    round_index: roundIndex,
    round_number: roundIndex + 1,
    fighter_a_label: "FIGHTER A",
    fighter_b_label: "FIGHTER B",
    stats: stats.map((stat) => ({
      label: stat.label,
      value_a: stat.valueA,
      value_b: stat.valueB,
    })),
  };
}

function blindResumeV3Stage(revealedCount: number) {
  const stage = BLIND_RESUME_V3_REVEAL_COUNTS.indexOf(revealedCount as 2 | 4 | 6 | 8);
  if (stage < 0) throw new Error("Blind Resume V3 reveal count must be 2, 4, 6, or 8.");
  return stage;
}

export function blindResumeV3RoundPoints(revealedCount: number, correct: boolean) {
  const stage = blindResumeV3Stage(revealedCount);
  return correct ? BLIND_RESUME_V3_CORRECT_POINTS[stage]! : BLIND_RESUME_V3_MISS_POINTS[stage]!;
}

export function shuffleBlindResumeStats(stats: BlindResumeStat[], seed: string, pairId: string) {
  const rows = [...stats];
  const random = seededLineupRandom(OFFICIAL_DAILY_RUNTIME_VERSION, BLIND_RESUME_V3_CONTENT_VERSION, seed, pairId, "stats");
  for (let index = rows.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [rows[index], rows[swapIndex]] = [rows[swapIndex]!, rows[index]!];
  }
  const redundantOpening = new Set(["UFC title-fight wins", "Top-5 wins"]);
  if (rows.length >= 3 && redundantOpening.has(rows[0]!.label) && redundantOpening.has(rows[1]!.label)) {
    const replacementIndex = rows.findIndex((row, index) => index >= 2 && !redundantOpening.has(row.label));
    if (replacementIndex >= 2) [rows[1], rows[replacementIndex]] = [rows[replacementIndex]!, rows[1]!];
  }
  return rows;
}

function blindResumeDifficultyMap(pairs: readonly BlindResumePair[]) {
  const sorted = [...pairs].sort((left, right) => left.scoreGap - right.scoreGap || left.id.localeCompare(right.id));
  const difficulty = new Map<string, BlindResumeDifficulty>();
  sorted.forEach((pair, index) => {
    difficulty.set(
      pair.id,
      index === 0 ? "nightmare" : index === 1 ? "tight" : index === sorted.length - 1 ? "readable" : "competitive",
    );
  });
  return difficulty;
}

function visibleBlindResumeV3Round(round: JsonRecord, revealedCount: number) {
  const stage = blindResumeV3Stage(revealedCount);
  const stats = recordArray(round.stats, "Blind Resume V3 stats");
  return {
    round_index: integer(round.round_index, "Blind Resume V3 round index", 0, BLIND_RESUME_ROUNDS - 1),
    round_number: integer(round.round_index, "Blind Resume V3 round index", 0, BLIND_RESUME_ROUNDS - 1) + 1,
    fighter_a_label: "FIGHTER A",
    fighter_b_label: "FIGHTER B",
    revealed_count: revealedCount,
    correct_points: BLIND_RESUME_V3_CORRECT_POINTS[stage],
    miss_points: BLIND_RESUME_V3_MISS_POINTS[stage],
    stats: stats.map((stat, index) => ({
      label: String(stat.label ?? "STAT"),
      revealed: index < revealedCount,
      value_a: index < revealedCount ? String(stat.value_a ?? "") : null,
      value_b: index < revealedCount ? String(stat.value_b ?? "") : null,
    })),
  };
}

function buildBlindResumeSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const seed = `${OFFICIAL_DAILY_RUNTIME_VERSION}|${BLIND_RESUME_V3_CONTENT_VERSION}|${scheduleVersion}|${day}`;
  const roundSet = createBlindResumeRounds(seed);
  const difficulties = blindResumeDifficultyMap(roundSet.pairs);
  const privateRounds = roundSet.pairs.map((pair, roundIndex) => ({
    round_index: roundIndex,
    pair_id: pair.id,
    difficulty: difficulties.get(pair.id) ?? "competitive",
    fighter_a_id: pair.fighterA.id,
    fighter_b_id: pair.fighterB.id,
    winner_id: blindResumeWinner(pair).id,
    stats: shuffleBlindResumeStats(blindResumeStats(pair), seed, pair.id).map((stat) => ({
      label: stat.label,
      value_a: stat.valueA,
      value_b: stat.valueB,
    })),
  }));
  const revealRounds = privateRounds.map((round) => ({
    round_index: round.round_index,
    fighter_a: fighterPresentation(fighterFor(round.fighter_a_id)),
    fighter_b: fighterPresentation(fighterFor(round.fighter_b_id)),
    winner_id: round.winner_id,
  }));

  return {
    setupKey: `${BLIND_RESUME_V3_CONTENT_VERSION}:${scheduleVersion}:${day}`,
    contentVersion: BLIND_RESUME_V3_CONTENT_VERSION,
    scoringVersion: BLIND_RESUME_V3_OFFICIAL_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: OFFICIAL_DAILY_RUNTIME_VERSION,
      round_count: BLIND_RESUME_ROUNDS,
      reveal_counts: [...BLIND_RESUME_V3_REVEAL_COUNTS],
      correct_points: [...BLIND_RESUME_V3_CORRECT_POINTS],
      miss_points: [...BLIND_RESUME_V3_MISS_POINTS],
      initial_state: {
        complete: false,
        round_index: 0,
        results: [],
        current_round: privateRounds[0] ? visibleBlindResumeV3Round(privateRounds[0], 2) : null,
      },
    },
    revealSetup: { rounds: revealRounds },
    privateSetupEvidence: { seed, rounds: privateRounds },
    privateGradingEvidence: {
      correct_choices: privateRounds.map((round) => round.winner_id),
    },
  };
}

function buildBlindRankSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const pack = choosePack(blindRankPacks, "blind_rank_5", day, scheduleVersion);
  const seed = `${OFFICIAL_DAILY_RUNTIME_VERSION}|blind-rank|${scheduleVersion}|${day}|${pack.id}`;
  const lineup = createBlindRankLineup(pack.id, seed);
  const ratings = Object.fromEntries(
    lineup.fighters.map((fighter) => [fighter.id, blindRankRating(fighter, pack.id)]),
  );
  const canonicalOrder = [...lineup.fighters]
    .sort((left, right) => {
      const ratingDifference = blindRankRating(right, pack.id) - blindRankRating(left, pack.id);
      return ratingDifference || left.id.localeCompare(right.id);
    })
    .map((fighter) => ({
      ...fighterPresentation(fighter),
      tier: blindRankTier(blindRankRating(fighter, pack.id)),
    }));

  return {
    setupKey: `blind-rank-v3:${scheduleVersion}:${day}:${pack.id}:${lineup.archetype}`,
    contentVersion: "blind-rank-v3",
    scoringVersion: OFFICIAL_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: OFFICIAL_DAILY_RUNTIME_VERSION,
      pack: { id: pack.id, name: pack.name, prompt: pack.prompt, intro: pack.intro },
      fighter_count: 5,
      initial_state: {
        complete: false,
        reveal_index: 0,
        slots: [null, null, null, null, null],
        current_fighter: fighterPresentation(lineup.fighters[0]!),
      },
    },
    revealSetup: { canonical_order: canonicalOrder },
    privateSetupEvidence: {
      pack_id: pack.id,
      seed,
      fighter_ids: lineup.fighters.map((fighter) => fighter.id),
    },
    privateGradingEvidence: {
      fighter_ids: lineup.fighters.map((fighter) => fighter.id),
      ratings,
      tolerance: 1,
    },
  };
}

function buildKeepCutSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const pack = choosePack(KEEP_CUT_PACKS, "keep_4_cut_4", day, scheduleVersion);
  const seed = `${OFFICIAL_DAILY_RUNTIME_VERSION}|keep-cut|${scheduleVersion}|${day}|${pack.id}`;
  const lineup = createKeepCutLineup(pack.id, seed);
  const ratings = Object.fromEntries(
    lineup.fighters.map((fighter) => [fighter.id, keepCutRating(pack.id, fighter)]),
  );
  const modelTopFourIds = [...lineup.fighters]
    .sort((left, right) => {
      const ratingDifference = keepCutRating(pack.id, right) - keepCutRating(pack.id, left);
      return ratingDifference || left.id.localeCompare(right.id);
    })
    .slice(0, 4)
    .map((fighter) => fighter.id);

  return {
    setupKey: `keep-cut-v3:${scheduleVersion}:${day}:${pack.id}`,
    contentVersion: "keep-cut-v3",
    scoringVersion: OFFICIAL_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: OFFICIAL_DAILY_RUNTIME_VERSION,
      pack: {
        id: pack.id,
        group: pack.group,
        name: pack.name,
        prompt: pack.prompt,
        description: pack.description,
      },
      fighter_count: 8,
      initial_state: {
        complete: false,
        reveal_index: 0,
        kept: [],
        cut: [],
        current_fighter: fighterPresentation(lineup.fighters[0]!),
      },
    },
    revealSetup: {
      fighters: lineup.fighters.map(fighterPresentation),
      model_top_four_ids: modelTopFourIds,
      tiers: Object.fromEntries(
        lineup.fighters.map((fighter) => [fighter.id, keepCutTier(keepCutRating(pack.id, fighter))]),
      ),
    },
    privateSetupEvidence: {
      pack_id: pack.id,
      seed,
      fighter_ids: lineup.fighters.map((fighter) => fighter.id),
    },
    privateGradingEvidence: {
      fighter_ids: lineup.fighters.map((fighter) => fighter.id),
      ratings,
      tolerance: 1,
    },
  };
}

export function buildOfficialDailySetup(
  gameType: OfficialDailyGameType,
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Official daily day must use YYYY-MM-DD.");
  if (!scheduleVersion.trim()) throw new Error("Official daily schedule version is required.");

  switch (gameType) {
    case "find_leader": return buildFindLeaderSetup(day);
    case "wavelength": return buildWavelengthSetup(day, scheduleVersion);
    case "blind_resume": return buildBlindResumeSetup(day, scheduleVersion);
    case "blind_rank_5": return buildBlindRankSetup(day, scheduleVersion);
    case "keep_4_cut_4": return buildKeepCutSetup(day, scheduleVersion);
    case "hit_the_number": return buildOfficialHitTheNumberDailySetup(
      day,
      scheduleVersion,
      OFFICIAL_DAILY_RUNTIME_VERSION,
      OFFICIAL_DAILY_SCORING_VERSION,
    ) as OfficialDailySetupPublication;
    default: throw new Error(`Unsupported official daily game ${String(gameType)}.`);
  }
}

function advanceFindLeader(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const evidence = context.privateSetupEvidence;
  const candidateIds = stringArray(evidence.candidate_ids, "Find the Leader candidate ids");
  const leaderId = String(evidence.leader_id ?? "");
  const prior = stringArray(context.submissionState.eliminated_ids ?? [], "Find the Leader progress");
  const eliminatedId = String(action.eliminated_id ?? "");
  if (!candidateIds.includes(eliminatedId)) throw new Error("That fighter is not on the official board.");
  if (prior.includes(eliminatedId)) throw new Error("That fighter has already been eliminated.");
  const eliminatedIds = [...prior, eliminatedId];
  const complete = eliminatedId === leaderId || eliminatedIds.length === candidateIds.length - 1;
  const finalSubmission = complete ? { eliminated_ids: eliminatedIds } : null;
  return {
    submissionState: { eliminated_ids: eliminatedIds, final_submission: finalSubmission },
    publicState: {
      complete,
      eliminated_ids: eliminatedIds,
      native_progress: complete && eliminatedId !== leaderId ? 10 : eliminatedIds.length,
    },
    complete,
    finalSubmission,
  };
}

function wavelengthClueFor(id: string) {
  const clue = wavelengthClues.find((row) => row.id === id);
  if (!clue) throw new Error(`Official Wavelength clue ${id} is unavailable.`);
  return clue;
}

function advanceWavelength(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const target = integer(context.privateSetupEvidence.target, "Wavelength target", 1, 100);
  const priorGuesses = Array.isArray(context.submissionState.guesses)
    ? context.submissionState.guesses.map((value) => integer(value, "Wavelength guess", 1, 100))
    : [];
  if (priorGuesses.length >= 4) throw new Error("The official Wavelength round is already complete.");
  const guess = integer(action.guess, "Wavelength guess", 1, 100);
  const guesses = [...priorGuesses, guess];
  const openingClueId = String(context.privateSetupEvidence.opening_clue_id ?? "");
  const priorClueIds = stringArray(context.submissionState.clue_ids ?? [openingClueId], "Wavelength clue ids");
  let clueIds = [...priorClueIds];

  if (guesses.length < 4) {
    const round: WavelengthRound = {
      target,
      clues: clueIds.map(wavelengthClueFor),
      versions: WAVELENGTH_CONTRACT_VERSIONS,
    };
    const random = seededLineupRandom(
      OFFICIAL_DAILY_RUNTIME_VERSION,
      context.setupKey,
      "clue",
      guesses.join(","),
      guesses.length,
    );
    const nextClue = nextWavelengthClue(round, guess, guesses.length, random);
    clueIds = [...clueIds, nextClue.id];
  }

  const complete = guesses.length === 4;
  const finalSubmission = complete ? { guesses } : null;
  return {
    submissionState: { guesses, clue_ids: clueIds, final_submission: finalSubmission },
    publicState: {
      complete,
      guesses,
      clues: clueIds.map((id) => cluePresentation(wavelengthClueFor(id))),
      next_guess_number: complete ? null : guesses.length + 1,
      reveal: complete
        ? {
            target,
            clues: clueIds.map((id) => {
              const clue = wavelengthClueFor(id);
              return { ...cluePresentation(clue), rating: clue.rating };
            }),
          }
        : null,
    },
    complete,
    finalSubmission,
  };
}

function advanceBlindResumeV2(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const rounds = recordArray(context.privateSetupEvidence.rounds, "Blind Resume rounds");
  const priorChoices = stringArray(context.submissionState.choices ?? [], "Blind Resume choices");
  if (priorChoices.length >= rounds.length) throw new Error("The official Blind Resume card is already complete.");
  const side = String(action.choice ?? "").toUpperCase();
  if (side !== "A" && side !== "B") throw new Error("Blind Resume choice must be A or B.");

  const round = rounds[priorChoices.length]!;
  const fighterAId = String(round.fighter_a_id ?? "");
  const fighterBId = String(round.fighter_b_id ?? "");
  const winnerId = String(round.winner_id ?? "");
  const pickedId = side === "A" ? fighterAId : fighterBId;
  const choices = [...priorChoices, pickedId];
  const priorResults = recordArray(context.publicState.results ?? [], "Blind Resume public results");
  const result = {
    round_index: priorChoices.length,
    picked_side: side,
    picked_id: pickedId,
    winner_id: winnerId,
    correct: pickedId === winnerId,
    fighter_a: fighterPresentation(fighterFor(fighterAId)),
    fighter_b: fighterPresentation(fighterFor(fighterBId)),
  };
  const results = [...priorResults, result];
  const complete = choices.length === rounds.length;
  const nextRound = complete ? null : asRecord(rounds[choices.length]!.hidden_round);
  const finalSubmission = complete ? { choices } : null;

  return {
    submissionState: { choices, final_submission: finalSubmission },
    publicState: {
      complete,
      round_index: complete ? rounds.length : choices.length,
      results,
      current_round: nextRound,
    },
    complete,
    finalSubmission,
  };
}

function advanceBlindResumeV3(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const rounds = recordArray(context.privateSetupEvidence.rounds, "Blind Resume V3 rounds");
  const priorAnswers = recordArray(context.submissionState.answers ?? [], "Blind Resume V3 answers");
  if (priorAnswers.length >= rounds.length) throw new Error("The official Blind Resume card is already complete.");

  const round = rounds[priorAnswers.length]!;
  const publicRound = asRecord(context.publicState.current_round);
  const revealedCount = integer(publicRound.revealed_count, "Blind Resume V3 reveal count", 2, 8);
  blindResumeV3Stage(revealedCount);
  const priorResults = recordArray(context.publicState.results ?? [], "Blind Resume V3 public results");

  if (action.reveal === true) {
    if (revealedCount >= 8) throw new Error("All Blind Resume stats are already revealed.");
    const nextRevealedCount = revealedCount + 2;
    return {
      submissionState: { answers: priorAnswers, final_submission: null },
      publicState: {
        complete: false,
        round_index: priorAnswers.length,
        results: priorResults,
        current_round: visibleBlindResumeV3Round(round, nextRevealedCount),
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const side = String(action.choice ?? "").toUpperCase();
  if (side !== "A" && side !== "B") throw new Error("Blind Resume choice must be A or B.");
  const fighterAId = String(round.fighter_a_id ?? "");
  const fighterBId = String(round.fighter_b_id ?? "");
  const winnerId = String(round.winner_id ?? "");
  const pickedId = side === "A" ? fighterAId : fighterBId;
  const correct = pickedId === winnerId;
  const pointsAwarded = blindResumeV3RoundPoints(revealedCount, correct);
  const answers = [...priorAnswers, { choice: pickedId, revealed_count: revealedCount }];
  const results = [...priorResults, {
    round_index: priorAnswers.length,
    picked_side: side,
    picked_id: pickedId,
    winner_id: winnerId,
    correct,
    revealed_count: revealedCount,
    points_awarded: pointsAwarded,
    fighter_a: fighterPresentation(fighterFor(fighterAId)),
    fighter_b: fighterPresentation(fighterFor(fighterBId)),
  }];
  const complete = answers.length === rounds.length;
  const finalSubmission = complete ? { answers } : null;

  return {
    submissionState: { answers, final_submission: finalSubmission },
    publicState: {
      complete,
      round_index: complete ? rounds.length : answers.length,
      results,
      current_round: complete ? null : visibleBlindResumeV3Round(rounds[answers.length]!, 2),
    },
    complete,
    finalSubmission,
  };
}

function advanceBlindResume(context: OfficialDailyRuntimeContext, action: JsonRecord) {
  return context.setupKey.startsWith(`${BLIND_RESUME_V3_CONTENT_VERSION}:`)
    ? advanceBlindResumeV3(context, action)
    : advanceBlindResumeV2(context, action);
}

function advanceBlindRank(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const fighterIds = stringArray(context.privateSetupEvidence.fighter_ids, "Blind Rank fighter ids");
  const assignments = recordArray(context.submissionState.assignments ?? [], "Blind Rank assignments");
  if (assignments.length >= fighterIds.length) throw new Error("The official Blind Rank card is already complete.");
  const slot = integer(action.slot, "Blind Rank slot", 1, 5);
  if (assignments.some((assignment) => assignment.slot === slot)) {
    throw new Error("That Blind Rank slot is already locked.");
  }
  const fighterId = fighterIds[assignments.length]!;
  const nextAssignments = [...assignments, { fighter_id: fighterId, slot }];
  const slots = Array.from({ length: 5 }, () => null as ReturnType<typeof fighterPresentation> | null);
  for (const assignment of nextAssignments) {
    const assignedSlot = integer(assignment.slot, "Stored Blind Rank slot", 1, 5);
    slots[assignedSlot - 1] = fighterPresentation(fighterFor(String(assignment.fighter_id ?? "")));
  }
  const complete = nextAssignments.length === fighterIds.length;
  const orderedIds = complete
    ? [...nextAssignments]
        .sort((left, right) => Number(left.slot) - Number(right.slot))
        .map((assignment) => String(assignment.fighter_id))
    : null;
  const finalSubmission = orderedIds ? { ordered_ids: orderedIds } : null;

  return {
    submissionState: { assignments: nextAssignments, final_submission: finalSubmission },
    publicState: {
      complete,
      reveal_index: nextAssignments.length,
      slots,
      current_fighter: complete ? null : fighterPresentation(fighterFor(fighterIds[nextAssignments.length]!)),
      reveal: complete ? context.revealSetup : null,
    },
    complete,
    finalSubmission,
  };
}

function advanceKeepCut(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const fighterIds = stringArray(context.privateSetupEvidence.fighter_ids, "Keep Cut fighter ids");
  const choices = stringArray(context.submissionState.choices ?? [], "Keep Cut choices");
  if (choices.length >= fighterIds.length) throw new Error("The official Keep Cut board is already complete.");
  const choice = String(action.choice ?? "").toLowerCase();
  if (choice !== "keep" && choice !== "cut") throw new Error("Keep Cut choice must be keep or cut.");
  const keptCount = choices.filter((row) => row === "keep").length;
  const cutCount = choices.filter((row) => row === "cut").length;
  if (choice === "keep" && keptCount >= 4) throw new Error("Keep is full; this fighter must be cut.");
  if (choice === "cut" && cutCount >= 4) throw new Error("Cut is full; this fighter must be kept.");

  const nextChoices = [...choices, choice];
  const decidedIds = fighterIds.slice(0, nextChoices.length);
  const keptIds = decidedIds.filter((_id, index) => nextChoices[index] === "keep");
  const cutIds = decidedIds.filter((_id, index) => nextChoices[index] === "cut");
  const complete = nextChoices.length === fighterIds.length;
  if (complete && (keptIds.length !== 4 || cutIds.length !== 4)) {
    throw new Error("Official Keep Cut completion must contain four keeps and four cuts.");
  }
  const finalSubmission = complete ? { kept_ids: keptIds } : null;

  return {
    submissionState: { choices: nextChoices, final_submission: finalSubmission },
    publicState: {
      complete,
      reveal_index: nextChoices.length,
      kept: keptIds.map((id) => fighterPresentation(fighterFor(id))),
      cut: cutIds.map((id) => fighterPresentation(fighterFor(id))),
      current_fighter: complete ? null : fighterPresentation(fighterFor(fighterIds[nextChoices.length]!)),
      forced_choice: complete
        ? null
        : keptIds.length === 4
          ? "cut"
          : cutIds.length === 4
            ? "keep"
            : null,
      reveal: complete ? context.revealSetup : null,
    },
    complete,
    finalSubmission,
  };
}

export function initialOfficialDailyPublicState(publicSetup: JsonRecord) {
  return asRecord(publicSetup.initial_state);
}

export function advanceOfficialDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  const parsedAction = asRecord(action);
  switch (context.gameType) {
    case "find_leader": return advanceFindLeader(context, parsedAction);
    case "wavelength": return advanceWavelength(context, parsedAction);
    case "blind_resume": return advanceBlindResume(context, parsedAction);
    case "blind_rank_5": return advanceBlindRank(context, parsedAction);
    case "keep_4_cut_4": return advanceKeepCut(context, parsedAction);
    case "hit_the_number": return advanceOfficialHitTheNumberDailyRuntime(context, parsedAction);
    default: throw new Error(`Unsupported official daily game ${String(context.gameType)}.`);
  }
}

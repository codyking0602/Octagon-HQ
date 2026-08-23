import {
  FOOTBALL_BLIND_RESUME_REVEAL_COUNTS,
  buildFootballBlindResumeRounds,
  footballBlindResumeNextRevealCount,
  footballBlindResumeRoundPoints,
  type FootballBlindResumeRevealCount,
} from "../back-room/footballBlindResumeModel";
import {
  createFootballFindLeaderBoard,
  formatFootballFindLeaderValue,
} from "../back-room/footballFindLeaderModel";
import {
  createFootballHitTheNumberPlan,
  footballHitTheNumberSelectionSatisfies,
  footballHitTheNumberValue,
  formatFootballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  gradeFootballHitTheNumberSelection,
} from "../back-room/footballHitTheNumberModel";
import {
  buildFootballKeepCutLineup,
  getFootballKeepCutPack,
  scoreFootballKeepCutSelection,
} from "../back-room/footballKeepCutModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
  getFootballRankFivePack,
  type FootballLeague,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "../back-room/footballRankFiveModel";
import {
  createFootballWavelengthRound,
  nextFootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import {
  seededLineupRandom,
  type PlayLineupHistory,
} from "./lineupModel";
import { scoreBlindRankOrderedRatings } from "./officialScoreContract";
import { wavelengthScore } from "./wavelengthEngine";

export type FootballDailyGameType =
  | "find_leader"
  | "blind_resume"
  | "wavelength"
  | "blind_rank_5"
  | "keep_4_cut_4"
  | "hit_the_number";

export interface FootballDailyOfficialAttempt {
  nativeScore: number;
  normalizedScore: number;
  publicResult: Record<string, unknown>;
}

export interface FootballDailySnapshot {
  id: string;
  centralDay: string;
  scheduleVersion: string;
  gameType: FootballDailyGameType;
  setupKey: string;
  contentVersion: string;
  scoringVersion: string;
  publicSetup: Record<string, unknown>;
  publicState: Record<string, unknown>;
  revealSetup: Record<string, unknown> | null;
  officialAttempt: FootballDailyOfficialAttempt | null;
  actionHistory: Record<string, unknown>[];
}

const FOOTBALL_DAILY_SCHEDULE_VERSION = "football-daily-v1";
const FOOTBALL_DAILY_SCORING_VERSION = "football-daily-score-v1";
const FOOTBALL_DAILY_DOUBLE_VERSION = "football-daily-double-v1";
const FOOTBALL_DAILY_ANCHOR_DAY = "2026-08-22";
const FOOTBALL_DAILY_CYCLE = [
  "find_leader",
  "blind_resume",
  "wavelength",
  "keep_4_cut_4",
  "hit_the_number",
] as const;
const EMPTY_HISTORY: PlayLineupHistory = {
  entries: [],
  recentItemIds: [],
  recentFighterIds: [],
  lastLineup: [],
};
const OPENING_RESUME_REVEAL = FOOTBALL_BLIND_RESUME_REVEAL_COUNTS[0];

function dayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Football daily day must use YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  const resolved = new Date(stamp).toISOString().slice(0, 10);
  if (resolved !== day) throw new Error("Football daily day is invalid.");
  return Math.floor(stamp / 86_400_000);
}

function relativeDay(day: string) {
  return dayNumber(day) - dayNumber(FOOTBALL_DAILY_ANCHOR_DAY);
}

function cycleIndex(day: string) {
  const value = relativeDay(day) % FOOTBALL_DAILY_CYCLE.length;
  return value < 0 ? value + FOOTBALL_DAILY_CYCLE.length : value;
}

export function footballDailyGameForDay(day: string): FootballDailyGameType {
  return FOOTBALL_DAILY_CYCLE[cycleIndex(day)]!;
}

function setupId(day: string, game: FootballDailyGameType) {
  const combo = game === "keep_4_cut_4" ? FOOTBALL_DAILY_DOUBLE_VERSION : game;
  return `football:${FOOTBALL_DAILY_SCHEDULE_VERSION}:${day}:${combo}`;
}

function requiredRecord(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requiredString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a string.`);
  return value;
}

function requiredInteger(value: unknown, label: string) {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`);
  return Number(value);
}

function publicItem(item: FootballRankFiveItem) {
  return {
    id: item.id,
    name: item.name,
    subtitle: item.subtitle,
    league: item.league,
  };
}

function desiredLeague(day: string) : FootballLeague {
  return Math.floor(Math.abs(relativeDay(day)) / FOOTBALL_DAILY_CYCLE.length) % 2 === 0 ? "NFL" : "CFB";
}

function packForDay(day: string, league: FootballLeague, scope: string) {
  const candidates = footballRankFivePacks.filter((pack) => pack.items[0]?.league === league);
  if (!candidates.length) throw new Error(`Football daily has no ${league} comparison pack.`);
  const random = seededLineupRandom("football-daily-pack", scope, day, league);
  return candidates[Math.floor(random() * candidates.length)]!;
}

function baseSnapshot(
  day: string,
  gameType: FootballDailyGameType,
  contentVersion: string,
  publicSetup: Record<string, unknown>,
  publicState: Record<string, unknown>,
  revealSetup: Record<string, unknown> | null,
  officialAttempt: FootballDailyOfficialAttempt | null,
  actions: readonly Record<string, unknown>[],
): FootballDailySnapshot {
  return {
    id: setupId(day, footballDailyGameForDay(day)),
    centralDay: day,
    scheduleVersion: FOOTBALL_DAILY_SCHEDULE_VERSION,
    gameType,
    setupKey: setupId(day, footballDailyGameForDay(day)),
    contentVersion,
    scoringVersion: FOOTBALL_DAILY_SCORING_VERSION,
    publicSetup,
    publicState,
    revealSetup,
    officialAttempt,
    actionHistory: actions.map((action) => ({ ...action })),
  };
}

function evaluateFindLeader(day: string, actions: readonly Record<string, unknown>[]) {
  const ordinal = dayNumber(day);
  const board = createFootballFindLeaderBoard(`football-daily-find-${ordinal}`, EMPTY_HISTORY);
  const eliminated: string[] = [];
  let complete = false;
  let fatalId: string | null = null;
  let score: number | null = null;

  for (const action of actions) {
    if (complete) throw new Error("Football Find the Leader daily is already complete.");
    if (requiredString(action.type, "Football daily action type") !== "eliminate") {
      throw new Error("Football Find the Leader only accepts eliminate actions.");
    }
    const candidateId = requiredString(action.candidate_id, "Football Find the Leader candidate");
    if (!board.candidates.some((candidate) => candidate.id === candidateId)) {
      throw new Error("Football Find the Leader candidate is not on today’s board.");
    }
    if (eliminated.includes(candidateId)) throw new Error("That Football Find the Leader candidate is already eliminated.");
    eliminated.push(candidateId);
    if (candidateId === board.leaderId) {
      complete = true;
      fatalId = candidateId;
      score = eliminated.length * 10;
    } else if (eliminated.length === 9) {
      complete = true;
      score = 100;
    }
  }

  const leader = board.candidates.find((candidate) => candidate.id === board.leaderId)!;
  const reveal = complete ? {
    leader_id: board.leaderId,
    leader_name: leader.name,
    leader_value: board.leaderValue,
    leader_value_display: formatFootballFindLeaderValue(board, board.leaderValue),
    candidates: [...board.candidates]
      .sort((left, right) => right.value - left.value || left.name.localeCompare(right.name))
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        subtitle: candidate.subtitle,
        value: candidate.value,
        value_display: formatFootballFindLeaderValue(board, candidate.value),
      })),
  } : null;
  const attempt = complete ? {
    nativeScore: score!,
    normalizedScore: score!,
    publicResult: { perfect: score === 100, fatal_id: fatalId, eliminated_ids: eliminated },
  } : null;

  return baseSnapshot(
    day,
    "find_leader",
    "football-find-leader-daily-v1",
    {
      question: board.question,
      context: board.context,
      stat_label: board.statLabel,
      short_label: board.shortLabel,
      league: board.domainId.startsWith("cfb-") ? "CFB" : "NFL",
      candidates: board.candidates.map(({ id, name, subtitle }) => ({ id, name, subtitle })),
    },
    { complete, eliminated_ids: eliminated, standing_count: 10 - eliminated.length },
    reveal,
    attempt,
    actions,
  );
}

function resumePublicRound(round: ReturnType<typeof buildFootballBlindResumeRounds>[number], revealedCount: FootballBlindResumeRevealCount) {
  return {
    id: round.id,
    pack_id: round.packId,
    league: round.league,
    prompt: round.prompt,
    revealed_count: revealedCount,
    stats: round.stats.slice(0, revealedCount).map((stat) => ({
      label: stat.label,
      value_a: stat.valueA,
      value_b: stat.valueB,
    })),
  };
}

function evaluateBlindResume(day: string, actions: readonly Record<string, unknown>[]) {
  const seed = `football-daily-resume-${dayNumber(day)}`;
  const rounds = buildFootballBlindResumeRounds(seed);
  let roundIndex = 0;
  let revealCount: FootballBlindResumeRevealCount = OPENING_RESUME_REVEAL;
  let awaitingNext = false;
  let complete = false;
  let lastResult: Record<string, unknown> | null = null;
  const picks: Array<{ pickedId: string; correct: boolean; revealedCount: FootballBlindResumeRevealCount; points: number }> = [];

  for (const action of actions) {
    if (complete) throw new Error("Football Blind Resume daily is already complete.");
    const round = rounds[roundIndex]!;
    const type = requiredString(action.type, "Football daily action type");
    if (type === "reveal_more") {
      if (awaitingNext) throw new Error("Advance the locked Football Blind Resume round before revealing more.");
      const next = footballBlindResumeNextRevealCount(revealCount);
      if (!next) throw new Error("All Football Blind Resume stats are already revealed.");
      revealCount = next;
      continue;
    }
    if (type === "pick") {
      if (awaitingNext) throw new Error("This Football Blind Resume round is already locked.");
      const side = requiredString(action.side, "Football Blind Resume side");
      if (side !== "left" && side !== "right") throw new Error("Football Blind Resume side must be left or right.");
      const pickedId = side === "left" ? round.leftId : round.rightId;
      const correct = pickedId === round.winnerId;
      const points = footballBlindResumeRoundPoints(revealCount, correct);
      picks.push({ pickedId, correct, revealedCount: revealCount, points });
      lastResult = {
        picked_id: pickedId,
        correct,
        points,
        winner_id: round.winnerId,
        left: { id: round.leftId, name: round.leftName, subtitle: round.leftSubtitle },
        right: { id: round.rightId, name: round.rightName, subtitle: round.rightSubtitle },
      };
      if (roundIndex === rounds.length - 1) complete = true;
      else awaitingNext = true;
      continue;
    }
    if (type === "next") {
      if (!awaitingNext) throw new Error("Lock this Football Blind Resume round before advancing.");
      roundIndex += 1;
      revealCount = OPENING_RESUME_REVEAL;
      awaitingNext = false;
      lastResult = null;
      continue;
    }
    throw new Error("Unsupported Football Blind Resume daily action.");
  }

  const score = picks.reduce((sum, pick) => sum + pick.points, 0);
  const correct = picks.filter((pick) => pick.correct).length;
  const publicState: Record<string, unknown> = {
    complete,
    round_index: roundIndex,
    round_number: Math.min(roundIndex + 1, 5),
    score,
    correct,
    losses: picks.length - correct,
    awaiting_next: awaitingNext,
    last_result: lastResult,
  };
  if (!complete) publicState.round = resumePublicRound(rounds[roundIndex]!, revealCount);

  return baseSnapshot(
    day,
    "blind_resume",
    "football-blind-resume-daily-v1",
    { round_count: 5, opening_reveal_count: OPENING_RESUME_REVEAL },
    publicState,
    complete ? {
      rounds: rounds.map((round) => ({
        id: round.id,
        pack_id: round.packId,
        league: round.league,
        prompt: round.prompt,
        left: { id: round.leftId, name: round.leftName, subtitle: round.leftSubtitle },
        right: { id: round.rightId, name: round.rightName, subtitle: round.rightSubtitle },
        winner_id: round.winnerId,
        stats: round.stats.map((stat) => ({ label: stat.label, value_a: stat.valueA, value_b: stat.valueB })),
      })),
      picks,
    } : null,
    complete ? {
      nativeScore: score,
      normalizedScore: score,
      publicResult: { correct, losses: picks.length - correct, picks },
    } : null,
    actions,
  );
}

function evaluateWavelength(day: string, actions: readonly Record<string, unknown>[]) {
  const seed = `football-daily-wavelength-${dayNumber(day)}`;
  const initial = createFootballWavelengthRound(seed);
  const round = { target: initial.target, clues: [...initial.clues] };
  const guesses: number[] = [];

  for (const action of actions) {
    if (guesses.length >= 4) throw new Error("Football Wavelength daily is already complete.");
    if (requiredString(action.type, "Football daily action type") !== "guess") {
      throw new Error("Football Wavelength only accepts guess actions.");
    }
    const guess = requiredInteger(action.value, "Football Wavelength guess");
    if (guess < 1 || guess > 100) throw new Error("Football Wavelength guess must be from 1 to 100.");
    const priorGuesses = [...guesses];
    guesses.push(guess);
    if (guesses.length < 4) {
      round.clues.push(nextFootballWavelengthClue(
        round,
        guess,
        guesses.length,
        seed,
        priorGuesses,
      ));
    }
  }

  const complete = guesses.length === 4;
  const finalGuess = complete ? guesses[3]! : null;
  const score = complete ? wavelengthScore(finalGuess!, round.target) : null;
  const activeClue = round.clues[Math.min(guesses.length, round.clues.length - 1)]!;
  return baseSnapshot(
    day,
    "wavelength",
    "football-wavelength-daily-v1",
    { clue_count: 4, scale_min: 1, scale_max: 100 },
    {
      complete,
      clue_index: Math.min(guesses.length, 3),
      clue_number: Math.min(guesses.length + 1, 4),
      clue: { id: activeClue.id, category: activeClue.category, text: activeClue.text },
      guesses,
    },
    complete ? {
      target: round.target,
      final_guess: finalGuess,
      clues: round.clues.map((clue) => ({ id: clue.id, category: clue.category, text: clue.text, rating: clue.rating })),
    } : null,
    complete ? {
      nativeScore: score!,
      normalizedScore: score!,
      publicResult: { target: round.target, final_guess: finalGuess, guesses },
    } : null,
    actions,
  );
}

function itemById(lineup: readonly FootballRankFiveItem[], itemId: string) {
  const item = lineup.find((candidate) => candidate.id === itemId);
  if (!item) throw new Error("Football daily comparison item is unavailable.");
  return item;
}

function evaluateDailyDouble(day: string, actions: readonly Record<string, unknown>[]) {
  const rankLeague = desiredLeague(day);
  const keepLeague: FootballLeague = rankLeague === "NFL" ? "CFB" : "NFL";
  const rankPack = packForDay(day, rankLeague, "rank");
  const keepPack = packForDay(day, keepLeague, "keep");
  const rankLineup = buildFootballRankFiveLineup(rankPack.id, `football-daily-rank-${day}`);
  const keepLineup = buildFootballKeepCutLineup(keepPack.id, `football-daily-keep-${day}`);
  const placements: Array<string | null> = Array(5).fill(null);
  const decisions: Array<"keep" | "cut"> = [];
  let rankIndex = 0;
  let stage: "blind_rank_5" | "keep_4_cut_4" = "blind_rank_5";

  for (const action of actions) {
    const type = requiredString(action.type, "Football daily action type");
    if (stage === "blind_rank_5") {
      if (type !== "place") throw new Error("Football Daily Double starts with Blind Rank 5 placement actions.");
      const slot = requiredInteger(action.slot, "Football Blind Rank slot");
      if (slot < 1 || slot > 5) throw new Error("Football Blind Rank slot must be from 1 to 5.");
      if (placements[slot - 1]) throw new Error("That Football Blind Rank slot is already locked.");
      placements[slot - 1] = rankLineup[rankIndex]!.id;
      rankIndex += 1;
      if (rankIndex === rankLineup.length) stage = "keep_4_cut_4";
      continue;
    }

    if (decisions.length >= keepLineup.length) throw new Error("Football Daily Double is already complete.");
    if (type !== "decide") throw new Error("Football Daily Double Keep 4/Cut 4 expects a decision action.");
    const decision = requiredString(action.decision, "Football Keep/Cut decision");
    if (decision !== "keep" && decision !== "cut") throw new Error("Football Keep/Cut decision must be keep or cut.");
    const keptCount = decisions.filter((value) => value === "keep").length;
    const cutCount = decisions.filter((value) => value === "cut").length;
    if (decision === "keep" && keptCount >= 4) throw new Error("Football Daily Double Keep tray is full.");
    if (decision === "cut" && cutCount >= 4) throw new Error("Football Daily Double Cut tray is full.");
    decisions.push(decision);
  }

  const rankComplete = rankIndex === 5;
  const rankScore = rankComplete ? scoreBlindRankOrderedRatings(
    placements.map((itemId) => itemById(rankLineup, itemId!).rating),
  ).normalizedScore : null;
  const kept = keepLineup.filter((_item, index) => decisions[index] === "keep");
  const cut = keepLineup.filter((_item, index) => decisions[index] === "cut");
  const complete = decisions.length === 8;
  const keepResult = complete ? scoreFootballKeepCutSelection(keepLineup, kept.map((item) => item.id)) : null;
  const combinedScore = complete ? Math.round((rankScore! + keepResult!.score) / 2) : null;
  const activeGameType: FootballDailyGameType = stage;
  const rankPackPublic = { id: rankPack.id, name: rankPack.name, prompt: rankPack.prompt, intro: rankPack.intro, league: rankLeague };
  const keepPackPublic = { id: keepPack.id, name: keepPack.name, prompt: getFootballKeepCutPack(keepPack.id).prompt, intro: getFootballKeepCutPack(keepPack.id).intro, league: keepLeague };
  const publicState: Record<string, unknown> = {
    complete,
    combo: true,
    combo_stage: stage,
    rank_score: rankScore,
  };

  if (stage === "blind_rank_5") {
    publicState.rank = {
      pack: rankPackPublic,
      current_index: rankIndex,
      current_item: publicItem(rankLineup[rankIndex]!),
      placements: placements.map((itemId) => itemId ? publicItem(itemById(rankLineup, itemId)) : null),
    };
  } else {
    publicState.keep_cut = {
      pack: keepPackPublic,
      decision_index: decisions.length,
      current_item: complete ? null : publicItem(keepLineup[decisions.length]!),
      decisions,
      kept: kept.map(publicItem),
      cut: cut.map(publicItem),
    };
  }

  return baseSnapshot(
    day,
    activeGameType,
    FOOTBALL_DAILY_DOUBLE_VERSION,
    {
      combo: true,
      stage_count: 2,
      rank_pack: rankPackPublic,
      keep_cut_pack: keepPackPublic,
    },
    publicState,
    complete ? {
      rank: {
        pack: rankPackPublic,
        placements: placements.map((itemId) => publicItem(itemById(rankLineup, itemId!))),
        canonical_order: [...rankLineup]
          .sort((left, right) => right.rating - left.rating || left.id.localeCompare(right.id))
          .map(publicItem),
        score: rankScore,
      },
      keep_cut: {
        pack: keepPackPublic,
        kept: keepResult!.kept.map(publicItem),
        cut: keepResult!.cut.map(publicItem),
        canonical_keeps: keepResult!.topFour.map(publicItem),
        score: keepResult!.score,
      },
    } : null,
    complete ? {
      nativeScore: combinedScore!,
      normalizedScore: combinedScore!,
      publicResult: {
        rank_score: rankScore,
        keep_cut_score: keepResult!.score,
        combined_score: combinedScore,
      },
    } : null,
    actions,
  );
}

function hitPlanForDay(day: string) {
  const desired = desiredLeague(day);
  let first = createFootballHitTheNumberPlan(`football-daily-hit-${day}-0`);
  if (first.league === desired) return first;
  for (let attempt = 1; attempt < 16; attempt += 1) {
    const candidate = createFootballHitTheNumberPlan(`football-daily-hit-${day}-${attempt}`);
    if (candidate.league === desired) return candidate;
  }
  return first;
}

function evaluateHitTheNumber(day: string, actions: readonly Record<string, unknown>[]) {
  const plan = hitPlanForDay(day);
  let result: ReturnType<typeof gradeFootballHitTheNumberSelection> | null = null;
  let selectedIds: string[] = [];
  for (const action of actions) {
    if (result) throw new Error("Football Hit the Number daily is already complete.");
    if (requiredString(action.type, "Football daily action type") !== "lock") {
      throw new Error("Football Hit the Number only accepts a final lock action.");
    }
    if (!Array.isArray(action.selected_ids) || action.selected_ids.some((id) => typeof id !== "string")) {
      throw new Error("Football Hit the Number selections must be an array of subject ids.");
    }
    selectedIds = [...action.selected_ids] as string[];
    if (!footballHitTheNumberSelectionSatisfies(plan, selectedIds)) {
      throw new Error("Football Hit the Number selection does not satisfy today’s board.");
    }
    result = gradeFootballHitTheNumberSelection(plan, selectedIds);
  }

  const complete = Boolean(result);
  return baseSnapshot(
    day,
    "hit_the_number",
    "football-hit-the-number-daily-v1",
    {
      league: plan.league,
      format_id: plan.formatId,
      format_label: plan.formatLabel,
      configuration_label: plan.configurationLabel,
      domain_id: plan.domainId,
      domain_label: plan.domainLabel,
      metric_id: plan.metricId,
      metric_label: plan.metricLabel,
      target: plan.target,
      target_display: formatFootballHitTheNumberValue(plan, plan.target),
      pick_count: plan.pickCount,
      board_type: plan.boardType,
      slots: plan.slots,
      subjects: plan.subjectIds.map((subjectId) => {
        const subject = getFootballHitTheNumberSubject(subjectId)!;
        return { id: subject.id, name: subject.name, subtitle: subject.subtitle };
      }),
    },
    { complete, selected_ids: selectedIds },
    complete ? {
      result: {
        status: result!.status,
        total: result!.total,
        total_display: formatFootballHitTheNumberValue(plan, result!.total),
        target: result!.target,
        target_display: formatFootballHitTheNumberValue(plan, result!.target),
        distance: result!.distance,
        score: result!.score,
      },
      subjects: plan.subjectIds.map((subjectId) => ({
        id: subjectId,
        value: footballHitTheNumberValue(subjectId, plan.metricId),
        value_display: formatFootballHitTheNumberValue(plan, footballHitTheNumberValue(subjectId, plan.metricId)),
      })),
    } : null,
    complete ? {
      nativeScore: result!.score,
      normalizedScore: result!.score,
      publicResult: {
        status: result!.status,
        total: result!.total,
        target: result!.target,
        distance: result!.distance,
        selected_ids: selectedIds,
      },
    } : null,
    actions,
  );
}

export function buildFootballDailySnapshot(
  day: string,
  actionHistory: readonly Record<string, unknown>[] = [],
): FootballDailySnapshot {
  dayNumber(day);
  if (actionHistory.length > 32) throw new Error("Football daily action history is too long.");
  const game = footballDailyGameForDay(day);
  if (game === "find_leader") return evaluateFindLeader(day, actionHistory);
  if (game === "blind_resume") return evaluateBlindResume(day, actionHistory);
  if (game === "wavelength") return evaluateWavelength(day, actionHistory);
  if (game === "keep_4_cut_4") return evaluateDailyDouble(day, actionHistory);
  return evaluateHitTheNumber(day, actionHistory);
}

export function advanceFootballDailySnapshot(
  day: string,
  actionHistory: readonly Record<string, unknown>[],
  action: unknown,
) {
  const row = requiredRecord(action, "Football daily action");
  return buildFootballDailySnapshot(day, [...actionHistory, row]);
}

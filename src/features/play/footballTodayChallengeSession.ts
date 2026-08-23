import { hitTheNumberScore, type HitTheNumberResultStatus } from "./hitTheNumberEngine";
import { scoreBlindRankOrderedRatings } from "./officialScoreContract";
import { wavelengthScore } from "./wavelengthEngine";
import {
  advanceFootballOfficialDailyRuntime,
  buildFootballOfficialDailySetup,
} from "./footballTodayChallengeRuntime";
import type {
  OfficialDailyGameType,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const FOOTBALL_TODAY_SCHEDULE_VERSION = "football-daily-v1" as const;
const FOOTBALL_TODAY_ANCHOR_DAY = "2026-08-22";
const FOOTBALL_TODAY_CYCLE: readonly OfficialDailyGameType[] = [
  "find_leader",
  "blind_resume",
  "wavelength",
  "keep_4_cut_4",
  "hit_the_number",
];
const FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION = "football-daily-double-v1";
const SHARED_DAILY_DOUBLE_GRADING_VERSION = "daily-rank-keep-combo-v1";

type JsonRecord = Record<string, unknown>;

export interface FootballTodayProjection {
  available: true;
  sport: "football";
  id: string;
  central_day: string;
  schedule_version: string;
  game_type: OfficialDailyGameType;
  setup_key: string;
  content_version: string;
  scoring_version: string;
  fallback_reason: null;
  public_setup: JsonRecord;
  progress_revision: number;
  public_state: JsonRecord;
  reveal_setup: JsonRecord | null;
  official_attempt: {
    native_score: number;
    normalized_score: number;
    completed_at: string;
    public_result: JsonRecord;
  } | null;
  action_history: JsonRecord[];
}

export interface FootballTodayRuntimeSnapshot {
  projection: FootballTodayProjection;
  finalSubmission: JsonRecord | null;
}

export type FootballTodayPersistenceSetup = OfficialDailySetupPublication & {
  gameType: OfficialDailyGameType;
};

function asRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as JsonRecord;
}

function recordArray(value: unknown, label: string): JsonRecord[] {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) throw new Error(`${label} must be a string array.`);
  return value as string[];
}

function dayNumber(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Football Today’s Challenge day must use YYYY-MM-DD.");
  const [year, month, date] = day.split("-").map(Number);
  const stamp = Date.UTC(year!, month! - 1, date!);
  if (new Date(stamp).toISOString().slice(0, 10) !== day) throw new Error("Football Today’s Challenge day is invalid.");
  return Math.floor(stamp / 86_400_000);
}

export function footballTodayGameForDay(day: string): OfficialDailyGameType {
  const offset = dayNumber(day) - dayNumber(FOOTBALL_TODAY_ANCHOR_DAY);
  const index = ((offset % FOOTBALL_TODAY_CYCLE.length) + FOOTBALL_TODAY_CYCLE.length) % FOOTBALL_TODAY_CYCLE.length;
  return FOOTBALL_TODAY_CYCLE[index]!;
}

function contextFor(gameType: OfficialDailyGameType, publication: OfficialDailySetupPublication): OfficialDailyRuntimeContext {
  return {
    gameType,
    setupKey: publication.setupKey,
    publicSetup: publication.publicSetup,
    revealSetup: publication.revealSetup,
    privateSetupEvidence: publication.privateSetupEvidence,
    privateGradingEvidence: publication.privateGradingEvidence,
    submissionState: {},
    publicState: asRecord(publication.publicSetup.initial_state, "Football daily initial state"),
  };
}

function replay(
  gameType: OfficialDailyGameType,
  publication: OfficialDailySetupPublication,
  actions: readonly JsonRecord[],
) {
  let context = contextFor(gameType, publication);
  let complete = false;
  let finalSubmission: JsonRecord | null = null;
  for (const action of actions) {
    if (complete) throw new Error("Football Today’s Challenge is already complete.");
    const advanced = advanceFootballOfficialDailyRuntime(context, action);
    context = {
      ...context,
      submissionState: advanced.submissionState,
      publicState: advanced.publicState,
    };
    complete = advanced.complete;
    finalSubmission = advanced.finalSubmission;
  }
  return { context, complete, finalSubmission };
}

function numericMap(value: unknown, label: string) {
  const row = asRecord(value, label);
  return Object.fromEntries(Object.entries(row).map(([key, raw]) => {
    const number = Number(raw);
    if (!Number.isFinite(number)) throw new Error(`${label} contains an invalid score.`);
    return [key, number];
  }));
}

function grade(
  gameType: OfficialDailyGameType,
  context: OfficialDailyRuntimeContext,
  finalSubmission: JsonRecord,
) {
  if (gameType === "find_leader") {
    const native = Number(context.publicState.native_progress);
    if (!Number.isInteger(native) || native < 1 || native > 10) throw new Error("Football Find the Leader score is invalid.");
    return { native, normalized: native * 10, result: { eliminated_ids: finalSubmission.eliminated_ids } };
  }

  if (gameType === "wavelength") {
    const guesses = Array.isArray(finalSubmission.guesses) ? finalSubmission.guesses.map(Number) : [];
    if (guesses.length !== 4 || guesses.some((guess) => !Number.isInteger(guess) || guess < 1 || guess > 100)) {
      throw new Error("Football Wavelength final guesses are invalid.");
    }
    const target = Number(context.privateGradingEvidence.target);
    const normalized = wavelengthScore(guesses[3]!, target);
    return { native: normalized, normalized, result: { guesses, target } };
  }

  if (gameType === "blind_resume") {
    const results = recordArray(context.publicState.results, "Football Blind Resume results");
    const normalized = results.reduce((sum, row) => sum + Number(row.points_awarded ?? 0), 0);
    const correct = results.filter((row) => row.correct === true).length;
    return { native: normalized, normalized, result: { correct, results } };
  }

  if (gameType === "blind_rank_5") {
    const ordered = stringArray(finalSubmission.ordered_ids, "Football Blind Rank final order");
    const ratings = numericMap(context.privateGradingEvidence.ratings, "Football Blind Rank ratings");
    const score = scoreBlindRankOrderedRatings(ordered.map((id) => ratings[id] ?? -1));
    return {
      native: score.correctComparisons,
      normalized: score.normalizedScore,
      result: { ordered_ids: ordered, correct_comparisons: score.correctComparisons },
    };
  }

  if (gameType === "keep_4_cut_4") {
    const kept = stringArray(finalSubmission.kept_ids, "Football Keep Cut kept ids");
    const board = stringArray(context.privateGradingEvidence.fighter_ids, "Football Keep Cut board ids");
    const ratings = numericMap(context.privateGradingEvidence.ratings, "Football Keep Cut ratings");
    const keptSet = new Set(kept);
    const cut = board.filter((id) => !keptSet.has(id));
    if (kept.length !== 4 || cut.length !== 4) throw new Error("Football Keep Cut final split is invalid.");
    let correctComparisons = 0;
    for (const keptId of kept) for (const cutId of cut) {
      if ((ratings[keptId] ?? -1) >= (ratings[cutId] ?? 101) - 1) correctComparisons += 1;
    }
    const normalized = Math.max(0, Math.min(100, Math.round(correctComparisons * 6.25)));
    return { native: correctComparisons, normalized, result: { kept_ids: kept, correct_comparisons: correctComparisons } };
  }

  const selected = stringArray(finalSubmission.selected_ids, "Football Hit the Number selections");
  const values = numericMap(context.privateGradingEvidence.values, "Football Hit the Number values");
  const target = Number(context.privateGradingEvidence.target);
  const pickCount = Number(context.privateGradingEvidence.pick_count);
  if (selected.length !== pickCount) throw new Error("Football Hit the Number final selection is invalid.");
  const total = selected.reduce((sum, id) => sum + (values[id] ?? Number.NaN), 0);
  if (!Number.isFinite(total)) throw new Error("Football Hit the Number final total is invalid.");
  const distance = Math.abs(target - total);
  const status: HitTheNumberResultStatus = distance < 1e-9 ? "perfect" : total > target ? "bust" : "under";
  const normalized = hitTheNumberScore({ status, target, distance, pickCount });
  return { native: normalized, normalized, result: { selected_ids: selected, total, target, distance, status } };
}

function publicAttempt(graded: ReturnType<typeof grade>) {
  return {
    native_score: graded.native,
    normalized_score: graded.normalized,
    completed_at: new Date().toISOString(),
    public_result: graded.result,
  };
}

function buildSingle(day: string, gameType: OfficialDailyGameType, actions: readonly JsonRecord[]): FootballTodayProjection {
  const publication = buildFootballOfficialDailySetup(gameType, day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const run = replay(gameType, publication, actions);
  const graded = run.complete && run.finalSubmission ? grade(gameType, run.context, run.finalSubmission) : null;
  return {
    available: true,
    sport: "football",
    id: `football:${FOOTBALL_TODAY_SCHEDULE_VERSION}:${day}:${gameType}`,
    central_day: day,
    schedule_version: FOOTBALL_TODAY_SCHEDULE_VERSION,
    game_type: gameType,
    setup_key: publication.setupKey,
    content_version: publication.contentVersion,
    scoring_version: publication.scoringVersion,
    fallback_reason: null,
    public_setup: publication.publicSetup,
    progress_revision: actions.length,
    public_state: run.context.publicState,
    reveal_setup: run.complete ? publication.revealSetup : null,
    official_attempt: graded ? publicAttempt(graded) : null,
    action_history: actions.map((action) => ({ ...action })),
  };
}

function buildDailyDouble(day: string, actions: readonly JsonRecord[]): FootballTodayProjection {
  const rankPublication = buildFootballOfficialDailySetup("blind_rank_5", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const keepPublication = buildFootballOfficialDailySetup("keep_4_cut_4", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const rankActions = actions.slice(0, Math.min(actions.length, 5));
  const keepActions = actions.slice(5);
  const rank = replay("blind_rank_5", rankPublication, rankActions);
  if (keepActions.length && !rank.complete) throw new Error("Football Daily Double Keep/Cut cannot start before Blind Rank 5 is complete.");
  const activeGameType: OfficialDailyGameType = rank.complete ? "keep_4_cut_4" : "blind_rank_5";
  const activePublication = rank.complete ? keepPublication : rankPublication;
  let activeContext = rank.context;
  let keep = null as ReturnType<typeof replay> | null;
  if (rank.complete) {
    keep = replay("keep_4_cut_4", keepPublication, keepActions);
    activeContext = keep.context;
  }
  const rankGrade = rank.complete && rank.finalSubmission ? grade("blind_rank_5", rank.context, rank.finalSubmission) : null;
  const keepGrade = keep?.complete && keep.finalSubmission ? grade("keep_4_cut_4", keep.context, keep.finalSubmission) : null;
  const complete = Boolean(rankGrade && keepGrade);
  const combined = complete ? Math.round((rankGrade!.normalized + keepGrade!.normalized) / 2) : null;
  const publicState: JsonRecord = {
    ...activeContext.publicState,
    combo: true,
    combo_stage: activeGameType,
    combo_blind_rank_result: rankGrade ? { normalized_score: rankGrade.normalized, ...rankGrade.result } : null,
  };
  return {
    available: true,
    sport: "football",
    id: `football:${FOOTBALL_TODAY_SCHEDULE_VERSION}:${day}:${FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION}`,
    central_day: day,
    schedule_version: FOOTBALL_TODAY_SCHEDULE_VERSION,
    game_type: activeGameType,
    setup_key: activePublication.setupKey,
    content_version: FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION,
    scoring_version: "play-official-score-v4",
    fallback_reason: null,
    public_setup: activePublication.publicSetup,
    progress_revision: actions.length,
    public_state: publicState,
    reveal_setup: complete ? {
      blind_rank_5: rankPublication.revealSetup,
      keep_4_cut_4: keepPublication.revealSetup,
    } : null,
    official_attempt: complete ? {
      native_score: combined!,
      normalized_score: combined!,
      completed_at: new Date().toISOString(),
      public_result: {
        blind_rank_score: rankGrade!.normalized,
        keep_cut_score: keepGrade!.normalized,
        combined_score: combined,
      },
    } : null,
    action_history: actions.map((action) => ({ ...action })),
  };
}

export function buildFootballTodayProjection(
  day: string,
  actionHistory: readonly JsonRecord[] = [],
): FootballTodayProjection {
  dayNumber(day);
  if (actionHistory.length > 32) throw new Error("Football Today’s Challenge action history is too long.");
  const gameType = footballTodayGameForDay(day);
  return gameType === "keep_4_cut_4"
    ? buildDailyDouble(day, actionHistory)
    : buildSingle(day, gameType, actionHistory);
}

export function buildFootballTodayPersistenceSetup(day: string): FootballTodayPersistenceSetup {
  dayNumber(day);
  const gameType = footballTodayGameForDay(day);
  if (gameType !== "keep_4_cut_4") {
    return {
      gameType,
      ...buildFootballOfficialDailySetup(gameType, day, FOOTBALL_TODAY_SCHEDULE_VERSION),
    };
  }

  const rank = buildFootballOfficialDailySetup("blind_rank_5", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const keep = buildFootballOfficialDailySetup("keep_4_cut_4", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  return {
    gameType: "keep_4_cut_4",
    setupKey: `${FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION}:${FOOTBALL_TODAY_SCHEDULE_VERSION}:${day}`,
    contentVersion: FOOTBALL_DAILY_DOUBLE_CONTENT_VERSION,
    scoringVersion: "play-official-score-v4",
    publicSetup: {
      runtime_version: "football-official-daily-v1",
      combo_version: SHARED_DAILY_DOUBLE_GRADING_VERSION,
      initial_state: rank.publicSetup.initial_state,
    },
    revealSetup: {
      blind_rank_5: rank.revealSetup,
      keep_4_cut_4: keep.revealSetup,
    },
    privateSetupEvidence: {
      combo_version: SHARED_DAILY_DOUBLE_GRADING_VERSION,
      blind_rank_5: rank.privateSetupEvidence,
      keep_4_cut_4: keep.privateSetupEvidence,
    },
    privateGradingEvidence: {
      combo_version: SHARED_DAILY_DOUBLE_GRADING_VERSION,
      blind_rank: rank.privateGradingEvidence,
      keep_cut: keep.privateGradingEvidence,
    },
  };
}

export function buildFootballTodayRuntimeSnapshot(
  day: string,
  actionHistory: readonly JsonRecord[] = [],
): FootballTodayRuntimeSnapshot {
  const projection = buildFootballTodayProjection(day, actionHistory);
  const gameType = footballTodayGameForDay(day);
  if (gameType !== "keep_4_cut_4") {
    const publication = buildFootballOfficialDailySetup(gameType, day, FOOTBALL_TODAY_SCHEDULE_VERSION);
    const run = replay(gameType, publication, actionHistory);
    return {
      projection,
      finalSubmission: run.complete ? run.finalSubmission : null,
    };
  }

  const rankPublication = buildFootballOfficialDailySetup("blind_rank_5", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const keepPublication = buildFootballOfficialDailySetup("keep_4_cut_4", day, FOOTBALL_TODAY_SCHEDULE_VERSION);
  const rankActions = actionHistory.slice(0, Math.min(actionHistory.length, 5));
  const keepActions = actionHistory.slice(5);
  const rank = replay("blind_rank_5", rankPublication, rankActions);
  const keep = rank.complete ? replay("keep_4_cut_4", keepPublication, keepActions) : null;
  return {
    projection,
    finalSubmission: rank.complete && rank.finalSubmission && keep?.complete && keep.finalSubmission
      ? { blind_rank: rank.finalSubmission, keep_cut: keep.finalSubmission }
      : null,
  };
}

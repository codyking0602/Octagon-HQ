import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.110.7";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

type OfficialDailyGameType =
  | "find_leader"
  | "blind_resume"
  | "wavelength"
  | "blind_rank_5"
  | "keep_4_cut_4"
  | "hit_the_number"
  | "who_am_i"
  | "millionaire"
  | "sports_feud"
  | "bar_trivia"
  | "average_fan";

interface OfficialDailyRuntimeContext {
  gameType: OfficialDailyGameType;
  setupKey: string;
  publicSetup: Record<string, unknown>;
  revealSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  privateGradingEvidence: Record<string, unknown>;
  submissionState: Record<string, unknown>;
  publicState: Record<string, unknown>;
}

const DAILY_COMBO_CONTENT_VERSION = "daily-rank-keep-combo-v1";
const DAILY_COMBO_SCORING_VERSION = "play-official-score-v4";
const DAILY_TWO_GAME_FORMAT_VERSION = "daily-two-game-average-v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-octagon-scheduler-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...corsHeaders,
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA,
  },
});

const safeError = (
  status: number,
  code: string,
  message: string,
  details: Record<string, unknown> = {},
) => json({
  code,
  message,
  ...details,
  deployment_sha: DEPLOYED_SOURCE_SHA,
}, status);

type JsonRecord = Record<string, unknown>;

type DailyAdvanceRuntime = (
  context: OfficialDailyRuntimeContext,
  action: unknown,
) => {
  submissionState: JsonRecord;
  publicState: JsonRecord;
  complete: boolean;
  finalSubmission: unknown;
};

type UfcRuntimeModule = {
  buildOfficialDailySetup: (
    gameType: OfficialDailyGameType,
    day: string,
    scheduleVersion: string,
    publicationHistory?: unknown,
  ) => JsonRecord;
  advanceOfficialDailyRuntime: DailyAdvanceRuntime;
};

type FootballPublicationRuntimeModule = {
  buildFootballDailyPersistenceSetup: (
    day: string,
    scheduleVersion: string,
    gameType: OfficialDailyGameType,
    publicationHistory?: unknown,
  ) => unknown;
};

type FootballAdvanceRuntimeModule = {
  advanceFootballOfficialDailyRuntime: DailyAdvanceRuntime;
};

type AverageFanRuntimeModule = {
  buildAverageFanDailySetup: (
    scope: "ufc" | "football",
    day: string,
    scheduleVersion: string,
    publicationHistory?: unknown,
  ) => JsonRecord;
  advanceAverageFanDailyRuntime: DailyAdvanceRuntime;
};

let ufcRuntimePromise: Promise<UfcRuntimeModule> | null = null;
let footballPublicationRuntimePromise: Promise<FootballPublicationRuntimeModule> | null = null;
let footballAdvanceRuntimePromise: Promise<FootballAdvanceRuntimeModule> | null = null;
let averageFanRuntimePromise: Promise<AverageFanRuntimeModule> | null = null;

function loadUfcRuntime() {
  if (!ufcRuntimePromise) {
    ufcRuntimePromise = import("./runtime.generated.mjs") as Promise<UfcRuntimeModule>;
  }
  return ufcRuntimePromise;
}

function loadFootballPublicationRuntime(_gameType: OfficialDailyGameType) {
  if (!footballPublicationRuntimePromise) {
    footballPublicationRuntimePromise = import("./football-publication.generated.mjs") as Promise<FootballPublicationRuntimeModule>;
  }
  return footballPublicationRuntimePromise;
}

function loadFootballAdvanceRuntime() {
  if (!footballAdvanceRuntimePromise) {
    footballAdvanceRuntimePromise = import("./football-advance.generated.mjs") as Promise<FootballAdvanceRuntimeModule>;
  }
  return footballAdvanceRuntimePromise;
}

function loadAverageFanRuntime() {
  if (!averageFanRuntimePromise) {
    averageFanRuntimePromise = import("./average-fan.generated.mjs") as Promise<AverageFanRuntimeModule>;
  }
  return averageFanRuntimePromise;
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null;
}

function requiredRecord(value: unknown, label: string) {
  const row = asRecord(value);
  if (!row) throw new Error(`${label} is unavailable.`);
  return row;
}

function requiredString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is unavailable.`);
  return value;
}

function footballActionHistory(context: OfficialDailyRuntimeContext & JsonRecord) {
  const value = context.submissionState.action_history;
  if (value == null) return [] as JsonRecord[];
  if (!Array.isArray(value) || value.some((row) => !asRecord(row))) {
    throw new Error("Football Today’s Challenge saved action history is invalid.");
  }
  return value as JsonRecord[];
}

function dailyClientActionIds(context: OfficialDailyRuntimeContext & JsonRecord) {
  const value = context.submissionState._client_action_ids;
  if (value == null) return [] as string[];
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) {
    throw new Error("Today’s Challenge saved client action ids are invalid.");
  }
  return value as string[];
}

function requestedClientActionId(body: JsonRecord) {
  if (body.client_action_id == null) return null;
  if (typeof body.client_action_id !== "string") {
    throw new Error("Today’s Challenge client action id is invalid.");
  }
  const id = body.client_action_id.trim();
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(id)) {
    throw new Error("Today’s Challenge client action id is invalid.");
  }
  return id;
}

function submissionStateWithClientActionId(
  submissionState: JsonRecord,
  existingIds: readonly string[],
  clientActionId: string | null,
) {
  if (!clientActionId) return submissionState;
  const ids = [...existingIds, clientActionId].slice(-64);
  return { ...submissionState, _client_action_ids: ids };
}

function runtimeContext(value: unknown): OfficialDailyRuntimeContext & JsonRecord {
  const row = requiredRecord(value, "Daily runtime context");
  return {
    ...row,
    gameType: requiredString(row.game_type, "Daily game type") as OfficialDailyGameType,
    setupKey: requiredString(row.setup_key, "Daily setup key"),
    publicSetup: requiredRecord(row.public_setup, "Daily public setup"),
    revealSetup: requiredRecord(row.reveal_setup, "Daily reveal setup"),
    privateSetupEvidence: requiredRecord(row.private_setup_evidence, "Daily private setup evidence"),
    privateGradingEvidence: requiredRecord(row.private_grading_evidence, "Daily private grading evidence"),
    submissionState: requiredRecord(row.submission_state, "Daily submission state"),
    publicState: requiredRecord(row.public_state, "Daily public state"),
  };
}

function childPublication(publication: JsonRecord) {
  return {
    setup_key: requiredString(publication.setupKey, "Daily child setup key"),
    public_setup: requiredRecord(publication.publicSetup, "Daily child public setup"),
    reveal_setup: requiredRecord(publication.revealSetup, "Daily child reveal setup"),
    private_setup_evidence: requiredRecord(publication.privateSetupEvidence, "Daily child setup evidence"),
    private_grading_evidence: requiredRecord(publication.privateGradingEvidence, "Daily child grading evidence"),
  };
}

function buildDailyComboSetup(day: string, scheduleVersion: string, ufcRuntime: UfcRuntimeModule) {
  const blindRank = ufcRuntime.buildOfficialDailySetup("blind_rank_5", day, scheduleVersion);
  const keepCut = ufcRuntime.buildOfficialDailySetup("keep_4_cut_4", day, scheduleVersion);
  const blindRankChild = childPublication(blindRank);
  const keepCutChild = childPublication(keepCut);
  const blindRankInitial = requiredRecord(blindRankChild.public_setup.initial_state, "Blind Rank initial state");

  return {
    setupKey: `${DAILY_COMBO_CONTENT_VERSION}:${scheduleVersion}:${day}`,
    contentVersion: DAILY_COMBO_CONTENT_VERSION,
    scoringVersion: DAILY_COMBO_SCORING_VERSION,
    publicSetup: {
      runtime_version: "official-daily-runtime-v1",
      combo_version: DAILY_COMBO_CONTENT_VERSION,
      stage_count: 2,
      initial_state: {
        complete: false,
        combo_stage: "blind_rank_5",
        blind_rank_5: blindRankInitial,
      },
    },
    revealSetup: {
      combo_version: DAILY_COMBO_CONTENT_VERSION,
      blind_rank_5: blindRankChild.reveal_setup,
      keep_4_cut_4: keepCutChild.reveal_setup,
    },
    privateSetupEvidence: {
      combo_version: DAILY_COMBO_CONTENT_VERSION,
      blind_rank_5: blindRankChild,
      keep_4_cut_4: keepCutChild,
    },
    privateGradingEvidence: {
      combo_version: DAILY_COMBO_CONTENT_VERSION,
      blind_rank: blindRankChild.private_grading_evidence,
      keep_cut: keepCutChild.private_grading_evidence,
    },
  };
}

function isDailyCombo(context: OfficialDailyRuntimeContext & JsonRecord) {
  return context.content_version === DAILY_COMBO_CONTENT_VERSION
    || context.privateSetupEvidence.combo_version === DAILY_COMBO_CONTENT_VERSION;
}

function isTwoGameDaily(context: OfficialDailyRuntimeContext & JsonRecord) {
  return context.privateSetupEvidence.format_version === DAILY_TWO_GAME_FORMAT_VERSION
    || context.publicSetup.format_version === DAILY_TWO_GAME_FORMAT_VERSION;
}

function twoGameChild(context: OfficialDailyRuntimeContext & JsonRecord, index: number) {
  const rounds = context.privateSetupEvidence.rounds;
  if (!Array.isArray(rounds) || rounds.length !== 2 || rounds.some((round) => !asRecord(round))) {
    throw new Error("Two-game Daily child evidence is invalid.");
  }
  return requiredRecord(rounds[index], `Two-game Daily game ${index + 1} evidence`);
}

function twoGameSeriesState(context: OfficialDailyRuntimeContext & JsonRecord) {
  const index = Number(context.publicState.round_index ?? 0);
  if (!Number.isInteger(index) || index < 0 || index > 1) {
    throw new Error("Two-game Daily active game is invalid.");
  }
  const attempt = asRecord(context.official_attempt);
  const finalSeries = asRecord(asRecord(attempt?.public_result)?.daily_series);
  const storedScores = Array.isArray(context.publicState.round_scores)
    ? context.publicState.round_scores.map(Number)
    : [];
  const finalScores = Array.isArray(finalSeries?.round_scores)
    ? finalSeries.round_scores.map(Number)
    : [];
  const scores = finalScores.length ? finalScores : storedScores;
  const finalAverage = Number(finalSeries?.average_score);
  return {
    format_version: DAILY_TWO_GAME_FORMAT_VERSION,
    game_index: index,
    game_number: index + 1,
    game_count: 2,
    awaiting_next: context.publicState.awaiting_next === true,
    handoff_pending: context.publicState.handoff_pending === true,
    complete: context.publicState.complete === true || Boolean(attempt),
    round_scores: scores,
    average_score: Number.isFinite(finalAverage)
      ? finalAverage
      : context.publicState.complete === true
        ? Number(context.publicState.score ?? 0)
        : null,
    rounds: Array.isArray(finalSeries?.rounds)
      ? finalSeries.rounds
      : context.publicState.completed_rounds ?? [],
  };
}

function comboStage(context: OfficialDailyRuntimeContext & JsonRecord): "blind_rank_5" | "keep_4_cut_4" {
  const stage = context.publicState.combo_stage ?? context.submissionState.combo_stage;
  return stage === "keep_4_cut_4" ? "keep_4_cut_4" : "blind_rank_5";
}

function comboChild(context: OfficialDailyRuntimeContext & JsonRecord, gameType: "blind_rank_5" | "keep_4_cut_4") {
  return requiredRecord(context.privateSetupEvidence[gameType], `Daily combo ${gameType} evidence`);
}

function comboChildContext(
  context: OfficialDailyRuntimeContext & JsonRecord,
  gameType: "blind_rank_5" | "keep_4_cut_4",
): OfficialDailyRuntimeContext {
  const child = comboChild(context, gameType);
  const childSubmission = asRecord(context.submissionState[gameType]) ?? {};
  const childPublic = asRecord(context.publicState[gameType])
    ?? requiredRecord(requiredRecord(child.public_setup, "Daily combo public setup").initial_state, "Daily combo initial state");
  return {
    gameType,
    setupKey: requiredString(child.setup_key, "Daily combo child setup key"),
    publicSetup: requiredRecord(child.public_setup, "Daily combo child public setup"),
    revealSetup: requiredRecord(child.reveal_setup, "Daily combo child reveal setup"),
    privateSetupEvidence: requiredRecord(child.private_setup_evidence, "Daily combo child setup evidence"),
    privateGradingEvidence: requiredRecord(child.private_grading_evidence, "Daily combo child grading evidence"),
    submissionState: childSubmission,
    publicState: childPublic,
  };
}

function advanceDailyCombo(
  context: OfficialDailyRuntimeContext & JsonRecord,
  action: unknown,
  advanceRuntime: DailyAdvanceRuntime,
) {
  const stage = comboStage(context);
  const advanced = advanceRuntime(comboChildContext(context, stage), action);

  if (stage === "blind_rank_5") {
    if (!advanced.complete) {
      return {
        submissionState: {
          ...context.submissionState,
          combo_stage: stage,
          blind_rank_5: advanced.submissionState,
          final_submission: null,
        },
        publicState: {
          ...context.publicState,
          complete: false,
          combo_stage: stage,
          blind_rank_5: advanced.publicState,
        },
        complete: false,
        finalSubmission: null,
      };
    }

    const keepCut = comboChild(context, "keep_4_cut_4");
    const keepCutInitial = requiredRecord(
      requiredRecord(keepCut.public_setup, "Daily combo Keep Cut setup").initial_state,
      "Daily combo Keep Cut initial state",
    );
    return {
      submissionState: {
        combo_stage: "keep_4_cut_4",
        blind_rank_5: advanced.submissionState,
        keep_4_cut_4: {},
        final_submission: null,
      },
      publicState: {
        complete: false,
        combo_stage: "keep_4_cut_4",
        blind_rank_5: advanced.publicState,
        keep_4_cut_4: keepCutInitial,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  if (!advanced.complete) {
    return {
      submissionState: {
        ...context.submissionState,
        combo_stage: stage,
        keep_4_cut_4: advanced.submissionState,
        final_submission: null,
      },
      publicState: {
        ...context.publicState,
        complete: false,
        combo_stage: stage,
        keep_4_cut_4: advanced.publicState,
      },
      complete: false,
      finalSubmission: null,
    };
  }

  const blindRankSubmission = requiredRecord(context.submissionState.blind_rank_5, "Completed Blind Rank combo state");
  const blindRankFinal = requiredRecord(blindRankSubmission.final_submission, "Completed Blind Rank combo submission");
  const keepCutFinal = requiredRecord(advanced.finalSubmission, "Completed Keep Cut combo submission");
  const finalSubmission = {
    blind_rank: blindRankFinal,
    keep_cut: keepCutFinal,
  };

  return {
    submissionState: {
      ...context.submissionState,
      combo_stage: stage,
      keep_4_cut_4: advanced.submissionState,
      final_submission: finalSubmission,
    },
    publicState: {
      ...context.publicState,
      complete: true,
      combo_stage: stage,
      keep_4_cut_4: advanced.publicState,
    },
    complete: true,
    finalSubmission,
  };
}


async function whoAmIPublicationHistory(
  admin: SupabaseClient,
  sport: "ufc" | "football",
  day: string,
) {
  const response = await admin.rpc("get_who_am_i_publication_history", {
    p_sport: sport,
    p_before_day: day,
  });
  if (response.error || !Array.isArray(response.data)) {
    throw new Error("Who Am I publication history is unavailable.");
  }
  return response.data;
}

async function averageFanPublicationHistory(
  admin: SupabaseClient,
  sport: "ufc" | "football",
  day: string,
) {
  const response = await admin.rpc("get_average_fan_publication_history", {
    p_sport: sport,
    p_before_day: day,
  });
  if (response.error || !Array.isArray(response.data)) {
    throw new Error("Average Fan publication history is unavailable.");
  }
  return response.data;
}

async function materializeToday(admin: SupabaseClient) {
  const prepared = await admin.rpc("prepare_daily_two_game_cutover", { p_sport: "ufc" });
  if (prepared.error) {
    throw new Error("The UFC two-game Daily cutover could not be prepared safely.");
  }

  const relaunchReset = await admin.rpc("reset_sep24_ufc_sports_feud_for_relaunch", {});
  if (relaunchReset.error) {
    throw new Error("The September 24 UFC Sports Feud relaunch reset failed.");
  }

  const requested = await admin.rpc("get_daily_challenge_materialization_request", {});
  if (requested.error) throw new Error("The official daily materialization request failed.");
  const request = requiredRecord(requested.data, "Daily materialization request");
  const day = requiredString(request.central_day, "Central day");
  const scheduleVersion = requiredString(request.schedule_version, "Schedule version");
  const expectedGame = requiredString(request.expected_game, "Expected daily game") as OfficialDailyGameType;

  if (request.required !== true) {
    const dailyChallengeId = requiredString(request.daily_challenge_id, "Daily challenge id");
    const restored = await admin.rpc("restore_daily_two_game_cutover_progress", {
      p_daily_challenge_id: dailyChallengeId,
    });
    if (restored.error) throw new Error("The UFC two-game Daily carryover could not be restored.");
    return {
      dailyChallengeId,
      centralDay: day,
      scheduleVersion,
      gameType: requiredString(request.published_game, "Published game"),
      fallbackReason: typeof request.fallback_reason === "string" ? request.fallback_reason : null,
      created: false,
    };
  }

  let gameType = expectedGame;
  let fallbackReason: string | null = null;
  let publication;
  let ufcRuntime: UfcRuntimeModule | null = null;
  try {
    const publicationHistory = gameType === "who_am_i"
      ? await whoAmIPublicationHistory(admin, "ufc", day)
      : gameType === "average_fan"
        ? await averageFanPublicationHistory(admin, "ufc", day)
        : undefined;
    if (gameType === "average_fan") {
      const averageFanRuntime = await loadAverageFanRuntime();
      publication = averageFanRuntime.buildAverageFanDailySetup("ufc", day, scheduleVersion, publicationHistory);
    } else {
      ufcRuntime = await loadUfcRuntime();
      publication = gameType === "keep_4_cut_4"
        ? buildDailyComboSetup(day, scheduleVersion, ufcRuntime)
        : ufcRuntime.buildOfficialDailySetup(gameType, day, scheduleVersion, publicationHistory);
    }
  } catch {
    if (gameType === "find_leader") throw new Error("The official Find the Leader fallback could not be materialized.");
    fallbackReason = `materialization_failed:${gameType}`;
    gameType = "find_leader";
    ufcRuntime ??= await loadUfcRuntime();
    publication = ufcRuntime.buildOfficialDailySetup(gameType, day, scheduleVersion);
  }

  const published = await admin.rpc("publish_daily_challenge_setup", {
    p_central_day: day,
    p_schedule_version: scheduleVersion,
    p_game_type: gameType,
    p_setup_key: publication.setupKey,
    p_content_version: publication.contentVersion,
    p_scoring_version: publication.scoringVersion,
    p_public_setup: publication.publicSetup,
    p_reveal_setup: publication.revealSetup,
    p_private_setup_evidence: publication.privateSetupEvidence,
    p_private_grading_evidence: publication.privateGradingEvidence,
    p_fallback_reason: fallbackReason,
  });
  if (published.error) throw new Error("The official daily setup could not be published safely.");
  const result = requiredRecord(published.data, "Published daily setup");
  const dailyChallengeId = requiredString(result.id, "Published daily challenge id");
  const restored = await admin.rpc("restore_daily_two_game_cutover_progress", {
    p_daily_challenge_id: dailyChallengeId,
  });
  if (restored.error) throw new Error("The UFC two-game Daily carryover could not be restored.");

  return {
    dailyChallengeId,
    centralDay: day,
    scheduleVersion,
    gameType,
    fallbackReason,
    created: true,
  };
}

async function materializeFootballToday(admin: SupabaseClient) {
  const prepared = await admin.rpc("prepare_daily_two_game_cutover", { p_sport: "football" });
  if (prepared.error) {
    throw new Error("The Football two-game Daily cutover could not be prepared safely.");
  }

  const requested = await admin.rpc("get_daily_challenge_materialization_request", {
    p_sport: "football",
  });
  if (requested.error) throw new Error("The official Football daily materialization request failed.");
  const request = requiredRecord(requested.data, "Football daily materialization request");
  const day = requiredString(request.central_day, "Football Central day");
  const scheduleVersion = requiredString(request.schedule_version, "Football schedule version");
  const expectedGame = requiredString(request.expected_game, "Football expected game");

  if (request.required !== true) {
    const dailyChallengeId = requiredString(request.daily_challenge_id, "Football daily challenge id");
    const restored = await admin.rpc("restore_daily_two_game_cutover_progress", {
      p_daily_challenge_id: dailyChallengeId,
    });
    if (restored.error) throw new Error("The Football two-game Daily carryover could not be restored.");
    return {
      dailyChallengeId,
      centralDay: day,
      scheduleVersion,
      gameType: requiredString(request.published_game, "Published Football game"),
      created: false,
    };
  }

  const publicationHistory = expectedGame === "who_am_i"
    ? await whoAmIPublicationHistory(admin, "football", day)
    : expectedGame === "average_fan"
      ? await averageFanPublicationHistory(admin, "football", day)
      : undefined;
  const publication = expectedGame === "average_fan"
    ? {
        gameType: expectedGame,
        scheduleVersion,
        ...(await loadAverageFanRuntime()).buildAverageFanDailySetup(
          "football",
          day,
          scheduleVersion,
          publicationHistory,
        ),
      }
    : await (async () => {
        const footballRuntime = await loadFootballPublicationRuntime(expectedGame as OfficialDailyGameType);
        return footballRuntime.buildFootballDailyPersistenceSetup(
          day,
          scheduleVersion,
          expectedGame as OfficialDailyGameType,
          publicationHistory,
        ) as JsonRecord;
      })();
  const publicationSchedule = requiredString(publication.scheduleVersion, "Football daily schedule version");
  const publicationGame = requiredString(publication.gameType, "Football daily game type");
  if (publicationSchedule !== scheduleVersion || publicationGame !== expectedGame) {
    throw new Error("The Football Daily runtime does not match the canonical schedule request.");
  }

  const published = await admin.rpc("publish_daily_challenge_setup", {
    p_central_day: day,
    p_schedule_version: scheduleVersion,
    p_game_type: publicationGame,
    p_setup_key: requiredString(publication.setupKey, "Football daily setup key"),
    p_content_version: requiredString(publication.contentVersion, "Football daily content version"),
    p_scoring_version: requiredString(publication.scoringVersion, "Football daily scoring version"),
    p_public_setup: requiredRecord(publication.publicSetup, "Football daily public setup"),
    p_reveal_setup: requiredRecord(publication.revealSetup, "Football daily reveal setup"),
    p_private_setup_evidence: requiredRecord(publication.privateSetupEvidence, "Football daily private setup evidence"),
    p_private_grading_evidence: requiredRecord(publication.privateGradingEvidence, "Football daily private grading evidence"),
    p_fallback_reason: null,
  });
  if (published.error) throw new Error("The official Football daily setup could not be published safely.");
  const result = requiredRecord(published.data, "Published Football daily setup");
  const dailyChallengeId = requiredString(result.id, "Published Football daily challenge id");
  const restored = await admin.rpc("restore_daily_two_game_cutover_progress", {
    p_daily_challenge_id: dailyChallengeId,
  });
  if (restored.error) throw new Error("The Football two-game Daily carryover could not be restored.");
  return {
    dailyChallengeId,
    centralDay: day,
    scheduleVersion,
    gameType: publicationGame,
    created: true,
  };
}

async function getContext(admin: SupabaseClient, dailyChallengeId: string, profileId: string) {
  const response = await admin.rpc("get_daily_challenge_runtime_context", {
    p_daily_challenge_id: dailyChallengeId,
    p_profile_id: profileId,
  });
  if (response.error) throw new Error("The official daily runtime state is unavailable.");
  return runtimeContext(response.data);
}

function publicPayload(context: OfficialDailyRuntimeContext & JsonRecord) {
  const attempt = asRecord(context.official_attempt);

  if (isTwoGameDaily(context)) {
    const series = twoGameSeriesState(context);
    const child = twoGameChild(context, series.game_index);
    const activePublicState = requiredRecord(context.publicState.active_round, "Two-game Daily active public state");
    const publicState = {
      ...activePublicState,
      daily_series: series,
    };
    const revealAllowed = Boolean(attempt) || series.awaiting_next || series.complete;
    return {
      available: true,
      id: context.daily_challenge_id,
      central_day: context.central_day,
      schedule_version: context.schedule_version,
      game_type: context.game_type,
      setup_key: requiredString(child.setup_key, "Two-game Daily child setup key"),
      content_version: requiredString(child.content_version, "Two-game Daily child content version"),
      scoring_version: context.scoring_version,
      fallback_reason: context.fallback_reason ?? null,
      public_setup: requiredRecord(child.public_setup, "Two-game Daily child public setup"),
      progress_revision: context.progress_revision,
      public_state: publicState,
      reveal_setup: revealAllowed
        ? requiredRecord(child.reveal_setup, "Two-game Daily child reveal setup")
        : null,
      official_attempt: (() => {
        if (!attempt) return null;
        const finalSeries = asRecord(asRecord(attempt.public_result)?.daily_series);
        const rounds = Array.isArray(finalSeries?.rounds)
          ? finalSeries.rounds.map((row) => asRecord(row))
          : [];
        const round = asRecord(rounds[series.game_index]);
        if (!round) return attempt;
        return {
          ...attempt,
          native_score: Number(round.native_score ?? attempt.native_score ?? 0),
          normalized_score: Number(round.normalized_score ?? attempt.normalized_score ?? 0),
          public_result: {
            ...round,
            daily_series: series,
          },
        };
      })(),
      deployment_sha: DEPLOYED_SOURCE_SHA,
    };
  }

  if (isDailyCombo(context)) {
    const stage = comboStage(context);
    const child = comboChild(context, stage);
    const activePublicState = requiredRecord(context.publicState[stage], `Daily combo ${stage} public state`);
    const publicState = attempt && stage === "keep_4_cut_4"
      ? {
          ...activePublicState,
          combo_blind_rank_result: requiredRecord(
            context.publicState.blind_rank_5,
            "Completed Blind Rank combo result",
          ),
        }
      : activePublicState;
    return {
      available: true,
      id: context.daily_challenge_id,
      central_day: context.central_day,
      schedule_version: context.schedule_version,
      game_type: stage,
      setup_key: child.setup_key,
      content_version: context.content_version,
      scoring_version: context.scoring_version,
      fallback_reason: context.fallback_reason ?? null,
      public_setup: child.public_setup,
      progress_revision: context.progress_revision,
      public_state: publicState,
      reveal_setup: attempt ? child.reveal_setup : null,
      official_attempt: attempt,
      deployment_sha: DEPLOYED_SOURCE_SHA,
    };
  }

  return {
    available: true,
    id: context.daily_challenge_id,
    central_day: context.central_day,
    schedule_version: context.schedule_version,
    game_type: context.game_type,
    setup_key: context.setup_key,
    content_version: context.content_version,
    scoring_version: context.scoring_version,
    fallback_reason: context.fallback_reason ?? null,
    public_setup: context.public_setup,
    progress_revision: context.progress_revision,
    public_state: context.public_state,
    reveal_setup: attempt ? context.reveal_setup : null,
    official_attempt: attempt,
    deployment_sha: DEPLOYED_SOURCE_SHA,
  };
}

function footballPublicPayload(context: OfficialDailyRuntimeContext & JsonRecord) {
  return {
    ...publicPayload(context),
    sport: "football",
    action_history: footballActionHistory(context),
  };
}

function normalizeLegacyFootballProgress(
  context: OfficialDailyRuntimeContext & JsonRecord,
  advanceFootballRuntime: DailyAdvanceRuntime,
) {
  const history = footballActionHistory(context);
  if (!history.length || isDailyCombo(context)) return context;

  const stateKeys = Object.keys(context.submissionState)
    .filter((key) => key !== "action_history" && key !== "final_submission" && key !== "_client_action_ids");
  if (stateKeys.length) return context;

  let replayContext: OfficialDailyRuntimeContext = {
    gameType: context.gameType,
    setupKey: context.setupKey,
    publicSetup: context.publicSetup,
    revealSetup: context.revealSetup,
    privateSetupEvidence: context.privateSetupEvidence,
    privateGradingEvidence: context.privateGradingEvidence,
    submissionState: {},
    publicState: requiredRecord(context.publicSetup.initial_state, "Football daily initial state"),
  };

  for (const action of history) {
    const advanced = advanceFootballRuntime(replayContext, action);
    replayContext = {
      ...replayContext,
      submissionState: advanced.submissionState,
      publicState: advanced.publicState,
    };
  }

  return {
    ...context,
    submissionState: {
      ...replayContext.submissionState,
      action_history: history,
      ...(dailyClientActionIds(context).length
        ? { _client_action_ids: dailyClientActionIds(context) }
        : {}),
    },
    publicState: replayContext.publicState,
  };
}

async function finalizePending(
  userClient: SupabaseClient,
  admin: SupabaseClient,
  context: OfficialDailyRuntimeContext & JsonRecord,
  profileId: string,
) {
  if (asRecord(context.official_attempt)) return context;
  const finalSubmission = asRecord(context.submissionState.final_submission);
  if (!finalSubmission) return context;

  const submitted = await userClient.rpc("submit_my_daily_challenge_attempt", {
    p_daily_challenge_id: context.daily_challenge_id,
    p_submission: finalSubmission,
  });
  if (submitted.error) throw new Error("The completed official daily result could not be recorded.");
  return getContext(admin, String(context.daily_challenge_id), profileId);
}

async function continueTwoGameWithoutIntermission(
  admin: SupabaseClient,
  context: OfficialDailyRuntimeContext & JsonRecord,
  profileId: string,
) {
  if (!isTwoGameDaily(context) || context.publicState.awaiting_next !== true) return context;

  const roundIndex = Number(context.publicState.round_index ?? 0);
  const completedRounds = Array.isArray(context.publicState.completed_rounds)
    ? context.publicState.completed_rounds
    : [];
  const roundScores = Array.isArray(context.publicState.round_scores)
    ? context.publicState.round_scores
    : [];
  const children = Array.isArray(context.privateSetupEvidence.rounds)
    ? context.privateSetupEvidence.rounds
    : [];

  if (roundIndex !== 0 || completedRounds.length < 1 || roundScores.length < 1 || children.length !== 2) {
    throw new Error("Two-game Daily saved intermission state is invalid.");
  }

  const secondChild = requiredRecord(children[1], "Two-game Daily second child");
  const secondPublicSetup = requiredRecord(secondChild.public_setup, "Two-game Daily second public setup");
  const secondInitial = requiredRecord(secondPublicSetup.initial_state, "Two-game Daily second initial state");

  const saved = await admin.rpc("save_daily_challenge_runtime_progress", {
    p_daily_challenge_id: String(context.daily_challenge_id),
    p_profile_id: profileId,
    p_expected_revision: Number(context.progress_revision),
    p_submission_state: context.submissionState,
    p_public_state: {
      ...context.publicState,
      complete: false,
      round_index: 1,
      round_count: 2,
      awaiting_next: false,
      handoff_pending: context.gameType === "wavelength",
      active_round: secondInitial,
      active_reveal: null,
      score: null,
    },
  });

  if (saved.error) {
    if (saved.error.code === "40001") {
      return getContext(admin, String(context.daily_challenge_id), profileId);
    }
    throw new Error("The two-game Daily could not continue into Game 2.");
  }

  return getContext(admin, String(context.daily_challenge_id), profileId);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return safeError(405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  let body: JsonRecord = {};
  try { body = asRecord(await request.json()) ?? {}; } catch { /* empty input */ }
  if (body.mode === "deployment-info") return json({ deployment_sha: DEPLOYED_SOURCE_SHA });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY");
  if (!url || !anonKey || !serviceKey) {
    return safeError(503, "DAILY_RUNTIME_NOT_CONFIGURED", "The official daily runtime is not configured.");
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    if (body.mode === "scheduled") {
      const schedulerToken = request.headers.get("x-octagon-scheduler-token") ?? "";
      const authorized = await admin.rpc("authorize_pick_monitoring_scheduler", { p_token: schedulerToken });
      if (authorized.error || authorized.data !== true) {
        return safeError(401, "SCHEDULER_AUTH_REQUIRED", "Scheduled daily materialization authorization required.");
      }

      const scheduledSport = body.sport == null ? "ufc" : body.sport;
      if (scheduledSport !== "ufc" && scheduledSport !== "football") {
        return safeError(400, "INVALID_SPORT", "Scheduled daily materialization sport must be UFC or Football.");
      }
      if (scheduledSport === "football") {
        const maintained = await admin.rpc("run_football_weekly_auction_maintenance", {});
        if (maintained.error) {
          throw new Error("Football Weekly Auction scheduled maintenance failed.");
        }
      }
      const materialized = scheduledSport === "football"
        ? await materializeFootballToday(admin)
        : await materializeToday(admin);
      return json({
        status: materialized.created ? "materialized" : "already_materialized",
        sport: scheduledSport,
        ...materialized,
        deployment_sha: DEPLOYED_SOURCE_SHA,
      });
    }

    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.replace(/^Bearer\s+/i, "");
    const authenticated = await admin.auth.getUser(token);
    if (authenticated.error || !authenticated.data.user) {
      return safeError(401, "SIGN_IN_REQUIRED", "Sign in required.");
    }
    const profileId = authenticated.data.user.id;
    const userClient = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    if (body.sport === "football") {
      const previewRequest = await admin.rpc("get_daily_challenge_materialization_request", {
        p_sport: "football",
      });
      if (previewRequest.error) {
        throw new Error("The Football Daily preview request failed.");
      }
      const preview = requiredRecord(previewRequest.data, "Football Daily preview");
      const previewDay = requiredString(preview.central_day, "Football preview Central day");
      const previewScheduleVersion = requiredString(preview.schedule_version, "Football preview schedule version");
      const previewGame = requiredString(preview.expected_game, "Football preview game");

      const materialized = await materializeFootballToday(admin);
      let context = await getContext(admin, materialized.dailyChallengeId, profileId);
      context = await finalizePending(userClient, admin, context, profileId);
      context = await continueTwoGameWithoutIntermission(admin, context, profileId);

      const continuingFootballDaily = Number(context.progress_revision ?? 0) > 0
        || Boolean(asRecord(context.official_attempt));
      if (!continuingFootballDaily) {
        const weeklyGate = await admin.rpc("football_weekly_auction_daily_gate", {
          p_profile_id: profileId,
        });
        if (weeklyGate.error) {
          throw new Error("Football Weekly Auction gate could not be checked.");
        }
        const weeklyGateState = requiredRecord(weeklyGate.data, "Football Weekly Auction gate");
        if (weeklyGateState.required === true) {
          return safeError(
            409,
            "WEEKLY_AUCTION_REQUIRED",
            "Submit today’s Weekly Auction bids before starting Football Daily.",
            {
              central_day: previewDay,
              schedule_version: previewScheduleVersion,
              game_type: previewGame,
            },
          );
        }
      }

      if (body.mode === "get-today" || body.mode === undefined) {
        return json(footballPublicPayload(context));
      }
      if (body.mode !== "advance") {
        return safeError(400, "INVALID_MODE", "Unsupported Football Today’s Challenge runtime mode.");
      }
      const clientActionId = requestedClientActionId(body);
      if (clientActionId && dailyClientActionIds(context).includes(clientActionId)) {
        return json(footballPublicPayload(context));
      }
      if (asRecord(context.official_attempt)) {
        return safeError(409, "OFFICIAL_ATTEMPT_COMPLETE", "The official Football first attempt is already complete.");
      }

      const requestedDailyId = typeof body.daily_challenge_id === "string" ? body.daily_challenge_id : materialized.dailyChallengeId;
      if (requestedDailyId !== materialized.dailyChallengeId) {
        return safeError(409, "DAILY_IDENTITY_CHANGED", "Today’s Football challenge identity has changed.");
      }
      if (!Number.isInteger(body.revision) || Number(body.revision) !== Number(context.progress_revision)) {
        return safeError(409, "STALE_PROGRESS", "Football Today’s Challenge progress changed on another device. Refresh and continue from the latest state.");
      }

      const advanceFootballRuntime = context.gameType === "average_fan"
        ? (await loadAverageFanRuntime()).advanceAverageFanDailyRuntime
        : (await loadFootballAdvanceRuntime()).advanceFootballOfficialDailyRuntime;
      context = normalizeLegacyFootballProgress(context, advanceFootballRuntime);
      const history = footballActionHistory(context);
      const action = requiredRecord(body.action, "Football daily action");
      const advanced = isDailyCombo(context)
        ? advanceDailyCombo(context, action, advanceFootballRuntime)
        : advanceFootballRuntime(context, action);
      const saved = await admin.rpc("save_daily_challenge_runtime_progress", {
        p_daily_challenge_id: materialized.dailyChallengeId,
        p_profile_id: profileId,
        p_expected_revision: Number(context.progress_revision),
        p_submission_state: submissionStateWithClientActionId({
          ...advanced.submissionState,
          action_history: [...history, action],
        }, dailyClientActionIds(context), clientActionId),
        p_public_state: advanced.publicState,
      });
      if (saved.error) {
        if (saved.error.code === "40001") {
          return safeError(409, "STALE_PROGRESS", "Football Today’s Challenge progress changed on another device. Refresh and continue from the latest state.");
        }
        throw new Error("The official Football daily progress could not be saved.");
      }

      context = await getContext(admin, materialized.dailyChallengeId, profileId);
      context = await finalizePending(userClient, admin, context, profileId);
      return json(footballPublicPayload(context));
    }

    const materialized = await materializeToday(admin);
    let context = await getContext(admin, materialized.dailyChallengeId, profileId);
    context = await finalizePending(userClient, admin, context, profileId);
    context = await continueTwoGameWithoutIntermission(admin, context, profileId);

    if (body.mode === "get-today" || body.mode === undefined) {
      return json(publicPayload(context));
    }
    if (body.mode !== "advance") {
      return safeError(400, "INVALID_MODE", "Unsupported official daily runtime mode.");
    }
    const clientActionId = requestedClientActionId(body);
    if (clientActionId && dailyClientActionIds(context).includes(clientActionId)) {
      return json(publicPayload(context));
    }
    if (asRecord(context.official_attempt)) {
      return safeError(409, "OFFICIAL_ATTEMPT_COMPLETE", "The official first attempt is already complete.");
    }

    const requestedDailyId = typeof body.daily_challenge_id === "string" ? body.daily_challenge_id : materialized.dailyChallengeId;
    if (requestedDailyId !== materialized.dailyChallengeId) {
      return safeError(409, "DAILY_IDENTITY_CHANGED", "Today’s official challenge identity has changed.");
    }
    if (!Number.isInteger(body.revision) || Number(body.revision) !== Number(context.progress_revision)) {
      return safeError(409, "STALE_PROGRESS", "Official daily progress changed on another device. Refresh and continue from the latest state.");
    }

    const advanceUfcRuntime = context.gameType === "average_fan"
      ? (await loadAverageFanRuntime()).advanceAverageFanDailyRuntime
      : (await loadUfcRuntime()).advanceOfficialDailyRuntime;
    const advanced = isDailyCombo(context)
      ? advanceDailyCombo(context, body.action, advanceUfcRuntime)
      : advanceUfcRuntime(context, body.action);
    const saved = await admin.rpc("save_daily_challenge_runtime_progress", {
      p_daily_challenge_id: materialized.dailyChallengeId,
      p_profile_id: profileId,
      p_expected_revision: Number(context.progress_revision),
      p_submission_state: submissionStateWithClientActionId(
        advanced.submissionState,
        dailyClientActionIds(context),
        clientActionId,
      ),
      p_public_state: advanced.publicState,
    });
    if (saved.error) {
      if (saved.error.code === "40001") {
        return safeError(409, "STALE_PROGRESS", "Official daily progress changed on another device. Refresh and continue from the latest state.");
      }
      throw new Error("The official daily progress could not be saved.");
    }

    context = await getContext(admin, materialized.dailyChallengeId, profileId);
    context = await finalizePending(userClient, admin, context, profileId);
    return json(publicPayload(context));
  } catch (error) {
    const message = error instanceof Error ? error.message : "The official daily runtime failed safely.";
    const status = /must|already|not on|unavailable|full|complete|unsupported|invalid|integer|array|object/i.test(message) ? 400 : 503;
    return safeError(status, status === 400 ? "INVALID_DAILY_ACTION" : "DAILY_RUNTIME_FAILED", message);
  }
});

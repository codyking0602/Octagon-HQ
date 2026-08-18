import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.110.7";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
} from "./runtime.generated.mjs";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

type OfficialDailyGameType =
  | "find_leader"
  | "blind_resume"
  | "wavelength"
  | "blind_rank_5"
  | "keep_4_cut_4"
  | "hit_the_number";

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

const safeError = (status: number, code: string, message: string) => json({
  code,
  message,
  deployment_sha: DEPLOYED_SOURCE_SHA,
}, status);

type JsonRecord = Record<string, unknown>;

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

async function materializeToday(admin: SupabaseClient) {
  const requested = await admin.rpc("get_daily_challenge_materialization_request", {});
  if (requested.error) throw new Error("The official daily materialization request failed.");
  const request = requiredRecord(requested.data, "Daily materialization request");
  const day = requiredString(request.central_day, "Central day");
  const scheduleVersion = requiredString(request.schedule_version, "Schedule version");
  const expectedGame = requiredString(request.expected_game, "Expected daily game") as OfficialDailyGameType;

  if (request.required !== true) {
    return {
      dailyChallengeId: requiredString(request.daily_challenge_id, "Daily challenge id"),
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
  try {
    publication = buildOfficialDailySetup(gameType, day, scheduleVersion);
  } catch {
    if (gameType === "find_leader") throw new Error("The official Find the Leader fallback could not be materialized.");
    fallbackReason = `materialization_failed:${gameType}`;
    gameType = "find_leader";
    publication = buildOfficialDailySetup(gameType, day, scheduleVersion);
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

  return {
    dailyChallengeId: requiredString(result.id, "Published daily challenge id"),
    centralDay: day,
    scheduleVersion,
    gameType,
    fallbackReason,
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

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return safeError(405, "METHOD_NOT_ALLOWED", "Method not allowed.");

  let body: JsonRecord = {};
  try { body = asRecord(await request.json()) ?? {}; } catch { /* empty input */ }
  if (body.mode === "deployment-info") return json({ deployment_sha: DEPLOYED_SOURCE_SHA });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
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
      const materialized = await materializeToday(admin);
      return json({ status: materialized.created ? "materialized" : "already_materialized", ...materialized, deployment_sha: DEPLOYED_SOURCE_SHA });
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
    const materialized = await materializeToday(admin);
    let context = await getContext(admin, materialized.dailyChallengeId, profileId);
    context = await finalizePending(userClient, admin, context, profileId);

    if (body.mode === "get-today" || body.mode === undefined) {
      return json(publicPayload(context));
    }
    if (body.mode !== "advance") {
      return safeError(400, "INVALID_MODE", "Unsupported official daily runtime mode.");
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

    const advanced = advanceOfficialDailyRuntime(context, body.action);
    const saved = await admin.rpc("save_daily_challenge_runtime_progress", {
      p_daily_challenge_id: materialized.dailyChallengeId,
      p_profile_id: profileId,
      p_expected_revision: Number(context.progress_revision),
      p_submission_state: advanced.submissionState,
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
    const status = /must|already|not on|unavailable|full|complete|unsupported|integer|array|object/i.test(message) ? 400 : 503;
    return safeError(status, status === 400 ? "INVALID_DAILY_ACTION" : "DAILY_RUNTIME_FAILED", message);
  }
});
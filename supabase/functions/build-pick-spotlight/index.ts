import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { buildPickSpotlightContent, type SpotlightStatsFighter } from "../../../src/features/picks/spotlightContent.ts";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";
import { getUfcStatsSnapshotFighter } from "./ufcStatsSnapshot.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha",
};

class SpotlightBuildError extends Error {
  constructor(readonly code: string, message: string, readonly status = 422) {
    super(message);
  }
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA,
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function loadFighter(name: string, fighterSlug: string): SpotlightStatsFighter {
  const fighter = getUfcStatsSnapshotFighter(name);
  if (!fighter) {
    throw new SpotlightBuildError(
      "UFCSTATS_SNAPSHOT_FIGHTER_NOT_FOUND",
      `The UFCStats Spotlight snapshot does not contain ${name}.`,
    );
  }
  return { ...fighter, fighterSlug, name };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ code: "METHOD_NOT_ALLOWED", message: "Method not allowed.", deployment_sha: DEPLOYED_SOURCE_SHA }, 405);

  let input: Record<string, unknown> = {};
  try { input = asRecord(await request.json()) ?? {}; } catch { /* empty input */ }
  if (input.mode === "deployment-info") return json({ deployment_sha: DEPLOYED_SOURCE_SHA });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const secretKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!supabaseUrl || !anonKey || !secretKey) {
    return json({ code: "SPOTLIGHT_BUILD_NOT_CONFIGURED", message: "Spotlight building is not configured.", deployment_sha: DEPLOYED_SOURCE_SHA }, 503);
  }
  if (!token) return json({ code: "OWNER_AUTH_REQUIRED", message: "Owner sign-in required.", deployment_sha: DEPLOYED_SOURCE_SHA }, 401);

  const admin = createClient(supabaseUrl, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const user = await admin.auth.getUser(token);
  if (user.error || !user.data.user) return json({ code: "OWNER_AUTH_REQUIRED", message: "Owner sign-in required.", deployment_sha: DEPLOYED_SOURCE_SHA }, 401);

  const owner = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const setup = await owner.rpc("get_pick_event_setup");
  if (setup.error) {
    const denied = setup.error.message.toLowerCase().includes("pick control owner required");
    return json({
      code: denied ? "OWNER_ACCESS_REQUIRED" : "EVENT_SETUP_UNAVAILABLE",
      message: denied ? "Fight Night owner access required." : "Event Setup is unavailable.",
      deployment_sha: DEPLOYED_SOURCE_SHA,
    }, denied ? 403 : 503);
  }

  try {
    const draft = asRecord(setup.data);
    const draftId = typeof input.draft_id === "string" ? input.draft_id : "";
    const boutId = typeof input.bout_id === "string" ? input.bout_id : "";
    if (!draft || !draftId || draft.draft_id !== draftId) {
      throw new SpotlightBuildError("STAGED_DRAFT_CHANGED", "The staged card changed. Reload Event Setup before building this Spotlight.", 409);
    }
    const bouts = Array.isArray(draft.bouts) ? draft.bouts.map(asRecord).filter(Boolean) as Record<string, unknown>[] : [];
    const bout = bouts.find((candidate) => candidate.bout_id === boutId && candidate.included === true);
    if (!bout) throw new SpotlightBuildError("SPOTLIGHT_BOUT_NOT_FOUND", "That included fight is no longer on the staged card.", 409);
    const startsAt = typeof draft.starts_at === "string" ? draft.starts_at : "";
    if (!startsAt || !Number.isFinite(Date.parse(startsAt))) {
      throw new SpotlightBuildError("SPOTLIGHT_EVENT_DATE_MISSING", "Set the event start time before building fight Spotlights.");
    }

    const redName = typeof bout.red_fighter_name === "string" ? bout.red_fighter_name : "";
    const blueName = typeof bout.blue_fighter_name === "string" ? bout.blue_fighter_name : "";
    const redSlug = typeof bout.red_fighter_slug === "string" ? bout.red_fighter_slug : "";
    const blueSlug = typeof bout.blue_fighter_slug === "string" ? bout.blue_fighter_slug : "";
    if (!redName || !blueName || !redSlug || !blueSlug) {
      throw new SpotlightBuildError("SPOTLIGHT_FIGHTER_IDENTITY_MISSING", "Both staged fighter identities are required before building a Spotlight.");
    }

    const red = loadFighter(redName, redSlug);
    const blue = loadFighter(blueName, blueSlug);
    const spotlight = buildPickSpotlightContent({
      boutId,
      eventStartsAt: startsAt,
      red,
      blue,
    });

    return json({ spotlight, deployment_sha: DEPLOYED_SOURCE_SHA });
  } catch (error) {
    const known = error instanceof SpotlightBuildError;
    return json({
      code: known ? error.code : "SPOTLIGHT_BUILD_FAILED",
      message: known ? error.message : "The fight Spotlight could not be built safely.",
      deployment_sha: DEPLOYED_SOURCE_SHA,
    }, known ? error.status : 502);
  }
});

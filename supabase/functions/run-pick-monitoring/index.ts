import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import { adaptTheOddsApiResponse, buildTheOddsApiRequestUrl } from "../../../src/features/picks-monitoring/theOddsApi.ts";
import { buildManualMonitoringPayload, monitoringSummary, resolveMonitoringEvent, type CardScope, type MonitoringEvent, type SourcePreview } from "../../../src/features/picks-monitoring/manualMonitoringRunner.ts";
import { DEPLOYED_SOURCE_SHA } from "./deployment.ts";

const corsHeaders = { "Access-Control-Allow-Origin": Deno.env.get("OCTAGON_APP_ORIGIN") ?? "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Expose-Headers": "X-Octagon-Backend-Sha" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store", "X-Octagon-Backend-Sha": DEPLOYED_SOURCE_SHA } });
const safeError = (status: number, code: string, message: string) => json({ code, message, deployment_sha: DEPLOYED_SOURCE_SHA }, status);

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return safeError(405, "METHOD_NOT_ALLOWED", "Method not allowed.");
  let input: Record<string, unknown> = {};
  try { const candidate = await request.json(); if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) input = candidate as Record<string, unknown>; } catch { /* empty input */ }
  if (input.mode === "deployment-info") return json({ deployment_sha: DEPLOYED_SOURCE_SHA });

  const url = Deno.env.get("SUPABASE_URL"), anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SECRET_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const providerKey = Deno.env.get("THE_ODDS_API_KEY");
  const authorization = request.headers.get("authorization") ?? "";
  if (!url || !anonKey || !serviceKey || !providerKey) return safeError(503, "MONITORING_NOT_CONFIGURED", "Monitoring credentials are not configured.");
  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const auth = await admin.auth.getUser(authorization.replace(/^Bearer\s+/i, ""));
  if (auth.error || !auth.data.user) return safeError(401, "OWNER_AUTH_REQUIRED", "Owner sign-in required.");
  const owner = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false }, global: { headers: { Authorization: authorization } } });
  const [setup, current] = await Promise.all([owner.rpc("get_pick_event_setup"), owner.rpc("get_current_pick_event")]);
  if (setup.error) return safeError(403, "OWNER_ACCESS_REQUIRED", "Fight Night owner access required.");
  if (current.error) return safeError(503, "DATABASE_READ_FAILED", "Canonical Picks state is unavailable.");
  let resolved;
  try { resolved = resolveMonitoringEvent(setup.data as MonitoringEvent | null, current.data as MonitoringEvent | null); }
  catch { return safeError(409, "EVENT_RESOLUTION_FAILED", "Monitoring event identity is missing, conflicting, or ambiguous."); }

  const startedAt = new Date().toISOString();
  const previewResponse = await fetch(`${url}/functions/v1/sync-next-ufc-event`, { method: "POST", headers: { Authorization: authorization, "Content-Type": "application/json" }, body: JSON.stringify({ mode: "preview" }) });
  const previewBody = await previewResponse.json().catch(() => null) as { event_preview?: SourcePreview; effective_scope?: CardScope } | null;
  if (!previewResponse.ok || !previewBody?.event_preview || !previewBody.effective_scope) return safeError(502, "SOURCE_PREVIEW_FAILED", "The UFC source preview failed safely.");
  const fetchedAt = new Date().toISOString();
  let oddsResponse: Response;
  try { oddsResponse = await fetch(buildTheOddsApiRequestUrl(providerKey)); } catch { oddsResponse = new Response(null, { status: 502 }); }
  const odds = adaptTheOddsApiResponse({ status: oddsResponse.status, body: await oddsResponse.json().catch(() => null), headers: oddsResponse.headers }, fetchedAt);
  let payload;
  try { payload = buildManualMonitoringPayload({ resolved, source: previewBody.event_preview, scope: previewBody.effective_scope, odds, startedAt, completedAt: new Date().toISOString() }); }
  catch { return safeError(409, "EVENT_IDENTITY_MISMATCH", "Source and monitored event identities did not match."); }
  const recorded = await admin.rpc("record_pick_monitoring_run", { p_payload: payload });
  if (recorded.error || !recorded.data) return safeError(503, "MONITORING_RECORD_FAILED", "Monitoring evidence could not be recorded atomically.");
  return json(monitoringSummary(String(recorded.data), payload));
});

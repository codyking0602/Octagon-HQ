import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608050001_event_setup_card_review.sql",
  "utf8",
);
const syncFunction = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
const ufcParser = readFileSync("supabase/functions/sync-next-ufc-event/ufcEventParser.ts", "utf8");
const monitoringFunction = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const cardChanges = readFileSync("supabase/functions/sync-next-ufc-event/cardChanges.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const deploymentVerifier = readFileSync("scripts/verify-sync-function-deployment.mjs", "utf8");
const productionPreviewVerifier = readFileSync("scripts/verify-event-setup-preview-live.mjs", "utf8");
const productionPreviewContract = readFileSync("scripts/event-setup-preview-contract.mjs", "utf8");
const webkitVerifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

describe("Phase 2B event setup backend", () => {
  it("keeps imported cards private until atomic publish", () => {
    expect(sql).toContain("create table if not exists public.pick_event_drafts");
    expect(sql).toContain("create table if not exists public.pick_event_draft_bouts");
    expect(sql).toContain("revoke all on table public.pick_event_drafts, public.pick_event_draft_bouts from public, anon, authenticated");
    expect(sql).toContain("create or replace function public.publish_pick_event_draft");
    expect(sql).toContain("delete from public.pick_events where status = 'upcoming'");
    expect(sql).toContain("insert into public.pick_events");
    expect(sql).toContain("insert into public.pick_bouts");
  });

  it("refuses to overwrite locked cards or upcoming cards with picks", () => {
    expect(sql).toContain("a locked event already exists");
    expect(sql).toContain("the current upcoming card already has picks");
    expect(sql).toContain("join public.profile_event_picks pick on pick.event_id = event.event_id");
  });

  it("keeps staging service-owned and review actions owner-only", () => {
    expect(sql).toContain("service role required to stage event data");
    expect(sql).toContain("grant execute on function public.stage_pick_event_draft(jsonb) to service_role");
    expect(sql.match(/pick control owner required/g)?.length).toBeGreaterThanOrEqual(6);
    expect(sql).toContain("grant execute on function public.get_pick_event_setup() to authenticated");
  });

  it("uses UFC.com as the sole runtime event and sectioned-card source", () => {
    expect(syncFunction).toContain('const UFC_EVENT_INDEX_URL = "https://www.ufc.com/events?language_content_entity=en";');
    expect(syncFunction).toContain("parseUfcEventPage");
    expect(syncFunction).toContain("resolveCardScope");
    expect(syncFunction).toContain("resolveImportedCardScope(name, subtitle, requested)");
    expect(syncFunction).toContain('"UFC_DISCOVERY_FAILED"');
    expect(syncFunction).toContain('"UFC_DISCOVERY_REJECTED"');
    expect(syncFunction).toContain('source: "UFC.com event + card"');
    expect(syncFunction).not.toMatch(/https?:\/\/(?:www\.)?cbssports\.com/i);
    expect(syncFunction).not.toMatch(/https?:\/\/(?:www\.)?mmamania\.com/i);
    expect(syncFunction).not.toContain("parseCbsSportsEventPage");
    expect(syncFunction).not.toContain("parseMmaManiaCard");
    expect(syncFunction).not.toContain("bouts.slice(0, 6)");
    expect(ufcParser).toContain("parseOfficialUfcSegmentTimes");
    expect(ufcParser).toContain("parseUfcFightCard");
  });

  it("reuses exact UFC sources and self-heals legacy persisted sources by UFC discovery", () => {
    expect(syncFunction).toContain("const savedSourceUrl = persistedSourceUrl(ownerProbe.data);");
    expect(syncFunction).toContain("const suppliedUfcSourceUrl = absoluteUfcEventUrl(suppliedSourceUrl);");
    expect(syncFunction).toContain("const savedUfcSourceUrl = absoluteUfcEventUrl(savedSourceUrl);");
    expect(syncFunction).toContain("const suppliedMatchesSaved = Boolean");
    expect(syncFunction).toContain("fetchExactUfcEvent");
    expect(syncFunction).toContain('"UFC_SOURCE_REJECTED"');
    expect(syncFunction).toContain("The supplied source must be a specific UFC.com event URL.");
    expect(syncFunction).toContain("A saved CBS/MMAmania URL is legacy data, not a runtime provider.");
    expect(cardChanges).toContain('["Card source", current.source_url, event.source_url, "exact"]');
    expect(cardChanges).toContain('["Venue", current.venue, event.venue, "semantic"]');
  });

  it("preserves published event identity while monitoring through the source cutover", () => {
    expect(monitoringFunction).toContain("const sourceEventKey = typeof selectedEvent?.source_event_key === \"string\"");
    expect(monitoringFunction).toContain("...(sourceEventKey ? { source_event_key: sourceEventKey } : {})");
    expect(syncFunction).toContain('const internalSourceEventKey = internalMonitoring && typeof input.source_event_key === "string"');
    expect(syncFunction).toContain("const sourceEventKeyOverride =");
    expect(syncFunction).toContain("canonicalPersistedUfcEventKey(ownerProbe.data)");
  });

  it("previews source changes before replacing a staged draft", () => {
    expect(syncFunction).toContain('input.mode === "preview"');
    expect(syncFunction).toContain("sourceChanges(ownerProbe.data, event, effectiveScope)");
    expect(syncFunction).toContain("expected_hash");
    expect(syncFunction).toContain("The source card changed after review");
    expect(syncFunction).toContain("stage_pick_event_draft");
    expect(syncFunction).not.toContain("publish_pick_event_draft");
    expect(syncFunction).toContain("Fight Night owner access required");
  });

  it("independently verifies legitimate production source changes without fixed fight counts", () => {
    expect(productionPreviewVerifier).toContain("assertReportedSourceChanges(");
    expect(productionPreviewVerifier).toContain("preview.body.effective_scope");
    expect(productionPreviewContract).toContain('expectedSourceChanges(current, event, effectiveScope = "main")');
    expect(productionPreviewContract).toContain("if (!isRecord(current))");
    expect(productionPreviewContract).toContain(
      '`Stage a new ${effectiveScope === "full" ? "full" : "main"} card with ${sourceBouts.length} fights.`',
    );
    expect(productionPreviewContract).toContain("sameTimestamp");
    expect(productionPreviewVerifier).not.toContain("expectedFights");
    expect(webkitVerifier).toContain('const updateButton = page.getByRole("button", { name: "CHECK FOR CARD UPDATES" });');
    expect(webkitVerifier).toContain('const syncButton = page.getByRole("button", { name: "SYNC NEXT UFC EVENT" });');
    expect(webkitVerifier).toContain("if (await updateButton.count())");
    expect(webkitVerifier).toContain("await updateButton.click()");
    expect(webkitVerifier).toContain("} else if (await syncButton.count())");
    expect(webkitVerifier).toContain('page.getByText("NO STAGED CARD", { exact: true })');
    expect(webkitVerifier).toContain("syncRequestCount !== syncRequestsBeforeSetup");
    expect(webkitVerifier).toContain("/^(Main card|Full card) · \\d+ fights$/i");
    expect(webkitVerifier).not.toContain('name: "Main card · 4 fights"');
  });

  it("keeps live frontend and backend verification on their actual production revisions", () => {
    expect(webkitVerifier).toContain("EXPECTED_SYNC_SOURCE_SHA");
    expect(webkitVerifier).toContain("const liveDeploymentSha");
    expect(webkitVerifier).toContain("expectedDeploymentSha && liveDeploymentSha !== expectedDeploymentSha");
    expect(webkitVerifier).toContain("previewBody?.deployment_sha !== expectedSyncSourceSha");
    expect(webkitVerifier).toContain('name: "Automatic monitoring and card review"');
    expect(webkitVerifier).toContain('monitoringRegion.getByRole("heading", { name: "One finding, one clear decision" })');
    expect(webkitVerifier).not.toContain('name: "Monitoring Inbox", exact: true }).waitFor');
    expect(deployWorkflow).toContain("verify-monitoring-function-deployment.mjs");
    expect(deployWorkflow).toContain("EXPECTED_MONITORING_SCHEDULER_ENABLED");
  });

  it("deploys and verifies the sync function runtime revision through the canonical backend owner", () => {
    expect(config).toContain("[functions.sync-next-ufc-event]");
    expect(config).toContain("[functions.sync-next-ufc-event]\nverify_jwt = false");
    expect(deployWorkflow).toContain("supabase functions deploy sync-next-ufc-event");
    expect(deployWorkflow).toContain("--no-verify-jwt");
    expect(deployWorkflow).toContain("DEPLOYED_SOURCE_SHA");
    expect(deployWorkflow).toContain("verify-sync-function-deployment.mjs");
    expect(deployWorkflow).toContain('require_remote_migration "202608050001"');
    expect(syncFunction).toContain('input.mode === "deployment-info"');
    expect(syncFunction).toContain("admin.auth.getUser(token)");
    expect(syncFunction).toContain('input.mode === "monitoring-preview"');
    expect(syncFunction).toContain('request.headers.get("apikey") === secretKey');
    expect(deploymentVerifier).toContain('process.env.GITHUB_EVENT_NAME !== "pull_request"');
    expect(deploymentVerifier).toContain("verifyExactSource && deployedSha !== expectedSha");
    expect(deploymentVerifier).toContain('x-octagon-backend-sha") !== deployedSha');
    expect(deploymentVerifier).toContain("appendFileSync(process.env.GITHUB_ENV");
    expect(deploymentVerifier).toContain("EXPECTED_SYNC_SOURCE_SHA=${deployedSha}");
    expect(deploymentVerifier).toContain("|| deployedSha");
  });
});

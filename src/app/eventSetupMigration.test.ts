import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608050001_event_setup_card_review.sql",
  "utf8",
);
const syncFunction = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
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

  it("uses UFC metadata with MMA Mania sections instead of a first-six guess", () => {
    expect(syncFunction).toContain("https://www.ufc.com/events?language_content_entity=en");
    expect(syncFunction).toContain("https://www.mmamania.com/ufc-fight-cards");
    expect(syncFunction).toContain("parseMmaManiaCard");
    expect(syncFunction).toContain("resolveCardScope");
    expect(syncFunction).toContain('requested === "main" || requested === "full"');
    expect(syncFunction).toContain('"ARTICLE_DISCOVERY_FAILED"');
    expect(syncFunction).toContain('"ARTICLE_DISCOVERY_REJECTED"');
    expect(syncFunction).not.toContain("bouts.slice(0, 6)");
  });

  it("reuses a staged source URL and allows an exact owner-supplied article", () => {
    expect(syncFunction).toContain("persistedSourceUrl(ownerProbe.data)");
    expect(syncFunction).toContain("suppliedSourceUrl || persistedSourceUrl(ownerProbe.data)");
    expect(syncFunction).toContain("fetchExactMmaManiaCard");
    expect(syncFunction).toContain('"ARTICLE_SOURCE_REJECTED"');
    expect(syncFunction).toContain("The supplied source must be a specific MMA Mania fight-card article URL.");
    expect(cardChanges).toContain('["Card source", current.source_url, event.source_url]');
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
    expect(webkitVerifier).toContain('page.getByLabel("MMA MANIA CARD URL (OPTIONAL)")');
    expect(webkitVerifier).toContain('page.getByRole("button", { name: "CHECK FOR CARD UPDATES" }).click()');
    expect(webkitVerifier).not.toContain("Event Setup has no persisted MMA Mania source to review.");
    expect(webkitVerifier).toContain("/^(Main card|Full card) · \\d+ fights$/i");
    expect(webkitVerifier).not.toContain('name: "Main card · 4 fights"');
    expect(webkitVerifier).not.toContain("SOURCE MATCHES DRAFT");
  });

  it("keeps live frontend and backend verification on their actual production revisions", () => {
    expect(webkitVerifier).toContain("EXPECTED_SYNC_SOURCE_SHA");
    expect(webkitVerifier).toContain("const liveDeploymentSha");
    expect(webkitVerifier).toContain("expectedDeploymentSha && liveDeploymentSha !== expectedDeploymentSha");
    expect(webkitVerifier).toContain("previewBody?.deployment_sha !== expectedSyncSourceSha");
    expect(webkitVerifier).toContain('page.getByText("ACTIVE", { exact: true })');
    expect(webkitVerifier).not.toContain('? "PAUSED" : "ACTIVE"');
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

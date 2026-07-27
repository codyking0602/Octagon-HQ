import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608050001_event_setup_card_review.sql",
  "utf8",
);
const syncFunction = readFileSync("supabase/functions/sync-next-ufc-event/index.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");
const deployWorkflow = readFileSync(".github/workflows/deploy-supabase.yml", "utf8");
const deploymentVerifier = readFileSync("scripts/verify-sync-function-deployment.mjs", "utf8");
const productionPreviewVerifier = readFileSync("scripts/verify-event-setup-preview-live.mjs", "utf8");
const productionBrowserVerifier = readFileSync("scripts/verify-pin-auth-live.mjs", "utf8");

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
    expect(syncFunction).toContain("No UFC first-six fallback was used");
    expect(syncFunction).not.toContain("bouts.slice(0, 6)");
  });

  it("reuses a staged source URL and allows an exact owner-supplied article", () => {
    expect(syncFunction).toContain("persistedSourceUrl(ownerProbe.data)");
    expect(syncFunction).toContain("suppliedSourceUrl || persistedSourceUrl(ownerProbe.data)");
    expect(syncFunction).toContain("fetchExactMmaManiaCard");
    expect(syncFunction).toContain("Paste the exact MMA Mania fight-card article URL in Event Setup");
    expect(syncFunction).toContain('["Card source", "source_url"');
  });

  it("previews source changes before replacing a staged draft", () => {
    expect(syncFunction).toContain('mode === "preview"');
    expect(syncFunction).toContain("sourceChanges(ownerProbe.data, event, effectiveScope)");
    expect(syncFunction).toContain("expected_hash");
    expect(syncFunction).toContain("The source card changed after review");
    expect(syncFunction).toContain("stage_pick_event_draft");
    expect(syncFunction).not.toContain("publish_pick_event_draft");
    expect(syncFunction).toContain("Fight Night owner access required");
  });

  it("verifies that the already-applied production source has no remaining changes", () => {
    expect(productionPreviewVerifier).toContain("assertNoSourceChanges(preview.body.changes)");
    expect(productionPreviewVerifier).toContain("changes after the same source was already applied");
  });

  it("verifies the zero-change post-apply state in the production browser", () => {
    expect(productionBrowserVerifier).toContain('getByText("SOURCE MATCHES DRAFT"');
    expect(productionBrowserVerifier).toContain("No staged event details, fights, sections, or order changed.");
    expect(productionBrowserVerifier).toContain('getByRole("button", { name: "APPLY SOURCE CHANGES" }).count()');
    expect(productionBrowserVerifier).toContain("already-applied clean four-fight UFC Belgrade source as unchanged");
  });

  it("deploys and verifies the sync function runtime revision through the canonical backend owner", () => {
    expect(config).toContain("[functions.sync-next-ufc-event]");
    expect(config).toContain("verify_jwt = true");
    expect(deployWorkflow).toContain("supabase functions deploy sync-next-ufc-event");
    expect(deployWorkflow).toContain("DEPLOYED_SOURCE_SHA");
    expect(deployWorkflow).toContain("verify-sync-function-deployment.mjs");
    expect(deployWorkflow).toContain("require_remote_migration \"202608050001\"");
    expect(syncFunction).toContain('input.mode === "deployment-info"');
    expect(deploymentVerifier).toContain("body?.deployment_sha !== expectedRevision");
    expect(deploymentVerifier).toContain("x-octagon-backend-sha");
  });
});

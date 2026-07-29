import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202608200011_whats_new_rankings_sync.sql",
  "utf8",
);
const integrationSql = readFileSync(
  "supabase/tests/whats_new_rankings_sync.sql",
  "utf8",
);
const script = readFileSync("scripts/sync-ranking-whats-new.mjs", "utf8");
const workflow = readFileSync(
  ".github/workflows/sync-ranking-whats-new.yml",
  "utf8",
);
const contract = readFileSync("docs/whats-new-foundation.md", "utf8");

describe("What's New Rankings and fighter producer", () => {
  it("stores only a private comparison snapshot behind a service-only sync", () => {
    expect(migration).toContain("create table if not exists private.ranking_whats_new_snapshot");
    expect(migration).toContain("alter table private.ranking_whats_new_snapshot enable row level security");
    expect(migration).toContain("revoke all on private.ranking_whats_new_snapshot from public, anon, authenticated");
    expect(migration).toContain("create or replace function public.sync_ranking_whats_new");
    expect(migration).toContain("if auth.role() <> 'service_role'");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("grant select on private.ranking_whats_new_snapshot to authenticated");
  });

  it("uses the existing publisher for new fighters and three-position movement", () => {
    expect(migration).toContain("perform public.publish_whats_new_item");
    expect(migration).toContain("'new_fighter'");
    expect(migration).toContain("'ranking_movement'");
    expect(migration).toContain("abs(prior.ranking_position - incoming.ranking_position) >= 3");
    expect(migration).toContain("'/fighters/' || v_row.fighter_slug");
    expect(migration).not.toContain("insert into private.whats_new_items");
  });

  it("creates a quiet baseline and replaces it from the calculated model", () => {
    expect(migration).toContain("if v_has_baseline then");
    expect(migration).toContain("'baseline_created', not v_has_baseline");
    expect(migration).toContain("delete from private.ranking_whats_new_snapshot");
    expect(script).toContain('vite.ssrLoadModule("/src/features/rankings/rankingModel.ts")');
    expect(script).toContain("rankingModel.allTime.map");
    expect(script).toContain('client.rpc("sync_ranking_whats_new"');
    expect(script).not.toContain("localStorage");
    expect(script).not.toContain("window.");
  });

  it("runs only after an exact successful main deployment", () => {
    expect(workflow).toContain("workflow_run:");
    expect(workflow).toContain("Deploy Cloudflare Frontend");
    expect(workflow).toContain("github.event.workflow_run.conclusion == 'success'");
    expect(workflow).toContain("github.event.workflow_run.head_branch == 'main'");
    expect(workflow).toContain("SOURCE_SHA: ${{ github.event.workflow_run.head_sha }}");
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("::add-mask::$service_key");
    expect(workflow).not.toContain("pull_request:");
  });

  it("locks the product threshold and no-noise behavior", () => {
    expect(contract).toContain("first production synchronization quietly creates the baseline");
    expect(contract).toContain("moving at least three positions");
    expect(contract).toContain("One- and two-position moves are intentionally ignored");
    expect(contract).toContain("PR-head deployments never synchronize production ranking state");
    expect(contract).toContain("not a ranking source");
  });

  it("keeps rollback proof for baseline, additions, movement, idempotency, and privacy", () => {
    expect(integrationSql).toContain("initial Rankings sync did not create a quiet baseline");
    expect(integrationSql).toContain("new fighter update was not published correctly");
    expect(integrationSql).toContain("one- or two-position ranking movement created feed noise");
    expect(integrationSql).toContain("downward ranking movement copy is incorrect");
    expect(integrationSql).toContain("idempotent Rankings sync created duplicate items");
    expect(integrationSql).toContain("authenticated role can execute the Rankings What''s New sync");
    expect(integrationSql.trimEnd()).toMatch(/rollback;$/);
  });
});

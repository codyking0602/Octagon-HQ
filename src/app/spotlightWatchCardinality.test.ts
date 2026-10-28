import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const setup = readFileSync("src/features/picks-setup/PicksSpotlightSetup.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202612310010_multi_pick_event_spotlights.sql", "utf8");
const liveStatusWorkflow = readFileSync(".github/workflows/record-live-deployment-status.yml", "utf8");

describe("fight Spotlight Watch Moment cardinality", () => {
  it("allows either fighter URL independently so one Watch Moment is a valid Spotlight", () => {
    expect(setup).toContain("row.red.trim() ? { fighterSlug: bout.redFighterSlug, url: row.red.trim() } : null");
    expect(setup).toContain("row.blue.trim() ? { fighterSlug: bout.blueFighterSlug, url: row.blue.trim() } : null");
    expect(setup).toContain(".filter((watch): watch is { fighterSlug: string; url: string } => Boolean(watch))");
    expect(migration).toContain("jsonb_array_length(v_watch) > 2");
    expect(migration).not.toMatch(/jsonb_array_length\(v_watch\)\s*<\s*2/);
  });

  it("records exact main frontend and backend deployment results as commit statuses", () => {
    expect(liveStatusWorkflow).toContain("Deploy Cloudflare Frontend");
    expect(liveStatusWorkflow).toContain("Deploy Supabase Backend");
    expect(liveStatusWorkflow).toContain('"octagon/frontend-live"');
    expect(liveStatusWorkflow).toContain('"octagon/backend-live"');
    expect(liveStatusWorkflow).toContain("github.event.workflow_run.head_sha");
    expect(liveStatusWorkflow).toContain("github.event.workflow_run.event == 'push'");
    expect(liveStatusWorkflow).toContain("github.event.workflow_run.head_branch == 'main'");
  });
});

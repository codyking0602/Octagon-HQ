import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const setup = readFileSync("src/features/picks-setup/PicksSpotlightSetup.tsx", "utf8");
const repository = readFileSync("src/features/picks-setup/pickSetupRepository.ts", "utf8");
const playerPage = readFileSync("src/features/picks/PicksPage.tsx", "utf8");
const builder = readFileSync("supabase/functions/build-pick-spotlight/index.ts", "utf8");
const migration = readFileSync("supabase/migrations/202612310010_multi_pick_event_spotlights.sql", "utf8");

describe("multi-fight Picks Spotlight ownership", () => {
  it("offers every included fight without a hard-coded Spotlight count", () => {
    expect(setup).toContain("eligibleBouts.map((bout, index)");
    expect(setup).toContain("ADD SPOTLIGHT");
    expect(setup).not.toMatch(/slice\(0,\s*[123]\)|maxSpotlight|spotlightLimit/i);
  });

  it("keeps UFCStats snapshot enrichment read-only and owner gated", () => {
    expect(builder).toContain('owner.rpc("get_pick_event_setup")');
    expect(builder).toContain("getUfcStatsSnapshotFighter");
    expect(builder).toContain("UFCSTATS_SNAPSHOT_FIGHTER_NOT_FOUND");
    expect(builder).not.toMatch(/stage_pick_event_draft|publish_pick_event_draft|from\("pick_events"\)|insert\(|update\(/);
  });

  it("keeps one staged-event mutation and one publication owner", () => {
    expect(repository).toContain('client.rpc("set_pick_event_draft_spotlight"');
    expect(repository.match(/set_pick_event_draft_spotlight/g)).toHaveLength(1);
    expect(migration).toContain("private.publish_pick_event_draft_spotlight_core(p_draft_id)");
    expect(migration.match(/create or replace function public\.publish_pick_event_draft/g)).toHaveLength(1);
  });

  it("resolves generated Spotlights independently beneath each Picks fight", () => {
    expect(playerPage).toContain("new Map((activeEvent?.spotlights ?? [])");
    expect(playerPage).toContain("spotlightsByBout.get(bout.boutId) ?? null");
  });
});

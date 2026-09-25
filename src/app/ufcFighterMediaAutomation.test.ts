import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310176_ufc_fighter_media_registry.sql",
  "utf8",
);
const runner = readFileSync("supabase/functions/run-pick-monitoring/index.ts", "utf8");
const thumbnail = readFileSync("src/features/picks/FighterThumbnail.tsx", "utf8");

describe("automatic UFC fighter media", () => {
  it("keeps provenance limited to official UFC and ESPN sources", () => {
    expect(migration).toContain("source in ('espn', 'ufc')");
    expect(migration).toContain("^https://a[.]espncdn[.]com/");
    expect(migration).toContain("^https://www[.]ufc[.]com/athlete/");
    expect(migration).toContain("Existing approved photos are never replaced automatically");
    expect(runner).toContain("adaptEspnUfcFighterMedia");
    expect(runner).toContain("ufcAthletePageUrl");
  });

  it("reuses the existing scheduler/card-check owner instead of adding another scheduler", () => {
    expect(runner).toContain("shouldRunScheduledCardSourceCheck");
    expect(runner).toContain("syncScheduledFighterMedia");
    expect(runner).toContain("fighter_media_sync: fighterMediaSync");
    expect(migration).not.toMatch(/cron[.]schedule|net[.]http_post/);
  });

  it("loads verified runtime photos only when the existing thumbnail resolver has no source", () => {
    expect(thumbnail).toContain('client.rpc("get_ufc_fighter_media_map")');
    expect(thumbnail).toContain("staticSource && !failedSources.has(staticSource)");
    expect(thumbnail).toContain("runtimeSource && !failedSources.has(runtimeSource)");
    expect(thumbnail).toContain("if (source) return");
  });

  it("does not automate or mutate event header artwork", () => {
    expect(migration).not.toMatch(/header_storage_path|pick-event-headers|set_pick_event_header/i);
    expect(runner).not.toMatch(/header_storage_path|pick-event-headers|set_pick_event_header/i);
    expect(thumbnail).not.toMatch(/header_storage_path|pick-event-headers|set_pick_event_header/i);
  });
});

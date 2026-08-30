import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Football Picks setup ownership contract", () => {
  it("keeps one sync-next-football-event invocation owner for single-game, weekly preview, and weekly staging modes", () => {
    const source = readFileSync("src/features/picks-setup/pickSetupRepository.ts", "utf8");
    const ownerCalls = source.match(/invoke\("sync-next-football-event"/g) ?? [];

    expect(ownerCalls).toHaveLength(1);
    expect(source).toContain('mode: "week-preview"');
    expect(source).toContain('mode: "week-apply"');
    expect(source).not.toMatch(/invoke\("(?!sync-next-football-event)[^"]*football[^"]*"/);
  });

  it("allows the Supabase browser headers required by the canonical Football Edge Function invocation", () => {
    const source = readFileSync("supabase/functions/sync-next-football-event/index.ts", "utf8");

    expect(source).toContain('"Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"');
    expect(source).toContain('"Access-Control-Allow-Methods": "POST, OPTIONS"');
  });

  it("keeps college selection flexible and validates choices against the full FBS week instead of only recommendations", () => {
    const source = readFileSync("supabase/functions/sync-next-football-event/index.ts", "utf8");

    expect(source).toContain("weekPreview.college_games");
    expect(source).toContain("college selections must come from this week's FBS schedule");
    expect(source).not.toContain("choose exactly");
    expect(source).not.toContain("requestedIds.length !== weekPreview");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationSource = readFileSync(
  "supabase/migrations/202608240002_complete_picks_event_recaps.sql",
  "utf8",
);
const repositorySource = readFileSync(
  "src/features/picks-control/pickControlRepository.ts",
  "utf8",
);

describe("Picks recap watch-moment RPC contract", () => {
  it("uses the canonical RPC parameter name from the deployed function", () => {
    expect(migrationSource).toMatch(
      /public\.set_pick_event_watch_moments\(\s*p_event_id text,\s*p_moments jsonb\s*\)/,
    );
    expect(repositorySource).toContain('client.rpc("set_pick_event_watch_moments"');
    expect(repositorySource).toContain("p_moments: moments");
    expect(repositorySource).not.toContain("p_watch_moments: moments");
  });
});

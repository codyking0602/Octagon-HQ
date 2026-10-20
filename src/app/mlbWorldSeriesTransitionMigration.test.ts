import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310315_mlb_world_series_transition.sql",
  "utf8",
);

describe("2026 MLB World Series rollover", () => {
  it("settles both completed LCS matchups without changing a participant's picks", () => {
    expect(migration).toContain("'TB 4–2 CLE'");
    expect(migration).toContain("'MIL 4–0 LAD'");
    expect(migration).toContain("winner_team_id = result.winner_id");
    expect(migration).toContain("v_brackets");
    expect(migration).toContain("v_round_picks");
    expect(migration).not.toMatch(/(?:update|delete from)\s+public\.mlb_playoff_brackets\b/i);
    expect(migration).not.toMatch(/(?:update|delete from)\s+public\.mlb_playoff_round_picks\b/i);
  });

  it("opens one World Series with truthful dates and frozen DraftKings series odds", () => {
    expect(migration).toContain("'ws', 2026, 'world_series'");
    expect(migration).toContain("'tb', 'Tampa Bay Rays', 'mil', 'Milwaukee Brewers'");
    expect(migration).toContain("2026-10-24 00:00:00+00");
    expect(migration).toContain("11, 135, -155");
    expect(migration).toContain("DraftKings World Series winner");
    expect(migration).toContain("on conflict (series_id) do nothing");
    expect(migration).toContain("G7 · Sat Oct 31 · 7:00 PM CT");
  });

  it("moves the canonical hub to the World Series with Caminero as player to watch", () => {
    expect(migration).toContain("current_round = 'world_series'");
    expect(migration).toContain("'series_id', 'ws'");
    expect(migration).toContain("'player_to_watch', 'Junior Caminero'");
    expect(migration).toContain("notify pgrst, 'reload schema'");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const strategy = readFileSync(
  "supabase/migrations/202612310235_nfl_team_season_day7_strategy.sql",
  "utf8",
);
const gate = readFileSync(
  "src/features/back-room/FootballWeeklyNflTeamSeasonGate.tsx",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);

describe("NFL Team-Seasons Day 7 player-owned strategy", () => {
  it("persists and validates the player's selected cut", () => {
    expect(strategy).toContain("add column if not exists cut_item_reference text");
    expect(strategy).toContain("Choose the team you would cut before buying Wildcard entries");
    expect(strategy).toContain("Your cut must be one of the normal teams you won this week");
    expect(strategy).toContain("submission.cut_item_reference");
    expect(strategy).toContain("'my_cut_item_reference',v_my_cut");
  });

  it("never auto-selects a replacement from hidden grades", () => {
    const resolverStart = strategy.indexOf(
      "create or replace function private.resolve_football_weekly_nfl_team_season_wildcard",
    );
    const resolverEnd = strategy.indexOf(
      "revoke all on function private.resolve_football_weekly_nfl_team_season_wildcard",
      resolverStart,
    );
    const resolver = strategy.slice(resolverStart, resolverEnd);
    expect(resolver).toContain("Strategy belongs to the player");
    expect(resolver).toContain("submission.cut_item_reference");
    expect(resolver).not.toContain("v_candidate_grade");
    expect(resolver).not.toContain("v_replaced_grade");
    expect(resolver).not.toContain("scoring_order=4");
  });

  it("uses the v2 live and owner-lab submission RPCs", () => {
    expect(strategy).toContain("submit_my_football_weekly_nfl_team_season_wildcard_v2");
    expect(strategy).toContain("submit_my_football_weekly_nfl_team_season_lab_wildcard_v2");
    expect(repository).toContain('"submit_my_football_weekly_nfl_team_season_wildcard_v2"');
    expect(repository).toContain('"submit_my_football_weekly_nfl_team_season_lab_wildcard_v2"');
    expect(repository).toContain("p_cut_item_reference");
  });

  it("separates Sports Reference links from strategy controls", () => {
    expect(gate).toContain('className="football-weekly-nfl-team-season__wildcard-link"');
    expect(gate).toContain('target="_blank"');
    expect(gate).toContain('{rank >= 0 ? "P" + (rank + 1) : "ADD"}');
    expect(gate).toContain("Which team comes out if you win a Wildcard?");
    expect(gate).toContain('{selected === team.item_reference ? "CUT" : "CHOOSE"}');
  });

  it("runs exactly one Claim Order animation then one Risk Draw animation", () => {
    expect(gate).toContain('useState<"claim" | "risk" | "done">("claim")');
    expect(gate).toContain('setPhase("risk")');
    expect(gate).toContain('setPhase("done")');
    expect(gate).toContain('title="CLAIM ORDER"');
    expect(gate).toContain('title="RISK DRAW"');
    expect(gate).toContain("spinTime * 2");
  });

  it("uses equal ticket slices and shows the selected replacement after resolution", () => {
    expect(gate).toContain("function wheelTickets");
    expect(gate).toContain("360 / tickets.length");
    expect(gate).toContain("replaced_team_name");
    expect(gate).toContain("WILDCARD SWAPS");
  });
});

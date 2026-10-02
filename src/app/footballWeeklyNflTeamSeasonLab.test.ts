import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310230_nfl_team_season_playthrough_lab.sql",
  "utf8",
);
const day7Shortcut = readFileSync(
  "supabase/migrations/202612310233_nfl_team_season_lab_day7_shortcut.sql",
  "utf8",
);
const page = readFileSync(
  "src/features/back-room/FootballWeeklyNflTeamSeasonLabPage.tsx",
  "utf8",
);
const center = readFileSync(
  "src/features/back-room/FootballWeeklyAuctionCenterPage.tsx",
  "utf8",
);
const router = readFileSync("src/app/router.tsx", "utf8");
const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);

describe("NFL Team-Seasons owner playthrough lab", () => {
  it("uses isolated historical shadow weeks and five non-test seats", () => {
    expect(migration).toContain("date '1975-01-07'");
    expect(migration).toContain("seat_index between 1 and 5");
    expect(migration).toContain("profile.normalized_name not like 'TEST%'");
    expect(migration).toContain("owner_lab");
    expect(migration).toContain("if v_seat<>5");
  });

  it("runs the exact normal-day and Day 7 engines rather than a lab copy", () => {
    expect(migration).toContain("private.submit_football_weekly_nfl_team_season_bids_for_profile");
    expect(migration).toContain("private.resolve_football_weekly_nfl_team_season_day");
    expect(migration).toContain("private.submit_football_weekly_nfl_team_season_wildcard");
    expect(migration).toContain("private.resolve_football_weekly_nfl_team_season_wildcard");
    expect(migration).toContain("private.materialize_football_weekly_nfl_team_season_wildcard");
    expect(migration).toContain("private.finalize_football_weekly_nfl_team_season_week");
  });

  it("cannot contaminate live history or next-week Reaping adjustments", () => {
    expect(migration).toContain("delete from private.football_weekly_auction_results");
    expect(migration).toContain("delete from private.football_weekly_auction_bankroll_adjustments");
    expect(migration).toContain("source_week_start=v_run.lab_week_start");
    expect(migration).toContain("final_payloads=v_payloads");
  });

  it("requires all five seats before each resolve", () => {
    expect(migration).toContain("if v_submitted<>5");
    expect(page).toContain("lab.submitted_count !== 5");
    expect(page).toContain("ALL FIVE SEATS MUST SUBMIT");
  });

  it("can seed a fresh isolated run directly to a meaningful Day 7", () => {
    expect(day7Shortcut).toContain("jump_my_football_weekly_nfl_team_season_lab_to_day7");
    expect(day7Shortcut).toContain("private.reset_football_weekly_nfl_team_season_lab");
    expect(day7Shortcut).toContain("private.submit_football_weekly_nfl_team_season_bids_for_profile");
    expect(day7Shortcut).toContain("private.resolve_football_weekly_nfl_team_season_day");
    expect(day7Shortcut).toContain("if v_owned<>4");
    expect(day7Shortcut).toContain("set current_day=7");
    expect(day7Shortcut).toContain("private.materialize_football_weekly_nfl_team_season_wildcard");
    expect(repository).toContain('"jump_my_football_weekly_nfl_team_season_lab_to_day7"');
    expect(page).toContain("JUMP TO DAY 7");
    expect(page).toContain("Fresh seeded QA run");
  });

  it("enforces owner-only access in both UI routing and RPCs", () => {
    expect(migration).toContain("private.football_weekly_superteam_lab_owner()");
    expect(migration).toContain("auth.uid() is distinct from v_owner");
    expect(migration.match(/auth\.uid\(\) is distinct from v_owner/g)?.length).toBe(5);
    expect(migration).toContain("owner-only");
    expect(center).toContain("BEST NFL TEAM-SEASONS PLAYTHROUGH");
    expect(center).toContain('navigate("/football/weekly-nfl-team-season-lab")');
    expect(router).toContain('path: "football/weekly-nfl-team-season-lab"');
  });

  it("wires the five-seat page through repository RPCs and the production presentation", () => {
    expect(repository).toContain('"get_my_football_weekly_nfl_team_season_lab"');
    expect(repository).toContain('"submit_my_football_weekly_nfl_team_season_lab_bids"');
    expect(repository).toContain('"submit_my_football_weekly_nfl_team_season_lab_wildcard"');
    expect(repository).toContain('"advance_my_football_weekly_nfl_team_season_lab"');
    expect(repository).toContain('"get_my_football_weekly_nfl_team_season_lab_ranked_bids"');
    expect(page).toContain("<FootballWeeklyNflTeamSeasonGate");
    expect(page).toContain("<FootballWeeklyNflTeamSeasonFinalResult");
    expect(page).toContain('tableMode="lab"');
    expect(page).toContain("tableSeatIndex={seatIndex}");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/202612310197_weekly_auction_playthrough_lab.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);
const page = readFileSync(
  "src/features/back-room/FootballWeeklySuperteamLabPage.tsx",
  "utf8",
);
const center = readFileSync(
  "src/features/back-room/FootballWeeklyAuctionCenterPage.tsx",
  "utf8",
);
const gate = readFileSync(
  "src/features/back-room/FootballWeeklySuperteamGate.tsx",
  "utf8",
);
const router = readFileSync("src/app/router.tsx", "utf8");

describe("Weekly Auction owner playthrough lab", () => {
  it("runs live and lab submissions through the same bid legality core", () => {
    expect(migration).toContain("private.submit_football_weekly_superteam_bids_for_profile");
    expect(migration).toContain(
      "perform private.submit_football_weekly_superteam_bids_for_profile(\n    v_week_start,v_day_index,v_profile,p_bids,p_at",
    );
    expect(migration).toContain("public.submit_my_football_weekly_superteam_lab_bids");
    expect(migration).toContain("v_run.lab_week_start,\n    v_run.current_day,\n    v_profile,");
  });

  it("uses a disposable historical shadow week and real Standard materializer", () => {
    expect(migration).toContain("date '1980-01-01'");
    expect(migration).toContain("perform private.materialize_football_weekly_superteam_week(v_week_start)");
    expect(migration).toContain("profile.normalized_name not like 'TEST%'");
    expect(migration).toContain("v_lab_signature=v_live_signature");
    expect(migration).toContain("source\n  )\n  select\n    v_week_start");
    expect(migration).toContain("'owner_lab'");
  });

  it("uses the real resolver and finalizer but removes lab results from live history", () => {
    expect(migration).toContain("perform private.resolve_football_weekly_superteam_day(");
    expect(migration).toContain("perform private.finalize_football_weekly_superteam_week(");
    expect(migration).toContain("Submit all six simulated seats before resolving this day");
    expect(migration).toContain("delete from private.football_weekly_auction_results");
    expect(migration).toContain("final_payloads=v_payloads");
  });

  it("keeps the six-player test shape aligned with the launch experience", () => {
    expect(migration).toContain("if p_day_index=1 then return 10");
    expect(migration).toContain("private.football_weekly_superteam_cards_for_field(v_players)");
    expect(migration).toContain("private.football_weekly_superteam_cards_for_field(6)<>9");
  });

  it("exposes only owner-authenticated lab RPCs", () => {
    expect(migration).toContain("private.football_weekly_superteam_lab_owner()");
    expect(migration).toContain("normalized_name='CODY'");
    expect(migration).toContain("Weekly Auction Playthrough Lab is owner-only");
    expect(migration).toContain("revoke all on function public.get_my_football_weekly_superteam_lab(integer)");
    expect(migration).toContain("grant execute on function public.advance_my_football_weekly_superteam_lab(integer)");
  });

  it("wires a reusable six-seat owner UI onto the normal Superteam board", () => {
    expect(page).toContain("WEEKLY AUCTION PLAYTHROUGH");
    expect(page).toContain("lab.seats.map");
    expect(page).toContain("repository.submitSuperteamLab");
    expect(page).toContain("repository.advanceSuperteamLab");
    expect(page).toContain("repository.resetSuperteamLab");
    expect(page).toContain("<FootballWeeklySuperteamGate");
    expect(page).toContain("<FootballWeeklySuperteamFinalResult");
    expect(page).toContain("showContinueAction={false}");
    expect(gate).toContain("showContinueAction = true");
  });

  it("adds an owner-only Auction Center entry and dedicated route", () => {
    expect(center).toContain("isFootballWeeklyBuildQbPreviewOwner");
    expect(center).toContain("WEEKLY AUCTION PLAYTHROUGH LAB");
    expect(center).toContain('navigate("/football/weekly-auction-lab")');
    expect(router).toContain('path: "football/weekly-auction-lab"');
    expect(repository).toContain('"get_my_football_weekly_superteam_lab"');
    expect(repository).toContain('"reset_my_football_weekly_superteam_lab"');
    expect(repository).toContain('"advance_my_football_weekly_superteam_lab"');
  });
});

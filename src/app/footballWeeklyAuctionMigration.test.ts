import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_WEEKLY_AUCTION_WILDCARD_PRESENTATION_COUNT,
  footballWeeklyAuctionTeamIdentity,
} from "../features/back-room/footballWeeklyAuctionPresentation";

const migration = readFileSync("supabase/migrations/202612310129_football_weekly_auction.sql", "utf8");
const bankrollFloorRepair = readFileSync("supabase/migrations/202612310130_football_weekly_auction_bankroll_floor.sql", "utf8");
const dynamicBankroll = readFileSync("supabase/migrations/202612310137_football_weekly_auction_dynamic_bankroll.sql", "utf8");
const fullPoolRepair = readFileSync("supabase/migrations/202612310138_football_weekly_auction_full_233_pool.sql", "utf8");
const transitionMigration = readFileSync("supabase/migrations/202612310132_football_troy_transition_carry.sql", "utf8");
const runtime = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const page = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const gate = readFileSync("src/features/back-room/FootballWeeklyAuctionGate.tsx", "utf8");
const styles = readFileSync("src/styles/football-weekly-auction.css", "utf8");

describe("Football Weekly Auction live contract", () => {
  it("owns the Tuesday through Monday seven-day server lifecycle", () => {
    expect(migration).toContain("extract(isodow from week_start) = 2");
    expect(migration).toContain("day_index integer not null check (day_index between 1 and 7)");
    expect(migration).toContain("p_week_start + v_day");
    expect(migration).toContain("at time zone 'America/Chicago'");
    expect(migration).toContain("date '2026-09-15'");
  });

  it("uses the locked three-team forty-dollar sealed bidding rules", () => {
    expect(migration).toContain("slot integer not null check (slot between 1 and 3)");
    expect(migration).toContain("amount integer not null check (amount between 0 and 40)");
    expect(migration).toContain("v_bid1 + v_bid2 + v_bid3");
    expect(bankrollFloorRepair).toContain("when p_owned <= 0 then 2 when p_owned = 1 then 1 else 0");
    expect(dynamicBankroll).toContain("football_weekly_auction_bids_preserve_completion");
    expect(dynamicBankroll).toContain("'max_commit', v_bankroll");
    expect(dynamicBankroll).toContain("v_max := v_bankroll");
    expect(dynamicBankroll).toContain("greatest(p_bid1, p_bid2, p_bid3) <= p_bankroll - 1");
    expect(dynamicBankroll).toContain("p_bid1 + p_bid2 + p_bid3 - least(p_bid1, p_bid2, p_bid3)");
    expect(dynamicBankroll).toContain("v_total > v_max");
    expect(gate).toContain("$0 = pass");
  });


  it("keeps won teams viewable during the active week without revealing grades", () => {
    expect(gate).toContain("MY TEAMS");
    expect(gate).toContain('aria-haspopup="dialog"');
    expect(gate).toContain("state.collection.map");
    expect(gate).toContain("<small>PAID</small>");
    const myTeamsDialog = gate.slice(
      gate.indexOf("function MyTeamsDialog"),
      gate.indexOf("function TeamCard"),
    );
    expect(myTeamsDialog).not.toContain("entry.grade");
    expect(styles).toContain(".football-weekly-auction__collection-backdrop");
    expect(styles).toContain(".football-weekly-auction__collection-sheet");
  });

  it("uses the calibrated board-shape generator rather than fixed strength shortcuts", () => {
    expect(migration).toContain("for v_attempt in 1..500 loop");
    expect(migration).toContain("for v_shape_attempt in 1..30 loop");
    expect(migration).toContain("94 + floor(random() * 9) * 0.5");
    expect(migration).toContain("88.5 + floor(random() * 14) * 0.5");
    expect(migration).toContain("other.hidden_grade >= blue.hidden_grade + 1.5");
    expect(migration).toContain("other.hidden_grade <= blue.hidden_grade + 4.5");
    expect(migration).toContain("abs(pool.hidden_grade - v_target) + random() * 0.3");
    expect(fullPoolRepair).toContain("v_pool_count <> 233");
    expect(fullPoolRepair).not.toContain("pool.season_reference like 'cfb-best-%'");
    expect(fullPoolRepair).not.toContain("blue.season_reference like 'cfb-best-%'");
    expect(fullPoolRepair).toContain("private.football_weekly_auction_daily_entries");
    expect(fullPoolRepair).toContain("board.lock_at > now()");
  });

  it("resolves bid ties by prior collection size, prior spend, then random", () => {
    expect(migration).toContain("bid.amount desc");
    expect(migration).toContain("award.day_index < p_day_index");
    expect(migration).toContain("count(*)");
    expect(migration).toContain("sum(award.winning_bid)");
    expect(migration).toContain("random()");
  });

  it("scores the best three and gives the weekly champion a Football Daily bonus win", () => {
    expect(migration).toContain("owned.scoring_order <= 3");
    expect(migration).toContain("avg(owned.hidden_grade)");
    expect(migration).toContain("scoring_cost asc nulls last");
    expect(migration).toContain("football_weekly_auction_results auction_result");
    expect(migration).toContain("auction_result.is_winner");
    expect(migration).toContain("p_sport = 'football'");
  });

  it("keeps live grades private and reveals all 21 only after finalization", () => {
    const currentPayloadStart = migration.indexOf("create or replace function public.get_my_football_weekly_auction");
    const submitStart = migration.indexOf("create or replace function public.submit_my_football_weekly_auction_bids");
    const currentPayload = migration.slice(currentPayloadStart, submitStart);
    expect(currentPayload).not.toContain("'grade', pool.hidden_grade");
    expect(migration).toContain("private.football_weekly_auction_final_payload");
    expect(migration).toContain("'grade', pool.hidden_grade");
    expect(migration).toContain("'all_teams'");
  });

  it("exposes prior resolved bids but never current sealed bids for other players", () => {
    expect(migration).toContain("'prior_results'");
    expect(migration).toContain("'bids', coalesce((");
    expect(migration).toContain("entry.day_index = v_day_index - 1");
    expect(gate).toContain("View all bids");
  });

  it("gates every official Football Daily runtime request behind today's submission", () => {
    expect(runtime).toContain("football_weekly_auction_daily_gate");
    expect(runtime).toContain("WEEKLY_AUCTION_REQUIRED");
    expect(page).toContain("createFootballWeeklyAuctionRepository");
    expect(page).toContain("FootballWeeklyAuctionGate");
    expect(page).toContain("WEEKLY AUCTION · EDIT BIDS");
  });

  it("preserves the transition title and carries the Sep 14 win into the first native Tuesday week", () => {
    expect(transitionMigration).toContain("football-2026-tuesday-cadence-troy");
    expect(transitionMigration).toContain("date '2026-09-15'");
    expect(transitionMigration).toContain("weekly_wins_bonus");
    expect(transitionMigration).toContain("weekly_titles_bonus");
    expect(transitionMigration).toContain("v_football_championship_start date := date ''2026-09-15''");
    expect(transitionMigration).toContain("private.football_daily_transition_adjustments");
  });

  it("ships the approved card research and final team-color treatment", () => {
    expect(FOOTBALL_WEEKLY_AUCTION_WILDCARD_PRESENTATION_COUNT).toBe(13);
    expect(gate).toContain("View season ↗");
    expect(gate).toContain("TODAY’S BOARD");
    expect(gate).toContain("RESULTS REVEAL AT MIDNIGHT CT");
    expect(gate).toContain("setLogoFailed(true)");
    expect(gate).not.toContain('identity.finalApRank == null ? "NR"');
    expect(footballWeeklyAuctionTeamIdentity("cfb-best-alabama-2009", "Alabama", 2009).finalApRank).toBe(1);
    expect(footballWeeklyAuctionTeamIdentity("cfb-best-lsu-2011", "LSU", 2011).finalApRank).toBe(2);
    expect(footballWeeklyAuctionTeamIdentity("cfb-best-auburn-2013", "Auburn", 2013).finalApRank).toBe(2);
    expect(footballWeeklyAuctionTeamIdentity("weekly-cfb-fresno-state-2013", "Fresno State", 2013).finalApRank).toBeNull();
    const expansion = footballWeeklyAuctionTeamIdentity("weekly-cfb-florida-2001", "Florida", 2001);
    expect(expansion.logoSrc).toContain("ncaa");
    expect(expansion.finalApRank).toBeNull();
    expect(styles).toContain("rgba(var(--weekly-team-rgb), .17)");
    expect(styles).toContain(".football-weekly-auction__result-team::before");
    expect(styles).toContain("align-self: start");
    expect(styles).toContain("display: block");
    expect(gate).toContain("bonus Daily Challenge win");
  });
});

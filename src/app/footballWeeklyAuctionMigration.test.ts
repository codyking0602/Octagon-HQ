import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FOOTBALL_WEEKLY_AUCTION_WILDCARD_PRESENTATION_COUNT } from "../features/back-room/footballWeeklyAuctionPresentation";

const migration = readFileSync("supabase/migrations/202612310129_football_weekly_auction.sql", "utf8");
const bankrollFloorRepair = readFileSync("supabase/migrations/202612310130_football_weekly_auction_bankroll_floor.sql", "utf8");
const transitionMigration = readFileSync("supabase/migrations/202612310131_football_troy_transition_carry.sql", "utf8");
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
    expect(bankrollFloorRepair).toContain("v_max := greatest(v_bankroll - v_floor, 0)");
    expect(migration).toContain("v_total > v_max");
    expect(gate).toContain("$0 = pass");
  });

  it("uses the calibrated board-shape generator rather than fixed strength shortcuts", () => {
    expect(migration).toContain("for v_attempt in 1..500 loop");
    expect(migration).toContain("for v_shape_attempt in 1..30 loop");
    expect(migration).toContain("94 + floor(random() * 9) * 0.5");
    expect(migration).toContain("88.5 + floor(random() * 14) * 0.5");
    expect(migration).toContain("other.hidden_grade >= blue.hidden_grade + 1.5");
    expect(migration).toContain("other.hidden_grade <= blue.hidden_grade + 4.5");
    expect(migration).toContain("abs(pool.hidden_grade - v_target) + random() * 0.3");
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
    expect(styles).toContain("rgba(var(--weekly-team-rgb), .17)");
    expect(styles).toContain(".football-weekly-auction__result-team::before");
  });
});

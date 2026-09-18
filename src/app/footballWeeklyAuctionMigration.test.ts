import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_WEEKLY_AUCTION_EXPANSION_PRESENTATION_COUNT,
  FOOTBALL_WEEKLY_AUCTION_WILDCARD_PRESENTATION_COUNT,
  footballWeeklyAuctionTeamIdentity,
} from "../features/back-room/footballWeeklyAuctionPresentation";

const migration = readFileSync("supabase/migrations/202612310129_football_weekly_auction.sql", "utf8");
const bankrollFloorRepair = readFileSync("supabase/migrations/202612310130_football_weekly_auction_bankroll_floor.sql", "utf8");
const dynamicBankroll = readFileSync("supabase/migrations/202612310137_football_weekly_auction_dynamic_bankroll.sql", "utf8");
const fullPoolRepair = readFileSync("supabase/migrations/202612310138_football_weekly_auction_full_233_pool.sql", "utf8");
const auctionTableMigration = readFileSync("supabase/migrations/202612310142_football_weekly_auction_table.sql", "utf8");
const fieldLockMigration = readFileSync("supabase/migrations/202612310145_football_weekly_auction_field_lock.sql", "utf8");
const transitionMigration = readFileSync("supabase/migrations/202612310132_football_troy_transition_carry.sql", "utf8");
const runtime = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const page = readFileSync("src/features/back-room/FootballTodayChallengePage.tsx", "utf8");
const gate = readFileSync("src/features/back-room/FootballWeeklyAuctionGate.tsx", "utf8");
const auctionTableDialog = readFileSync("src/features/back-room/FootballWeeklyAuctionTableDialog.tsx", "utf8");
const careerMediaContext = readFileSync("src/features/back-room/footballCareerMediaContext.ts", "utf8");
const styles = readFileSync("src/styles/football-weekly-auction.css", "utf8");
const auctionTableStyles = readFileSync("src/styles/football-weekly-auction-table.css", "utf8");
const expansionAudit = JSON.parse(
  readFileSync("data/generated/football/cfb/weekly-auction-team-grade-expansion-v1.json", "utf8"),
) as {
  additions: Array<{
    season_reference: string;
    season_year: number;
    school: string;
    conference_bucket: string;
  }>;
};
const expansionSeasons = expansionAudit.additions.filter((entry) => entry.conference_bucket !== "Wildcard");

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

  it("replaces My Teams with a public resolved Auction Table while keeping current bids sealed", () => {
    expect(gate).toContain("AUCTION TABLE");
    expect(gate).toContain("FootballWeeklyAuctionTableDialog");
    expect(gate).not.toContain("MY TEAMS");
    expect(auctionTableDialog).toContain("Resolved teams + bankrolls. Today’s bids stay sealed.");
    expect(auctionTableDialog).toContain("player.bankroll");
    expect(auctionTableDialog).toContain("player.owned_count");
    expect(auctionTableDialog).toContain("player.teams.map");
    expect(auctionTableDialog).not.toContain("winning_bid");

    const publicTableFunction = auctionTableMigration.slice(
      auctionTableMigration.indexOf("create or replace function public.get_football_weekly_auction_table"),
      auctionTableMigration.indexOf("revoke all on function public.get_football_weekly_auction_table"),
    );
    expect(publicTableFunction).toContain("private.football_weekly_auction_awards");
    expect(publicTableFunction).toContain("private.football_weekly_auction_daily_entries");
    expect(publicTableFunction).not.toContain("private.football_weekly_auction_bids");
    expect(publicTableFunction).not.toContain("hidden_grade");
  });

  it("keeps the Auction Table fully scrollable above fixed mobile navigation", () => {
    expect(auctionTableStyles).toContain("z-index: 5000");
    expect(auctionTableStyles).toContain("100dvh");
    expect(auctionTableStyles).toContain("overflow-y: auto");
    expect(auctionTableStyles).toContain("env(safe-area-inset-bottom)");
    expect(auctionTableStyles).toContain("-webkit-overflow-scrolling: touch");
  });

  it("pins Sam Darnold to USC at the shared CFB career relationship owner", () => {
    expect(careerMediaContext).toContain('["samdarnold", "USC"]');
    expect(careerMediaContext).toContain("reviewedCfbCareerProgramByName");
    expect(careerMediaContext).toContain("return reviewedProgram");
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

  it("locks the competitor field at Tuesday midnight and defers midweek joins", () => {
    expect(fieldLockMigration).toContain("private.football_weekly_auction_participants");
    expect(fieldLockMigration).toContain("field_locked_at");
    expect(fieldLockMigration).toContain("profile.created_at >= v_previous_lock_at");
    expect(fieldLockMigration).toContain("profile.created_at < v_lock_at");
    expect(fieldLockMigration).toContain("Weekly Auction field is locked for this week");
    expect(fieldLockMigration).toContain("'eligible_week_start', v_week_start + 7");
    expect(fieldLockMigration).toContain("from private.football_weekly_auction_participants");
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
    expect(FOOTBALL_WEEKLY_AUCTION_EXPANSION_PRESENTATION_COUNT).toBe(88);
    expect(expansionSeasons).toHaveLength(88);
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
    expect(expansion.finalApRank).toBe(3);
    expect(expansion.resume).toBe("10–2 · Orange Bowl Champion");
    expect(expansion.primary).toBe("#0021A5");

    for (const entry of expansionSeasons) {
      const identity = footballWeeklyAuctionTeamIdentity(
        entry.season_reference,
        entry.school,
        entry.season_year,
      );
      expect(identity.resume, entry.season_reference).not.toBe(`${entry.school} · ${entry.season_year}`);
      expect(identity.finalApRank, entry.season_reference).not.toBeNull();
      expect(identity.logoSrc, entry.season_reference).toContain("ncaa");
      expect(identity.primary, entry.season_reference).not.toBe("#27445A");
      expect(identity.sportsReferenceUrl, entry.season_reference).toContain(String(entry.season_year));
    }
    expect(footballWeeklyAuctionTeamIdentity("weekly-cfb-oklahoma-2011", "Oklahoma", 2011).finalApRank).toBe(16);
    expect(footballWeeklyAuctionTeamIdentity("weekly-cfb-notre-dame-2025", "Notre Dame", 2025).finalApRank).toBe(10);
    expect(styles).toContain("rgba(var(--weekly-team-rgb), .17)");
    expect(styles).toContain(".football-weekly-auction__result-team::before");
    expect(styles).toContain("align-self: start");
    expect(styles).toContain("display: block");
    expect(gate).toContain("bonus Daily Challenge win");
  });
});

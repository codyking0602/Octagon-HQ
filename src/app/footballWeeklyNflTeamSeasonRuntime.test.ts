import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync(
  "supabase/migrations/202612310229_nfl_team_season_weekly_runtime.sql",
  "utf8",
);
const wildcard = readFileSync(
  "supabase/migrations/202612310228_nfl_team_season_wildcard_engine.sql",
  "utf8",
);
const rankedBids = readFileSync(
  "supabase/migrations/202612310231_nfl_team_season_ranked_bids_and_presentation.sql",
  "utf8",
);
const repository = readFileSync(
  "src/features/play/footballWeeklyAuctionRepository.ts",
  "utf8",
);
const gate = readFileSync(
  "src/features/back-room/FootballWeeklyNflTeamSeasonGate.tsx",
  "utf8",
);
const styles = readFileSync(
  "src/styles/football-weekly-nfl-team-season.css",
  "utf8",
);
const tableStyles = readFileSync(
  "src/styles/football-weekly-auction-table.css",
  "utf8",
);

describe("Best NFL Team-Seasons Weekly Auction runtime", () => {
  it("registers the audited 200-season subject for the Oct. 6 rotation", () => {
    expect(runtime).toContain("'nfl-best-team-seasons-since-2000'");
    expect(runtime).toContain("rotation_order,eligible_from,is_active");
    expect(runtime).toContain("date '2026-10-06'");
    expect(runtime).toContain("must contain exactly 200 seasons");
    expect(runtime).toContain("must mirror all 200 authority rows");
    expect(runtime).toContain("hidden_grade between 70.0 and 100.0");
  });

  it("uses six normal days, a $50 bankroll, max two daily wins and max five normal wins", () => {
    expect(runtime).toContain("if p_day_index=7 then return 0");
    expect(runtime).toContain("if p_day_index=1 then\n      return least(v_available,4)");
    expect(runtime).toContain("candidate.weekly_wins<5");
    expect(runtime).toContain("candidate.daily_wins<2");
    expect(runtime).toContain("greatest(5-v_owned,0)");
    expect(runtime).toContain("p_week_start,p_profile_id,50");
    expect(runtime).toContain("scoring_order<=4");
  });

  it("keeps exposed Day 1 immutable and adapts only later hidden reserve supply", () => {
    expect(runtime).toContain("Day 1 is exposed before the join window freezes");
    expect(runtime).toContain("only later\n    -- unrevealed days may expand or contract");
    expect(runtime).toContain("return least(v_available,greatest(v_base,v_completion_floor))");
    expect(runtime).toContain("refusing to reroll exposed cards");
    expect(runtime).toContain("slot not between 1 and 7");
  });

  it("ports the approved weighted #1601 theme generator without forced grade shapes", () => {
    for (const family of [
      "'division'","'season'","'era'","'rivalry'","'franchise_history'",
      "'fell_short'","'conference_clash'","'open_field'",
    ]) {
      expect(runtime).toContain(family);
    }
    expect(runtime).toContain("('division'::text,1.35::double precision,2)");
    expect(runtime).toContain("('season',1.10,1)");
    expect(runtime).toContain("('rivalry',1.15,1)");
    expect(runtime).toContain("('franchise_history',0.90,1)");
    expect(runtime).toContain("('open_field',1.50,2)");
    expect(runtime).toContain("(2000+floor(random()*26)::integer)::text");
    expect(runtime).toContain("having count(*)>=4");
    expect(runtime).toContain("'franchise_history','rivalry','division','season'");
    expect(runtime).toContain("'fell_short','era','conference_clash','open_field'");
    expect(runtime).toContain("and not (candidate.franchise_id=any(v_day_franchises))");
    expect(runtime).toContain("'Natural'");
    expect(runtime).toContain("Great Teams That Fell Short");
    expect(runtime).toContain("AFC vs NFC");
    expect(runtime).toContain("Open Field");
  });

  it("sweeps unresolved NFL finales across the Tuesday week boundary", () => {
    expect(runtime).toContain("Sweep every unresolved NFL Team-Seasons finale");
    expect(runtime).toContain("week.subject_key='nfl-best-team-seasons-since-2000'");
    expect(runtime).toContain("week.week_start+6");
    expect(runtime).toContain("resolve_football_weekly_nfl_team_season_wildcard");
    expect(runtime).toContain("finalize_football_weekly_nfl_team_season_week");
  });

  it("routes Day 7 through the persisted Wildcard/Reaping engine", () => {
    expect(runtime).toContain("materialize_football_weekly_nfl_team_season_wildcard");
    expect(runtime).toContain("resolve_football_weekly_nfl_team_season_wildcard");
    expect(runtime).toContain("football_weekly_nfl_team_season_wildcard_state");
    expect(wildcard).toContain("Other players' ticket counts remain sealed until resolution.");
    expect(wildcard).toContain("'priority_draws',case when v_resolved");
    expect(wildcard).toContain("'reaping',case when v_resolved");
  });

  it("never lets hidden reserve cards leak into completion autofill", () => {
    expect(wildcard).toContain("Only normal Days 1-6 are eligible");
    expect(wildcard).toContain(
      "board.slot<=private.football_weekly_auction_cards_for_day(\n            p_week_start,board.day_index",
    );
    expect(wildcard).toContain("order by item.hidden_grade asc,board.season_reference");
  });

  it("applies Reaping only to the next Weekly Auction bankroll", () => {
    expect(runtime).toContain("football_weekly_auction_starting_bankroll(v_week_start,v_profile,50)");
    expect(runtime).toContain("Existing subject engines keep their original bankroll logic");
    expect(runtime).toContain("if v_starting_bankroll<v_default_bankroll then");
    expect(runtime).toContain("v_adjusted_start:=private.football_weekly_auction_starting_bankroll");
    expect(runtime).not.toContain("pg_get_functiondef");
    expect(runtime).not.toContain("daily_challenge");
    expect(runtime).not.toContain("bonus Daily Challenge");
  });

  it("returns the full Weekly Auction state after a Day 7 save", () => {
    expect(runtime).toContain("public.submit_my_football_weekly_nfl_team_season_wildcard");
    expect(runtime).toContain("return private.get_my_football_weekly_nfl_team_season(p_at)");
    expect(runtime).toContain("Wildcard is only available on its Day 7");
  });

  it("keeps active-play payloads grade-free and reveals grades only in final payloads", () => {
    const getterStart = runtime.indexOf("create or replace function private.get_my_football_weekly_nfl_team_season(");
    const getterEnd = runtime.indexOf("create or replace function private.submit_my_football_weekly_nfl_team_season_bids(", getterStart);
    const getter = runtime.slice(getterStart, getterEnd);
    expect(getter).not.toContain("'grade',");
    expect(getter).not.toContain("'hidden_grade',");
    expect(runtime).toContain("'grade',item.hidden_grade");
    expect(gate).toContain("Future themes stay hidden.");
  });


  it("inherits the ranked conditional overcommit model from CFB Superteam", () => {
    expect(rankedBids).toContain("football_weekly_superteam_bid_preferences");
    expect(rankedBids).toContain("claim_rank");
    expect(rankedBids).toContain("submitted bids may exceed bankroll in total");
    expect(rankedBids).toContain("candidate.amount<=candidate.starting_bankroll-candidate.spent");
    expect(rankedBids).not.toContain("Your two highest possible wins exceed your remaining bankroll");
    expect(gate).toContain("YOU CAN BID MORE THAN YOUR BANKROLL IN TOTAL");
    expect(gate).toContain("CLAIM PRIORITY");
    expect(gate).toContain("Hold + drag a team card to reorder claims.");
    expect(gate).toContain("MAX SPEND TODAY");
    expect(gate).not.toContain("MAX SPEND RISK");
  });

  it("uses exact postseason outcomes and clickable team-season identities", () => {
    for (const outcome of [
      "Lost Wild Card",
      "Lost Divisional",
      "Lost Conference Championship",
      "Lost Super Bowl",
      "Won Super Bowl",
      "Missed Playoffs",
    ]) {
      expect(rankedBids).toContain(outcome);
    }
    expect(rankedBids).toContain("nfl-best-ind-2005");
    expect(rankedBids).toContain("14-2 · Lost Divisional");
    expect(gate).toContain("pro-football-reference.com/teams/");
    expect(gate).toContain("TeamSeasonLink");
  });

  it("pins the compact status and Auction Table to the top on mobile", () => {
    expect(styles).toContain("position: sticky;");
    expect(styles).toContain("top: calc(58px + var(--safe-top));");
    expect(tableStyles).toContain("align-items: flex-start;");
    expect(tableStyles).toContain("calc(58px + var(--safe-top))");
  });

  it("makes literal-ticket risk and zero-entry safety explicit in the UI", () => {
    expect(gate).toContain("Each entry = 1 Priority ticket + 1 Reaping ticket.");
    expect(gate).toContain("0 entries:");
    expect(gate).toContain("Five entries never automatically beats one");
    expect(gate).toContain("PRIORITY WHEEL");
    expect(gate).toContain("REAPING WHEEL");
    expect(gate).toContain("wheelStopRotation");
    expect(gate).toContain("selectedProfileId");
    expect(styles).toContain("@keyframes football-nfl-weekly-wheel-resolve");
    expect(styles).toContain("var(--wheel-stop, 0deg)");
  });

  it("keeps the exact season year outside truncating name text on mobile", () => {
    expect(gate).toContain("football-weekly-nfl-team-season__year");
    expect(styles).toContain(".football-weekly-nfl-team-season__year {");
    expect(styles).toContain("flex: 0 0 auto;");
    expect(styles).toContain("white-space: nowrap;");
    expect(repository).toContain('z.literal("nfl-best-team-seasons-since-2000")');
  });
});

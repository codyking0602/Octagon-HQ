import { describe, expect, it } from "vitest";
import integerScoringMigration from "../../../supabase/migrations/202612310038_auction_integer_scoring.sql?raw";
import auctionPageSource from "./AuctionPage.tsx?raw";

describe("Auction authoritative integer scoring v7", () => {
  it("rotates new preparations to v7 / grader v3 without changing the v6 catalog", () => {
    expect(integerScoringMigration).toContain("'ufc-auction-2026-08-v7'");
    expect(integerScoringMigration).toContain("'ufc-private-grader-2026-08-v3'");
    expect(integerScoringMigration).toContain("where content_version = 'ufc-auction-2026-08-v6'");
    expect(integerScoringMigration).toContain("Historical v6 Auction grading contract was mutated");
    expect(integerScoringMigration).toContain("Auction integer scoring changed catalog content or private grading inputs");
  });

  it("rounds grader v3 once at the final average while preserving v2 decimals", () => {
    expect(integerScoringMigration).toContain(
      "when v_game.grading_version = 'ufc-private-grader-2026-08-v3' then round(avg(score_value))",
    );
    expect(integerScoringMigration).toContain("else round(avg(score_value), 2)");
    expect(integerScoringMigration).toContain("round(72.49::numeric) <> 72");
    expect(integerScoringMigration).toContain("round(72.50::numeric) <> 73");
  });

  it("uses the rounded canonical values for ties, winners, persistence, and challenge results", () => {
    expect(integerScoringMigration).toContain("round(80.33::numeric) <> round(79.67::numeric)");
    expect(integerScoringMigration).toContain("round(80.67::numeric) > round(80.33::numeric)");
    expect(integerScoringMigration).toContain("when v_challenger_score > v_recipient_score then v_game.challenger_id");
    expect(integerScoringMigration).toContain("when v_recipient_score > v_challenger_score then v_game.recipient_id");
    expect(integerScoringMigration).toContain("challenger_final_score = v_challenger_score");
    expect(integerScoringMigration).toContain("recipient_final_score = v_recipient_score");
    expect(integerScoringMigration).toContain("jsonb_build_object('overall_score', v_challenger_score)");
    expect(integerScoringMigration).toContain("jsonb_build_object('overall_score', v_recipient_score)");
  });

  it("keeps Ultimate Fighter category-placement scoring and only rounds its final result", () => {
    expect(integerScoringMigration).toContain("when v_game.mode_id = 'ultimate-fighter'");
    expect(integerScoringMigration).toContain("then (catalog.grading_inputs ->> award.visible_category)::numeric");
    expect(integerScoringMigration).toContain("when v_game.mode_id = 'ultimate-fighter' then 5");
    expect(integerScoringMigration).toContain("when mode_id = 'ultimate-fighter' then 10");
    expect(integerScoringMigration).toContain("when mode_id = 'ultimate-fighter' then 50");
  });

  it("does not introduce bankroll, efficiency, or value bonuses", () => {
    expect(integerScoringMigration).not.toMatch(/leftover bankroll/i);
    expect(integerScoringMigration).not.toMatch(/budget efficiency/i);
    expect(integerScoringMigration).not.toMatch(/value bonus/i);
  });

  it("leaves rendering on the canonical server score with no competing frontend rounding", () => {
    expect(auctionPageSource).toContain("<strong>{state.challenger_final_score}</strong>");
    expect(auctionPageSource).toContain("<strong>{state.recipient_final_score}</strong>");
    expect(auctionPageSource).not.toContain("Math.round(state.challenger_final_score");
    expect(auctionPageSource).not.toContain("Math.round(state.recipient_final_score");
    expect(auctionPageSource).not.toContain("state.challenger_final_score.toFixed");
    expect(auctionPageSource).not.toContain("state.recipient_final_score.toFixed");
  });
});

import { describe, expect, it } from "vitest";
import analysisMigration from "../../../supabase/migrations/202612310060_auction_private_ultimate_fighter_analysis.sql?raw";

describe("Auction private Ultimate Fighter matchup analysis", () => {
  it("keeps the analysis primitive private and unavailable to client-facing roles", () => {
    expect(analysisMigration).toContain(
      "create or replace function private.auction_ultimate_fighter_analysis(p_auction_id uuid)",
    );
    expect(analysisMigration).toContain("security definer");
    expect(analysisMigration).toContain("set search_path = ''");
    expect(analysisMigration).toContain(
      "revoke all on function private.auction_ultimate_fighter_analysis(uuid) from public, anon, authenticated, service_role;",
    );
    expect(analysisMigration).not.toContain(
      "create or replace function public.auction_ultimate_fighter_analysis",
    );
    expect(analysisMigration).not.toMatch(
      /grant\s+execute\s+on\s+function\s+private\.auction_ultimate_fighter_analysis/i,
    );
  });

  it("accepts only completed Build the Ultimate Fighter games and preserves the stored grader winner", () => {
    expect(analysisMigration).toContain("v_game.mode_id <> 'ultimate-fighter'");
    expect(analysisMigration).toContain("v_game.lifecycle_state <> 'completed'");
    expect(analysisMigration).toContain("v_game.winner_profile_id = v_game.challenger_id");
    expect(analysisMigration).toContain("v_game.winner_profile_id = v_game.recipient_id");
    expect(analysisMigration).not.toContain("challenger_final_score");
    expect(analysisMigration).not.toContain("recipient_final_score");
  });

  it("reads the canonical private award, deck, and pinned catalog owners", () => {
    expect(analysisMigration).toContain("from private.auction_awards award");
    expect(analysisMigration).toContain("join private.auction_deck_entries deck");
    expect(analysisMigration).toContain("join private.auction_catalog catalog");
    expect(analysisMigration).toContain(
      "(catalog.grading_inputs ->> award.visible_category)::numeric as private_rating",
    );
    expect(analysisMigration).toContain("v_total <> 10");
    expect(analysisMigration).toContain("v_distinct_categories <> 5");
    expect(analysisMigration).toContain("v_distinct_pairs <> 10");
  });

  it("uses exact private deltas only for continuous relational ordering and preserves exact ties", () => {
    expect(analysisMigration).toContain("challenger_rating - recipient_rating as private_delta");
    expect(analysisMigration).toContain(
      "dense_rank() over (order by abs(private_delta) desc) as swing_rank",
    );
    expect(analysisMigration).toContain("where abs(private_delta) = max_private_gap");
    expect(analysisMigration).toContain("where abs(private_delta) = min_private_gap");
    expect(analysisMigration).not.toMatch(/private_delta\s+between\s+/i);
    expect(analysisMigration).not.toMatch(/abs\(private_delta\)\s*(?:>|>=|<|<=)\s*\d/i);
  });

  it("returns only sanitized relational facts and visible fighter identities", () => {
    expect(analysisMigration).toContain("'schema_version', 'ultimate-fighter-relational-v1'");
    expect(analysisMigration).toContain("'category_wins'");
    expect(analysisMigration).toContain("'strongest_swings'");
    expect(analysisMigration).toContain("'closest_swings'");
    expect(analysisMigration).toContain("'category_edges'");
    expect(analysisMigration).toContain("'challenger_fighter'");
    expect(analysisMigration).toContain("'recipient_fighter'");
    expect(analysisMigration).toContain("'swing_rank'");

    expect(analysisMigration).not.toContain("'private_rating'");
    expect(analysisMigration).not.toContain("'private_delta'");
    expect(analysisMigration).not.toContain("'challenger_rating'");
    expect(analysisMigration).not.toContain("'recipient_rating'");
    expect(analysisMigration).not.toContain("'max_private_gap'");
    expect(analysisMigration).not.toContain("'min_private_gap'");
    expect(analysisMigration).not.toContain("private.auction_rating_code(");
  });
});

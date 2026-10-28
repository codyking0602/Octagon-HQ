import { describe, expect, it } from "vitest";
import breakdownPacketMigration from "../../../supabase/migrations/202612310061_auction_coded_breakdown_packet.sql?raw";

describe("Auction coded fight breakdown packet", () => {
  it("is participant-only and completion-gated", () => {
    expect(breakdownPacketMigration).toContain("v_user_id uuid := auth.uid()");
    expect(breakdownPacketMigration).toContain(
      "v_user_id not in (v_game.challenger_id, v_game.recipient_id)",
    );
    expect(breakdownPacketMigration).toContain("v_game.mode_id <> 'ultimate-fighter'");
    expect(breakdownPacketMigration).toContain("v_game.lifecycle_state <> 'completed'");
  });

  it("uses the same version-pinned private catalog path as the canonical grader", () => {
    expect(breakdownPacketMigration).toContain("from private.auction_awards award");
    expect(breakdownPacketMigration).toContain("join private.auction_deck_entries deck");
    expect(breakdownPacketMigration).toContain("join private.auction_catalog catalog");
    expect(breakdownPacketMigration).toContain(
      "catalog.content_version = v_game.content_version",
    );
    expect(breakdownPacketMigration).toContain("catalog.mode_id = v_game.mode_id");
    expect(breakdownPacketMigration).toContain(
      "catalog.item_reference = deck.private_item_reference",
    );
    expect(breakdownPacketMigration).toContain(
      "(catalog.grading_inputs ->> award.visible_category)::numeric",
    );
  });

  it("passes the exact hidden category value only into the private encoder", () => {
    expect(breakdownPacketMigration.match(/private\.auction_rating_code\(/g)).toHaveLength(2);
    expect(breakdownPacketMigration).toContain("'code', private.auction_rating_code(");
    expect(breakdownPacketMigration).not.toContain("'rating',");
    expect(breakdownPacketMigration).not.toContain("'rating_value',");
    expect(breakdownPacketMigration).not.toContain("'delta',");
    expect(breakdownPacketMigration).not.toContain("'advantage',");
  });

  it("requires exactly five unique awarded categories for each build", () => {
    expect(breakdownPacketMigration).toContain("count(distinct award.visible_category)");
    expect(breakdownPacketMigration).toContain("v_challenger_count <> 5");
    expect(breakdownPacketMigration).toContain("v_recipient_count <> 5");
    expect(breakdownPacketMigration).toContain("v_challenger_category_count <> 5");
    expect(breakdownPacketMigration).toContain("v_recipient_category_count <> 5");
  });

  it("returns only public result context plus fighter/category/code selections", () => {
    expect(breakdownPacketMigration).toContain(
      "'packet_version', 'auction-fight-breakdown-v1'",
    );
    expect(breakdownPacketMigration).toContain("'fighter', catalog.display_label");
    expect(breakdownPacketMigration).toContain("'score', v_game.challenger_final_score");
    expect(breakdownPacketMigration).toContain("'score', v_game.recipient_final_score");
    expect(breakdownPacketMigration).not.toContain("private_item_reference',");
    expect(breakdownPacketMigration).not.toContain("grading_inputs',");
  });

  it("is callable only by authenticated users, not anonymous clients", () => {
    expect(breakdownPacketMigration).toContain(
      "revoke all on function public.get_auction_fight_breakdown_packet(uuid) from public, anon;",
    );
    expect(breakdownPacketMigration).toContain(
      "grant execute on function public.get_auction_fight_breakdown_packet(uuid) to authenticated;",
    );
  });
});

import { describe, expect, it } from "vitest";
import handoffMigration from "../../../supabase/migrations/202612310065_auction_octagon_verdict_copy.sql?raw";

describe("Build the Ultimate Fighter Octagon Verdict handoff", () => {
  it("restores the existing participant packet as a codes-only v3 handoff", () => {
    expect(handoffMigration).toContain(
      "create or replace function public.get_auction_fight_breakdown_packet(p_auction_id uuid)",
    );
    expect(handoffMigration).toContain("'packet_version', 'auction-fight-breakdown-v3'");
    expect(handoffMigration).toContain("v_user_id uuid := auth.uid()");
    expect(handoffMigration).toContain(
      "v_user_id not in (v_game.challenger_id, v_game.recipient_id)",
    );
    expect(handoffMigration).toContain("v_game.lifecycle_state <> 'completed'");
    expect(handoffMigration).toContain("private.auction_rating_code(");
    expect(handoffMigration).toContain(
      "grant execute on function public.get_auction_fight_breakdown_packet(uuid) to authenticated;",
    );
  });

  it("returns no app-generated analysis, narration, or hidden numeric values", () => {
    expect(handoffMigration).not.toContain("'recap',");
    expect(handoffMigration).not.toContain("'rating',");
    expect(handoffMigration).not.toContain("'delta',");
    expect(handoffMigration).not.toContain("'advantage',");
    expect(handoffMigration).not.toContain("'category_edges',");
    expect(handoffMigration).not.toContain("'strongest_swings',");
    expect(handoffMigration).not.toContain("'closest_swings',");
  });

  it("removes the mistaken narration owner before its private comparison dependency", () => {
    const recapDrop = handoffMigration.indexOf(
      "drop function private.auction_ultimate_fighter_recap(uuid);",
    );
    const analysisDrop = handoffMigration.indexOf(
      "drop function private.auction_ultimate_fighter_analysis(uuid);",
    );
    expect(recapDrop).toBeGreaterThan(-1);
    expect(analysisDrop).toBeGreaterThan(recapDrop);
    expect(handoffMigration).toContain(
      "to_regprocedure('private.auction_ultimate_fighter_recap(uuid)')",
    );
    expect(handoffMigration).toContain(
      "to_regprocedure('private.auction_ultimate_fighter_analysis(uuid)')",
    );
  });
});

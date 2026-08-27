import { describe, expect, it } from "vitest";
import recapMigration from "../../../supabase/migrations/202612310062_auction_fight_recap.sql?raw";

describe("Build the Ultimate Fighter fight recap", () => {
  it("uses the existing private relational analysis as its matchup authority", () => {
    expect(recapMigration).toContain(
      "v_analysis := private.auction_ultimate_fighter_analysis(p_auction_id);",
    );
    expect(recapMigration).not.toContain("challenger_rating - recipient_rating");
    expect(recapMigration).not.toContain("private_delta");
  });

  it("keeps the recap helper private and model-free", () => {
    expect(recapMigration).toContain(
      "revoke all on function private.auction_ultimate_fighter_recap(uuid) from public, anon, authenticated, service_role;",
    );
    expect(recapMigration).not.toMatch(/openai|anthropic|gemini|fetch\(|https?:\/\//i);
  });

  it("maps all five canonical categories to MMA-plausible fight language", () => {
    for (const category of ["Striking", "Grappling", "Frame", "Power", "Heart"]) {
      expect(recapMigration).toContain(`when '${category}' then`);
    }
    expect(recapMigration).toContain("cleaner exchanges on the feet");
    expect(recapMigration).toContain("clinch and mat phases");
    expect(recapMigration).toContain("range and shape the exchanges");
    expect(recapMigration).toContain("fight-changing moments");
    expect(recapMigration).toContain("fight turns into a grind");
  });

  it("extends the existing participant-only packet instead of exposing a second client analysis path", () => {
    expect(recapMigration).toContain(
      "create or replace function public.get_auction_fight_breakdown_packet(p_auction_id uuid)",
    );
    expect(recapMigration).toContain("v_user_id uuid := auth.uid()");
    expect(recapMigration).toContain(
      "v_user_id not in (v_game.challenger_id, v_game.recipient_id)",
    );
    expect(recapMigration).toContain("v_game.lifecycle_state <> 'completed'");
    expect(recapMigration).toContain("'packet_version', 'auction-fight-breakdown-v2'");
    expect(recapMigration).toContain("'recap', v_recap");
    expect(recapMigration).toContain(
      "grant execute on function public.get_auction_fight_breakdown_packet(uuid) to authenticated;",
    );
  });

  it("does not return the private relational object or numeric matchup gaps", () => {
    expect(recapMigration).not.toContain("'category_edges',");
    expect(recapMigration).not.toContain("'strongest_swings',");
    expect(recapMigration).not.toContain("'closest_swings',");
    expect(recapMigration).not.toContain("'private_rating',");
    expect(recapMigration).not.toContain("'numeric_gap',");
  });
});

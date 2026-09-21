import { describe, expect, it } from "vitest";
import scheduledPairMigration from "../../supabase/migrations/202612310154_home_football_spotlight_scheduled_pair_media.sql?raw";

describe("Football Home Spotlight scheduled pair media migration", () => {
  it("allows versioned weekly pair media while keeping writes owner-only", () => {
    expect(scheduledPairMigration).toContain("football-player-spotlight-[a-z0-9]");
    expect(scheduledPairMigration).toContain("(cfb|nfl)");
    expect(scheduledPairMigration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(scheduledPairMigration).toContain("unsupported Home feature media key");
    expect(scheduledPairMigration).toContain(
      "grant execute on function public.set_home_feature_media(text, text) to authenticated",
    );
    expect(scheduledPairMigration).toContain(
      "revoke all on function public.set_home_feature_media(text, text) from public, anon",
    );
  });
});

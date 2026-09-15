import { describe, expect, it } from "vitest";
import dualMediaMigration from "../../supabase/migrations/202612310136_home_football_spotlight_dual_media.sql?raw";

describe("Football Home Spotlight dual media migration", () => {
  it("allows independent CFB and NFL media keys while preserving owner-only writes", () => {
    expect(dualMediaMigration).toContain("'football-player-spotlight-cfb'");
    expect(dualMediaMigration).toContain("'football-player-spotlight-nfl'");
    expect(dualMediaMigration).toContain("public.is_pick_control_owner(auth.uid())");
    expect(dualMediaMigration).toContain("unsupported Home feature media key");
    expect(dualMediaMigration).toContain("grant execute on function public.set_home_feature_media(text, text) to authenticated");
  });
});

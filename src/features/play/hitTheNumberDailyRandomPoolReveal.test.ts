import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Daily Hit the Number Random Pool reveal contract", () => {
  it("releases the full pool only from the completed canonical server context", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310045_hit_the_number_random_pool_reveal.sql",
      "utf8",
    );
    const dailyView = readFileSync(
      "src/features/play/OfficialHitTheNumberDailyView.tsx",
      "utf8",
    );

    expect(migration).toContain("public.get_daily_challenge_runtime_context(uuid,uuid)");
    expect(migration).toContain("v_attempt.public_result");
    expect(migration).toContain("v_daily.game_type = 'hit_the_number'");
    expect(migration).toContain("v_setup.public_setup ->> 'boardType' = 'random-pool'");
    expect(migration).toContain("v_setup.private_grading_evidence -> 'values'");
    expect(migration).toContain("'poolValues'");
    expect(dailyView).toContain("revealedPoolValues={revealedValues}");
    expect(dailyView).not.toContain("hitTheNumberStatRows");
  });
});

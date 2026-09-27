import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync("src/features/play/dailyTwoGameRuntime.ts", "utf8");
const edgeRuntime = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/202612310202_auto_advance_two_game_daily.sql",
  "utf8",
);

describe("permanent two-game Daily handoff", () => {
  it("enters Game 2 in the same runtime action that completes Game 1", () => {
    const firstGameCompletion = runtime.slice(
      runtime.indexOf("if (index === 0)"),
      runtime.indexOf("if (nextScores.length !== 2"),
    );
    expect(firstGameCompletion).toContain("round_index: 1");
    expect(firstGameCompletion).toContain("awaiting_next: false");
    expect(firstGameCompletion).toContain("active_round: secondInitial");
    expect(firstGameCompletion).not.toContain("awaiting_next: true");
  });

  it("self-heals any persisted intermission for both Football and UFC", () => {
    expect(edgeRuntime).toContain("async function continueTwoGameWithoutIntermission");
    expect(edgeRuntime).toContain("context.publicState.awaiting_next !== true");
    expect(edgeRuntime).toContain("active_round: secondInitial");
    expect(edgeRuntime).toContain("context = await continueTwoGameWithoutIntermission(admin, context, profileId)");
    expect(
      edgeRuntime.match(/context = await continueTwoGameWithoutIntermission\(admin, context, profileId\)/g),
    ).toHaveLength(2);
  });

  it("repairs every stranded approved two-game Daily without resetting Game 1", () => {
    expect(migration).toContain("daily.game_type in ('find_leader', 'wavelength', 'hit_the_number')");
    expect(migration).toContain("daily.scoring_version = 'daily-two-game-average-score-v1'");
    expect(migration).toContain("progress.public_state ->> 'awaiting_next' = 'true'");
    expect(migration).toContain("revision = progress.revision + 1");
    expect(migration).toContain("setup.public_setup -> 'rounds' -> 1 -> 'initial_state'");
    expect(migration).not.toContain("submission_state =");
    expect(migration).not.toMatch(/TYLER|LIB|SHANE/i);
  });
});

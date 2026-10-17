import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const runtime = readFileSync("src/features/play/dailyTwoGameRuntime.ts", "utf8");
const dailyStyles = readFileSync("src/styles/today-challenge.css", "utf8");
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
    expect(firstGameCompletion).toContain('handoff_pending: context.gameType === "wavelength"');
    expect(firstGameCompletion).toContain("active_round: secondInitial");
    expect(firstGameCompletion).not.toContain("awaiting_next: true");
  });

  it("self-heals legacy persisted intermissions while preserving the Wavelength handoff", () => {
    expect(edgeRuntime).toContain("async function continueTwoGameWithoutIntermission");
    expect(edgeRuntime).toContain("context.publicState.awaiting_next !== true");
    expect(edgeRuntime).toContain("active_round: secondInitial");
    expect(edgeRuntime).toContain('handoff_pending: context.gameType === "wavelength"');
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
  it("keeps the Game 2 handoff action legible and tappable in dark sport themes", () => {
    const buttonStyle = dailyStyles.split(".daily-two-game-intermission button {")[1]?.split("}")[0];
    expect(buttonStyle).toBeDefined();
    expect(buttonStyle).toContain("background: var(--hq-context-accent, #fff)");
    expect(buttonStyle).toContain("color: var(--hq-context-accent-contrast, #08090a)");
    expect(buttonStyle).toContain("min-height: 48px");
    expect(buttonStyle).not.toContain("background: currentColor");
  });

});

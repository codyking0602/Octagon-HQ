import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const casual = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");
const daily = readFileSync("src/features/play/OfficialAverageFanDailyView.tsx", "utf8");
const runtime = readFileSync("src/features/play/averageFanDailyRuntime.ts", "utf8");

describe("Average Fan Daily / Casual parity contract", () => {
  it("reuses the approved Casual presentation primitives instead of rebuilding the game", () => {
    for (const primitive of [
      "AVERAGE_FAN_GAMEPLAY_STAGE_SRC",
      "FanSelector",
      "FinalDecision",
      "GameplayFanDesk",
      "HelpRail",
      "MoneyRail",
      "QuestionAnswerControl",
      "RulesModal",
      "TileBoard",
      "useAverageFanGameplayStageLayout",
      "useAverageFanOpeningStageScale",
      "useAverageFanScreenLock",
    ]) {
      expect(daily).toContain(primitive);
      expect(casual).toContain(primitive);
    }
    expect(daily).toContain('from "./AverageFanPrototypePage"');
    expect(daily).not.toContain('import "./AverageFanPrototypePage.css"');
  });

  it("keeps the approved loss verdict, frozen money ladder, and post-loss Final semantics identical", () => {
    for (const copy of [
      "YOU ARE NOT SMARTER THAN AN AVERAGE FAN",
      "YOUR HQ SCORE IS STILL ALIVE",
      "Finish the board and see how high you can score.",
      "KEEP PLAYING",
      "HQ RUN COMPLETE",
      "FINAL CORRECT +10",
      "FINAL MISS -10",
    ]) {
      expect(casual).toContain(copy);
      expect(daily).toContain(copy);
    }
    expect(daily).toContain("moneyAlive={moneyAlive}");
    expect(daily).toContain("lostAt={firstUnsavedMiss}");
    expect(runtime).toContain('phase: "verdict"');
    expect(runtime).toContain("verdict_shown: true");
  });

  it("selects Daily questions from the exact canonical Average Fan banks and engine", () => {
    expect(runtime).toContain('import { AVERAGE_FAN_CONTENT_BANKS } from "../games/averageFanContentBanks"');
    expect(runtime).toContain("averageFanQuestionEligibleForBoard");
    expect(runtime).toContain("averageFanQuestionEligibleForFinal");
    expect(runtime).toContain("averageFanFanAnswer");
    expect(runtime).toContain("scoreAverageFanBoard");
    expect(runtime).toContain("scoreAverageFanFinal");
  });
});

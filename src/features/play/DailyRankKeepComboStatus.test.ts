import { describe, expect, it } from "vitest";
import {
  DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
  dailyRankKeepComboStage,
  isDailyRankKeepCombo,
} from "./DailyRankKeepComboStatus";

describe("Daily Rank + Keep/Cut combo presentation", () => {
  it("recognizes only the canonical combo content version", () => {
    expect(isDailyRankKeepCombo({ contentVersion: DAILY_RANK_KEEP_COMBO_CONTENT_VERSION })).toBe(true);
    expect(isDailyRankKeepCombo({ contentVersion: "keep-cut-v3" })).toBe(false);
  });

  it("maps Blind Rank to part one and Keep/Cut to part two", () => {
    expect(dailyRankKeepComboStage({
      contentVersion: DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
      gameType: "blind_rank_5",
    })).toBe(1);
    expect(dailyRankKeepComboStage({
      contentVersion: DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
      gameType: "keep_4_cut_4",
    })).toBe(2);
  });

  it("does not relabel standalone games as combo stages", () => {
    expect(dailyRankKeepComboStage({
      contentVersion: "blind-rank-v3",
      gameType: "blind_rank_5",
    })).toBeNull();
  });
});
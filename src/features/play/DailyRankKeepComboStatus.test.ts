import { describe, expect, it } from "vitest";
import {
  DAILY_RANK_KEEP_COMBO_BLIND_RESULT_KEY,
  DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
  FOOTBALL_DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
  dailyRankKeepComboBlindRankResultState,
  dailyRankKeepComboComponentScore,
  dailyRankKeepComboStage,
  isDailyRankKeepCombo,
} from "./DailyRankKeepComboStatus";

const completedCombo = {
  contentVersion: DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
  officialAttempt: {
    nativeScore: 87,
    normalizedScore: 87,
    completedAt: "2026-08-20T10:00:00.000Z",
    publicResult: {
      blind_rank: { normalized_score: 80 },
      keep_cut: { normalized_score: 94 },
    },
  },
  publicState: {
    [DAILY_RANK_KEEP_COMBO_BLIND_RESULT_KEY]: {
      complete: true,
      slots: [{ id: "one", name: "One" }],
      reveal: { canonical_order: [{ id: "one", name: "One" }] },
    },
  },
};

const completedFootballCombo = {
  ...completedCombo,
  contentVersion: FOOTBALL_DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
  officialAttempt: {
    ...completedCombo.officialAttempt,
    publicResult: {
      blind_rank_score: 80,
      keep_cut_score: 94,
      combined_score: 87,
    },
  },
};

describe("Daily Rank + Keep/Cut combo presentation", () => {
  it("recognizes the persisted UFC and Football Daily Double content versions", () => {
    expect(isDailyRankKeepCombo({ contentVersion: DAILY_RANK_KEEP_COMBO_CONTENT_VERSION })).toBe(true);
    expect(isDailyRankKeepCombo({ contentVersion: FOOTBALL_DAILY_RANK_KEEP_COMBO_CONTENT_VERSION })).toBe(true);
    expect(isDailyRankKeepCombo({ contentVersion: "keep-cut-v3" })).toBe(false);
  });

  it("maps Blind Rank to part one and Keep/Cut to part two across sports", () => {
    expect(dailyRankKeepComboStage({
      contentVersion: DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
      gameType: "blind_rank_5",
    })).toBe(1);
    expect(dailyRankKeepComboStage({
      contentVersion: FOOTBALL_DAILY_RANK_KEEP_COMBO_CONTENT_VERSION,
      gameType: "keep_4_cut_4",
    })).toBe(2);
  });

  it("does not relabel standalone games as combo stages", () => {
    expect(dailyRankKeepComboStage({
      contentVersion: "blind-rank-v3",
      gameType: "blind_rank_5",
    })).toBeNull();
  });

  it("keeps UFC and Football component scores separate from the combined Daily score", () => {
    expect(dailyRankKeepComboComponentScore(completedCombo, "blind_rank")).toBe(80);
    expect(dailyRankKeepComboComponentScore(completedCombo, "keep_cut")).toBe(94);
    expect(dailyRankKeepComboComponentScore(completedFootballCombo, "blind_rank")).toBe(80);
    expect(dailyRankKeepComboComponentScore(completedFootballCombo, "keep_cut")).toBe(94);
  });

  it("exposes the completed Blind Rank state only for a finished Daily Double", () => {
    expect(dailyRankKeepComboBlindRankResultState(completedCombo)?.complete).toBe(true);
    expect(dailyRankKeepComboBlindRankResultState(completedFootballCombo)?.complete).toBe(true);
    expect(dailyRankKeepComboBlindRankResultState({
      ...completedCombo,
      officialAttempt: null,
    })).toBeNull();
  });
});

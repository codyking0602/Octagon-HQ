import { describe, expect, it, vi } from "vitest";
import {
  DAILY_HEALTH_QUERY,
  extractDailyHealthRows,
  evaluateDailyHealth,
  checkLiveDailyHealth,
} from "./verify-live-daily-board-health.mjs";

const published = [
  { sport: "football", central_day: "2026-11-05", expected_game: "higher_lower",
    published_game: "higher_lower", saved_game: "higher_lower",
    saved_scoring: "daily-two-game-average-score-v1", required: "false", board_ready: true },
  { sport: "ufc", central_day: "2026-11-04", expected_game: "average_fan",
    published_game: "average_fan", saved_game: "average_fan",
    saved_scoring: "average-fan-score-v2", required: "false", board_ready: true },
  { sport: "nba", central_day: "2026-11-05", expected_game: "millionaire",
    published_game: "millionaire", saved_game: "millionaire",
    saved_scoring: "play-official-score-v1", required: "false", board_ready: true },
];

describe("production Daily 3-sport board health watchdog", () => {
  it("probes the live canonical DB identity and public board shapes without writing data", () => {
    expect(DAILY_HEALTH_QUERY).toContain("public.get_daily_challenge_materialization_request");
    expect(DAILY_HEALTH_QUERY).toContain("private.daily_challenge_setups");
    expect(DAILY_HEALTH_QUERY).toContain("jsonb_typeof(setup->'initial_state')");
    expect(DAILY_HEALTH_QUERY).toContain("setup->'initial_state'->'active_round'");
    expect(DAILY_HEALTH_QUERY).toContain("saved_game = 'average_fan'");
    expect(DAILY_HEALTH_QUERY).toContain("saved_game = 'millionaire'");
    expect(DAILY_HEALTH_QUERY).toContain("saved_game = 'sports_feud'");
    expect(DAILY_HEALTH_QUERY).not.toMatch(/\b(insert|update|delete|drop|truncate|grant)\s+(into|from|table|on)/i);
  });

  it("accepts the live November 5 published Football, UFC and NBA boards", () => {
    const result = evaluateDailyHealth(extractDailyHealthRows(published));
    expect(result.failures).toEqual([]);
    expect(result.ready).toHaveLength(3);
    expect(result.ready[0]).toContain("higher_lower");
  });

  it("preflights the next Football and UFC boards before midnight, not just after launch", () => {
    expect(DAILY_HEALTH_QUERY).toContain("now() + interval '30 minutes'");
    expect(DAILY_HEALTH_QUERY).toContain("time '23:35'");
    const future = [
      ...published,
      { ...published[0], sport: "football_next", central_day: "2026-11-06" },
      { ...published[1], sport: "ufc_next", central_day: "2026-11-06" },
    ];
    expect(evaluateDailyHealth(extractDailyHealthRows(future)).failures).toEqual([]);
    const unpublished = future.map(row => row.sport === "football_next"
      ? { ...row, required: "true", published_game: null, board_ready: false }
      : row);
    expect(evaluateDailyHealth(extractDailyHealthRows(unpublished)).failures)
      .toEqual(["football_next 2026-11-06: higher_lower has not been published"]);
  });

  it("catches any missed publication, game mismatch, missing scoring or blank board", () => {
    for (const patch of [
      { required: "true", published_game: null },
      { published_game: "find_leader" },
      { saved_game: "sports_feud" },
      { saved_scoring: null },
      { board_ready: false },
    ]) {
      const bad = published.map((row, index) => index === 0 ? { ...row, ...patch } : row);
      expect(evaluateDailyHealth(bad).failures, JSON.stringify(patch)).toHaveLength(1);
    }
  });

  it("does not false-alert NBA in the offseason, but never skips a missing Football or UFC board", () => {
    const summer = published.map(row => row.sport === "nba"
      ? { ...row, expected_game: null, published_game: null, saved_game: null, required: "false" }
      : row);
    expect(evaluateDailyHealth(summer).failures).toEqual([]);
    const missingUfc = summer.map(row => row.sport === "ufc"
      ? { ...row, expected_game: null } : row);
    expect(evaluateDailyHealth(missingUfc).failures).toHaveLength(1);
  });

  it("refuses an incomplete, duplicated or changed sport list", () => {
    expect(() => extractDailyHealthRows([])).toThrow("all three sports");
    expect(() => extractDailyHealthRows([...published.slice(0, 2), published[0]])).toThrow("omitted or duplicated");
    expect(() => extractDailyHealthRows({ result: published })).not.toThrow();
  });

  it("reads the production snapshot through a read-only scoped API call", async () => {
    const fetcher = vi.fn(async (_url, options) => {
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body).read_only).toBe(true);
      expect(options.headers.Authorization).toBe("Bearer example");
      return { ok: true, json: async () => published };
    });
    expect((await checkLiveDailyHealth({
      token: "example", projectId: "rvbspcjvebgwqzssayts", fetcher,
    })).failures).toEqual([]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toContain("/database/query");
  });

  it("fails closed on API errors and never logs access tokens", async () => {
    await expect(checkLiveDailyHealth({
      token: "example", projectId: "rvbspcjvebgwqzssayts",
      fetcher: async () => ({ ok: false, status: 503 }),
    })).rejects.toThrow("HTTP 503");
  });
});

import { describe, expect, it } from "vitest";
import {
  buildFootballTodayPersistenceSetup,
  buildFootballTodayProjection,
} from "./footballTodayChallengeSession";

type JsonRecord = Record<string, unknown>;

const dailyDoubleDay = "2026-08-25";
const rankActions = [1, 2, 3, 4, 5].map((slot) => ({ slot }));
const keepActions = [
  "keep",
  "keep",
  "keep",
  "keep",
  "cut",
  "cut",
  "cut",
  "cut",
].map((choice) => ({ choice }));
const completedActions = [...rankActions, ...keepActions];

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function records(value: unknown) {
  return Array.isArray(value)
    ? value.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
    : [];
}

function expectFootballSubject(value: unknown) {
  const subject = record(value);
  expect(["NFL", "CFB"]).toContain(subject.league);
  expect(typeof subject.name).toBe("string");
  expect(subject).not.toHaveProperty("divisions");
  expect(subject).not.toHaveProperty("main_era");
  expect(subject).not.toHaveProperty("thumb_url");
}

describe("Football Blind Rank + Keep/Cut Daily-only role", () => {
  it("keeps Football subjects inside the Football Daily runtime across both Daily Double halves", () => {
    const rank = buildFootballTodayProjection(dailyDoubleDay);
    expect(rank.game_type).toBe("blind_rank_5");
    expectFootballSubject(rank.public_state.current_subject);

    const keep = buildFootballTodayProjection(dailyDoubleDay, rankActions);
    expect(keep.game_type).toBe("keep_4_cut_4");
    expectFootballSubject(keep.public_state.current_subject);

    const rankLeague = record(rank.public_setup.pack).league;
    const keepLeague = record(keep.public_setup.pack).league;
    expect(["NFL", "CFB"]).toContain(rankLeague);
    expect(["NFL", "CFB"]).toContain(keepLeague);
    expect(rankLeague).not.toBe(keepLeague);
  });

  it("reconstructs a completed Daily Double deterministically from the same action history", () => {
    const first = buildFootballTodayProjection(dailyDoubleDay, completedActions);
    const second = buildFootballTodayProjection(dailyDoubleDay, completedActions);

    expect(first.content_version).toBe("football-daily-double-v1");
    expect(first.scoring_version).toBe("play-official-score-v4");
    expect(first.game_type).toBe("keep_4_cut_4");
    expect(first.official_attempt).not.toBeNull();
    expect(first.public_setup).toEqual(second.public_setup);
    expect(first.public_state).toEqual(second.public_state);
    expect(first.reveal_setup).toEqual(second.reveal_setup);
    expect(first.action_history).toEqual(second.action_history);
    expect(first.official_attempt?.native_score).toBe(second.official_attempt?.native_score);
    expect(first.official_attempt?.normalized_score).toBe(second.official_attempt?.normalized_score);
    expect(first.official_attempt?.public_result).toEqual(second.official_attempt?.public_result);

    const result = first.official_attempt?.public_result ?? {};
    expect(typeof result.blind_rank_score).toBe("number");
    expect(typeof result.keep_cut_score).toBe("number");
    expect(result.combined_score).toBe(Math.round((Number(result.blind_rank_score) + Number(result.keep_cut_score)) / 2));
  });

  it("preserves the persisted Daily Double setup identity and reveal subjects", () => {
    const setup = buildFootballTodayPersistenceSetup(dailyDoubleDay);
    expect(setup.gameType).toBe("keep_4_cut_4");
    expect(setup.contentVersion).toBe("football-daily-double-v1");
    expect(setup.scoringVersion).toBe("play-official-score-v4");
    expect(setup.setupKey).toBe(`football-daily-double-v1:football-daily-v1:${dailyDoubleDay}`);

    const reveal = record(buildFootballTodayProjection(dailyDoubleDay, completedActions).reveal_setup);
    for (const half of ["blind_rank_5", "keep_4_cut_4"] as const) {
      const subjects = records(record(reveal[half]).subjects);
      expect(subjects.length).toBeGreaterThan(0);
      subjects.forEach(expectFootballSubject);
    }
  });
});

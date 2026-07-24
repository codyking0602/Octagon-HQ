import { beforeEach, describe, expect, it } from "vitest";
import {
  dailyFindLeaderBoard,
  findLeaderAudit,
  findLeaderQuestions,
  scheduledFindLeaderDefinition,
} from "./findLeaderEngine";
import {
  loadFindLeaderHistory,
  recordFindLeaderAttempt,
} from "./findLeaderStorage";
import { playGames } from "./playRegistry";

describe("Play registry", () => {
  it("preserves the approved six-game order", () => {
    expect(playGames.map((game) => game.id)).toEqual([
      "find-leader",
      "wavelength",
      "blind-resume",
      "blind-rank",
      "keep-cut",
      "better-than",
    ]);
  });
});

describe("Find the Leader engine", () => {
  it("owns fifty varied UFC-only question definitions", () => {
    expect(findLeaderQuestions).toHaveLength(50);
    expect(new Set(findLeaderQuestions.map((question) => question.id)).size).toBe(50);
    expect(new Set(findLeaderQuestions.map((question) => question.family)).size).toBeGreaterThanOrEqual(8);
  });

  it("builds one deterministic ten-fighter daily board with a unique group leader", () => {
    const first = dailyFindLeaderBoard("2026-07-24");
    const second = dailyFindLeaderBoard("2026-07-24");
    expect(first).toEqual(second);
    expect(first).not.toBeNull();
    expect(first!.candidates).toHaveLength(10);
    expect(new Set(first!.candidates.map((fighter) => fighter.id)).size).toBe(10);

    const maximum = Math.max(...first!.candidates.map((fighter) => fighter.value));
    const leaders = first!.candidates.filter((fighter) => fighter.value === maximum);
    expect(leaders).toHaveLength(1);
    expect(leaders[0].id).toBe(first!.leaderId);
    expect(first!.question).toMatch(/^Who leads this group in /);
  });

  it("keeps a broad playable bank and avoids immediate daily repeats", () => {
    const audit = findLeaderAudit();
    expect(audit.validCount).toBeGreaterThanOrEqual(35);

    const days = Array.from({ length: 14 }, (_, index) => `2026-07-${String(16 + index).padStart(2, "0")}`);
    const ids = days.map((day) => scheduledFindLeaderDefinition(day)?.id);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Find the Leader history", () => {
  beforeEach(() => window.localStorage.clear());

  it("locks the first completed attempt as official while preserving replay best", () => {
    recordFindLeaderAttempt("2026-07-24", 6);
    recordFindLeaderAttempt("2026-07-24", 10);
    const rows = loadFindLeaderHistory();
    expect(rows).toEqual([
      expect.objectContaining({
        day: "2026-07-24",
        officialScore: 6,
        bestScore: 10,
        attempts: 2,
      }),
    ]);
  });
});

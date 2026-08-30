import { describe, expect, it } from "vitest";
import { footballChampionship, footballLockAllowance, gradeFootballAts, rankFootballChampionship } from "./footballPicksScoring";

const final = { pickedTeam: "home" as const, homeScore: 24, awayScore: 20, frozenSpreadHome: -3, isFinal: true };

describe("canonical Football Picks competition rules", () => {
  it("grades normal ATS wins, losses and pushes", () => {
    expect(gradeFootballAts(final)).toEqual({ outcome: "win", points: 1 });
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -5 })).toEqual({ outcome: "loss", points: 0 });
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -4 })).toEqual({ outcome: "push", points: 0.5 });
  });
  it("uses the frozen publication spread rather than accepting a later market line", () => {
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -3 }).points).toBe(1);
  });
  it("makes a Lock worth three total on a win, zero on a loss, and one-half on a push", () => {
    expect(gradeFootballAts({ ...final, isLock: true }).points).toBe(3);
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -5, isLock: true }).points).toBe(0);
    expect(gradeFootballAts({ ...final, frozenSpreadHome: -4, isLock: true }).points).toBe(0.5);
  });
  it.each([[12, 3], [6, 2], [11, 2], [2, 1], [5, 1], [1, 0]])("allows %i games => %i Locks", (games, locks) => {
    expect(footballLockAllowance(games)).toBe(locks);
  });
  it("treats the one-game Super Bowl as a normal pick with no Lock", () => {
    expect(footballLockAllowance(1)).toBe(0);
    expect(gradeFootballAts(final).points).toBe(1);
  });
  it("automatically drops exactly one deterministic lowest week", () => {
    const result = footballChampionship([
      { weekId: "week-1", points: 8, wins: 5, losses: 2, pushes: 1 },
      { weekId: "missed-1", points: 0, wins: 0, losses: 0, pushes: 0 },
      { weekId: "missed-2", points: 0, wins: 0, losses: 0, pushes: 0 },
    ]);
    expect(result).toMatchObject({ rawPoints: 8, adjustedPoints: 8, droppedWeekId: "missed-1", wins: 5, losses: 2, pushes: 1 });
    expect(result.atsPercentage).toBeCloseTo(5 / 7);
  });
  it("keeps every supplied championship week, including the Super Bowl, in one total", () => {
    expect(footballChampionship([
      { weekId: "opening", points: 1, wins: 1, losses: 0, pushes: 0 },
      { weekId: "super-bowl", points: 1, wins: 1, losses: 0, pushes: 0 },
    ]).adjustedPoints).toBe(1);
  });
  it("orders standings only by adjusted championship points and leaves ties stable", () => {
    expect(rankFootballChampionship([{ id: "a", adjustedPoints: 4 }, { id: "b", adjustedPoints: 7 }]).map(row => row.id)).toEqual(["b", "a"]);
  });
  it("does not misgrade unresolved or cancelled games and is deterministic", () => {
    const unresolved = { ...final, isFinal: false };
    expect(gradeFootballAts(unresolved)).toEqual({ outcome: "unresolved", points: 0 });
    expect(gradeFootballAts({ ...final, isCancelled: true })).toEqual({ outcome: "unresolved", points: 0 });
    expect(gradeFootballAts(final)).toEqual(gradeFootballAts(final));
  });
});

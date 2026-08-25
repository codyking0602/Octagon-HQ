import { describe, expect, it } from "vitest";
import { seededLineupRandom } from "./lineupModel";
import { selectFindLeaderCompetition } from "./findLeaderCompetition";

type Row = { id: string; value: number };

const rows = (values: readonly number[]): Row[] => values.map((value, index) => ({ id: `row-${index}`, value }));
const baseConfig = {
  getId: (row: Row) => row.id,
  getValue: (row: Row) => row.value,
  competitiveWindowSize: 10,
  supportEndIndex: 12,
};

describe("shared Find the Leader competition selection", () => {
  it("prefers a competitive non-record leader with nine lower-valued candidates", () => {
    const pool = rows(Array.from({ length: 24 }, (_, index) => 100 - index));
    const selected = selectFindLeaderCompetition(pool, () => 0, baseConfig)!;

    expect(selected.leader.id).not.toBe(pool[0]!.id);
    expect(selected.lower.length).toBeGreaterThanOrEqual(9);
    expect(selected.challengers).toHaveLength(9);
    expect(selected.challengers.every((row) => row.value < selected.leader.value)).toBe(true);
  });

  it("selects four closest contenders without arbitrarily including every cutoff tie", () => {
    const pool = rows([30, 25, 20, 19, 18, 17, 16, 16, 16, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6]);
    const selected = selectFindLeaderCompetition(pool, () => 0, {
      ...baseConfig,
      competitiveWindowSize: 1,
    })!;
    const core = selected.challengers.slice(0, 4);

    expect(core.filter((row) => row.value > 16).map((row) => row.value)).toEqual([19, 18, 17]);
    expect(core.filter((row) => row.value === 16)).toHaveLength(1);
  });

  it("honors sport-specific competitive windows and support slices", () => {
    const pool = rows(Array.from({ length: 30 }, (_, index) => 100 - index));
    const narrow = selectFindLeaderCompetition(pool, () => 0.999, {
      ...baseConfig,
      competitiveWindowSize: 1,
      scoreWindow: 10,
    })!;
    const wider = selectFindLeaderCompetition(pool, () => 0.999, {
      ...baseConfig,
      competitiveWindowSize: 2,
      scoreWindow: 10,
    })!;
    expect(wider.leader.id).not.toBe(narrow.leader.id);

    const footballSupport = selectFindLeaderCompetition(pool, () => 0.5, {
      ...baseConfig,
      competitiveWindowSize: 1,
      candidateCount: 4,
      closestCount: 1,
      supportCount: 2,
      wildcardCount: 0,
      supportEndIndex: 9,
    })!;
    const ufcSupport = selectFindLeaderCompetition(pool, () => 0.5, {
      ...baseConfig,
      competitiveWindowSize: 1,
      candidateCount: 4,
      closestCount: 1,
      supportCount: 2,
      wildcardCount: 0,
      supportEndIndex: 12,
    })!;
    expect(footballSupport.challengers.slice(1).map((row) => row.id))
      .not.toEqual(ufcSupport.challengers.slice(1).map((row) => row.id));
  });

  it("is deterministic for the same seeded random stream", () => {
    const pool = rows(Array.from({ length: 30 }, (_, index) => 100 - index));
    const select = () => selectFindLeaderCompetition(
      pool,
      seededLineupRandom("shared-competition-test", "same-seed"),
      baseConfig,
    );

    expect(select()).toEqual(select());
  });
});

import { describe, expect, it } from "vitest";
import qbJson from "../../../data/generated/football/wheel-nfl-qb-grades-2026-10-03.json";
import rbJson from "../../../data/generated/football/wheel-nfl-rb-grades-2026-10-03.json";
import wrJson from "../../../data/generated/football/wheel-nfl-wr-grades-2026-10-03.json";
import teJson from "../../../data/generated/football/wheel-nfl-te-grades-2026-10-03.json";
import frontSevenJson from "../../../data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json";
import secondaryJson from "../../../data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json";
import headCoachJson from "../../../data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json";

function presentationScore(rawAverage: number) {
  return Math.round(Math.max(0, Math.min(100, rawAverage * 2 - 100)));
}

const families = {
  QB: qbJson.grades.map((row) => row.grade),
  RB: rbJson.grades.map((row) => row.grade),
  WR: wrJson.grades.map((row) => row.grade),
  Flex: [...rbJson.grades, ...wrJson.grades, ...teJson.grades].map((row) => row.grade),
  "Front Seven": frontSevenJson.grades.map((row) => row.grade),
  Secondary: secondaryJson.grades.map((row) => row.grade),
  "Head Coach": headCoachJson.grades.map((row) => row.grade),
};

function rawAverage(grades: readonly number[]) {
  return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
}

describe("NFL Wheel grading gameplay sanity", () => {
  it("uses the locked linear reveal curve without changing the raw-grade winner", () => {
    expect(presentationScore(75)).toBe(50);
    expect(presentationScore(80)).toBe(60);
    expect(presentationScore(85)).toBe(70);
    expect(presentationScore(90)).toBe(80);
    expect(presentationScore(95)).toBe(90);
    expect(presentationScore(100)).toBe(100);

    const creator = [97, 92, 87, 82, 76, 85, 84];
    const recipient = [92, 92, 87, 82, 76, 85, 84];
    expect(rawAverage(creator)).toBeGreaterThan(rawAverage(recipient));
    expect(presentationScore(rawAverage(creator))).toBeGreaterThanOrEqual(presentationScore(rawAverage(recipient)));
  });

  it("keeps every slot equally weighted across elite, good, average, and lower-end gaps", () => {
    const baseline = [82, 82, 82, 82, 82, 82, 82];
    const impact = (from: number, to: number) => rawAverage([to, ...baseline.slice(1)]) - rawAverage([from, ...baseline.slice(1)]);
    expect(impact(92, 97)).toBeCloseTo(5 / 7, 8);
    expect(impact(87, 92)).toBeCloseTo(5 / 7, 8);
    expect(impact(82, 87)).toBeCloseTo(5 / 7, 8);
    expect(impact(76, 82)).toBeCloseTo(6 / 7, 8);
  });

  it("preserves legitimately weak outcomes and a meaningful elite ceiling", () => {
    const lows = Object.values(families).map((grades) => Math.min(...grades));
    const highs = Object.values(families).map((grades) => Math.max(...grades));
    expect(rawAverage(lows)).toBeLessThan(75);
    expect(presentationScore(rawAverage(lows))).toBeLessThan(50);
    expect(rawAverage(highs)).toBeGreaterThan(97);
    expect(presentationScore(rawAverage(highs))).toBeGreaterThan(94);
  });

  it("produces a healthy seven-slot distribution without bottom-end distortion", () => {
    let seed = 123456789;
    const random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    const choose = (values: readonly number[]) => values[Math.floor(random() * values.length)]!;

    const outcomes: number[] = [];
    for (let index = 0; index < 20_000; index += 1) {
      outcomes.push(rawAverage([
        choose(families.QB),
        choose(families.RB),
        choose(families.WR),
        choose(families.Flex),
        choose(families["Front Seven"]),
        choose(families.Secondary),
        choose(families["Head Coach"]),
      ]));
    }
    outcomes.sort((left, right) => left - right);

    const percentile = (value: number) => outcomes[Math.floor((outcomes.length - 1) * value)]!;
    expect(percentile(0.10)).toBeLessThanOrEqual(81.5);
    expect(percentile(0.50)).toBeGreaterThanOrEqual(83);
    expect(percentile(0.50)).toBeLessThanOrEqual(84);
    expect(percentile(0.90)).toBeGreaterThanOrEqual(86);
    expect(percentile(0.90) - percentile(0.10)).toBeGreaterThanOrEqual(5);
  });
});

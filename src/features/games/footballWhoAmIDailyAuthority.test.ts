import { describe, expect, it } from "vitest";
import {
  createFootballWhoAmIRound,
  getFootballWhoAmIUniverse,
} from "./footballWhoAmIAuthority";
import {
  createFootballWhoAmIDailyRound,
  getFootballWhoAmIDailyUniverse,
} from "./footballWhoAmIDailyAuthority";

function jsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
}

describe("Football Who Am I Daily lightweight authority", () => {
  it("preserves the exact NFL and CFB launch universes", () => {
    expect(jsonValue(getFootballWhoAmIDailyUniverse("NFL")))
      .toEqual(jsonValue(getFootballWhoAmIUniverse("NFL")));
    expect(jsonValue(getFootballWhoAmIDailyUniverse("CFB")))
      .toEqual(jsonValue(getFootballWhoAmIUniverse("CFB")));
  });

  it("preserves deterministic daily round selection and clue order for both league branches", () => {
    for (const seed of [1, 1000]) {
      expect(createFootballWhoAmIDailyRound(seededRandom(seed)))
        .toEqual(createFootballWhoAmIRound(seededRandom(seed)));
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  MLB_WHO_AM_I_OWNER_ROUNDS,
} from "./MlbWhoAmIOwnerRun";
import {
  MLB_WHO_AM_I_PRODUCTION_CHALLENGE_KEY,
  MLB_WHO_AM_I_PRODUCTION_DATE,
  MLB_WHO_AM_I_PRODUCTION_ROUNDS,
  MLB_WHO_AM_I_PRODUCTION_SOURCE_NOTES,
  MLB_WHO_AM_I_SECOND_PRODUCTION_CHALLENGE_KEY,
  MLB_WHO_AM_I_SECOND_PRODUCTION_DATE,
  MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS,
  MLB_WHO_AM_I_SECOND_PRODUCTION_SOURCE_NOTES,
  mlbWhoAmIProductionConfig,
} from "./mlbWhoAmIProduction";

describe("MLB Who Am I October 3 production content", () => {
  it("locks the scheduled identity and two-round format", () => {
    expect(MLB_WHO_AM_I_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-04");
    expect(MLB_WHO_AM_I_PRODUCTION_DATE).toBe("2026-10-03");
    expect(MLB_WHO_AM_I_PRODUCTION_ROUNDS).toHaveLength(2);
    expect(MLB_WHO_AM_I_PRODUCTION_ROUNDS.every((round) => (
      round.sport === "mlb"
      && round.league === "MLB"
      && round.clues.length === 10
      && round.subjects.length >= 30
    ))).toBe(true);
  });

  it("never reuses either burned owner-review identity", () => {
    const ownerIds = new Set(MLB_WHO_AM_I_OWNER_ROUNDS.map((round) => round.hiddenSubject.id));
    const productionIds = MLB_WHO_AM_I_PRODUCTION_ROUNDS.map((round) => round.hiddenSubject.id);
    expect(productionIds.every((id) => !ownerIds.has(id))).toBe(true);
    expect(new Set(productionIds).size).toBe(2);
  });

  it("keeps each clue ladder progressive and late clues strongest", () => {
    MLB_WHO_AM_I_PRODUCTION_ROUNDS.forEach((round) => {
      expect(round.clues.map((clue) => clue.band)).toEqual([
        "broad",
        "broad",
        "helpful",
        "helpful",
        "strong",
        "strong",
        "strong",
        "strong",
        "giveaway",
        "giveaway",
      ]);
      expect(new Set(round.clues.map((clue) => clue.id)).size).toBe(10);
      expect(round.clues.every((clue) => !clue.text.includes(round.hiddenSubject.name))).toBe(true);
    });
  });

  it("keeps MLB.com authority notes for both production identities", () => {
    expect(MLB_WHO_AM_I_PRODUCTION_SOURCE_NOTES.filter((source) => source.round === 1).length).toBeGreaterThanOrEqual(2);
    expect(MLB_WHO_AM_I_PRODUCTION_SOURCE_NOTES.filter((source) => source.round === 2).length).toBeGreaterThanOrEqual(2);
    expect(MLB_WHO_AM_I_PRODUCTION_SOURCE_NOTES.every((source) => (
      source.authority === "MLB.com"
      && source.url.startsWith("https://www.mlb.com/")
      && source.verifiedAt === "2026-09-25"
    ))).toBe(true);
  });
  it("locks a distinct October 19 two-identity production run", () => {
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-14");
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_DATE).toBe("2026-10-19");
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS).toHaveLength(2);
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS.map((round) => round.hiddenSubject.name)).toEqual([
      "Mariano Rivera",
      "Ichiro Suzuki",
    ]);

    const firstRunIds = new Set(MLB_WHO_AM_I_PRODUCTION_ROUNDS.map((round) => round.hiddenSubject.id));
    const secondRunIds = MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS.map((round) => round.hiddenSubject.id);
    expect(secondRunIds.every((id) => !firstRunIds.has(id))).toBe(true);
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS.every((round) => round.clues.length === 10)).toBe(true);
  });

  it("resolves each scheduled Who Am I slot to its own immutable content", () => {
    expect(mlbWhoAmIProductionConfig("mlb-2026-play-04", "2026-10-03")?.rounds)
      .toBe(MLB_WHO_AM_I_PRODUCTION_ROUNDS);
    expect(mlbWhoAmIProductionConfig("mlb-2026-play-14", "2026-10-19")?.rounds)
      .toBe(MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS);
    expect(mlbWhoAmIProductionConfig("mlb-2026-play-14", "2026-10-18")).toBeNull();
  });

  it("keeps the second run progressive and source-backed", () => {
    MLB_WHO_AM_I_SECOND_PRODUCTION_ROUNDS.forEach((round) => {
      expect(round.clues.map((clue) => clue.band)).toEqual([
        "broad",
        "broad",
        "helpful",
        "helpful",
        "strong",
        "strong",
        "strong",
        "strong",
        "giveaway",
        "giveaway",
      ]);
      expect(new Set(round.clues.map((clue) => clue.id)).size).toBe(10);
      expect(round.clues.every((clue) => !clue.text.includes(round.hiddenSubject.name))).toBe(true);
    });

    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_SOURCE_NOTES.filter((source) => source.round === 1)).toHaveLength(2);
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_SOURCE_NOTES.filter((source) => source.round === 2)).toHaveLength(2);
    expect(MLB_WHO_AM_I_SECOND_PRODUCTION_SOURCE_NOTES.every((source) => (
      source.authority === "MLB.com"
      && source.url.startsWith("https://www.mlb.com/")
      && source.verifiedAt === "2026-09-30"
    ))).toBe(true);
  });

});

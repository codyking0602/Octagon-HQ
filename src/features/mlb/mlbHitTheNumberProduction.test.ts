import { describe, expect, it } from "vitest";
import { MLB_HIT_NUMBER_OWNER_GAMES } from "./MlbHitTheNumberOwnerRun";
import { gradeMlbHitNumberGame } from "./MlbHitTheNumberChallenge";
import {
  MLB_HIT_NUMBER_PRODUCTION_CHALLENGE_KEY,
  MLB_HIT_NUMBER_PRODUCTION_CONFIG,
  MLB_HIT_NUMBER_PRODUCTION_DATE,
  MLB_HIT_NUMBER_PRODUCTION_SOURCE_NOTES,
} from "./mlbHitTheNumberProduction";

describe("MLB Hit the Number October 15 production", () => {
  it("locks the approved challenge identity and two five-of-fourteen HR boards", () => {
    expect(MLB_HIT_NUMBER_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-07");
    expect(MLB_HIT_NUMBER_PRODUCTION_DATE).toBe("2026-10-15");
    expect(MLB_HIT_NUMBER_PRODUCTION_CONFIG.games).toHaveLength(2);

    MLB_HIT_NUMBER_PRODUCTION_CONFIG.games.forEach((game) => {
      expect(game.candidates).toHaveLength(14);
      expect(new Set(game.candidates.map((candidate) => candidate.id)).size).toBe(14);
      expect(game.candidates.every((candidate) => Number.isInteger(candidate.value) && candidate.value > 0)).toBe(true);
    });

    expect(MLB_HIT_NUMBER_PRODUCTION_CONFIG.games[0].metricLabel).toBe("Career Home Runs");
    expect(MLB_HIT_NUMBER_PRODUCTION_CONFIG.games[0].configurationLabel).toContain("Steroid Era");
    expect(MLB_HIT_NUMBER_PRODUCTION_CONFIG.games[1].metricLabel).toBe("Single-Season Home Runs");
    expect(MLB_HIT_NUMBER_PRODUCTION_CONFIG.games[1].candidates.every((candidate) => /· \d{4}$/.test(candidate.name))).toBe(true);
  });

  it("does not reuse an exact disposable owner-review candidate/value card", () => {
    const ownerCards = new Set(
      MLB_HIT_NUMBER_OWNER_GAMES.flatMap((game) => game.candidates)
        .map((candidate) => `${candidate.name}|${candidate.value}`),
    );
    const productionCards = MLB_HIT_NUMBER_PRODUCTION_CONFIG.games.flatMap((game) => game.candidates)
      .map((candidate) => `${candidate.name}|${candidate.value}`);

    expect(productionCards.every((card) => !ownerCards.has(card))).toBe(true);
  });

  it("uses an intentionally recognizable second board", () => {
    const names = MLB_HIT_NUMBER_PRODUCTION_CONFIG.games[1].candidates.map((candidate) => candidate.name);
    expect(names.some((name) => name.startsWith("Babe Ruth ·"))).toBe(true);
    expect(names.some((name) => name.startsWith("Barry Bonds ·"))).toBe(true);
    expect(names.some((name) => name.startsWith("Aaron Judge ·"))).toBe(true);
    expect(names.some((name) => name.startsWith("Shohei Ohtani ·"))).toBe(true);
    expect(names.some((name) => name.startsWith("Ken Griffey Jr. ·"))).toBe(true);
  });

  it("has multiple playable combinations and a perfect 100-point path on both boards", () => {
    const [career, singleSeason] = MLB_HIT_NUMBER_PRODUCTION_CONFIG.games;

    expect(gradeMlbHitNumberGame(career, [
      "oct15-pujols-career",
      "oct15-cabrera-career",
      "oct15-beltran-career",
      "oct15-howard-career",
      "oct15-fielder-career",
    ])).toMatchObject({ status: "perfect", total: 2350, score: 100 });

    expect(gradeMlbHitNumberGame(singleSeason, [
      "oct15-bonds-2001",
      "oct15-mcgwire-1998",
      "oct15-maris-1961",
      "oct15-pujols-2006",
      "oct15-ortiz-2005",
    ])).toMatchObject({ status: "perfect", total: 300, score: 100 });

    const exactCount = (game: typeof career) => {
      let count = 0;
      for (let a = 0; a < game.candidates.length - 4; a += 1) {
        for (let b = a + 1; b < game.candidates.length - 3; b += 1) {
          for (let c = b + 1; c < game.candidates.length - 2; c += 1) {
            for (let d = c + 1; d < game.candidates.length - 1; d += 1) {
              for (let e = d + 1; e < game.candidates.length; e += 1) {
                const total = [a, b, c, d, e].reduce((sum, index) => sum + game.candidates[index]!.value, 0);
                if (total === game.target) count += 1;
              }
            }
          }
        }
      }
      return count;
    };

    expect(exactCount(career)).toBeGreaterThan(1);
    expect(exactCount(singleSeason)).toBeGreaterThan(10);
  });

  it("keeps MLB.com verification references for both stat pools", () => {
    expect(MLB_HIT_NUMBER_PRODUCTION_SOURCE_NOTES).toHaveLength(4);
    expect(MLB_HIT_NUMBER_PRODUCTION_SOURCE_NOTES.every((source) => (
      source.authority === "MLB.com" && source.url.startsWith("https://www.mlb.com/")
    ))).toBe(true);
  });
});

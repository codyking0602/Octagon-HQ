import { describe, expect, it } from "vitest";
import {
  WHO_AM_I_FINAL_GUESS_COUNT,
  WHO_AM_I_RESCUE_GUESS_COUNT,
  WHO_AM_I_RESCUE_OPTION_COUNT,
  WHO_AM_I_RESCUE_SCORE,
  WHO_AM_I_RESCUE_SECOND_SCORE,
  WHO_AM_I_WRONG_GUESS_PENALTY,
  createWhoAmIRound,
  whoAmIProgressiveClues,
  whoAmIRecoveryScore,
  whoAmIRescueChoices,
  whoAmIScore,
  type WhoAmICandidate,
  type WhoAmIClueBand,
} from "./whoAmIEngine";

function candidate(
  id: string,
  clueCount = 10,
  options: Partial<Pick<WhoAmICandidate, "eraBand" | "rescueGroup" | "kind">> = {},
): WhoAmICandidate {
  const bands: WhoAmIClueBand[] = [
    "broad", "broad",
    "helpful", "helpful", "helpful",
    "strong", "strong", "strong",
    "giveaway", "giveaway",
  ];
  return {
    id,
    name: id,
    kind: options.kind ?? "fighter",
    ...(options.eraBand ? { eraBand: options.eraBand } : {}),
    ...(options.rescueGroup ? { rescueGroup: options.rescueGroup } : {}),
    clues: Array.from({ length: clueCount }, (_value, index) => ({
      id: `${id}:${index}`,
      text: `${id} clue ${index}`,
      band: bands[index % bands.length]!,
    })),
  };
}

describe("Who Am I engine", () => {
  it("keeps clue progression broad before stronger and giveaway clues", () => {
    const clues = whoAmIProgressiveClues(candidate("alpha").clues, () => 0);
    expect(clues).toHaveLength(10);
    expect(clues.map((entry) => entry.band)).toEqual([
      "broad", "broad",
      "helpful", "helpful", "helpful",
      "strong", "strong", "strong",
      "giveaway", "giveaway",
    ]);
  });

  it("uses the calibrated natural score ladder and ten-point miss penalty", () => {
    expect(whoAmIScore(2, 0)).toBe(100);
    expect(whoAmIScore(4, 0)).toBe(95);
    expect(whoAmIScore(6, 0)).toBe(90);
    expect(whoAmIScore(8, 0)).toBe(80);
    expect(whoAmIScore(10, 0)).toBe(70);
    expect(WHO_AM_I_WRONG_GUESS_PENALTY).toBe(10);
    expect(whoAmIScore(4, 1)).toBe(85);
    expect(whoAmIScore(8, 2)).toBe(60);
  });

  it("uses one final natural guess and a 45-to-30 two-pick recovery", () => {
    expect(WHO_AM_I_FINAL_GUESS_COUNT).toBe(1);
    expect(WHO_AM_I_RESCUE_GUESS_COUNT).toBe(2);
    expect(WHO_AM_I_RESCUE_SCORE).toBe(45);
    expect(WHO_AM_I_RESCUE_SECOND_SCORE).toBe(30);
    expect(whoAmIRecoveryScore(0)).toBe(45);
    expect(whoAmIRecoveryScore(1)).toBe(30);
    expect(whoAmIRecoveryScore(2)).toBe(0);
  });

  it("excludes subjects that cannot support a complete ten-clue round", () => {
    const round = createWhoAmIRound({
      sport: "ufc",
      league: "UFC",
      candidates: [candidate("eligible"), candidate("thin", 8)],
    }, () => 0);

    expect(round.hiddenSubject.id).toBe("eligible");
    expect(round.subjects.map((subject) => subject.id)).toEqual(["eligible"]);
    expect(round.clues).toHaveLength(10);
  });

  it("excludes recently seen subjects without removing them from the guess universe", () => {
    const universe = {
      sport: "ufc" as const,
      league: "UFC" as const,
      candidates: [candidate("recent"), candidate("fresh")],
    };

    const round = createWhoAmIRound(universe, () => 0, new Set(["recent"]));

    expect(round.hiddenSubject.id).toBe("fresh");
    expect(round.subjects.map((subject) => subject.id)).toEqual(["recent", "fresh"]);
  });

  it("leans modern when modern and legacy subjects are both playable", () => {
    const universe = {
      sport: "ufc" as const,
      league: "UFC" as const,
      candidates: [
        candidate("modern", 10, { eraBand: "modern" }),
        candidate("legacy", 10, { eraBand: "legacy" }),
      ],
    };

    expect(createWhoAmIRound(universe, () => 0.74).hiddenSubject.id).toBe("modern");
    expect(createWhoAmIRound(universe, () => 0.75).hiddenSubject.id).toBe("legacy");
  });

  it("builds a five-name rescue board around similar era and role disguises", () => {
    const hidden = candidate("hidden", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" });
    const round = createWhoAmIRound({
      sport: "football",
      league: "NFL",
      candidates: [
        hidden,
        candidate("db-1", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("db-2", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("db-3", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("db-4", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("qb", 10, { eraBand: "modern", rescueGroup: "NFL:QB", kind: "player" }),
      ],
    }, () => 0);

    const choices = whoAmIRescueChoices(round, () => 0, new Set(["db-1"]));
    expect(WHO_AM_I_RESCUE_OPTION_COUNT).toBe(5);
    expect(choices).toHaveLength(WHO_AM_I_RESCUE_OPTION_COUNT);
    expect(choices.some((subject) => subject.id === round.hiddenSubject.id)).toBe(true);
    expect(choices.some((subject) => subject.id === "db-1")).toBe(false);
    expect(choices.every((subject) => subject.kind === "player")).toBe(true);
  });
});

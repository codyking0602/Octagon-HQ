import { describe, expect, it } from "vitest";
import {
  WHO_AM_I_FINAL_GUESS_COUNT,
  WHO_AM_I_RESCUE_OPTION_COUNT,
  WHO_AM_I_RESCUE_SCORE,
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

  it("uses the five-window score ladder and a lower-value rescue finish", () => {
    expect(whoAmIScore(2, 0)).toBe(100);
    expect(whoAmIScore(4, 0)).toBe(90);
    expect(whoAmIScore(6, 0)).toBe(80);
    expect(whoAmIScore(8, 0)).toBe(70);
    expect(whoAmIScore(10, 0)).toBe(60);
    expect(whoAmIScore(4, 1)).toBe(75);
    expect(whoAmIScore(10, 4)).toBe(0);
    expect(WHO_AM_I_FINAL_GUESS_COUNT).toBe(2);
    expect(WHO_AM_I_RESCUE_SCORE).toBe(30);
    expect(whoAmIRecoveryScore(0, 0)).toBe(30);
    expect(whoAmIRecoveryScore(1, 0)).toBe(15);
    expect(whoAmIRecoveryScore(0, 1)).toBe(30);
    expect(whoAmIRecoveryScore(2, 2)).toBe(30);
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

  it("keeps recovery worth less than the remaining natural final-guess path", () => {
    expect(whoAmIScore(10, 0)).toBe(60);
    expect(whoAmIScore(10, 1)).toBe(45);
    expect(whoAmIRecoveryScore(0, 0)).toBe(30);
    expect(whoAmIRecoveryScore(1, 1)).toBe(30);
  });

  it("builds the rescue board around similar era and role disguises", () => {
    const hidden = candidate("hidden", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" });
    const round = createWhoAmIRound({
      sport: "football",
      league: "NFL",
      candidates: [
        hidden,
        candidate("db-1", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("db-2", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("db-3", 10, { eraBand: "modern", rescueGroup: "NFL:DB", kind: "player" }),
        candidate("qb", 10, { eraBand: "modern", rescueGroup: "NFL:QB", kind: "player" }),
      ],
    }, () => 0);

    const choices = whoAmIRescueChoices(round, () => 0, new Set(["db-1"]));
    expect(choices).toHaveLength(WHO_AM_I_RESCUE_OPTION_COUNT);
    expect(choices.some((subject) => subject.id === round.hiddenSubject.id)).toBe(true);
    expect(choices.some((subject) => subject.id === "db-1")).toBe(false);
    expect(choices.every((subject) => subject.kind === "player")).toBe(true);
    expect(choices.filter((subject) => subject.id !== "qb").every((subject) => subject.rescueGroup === "NFL:DB")).toBe(true);
  });
});

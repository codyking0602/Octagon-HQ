import { describe, expect, it } from "vitest";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";
import {
  storedWhoAmIChallengeRound,
  whoAmIChallengeSetup,
} from "./whoAmIChallenge";

const subjects: readonly WhoAmISubject[] = [
  { id: "alpha", name: "Alpha Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "bravo", name: "Bravo Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "charlie", name: "Charlie Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "delta", name: "Delta Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
  { id: "echo", name: "Echo Fighter", kind: "fighter", eraBand: "modern", rescueGroup: "lightweight" },
];

function round(): WhoAmIRound {
  return {
    sport: "ufc",
    league: "UFC",
    subjects,
    hiddenSubject: subjects[0]!,
    clues: Array.from({ length: 10 }, (_value, index) => ({
      id: `clue-${index + 1}`,
      text: `Stored clue ${index + 1}`,
      band: index < 2 ? "broad" : index < 5 ? "helpful" : index < 8 ? "strong" : "giveaway",
      facet: index % 2 === 0 ? "accomplishments" : "career-path",
    })),
  };
}

describe("Who Am I profile challenge contract", () => {
  it("round-trips the exact hidden identity, clue order, and guess universe", () => {
    const source = round();
    const stored = whoAmIChallengeSetup(source);
    const restored = storedWhoAmIChallengeRound(stored, "ufc");

    expect(restored).not.toBeNull();
    expect(restored?.hiddenSubject).toEqual(source.hiddenSubject);
    expect(restored?.subjects).toEqual(source.subjects);
    expect(restored?.clues).toEqual(source.clues);
  });

  it("rejects a stored round for the wrong sport", () => {
    expect(storedWhoAmIChallengeRound(whoAmIChallengeSetup(round()), "football")).toBeNull();
  });

  it("rejects a challenge that does not preserve all ten clues", () => {
    const stored = whoAmIChallengeSetup(round()) as {
      version: string;
      round: { clues: unknown[] };
    };
    stored.round.clues.pop();
    expect(storedWhoAmIChallengeRound(stored as never, "ufc")).toBeNull();
  });
});

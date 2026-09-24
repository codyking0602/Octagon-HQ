import { describe, expect, it } from "vitest";
import { ufcWhoAmIAuthoredLaunchPool } from "../games/ufcWhoAmIAuthoredLaunchPool";
import { createUfcWhoAmIRound } from "../games/ufcWhoAmIAuthority";
import { createUfcWhoAmIAuthoredCasualRound } from "./ufcWhoAmIAuthoredCasual";
import {
  sharedWhoAmIRound,
  whoAmISharedChallengeUrl,
} from "./whoAmIChallenge";

describe("UFC authored Who Am I Casual", () => {
  it("serves one authored fighter with an exact ten-clue authored script", () => {
    const round = createUfcWhoAmIAuthoredCasualRound(() => 0);
    const identity = ufcWhoAmIAuthoredLaunchPool[0]!;
    const script = identity.scripts.A!;

    expect(round.sport).toBe("ufc");
    expect(round.league).toBe("UFC");
    expect(round.hiddenSubject.id).toBe(identity.subjectId);
    expect(round.clues).toHaveLength(10);
    expect(round.clues.map((clue) => clue.id)).toEqual(script.clues.map((clue) => clue.id));
    expect(round.clues.map((clue) => clue.text)).toEqual(script.clues.map((clue) => clue.text));
  });

  it("honors Casual recent-fighter exclusions and falls back only when the pool is exhausted", () => {
    const first = ufcWhoAmIAuthoredLaunchPool[0]!;
    const second = ufcWhoAmIAuthoredLaunchPool[1]!;

    const fresh = createUfcWhoAmIAuthoredCasualRound(
      () => 0,
      new Set([first.subjectId]),
    );
    expect(fresh.hiddenSubject.id).toBe(second.subjectId);

    const exhausted = createUfcWhoAmIAuthoredCasualRound(
      () => 0,
      new Set(ufcWhoAmIAuthoredLaunchPool.map((identity) => identity.subjectId)),
    );
    expect(exhausted.hiddenSubject.id).toBe(first.subjectId);
  });

  it("can use either authored script route for the same fighter", () => {
    const identity = ufcWhoAmIAuthoredLaunchPool[0]!;
    const a = createUfcWhoAmIAuthoredCasualRound(() => 0);
    let calls = 0;
    const b = createUfcWhoAmIAuthoredCasualRound(() => {
      calls += 1;
      return calls === 1 ? 0 : 0.999999;
    });

    expect(a.hiddenSubject.id).toBe(identity.subjectId);
    expect(b.hiddenSubject.id).toBe(identity.subjectId);
    expect(a.clues.map((clue) => clue.id)).toEqual(identity.scripts.A!.clues.map((clue) => clue.id));
    expect(b.clues.map((clue) => clue.id)).toEqual(identity.scripts.B!.clues.map((clue) => clue.id));
  });

  it("reconstructs a shared authored challenge as the exact same board", () => {
    const round = createUfcWhoAmIAuthoredCasualRound(() => 0);
    const url = whoAmISharedChallengeUrl(round, "https://octagon.example");
    const restored = sharedWhoAmIRound(new URL(url).searchParams, "ufc");

    expect(restored?.hiddenSubject.id).toBe(round.hiddenSubject.id);
    expect(restored?.clues).toEqual(round.clues);
  });

  it("selects expansion fighters normally and reconstructs their shared authored board", () => {
    const expansionIndex = 100;
    let calls = 0;
    const round = createUfcWhoAmIAuthoredCasualRound(() => {
      calls += 1;
      return calls === 1 ? (expansionIndex + 0.1) / ufcWhoAmIAuthoredLaunchPool.length : 0;
    });
    const identity = ufcWhoAmIAuthoredLaunchPool[expansionIndex]!;

    expect(identity.subjectId).toBe("ufc:jiri-prochazka");
    expect(round.hiddenSubject.id).toBe(identity.subjectId);
    expect(round.clues).toEqual(identity.scripts.A!.clues.map(({ id, text, band }) => ({ id, text, band })));

    const url = whoAmISharedChallengeUrl(round, "https://octagon.example");
    const restored = sharedWhoAmIRound(new URL(url).searchParams, "ufc");
    expect(restored?.hiddenSubject.id).toBe(round.hiddenSubject.id);
    expect(restored?.clues).toEqual(round.clues);
  });

  it("keeps legacy shared UFC boards reconstructable", () => {
    const round = createUfcWhoAmIRound(() => 0.5, new Set());
    const url = whoAmISharedChallengeUrl(round, "https://octagon.example");
    const restored = sharedWhoAmIRound(new URL(url).searchParams, "ufc");

    expect(restored?.hiddenSubject.id).toBe(round.hiddenSubject.id);
    expect(restored?.clues.map((clue) => clue.id)).toEqual(round.clues.map((clue) => clue.id));
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { footballWhoAmIAuthoredIdentities } from "../games/footballWhoAmIAuthoredScripts";
import { createFootballWhoAmIRound } from "../games/footballWhoAmIAuthority";
import {
  createFootballWhoAmIAuthoredCasualRound,
  rememberFootballWhoAmIAuthoredCasualRound,
} from "./footballWhoAmIAuthoredCasual";
import {
  sharedWhoAmIRound,
  whoAmISharedChallengeUrl,
} from "./whoAmIChallenge";

describe("Football authored Who Am I Casual", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("serves an authored Football identity with an exact ten-clue authored script", () => {
    const identity = footballWhoAmIAuthoredIdentities.find((row) => row.league === "NFL")!;
    const round = createFootballWhoAmIAuthoredCasualRound(() => 0);

    expect(round.sport).toBe("football");
    expect(round.league).toBe("NFL");
    expect(round.hiddenSubject.id).toBe(identity.subjectId);
    expect(round.clues).toHaveLength(10);
    expect(round.clues.map((clue) => clue.id)).toEqual(identity.scripts.A!.clues.map((clue) => clue.id));
    expect(round.clues.map((clue) => clue.text)).toEqual(identity.scripts.A!.clues.map((clue) => clue.text));
  });

  it("honors the existing per-league Casual recent-subject exclusions without requiring a full deck cycle", () => {
    const nfl = footballWhoAmIAuthoredIdentities.filter((row) => row.league === "NFL");
    const first = nfl[0]!;
    const second = nfl[1]!;

    const fresh = createFootballWhoAmIAuthoredCasualRound(
      () => 0,
      { NFL: new Set([first.subjectId]) },
    );
    expect(fresh.hiddenSubject.id).toBe(second.subjectId);

    const exhausted = createFootballWhoAmIAuthoredCasualRound(
      () => 0,
      { NFL: new Set(nfl.map((identity) => identity.subjectId)) },
    );
    expect(exhausted.hiddenSubject.id).toBe(first.subjectId);
  });

  it("alternates A then B then A for the same identity after each shown authored board", () => {
    const identity = footballWhoAmIAuthoredIdentities.find((row) => row.league === "NFL")!;

    const first = createFootballWhoAmIAuthoredCasualRound(() => 0);
    expect(first.hiddenSubject.id).toBe(identity.subjectId);
    expect(first.clues.map((clue) => clue.id)).toEqual(identity.scripts.A!.clues.map((clue) => clue.id));

    rememberFootballWhoAmIAuthoredCasualRound(first);
    const second = createFootballWhoAmIAuthoredCasualRound(() => 0);
    expect(second.hiddenSubject.id).toBe(identity.subjectId);
    expect(second.clues.map((clue) => clue.id)).toEqual(identity.scripts.B!.clues.map((clue) => clue.id));

    rememberFootballWhoAmIAuthoredCasualRound(second);
    const third = createFootballWhoAmIAuthoredCasualRound(() => 0);
    expect(third.hiddenSubject.id).toBe(identity.subjectId);
    expect(third.clues.map((clue) => clue.id)).toEqual(identity.scripts.A!.clues.map((clue) => clue.id));
  });

  it("reconstructs a shared authored Football challenge as the exact same board", () => {
    const round = createFootballWhoAmIAuthoredCasualRound(() => 0);
    const url = whoAmISharedChallengeUrl(round, "https://octagon.example");
    const restored = sharedWhoAmIRound(new URL(url).searchParams, "football");

    expect(restored?.hiddenSubject.id).toBe(round.hiddenSubject.id);
    expect(restored?.league).toBe(round.league);
    expect(restored?.clues).toEqual(round.clues);
  });

  it("keeps legacy shared Football boards reconstructable", () => {
    const round = createFootballWhoAmIRound(() => 0, {});
    const url = whoAmISharedChallengeUrl(round, "https://octagon.example");
    const restored = sharedWhoAmIRound(new URL(url).searchParams, "football");

    expect(restored?.hiddenSubject.id).toBe(round.hiddenSubject.id);
    expect(restored?.league).toBe(round.league);
    expect(restored?.clues.map((clue) => clue.id)).toEqual(round.clues.map((clue) => clue.id));
  });
});

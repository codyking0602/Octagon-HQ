import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  ChallengeResultDetails,
  challengeResultScoreLabel,
  challengeResultVerdict,
} from "./ChallengeResultDetails";
import {
  createPlayChallenge,
  submitChallengeResult,
  type PlayChallenge,
} from "./challengeModel";

function completedChallenge(): PlayChallenge {
  const challenge = createPlayChallenge({
    code: "HIT001",
    gameId: "hit-the-number",
    gameVersion: "hit-the-number-v1",
    gameTitle: "Hit the Number",
    summary: "UFC KO/TKO Wins · target 23 · pick 5",
    creatorId: "cody-profile",
    recipientId: "shane-profile",
    playUrl: "/play/hit-the-number?challenge=locked-seed&board=open-roster",
    setup: {
      seed: "locked-seed",
      boardType: "open-roster",
      publicSetup: {
        version: "hit-the-number-v1",
        statId: "ufc-ko-tko-wins",
        boardType: "open-roster",
        target: 23,
        pickCount: 5,
        filter: {},
        fighterIds: ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"],
      },
    },
    creatorResult: {
      status: "under",
      target: 23,
      total: 22,
      distance: 1,
      score: 96,
      selections: [
        { fighterId: "alpha", value: 7 },
        { fighterId: "bravo", value: 6 },
        { fighterId: "charlie", value: 4 },
        { fighterId: "delta", value: 3 },
        { fighterId: "echo", value: 2 },
      ],
    },
    now: new Date("2026-08-18T06:00:00Z"),
  });

  return submitChallengeResult(challenge, "shane-profile", {
    status: "perfect",
    target: 23,
    total: 23,
    distance: 0,
    score: 100,
    selections: [
      { fighterId: "alpha", value: 7 },
      { fighterId: "bravo", value: 6 },
      { fighterId: "charlie", value: 4 },
      { fighterId: "delta", value: 3 },
      { fighterId: "foxtrot", value: 3 },
    ],
  }, new Date("2026-08-18T06:05:00Z"));
}

function tiedNormalizedScoresChallenge(): PlayChallenge {
  const challenge = createPlayChallenge({
    code: "HIT032",
    gameId: "hit-the-number",
    gameVersion: "hit-the-number-v2",
    gameTitle: "Hit the Number",
    summary: "UFC Wins · target 32 · pick 5",
    creatorId: "shane-profile",
    recipientId: "cody-profile",
    playUrl: "/play/hit-the-number?challenge=locked-seed",
    setup: {
      seed: "locked-seed",
      publicSetup: {
        version: "hit-the-number-v2",
        statId: "ufc-wins",
        boardType: "random-pool",
        target: 32,
        pickCount: 5,
        filter: {},
        fighterIds: ["alpha", "bravo", "charlie", "delta", "echo", "foxtrot"],
      },
    },
    creatorResult: {
      status: "under",
      target: 32,
      total: 27,
      distance: 5,
      score: 75,
      selections: [{ fighterId: "alpha", value: 27 }],
    },
    now: new Date("2026-08-23T20:00:00Z"),
  });

  return submitChallengeResult(challenge, "cody-profile", {
    status: "under",
    target: 32,
    total: 24,
    distance: 8,
    score: 75,
    selections: [{ fighterId: "bravo", value: 24 }],
  }, new Date("2026-08-23T20:05:00Z"));
}

describe("Hit the Number challenge results", () => {
  afterEach(cleanup);

  it("uses final totals in the matchup scoreboard instead of DONE", () => {
    const challenge = completedChallenge();

    expect(challengeResultScoreLabel(challenge, challenge.creatorResult)).toBe("22");
    expect(challengeResultScoreLabel(challenge, challenge.responderResult)).toBe("23");
    expect(challengeResultVerdict(challenge, "Cody", "Shane")).toBe("Shane wins");
  });

  it("shows the target, distance, and every fighter contribution for both players", () => {
    const challenge = completedChallenge();
    render(
      <ChallengeResultDetails
        challenge={challenge}
        creatorName="Cody"
        responderName="Shane"
      />,
    );

    expect(screen.getByLabelText("Hit the Number target")).toHaveTextContent("TARGET23");
    expect(screen.getByLabelText("Hit the Number target")).toHaveTextContent("UFC KO/TKO WINS · PICK 5");
    expect(screen.getByText("1 AWAY · GAME SCORE 96/100")).toBeInTheDocument();
    expect(screen.getByText("EXACT HIT · GAME SCORE 100/100")).toBeInTheDocument();
    expect(screen.getByLabelText("Cody picks").children).toHaveLength(5);
    expect(screen.getByLabelText("Shane picks").children).toHaveLength(5);
    expect(screen.getAllByText("alpha")).toHaveLength(2);
    expect(screen.getAllByText("7")).toHaveLength(2);
  });

  it("uses raw Price Is Right outcomes when normalized game scores tie", () => {
    const challenge = tiedNormalizedScoresChallenge();

    expect(challengeResultVerdict(challenge, "Shane", "Cody")).toBe("Shane wins");

    render(
      <ChallengeResultDetails
        challenge={challenge}
        creatorName="Shane"
        responderName="Cody"
      />,
    );

    expect(screen.getByText("5 AWAY · GAME SCORE 75/100")).toBeInTheDocument();
    expect(screen.getByText("8 AWAY · GAME SCORE 75/100")).toBeInTheDocument();
  });
});

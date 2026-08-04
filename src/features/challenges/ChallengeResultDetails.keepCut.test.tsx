import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createKeepCutLineup } from "../play/keepCutEngine";
import {
  ChallengeResultDetails,
  challengeResultScoreLabel,
  challengeResultVerdict,
} from "./ChallengeResultDetails";
import type { PlayChallenge } from "./challengeModel";

function keepCutChallenge(): PlayChallenge {
  const lineup = createKeepCutLineup("all-careers", "challenge-result-proof");
  const lineupIds = lineup.fighters.map((fighter) => fighter.id);
  return {
    code: "KCUT1234",
    gameId: "keep-cut",
    gameVersion: "keep-cut-v2",
    gameTitle: "Keep 4, Cut 4",
    summary: "All UFC Careers · exact eight-fighter board",
    creatorId: "creator",
    recipientId: "responder",
    playUrl: "/play/keep-cut?match=KCUT1234",
    setup: { packId: "all-careers", lineupIds },
    creatorResult: {
      keptIds: lineupIds.slice(0, 4),
      cutIds: lineupIds.slice(4),
      score: 84,
      label: "Excellent keeps",
    },
    responderResult: {
      keptIds: [lineupIds[0]!, lineupIds[1]!, lineupIds[4]!, lineupIds[5]!],
      cutIds: [lineupIds[2]!, lineupIds[3]!, lineupIds[6]!, lineupIds[7]!],
      score: 61,
      label: "Tough cuts",
    },
    createdAt: "2026-08-04T00:00:00.000Z",
    openedAt: "2026-08-04T00:01:00.000Z",
    completedAt: "2026-08-04T00:02:00.000Z",
    declinedAt: null,
    expiresAt: "2026-09-03T00:00:00.000Z",
    hiddenFor: [],
  };
}

describe("Keep 4, Cut 4 challenge results", () => {
  it("compares private scores and resolves fighter names from stable lineup IDs", () => {
    const challenge = keepCutChallenge();
    expect(challengeResultVerdict(challenge, "Cody", "Shane")).toBe("Cody wins");
    expect(challengeResultScoreLabel(challenge, challenge.creatorResult)).toBe("84/100");
    expect(challengeResultScoreLabel(challenge, challenge.responderResult!)).toBe("61/100");

    const { container } = render(
      <ChallengeResultDetails challenge={challenge} creatorName="Cody" responderName="Shane" />,
    );
    const lineupIds = (challenge.setup as { lineupIds: string[] }).lineupIds;
    expect(container.querySelectorAll(".challenge-call-comparison > div")).toHaveLength(8);
    expect(container.textContent).not.toContain(lineupIds[0]);
    expect(container.textContent).toContain("KEEP");
    expect(container.textContent).toContain("CUT");
  });

  it("keeps historical eight-decision challenge results readable", () => {
    const current = keepCutChallenge();
    const lineupIds = (current.setup as { lineupIds: string[] }).lineupIds;
    const legacy: PlayChallenge = {
      ...current,
      setup: {
        lineup: lineupIds.map((id, index) => ({ id, name: `Legacy Fighter ${index + 1}` })),
      },
      creatorResult: { decisions: ["keep", "keep", "keep", "keep", "cut", "cut", "cut", "cut"] },
      responderResult: { decisions: ["keep", "keep", "cut", "cut", "keep", "keep", "cut", "cut"] },
    };
    expect(challengeResultVerdict(legacy, "Cody", "Shane")).toBe("4 of 8 calls matched");
    expect(challengeResultScoreLabel(legacy, legacy.creatorResult)).toBe("8/8");
    const { container } = render(
      <ChallengeResultDetails challenge={legacy} creatorName="Cody" responderName="Shane" />,
    );
    expect(container.textContent).toContain("Legacy Fighter 1");
  });
});

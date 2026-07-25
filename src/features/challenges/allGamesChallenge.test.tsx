import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ChallengeResultDetails } from "./ChallengeResultDetails";
import {
  challengeStatus,
  createPlayChallenge,
  dismissChallenge,
  submitChallengeResult,
  type ChallengeJson,
  type PlayChallenge,
} from "./challengeModel";
import { challengePlayRoute } from "./challengeRuntime";
import type { PlayGameId } from "../play/playRegistry";

function challenge(
  gameId: PlayGameId,
  playUrl: string,
  setup: ChallengeJson,
  creatorResult: ChallengeJson,
  responderResult: ChallengeJson,
): PlayChallenge {
  const created = createPlayChallenge({
    code: `${gameId.replace(/[^a-z]/g, "").slice(0, 6)}01`,
    gameId,
    gameVersion: `${gameId}-v2`,
    gameTitle: gameId,
    summary: `${gameId} matchup`,
    creatorId: "cody-profile",
    recipientId: "shane-profile",
    playUrl,
    setup,
    creatorResult,
    now: new Date("2026-07-24T12:00:00Z"),
  });
  return submitChallengeResult(created, "shane-profile", responderResult, new Date("2026-07-24T12:10:00Z"));
}

function renderDetails(row: PlayChallenge) {
  return render(
    <ChallengeResultDetails
      challenge={row}
      creatorName="Cody"
      responderName="Shane"
    />,
  );
}

describe("all-game challenge contracts", () => {
  afterEach(() => {
    cleanup();
  });

  it("preserves every existing exact-share query while adding the profile challenge code", () => {
    const rows = [
      challenge("find-leader", "https://example.test/play/find-leader?day=2026-07-24", {}, { score: 8 }, { score: 9 }),
      challenge("wavelength", "https://example.test/play/wavelength?challenge=wave-seed", {}, { score: 80 }, { score: 82 }),
      challenge("blind-resume", "https://example.test/play/blind-resume?challenge=resume-seed", {}, { score: 4 }, { score: 5 }),
      challenge("blind-rank", "https://example.test/play/blind-rank?pack=ufc-careers&lineup=a,b,c,d,e", {}, {}, {}),
      challenge("keep-cut", "https://example.test/play/keep-cut?pack=ufc-careers&lineup=a,b,c,d,e,f,g,h", {}, {}, {}),
      challenge("better-than", "https://example.test/play/better-than?target=a&lens=overall&pool=all&count=3&selections=b,c,d", {}, {}, {}),
    ];

    for (const row of rows) {
      const route = challengePlayRoute(row);
      const params = new URLSearchParams(route.split("?")[1]);
      const codeParam = row.gameId === "find-leader" ? "challenge" : "match";
      expect(route.startsWith(`/play/${row.gameId}`)).toBe(true);
      expect(params.get(codeParam)).toBe(row.code);
      expect(params.size).toBeGreaterThan(1);
    }
  });

  it("renders both players’ exact Wavelength paths", () => {
    const row = challenge(
      "wavelength",
      "/play/wavelength?challenge=wave-seed",
      { target: 75 },
      { score: 93, guesses: [50, 64, 70, 68], finalGuess: 68 },
      { score: 99, guesses: [55, 69, 74, 74], finalGuess: 74 },
    );
    renderDetails(row);
    expect(screen.getByLabelText("Cody guess path")).toHaveTextContent("50");
    expect(screen.getByLabelText("Shane guess path")).toHaveTextContent("74");
    expect(screen.getAllByText(/target 75/i)).toHaveLength(2);
  });

  it("renders every Blind Resume pick beside the model winner", () => {
    const rounds = [
      { fighterA: { id: "a", name: "Alpha" }, fighterB: { id: "b", name: "Bravo" }, winnerId: "a" },
      { fighterA: { id: "c", name: "Charlie" }, fighterB: { id: "d", name: "Delta" }, winnerId: "d" },
    ];
    const row = challenge(
      "blind-resume",
      "/play/blind-resume?challenge=resume-seed",
      { rounds },
      { score: 1, picks: [{ pickedId: "a" }, { pickedId: "c" }] },
      { score: 2, picks: [{ pickedId: "a" }, { pickedId: "d" }] },
    );
    renderDetails(row);
    expect(screen.getAllByText("Alpha")).toHaveLength(3);
    expect(screen.getAllByText("Delta").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("R2")).toBeInTheDocument();
  });

  it("renders exact Blind Rank slots and Keep/Cut calls", () => {
    const rankRow = challenge(
      "blind-rank",
      "/play/blind-rank?pack=ufc-careers&lineup=a,b,c,d,e",
      { lineup: [
        { id: "a", name: "Alpha" },
        { id: "b", name: "Bravo" },
        { id: "c", name: "Charlie" },
        { id: "d", name: "Delta" },
        { id: "e", name: "Echo" },
      ] },
      { placements: ["a", "b", "c", "d", "e"] },
      { placements: ["a", "c", "b", "d", "e"] },
    );
    const rankView = renderDetails(rankRow);
    expect(screen.getByText("#5")).toBeInTheDocument();
    expect(screen.getAllByText("Echo")).toHaveLength(2);
    rankView.unmount();

    const keepCutRow = challenge(
      "keep-cut",
      "/play/keep-cut?pack=ufc-careers&lineup=a,b",
      { lineup: [{ id: "a", name: "Alpha" }, { id: "b", name: "Bravo" }] },
      { decisions: ["keep", "cut"] },
      { decisions: ["cut", "cut"] },
    );
    renderDetails(keepCutRow);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getAllByText("CUT")).toHaveLength(3);
    expect(screen.getByText("KEEP")).toBeInTheDocument();
  });

  it("renders Better Than shared names and both unique lists", () => {
    const row = challenge(
      "better-than",
      "/play/better-than?target=x&lens=overall&pool=all&count=3&selections=a,b,c",
      {},
      { claimCount: 3, selections: [
        { id: "a", name: "Alpha" },
        { id: "b", name: "Bravo" },
        { id: "c", name: "Charlie" },
      ] },
      { claimCount: 3, selections: [
        { id: "b", name: "Bravo" },
        { id: "c", name: "Charlie" },
        { id: "d", name: "Delta" },
      ] },
    );
    renderDetails(row);
    expect(screen.getByText("SHARED NAMES")).toBeInTheDocument();
    expect(screen.getByText("CODY ONLY")).toBeInTheDocument();
    expect(screen.getByText("SHANE ONLY")).toBeInTheDocument();
    expect(screen.getAllByText("Bravo")).toHaveLength(1);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();
  });

  it("lets the recipient decline while preserving a declined state for the sender", () => {
    const row = createPlayChallenge({
      code: "IGNORE01",
      gameId: "find-leader",
      gameVersion: "find-leader-v2",
      gameTitle: "Find the Leader",
      summary: "Exact daily board",
      creatorId: "cody-profile",
      recipientId: "shane-profile",
      playUrl: "/play/find-leader?day=2026-07-24",
      setup: { day: "2026-07-24" },
      creatorResult: { score: 8 },
      now: new Date("2026-07-24T12:00:00Z"),
    });

    const ignored = dismissChallenge(row, "shane-profile", new Date("2026-07-24T12:05:00Z"));
    expect(ignored.declinedAt).toBe("2026-07-24T12:05:00.000Z");
    expect(ignored.hiddenFor).toEqual(["shane-profile"]);
    expect(challengeStatus(ignored, "cody-profile")).toBe("declined");
  });
});

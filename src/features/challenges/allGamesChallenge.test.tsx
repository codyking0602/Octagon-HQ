import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ChallengeCenter } from "./ChallengeCenter";
import { ChallengeProvider } from "./ChallengeProvider";
import { ChallengeResultDetails } from "./ChallengeResultDetails";
import {
  createPlayChallenge,
  submitChallengeResult,
  type ChallengeJson,
  type PlayChallenge,
} from "./challengeModel";
import {
  CHALLENGE_STORAGE_KEY,
  loadChallenges,
} from "./challengeRepository";
import { challengePlayRoute } from "./challengeRuntime";
import type { PlayGameId } from "../play/playRegistry";

const PROFILE_STORAGE_KEY = "octagon-hq:challenge-profile:v1";

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
    creatorId: "cody-preview",
    recipientId: "shane-preview",
    playUrl,
    setup,
    creatorResult,
    now: new Date("2026-07-24T12:00:00Z"),
  });
  return submitChallengeResult(created, "shane-preview", responderResult, new Date("2026-07-24T12:10:00Z"));
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
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("preserves every existing exact-share query while adding the profile match code", () => {
    const rows = [
      challenge("wavelength", "https://example.test/play/wavelength?challenge=wave-seed", {}, { score: 80 }, { score: 82 }),
      challenge("blind-resume", "https://example.test/play/blind-resume?challenge=resume-seed", {}, { score: 4 }, { score: 5 }),
      challenge("blind-rank", "https://example.test/play/blind-rank?pack=ufc-careers&lineup=a,b,c,d,e", {}, {}, {}),
      challenge("keep-cut", "https://example.test/play/keep-cut?pack=ufc-careers&lineup=a,b,c,d,e,f,g,h", {}, {}, {}),
      challenge("better-than", "https://example.test/play/better-than?target=a&lens=overall&pool=all&count=3&selections=b,c,d", {}, {}, {}),
    ];

    for (const row of rows) {
      const route = challengePlayRoute(row);
      const params = new URLSearchParams(route.split("?")[1]);
      expect(route.startsWith(`/play/${row.gameId}`)).toBe(true);
      expect(params.get("match")).toBe(row.code);
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
    expect(screen.getByText("Alpha")).toBeInTheDocument();
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

  it("lets the recipient ignore, shows Declined to the sender, then removes the row after both profiles clear it", () => {
    const row = createPlayChallenge({
      code: "IGNORE01",
      gameId: "find-leader",
      gameVersion: "find-leader-v2",
      gameTitle: "Find the Leader",
      summary: "Exact daily board",
      creatorId: "cody-preview",
      recipientId: "shane-preview",
      playUrl: "/play/find-leader?day=2026-07-24",
      setup: { day: "2026-07-24" },
      creatorResult: { score: 8 },
      now: new Date("2026-07-24T12:00:00Z"),
    });
    window.localStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify([row]));
    window.localStorage.setItem(PROFILE_STORAGE_KEY, "shane-preview");

    const recipientView = render(
      <ChallengeProvider>
        <MemoryRouter><ChallengeCenter /></MemoryRouter>
      </ChallengeProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "IGNORE Cody Find the Leader" }));
    expect(screen.getByText(/No challenges here yet/)).toBeInTheDocument();
    const ignored = loadChallenges(window.localStorage)[0]!;
    expect(ignored.declinedAt).not.toBeNull();
    expect(ignored.hiddenFor).toEqual(["shane-preview"]);
    recipientView.unmount();

    window.localStorage.setItem(PROFILE_STORAGE_KEY, "cody-preview");
    const senderView = render(
      <ChallengeProvider>
        <MemoryRouter><ChallengeCenter /></MemoryRouter>
      </ChallengeProvider>,
    );
    expect(screen.getByText("DECLINED")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REMOVE Shane Find the Leader" }));
    expect(screen.getByText(/No challenges here yet/)).toBeInTheDocument();
    expect(loadChallenges(window.localStorage)).toHaveLength(0);
    senderView.unmount();
  });
});
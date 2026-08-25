import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballFindLeaderPage, {
  footballFindLeaderCandidateAsset,
  footballFindLeaderRankLabel,
  footballFindLeaderReplayLabel,
} from "./FootballFindLeaderPage";
import {
  buildFootballFindLeaderBoard,
  footballFindLeaderQuestions,
  formatFootballFindLeaderValue,
} from "./footballFindLeaderModel";

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({
    beginChallenge: vi.fn().mockResolvedValue(""),
    activeProfile: null,
    profiles: [],
    getChallenge: () => null,
    markOpened: vi.fn(),
    submitResult: vi.fn(),
  }),
}));

function deterministicBoard() {
  const definition = footballFindLeaderQuestions.find((row) => row.id === "qb-passing-yards:standard")
    ?? footballFindLeaderQuestions[0]!;
  const seed = "football-find-leader-ui-parity";
  const board = buildFootballFindLeaderBoard(definition, seed);
  if (!board) throw new Error("Expected deterministic Football Find the Leader board.");
  return { board, definition, seed };
}

describe("Football Find the Leader UI parity", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("uses the UFC-style replay hero and three-part progress module", () => {
    const { definition, seed } = deterministicBoard();
    render(
      <MemoryRouter initialEntries={[`/football/find-leader?seed=${seed}&definition=${encodeURIComponent(definition.id)}`]}>
        <FootballFindLeaderPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("REPLAYABLE GAME")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW LINEUP" })).toBeInTheDocument();
    const progress = screen.getByLabelText("Find the Leader progress");
    expect(within(progress).getByText("ROUND")).toBeInTheDocument();
    expect(within(progress).getByText("STANDING")).toBeInTheDocument();
    expect(within(progress).getByText("SAFE")).toBeInTheDocument();
    expect(progress).toHaveTextContent("1");
    expect(progress).toHaveTextContent("10");
    expect(progress).toHaveTextContent("0/9");
  });

  it("uses canonical team marks for season/team subjects without assigning career players a misleading franchise logo", () => {
    const seasonAsset = footballFindLeaderCandidateAsset("nfl-qb-season", "peyton-manning-2013");
    expect(seasonAsset).toMatchObject({ kind: "team-mark", label: "Denver Broncos" });
    expect(seasonAsset?.src).toContain("/nfl/500/den.png");
    expect(footballFindLeaderCandidateAsset("nfl-qb-career", "peyton-manning")).toBeNull();
    expect(footballFindLeaderCandidateAsset("nfl-rb-career", "emmitt-smith")).toBeNull();
  });

  it("keeps safe eliminations visible and reveals their stat without repeating generic pool context", () => {
    const { board, definition, seed } = deterministicBoard();
    const safe = board.candidates.find((candidate) => candidate.id !== board.leaderId)!;
    render(
      <MemoryRouter initialEntries={[`/football/find-leader?seed=${seed}&definition=${encodeURIComponent(definition.id)}`]}>
        <FootballFindLeaderPage />
      </MemoryRouter>,
    );

    const safeButton = screen.getAllByRole("button").find((button) => button.textContent?.includes(safe.name));
    expect(safeButton).toBeDefined();
    expect(screen.getByText(/NFL QB CAREERS/)).toBeInTheDocument();
    expect(screen.queryByText(safe.subtitle)).not.toBeInTheDocument();

    fireEvent.click(safeButton!);

    const revealedSafeButton = screen.getAllByRole("button").find((button) => button.textContent?.includes(safe.name));
    expect(revealedSafeButton).toHaveClass("is-safe");
    expect(revealedSafeButton).toHaveTextContent("SAFE");
    expect(revealedSafeButton).toHaveTextContent(`${formatFootballFindLeaderValue(board, safe.value)} ${board.shortLabel}`);
  });

  it("names the fatal round when the leader is eliminated", () => {
    const { board, definition, seed } = deterministicBoard();
    const safe = board.candidates.find((candidate) => candidate.id !== board.leaderId)!;
    const leader = board.candidates.find((candidate) => candidate.id === board.leaderId)!;
    render(
      <MemoryRouter initialEntries={[`/football/find-leader?seed=${seed}&definition=${encodeURIComponent(definition.id)}`]}>
        <FootballFindLeaderPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button").find((button) => button.textContent?.includes(safe.name))!);
    fireEvent.click(screen.getAllByRole("button").find((button) => button.textContent?.includes(leader.name))!);

    expect(screen.getByText(`You eliminated the group leader, ${leader.name}, in Round 2.`)).toBeInTheDocument();
    expect(screen.getByText("20/100")).toBeInTheDocument();
  });

  it("uses competition ranks for tied reveal values", () => {
    const rows = [{ value: 100 }, { value: 90 }, { value: 90 }, { value: 80 }];
    expect(rows.map((_, index) => footballFindLeaderRankLabel(rows, index))).toEqual(["#1", "T-2", "T-2", "#4"]);
  });

  it("calls a replayable result what it actually does", () => {
    expect(footballFindLeaderReplayLabel("replayable")).toBe("NEW LINEUP");
    expect(footballFindLeaderReplayLabel("curated")).toBe("REPLAY CHALLENGE");
  });
});

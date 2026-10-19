import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NbaFindLeaderPage from "./NbaFindLeaderPage";
import * as model from "./nbaFindLeaderModel";

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
const board: model.NbaFindLeaderBoard = {
  version: model.NBA_FIND_LEADER_VERSION,
  definitionId: "season-2026:season-points",
  metricId: "season-points",
  family: "points",
  question: "Who averaged the most points per game in 2025–26?",
  context: "Highest PPG among the ten shown.",
  categoryLabel: "2025–26 NBA SEASON",
  statLabel: "2025–26 regular-season points per game",
  shortLabel: "PPG",
  leaderId: "leader",
  leaderValue: 30,
  candidates: Array.from({length: 10}, (_, index) => ({
    id: index === 0 ? "leader" : "decoy-" + index,
    name: (index === 0 ? "NBA Leader" : "NBA Decoy " + index) + " 2025–26",
    displayName: index === 0 ? "NBA Leader" : "NBA Decoy " + index,
    season: "2025–26",
    subtitle: "2025–26 regular season",
    value: 30 - index,
  })),
};
const identity = {
  gameId: model.NBA_FIND_LEADER_GAME_ID,
  type: "replayable" as const,
  scopeId: "casual",
  challengeId: "nba-find-leader:replay:test",
  seed: "test",
  replayBehavior: "new-lineup" as const,
};
describe("NBA Find the Leader Football presentation parity", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    vi.spyOn(model, "createNbaFindLeaderRun").mockReturnValue({board, identity});
  });
  it("renders ten Football elimination cards with NBA headshots or fallback marks", () => {
    render(<MemoryRouter><NbaFindLeaderPage /></MemoryRouter>);
    expect(screen.getByText("2025–26 NBA SEASON")).toBeInTheDocument();
    expect(screen.getAllByText("ELIMINATE")).toHaveLength(10);
    expect(screen.getAllByText("2025–26")).toHaveLength(10);
    expect(screen.getByLabelText("Find the Leader progress")).toHaveTextContent("10");
  });
  it("ends on an eliminated leader and reveals sorted per-game stats and seasons", () => {
    render(<MemoryRouter><NbaFindLeaderPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", {name: /NBA Leader/i}));
    expect(screen.getByRole("heading", {name: "10/100"})).toBeInTheDocument();
    expect(screen.getByText("FULL STAT REVEAL")).toBeInTheDocument();
    expect(screen.getAllByText(/2025–26/).length).toBeGreaterThan(2);
  });
  it("keeps the Football nine-safe perfect score unchanged", () => {
    render(<MemoryRouter><NbaFindLeaderPage /></MemoryRouter>);
    for (let i = 1; i < 10; i += 1) {
      fireEvent.click(screen.getByRole("button", {name: new RegExp("NBA Decoy " + i)}));
    }
    expect(screen.getByRole("heading", {name: "100/100"})).toBeInTheDocument();
    expect(screen.getByText("PERFECT RUN")).toBeInTheDocument();
    const reveal = screen.getByText("FULL STAT REVEAL").closest("section")!;
    expect(within(reveal).getAllByText(/^30.0$/).length).toBeGreaterThanOrEqual(1);
  });
  it("labels owner daily preview as unofficial, with no challenge call to action", () => {
    vi.spyOn(model, "createNbaFindLeaderDailyPreviewRun").mockReturnValue({
      board, identity: {...identity, type: "daily", scopeId: "owner-preview", replayBehavior: "same-daily-lineup"},
    });
    render(<MemoryRouter><NbaFindLeaderPage dailyPreview /></MemoryRouter>);
    expect(screen.getByText(/OWNER DAILY PREVIEW/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: /NBA Leader/i}));
    expect(screen.queryByRole("button", {name: "CHALLENGE SOMEONE"})).not.toBeInTheDocument();
    expect(screen.getByRole("button", {name: "REPLAY PREVIEW"})).toBeInTheDocument();
  });
});

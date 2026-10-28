import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FootballFindLeaderPage from "./FootballFindLeaderPage";
import * as model from "./footballFindLeaderModel";

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

const board: model.FootballFindLeaderBoard = {
  version: model.FOOTBALL_FIND_LEADER_VERSION,
  definitionId: "qb-passing-yards:standard",
  metricId: "qb-passing-yards",
  domainId: "nfl-qb-career",
  family: "qb-volume",
  question: "Who has the most career passing yards?",
  context: "Highest career passing yards among the ten shown. The overall record holder does not have to appear.",
  statLabel: "career passing yards",
  shortLabel: "PASS YARDS",
  direction: "higher",
  leaderId: "leader",
  leaderValue: 70000,
  candidates: Array.from({ length: 10 }, (_, index) => ({
    id: index === 0 ? "leader" : `decoy-${index}`,
    name: index === 0 ? "Hidden Leader" : `Decoy ${index}`,
    subtitle: "Retired NFL quarterback",
    value: 70000 - index * 1000,
  })),
};

const identity = {
  gameId: model.FOOTBALL_FIND_LEADER_GAME_ID,
  type: "replayable" as const,
  scopeId: "default",
  challengeId: "football-find-leader:replay:test",
  seed: "test",
  replayBehavior: "new-lineup" as const,
};

function mockBoard(nextBoard: model.FootballFindLeaderBoard) {
  vi.spyOn(model, "createFootballFindLeaderRun").mockReturnValue({ board: nextBoard, identity });
}

describe("Football Find the Leader page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    mockBoard(board);
  });

  it("shows the pool once instead of repeating the same descriptor on every candidate", () => {
    render(<MemoryRouter><FootballFindLeaderPage /></MemoryRouter>);
    expect(screen.getByText(/NFL QB CAREERS/)).toBeInTheDocument();
    expect(screen.queryByText("Retired NFL quarterback")).not.toBeInTheDocument();
    expect(screen.getAllByText("ELIMINATE")).toHaveLength(10);
  });

  it.each([
    ["nfl-qb-career", "NFL QB CAREERS"],
    ["nfl-rb-career", "NFL RB CAREERS"],
    ["cfb-champion-season", "CFB CHAMPION SEASONS"],
    ["cfb-player-receiving", "CFB RECEIVING SEASONS"],
    ["cfb-coach-career", "CFB COACH CAREERS"],
  ] as const)("uses concise category copy for %s boards", (domainId, expectedLabel) => {
    mockBoard({ ...board, domainId });
    render(<MemoryRouter><FootballFindLeaderPage /></MemoryRouter>);
    expect(screen.getByText(new RegExp(expectedLabel))).toBeInTheDocument();
  });

  it("ends immediately when the hidden leader is eliminated and reveals the full table without descriptor noise", () => {
    render(<MemoryRouter><FootballFindLeaderPage /></MemoryRouter>);
    expect(within(screen.getByLabelText("Find the Leader progress")).getByText("10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Hidden Leader/i }));
    expect(screen.getByText("RUN ENDED")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "10/100" })).toBeInTheDocument();
    expect(screen.getByText("FULL STAT REVEAL")).toBeInTheDocument();
    expect(screen.queryByText("Retired NFL quarterback")).not.toBeInTheDocument();
  });

  it("awards a perfect run after all nine decoys are eliminated", () => {
    render(<MemoryRouter><FootballFindLeaderPage /></MemoryRouter>);
    for (let index = 1; index < 10; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`Decoy ${index}`) }));
    }
    expect(screen.getByText("PERFECT RUN")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "100/100" })).toBeInTheDocument();
    expect(screen.getByText(/left Hidden Leader standing/)).toBeInTheDocument();
  });

  it("reveals lower-is-better boards from the smallest value upward", () => {
    mockBoard({
      ...board,
      direction: "lower",
      leaderValue: 1,
      candidates: board.candidates.map((candidate, index) => ({ ...candidate, value: index + 1 })),
    });
    render(<MemoryRouter><FootballFindLeaderPage /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: /Hidden Leader/i }));
    const reveal = screen.getByText("FULL STAT REVEAL").closest("section")!;
    const rows = within(reveal).getAllByText(/^#\d+$/);
    expect(rows[0]).toHaveTextContent("#1");
  });
});

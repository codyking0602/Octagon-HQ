import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FootballFindLeaderPage from "./FootballFindLeaderPage";
import * as model from "./footballFindLeaderModel";

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
  leaderId: "leader",
  leaderValue: 70000,
  candidates: Array.from({ length: 10 }, (_, index) => ({
    id: index === 0 ? "leader" : `decoy-${index}`,
    name: index === 0 ? "Hidden Leader" : `Decoy ${index}`,
    subtitle: "NFL QB",
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

describe("Football Find the Leader page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(model, "createFootballFindLeaderRun").mockReturnValue({ board, identity });
  });

  it("ends immediately when the hidden leader is eliminated and reveals the full table", () => {
    render(<MemoryRouter><FootballFindLeaderPage /></MemoryRouter>);
    expect(screen.getByText("10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Hidden Leader/i }));
    expect(screen.getByText("RUN ENDED")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "10/100" })).toBeInTheDocument();
    expect(screen.getByText("FULL STAT REVEAL")).toBeInTheDocument();
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
});

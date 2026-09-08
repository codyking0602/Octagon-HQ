import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { PickHistory } from "./picksModel";
import FootballPicksPage from "./FootballPicksPage";

const history: PickHistory = {
  season: 2026,
  summary: {
    correct: 7,
    incorrect: 3,
    missing: 0,
    excluded: 0,
    eventsEntered: 1,
    basePoints: 7,
    lockBonus: 2,
    totalPoints: 9,
  },
  seasonStandings: [{
    rank: 1,
    profileId: "11111111-1111-1111-1111-111111111111",
    displayName: "Cody",
    isCurrentUser: true,
    eventsEntered: 1,
    correct: 7,
    incorrect: 3,
    missing: 0,
    excluded: 0,
    basePoints: 7,
    lockBonus: 2,
    totalPoints: 9,
    adjustedPoints: 9,
  }],
  events: [{
    eventId: "football-week-1",
    name: "Football Week 1",
    subtitle: "NFL + CFB",
    venue: "Multiple venues",
    location: "Nationwide",
    startsAt: "2026-09-03T00:00:00Z",
    season: 2026,
    completedAt: "2026-09-08T05:00:00Z",
    record: { correct: 7, incorrect: 3, missing: 0, excluded: 0, basePoints: 7, lockBonus: 2, totalPoints: 9 },
    underdogLock: null,
    bouts: [],
    groupResults: [{
      rank: 1,
      profileId: "11111111-1111-1111-1111-111111111111",
      displayName: "Cody",
      isCurrentUser: true,
      correct: 7,
      incorrect: 3,
      missing: 0,
      excluded: 0,
      basePoints: 7,
      lockBonus: 2,
      totalPoints: 9,
    }],
  }],
};

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ profile: { id: "11111111-1111-1111-1111-111111111111" }, openDialog: vi.fn() }),
}));

vi.mock("./PicksProvider", () => ({
  usePicks: () => ({
    event: null,
    history,
    loading: false,
    error: null,
    selections: {},
    footballLocks: {},
    footballFutures: null,
    savingBoutId: null,
  }),
}));

describe("FootballPicksPage closed slate", () => {
  it("keeps season standings and week history available without an active slate", () => {
    render(
      <MemoryRouter initialEntries={["/football/picks"]}>
        <FootballPicksPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("This week’s slate is being set.")).toBeInTheDocument();
    expect(screen.getByText("2026 FOOTBALL SEASON")).toBeInTheDocument();
    expect(screen.getByText("7-3 · 70.0% WIN · 9 PTS")).toBeInTheDocument();

    fireEvent.click(screen.getByText("STANDINGS & WEEKS"));
    expect(screen.getByText("Season leaderboard")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "WEEKS" }));
    expect(screen.getByText("Football Week 1 Recap")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OPEN WEEK RECAP" })).toBeInTheDocument();
  });
});
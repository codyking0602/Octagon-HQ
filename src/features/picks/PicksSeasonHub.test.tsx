import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { PickHistory } from "./picksModel";
import { PicksSeasonHub } from "./PicksSeasonHub";

const history: PickHistory = {
  season: 2026,
  summary: {
    correct: 12,
    incorrect: 5,
    missing: 0,
    excluded: 1,
    eventsEntered: 3,
    basePoints: 48,
    lockBonus: 0,
    totalPoints: 48,
  },
  seasonStandings: [
    {
      rank: 1,
      profileId: "11111111-1111-1111-1111-111111111111",
      displayName: "Cody",
      correct: 12,
      incorrect: 5,
      missing: 0,
      excluded: 1,
      eventsEntered: 3,
      basePoints: 48,
      lockBonus: 0,
      totalPoints: 48,
      isCurrentUser: true,
    },
    {
      rank: 1,
      profileId: "22222222-2222-2222-2222-222222222222",
      displayName: "Shane",
      correct: 11,
      incorrect: 6,
      missing: 0,
      excluded: 1,
      eventsEntered: 3,
      basePoints: 44,
      lockBonus: 4,
      totalPoints: 48,
      isCurrentUser: false,
    },
    {
      rank: 3,
      profileId: "33333333-3333-3333-3333-333333333333",
      displayName: "Ashley",
      correct: 10,
      incorrect: 7,
      missing: 0,
      excluded: 1,
      eventsEntered: 3,
      basePoints: 40,
      lockBonus: 2,
      totalPoints: 42,
      isCurrentUser: false,
    },
    {
      rank: 4,
      profileId: "44444444-4444-4444-4444-444444444444",
      displayName: "Michael",
      correct: 9,
      incorrect: 7,
      missing: 1,
      excluded: 1,
      eventsEntered: 3,
      basePoints: 36,
      lockBonus: 0,
      totalPoints: 36,
      isCurrentUser: false,
    },
  ],
  events: [
    {
      eventId: "ufc-fight-night-test",
      name: "UFC Fight Night",
      subtitle: "Ankalaev vs. Guskov",
      venue: "Test Arena",
      location: "Dallas, Texas",
      startsAt: "2026-07-27T00:00:00Z",
      season: 2026,
      completedAt: "2026-07-27T05:00:00Z",
      record: {
        correct: 3,
        incorrect: 2,
        missing: 0,
        excluded: 1,
        basePoints: 12,
        lockBonus: 0,
        totalPoints: 12,
      },
      underdogLock: null,
      bouts: [],
      groupResults: [],
    },
  ],
};

describe("PicksSeasonHub", () => {
  it("starts compact and summarizes the current member with win percentage", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    expect(screen.getByText("2026 SEASON")).toBeInTheDocument();
    expect(screen.getByText("T-1 OF 4")).toBeInTheDocument();
    expect(screen.getByText("12-5 · 70.6% WIN · 48 PTS")).toBeInTheDocument();
    expect(screen.getByText("STANDINGS & EVENTS").closest("details")).not.toHaveAttribute("open");
  });

  it("opens to a fluid standings table and keeps tied point totals tied", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    fireEvent.click(screen.getByText("STANDINGS & EVENTS"));

    expect(screen.getByText("Season leaderboard")).toBeInTheDocument();
    expect(screen.getByText("4 PLAYERS · 1 EVENTS")).toBeInTheDocument();
    expect(screen.getByText("Cody")).toBeInTheDocument();
    expect(screen.getByText("Shane")).toBeInTheDocument();
    expect(screen.getAllByText("T-1")).toHaveLength(2);
    expect(screen.getByText("9-7 · 56.3% WIN · 1 MISSED")).toBeInTheDocument();
  });

  it("switches to the expandable completed-event archive", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    fireEvent.click(screen.getByText("STANDINGS & EVENTS"));
    fireEvent.click(screen.getByRole("tab", { name: "EVENTS" }));

    expect(screen.getByText("1 COMPLETED EVENT")).toBeInTheDocument();
    expect(screen.getByText("UFC Fight Night Recap")).toBeInTheDocument();
    expect(screen.getByText("Ankalaev vs. Guskov")).toBeInTheDocument();
  });
});

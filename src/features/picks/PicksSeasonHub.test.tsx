import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { PickHistory, PickHistoryEvent } from "./picksModel";
import { PicksSeasonHub } from "./PicksSeasonHub";

function completedEvent(
  eventId: string,
  name: string,
  subtitle: string,
  completedAt: string,
): PickHistoryEvent {
  return {
    eventId,
    name,
    subtitle,
    venue: "Test Arena",
    location: "Dallas, Texas",
    startsAt: completedAt,
    season: 2026,
    completedAt,
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
  };
}

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
      eventsEntered: 2,
      basePoints: 36,
      lockBonus: 0,
      totalPoints: 36,
      isCurrentUser: false,
    },
  ],
  events: [
    completedEvent("ufc-330", "UFC 330", "Makhachev vs. Garry", "2026-08-15T05:00:00Z"),
    completedEvent("ufc-fight-night-paris", "UFC Fight Night: Paris", "Fighter A vs. Fighter B", "2026-08-08T05:00:00Z"),
    completedEvent("ufc-fight-night-test", "UFC Fight Night", "Ankalaev vs. Guskov", "2026-07-27T05:00:00Z"),
  ],
};

describe("PicksSeasonHub with unified Championship", () => {
  it("keeps the completed-events archive but removes the duplicate season leaderboard", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);
    expect(screen.getByText("2026 SEASON")).toBeInTheDocument();
    expect(screen.getByText("Picks Results Archive")).toBeInTheDocument();
    expect(screen.getByText("12-5 · 70.6% WIN · 48 PTS")).toBeInTheDocument();
    expect(screen.getByText("FINISHED EVENTS").closest("details")).not.toHaveAttribute("open");
    expect(screen.queryByText("Season leaderboard")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("FINISHED EVENTS"));
    expect(screen.getByRole("link", { name: "Open Picks Championship leaderboard" }))
      .toHaveAttribute("href", "/championship/ufc?tab=picks");
    expect(screen.getByText("3 COMPLETED EVENTS")).toBeInTheDocument();
  });

  it("keeps all UFC event recaps accessible", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);
    fireEvent.click(screen.getByText("FINISHED EVENTS"));
    expect(screen.getAllByRole("button", { name: "OPEN FULL RECAP" })).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("button", { name: "OPEN FULL RECAP" })[1]);
    expect(screen.getByRole("dialog", { name: "UFC Fight Night: Paris Recap" })).toBeInTheDocument();
  });

  it("keeps the Football week archive and directs season standings to Championship", () => {
    const footballEvent = {
      ...completedEvent("football-week-1", "Football Week 1", "NFL + CFB", "2026-09-07T05:00:00Z"),
      groupResults: [{ rank: 1, profileId: "cody", displayName: "Cody", correct: 7, incorrect: 2, missing: 0, excluded: 0, basePoints: 7.5, lockBonus: 4, totalPoints: 11.5, isCurrentUser: true }],
    };
    render(<MemoryRouter initialEntries={["/football/picks"]}>
      <PicksSeasonHub history={{ ...history, events: [footballEvent] }} loading={false} sport="football" />
    </MemoryRouter>);
    fireEvent.click(screen.getByText("FINISHED EVENTS"));
    expect(screen.getByRole("link", { name: "Open Picks Championship leaderboard" }))
      .toHaveAttribute("href", "/championship/football?tab=picks");
    expect(screen.getByText("WEEK 1 · FINAL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OPEN WEEK RECAP" })).toHaveTextContent("VIEW WEEK RECAP");
  });

  it("deep links directly to a completed Football week recap", () => {
    const footballHistory: PickHistory = {
      ...history,
      events: [
        completedEvent("football-week-2", "Football Week 2", "NFL + CFB", "2026-09-14T05:00:00Z"),
        completedEvent("football-week-1", "Football Week 1", "NFL + CFB", "2026-09-07T05:00:00Z"),
      ],
    };
    render(<MemoryRouter initialEntries={["/football/picks?event=football-week-1&view=recap"]}>
      <PicksSeasonHub history={footballHistory} loading={false} sport="football" />
    </MemoryRouter>);
    expect(screen.getByRole("dialog", { name: "Football Week 1 Week Recap" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Football Week 2 Week Recap" })).not.toBeInTheDocument();
  });
});

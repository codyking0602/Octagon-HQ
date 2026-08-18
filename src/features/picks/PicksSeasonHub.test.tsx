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

describe("PicksSeasonHub", () => {
  it("starts compact and summarizes the current member with win percentage", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    expect(screen.getByText("2026 SEASON")).toBeInTheDocument();
    expect(screen.getByText("T-1 OF 4")).toBeInTheDocument();
    expect(screen.getByText("12-5 · 70.6% WIN · 48 PTS")).toBeInTheDocument();
    expect(screen.getByText("STANDINGS & EVENTS").closest("details")).not.toHaveAttribute("open");
  });

  it("presents standings as a competitive race without changing the canonical point totals", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    fireEvent.click(screen.getByText("STANDINGS & EVENTS"));

    expect(screen.getByText("Season leaderboard")).toBeInTheDocument();
    expect(screen.getByText("4 PLAYERS · 3 EVENTS")).toBeInTheDocument();
    expect(screen.getAllByText("T-1")).toHaveLength(2);

    const codyRow = screen.getByText("Cody").closest("article");
    const shaneRow = screen.getByText("Shane").closest("article");
    const ashleyRow = screen.getByText("Ashley").closest("article");
    const michaelRow = screen.getByText("Michael").closest("article");

    expect(codyRow).toHaveClass("is-leader", "is-current-user");
    expect(codyRow).toHaveTextContent("YOU");
    expect(codyRow).toHaveTextContent("48 PTS");
    expect(codyRow).toHaveTextContent("LEADER");
    expect(shaneRow).toHaveClass("is-leader");
    expect(shaneRow).toHaveTextContent("+4 LOCK");
    expect(ashleyRow).toHaveClass("is-third");
    expect(ashleyRow).toHaveTextContent("6 PTS BACK");
    expect(ashleyRow?.querySelector(".picks-season-standing__progress > span")).toHaveStyle("width: 88%");
    expect(michaelRow).toHaveTextContent("9-7 · 56.3% WIN · 1 MISSED");
    expect(michaelRow).toHaveTextContent("12 PTS BACK");
    expect(michaelRow).toHaveTextContent("2/3 EVENTS · 1 EVENT MISSED");
  });

  it("keeps the rich event recap available for every completed event", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    fireEvent.click(screen.getByText("STANDINGS & EVENTS"));
    fireEvent.click(screen.getByRole("tab", { name: "EVENTS" }));

    expect(screen.getByText("3 COMPLETED EVENTS")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "OPEN FULL RECAP" })).toHaveLength(3);

    fireEvent.click(screen.getAllByRole("button", { name: "OPEN FULL RECAP" })[1]);
    expect(screen.getByRole("dialog", { name: "UFC Fight Night: Paris Recap" })).toBeInTheDocument();
  });
});

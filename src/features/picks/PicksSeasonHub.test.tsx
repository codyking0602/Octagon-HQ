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

  it("presents UFC standings unchanged with their canonical ranks and totals", () => {
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
    expect(codyRow).toHaveTextContent("48 PTS");
    expect(shaneRow).toHaveClass("is-leader");
    expect(shaneRow).toHaveTextContent("+4 LOCK");
    expect(ashleyRow).toHaveClass("is-third");
    expect(ashleyRow).toHaveTextContent("6 PTS BACK");
    expect(ashleyRow?.querySelector(".picks-season-standing__progress > span")).toHaveStyle("width: 88%");
    expect(michaelRow).toHaveTextContent("12 PTS BACK");
  });

  it("keeps the rich UFC event recap available for every completed event", () => {
    render(<MemoryRouter><PicksSeasonHub history={history} loading={false} /></MemoryRouter>);

    fireEvent.click(screen.getByText("STANDINGS & EVENTS"));
    fireEvent.click(screen.getByRole("tab", { name: "EVENTS" }));

    expect(screen.getByText("3 COMPLETED EVENTS")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "OPEN FULL RECAP" })).toHaveLength(3);

    fireEvent.click(screen.getAllByRole("button", { name: "OPEN FULL RECAP" })[1]);
    expect(screen.getByRole("dialog", { name: "UFC Fight Night: Paris Recap" })).toBeInTheDocument();
  });

  it("ranks Football by canonical accumulated points instead of zeroed drop-adjusted Week 1 values", () => {
    const footballHistory: PickHistory = {
      season: 2026,
      summary: {
        correct: 7,
        incorrect: 2,
        missing: 0,
        excluded: 0,
        eventsEntered: 1,
        basePoints: 7.5,
        lockBonus: 4,
        totalPoints: 11.5,
      },
      seasonStandings: [
        { rank: 1, profileId: "cody", displayName: "Cody", correct: 7, incorrect: 2, missing: 0, excluded: 0, eventsEntered: 1, basePoints: 7.5, lockBonus: 4, totalPoints: 11.5, adjustedPoints: 0, isCurrentUser: true },
        { rank: 1, profileId: "tyler", displayName: "Tyler", correct: 6, incorrect: 3, missing: 0, excluded: 0, eventsEntered: 1, basePoints: 7.5, lockBonus: 0, totalPoints: 7.5, adjustedPoints: 0, isCurrentUser: false },
        { rank: 1, profileId: "shane", displayName: "Shane", correct: 4, incorrect: 5, missing: 0, excluded: 0, eventsEntered: 1, basePoints: 3.5, lockBonus: 0, totalPoints: 3.5, adjustedPoints: 0, isCurrentUser: false },
        { rank: 1, profileId: "troy", displayName: "Troy", correct: 2, incorrect: 7, missing: 0, excluded: 0, eventsEntered: 1, basePoints: 1.5, lockBonus: 0, totalPoints: 1.5, adjustedPoints: 0, isCurrentUser: false },
      ],
      events: [completedEvent("football-week-1", "Football Week 1", "NFL + CFB", "2026-09-07T05:00:00Z")],
    };

    render(
      <MemoryRouter initialEntries={["/football/picks"]}>
        <PicksSeasonHub history={footballHistory} loading={false} sport="football" />
      </MemoryRouter>,
    );

    expect(screen.getByText("1 OF 4")).toBeInTheDocument();
    expect(screen.getByText("7-2 ATS · 77.8% WIN · 11.5 PTS")).toBeInTheDocument();
    fireEvent.click(screen.getByText("STANDINGS & WEEKS"));

    const codyRow = screen.getByText("Cody").closest("article");
    const tylerRow = screen.getByText("Tyler").closest("article");
    const shaneRow = screen.getByText("Shane").closest("article");
    const troyRow = screen.getByText("Troy").closest("article");
    expect(codyRow).toHaveClass("is-leader");
    expect(codyRow).toHaveTextContent("11.5 PTS");
    expect(tylerRow).not.toHaveClass("is-leader");
    expect(tylerRow).toHaveTextContent("7.5 PTS");
    expect(shaneRow).toHaveTextContent("3.5 PTS");
    expect(troyRow).toHaveTextContent("1.5 PTS");
    expect(screen.getAllByText("LEADER")).toHaveLength(1);
  });

  it("uses compact completed-week archive cards", () => {
    const footballEvent = {
      ...completedEvent("football-week-1", "Football Week 1", "NFL + CFB", "2026-09-07T05:00:00Z"),
      groupResults: [{ rank: 1, profileId: "cody", displayName: "Cody", correct: 7, incorrect: 2, missing: 0, excluded: 0, basePoints: 7.5, lockBonus: 4, totalPoints: 11.5, isCurrentUser: true }],
    };
    const footballHistory: PickHistory = { ...history, events: [footballEvent] };

    render(
      <MemoryRouter initialEntries={["/football/picks"]}>
        <PicksSeasonHub history={footballHistory} loading={false} sport="football" />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText("STANDINGS & WEEKS"));
    fireEvent.click(screen.getByRole("tab", { name: "WEEKS" }));
    expect(screen.getByText("WEEK 1 · FINAL")).toBeInTheDocument();
    expect(screen.getByText("WEEK CHAMPION · 11.5 PTS · ROOM 77% ATS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "OPEN WEEK RECAP" })).toHaveTextContent("VIEW WEEK RECAP");
  });

  it("opens the specifically requested archived football week recap", () => {
    const footballHistory: PickHistory = {
      ...history,
      events: [
        completedEvent("football-week-2", "Football Week 2", "NFL + CFB", "2026-09-14T05:00:00Z"),
        completedEvent("football-week-1", "Football Week 1", "NFL + CFB", "2026-09-07T05:00:00Z"),
      ],
    };

    render(
      <MemoryRouter initialEntries={["/football/picks?event=football-week-1&view=recap"]}>
        <PicksSeasonHub history={footballHistory} loading={false} sport="football" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("dialog", { name: "Football Week 1 Week Recap" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Football Week 2 Week Recap" })).not.toBeInTheDocument();
  });
});

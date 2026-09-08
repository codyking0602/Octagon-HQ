import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { canonicalDestinationPath } from "../../app/canonicalDestinations";
import { PicksSeasonHub } from "./PicksSeasonHub";
import type { PickHistory } from "./picksModel";

vi.mock("./LatestEventRecap", () => ({
  LatestEventRecap: ({ event, requestedOpen = false }: { event: { name: string }; requestedOpen?: boolean }) => (
    <div>{event.name} UFC RECAP {requestedOpen ? "OPEN" : "CLOSED"}</div>
  ),
}));

vi.mock("./FootballWeekRecap", () => ({
  FootballWeekRecap: ({ event, requestedOpen = false }: { event: { name: string }; requestedOpen?: boolean }) => (
    <div>{event.name} FOOTBALL RECAP {requestedOpen ? "OPEN" : "CLOSED"}</div>
  ),
}));

const history: PickHistory = {
  season: 2026,
  summary: {
    correct: 7,
    incorrect: 3,
    missing: 0,
    excluded: 0,
    basePoints: 7,
    lockBonus: 3,
    totalPoints: 10,
    eventsEntered: 1,
  },
  seasonStandings: [
    {
      rank: 1,
      profileId: "me",
      displayName: "Cody",
      isCurrentUser: true,
      eventsEntered: 1,
      correct: 7,
      incorrect: 3,
      missing: 0,
      excluded: 0,
      basePoints: 7,
      lockBonus: 3,
      totalPoints: 10,
      adjustedPoints: 8,
      pushes: 0,
      droppedWeekLabel: "Week 1 · 2 pts",
    },
  ],
  events: [
    {
      eventId: "football-week-1",
      name: "Football Week 1",
      subtitle: "NFL + CFB",
      venue: "Multiple venues",
      location: "Nationwide",
      startsAt: "2026-09-03T00:00:00Z",
      season: 2026,
      completedAt: "2026-09-08T00:00:00Z",
      record: {
        correct: 7,
        incorrect: 3,
        missing: 0,
        excluded: 0,
        basePoints: 7,
        lockBonus: 3,
        totalPoints: 10,
      },
      underdogLock: null,
      bouts: [],
      groupResults: [],
    },
  ],
};

describe("Football Picks post-week experience", () => {
  it("keeps the canonical season hub mounted on the Football Picks route", () => {
    const route = readFileSync("src/features/picks/FootballPicksRoute.tsx", "utf8");
    expect(route).toContain("<PicksSeasonHub");
    expect(route).toContain('sport="football"');
    expect(route).toContain("picks.history");
  });

  it("routes football recap destinations to Football Picks without changing UFC", () => {
    expect(canonicalDestinationPath({ kind: "picks-recap", eventId: "football-week-1", sport: "football" }))
      .toBe("/picks/football?event=football-week-1&view=recap");
    expect(canonicalDestinationPath({ kind: "picks-recap", eventId: "ufc-320" }))
      .toBe("/picks?event=ufc-320&view=recap");
  });

  it("uses football season labels, adjusted points, and opens a requested week recap", () => {
    render(
      <MemoryRouter initialEntries={["/picks/football?event=football-week-1&view=recap"]}>
        <PicksSeasonHub history={history} loading={false} sport="football" />
      </MemoryRouter>,
    );

    expect(screen.getByText("2026 FOOTBALL SEASON")).toBeInTheDocument();
    expect(screen.getByText("STANDINGS & WEEKS")).toBeInTheDocument();
    expect(screen.getByText("WEEK ARCHIVE")).toBeInTheDocument();
    expect(screen.getByText("Football Week 1 FOOTBALL RECAP OPEN")).toBeInTheDocument();
    expect(screen.getByText(/7-3 · 70.0% WIN · 8 PTS/)).toBeInTheDocument();
    expect(screen.queryByText("EVENT ARCHIVE")).not.toBeInTheDocument();
  });
});

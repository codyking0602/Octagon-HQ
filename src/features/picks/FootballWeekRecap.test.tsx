import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PickHistoryEvent } from "./picksModel";
import { FootballWeekRecap } from "./FootballWeekRecap";

const week: PickHistoryEvent = {
  eventId: "football-week-2",
  name: "Football Week 2",
  subtitle: "NFL + CFB",
  venue: "Multiple venues",
  location: "Nationwide",
  startsAt: "2026-09-10T00:00:00Z",
  season: 2026,
  completedAt: "2026-09-14T05:00:00Z",
  record: {
    correct: 1,
    incorrect: 0,
    missing: 0,
    excluded: 0,
    basePoints: 1,
    lockBonus: 0,
    totalPoints: 1,
  },
  underdogLock: null,
  bouts: [{
    boutId: "dallas-philadelphia",
    position: 1,
    weightClass: "NFL ATS",
    redFighterSlug: "dallas",
    redFighterName: "Dallas Cowboys",
    blueFighterSlug: "philadelphia",
    blueFighterName: "Philadelphia Eagles",
    homeTeamSlug: "dallas",
    awayTeamSlug: "philadelphia",
    frozenSpreadHome: 3.5,
    homeFinalScore: 27,
    awayFinalScore: 24,
    resultStatus: "red_win",
    winnerFighterSlug: "dallas",
    pickedFighterSlug: "dallas",
    verdict: "correct",
    includedInPicks: true,
    groupPicks: [
      { displayName: "Cody", pickedFighterSlug: "dallas", isCurrentUser: true },
      { displayName: "Shane", pickedFighterSlug: "philadelphia", isCurrentUser: false },
    ],
  }],
  groupResults: [
    {
      rank: 1,
      profileId: "11111111-1111-1111-1111-111111111111",
      displayName: "Cody",
      correct: 1,
      incorrect: 0,
      missing: 0,
      excluded: 0,
      basePoints: 1,
      lockBonus: 0,
      totalPoints: 1,
      isCurrentUser: true,
    },
    {
      rank: 2,
      profileId: "22222222-2222-2222-2222-222222222222",
      displayName: "Shane",
      correct: 0,
      incorrect: 1,
      missing: 0,
      excluded: 0,
      basePoints: 0,
      lockBonus: 0,
      totalPoints: 0,
      isCurrentUser: false,
    },
  ],
};

describe("FootballWeekRecap", () => {
  it("opens a football-native recap with canonical ATS detail", () => {
    render(<FootballWeekRecap event={week} requestedOpen />);

    expect(screen.getByRole("dialog", { name: "Football Week 2 Week Recap" })).toBeInTheDocument();
    expect(screen.getByText("WEEK RECAP")).toBeInTheDocument();
    expect(screen.getByText("WEEK AWARDS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Week Standings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Game by Game" })).toBeInTheDocument();
    expect(screen.getByText("Philadelphia Eagles 24, Dallas Cowboys 27")).toBeInTheDocument();
    expect(screen.getByText("Philadelphia Eagles -3.5")).toBeInTheDocument();
    expect(screen.getAllByText("Dallas Cowboys").length).toBeGreaterThan(0);
    expect(screen.getByText(/Cody \(YOU\) — Dallas Cowboys/)).toBeInTheDocument();
  });

  it("does not present UFC card terminology", () => {
    render(<FootballWeekRecap event={week} requestedOpen />);

    const dialog = screen.getByRole("dialog", { name: "Football Week 2 Week Recap" });
    expect(dialog).not.toHaveTextContent(/fight by fight/i);
    expect(dialog).not.toHaveTextContent(/fighter/i);
    expect(dialog).not.toHaveTextContent(/main event/i);
    expect(dialog).not.toHaveTextContent(/night awards/i);
    expect(dialog).not.toHaveTextContent(/watch the card back/i);
  });
});

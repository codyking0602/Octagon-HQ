import { fireEvent, render, screen, within } from "@testing-library/react";
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
      { displayName: "Cody", pickedFighterSlug: "dallas", isCurrentUser: true, isLock: true },
      { displayName: "Shane", pickedFighterSlug: "philadelphia", isCurrentUser: false, isLock: false },
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
      lockBonus: 4,
      totalPoints: 5,
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
  it("opens with a football-native result-first week hero and frozen ATS summary", () => {
    render(<FootballWeekRecap event={week} requestedOpen />);

    const dialog = screen.getByRole("dialog", { name: "Football Week 2 Week Recap" });
    expect(dialog).toHaveTextContent("WEEK 2 · FINAL");
    expect(dialog).toHaveTextContent("NFL");
    expect(screen.getByRole("heading", { name: "CODY WINS THE WEEK" })).toBeInTheDocument();
    expect(dialog).toHaveTextContent("5 PTS · 1-0 ATS");
    expect(dialog).toHaveTextContent("2 PLAYERS");
    expect(dialog).toHaveTextContent("1 GAME");
    expect(screen.getByRole("heading", { name: "WEEK AWARDS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "WEEK STANDINGS" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GAME RESULTS" })).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Philadelphia Eagles -3.5 · FROZEN ATS");
  });

  it("keeps games collapsed by default, then renders one player per row with exact lock state", () => {
    render(<FootballWeekRecap event={week} requestedOpen />);

    const dialog = screen.getByRole("dialog", { name: "Football Week 2 Week Recap" });
    expect(within(dialog).queryByText("EVERYONE’S PICKS")).not.toBeInTheDocument();

    const gameToggle = within(dialog).getByRole("button", { name: /Philadelphia Eagles AT Dallas Cowboys/i });
    expect(gameToggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(gameToggle);

    expect(gameToggle).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByText("EVERYONE’S PICKS")).toBeInTheDocument();
    const codyRow = within(dialog).getByText("CODY (YOU)").closest(".football-week-recap__pick-row");
    const shaneRow = within(dialog).getByText("SHANE").closest(".football-week-recap__pick-row");
    expect(codyRow).toHaveTextContent("🔒");
    expect(codyRow).toHaveTextContent("Dallas Cowboys");
    expect(codyRow).toHaveTextContent("✓");
    expect(shaneRow).not.toHaveTextContent("🔒");
    expect(shaneRow).toHaveTextContent("Philadelphia Eagles");
    expect(shaneRow).toHaveTextContent("✕");
  });

  it("supports expand all and collapse all without changing game data", () => {
    render(<FootballWeekRecap event={week} requestedOpen />);

    const dialog = screen.getByRole("dialog", { name: "Football Week 2 Week Recap" });
    fireEvent.click(within(dialog).getByRole("button", { name: "EXPAND ALL" }));
    expect(within(dialog).getByText("EVERYONE’S PICKS")).toBeInTheDocument();
    expect(within(dialog).getByText("Philadelphia Eagles 24, Dallas Cowboys 27")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "COLLAPSE ALL" }));
    expect(within(dialog).queryByText("EVERYONE’S PICKS")).not.toBeInTheDocument();
  });

  it("uses semantic missed styling without UFC terminology", () => {
    render(<FootballWeekRecap event={week} requestedOpen />);

    const dialog = screen.getByRole("dialog", { name: "Football Week 2 Week Recap" });
    fireEvent.click(within(dialog).getByRole("button", { name: "EXPAND ALL" }));
    expect(within(dialog).getByText("✕")).toHaveClass("is-missed");
    expect(dialog).not.toHaveTextContent(/fight by fight/i);
    expect(dialog).not.toHaveTextContent(/fighter/i);
    expect(dialog).not.toHaveTextContent(/main event/i);
    expect(dialog).not.toHaveTextContent(/night awards/i);
    expect(dialog).not.toHaveTextContent(/watch the card back/i);
  });
});

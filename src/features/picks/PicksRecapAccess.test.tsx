import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LatestEventRecap } from "./LatestEventRecap";
import type { PickHistory, PickHistoryEvent } from "./picksModel";
import { PicksSeasonHub } from "./PicksSeasonHub";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: vi.fn(),
});
Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});

const event: PickHistoryEvent = {
  eventId: "ufc-fight-night-belgrade",
  name: "UFC Fight Night",
  subtitle: "Uroš Medić vs. Daniel Rodriguez",
  venue: "Belgrade Arena",
  location: "Belgrade, Serbia",
  startsAt: "2026-08-01T17:00:00.000Z",
  season: 2026,
  completedAt: "2026-08-01T23:00:00.000Z",
  record: {
    correct: 3,
    incorrect: 3,
    missing: 0,
    excluded: 0,
    basePoints: 12,
    lockBonus: 0,
    totalPoints: 12,
  },
  underdogLock: null,
  watchMoments: [{
    title: "Uroš Medić vs. Daniel Rodriguez — Must-Watch Moment",
    url: "https://youtu.be/9Gm3-DqFwHU",
  }],
  bouts: [{
    boutId: "medic-rodriguez",
    position: 1,
    weightClass: "Welterweight",
    redFighterSlug: "uros-medic",
    redFighterName: "Uroš Medić",
    blueFighterSlug: "daniel-rodriguez",
    blueFighterName: "Daniel Rodriguez",
    resultStatus: "red_win",
    winnerFighterSlug: "uros-medic",
    pickedFighterSlug: "uros-medic",
    verdict: "correct",
    groupPicks: [
      { displayName: "CODY", pickedFighterSlug: "uros-medic", isCurrentUser: true },
      { displayName: "TYLER", pickedFighterSlug: "uros-medic", isCurrentUser: false },
    ],
  }],
  groupResults: [{
    displayName: "CODY",
    correct: 3,
    incorrect: 3,
    missing: 0,
    excluded: 0,
    rank: 1,
    basePoints: 12,
    lockBonus: 0,
    totalPoints: 12,
    isCurrentUser: true,
  }, {
    displayName: "TYLER",
    correct: 3,
    incorrect: 3,
    missing: 0,
    excluded: 0,
    rank: 1,
    basePoints: 12,
    lockBonus: 0,
    totalPoints: 12,
    isCurrentUser: false,
  }],
};

const history: PickHistory = {
  season: 2026,
  summary: { ...event.record, eventsEntered: 1 },
  events: [event],
};

afterEach(() => {
  cleanup();
  document.documentElement.classList.remove("picks-recap-open");
  document.body.classList.remove("picks-recap-open");
});

describe("permanent Picks recap access", () => {
  it("opens an exact archived recap destination in the real full recap", async () => {
    render(
      <MemoryRouter initialEntries={["/picks?event=ufc-fight-night-belgrade&view=recap"]}>
        <PicksSeasonHub history={history} loading={false} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("dialog", { name: "UFC Fight Night Recap" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Watch the card back" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Uroš Medić vs. Daniel Rodriguez/i })).toHaveAttribute(
      "href",
      "https://youtu.be/9Gm3-DqFwHU",
    );
    expect(screen.getByRole("heading", { name: "Event Standings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fight by Fight" })).toBeInTheDocument();
  });

  it("portals the recap into one explicit mobile scroll screen and restores the document", async () => {
    render(<LatestEventRecap event={event} requestedOpen />);

    const dialog = await screen.findByRole("dialog", { name: "UFC Fight Night Recap" });
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog).toHaveAttribute("data-pull-refresh-ignore");
    expect(screen.getByTestId("picks-event-recap-scroll")).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("picks-recap-open");
    expect(document.body).toHaveClass("picks-recap-open");

    fireEvent.click(screen.getByRole("button", { name: "Close event recap" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.documentElement).not.toHaveClass("picks-recap-open");
    expect(document.body).not.toHaveClass("picks-recap-open");
  });
});

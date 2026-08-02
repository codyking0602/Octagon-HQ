import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { LatestEventRecap } from "./LatestEventRecap";
import type { PickHistory, PickHistoryEvent } from "./picksModel";
import { PicksSeasonHub } from "./PicksSeasonHub";

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
  document.body.style.overflow = "";
});

describe("permanent Picks recap access", () => {
  it("opens an exact archived recap destination in the real full recap", async () => {
    render(
      <MemoryRouter initialEntries={["/picks?event=ufc-fight-night-belgrade&view=recap"]}>
        <PicksSeasonHub history={history} loading={false} />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("dialog", { name: "UFC Fight Night Recap" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Event Standings" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fight by Fight" })).toBeInTheDocument();
  });

  it("portals the recap outside the app shell stacking context and restores body scrolling", async () => {
    render(<LatestEventRecap event={event} requestedOpen />);

    const dialog = await screen.findByRole("dialog", { name: "UFC Fight Night Recap" });
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog).toHaveAttribute("data-pull-refresh-ignore");
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "Close event recap" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe("");
  });
});

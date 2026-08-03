import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksPage from "./PicksPage";
import { PicksProvider } from "./PicksProvider";
import type { PickEvent, PickHistory, ProfileEventPick } from "./picksModel";
import type { PicksRepository } from "./picksRepository";
import { loadPickGroupProgress } from "./picksGroupProgressRepository";

vi.mock("./picksGroupProgressRepository", () => ({ loadPickGroupProgress: vi.fn() }));

const cody = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };
const emptyHistory: PickHistory = {
  season: 2026,
  summary: { correct: 0, incorrect: 0, missing: 0, excluded: 0, basePoints: 0, lockBonus: 0, totalPoints: 0, eventsEntered: 0 },
  seasonStandings: [],
  events: [],
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }), subscribe: () => () => undefined,
    loadProfile: async () => cody, signIn: async () => undefined,
    createProfile: async () => undefined, signOut: async () => undefined,
  };
}

function fightEvent(status: PickEvent["status"] = "upcoming"): PickEvent {
  return {
    eventId: "ufc-per-fight", name: "UFC Per-Fight Test", subtitle: "First Red vs. First Blue",
    venue: "Test Arena", location: "Dallas, Texas", startsAt: "2099-08-09T04:00:00.000Z",
    locksAt: "2099-08-09T04:00:00.000Z", season: 2026, status,
    bouts: [{
      boutId: "first-fight", locksAt: "2099-08-09T02:00:00.000Z", isLocked: true, position: 1,
      weightClass: "Lightweight", redFighterSlug: "first-red", redFighterName: "First Red",
      blueFighterSlug: "first-blue", blueFighterName: "First Blue", redAmericanOdds: -120,
      blueAmericanOdds: 110, winnerFighterSlug: null, resultStatus: "pending", includedInPicks: true,
      groupPicks: [{ displayName: "SHANE", pickedFighterSlug: "first-blue", isCurrentUser: false }],
    }, {
      boutId: "later-fight", locksAt: "2099-08-09T03:00:00.000Z", isLocked: false, position: 2,
      weightClass: "Welterweight", redFighterSlug: "later-red", redFighterName: "Later Red",
      blueFighterSlug: "later-blue", blueFighterName: "Later Blue", redAmericanOdds: -150,
      blueAmericanOdds: 130, winnerFighterSlug: null, resultStatus: "pending", includedInPicks: true,
      groupPicks: status === "locked"
        ? [{ displayName: "SHANE", pickedFighterSlug: "later-red", isCurrentUser: false }]
        : [],
    }],
  };
}

function repository(
  event: PickEvent,
  savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
    eventId, boutId, fighterSlug, pickedAt: "2099-08-08T12:00:00.000Z", updatedAt: "2099-08-08T12:00:00.000Z",
  })),
  loadCurrentEvent = vi.fn(async () => event),
): PicksRepository {
  const picks: ProfileEventPick[] = [{
    eventId: event.eventId, boutId: "first-fight", fighterSlug: "first-red",
    pickedAt: "2099-08-08T12:00:00.000Z", updatedAt: "2099-08-08T12:00:00.000Z",
  }];
  return {
    loadCurrentEvent, loadMyPicks: async () => picks, loadMyUnderdogLock: async () => null,
    loadMySummary: async () => ({ correct: 0, incorrect: 0, pending: 2, eventsEntered: 1, basePoints: 0, lockBonus: 0, totalPoints: 0 }),
    loadMyHistory: async () => emptyHistory, savePick, setUnderdogLock: vi.fn(), clearUnderdogLock: vi.fn(),
  };
}

function renderPage(repo: PicksRepository) {
  return render(<MemoryRouter><IdentityProvider gateway={gateway()}>
    <PicksProvider repository={repo}><PicksPage /></PicksProvider>
  </IdentityProvider></MemoryRouter>);
}

function fightCardByState(label: string) {
  const card = screen.getByLabelText(label).closest("article");
  if (!card) throw new Error(`Fight card not found: ${label}`);
  return within(card);
}

function fightCardByStatus(text: string) {
  const card = screen.getByText(text).closest("article");
  if (!card) throw new Error(`Fight card not found: ${text}`);
  return within(card);
}

async function openGroupComparison() {
  const label = await screen.findByText("GROUP PICKS", { selector: "summary span" });
  const details = label.closest("details");
  const summary = label.closest("summary");
  if (!details || !summary) throw new Error("Group Picks details not found");
  fireEvent.click(summary);
  fireEvent.click(within(details).getByRole("button", { name: /SHANE/ }));
  return screen.getByLabelText("SHANE pick comparison");
}

beforeEach(() => {
  vi.mocked(loadPickGroupProgress).mockResolvedValue([{
    profileId: "22222222-2222-4222-8222-222222222222", displayName: "SHANE", completed: 2, total: 2,
    hasUnderdogLock: true, underdogLockBoutId: "first-fight", underdogLockFighterSlug: "first-blue", isCurrentUser: false,
  }]);
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
});

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("per-fight Picks lock UI", () => {
  it("preserves a locked selection while a later fight remains editable and submits", async () => {
    const savePick = vi.fn(async (eventId: string, boutId: string, fighterSlug: string) => ({
      eventId, boutId, fighterSlug, pickedAt: "2099-08-08T12:00:00.000Z", updatedAt: "2099-08-08T12:00:00.000Z",
    }));
    renderPage(repository(fightEvent(), savePick));
    expect(await screen.findByRole("heading", { name: "UFC Per-Fight Test" })).toBeInTheDocument();
    const firstFight = fightCardByState("First Red versus First Blue is locked");
    const laterFight = fightCardByState("Later Red versus Later Blue is open");
    expect(firstFight.getByText("LOCKED")).toBeInTheDocument();
    expect(laterFight.getByText("OPEN")).toBeInTheDocument();
    const firstRed = await firstFight.findByRole("button", { name: /^First Red/, pressed: true });
    expect(firstRed).toBeDisabled();
    expect(firstRed).toHaveAttribute("aria-pressed", "true");
    const laterBlue = laterFight.getByRole("button", { name: /^Later Blue/, pressed: false });
    expect(laterBlue).toBeEnabled();
    fireEvent.click(laterBlue);
    await waitFor(() => expect(savePick).toHaveBeenCalledWith("ufc-per-fight", "later-fight", "later-blue"));
    await waitFor(() => expect(laterBlue).toHaveAttribute("aria-pressed", "true"));
  });

  it("lets the event-wide master state override individual open flags", async () => {
    const event = fightEvent("locked");
    event.bouts = event.bouts.map((bout) => ({ ...bout, isLocked: false }));
    renderPage(repository(event));
    expect(await screen.findByRole("heading", { name: "UFC Per-Fight Test" })).toBeInTheDocument();
    const laterFight = fightCardByState("Later Red versus Later Blue is locked");
    expect(laterFight.getByRole("button", { name: /^Later Red/, pressed: false })).toBeDisabled();
    expect(laterFight.getByRole("button", { name: /^Later Blue/, pressed: false })).toBeDisabled();
  });

  it("does not let an expired browser deadline override a server-open fight", async () => {
    const event = fightEvent();
    event.locksAt = "2000-01-01T00:00:00.000Z";
    renderPage(repository(event));
    expect(await screen.findByRole("heading", { name: "UFC Per-Fight Test" })).toBeInTheDocument();
    const laterFight = fightCardByState("Later Red versus Later Blue is open");
    expect(laterFight.getByRole("button", { name: /^Later Blue/, pressed: false })).toBeEnabled();
    expect(screen.queryByText("PICKS LOCKED")).not.toBeInTheDocument();
  });

  it("refreshes authoritative state when a stale open card is rejected", async () => {
    const openEvent = fightEvent();
    openEvent.bouts[0] = { ...openEvent.bouts[0], isLocked: false };
    const loadCurrentEvent = vi.fn().mockResolvedValue(openEvent);
    const savePick = vi.fn().mockImplementation(async () => {
      loadCurrentEvent.mockResolvedValue(fightEvent());
      throw new Error("pick is locked for this fight");
    });
    renderPage(repository(openEvent, savePick, loadCurrentEvent));
    await screen.findByRole("heading", { name: "UFC Per-Fight Test" });
    const openFirstFight = fightCardByState("First Red versus First Blue is open");
    await openFirstFight.findByRole("button", { name: /^First Red/, pressed: true });
    const firstBlue = openFirstFight.getByRole("button", { name: /^First Blue/, pressed: false });
    expect(firstBlue).toBeEnabled();
    const loadCountBeforeRejection = loadCurrentEvent.mock.calls.length;
    fireEvent.click(firstBlue);
    expect(await screen.findByText("This fight just locked. Your saved pick was refreshed.")).toBeInTheDocument();
    expect(loadCurrentEvent.mock.calls.length).toBeGreaterThan(loadCountBeforeRejection);
    const lockedFirstFight = fightCardByState("First Red versus First Blue is locked");
    expect(lockedFirstFight.getByRole("button", { name: /^First Blue/, pressed: false })).toBeDisabled();
    expect(lockedFirstFight.getByRole("button", { name: /^First Red/, pressed: true })).toHaveAttribute("aria-pressed", "true");
  });

  it("reveals locked fights before the master lock and the full card afterward", async () => {
    const { unmount } = renderPage(repository(fightEvent()));
    await screen.findByRole("heading", { name: "UFC Per-Fight Test" });
    const comparison = await openGroupComparison();
    expect(within(comparison).getByText("First Blue")).toBeInTheDocument();
    expect(within(comparison).getByText("1 FIGHT STILL OPEN")).toBeInTheDocument();
    expect(within(comparison).queryByText("Later Red")).not.toBeInTheDocument();
    expect(within(comparison).getByText("★ UNDERDOG LOCK")).toBeInTheDocument();
    unmount();
    renderPage(repository(fightEvent("locked")));
    await screen.findByRole("heading", { name: "UFC Per-Fight Test" });
    const lockedComparison = await openGroupComparison();
    expect(within(lockedComparison).getByText("First Blue")).toBeInTheDocument();
    expect(within(lockedComparison).getByText("Later Red")).toBeInTheDocument();
    expect(within(lockedComparison).queryByText(/STILL OPEN/)).not.toBeInTheDocument();
  });

  it("keeps cancelled and removed bouts non-editable", async () => {
    const event = fightEvent();
    event.bouts[0] = { ...event.bouts[0], isLocked: false, resultStatus: "cancelled" };
    event.bouts[1] = { ...event.bouts[1], includedInPicks: false };
    renderPage(repository(event));
    const cancelledFight = fightCardByStatus(await screen.findByText("CANCELLED · EXCLUDED FROM SCORING").then((node) => node.textContent ?? ""));
    const removedFight = fightCardByStatus("REMOVED FROM PICKS · EXCLUDED FROM SCORING");
    expect(await cancelledFight.findByRole("button", { name: /^First Red/, pressed: true })).toBeDisabled();
    expect(removedFight.getByRole("button", { name: /^Later Red/, pressed: false })).toBeDisabled();
  });
});

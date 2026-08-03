import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlPage from "./PicksControlPage";
import type { PickControlRepository } from "./pickControlRepository";

const cody = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" };
const now = Date.parse("2099-08-09T02:00:00.000Z");

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }), subscribe: () => () => undefined,
    loadProfile: async () => cody, signIn: async () => undefined,
    createProfile: async () => undefined, signOut: async () => undefined,
  };
}

function controlEvent(openLock = "2099-08-09T03:00:00.000Z"): PickControlEvent {
  return {
    eventId: "ufc-control-locks", name: "UFC Control Locks", subtitle: "Locked Red vs. Locked Blue",
    venue: "Test Arena", location: "Dallas, Texas", startsAt: "2099-08-09T04:00:00.000Z",
    locksAt: "2099-08-09T03:30:00.000Z", season: 2026, status: "upcoming",
    canLock: true, canComplete: false, canReorder: false, hasReorderHistory: false,
    bouts: [{
      boutId: "resulted-fight", locksAt: "2099-08-09T01:00:00.000Z", isLocked: true, canAdjustLock: false,
      position: 1, weightClass: "Lightweight", redFighterSlug: "locked-red", redFighterName: "Locked Red",
      blueFighterSlug: "locked-blue", blueFighterName: "Locked Blue", resultStatus: "red_win",
      winnerFighterSlug: "locked-red", resultRecordedAt: "2099-08-09T01:30:00.000Z", includedInPicks: true,
      canCancel: false, canRestore: false, canReplace: false, canRemoveFromPicks: false, canRestoreToPicks: false,
      canCorrectResult: false, hasReplacementHistory: false, hasRemovalHistory: false, hasCorrectionHistory: false,
    }, {
      boutId: "open-fight", locksAt: openLock, isLocked: false, canAdjustLock: true,
      position: 2, weightClass: "Welterweight", redFighterSlug: "open-red", redFighterName: "Open Red",
      blueFighterSlug: "open-blue", blueFighterName: "Open Blue", resultStatus: "pending",
      winnerFighterSlug: null, resultRecordedAt: null, includedInPicks: true,
      canCancel: true, canRestore: false, canReplace: true, canRemoveFromPicks: true, canRestoreToPicks: false,
      canCorrectResult: false, hasReplacementHistory: false, hasRemovalHistory: false, hasCorrectionHistory: false,
    }],
  };
}

function repository(event = controlEvent()): PickControlRepository {
  return {
    loadControlEvent: vi.fn().mockResolvedValue(event), lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined), adjustBoutLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined), setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined), reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined), correctResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

function page(repo: PickControlRepository, current = now) {
  return <MemoryRouter><IdentityProvider gateway={gateway()}>
    <PicksControlPage repository={repo} now={current} />
  </IdentityProvider></MemoryRouter>;
}

function renderPage(repo: PickControlRepository, current = now) {
  return render(page(repo, current));
}

function controlCardByFighter(fighter: string) {
  const card = screen.getAllByText(fighter)
    .map((node) => node.closest("article"))
    .find((node): node is HTMLElement => Boolean(node));
  if (!card) throw new Error(`Control card not found: ${fighter}`);
  return within(card);
}

beforeEach(() => {
  vi.spyOn(window, "prompt").mockReturnValue("2099-08-09T05:30");
  vi.spyOn(window, "confirm").mockReturnValue(true);
  Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 844 });
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe("owner progressive Fight Night lock controls", () => {
  it("extends an open fight by 10 minutes and refreshes canonical state", async () => {
    const initial = controlEvent();
    const updated = controlEvent("2099-08-09T03:10:00.000Z");
    const repo = repository(initial);
    vi.mocked(repo.loadControlEvent)
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(updated);

    renderPage(repo);
    const fight = controlCardByFighter("Open Red");
    fireEvent.click(await fight.findByRole("button", { name: "+10 MIN" }));

    await waitFor(() => expect(repo.adjustBoutLockTime).toHaveBeenCalledWith(
      "ufc-control-locks", "open-fight", "2099-08-09T03:10:00.000Z",
    ));
    await waitFor(() => expect(repo.loadControlEvent).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Open Red vs. Open Blue extended 10 minutes.")).toBeInTheDocument();
  });

  it("extends an open fight by 20 minutes through the same mutation", async () => {
    const repo = repository();
    renderPage(repo);
    fireEvent.click(await controlCardByFighter("Open Red").findByRole("button", { name: "+20 MIN" }));
    await waitFor(() => expect(repo.adjustBoutLockTime).toHaveBeenCalledWith(
      "ufc-control-locks", "open-fight", "2099-08-09T03:20:00.000Z",
    ));
  });

  it("sets a future later-card deadline beyond Main Card start", async () => {
    const repo = repository();
    renderPage(repo);
    fireEvent.click(await controlCardByFighter("Open Red").findByRole("button", { name: "SET TIME" }));
    await waitFor(() => expect(repo.adjustBoutLockTime).toHaveBeenCalledWith(
      "ufc-control-locks", "open-fight", new Date("2099-08-09T05:30").toISOString(),
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Once the effective deadline passes"));
  });

  it("rejects a past SET TIME value before the canonical backend call", async () => {
    vi.mocked(window.prompt).mockReturnValue("2099-08-09T01:30");
    const repo = repository();
    renderPage(repo);
    fireEvent.click(await controlCardByFighter("Open Red").findByRole("button", { name: "SET TIME" }));
    expect(await screen.findByText("The new fight lock time must be in the future.")).toBeInTheDocument();
    expect(repo.adjustBoutLockTime).not.toHaveBeenCalled();
  });

  it("disables duplicate submissions while the mutation is pending", async () => {
    let resolveAdjustment: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => { resolveAdjustment = resolve; });
    const repo = repository();
    vi.mocked(repo.adjustBoutLockTime).mockReturnValue(pending);
    renderPage(repo);
    const fight = controlCardByFighter("Open Red");
    const ten = await fight.findByRole("button", { name: "+10 MIN" });
    fireEvent.click(ten);
    await waitFor(() => expect(fight.getByRole("button", { name: "UPDATING…" })).toBeDisabled());
    expect(fight.getByRole("button", { name: "+20 MIN" })).toBeDisabled();
    expect(fight.getByRole("button", { name: "SET TIME" })).toBeDisabled();
    fireEvent.click(fight.getByRole("button", { name: "UPDATING…" }));
    expect(repo.adjustBoutLockTime).toHaveBeenCalledTimes(1);
    resolveAdjustment?.();
    await waitFor(() => expect(repo.loadControlEvent).toHaveBeenCalledTimes(2));
  });

  it("shows backend failure without refreshing or displaying an accepted deadline", async () => {
    const repo = repository();
    vi.mocked(repo.adjustBoutLockTime).mockRejectedValue(new Error("locked bout cannot be reopened"));
    renderPage(repo);
    fireEvent.click(await controlCardByFighter("Open Red").findByRole("button", { name: "+10 MIN" }));
    expect(await screen.findByText("locked bout cannot be reopened")).toBeInTheDocument();
    expect(repo.loadControlEvent).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Open Red vs. Open Blue extended 10 minutes.")).not.toBeInTheDocument();
  });

  it("exposes no progressive action to a normal member", async () => {
    const repo = repository();
    vi.mocked(repo.loadControlEvent).mockRejectedValue(new Error("pick control owner required"));
    renderPage(repo);
    expect(await screen.findByText("This control room is available only to the designated Fight Night owner.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+10 MIN" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+20 MIN" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SET TIME" })).not.toBeInTheDocument();
  });

  it("makes a passed, resulted, locked, or completed deadline final", async () => {
    const staleOpen = controlEvent("2099-08-09T02:00:00.000Z");
    const repo = repository(staleOpen);
    renderPage(repo, now);
    expect(await screen.findByRole("heading", { name: "UFC Control Locks" })).toBeInTheDocument();
    const openFight = controlCardByFighter("Open Red");
    expect(openFight.getByText("FIGHT LOCK · FINAL")).toBeInTheDocument();
    expect(openFight.getByText("DEADLINE FINAL")).toBeInTheDocument();
    expect(openFight.queryByRole("button", { name: "+10 MIN" })).not.toBeInTheDocument();
    const resultedFight = controlCardByFighter("Locked Red");
    expect(resultedFight.getByText("DEADLINE FINAL")).toBeInTheDocument();

    cleanup();
    const lockedEvent = { ...controlEvent(), status: "locked" as const, canLock: false };
    renderPage(repository(lockedEvent));
    expect(await screen.findByRole("heading", { name: "UFC Control Locks" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+10 MIN" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "SET TIME" })).not.toBeInTheDocument();

    cleanup();
    const completedEvent = { ...controlEvent(), status: "complete" as const, canLock: false };
    renderPage(repository(completedEvent));
    expect(await screen.findByRole("heading", { name: "UFC Control Locks" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+20 MIN" })).not.toBeInTheDocument();
  });

  it("transitions owner warnings at 10, 5, and 1 minute before final lock", async () => {
    const repo = repository(controlEvent("2099-08-09T02:10:00.000Z"));
    const view = renderPage(repo, Date.parse("2099-08-09T02:00:00.000Z"));
    expect(await screen.findByText("LOCKS IN 10 MINUTES")).toBeInTheDocument();

    view.rerender(page(repo, Date.parse("2099-08-09T02:05:00.000Z")));
    expect(await screen.findByText("LOCKS IN 5 MINUTES")).toBeInTheDocument();
    expect(screen.queryByText("LOCKS IN 10 MINUTES")).not.toBeInTheDocument();

    view.rerender(page(repo, Date.parse("2099-08-09T02:09:00.000Z")));
    expect(await screen.findByText("LOCKS IN 1 MINUTE")).toBeInTheDocument();
    expect(screen.queryByText("LOCKS IN 5 MINUTES")).not.toBeInTheDocument();

    view.rerender(page(repo, Date.parse("2099-08-09T02:10:00.000Z")));
    expect(await screen.findAllByText("DEADLINE FINAL")).not.toHaveLength(0);
    expect(screen.queryByText("LOCKS IN 1 MINUTE")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+10 MIN" })).not.toBeInTheDocument();
  });
});

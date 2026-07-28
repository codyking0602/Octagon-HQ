import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { PickControlEvent } from "./pickControlModel";
import PicksControlPage from "./PicksControlPage";
import type { PickControlRepository } from "./pickControlRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const lockedEvent: PickControlEvent = {
  eventId: "ufc-control",
  name: "UFC Control",
  subtitle: "Red Fighter vs. Blue Fighter",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2026-08-01T02:00:00.000Z",
  locksAt: "2026-08-01T01:00:00.000Z",
  season: 2026,
  status: "locked",
  canLock: false,
  canComplete: false,
  bouts: [
    {
      boutId: "red-blue",
      position: 1,
      weightClass: "Lightweight",
      redFighterSlug: "red-fighter",
      redFighterName: "Red Fighter",
      blueFighterSlug: "blue-fighter",
      blueFighterName: "Blue Fighter",
      resultStatus: "pending",
      winnerFighterSlug: null,
      resultRecordedAt: null,
      canCancel: false,
      canRestore: false,
      canReplace: false,
      hasReplacementHistory: false,
    },
    {
      boutId: "second-fight",
      position: 2,
      weightClass: "Welterweight",
      redFighterSlug: "second-red",
      redFighterName: "Second Red",
      blueFighterSlug: "second-blue",
      blueFighterName: "Second Blue",
      resultStatus: "cancelled",
      winnerFighterSlug: null,
      resultRecordedAt: "2026-08-01T02:20:00.000Z",
      canCancel: false,
      canRestore: false,
      canReplace: false,
      hasReplacementHistory: false,
    },
  ],
};

function gateway(profile = cody): IdentityGateway {
  return {
    getSession: async () => ({ userId: profile.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => profile,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository(event: PickControlEvent | null): PickControlRepository {
  return {
    loadControlEvent: vi.fn().mockResolvedValue(event),
    lockEvent: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage(repo: PickControlRepository, identityGateway = gateway()) {
  return render(
    <MemoryRouter>
      <IdentityProvider gateway={identityGateway}>
        <PicksControlPage repository={repo} />
      </IdentityProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "prompt").mockReturnValue("Removed from the official UFC card");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Fight Night Control", () => {
  it("records and clears one official result without enabling event completion early", async () => {
    const repo = repository(lockedEvent);
    renderPage(repo);

    expect(await screen.findByRole("heading", { name: "UFC Control" })).toBeInTheDocument();
    expect(screen.getByText("1 OF 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /RED WINNER Red Fighter/i }));
    await waitFor(() => expect(repo.recordResult).toHaveBeenCalledWith("ufc-control", "red-blue", "red_win"));

    const clearButton = screen.getByRole("button", { name: "CLEAR RESULT" });
    await waitFor(() => expect(clearButton).not.toBeDisabled());
    fireEvent.click(clearButton);
    await waitFor(() => expect(repo.recordResult).toHaveBeenCalledWith("ufc-control", "second-fight", "pending"));

    expect(screen.getByRole("button", { name: "COMPLETE EVENT" })).toBeDisabled();
  });

  it("approves and restores pre-lock cancellations with a required reason", async () => {
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      canLock: false,
      bouts: lockedEvent.bouts.map((bout, index) => index === 0 ? {
        ...bout,
        resultStatus: "pending" as const,
        resultRecordedAt: null,
        canCancel: true,
        canRestore: false,
        canReplace: false,
        hasReplacementHistory: false,
      } : {
        ...bout,
        resultStatus: "cancelled" as const,
        canCancel: false,
        canRestore: true,
      }),
    };
    const repo = repository(upcoming);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CANCEL FIGHT" }));
    await waitFor(() => expect(repo.setCancellation).toHaveBeenCalledWith(
      "ufc-control",
      "red-blue",
      true,
      "Removed from the official UFC card",
    ));

    fireEvent.click(screen.getByRole("button", { name: "RESTORE FIGHT" }));
    await waitFor(() => expect(repo.setCancellation).toHaveBeenCalledWith(
      "ufc-control",
      "second-fight",
      false,
      "Removed from the official UFC card",
    ));
    expect(screen.queryByRole("button", { name: "COMPLETE EVENT" })).not.toBeInTheDocument();
  });

  it("does not submit a cancellation without a reason", async () => {
    vi.mocked(window.prompt).mockReturnValueOnce(null);
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      canLock: false,
      bouts: [{ ...lockedEvent.bouts[0], canCancel: true }],
    };
    const repo = repository(upcoming);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "CANCEL FIGHT" }));
    expect(repo.setCancellation).not.toHaveBeenCalled();
  });

  it("requires explicit owner confirmation and submits stale-state guarded replacement details", async () => {
    vi.mocked(window.prompt)
      .mockReturnValueOnce("red")
      .mockReturnValueOnce("Replacement Fighter")
      .mockReturnValueOnce("replacement-fighter")
      .mockReturnValueOnce("Official opponent withdrew");
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      canLock: false,
      bouts: [{ ...lockedEvent.bouts[0], canReplace: true }],
    };
    const repo = repository(upcoming);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "REPLACE FIGHTER" }));
    await waitFor(() => expect(repo.replaceFighter).toHaveBeenCalledWith(
      "ufc-control",
      expect.objectContaining({ boutId: "red-blue", redFighterSlug: "red-fighter", blueFighterSlug: "blue-fighter" }),
      "red",
      "replacement-fighter",
      "Replacement Fighter",
      "Official opponent withdrew",
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("Every existing pick"));
  });

  it("locks picks before result entry and completes only a fully resolved event", async () => {
    const upcoming = { ...lockedEvent, status: "upcoming" as const, canLock: true, bouts: lockedEvent.bouts.map((bout) => ({
      ...bout,
      resultStatus: "pending" as const,
      winnerFighterSlug: null,
      resultRecordedAt: null,
      canCancel: true,
      canRestore: false,
      canReplace: false,
      hasReplacementHistory: false,
    })) };
    const lockRepo = repository(upcoming);
    renderPage(lockRepo);

    fireEvent.click(await screen.findByRole("button", { name: "LOCK PICKS & BEGIN RESULTS" }));
    await waitFor(() => expect(lockRepo.lockEvent).toHaveBeenCalledWith("ufc-control"));
    cleanup();

    const ready = {
      ...lockedEvent,
      canComplete: true,
      bouts: lockedEvent.bouts.map((bout, index) => index === 0 ? {
        ...bout,
        resultStatus: "red_win" as const,
        winnerFighterSlug: bout.redFighterSlug,
        resultRecordedAt: "2026-08-01T02:30:00.000Z",
      } : bout),
    };
    const completeRepo = repository(ready);
    renderPage(completeRepo);

    fireEvent.click(await screen.findByRole("button", { name: "COMPLETE EVENT" }));
    await waitFor(() => expect(completeRepo.completeEvent).toHaveBeenCalledWith("ufc-control"));
  });

  it("shows no operational data to a signed-in non-owner", async () => {
    const repo = repository(null);
    vi.mocked(repo.loadControlEvent).mockRejectedValue(new Error("pick control owner required"));
    renderPage(repo);

    expect(await screen.findByText("This control room is available only to the designated Fight Night owner.")).toBeInTheDocument();
    expect(screen.queryByText("Red Fighter")).not.toBeInTheDocument();
  });
});

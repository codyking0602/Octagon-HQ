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

  it("locks picks before result entry and completes only a fully resolved event", async () => {
    const upcoming = { ...lockedEvent, status: "upcoming" as const, canLock: true, bouts: lockedEvent.bouts.map((bout) => ({
      ...bout,
      resultStatus: "pending" as const,
      winnerFighterSlug: null,
      resultRecordedAt: null,
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

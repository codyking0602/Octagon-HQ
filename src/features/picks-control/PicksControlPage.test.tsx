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
  canReorder: false,
  hasReorderHistory: false,
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
      includedInPicks: true,
      canCancel: false,
      canRestore: false,
      canReplace: false,
      canRemoveFromPicks: false,
      canRestoreToPicks: false,
      hasReplacementHistory: false,
      hasRemovalHistory: false,
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
      includedInPicks: true,
      canCancel: false,
      canRestore: false,
      canReplace: false,
      canRemoveFromPicks: false,
      canRestoreToPicks: false,
      hasReplacementHistory: false,
      hasRemovalHistory: false,
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
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    reorderCard: vi.fn().mockResolvedValue(undefined),
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

  it("removes and restores Picks inclusion through a separate stale-state guarded action", async () => {
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      bouts: [
        { ...lockedEvent.bouts[0], canCancel: true, canReplace: true, canRemoveFromPicks: true },
        {
          ...lockedEvent.bouts[1],
          resultStatus: "pending",
          resultRecordedAt: null,
          includedInPicks: false,
          canRestoreToPicks: true,
          hasRemovalHistory: true,
        },
      ],
    };
    const repo = repository(upcoming);
    renderPage(repo);

    fireEvent.click(await screen.findByRole("button", { name: "REMOVE FROM PICKS" }));
    await waitFor(() => expect(repo.setBoutInclusion).toHaveBeenCalledWith(
      "ufc-control",
      expect.objectContaining({ boutId: "red-blue", includedInPicks: true }),
      false,
      "Removed from the official UFC card",
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("submitted picks stay preserved"));

    fireEvent.click(screen.getByRole("button", { name: "RESTORE TO PICKS" }));
    await waitFor(() => expect(repo.setBoutInclusion).toHaveBeenCalledWith(
      "ufc-control",
      expect.objectContaining({ boutId: "second-fight", includedInPicks: false }),
      true,
      "Removed from the official UFC card",
    ));
    expect(screen.getByText(/Prior inclusion actions remain audited/)).toBeInTheDocument();
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

  it("keeps move taps local and submits the complete before-and-after order once", async () => {
    vi.mocked(window.prompt).mockReturnValueOnce("Official UFC bout order updated");
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      canReorder: true,
      bouts: lockedEvent.bouts.map((bout) => ({ ...bout, resultStatus: "pending" as const })),
    };
    const repo = repository(upcoming);
    renderPage(repo);

    const down = (await screen.findAllByRole("button", { name: "MOVE DOWN" }))[0];
    fireEvent.click(down);
    expect(repo.reorderCard).not.toHaveBeenCalled();
    expect(screen.getByText("MAIN EVENT").closest("article")).toHaveTextContent("Second Red");

    fireEvent.click(screen.getByRole("button", { name: "APPROVE NEW ORDER" }));
    await waitFor(() => expect(repo.reorderCard).toHaveBeenCalledWith(
      "ufc-control",
      ["red-blue", "second-fight"],
      ["second-fight", "red-blue"],
      "Official UFC bout order updated",
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringMatching(/BEFORE[\s\S]*1\. Red Fighter[\s\S]*AFTER[\s\S]*1\. Second Red/));
  });

  it("removes the approval action when the local order returns to canonical", async () => {
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      canReorder: true,
      bouts: lockedEvent.bouts.map((bout) => ({ ...bout, resultStatus: "pending" as const })),
    };
    const repo = repository(upcoming);
    renderPage(repo);

    fireEvent.click((await screen.findAllByRole("button", { name: "MOVE DOWN" }))[0]);
    expect(screen.getByRole("button", { name: "APPROVE NEW ORDER" })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: "MOVE UP" })[1]);

    expect(screen.queryByRole("button", { name: "APPROVE NEW ORDER" })).not.toBeInTheDocument();
    expect(repo.reorderCard).not.toHaveBeenCalled();
  });

  it("hides move and approval controls when the server closes reordering", async () => {
    const upcoming: PickControlEvent = {
      ...lockedEvent,
      status: "upcoming",
      canReorder: false,
      bouts: lockedEvent.bouts.map((bout) => ({ ...bout, resultStatus: "pending" as const })),
    };
    const repo = repository(upcoming);
    renderPage(repo);

    expect(await screen.findByText("Fight-order changes are closed.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "MOVE DOWN" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "APPROVE NEW ORDER" })).not.toBeInTheDocument();
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

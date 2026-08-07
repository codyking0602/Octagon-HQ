import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import OpenPicksDashboard from "./OpenPicksDashboard";
import type { PickControlEvent } from "./pickControlModel";
import type { PickControlRepository } from "./pickControlRepository";

const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

function gateway(profile: typeof owner | null = owner): IdentityGateway {
  return {
    getSession: async () => ({ userId: owner.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => profile,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function bout(
  boutId: string,
  position: number,
  redFighterName: string,
  blueFighterName: string,
  includedInPicks = true,
): PickControlEvent["bouts"][number] {
  return {
    boutId,
    locksAt: "2099-08-09T02:30:00.000Z",
    isLocked: false,
    canAdjustLock: true,
    position,
    weightClass: position === 1 ? "Lightweight" : "Welterweight",
    redFighterSlug: redFighterName.toLowerCase().replaceAll(" ", "-"),
    redFighterName,
    blueFighterSlug: blueFighterName.toLowerCase().replaceAll(" ", "-"),
    blueFighterName,
    resultStatus: "pending",
    winnerFighterSlug: null,
    resultRecordedAt: null,
    includedInPicks,
    canCancel: includedInPicks,
    canRestore: false,
    canReplace: includedInPicks,
    canRemoveFromPicks: includedInPicks,
    canRestoreToPicks: !includedInPicks,
    hasReplacementHistory: false,
    hasRemovalHistory: !includedInPicks,
  };
}

const event: PickControlEvent = {
  eventId: "ufc-compact",
  name: "UFC Compact",
  subtitle: "Alpha vs. Bravo",
  venue: "Test Arena",
  location: "Dallas, Texas",
  startsAt: "2099-08-09T04:00:00.000Z",
  locksAt: "2099-08-09T03:00:00.000Z",
  season: 2099,
  status: "upcoming",
  canLock: true,
  canComplete: false,
  canReorder: true,
  hasReorderHistory: false,
  bouts: [
    bout("alpha-bravo", 1, "Alpha", "Bravo"),
    bout("hidden-fight", 2, "Hidden", "Fight", false),
    bout("charlie-delta", 3, "Charlie", "Delta"),
    bout("echo-foxtrot", 4, "Echo", "Foxtrot"),
  ],
};

function repository(): PickControlRepository {
  return {
    loadControlEvent: vi.fn().mockResolvedValue(event),
    lockEvent: vi.fn().mockResolvedValue(undefined),
    adjustLockTime: vi.fn().mockResolvedValue(undefined),
    adjustBoutLockTime: vi.fn().mockResolvedValue(undefined),
    setCancellation: vi.fn().mockResolvedValue(undefined),
    setBoutInclusion: vi.fn().mockResolvedValue(undefined),
    replaceFighter: vi.fn().mockResolvedValue(undefined),
    addBout: vi.fn().mockResolvedValue(undefined),
    reorderCard: vi.fn().mockResolvedValue(undefined),
    recordResult: vi.fn().mockResolvedValue(undefined),
    correctResult: vi.fn().mockResolvedValue(undefined),
    completeEvent: vi.fn().mockResolvedValue(undefined),
  };
}

function renderDashboard(repo: PickControlRepository, identityGateway: IdentityGateway = gateway()) {
  return render(
    <IdentityProvider gateway={identityGateway}>
      <OpenPicksDashboard repository={repo} now={Date.parse("2099-08-01T12:00:00.000Z")} />
    </IdentityProvider>,
  );
}

beforeEach(() => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  vi.spyOn(window, "prompt").mockReturnValue(null);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("finished Open Picks owner workflow", () => {
  it("keeps the card compact, exposes Add Fight, and hides removed audit rows", async () => {
    renderDashboard(repository());

    expect(await screen.findByRole("region", { name: "UFC Compact compact fight controls" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ADD FIGHT" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EXPAND Alpha vs. Bravo" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "EXPAND Charlie vs. Delta" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+10 MIN" })).not.toBeInTheDocument();
  });

  it("keeps only one fight expanded", async () => {
    renderDashboard(repository());

    fireEvent.click(await screen.findByRole("button", { name: "EXPAND Alpha vs. Bravo" }));
    expect(screen.getByRole("button", { name: "COLLAPSE Alpha vs. Bravo" })).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "EXPAND Charlie vs. Delta" }));
    expect(screen.getByRole("button", { name: "EXPAND Alpha vs. Bravo" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "COLLAPSE Charlie vs. Delta" })).toHaveAttribute("aria-expanded", "true");
  });

  it("uses the canonical repository for a fight deadline mutation", async () => {
    const repo = repository();
    renderDashboard(repo);

    fireEvent.click(await screen.findByRole("button", { name: "EXPAND Alpha vs. Bravo" }));
    fireEvent.click(screen.getByRole("button", { name: "+10 MIN" }));

    await waitFor(() => expect(repo.adjustBoutLockTime).toHaveBeenCalledWith(
      "ufc-compact",
      "alpha-bravo",
      "2099-08-09T02:40:00.000Z",
    ));
  });

  it("reorders with confirmation only while keeping the complete canonical order", async () => {
    const repo = repository();
    renderDashboard(repo);

    fireEvent.click(await screen.findByRole("button", { name: "EXPAND Charlie vs. Delta" }));
    fireEvent.click(within(screen.getByLabelText("Move Charlie vs. Delta")).getByRole("button", { name: "MOVE UP" }));
    fireEvent.click(screen.getByRole("button", { name: "APPROVE NEW ORDER" }));

    await waitFor(() => expect(repo.reorderCard).toHaveBeenCalledWith(
      "ufc-compact",
      ["alpha-bravo", "hidden-fight", "charlie-delta", "echo-foxtrot"],
      ["charlie-delta", "hidden-fight", "alpha-bravo", "echo-foxtrot"],
      "Owner confirmed live fight order change",
    ));
    expect(window.prompt).not.toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("fight deadlines stay with their bouts"));
  });

  it("adds a main-card fight through the one canonical repository action", async () => {
    vi.mocked(window.prompt)
      .mockReturnValueOnce("New Red")
      .mockReturnValueOnce("New Blue")
      .mockReturnValueOnce("Featherweight")
      .mockReturnValueOnce("2099-08-09T03:30");
    const repo = repository();
    renderDashboard(repo);

    fireEvent.click(await screen.findByRole("button", { name: "ADD FIGHT" }));

    await waitFor(() => expect(repo.addBout).toHaveBeenCalledWith(
      "ufc-compact",
      ["alpha-bravo", "hidden-fight", "charlie-delta", "echo-foxtrot"],
      expect.objectContaining({
        redFighterName: "New Red",
        blueFighterName: "New Blue",
        weightClass: "Featherweight",
        locksAt: expect.any(String),
        segmentSequence: 5,
      }),
      "Owner confirmed fight addition to Picks",
    ));
    expect(window.prompt).toHaveBeenCalledTimes(4);
  });

  it("removes a fight without asking the owner to type an audit reason", async () => {
    const repo = repository();
    renderDashboard(repo);

    fireEvent.click(await screen.findByRole("button", { name: "EXPAND Alpha vs. Bravo" }));
    fireEvent.click(screen.getByRole("button", { name: "REMOVE FROM PICKS" }));

    await waitFor(() => expect(repo.setBoutInclusion).toHaveBeenCalledWith(
      "ufc-compact",
      expect.objectContaining({ boutId: "alpha-bravo" }),
      false,
      "Owner confirmed fight removal from Picks",
    ));
    expect(window.prompt).not.toHaveBeenCalled();
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("disappears from ordinary owner and player cards"));
  });

  it("does not load private event data for a signed-out owner", async () => {
    const repo = repository();
    renderDashboard(repo, gateway(null));

    await waitFor(() => expect(repo.loadControlEvent).not.toHaveBeenCalled());
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});

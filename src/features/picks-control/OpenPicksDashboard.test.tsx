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
    includedInPicks: true,
    canCancel: true,
    canRestore: false,
    canReplace: true,
    canRemoveFromPicks: true,
    canRestoreToPicks: false,
    hasReplacementHistory: false,
    hasRemovalHistory: false,
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
    bout("charlie-delta", 2, "Charlie", "Delta"),
    bout("echo-foxtrot", 3, "Echo", "Foxtrot"),
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
  vi.spyOn(window, "prompt").mockReturnValue("Official owner reason");
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Compact Manage Open Picks dashboard", () => {
  it("renders the whole card as compact rows with uncommon actions collapsed", async () => {
    renderDashboard(repository());

    expect(await screen.findByRole("region", { name: "UFC Compact compact fight controls" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "EXPAND Alpha vs. Bravo" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "EXPAND Charlie vs. Delta" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "EXPAND Echo vs. Foxtrot" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "+10 MIN" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "REPLACE FIGHTER" })).not.toBeInTheDocument();
  });

  it("keeps only the selected fight expanded", async () => {
    renderDashboard(repository());

    fireEvent.click(await screen.findByRole("button", { name: "EXPAND Alpha vs. Bravo" }));
    expect(screen.getByRole("button", { name: "COLLAPSE Alpha vs. Bravo" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("button", { name: "+10 MIN" })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "EXPAND Charlie vs. Delta" }));
    expect(screen.getByRole("button", { name: "EXPAND Alpha vs. Bravo" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "COLLAPSE Charlie vs. Delta" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("button", { name: "+10 MIN" })).toHaveLength(1);
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

  it("moves locally and sends one approved order through the canonical repository", async () => {
    const repo = repository();
    renderDashboard(repo);

    fireEvent.click(await screen.findByRole("button", { name: "EXPAND Charlie vs. Delta" }));
    const moveGroup = screen.getByLabelText("Move Charlie vs. Delta");
    fireEvent.click(within(moveGroup).getByRole("button", { name: "MOVE UP" }));

    expect(repo.reorderCard).not.toHaveBeenCalled();
    expect(screen.getByText("NEW ORDER READY")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "APPROVE NEW ORDER" }));

    await waitFor(() => expect(repo.reorderCard).toHaveBeenCalledWith(
      "ufc-compact",
      ["alpha-bravo", "charlie-delta", "echo-foxtrot"],
      ["charlie-delta", "alpha-bravo", "echo-foxtrot"],
      "Official owner reason",
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("BEFORE"));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("AFTER"));
  });

  it("does not load private event data for a signed-out owner", async () => {
    const repo = repository();
    renderDashboard(repo, gateway(null));

    await waitFor(() => expect(repo.loadControlEvent).not.toHaveBeenCalled());
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PicksControlPage from "./PicksControlPage";
import type { PickControlRepository } from "./pickControlRepository";

const identityGateway: IdentityGateway = {
  getSession: async () => ({ userId: "11111111-1111-4111-8111-111111111111" }),
  subscribe: () => () => undefined,
  loadProfile: async () => ({
    id: "11111111-1111-4111-8111-111111111111",
    displayName: "CODY",
    initials: "CK",
  }),
  signIn: async () => undefined,
  createProfile: async () => undefined,
  signOut: async () => undefined,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Fight Night event-wide Picks deadline", () => {
  // Keep this event-control test pinned before the fixed main-card start.
  it("shows that every fight shares one deadline and lets the owner extend it before the main card", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-08-01T17:00:00.000Z"));
    vi.spyOn(window, "prompt")
      .mockReturnValueOnce("2026-08-01T18:30")
      .mockReturnValueOnce("Give the group another thirty minutes");
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const adjustLockTime = vi.fn().mockResolvedValue(undefined);
    const repository: PickControlRepository = {
      loadControlEvent: vi.fn().mockResolvedValue({
        eventId: "ufc-belgrade",
        name: "UFC Fight Night",
        subtitle: "Uroš Medić vs. Daniel Rodriguez",
        venue: "Belgrade Arena",
        location: "Belgrade, Serbia",
        startsAt: "2026-08-01T19:00:00.000Z",
        locksAt: "2026-08-01T18:00:00.000Z",
        season: 2026,
        status: "upcoming",
        canLock: false,
        canComplete: false,
        canReorder: false,
        hasReorderHistory: false,
        recentCompletedEvents: [],
        bouts: [],
      }),
      lockEvent: vi.fn(),
      adjustLockTime,
      setCancellation: vi.fn(),
      setBoutInclusion: vi.fn(),
      replaceFighter: vi.fn(),
      reorderCard: vi.fn(),
      recordResult: vi.fn(),
      correctResult: vi.fn(),
      completeEvent: vi.fn(),
    };

    render(
      <MemoryRouter>
        <IdentityProvider gateway={identityGateway}>
          <PicksControlPage repository={repository} />
        </IdentityProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("ALL FIGHTS LOCK TOGETHER")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CHANGE LOCK TIME" }));

    await waitFor(() => expect(adjustLockTime).toHaveBeenCalledWith(
      "ufc-belgrade",
      new Date("2026-08-01T18:30").toISOString(),
      "2026-08-01T18:00:00.000Z",
      "Give the group another thirty minutes",
    ));
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("every fight"));
  });
});

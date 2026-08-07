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
});

describe("Fight Night event-wide Picks deadline", () => {
  it("presents the event deadline as the master lock without a typed audit reason", async () => {
    vi.spyOn(window, "prompt").mockReturnValue("2026-08-01T18:30");
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
          <PicksControlPage repository={repository} now={Date.parse("2026-08-01T17:00:00.000Z")} />
        </IdentityProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("MASTER LOCK")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CHANGE MASTER LOCK" }));

    await waitFor(() => expect(adjustLockTime).toHaveBeenCalledWith(
      "ufc-belgrade",
      new Date("2026-08-01T18:30").toISOString(),
      "2026-08-01T18:00:00.000Z",
      "Owner confirmed master Picks deadline change",
    ));
    expect(window.prompt).toHaveBeenCalledTimes(1);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining("already-final fight deadlines stay final"));
  });
});

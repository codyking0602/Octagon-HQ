import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { emptyPickHistory } from "./picksModel";
import { PicksProvider, usePicks } from "./PicksProvider";
import type { PicksRepository } from "./picksRepository";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

function gateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => cody,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function Probe() {
  const picks = usePicks();
  return (
    <div>
      <span>UFC {picks.summary.correct}-{picks.summary.incorrect}</span>
      <span>FOOTBALL {picks.footballSummary.correct}-{picks.footballSummary.incorrect}</span>
      <span>FOOTBALL ERROR {picks.footballSummaryError || "NONE"}</span>
    </div>
  );
}

describe("PicksProvider cross-sport summary", () => {
  it("loads Football record through the existing app-level Picks repository owner", async () => {
    const loadMySummary = vi.fn(async (_season: number, sport = "mma") => sport === "football"
      ? { correct: 9, incorrect: 3, pending: 2, eventsEntered: 3, basePoints: 36, lockBonus: 4, totalPoints: 40 }
      : { correct: 12, incorrect: 8, pending: 1, eventsEntered: 4, basePoints: 48, lockBonus: 0, totalPoints: 48 });
    const repository: PicksRepository = {
      loadCurrentEvent: vi.fn(async () => null),
      loadMyPicks: vi.fn(async () => []),
      loadMyUnderdogLock: vi.fn(async () => null),
      loadMySummary,
      loadMyHistory: vi.fn(async () => emptyPickHistory),
      savePick: vi.fn(),
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository} includeFootballSummary>
          <Probe />
        </PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("UFC 12-8")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL 9-3")).toBeInTheDocument();
    expect(screen.getByText("FOOTBALL ERROR NONE")).toBeInTheDocument();
    await waitFor(() => {
      expect(loadMySummary).toHaveBeenCalledWith(new Date().getFullYear(), "mma");
      expect(loadMySummary).toHaveBeenCalledWith(new Date().getFullYear(), "football");
    });
  });
});

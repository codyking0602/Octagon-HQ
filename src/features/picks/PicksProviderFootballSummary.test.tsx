import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
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
      <span>
        FOOTBALL {picks.footballSummary
          ? `${picks.footballSummary.correct}-${picks.footballSummary.incorrect}`
          : "UNAVAILABLE"}
      </span>
    </div>
  );
}

describe("PicksProvider universal record summaries", () => {
  it("loads the Football record through the existing repository without loading a Football slate", async () => {
    const loadCurrentEvent = vi.fn(async () => null);
    const loadMySummary = vi.fn(async (_season: number, sport?: "mma" | "football") => (
      sport === "football"
        ? {
            correct: 7,
            incorrect: 3,
            pending: 0,
            eventsEntered: 2,
            basePoints: 22,
            lockBonus: 2,
            totalPoints: 24,
          }
        : {
            correct: 12,
            incorrect: 8,
            pending: 1,
            eventsEntered: 4,
            basePoints: 48,
            lockBonus: 0,
            totalPoints: 48,
          }
    ));
    const repository: PicksRepository = {
      loadCurrentEvent,
      loadMyPicks: vi.fn(async () => []),
      loadMySummary,
      loadMyHistory: vi.fn(async (season) => ({
        season,
        summary: {
          correct: 0,
          incorrect: 0,
          missing: 0,
          excluded: 0,
          basePoints: 0,
          lockBonus: 0,
          totalPoints: 0,
          eventsEntered: 0,
        },
        events: [],
      })),
      loadMyUnderdogLock: vi.fn(async () => null),
      setUnderdogLock: vi.fn(),
      clearUnderdogLock: vi.fn(),
      savePick: vi.fn(),
    };

    render(
      <IdentityProvider gateway={gateway()}>
        <PicksProvider repository={repository} includeFootballSummary>
          <Probe />
        </PicksProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("UFC 12-8")).toBeInTheDocument();
    expect(await screen.findByText("FOOTBALL 7-3")).toBeInTheDocument();

    expect(loadCurrentEvent).toHaveBeenCalledTimes(1);
    expect(loadCurrentEvent).toHaveBeenCalledWith("mma");
    expect(loadCurrentEvent).not.toHaveBeenCalledWith("football");

    await waitFor(() => {
      expect(loadMySummary).toHaveBeenCalledWith(expect.any(Number), "mma");
      expect(loadMySummary).toHaveBeenCalledWith(expect.any(Number), "football");
    });
  });
});

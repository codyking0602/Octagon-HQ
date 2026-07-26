import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import type { ChallengeProfile, PlayChallenge } from "../challenges/challengeModel";
import type { ChallengeRepository } from "../challenges/challengeRepository";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import {
  FindLeaderHistoryProvider,
} from "../play/FindLeaderHistoryProvider";
import type { FindLeaderHistoryRepository } from "../play/findLeaderHistoryRepository";
import { centralDay } from "../play/findLeaderEngine";
import { PicksProvider } from "../picks/PicksProvider";
import type { PickEvent } from "../picks/picksModel";
import type { PicksRepository } from "../picks/picksRepository";
import {
  ProfilePreferencesProvider,
} from "../profile/ProfilePreferencesProvider";
import type { ProfilePreferencesRepository } from "../profile/profilePreferencesRepository";
import HomePage from "./HomePage";

const cody: ChallengeProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const shane: ChallengeProfile = {
  id: "22222222-2222-4222-8222-222222222222",
  displayName: "SHANE",
  initials: "SH",
};

const pickEvent: PickEvent = {
  eventId: "ufc-test-event",
  name: "UFC Fight Night",
  subtitle: "Ankalaev vs. Guskov",
  venue: "Etihad Arena",
  location: "Abu Dhabi, United Arab Emirates",
  startsAt: "2099-07-25T16:00:00.000Z",
  locksAt: "2099-07-25T16:00:00.000Z",
  season: 2026,
  status: "upcoming",
  bouts: [
    {
      boutId: "ankalaev-guskov",
      position: 1,
      weightClass: "Light Heavyweight",
      redFighterSlug: "magomed-ankalaev",
      redFighterName: "Magomed Ankalaev",
      blueFighterSlug: "bogdan-guskov",
      blueFighterName: "Bogdan Guskov",
      redAmericanOdds: -180,
      blueAmericanOdds: 155,
      winnerFighterSlug: null,
    },
    {
      boutId: "erceg-temirov",
      position: 2,
      weightClass: "Flyweight",
      redFighterSlug: "steve-erceg",
      redFighterName: "Steve Erceg",
      blueFighterSlug: "ramazan-temirov",
      blueFighterName: "Ramazan Temirov",
      redAmericanOdds: -120,
      blueAmericanOdds: 100,
      winnerFighterSlug: null,
    },
  ],
};

function identityGateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: cody.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => cody,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function dayOffset(day: string, offset: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function challengeRow(overrides: Partial<PlayChallenge>): PlayChallenge {
  return {
    code: "MATCH123",
    gameId: "find-leader",
    gameVersion: "find-leader-v2",
    gameTitle: "Find the Leader",
    summary: "Who has the most UFC wins?",
    creatorId: shane.id,
    recipientId: cody.id,
    playUrl: "https://example.test/play/find-leader?day=2026-07-24",
    setup: { day: "2026-07-24" },
    creatorResult: { score: 8 },
    responderResult: null,
    createdAt: "2026-07-24T12:00:00.000Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-08-23T12:00:00.000Z",
    hiddenFor: [],
    ...overrides,
  };
}

function challengeRepository(load = vi.fn(async () => ({
  challenges: [
    challengeRow({ code: "RECEIVED1" }),
    challengeRow({
      code: "WAITING1",
      creatorId: cody.id,
      recipientId: shane.id,
      createdAt: "2026-07-24T10:00:00.000Z",
    }),
    challengeRow({
      code: "COMPLETE1",
      responderResult: { score: 7 },
      completedAt: "2026-07-24T13:00:00.000Z",
    }),
  ],
  profiles: [shane],
}))) : ChallengeRepository {
  return {
    load,
    findProfile: async () => shane,
    create: async () => "MATCH123",
    markOpened: async () => undefined,
    submitResult: async () => undefined,
    dismiss: async () => undefined,
  };
}

function picksRepository(): PicksRepository {
  return {
    loadCurrentEvent: async () => pickEvent,
    loadMyPicks: async () => [{
      eventId: pickEvent.eventId,
      boutId: "ankalaev-guskov",
      fighterSlug: "magomed-ankalaev",
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }],
    loadMyHistory: async () => ({
      season: null,
      summary: { correct: 12, incorrect: 8, missing: 0, excluded: 0, eventsEntered: 4, basePoints: 48, lockBonus: 0, totalPoints: 48 },
      events: [],
    }),
    loadMySummary: async () => ({ correct: 12, incorrect: 8, pending: 1, eventsEntered: 4, basePoints: 48, lockBonus: 0, totalPoints: 48 }),
    loadMyUnderdogLock: async () => null,
    setUnderdogLock: vi.fn(),
    clearUnderdogLock: vi.fn(),
    savePick: async (eventId, boutId, fighterSlug) => ({
      eventId,
      boutId,
      fighterSlug,
      pickedAt: "2026-07-24T12:00:00.000Z",
      updatedAt: "2026-07-24T12:00:00.000Z",
    }),
  };
}

describe("Your HQ", () => {
  it("shows an understandable sign-in state instead of broken profile zeros", async () => {
    render(
      <IdentityProvider gateway={null}>
        <ProfilePreferencesProvider repository={null}>
          <PicksProvider repository={picksRepository()}>
            <FindLeaderHistoryProvider repository={null}>
              <ChallengeProvider repository={null}>
                <MemoryRouter><HomePage /></MemoryRouter>
              </ChallengeProvider>
            </FindLeaderHistoryProvider>
          </PicksProvider>
        </ProfilePreferencesProvider>
      </IdentityProvider>,
    );

    expect(screen.getByRole("button", { name: "SIGN IN TO YOUR HQ" })).toBeInTheDocument();
    expect(screen.getByText(/carry your official game history/i)).toBeInTheDocument();
    expect(screen.queryByText("0", { exact: true })).not.toBeInTheDocument();
    expect(await screen.findByText("Ankalaev vs. Guskov")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SIGN IN TO MAKE PICKS →" })).toBeInTheDocument();
    expect(screen.getByText("RANKING SPOTLIGHT")).toBeInTheDocument();
    expect(screen.getByText("Shane’s Fighters to Watch").closest("details")).not.toHaveAttribute("open");
  });

  it("shows profile data, the highest-priority next action, the next event, and the approved lower Home sections", async () => {
    const today = centralDay();
    const historyRepository: FindLeaderHistoryRepository = {
      load: async () => [
        { day: today, officialScore: 8, bestScore: 10, attempts: 2, completedAt: `${today}T12:00:00.000Z` },
        { day: dayOffset(today, -1), officialScore: 7, bestScore: 7, attempts: 1, completedAt: `${dayOffset(today, -1)}T12:00:00.000Z` },
      ],
      recordAttempt: async () => ({ day: today, officialScore: 8, bestScore: 10, attempts: 3, completedAt: `${today}T12:00:00.000Z` }),
    };
    const saveFavoriteFighter = vi.fn(async (slug: string | null) => slug);
    const preferencesRepository: ProfilePreferencesRepository = {
      loadFavoriteFighter: async () => "georges-st-pierre",
      saveFavoriteFighter,
    };
    const loadChallenges = vi.fn(async () => challengeRepository().load());

    render(
      <IdentityProvider gateway={identityGateway()}>
        <ProfilePreferencesProvider repository={preferencesRepository}>
          <PicksProvider repository={picksRepository()}>
            <FindLeaderHistoryProvider repository={historyRepository}>
              <ChallengeProvider repository={challengeRepository(loadChallenges)}>
                <MemoryRouter><HomePage /></MemoryRouter>
              </ChallengeProvider>
            </FindLeaderHistoryProvider>
          </PicksProvider>
        </ProfilePreferencesProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("CODY")).toBeInTheDocument();

    const streakCard = screen.getByText("Daily streak").closest("article")!;
    await waitFor(() => expect(within(streakCard).getByText("2")).toBeInTheDocument());

    const picksCard = screen.getByText("Current Picks record").closest("article")!;
    await waitFor(() => expect(within(picksCard).getByText("12-8")).toBeInTheDocument());
    expect(within(picksCard).getByText(/1 PENDING/)).toBeInTheDocument();

    const favoriteCard = screen.getByText("Favorite fighter").closest("article")!;
    await waitFor(() => expect(within(favoriteCard).getByText("Georges St-Pierre")).toBeInTheDocument());

    const challengeCard = screen.getByText("Open challenges").closest("article")!;
    await waitFor(() => expect(within(challengeCard).getByText("2")).toBeInTheDocument());
    expect(loadChallenges).toHaveBeenCalledTimes(1);

    expect(screen.getByText("SHANE is waiting for your answer")).toBeInTheDocument();
    const action = screen.getByRole("link", { name: "RESPOND TO CHALLENGE" });
    expect(action).toHaveAttribute("href", expect.stringContaining("challenge=RECEIVED1"));

    fireEvent.change(screen.getByRole("combobox", { name: "Favorite fighter" }), {
      target: { value: "jon-jones" },
    });
    await waitFor(() => expect(saveFavoriteFighter).toHaveBeenCalledWith("jon-jones"));
    await waitFor(() => expect(within(favoriteCard).getByText("Jon Jones")).toBeInTheDocument());

    expect(screen.getByText("Magomed Ankalaev vs. Bogdan Guskov")).toBeInTheDocument();
    expect(screen.getByText("1 OF 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MAKE PICKS →" })).toHaveAttribute("href", "/picks");
    expect(screen.getByText("RANKING SPOTLIGHT")).toBeInTheDocument();
    expect(screen.getByText("Shane’s Fighters to Watch").closest("details")).not.toHaveAttribute("open");
  });
});

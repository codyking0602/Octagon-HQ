import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider, usePlayChallenges } from "../challenges/ChallengeProvider";
import type { ChallengeRepository } from "../challenges/challengeRepository";
import type { PlayChallenge } from "../challenges/challengeModel";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import type { IdentityProfile } from "../identity/identityModel";
import { PicksProvider } from "../picks/PicksProvider";
import type { PicksRepository } from "../picks/picksRepository";
import { FindLeaderHistoryProvider } from "../play/FindLeaderHistoryProvider";
import type { FindLeaderHistoryRepository } from "../play/findLeaderHistoryRepository";
import { centralDay } from "../play/findLeaderEngine";
import { ProfilePreferencesProvider } from "../profile/ProfilePreferencesProvider";
import type { ProfilePreferencesRepository } from "../profile/profilePreferencesRepository";
import { MemberDirectoryView } from "./MemberDirectoryPage";
import { MemberProfileView } from "./MemberProfilePage";
import type { MemberProfilesRepository } from "./memberProfilesRepository";

const cody: IdentityProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

const shane: IdentityProfile = {
  id: "22222222-2222-4222-8222-222222222222",
  displayName: "SHANE",
  initials: "SH",
};

function identityGateway(profile: IdentityProfile | null): IdentityGateway {
  return {
    getSession: vi.fn(async () => profile ? { userId: profile.id } : null),
    subscribe: vi.fn(() => vi.fn()),
    loadProfile: vi.fn(async (userId) => profile?.id === userId ? profile : null),
    signIn: vi.fn(async () => undefined),
    createProfile: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
  };
}

function historyRepository(): FindLeaderHistoryRepository {
  const today = centralDay();
  const yesterday = new Date(`${today}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return {
    load: vi.fn(async () => [
      { day: today, officialScore: 10, bestScore: 10, attempts: 1, completedAt: `${today}T12:00:00Z` },
      { day: yesterday.toISOString().slice(0, 10), officialScore: 7, bestScore: 9, attempts: 2, completedAt: yesterday.toISOString() },
    ]),
    recordAttempt: vi.fn(),
  };
}

function preferencesRepository(favorite = "jon-jones"): ProfilePreferencesRepository {
  return {
    loadFavoriteFighter: vi.fn(async () => favorite || null),
    saveFavoriteFighter: vi.fn(async (slug) => slug),
  };
}

function picksRepository(): PicksRepository {
  return {
    loadCurrentEvent: vi.fn(async () => ({
      eventId: "test-event",
      name: "UFC Test",
      subtitle: "Main vs. Event",
      venue: "Arena",
      location: "Dallas, Texas",
      startsAt: "2026-08-01T00:00:00Z",
      locksAt: "2026-08-01T00:00:00Z",
      season: 2026,
      status: "upcoming" as const,
      bouts: [],
    })),
    loadMyPicks: vi.fn(async () => []),
    loadMySummary: vi.fn(async () => ({ correct: 3, incorrect: 1, pending: 2, eventsEntered: 2 })),
    savePick: vi.fn(),
  };
}

function challenge(overrides: Partial<PlayChallenge>): PlayChallenge {
  return {
    code: "MATCH123",
    gameId: "find-leader",
    gameVersion: "find-leader-v2",
    gameTitle: "Find the Leader",
    summary: "Who has the most UFC wins?",
    creatorId: cody.id,
    recipientId: shane.id,
    playUrl: "https://octagon.test/play/find-leader",
    setup: {},
    creatorResult: { score: 8 },
    responderResult: { score: 6 },
    createdAt: "2026-07-25T12:00:00.000Z",
    openedAt: "2026-07-25T12:05:00.000Z",
    completedAt: "2026-07-25T12:10:00.000Z",
    declinedAt: null,
    expiresAt: "2026-08-24T12:00:00.000Z",
    hiddenFor: [],
    ...overrides,
  };
}

function challengeRepository(rows: PlayChallenge[] = []): ChallengeRepository {
  return {
    load: vi.fn(async () => ({ challenges: rows, profiles: [cody, shane] })),
    findProfile: vi.fn(async (displayName) => displayName === "SHANE" ? shane : null),
    create: vi.fn(async () => "NEWCODE1"),
    markOpened: vi.fn(async () => undefined),
    submitResult: vi.fn(async () => undefined),
    dismiss: vi.fn(async () => undefined),
  };
}

function memberRepository(favoriteFighterSlug: string | null = "georges-st-pierre"): MemberProfilesRepository {
  return {
    listMembers: vi.fn(async () => [
      {
        displayName: "CODY",
        initials: "CK",
        favoriteFighterSlug: "jon-jones",
        currentStreak: 2,
        picksCorrect: 3,
        picksIncorrect: 1,
        isCurrentUser: true,
      },
      {
        displayName: "SHANE",
        initials: "SH",
        favoriteFighterSlug,
        currentStreak: 4,
        picksCorrect: 5,
        picksIncorrect: 2,
        isCurrentUser: false,
      },
    ]),
    loadMember: vi.fn(async (displayName) => displayName === "SHANE" ? {
      displayName: "SHANE",
      initials: "SH",
      favoriteFighterSlug,
      currentStreak: 4,
      bestStreak: 9,
      perfectRuns: 3,
      recordedDays: 24,
      bestFindLeaderScore: 10,
      picksCorrect: 5,
      picksIncorrect: 2,
      picksPending: 1,
      picksEventsEntered: 4,
      isCurrentUser: false,
    } : null),
  };
}

function Providers({
  children,
  profile = cody,
  challenges = [],
  favorite = "jon-jones",
}: {
  children: React.ReactNode;
  profile?: IdentityProfile | null;
  challenges?: PlayChallenge[];
  favorite?: string;
}) {
  return (
    <IdentityProvider gateway={identityGateway(profile)}>
      <ProfilePreferencesProvider repository={preferencesRepository(favorite)}>
        <PicksProvider repository={picksRepository()}>
          <FindLeaderHistoryProvider repository={historyRepository()}>
            <ChallengeProvider repository={challengeRepository(challenges)}>
              {children}
            </ChallengeProvider>
          </FindLeaderHistoryProvider>
        </PicksProvider>
      </ProfilePreferencesProvider>
    </IdentityProvider>
  );
}

function ChallengeIntentProbe() {
  const challenges = usePlayChallenges();
  return (
    <div>
      <span data-testid="preferred-member">{challenges.preferredRecipientName || "NONE"}</span>
      <button type="button" onClick={() => void challenges.beginChallenge({
        gameId: "find-leader",
        gameVersion: "find-leader-v2",
        gameTitle: "Find the Leader",
        summary: "Who has the most UFC wins?",
        setup: {},
        creatorResult: { score: 8 },
        shareTitle: "Challenge",
        shareText: "Play me",
        shareUrl: "https://octagon.test/play/find-leader",
      })}>OPEN COMPOSER</button>
    </div>
  );
}

afterEach(cleanup);

describe("Member Profiles", () => {
  it("keeps the signed-out directory private and does not query members", async () => {
    const repository = memberRepository();
    render(
      <MemoryRouter>
        <Providers profile={null}>
          <MemberDirectoryView repository={repository} />
        </Providers>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "Sign in to view the member directory" })).toBeInTheDocument();
    expect(repository.listMembers).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "SIGN IN TO VIEW MEMBERS" })).toBeInTheDocument();
  });

  it("renders real signed-in member cards with safe competitive signals", async () => {
    render(
      <MemoryRouter>
        <Providers>
          <MemberDirectoryView repository={memberRepository()} />
        </Providers>
      </MemoryRouter>,
    );

    const codyCard = await screen.findByRole("link", { name: "View CODY member profile" });
    expect(codyCard).toHaveTextContent("YOU");
    expect(codyCard).toHaveTextContent("Jon Jones");
    expect(codyCard).toHaveTextContent("3-1");
    const shaneCard = screen.getByRole("link", { name: "View SHANE member profile" });
    expect(shaneCard).toHaveAttribute("href", "/members/SHANE");
    expect(shaneCard).toHaveTextContent("Georges St-Pierre");
    expect(shaneCard).toHaveTextContent("4");
  });

  it("renders the own profile from canonical providers and edits only the existing favorite preference", async () => {
    const preferences = preferencesRepository("jon-jones");
    render(
      <MemoryRouter>
        <IdentityProvider gateway={identityGateway(cody)}>
          <ProfilePreferencesProvider repository={preferences}>
            <PicksProvider repository={picksRepository()}>
              <FindLeaderHistoryProvider repository={historyRepository()}>
                <ChallengeProvider repository={challengeRepository()}>
                  <MemberProfileView memberName="CODY" repository={memberRepository()} />
                </ChallengeProvider>
              </FindLeaderHistoryProvider>
            </PicksProvider>
          </ProfilePreferencesProvider>
        </IdentityProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "CODY" })).toBeInTheDocument();
    expect(screen.getByText("YOUR OCTAGON HQ PROFILE")).toBeInTheDocument();
    expect(screen.getByText("3-1")).toBeInTheDocument();
    expect(screen.getByText("10/10")).toBeInTheDocument();
    const favorite = screen.getByRole("combobox", { name: "Favorite fighter" });
    fireEvent.change(favorite, { target: { value: "georges-st-pierre" } });
    await waitFor(() => expect(preferences.saveFavoriteFighter).toHaveBeenCalledWith("georges-st-pierre"));
  });

  it("renders another member read-only, falls back to initials without a favorite, and uses the existing challenge composer", async () => {
    const challengeRepo = challengeRepository();
    render(
      <MemoryRouter initialEntries={["/members/SHANE"]}>
        <IdentityProvider gateway={identityGateway(cody)}>
          <ProfilePreferencesProvider repository={preferencesRepository()}>
            <PicksProvider repository={picksRepository()}>
              <FindLeaderHistoryProvider repository={historyRepository()}>
                <ChallengeProvider repository={challengeRepo}>
                  <Routes>
                    <Route path="/members/SHANE" element={<MemberProfileView memberName="SHANE" repository={memberRepository(null)} />} />
                    <Route path="/play" element={<ChallengeIntentProbe />} />
                  </Routes>
                </ChallengeProvider>
              </FindLeaderHistoryProvider>
            </PicksProvider>
          </ProfilePreferencesProvider>
        </IdentityProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "SHANE" })).toBeInTheDocument();
    expect(screen.getByText("Not set")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Favorite fighter" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PLAY A GAME TO CHALLENGE SHANE" }));
    expect(await screen.findByTestId("preferred-member")).toHaveTextContent("SHANE");
    fireEvent.click(screen.getByRole("button", { name: "OPEN COMPOSER" }));
    await waitFor(() => expect(challengeRepo.findProfile).toHaveBeenCalledWith("SHANE", cody.id));
    expect(await screen.findByDisplayValue("SHANE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "SEND TO PROFILE" })).toBeEnabled();
  });

  it("uses real scores for measurable games and comparison-only copy for subjective games", async () => {
    const rows = [
      challenge({ code: "SCORED01" }),
      challenge({
        code: "COMPARE1",
        gameId: "better-than",
        gameVersion: "better-than-v1",
        gameTitle: "Better Than…",
        summary: "Name three better strikers",
        creatorResult: {
          claimCount: 3,
          selections: [
            { id: "a", name: "A" },
            { id: "b", name: "B" },
            { id: "c", name: "C" },
          ],
        },
        responderResult: {
          claimCount: 3,
          selections: [
            { id: "a", name: "A" },
            { id: "d", name: "D" },
            { id: "e", name: "E" },
          ],
        },
      }),
    ];

    render(
      <MemoryRouter>
        <Providers challenges={rows}>
          <MemberProfileView memberName="SHANE" repository={memberRepository()} />
        </Providers>
      </MemoryRouter>,
    );

    const section = (await screen.findByRole("heading", { name: "Your matchups with SHANE" })).closest("section")!;
    expect(within(section).getByText("CODY wins")).toBeInTheDocument();
    expect(within(section).getByText("CODY 8/10 · SHANE 6/10")).toBeInTheDocument();
    expect(within(section).getByText("1 shared names")).toBeInTheDocument();
    expect(within(section).getByText("COMPARISON · NO OFFICIAL WINNER")).toBeInTheDocument();
    expect(within(section).queryByText("SHANE wins", { exact: false })).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { ChallengeCenter } from "./ChallengeCenter";
import { ChallengeProvider, usePlayChallenges } from "./ChallengeProvider";
import type { ChallengeProfile, PlayChallenge } from "./challengeModel";
import type { ChallengeRepository } from "./challengeRepository";

vi.mock("../members/memberProfilesRepository", () => ({
  createMemberProfilesRepository: () => ({
    listMembers: async () => [
      {
        displayName: "CODY",
        initials: "CK",
        avatarPhotoData: null,
        favoriteFighterSlug: "jon-jones",
        currentStreak: 2,
        picksCorrect: 3,
        picksIncorrect: 1,
        isCurrentUser: true,
      },
      {
        displayName: "SHANE",
        initials: "SH",
        avatarPhotoData: "data:image/webp;base64,shane",
        favoriteFighterSlug: null,
        currentStreak: 4,
        picksCorrect: 5,
        picksIncorrect: 2,
        isCurrentUser: false,
      },
    ],
    loadMember: async () => null,
  }),
}));

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

function challengeRow(): PlayChallenge {
  return {
    code: "MATCH123",
    gameId: "find-leader",
    gameVersion: "find-leader-v2",
    gameTitle: "Find the Leader",
    summary: "Who has the most UFC wins?",
    creatorId: cody.id,
    recipientId: shane.id,
    playUrl: "https://example.test/play/find-leader",
    setup: { day: "2026-07-24" },
    creatorResult: { score: 8 },
    responderResult: null,
    createdAt: "2026-07-24T12:00:00.000Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-08-23T12:00:00.000Z",
    hiddenFor: [],
  };
}

function fakeRepository(overrides: Partial<ChallengeRepository> = {}): ChallengeRepository {
  return {
    load: async () => ({ challenges: [challengeRow()], profiles: [shane] }),
    findProfile: async () => shane,
    create: async () => "MATCH123",
    markOpened: async () => undefined,
    submitResult: async () => undefined,
    dismiss: async () => undefined,
    ...overrides,
  };
}

function ProfileLookup() {
  const challenges = usePlayChallenges();
  const [result, setResult] = useState("");
  return (
    <div>
      <button type="button" onClick={() => void challenges.findProfile("SHANE").then((profile) => setResult(profile?.displayName ?? "NOT FOUND"))}>FIND SHANE</button>
      <span>{result}</span>
    </div>
  );
}

function ChallengeStarter() {
  const challenges = usePlayChallenges();
  return (
    <div>
      <span>{challenges.activeProfile?.displayName ?? "SIGNED OUT"}</span>
      <button type="button" onClick={() => void challenges.beginChallenge({
        gameId: "find-leader",
        gameVersion: "find-leader-v2",
        gameTitle: "Find the Leader",
        summary: "Who has the most UFC wins?",
        setup: { day: "2026-07-24" },
        creatorResult: { score: 8 },
        shareTitle: "Find the Leader Challenge",
        shareText: "Play my board",
        shareUrl: "https://example.test/play/find-leader",
      })}>START CHALLENGE</button>
    </div>
  );
}

afterEach(() => {
  document.body.style.overflow = "";
});

describe("real profile challenges", () => {
  it("uses the authenticated profile and removes the preview identity switcher", async () => {
    render(
      <IdentityProvider gateway={identityGateway()}>
        <ChallengeProvider repository={fakeRepository()}>
          <MemoryRouter><ChallengeCenter /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("heading", { name: "CODY's matchups" })).toBeTruthy();
    expect(await screen.findByRole("link", { name: "View SHANE member profile" })).toBeTruthy();
    expect(screen.getByText("Find the Leader", { exact: false })).toBeTruthy();
    expect(screen.queryByText("PREVIEW MODE")).toBeNull();
  });

  it("exposes the canonical exact-name profile lookup without a second query path", async () => {
    const findProfile = vi.fn(async () => shane);
    render(
      <IdentityProvider gateway={identityGateway()}>
        <ChallengeProvider repository={fakeRepository({ findProfile })}>
          <MemoryRouter><ProfileLookup /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("FIND SHANE")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "FIND SHANE" }));
    expect(await screen.findByText("SHANE")).toBeTruthy();
    expect(findProfile).toHaveBeenCalledWith("SHANE", cody.id);
  });

  it("selects a populated member and creates the shared challenge for that profile", async () => {
    const findProfile = vi.fn(async () => shane);
    const create = vi.fn(async () => "MATCH123");

    render(
      <IdentityProvider gateway={identityGateway()}>
        <ChallengeProvider repository={fakeRepository({ findProfile, create })}>
          <MemoryRouter><ChallengeStarter /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByText("CODY")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "START CHALLENGE" }));

    const shaneOption = await screen.findByRole("option", { name: /SHANE/i });
    fireEvent.click(shaneOption);

    expect(await screen.findByText("SHANE SELECTED")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "SEND TO PROFILE" }));

    await waitFor(() => expect(findProfile).toHaveBeenCalledWith("SHANE", cody.id));
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({
      recipientId: shane.id,
      gameId: "find-leader",
      creatorResult: { score: 8 },
    })));
  });
});

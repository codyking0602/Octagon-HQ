import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { ChallengeCenter } from "./ChallengeCenter";
import { ChallengeProvider, usePlayChallenges } from "./ChallengeProvider";
import type { ChallengeProfile, PlayChallenge } from "./challengeModel";
import type { ChallengeRepository } from "./challengeRepository";

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
    expect(screen.getByText("SHANE · Find the Leader")).toBeTruthy();
    expect(screen.queryByText("PREVIEW MODE")).toBeNull();
  });

  it("finds an exact profile name and creates the shared challenge for that profile", async () => {
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

    const input = await screen.findByLabelText("PROFILE NAME");
    fireEvent.change(input, { target: { value: "shane" } });
    fireEvent.click(screen.getByRole("button", { name: "FIND PROFILE" }));

    expect(await screen.findByText("SHANE FOUND")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "SEND TO PROFILE" }));

    await waitFor(() => expect(findProfile).toHaveBeenCalledWith("SHANE", cody.id));
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({
      recipientId: shane.id,
      gameId: "find-leader",
      creatorResult: { score: 8 },
    })));
  });
});

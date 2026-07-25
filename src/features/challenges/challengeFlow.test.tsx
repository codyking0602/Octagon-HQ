import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import PlayPage from "../play/PlayPage";
import { centralDay, dailyFindLeaderBoard } from "../play/findLeaderEngine";
import { ChallengeCenter } from "./ChallengeCenter";
import { ChallengeProvider } from "./ChallengeProvider";
import FindLeaderChallengeRoute from "./FindLeaderChallengeRoute";
import type { ChallengeProfile, PlayChallenge } from "./challengeModel";
import type { ChallengeRepository, RemoteChallengeDraft } from "./challengeRepository";

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

function identityGateway(profile: ChallengeProfile): IdentityGateway {
  return {
    getSession: async () => ({ userId: profile.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => profile,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function fakeRepository(overrides: Partial<ChallengeRepository> = {}): ChallengeRepository {
  return {
    load: async () => ({ challenges: [], profiles: [] }),
    findProfile: async () => shane,
    create: async () => "MATCH123",
    markOpened: async () => undefined,
    submitResult: async () => undefined,
    dismiss: async () => undefined,
    ...overrides,
  };
}

function renderWithProfile(
  element: ReactNode,
  path: string,
  profile: ChallengeProfile,
  repository: ChallengeRepository,
) {
  return render(
    <IdentityProvider gateway={identityGateway(profile)}>
      <ChallengeProvider repository={repository}>
        <MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>
      </ChallengeProvider>
    </IdentityProvider>,
  );
}

function leaderButton(container: HTMLElement, leaderName: string) {
  return [...container.querySelectorAll<HTMLButtonElement>(".find-card")]
    .find((button) => button.textContent?.includes(leaderName));
}

function profileChallenge(day: string): PlayChallenge {
  const board = dailyFindLeaderBoard(day)!;
  return {
    code: "MATCH123",
    gameId: "find-leader",
    gameVersion: board.version,
    gameTitle: "Find the Leader",
    summary: board.question,
    creatorId: cody.id,
    recipientId: shane.id,
    playUrl: `https://example.test/play/find-leader?day=${day}`,
    setup: JSON.parse(JSON.stringify({ day, board })),
    creatorResult: null,
    responderResult: null,
    createdAt: "2026-07-24T12:00:00.000Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-08-23T12:00:00.000Z",
    hiddenFor: [],
  };
}

describe("real profile Challenge Center flow", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
    Object.defineProperty(window, "scrollTo", { value: vi.fn(), writable: true });
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
    vi.restoreAllMocks();
  });

  it("freezes CODY's exact board and sends it to the real SHANE profile", async () => {
    const day = centralDay();
    const board = dailyFindLeaderBoard(day)!;
    const leader = board.candidates.find((fighter) => fighter.id === board.leaderId)!;
    const create = vi.fn(async (_draft: RemoteChallengeDraft) => "MATCH123");
    const findProfile = vi.fn(async () => shane);
    const repository = fakeRepository({ create, findProfile });

    const creatorView = renderWithProfile(<PlayPage />, `/play/find-leader?day=${day}`, cody, repository);
    fireEvent.click(leaderButton(creatorView.container, leader.name)!);
    fireEvent.click(screen.getByRole("button", { name: "CHALLENGE SOMEONE" }));

    expect(await screen.findByRole("dialog", { name: "Challenge Someone" })).toBeTruthy();
    expect(screen.getByText(/Enter the exact Octagon HQ profile name/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "TEXT / SHARE LINK" }));
    await waitFor(() => expect(navigator.share).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("PROFILE NAME"), { target: { value: "shane" } });
    fireEvent.click(screen.getByRole("button", { name: "FIND PROFILE" }));
    expect(await screen.findByText("SHANE FOUND")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "SEND TO PROFILE" }));

    await waitFor(() => expect(findProfile).toHaveBeenCalledWith("SHANE", cody.id));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));

    const sent = create.mock.calls[0]![0];
    expect(sent.recipientId).toBe(shane.id);
    expect(sent.creatorResult).toEqual({
      score: 1,
      perfect: false,
      fatalId: leader.id,
      eliminated: [leader.id],
    });

    const storedSetup = sent.setup as unknown as {
      day: string;
      board: { leaderId: string; candidates: Array<{ id: string }> };
    };
    expect(storedSetup.day).toBe(board.day);
    expect(storedSetup.board.leaderId).toBe(board.leaderId);
    expect(storedSetup.board.candidates.map((fighter) => fighter.id))
      .toEqual(board.candidates.map((fighter) => fighter.id));
  });

  it("loads the masked challenge for SHANE, marks it opened, and submits SHANE's result", async () => {
    const day = centralDay();
    const board = dailyFindLeaderBoard(day)!;
    const leader = board.candidates.find((fighter) => fighter.id === board.leaderId)!;
    const row = profileChallenge(day);
    const markOpened = vi.fn(async () => undefined);
    const submitResult = vi.fn(async () => undefined);
    const repository = fakeRepository({
      load: async () => ({ challenges: [row], profiles: [cody] }),
      markOpened,
      submitResult,
    });

    const recipientView = renderWithProfile(
      <FindLeaderChallengeRoute />,
      `/play/find-leader?challenge=${row.code}&day=${day}`,
      shane,
      repository,
    );

    expect(await screen.findByText("CODY sent this exact board.")).toBeTruthy();
    await waitFor(() => expect(markOpened).toHaveBeenCalledWith(row.code));

    fireEvent.click(leaderButton(recipientView.container, leader.name)!);
    await waitFor(() => expect(submitResult).toHaveBeenCalledWith(row.code, {
      score: 1,
      perfect: false,
      fatalId: leader.id,
      eliminated: [leader.id],
    }));
  });

  it("shows CODY's shared All, Received, and Sent views without a preview switcher", async () => {
    const row = profileChallenge("2026-07-24");
    const repository = fakeRepository({
      load: async () => ({ challenges: [{ ...row, creatorResult: { score: 8 } }], profiles: [shane] }),
    });

    renderWithProfile(<ChallengeCenter />, "/play", cody, repository);

    expect(await screen.findByRole("heading", { name: "CODY's matchups" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "ALL 1" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "RECEIVED 0" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "SENT 1" })).toBeTruthy();
    expect(screen.getByText("WAITING")).toBeTruthy();
    expect(screen.queryByText("PREVIEW MODE")).toBeNull();
  });
});

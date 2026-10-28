import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { ChallengeCenter } from "./ChallengeCenter";
import { ChallengeProvider } from "./ChallengeProvider";
import type { ChallengeProfile, PlayChallenge } from "./challengeModel";
import type { ChallengeRepository } from "./challengeRepository";

const auctionRepositoryMocks = vi.hoisted(() => ({
  read: vi.fn(),
  cancel: vi.fn(),
}));

vi.mock("../play/auctionRepository", () => ({
  createAuctionRepository: () => ({
    prepare: vi.fn(),
    read: auctionRepositoryMocks.read,
    bid: vi.fn(),
    abandon: vi.fn(),
    cancel: auctionRepositoryMocks.cancel,
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

function auctionChallenge(overrides: Partial<PlayChallenge> = {}): PlayChallenge {
  return {
    code: "AUCTION1",
    gameId: "auction",
    gameVersion: "auction-server-v3",
    gameTitle: "Auction",
    summary: "ultimate-fighter",
    creatorId: shane.id,
    recipientId: cody.id,
    playUrl: "/play/auction?auction=10000000-0000-4000-8000-000000000001",
    setup: {},
    creatorResult: {},
    responderResult: null,
    createdAt: "2026-08-01T12:00:00.000Z",
    openedAt: null,
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-09-01T12:00:00.000Z",
    hiddenFor: [],
    ...overrides,
  };
}

function repository(challenge: PlayChallenge, dismiss = vi.fn(async () => undefined)): ChallengeRepository {
  return {
    load: async () => ({ challenges: [challenge], profiles: [shane] }),
    findProfile: async () => shane,
    create: async () => challenge.code,
    markOpened: async () => undefined,
    submitResult: async () => undefined,
    dismiss,
  };
}

describe("Auction Challenge Center actions", () => {
  beforeEach(() => {
    auctionRepositoryMocks.read.mockReset();
    auctionRepositoryMocks.cancel.mockReset();
  });

  it("keeps recipient acceptance bid-owned while preserving pre-acceptance decline", async () => {
    const dismiss = vi.fn(async () => undefined);
    render(
      <IdentityProvider gateway={gateway()}>
        <ChallengeProvider repository={repository(auctionChallenge(), dismiss)}>
          <MemoryRouter><ChallengeCenter /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("button", { name: "BID" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /DECLINE SHANE Auction/i }));
    await waitFor(() => expect(dismiss).toHaveBeenCalledWith("AUCTION1"));
  });

  it("lets the sender cancel an unopened Auction through the canonical Auction repository", async () => {
    const dismiss = vi.fn(async () => undefined);
    const challenge = auctionChallenge({
      creatorId: cody.id,
      recipientId: shane.id,
    });
    const auctionState = {
      auction_id: "10000000-0000-4000-8000-000000000001",
      challenge_code: challenge.code,
      challenger_id: cody.id,
      lifecycle_state: "sent",
      revision: 1,
    };
    auctionRepositoryMocks.read.mockResolvedValue(auctionState);
    auctionRepositoryMocks.cancel.mockResolvedValue({ ...auctionState, lifecycle_state: "cancelled", revision: 2 });

    render(
      <IdentityProvider gateway={gateway()}>
        <ChallengeProvider repository={repository(challenge, dismiss)}>
          <MemoryRouter><ChallengeCenter /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: /CANCEL SHANE Auction/i }));
    await waitFor(() => expect(auctionRepositoryMocks.read).toHaveBeenCalledWith(auctionState.auction_id));
    expect(auctionRepositoryMocks.cancel).toHaveBeenCalledWith(auctionState);
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("hides sender cancellation after the recipient opens the Auction", async () => {
    render(
      <IdentityProvider gateway={gateway()}>
        <ChallengeProvider repository={repository(auctionChallenge({
          creatorId: cody.id,
          recipientId: shane.id,
          openedAt: "2026-08-01T12:05:00.000Z",
        }))}>
          <MemoryRouter><ChallengeCenter /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("button", { name: "OPEN" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /CANCEL SHANE Auction/i })).toBeNull();
  });

  it("opens completed Auction server state instead of generic placeholder results", async () => {
    render(
      <IdentityProvider gateway={gateway()}>
        <ChallengeProvider repository={repository(auctionChallenge({
          openedAt: "2026-08-01T12:05:00.000Z",
          completedAt: "2026-08-01T12:10:00.000Z",
          responderResult: {},
        }))}>
          <MemoryRouter><ChallengeCenter /></MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(await screen.findByRole("button", { name: "OPEN" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "RESULTS" })).toBeNull();
    expect(screen.getByRole("button", { name: /REMOVE SHANE Auction/i })).toBeTruthy();
  });
});

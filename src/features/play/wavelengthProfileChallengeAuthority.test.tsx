import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ChallengeProvider } from "../challenges/ChallengeProvider";
import type { ChallengeProfile, PlayChallenge } from "../challenges/challengeModel";
import type { ChallengeRepository, ChallengeSnapshot } from "../challenges/challengeRepository";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import WavelengthGame from "./WavelengthGame";
import { createChallengeWavelengthRound } from "./wavelengthChallenge";
import { wavelengthClues } from "./wavelengthEngine";

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

function shaneIdentityGateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: shane.id }),
    subscribe: () => () => undefined,
    loadProfile: async () => shane,
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function storedChallenge(): PlayChallenge {
  const opening = wavelengthClues[0];
  if (!opening) throw new Error("Wavelength catalog is empty.");
  return {
    code: "MATCH80",
    gameId: "wavelength",
    gameVersion: "wavelength-v3",
    gameTitle: "Wavelength",
    summary: "Find hidden rating 28 through four adaptive clues",
    creatorId: cody.id,
    recipientId: shane.id,
    playUrl: "https://example.test/play/wavelength?challenge=regression-63",
    setup: {
      seed: "regression-63",
      target: 28,
      round: {
        target: 28,
        clues: [opening],
      },
    },
    creatorResult: {
      score: 98,
      guesses: [22, 25, 15, 29],
      finalGuess: 29,
      distance: 1,
    },
    responderResult: null,
    createdAt: "2026-08-19T19:00:00.000Z",
    openedAt: "2026-08-19T19:01:00.000Z",
    completedAt: null,
    declinedAt: null,
    expiresAt: "2026-09-18T19:00:00.000Z",
    hiddenFor: [],
  };
}

describe("Wavelength profile challenge authority", () => {
  it("waits for and plays the stored target instead of regenerating the URL seed", async () => {
    const challenge = storedChallenge();
    const snapshot: ChallengeSnapshot = { challenges: [challenge], profiles: [cody] };
    let resolveInitialLoad: ((value: ChallengeSnapshot) => void) | null = null;
    let firstLoad = true;
    const load = vi.fn(() => {
      if (!firstLoad) return Promise.resolve(snapshot);
      firstLoad = false;
      return new Promise<ChallengeSnapshot>((resolve) => {
        resolveInitialLoad = resolve;
      });
    });
    const submitResult = vi.fn(async () => undefined);
    const repository: ChallengeRepository = {
      load,
      findProfile: async () => cody,
      create: async () => challenge.code,
      markOpened: async () => undefined,
      submitResult,
      dismiss: async () => undefined,
    };

    expect(createChallengeWavelengthRound("regression-63").target).toBe(80);

    render(
      <IdentityProvider gateway={shaneIdentityGateway()}>
        <ChallengeProvider repository={repository}>
          <MemoryRouter initialEntries={["/play/wavelength?challenge=regression-63&match=MATCH80"]}>
            <WavelengthGame challengeSeed="regression-63" onExit={() => undefined} />
          </MemoryRouter>
        </ChallengeProvider>
      </IdentityProvider>,
    );

    expect(screen.getByText("Loading challenge…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" })).toBeNull();

    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    resolveInitialLoad?.(snapshot);

    expect(await screen.findByText("PROFILE CHALLENGE")).toBeInTheDocument();
    expect(await screen.findByText(wavelengthClues[0]!.text)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    fireEvent.click(screen.getByRole("button", { name: "LOCK GUESS & REVEAL NEXT CLUE" }));
    fireEvent.change(screen.getByRole("slider", { name: "Your Wavelength guess from 1 to 100" }), {
      target: { value: "28" },
    });
    fireEvent.click(screen.getByRole("button", { name: "LOCK FINAL GUESS" }));

    expect(await screen.findByText("NAILED IT")).toBeInTheDocument();
    expect(screen.getByText("HIDDEN NUMBER").parentElement).toHaveTextContent("28");
    await waitFor(() => expect(submitResult).toHaveBeenCalledWith(
      challenge.code,
      expect.objectContaining({ score: 100, finalGuess: 28, distance: 0 }),
    ));
  });
});

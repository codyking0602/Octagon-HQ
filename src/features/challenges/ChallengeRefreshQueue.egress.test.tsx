import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChallengeProvider, usePlayChallenges } from "./ChallengeProvider";
import type { ChallengeRepository, ChallengeSnapshot } from "./challengeRepository";

const { profile } = vi.hoisted(() => ({
  profile: { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", initials: "CK" },
}));

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ profile, openDialog: () => undefined }),
}));

vi.mock("../members/memberProfilesRepository", () => ({
  createMemberProfilesRepository: () => ({ listMembers: async () => [] }),
}));

vi.mock("../play/auctionRepository", () => ({
  createAuctionRepository: () => null,
}));

afterEach(cleanup);

function RefreshButton() {
  const challenges = usePlayChallenges();
  return <button type="button" onClick={() => void challenges.refresh()}>REFRESH CHALLENGES</button>;
}

describe("Challenge polling egress", () => {
  it("coalesces concurrent loads but rechecks after an explicit action while a poll is pending", async () => {
    const snapshot: ChallengeSnapshot = { challenges: [], profiles: [] };
    let resolveFirst: ((result: ChallengeSnapshot) => void) | undefined;
    const pending = new Promise<ChallengeSnapshot>((resolve) => { resolveFirst = resolve; });
    const load = vi.fn()
      .mockImplementationOnce(() => pending)
      .mockResolvedValue(snapshot);
    const repository: ChallengeRepository = {
      load,
      findProfile: async () => null,
      create: async () => "MATCH1",
      markOpened: async () => undefined,
      submitResult: async () => undefined,
      dismiss: async () => undefined,
    };

    render(<ChallengeProvider repository={repository}><RefreshButton /></ChallengeProvider>);
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText("REFRESH CHALLENGES"));
    fireEvent.click(screen.getByText("REFRESH CHALLENGES"));
    expect(load).toHaveBeenCalledTimes(1);

    await act(async () => { resolveFirst?.(snapshot); });
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    // The two overlapping refresh requests produce exactly one follow-up.
    expect(load).toHaveBeenCalledTimes(2);
  });
});

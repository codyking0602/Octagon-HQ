import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import {
  FindLeaderHistoryProvider,
  useFindLeaderHistory,
} from "./FindLeaderHistoryProvider";
import type { FindLeaderHistoryRepository } from "./findLeaderHistoryRepository";
import { loadDeviceFindLeaderHistory } from "./findLeaderStorage";

const cody = {
  id: "11111111-1111-4111-8111-111111111111",
  displayName: "CODY",
  initials: "CK",
};

function signedInGateway(): IdentityGateway {
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
  const history = useFindLeaderHistory();
  return (
    <div>
      <span data-testid="mode">{history.profileBacked ? "PROFILE" : "DEVICE"}</span>
      <span data-testid="score">{history.rows[0]?.officialScore ?? "NONE"}</span>
      <button type="button" onClick={() => void history.recordAttempt("2026-07-24", 10)}>RECORD</button>
    </div>
  );
}

describe("Find the Leader history owner", () => {
  beforeEach(() => window.localStorage.clear());

  it("uses only the authenticated profile repository while signed in", async () => {
    const recordAttempt = vi.fn(async () => ({
      day: "2026-07-24",
      officialScore: 6,
      bestScore: 10,
      attempts: 2,
      completedAt: "2026-07-24T12:00:00.000Z",
    }));
    const repository: FindLeaderHistoryRepository = {
      load: async () => [{
        day: "2026-07-24",
        officialScore: 6,
        bestScore: 6,
        attempts: 1,
        completedAt: "2026-07-24T11:00:00.000Z",
      }],
      recordAttempt,
    };

    render(
      <IdentityProvider gateway={signedInGateway()}>
        <FindLeaderHistoryProvider repository={repository}>
          <Probe />
        </FindLeaderHistoryProvider>
      </IdentityProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("mode")).toHaveTextContent("PROFILE"));
    await waitFor(() => expect(screen.getByTestId("score")).toHaveTextContent("6"));
    fireEvent.click(screen.getByRole("button", { name: "RECORD" }));

    await waitFor(() => expect(recordAttempt).toHaveBeenCalledWith("2026-07-24", 10));
    expect(loadDeviceFindLeaderHistory()).toEqual([]);
    expect(screen.getByTestId("score")).toHaveTextContent("6");
  });

  it("keeps signed-out play device-only without calling a remote repository", async () => {
    const recordAttempt = vi.fn();
    const repository: FindLeaderHistoryRepository = {
      load: vi.fn(async () => []),
      recordAttempt,
    };

    render(
      <IdentityProvider gateway={null}>
        <FindLeaderHistoryProvider repository={repository}>
          <Probe />
        </FindLeaderHistoryProvider>
      </IdentityProvider>,
    );

    expect(screen.getByTestId("mode")).toHaveTextContent("DEVICE");
    fireEvent.click(screen.getByRole("button", { name: "RECORD" }));

    await waitFor(() => expect(screen.getByTestId("score")).toHaveTextContent("10"));
    expect(recordAttempt).not.toHaveBeenCalled();
    expect(loadDeviceFindLeaderHistory()).toEqual([
      expect.objectContaining({ day: "2026-07-24", officialScore: 10 }),
    ]);
  });
});

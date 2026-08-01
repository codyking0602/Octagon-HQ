import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IdentityProvider } from "../identity/IdentityProvider";
import { useIdentity } from "../identity/IdentityProvider";
import type { IdentityGateway } from "../identity/identityGateway";
import { FindLeaderDailyLeaderboard } from "./FindLeaderDailyLeaderboard";
import { FindLeaderHistoryProvider } from "./FindLeaderHistoryProvider";
import type {
  FindLeaderDailyLeaderboard as DailyLeaderboard,
  FindLeaderHistoryRepository,
} from "./findLeaderHistoryRepository";

const PROFILE_ID = "11111111-1111-4111-8111-111111111111";
const DAY = "2026-07-29";

function signedInGateway(): IdentityGateway {
  return {
    getSession: async () => ({ userId: PROFILE_ID }),
    subscribe: () => () => undefined,
    loadProfile: async () => ({ id: PROFILE_ID, displayName: "Cody", initials: "CK" }),
    signIn: async () => undefined,
    createProfile: async () => undefined,
    signOut: async () => undefined,
  };
}

function repository(leaderboard: DailyLeaderboard): FindLeaderHistoryRepository {
  return {
    load: async () => leaderboard.unlocked ? [{
      day: DAY,
      officialScore: 8,
      bestScore: 8,
      attempts: 1,
      completedAt: "2026-07-29T12:00:00Z",
    }] : [],
    loadDailyLeaderboard: vi.fn(async () => leaderboard),
    recordAttempt: async (day, score) => ({
      day,
      officialScore: score,
      bestScore: score,
      attempts: 1,
      completedAt: "2026-07-29T12:00:00Z",
    }),
  };
}

function renderLeaderboard(
  leaderboard: DailyLeaderboard,
  gateway: IdentityGateway | null = signedInGateway(),
) {
  return render(
    <IdentityProvider gateway={gateway}>
      <FindLeaderHistoryProvider repository={repository(leaderboard)}>
        <ProfileReadyLeaderboard />
      </FindLeaderHistoryProvider>
    </IdentityProvider>,
  );
}

function ProfileReadyLeaderboard() {
  const identity = useIdentity();
  if (identity.status === "loading") return null;
  return <FindLeaderDailyLeaderboard day={DAY} />;
}

describe("Find the Leader daily leaderboard", () => {
  it("keeps all member scores locked until the signed-in profile completes the daily", async () => {
    renderLeaderboard({ unlocked: false, playerCount: 0, entries: [] });

    expect(await screen.findByText("Complete today’s challenge to unlock")).toBeTruthy();
    expect(screen.queryByText("Shane")).toBeNull();
    expect(screen.getByText("No member scores are revealed until your first official run is recorded.")).toBeTruthy();
  });

  it("pins the current profile and renders the full official-score board with shared tie ranks", async () => {
    const { container } = renderLeaderboard({
      unlocked: true,
      playerCount: 3,
      entries: [
        { rank: 1, displayName: "Shane", initials: "SK", avatarPhotoData: null, officialScore: 10, isCurrentUser: false },
        { rank: 1, displayName: "Tony", initials: "TK", avatarPhotoData: null, officialScore: 10, isCurrentUser: false },
        { rank: 3, displayName: "Cody", initials: "CK", avatarPhotoData: null, officialScore: 8, isCurrentUser: true },
      ],
    });

    await waitFor(() => expect(document.body).toHaveTextContent("3 PLAYED"));
    expect(screen.getByText("YOUR OFFICIAL RESULT")).toBeTruthy();
    expect(screen.getAllByText("T-1")).toHaveLength(2);
    expect(screen.getAllByText("#3")).toHaveLength(2);
    expect(screen.getAllByText("Cody").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector(".play-daily__leaderboard-row.is-current")).toBeTruthy();
    expect(screen.getByText("Official first attempts only. Replays never change leaderboard position.")).toBeTruthy();
  });

  it("requires a profile for the global board instead of exposing scores to signed-out devices", async () => {
    renderLeaderboard({ unlocked: true, playerCount: 1, entries: [] }, null);

    await waitFor(() => expect(screen.getByText("Sign in to unlock the global board")).toBeTruthy());
    expect(screen.queryByText("1 PLAYED")).toBeNull();
  });
});

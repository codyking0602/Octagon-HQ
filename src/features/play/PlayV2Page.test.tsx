// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlayV2Page from "./PlayV2Page";

const mocked = vi.hoisted(() => ({
  runtime: vi.fn(),
  history: vi.fn(),
  profiles: [] as Record<string, unknown>[],
  challenges: [] as Record<string, unknown>[],
  viewResults: vi.fn(),
}));
vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", canControlPicks: true },
  }),
}));
vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({ activeProfile: { id: "11111111-1111-4111-8111-111111111111" },
    profiles: mocked.profiles, challenges: mocked.challenges, loading: false, error: "",
    refresh: vi.fn(), markOpened: vi.fn(), dismissChallenge: vi.fn(),
    cancelPendingAuction: vi.fn(), viewResults: mocked.viewResults }),
}));
vi.mock("./TodayChallengeHub", () => ({
  DailyAnswerDetail: ({ entry, onClose }: { entry: { displayName: string }; onClose: () => void }) => (
    <div role="dialog" aria-label={entry.displayName + " official Daily result"}>
      <button type="button" onClick={onClose}>BACK TO STANDINGS</button>
    </div>
  ),
}));
vi.mock("./WeeklyOverallChampionBanner", () => ({ WeeklyOverallChampionBanner: () => null }));
vi.mock("./DailyRankKeepComboStatus", () => ({ isDailyRankKeepCombo: () => false }));
vi.mock("./useTodayChallengeRuntime", () => ({ useTodayChallengeRuntime: (...args: unknown[]) => mocked.runtime(...args) }));
vi.mock("./useTodayChallengeOverview", () => ({
  useTodayChallengeOverview: () => ({
    leaderboardLoading: false,
    leaderboard: {
      unlocked: true,
      entries: [
        { rank: 1, profileId: "11111111-1111-4111-8111-111111111111", isCurrentUser: true, displayName: "CODY", normalizedScore: 80 },
        { rank: 2, profileId: "22222222-2222-4222-8222-222222222222", isCurrentUser: false, displayName: "SHANE", normalizedScore: 77 },
      ],
    },
  }),
}));
vi.mock("./usePlayV2History", () => ({ usePlayV2History: (...args: unknown[]) => mocked.history(...args) }));

function preview(sport: "football" | "ufc") {
  return render(<MemoryRouter><PlayV2Page sport={sport} onClassic={vi.fn()} /></MemoryRouter>);
}

beforeEach(() => {
  mocked.profiles.length = 0;
  mocked.challenges.length = 0;
  mocked.viewResults.mockClear();
});

describe("owner Play 2.0 preview", () => {
  it("preserves current weekly competition and shows compact official daily, score stats and live approved game routes", () => {
    mocked.runtime.mockReturnValue({
      projection: { gameType: "sports_feud", progressRevision: 4,
        officialAttempt: { normalizedScore: 80 }, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({
      performance: { count: 8, average: 81.25, best: 98, recent: [
        { day: "2026-10-09", gameType: "sports_feud", completedAt: "2026-10-09T12:00:00Z", normalizedScore: 80 },
      ], byGame: [], lastFiveAverage: null, previousFiveAverage: null },
      loading: false, error: null, refresh: vi.fn(),
    });
    preview("football");
    const hub = screen.getByTestId("owner-play-v2");
    expect(within(hub).getByRole("region", { name: "Weekly Featured Championship" })).toHaveTextContent("Auction Center");
    expect(within(hub).getByRole("link", { name: /open current weekly/i })).toHaveAttribute("href", "/football/weekly-auction");
    expect(within(hub).getByRole("region", { name: "Today's Challenge" })).toHaveTextContent("Sports Feud");
    expect(within(hub).getByText("DAILY AVERAGE")).toBeInTheDocument();
    expect(within(hub).getByText("81.3")).toBeInTheDocument();
    expect(within(hub).getByRole("link", { name: /full stats/i })).toHaveAttribute("href", "/football/play-stats");
    expect(within(hub).getByRole("button", { name: /wheel of football/i })).toBeInTheDocument();
    expect(within(hub).getByRole("button", { name: /the gm · college/i })).toBeInTheDocument();
    expect(within(hub).queryByTestId("classic-center")).not.toBeInTheDocument();
    expect(within(hub).queryByText(/LAST 1 RESULTS/)).not.toBeInTheDocument();
    expect(within(hub).queryByText(/CLASSIC PLAY/)).not.toBeInTheDocument();
    expect(within(hub).getByRole("button", { name: /who am i/i })).toBeInTheDocument();
    expect(within(hub).getByRole("button", { name: /higher or lower/i })).toBeInTheDocument();
    expect(within(hub).getByText("6 GAMES")).toBeInTheDocument();
    fireEvent.click(within(hub).getByRole("button", { name: /today's standings/i }));
    expect(within(hub).getByText("SHANE")).toBeInTheDocument();
    fireEvent.click(within(hub).getByRole("button", { name: /view shane\x27s official daily result/i }));
    expect(screen.getByRole("dialog", { name: /shane official daily result/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back to standings/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not manufacture a UFC weekly and explains missing official history", () => {
    mocked.runtime.mockReturnValue({
      projection: { gameType: "who_am_i", progressRevision: 0, officialAttempt: null, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({ performance: { count: 0, average: null, recent: [] },
      loading: false, error: null, refresh: vi.fn() });
    preview("ufc");
    expect(screen.queryByRole("region", { name: "Weekly Featured Championship" })).not.toBeInTheDocument();
    expect(screen.getByText(/No completed official dailies yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /full stats/i })).toHaveAttribute("href", "/play/stats");
    expect(screen.getByRole("button", { name: /wheel of ufc/i })).toBeInTheDocument();
  });
  it("keeps the new matchup list as the only manager and uses real member photos", () => {
    mocked.runtime.mockReturnValue({
      projection: { gameType: "who_am_i", centralDay: "2026-10-09",
        progressRevision: 0, officialAttempt: null, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({ performance: { count: 0, average: null, recent: [] },
      loading: false, error: null, refresh: vi.fn() });
    mocked.profiles.push({ id: "22222222-2222-4222-8222-222222222222", displayName: "TYLER",
      initials: "T", avatarPhotoData: "data:image/png;base64,photo" });
    mocked.challenges.push({
      code: "GMTEST", gameId: "gm-football", gameTitle: "The GM", gameVersion: "v1",
      creatorId: "11111111-1111-4111-8111-111111111111",
      recipientId: "22222222-2222-4222-8222-222222222222",
      createdAt: "2026-10-09T12:00:00Z", openedAt: null, completedAt: null, declinedAt: null,
      responderResult: null, hiddenFor: [], playUrl: "/football/gm?challenge=GMTEST",
    });
    preview("football");
    const region = screen.getByRole("region", { name: "Your Matchups" });
    expect(within(region).getByRole("img")).toHaveAttribute("src", "data:image/png;base64,photo");
    expect(region).toHaveTextContent("Invitation pending");
    fireEvent.click(within(region).getByRole("button", { name: /view all/i }));
    expect(region).toHaveTextContent("1 total · 1 active");
    expect(screen.queryByTestId("classic-center")).not.toBeInTheDocument();
    expect(screen.queryByText("CHALLENGE CENTER")).not.toBeInTheDocument();
    expect(within(region).getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });


});

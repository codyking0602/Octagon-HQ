// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PlayV2Page from "./PlayV2Page";

const mocked = vi.hoisted(() => ({
  profile: { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", canControlPicks: true } as {
    id: string; displayName: string; canControlPicks: boolean;
  } | null,
  status: "ready" as "ready" | "signed-out" | "loading",
  openDialog: vi.fn(),
  runtime: vi.fn(),
  history: vi.fn(),
  profiles: [] as Record<string, unknown>[],
  challenges: [] as Record<string, unknown>[],
  viewResults: vi.fn(),
}));
vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: mocked.status,
    profile: mocked.profile,
    openDialog: mocked.openDialog,
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
  return render(<MemoryRouter><PlayV2Page sport={sport} /></MemoryRouter>);
}

beforeEach(() => {
  mocked.profile = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", canControlPicks: true };
  mocked.status = "ready";
  mocked.openDialog.mockClear();
  mocked.runtime.mockClear();
  mocked.history.mockClear();
  mocked.profiles.length = 0;
  mocked.challenges.length = 0;
  mocked.viewResults.mockClear();
});

describe("public Football/UFC Play 2.0 release", () => {
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
    const hub = screen.getByTestId("play-v2-hub");
    expect(within(hub).getByRole("region", { name: "Weekly Featured Championship" })).toHaveTextContent("Auction Center");
    expect(within(hub).getByRole("link", { name: /open current weekly/i })).toHaveAttribute("href", "/football/weekly-auction");
    expect(within(hub).getByRole("region", { name: "Today's Challenge" })).toHaveTextContent("Sports Feud");
    expect(within(hub).getByText("DAILY AVERAGE")).toBeInTheDocument();
    expect(within(hub).getByText("81.3")).toBeInTheDocument();
    expect(within(hub).getByRole("link", { name: /full stats/i })).toHaveAttribute("href", "/football/play-stats");
    expect(within(hub).getByRole("button", { name: /wheel of football/i })).toBeInTheDocument();
    expect(within(hub).queryByRole("button", { name: /the gm · college/i })).not.toBeInTheDocument();
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

  it("matches Home's October 10 Red River treatment on Football Play without changing the Daily result", () => {
    mocked.runtime.mockReturnValue({
      projection: { centralDay: "2026-10-10", gameType: "millionaire", progressRevision: 9,
        officialAttempt: { normalizedScore: 83 }, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({
      performance: { count: 41, average: 76.9, best: 100, recent: [] },
      loading: false, error: null, refresh: vi.fn(),
    });
    const view = preview("football");
    const daily = within(view.container).getByRole("region", { name: "Today's Challenge" });
    expect(daily).toHaveAttribute("data-special-daily", "red-river");
    expect(daily).toHaveStyle({ "--special-daily-primary": "#BF5700" });
    expect(within(daily).getByLabelText("RED RIVER EDITION: TEXAS vs OKLAHOMA")).toBeInTheDocument();
    expect(within(daily).getByRole("link", { name: /watch the red river rivalry video/i }))
      .toHaveAttribute("href", "https://www.youtube.com/shorts/W4f0b2CwUGM");
    expect(daily).toHaveTextContent("Who Wants to Be a Millionaire?");
    expect(daily).toHaveTextContent("83");
    expect(within(daily).getByRole("button", { name: /view result/i })).toBeInTheDocument();
    expect(within(daily).getByRole("button", { name: /today's standings/i })).toBeInTheDocument();
  });

  it.each([
    ["2026-10-26", "RIVALRY GAME EDITION: COWBOYS @ EAGLES", "#041E42", "#004C54", "millionaire"],
    ["2026-11-27", "LONE STAR SHOWDOWN: TEXAS @ TEXAS A&M", "#BF5700", "#500000", "sports_feud"],
    ["2026-12-07", "COWBOYS GAME DAY: COWBOYS @ SEAHAWKS", "#041E42", "#69BE28", "bar_trivia"],
  ])("features %s on Football Play with its own two-team colors, not Red River", (day, label, primary, opponent, gameType) => {
    mocked.runtime.mockReturnValue({
      projection: { centralDay: day, gameType, progressRevision: 0,
        officialAttempt: null, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({
      performance: { count: 1, average: 80, best: 80, recent: [] },
      loading: false, error: null, refresh: vi.fn(),
    });
    const view = preview("football");
    const daily = within(view.container).getByRole("region", { name: "Today's Challenge" });
    expect(daily).toHaveAttribute("data-special-daily", "team");
    expect(daily).toHaveStyle({
      "--special-daily-primary": primary,
      "--special-daily-opponent": opponent,
    });
    expect(within(daily).getByLabelText(label)).toBeInTheDocument();
    expect(within(daily).queryByText("RED RIVER EDITION")).not.toBeInTheDocument();
    expect(within(daily).queryByRole("link", { name: /rivalry video/i })).not.toBeInTheDocument();
    expect(within(daily).getByRole("button", { name: /play today/i })).toBeInTheDocument();
  });

  it("does not carry Red River styling into UFC or another Football day", () => {
    mocked.runtime.mockReturnValue({
      projection: { centralDay: "2026-10-10", gameType: "sports_feud", progressRevision: 0,
        officialAttempt: null, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({
      performance: { count: 1, average: 80, best: 80, recent: [] },
      loading: false, error: null, refresh: vi.fn(),
    });
    const ufc = preview("ufc");
    const ufcDaily = within(ufc.container).getByRole("region", { name: "Today's Challenge" });
    expect(ufcDaily).not.toHaveAttribute("data-special-daily");
    expect(within(ufcDaily).queryByText("RED RIVER EDITION")).not.toBeInTheDocument();
    ufc.unmount();
    mocked.runtime.mockReturnValue({
      projection: { centralDay: "2026-10-11", gameType: "sports_feud", progressRevision: 0,
        officialAttempt: null, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    const nextDay = preview("football");
    const nextDaily = within(nextDay.container).getByRole("region", { name: "Today's Challenge" });
    expect(nextDaily).not.toHaveAttribute("data-special-daily");
    expect(within(nextDaily).queryByRole("link", { name: /watch the red river rivalry video/i })).not.toBeInTheDocument();
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
      code: "GMTEST", gameId: "gm-football", gameTitle: "The GM", gameVersion: "football-gm-v1",
      creatorId: "11111111-1111-4111-8111-111111111111",
      recipientId: "22222222-2222-4222-8222-222222222222",
      createdAt: "2026-10-09T12:00:00Z", openedAt: null, completedAt: null, declinedAt: null,
      responderResult: null, hiddenFor: [], playUrl: "/football/gm?challenge=GMTEST",
    });
    preview("football");
    const region = screen.getByRole("region", { name: "Your Matchups" });
    expect(region.querySelector(".play-v2__matchup-avatar img")).toHaveAttribute("src", "data:image/png;base64,photo");
    expect(region).toHaveTextContent("Invitation pending");
    fireEvent.click(within(region).getByRole("button", { name: /view all/i }));
    expect(region).toHaveTextContent("1 total · 1 active");
    expect(screen.queryByTestId("classic-center")).not.toBeInTheDocument();
    expect(screen.queryByText("CHALLENGE CENTER")).not.toBeInTheDocument();
    expect(within(region).getByRole("button", { name: /refresh/i })).toBeInTheDocument();
  });


  it("offers the exact same Football and UFC experience to non-owner members", () => {
    mocked.profile = { id: "11111111-1111-4111-8111-111111111111",
      displayName: "SHANE", canControlPicks: false };
    mocked.runtime.mockReturnValue({
      projection: { gameType: "sports_feud", progressRevision: 0, officialAttempt: null, publicState: {} },
      loading: false, error: null, refresh: vi.fn(),
    });
    mocked.history.mockReturnValue({
      performance: { count: 1, average: 84, best: 84, recent: [], byGame: [] },
      loading: false, error: null, refresh: vi.fn(),
    });
    preview("football");
    const hub = screen.getByTestId("play-v2-hub");
    expect(within(hub).getByText("DAILY AVERAGE")).toBeInTheDocument();
    expect(within(hub).getByText("84.0")).toBeInTheDocument();
    expect(within(hub).getByRole("region", { name: "Your Matchups" })).toBeInTheDocument();
    expect(within(hub).getByText("6 GAMES")).toBeInTheDocument();
    expect(within(hub).queryByText(/College/)).not.toBeInTheDocument();
    expect(within(hub).getByRole("link", { name: /full stats/i })).toHaveAttribute("href", "/football/play-stats");
  });

  it("shows signed-out visitors the public Game Room without leaking member-specific data", () => {
    mocked.profile = null;
    mocked.status = "signed-out";
    preview("ufc");
    const hub = screen.getByTestId("play-v2-hub");
    expect(within(hub).getByRole("region", { name: "Game Room" })).toBeInTheDocument();
    expect(within(hub).getByText("4 GAMES")).toBeInTheDocument();
    expect(within(hub).getByText(/Sign in to compete in official Dailies/)).toBeInTheDocument();
    expect(within(hub).queryByRole("region", { name: "Your Play Performance" })).not.toBeInTheDocument();
    expect(within(hub).queryByRole("region", { name: "Your Matchups" })).not.toBeInTheDocument();
    fireEvent.click(within(hub).getByRole("button", { name: /sign in or join/i }));
    expect(mocked.openDialog).toHaveBeenCalledTimes(1);
    expect(mocked.runtime).not.toHaveBeenCalled();
    expect(mocked.history).not.toHaveBeenCalled();
  });

  it("keeps Football games accessible during guest profile loading and hides paused College GM", () => {
    mocked.profile = null;
    mocked.status = "loading";
    preview("football");
    const hub = screen.getByTestId("play-v2-hub");
    expect(within(hub).getByText("Loading your HQ profile…")).toBeInTheDocument();
    expect(within(hub).getByText("6 GAMES")).toBeInTheDocument();
    expect(within(hub).queryByText(/The GM · College/)).not.toBeInTheDocument();
  });

});

// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChampionshipLeaderboardPage from "./ChampionshipLeaderboardPage";

const mocked = vi.hoisted(() => ({ load: vi.fn(), weekly: vi.fn(), monthly: vi.fn(), mlb: vi.fn() }));
vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ profile: { id: "11111111-1111-4111-8111-111111111111" } }),
}));
vi.mock("../play/sportChampionshipRepository", () => ({
  loadSportChampionship: (...args: unknown[]) => mocked.load(...args),
  loadSportChampionshipWeekly: (...args: unknown[]) => mocked.weekly(...args),
  loadUfcMonthlyChampionship: (...args: unknown[]) => mocked.monthly(...args),
}));
vi.mock("../mlb/mlbChampionship", () => ({
  loadMlbChampionship: (...args: unknown[]) => mocked.mlb(...args),
}));

const one = "11111111-1111-4111-8111-111111111111";
const two = "22222222-2222-4222-8222-222222222222";
const player = (id: string, name: string, rank: number, rating: number, picks: number, play: number) => ({
  profile_id: id, display_name: name, initials: name[0], is_current_user: id === one,
  rank, rating, picks_rating: picks, daily_rating: play, featured_rating: play,
  play_rating: play, picks_rank: picks === 95 ? 1 : 2, play_rank: play === 97 ? 1 : 2,
  daily_rank: 1, featured_rank: 1, picks_played: 4, daily_played: 7, featured_played: 1,
  event_results: [{
    type: "daily", date: "2026-10-08", label: "Who Am I", rank: 2, points: 92, played: true, raw_score: 95,
  }],
});
const entries = [
  player(one, "CODY", 1, 91.5, 95, 88),
  player(two, "TYLER", 2, 89.8, 83, 97),
];

function open(path = "/championship/football") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/championship/:sport" element={<ChampionshipLeaderboardPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Unified Championship leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.load.mockResolvedValue({
      sport: "football", season: 2026, field_size: 2, entries, own: entries[0],
      weights: { picks: 60, daily: 30, featured: 10 },
      event_counts: { picks: 4, daily: 7, featured: 1 },
    });
    mocked.weekly.mockResolvedValue({
      sport: "football", season: 2026, weeks: [], latest: null,
    });
    mocked.monthly.mockResolvedValue({
      sport: "ufc", season: 2026, months: [], latest: null,
    });
  });

  it("shows one overall table and switches to Picks/Play standings", async () => {
    open();
    expect(await screen.findByText("CODY")).toBeInTheDocument();
    const table = screen.getByRole("tabpanel", { name: "overall Championship standings" });
    expect(within(table).getByText("91.5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Play" }));
    const playTable = screen.getByRole("tabpanel", { name: "play Championship standings" });
    expect(within(playTable).getByText("TYLER")).toBeInTheDocument();
    expect(within(playTable).getByText("97.0")).toBeInTheDocument();
    expect(screen.getByText(/Missing an event earns last-place points/)).toBeInTheDocument();
  });

  it("renders the UFC monthly champion without a new weekly award", async () => {
    mocked.load.mockResolvedValueOnce({
      sport: "ufc", season: 2026, field_size: 2, entries, own: entries[0],
      weights: { picks: 60, daily: 40, featured: 0 },
      event_counts: { picks: 3, daily: 15, featured: 0 },
    });
    const month = {
      month_start: "2026-11-01", month_end: "2026-11-30",
      winner: entries[0], entries,
      weights: { picks: 60, daily: 40, featured: 0 },
      event_counts: { picks: 3, daily: 15, featured: 0 },
    };
    mocked.monthly.mockResolvedValueOnce({
      sport: "ufc", season: 2026, latest: month, months: [month],
    });
    open("/championship/ufc");
    expect(await screen.findByText("CHAMPION OF THE MONTH")).toBeInTheDocument();
    expect(screen.getByText("91.5 MONTHLY SCORE")).toBeInTheDocument();
    expect(screen.queryByText("CHAMPION OF THE WEEK")).not.toBeInTheDocument();
    expect(mocked.monthly).toHaveBeenCalledWith(2026);
  });

  it("shows the correct first-month release explanation before November's board closes", async () => {
    mocked.load.mockResolvedValueOnce({
      sport: "ufc", season: 2026, field_size: 2, entries, own: entries[0],
      weights: { picks: 60, daily: 40, featured: 0 },
      event_counts: { picks: 0, daily: 0, featured: 0 },
    });
    open("/championship/ufc");
    expect(await screen.findByText("UFC MONTHLY CHAMPIONSHIP")).toBeInTheDocument();
    expect(screen.getByText(/November 30–December 1 Daily board closes on December 2/)).toBeInTheDocument();
  });

  it("expands another competitor to show transparent event placements", async () => {
    open("/championship/football?tab=picks");
    await screen.findByText("TYLER");
    fireEvent.click(screen.getByRole("button", { name: /TYLER/ }));
    expect(screen.getByText("Game-by-game finishes")).toBeInTheDocument();
    expect(screen.getByText("Who Am I")).toBeInTheDocument();
    expect(screen.getByText("2026-10-08 · Played")).toBeInTheDocument();
  });
});

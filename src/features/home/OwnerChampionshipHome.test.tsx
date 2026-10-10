// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OwnerChampionshipHome, type SportFilter } from "./OwnerChampionshipHome";

const loader = vi.hoisted(() => ({
  sport: vi.fn(),
  mlb: vi.fn(),
}));
vi.mock("../play/sportChampionshipRepository", () => ({
  loadSportChampionship: (...args: unknown[]) => loader.sport(...args),
}));
vi.mock("../mlb/mlbChampionship", () => ({
  loadMlbChampionship: (...args: unknown[]) => loader.mlb(...args),
}));

function projection(sport: "football" | "ufc") {
  const own = {
    profile_id: "11111111-1111-4111-8111-111111111111",
    display_name: "CODY",
    initials: "C",
    is_current_user: true,
    rank: sport === "football" ? 1 : 2,
    rating: sport === "football" ? 91.25 : 87.25,
    picks_rating: 90,
    daily_rating: 85,
    featured_rating: sport === "football" ? 92 : 0,
    play_rating: 86,
    picks_rank: 1,
    daily_rank: 2,
    featured_rank: 2,
    play_rank: 2,
    picks_played: 4,
    daily_played: 20,
    featured_played: sport === "football" ? 2 : 0,
  };
  return {
    sport, season: 2026, field_size: 6, own, entries: [own],
    weights: sport === "football"
      ? { picks: 60, daily: 30, featured: 10 }
      : { picks: 60, daily: 40, featured: 0 },
    event_counts: { picks: 4, daily: 20, featured: sport === "football" ? 2 : 0 },
  };
}

function Preview({ showMlb = true }: { showMlb?: boolean }) {
  const [sport, setSport] = useState<SportFilter>("all");
  return (
    <MemoryRouter>
      <div>
      <OwnerChampionshipHome
        streak={11}
        streakLoading={false}
        showMlb={showMlb}
        sport={sport}
        onSportChange={setSport}
      />
      <output data-testid="active-sport">{sport}</output>
      </div>
    </MemoryRouter>
  );
}

describe("Owner Championship Home preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loader.sport.mockImplementation(async (sport) => projection(sport));
    loader.mlb.mockResolvedValue({
      own: { overall_rank: 3, total_points: 67.5 },
      standings: [{}, {}, {}],
    });
  });

  it("shows the separate sport standings and streak without inventing a combined rank", async () => {
    render(<Preview />);
    expect(await screen.findByText("91.3 SEASON SCORE")).toBeInTheDocument();
    expect(screen.getByText("87.3 SEASON SCORE")).toBeInTheDocument();
    expect(screen.getByText("MLB POSTSEASON")).toBeInTheDocument();
    expect(screen.getByText("11 days")).toBeInTheDocument();
    expect(loader.sport).toHaveBeenCalledWith("football");
    expect(loader.sport).toHaveBeenCalledWith("ufc");
    expect(loader.mlb).toHaveBeenCalledWith(2026);
  });

  it("switches to a focused Football hero with 60% Picks / 40% Play", async () => {
    render(<Preview />);
    await screen.findByText("91.3 SEASON SCORE");
    fireEvent.change(screen.getByRole("combobox", { name: "Home sport" }), {
      target: { value: "football" },
    });
    expect(screen.getByTestId("active-sport")).toHaveTextContent("football");
    const hero = screen.getByRole("region", { name: "Your HQ" });
    expect(within(hero).getByText("PICKS · 60%")).toBeInTheDocument();
    expect(within(hero).getByText("PLAY · 40%")).toBeInTheDocument();
    expect(within(hero).queryByText(/Featured Weekly/)).not.toBeInTheDocument();
    expect(within(hero).getByRole("link", { name: "Open Football Picks leaderboard" })).toHaveAttribute("href", "/championship/football?tab=picks");
    expect(within(hero).getByRole("link", { name: "Open Football Play leaderboard" })).toHaveAttribute("href", "/championship/football?tab=play");
    expect(within(hero).queryByText("UFC CHAMPIONSHIP")).not.toBeInTheDocument();
  });

  it("uses UFC's existing Daily allocation while no Featured result is finalized", async () => {
    render(<Preview showMlb={false} />);
    await screen.findByText("87.3 SEASON SCORE");
    expect(screen.queryByRole("option", { name: "MLB" })).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Home sport" }), {
      target: { value: "ufc" },
    });
    expect(screen.queryByText(/Featured Weekly not active/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open UFC overall leaderboard" })).toHaveAttribute("href", "/championship/ufc?tab=overall");
  });

  it("keeps MLB postseason standings clickable and omits redundant scoring text", async () => {
    render(<Preview />);
    await screen.findByText("MLB POSTSEASON");
    fireEvent.change(screen.getByRole("combobox", { name: "Home sport" }), { target: { value: "mlb" } });
    expect(screen.getByRole("link", { name: "Open MLB Postseason Championship leaderboard" })).toHaveAttribute("href", "/championship/mlb");
    expect(screen.queryByText(/MLB retains its existing/)).not.toBeInTheDocument();
  });

  it("does not manufacture ratings when the standings RPC is unavailable", async () => {
    loader.sport.mockRejectedValue(new Error("No RPC"));
    render(<Preview showMlb={false} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Home sport" }), {
      target: { value: "football" },
    });
    expect(await screen.findByText("Championship standings unavailable")).toBeInTheDocument();
    expect(screen.queryByText("91.3")).not.toBeInTheDocument();
  });
});

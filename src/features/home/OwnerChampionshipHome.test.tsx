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
  it("shows a real rival chase and contextual lead without inventing scores", async () => {
    const football = projection("football");
    const shane = {
      ...football.own,
      profile_id: "22222222-2222-4222-8222-222222222222",
      display_name: "SHANE",
      initials: "SH",
      is_current_user: false,
      rank: 2,
      rating: 89.1,
    };
    const troy = {
      ...football.own,
      profile_id: "33333333-3333-4333-8333-333333333333",
      display_name: "TROY",
      initials: "TR",
      is_current_user: false,
      rank: 3,
      rating: 86.7,
    };
    loader.sport.mockImplementation(async (sport) => sport === "football"
      ? { ...football, entries: [troy, football.own, shane] }
      : projection("ufc"));
    render(<Preview showMlb={false} />);
    await screen.findByText("91.3 SEASON SCORE");
    fireEvent.change(screen.getByRole("combobox", { name: "Home sport" }), { target: { value: "football" } });
    const hero = screen.getByRole("region", { name: "Your HQ" });
    expect(within(hero).getByText("LEAGUE LEADER")).toBeInTheDocument();
    expect(within(hero).getByText("+2.2 over SHANE")).toBeInTheDocument();
    expect(within(hero).getByText("SHANE")).toBeInTheDocument();
    expect(within(hero).getByText("TROY")).toBeInTheDocument();
    expect(within(hero).getByRole("link", { name: "View SHANE Championship standing" }))
      .toHaveAttribute("href", "/championship/football?tab=overall&player=22222222-2222-4222-8222-222222222222");
    expect(within(hero).getByRole("link", { name: "View all Football Championship standings" }))
      .toHaveAttribute("href", "/championship/football?tab=overall");
  });

  it("shows a chasing status and current user's real standing outside the top three", async () => {
    const football = projection("football");
    const first = {
      ...football.own, profile_id: "22222222-2222-4222-8222-222222222222",
      display_name: "SHANE", initials: "SH", rank: 1, rating: 94.5, is_current_user: false,
    };
    const second = {
      ...football.own, profile_id: "33333333-3333-4333-8333-333333333333",
      display_name: "TROY", initials: "TR", rank: 2, rating: 93.0, is_current_user: false,
    };
    const third = {
      ...football.own, profile_id: "44444444-4444-4444-8444-444444444444",
      display_name: "TYLER", initials: "TY", rank: 3, rating: 91.8, is_current_user: false,
    };
    const own = { ...football.own, rank: 4, rating: 89.5 };
    loader.sport.mockImplementation(async (sport) => sport === "football"
      ? { ...football, own, entries: [own, third, first, second] } : projection("ufc"));
    render(<Preview showMlb={false} />);
    await screen.findByText("89.5 SEASON SCORE");
    fireEvent.change(screen.getByRole("combobox", { name: "Home sport" }), { target: { value: "football" } });
    const hero = screen.getByRole("region", { name: "Your HQ" });
    expect(within(hero).getByText("IN THE HUNT")).toBeInTheDocument();
    expect(within(hero).getByText("5.0 points from 1st")).toBeInTheDocument();
    expect(within(hero).getByText("You")).toBeInTheDocument();
    expect(within(hero).getByText("TYLER")).toBeInTheDocument();
  });

});

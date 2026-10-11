import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FootballWeeklyEditorialControl from "./FootballWeeklyEditorialControl";
import type {
  FootballWeeklyContentPackage,
  FootballWeeklyContentRepository,
} from "../home/footballWeeklyContentRepository";

const players = Array.from({ length: 5 }, (_, index) => ({
  id: "player-" + (index + 1),
  name: "Player " + (index + 1),
  team: "Team", position: "QB", summary: "Verified performance",
}));
const games = Array.from({ length: 5 }, (_, index) => ({
  id: "game-" + (index + 1),
  home_team: "Home " + index, away_team: "Away " + index,
  kickoff_at: "2026-10-17T19:30:00Z", summary: "Compelling matchup",
}));
const base: FootballWeeklyContentPackage = {
  week_of: "2026-10-13", release_at: "2026-10-13T05:00:00Z",
  status: "draft", cfb_spotlight: null, nfl_spotlight: null,
  cfb_game_of_week: null, nfl_game_of_week: null,
  proposals: { cfb: { players, games }, nfl: { players, games } },
  choices: {},
  approved_at: null, ready_at: null, published_at: null,
  created_at: "2026-10-11T00:00:00Z", updated_at: "2026-10-11T00:00:00Z",
};

describe("weekly editorial owner selection panel", () => {
  it("shows five choices per category and saves the chosen CFB pair without touching NFL", async () => {
    const selectChoices = vi.fn(async (_week, sport: string, playerId: string, gameId: string) => ({
      ...base,
      choices: { cfb: {
        player: players.find((item) => item.id === playerId)!,
        game: games.find((item) => item.id === gameId)!,
        selected_at: "2026-10-11T00:00:00Z",
        selected_by: "00000000-0000-4000-8000-000000000001",
      } },
    }));
    const repo = {
      load: vi.fn(async () => base),
      saveDraft: vi.fn(),
      stageCandidates: vi.fn(),
      selectChoices,
    } as unknown as FootballWeeklyContentRepository;
    render(<FootballWeeklyEditorialControl repository={repo} now={new Date("2026-10-11T15:00:00Z")} />);
    expect(await screen.findByText("College Football")).toBeInTheDocument();
    const section = screen.getByRole("region", { name: "Football weekly editorial approval" });
    const allPlayerInputs = within(section).getAllByRole("radio", { name: /Player [1-5]/ });
    expect(allPlayerInputs).toHaveLength(10);
    fireEvent.click(allPlayerInputs[1]);
    const allGameInputs = within(section).getAllByRole("radio", { name: /Away [0-4] at Home [0-4]/ });
    fireEvent.click(allGameInputs[2]);
    fireEvent.click(within(section).getByRole("button", { name: "SAVE CFB PICKS" }));
    await waitFor(() => expect(selectChoices).toHaveBeenCalledWith("2026-10-13", "cfb", "player-2", "game-3"));
    expect(await screen.findByText(/Saved: Player 2/)).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: "SAVE NFL PICKS" })).toBeDisabled();
  });

  it("shows no fabricated candidates when the weekly package is still empty", async () => {
    const repo = {
      load: vi.fn(async () => null),
      saveDraft: vi.fn(), stageCandidates: vi.fn(), selectChoices: vi.fn(),
    } as unknown as FootballWeeklyContentRepository;
    render(<FootballWeeklyEditorialControl repository={repo} now={new Date("2026-10-11T15:00:00Z")} />);
    await waitFor(() => expect(screen.getAllByText(/five player and five matchup recommendations/i)).toHaveLength(2));
    expect(screen.queryByRole("button", { name: /SAVE CFB PICKS/ })).not.toBeInTheDocument();
  });
});

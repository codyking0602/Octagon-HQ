import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NbaHomeHq } from "./NbaHomeHq";
import { emptyNbaFutures } from "./nbaFutures";
import { loadNbaFutures } from "./nbaFuturesRepository";

vi.mock("./nbaFuturesRepository", () => ({ loadNbaFutures: vi.fn() }));

const picks = emptyNbaFutures();
picks.winTotals = { ATL: "over", BOS: "under", BKN: "over" };
picks.playoffTeams = ["ATL", "BOS"];

describe("Basketball home hub", () => {
  beforeEach(() => {
    vi.mocked(loadNbaFutures).mockReset();
    vi.mocked(loadNbaFutures).mockResolvedValue({
      season: 2026,
      locked: false,
      lock_at: "2026-10-20T19:00:00Z",
      own: picks,
      participants: 1,
      entries: [],
      lines: [],
    });
  });

  it("uses shared sport HQ layout with futures progress, championship and coming competition", async () => {
    render(<MemoryRouter><NbaHomeHq signedIn /></MemoryRouter>);
    const hub = screen.getByRole("region", { name: "Basketball HQ" });
    expect(hub).toHaveClass("home-sport-hq", "home-sport-hq--nba");
    expect(screen.getByText("2026–27 NBA Season")).toBeInTheDocument();
    expect(await screen.findByText("5 OF 55")).toBeInTheDocument();
    expect(screen.getByText("50 PICKS REMAINING")).toBeInTheDocument();
    expect(screen.getByText("December · Cup knockout rounds")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Basketball Championship" })).toHaveAttribute("href", "/championship/nba");
    expect(screen.getByRole("link", { name: /open futures/i })).toHaveAttribute("href", "/nba/picks");
    expect(screen.queryByRole("button", { name: /replay introduction/i })).not.toBeInTheDocument();
  });

  it("shows only a compact Futures link in All Sports", async () => {
    render(<MemoryRouter><NbaHomeHq signedIn compact /></MemoryRouter>);
    const hub = screen.getByRole("region", { name: "Basketball HQ" });
    expect(hub).toHaveClass("is-compact");
    expect(await screen.findByText("5 OF 55 PICKS")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open NBA Futures picks" })).toHaveAttribute("href", "/nba/picks");
    expect(screen.queryByText("December · Cup knockout rounds")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /replay introduction/i })).not.toBeInTheDocument();
  });

  it("shows no made-up progress when the Futures request fails", async () => {
    vi.mocked(loadNbaFutures).mockRejectedValueOnce(new Error("not available"));
    render(<MemoryRouter><NbaHomeHq signedIn /></MemoryRouter>);
    expect(await screen.findByText("PROGRESS UNAVAILABLE")).toBeInTheDocument();
    expect(screen.queryByText("0 OF 55")).not.toBeInTheDocument();
  });
});

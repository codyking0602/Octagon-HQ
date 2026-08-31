import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_FOOTBALL_FUTURES_PICKS } from "./footballFuturesDraft";
import { FootballFuturesCard } from "./FootballFuturesCard";
import { usePicks } from "./PicksProvider";

vi.mock("./PicksProvider", () => ({ usePicks: vi.fn() }));

const saveFootballFutures = vi.fn(async () => undefined);

function runtime() {
  return {
    loading: false,
    savingFootballFutures: false,
    saveFootballFutures,
    footballFutures: {
      season: 2026,
      locked: false,
      lockAt: "2026-09-05T04:59:00Z",
      ownPicks: EMPTY_FOOTBALL_FUTURES_PICKS,
      groupPicks: [],
    },
  };
}

describe("FootballFuturesCard", () => {
  beforeEach(() => {
    saveFootballFutures.mockClear();
    vi.mocked(usePicks).mockReturnValue(runtime() as never);
  });

  it("starts collapsed and shows the real 11:59 PM Central lock", () => {
    render(<FootballFuturesCard />);
    const details = screen.getByText("SEASON FUTURES").closest("details");

    expect(details).not.toHaveAttribute("open");
    expect(details).toHaveTextContent("Fri, Sep 4, 11:59 PM CT");

    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);
    expect(details).toHaveAttribute("open");
  });

  it("uses searchable team choices while player awards remain typed names", () => {
    render(<FootballFuturesCard />);
    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);

    const teamSearches = screen.getAllByRole("combobox");
    fireEvent.focus(teamSearches[0]);
    fireEvent.change(teamSearches[0], { target: { value: "Texas" } });
    fireEvent.click(screen.getByRole("option", { name: "Texas Longhorns" }));

    expect(screen.getByRole("button", { name: "Remove Texas Longhorns" })).toBeInTheDocument();
    expect(screen.getByText("2 PTS EACH · 1/4 PICKS")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText("Type player name")).toHaveLength(2);
  });
});

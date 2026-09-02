import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
    vi.useFakeTimers();
    saveFootballFutures.mockClear();
    vi.mocked(usePicks).mockReturnValue(runtime() as never);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("starts collapsed and shows the real 11:59 PM Central lock", () => {
    render(<FootballFuturesCard />);
    const details = screen.getByText("SEASON FUTURES").closest("details");

    expect(details).not.toHaveAttribute("open");
    expect(details).toHaveTextContent("Fri, Sep 4, 11:59 PM CT");

    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);
    expect(details).toHaveAttribute("open");
  });

  it("lets a pointer drag start without selecting, then autosaves the clicked conference-aware pick", async () => {
    render(<FootballFuturesCard />);
    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);

    const input = screen.getByPlaceholderText("Search ACC teams");
    fireEvent.focus(input);
    const option = screen.getByRole("option", { name: "Boston College Eagles" });

    fireEvent.pointerDown(option);
    expect(screen.queryByRole("button", { name: "Remove Boston College Eagles" })).not.toBeInTheDocument();

    fireEvent.click(option);
    expect(screen.getByRole("button", { name: "Remove Boston College Eagles" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search Big Ten teams")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(saveFootballFutures).toHaveBeenCalledTimes(1);
    expect(saveFootballFutures).toHaveBeenCalledWith(expect.objectContaining({
      cfbPower4Champions: ["Boston College Eagles"],
    }));
  });
});

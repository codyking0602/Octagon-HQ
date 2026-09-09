import { act, fireEvent, render, screen, within } from "@testing-library/react";
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
    expect(screen.getByRole("heading", { name: "Pick the season before it starts" })).toBeInTheDocument();

    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);
    expect(details).toHaveAttribute("open");
  });

  it("uses season-native copy after Futures have locked and been revealed", () => {
    const lockedRuntime = runtime();
    lockedRuntime.footballFutures.locked = true;
    vi.mocked(usePicks).mockReturnValue(lockedRuntime as never);

    render(<FootballFuturesCard />);

    expect(screen.getByRole("heading", { name: "Your season futures" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Pick the season before it starts" })).not.toBeInTheDocument();
    expect(screen.getByText("LOCKED · GROUP REVEALED")).toBeInTheDocument();
  });

  it("uses the same structured reveal for your locked futures and group futures", () => {
    const lockedRuntime = runtime();
    const revealedPicks = {
      ...EMPTY_FOOTBALL_FUTURES_PICKS,
      cfbPower4Champions: ["Texas Longhorns", "Oregon Ducks", "Houston Cougars", "Miami Hurricanes"],
      cfbPlayoffTeams: ["Texas Longhorns", "Oregon Ducks", "Ohio State Buckeyes", "Miami Hurricanes"],
      cfbSemifinalists: ["Texas Longhorns", "Oregon Ducks"],
      cfbHeisman: "Darian Mensah",
      cfbNationalChampion: "Texas Longhorns",
      nflDivisionChampions: ["Dallas Cowboys", "Buffalo Bills"],
      nflPlayoffTeams: ["Dallas Cowboys", "Buffalo Bills", "Los Angeles Rams"],
      nflConferenceChampionshipTeams: ["Dallas Cowboys", "Buffalo Bills"],
      nflMvp: "Justin Herbert",
      nflSuperBowlChampion: "Los Angeles Rams",
    };
    lockedRuntime.footballFutures.locked = true;
    lockedRuntime.footballFutures.ownPicks = revealedPicks;
    lockedRuntime.footballFutures.groupPicks.push({
      profileId: "shane",
      displayName: "SHANE",
      picks: revealedPicks,
    } as never);
    vi.mocked(usePicks).mockReturnValue(lockedRuntime as never);

    const { container } = render(<FootballFuturesCard />);
    const reveals = screen.getAllByTestId("revealed-football-futures");
    const groupEntry = screen.getByText("SHANE").closest("details")!;

    expect(reveals).toHaveLength(2);
    expect(within(reveals[0]).getByText("SEC · Texas Longhorns")).toBeInTheDocument();
    expect(within(groupEntry).getByText("SEC · Texas Longhorns")).toBeInTheDocument();
    expect(reveals[0].querySelector('[data-selection-limit="12"]')).toBeInTheDocument();
    expect(reveals[0].querySelector('[data-selection-limit="14"]')).toBeInTheDocument();
    expect(container.querySelector(".football-futures-group-entry p")).not.toBeInTheDocument();
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
      cfbPlayoffTeams: ["Boston College Eagles"],
    }));
  });

  it("keeps the option alive through an iOS-style null-related-target blur so the tap can select", () => {
    render(<FootballFuturesCard />);
    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);

    const input = screen.getByPlaceholderText("Search ACC teams");
    fireEvent.focus(input);
    fireEvent.blur(input, { relatedTarget: null });

    expect(screen.getByRole("option", { name: "Boston College Eagles" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Boston College Eagles" }));
    expect(screen.getByRole("button", { name: "Remove Boston College Eagles" })).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("option", { name: "Illinois Fighting Illini" })).not.toBeInTheDocument();
  });

  it("carries an NFL division champion into the playoff draft before autosaving", async () => {
    render(<FootballFuturesCard />);
    fireEvent.click(screen.getByText("SEASON FUTURES").closest("summary")!);

    const input = screen.getByPlaceholderText("Search AFC East teams");
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole("option", { name: "Buffalo Bills" }));

    expect(screen.getByRole("button", { name: "Remove Buffalo Bills" })).toBeInTheDocument();
    expect(screen.getByText("AFC · Buffalo Bills")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(250);
      await Promise.resolve();
    });

    expect(saveFootballFutures).toHaveBeenCalledWith(expect.objectContaining({
      nflDivisionChampions: ["Buffalo Bills"],
      nflPlayoffTeams: ["Buffalo Bills"],
    }));
  });
});

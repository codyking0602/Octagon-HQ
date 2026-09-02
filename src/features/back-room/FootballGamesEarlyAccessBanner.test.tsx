import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";

const SESSION_KEY = "the-hq:football-games-early-access-seen";

describe("Football games early access banner", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows the Football games notice and dismisses itself", () => {
    render(<FootballGamesEarlyAccessBanner />);

    expect(screen.getByRole("status")).toHaveTextContent("FOOTBALL GAMES");
    expect(screen.getByRole("status")).toHaveTextContent("EARLY ACCESS");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Games and features are still being built and refined.",
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4_500));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("only shows once in the same app session", () => {
    const first = render(<FootballGamesEarlyAccessBanner />);

    act(() => vi.advanceTimersByTime(0));
    expect(window.sessionStorage.getItem(SESSION_KEY)).toBe("1");

    first.unmount();
    render(<FootballGamesEarlyAccessBanner />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

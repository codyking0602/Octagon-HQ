import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FootballGamesEarlyAccessBanner } from "./FootballGamesEarlyAccessBanner";

describe("Football games early access banner", () => {
  beforeEach(() => {
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

  it("shows again after leaving and returning to Football games", () => {
    const first = render(<FootballGamesEarlyAccessBanner />);

    act(() => vi.advanceTimersByTime(4_500));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    first.unmount();
    render(<FootballGamesEarlyAccessBanner />);

    expect(screen.getByRole("status")).toHaveTextContent("EARLY ACCESS");
  });
});

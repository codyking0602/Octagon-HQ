import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FootballEntryTransition } from "./FootballEntryTransition";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("FootballEntryTransition", () => {
  it("plays the Vince source for Play and finishes on a clean Football HQ card", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<FootballEntryTransition surface="play" onComplete={onComplete} />);
    const video = screen.getByTestId("football-entry-play");

    expect(video).toHaveAttribute("src", "/assets/football/vince-young-championship-run.mp4");
    fireEvent.ended(video);

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByTestId("football-entry-play-slam")).toBeInTheDocument();
    expect(container.querySelector('img[src="/assets/football/football-picks-reveal-04.jpg"]')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("plays the real Zeke reveal video for Picks and completes when it ends", () => {
    const onComplete = vi.fn();
    render(<FootballEntryTransition surface="picks" onComplete={onComplete} />);
    const video = screen.getByTestId("football-entry-picks");

    expect(video).toHaveAttribute("src", "/assets/football/football-picks-reveal.mp4");
    fireEvent.ended(video);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("falls through when either reveal video cannot play", () => {
    vi.useFakeTimers();
    const playComplete = vi.fn();
    const { unmount } = render(<FootballEntryTransition surface="play" onComplete={playComplete} />);

    fireEvent.error(screen.getByTestId("football-entry-play"));
    expect(screen.getByTestId("football-entry-play-slam")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(playComplete).toHaveBeenCalledTimes(1);
    unmount();

    const picksComplete = vi.fn();
    render(<FootballEntryTransition surface="picks" onComplete={picksComplete} />);
    fireEvent.error(screen.getByTestId("football-entry-picks"));
    expect(picksComplete).toHaveBeenCalledTimes(1);
  });
});

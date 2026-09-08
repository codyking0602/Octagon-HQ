import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FootballEntryTransition } from "./FootballEntryTransition";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("FootballEntryTransition", () => {
  it("plays the isolated Vince Young reveal for Play", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<FootballEntryTransition surface="play" onComplete={onComplete} />);
    const video = container.querySelector("video");

    expect(video).toHaveAttribute("src", "/assets/football/football-play-reveal.mp4");
    fireEvent.ended(video!);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("plays the isolated Ezekiel Elliott reveal for Picks", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<FootballEntryTransition surface="picks" onComplete={onComplete} />);
    const video = container.querySelector("video");

    expect(video).toHaveAttribute("src", "/assets/football/football-picks-reveal.mp4");
    fireEvent.ended(video!);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("falls through if a reveal clip cannot finish", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<FootballEntryTransition surface="picks" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(4700);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

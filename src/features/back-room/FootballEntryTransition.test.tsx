import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FootballEntryTransition } from "./FootballEntryTransition";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("FootballEntryTransition", () => {
  it("plays Vince Young and then slams Football HQ for the Play reveal", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<FootballEntryTransition surface="play" onComplete={onComplete} />);
    const video = container.querySelector("video");

    expect(video).toHaveAttribute("src", "/assets/football/vince-young-championship-run.mp4");
    fireEvent.ended(video!);
    expect(onComplete).not.toHaveBeenCalled();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/assets/football/football-picks-reveal-04.jpg",
    );

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("plays the Zeke frame sequence for Picks and completes it automatically", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    const { container } = render(<FootballEntryTransition surface="picks" onComplete={onComplete} />);
    const frames = Array.from(container.querySelectorAll("img"));

    expect(frames).toHaveLength(4);
    expect(frames.map((frame) => frame.getAttribute("src"))).toEqual([
      "/assets/football/football-picks-reveal-01.jpg",
      "/assets/football/football-picks-reveal-02.jpg",
      "/assets/football/football-picks-reveal-03.jpg",
      "/assets/football/football-picks-reveal-04.jpg",
    ]);

    act(() => {
      vi.advanceTimersByTime(3600);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FootballEntryTransition } from "./FootballEntryTransition";

afterEach(() => {
  cleanup();
});

describe("FootballEntryTransition", () => {
  it.each([
    ["play", "/assets/football/football-play-reveal.mp4"],
    ["picks", "/assets/football/football-picks-reveal.mp4"],
  ] as const)("plays the finished %s reveal video and completes when it ends", (surface, src) => {
    const onComplete = vi.fn();
    render(<FootballEntryTransition surface={surface} onComplete={onComplete} />);

    const video = screen.getByTestId(`football-entry-${surface}`);
    expect(video).toHaveAttribute("src", src);
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("muted");
    expect(video).toHaveAttribute("playsinline");

    fireEvent.ended(video);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it.each(["play", "picks"] as const)("falls through when the %s reveal video errors", (surface) => {
    const onComplete = vi.fn();
    render(<FootballEntryTransition surface={surface} onComplete={onComplete} />);

    fireEvent.error(screen.getByTestId(`football-entry-${surface}`));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

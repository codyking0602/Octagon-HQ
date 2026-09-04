// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PLAY_LANDING_COMMON_GAME_ORDER,
  PLAY_LANDING_FOOTBALL_GAME_ORDER,
  PLAY_LANDING_UFC_STRATEGIC_GAME,
  PlayLandingGameLibrary,
  PlayLandingHeader,
  playLandingDestination,
  playLandingGameIds,
} from "./PlayLandingPresentation";
import { playGameDefinition } from "./playRegistry";

describe("Play landing PR3 repair", () => {
  it("keeps the shared replayable order while leaving Football Blind Resume with the Daily owner", () => {
    expect(PLAY_LANDING_COMMON_GAME_ORDER).toEqual(["find-leader", "wavelength", "blind-resume", "hit-the-number"]);
    expect(PLAY_LANDING_FOOTBALL_GAME_ORDER).toEqual(["find-leader", "wavelength", "hit-the-number"]);
    expect(playLandingGameIds("ufc")).toEqual([PLAY_LANDING_UFC_STRATEGIC_GAME, ...PLAY_LANDING_COMMON_GAME_ORDER]);
    expect(playLandingGameIds("football")).toEqual(PLAY_LANDING_FOOTBALL_GAME_ORDER);
  });

  it("does not fake future games or restore Daily-only games to All Games", () => {
    const footballIds = [...playLandingGameIds("football")];
    const allIds = [...playLandingGameIds("ufc"), ...footballIds];
    expect(allIds).not.toContain("blind-rank");
    expect(allIds).not.toContain("keep-cut");
    expect(footballIds).not.toContain("blind-resume");
    render(<PlayLandingGameLibrary sport="football" onNavigate={() => {}} />);
    expect(screen.queryByRole("button", { name: /blind resume/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Who Am I/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/20 Questions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Room/i)).not.toBeInTheDocument();
  });

  it("opens UFC Find the Leader replayable while preserving its canonical route owner", () => {
    expect(playGameDefinition("find-leader", "ufc").route).toBe("/play/find-leader");
    expect(playLandingDestination("ufc", "find-leader")).toBe("/play/find-leader?mode=replayable");
    const navigate = vi.fn();
    render(<PlayLandingGameLibrary sport="ufc" onNavigate={navigate} />);
    const library = screen.getByRole("region", { name: /pick a game/i });
    fireEvent.click(within(library).getByRole("button", { name: /find the leader/i }));
    expect(navigate).toHaveBeenCalledWith("/play/find-leader?mode=replayable");
  });

  it("uses the compact shared header without repeating sport context", () => {
    const { rerender } = render(<PlayLandingHeader sport="ufc" />);
    expect(screen.getByRole("heading", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByText("Daily games.")).toBeInTheDocument();
    expect(screen.queryByText("UFC · PLAY")).not.toBeInTheDocument();
    rerender(<PlayLandingHeader sport="football" />);
    expect(screen.getByText("Daily games.")).toBeInTheDocument();
    expect(screen.queryByText("FOOTBALL · PLAY")).not.toBeInTheDocument();
  });
});
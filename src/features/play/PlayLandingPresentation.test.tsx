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

describe("Play landing presentation", () => {
  it("keeps the shared order while Football comparison games remain Daily-only", () => {
    expect(PLAY_LANDING_COMMON_GAME_ORDER).toEqual([
      "find-leader",
      "wavelength",
      "blind-resume",
      "hit-the-number",
      "20-questions",
      "who-am-i",
    ]);
    expect(PLAY_LANDING_FOOTBALL_GAME_ORDER).toEqual([
      "find-leader",
      "wavelength",
      "hit-the-number",
      "20-questions",
      "who-am-i",
    ]);
    expect(playLandingGameIds("ufc")).toEqual([PLAY_LANDING_UFC_STRATEGIC_GAME, ...PLAY_LANDING_COMMON_GAME_ORDER]);
    expect(playLandingGameIds("football")).toEqual(PLAY_LANDING_FOOTBALL_GAME_ORDER);
  });

  it("hides owner-preview identity games from public UFC and Football libraries", () => {
    const navigate = vi.fn();
    const { rerender } = render(<PlayLandingGameLibrary sport="ufc" onNavigate={navigate} />);
    expect(screen.queryByRole("button", { name: /20 questions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /who am i/i })).not.toBeInTheDocument();

    rerender(<PlayLandingGameLibrary sport="football" onNavigate={navigate} />);
    expect(screen.queryByRole("button", { name: /20 questions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /who am i/i })).not.toBeInTheDocument();
  });

  it("keeps 20 Questions and Who Am I visible to the owner in both sports", () => {
    const navigate = vi.fn();
    const { rerender } = render(<PlayLandingGameLibrary sport="ufc" onNavigate={navigate} ownerAccess />);
    expect(screen.getByRole("button", { name: /20 questions/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /who am i/i })).toBeInTheDocument();
    expect(screen.getByText("OWNER PREVIEW")).toBeInTheDocument();

    rerender(<PlayLandingGameLibrary sport="football" onNavigate={navigate} ownerAccess />);
    fireEvent.click(screen.getByRole("button", { name: /who am i/i }));
    expect(navigate).toHaveBeenCalledWith("/football/who-am-i");
  });

  it("keeps Daily-only games out of normal Football Play", () => {
    const navigate = vi.fn();
    render(<PlayLandingGameLibrary sport="football" onNavigate={navigate} ownerAccess />);
    expect(screen.queryByRole("button", { name: /blind rank 5/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /keep 4, cut 4/i })).not.toBeInTheDocument();
    expect(screen.queryByText("TEMP CASUAL")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /blind resume/i })).not.toBeInTheDocument();
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

  it("routes owner identity previews through their canonical sport routes", () => {
    expect(playGameDefinition("20-questions", "ufc").route).toBe("/play/20-questions");
    expect(playGameDefinition("20-questions", "football").route).toBe("/football/20-questions");
    expect(playGameDefinition("who-am-i", "ufc").route).toBe("/play/who-am-i");
    expect(playGameDefinition("who-am-i", "football").route).toBe("/football/who-am-i");
    const navigate = vi.fn();
    render(<PlayLandingGameLibrary sport="ufc" onNavigate={navigate} ownerAccess />);
    fireEvent.click(screen.getByRole("button", { name: /who am i/i }));
    expect(navigate).toHaveBeenCalledWith("/play/who-am-i");
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

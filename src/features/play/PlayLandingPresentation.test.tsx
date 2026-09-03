// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  PLAY_LANDING_COMMON_GAME_ORDER,
  PLAY_LANDING_UFC_STRATEGIC_GAME,
  PlayLandingGameLibrary,
  PlayLandingHeader,
  playLandingGameIds,
} from "./PlayLandingPresentation";
import { playGameDefinition } from "./playRegistry";

const commonTitles = ["Find the Leader", "Wavelength", "Blind Resume", "Hit the Number"];

function source(path: string) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("Play landing presentation contract", () => {
  it("keeps the implemented common games in the approved roadmap order", () => {
    expect(PLAY_LANDING_COMMON_GAME_ORDER).toEqual([
      "find-leader",
      "wavelength",
      "blind-resume",
      "hit-the-number",
    ]);
    expect(playLandingGameIds("football")).toEqual(PLAY_LANDING_COMMON_GAME_ORDER);
    expect(playLandingGameIds("ufc")).toEqual([
      ...PLAY_LANDING_COMMON_GAME_ORDER,
      PLAY_LANDING_UFC_STRATEGIC_GAME,
    ]);
  });

  it("renders equivalent common cards and keeps Auction UFC-only and last", () => {
    const { rerender } = render(<PlayLandingGameLibrary sport="ufc" onNavigate={() => {}} />);
    let library = screen.getByRole("region", { name: /pick a game/i });
    let cards = within(library).getAllByRole("button");
    expect(cards.map((card) => within(card).getByRole("strong").textContent)).toEqual([...commonTitles, "Auction"]);

    rerender(<PlayLandingGameLibrary sport="football" onNavigate={() => {}} />);
    library = screen.getByRole("region", { name: /pick a game/i });
    cards = within(library).getAllByRole("button");
    expect(cards.map((card) => within(card).getByRole("strong").textContent)).toEqual(commonTitles);
    expect(screen.queryByText("Auction")).not.toBeInTheDocument();
  });

  it("does not entrench Daily-only mechanics or expose future-game placeholders", () => {
    const ufcIds = playLandingGameIds("ufc");
    const footballIds = playLandingGameIds("football");
    for (const ids of [ufcIds, footballIds]) {
      expect(ids).not.toContain("blind-rank");
      expect(ids).not.toContain("keep-cut");
    }

    render(<PlayLandingGameLibrary sport="football" onNavigate={() => {}} />);
    expect(screen.queryByText(/20 Questions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Who Am I/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Draft Room/i)).not.toBeInTheDocument();
  });

  it("keeps every exposed card on an existing canonical route", () => {
    expect(playLandingGameIds("ufc").map((id) => playGameDefinition(id, "ufc").route)).toEqual([
      "/play/find-leader",
      "/play/wavelength",
      "/play/blind-resume",
      "/play/hit-the-number",
      "/play/auction",
    ]);
    expect(playLandingGameIds("football").map((id) => playGameDefinition(id, "football").route)).toEqual([
      "/football/find-leader",
      "/football/wavelength",
      "/football/blind-resume",
      "/football/hit-the-number",
    ]);
  });

  it("keeps the same landing hierarchy around each sport-owned Daily hero", () => {
    const ufcPage = source("./TodayChallengeHubPage.tsx");
    const footballPage = source("../back-room/FootballBackRoomPage.tsx");

    expect(ufcPage.indexOf("PlayLandingHeader")).toBeLessThan(ufcPage.indexOf("<TodayChallengeHub"));
    expect(ufcPage.indexOf("<TodayChallengeHub")).toBeLessThan(ufcPage.indexOf("<ChallengeCenter"));
    expect(ufcPage.indexOf("<ChallengeCenter")).toBeLessThan(ufcPage.indexOf("<PlayLandingGameLibrary"));

    expect(footballPage.indexOf("PlayLandingHeader")).toBeLessThan(footballPage.indexOf("football-daily-hq"));
    expect(footballPage.indexOf("football-daily-hq")).toBeLessThan(footballPage.indexOf("<ChallengeCenter"));
    expect(footballPage.indexOf("<ChallengeCenter")).toBeLessThan(footballPage.indexOf("<PlayLandingGameLibrary"));
  });

  it("keeps sport theme ownership explicit without creating another Football theme system", () => {
    const { rerender } = render(<PlayLandingHeader sport="ufc" />);
    expect(screen.getByText("UFC · PLAY").closest("section")).toHaveAttribute("data-sport", "ufc");
    rerender(<PlayLandingHeader sport="football" />);
    expect(screen.getByText("FOOTBALL · PLAY").closest("section")).toHaveAttribute("data-sport", "football");

    const styles = source("../../styles/play-landing-shared.css");
    expect(styles).toContain("--play-landing-accent: var(--ufc-red-strong)");
    expect(styles).toContain("--play-landing-accent: #1F4E79");
  });
});

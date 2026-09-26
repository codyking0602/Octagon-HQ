import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import MlbHitTheNumberOwnerRun, {
  MLB_HIT_NUMBER_OWNER_GAMES,
} from "./MlbHitTheNumberOwnerRun";

afterEach(() => cleanup());

function clickCandidate(name: RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

describe("MLB Hit the Number owner run", () => {
  it("locks the approved two-game, five-of-fourteen structure", () => {
    expect(MLB_HIT_NUMBER_OWNER_GAMES).toHaveLength(2);
    for (const game of MLB_HIT_NUMBER_OWNER_GAMES) {
      expect(game.candidates).toHaveLength(14);
      expect(new Set(game.candidates.map((candidate) => candidate.id)).size).toBe(14);
      expect(game.candidates.every((candidate) => Number.isInteger(candidate.value) && candidate.value > 0)).toBe(true);
    }
    expect(MLB_HIT_NUMBER_OWNER_GAMES[0].metricLabel).toBe("Career Home Runs");
    expect(MLB_HIT_NUMBER_OWNER_GAMES[0].configurationLabel).toContain("Steroid Era");
    expect(MLB_HIT_NUMBER_OWNER_GAMES[1].metricLabel).toBe("Single-Season Home Runs");
    expect(MLB_HIT_NUMBER_OWNER_GAMES[1].candidates.every((candidate) => /· \d{4}$/.test(candidate.name))).toBe(true);
  });

  it("renders the MLB treatment with hidden values before lock", () => {
    render(
      <MemoryRouter>
        <MlbHitTheNumberOwnerRun />
      </MemoryRouter>,
    );

    expect(screen.getByText("GAME 1 OF 2")).toBeInTheDocument();
    expect(screen.getByText("Career Home Runs")).toBeInTheDocument();
    expect(screen.getByText(/Steroid Era Sluggers/i)).toBeInTheDocument();
    expect(screen.getByText("14 eligible picks")).toBeInTheDocument();
    expect(screen.getByText("0 / 5 selected")).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/preview|demo|test|prototype|owner review/i);
    expect(document.body.textContent).not.toContain("762");
  });

  it("plays two perfect boards and averages them into a 100 final score", () => {
    render(
      <MemoryRouter>
        <MlbHitTheNumberOwnerRun />
      </MemoryRouter>,
    );

    [
      /Ken Griffey Jr\./i,
      /Jim Thome/i,
      /Manny Ramirez/i,
      /Jeff Bagwell/i,
      /Juan Gonzalez/i,
    ].forEach(clickCandidate);
    fireEvent.click(screen.getByRole("button", { name: /5\/5 SELECTED · LOCK PICKS/i }));

    expect(screen.getByText("PERFECT")).toBeInTheDocument();
    expect(screen.getByText("2,680")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /NEXT GAME/i }));

    expect(screen.getByText("GAME 2 OF 2")).toBeInTheDocument();
    expect(screen.getByText("Single-Season Home Runs")).toBeInTheDocument();

    [
      /Aaron Judge · 2022/i,
      /Ryan Howard · 2006/i,
      /Jose Bautista · 2010/i,
      /Pete Alonso · 2019/i,
      /Chris Davis · 2013/i,
    ].forEach(clickCandidate);
    fireEvent.click(screen.getByRole("button", { name: /5\/5 SELECTED · LOCK PICKS/i }));

    expect(screen.getAllByText("PERFECT").length).toBeGreaterThan(0);
    expect(screen.getByText("FINAL SCORE")).toBeInTheDocument();
    expect(screen.getByText("Final score is the average of both Hit the Number games.")).toBeInTheDocument();
    expect(screen.getByText("GAME 1").parentElement?.textContent).toContain("100");
    expect(screen.getByText("GAME 2").parentElement?.textContent).toContain("100");
  });

  it("is owner-only and leaves the real October 15 production slot unready", () => {
    const page = readFileSync("src/features/mlb/MlbFeaturedChallengePage.tsx", "utf8");
    const schedule = readFileSync("src/features/mlb/mlbChallengeSchedule.ts", "utf8");

    expect(page).toContain("identity.profile?.canControlPicks === true");
    expect(page).toContain("return <MlbHitTheNumberOwnerRun />");
    expect(schedule).toMatch(/date: "2026-10-15",[\s\S]*?game_type: "hit_the_number",[\s\S]*?ready: false/);
    expect(schedule).not.toContain("mlb-owner-hit-number-career-steroid-era");
  });
});

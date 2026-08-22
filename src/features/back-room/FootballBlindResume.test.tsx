import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballBlindResumePage from "./FootballBlindResumePage";
import {
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";
import { getFootballRankFivePack } from "./footballRankFiveModel";

describe("Football Blind Resume", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps the existing Football Rank 5 ratings as the single verdict owner", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(15);
    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const pack = getFootballRankFivePack(matchup.packId);
      const left = pack.items.find((item) => item.id === matchup.leftId)!;
      const right = pack.items.find((item) => item.id === matchup.rightId)!;
      expect(matchup.leftRating).toBe(left.rating);
      expect(matchup.rightRating).toBe(right.rating);
      expect(matchup.winnerId).toBe(left.rating > right.rating ? left.id : right.id);
      expect(matchup.stats).toHaveLength(5);
    }
  });

  it("covers careers, coaches, programs and single-season teams without a second resume owner", () => {
    const prompts = footballBlindResumeMatchups.map((matchup) => matchup.prompt);
    expect(prompts.some((prompt) => prompt.includes("quarterback résumé"))).toBe(true);
    expect(prompts.some((prompt) => prompt.includes("head-coaching résumé"))).toBe(true);
    expect(prompts.some((prompt) => prompt.includes("program"))).toBe(true);
    expect(prompts.some((prompt) => prompt.includes("single-season team"))).toBe(true);
  });

  it("builds deterministic five-round cards without repeating a football identity", () => {
    const first = buildFootballBlindResumeRounds("blind-resume-proof");
    const second = buildFootballBlindResumeRounds("blind-resume-proof");
    expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
    expect(first).toHaveLength(5);
    const ids = first.flatMap((round) => [round.leftId, round.rightId]);
    expect(new Set(ids).size).toBe(10);
  });

  it("reveals resume stats in stages before the pick, then reveals identities", () => {
    render(
      <MemoryRouter>
        <FootballBlindResumePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("?")).toHaveLength(2);
    expect(screen.getByText("2 OF 5 STATS SHOWN · LOCK NOW: CORRECT +20 · MISS +0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" }));
    expect(screen.getByText("4 OF 5 STATS SHOWN · LOCK NOW: CORRECT +15 · MISS +0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL FINAL STAT" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    expect(screen.queryByText("?")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Football Blind Resume identities")).toBeInTheDocument();
  });

  it("finishes five staged rounds and produces a 100-point final screen", () => {
    render(
      <MemoryRouter>
        <FootballBlindResumePage />
      </MemoryRouter>,
    );

    for (let round = 0; round < 5; round += 1) {
      fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
      fireEvent.click(screen.getByRole("button", { name: round === 4 ? "SEE FINAL SCORE" : "NEXT ROUND" }));
    }

    expect(screen.getByText("FOOTBALL BLIND RESUME · FINAL SCORE")).toBeInTheDocument();
    expect(screen.getByText("THE FIVE CALLS")).toBeInTheDocument();
    expect(screen.getByText("/100")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW FIVE" })).toBeInTheDocument();
  });
});

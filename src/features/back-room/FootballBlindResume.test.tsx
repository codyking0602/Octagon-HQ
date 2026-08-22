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

  it("uses the Football Rank 5 ratings as the verdict owner", () => {
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

  it("builds deterministic five-round cards without repeating a football identity", () => {
    const first = buildFootballBlindResumeRounds("blind-resume-proof");
    const second = buildFootballBlindResumeRounds("blind-resume-proof");
    expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
    expect(first).toHaveLength(5);
    const ids = first.flatMap((round) => [round.leftId, round.rightId]);
    expect(new Set(ids).size).toBe(10);
  });

  it("keeps identities hidden until the pick and finishes all five rounds", () => {
    render(
      <MemoryRouter>
        <FootballBlindResumePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("IDENTITY HIDDEN")).toHaveLength(2);

    for (let round = 0; round < 5; round += 1) {
      fireEvent.click(screen.getByRole("button", { name: "PICK RESUME A" }));
      expect(screen.queryByText("IDENTITY HIDDEN")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: round === 4 ? "SEE FINAL SCORE" : "NEXT RESUME" }));
    }

    expect(screen.getByText("FOOTBALL BLIND RESUME · FINAL SCORE")).toBeInTheDocument();
    expect(screen.getByText("THE FIVE CALLS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "NEW FIVE" })).toBeInTheDocument();
  });
});

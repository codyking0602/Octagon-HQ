import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FootballBlindResumePage from "./FootballBlindResumePage";
import {
  FOOTBALL_BLIND_RESUME_REVEAL_COUNTS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeNextRevealCount,
  footballBlindResumeRoundPoints,
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";
import { getFootballRankFivePack } from "./footballRankFiveModel";

describe("Football Blind Resume", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps the 96-matchup, 13-family catalog and Rank 5 ratings as the single verdict owner", () => {
    expect(footballBlindResumeMatchups).toHaveLength(96);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.packId))).toHaveLength(13);
    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const pack = getFootballRankFivePack(matchup.packId);
      const left = pack.items.find((item) => item.id === matchup.leftId)!;
      const right = pack.items.find((item) => item.id === matchup.rightId)!;
      expect(matchup.leftRating).toBe(left.rating);
      expect(matchup.rightRating).toBe(right.rating);
      expect(matchup.winnerId).toBe(left.rating > right.rating ? left.id : right.id);
      expect(matchup.stats).toHaveLength(8);
    }
  });

  it("keeps factual rows on the canonical footballFactualStats owner", () => {
    const factualRows = footballBlindResumeMatchups.flatMap((matchup) => matchup.stats.filter((stat) => stat.source));
    expect(factualRows.length).toBeGreaterThan(0);
    expect(factualRows.every((stat) => stat.source?.owner === "footballFactualStats")).toBe(true);
  });

  it("covers careers, coaches, programs and single-season teams without a second resume owner", () => {
    const prompts = footballBlindResumeMatchups.map((matchup) => matchup.prompt);
    expect(prompts.some((prompt) => prompt.includes("quarterback résumé"))).toBe(true);
    expect(prompts.some((prompt) => prompt.includes("head-coaching résumé"))).toBe(true);
    expect(prompts.some((prompt) => prompt.includes("program"))).toBe(true);
    expect(prompts.some((prompt) => prompt.includes("single-season team"))).toBe(true);
  });

  it("uses the UFC V3 staged-reveal scoring contract", () => {
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS).toEqual([2, 4, 6, 8]);
    expect(footballBlindResumeNextRevealCount(2)).toBe(4);
    expect(footballBlindResumeNextRevealCount(4)).toBe(6);
    expect(footballBlindResumeNextRevealCount(6)).toBe(8);
    expect(footballBlindResumeNextRevealCount(8)).toBeNull();
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.map((shown) => footballBlindResumeRoundPoints(shown, true))).toEqual([20, 19, 18, 17]);
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.map((shown) => footballBlindResumeRoundPoints(shown, false))).toEqual([2, 4, 6, 8]);
  });

  it("builds deterministic five-round cards with unique identities and an exact 3/2 or 2/3 NFL-CFB split", () => {
    const first = buildFootballBlindResumeRounds("blind-resume-proof");
    const second = buildFootballBlindResumeRounds("blind-resume-proof");
    expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
    expect(first).toHaveLength(5);
    const ids = first.flatMap((round) => [round.leftId, round.rightId]);
    expect(new Set(ids).size).toBe(10);

    for (let index = 0; index < 50; index += 1) {
      const rounds = buildFootballBlindResumeRounds(`league-balance-${index}`);
      expect(new Set(rounds.map((round) => round.packId)).size).toBe(5);
      const nfl = rounds.filter((round) => round.league === "NFL").length;
      const cfb = rounds.filter((round) => round.league === "CFB").length;
      expect([nfl, cfb].sort((left, right) => left - right)).toEqual([2, 3]);
    }
  });

  it("reveals eight resume rows 2 → 4 → 6 → 8 before the pick, then reveals identities", () => {
    render(
      <MemoryRouter>
        <FootballBlindResumePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("?")).toHaveLength(2);
    expect(screen.getByText("2 OF 8 STATS SHOWN · LOCK NOW: CORRECT +20 · MISS +2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" }));
    expect(screen.getByText("4 OF 8 STATS SHOWN · LOCK NOW: CORRECT +19 · MISS +4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" }));
    expect(screen.getByText("6 OF 8 STATS SHOWN · LOCK NOW: CORRECT +18 · MISS +6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE STATS" }));
    expect(screen.getByText("8 OF 8 STATS SHOWN · LOCK NOW: CORRECT +17 · MISS +8")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "REVEAL 2 MORE STATS" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    expect(screen.queryByText("?")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Football Blind Resume identities")).toBeInTheDocument();
  });

  it("finishes five staged rounds with the V3 points-and-record recap philosophy", () => {
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
    expect(screen.getAllByText(/PICK .* · WINNER /)).toHaveLength(5);
    expect(screen.getByRole("button", { name: "NEW FIVE" })).toBeInTheDocument();
  });
});

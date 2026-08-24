import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("../challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({
    beginChallenge: vi.fn().mockResolvedValue(""),
    activeProfile: null,
    profiles: [],
    getChallenge: () => null,
    markOpened: vi.fn(),
    submitResult: vi.fn(),
  }),
}));

describe("Football Blind Resume", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps the broad 13-family catalog and Rank 5 ratings as the single verdict owner", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(80);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.packId)).size).toBe(13);
    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const pack = getFootballRankFivePack(matchup.packId);
      const left = pack.items.find((item) => item.id === matchup.leftId)!;
      const right = pack.items.find((item) => item.id === matchup.rightId)!;
      expect(matchup.leftRating).toBe(left.rating);
      expect(matchup.rightRating).toBe(right.rating);
      expect(matchup.winnerId).toBe(left.rating > right.rating ? left.id : right.id);
      expect(matchup.stats).toHaveLength(8);
      expect(["easy", "medium", "hard", "villain"]).toContain(matchup.difficulty);
    }
  });

  it("keeps factual rows on the canonical footballFactualStats owner and uses plain resume copy", () => {
    const factualRows = footballBlindResumeMatchups.flatMap((matchup) => matchup.stats.filter((stat) => stat.source));
    expect(factualRows.length).toBeGreaterThan(0);
    expect(factualRows.every((stat) => stat.source?.owner === "footballFactualStats")).toBe(true);
    expect(footballBlindResumeMatchups.every((matchup) => !matchup.prompt.includes("résumé"))).toBe(true);
  });

  it("uses the locked five-stage early-conviction scoring curve with zero for every miss", () => {
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS).toEqual([0, 2, 4, 6, 8]);
    expect(footballBlindResumeNextRevealCount(0)).toBe(2);
    expect(footballBlindResumeNextRevealCount(2)).toBe(4);
    expect(footballBlindResumeNextRevealCount(4)).toBe(6);
    expect(footballBlindResumeNextRevealCount(6)).toBe(8);
    expect(footballBlindResumeNextRevealCount(8)).toBeNull();
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.map((shown) => footballBlindResumeRoundPoints(shown, true))).toEqual([20, 15, 10, 5, 2]);
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.map((shown) => footballBlindResumeRoundPoints(shown, false))).toEqual([0, 0, 0, 0, 0]);
  });

  it("builds deterministic five-round cards with deliberate difficulty and an exact 3/2 or 2/3 NFL-CFB split", () => {
    const first = buildFootballBlindResumeRounds("blind-resume-pr4-proof");
    const second = buildFootballBlindResumeRounds("blind-resume-pr4-proof");
    expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
    expect(first.map((round) => round.difficulty)).toEqual(second.map((round) => round.difficulty));
    expect(first).toHaveLength(5);
    const ids = first.flatMap((round) => [round.leftId, round.rightId]);
    expect(new Set(ids).size).toBe(10);
    expect(new Set(first.map((round) => round.packId)).size).toBe(5);
    expect(first.some((round) => round.difficulty === "easy")).toBe(true);
    expect(first.filter((round) => round.difficulty === "hard").length).toBeGreaterThanOrEqual(2);
    const nfl = first.filter((round) => round.league === "NFL").length;
    const cfb = first.filter((round) => round.league === "CFB").length;
    expect([nfl, cfb].sort((left, right) => left - right)).toEqual([2, 3]);
  });

  it("starts fully blind, reveals two evidence rows at a time, and lowers the scoring ceiling", () => {
    render(
      <MemoryRouter>
        <FootballBlindResumePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("?")).toHaveLength(2);
    expect(screen.getByText("0 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("RIGHT NOW +20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL FIRST 2" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "REVEAL FIRST 2" }));
    expect(screen.getByText("2 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("RIGHT NOW +15")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL NEXT 2" }));
    expect(screen.getByText("4 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("RIGHT NOW +10")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL NEXT 2" }));
    expect(screen.getByText("6 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("RIGHT NOW +5")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL NEXT 2" }));
    expect(screen.getByText("8 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("RIGHT NOW +2")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "REVEAL NEXT 2" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    expect(screen.queryByText("?")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Football Blind Resume identities")).toBeInTheDocument();
  });

  it("finishes five rounds with the points-and-evidence recap", () => {
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
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });
});

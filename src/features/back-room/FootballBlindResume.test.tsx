import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { blindResumeV3RoundPoints, createBlindResumeV3Card } from "../play/blindResumeV3";
import {
  BLIND_RESUME_V3_OFFICIAL_DAILY_SCORING_VERSION,
} from "../play/todaysChallengeRuntime";
import {
  buildFootballOfficialDailySetup,
  FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
  FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION,
  FOOTBALL_DAILY_RUNTIME_VERSION,
} from "../play/footballTodayChallengeRuntime";
import FootballBlindResumePage from "./FootballBlindResumePage";
import {
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_REVEAL_COUNTS,
  buildFootballBlindResumeEvidence,
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

function normalizedRow(row: { label: string; valueA: string; valueB: string }) {
  return `${row.label}|${row.valueA}|${row.valueB}`.trim().toLowerCase().replace(/\s+/g, " ");
}

describe("Football Blind Resume", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("covers every PR5 archetype with evidence-backed NFL and CFB matchups while Rank 5 stays the verdict owner", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(18);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.archetype))).toEqual(new Set([
      "team-season",
      "player-career",
      "player-season",
      "coach",
      "program-era",
    ]));
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.league))).toEqual(new Set(["NFL", "CFB"]));

    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      const pack = getFootballRankFivePack(matchup.packId);
      const left = pack.items.find((item) => item.id === matchup.leftId)!;
      const right = pack.items.find((item) => item.id === matchup.rightId)!;
      expect(matchup.leftRating).toBe(left.rating);
      expect(matchup.rightRating).toBe(right.rating);
      expect(matchup.winnerId).toBe(left.rating > right.rating ? left.id : right.id);
      expect(matchup.stats).toHaveLength(8);
      expect(new Set(matchup.stats.map((row) => row.source.dimensionId)).size).toBe(8);
      expect(new Set(matchup.stats.map((row) => row.label.toLowerCase())).size).toBe(8);
      expect(new Set(matchup.stats.map(normalizedRow)).size).toBe(8);
      expect(matchup.stats.every((row) => row.source.owner === "footballFactualStats")).toBe(true);
      expect(["easy", "medium", "hard", "villain"]).toContain(matchup.difficulty);

      const hiddenEvidence = matchup.stats.flatMap((row) => [row.valueA, row.valueB]).join(" ").toLowerCase();
      expect(hiddenEvidence).not.toContain(matchup.leftName.toLowerCase());
      expect(hiddenEvidence).not.toContain(matchup.rightName.toLowerCase());
    }
  });

  it("fails loudly when a matchup asks the canonical factual owner for incomplete evidence", () => {
    expect(() => buildFootballBlindResumeEvidence(
      "nfl-quarterbacks",
      "patrick-mahomes",
      "tom-brady",
      "player-career",
    )).toThrow(/no factual evidence profile/i);
  });

  it("reuses the canonical UFC V3 reveal ladder and scoring owner unchanged", () => {
    const ufcCard = createBlindResumeV3Card("football-blind-resume-parity-proof");
    expect([...FOOTBALL_BLIND_RESUME_REVEAL_COUNTS]).toEqual(ufcCard.revealCounts);
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS).toEqual([2, 4, 6, 8]);
    expect(footballBlindResumeNextRevealCount(2)).toBe(4);
    expect(footballBlindResumeNextRevealCount(4)).toBe(6);
    expect(footballBlindResumeNextRevealCount(6)).toBe(8);
    expect(footballBlindResumeNextRevealCount(8)).toBeNull();

    for (const shown of FOOTBALL_BLIND_RESUME_REVEAL_COUNTS) {
      expect(footballBlindResumeRoundPoints(shown, true)).toBe(blindResumeV3RoundPoints(shown, true));
      expect(footballBlindResumeRoundPoints(shown, false)).toBe(blindResumeV3RoundPoints(shown, false));
    }
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.map((shown) => footballBlindResumeRoundPoints(shown, true))).toEqual([20, 19, 18, 17]);
    expect(FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.map((shown) => footballBlindResumeRoundPoints(shown, false))).toEqual([2, 4, 6, 8]);
  });

  it("builds deterministic mixed five-round cards including deterministic evidence", () => {
    const first = buildFootballBlindResumeRounds("blind-resume-pr5-proof");
    const second = buildFootballBlindResumeRounds("blind-resume-pr5-proof");
    expect(first.map((round) => round.id)).toEqual(second.map((round) => round.id));
    expect(first.map((round) => round.stats)).toEqual(second.map((round) => round.stats));
    expect(first.map((round) => round.difficulty)).toEqual(second.map((round) => round.difficulty));
    expect(first).toHaveLength(5);
    const ids = first.flatMap((round) => [round.leftId, round.rightId]);
    expect(new Set(ids).size).toBe(10);
    expect(new Set(first.map((round) => round.packId)).size).toBe(5);
    expect(new Set(first.map((round) => round.difficulty)).size).toBeGreaterThanOrEqual(2);
    const nfl = first.filter((round) => round.league === "NFL").length;
    const cfb = first.filter((round) => round.league === "CFB").length;
    expect([nfl, cfb].sort((left, right) => left - right)).toEqual([2, 3]);
  });

  it("uses the same canonical evidence in replayable and official-daily modes and opens official daily at 2 rows", () => {
    const day = "2026-08-24";
    const scheduleVersion = "football-pr5-proof";
    const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|blind-resume|${scheduleVersion}|${day}`;
    const direct = buildFootballBlindResumeRounds(seed, FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);
    const official = buildFootballOfficialDailySetup("blind_resume", day, scheduleVersion);
    const privateRounds = (official.privateSetupEvidence as { rounds: Array<{
      id: string;
      stats: Array<{ label: string; value_a: string; value_b: string }>;
    }> }).rounds;
    const publicSetup = official.publicSetup as {
      initial_state: {
        current_round: {
          revealed_count: number;
          max_revealed_count: number;
          stats: unknown[];
        };
      };
    };

    expect(official.contentVersion).toBe(FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION);
    expect(official.scoringVersion).toBe(FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION);
    expect(official.scoringVersion).toBe(BLIND_RESUME_V3_OFFICIAL_DAILY_SCORING_VERSION);
    expect(publicSetup.initial_state.current_round.revealed_count).toBe(2);
    expect(publicSetup.initial_state.current_round.max_revealed_count).toBe(8);
    expect(publicSetup.initial_state.current_round.stats).toHaveLength(2);
    expect(privateRounds.map((round) => ({
      id: round.id,
      stats: round.stats,
    }))).toEqual(direct.map((round) => ({
      id: round.id,
      stats: round.stats.map((stat) => ({
        label: stat.label,
        value_a: stat.valueA,
        value_b: stat.valueB,
      })),
    })));

    const publicJson = JSON.stringify(official.publicSetup).toLowerCase();
    expect(publicJson).not.toContain(direct[0]!.leftName.toLowerCase());
    expect(publicJson).not.toContain(direct[0]!.rightName.toLowerCase());
  });

  it("starts with two evidence rows, hides identities until the pick, and resets the next round to two rows", () => {
    const { container } = render(
      <MemoryRouter>
        <FootballBlindResumePage />
      </MemoryRouter>,
    );

    expect(screen.getAllByText("?")).toHaveLength(2);
    expect(screen.getByText("2 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("LOCK NOW: CORRECT +20")).toBeInTheDocument();
    expect(screen.getByText(/MISS \+2/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "REVEAL 2 MORE EVIDENCE" })).toBeInTheDocument();
    expect(container.querySelectorAll(".football-blind-resume-stats .is-revealed")).toHaveLength(2);
    expect(container.querySelectorAll(".football-blind-resume-stats .is-locked")).toHaveLength(6);
    expect([...container.querySelectorAll(".football-blind-resume-stats .is-locked span")].every((node) => !/^EVIDENCE \d+$/.test(node.textContent ?? ""))).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE EVIDENCE" }));
    expect(screen.getByText("4 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("LOCK NOW: CORRECT +19")).toBeInTheDocument();
    expect(screen.getByText(/MISS \+4/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE EVIDENCE" }));
    expect(screen.getByText("6 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("LOCK NOW: CORRECT +18")).toBeInTheDocument();
    expect(screen.getByText(/MISS \+6/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "REVEAL 2 MORE EVIDENCE" }));
    expect(screen.getByText("8 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(screen.getByText("LOCK NOW: CORRECT +17")).toBeInTheDocument();
    expect(screen.getByText(/MISS \+8/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "REVEAL 2 MORE EVIDENCE" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    expect(screen.queryByText("?")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Football Blind Resume identities")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "NEXT ROUND" }));
    expect(screen.getAllByText("?")).toHaveLength(2);
    expect(screen.getByText("2 OF 8 EVIDENCE SHOWN")).toBeInTheDocument();
    expect(container.querySelectorAll(".football-blind-resume-stats .is-revealed")).toHaveLength(2);
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
    expect(screen.getByText("Early conviction pays. Later reveals trade upside for miss protection.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PLAY AGAIN" })).toBeInTheDocument();
  });
});
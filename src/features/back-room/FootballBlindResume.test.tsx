import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { blindResumeV3RoundPoints, createBlindResumeV3Card } from "../play/blindResumeV3";
import {
  buildFootballOfficialDailySetup,
  FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
  FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION,
} from "../play/footballTodayChallengeRuntime";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import FootballBlindResumePage from "./FootballBlindResumePage";
import FootballTodayChallengePage from "./FootballTodayChallengePage";
import {
  FOOTBALL_BLIND_RESUME_CORRECT_POINTS,
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_MISS_POINTS,
  FOOTBALL_BLIND_RESUME_RAW_MAX,
  FOOTBALL_BLIND_RESUME_REVEAL_STAGES,
  FOOTBALL_BLIND_RESUME_ROUNDS,
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeNextRevealCount,
  footballBlindResumeRevealStage,
  footballBlindResumeRoundPoints,
  normalizeFootballBlindResumeDailyScore,
  resolvedFootballBlindResumeMatchups,
} from "./footballBlindResumeModel";

const repositoryMocks = vi.hoisted(() => ({
  loadToday: vi.fn(),
  advance: vi.fn(),
}));

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({
    status: "ready",
    profile: { id: "test-profile" },
    openDialog: vi.fn(),
  }),
}));

vi.mock("../play/todayChallengeRepository", () => ({
  createTodayChallengeRepository: () => repositoryMocks,
  TodayChallengeRepositoryError: class TodayChallengeRepositoryError extends Error {
    stale = false;
  },
}));

function projectionFor(day = "2026-09-04", scheduleVersion = "football-blind-resume-v4-test"): TodayChallengeProjection {
  const setup = buildFootballOfficialDailySetup("blind_resume", day, scheduleVersion);
  return {
    available: true,
    sport: "football",
    id: "00000000-0000-4000-8000-000000000004",
    centralDay: day,
    scheduleVersion,
    gameType: "blind_resume",
    setupKey: setup.setupKey,
    contentVersion: setup.contentVersion,
    scoringVersion: String(setup.scoringVersion),
    fallbackReason: null,
    publicSetup: setup.publicSetup,
    progressRevision: 0,
    publicState: setup.publicSetup.initial_state as Record<string, unknown>,
    revealSetup: null,
    officialAttempt: null,
    deploymentSha: "test-sha",
    actionHistory: [],
  };
}

describe("Football Blind Resume Daily v4", () => {
  beforeEach(() => {
    repositoryMocks.loadToday.mockReset();
    repositoryMocks.advance.mockReset();
  });

  it("keeps the locked three-round, three-stage scoring contract and 100-point normalization", () => {
    expect(FOOTBALL_BLIND_RESUME_ROUNDS).toBe(3);
    expect(FOOTBALL_BLIND_RESUME_REVEAL_STAGES).toBe(3);
    expect(FOOTBALL_BLIND_RESUME_CORRECT_POINTS).toEqual([10, 8, 7]);
    expect(FOOTBALL_BLIND_RESUME_MISS_POINTS).toEqual([-4, -1, 0]);
    expect(FOOTBALL_BLIND_RESUME_RAW_MAX).toBe(30);

    expect(footballBlindResumeRoundPoints(0, true)).toBe(10);
    expect(footballBlindResumeRoundPoints(0, false)).toBe(-4);
    expect(footballBlindResumeRoundPoints(1, true)).toBe(8);
    expect(footballBlindResumeRoundPoints(1, false)).toBe(-1);
    expect(footballBlindResumeRoundPoints(2, true)).toBe(7);
    expect(footballBlindResumeRoundPoints(2, false)).toBe(0);

    expect(normalizeFootballBlindResumeDailyScore(30)).toBe(100);
    expect(normalizeFootballBlindResumeDailyScore(24)).toBe(80);
    expect(normalizeFootballBlindResumeDailyScore(21)).toBe(70);
    expect(normalizeFootballBlindResumeDailyScore(-12)).toBe(0);
  });

  it("uses an editorial curated bank with variable evidence and the canonical factual owner", () => {
    expect(footballBlindResumeMatchups.length).toBeGreaterThanOrEqual(24);
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.league))).toEqual(new Set(["NFL", "CFB"]));
    expect(new Set(footballBlindResumeMatchups.map((matchup) => matchup.packId)).size).toBeGreaterThanOrEqual(8);

    const evidenceLengths = new Set<number>();
    const revealSignatures = new Set<string>();
    for (const matchup of resolvedFootballBlindResumeMatchups()) {
      expect([matchup.leftId, matchup.rightId]).toContain(matchup.winnerId);
      expect(matchup.stats.length).toBeGreaterThanOrEqual(6);
      expect(matchup.stats.length).toBeLessThanOrEqual(8);
      expect(matchup.revealCounts).toHaveLength(3);
      expect(matchup.revealCounts[0]).toBeGreaterThan(0);
      expect(matchup.revealCounts[0]).toBeLessThan(matchup.revealCounts[1]);
      expect(matchup.revealCounts[1]).toBeLessThan(matchup.revealCounts[2]);
      expect(matchup.revealCounts[2]).toBe(matchup.stats.length);
      expect(matchup.stats.every((row) => row.source.owner === "footballFactualStats")).toBe(true);
      expect(new Set(matchup.stats.map((row) => row.source.dimensionId)).size).toBe(matchup.stats.length);

      const visibleEvidence = matchup.stats.flatMap((row) => [row.label, row.valueA, row.valueB]).join(" ").toLowerCase();
      expect(visibleEvidence).not.toContain(matchup.leftName.toLowerCase());
      expect(visibleEvidence).not.toContain(matchup.rightName.toLowerCase());
      expect(visibleEvidence).not.toContain("same tier");

      evidenceLengths.add(matchup.stats.length);
      revealSignatures.add(matchup.revealCounts.join("/"));
    }

    expect(evidenceLengths.size).toBeGreaterThan(1);
    expect(revealSignatures.size).toBeGreaterThan(2);
  });

  it("builds deterministic mixed three-round Daily slates with matchup-specific reveal counts", () => {
    const first = buildFootballBlindResumeRounds("blind-resume-v4-proof", FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);
    const second = buildFootballBlindResumeRounds("blind-resume-v4-proof", FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES);

    expect(first).toEqual(second);
    expect(first).toHaveLength(3);
    expect(first.map((round) => round.difficulty)).toEqual([...FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES]);
    expect(new Set(first.map((round) => round.packId)).size).toBe(3);
    expect(new Set(first.map((round) => round.league))).toEqual(new Set(["NFL", "CFB"]));
    expect(new Set(first.flatMap((round) => [round.leftId, round.rightId])).size).toBe(6);

    for (const round of first) {
      expect(footballBlindResumeRevealStage(round, round.revealCounts[0])).toBe(0);
      expect(footballBlindResumeNextRevealCount(round, round.revealCounts[0])).toBe(round.revealCounts[1]);
      expect(footballBlindResumeNextRevealCount(round, round.revealCounts[1])).toBe(round.revealCounts[2]);
      expect(footballBlindResumeNextRevealCount(round, round.revealCounts[2])).toBeNull();
    }
  });

  it("publishes only the visible anonymous facts and the complete risk/reward ladder", () => {
    const day = "2026-09-04";
    const scheduleVersion = "football-blind-resume-v4-public-proof";
    const setup = buildFootballOfficialDailySetup("blind_resume", day, scheduleVersion);
    const privateRounds = (setup.privateSetupEvidence as { rounds: Array<Record<string, unknown>> }).rounds;
    const publicSetup = setup.publicSetup as {
      round_count: number;
      scoring_ladder: Array<{ stage: number; correct: number; wrong: number }>;
      initial_state: { current_round: Record<string, unknown> };
    };
    const opening = publicSetup.initial_state.current_round;
    const firstPrivate = privateRounds[0]!;
    const revealCounts = firstPrivate.reveal_counts as number[];
    const visibleStats = opening.stats as unknown[];

    expect(setup.contentVersion).toBe(FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION);
    expect(setup.scoringVersion).toBe(FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION);
    expect(publicSetup.round_count).toBe(3);
    expect(publicSetup.scoring_ladder).toEqual([
      { stage: 1, correct: 10, wrong: -4 },
      { stage: 2, correct: 8, wrong: -1 },
      { stage: 3, correct: 7, wrong: 0 },
    ]);
    expect(opening.reveal_stage).toBe(1);
    expect(opening.revealed_count).toBe(revealCounts[0]);
    expect(opening.max_revealed_count).toBe(revealCounts[2]);
    expect(visibleStats).toHaveLength(revealCounts[0]!);
    expect(opening).not.toHaveProperty("left_name");
    expect(opening).not.toHaveProperty("right_name");
    expect(opening).not.toHaveProperty("winner_id");

    const publicJson = JSON.stringify(setup.publicSetup).toLowerCase();
    expect(publicJson).not.toContain(String(firstPrivate.left_name).toLowerCase());
    expect(publicJson).not.toContain(String(firstPrivate.right_name).toLowerCase());
  });

  it("renders the aligned anonymous card, full ladder, and slim reveal action", async () => {
    const projection = projectionFor();
    const setup = buildFootballOfficialDailySetup("blind_resume", projection.centralDay, projection.scheduleVersion);
    const firstPrivate = (setup.privateSetupEvidence as { rounds: Array<Record<string, unknown>> }).rounds[0]!;
    const revealCounts = firstPrivate.reveal_counts as number[];
    const nextFactCount = revealCounts[1]! - revealCounts[0]!;
    repositoryMocks.loadToday.mockResolvedValue(projection);
    repositoryMocks.advance.mockResolvedValue(projection);

    render(
      <MemoryRouter>
        <FootballTodayChallengePage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Which football career ranks higher?")).toBeInTheDocument();
    expect(screen.getByText("PLAY HUB")).toBeInTheDocument();
    expect(screen.getAllByText("?")).toHaveLength(2);
    expect(screen.getByText("ROUND 1 OF 3")).toBeInTheDocument();
    expect(screen.getByText("GUESS NOW")).toBeInTheDocument();
    expect(screen.getByText("NEXT")).toBeInTheDocument();
    expect(screen.getByText("FINAL REVEAL")).toBeInTheDocument();
    expect(screen.getByText("+10 / -4")).toBeInTheDocument();
    expect(screen.getByText("+8 / -1")).toBeInTheDocument();
    expect(screen.getByText("+7 / 0")).toBeInTheDocument();
    expect(screen.getByText(/\d+ OF \d+ FACTS SHOWN/)).toBeInTheDocument();
    expect(screen.queryByText(String(firstPrivate.left_name))).not.toBeInTheDocument();
    expect(screen.queryByText(String(firstPrivate.right_name))).not.toBeInTheDocument();

    const reveal = screen.getByRole("button", { name: `SHOW ${nextFactCount} MORE ${nextFactCount === 1 ? "FACT" : "FACTS"}` });
    fireEvent.click(reveal);
    await waitFor(() => expect(repositoryMocks.advance).toHaveBeenCalledWith(projection, { reveal: true }));

    fireEvent.click(screen.getByRole("button", { name: "PICK A" }));
    await waitFor(() => expect(repositoryMocks.advance).toHaveBeenCalledWith(projection, { choice: "A" }));
  });

  it("keeps the legacy Football route Daily-only instead of restoring a second game owner", () => {
    render(
      <MemoryRouter initialEntries={["/football/blind-resume"]}>
        <Routes>
          <Route path="/football/blind-resume" element={<FootballBlindResumePage />} />
          <Route path="/football/today" element={<div>DAILY BLIND RESUME OWNER</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("DAILY BLIND RESUME OWNER")).toBeInTheDocument();
  });

  it("does not change the UFC Blind Resume V3 reveal or scoring contract", () => {
    const ufcCard = createBlindResumeV3Card("football-v4-ufc-nonregression");
    expect(ufcCard.revealCounts).toEqual([2, 4, 6, 8]);
    expect(ufcCard.revealCounts.map((shown) => blindResumeV3RoundPoints(shown, true))).toEqual([20, 19, 18, 17]);
    expect(ufcCard.revealCounts.map((shown) => blindResumeV3RoundPoints(shown, false))).toEqual([2, 4, 6, 8]);
  });
});
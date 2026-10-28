import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MlbBlindResumeProductionChallenge from "./MlbBlindResumeProductionChallenge";
import { MLB_BLIND_RESUME_PRODUCTION_ROUNDS } from "./mlbBlindResumeProduction";

const { recordResult, reloadOverview } = vi.hoisted(() => ({
  recordResult: vi.fn(async (input: Record<string, unknown>) => ({
    rawScore: input.rawScore,
    gameType: input.gameType,
    publicResult: input.publicResult,
    resultDetail: input.resultDetail,
    completedAt: "2026-10-09T12:00:00-05:00",
  })),
  reloadOverview: vi.fn(async () => undefined),
}));

vi.mock("./mlbPlayChallenge", async () => {
  const actual = await vi.importActual<typeof import("./mlbPlayChallenge")>("./mlbPlayChallenge");
  return {
    ...actual,
    recordMlbPlayChallengeResult: (input: Record<string, unknown>) => recordResult(input),
  };
});

vi.mock("./useMlbPlayChallengeOverview", () => ({
  useMlbPlayChallengeOverview: () => ({
    overview: { unlocked: false, playerCount: 0, ownResult: null, entries: [] },
    loading: false,
    error: "",
    reload: reloadOverview,
  }),
}));

afterEach(() => {
  cleanup();
  recordResult.mockClear();
  reloadOverview.mockClear();
});

function pickWinner(roundIndex: number) {
  const round = MLB_BLIND_RESUME_PRODUCTION_ROUNDS[roundIndex]!;
  const side = round.winnerId === round.playerA.id ? "A" : "B";
  fireEvent.click(screen.getByRole("button", { name: `PICK ${side}` }));
}

describe("MLB Blind Resume production challenge", () => {
  it("plays five rounds and records one official 100-point result", async () => {
    render(
      <MemoryRouter>
        <MlbBlindResumeProductionChallenge challengeKey="mlb-2026-play-05" season={2026} />
      </MemoryRouter>,
    );

    for (let roundIndex = 0; roundIndex < MLB_BLIND_RESUME_PRODUCTION_ROUNDS.length; roundIndex += 1) {
      expect(document.body.textContent).toContain(`ROUND ${roundIndex + 1} OF 5`);
      pickWinner(roundIndex);
      if (roundIndex < MLB_BLIND_RESUME_PRODUCTION_ROUNDS.length - 1) {
        fireEvent.click(screen.getByRole("button", { name: /next round/i }));
      }
    }

    await waitFor(() => expect(recordResult).toHaveBeenCalledTimes(1));
    expect(recordResult).toHaveBeenCalledWith(expect.objectContaining({
      season: 2026,
      challengeKey: "mlb-2026-play-05",
      rawScore: 100,
      gameType: "blind_resume",
    }));
    await waitFor(() => expect(reloadOverview).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: /see final score/i }));
    expect(screen.getByText("100/100")).toBeInTheDocument();
    expect(screen.getByText("Perfect picks")).toBeInTheDocument();
    expect(screen.getByText(/5-0 record · 100 points earned/)).toBeInTheDocument();
  });
});

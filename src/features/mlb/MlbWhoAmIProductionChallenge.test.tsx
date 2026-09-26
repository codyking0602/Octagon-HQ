import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MlbWhoAmIProductionChallenge from "./MlbWhoAmIProductionChallenge";
import { MLB_WHO_AM_I_PRODUCTION_ROUNDS } from "./mlbWhoAmIProduction";

const { recordResult, reloadOverview } = vi.hoisted(() => ({
  recordResult: vi.fn(async (input: Record<string, unknown>) => ({
    rawScore: input.rawScore,
    gameType: input.gameType,
    publicResult: input.publicResult,
    resultDetail: input.resultDetail,
    completedAt: "2026-10-06T12:00:00-05:00",
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

function solveCurrentRound(name: string) {
  fireEvent.click(screen.getByRole("button", { name: /guess now/i }));
  fireEvent.change(screen.getByRole("textbox", { name: /search identities/i }), {
    target: { value: name },
  });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(name, "i") }));
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`submit ${name}`, "i") }));
}

describe("MLB Who Am I production challenge", () => {
  it("plays two rounds, averages them, and records one official score", async () => {
    render(
      <MemoryRouter>
        <MlbWhoAmIProductionChallenge challengeKey="mlb-2026-play-04" season={2026} />
      </MemoryRouter>,
    );

    expect(document.body.textContent).toContain("ROUND 1 OF 2");
    solveCurrentRound(MLB_WHO_AM_I_PRODUCTION_ROUNDS[0].hiddenSubject.name);
    expect(document.body.textContent).toContain("ROUND SCORE");
    fireEvent.click(screen.getByRole("button", { name: /continue to round 2/i }));

    expect(document.body.textContent).toContain("ROUND 2 OF 2");
    fireEvent.click(screen.getByRole("button", { name: /reveal 2/i }));
    solveCurrentRound(MLB_WHO_AM_I_PRODUCTION_ROUNDS[1].hiddenSubject.name);

    expect(document.body.textContent).toContain("DAILY SCORE · 98/100");

    await waitFor(() => expect(recordResult).toHaveBeenCalledTimes(1));
    expect(recordResult).toHaveBeenCalledWith(expect.objectContaining({
      season: 2026,
      challengeKey: "mlb-2026-play-04",
      rawScore: 98,
      gameType: "who_am_i",
    }));
    await waitFor(() => expect(reloadOverview).toHaveBeenCalledTimes(1));
  });
});

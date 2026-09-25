import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MlbWavelengthChallenge from "./MlbWavelengthChallenge";

const { recordMock, reloadMock } = vi.hoisted(() => ({
  recordMock: vi.fn(async (input: {
    rawScore: number;
    gameType: string;
    publicResult: Record<string, unknown>;
    resultDetail: Record<string, unknown>;
  }) => ({
    rawScore: input.rawScore,
    gameType: input.gameType,
    publicResult: input.publicResult,
    resultDetail: input.resultDetail,
    completedAt: "2026-10-01T12:00:00-05:00",
  })),
  reloadMock: vi.fn(async () => undefined),
}));

vi.mock("./mlbPlayChallenge", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./mlbPlayChallenge")>();
  return {
    ...actual,
    recordMlbPlayChallengeResult: recordMock,
  };
});

vi.mock("./useMlbPlayChallengeOverview", () => ({
  useMlbPlayChallengeOverview: () => ({
    overview: { unlocked: false, playerCount: 0, ownResult: null, entries: [] },
    loading: false,
    error: "",
    reload: reloadMock,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <MlbWavelengthChallenge
        mode="production"
        challengeKey="mlb-2026-play-02"
        challengeDate="2026-10-01"
      />
    </MemoryRouter>,
  );
}

function lockFour(getByRole: ReturnType<typeof renderPage>["getByRole"]) {
  for (let index = 0; index < 4; index += 1) {
    fireEvent.click(getByRole("button", {
      name: index === 3 ? /lock final guess/i : /lock guess & reveal next clue/i,
    }));
  }
}

describe("MLB production Wavelength challenge", () => {
  it("records one official averaged result with two distinct four-clue games", async () => {
    recordMock.mockClear();
    reloadMock.mockClear();
    const page = renderPage();

    lockFour(page.getByRole);
    fireEvent.click(page.getByRole("button", { name: /next game/i }));
    lockFour(page.getByRole);

    await waitFor(() => expect(recordMock).toHaveBeenCalledTimes(1));
    expect(recordMock).toHaveBeenCalledWith(expect.objectContaining({
      season: 2026,
      challengeKey: "mlb-2026-play-02",
      gameType: "wavelength",
    }));

    const call = recordMock.mock.calls[0]![0] as {
      publicResult: { round_scores: number[] };
      resultDetail: { rounds: Array<{ clues: Array<{ id: string }> }> };
    };
    expect(call.publicResult.round_scores).toHaveLength(2);
    expect(call.resultDetail.rounds).toHaveLength(2);

    const clueIds = call.resultDetail.rounds.flatMap((round) => round.clues.map((clue) => clue.id));
    expect(clueIds).toHaveLength(8);
    expect(new Set(clueIds).size).toBe(8);
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});

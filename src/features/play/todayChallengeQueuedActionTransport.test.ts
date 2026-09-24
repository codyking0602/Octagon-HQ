import { describe, expect, it, vi } from "vitest";
import { createTodayChallengeRepository } from "./todayChallengeRepository";

const dailyId = "11111111-1111-4111-8111-111111111111";

function row(revision: number) {
  return {
    available: true,
    id: dailyId,
    central_day: "2026-09-23",
    schedule_version: "responsive-test-v1",
    game_type: "wavelength",
    setup_key: "wavelength:test",
    content_version: "wavelength-v1",
    scoring_version: "play-official-score-v1",
    fallback_reason: null,
    public_setup: {},
    progress_revision: revision,
    public_state: { guesses: [] },
    reveal_setup: null,
    official_attempt: null,
    deployment_sha: "test-sha",
  };
}

describe("Today Challenge queued action transport", () => {
  it("forwards the stable client action id without changing legacy calls", async () => {
    const invoke = vi.fn()
      .mockResolvedValueOnce({ data: row(1), error: null })
      .mockResolvedValueOnce({ data: row(2), error: null });
    const client = {
      functions: { invoke },
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    const repository = createTodayChallengeRepository(client as never)!;
    const today = await repository.loadToday();

    await repository.advance(today, { guess: 60 }, "daily-action-1234");

    expect(invoke).toHaveBeenNthCalledWith(2, "daily-challenge-runtime", {
      body: {
        mode: "advance",
        sport: "ufc",
        daily_challenge_id: dailyId,
        revision: 1,
        action: { guess: 60 },
        client_action_id: "daily-action-1234",
      },
    });
  });
});

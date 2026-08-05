import { describe, expect, it, vi } from "vitest";
import {
  createTodayChallengeRepository,
  parseTodayChallengeProjection,
  TodayChallengeRepositoryError,
} from "./todayChallengeRepository";

const dailyId = "11111111-1111-4111-8111-111111111111";

function runtimeProjection(overrides: Record<string, unknown> = {}) {
  return {
    available: true,
    id: dailyId,
    central_day: "2026-08-05",
    schedule_version: "find-leader-v1",
    game_type: "find_leader",
    setup_key: "find-leader:test",
    content_version: "find-leader-v4",
    scoring_version: "play-official-score-v1",
    fallback_reason: null,
    public_setup: { question: "Who has the most wins?" },
    progress_revision: 2,
    public_state: { complete: false, eliminated_ids: ["one"] },
    reveal_setup: null,
    official_attempt: null,
    deployment_sha: "abc123",
    ...overrides,
  };
}

function clientWithResponses(responses: Array<{ data: unknown; error: unknown }>) {
  const invoke = vi.fn();
  for (const response of responses) invoke.mockResolvedValueOnce(response);
  return {
    client: {
      functions: { invoke },
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    },
    invoke,
  };
}

describe("Today’s Challenge runtime repository", () => {
  it("parses only the safe browser-facing runtime projection", () => {
    const parsed = parseTodayChallengeProjection(runtimeProjection({
      private_setup_evidence: { leader_id: "hidden" },
      private_grading_evidence: { ratings: { hidden: 99 } },
    }));

    expect(parsed.gameType).toBe("find_leader");
    expect(parsed.progressRevision).toBe(2);
    expect(parsed.publicState).toEqual({ complete: false, eliminated_ids: ["one"] });
    expect(parsed).not.toHaveProperty("privateSetupEvidence");
    expect(parsed).not.toHaveProperty("privateGradingEvidence");
  });

  it("uses one Edge Function owner for reads and optimistic progress writes", async () => {
    const { client, invoke } = clientWithResponses([
      { data: runtimeProjection(), error: null },
      { data: runtimeProjection({ progress_revision: 3, public_state: { eliminated_ids: ["one", "two"] } }), error: null },
    ]);
    const repository = createTodayChallengeRepository(client as never)!;

    const today = await repository.loadToday();
    const advanced = await repository.advance(today, { eliminated_id: "two" });

    expect(invoke).toHaveBeenNthCalledWith(1, "daily-challenge-runtime", {
      body: { mode: "get-today" },
    });
    expect(invoke).toHaveBeenNthCalledWith(2, "daily-challenge-runtime", {
      body: {
        mode: "advance",
        daily_challenge_id: dailyId,
        revision: 2,
        action: { eliminated_id: "two" },
      },
    });
    expect(advanced.progressRevision).toBe(3);
  });

  it("surfaces stale cross-device revisions without inventing a fallback write", async () => {
    const response = new Response(JSON.stringify({
      code: "STALE_PROGRESS",
      message: "Official daily progress changed on another device.",
    }), { status: 409, headers: { "Content-Type": "application/json" } });
    const { client } = clientWithResponses([
      { data: null, error: { message: "Edge Function returned a non-2xx status code", context: response } },
    ]);
    const repository = createTodayChallengeRepository(client as never)!;

    await expect(repository.advance({ id: dailyId, progressRevision: 4 }, { guess: 50 }))
      .rejects.toMatchObject<TodayChallengeRepositoryError>({
        code: "STALE_PROGRESS",
        stale: true,
      });
  });
});

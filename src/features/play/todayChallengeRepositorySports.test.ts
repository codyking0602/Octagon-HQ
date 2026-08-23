import { describe, expect, it } from "vitest";
import { createTodayChallengeRepository } from "./todayChallengeRepository";

const DAILY_ID = "00000000-0000-4000-8000-000000000001";

function projection(sport: "ufc" | "football") {
  return {
    available: true,
    sport,
    id: DAILY_ID,
    central_day: "2026-08-22",
    schedule_version: sport === "ufc" ? "play-rotation-v4" : "football-daily-v1",
    game_type: "find_leader",
    setup_key: `${sport}:test`,
    content_version: "test-content-v1",
    scoring_version: "play-official-score-v1",
    fallback_reason: null,
    public_setup: {},
    progress_revision: 0,
    public_state: {},
    reveal_setup: null,
    official_attempt: null,
    deployment_sha: "test-sha",
  } as const;
}

function clientFor(sport: "ufc" | "football") {
  const bodies: Record<string, unknown>[] = [];
  return {
    bodies,
    client: {
      functions: {
        invoke: async (_name: string, options: { body: Record<string, unknown> }) => {
          bodies.push(options.body);
          return { data: projection(sport), error: null };
        },
      },
      rpc: async () => ({ data: null, error: null }),
    },
  };
}

describe("sport-aware Today’s Challenge repository transport", () => {
  it("keeps the existing UFC runtime request body unchanged", async () => {
    const fake = clientFor("ufc");
    const repository = createTodayChallengeRepository(fake.client);
    expect(repository).not.toBeNull();

    const result = await repository!.loadToday();

    expect(fake.bodies).toEqual([{ mode: "get-today" }]);
    expect(result.sport).toBe("ufc");
  });

  it("adds only the Football sport discriminator to the shared runtime request", async () => {
    const fake = clientFor("football");
    const repository = createTodayChallengeRepository(fake.client, "football");
    expect(repository).not.toBeNull();

    const result = await repository!.loadToday();
    await repository!.advance(result, { eliminated_id: "subject-1" });

    expect(fake.bodies[0]).toEqual({ mode: "get-today", sport: "football" });
    expect(fake.bodies[1]).toEqual({
      mode: "advance",
      sport: "football",
      daily_challenge_id: DAILY_ID,
      revision: 0,
      action: { eliminated_id: "subject-1" },
    });
    expect(result.sport).toBe("football");
  });
});

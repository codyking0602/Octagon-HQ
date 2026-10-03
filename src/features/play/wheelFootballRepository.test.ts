import { describe, expect, it } from "vitest";
import { createWheelFootballRepository } from "./wheelFootballRepository";

const creatorId = "11111111-1111-4111-8111-111111111111";
const recipientId = "22222222-2222-4222-8222-222222222222";

function baseState(overrides: Record<string, unknown> = {}) {
  return {
    code: "ABCD1234",
    pool_scope: "NFL",
    division: null,
    phase: "spin",
    turn_count: 0,
    current_turn_profile_id: creatorId,
    pending_team: null,
    creator: { id: creatorId, display_name: "Creator" },
    recipient: { id: recipientId, display_name: "Recipient" },
    creator_roster: [],
    recipient_roster: [],
    opened_at: "2026-10-03T20:00:00Z",
    completed_at: null,
    forfeited_by_profile_id: null,
    forfeited_at: null,
    ...overrides,
  };
}

describe("Wheel of Football repository grading contract", () => {
  it("stays compatible with the pre-grading state during deployment ordering", async () => {
    const client = {
      rpc: async () => ({ data: baseState(), error: null }),
    };
    const repository = createWheelFootballRepository(client);
    const state = await repository!.load("ABCD1234");

    expect(state.grading_runtime_version).toBeNull();
    expect(state.grading_result).toBeNull();
  });

  it("parses the frozen pick grades and natural-completion grading result", async () => {
    const completed = baseState({
      phase: "complete",
      turn_count: 14,
      current_turn_profile_id: null,
      completed_at: "2026-10-03T22:00:00Z",
      grading_runtime_version: "nfl-wheel-grade-runtime-v1",
      creator_roster: [{
        turn_number: 1,
        team_code: "BUF",
        team_name: "Buffalo Bills",
        roster_slot: "QB",
        athlete_id: "3918298",
        display_name: "Josh Allen",
        position_label: "Quarterback",
        position_abbreviation: "QB",
        headshot_url: null,
        grade_family: "QB",
        grade: 99,
        grade_effective_date: "2026-10-03",
        grade_version: "nfl-wheel-qb-grades-2026-10-03-v1",
      }],
      grading_result: {
        version: "nfl-wheel-grade-runtime-v1",
        creator: {
          profile_id: creatorId,
          grade_total: 600,
          raw_average: 85.71,
          score: 71,
        },
        recipient: {
          profile_id: recipientId,
          grade_total: 580,
          raw_average: 82.86,
          score: 66,
        },
        winner_profile_id: creatorId,
        tied: false,
      },
    });
    const client = {
      rpc: async () => ({ data: completed, error: null }),
    };
    const repository = createWheelFootballRepository(client);
    const state = await repository!.load("ABCD1234");

    expect(state.creator_roster[0]?.grade).toBe(99);
    expect(state.creator_roster[0]?.grade_version).toBe("nfl-wheel-qb-grades-2026-10-03-v1");
    expect(state.grading_result?.winner_profile_id).toBe(creatorId);
    expect(state.grading_result?.creator.score).toBe(71);
  });

  it("never sends a grade from the browser when making a pick", async () => {
    let pickArgs: Record<string, unknown> | undefined;
    const client = {
      rpc: async (name: string, args?: Record<string, unknown>) => {
        if (name === "pick_wheel_football") pickArgs = args;
        return { data: baseState(), error: null };
      },
    };
    const repository = createWheelFootballRepository(client);
    await repository!.pick("ABCD1234", {
      athleteId: "3918298",
      displayName: "Josh Allen",
      positionLabel: "Quarterback",
      positionAbbreviation: "QB",
      rosterSlot: "QB",
      headshotUrl: null,
    });

    expect(pickArgs).toMatchObject({
      p_code: "ABCD1234",
      p_athlete_id: "3918298",
      p_display_name: "Josh Allen",
      p_position_abbreviation: "QB",
      p_roster_slot: "QB",
    });
    expect(Object.keys(pickArgs ?? {}).some((key) => /grade|score/i.test(key))).toBe(false);
  });
});

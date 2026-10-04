import { describe, expect, it } from "vitest";
import type { HqImpostorState } from "../features/impostor/hqImpostorRepository";
import {
  hqImpostorDailyGateRequired,
  hqImpostorV1Window,
} from "../features/impostor/hqImpostorSchedule";

function stateWithPhase(phase: string): HqImpostorState {
  return {
    available: true,
    event: {
      current_round: { phase },
    },
  } as unknown as HqImpostorState;
}

describe("HQ Impostor Oct 13 rollout", () => {
  it("preserves both scheduled Auction weeks before launch", () => {
    expect(hqImpostorV1Window(new Date("2026-10-03T17:00:00Z"))).toEqual({
      before: true,
      active: false,
      after: false,
    });
    expect(hqImpostorV1Window(new Date("2026-10-10T17:00:00Z")).active).toBe(false);
  });

  it("owns exactly the Oct 13-19 Featured Challenge window", () => {
    expect(hqImpostorV1Window(new Date("2026-10-13T05:00:00Z")).active).toBe(true);
    expect(hqImpostorV1Window(new Date("2026-10-20T04:59:59Z")).active).toBe(true);
    expect(hqImpostorV1Window(new Date("2026-10-20T05:00:00Z"))).toEqual({
      before: false,
      active: false,
      after: true,
    });
  });

  it("blocks Football Daily only when the player has an actionable Impostor step", () => {
    expect(hqImpostorDailyGateRequired(null)).toBe(true);
    for (const phase of ["assignment", "clue", "board_ready", "vote", "resolved"]) {
      expect(hqImpostorDailyGateRequired(stateWithPhase(phase))).toBe(true);
    }
    for (const phase of ["clue_locked", "vote_locked", "waiting_round", "inactive", "event_complete"]) {
      expect(hqImpostorDailyGateRequired(stateWithPhase(phase))).toBe(false);
    }
  });
});

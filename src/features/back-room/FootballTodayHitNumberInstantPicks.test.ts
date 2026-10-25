import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import {
  optimisticFootballHitNumberRewind,
  optimisticFootballHitNumberToggle,
} from "./FootballTodayChallengePage";

const ids = ["alpha", "bravo", "charlie", "delta", "echo"];

function board(withEligibility = true): TodayChallengeProjection {
  return {
    id: "football-hit-number-1",
    gameType: "hit_the_number",
    publicSetup: {
      pick_count: 4,
      slots: [
        { id: "s1", label: "Quarterback" },
        { id: "s2", label: "Running back" },
        { id: "s3", label: "Receiver" },
        { id: "s4", label: "Defense" },
      ],
      candidates: ids.map((id) => ({ id, name: id })),
      ...(withEligibility ? {
        slot_eligible_ids: [["alpha", "echo"], ["bravo"], ["charlie"], ["delta"]],
      } : {}),
    },
    publicState: {
      complete: false,
      selected_ids: [],
      available_subject_ids: ["alpha", "echo"],
      active_slot: { id: "s1", label: "Quarterback", index: 0 },
    },
    officialAttempt: null,
  } as unknown as TodayChallengeProjection;
}

describe("Football Official Daily Hit the Number instant pick UX", () => {
  it("advances role boards immediately, using only the published eligibility", () => {
    const start = board();
    const first = optimisticFootballHitNumberToggle(start, "alpha");
    expect(first.publicState.selected_ids).toEqual(["alpha"]);
    expect(first.publicState.active_slot).toEqual({ id: "s2", label: "Running back", index: 1 });
    expect(first.publicState.available_subject_ids).toEqual(["bravo"]);
    expect(first.progressRevision).toBe(start.progressRevision);
    expect(first.officialAttempt).toBe(start.officialAttempt);

    const second = optimisticFootballHitNumberToggle(first, "bravo");
    expect(second.publicState.selected_ids).toEqual(["alpha", "bravo"]);
    expect(second.publicState.active_slot).toMatchObject({ index: 2 });
    expect(optimisticFootballHitNumberToggle(second, "echo")).toBe(second);
    expect(optimisticFootballHitNumberToggle(second, "alpha")).toBe(second);
    const rewind = optimisticFootballHitNumberRewind(second, 1);
    expect(rewind.publicState.selected_ids).toEqual(["alpha"]);
    expect(rewind.publicState.active_slot).toMatchObject({ index: 1 });

    const third = optimisticFootballHitNumberToggle(optimisticFootballHitNumberToggle(
      optimisticFootballHitNumberToggle(rewind, "bravo"), "charlie"), "delta");
    expect(third.publicState.selected_ids).toEqual(["alpha", "bravo", "charlie", "delta"]);
    expect(third.publicState.active_slot).toBeNull();
  });

  it("uses an authoritative response when older projections lack slot eligibility", () => {
    const original = board(false);
    expect(optimisticFootballHitNumberToggle(original, "alpha")).toBe(original);
    expect(optimisticFootballHitNumberRewind(original, 0)).toBe(original);
  });

  it("retains immediate select/deselect for classic boards", () => {
    const original = board();
    original.publicSetup.slots = [];
    const selected = optimisticFootballHitNumberToggle(original, "alpha");
    expect(selected.publicState.selected_ids).toEqual(["alpha"]);
    expect(optimisticFootballHitNumberToggle(selected, "alpha").publicState.selected_ids).toEqual([]);
  });

  it("publishes role eligibility without revealing hidden scoring evidence", () => {
    const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
    const payload = edge.slice(
      edge.indexOf("function footballPublicPayload("),
      edge.indexOf("function normalizeLegacyFootballProgress("),
    );
    expect(payload).toContain("progression_slot_subject_ids");
    expect(payload).toContain("twoGameChild(context");
    expect(payload).toContain("slot_eligible_ids: eligibleRows");
    expect(payload).not.toContain("private_grading_evidence");
    expect(payload).not.toContain("context.privateGradingEvidence");
  });
});

import { describe, expect, it } from "vitest";
import {
  FIND_LEADER_DAILY_CONTENT_VERSION,
  dailyFindLeaderBoard,
} from "./findLeaderEngine";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

const scheduleVersion = "test-find-leader-daily-v2";
const supplementalDefinitionIds = new Set([
  "ufc-main-events-all-time",
  "ufc-bonus-awards-all-time",
  "first-round-ufc-finishes-all-time",
  "ufc-knockdowns-landed-all-time",
]);

function dayAtOffset(offset: number) {
  const date = new Date(Date.UTC(2026, 6, 16 + offset));
  return date.toISOString().slice(0, 10);
}

function runtimeContext(setup: ReturnType<typeof buildOfficialDailySetup>): OfficialDailyRuntimeContext {
  return {
    gameType: "find_leader",
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(setup.publicSetup),
  };
}

describe("Find the Leader Daily v2 release", () => {
  it("publishes a deliberate deterministic Daily content identity", () => {
    const day = "2026-08-19";
    const first = buildOfficialDailySetup("find_leader", day, scheduleVersion);
    const second = buildOfficialDailySetup("find_leader", day, scheduleVersion);

    expect(second).toEqual(first);
    expect(first.contentVersion).toBe(FIND_LEADER_DAILY_CONTENT_VERSION);
    expect(first.setupKey.startsWith(`${FIND_LEADER_DAILY_CONTENT_VERSION}:`)).toBe(true);
  });

  it("reaches every supplemental category through the official Daily setup owner", () => {
    const observed = new Set<string>();

    for (let offset = 0; offset < 40 && observed.size < supplementalDefinitionIds.size; offset += 1) {
      const day = dayAtOffset(offset);
      const board = dailyFindLeaderBoard(day);
      if (!board || !supplementalDefinitionIds.has(board.definitionId)) continue;

      const setup = buildOfficialDailySetup("find_leader", day, scheduleVersion);
      observed.add(board.definitionId);
      expect(setup.contentVersion).toBe(FIND_LEADER_DAILY_CONTENT_VERSION);
      expect(setup.publicSetup.family).toBe("supplemental");
      const candidates = setup.publicSetup.candidates as Array<{ id: string }>;
      expect(candidates).toHaveLength(10);
      expect(new Set(candidates.map((fighter) => fighter.id)).size).toBe(10);
      expect(candidates.some((fighter) => fighter.id === setup.privateSetupEvidence.leader_id)).toBe(true);
    }

    supplementalDefinitionIds.forEach((definitionId) => {
      expect(observed.has(definitionId), `official Daily never generated ${definitionId}`).toBe(true);
    });
  });

  it("keeps the browser-facing Find the Leader setup free of answer evidence before completion", () => {
    const setup = buildOfficialDailySetup("find_leader", "2026-08-19", scheduleVersion);
    const publicProjection = JSON.stringify({
      public_setup: setup.publicSetup,
      public_state: initialOfficialDailyPublicState(setup.publicSetup),
    });

    expect(publicProjection).not.toContain('"leader_id"');
    expect(publicProjection).not.toContain('"leader_value"');
    expect(publicProjection).not.toContain('"privateSetupEvidence"');
    expect(publicProjection).not.toContain('"privateGradingEvidence"');
  });

  it("keeps a legacy Find the Leader setup identity playable through the same runtime", () => {
    const setup = buildOfficialDailySetup("find_leader", "2026-08-19", scheduleVersion);
    const candidateIds = setup.privateSetupEvidence.candidate_ids as string[];
    const leaderId = String(setup.privateSetupEvidence.leader_id);
    const safeIds = candidateIds.filter((id) => id !== leaderId);
    let context: OfficialDailyRuntimeContext = {
      ...runtimeContext(setup),
      setupKey: "find-leader-v5-20260819-plausible-decoys:legacy-materialized-proof",
    };

    for (const eliminatedId of safeIds) {
      const next = advanceOfficialDailyRuntime(context, { eliminated_id: eliminatedId });
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
    }

    expect(context.publicState.complete).toBe(true);
    expect((context.submissionState.final_submission as { eliminated_ids: string[] }).eliminated_ids).toEqual(safeIds);
  });
});

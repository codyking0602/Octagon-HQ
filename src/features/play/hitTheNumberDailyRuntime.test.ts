import { describe, expect, it } from "vitest";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  OFFICIAL_DAILY_RUNTIME_VERSION,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";
import { HIT_THE_NUMBER_DAILY_CONTENT_VERSION } from "./hitTheNumberDailyRuntime";
import type { HitTheNumberFormatId } from "./hitTheNumberFormats";

const scheduleVersion = "test-hit-number-daily-v1";
const supplementalStatIds = [
  "ufc-main-events",
  "ufc-bonus-awards",
  "ufc-first-round-finishes",
] as const;

function dayAt(index: number) {
  return new Date(Date.UTC(2027, 0, index + 1)).toISOString().slice(0, 10);
}

type DailySetup = ReturnType<typeof buildOfficialDailySetup>;

function hitNumberChildSetups(setup: DailySetup): DailySetup[] {
  const rounds = setup.privateSetupEvidence.rounds;
  if (!Array.isArray(rounds)) return [setup];
  return rounds.map((value) => {
    const row = value as Record<string, unknown>;
    return {
      setupKey: String(row.setup_key ?? ""),
      contentVersion: String(row.content_version ?? ""),
      scoringVersion: row.scoring_version as DailySetup["scoringVersion"],
      publicSetup: row.public_setup as DailySetup["publicSetup"],
      revealSetup: row.reveal_setup as DailySetup["revealSetup"],
      privateSetupEvidence: row.private_setup_evidence as DailySetup["privateSetupEvidence"],
      privateGradingEvidence: row.private_grading_evidence as DailySetup["privateGradingEvidence"],
    };
  });
}

function formatIdFor(setup: ReturnType<typeof buildOfficialDailySetup>) {
  const format = setup.publicSetup.format as Record<string, unknown> | undefined;
  return String(format?.formatId ?? "classic") as HitTheNumberFormatId;
}

function setupForFormat(formatId: HitTheNumberFormatId) {
  for (let index = 0; index < 240; index += 1) {
    const day = dayAt(index);
    const setup = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
    for (const child of hitNumberChildSetups(setup)) {
      if (formatIdFor(child) === formatId) return { day, setup: child };
    }
  }
  throw new Error(`No deterministic ${formatId} Daily seed found.`);
}

function contextForSetup(
  setup: ReturnType<typeof buildOfficialDailySetup>,
  overrides: Partial<OfficialDailyRuntimeContext> = {},
): OfficialDailyRuntimeContext {
  return {
    gameType: "hit_the_number",
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(setup.publicSetup),
    ...overrides,
  };
}

function uniqueSlotAssignment(slotEligibleIds: readonly string[][]) {
  const assignment = new Array<string>(slotEligibleIds.length);
  const used = new Set<string>();

  function visit(index: number): boolean {
    if (index === slotEligibleIds.length) return true;
    for (const fighterId of slotEligibleIds[index] ?? []) {
      if (used.has(fighterId)) continue;
      used.add(fighterId);
      assignment[index] = fighterId;
      if (visit(index + 1)) return true;
      used.delete(fighterId);
    }
    return false;
  }

  if (!visit(0)) throw new Error("Official Hit the Number slot evidence has no legal assignment.");
  return assignment;
}

describe("official Hit the Number daily runtime", () => {
  it("deterministically materializes both board modes and all four canonical formats without leaking private evidence", () => {
    const observedModes = new Set<string>();
    const observedFormats = new Set<string>();

    for (let index = 0; index < 120; index += 1) {
      const day = dayAt(index);
      const first = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
      const second = buildOfficialDailySetup("hit_the_number", day, scheduleVersion);
      expect(second).toEqual(first);
      expect(first.scoringVersion).toBe("daily-two-game-average-score-v1");
      const children = hitNumberChildSetups(first);
      expect(children).toHaveLength(2);

      for (const child of children) {
        expect(child.contentVersion).toBe(HIT_THE_NUMBER_DAILY_CONTENT_VERSION);
        expect(child.setupKey.startsWith(`${HIT_THE_NUMBER_DAILY_CONTENT_VERSION}:`)).toBe(true);
        expect(child.scoringVersion).toBe("play-official-score-v1");
        expect(child.publicSetup.runtime_version).toBe(OFFICIAL_DAILY_RUNTIME_VERSION);
        expect(child.publicSetup.version).toBe("hit-the-number-v2");
        expect(child.publicSetup.target).toEqual(expect.any(Number));
        expect(child.publicSetup.pickCount).toEqual(expect.any(Number));
        expect(child.publicSetup.fighterIds).toEqual(expect.any(Array));
        expect(child.publicSetup.format).toEqual(expect.objectContaining({
          formatId: expect.any(String),
          label: expect.any(String),
          slots: expect.any(Array),
        }));
        observedModes.add(String(child.publicSetup.boardType));
        observedFormats.add(formatIdFor(child));

        const browserJson = JSON.stringify({
          public_setup: child.publicSetup,
          public_state: initialOfficialDailyPublicState(child.publicSetup),
          reveal_setup: child.revealSetup,
        });
        expect(browserJson).not.toContain("solutionFighterIds");
        expect(browserJson).not.toContain("solution_fighter_ids");
        expect(browserJson).not.toContain('"values"');
        expect(browserJson).not.toContain("slot_eligible_ids");
        expect(child.privateGradingEvidence.values).toEqual(expect.any(Object));
        expect(child.privateGradingEvidence.slot_eligible_ids).toEqual(expect.any(Array));
        expect(child.revealSetup).toEqual({});
      }
    }

    expect(observedModes).toEqual(new Set(["open-roster", "random-pool"]));
    expect(observedFormats).toEqual(new Set([
      "classic",
      "themed-lineup",
      "one-from-each",
      "build-the-team",
    ]));
  });

  it("releases the approved UFCStats-backed stat catalog into official Daily boards", () => {
    const observedSupplementalStats = new Set<string>();

    for (let index = 0; index < 240 && observedSupplementalStats.size < supplementalStatIds.length; index += 1) {
      const setup = buildOfficialDailySetup("hit_the_number", dayAt(index), scheduleVersion);
      for (const child of hitNumberChildSetups(setup)) {
        const statId = String(child.publicSetup.statId ?? "");
        if (supplementalStatIds.some((candidate) => candidate === statId)) {
          observedSupplementalStats.add(statId);
        }
      }
    }

    supplementalStatIds.forEach((statId) => {
      expect(observedSupplementalStats.has(statId), `official Daily never generated ${statId}`).toBe(true);
    });
  });

  it("preserves the existing reversible flat-selection runtime for Classic Daily boards", () => {
    const { setup } = setupForFormat("classic");
    let context = contextForSetup(setup);
    const fighterIds = context.privateSetupEvidence.fighter_ids as string[];
    const pickCount = Number(context.privateSetupEvidence.pick_count);
    const chosen = fighterIds.slice(0, pickCount);

    for (const fighterId of chosen) {
      const next = advanceOfficialDailyRuntime(context, { fighter_id: fighterId });
      expect(next.complete).toBe(false);
      expect(next.finalSubmission).toBeNull();
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
    }

    expect(context.publicState.selected_ids).toEqual(chosen);
    expect(context.publicState.complete).toBe(false);

    const removed = advanceOfficialDailyRuntime(context, { fighter_id: chosen[0] });
    expect(removed.publicState.selected_ids).toEqual(chosen.slice(1));
    context = {
      ...context,
      submissionState: removed.submissionState,
      publicState: removed.publicState,
    };
    expect(() => advanceOfficialDailyRuntime(context, { lock: true })).toThrow(/exactly/i);

    const restored = advanceOfficialDailyRuntime(context, { fighter_id: chosen[0] });
    context = {
      ...context,
      submissionState: restored.submissionState,
      publicState: restored.publicState,
    };
    const locked = advanceOfficialDailyRuntime(context, { lock: true });
    expect(locked.complete).toBe(true);
    expect(locked.publicState.complete).toBe(true);
    expect(locked.finalSubmission).toEqual({ selected_ids: [...chosen.slice(1), chosen[0]] });
  });

  it("persists ordered slot assignments and rejects fighters outside the active One From Each role", () => {
    const { setup } = setupForFormat("one-from-each");
    let context = contextForSetup(setup);
    const fighterIds = context.privateSetupEvidence.fighter_ids as string[];
    const slotEligibleIds = context.privateSetupEvidence.slot_eligible_ids as string[][];
    const assignment = uniqueSlotAssignment(slotEligibleIds);

    const invalid = slotEligibleIds.findIndex((eligibleIds) => (
      fighterIds.some((fighterId) => !eligibleIds.includes(fighterId))
    ));
    expect(invalid).toBeGreaterThanOrEqual(0);
    const invalidFighter = fighterIds.find(
      (fighterId) => !slotEligibleIds[invalid]!.includes(fighterId),
    )!;
    expect(() => advanceOfficialDailyRuntime(context, {
      fighter_id: invalidFighter,
      slot_index: invalid,
    })).toThrow(/not eligible/i);

    assignment.forEach((fighterId, slotIndex) => {
      const next = advanceOfficialDailyRuntime(context, { fighter_id: fighterId, slot_index: slotIndex });
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
    });

    expect(context.publicState.slot_assignments).toEqual(assignment);
    expect(context.publicState.selected_ids).toEqual(assignment);
    const locked = advanceOfficialDailyRuntime(context, { lock: true });
    expect(locked.complete).toBe(true);
    expect(locked.finalSubmission).toEqual({ selected_ids: assignment });
  });

  it("keeps already-materialized legacy Classic Daily boards valid without slot evidence", () => {
    const { setup } = setupForFormat("classic");
    const privateSetupEvidence = { ...setup.privateSetupEvidence };
    delete privateSetupEvidence.format_id;
    delete privateSetupEvidence.slot_eligible_ids;
    const publicSetup = { ...setup.publicSetup };
    delete publicSetup.format;
    const fighterIds = privateSetupEvidence.fighter_ids as string[];
    const pickCount = Number(privateSetupEvidence.pick_count);
    let context = contextForSetup(setup, {
      publicSetup,
      privateSetupEvidence,
      publicState: initialOfficialDailyPublicState(publicSetup),
    });

    for (const fighterId of fighterIds.slice(0, pickCount)) {
      const next = advanceOfficialDailyRuntime(context, { fighter_id: fighterId });
      context = {
        ...context,
        submissionState: next.submissionState,
        publicState: next.publicState,
      };
    }

    expect(advanceOfficialDailyRuntime(context, { lock: true }).complete).toBe(true);
  });
});
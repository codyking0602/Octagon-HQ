import { describe, expect, it } from "vitest";
import { isUfcPublicationDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { WAVELENGTH_CATALOG_VERSION, approvedWavelengthCatalog, wavelengthCatalog } from "./wavelengthCatalog";
import { wavelengthScore } from "./wavelengthEngine";
import { advanceUfcWavelength } from "./ufcDailyActionCore";
import {
  advanceOfficialDailyRuntime,
  buildOfficialDailySetup,
  initialOfficialDailyPublicState,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

type RecordValue = Record<string, unknown>;
const asRecord = (value: unknown): RecordValue => value as RecordValue;
const asRows = (value: unknown): RecordValue[] => value as RecordValue[];
const dayAt = (index: number) => new Date(Date.UTC(2026, 9, 29 + index)).toISOString().slice(0, 10);

function gameContext(setup: ReturnType<typeof buildOfficialDailySetup>): OfficialDailyRuntimeContext {
  return {
    gameType: "wavelength",
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: initialOfficialDailyPublicState(setup.publicSetup),
  };
}

describe("UFC Wavelength focused six-month readiness", () => {
  it("keeps prior published clue identities readable while drawing only from the expanded approved catalog", () => {
    expect(WAVELENGTH_CATALOG_VERSION).toBe("wavelength-catalog-v5");
    expect(wavelengthCatalog.filter((clue) => clue.status === "retired")).toHaveLength(29);
    expect(wavelengthCatalog.filter((clue) => clue.status === "quarantined")).toHaveLength(1);
    expect(approvedWavelengthCatalog).toHaveLength(605);
    expect(approvedWavelengthCatalog.filter((clue) => clue.id.startsWith("wl-ufc-refresh-"))).toHaveLength(20);
    expect(approvedWavelengthCatalog.some((clue) => clue.id === "wl-fighter-skill-005")).toBe(false);
    expect(approvedWavelengthCatalog.some((clue) => clue.id === "wl-ufc-balance-553")).toBe(false);
    expect(approvedWavelengthCatalog.some((clue) => clue.id === "wl-ufc-balance-555")).toBe(false);

    const setup = buildOfficialDailySetup("wavelength", "2026-10-31", "ufc-wavelength-refresh-test");
    const historical = {
      ...gameContext(setup),
      setupKey: "previously-published-legacy-clue",
      privateSetupEvidence: { target: 50, opening_clue_id: "wl-fighter-skill-005" },
      submissionState: { guesses: [], clue_ids: ["wl-fighter-skill-005"] },
      publicState: { complete: false, guesses: [], clues: [] },
    };
    const advance = advanceUfcWavelength(historical, { guess: 50 });
    expect(asRows(advance.publicState.clues)[0]).toMatchObject({
      id: "wl-fighter-skill-005",
      text: "Justin Gaethje's offensive wrestling in UFC fights",
    });
  });

  it("models every UFC 48-hour publication through April 24 and two distinct Wavelength openings", () => {
    const scheduled: string[] = [];
    const allTargets: number[] = [];
    const allIds: string[] = [];
    const scheduleVersion = "ufc-daily-v22-higher-lower-oct29";
    for (let offset = 0; offset <= 177; offset += 1) {
      const day = dayAt(offset);
      if (!isUfcPublicationDay(day) || lockedWeightedGameForDay("ufc", day) !== "wavelength") continue;
      scheduled.push(day);
      const setup = buildOfficialDailySetup("wavelength", day, scheduleVersion);
      const rounds = asRows(setup.privateSetupEvidence.rounds);
      expect(rounds).toHaveLength(2);
      const first = asRecord(rounds[0]!.private_setup_evidence);
      const second = asRecord(rounds[1]!.private_setup_evidence);
      const targets = [Number(first.target), Number(second.target)];
      const ids = [String(first.opening_clue_id), String(second.opening_clue_id)];
      expect(new Set(targets).size).toBe(2);
      expect(new Set(ids).size).toBe(2);
      for (const id of ids) {
        expect(approvedWavelengthCatalog.some((clue) => clue.id === id)).toBe(true);
      }
      allTargets.push(...targets);
      allIds.push(...ids);
    }
    expect(scheduled).toHaveLength(9);
    expect(allTargets).toHaveLength(18);
    expect(new Set(allTargets).size).toBeGreaterThan(10);
    expect(new Set(allIds).size).toBeGreaterThan(12);
  });

  it("replays a complete server-owned two-game Daily and rounds the average", () => {
    const setup = buildOfficialDailySetup("wavelength", "2026-10-31", "ufc-daily-v22-higher-lower-oct29");
    const rounds = asRows(setup.privateSetupEvidence.rounds);
    expect(rounds).toHaveLength(2);
    const targets = rounds.map((round) => Number(asRecord(round.private_setup_evidence).target));
    let context = gameContext(setup);
    for (const guess of [30, 60, 40, 51]) {
      const result = advanceOfficialDailyRuntime(context, { guess });
      context = { ...context, submissionState: result.submissionState, publicState: result.publicState };
    }
    expect(context.publicState.round_scores).toEqual([wavelengthScore(51, targets[0]!)]);
    expect(context.publicState.handoff_pending).toBe(true);
    const handoff = advanceOfficialDailyRuntime(context, { type: "next_game" });
    context = { ...context, submissionState: handoff.submissionState, publicState: handoff.publicState };
    for (const guess of [70, 30, 60, 49]) {
      const result = advanceOfficialDailyRuntime(context, { guess });
      context = { ...context, submissionState: result.submissionState, publicState: result.publicState };
    }
    const scores = [wavelengthScore(51, targets[0]!), wavelengthScore(49, targets[1]!)];
    expect(context.publicState.complete).toBe(true);
    expect(context.publicState.round_scores).toEqual(scores);
    expect(context.publicState.score).toBe(Math.round((scores[0]! + scores[1]!) / 2));
    expect(asRows(asRecord(context.submissionState.final_submission).rounds)).toHaveLength(2);
  });
});

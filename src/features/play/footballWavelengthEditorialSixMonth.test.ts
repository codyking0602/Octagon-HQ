import { describe, expect, it } from "vitest";
import {
  FOOTBALL_WAVELENGTH_EDITORIAL_CUTOVER_DAY,
  FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS,
  usesFootballWavelengthEditorialPool,
} from "../back-room/footballWavelengthEditorial2026";
import {
  createFootballWavelengthRound,
  footballWavelengthClues,
  footballWavelengthAvailableClues,
  footballWavelengthPlayableClues,
  nextFootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { lockedWeightedGameForDay } from "./dailyChallengeRotation";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationWavelength";
import { advanceFootballWavelengthDailyRuntime } from "./footballWavelengthDailyAdvance";
import { wavelengthScore } from "./wavelengthEngine";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

const scheduleVersion = "football-daily-v22-higher-lower-oct27";
type DailyWavelengthChild = {
  private_setup_evidence: { target: number; seed: string };
  public_setup: { initial_state: { clues: Array<{ id: string; category: string; text: string }> } };
};
function children(day: string) {
  const publication = buildFootballDailyPersistenceSetup(day, scheduleVersion, "wavelength");
  return {
    publication,
    rounds: publication.privateSetupEvidence.rounds as DailyWavelengthChild[],
  };
}

describe("Football Wavelength future-only editorial and six-month readiness", () => {
  it("keeps all retired IDs for historical replays and one fresh successor per edit", () => {
    expect(footballWavelengthClues).toHaveLength(540);
    expect(footballWavelengthPlayableClues).toHaveLength(540);
    expect(footballWavelengthAvailableClues).toHaveLength(540 + FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS.length);
    expect(FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS).toHaveLength(101);
    expect(FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS.filter((row) => row.kind === "rewrite")).toHaveLength(91);
    expect(FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS.filter((row) => row.kind === "replace")).toHaveLength(10);
    const old = new Map(footballWavelengthClues.map((clue) => [clue.id, clue]));
    const newIds = new Set(footballWavelengthPlayableClues.map((clue) => clue.id));
    expect(newIds.size).toBe(540);
    for (const revision of FOOTBALL_WAVELENGTH_EDITORIAL_REVISIONS) {
      expect(old.get(revision.legacyId)?.category).toBe(revision.category);
      expect(newIds.has(revision.legacyId)).toBe(false);
      expect(newIds.has(`${revision.legacyId}-editorial-2026`)).toBe(true);
      expect(revision.rating).toBeGreaterThanOrEqual(1);
      expect(revision.rating).toBeLessThanOrEqual(100);
      expect(revision.text.length).toBeLessThanOrEqual(65);
    }
  });

  it("does not change candidate eligibility or replay mechanics for published days", () => {
    expect(FOOTBALL_WAVELENGTH_EDITORIAL_CUTOVER_DAY).toBe("2026-11-02");
    const oldSeed = `football-daily-v22-higher-lower-oct27|wavelength|${scheduleVersion}|2026-10-27`;
    expect(usesFootballWavelengthEditorialPool(oldSeed)).toBe(false);
    expect(usesFootballWavelengthEditorialPool("casual-replay-no-day")).toBe(true);
    expect(usesFootballWavelengthEditorialPool(
      `football-runtime|wavelength|${scheduleVersion}|2026-11-07|game-2|0`,
    )).toBe(true);
    const before = createFootballWavelengthRound(oldSeed);
    const after = createFootballWavelengthRound(oldSeed);
    expect(after).toEqual(before);
    const guess = Math.max(1, before.target - 11);
    const next = nextFootballWavelengthClue(before, guess, 1, oldSeed, []);
    expect(footballWavelengthClues.some((clue) => clue.id === next.id)).toBe(true);
  });

  it("supports the actual next 184 daily slots with two distinct games, balanced targets and category variety", () => {
    const start = Date.UTC(2026, 10, 2);
    const openingIds = new Set<string>();
    const categories = new Set<string>();
    const targetBands = new Set<number>();
    let appearances = 0;
    let totalGames = 0;
    for (let offset = 0; offset < 184; offset += 1) {
      const day = new Date(start + offset * 86400000).toISOString().slice(0, 10);
      if (lockedWeightedGameForDay("football", day) !== "wavelength") continue;
      appearances += 1;
      const { rounds, publication } = children(day);
      expect(rounds, day).toHaveLength(2);
      expect(publication.publicSetup.round_count, day).toBe(2);
      const first = rounds[0]!;
      const second = rounds[1]!;
      const firstClue = first.public_setup.initial_state.clues[0]!;
      const secondClue = second.public_setup.initial_state.clues[0]!;
      expect(first.private_setup_evidence.target, day).not.toBe(second.private_setup_evidence.target);
      expect(firstClue.id, day).not.toBe(secondClue.id);
      expect(firstClue.category, day).not.toBe(secondClue.category);
      for (const round of rounds) {
        const target = round.private_setup_evidence.target;
        expect(target).toBeGreaterThanOrEqual(1);
        expect(target).toBeLessThanOrEqual(100);
        targetBands.add(Math.min(4, Math.floor((target - 1) / 20)));
        const opening = round.public_setup.initial_state.clues[0]!;
        expect(opening.text.length, day).toBeLessThanOrEqual(65);
        openingIds.add(opening.id);
        categories.add(opening.category);
        totalGames += 1;
      }
    }
    expect(appearances).toBeGreaterThanOrEqual(18);
    expect(totalGames).toBe(appearances * 2);
    expect(openingIds.size).toBeGreaterThanOrEqual(18);
    expect(categories.size).toBeGreaterThanOrEqual(10);
    expect(targetBands.size).toBe(5);
  });

  it("replays a future two-game Daily through reveal, handoff and persisted rounded average", () => {
    const day = "2026-11-07";
    expect(lockedWeightedGameForDay("football", day)).toBe("wavelength");
    const { publication, rounds } = children(day);
    let context: OfficialDailyRuntimeContext = {
      gameType: "wavelength",
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      revealSetup: publication.revealSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      privateGradingEvidence: publication.privateGradingEvidence,
      submissionState: {},
      publicState: publication.publicSetup.initial_state as Record<string, unknown>,
    };
    for (const action of [
      { guess: 15 }, { guess: 35 }, { guess: 45 }, { guess: 55 },
      { type: "next_game" },
      { guess: 35 }, { guess: 45 }, { guess: 55 }, { guess: 65 },
    ]) {
      const advanced = advanceFootballWavelengthDailyRuntime(context, action);
      context = { ...context, submissionState: advanced.submissionState, publicState: advanced.publicState };
    }
    expect(context.publicState.complete).toBe(true);
    const expectedScores = [
      wavelengthScore(55, rounds[0]!.private_setup_evidence.target),
      wavelengthScore(65, rounds[1]!.private_setup_evidence.target),
    ];
    expect(context.publicState.round_scores).toEqual(expectedScores);
    expect(context.publicState.score).toBe(Math.round((expectedScores[0]! + expectedScores[1]!) / 2));
    expect(context.submissionState.final_submission).toHaveProperty("rounds");
  });
});

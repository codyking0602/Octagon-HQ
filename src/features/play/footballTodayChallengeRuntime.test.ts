import { describe, expect, it } from "vitest";
import {
  advanceFootballOfficialDailyRuntime,
  buildFootballOfficialDailySetup,
} from "./footballTodayChallengeRuntime";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

const DAY = "2026-08-22";
const SCHEDULE = "football-daily-v1";

function record(value: unknown) {
  return value as Record<string, unknown>;
}

describe("Football official daily runtime", () => {
  it("builds the same official setup for the same day and schedule", () => {
    const first = buildFootballOfficialDailySetup("blind_resume", DAY, SCHEDULE);
    const second = buildFootballOfficialDailySetup("blind_resume", DAY, SCHEDULE);
    expect(second).toEqual(first);
  });

  it("balances the Daily Double across NFL and CFB while keeping answers private", () => {
    const rank = buildFootballOfficialDailySetup("blind_rank_5", DAY, SCHEDULE);
    const keep = buildFootballOfficialDailySetup("keep_4_cut_4", DAY, SCHEDULE);
    const rankPack = record(rank.publicSetup.pack);
    const keepPack = record(keep.publicSetup.pack);
    expect(rankPack.league).toMatch(/NFL|CFB/);
    expect(keepPack.league).toMatch(/NFL|CFB/);
    expect(keepPack.league).not.toBe(rankPack.league);
    expect(JSON.stringify(rank.publicSetup)).not.toContain('"rating"');
    expect(JSON.stringify(keep.publicSetup)).not.toContain('"rating"');
    expect(record(rank.privateGradingEvidence).ratings).toBeTruthy();
    expect(record(keep.privateGradingEvidence).ratings).toBeTruthy();
  });

  it("keeps Football Blind Resume at a deliberate 3/2 NFL-CFB split with hidden winners", () => {
    const setup = buildFootballOfficialDailySetup("blind_resume", DAY, SCHEDULE);
    const leagueMix = record(setup.publicSetup.league_mix);
    const nfl = Number(leagueMix.NFL ?? 0);
    const cfb = Number(leagueMix.CFB ?? 0);
    expect(nfl + cfb).toBe(5);
    expect([nfl, cfb].sort()).toEqual([2, 3]);
    expect(JSON.stringify(setup.publicSetup)).not.toContain("winner_id");
    expect(record(setup.privateGradingEvidence).correct_choices).toHaveLength(5);
  });

  it("keeps Find the Leader and Wavelength answers out of public setup", () => {
    const leader = buildFootballOfficialDailySetup("find_leader", DAY, SCHEDULE);
    expect(record(leader.privateGradingEvidence).leader_id).toBeTruthy();
    expect(JSON.stringify(leader.publicSetup)).not.toContain("leader_id");
    expect(JSON.stringify(leader.publicSetup)).not.toContain("leader_value");

    const wavelength = buildFootballOfficialDailySetup("wavelength", DAY, SCHEDULE);
    expect(Number(record(wavelength.privateGradingEvidence).target)).toBeGreaterThan(0);
    expect(JSON.stringify(wavelength.publicSetup)).not.toContain("target");
  });

  it("publishes only candidate identities for official Hit the Number and uses the shared integer grader contract", () => {
    const setup = buildFootballOfficialDailySetup("hit_the_number", DAY, SCHEDULE);
    const grading = record(setup.privateGradingEvidence);
    expect(Number.isInteger(grading.target)).toBe(true);
    const values = record(grading.values);
    expect(Object.values(values).length).toBeGreaterThanOrEqual(Number(grading.pick_count));
    expect(Object.values(values).every(Number.isInteger)).toBe(true);
    expect(JSON.stringify(setup.publicSetup)).not.toContain('"values"');
  });

  it("preserves staged Blind Resume scoring mechanics through the shared action contract", () => {
    const setup = buildFootballOfficialDailySetup("blind_resume", DAY, SCHEDULE);
    const context: OfficialDailyRuntimeContext = {
      gameType: "blind_resume",
      setupKey: setup.setupKey,
      publicSetup: setup.publicSetup,
      revealSetup: setup.revealSetup,
      privateSetupEvidence: setup.privateSetupEvidence,
      privateGradingEvidence: setup.privateGradingEvidence,
      submissionState: {},
      publicState: record(setup.publicSetup.initial_state),
    };
    const revealed = advanceFootballOfficialDailyRuntime(context, { reveal: true });
    expect(record(revealed.publicState.current_round).revealed_count).toBe(4);
    expect(revealed.complete).toBe(false);
    expect(revealed.finalSubmission).toBeNull();
  });
});

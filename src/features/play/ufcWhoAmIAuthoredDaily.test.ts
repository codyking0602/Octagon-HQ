import { describe, expect, it } from "vitest";
import {
  createUfcWhoAmIAuthoredDailyRounds,
  extendUfcWhoAmIHistoryForDaily,
} from "./ufcWhoAmIAuthoredDaily";
import {
  buildOfficialDailySetup,
  UFC_AUTHORED_WHO_AM_I_CUTOVER_DAY,
  type OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";
import { advanceCanonicalWhoAmIDailyRuntime } from "./whoAmITwoRoundDailyRuntime";
import type { WhoAmIAuthoredPublicationHistoryEntry } from "./whoAmIAuthoredDailySelection";

type JsonRecord = Record<string, unknown>;

function record(value: unknown) {
  return value as JsonRecord;
}

function rows(value: unknown) {
  return value as JsonRecord[];
}

function dayOffset(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function contextFor(setup: ReturnType<typeof buildOfficialDailySetup>): OfficialDailyRuntimeContext {
  return {
    gameType: "who_am_i",
    setupKey: setup.setupKey,
    publicSetup: setup.publicSetup,
    revealSetup: setup.revealSetup,
    privateSetupEvidence: setup.privateSetupEvidence,
    privateGradingEvidence: setup.privateGradingEvidence,
    submissionState: {},
    publicState: record(setup.publicSetup.initial_state),
  };
}

describe("UFC authored Who Am I Daily", () => {
  it("publishes two different authored fighters with ten verbatim clues each", () => {
    const setup = buildOfficialDailySetup(
      "who_am_i",
      UFC_AUTHORED_WHO_AM_I_CUTOVER_DAY,
      "ufc-authored-test-v1",
      [],
    );
    const again = buildOfficialDailySetup(
      "who_am_i",
      UFC_AUTHORED_WHO_AM_I_CUTOVER_DAY,
      "ufc-authored-test-v1",
      [],
    );

    expect(again).toEqual(setup);
    expect(setup.contentVersion).toBe("who-am-i-authored-daily-v1");

    const rounds = rows(setup.privateSetupEvidence.rounds);
    expect(rounds).toHaveLength(2);
    const hiddenIds = rounds.map((row) => String(record(row.private_setup_evidence).hidden_subject_id));
    expect(new Set(hiddenIds).size).toBe(2);

    for (const row of rounds) {
      const evidence = record(row.private_setup_evidence);
      expect(evidence.league).toBe("UFC");
      expect(rows(evidence.clues)).toHaveLength(10);
      expect(["A", "B"]).toContain(evidence.script_id);
    }

    const publicJson = JSON.stringify(setup.publicSetup);
    expect(publicJson).not.toContain("hidden_subject_id");
    expect(publicJson).not.toContain('"identity"');
  });

  it("preserves the legacy single-round setup before the authored cutover", () => {
    const setup = buildOfficialDailySetup(
      "who_am_i",
      "2026-09-23",
      "ufc-authored-test-v1",
      [],
    );
    expect(setup.privateSetupEvidence.format_version).not.toBe("who-am-i-two-round-v1");
    expect(setup.contentVersion).not.toBe("who-am-i-authored-daily-v1");
  });

  it("shares cooldown history across both slots and alternates scripts on repeats", () => {
    let history: WhoAmIAuthoredPublicationHistoryEntry[] = [];
    const lastScript = new Map<string, string>();
    let repeats = 0;

    for (let offset = 0; offset < 120; offset += 1) {
      const day = dayOffset(UFC_AUTHORED_WHO_AM_I_CUTOVER_DAY, offset);
      const rounds = createUfcWhoAmIAuthoredDailyRounds(day, history);
      expect(rounds[0].round.hiddenSubject.id).not.toBe(rounds[1].round.hiddenSubject.id);

      let cursor = [...history];
      for (const entry of rounds) {
        const subjectId = entry.round.hiddenSubject.id;
        const recent = cursor.slice(-6).map((row) => row.subjectId);
        expect(recent).not.toContain(subjectId);

        const priorScript = lastScript.get(subjectId);
        if (priorScript) {
          repeats += 1;
          expect(entry.scriptId).not.toBe(priorScript);
        }
        lastScript.set(subjectId, entry.scriptId);

        cursor = [...cursor, {
          day,
          roundIndex: cursor.length,
          subjectId,
          league: "UFC",
          scriptId: entry.scriptId,
        }];
      }

      history = extendUfcWhoAmIHistoryForDaily(history, day, rounds);
    }

    expect(repeats).toBeGreaterThan(0);
  });

  it("requires both fighters and averages their scores on the 0-100 Daily scale", () => {
    const setup = buildOfficialDailySetup(
      "who_am_i",
      UFC_AUTHORED_WHO_AM_I_CUTOVER_DAY,
      "ufc-authored-test-v1",
      [],
    );
    let context = contextFor(setup);
    const rounds = rows(setup.privateSetupEvidence.rounds);
    const firstEvidence = record(rounds[0]!.private_setup_evidence);
    const secondEvidence = record(rounds[1]!.private_setup_evidence);
    const firstHidden = String(firstEvidence.hidden_subject_id);
    const secondHidden = String(secondEvidence.hidden_subject_id);

    let advanced = advanceCanonicalWhoAmIDailyRuntime(context, {
      type: "guess",
      subject_id: firstHidden,
    });
    expect(advanced.complete).toBe(false);
    expect(advanced.publicState.awaiting_next).toBe(true);

    context = { ...context, submissionState: advanced.submissionState, publicState: advanced.publicState };
    advanced = advanceCanonicalWhoAmIDailyRuntime(context, { type: "next_round" });
    context = { ...context, submissionState: advanced.submissionState, publicState: advanced.publicState };

    advanced = advanceCanonicalWhoAmIDailyRuntime(context, { type: "reveal" });
    context = { ...context, submissionState: advanced.submissionState, publicState: advanced.publicState };
    advanced = advanceCanonicalWhoAmIDailyRuntime(context, { type: "reveal" });
    context = { ...context, submissionState: advanced.submissionState, publicState: advanced.publicState };

    const wrong = (record(rounds[1]!.private_grading_evidence).subject_ids as string[])
      .find((id) => id !== secondHidden)!;
    advanced = advanceCanonicalWhoAmIDailyRuntime(context, { type: "guess", subject_id: wrong });
    context = { ...context, submissionState: advanced.submissionState, publicState: advanced.publicState };
    advanced = advanceCanonicalWhoAmIDailyRuntime(context, {
      type: "guess",
      subject_id: secondHidden,
    });

    expect(advanced.complete).toBe(true);
    expect(rows(advanced.publicState.completed_rounds).map((row) => row.score)).toEqual([100, 80]);
    expect(advanced.publicState.score).toBe(90);
    expect(rows(record(advanced.finalSubmission).rounds)).toHaveLength(2);
  });
});

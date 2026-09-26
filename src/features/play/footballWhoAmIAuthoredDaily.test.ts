import { describe, expect, it } from "vitest";
import { footballWhoAmIAuthoredBindingAudit } from "./footballWhoAmIAuthoredDaily";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationWhoAmI";
import { advanceCanonicalWhoAmIDailyRuntime } from "./whoAmITwoRoundDailyRuntime";
import type { OfficialDailyRuntimeContext } from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;

function record(value: unknown) {
  return value as JsonRecord;
}

function rows(value: unknown) {
  return value as JsonRecord[];
}

function contextFor(setup: ReturnType<typeof buildFootballDailyPersistenceSetup>): OfficialDailyRuntimeContext {
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

describe("Football authored Who Am I Daily", () => {
  it("publishes one NFL and one CFB authored identity with stable hidden evidence", () => {
    const setup = buildFootballDailyPersistenceSetup(
      "2026-09-27",
      "football-daily-v12-sports-feud",
      "who_am_i",
      [],
    );
    const again = buildFootballDailyPersistenceSetup(
      "2026-09-27",
      "football-daily-v12-sports-feud",
      "who_am_i",
      [],
    );

    expect(again).toEqual(setup);
    expect(setup.contentVersion).toBe("who-am-i-authored-daily-v1");
    const rounds = rows(setup.privateSetupEvidence.rounds);
    expect(rounds).toHaveLength(2);
    expect(rounds.map((row) => record(row.private_setup_evidence).league).sort()).toEqual(["CFB", "NFL"]);
    for (const row of rounds) {
      expect(rows(record(row.private_setup_evidence).clues)).toHaveLength(10);
      expect(typeof record(row.private_setup_evidence).script_id).toBe("string");
    }

    const publicJson = JSON.stringify(setup.publicSetup);
    expect(publicJson).not.toContain("hidden_subject_id");
    expect(publicJson).not.toContain('"identity"');
  });

  it("keeps the two-round authored format across future Football schedule-version changes", () => {
    for (const scheduleVersion of [
      "football-daily-v12-sports-feud",
      "football-daily-v15-weighted-sep24",
      "football-daily-v16-weighted-sep25",
      "football-daily-v999-future-rotation",
    ]) {
      const setup = buildFootballDailyPersistenceSetup(
        "2026-09-26",
        scheduleVersion,
        "who_am_i",
        [],
      );

      expect(setup.contentVersion).toBe("who-am-i-authored-daily-v1");
      expect(setup.publicSetup.format_version).toBe("who-am-i-two-round-v1");
      expect(setup.publicSetup.round_count).toBe(2);
      expect(
        rows(setup.privateSetupEvidence.rounds)
          .map((row) => record(row.private_setup_evidence).league)
          .sort(),
      ).toEqual(["CFB", "NFL"]);
    }
  });

  it("preserves the historical single-round format before the authored cutover", () => {
    const setup = buildFootballDailyPersistenceSetup(
      "2026-09-22",
      "football-daily-v999-future-rotation",
      "who_am_i",
      [],
    );

    expect(setup.contentVersion).toBe("who-am-i-daily-v2");
    expect(setup.publicSetup.format_version).toBeUndefined();
    expect(setup.publicSetup.round_count).toBeUndefined();
  });

  it("keeps owner-reviewed identities out of the initial deterministic launch pair without hard-banning them", () => {
    const setup = buildFootballDailyPersistenceSetup(
      "2026-09-27",
      "football-daily-v12-sports-feud",
      "who_am_i",
      [],
    );
    const metadata = new Map(
      footballWhoAmIAuthoredBindingAudit().map((row) => [row.subjectId, row.earlyRotation]),
    );
    for (const row of rows(setup.privateSetupEvidence.rounds)) {
      const subjectId = String(record(row.private_setup_evidence).hidden_subject_id);
      expect(metadata.get(subjectId)).toBe("normal");
    }
    expect([...metadata.values()]).toContain("deprioritized");
  });

  it("requires both identity rounds before the Daily completes", () => {
    const setup = buildFootballDailyPersistenceSetup(
      "2026-09-27",
      "football-daily-v12-sports-feud",
      "who_am_i",
      [],
    );
    let context = contextFor(setup);
    const rounds = rows(setup.privateSetupEvidence.rounds);
    const firstHidden = String(record(rounds[0]!.private_setup_evidence).hidden_subject_id);
    const secondHidden = String(record(rounds[1]!.private_setup_evidence).hidden_subject_id);

    const first = advanceCanonicalWhoAmIDailyRuntime(context, { type: "guess", subject_id: firstHidden });
    expect(first.complete).toBe(false);
    expect(first.finalSubmission).toBeNull();
    expect(first.publicState.awaiting_next).toBe(true);
    expect(record(first.publicState.active_reveal).identity).toBeTruthy();

    context = { ...context, submissionState: first.submissionState, publicState: first.publicState };
    const next = advanceCanonicalWhoAmIDailyRuntime(context, { type: "next_round" });
    expect(next.complete).toBe(false);
    expect(next.publicState.round_index).toBe(1);

    context = { ...context, submissionState: next.submissionState, publicState: next.publicState };
    const second = advanceCanonicalWhoAmIDailyRuntime(context, { type: "guess", subject_id: secondHidden });
    expect(second.complete).toBe(true);
    expect(second.publicState.score).toBe(100);
    expect(rows(record(second.finalSubmission).rounds)).toHaveLength(2);
  });

  it("averages the two round scores on the same 0-100 Daily scale", () => {
    const setup = buildFootballDailyPersistenceSetup(
      "2026-09-27",
      "football-daily-v12-sports-feud",
      "who_am_i",
      [],
    );
    let context = contextFor(setup);
    const rounds = rows(setup.privateSetupEvidence.rounds);
    const firstEvidence = record(rounds[0]!.private_setup_evidence);
    const secondEvidence = record(rounds[1]!.private_setup_evidence);
    const firstHidden = String(firstEvidence.hidden_subject_id);
    const secondHidden = String(secondEvidence.hidden_subject_id);

    let advanced = advanceCanonicalWhoAmIDailyRuntime(context, { type: "guess", subject_id: firstHidden });
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
    advanced = advanceCanonicalWhoAmIDailyRuntime(context, { type: "guess", subject_id: secondHidden });

    expect(rows(advanced.publicState.completed_rounds).map((row) => row.score)).toEqual([100, 80]);
    expect(advanced.publicState.score).toBe(90);
  });
});

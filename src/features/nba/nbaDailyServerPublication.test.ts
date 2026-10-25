import { describe, expect, it } from "vitest";
import {
  NBA_SERVER_READY_GAME_TYPES, buildNbaServerDailyPublication, nbaDailyGameAppearance,
} from "./nbaDailyServerPublication";
import { NBA_DAILY_WEIGHTED_CYCLE, nbaRegularSeasonDaily } from "./nbaDailySchedule";
import { advanceFamilyFeudDailyRuntime } from "../play/familyFeudDailyRuntime";
import { buildNbaOfficialMillionaireRun } from "./nbaMillionaireDailyRotation";
import { buildNbaWhoAmIOfficialRounds } from "./nbaWhoAmIDailyRotation";

describe("NBA server-authored Daily publication foundation", () => {
  it("computes appearance ordinals from published every-other-day game slots", () => {
    expect(nbaDailyGameAppearance("2026-11-01", "average_fan")).toBe(0);
    expect(nbaDailyGameAppearance("2026-11-03", "sports_feud")).toBe(0);
    expect(nbaDailyGameAppearance("2026-11-21", "bar_trivia")).toBe(0);
    expect(() => nbaDailyGameAppearance("2026-11-02", "average_fan")).toThrow();
    expect(() => nbaDailyGameAppearance("2026-11-01", "sports_feud")).toThrow();
    let num = 0;
    for (let index = 0; index < 80; index++) {
      const day = new Date(Date.UTC(2026, 10, 1 + index * 2)).toISOString().slice(0, 10);
      const game = nbaRegularSeasonDaily(day)?.gameType;
      if (game === "sports_feud") {
        expect(nbaDailyGameAppearance(day, game)).toBe(num++);
      }
    }
    expect(NBA_DAILY_WEIGHTED_CYCLE).toHaveLength(28);
  });

  it("constructs a private NBA Average Fan board without leaking answers", () => {
    const published = buildNbaServerDailyPublication("2026-11-01", "nba-daily-regular-v2-locked", "average_fan");
    expect(published.publicSetup.sport).toBe("nba");
    expect(published.publicSetup.board).toHaveLength(8);
    expect(published.privateSetupEvidence.questions).toHaveLength(8);
    expect(JSON.stringify(published.publicSetup)).not.toContain('"answer":');
    expect(JSON.stringify(published.revealSetup)).toContain('"answer":');
  });

  it("uses the existing Sports Feud grader with immutable NBA private evidence", () => {
    const published = buildNbaServerDailyPublication("2026-11-03", "nba-daily-regular-v2-locked", "sports_feud");
    expect(published.publicSetup.sport).toBe("nba");
    expect(published.publicSetup.presentation_domain).toBe("nba");
    expect(published.privateSetupEvidence.pack).toBeTruthy();
    expect(JSON.stringify(published.publicSetup)).not.toContain('"accepted_answers"');
    expect(() => advanceFamilyFeudDailyRuntime({
      setupKey: published.setupKey,
      publicSetup: published.publicSetup,
      privateSetupEvidence: published.privateSetupEvidence,
      submissionState: {},
    }, { type: "answer", answer: "unrecognizable made-up answer" })).not.toThrow();
  });

  it("constructs a canonical Millionaire NBA board with twenty appearance question histories", () => {
    const published = buildNbaServerDailyPublication("2026-11-07", "nba-daily-regular-v2-locked", "millionaire");
    expect(published.publicSetup.league).toBe("nba");
    expect(published.publicSetup.questions).toHaveLength(8);
    expect(JSON.stringify(published.publicSetup)).not.toContain('"correctChoiceId"');
    expect(published.privateSetupEvidence.run).toHaveLength(8);
    const seen = new Set<string>();
    for (let appearance = 0; appearance < 20; appearance++) {
      for (const question of buildNbaOfficialMillionaireRun(appearance)) {
        expect(seen.has(question.id), "Repeated Millionaire question " + question.id).toBe(false);
        seen.add(question.id);
      }
    }
    expect(seen.size).toBe(160);
  }, 120_000);

  it("builds two unique NBA Who Am I rounds per official appearance", () => {
    const published = buildNbaServerDailyPublication("2026-11-05", "nba-daily-regular-v2-locked", "who_am_i");
    expect(published.publicSetup.sport).toBe("nba");
    expect(published.publicSetup.round_count).toBe(2);
    expect(JSON.stringify(published.publicSetup)).not.toContain('"hidden_subject_id"');
    const seen = new Set<string>();
    for (let appearance = 0; appearance < 20; appearance++) {
      const [first, second] = buildNbaWhoAmIOfficialRounds(appearance);
      for (const entry of [first, second]) {
        expect(entry.round.clues).toHaveLength(10);
        expect(entry.round.league).toBe("NBA");
        expect(seen.has(entry.round.hiddenSubject.id)).toBe(false);
        seen.add(entry.round.hiddenSubject.id);
      }
    }
    expect(seen.size).toBe(40);
  });

  it("provides two NBA Find the Leader boards with distinct categories and visible season identity", () => {
    const publication = buildNbaServerDailyPublication("2026-11-11", "nba-daily-regular-v2-locked", "find_leader");
    expect(publication.publicSetup.sport).toBe("nba");
    expect(publication.publicSetup.round_count).toBe(2);
    const rounds = publication.publicSetup.rounds as Record<string, unknown>[];
    expect(rounds).toHaveLength(2);
    expect(rounds.every(round => (round.candidates as unknown[]).length === 10)).toBe(true);
    expect((publication.revealSetup.rounds as unknown[]).length).toBe(2);
    expect(JSON.stringify(publication.publicSetup)).not.toContain('"leader_id":');
    expect(JSON.stringify(publication.revealSetup)).toContain('"leader_id":');
    const seasons = rounds.flatMap(round => (round.candidates as Record<string, unknown>[]).filter(c => c.season != null));
    for (const row of seasons) expect(String(row.season_label)).toMatch(/[0-9]{2}/);
  });

  it("protects targets and scores for two NBA Wavelength games",()=>{
    const pub=buildNbaServerDailyPublication("2026-11-13", "nba-daily-regular-v2-locked", "wavelength");
    expect(pub.publicSetup.round_count).toBe(2);
    expect(JSON.stringify(pub.publicSetup)).not.toContain('"target":');
    expect(pub.privateSetupEvidence.rounds).toHaveLength(2);
  });
  it("preserves capped NBA Hit the Number 4/5-pick rules in both games",()=>{
    const pub=buildNbaServerDailyPublication("2026-11-09", "nba-daily-regular-v2-locked", "hit_the_number");
    const rounds=pub.publicSetup.rounds as Record<string,unknown>[];
    expect(rounds).toHaveLength(2);
    expect(rounds.every(row=>[4,5].includes(Number(row.pick_count)))).toBe(true);
    expect(JSON.stringify(pub.publicSetup)).not.toContain('"values":');
  });
  it("protects NBA Higher or Lower comparisons until after final answer",()=>{
    const pub=buildNbaServerDailyPublication("2026-11-19", "nba-daily-regular-v2-locked", "higher_lower");
    expect(pub.publicSetup.question_count).toBe(10);
    const initial=pub.publicSetup.initial_state as Record<string,unknown>;
    const question=initial.current_question as Record<string,unknown>;
    expect(question.answer).toBeUndefined();
    expect((question.hidden as Record<string,unknown>).value).toBeUndefined();
    expect(pub.privateSetupEvidence.board).toBeTruthy();
  });

  it("reuses the canonical Bar Trivia server scorer and answer reveal boundary", () => {
    const published = buildNbaServerDailyPublication("2026-11-21", "nba-daily-regular-v2-locked", "bar_trivia");
    expect(NBA_SERVER_READY_GAME_TYPES).toEqual(["average_fan", "sports_feud", "bar_trivia", "millionaire", "who_am_i", "find_leader", "wavelength", "hit_the_number", "higher_lower"]);
    expect(published.publicSetup.league).toBe("nba");
    expect(published.privateSetupEvidence.questions).toHaveLength(10);
    expect(published.revealSetup.questions).toHaveLength(10);
    expect(JSON.stringify(published.publicSetup)).not.toContain('"answer":');
    expect(JSON.stringify(published.revealSetup)).toContain('"answer":');
  });
});

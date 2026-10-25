import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationAll";
import { footballSportsFeudDomainForDay } from "./sportsFeudDailyBanks";
import { buildOfficialDailySetup, type OfficialDailyGameType } from "./todaysChallengeRuntime";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import { type NbaDailyGame } from "../nba/nbaDailySchedule";
import { normalizeDailyQuestionText } from "./dailyContentQualityPolicy";
import { auditMergedPartOneCalendar } from "./sixMonthDailyRotationAudit";

type AnyRecord = Record<string, unknown>;
function record(value: unknown): value is AnyRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
/**
 * Conservative extraction. These are question objects with an authored prompt;
 * do not count generic athlete records or generated question IDs as concepts.
 * Non-prompt lineup games need individual semantic analyzers.
 */
function authoredPrompts(value: unknown, visited = new Set<unknown>()): Array<{ id: string; prompt: string; answer: string }> {
  if (!value || typeof value !== "object" || visited.has(value)) return [];
  visited.add(value);
  if (Array.isArray(value)) return value.flatMap(row => authoredPrompts(row, visited));
  if (!record(value)) return [];
  const prompt = typeof value.prompt === "string" ? value.prompt : null;
  const result = prompt ? [{
    id: String(value.id ?? value.question_id ?? value.questionId ?? ""),
    prompt: normalizeDailyQuestionText(prompt),
    answer: normalizeDailyQuestionText(String(value.answer ?? "")),
  }] : [];
  // Skip known non-content metadata/candidates; nested question packs stay eligible.
  for (const [key, item] of Object.entries(value)) {
    if (["candidates", "fighter_ids", "subjectIds", "fighters", "players", "stats", "values", "choices"].includes(key)) continue;
    result.push(...authoredPrompts(item, visited));
  }
  return result;
}
describe("six-month daily generator availability probe — editorial certification remains gated", () => {
  it("invokes available Official Daily publication builders across the preview horizon", () => {
    const report: Record<string, {
      scheduled: number; built: number; blocked: number;
      extractedPromptCount: number; repeatedPromptKeys: number; exceptions: string[];
    }> = {};
    const seenPrompts = new Map<string, Map<string, string>>();
    const averageFanHistory: Record<"football" | "ufc" | "nba", Array<Record<string, unknown>>> = {
      football: [], ufc: [], nba: [],
    };
    const whoAmIHistory: Record<"football" | "ufc" | "nba", Array<Record<string, unknown>>> = {
      football: [], ufc: [], nba: [],
    };
    const closeRepeated: Record<string, number> = {};
    const slots = auditMergedPartOneCalendar();
    for (const slot of slots) {
      const key = slot.sport + ":" + slot.game;
      const row = report[key] ??= {
        scheduled: 0, built: 0, blocked: 0,
        extractedPromptCount: 0, repeatedPromptKeys: 0, exceptions: [],
      };
      row.scheduled++;
      // Higher or Lower has its own all-three-sport, two-game factual audit.
      // Football/UFC Hit the Number have their own canonical two-board audit.
      // NBA Hit the Number must be generated here (it was previously skipped).
      if (slot.game === "higher_lower" ||
          (slot.game === "hit_the_number" && slot.sport !== "nba")) {
        row.blocked++;
        continue;
      }
      try {
        const version = slot.sport === "football"
          ? slot.day === "2026-10-25" ? "football-daily-v20-resume-v18-oct3"
            : slot.day === "2026-10-26" ? "football-daily-v21-locked-oct25"
              : "football-daily-v22-higher-lower-oct27"
          : slot.sport === "ufc"
            ? slot.day < "2026-10-29" ? "ufc-daily-v21-48h-oct25"
              : "ufc-daily-v22-higher-lower-oct29"
          : "nba-daily-regular-v2-locked";
        // Production's Average Fan and authored Who Am I generators depend on
        // previously published boards. A stateless seed-only replay reports
        // misleading repetitions and can change the Football league split.
        const publicationHistory = slot.game === "average_fan"
          ? averageFanHistory[slot.sport]
          : slot.game === "who_am_i" ? whoAmIHistory[slot.sport] : undefined;
        const publication = slot.sport === "football"
          ? buildFootballDailyPersistenceSetup(slot.day, version, slot.game as OfficialDailyGameType, publicationHistory)
          : slot.sport === "ufc"
            ? buildOfficialDailySetup(slot.game as OfficialDailyGameType, slot.day, version, publicationHistory)
            : buildNbaServerDailyPublication(slot.day, version, slot.game as NbaDailyGame, publicationHistory);
        row.built++;
        // Look at the actual private/reveal publication, never the public first
        // question alone; report exact repeats without calling them semantic proof.
        const data = publication as {
          privateSetupEvidence: AnyRecord; revealSetup: AnyRecord;
        };
        const evidence = data.privateSetupEvidence;
        if (slot.game === "average_fan") {
          const sport = String(evidence.sport ?? "");
          const questionIds = evidence.question_ids;
          if (typeof sport !== "string" || !Array.isArray(questionIds) || questionIds.length !== 8) {
            throw new Error("Average Fan replay does not expose the eight canonical question IDs.");
          }
          averageFanHistory[slot.sport].push({
            day: slot.day, sport, question_ids: [...questionIds],
            final_question_id: evidence.final_question_id,
          });
        }
        if (slot.game === "who_am_i" && slot.sport !== "nba") {
          const rounds = evidence.rounds;
          if (!Array.isArray(rounds) || rounds.length !== 2) {
            throw new Error("Who Am I replay does not expose both authored rounds.");
          }
          for (const [roundIndex, raw] of rounds.entries()) {
            const inner = record(raw) ? raw.private_setup_evidence : null;
            if (!record(inner) || !inner.hidden_subject_id || !inner.script_id || !inner.league) {
              throw new Error("Who Am I replay lost a canonical subject, league or authored script.");
            }
            whoAmIHistory[slot.sport].push({
              day: slot.day, round_index: roundIndex,
              subject_id: inner.hidden_subject_id, script_id: inner.script_id, league: inner.league,
            });
          }
        }
        // The same question appears in both reveal and private evidence by
        // design. Count it ONCE; otherwise repetition rates double artificially.
        const revealPrompts = authoredPrompts(data.revealSetup);
        const prompts = revealPrompts.length ? revealPrompts : authoredPrompts(data.privateSetupEvidence);
        const current = new Set<string>();
        const seen = seenPrompts.get(key) ?? new Map<string, string>();
        seenPrompts.set(key, seen);
        for (const prompt of prompts) {
          const fingerprint = prompt.prompt + "|" + prompt.answer;
          if (current.has(fingerprint)) {
            throw new Error("Repeated exact question in one publication of " + key + " on " + slot.day);
          }
          current.add(fingerprint);
          row.extractedPromptCount++;
          const prior = seen.get(fingerprint);
          if (prior) {
            row.repeatedPromptKeys++;
            const days = (Date.parse(slot.day) - Date.parse(prior)) / 86_400_000;
            if (days < 28) closeRepeated[key] = (closeRepeated[key] ?? 0) + 1;
          }
          seen.set(fingerprint, slot.day);
        }
        if (["millionaire", "bar_trivia", "average_fan", "sports_feud"].includes(slot.game)
          && !prompts.length) throw new Error("Scheduled text-driven board has no questions: " + key);
      } catch (error) {
        row.blocked++;
        if (row.exceptions.length < 8) {
          row.exceptions.push(slot.day + " " + (error instanceof Error ? error.message : String(error)));
        }
      }
    }
    expect(Object.values(report).reduce((sum, row) => sum + row.scheduled, 0)).toBe(slots.length);
    // All non-delegated generators must build. Exceptions are no longer
    // ignored merely because a publication was labeled a provisional probe.
    const failed = Object.entries(report)
      .filter(([name, row]) => row.blocked > 0 &&
        !name.endsWith(":higher_lower") &&
        name !== "football:hit_the_number" && name !== "ufc:hit_the_number")
      .map(([name, row]) => name + ": " + row.blocked + " failed; " + row.exceptions.join("; "));
    // Emit only aggregate counts — unrevealed Daily questions/answers must
    // never enter public CI logs or artifact uploads.
    console.info("SIX_MONTH_OTHER_GAMES_CANONICAL_PART1_PROBE " + JSON.stringify(report));
    console.info("SIX_MONTH_OTHER_GAMES_NEAR_TERM_EXACT_REPEATS " + JSON.stringify(closeRepeated));
    expect(failed).toEqual([]);
    // Less-than-four-week exact reuse needs an editorial exception and must
    // block activation until game banks/rotations can substantiate it.
    expect(closeRepeated).toEqual({});
  }, 300_000);
});


describe("Football Sports Feud v22 actual-calendar content protection", () => {
  it("alternates CFB/NFL from the approved slots and never repeats a future question", () => {
    const dates = auditMergedPartOneCalendar().filter(slot =>
      slot.sport === "football" && slot.game === "sports_feud" && slot.day >= "2026-10-27");
    expect(dates).toHaveLength(26);
    const priorQuestions = new Set<string>();
    for (const [index, slot] of dates.entries()) {
      const league = footballSportsFeudDomainForDay(slot.day);
      expect(league, slot.day).toBe(index % 2 === 0 ? "cfb" : "nfl");
      const publication = buildFootballDailyPersistenceSetup(slot.day, "football-daily-v22-higher-lower-oct27", "sports_feud");
      const questions = authoredPrompts(publication.revealSetup);
      expect(questions, slot.day).toHaveLength(7);
      for (const question of questions) {
        const key = league + ":" + question.prompt;
        expect(priorQuestions.has(key), "Repeated Feud question in " + slot.day).toBe(false);
        priorQuestions.add(key);
      }
    }
    expect(footballSportsFeudDomainForDay("2026-11-27")).toBe("cfb");
    expect(priorQuestions).toHaveProperty("size", 182);
  }, 180_000);
});

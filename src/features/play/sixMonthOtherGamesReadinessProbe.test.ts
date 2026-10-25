import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationAll";
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
    const seenPrompts = new Map<string, Set<string>>();
    const slots = auditMergedPartOneCalendar();
    for (const slot of slots) {
      const key = slot.sport + ":" + slot.game;
      const row = report[key] ??= {
        scheduled: 0, built: 0, blocked: 0,
        extractedPromptCount: 0, repeatedPromptKeys: 0, exceptions: [],
      };
      row.scheduled++;
      // Hit the Number has its own detailed canonical-date two-board audit.
      // NBA Higher or Lower has a separate 2-game content certification PR.
      if (slot.game === "hit_the_number" || slot.game === "higher_lower") {
        row.blocked++;
        continue;
      }
      try {
        const version = slot.sport === "football"
          ? slot.day === "2026-10-25" ? "football-daily-v20-resume-v18-oct3"
            : slot.day === "2026-10-26" ? "football-daily-v21-locked-oct25"
              : "football-daily-v22-higher-lower-2x-oct25"
          : slot.sport === "ufc"
            ? slot.day < "2026-10-29" ? "ufc-daily-v21-48h-oct25"
              : "ufc-daily-v22-higher-lower-2x-oct25"
          : "nba-daily-regular-v2-locked";
        const publication = slot.sport === "football"
          ? buildFootballDailyPersistenceSetup(slot.day, version, slot.game as OfficialDailyGameType)
          : slot.sport === "ufc"
            ? buildOfficialDailySetup(slot.game as OfficialDailyGameType, slot.day, version)
            : buildNbaServerDailyPublication(slot.day, version, slot.game as NbaDailyGame);
        row.built++;
        // Look at the actual private/reveal publication, never the public first
        // question alone; report exact repeats without calling them semantic proof.
        const data = publication as {
          privateSetupEvidence: AnyRecord; revealSetup: AnyRecord;
        };
        const prompts = authoredPrompts([data.revealSetup, data.privateSetupEvidence]);
        const seen = seenPrompts.get(key) ?? new Set<string>();
        seenPrompts.set(key, seen);
        for (const prompt of prompts) {
          row.extractedPromptCount++;
          // A changed ID does not hide an identical prompt/answer combination.
          const fingerprint = prompt.prompt + "|" + prompt.answer;
          if (seen.has(fingerprint)) row.repeatedPromptKeys++;
          else seen.add(fingerprint);
        }
      } catch (error) {
        row.blocked++;
        if (row.exceptions.length < 8) {
          row.exceptions.push(slot.day + " " + (error instanceof Error ? error.message : String(error)));
        }
      }
    }
    expect(Object.values(report).reduce((sum, row) => sum + row.scheduled, 0)).toBe(slots.length);
    // Missing Millionaire publications on already-scheduled dates are release blockers.
    expect(report["football:millionaire"]?.blocked).toBe(0);
    expect(report["ufc:millionaire"]?.blocked).toBe(0);
    // Nothing about a non-publishing preview can certify final Part 1
    // publication versions, human concept diversity or fact provenance.
    console.info("SIX_MONTH_OTHER_GAMES_CANONICAL_PART1_PROBE " + JSON.stringify(report));
  }, 300_000);
});

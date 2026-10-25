/**
 * Broader production-generator smoke/capacity evidence. This is intentionally
 * NOT editorial signoff: missing source attestation and non-ID semantic repeats
 * cannot be declared safe by an automated record-count test.
 */
import { describe, expect, it } from "vitest";
import { buildSixMonthRotationPreview, buildMaskedLegacyComparison, SIX_MONTH_PREVIEW_VERSION } from "./sixMonthRotationPreview";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationAll";
import { buildOfficialDailySetup, type OfficialDailyGameType } from "./todaysChallengeRuntime";
import { buildNbaServerDailyPublication } from "../nba/nbaDailyServerPublication";
import type { NbaDailyGame } from "../nba/nbaDailySchedule";

type AuditSport = "football" | "ufc" | "nba";
type AuditRow = {
  sport: AuditSport; game: string; day: string; setupKey: string;
  contentVersion: string; topicKeys: string[];
};
const staged = buildSixMonthRotationPreview();
function data(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid source publication object.");
  }
  return value as Record<string, unknown>;
}

/**
 * Explicit identifiers, not arbitrary athlete ids. Names alone may validly
 * repeat on DIFFERENT facts and must not trigger universal prohibition.
 */
function canonicalKeys(evidence: unknown): string[] {
  const keys = new Set<string>();
  function visit(value: unknown, depth: number) {
    if (depth > 15 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach((entry) => visit(entry, depth + 1));
      return;
    }
    if (typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (["question_ids", "topic_ids", "questionIds", "topicIds"].includes(key)
          && Array.isArray(child)) {
        child.filter((entry): entry is string => typeof entry === "string")
          .forEach((entry) => keys.add(key + ":" + entry));
      }
      if (["question_id", "topic_id", "fact_key", "factKey", "questionId", "topicId"].includes(key)
          && typeof child === "string" && child.length > 0) {
        keys.add(key + ":" + child);
      }
      if (key === "id" && typeof child === "string" && child.length > 0
          && ("question" in (value as object) || "prompt" in (value as object))) {
        keys.add("prompt_id:" + child);
      }
      visit(child, depth + 1);
    }
  }
  visit(evidence, 0);
  return [...keys].sort();
}

function inspect(sport: AuditSport, game: string, day: string, publication: unknown): AuditRow {
  const record = data(publication);
  const setup = data(record.publicSetup);
  const evidence = data(record.privateSetupEvidence);
  const grading = data(record.privateGradingEvidence);
  if (typeof record.setupKey !== "string" || !record.setupKey ||
      typeof record.contentVersion !== "string" || !record.contentVersion) {
    throw new Error(sport + " " + game + " " + day + " has no versioned setup.");
  }
  if (!("initial_state" in setup) || Object.keys(evidence).length === 0 ||
      Object.keys(grading).length === 0) {
    throw new Error(sport + " " + game + " " + day + " has an unplayable incomplete setup.");
  }
  return {
    sport, game, day, setupKey: record.setupKey as string,
    contentVersion: record.contentVersion as string,
    topicKeys: canonicalKeys(evidence),
  };
}

function summarize(rows: AuditRow[]) {
  const byGame = new Map<string, AuditRow[]>();
  rows.forEach((row) => {
    const key = row.sport + "/" + row.game;
    const group = byGame.get(key) ?? [];
    group.push(row);
    byGame.set(key, group);
  });
  return Object.fromEntries([...byGame.entries()].map(([game, records]) => {
    const seen = new Map<string, string>();
    const repeated = new Set<string>();
    for (const record of records) {
      for (const key of record.topicKeys) {
        if (seen.has(key) && seen.get(key) !== record.day) repeated.add(key);
        else seen.set(key, record.day);
      }
    }
    return [game, {
      appearances: records.length,
      sourceQuestionKeys: seen.size,
      repeatedQuestionKeys: [...repeated].slice(0, 25),
      repeatCount: repeated.size,
      noExtractableIds: records.filter((record) => record.topicKeys.length === 0).length,
      status: records.some((row) => row.topicKeys.length === 0) || repeated.size > 0
        ? "REQUIRES_SEMANTIC_OR_REPEAT_REVIEW" : "REQUIRES_FACTUAL_SOURCE_REVIEW",
    }];
  }));
}

describe("six-month other-game production publication readiness evidence", () => {
  it("rehearses all Football games including the staged 2x Higher or Lower foundation", () => {
    const failures: string[] = [];
    const rows: AuditRow[] = [];
    for (const { day, game } of staged.football) {
      if (game === "hit_the_number") continue; // audited more deeply in the HTN suite
      try {
        rows.push(inspect("football", game, day,
          buildFootballDailyPersistenceSetup(day, SIX_MONTH_PREVIEW_VERSION, game as OfficialDailyGameType)));
      } catch (error) {
        failures.push(day + " " + game + " " + String(error));
      }
    }
    console.info("SIX_MONTH_FOOTBALL_OTHER_GAMES", JSON.stringify({
      generatedAppearances: rows.length, errors: failures, games: summarize(rows),
      limitation: "Preview version, no publication-history feed; question-key repeats need manual semantic review",
    }));
    expect(rows.length + failures.length).toBe(staged.football.length -
      staged.football.filter((slot) => slot.game === "hit_the_number").length);
    expect(new Set(rows.map((row) => row.setupKey)).size).toBe(rows.length);
  }, 180_000);

  it("rehearses all UFC games except separately owned unfinished Higher or Lower", () => {
    const failures: string[] = [];
    const rows: AuditRow[] = [];
    for (const { day, game } of staged.ufc) {
      if (game === "higher_lower" || game === "hit_the_number") continue;
      try {
        rows.push(inspect("ufc", game, day,
          buildOfficialDailySetup(game as OfficialDailyGameType, day, SIX_MONTH_PREVIEW_VERSION)));
      } catch (error) {
        failures.push(day + " " + game + " " + String(error));
      }
    }
    console.info("SIX_MONTH_UFC_OTHER_GAMES", JSON.stringify({
      generatedAppearances: rows.length, errors: failures,
      blockedHigherLowerAppearances: staged.ufc.filter((row) => row.game === "higher_lower").length,
      games: summarize(rows),
      limitation: "UFC Higher or Lower owned by PR #2101; source-ledger and semantic review needed",
    }));
    expect(rows.length + failures.length).toBe(staged.ufc.length -
      staged.ufc.filter((slot) => ["higher_lower", "hit_the_number"].includes(slot.game)).length);
    expect(new Set(rows.map((row) => row.setupKey)).size).toBe(rows.length);
  }, 180_000);

  it("rehearses NBA's CURRENT dated server publications, not an unsynchronized preview order", () => {
    const failures: string[] = [];
    const rows: AuditRow[] = [];
    const actual = buildMaskedLegacyComparison().nba.filter(({ day }) => day <= "2027-04-11");
    for (const { day, game } of actual) {
      try {
        rows.push(inspect("nba", game, day,
          buildNbaServerDailyPublication(day, "nba-official-daily-v1", game as NbaDailyGame)));
      } catch (error) {
        failures.push(day + " " + game + " " + String(error));
      }
    }
    console.info("SIX_MONTH_NBA_CURRENT_GAME_ORDER", JSON.stringify({
      generatedAppearances: rows.length, errors: failures, games: summarize(rows),
      mismatchedFutureDates: staged.nba.filter((row, index) => row.game !== actual[index]?.game).length,
      limitation: "Must rerun using the Part 1 versioned synchronized NBA date/game selection before certification",
    }));
    expect(rows.length + failures.length).toBe(actual.length);
    expect(new Set(rows.map((row) => row.setupKey)).size).toBe(rows.length);
  }, 180_000);
});

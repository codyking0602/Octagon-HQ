import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import { millionaireDailyRun } from "./millionaireDailyQuestionBank";
import { buildMillionaireDailySetup } from "./millionaireDailyRuntime";
import { isUfcPublicationDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";

type League = "nfl" | "cfb" | "ufc";
type Disposition = "KEEP" | "REWRITE" | "RETIRE" | "HOLD";
type Row = {
  league: League;
  legacy_run: string;
  question_level: string;
  legacy_id: string;
  prompt: string;
  choices: string;
  answer: string;
  stat_sheet: string;
  proposed_disposition: Disposition;
  editorial_rationale: string;
  source_url: string;
};

// Quoted one-line CSV fields are authored with escaped quotes; they contain no
// embedded newlines. This is the human-readable, question-by-question audit.
function parseRow(line: string) {
  return [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(match =>
    match[1]!.replace(/""/g, '"'));
}
const ledgerPath = new URL("../../../docs/audits/millionaire-question-disposition-ledger-20261025.csv", import.meta.url);
const [heading, ...lines] = readFileSync(ledgerPath, "utf8").trim().split("\n");
const keys = parseRow(heading!);
const ledger = lines.map(line =>
  Object.fromEntries(parseRow(line).map((value, index) => [keys[index]!, value])) as Row);

function dayAt(offset: number) {
  return new Date(Date.parse("2026-10-25T00:00:00.000Z") + offset * 86_400_000)
    .toISOString().slice(0, 10);
}

type CalendarEntry = {
  day: string;
  league: League;
  questionIds: string[];
  prompts: string[];
  statSheets: (string | null)[];
  choices: string[][];
  answers: string[];
  themed: boolean;
};

/** Exercise the actual authoritative publication builder, not a mock selector. */
function sixMonthCalendar(): CalendarEntry[] {
  const entries: CalendarEntry[] = [];
  for (let i = 0; i < 182; i += 1) {
    const day = dayAt(i);
    for (const sport of ["football", "ufc"] as const) {
      if (sport === "ufc" && !isUfcPublicationDay(day)) continue;
      if (lockedWeightedGameForDay(sport, day) !== "millionaire") continue;
      const published = buildMillionaireDailySetup(sport, day, "millionaire-editorial-audit-v1");
      const run = published.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
      const league = published.publicSetup.league as League;
      expect(run).toHaveLength(8);
      run.forEach((question, level) => {
        expect(question.level).toBe(`Q${level + 1}`);
        expect(question.choices.map(choice => choice.id).sort()).toEqual(["A", "B", "C", "D"]);
        expect(new Set(question.choices.map(choice => choice.text.toLowerCase().trim())).size).toBe(4);
        expect(question.choices.filter(choice => choice.id === question.correctChoiceId)).toHaveLength(1);
        if (level === 7) expect(question.statSheet).toBeNull();
        else expect(typeof question.statSheet).toBe("string");
        if (level === 7) expect(question.lifelineCompatibility.statSheet).toBe(false);
      });
      expect(new Set(run.map(question => question.id)).size).toBe(8);
      entries.push({
        day,
        league,
        questionIds: run.map(question => question.id),
        prompts: run.map(question => question.prompt),
        statSheets: run.map(question => question.statSheet),
        choices: run.map(question => question.choices.map(choice => choice.text)),
        answers: run.map(question => question.choices.find(choice => choice.id === question.correctChoiceId)!.text),
        themed: run.some(question => question.id.startsWith("theme-")),
      });
    }
  }
  return entries;
}

function exactRunRepeats(entries: CalendarEntry[]) {
  const first = new Map<string, string>();
  const duplicates: { league: League; first: string; again: string }[] = [];
  for (const entry of entries) {
    const fingerprint = `${entry.league}:${entry.questionIds.join("|")}`;
    const old = first.get(fingerprint);
    if (old) duplicates.push({ league: entry.league, first: old, again: entry.day });
    else first.set(fingerprint, entry.day);
  }
  return duplicates;
}

describe("Millionaire six-month editorial staging (NOT release-certified)", () => {
  it("accounts for every existing question with a readable, explicit disposition", () => {
    expect(ledger).toHaveLength(240);
    expect(new Set(ledger.map(entry => entry.legacy_id)).size).toBe(240);
    for (const league of ["nfl", "cfb", "ufc"] as const) {
      const rows = ledger.filter(row => row.league === league);
      expect(rows).toHaveLength(80);
      for (const row of rows) {
        const source = millionaireDailyRun(league, Number(row.legacy_run) - 1)[Number(row.question_level) - 1]!;
        expect(row.legacy_id).toBe(source.id);
        expect(row.prompt).toBe(source.prompt);
        expect(row.answer).toBe(source.choices.find(choice => choice.id === source.correctChoiceId)!.text);
        expect(row.choices).toBe(source.choices.map(choice => choice.text).join(" | "));
        expect(["KEEP", "REWRITE", "RETIRE", "HOLD"]).toContain(row.proposed_disposition);
        expect(row.editorial_rationale.length).toBeGreaterThan(15);
      }
    }
  });

  it("uses actual canonical Daily dates, includes the Cowboys theme and exposes repeats", () => {
    const entries = sixMonthCalendar();
    const nfl = entries.filter(item => item.league === "nfl");
    const cfb = entries.filter(item => item.league === "cfb");
    const ufc = entries.filter(item => item.league === "ufc");
    expect([nfl.length, cfb.length, ufc.length]).toEqual([14, 13, 13]);
    expect(nfl.find(item => item.day === "2026-10-26")?.themed).toBe(true);
    expect(ufc.find(item => item.day === "2026-10-25")).toBeDefined();
    expect(entries.every(item => item.questionIds.length === 8)).toBe(true);
    const repeats = exactRunRepeats(entries);
    // This is the current, *uncertified* baseline, not a passing release gate:
    // three regular repeated runs per league, including UFC Oct 25 history.
    expect(repeats).toHaveLength(9);
    expect(repeats.filter(item => item.league === "nfl")).toHaveLength(3);
    expect(repeats.filter(item => item.league === "cfb")).toHaveLength(3);
    expect(repeats.filter(item => item.league === "ufc")).toHaveLength(3);
  });

  it("refuses to represent the 10-run legacy bank as six-month ready", () => {
    const entries = sixMonthCalendar();
    const repeats = exactRunRepeats(entries);
    const outstandingReviews = ledger.filter(row => row.proposed_disposition !== "KEEP");
    const completelyReviewed = ledger.filter(row => row.proposed_disposition === "KEEP"
      && row.source_url.length > 0);
    // Narrow primary-source checks are NOT full distractor / difficulty approval.
    expect(outstandingReviews.length).toBeGreaterThan(0);
    expect(completelyReviewed.length).toBeLessThan(240);
    expect(repeats.length).toBeGreaterThan(0);
    const releaseCertified = repeats.length === 0
      && outstandingReviews.length === 0
      && completelyReviewed.length === 240;
    expect(releaseCertified).toBe(false);
  });
});

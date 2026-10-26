import { describe, expect, it } from "vitest";
import { MILLIONAIRE_FUTURE_Q8_REWRITES } from "./millionaireEditorialFutureQ8";
import { MILLIONAIRE_DAILY_RUN_COUNT, MILLIONAIRE_FUTURE_EDITORIAL_RUN_COUNT, millionaireDailyRun, millionaireFutureEditorialDailyRun } from "./millionaireDailyQuestionBank";
import { buildMillionaireDailySetup, MILLIONAIRE_DAILY_CONTENT_VERSION, MILLIONAIRE_FUTURE_EDITORIAL_CONTENT_VERSION, millionaireDailyRunIndex } from "./millionaireDailyRuntime";
import { isUfcPublicationDay, lockedWeightedGameForDay } from "./dailyChallengeRotation";
import type { MillionaireRuntimeQuestion } from "../games/millionaireAuthority";

const leagues = ["nfl", "cfb", "ufc"] as const;
function answer(question: MillionaireRuntimeQuestion) {
  return question.choices.find(choice => choice.id === question.correctChoiceId)!.text;
}
function normalized(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

describe("Millionaire future editorial CANDIDATE quality gate (not fact certification)", () => {
  it("protects fifteen additional future question replacements and Q8 option mappings", () => {
    const newRunCorrections = [
      ["nfl", 10, 6, "Travis Kelce"],
      ["nfl", 14, 2, "Ja'Marr Chase"],
      ["cfb", 10, 2, "Michael Penix Jr."],
      ["cfb", 10, 5, "Max Duggan"],
      ["cfb", 10, 6, "Ashton Jeanty"],
      ["cfb", 14, 6, "Kalen DeBoer"],
      ["ufc", 13, 6, "Yair Rodriguez"],
      ["ufc", 6, 7, "Islam Makhachev"],
    ] as const;
    for (const [league, runIndex, slot, expected] of newRunCorrections) {
      const question = millionaireFutureEditorialDailyRun(league, runIndex)[slot]!;
      expect(answer(question)).toBe(expected);
      expect(new Set(question.choices.map(choice => normalized(choice.text))).size).toBe(4);
      expect(question.explanation).toContain(expected);
      if (slot === 7) {
        expect(question.statSheet).toBeNull();
        expect(question.lifelineCompatibility).toMatchObject({
          fiftyFifty: false, statSheet: false, doubleDip: false,
        });
      } else {
        expect(question.statSheet).not.toContain(expected);
      }
    }
    const finalCorrections = [
      ["nfl:0:7", "Cooper DeJean"],
      ["nfl:2:7", "Sam Hubbard"],
      ["nfl:9:7", "Noah Brown"],
      ["cfb:4:7", "Matthew Golden"],
      ["cfb:5:7", "Adonai Mitchell"],
      ["ufc:2:7", "Jiří Procházka"],
      ["ufc:5:7", "Max Holloway"],
    ] as const;
    for (const [key, expected] of finalCorrections) {
      const question = MILLIONAIRE_FUTURE_Q8_REWRITES[key]!;
      expect(question.answer).toBe(expected);
      expect(question.choices.filter(choice => choice === expected)).toHaveLength(1);
      expect(new Set(question.choices.map(normalized)).size).toBe(4);
      expect(question.statSheet).toBeNull();
      expect(question.explanation).toContain(expected);
      expect(question.explanation.length).toBeGreaterThan(80);
      expect(question.evidence.length).toBeGreaterThan(0);
    }
    let runtimeCorrectionsFound = 0;
    for (let offset = 0; offset < 182; offset += 1) {
      const day = new Date(Date.UTC(2026, 9, 25 + offset)).toISOString().slice(0, 10);
      for (const sport of ["football", "ufc"] as const) {
        if (sport === "ufc" && !isUfcPublicationDay(day)) continue;
        if (lockedWeightedGameForDay(sport, day) !== "millionaire") continue;
        const publication = buildMillionaireDailySetup(sport, day, "editorial-15-slot-regression",
          { editorialCandidatePreview: true });
        const league = publication.publicSetup.league;
        const index = millionaireDailyRunIndex(sport, day, { editorialCandidatePreview: true });
        const rewrite = MILLIONAIRE_FUTURE_Q8_REWRITES[`${league}:${index}:7`];
        if (!rewrite) continue;
        const final = (publication.privateSetupEvidence.run as MillionaireRuntimeQuestion[])[7]!;
        expect(final.id).toBe(rewrite.id);
        expect(final.prompt).toBe(rewrite.prompt);
        expect(answer(final)).toBe(rewrite.answer);
        runtimeCorrectionsFound += 1;
      }
    }
    expect(runtimeCorrectionsFound).toBeGreaterThan(0);
  });

  it("preserves three sourced future-only editorial corrections in final candidate boards", () => {
    const cfb = millionaireFutureEditorialDailyRun("cfb", 10)[7]!;
    expect(answer(cfb)).toBe("Jeremiah Smith");
    expect(cfb.prompt).toContain("56-yard third-and-11");
    expect(cfb.statSheet).toBeNull();
    const hendo = millionaireFutureEditorialDailyRun("ufc", 13)[1]!;
    expect(answer(hendo)).toBe("Dan Henderson");
    expect(hendo.prompt).toContain("right hand");
    expect(hendo.prompt).not.toContain("jumping punch");
    const kimbo = millionaireFutureEditorialDailyRun("ufc", 6)[5]!;
    expect(answer(kimbo)).toBe("Roy Nelson");
    expect(kimbo.prompt).toContain("ground-and-pound");
    expect(kimbo.statSheet).toContain("mounted crucifix");
    expect(kimbo.id).not.toBe(millionaireDailyRun("ufc", 6)[5]!.id);
  });

  it("keeps the original ten-run bank unchanged while adding five new runs per league", () => {
    expect(MILLIONAIRE_DAILY_RUN_COUNT).toBe(10);
    expect(MILLIONAIRE_FUTURE_EDITORIAL_RUN_COUNT).toBe(15);
    for (const league of leagues) {
      const all = Array.from({ length: 15 }, (_, i) => millionaireFutureEditorialDailyRun(league, i));
      expect(all).toHaveLength(15);
      for (let i = 0; i < 10; i += 1) {
        if (league === "ufc" && i >= 6 && i <= 8) {
          // UFC 7–9 are deliberately new future-only questions; their legacy
          // IDs, historical proofs and original bank remain unchanged.
          const historical = millionaireDailyRun(league, i);
          expect(historical[0]!.id).not.toBe(all[i]![0]!.id);
          expect(new Set(all[i]!.map(q => normalized(answer(q)))).size).toBe(8);
        } else {
          expect(all[i]).toEqual(millionaireDailyRun(league, i));
        }
      }
      const ids = all.flat().map(q => q.id);
      expect(new Set(ids).size).toBe(120);
      const newPrompts = all.slice(10).flat().map(q => normalized(q.prompt));
      expect(new Set(newPrompts).size).toBe(40);
      // Require all 120 authored candidates to be truly new *question prompts*,
      // not reordered copies of existing seed questions.
      const legacy = new Set(all.slice(0, 10).flat().map(q => normalized(q.prompt)));
      expect(newPrompts.some(prompt => legacy.has(prompt))).toBe(false);
    }
  });

  it("checks new and diversified UFC ladders for shape, distinct answers, leaks and no Q8 lifelines", () => {
    for (const league of leagues) for (let i = 0; i < 15; i += 1) {
      if (i < 10 && !(league === "ufc" && i >= 6 && i <= 8)) continue;
      const run = millionaireFutureEditorialDailyRun(league, i);
      expect(run).toHaveLength(8);
      expect(new Set(run.map(q => normalized(answer(q)))).size).toBe(8);
      run.forEach((q, level) => {
        expect(q.level).toBe(`Q${level + 1}`);
        expect(new Set(q.choices.map(c => normalized(c.text))).size).toBe(4);
        expect(q.choices.filter(c => c.id === q.correctChoiceId)).toHaveLength(1);
        expect(q.explanation).toContain(answer(q));
        if (level === 7) {
          expect(q.statSheet).toBeNull();
          expect(q.lifelineCompatibility).toMatchObject({ fiftyFifty: false, statSheet: false, doubleDip: false });
          // Q8 needs a satisfying factual reveal, not a tautological answer label.
          expect(q.explanation.length).toBeGreaterThan(80);
          expect(q.explanation).not.toBe(`${answer(q)} is the correct answer.`);
        } else {
          expect(q.statSheet && q.statSheet.length > 30).toBe(true);
          expect(normalized(q.statSheet!)).not.toContain(normalized(answer(q)));
          // Catch surname leaks for personal names. A source URL cannot rescue
          // a revealing Stat Sheet; review each clue against all four choices.
          const last = answer(q).split(" ").at(-1)!.replace(/[^a-zA-Z]/g, "").toLowerCase();
          if (last.length >= 6 && !["state", "united", "college", "virginia"].includes(last)) {
            expect(normalized(q.statSheet!)).not.toMatch(new RegExp(`\\b${last}\\b`, "i"));
          }
        }
      });
    }
  });

  it("gives future candidates meaningful reveals without altering historical explanations", () => {
    for (const league of leagues) {
      for (let i = 10; i < 15; i += 1) {
        for (const question of millionaireFutureEditorialDailyRun(league, i).slice(0, 7)) {
          expect(question.explanation).not.toBe(`${answer(question)} is the correct answer.`);
          expect(question.explanation.length).toBeGreaterThan(30);
        }
      }
    }
    for (let i = 6; i < 9; i += 1) {
      for (const question of millionaireFutureEditorialDailyRun("ufc", i).slice(0, 7)) {
        expect(question.explanation).not.toBe(`${answer(question)} is the correct answer.`);
      }
    }
    const old = millionaireDailyRun("nfl", 0)[0]!;
    expect(old.explanation).toBe(`${answer(old)} is the correct answer.`);
    const preview = buildMillionaireDailySetup("football", "2026-11-04", "editorial-reveals-test",
      { editorialCandidatePreview: true });
    const futureRun = preview.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
    for (const question of futureRun.slice(0, 7)) {
      expect(question.explanation).not.toBe(`${answer(question)} is the correct answer.`);
    }
  });

  it("retains pre-cutover history and October 26 Cowboys-themed publication", () => {
    const ufcHistory = buildMillionaireDailySetup("ufc", "2026-10-25", "candidate-qa");
    const footballTheme = buildMillionaireDailySetup("football", "2026-10-26", "candidate-qa");
    const nextUfc = buildMillionaireDailySetup("ufc", "2026-11-06", "candidate-qa",
      { editorialCandidatePreview: true });
    expect(ufcHistory.contentVersion).toBe(MILLIONAIRE_DAILY_CONTENT_VERSION);
    expect(footballTheme.contentVersion).toBe(MILLIONAIRE_DAILY_CONTENT_VERSION);
    expect((footballTheme.privateSetupEvidence.run as MillionaireRuntimeQuestion[]).some(q => q.id.startsWith("theme-"))).toBe(true);
    expect(nextUfc.contentVersion).toBe(MILLIONAIRE_FUTURE_EDITORIAL_CONTENT_VERSION);
    expect(millionaireDailyRunIndex("ufc", "2026-10-25")).toBe(5);
  });

  it("keeps pending editorial candidates out of default Official Daily on every scheduled day", () => {
    let scheduled = 0;
    for (let offset = 0; offset < 182; offset += 1) {
      const day = new Date(Date.UTC(2026, 9, 25 + offset)).toISOString().slice(0, 10);
      for (const sport of ["football", "ufc"] as const) {
        if (sport === "ufc" && !isUfcPublicationDay(day)) continue;
        if (lockedWeightedGameForDay(sport, day) !== "millionaire") continue;
        scheduled += 1;
        const official = buildMillionaireDailySetup(sport, day, "isolation-regression");
        const explicitlyDisabled = buildMillionaireDailySetup(sport, day, "isolation-regression",
          { editorialCandidatePreview: false });
        expect(official).toEqual(explicitlyDisabled);
        expect(official.contentVersion).toBe(MILLIONAIRE_DAILY_CONTENT_VERSION);
        expect(official.publicSetup.run_number).toBeLessThanOrEqual(10);
        expect((official.privateSetupEvidence.run as MillionaireRuntimeQuestion[])
          .every(question => !question.id.includes("editorial-v6")
            && !/millionaire-(nfl|cfb|ufc)-run-1[1-5]-q/.test(question.id))).toBe(true);
      }
    }
    expect(scheduled).toBe(40);
  });

  it("protects source-checked draft revisions against accidental reversion", () => {
    const sourceChecked = [
      ["cfb", 10, 0, "Miami"],
      ["nfl", 11, 4, "James Harrison"],
      ["ufc", 10, 2, "Kamaru Usman"],
      ["ufc", 10, 4, "Carlos Condit"],
      ["ufc", 10, 6, "Alexandre Pantoja"],
      ["nfl", 10, 7, "Talanoa Hufanga"],
      ["ufc", 12, 0, "Yair Rodriguez"],
    ] as const;
    for (const [league, runIndex, level, expected] of sourceChecked) {
      const run = millionaireFutureEditorialDailyRun(league, runIndex);
      expect(answer(run[level]!)).toBe(expected);
      expect(run[level]!.statSheet).not.toContain(expected);
    }
    const heavyweights = millionaireFutureEditorialDailyRun("ufc", 10).filter(question =>
      /heavyweight/.test(question.type));
    expect(heavyweights.length).toBeLessThanOrEqual(2);
  });

  it("preserves four source-checked, future-only featured finals without restoring obscure predecessors", () => {
    const revisedFinals = [
      ["nfl", 11, "Mecole Hardman", "Super Bowl LVIII"],
      ["cfb", 13, "Jack Sawyer", "January 2025 Cotton Bowl"],
      ["cfb", 14, "Blake Corum", "January 2024 Rose Bowl"],
      ["ufc", 10, "Brian Ortega", "UFC 266"],
    ] as const;
    for (const [league, runIndex, correct, occasion] of revisedFinals) {
      const run = millionaireFutureEditorialDailyRun(league, runIndex);
      const final = run[7]!;
      expect(final.level).toBe("Q8");
      expect(final.prompt).toContain(occasion);
      expect(answer(final)).toBe(correct);
      expect(final.explanation).toContain(correct);
      expect(final.explanation.length).toBeGreaterThan(80);
      expect(new Set(final.choices.map(option => normalized(option.text))).size).toBe(4);
      expect(final.statSheet).toBeNull();
      expect(final.lifelineCompatibility).toMatchObject({
        fiftyFifty: false, statSheet: false, doubleDip: false,
      });
    }
  });

  it("has zero repeated complete run IDs in the actual six-month canonical publication calendar", () => {
    const seen = new Set<string>();
    const appearances: Record<typeof leagues[number], number> = { nfl: 0, cfb: 0, ufc: 0 };
    for (let offset = 0; offset < 182; offset += 1) {
      const day = new Date(Date.UTC(2026, 9, 25 + offset)).toISOString().slice(0, 10);
      for (const sport of ["football", "ufc"] as const) {
        if (sport === "ufc" && !isUfcPublicationDay(day)) continue;
        if (lockedWeightedGameForDay(sport, day) !== "millionaire") continue;
        const published = buildMillionaireDailySetup(sport, day, "candidate-calendar",
          { editorialCandidatePreview: true });
        const league = published.publicSetup.league as typeof leagues[number];
        appearances[league] += 1;
        const run = published.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
        expect(run).toHaveLength(8);
        const fingerprint = league + ":" + run.map(q => q.id).join("|");
        expect(seen.has(fingerprint), `repeated run for ${league} on ${day}`).toBe(false);
        seen.add(fingerprint);
      }
    }
    expect(appearances).toEqual({ nfl: 14, cfb: 13, ufc: 13 });
  });
});

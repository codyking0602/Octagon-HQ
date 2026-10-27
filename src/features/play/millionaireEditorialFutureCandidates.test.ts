import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { MILLIONAIRE_FUTURE_Q8_REWRITES } from "./millionaireEditorialFutureQ8";
import { MILLIONAIRE_FUTURE_TARGETED_REWRITES } from "./millionaireEditorialFutureErrata";
import { MILLIONAIRE_DAILY_RUN_COUNT, MILLIONAIRE_FUTURE_EDITORIAL_RUN_COUNT, millionaireDailyRun, millionaireFutureEditorialDailyRun } from "./millionaireDailyQuestionBank";
import { buildMillionaireDailySetup, MILLIONAIRE_DAILY_CONTENT_VERSION, COWBOYS_EAGLES_MILLIONAIRE_REPLAY_VERSION, MILLIONAIRE_FUTURE_EDITORIAL_CONTENT_VERSION, millionaireDailyRunIndex } from "./millionaireDailyRuntime";
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
  it("reconciles all 360 provisional ledger slots with effective future-only Daily publications", () => {
    // A 360-row KEEP ledger is a tracking milestone, not an originality or
    // independent 45-run gameplay/difficulty certification.
    const ledgerFile = resolve(process.cwd(), "docs/audits/millionaire-future-candidate-disposition-ledger-20261025.csv");
    const csv = readFileSync(ledgerFile, "utf8").trim().split("\n");
    const parseCsv = (line: string) => [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)]
      .map(match => match[1]!.replace(/""/g, '"'));
    const columns = parseCsv(csv[0]!);
    const positions = new Map(csv.slice(1).map(line => {
      const values = parseCsv(line);
      const item = Object.fromEntries(values.map((value, index) => [columns[index]!, value]));
      const key = `${item.league}:${item.run_number}:${item.question_level}`;
      return [key, item] as const;
    }));
    expect(csv).toHaveLength(361);
    expect(positions.size).toBe(360);
    const seen = new Set<string>();
    for (let offset = 0; offset < 240 && seen.size < 45; offset += 1) {
      const day = new Date(Date.UTC(2026, 9, 27 + offset)).toISOString().slice(0, 10);
      for (const sport of ["football", "ufc"] as const) {
        if (lockedWeightedGameForDay(sport, day) !== "millionaire") continue;
        if (sport === "ufc" && !isUfcPublicationDay(day)) continue;
        const publication = buildMillionaireDailySetup(sport, day, "editorial-ledger-reconciliation",
          { editorialCandidatePreview: true });
        const league = publication.publicSetup.league as typeof leagues[number];
        const runNumber = Number(publication.privateSetupEvidence.run_number);
        const identifier = `${league}:${runNumber}`;
        if (seen.has(identifier)) continue;
        seen.add(identifier);
        const run = publication.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
        expect(run, identifier).toHaveLength(8);
        run.forEach((question, i) => {
          const key = `${identifier}:${i + 1}`;
          const row = positions.get(key);
          expect(row, key).toBeDefined();
          expect(row!.proposed_disposition, key).toBe("KEEP");
          expect(row!.question_id, key).toBe(question.id);
          expect(row!.type, key).toBe(question.type);
          expect(row!.prompt, key).toBe(question.prompt);
          // The publication deliberately permutes choice positions to balance correct answers.
          expect(row!.choices.split(" | ").map(normalized).sort(), key)
            .toEqual(question.choices.map(choice => normalized(choice.text)).sort());
          expect(row!.answer, key).toBe(answer(question));
          expect(row!.stat_sheet, key).toBe(question.statSheet ?? "");
          expect(row!.evidence_url.startsWith("https://"), key).toBe(true);
          expect(new Set(question.choices.map(choice => normalized(choice.text))).size, key).toBe(4);
        });
      }
    }
    expect(seen.size).toBe(45);
  });



  it("locks four sourced retained-legacy replacements to preview-only errata without changing historical questions", () => {
    for (const [key, correct, evidence] of [
      ["nfl:3:2", "Blake Bortles", "https://www.jaguars.com/news/the-offseason-quarterbacks-20347940"],
      ["nfl:6:6", "Tracy Porter", "https://www.neworleanssaints.com/video/10-years-stronger-porter-intercepts-favre-15815000"],
      ["cfb:0:4", "Marvin Harrison Jr.", "https://ohiostatebuckeyes.com/news/2023/12/8/football-marvin-harrison-jr-is-the-2023-biletnikoff-award-winner"],
      ["cfb:9:0", "Indiana", "https://collegefootballplayoff.com/sports/2026/1/27/NCG-recap"],
    ] as const) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q).toBeDefined();
      expect(q.answer).toBe(correct);
      expect(q.choices.filter(c => c === correct)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(correct));
      expect(q.explanation).toContain(correct);
      expect(q.explanation.length).toBeGreaterThan(90);
      expect(q.evidence[0]?.url).toBe(evidence);
      const [league, runIndex, qIndex] = key.split(":");
      const historic = millionaireDailyRun(league as "nfl" | "cfb" | "ufc", Number(runIndex))[Number(qIndex)]!;
      expect(historic.id).not.toBe(q.id);
      expect(historic.prompt).not.toBe(q.prompt);
    }
  });

  it("replaces three direct active Bar Trivia shared-fact duplicates in future preview only", () => {
    const edits = [
      ["nfl:7:0", "Bills", "https://www.buffalobills.com/news/bills-connections-to-super-bowl-xlviii-12555328"],
      ["ufc:0:0", "Charles Oliveira", "https://www.ufc.com/news/ufc-262-oliveira-vs-chandler-results-highlights-interviews-winners-houston"],
      ["ufc:2:6", "Jack Della Maddalena", "https://www.ufc.com/news/main-card-results-highlights-winner-interviews-ufc-299-omalley-vs-vera-2"],
    ] as const;
    for (const [key, correct, evidence] of edits) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(correct);
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter(v => v === correct)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(correct));
      expect(q.explanation).toContain(correct);
      expect(q.explanation.length).toBeGreaterThan(100);
      expect(q.evidence[0]?.url).toBe(evidence);
      const [league, run, level] = key.split(":");
      const original = millionaireDailyRun(league as "nfl" | "cfb" | "ufc", Number(run))[Number(level)]!;
      expect(original.id).not.toBe(q.id);
      expect(original.prompt).not.toBe(q.prompt);
    }
    expect(millionaireDailyRun("nfl", 7)[0]!.prompt).toContain("Beast Quake");
    expect(millionaireDailyRun("ufc", 0)[0]!.prompt).toContain("Jose Aldo");
    expect(millionaireDailyRun("ufc", 2)[6]!.prompt).toContain("Rich Franklin");
  });

  it("retains sourced Stafford correction, Woodley title and UFC 217 final in future preview only", () => {
    const corrections = [
      ["nfl:0:5", "Matthew Stafford", "https://www.nfl.com/news/2025-all-pro-team-matthew-stafford-bijan-robinson-jaxon-smith-njigba-highlight-roster"],
      ["ufc:2:1", "Tyron Woodley", "https://www.ufc.com/news/woodley-kos-lawler-one-take-title"],
      ["ufc:1:7", "UFC 217", "https://www.ufc.com/news/ufc-217-bisping-vs-st-pierre-final-results"],
    ] as const;
    for (const [key, expected, url] of corrections) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q).toBeDefined();
      expect(q.answer).toBe(expected);
      expect(q.choices.filter(c => c === expected)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(expected));
      expect(q.explanation).toContain(expected);
      expect(q.explanation.length).toBeGreaterThan(110);
      expect(q.evidence[0]?.url).toBe(url);
      const [league, run, question] = key.split(":");
      const original = millionaireDailyRun(league as "nfl" | "cfb" | "ufc", Number(run))[Number(question)]!;
      expect(original.id).not.toBe(q.id);
      expect(original.prompt).not.toBe(q.prompt);
      if (key.endsWith(":7")) expect(q.statSheet).toBeNull();
    }
    expect(millionaireDailyRun("nfl", 0)[5]!.prompt).toContain("never been named first-team All-Pro");
    expect(millionaireDailyRun("ufc", 2)[1]!.prompt).toContain("UFC 100");
  });

  it("reviews all nine formerly untracked legacy UFC preview question positions", () => {
    const checked = [
      ["ufc:0:1", "Sean Strickland", "https://www.ufc.com/news/ufc-293-adesanya-vs-strickland-results-highlights-winner-interviews-sydney"],
      ["ufc:1:1", "Julianna Peña", "https://www.ufc.com/news/ufc-269-oliveira-vs-poirier-results-fight-night-highlights-winners-interviews"],
      ["ufc:1:6", "Benson Henderson", "https://www.ufc.com/news/ufc-lightweight-title-lineage-khabib-mcgregor-penn-poirier-oliveira"],
      ["ufc:2:5", "Tony Ferguson", "https://www.ufc.com/news/ferguson-claims-interim-lightweight-belt-calls-out-mcgregor"],
      ["ufc:3:1", "Joanna Jedrzejczyk", "https://www.ufc.com/news/ufc-217-bisping-vs-st-pierre-final-results"],
      ["ufc:3:2", "Randy Couture", "https://www.ufc.com/news/history-two-division-champions-part-1-ufc-freedom-250"],
      ["ufc:4:5", "T.J. Dillashaw", "https://www.ufc.com/news/fight-night-dillashaw-vs-cruz-final-results"],
      ["ufc:5:6", "Jose Aldo", "https://www.ufc.com/athlete/jose-aldo"],
      ["ufc:9:4", "Joanna Jedrzejczyk", "https://www.ufc.com/news/ufc-womens-flyweight-title-lineage"],
    ] as const;
    expect(checked).toHaveLength(9);
    for (const [key, answerText, url] of checked) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q).toBeDefined();
      expect(q.answer).toBe(answerText);
      expect(q.choices.filter(choice => choice === answerText)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(answerText));
      expect(q.explanation).toContain(answerText === "Jose Aldo" ? "Aldo" : answerText === "Joanna Jedrzejczyk" ? "Joanna" : answerText);
      expect(q.explanation.length).toBeGreaterThan(100);
      expect(q.evidence[0]?.url).toBe(url);
      const [league, runIndex, level] = key.split(":");
      const historic = millionaireDailyRun(league as "ufc", Number(runIndex))[Number(level)]!;
      expect(historic.id).not.toBe(q.id);
    }
    expect(millionaireDailyRun("ufc", 5)[6]!.statSheet).toContain("Aldo");
    expect(MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:5:6"]!.statSheet).not.toContain("Aldo");
  });

  it("swaps duplicate Matt Ryan trivia and stale 4,000-yard comparison for factual NFL playoff identities", () => {
    for (const [key, answerText, url, oldFact] of [
      ["nfl:3:2", "Blake Bortles", "https://www.jaguars.com/news/the-offseason-quarterbacks-20347940", "AP NFL Most Valuable Player"],
      ["nfl:0:6", "Jeff Hostetler", "https://www.giants.com/news/phil-ing-the-void", "4,000-yard passing"],
    ] as const) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(answerText);
      expect(q.choices.filter(c => c === answerText)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(answerText));
      expect(q.explanation).toContain(answerText);
      expect(q.explanation.length).toBeGreaterThan(125);
      expect(q.evidence[0]?.url).toBe(url);
      expect(q.prompt).not.toContain(oldFact);
      const [league, idx, level] = key.split(":");
      const historic = millionaireDailyRun(league as "nfl", Number(idx))[Number(level)]!;
      expect(historic.prompt).not.toBe(q.prompt);
      expect(historic.id).not.toBe(q.id);
    }
    expect(millionaireDailyRun("nfl",3)[2]!.prompt).toContain("AP NFL MVP");
  });

  it("source-checks ten previously untracked NFL legacy positions and fixes early draft-heavy pacing", () => {
    const checked = [
      ["nfl:0:0", "Joe Burrow", "https://www.nfl.com/news/cincinnati-bengals-pick-joe-burrow-no-1-in-2020-draft-0ap3000001110800"],
      ["nfl:0:2", "Josh Jacobs", "https://www.nfl.com/stats/player-stats/category/rushing/2022/REG/all/rushingyards/desc"],
      ["nfl:1:0", "Colts", "https://www.profootballhof.com/players/peyton-manning"],
      ["nfl:1:1", "Von Miller", "https://www.nfl.com/news/broncos-lb-von-miller-named-super-bowl-50-mvp-0ap3000000634374"],
      ["nfl:1:2", "Vikings", "https://www.vikings.com/history/all-time-draft-classes"],
      ["nfl:2:0", "Texans", "https://www.profootballhof.com/players/andre-johnson"],
      ["nfl:4:0", "49ers", "https://www.profootballhof.com/football-history/nfl-draft-history/1940/1985"],
      ["nfl:4:4", "Calvin Johnson", "https://www.nfl.com/stats/player-stats/category/receiving/2012/reg/all/receivingyards/desc"],
      ["nfl:5:4", "Malcolm Smith", "https://www.seahawks.com/news/super-bowl-xlviii-10-years-later-whenever-you-think-about-the-seattle-seahawks-you-re-going-to-think-about-this-team"],
      ["nfl:6:0", "49ers", "https://www.49ers.com/news/49ers-announce-trade-for-running-back-christian-mccaffrey-panthers-nfl"],
    ] as const;
    expect(checked).toHaveLength(10);
    for(const [key, correct, source] of checked){
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(correct);
      expect(q.choices.filter(choice=>choice===correct)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(correct));
      expect(q.explanation).toContain(correct);
      expect(q.explanation.length).toBeGreaterThan(100);
      expect(q.evidence[0]?.url).toBe(source);
      const [sport, index, qIndex] = key.split(":");
      const historic = millionaireDailyRun(sport as "nfl",Number(index))[Number(qIndex)]!;
      expect(historic.id).not.toBe(q.id);
    }
    expect(millionaireDailyRun("nfl",0)[2]!.prompt).toContain("Aaron Rodgers");
    const newer = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:0:2"]!;
    expect(newer.prompt).toContain("rushing yards");
    expect(newer.prompt).not.toContain("drafted");
  });

  it("checks five historical CFB Heisman candidates against the official winners list", () => {
    for (const [key, winner] of [["cfb:0:0","Joe Burrow"],["cfb:0:3","Bryce Young"],["cfb:1:1","Jameis Winston"],["cfb:2:1","DeVonta Smith"],["cfb:3:1","Jason White"]] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter(c=>c===winner)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(winner));
      expect(q.explanation).toContain(winner);
      expect(q.evidence[0]?.url).toBe("https://www.heisman.com/heisman-winners/");
    }
  });

  it("verifies five sourced college Heisman previews", () => {
    const entries = [
      ["cfb:4:1","Marcus Mariota"], ["cfb:5:1","Caleb Williams"],
      ["cfb:6:0","Sam Bradford"], ["cfb:7:1","Derrick Henry"],
      ["cfb:9:1","Oklahoma"]
    ] as const;
    for (const [key,winner] of entries) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.choices.filter(c=>c===winner)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(winner));
      expect(q.explanation).toContain(winner);
    }
  });

  it("checks eight source-backed retained NFL historical answer reveals", () => {
    for (const key of ["nfl:2:2","nfl:2:4","nfl:3:1","nfl:4:2","nfl:4:3","nfl:5:1","nfl:5:3","nfl:7:3"] as const) {
      const c=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(c.choices).toHaveLength(4);
      expect(c.choices.filter(v=>v===c.answer)).toHaveLength(1);
      expect(new Set(c.choices.map(normalized)).size).toBe(4);
      expect(normalized(c.statSheet??"")).not.toContain(normalized(c.answer));
      expect(c.explanation).toContain(c.answer);
      expect(c.explanation.length).toBeGreaterThan(95);
      expect(c.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("checks six retained college title and draft facts in preview only", () => {
    for (const key of ["cfb:0:6","cfb:1:5","cfb:1:6","cfb:2:2","cfb:3:2","cfb:5:3"] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter(v=>v===q.answer)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(q.answer));
      expect(q.explanation).toContain(q.answer.replace(/^\d{4} /,""));
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
      expect(q.explanation.length).toBeGreaterThan(110);
    }
  });

  it("guards six sourced CFB legacy-preview corrections including 2022 Rose Bowl", () => {
    for (const key of ["cfb:6:2","cfb:6:3","cfb:7:2","cfb:7:4","cfb:9:2","cfb:9:5"] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.choices).toHaveLength(4);
      expect(q.choices.filter(c=>c===q.answer)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(q.answer));
      expect(q.explanation.length).toBeGreaterThan(110);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
    const rose=MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:7:2"]!;
    expect(rose.answer).toBe("Ohio State");
    expect(rose.prompt).toContain("2022 Rose Bowl");
    expect(rose.prompt).not.toContain("Vince Young");
    expect(millionaireDailyRun("cfb",7)[2]!.prompt).toContain("fourth-down");
  });

  it("preserves eight sourced CFB historical award and upset facts without hint leakage", () => {
    const entries = ["cfb:0:5","cfb:1:2","cfb:1:3","cfb:2:4","cfb:2:5","cfb:2:6","cfb:3:0","cfb:3:3"] as const;
    for (const key of entries) {
      const question=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(question).toBeDefined();
      expect(question.choices.filter(c=>c===question.answer)).toHaveLength(1);
      expect(new Set(question.choices.map(normalized)).size).toBe(4);
      expect(normalized(question.statSheet??"")).not.toContain(normalized(question.answer));
      const expectedAnswerReference = question.answer === "2021 Georgia"
        ? "Georgia"
        : question.answer === "Tim Tebow 2007" ? "Tim Tebow" : question.answer;
      expect(question.explanation).toContain(expectedAnswerReference);
      if (question.answer === "Tim Tebow 2007") expect(question.explanation).toContain("2007");
      expect(question.explanation.length).toBeGreaterThan(100);
      expect(question.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("checks eight further sourced CFB awards, championship paths and season distinctions", () => {
    for (const key of ["cfb:4:0","cfb:4:3","cfb:4:4","cfb:4:5","cfb:4:6","cfb:5:4","cfb:5:5","cfb:5:6"] as const) {
      const question=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(question.choices.filter(c=>c===question.answer)).toHaveLength(1);
      expect(new Set(question.choices.map(normalized)).size).toBe(4);
      expect(normalized(question.statSheet??"")).not.toContain(normalized(question.answer));
      expect(question.explanation.length).toBeGreaterThan(110);
      expect(question.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("checks the last eight retained CFB candidate facts, distractors and finals", () => {
    for (const key of ["cfb:6:4","cfb:6:5","cfb:7:3","cfb:7:7","cfb:8:0","cfb:8:4","cfb:9:4","cfb:9:6"] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.choices.filter(c=>c===q.answer)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(q.answer));
      expect(q.explanation.length).toBeGreaterThan(110);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
    const final=MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:7:7"]!;
    expect(final.answer).toBe("Cardale Jones");
    expect(final.statSheet).toBeNull();
    expect(final.explanation).toContain("Oregon");
  });

  it("validates nine inherited NFL draft, awards and Super Bowl facts against source reviews", () => {
    for (const key of ["nfl:0:3","nfl:0:4","nfl:1:3","nfl:1:5","nfl:1:6","nfl:2:3","nfl:2:5","nfl:2:6","nfl:3:0"] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.choices.filter(c=>c===q.answer)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(q.answer));
      expect(q.explanation.length).toBeGreaterThan(95);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("source-reconciles nine more inherited NFL drafted-player and Super Bowl records", () => {
    for (const key of ["nfl:3:3","nfl:3:5","nfl:3:6","nfl:5:0","nfl:5:2","nfl:5:6","nfl:6:2","nfl:6:3","nfl:6:4"] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.choices.filter(c=>c===q.answer)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(q.answer));
      expect(q.explanation.length).toBeGreaterThan(105);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("protects nine further NFL award, draft and Super Bowl answers in future preview", () => {
    for (const key of ["nfl:6:5","nfl:7:1","nfl:7:2","nfl:7:4","nfl:7:6","nfl:8:0","nfl:8:2","nfl:8:3","nfl:8:4"] as const) {
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.choices.filter(c=>c===q.answer)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(q.answer));
      expect(q.explanation.length).toBeGreaterThan(105);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("keeps four active UFC Bar Trivia duplicate facts out of future-only overlay candidates", () => {
    const cases = [
      ["ufc:1:2", "Rashad Evans", "UFC 88", "Demetrious Johnson"],
      ["ufc:2:2", "Forrest Griffin", "UFC 86", "Mauricio Rua"],
      ["ufc:4:6", "Petr Yan", "UFC 251", "Justin Gaethje"],
      ["ufc:5:1", "Leon Edwards", "UFC 286", "Marcus Brimage"]
    ] as const;
    for (const [key, winner, event, formerAnswer] of cases) {
      const preview = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(preview.answer).toBe(winner);
      expect(preview.prompt).toContain(event);
      expect(preview.prompt).not.toContain(formerAnswer);
      expect(preview.choices.filter(c => c === winner)).toHaveLength(1);
      expect(new Set(preview.choices.map(normalized)).size).toBe(4);
      expect(normalized(preview.statSheet!)).not.toContain(normalized(winner));
      expect(preview.explanation).toContain(winner);
      expect(preview.evidence[0]?.url.startsWith("https://www.ufc.com/")).toBe(true);
      const [, runIndex, questionIndex] = key.split(":");
      const original = millionaireDailyRun("ufc", Number(runIndex))[Number(questionIndex)]!;
      expect(answer(original)).not.toBe(winner);
    }
    const mappedAnswers = (run: number) =>
      millionaireFutureEditorialDailyRun("ufc", run).map((q, i) =>
        MILLIONAIRE_FUTURE_TARGETED_REWRITES[`ufc:${run}:${i}`]?.answer ??
        MILLIONAIRE_FUTURE_Q8_REWRITES[`ufc:${run}:${i}`]?.answer ?? answer(q));
    for (const run of [1, 2, 4, 5]) {
      expect(new Set(mappedAnswers(run)).size).toBe(8);
    }
  });

  it("protects eight remaining October 27 sourced intervention candidate fixes", () => {
    const finals = [
      ["nfl:6:7","Charles Woodson","Greg Biekert"],
      ["cfb:4:7","Matthew Golden","Andrew Mukuba"],
      ["cfb:5:7","Rod Moore","Will Johnson"],
      ["cfb:9:7","Javon Bullard","Defensive Player"],
    ] as const;
    for(const[key,winner,detail]of finals){
      const q=MILLIONAIRE_FUTURE_Q8_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.explanation).toContain(detail);
      expect(q.statSheet).toBeNull();
      expect(q.choices.filter(c=>c===winner)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
    }
    const other = [
      ["cfb:9:3","Vanderbilt","308 total yards"],
      ["cfb:5:2","TCU","13–2"],
      ["cfb:7:5","Notre Dame 2020","34–10"],
      ["ufc:5:5","Erin Blanchfield","1:37"],
    ] as const;
    for(const[key,winner,detail]of other){
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.explanation).toContain(detail);
      expect(q.choices.filter(c=>c===winner)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet??"")).not.toContain(normalized(winner));
    }
  });


  it("replaces the active UFC 237 slam duplicate and surname-leaking legacy clue only in future candidates", () => {
    const original = millionaireDailyRun("ufc", 5)[5]!;
    expect(original.statSheet).toContain("Andrade");
    const fixed = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:5:5"]!;
    expect(fixed.answer).toBe("Erin Blanchfield");
    expect(fixed.prompt).toContain("February 2023");
    expect(fixed.prompt).not.toContain("UFC 237");
    expect(fixed.statSheet).not.toContain("Andrade");
    expect(fixed.explanation).toContain("1:37");
    expect(fixed.explanation).toContain("rear-naked choke");
    expect(fixed.choices).toEqual(["Erin Blanchfield","Manon Fiorot","Alexa Grasso","Maycee Barber"]);
    expect(fixed.evidence[0]?.url).toContain("ufc.com");
    expect(new Set(fixed.choices.map(normalized)).size).toBe(4);
    expect(normalized(fixed.statSheet!)).not.toContain(normalized(fixed.answer));
  });

  it("covers ten additional preview-only title and playoff reveals across NFL CFB UFC", () => {
    const finals = [
      ["nfl:1:7","Willie Brown","36-year-old"],
      ["nfl:9:7","Noah Brown","52-yard"],
    ] as const;
    for(const [key,winner,detail] of finals){
      const q=MILLIONAIRE_FUTURE_Q8_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.explanation).toContain(detail);
      expect(q.statSheet).toBeNull();
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
    }
    const overlays = [
      ["cfb:1:0","Texas","19 seconds"],
      ["cfb:2:0","Michigan","15–0"],
      ["cfb:5:0","Alabama","215 yards"],
      ["cfb:7:0","LSU","463 yards"],
      ["cfb:7:6","Mason Taylor","front-right"],
      ["cfb:8:6","Bud Clark","Dee Winters"],
      ["ufc:1:0","Francis Ngannou","left uppercut"],
      ["ufc:1:5","Arman Tsarukyan","1:04"],
    ] as const;
    for(const [key,winner,detail] of overlays){
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.explanation).toContain(detail);
      expect(q.choices.filter(c=>c===winner)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });

  it("keeps six additional sourced future-only Q8 reveals correct", () => {
    const cases = [
      ["nfl:0:7","Cooper DeJean","22nd birthday"],
      ["nfl:2:7","Sam Hubbard","Tyler Huntley"],
      ["cfb:1:7","Barry Sanders","37 touchdowns"],
      ["ufc:0:7","Francis Ngannou","20 seconds"],
      ["ufc:2:7","Dustin Poirier","2:32"],
      ["ufc:5:7","Tom Aspinall","3:45"],
    ] as const;
    for(const [key,winner,detail] of cases){
      const q=MILLIONAIRE_FUTURE_Q8_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.explanation).toContain(detail);
      expect(q.choices.filter(choice=>choice===winner)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(q.statSheet).toBeNull();
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });


  it("uses four true 2001 Raiders on the Tuck Rule future final", () => {
    const q = MILLIONAIRE_FUTURE_Q8_REWRITES["nfl:6:7"]!;
    expect(q.answer).toBe("Charles Woodson");
    expect(q.prompt).toContain("Tuck Rule");
    expect(q.choices).toEqual(["Charles Woodson", "Greg Biekert", "Eric Allen", "Tory James"]);
    expect(q.choices).not.toContain("Rod Woodson");
    expect(q.statSheet).toBeNull();
    expect(q.evidence[0]!.url).toContain("patriots.com");
    expect(millionaireDailyRun("nfl",6)[7]!.id).not.toBe(q.id);
  });

  it("retains eight sourced NFL CFB UFC legacy-preview factual reveals", () => {
    const cases = [
      ["nfl:9:0","Chargers","2001–2005"],
      ["cfb:2:3","Washington State","55–47"],
      ["cfb:1:4","LaVell Edwards","24–17"],
      ["cfb:3:4","Gene Chizik","14–0"],
      ["cfb:6:7","Sony Michel","Lorenzo Carter"],
      ["ufc:9:3","Holly Holm","49–46"],
      ["ufc:0:6","Maurice Smith","Birmingham"],
      ["ufc:4:1","Israel Adesanya","4:21"],
    ] as const;
    for(const [key,winner,fact] of cases){
      const q=MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(winner);
      expect(q.explanation).toContain(winner);
      expect(q.explanation).toContain(fact);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(q.choices.filter(choice=>choice===winner)).toHaveLength(1);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
      if(key.endsWith(":7"))expect(q.statSheet).toBeNull();
      else expect(normalized(q.statSheet??"")).not.toContain(normalized(winner));
    }
  });


  it("keeps two official-source-backed career and coaching clues spoiler-safe", () => {
    const brees = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:9:0"]!;
    const leach = MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:2:3"]!;
    expect(brees.answer).toBe("Chargers");
    expect(brees.prompt).toContain("Drew Brees");
    expect(brees.statSheet).toContain("Comeback Player of the Year");
    expect(brees.statSheet).not.toContain("California");
    expect(leach.answer).toBe("Washington State");
    expect(leach.statSheet).toContain("Air Raid");
    expect(leach.statSheet).not.toContain("Washington");
    for (const q of [brees, leach]) {
      expect(q.evidence).toHaveLength(1);
      expect(q.evidence[0]!.url.startsWith("https://")).toBe(true);
      expect(q.explanation).toContain(q.answer);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet!)).not.toContain(normalized(q.answer));
    }
  });

  it("prevents late 2026 historical and roster errors in NFL CFB and UFC candidate repairs", () => {
    const broncos = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:3:4"]!;
    expect(broncos.answer).toBe("Malik Jackson");
    expect(broncos.prompt).toContain("Cam Newton");
    expect(broncos.explanation).toContain("24–10");
    expect(broncos.choices).toEqual(["Malik Jackson", "DeMarcus Ware", "Derek Wolfe", "Sylvester Williams"]);
    const kicker = MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:8:5"]!;
    expect(kicker.answer).toBe("Chase McGrath");
    expect(kicker.choices).toContain("Jack Podlesny");
    expect(kicker.choices).not.toContain("Peyton Woodring");
    const retirement = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:9:7"]!;
    expect(retirement.prompt).toContain("UFC 289");
    expect(retirement.prompt).toContain("June 2023");
    expect(retirement.explanation).toContain("50–43");
    expect(retirement.statSheet).toBeNull();
    expect(new Set(retirement.choices.map(normalized)).size).toBe(4);
  });


  it("keeps three active UFC V3 same-fact collisions out of the playable candidate preview", () => {
    const oldFirst = millionaireDailyRun("ufc", 1)[0]!;
    expect(oldFirst.prompt).toContain("The Notorious");
    const ngannou = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:1:0"]!;
    expect(ngannou.answer).toBe("Francis Ngannou");
    expect(ngannou.prompt).toContain("UFC 218");
    expect(ngannou.prompt).not.toContain("Ciryl Gane");
    const arman = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:1:5"]!;
    expect(arman.answer).toBe("Arman Tsarukyan");
    expect(arman.prompt).toContain("UFC Austin");
    expect(arman.prompt).not.toContain("Tony Ferguson");
    const aspinall = MILLIONAIRE_FUTURE_Q8_REWRITES["ufc:5:7"]!;
    expect(aspinall.answer).toBe("Tom Aspinall");
    expect(aspinall.prompt).toContain("Alexander Volkov");
    expect(aspinall.prompt).not.toContain("Tony Ferguson");
    expect(aspinall.statSheet).toBeNull();
    for (const q of [ngannou, arman, aspinall]) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(q.choices.filter(choice => choice === q.answer)).toHaveLength(1);
      expect(q.evidence[0]?.url).toContain("ufc.com");
      expect(q.explanation).toContain(q.answer);
    }
    // Direct future-run selector intentionally returns untouched historical seeds
    // for runs 1–10; overlay them only inside the opt-in runtime preview.
    const legacyRun2 = millionaireFutureEditorialDailyRun("ufc", 1);
    const run2Answers = legacyRun2.map((question, level) =>
      MILLIONAIRE_FUTURE_TARGETED_REWRITES[`ufc:1:${level}`]?.answer
      ?? MILLIONAIRE_FUTURE_Q8_REWRITES[`ufc:1:${level}`]?.answer
      ?? answer(question)
    );
    expect(new Set(run2Answers).size).toBe(8);
    expect(run2Answers[0]).toBe("Francis Ngannou");
    expect(run2Answers[5]).toBe("Arman Tsarukyan");
    expect(MILLIONAIRE_FUTURE_Q8_REWRITES["ufc:5:7"]!.answer).toBe("Tom Aspinall");
    expect(MILLIONAIRE_FUTURE_Q8_REWRITES["ufc:5:7"]!.statSheet).toBeNull();
  });

  it("keeps nine future NFL/CFB/UFC Q8 playoffs and championship explanations substantive", () => {
    const approved = [
      ["nfl:5:7", "Larry Fitzgerald", "26–20"],
      ["nfl:7:7", "Vernon Davis", "14-yard"],
      ["cfb:0:7", "Jerard Rabb", "fourth-and-18"],
      ["cfb:2:7", "Gary Patterson", "13–0"],
      ["cfb:3:7", "Justin Blackmon", "1,782"],
      ["cfb:8:7", "Charlie Ward", "Knicks"],
      ["ufc:3:7", "Jan Błachowicz", "4:36"],
      ["ufc:4:7", "Lyoto Machida", "3:57"],
      ["ufc:5:7", "Tom Aspinall", "3:45"],
    ] as const;
    for (const [key, expected, detail] of approved) {
      const q = MILLIONAIRE_FUTURE_Q8_REWRITES[key]!;
      expect(q.answer).toBe(expected);
      expect(q.explanation).toContain(detail);
      expect(q.statSheet).toBeNull();
      expect(q.choices.filter(c => c === expected)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
  });


  it("preserves the further AFC title and SoFi hint improvements without answer leaks", () => {
    const polamalu = millionaireFutureEditorialDailyRun("nfl",11)[4]!;
    expect(answer(polamalu)).toBe("Troy Polamalu");
    expect(polamalu.prompt).toContain("Steelers defender");
    expect(polamalu.prompt).not.toContain("Steelers safety");
    const sofi = millionaireFutureEditorialDailyRun("nfl",14)[0]!;
    expect(answer(sofi)).toBe("Rams");
    expect(sofi.statSheet).toContain("Super Bowl LVI");
    expect(sofi.statSheet).not.toContain("Rams");
    for (const q of [polamalu, sofi]) {
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map(c => normalized(c.text))).size).toBe(4);
    }
  });


  it("prevents nine multi-sport source-bank answer leaks and ineligible distractors from returning", () => {
    const cases = [
      ["nfl",13,2,"Bears","opening kickoff"],["nfl",13,4,"Marcus Mariota","Corey Davis"],
      ["nfl",14,4,"Mike Alstott","second-quarter"],["cfb",11,0,"Georgia","hedges"],
      ["cfb",13,4,"Carson Palmer","No. 1"],["cfb",13,6,"Michael Crabtree","28-yard"],
      ["cfb",14,2,"Texas A&M","345 yards"],["ufc",13,2,"Randy Couture","heavyweight"],
      ["ufc",14,1,"Ciryl Gane","kicks"]
    ] as const;
    for (const [sport, run, level, correct, hint] of cases) {
      const q = millionaireFutureEditorialDailyRun(sport,run)[level]!;
      expect(answer(q)).toBe(correct);
      expect(q.statSheet).toContain(hint);
      expect(normalized(q.prompt)).not.toContain(normalized(correct));
      expect(normalized(q.statSheet!)).not.toContain(normalized(correct));
      expect(q.explanation).toContain(correct);
      expect(new Set(q.choices.map(c => normalized(c.text))).size).toBe(4);
    }
    expect(millionaireFutureEditorialDailyRun("nfl",14)[4]!.choices.map(c=>c.text))
      .toEqual(["Mike Alstott","Michael Pittman","Aaron Stecker","Jameel Cook"]);
    expect(millionaireFutureEditorialDailyRun("cfb",13)[6]!.choices.map(c=>c.text))
      .not.toContain("Danny Amendola");
    expect(millionaireFutureEditorialDailyRun("ufc",14)[1]!.prompt).not.toContain("French");
    expect(millionaireFutureEditorialDailyRun("cfb",14)[2]!.prompt).not.toContain("Manziel");
  });

  it("uses two source-backed iconic future-only NFL finals instead of obscure stat trivia", () => {
    for (const [key, expected, fragment] of [
      ["nfl:3:7", "Vonn Bell", "January 2022 AFC title"],
      ["nfl:4:7", "Damien Williams", "Super Bowl LIV"],
    ] as const) {
      const q = MILLIONAIRE_FUTURE_Q8_REWRITES[key]!;
      expect(q.answer).toBe(expected);
      expect(q.prompt).toContain(fragment);
      expect(q.choices).toHaveLength(4);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(q.choices.filter(choice => choice === expected)).toHaveLength(1);
      expect(q.statSheet).toBeNull();
      expect(q.evidence).toHaveLength(1);
    }
    expect(millionaireDailyRun("nfl", 3)[7]!.prompt).toContain("two different franchises");
    expect(millionaireDailyRun("nfl", 4)[7]!.prompt).toContain("SIXTH quarterback");
  });

  it("keeps two ambiguous CFB title years fixed and swaps one active trivia overlap only in future preview", () => {
    const changes = [
      ["cfb:0:2", "Alabama", "January 2017", "2016 SEASON"],
      ["cfb:4:2", "Tulane", "January 2023", "Cotton Bowl"],
      ["cfb:6:1", "LSU", "January 2012", "2011 season"],
    ] as const;
    for (const [key, correct, occasion, scope] of changes) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.answer).toBe(correct);
      expect(q.prompt).toContain(occasion);
      expect(q.prompt.toLowerCase()).toContain(scope.toLowerCase());
      expect(q.choices.filter(choice => choice === correct)).toHaveLength(1);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(correct));
      expect(q.evidence).toHaveLength(1);
    }
    expect(millionaireDailyRun("cfb", 0)[2]!.prompt).toBe("Who did Clemson defeat to win the 2016 national championship?");
    expect(millionaireDailyRun("cfb", 4)[2]!.prompt).toContain("2017 national championship game");
    expect(millionaireDailyRun("cfb", 6)[1]!.prompt).toContain("2011 national championship");
  });

  it("replaces same-run repeated heavyweight subject with Poirier-Chandler UFC 281", () => {
    const q = millionaireFutureEditorialDailyRun("ufc", 10)[3]!;
    expect(q.prompt).toContain("UFC 281");
    expect(answer(q)).toBe("Dustin Poirier");
    expect(q.statSheet).not.toContain("Dustin Poirier");
    expect(q.choices.map(choice => choice.text)).toEqual([
      "Dustin Poirier", "Justin Gaethje", "Charles Oliveira", "Tony Ferguson",
    ]);
  });

  it("replaces 2001 quarterback trivia and consecutive Auburn facts in CFB future run 6", () => {
    const school = MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:5:2"]!;
    const final = MILLIONAIRE_FUTURE_Q8_REWRITES["cfb:5:7"]!;
    expect(school.answer).toBe("TCU");
    expect(school.prompt).toContain("Sonny Dykes");
    expect(normalized(school.statSheet ?? "")).not.toContain("tcu");
    expect(final.answer).toBe("Rod Moore");
    expect(final.prompt).toContain("25 seconds");
    expect(final.statSheet).toBeNull();
    expect(final.choices).toContain("Will Johnson");
    expect(final.explanation).toContain("Will Johnson");
    expect(millionaireDailyRun("cfb", 5)[2]!.prompt).toContain("Ken Dorsey");
  });

  it("isolates four sourced future-only CFB cross-game overlap repairs", () => {
    const cases = [
      ["cfb:7:6", "Mason Taylor"],
      ["cfb:8:5", "Chase McGrath"],
      ["cfb:8:6", "Bud Clark"],
      ["cfb:9:3", "Vanderbilt"],
    ] as const;
    for (const [key, correct] of cases) {
      const candidate = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(candidate.answer).toBe(correct);
      expect(candidate.choices.filter(option => option === correct)).toHaveLength(1);
      expect(new Set(candidate.choices.map(normalized)).size).toBe(4);
      expect(normalized(candidate.statSheet ?? "")).not.toContain(normalized(correct));
      expect(candidate.explanation).toContain(correct);
      expect(candidate.evidence.length).toBeGreaterThan(0);
    }
    expect(millionaireDailyRun("cfb", 7)[6]!.prompt).toContain("double overtime");
    expect(millionaireDailyRun("cfb", 8)[5]!.prompt).toContain("BCS bowl");
    expect(millionaireDailyRun("cfb", 8)[6]!.prompt).toContain("Sugar Bowl");
    expect(millionaireDailyRun("cfb", 9)[3]!.prompt).toContain("Ohio State");
  });


  it("excludes two exact active NFL Bar Trivia collisions from future candidates", () => {
    const jackson = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:3:4"]!;
    const jefferson = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:4:5"]!;
    expect(jackson.answer).toBe("Malik Jackson");
    expect(jackson.choices).toContain("DeMarcus Ware");
    expect(jackson.prompt).toContain("Super Bowl 50");
    expect(jackson.prompt).not.toContain("Super Bowl LII");
    expect(jackson.statSheet).not.toContain("Malik Jackson");
    expect(jackson.explanation).toContain("Von Miller");
    expect(jefferson.answer).toBe("Geno Smith");
    expect(jefferson.prompt).toContain("2022");
    expect(jefferson.statSheet).not.toContain("Geno Smith");
    expect(millionaireDailyRun("nfl", 3)[4]!.prompt).toContain("wild-card");
    expect(millionaireDailyRun("nfl", 4)[5]!.prompt).toContain("kicker");
  });

  it("retains three future-only removals of active UFC Bar Trivia fact collisions", () => {
    const overeem = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:1:0"]!;
    expect(overeem.answer).toBe("Francis Ngannou");
    expect(overeem.prompt).toContain("UFC 218");
    expect(overeem.statSheet).not.toContain("Francis Ngannou");
    expect(millionaireDailyRun("ufc", 1)[0]!.prompt).toContain("The Notorious");
    expect(answer(millionaireFutureEditorialDailyRun("ufc", 11)[2]!)).toBe("Alex Pereira");
    expect(millionaireFutureEditorialDailyRun("ufc", 11)[2]!.prompt).toContain("UFC 303");
    expect(answer(millionaireFutureEditorialDailyRun("ufc", 13)[6]!)).toBe("Khamzat Chimaev");
  });

  it("removes the Notre Dame answer giveaway in future-only CFB run 8 without editing legacy proofs", () => {
    const legacy = millionaireDailyRun("cfb", 7)[5]!;
    expect(legacy.statSheet).toContain("Notre Dame");
    const preview = buildMillionaireDailySetup("football", "2027-04-01", "cfb-acc-leak-preview",
      { editorialCandidatePreview: true });
    // Directly assert the keyed Q6 future candidate source; the live publisher
    // uses this exact override for future CFB run 8 when selected.
    const rewritten = MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:7:5"]!;
    expect(rewritten.answer).toBe("Notre Dame 2020");
    expect(rewritten.statSheet).not.toMatch(/Notre Dame/i);
    expect(rewritten.choices.filter(choice => choice === rewritten.answer)).toHaveLength(1);
    expect(preview.contentVersion).toBe(MILLIONAIRE_FUTURE_EDITORIAL_CONTENT_VERSION);
  });

  it("protects twenty-seven additional future question replacements and Q8 option mappings", () => {
    const newRunCorrections = [
      ["nfl", 10, 6, "Travis Kelce"],
      ["nfl", 14, 2, "Ja'Marr Chase"],
      ["cfb", 10, 2, "Michael Penix Jr."],
      ["cfb", 10, 5, "Max Duggan"],
      ["cfb", 10, 6, "Ashton Jeanty"],
      ["cfb", 14, 6, "Donovan Edwards"],
      ["ufc", 13, 6, "Khamzat Chimaev"],
      ["ufc", 6, 7, "Ilia Topuria"],
      ["ufc", 12, 7, "Paddy Pimblett"],
      ["nfl", 12, 3, "Christian McCaffrey"],
      ["nfl", 12, 7, "Aaron Donald"],
      ["nfl", 13, 6, "Riley Patterson"],
      ["nfl", 13, 5, "Brandon Aiyuk"],
      ["cfb", 10, 3, "Kirby Smart"],
      ["cfb", 12, 6, "Luke Fickell"],
      ["cfb", 13, 2, "J.J. McCarthy"],
      ["cfb", 13, 3, "Trevor Etienne"],
      ["cfb", 13, 6, "Michael Crabtree"],
      ["cfb", 14, 3, "Diego Pavia"],
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
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 13)[3]!)).toBe("DeVonta Smith");
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 13)[5]!)).toBe("Brandon Aiyuk");
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 13)[6]!)).toBe("Riley Patterson");
    expect(millionaireFutureEditorialDailyRun("nfl", 13)[6]!.prompt).toContain("36-yard field goal");
    expect(millionaireFutureEditorialDailyRun("nfl", 13)[6]!.choices.map(choice => choice.text)).toEqual(["Riley Patterson", "Cameron Dicker", "Brandon McManus", "Evan McPherson"]);
    expect(millionaireFutureEditorialDailyRun("nfl", 14)[2]!.statSheet).not.toContain("LSU");
    expect(millionaireFutureEditorialDailyRun("cfb", 14)[3]!.statSheet).not.toContain("Vanderbilt");
    expect(millionaireFutureEditorialDailyRun("ufc", 14)[4]!.statSheet).not.toContain("Kazakh");
    // CFB run 14's locally source-reviewed progression must preserve eight distinct
    // historically anchored facts without answer leakage or mismapped options.
    const cfbRun14 = millionaireFutureEditorialDailyRun("cfb", 13);
    expect(cfbRun14.map(answer)).toEqual([
      "Alabama", "Baylor", "J.J. McCarthy", "Trevor Etienne",
      "Carson Palmer", "Georgia", "Michael Crabtree", "Jack Sawyer",
    ]);
    cfbRun14.forEach((question, index) => {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map(choice => normalized(choice.text))).size).toBe(4);
      expect(question.explanation.length).toBeGreaterThan(100);
      if (index === 7) {
        expect(question.statSheet).toBeNull();
        expect(question.lifelineCompatibility).toMatchObject({ fiftyFifty: false, statSheet: false, doubleDip: false });
      } else {
        expect(question.statSheet).toBeTruthy();
        expect(normalized(question.statSheet!)).not.toContain(normalized(answer(question)));
      }
    });
    const ufcRun14 = millionaireFutureEditorialDailyRun("ufc", 13);
    expect(ufcRun14.map(answer)).toEqual([
      "Brandon Moreno", "Dan Henderson", "Randy Couture", "Dricus du Plessis",
      "Georges St-Pierre", "Chuck Liddell", "Khamzat Chimaev", "Francis Ngannou",
    ]);
    ufcRun14.forEach((question, index) => {
      expect(new Set(question.choices.map(choice => normalized(choice.text))).size).toBe(4);
      expect(question.explanation.length).toBeGreaterThan(100);
      if (index === 7) {
        expect(question.statSheet).toBeNull();
        expect(question.lifelineCompatibility).toMatchObject({ fiftyFifty: false, statSheet: false, doubleDip: false });
      } else {
        expect(question.statSheet).toBeTruthy();
        expect(normalized(question.statSheet!)).not.toContain(normalized(answer(question)));
      }
    });
    const nflRun14 = millionaireFutureEditorialDailyRun("nfl", 13);
    expect(nflRun14.map(answer)).toEqual([
      "Titans", "Seahawks", "Bears", "DeVonta Smith",
      "Marcus Mariota", "Brandon Aiyuk", "Riley Patterson", "Nick Collins",
    ]);
    nflRun14.forEach((question, index) => {
      expect(new Set(question.choices.map(choice => normalized(choice.text))).size).toBe(4);
      expect(question.explanation.length).toBeGreaterThan(100);
      if (index === 7) {
        expect(question.statSheet).toBeNull();
        expect(question.lifelineCompatibility).toMatchObject({ fiftyFifty: false, statSheet: false, doubleDip: false });
      } else {
        expect(question.statSheet).toBeTruthy();
        expect(normalized(question.statSheet!)).not.toContain(normalized(answer(question)));
      }
    });
    // Keep known cross-game overlaps out of the actual preview board.
    expect(answer(millionaireFutureEditorialDailyRun("cfb", 14)[3]!)).toBe("Diego Pavia");
    expect(millionaireFutureEditorialDailyRun("cfb", 14)[3]!.prompt).not.toContain("Who won the 2025 Heisman");
    expect(answer(millionaireFutureEditorialDailyRun("cfb", 14)[6]!)).toBe("Donovan Edwards");
    expect(millionaireFutureEditorialDailyRun("cfb", 14)[6]!.prompt).not.toContain("Kalen DeBoer");
    expect(millionaireFutureEditorialDailyRun("cfb", 14)[6]!.choices.map(choice => choice.text)).toEqual(["Donovan Edwards", "Blake Corum", "Kalel Mullings", "Benjamin Hall"]);
    expect(MILLIONAIRE_FUTURE_Q8_REWRITES["nfl:1:7"]!.prompt).toContain("Super Bowl XI");
    expect(MILLIONAIRE_FUTURE_Q8_REWRITES["nfl:1:7"]!.prompt).not.toContain("Tracy Porter");
    const finalCorrections = [
      ["nfl:0:7", "Cooper DeJean"],
      ["nfl:1:7", "Willie Brown"],
      ["nfl:2:7", "Sam Hubbard"],
      ["nfl:9:7", "Noah Brown"],
      ["cfb:4:7", "Matthew Golden"],
      ["cfb:5:7", "Rod Moore"],
      ["cfb:9:7", "Javon Bullard"],
      ["ufc:2:7", "Dustin Poirier"],
      ["ufc:5:7", "Tom Aspinall"],
      ["ufc:0:7", "Francis Ngannou"],
      ["ufc:4:7", "Lyoto Machida"],
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
    for (const [league, runIndex, avoided, newAnchor] of [
      ["cfb", 9, "Kelee Ringo", "Javon Bullard"],
      ["ufc", 0, "Gerard Gordeau", "Francis Ngannou"],
      ["ufc", 2, "Glover Teixeira", "Benoit Saint Denis"],
      ["ufc", 4, "Dan Henderson", "Rashad Evans"],
      ["ufc", 5, "Sergei Pavlovich", "Tom Aspinall"],
    ] as const) {
      // The legacy runtime seed stays unchanged; inspect the future-only override.
      const final = MILLIONAIRE_FUTURE_Q8_REWRITES[`${league}:${runIndex}:7`]!;
      expect(final).toBeDefined();
      expect(final.prompt).not.toContain(avoided);
      expect(final.prompt + " " + final.answer).toContain(newAnchor);
      expect(final.statSheet).toBeNull();
      expect(final.choices).toHaveLength(4);
      expect(new Set(final.choices.map(normalized)).size).toBe(4);
      expect(final.evidence.length).toBeGreaterThan(0);
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
        // October 25 UFC is a persisted historical board, not a future v6 preview.
        if (!rewrite || day < "2026-10-27") continue;
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

  it("uses the modern 2025 Orange Bowl interception for future CFB run 12 final only", () => {
    const final = millionaireFutureEditorialDailyRun("cfb", 11)[7]!;
    expect(answer(final)).toBe("Christian Gray");
    expect(final.prompt).toContain("January 2025 Orange Bowl");
    expect(final.explanation).toContain("41-yard field goal");
    expect(final.statSheet).toBeNull();
    expect(final.lifelineCompatibility).toMatchObject({
      fiftyFifty: false, statSheet: false, doubleDip: false,
    });
    expect(new Set(final.choices.map(option => normalized(option.text))).size).toBe(4);
  });

  it("keeps the recent Alabama–Georgia signature moment in future CFB run 13 finale", () => {
    const final = millionaireFutureEditorialDailyRun("cfb", 12)[7]!;
    expect(answer(final)).toBe("Ryan Williams");
    expect(final.prompt).toContain("September 2024");
    expect(final.explanation).toContain("41–34");
    expect(final.statSheet).toBeNull();
    expect(final.lifelineCompatibility).toMatchObject({
      fiftyFifty: false, statSheet: false, doubleDip: false,
    });
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
    expect(footballTheme.contentVersion).toBe(COWBOYS_EAGLES_MILLIONAIRE_REPLAY_VERSION);
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
        expect(official.contentVersion).toBe(day === "2026-10-26" && sport === "football"
          ? COWBOYS_EAGLES_MILLIONAIRE_REPLAY_VERSION : MILLIONAIRE_DAILY_CONTENT_VERSION);
        expect(official.publicSetup.run_number).toBeLessThanOrEqual(10);
        expect((official.privateSetupEvidence.run as MillionaireRuntimeQuestion[])
          .every(question => !question.id.includes("editorial-v6")
            && !/millionaire-(nfl|cfb|ufc)-run-1[1-5]-q/.test(question.id))).toBe(true);
      }
    }
    expect(scheduled).toBe(40);
  });

  it("replaces twelve inverse or identical active UFC Bar Trivia facts only in future preview", () => {
    const updated: readonly [string, string][] = [
      ["ufc:0:2", "Who submitted Renato Moic"],
      ["ufc:0:3", "Who stopped Curtis Blaydes"],
      ["ufc:0:4", "Who became the first UFC heavyweight"],
      ["ufc:0:5", "Who defended the UFC bant"],
      ["ufc:1:3", "Who stopped Jamahal Hill "],
      ["ufc:1:4", "Who submitted Justin Gaet"],
      ["ufc:1:5", "Who knocked out Beneil Dariush"],
      ["ufc:2:0", "Who knocked out Jamahal H"],
      ["ufc:2:3", "Who submitted Valentina S"],
      ["ufc:2:4", "Who stopped Jessica Andrade"],
      ["ufc:3:0", "Who knocked out Robert Whittaker"],
      ["ufc:3:3", "Who submitted Holly Holm "]
    ];
    expect(updated).toHaveLength(12);
    for (const [key, promptLead] of updated) {
      const revision = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(revision.id).toMatch(/^millionaire-ufc-future-/);
      expect(revision.prompt).toContain(promptLead);
      expect(revision.choices).toHaveLength(4);
      expect(new Set(revision.choices.map(normalized)).size).toBe(4);
      expect(revision.choices.filter(choice => choice === revision.answer)).toHaveLength(1);
      expect(revision.statSheet?.toLowerCase()).not.toContain(revision.answer.toLowerCase());
      expect(revision.explanation.length).toBeGreaterThan(85);
      expect(revision.explanation).toContain(revision.answer);
      expect(revision.evidence[0]?.url).toMatch(/^https:\/\/www\.ufc\.com\//);
    }
    expect(millionaireDailyRun("ufc", 0)[2]!.prompt).toContain("Charles Oliveira");
  });

  it("preserves fifteen further sourced future-only UFC Bar Trivia collision repairs", () => {
    const expected: readonly [string, string][] = [
      ["ufc:3:4", "Jiří Procházka"],
      ["ufc:3:5", "Dricus du Plessis"],
      ["ufc:3:6", "Sean O’Malley"],
      ["ufc:4:0", "Merab Dvalishvili"],
      ["ufc:4:2", "Arman Tsarukyan"],
      ["ufc:4:3", "Valentina Shevchenko"],
      ["ufc:4:4", "Zhang Weili"],
      ["ufc:5:0", "Justin Gaethje"],
      ["ufc:5:2", "Deiveson Figueiredo"],
      ["ufc:5:3", "Kamaru Usman"],
      ["ufc:5:4", "Diego Lopes"],
      ["ufc:9:0", "Rose Namajunas"],
      ["ufc:9:1", "Amanda Nunes"],
      ["ufc:9:2", "Brandon Moreno"],
      ["ufc:9:5", "Valentina Shevchenko"],
    ];
    expect(expected).toHaveLength(15);
    for (const [key, correct] of expected) {
      const revision = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(revision.id).toContain("future-rewrite");
      expect(revision.answer).toBe(correct);
      expect(revision.choices).toHaveLength(4);
      expect(new Set(revision.choices.map(normalized)).size).toBe(4);
      expect(revision.choices.filter(choice => choice === correct)).toHaveLength(1);
      expect(normalized(revision.statSheet ?? "")).not.toContain(normalized(correct));
      expect(revision.explanation).toContain(correct);
      expect(revision.explanation.length).toBeGreaterThan(80);
      expect(revision.evidence[0]?.url).toContain("ufc.com");
    }
    expect(millionaireDailyRun("ufc", 3)[4]!.prompt).toContain("Max Holloway");
    expect(millionaireDailyRun("ufc", 9)[0]!.prompt).toContain("women's champion");
  });

  it("retains twelve official-source NFL and CFB future-only collision fixes", () => {
    const cases: readonly [string, string, string][] = [
      ["nfl:1:4", "Steve McNair", "Which quarterback shared"],
      ["nfl:2:1", "C.J. Stroud", "Which Texans quar"],
      ["nfl:4:6", "Stephon Gilmore", "Which New England"],
      ["nfl:5:5", "Nick Bolton", "Which Chiefs line"],
      ["nfl:6:1", "Jayden Daniels", "Which Washington "],
      ["nfl:8:1", "Patrick Mahomes", "Who earned Super "],
      ["cfb:0:1", "Ohio State", "Which school won "],
      ["cfb:8:3", "Jim Harbaugh", "Which head coach "],
      ["cfb:3:5", "Notre Dame", "Which team defeat"],
      ["cfb:6:6", "Curt Cignetti", "Which coach guide"],
      ["cfb:8:1", "Penn State", "Which school beat"],
      ["cfb:8:2", "Riley Leonard", "Which Notre Dame "],
    ];
    expect(cases).toHaveLength(12);
    for (const [key, answerText, promptStart] of cases) {
      const q = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(q.prompt).toContain(promptStart);
      expect(q.answer).toBe(answerText);
      expect(q.choices[0]).toBe(answerText);
      expect(new Set(q.choices.map(normalized)).size).toBe(4);
      expect(normalized(q.statSheet ?? "")).not.toContain(normalized(answerText));
      expect(q.explanation).toContain(answerText);
      expect(q.evidence[0]?.url).toMatch(/^https:\/\//);
    }
    expect(millionaireDailyRun("nfl", 2)[1]!.prompt).toContain("Helmet Catch");
    expect(millionaireDailyRun("cfb", 0)[1]!.prompt).toContain("first College Football Playoff");
  });

  it("uses modern facts and the verified NFL run-14 ladder order", () => {
    const expected = [
      ["nfl", 13, 3, "DeVonta Smith"],
      ["nfl", 13, 5, "Brandon Aiyuk"],
      ["cfb", 14, 5, "Cam Skattebo"],
      ["ufc", 13, 3, "Dricus du Plessis"],
      ["ufc", 14, 6, "Alex Pereira"],
    ] as const;
    for (const [league, index, level, winner] of expected) {
      const question = millionaireFutureEditorialDailyRun(league, index)[level]!;
      expect(answer(question)).toBe(winner);
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices.map(choice => normalized(choice.text))).size).toBe(4);
      expect(question.explanation).toContain(winner);
      expect(normalized(question.statSheet ?? "")).not.toContain(normalized(winner));
    }
  });

  it("protects source-checked draft revisions against accidental reversion", () => {
    const sourceChecked = [
      ["cfb", 10, 0, "Miami"],
      ["nfl", 11, 4, "Troy Polamalu"],
      ["ufc", 10, 2, "Kamaru Usman"],
      ["ufc", 10, 4, "Carlos Condit"],
      ["ufc", 10, 6, "Alexandre Pantoja"],
      ["nfl", 10, 7, "Talanoa Hufanga"],
      ["ufc", 12, 0, "Yair Rodriguez"],
    ] as const;
    for (const [league, runIndex, level, expected] of sourceChecked) {
      const run = millionaireFutureEditorialDailyRun(league, runIndex);
      expect(answer(run[level]!)).toBe(expected);
      expect(run[level]!.statSheet ?? "").not.toContain(expected);
    }
    const heavyweights = millionaireFutureEditorialDailyRun("ufc", 10).filter(question =>
      /heavyweight/.test(question.type));
    expect(heavyweights.length).toBeLessThanOrEqual(2);
  });

  it("preserves four source-checked, future-only featured finals without restoring obscure predecessors", () => {
    const revisedFinals = [
      ["nfl", 11, "Jermaine Kearse", "January 2015 NFC Championship"],
      ["cfb", 13, "Jack Sawyer", "January 2025 Cotton Bowl"],
      ["cfb", 14, "Adonai Mitchell", "December 2022 Peach Bowl"],
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

  it("gives every future-only UFC legacy replacement an informative reveal and an intact 8-step ladder", () => {
    for (const index of [6, 7, 8]) {
      const run = millionaireFutureEditorialDailyRun("ufc", index);
      expect(run).toHaveLength(8);
      run.forEach((question, i) => {
        const correct = answer(question);
        expect(question.explanation, `UFC run ${index + 1} Q${i + 1}`).toContain(correct);
        expect(question.explanation.length).toBeGreaterThan(100);
        expect(new Set(question.choices.map(choice => normalized(choice.text))).size).toBe(4);
        expect(question.level).toBe(`Q${i + 1}`);
        if (i === 7) {
          expect(question.statSheet).toBeNull();
          expect(question.lifelineCompatibility).toMatchObject({ fiftyFifty: false, statSheet: false, doubleDip: false });
        } else {
          expect(question.statSheet).toBeTruthy();
          expect(normalized(question.statSheet!)).not.toContain(normalized(correct));
        }
      });
    }
    const openingUsman = millionaireFutureEditorialDailyRun("ufc", 7)[1]!;
    expect(answer(openingUsman)).toBe("Kamaru Usman");
    expect(openingUsman.prompt).toContain("UFC 235");
    const openingUfc250 = millionaireFutureEditorialDailyRun("ufc", 7)[3]!;
    expect(answer(openingUfc250)).toBe("Cody Garbrandt");
    expect(openingUfc250.prompt).toContain("UFC 250");
    expect(openingUfc250.prompt).not.toContain("Cain Velasquez");
    // Future-only NFL facts must not recreate active Average Fan's exact Super Bowl / records trivia.
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 11)[4]!)).toBe("Troy Polamalu");
    expect(millionaireFutureEditorialDailyRun("nfl", 11)[4]!.prompt).not.toContain("Kurt Warner");
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 14)[6]!)).toBe("Corey Webster");
    expect(millionaireFutureEditorialDailyRun("nfl", 14)[6]!.prompt).not.toContain("22.5");
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 14)[3]!)).toBe("Myles Garrett");
    expect(answer(millionaireFutureEditorialDailyRun("nfl", 14)[4]!)).toBe("Mike Alstott");
    expect(millionaireFutureEditorialDailyRun("nfl", 14)[4]!.prompt).not.toContain("Mile High Miracle");
    const dramaticFinal = millionaireFutureEditorialDailyRun("ufc", 7)[7]!;
    expect(answer(dramaticFinal)).toBe("Jack Della Maddalena");
    expect(dramaticFinal.prompt).toContain("UFC 315");
    expect(dramaticFinal.explanation).toContain("Belal Muhammad");
    // These were caught as duplicate facts across different candidate runs.
    expect(millionaireFutureEditorialDailyRun("ufc", 12)[5]!.prompt).not.toBe(dramaticFinal.prompt);
    expect(millionaireFutureEditorialDailyRun("ufc", 12)[5]!.prompt).toContain("Frankie Edgar");
    const lateUfcTitle = millionaireFutureEditorialDailyRun("ufc", 14)[6]!;
    expect(lateUfcTitle.prompt).toContain("UFC 320");
    expect(lateUfcTitle.prompt).not.toContain("Charles Oliveira");
    const volkov = millionaireFutureEditorialDailyRun("ufc", 7)[6]!;
    expect(answer(volkov)).toBe("Josh Emmett");
    expect(volkov.prompt).toContain("UFC 296");
    expect(volkov.prompt).not.toContain("Alexander Volkov");
  });


  it("uses a separate sourced late UFC comeback instead of replaying Grasso's UFC 285 fact", () => {
    const replacement = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:9:6"]!;
    expect(replacement.id).toContain("rozenstruik-overeem");
    expect(replacement.answer).toBe("Jairzinho Rozenstruik");
    expect(replacement.prompt).toContain("four seconds");
    expect(replacement.prompt).not.toContain("Shevchenko");
    expect(replacement.choices).toHaveLength(4);
    expect(new Set(replacement.choices.map(normalized)).size).toBe(4);
    expect(replacement.choices.filter(choice => choice === replacement.answer)).toHaveLength(1);
    expect(replacement.statSheet?.toLowerCase()).not.toContain("rozenstruik");
    expect(replacement.explanation).toContain("four rounds");
    expect(replacement.explanation).toContain(replacement.answer);
    expect(replacement.evidence[0]?.url).toMatch(/^https:\/\/www\.ufc\.com\//);
  });


  it("replaces an NFL Malcolm Butler duplicate with sourced A.J. Brown team history only in future preview", () => {
    const replacement = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:0:1"]!;
    expect(replacement.id).toContain("aj-brown");
    expect(replacement.answer).toBe("Titans");
    expect(replacement.prompt).toContain("2022 Draft");
    expect(replacement.prompt).not.toContain("Super Bowl XLIX");
    expect(replacement.choices).toEqual(["Titans", "Jets", "Vikings", "Chargers"]);
    expect(replacement.statSheet?.toLowerCase()).not.toContain("titans");
    expect(replacement.explanation).toContain("No. 18");
    expect(replacement.explanation).toContain("No. 101");
    expect(replacement.evidence).toHaveLength(2);
    expect(replacement.evidence[0]!.url).toContain("philadelphiaeagles.com");
    expect(millionaireDailyRun("nfl", 0)[1]!.prompt).toContain("Super Bowl XLIX");
  });


  it("separates the CFB 2003 split-title trivia from the 2015 Sugar Bowl winning run", () => {
    const replacement = MILLIONAIRE_FUTURE_TARGETED_REWRITES["cfb:3:6"]!;
    expect(replacement.id).toContain("elliott-85-yard");
    expect(replacement.answer).toBe("Ezekiel Elliott");
    expect(replacement.prompt).toContain("January 2015 Sugar Bowl");
    expect(replacement.prompt).not.toContain("2003");
    expect(replacement.choices).toEqual(["Ezekiel Elliott", "Carlos Hyde", "J.K. Dobbins", "Mike Weber"]);
    expect(replacement.statSheet).not.toContain("Elliott");
    expect(replacement.explanation).toContain("85-yard");
    expect(replacement.explanation).toContain("42–35");
    expect(replacement.evidence).toHaveLength(2);
    expect(replacement.evidence[0]!.url).toContain("collegefootballplayoff.com");
    expect(millionaireDailyRun("cfb", 3)[6]!.prompt).toContain("AP poll in 2003");
  });

  it("preserves six new sourced UFC preview-only answers that replace active Bar Trivia same-fact duplicates", () => {
    for (const [run, questionIndex, correct, marker] of [
      [7, 0, "Conor McGregor", "UFC 194"],
      [8, 0, "Amanda Nunes", "bantamweight and featherweight"],
      [10, 0, "Francis Ngannou", "UFC 270"],
      [0, 3, "Tom Aspinall", "UFC 304"],
      [0, 4, "Stipe Miocic", "UFC 220"],
      [3, 0, "Israel Adesanya", "UFC 243"],
    ] as const) {
      // New-run and replaced legacy questions are in the authored run; targeted
      // fixes to original legacy runs live in the future-only errata overlay.
      // The bare authored run never applies that runtime overlay.
      const overlay = MILLIONAIRE_FUTURE_TARGETED_REWRITES[`ufc:${run}:${questionIndex}`];
      const authored = overlay ? null : millionaireFutureEditorialDailyRun("ufc", run)[questionIndex]!;
      const choices = overlay?.choices ?? authored!.choices.map(choice => choice.text);
      const designatedAnswer = overlay?.answer ?? answer(authored!);
      const prompt = overlay?.prompt ?? authored!.prompt;
      const statSheet = overlay?.statSheet ?? authored?.statSheet ?? "";
      const explanation = overlay?.explanation ?? authored!.explanation;
      expect(designatedAnswer).toBe(correct);
      expect(prompt).toContain(marker);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map(normalized)).size).toBe(4);
      expect(normalized(statSheet)).not.toContain(normalized(correct));
      expect(explanation).toContain(correct);
      expect(explanation.length).toBeGreaterThan(100);
    }
  });

});

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
    const graham = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:3:4"]!;
    const jefferson = MILLIONAIRE_FUTURE_TARGETED_REWRITES["nfl:4:5"]!;
    expect(graham.answer).toBe("Brandon Graham");
    expect(graham.choices).toContain("Derek Barnett");
    expect(graham.prompt).toContain("Super Bowl LII");
    expect(graham.statSheet).not.toContain("Brandon Graham");
    expect(jefferson.answer).toBe("Geno Smith");
    expect(jefferson.prompt).toContain("2022");
    expect(jefferson.statSheet).not.toContain("Geno Smith");
    expect(millionaireDailyRun("nfl", 3)[4]!.prompt).toContain("wild-card");
    expect(millionaireDailyRun("nfl", 4)[5]!.prompt).toContain("kicker");
  });

  it("retains three future-only removals of active UFC Bar Trivia fact collisions", () => {
    const jones = MILLIONAIRE_FUTURE_TARGETED_REWRITES["ufc:1:0"]!;
    expect(jones.answer).toBe("Jon Jones");
    expect(jones.prompt).toContain("UFC 285");
    expect(jones.statSheet).not.toContain("Jon Jones");
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
      ["cfb", 14, 6, "Kalen DeBoer"],
      ["ufc", 13, 6, "Khamzat Chimaev"],
      ["ufc", 6, 7, "Ilia Topuria"],
      ["ufc", 12, 7, "Paddy Pimblett"],
      ["nfl", 12, 3, "Christian McCaffrey"],
      ["nfl", 12, 7, "Aaron Donald"],
      ["nfl", 13, 3, "Trevor Lawrence"],
      ["nfl", 13, 6, "Brandon Aiyuk"],
      ["cfb", 10, 3, "Kirby Smart"],
      ["cfb", 12, 6, "Luke Fickell"],
      ["cfb", 13, 2, "J.J. McCarthy"],
      ["cfb", 13, 3, "Trevor Etienne"],
      ["cfb", 13, 6, "Michael Crabtree"],
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
      ["cfb:5:7", "Rod Moore"],
      ["ufc:2:7", "Jiří Procházka"],
      ["ufc:5:7", "Tom Aspinall"],
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
      ["ufc:0:3", "Who upset Israel Adesanya"],
      ["ufc:0:4", "Who submitted Amanda Nune"],
      ["ufc:0:5", "Who defended the UFC bant"],
      ["ufc:1:3", "Who stopped Jamahal Hill "],
      ["ufc:1:4", "Who submitted Justin Gaet"],
      ["ufc:1:5", "Who knocked out Tony Ferg"],
      ["ufc:2:0", "Who knocked out Jamahal H"],
      ["ufc:2:3", "Who submitted Valentina S"],
      ["ufc:2:4", "Who knocked out Joanna Ję"],
      ["ufc:3:0", "Who scored the fifth-roun"],
      ["ufc:3:3", "Who submitted Holly Holm "]
    ];
    expect(updated).toHaveLength(12);
    for (const [key, promptLead] of updated) {
      const revision = MILLIONAIRE_FUTURE_TARGETED_REWRITES[key]!;
      expect(revision.id).toContain("future-rewrite");
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
      ["nfl:1:4", "Derrick Henry", "Which Tennessee r"],
      ["nfl:2:1", "Jalen Hurts", "Which Eagles quar"],
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

  it("uses modern facts instead of four older repetitive future questions", () => {
    const expected = [
      ["nfl", 13, 5, "DeVonta Smith"],
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
      expect(run[level]!.statSheet ?? "").not.toContain(expected);
    }
    const heavyweights = millionaireFutureEditorialDailyRun("ufc", 10).filter(question =>
      /heavyweight/.test(question.type));
    expect(heavyweights.length).toBeLessThanOrEqual(2);
  });

  it("preserves four source-checked, future-only featured finals without restoring obscure predecessors", () => {
    const revisedFinals = [
      ["nfl", 11, "Mecole Hardman", "Super Bowl LVIII"],
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

});

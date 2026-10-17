import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_BANK_TARGETS,
  AVERAGE_FAN_CONTENT_BANKS,
  averageFanQuestionFactKey,
  AVERAGE_FAN_FINAL_TARGETS,
  averageFanBankSummary,
  ufcCandidates,
} from "./averageFanContentBanks";
import { queryFootballSubjects } from "../back-room/footballSubjectRegistry";
import { getUfcFactualSubject, ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";
import { BAR_TRIVIA_CURRENT_EVENT_QUESTIONS } from "../play/barTriviaCurrentEvents";
import { BAR_TRIVIA_QUESTION_BANK } from "../play/barTriviaQuestionBank";
import { MILLIONAIRE_DAILY_RUN_COUNT, millionaireDailyRun } from "../play/millionaireDailyQuestionBank";
import { findDailyContentOverlaps, type DailyContentAuditEntry } from "../play/dailyContentQualityPolicy";
import {
  averageFanAnswersMatch,
  validateAverageFanQuestion,
  type AverageFanQuestion,
  type AverageFanSport,
} from "./averageFanEngine";

const sports: readonly Exclude<AverageFanSport, "mlb">[] = ["nfl", "cfb", "ufc"];

function normalizedHumanInput(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function singleCharacterTypo(question: AverageFanQuestion) {
  const base = normalizedHumanInput(question.answer).toLocaleLowerCase();
  if (base.length < 7 || /^\d+$/.test(base.replace(/\s+/g, ""))) return null;

  const blocked = new Set(
    [...question.aliases, ...(question.fanMisses ?? [])].map((value) => (
      normalizedHumanInput(value).toLocaleLowerCase()
    )),
  );
  for (let index = 1; index < base.length - 1; index += 1) {
    if (!/[a-z0-9]/.test(base[index]!)) continue;
    if (base[index - 1] === " " || base[index + 1] === " ") continue;
    const candidate = base.slice(0, index) + base.slice(index + 1);
    if (candidate.length >= 7 && !blocked.has(candidate)) return candidate;
  }
  return null;
}

function humanSurnameCandidate(value: string) {
  const tokens = value.trim().split(/\s+/).filter(Boolean);
  if (tokens.length < 2 || /\d/.test(value)) return null;
  const suffixes = new Set(["jr", "sr", "ii", "iii", "iv", "v"]);
  let index = tokens.length - 1;
  if (suffixes.has(normalizedHumanInput(tokens[index]!).toLocaleLowerCase()) && index >= 2) index -= 1;
  const candidate = tokens[index]!;
  return normalizedHumanInput(candidate).length >= 4 ? candidate : null;
}

function oneCharacterHumanTypo(value: string) {
  const normalized = normalizedHumanInput(value).toLocaleLowerCase();
  if (normalized.length < 7) return null;
  for (let index = 1; index < normalized.length - 1; index += 1) {
    if (!/[a-z0-9]/.test(normalized[index]!)) continue;
    const candidate = normalized.slice(0, index) + normalized.slice(index + 1);
    if (candidate.length >= 6) return candidate;
  }
  return null;
}

describe("Average Fan durable content banks", () => {
  it("credits historically correct Rams-era answers and keeps the misnamed UFC 16 undercard fact retired", () => {
    const rams = AVERAGE_FAN_CONTENT_BANKS.nfl.find((question) =>
      question.id.startsWith("average-fan:nfl:00-team:greatest-show:"));
    expect(rams).toBeDefined();
    expect(rams?.format).toBe("short-answer");
    for (const response of ["St. Louis Rams", "St Louis Rams", "Rams", "The Rams"]) {
      expect(averageFanAnswersMatch(rams!, response), response).toBe(true);
    }

    // Clark's UFC 16 opponent is spelled Josh Stuart on the official UFC card,
    // not Stewart. The fact remains withdrawn as undercard-name memorization.
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((question) =>
      question.id.startsWith("average-fan:ufc:authored-history:first-170:"))).toBe(false);
  });

  it("does not pad selected banks to satisfy the old inventory targets", () => {
    for (const sport of sports) {
      const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
      expect(bank.length, sport).toBeLessThanOrEqual(AVERAGE_FAN_BANK_TARGETS[sport]);
      expect(bank.filter((question) => question.protectedFinal).length)
        .toBeLessThanOrEqual(AVERAGE_FAN_FINAL_TARGETS[sport]);
    }
  });

  it("keeps every question inside the canonical PR1 schema with unique ids", () => {
    const globalIds = new Set<string>();
    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        expect(validateAverageFanQuestion(question), question.id).toEqual([]);
        expect(globalIds.has(question.id), question.id).toBe(false);
        globalIds.add(question.id);
      }
    }
    expect(globalIds.size).toBe(sports.reduce((total, sport) => total + AVERAGE_FAN_CONTENT_BANKS[sport].length, 0));
  });

  it("runs every banked short answer through tolerant human-input grading without accepting authored misses", () => {
    const validatedPerSport = new Map(sports.map((sport) => [sport, 0]));
    let typoCount = 0;

    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        if (question.format !== "short-answer") continue;
        validatedPerSport.set(sport, (validatedPerSport.get(sport) ?? 0) + 1);

        for (const accepted of [question.answer, ...question.aliases]) {
          expect(averageFanAnswersMatch(question, accepted), `${question.id}: exact ${accepted}`).toBe(true);
          expect(
            averageFanAnswersMatch(question, normalizedHumanInput(accepted)),
            `${question.id}: normalized ${accepted}`,
          ).toBe(true);
        }

        const typo = singleCharacterTypo(question);
        if (typo) {
          typoCount += 1;
          expect(averageFanAnswersMatch(question, typo), `${question.id}: typo ${typo}`).toBe(true);
        }

        for (const miss of question.fanMisses ?? []) {
          expect(averageFanAnswersMatch(question, miss), `${question.id}: authored miss ${miss}`).toBe(false);
        }
      }
    }

    // Audit every retained short answer and its typo variants. Fixed total
    // counts would penalize retiring unbounded or unfair free-text questions.
    for (const sport of sports) {
      expect(validatedPerSport.get(sport), sport).toBeGreaterThan(0);
    }
    expect(typoCount).toBeGreaterThan(0);
  });

  it("accepts realistic human short-answer variants across the full bank", () => {
    let surnameVariantCount = 0;
    let surnameTypoCount = 0;

    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        if (question.format !== "short-answer") continue;

        const surname = humanSurnameCandidate(question.answer);
        if (surname && question.aliases.some((alias) => (
          normalizedHumanInput(alias) === normalizedHumanInput(surname)
        ))) {
          surnameVariantCount += 1;
          expect(
            averageFanAnswersMatch(question, surname),
            `${question.id}: surname ${surname}`,
          ).toBe(true);

          const typo = oneCharacterHumanTypo(surname);
          if (typo) {
            surnameTypoCount += 1;
            expect(
              averageFanAnswersMatch(question, typo),
              `${question.id}: surname typo ${typo}`,
            ).toBe(true);
          }
        }
      }
    }

    // Keep surname-input coverage without enforcing an inventory quota as
    // some UFC identity questions move to answer-bounded recognition.
    expect(surnameVariantCount).toBeGreaterThan(0);
    expect(surnameTypoCount).toBeGreaterThan(0);
  });

  it("keeps the hot-route definition out of free-text grading", () => {
    const question = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
      (row) => row.id === "average-fan:nfl:00-xo:hot-route:choice",
    );
    expect(question).toBeTruthy();
    expect(question?.format).toBe("four-choice");
    expect(question?.choices).toContain("A quick answer built into a pass play against pressure");
  });

  it("preserves the historic Weidman surname-grading regression without republishing the Millionaire duplicate", () => {
    // The former published Average Fan fact is now retired from future rotations:
    // exercise the same accepted-answer mechanism against a non-published fixture.
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some(
      (row) => row.id === "average-fan:ufc:authored-history:silva-weidman:short",
    )).toBe(false);
    const source = ufcCandidates().find(
      (row) => row.id === "average-fan:ufc:authored-history:silva-weidman:short",
    );
    expect(source).toBeDefined();
    expect(source?.answer).toBe("Chris Weidman");
    if (!source) return;
    const historicalFixture = { ...source, aliases: ["Weidman"] };
    expect(averageFanAnswersMatch(historicalFixture, "weidman")).toBe(true);
    expect(averageFanAnswersMatch(historicalFixture, "weidmn")).toBe(true);
    expect(averageFanAnswersMatch(historicalFixture, "Chris")).toBe(false);
  });

  it("regrades the durable banks to the four playable grades", () => {
    const caps = {
      nfl: { 2: 40, 3: 40, 4: 40, 5: 85 },
      cfb: { 2: 40, 3: 40, 4: 40, 5: 85 },
      ufc: { 2: 80, 3: 80, 4: 80, 5: 170 },
    };
    for (const sport of sports) {
      const grades = averageFanBankSummary(sport).grades;
      for (const [grade, cap] of Object.entries(caps[sport])) {
        expect(Number(grades[grade]), `${sport} grade ${grade}`).toBeLessThanOrEqual(cap);
        expect(Number(grades[grade]), `${sport} grade ${grade}`).toBeGreaterThanOrEqual(2);
      }
    }

    for (const sport of sports) {
      const ordinary = AVERAGE_FAN_CONTENT_BANKS[sport].filter((question) => !question.protectedFinal);
      expect(ordinary.every((question) => question.grade >= 2 && question.grade <= 5), sport).toBe(true);
      const opening = ordinary.filter((question) => question.grade === 2);
      expect(opening.some((question) => question.contentType === "current-event"), sport).toBe(false);
      expect(opening.every((question) => question.difficultyNudge <= -1), sport).toBe(true);
    }
  });

  it("keeps every sport multi-subject rather than collapsing into identity trivia", () => {
    for (const sport of sports) {
      const summary = averageFanBankSummary(sport);
      const floor = Math.floor(summary.total * 0.08);
      for (const count of Object.values(summary.subjects)) {
        expect(Number(count)).toBeGreaterThanOrEqual(floor);
      }
    }
  });

  it("retains a reasonable format mix without filling banks with repeated facts", () => {
    for (const sport of sports) {
      const summary = averageFanBankSummary(sport);
      const shortShare = Number(summary.formats["short-answer"]) / summary.total;
      const choiceShare = Number(summary.formats["four-choice"]) / summary.total;
      const trueFalseShare = Number(summary.formats["true-false"]) / summary.total;

      // Don't force obscure multi-opponent UFC facts to be open-ended just
      // to reach a target short-answer percentage.
      expect(shortShare, sport).toBeGreaterThan(0);
      expect(shortShare).toBeLessThanOrEqual(0.7);
      expect(choiceShare).toBeGreaterThanOrEqual(0.18);
      expect(trueFalseShare).toBeGreaterThanOrEqual(0.05);
    }
  });


  it("does not repeat the same prompt inside a sport bank", () => {
    for (const sport of sports) {
      const seen = new Set<string>();
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        const prompt = question.prompt.trim().toLocaleLowerCase().replace(/\s+/g, " ");
        expect(seen.has(prompt), question.id).toBe(false);
        seen.add(prompt);
      }
    }
  });

  it("keeps the selected NFL bank fully authored and player-facing", () => {
    const ordinary = AVERAGE_FAN_CONTENT_BANKS.nfl.filter((question) => !question.protectedFinal);
    expect(ordinary.length).toBeLessThanOrEqual(205);
    const evergreen = ordinary.filter((question) => question.contentType === "evergreen");
    expect(evergreen.every((question) => question.id.startsWith("average-fan:nfl:00-"))).toBe(true);

    const registryFiller = [
      /^what position did /i,
      /^which college did .* enter the nfl from/i,
      /^name one nfl team .* played for/i,
      /^what overall pick was .* nfl draft/i,
      /^which player from .* was selected no\./i,
    ];
    for (const question of AVERAGE_FAN_CONTENT_BANKS.nfl) {
      const playerFacingCopy = (question.prompt + " " + question.explanation).toLocaleLowerCase();
      expect(playerFacingCopy, question.id).not.toMatch(/\b(?:canonical|registry|ledger|internal id|hq factual)\b/);
      for (const pattern of registryFiller) {
        expect(pattern.test(question.prompt), question.id).toBe(false);
      }
    }
  });

  it("keeps meaningful NFL format variety", () => {
    const ordinary = AVERAGE_FAN_CONTENT_BANKS.nfl.filter((question) => !question.protectedFinal);
    const counts = ordinary.reduce<Record<string, number>>((acc, question) => {
      acc[question.format] = (acc[question.format] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts["short-answer"]).toBeGreaterThan(50);
    expect(counts["four-choice"]).toBeGreaterThan(45);
    expect(counts["true-false"]).toBeGreaterThanOrEqual(20);
  });

  it("uses a distinct authored NFL Final set across football subjects", () => {
    const finals = AVERAGE_FAN_CONTENT_BANKS.nfl.filter((question) => question.protectedFinal);
    expect(finals.every((question) => question.id.startsWith("average-fan:nfl:final-authored:"))).toBe(true);
    expect(
      finals.reduce<Record<string, number>>((counts, question) => {
        counts[question.subject] = (counts[question.subject] ?? 0) + 1;
        return counts;
      }, {}),
    ).toEqual({
      Players: 3,
      Teams: 1,
      "NFL History": 3,
      "X’s & O’s": 3,
    });
  });

  it("keeps Finals challenging without narrow draft-slot memorization or obvious team reveals", () => {
    for (const sport of ["nfl", "cfb"] as const) {
      const finals = AVERAGE_FAN_CONTENT_BANKS[sport].filter((question) => question.protectedFinal);
      expect(finals.length, sport).toBeGreaterThanOrEqual(8);
      expect(finals.some((question) => /^average-fan:(nfl|cfb):final:[^:]+:draft$/.test(question.id)), sport).toBe(false);
      expect(finals.every((question) => question.grade === 5), sport).toBe(true);
      expect(finals.every((question) => !/\\bno\\. \\d+ overall in the \\d{4} nfl draft/i.test(question.prompt)), sport).toBe(true);
    }
    for (const id of ["bucs-home", "bears-46", "ravens-two-qbs"]) {
      const legacyFinal = `average-fan:nfl:final-authored:${id}`;
      expect(AVERAGE_FAN_CONTENT_BANKS.nfl.some((question) => question.id === legacyFinal)).toBe(false);
      const regraded = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
        (question) => question.id === `average-fan:nfl:00-final-regraded:${id}`,
      );
      if (regraded) {
        expect(regraded.protectedFinal, id).toBe(false);
        expect(regraded.grade, id).toBe(4);
      }
    }
  });

  it("offers credible choices for name-heavy NFL Finals and record-count UFC Finals", () => {
    for (const id of ["jacoby-jones", "stallworth-73", "harrison-100", "mills"]) {
      const final = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
        (question) => question.id === `average-fan:nfl:final-authored:${id}`,
      );
      expect(final, id).toBeTruthy();
      expect(final?.format, id).toBe("four-choice");
      expect(final?.choices, id).toHaveLength(4);
      expect(final?.choices?.filter((choice) => choice === final.answer), id).toHaveLength(1);
    }
    const stallworth = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
      (question) => question.id === "average-fan:nfl:final-authored:stallworth-73",
    );
    expect(stallworth?.choices).toContain("Theo Bell");
    expect(stallworth?.choices).not.toContain("Franco Harris");

    const demetrious = AVERAGE_FAN_CONTENT_BANKS.ufc.find(
      (question) => question.id === "average-fan:ufc:final:authored:final-mighty-mouse-defenses",
    );
    if (demetrious) {
      expect(demetrious.format).toBe("four-choice");
      expect(demetrious.choices).toEqual(expect.arrayContaining(["11", "9", "10", "12"]));
    }
  });


  it("keeps independently reviewed CFB authored Finals on same-position, same-season alternatives", () => {
    const expected = [
      {
        id: "02-tradition-prayer",
        answer: "Ricardo Louis",
        wrong: ["Sammie Coates", "Quan Bray", "Trovon Reed"],
      },
      {
        id: "03-tradition-bluegrass",
        answer: "Devery Henderson",
        wrong: ["Michael Clayton", "Skyler Green", "Jerel Myers"],
      },
      {
        id: "02-history-watts-jackson",
        answer: "Jalen Watts-Jackson",
        wrong: ["Darian Hicks", "Montae Nicholson", "Arjen Colquhoun"],
      },
    ] as const;
    for (const row of expected) {
      const id = `average-fan:cfb:authored:cfb-final-${row.id}`;
      const question = AVERAGE_FAN_CONTENT_BANKS.cfb.find((item) => item.id === id);
      expect(question, id).toBeTruthy();
      expect(question?.protectedFinal, id).toBe(true);
      expect(question?.answer, id).toBe(row.answer);
      expect(question?.format, id).toBe("four-choice");
      expect(new Set(question?.choices).size, id).toBe(4);
      expect(question?.choices, id).toEqual(expect.arrayContaining([row.answer, ...row.wrong]));
      expect(question?.choices?.filter((choice) => choice === row.answer), id).toHaveLength(1);
    }
    const expectedRetired = [
      "00-program-tennessee-bcs",
      "02-program-four-seed",
    ];
    for (const id of expectedRetired) {
      expect(AVERAGE_FAN_CONTENT_BANKS.cfb.some((question) =>
        question.id === `average-fan:cfb:authored:cfb-final-${id}`
      )).toBe(false);
    }
  });

  it("keeps CFB conference choices to exactly one program from the requested conference", () => {
    const programs = queryFootballSubjects({ league: "CFB", kind: "program" });
    const conferenceByName = new Map(programs.map((program) => [program.name, program.conference]));
    for (const question of AVERAGE_FAN_CONTENT_BANKS.cfb) {
      if (!question.id.endsWith(":conference-program") || !question.choices) continue;
      const answerConference = conferenceByName.get(question.answer);
      expect(answerConference, question.id).toBeTruthy();
      const matchingChoices = question.choices.filter(
        (choice) => conferenceByName.get(choice) === answerConference,
      );
      expect(matchingChoices, question.id).toEqual([question.answer]);
    }
  });


  it("does not make every CFB Heisman true-false statement automatically true", () => {
    const heismanQuestions = AVERAGE_FAN_CONTENT_BANKS.cfb.filter(
      (question) => question.id.endsWith(":heisman"),
    );
    const answers = new Set(heismanQuestions.map((question) => question.answer));
    expect(answers.has("True")).toBe(true);
    expect(answers.has("False")).toBe(true);
  });


  it("keeps unordered CFB rivalry pairs answer-bounded and distinct from Bar Trivia", () => {
    const selected = AVERAGE_FAN_CONTENT_BANKS.cfb;
    const content = [
      ["iron-bowl", "Alabama and Auburn"],
      ["red-river", "Texas and Oklahoma"],
      ["cy-hawk", "Iowa and Iowa State"],
      ["bedlam", "Oklahoma and Oklahoma State"],
    ] as const;
    for (const [name, answer] of content) {
      const idPrefix = `average-fan:cfb:tradition:${name}:`;
      const question = selected.find((q) => q.id.startsWith(idPrefix));
      expect(question, idPrefix).toBeDefined();
      expect(question?.id, idPrefix).toBe(`${idPrefix}choice`);
      expect(question?.format, idPrefix).toBe("four-choice");
      expect(question?.choices, idPrefix).toHaveLength(4);
      expect(question?.choices?.filter((choice) => choice === answer), idPrefix).toHaveLength(1);
      expect(new Set(question?.choices).size, idPrefix).toBe(4);
    }

    // This legacy template supplies its own answer in the name Army–Navy.
    expect(selected.some((q) =>
      q.id.startsWith("average-fan:cfb:tradition:army-navy:"),
    )).toBe(false);

    const bar = BAR_TRIVIA_QUESTION_BANK.find((q) =>
      q.id === "cfb-r3-little-brown-jug",
    );
    expect(bar?.answer).toBe("Minnesota");
    expect(bar?.prompt).toMatch(/Little Brown Jug.*Michigan/);
    expect(selected.some((q) =>
      q.id.startsWith("average-fan:cfb:authored:00-g5:little-brown-jug:"),
    )).toBe(false);

    const axe = selected.find((q) =>
      q.id.startsWith("average-fan:cfb:tradition:stanford-axe:"),
    );
    if (axe) {
      expect(axe.prompt).toMatch(/Stanford and California/);
      expect(axe.answer).toBe("Stanford Axe");
      expect(axe.grade).toBe(4);
      expect(axe.format).toBe("four-choice");
    }
  });

  it("keeps rivalry-trophy name recall out of short answer", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.cfb) {
      if (!/play for which (?:rivalry )?trophy/i.test(question.prompt)) continue;
      expect(question.format, question.id).toBe("four-choice");
    }
  });


  it("deduplicates UFC dated bouts across opponent, finish, and title question generators", () => {
    const source = ufcCandidates();
    const normalized = (name: string) => name.replace(/[Łł]/g, "l")
      .normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

    // The pinned UFCStats expansion records include these known dated fights.
    // The generator may choose a *more recognizable* fight after editorial
    // updates; the same event must nonetheless produce one shared fact key
    // irrespective of which template or fighter names it.
    const repeated = [
      ["jorge-masvidal", "2016-07-30", "Ross Pearson"],
      ["diego-lopes", "2025-09-13", "Jean Silva"],
      ["urijah-faber", "2013-02-23", "Ivan Menjivar"],
      ["kimbo-slice", "2009-12-05", "Houston Alexander"],
    ] as const;
    for (const [slug, date, opponent] of repeated) {
      const fighterId = `ufc:${slug}`;
      const fighter = getUfcFactualSubject(fighterId);
      expect(fighter, fighterId).toBeTruthy();
      const bout = fighter!.fights.find((fight) =>
        fight.date === date && normalized(fight.opponent) === normalized(opponent));
      expect(bout, fighterId + " sourced fight").toBeDefined();
      const dateText = new Date(date + "T12:00:00Z").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
      });
      // A historical recorded bout need not survive the post-audit
      // recognizability selector to retain a stable cross-template fact key.
      const base = source[0];
      expect(base, fighterId).toBeDefined();
      const opponentQuestion = {
        ...base!,
        id: `average-fan:ufc:g3:${fighterId}:opponent`,
        prompt: `Which fighter did ${fighter!.name} face in the UFC on ${dateText}?`,
        answer: opponent,
      };
      const finishQuestion = {
        ...base!,
        id: `average-fan:ufc:g4:${fighterId}:method-win`,
        prompt: `Which fighter did ${fighter!.name} defeat by ${bout!.methodCategory} in the UFC on ${dateText}?`,
        answer: opponent,
      };
      expect(averageFanQuestionFactKey(opponentQuestion), fighterId)
        .toBe(averageFanQuestionFactKey(finishQuestion));
      expect(averageFanQuestionFactKey(opponentQuestion), fighterId)
        .toMatch(/^ufc:bout:/);
    }

    const candidate = source.find((q) =>
      q.id === "average-fan:ufc:g3:ufc:jorge-masvidal:opponent",
    )!;
    const forward = {
      ...candidate,
      prompt: "Which of these fighters did Jorge Masvidal defeat in the UFC on November 2, 2019?",
      answer: "Nate Diaz",
    };
    const reverse = {
      ...candidate,
      id: "average-fan:ufc:g3:ufc:nate-diaz:opponent",
      prompt: "Which of these fighters did Nate Diaz face in the UFC on November 2, 2019?",
      answer: "Jorge Masvidal",
    };
    expect(averageFanQuestionFactKey(forward)).toBe(averageFanQuestionFactKey(reverse));

    const deduped = new Set<string>();
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      const key = averageFanQuestionFactKey(question);
      if (!key) continue;
      expect(deduped.has(key), `${question.id}: duplicate ${key}`).toBe(false);
      deduped.add(key);
    }
  });

  it("scopes every selected UFC grade-three fighter-opponent question to a single sourced bout", () => {
    const generated = AVERAGE_FAN_CONTENT_BANKS.ufc.filter((question) =>
      /^average-fan:ufc:g3:ufc:[^:]+:opponent$/.test(question.id),
    );
    expect(generated.length).toBeGreaterThan(10);
    for (const question of generated) {
      const match = /^average-fan:ufc:g3:(ufc:[^:]+):opponent$/.exec(question.id)!;
      const fighter = getUfcFactualSubject(match[1]!);
      expect(fighter, question.id).toBeTruthy();
      const dateText = /\bon ([A-Za-z]+ \d{1,2}, \d{4})\?$/.exec(question.prompt)?.[1];
      expect(dateText, question.id).toBeTruthy();
      const matchingFights = fighter!.fights.filter((fight) =>
        new Date(`${fight.date}T12:00:00Z`).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
        }) === dateText,
      );
      expect(matchingFights, question.id).toHaveLength(1);
      expect(matchingFights[0]!.opponent, question.id).toBe(question.answer);
      if (question.prompt.includes("defeat in the UFC")) {
        expect(matchingFights[0]!.result, question.id).toBe("win");
      }
      expect(question.format, question.id).toBe("four-choice");
      expect(question.choices, question.id).toHaveLength(4);
    }
  });

  it("never uses another valid UFC opponent as a wrong opponent choice", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      const match = /^average-fan:ufc:g3:(.+):opponent$/.exec(question.id);
      if (!match || !question.choices) continue;
      const fighter = getUfcFactualSubject(match[1]!);
      expect(fighter, question.id).toBeTruthy();
      if (!fighter) continue;
      // Some recognized opponents were losses: "faced" is correct for those
      // fights, while "defeated" must only use wins. Every eligible opponent
      // is excluded from the three wrong choices in its relevant set.
      const wins = fighter.fights.filter((fight) => fight.result === "win");
      const validOpponents = new Set([
        ...(wins.length ? wins : fighter.fights).map((fight) => fight.opponent),
        question.answer,
      ]);
      const dateText = /\bon ([A-Za-z]+ \d{1,2}, \d{4})\?$/.exec(question.prompt)?.[1];
      expect(dateText, question.id).toBeTruthy();
      const sourcedAnswer = fighter.fights.find((fight) =>
        fight.opponent === question.answer &&
        new Date(fight.date + "T12:00:00Z").toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
        }) === dateText);
      expect(sourcedAnswer, question.id + " exact date+opponent").toBeDefined();
      // Brandon Moreno fought Deiveson Figueiredo multiple times, including
      // a draw and a win. Only the specifically dated fight determines outcome.
      if (question.prompt.includes(" defeat in the UFC")) {
        expect(sourcedAnswer?.result, question.id).toBe("win");
      }
      const validChoices = question.choices.filter((choice) => validOpponents.has(choice));
      expect(validChoices, question.id).toEqual([question.answer]);
    }
  });


  it("regrades basic UFC rear body lock recognition after inspecting the published October 2 board", () => {
    const source = ufcCandidates().find((question) =>
      question.id === "average-fan:ufc:iq:rear-body-lock:choice",
    );
    expect(source).toBeDefined();
    expect(source?.grade).toBe(3);
    expect(source?.format).toBe("four-choice");
    expect(source?.answer).toBe("Rear body lock");
    expect(source?.choices).toHaveLength(4);
    const future = AVERAGE_FAN_CONTENT_BANKS.ufc.find((question) => question.id === source!.id);
    expect(future).toBeDefined();
    expect(future?.grade).toBe(4);
    // Published October 2 Grade 5 question stays immutable in the Daily store.
  });

  it("keeps fundamental UFC grappling vocabulary out of protected-difficulty tiers and grades synonyms fairly", () => {
    const expected: Record<string, number> = {
      "half-guard": 4, "body-triangle": 5, "hip-escape": 4,
      "frame": 4, "pummeling": 5, "cage-cutting": 4,
    };
    for (const [id, maxGrade] of Object.entries(expected)) {
      const question = AVERAGE_FAN_CONTENT_BANKS.ufc.find((q) =>
        q.id.startsWith(`average-fan:ufc:iq:${id}:`),
      );
      if (!question) continue; // No inventory quota; a vetted row may be unselected.
      expect(question.grade, question.id).toBeLessThanOrEqual(maxGrade);
      if (id === "pummeling") {
        expect(question.prompt, question.id).toMatch(/swims the arms inside/);
        expect(question.choices, question.id).not.toContain("Hand fighting");
      }
      if (id === "hip-escape" && question.format === "short-answer") {
        expect(averageFanAnswersMatch(question, "Shrimping"), question.id).toBe(true);
        expect(averageFanAnswersMatch(question, "Shrimp"), question.id).toBe(true);
      }
      if (id === "frame" && question.format === "short-answer") {
        expect(averageFanAnswersMatch(question, "Framing"), question.id).toBe(true);
      }
    }
  });

  it("keeps UFC division choices to real standard UFC weight classes", () => {
    const allowed = new Set([
      "Flyweight", "Bantamweight", "Featherweight", "Lightweight",
      "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight",
      "Women's Strawweight", "Women's Flyweight", "Women's Bantamweight", "Women's Featherweight",
    ]);
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      if (!/^average-fan:ufc:g1:.*:division$/.test(question.id)) continue;
      expect(question.format, question.id).toBe("four-choice");
      expect(question.choices?.every((choice) => allowed.has(choice)), question.id).toBe(true);
    }
  });

  it("keeps single-leg takedown out of fourth grade", () => {
    const question = AVERAGE_FAN_CONTENT_BANKS.ufc.find(
      (row) => row.id === "average-fan:ufc:iq:single-leg:short"
        || row.id === "average-fan:ufc:iq:single-leg:choice",
    );
    expect(question, "single-leg").toBeTruthy();
    expect(question?.grade).toBe(3);
  });

  it("retires an inverted UFC 217 Rose-Joanna fact already asked by Millionaire", () => {
    const millionaireQuestions = Array.from({ length: MILLIONAIRE_DAILY_RUN_COUNT }, (_, index) =>
      millionaireDailyRun("ufc", index),
    ).flat();
    expect(millionaireQuestions.some((question) =>
      /Rose Namajunas defeat at UFC 217/i.test(question.prompt)
      && question.choices.find((choice) => choice.id === question.correctChoiceId)?.text === "Joanna Jedrzejczyk",
    )).toBe(true);
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((question) =>
      question.id === "average-fan:ufc:final:authored:final-ufc217-rose",
    )).toBe(false);
  });

  it("regrades the familiar UFC 217 Garbrandt result out of protected Finals", () => {
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((question) =>
      question.id === "average-fan:ufc:final:authored:final-ufc217-tj",
    )).toBe(false);
    const ordinary = AVERAGE_FAN_CONTENT_BANKS.ufc.find((question) =>
      question.id === "average-fan:ufc:authored-history:ufc217-tj:short",
    );
    if (ordinary) {
      expect(ordinary.protectedFinal).toBe(false);
      expect(ordinary.grade).toBe(4);
      expect(ordinary.answer).toBe("Cody Garbrandt");
    }
  });


  it("audits specialist UFC Octagon IQ terms with exact source-level choices and safe retirements", () => {
    const source = ufcCandidates();
    const reviewed = [
      ["underhook", "Underhook", ["Overhook", "Collar tie", "Body lock"]],
      ["whizzer", "Whizzer", ["Underhook", "Body lock", "Arm drag"]],
      ["level-change", "Level change", ["Switch step", "Hip escape", "Sprawl"]],
      ["back-hooks", "Hooks", ["Frames", "Posts", "Body triangle"]],
    ] as const;
    for (const [id, answer, wrong] of reviewed) {
      const prefix = `average-fan:ufc:iq:${id}:`;
      expect(source.some((q) => q.id === `${prefix}short`), id).toBe(false);
      const question = source.find((q) => q.id === `${prefix}choice`);
      expect(question, id).toBeDefined();
      expect(question?.format, id).toBe("four-choice");
      expect(question?.choices, id).toHaveLength(4);
      expect(new Set(question?.choices).size, id).toBe(4);
      expect(question?.choices?.filter((choice) => choice === answer), id).toHaveLength(1);
      expect(question?.choices, id).toEqual(expect.arrayContaining([answer, ...wrong]));
    }

    for (const id of ["guillotine", "orthodox", "calf-kick"]) {
      const prefix = `average-fan:ufc:iq:${id}:`;
      expect(source.some((q) => q.id.startsWith(prefix)), id).toBe(true);
      expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((q) => q.id.startsWith(prefix)), id).toBe(false);
    }

    const teep = source.find((q) => q.id === "average-fan:ufc:iq:teep:short");
    expect(teep).toBeDefined();
    expect(teep?.answer).toBe("Teep");
    for (const accepted of ["Teep", "Push kick", "Front push kick"]) {
      expect(averageFanAnswersMatch(teep!, accepted), accepted).toBe(true);
    }
    expect(averageFanAnswersMatch(teep!, "Spinning backfist")).toBe(false);
    expect(averageFanAnswersMatch(teep!, "Overhand")).toBe(false);

    const event = source.find((q) => q.id.startsWith("average-fan:ufc:authored-history:usman-masvidal:"));
    expect(event).toBeDefined();
    expect(event?.answer).toBe("Jorge Masvidal");
    expect(event?.prompt).toMatch(/Usman.*UFC 261.*2021/);
    expect(event?.explanation).toMatch(/Masvidal.*UFC 261/);
  });

  it("makes four reviewed specialist UFC history questions multiple-choice without changing their facts", () => {
    const checked = [
      ["ufc3-winner", "Steve Jennum", 4],
      ["ufc6-winner", "Oleg Taktarov", 4],
      ["daley-koscheck", "Paul Daley", 5],
      ["first-125", "Ian McCall", 4],
    ] as const;
    const sourceCandidates = ufcCandidates();
    for (const [id, answer, grade] of checked) {
      const prefix = `average-fan:ufc:authored-history:${id}:`;
      expect(sourceCandidates.some((q) => q.id === `${prefix}short`), id).toBe(false);
      const question = sourceCandidates.find((q) => q.id === `${prefix}choice`);
      expect(question, id).toBeDefined();
      expect(question?.grade, id).toBe(grade);
      expect(question?.format, id).toBe("four-choice");
      expect(question?.choices, id).toHaveLength(4);
      expect(question?.choices?.filter((choice) => choice === answer), id).toHaveLength(1);
    }
  });

  it("retires the Silva-Weidman UFC 162 answer already used in Millionaire", () => {
    const millionaire = Array.from({ length: MILLIONAIRE_DAILY_RUN_COUNT }, (_, index) =>
      millionaireDailyRun("ufc", index),
    ).flat();
    const collision = millionaire.find((q) =>
      q.prompt === "Who handed Anderson Silva his first UFC loss?",
    );
    expect(collision?.choices.find((choice) => choice.id === collision.correctChoiceId)?.text)
      .toBe("Chris Weidman");
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((q) =>
      q.id.startsWith("average-fan:ufc:authored-history:silva-weidman:"),
    )).toBe(false);
  });

  it("removes UFC 194 and UFC 193 fact inversions already published in Millionaire", () => {
    const millionaire = Array.from({ length: MILLIONAIRE_DAILY_RUN_COUNT }, (_, index) =>
      millionaireDailyRun("ufc", index),
    ).flat();
    const correctText = (prompt: RegExp) => {
      const q = millionaire.find((question) => prompt.test(question.prompt));
      return q?.choices.find((choice) => choice.id === q.correctChoiceId)?.text;
    };
    expect(correctText(/Who knocked out Jose Aldo in 13 seconds/)).toBe("Conor McGregor");
    expect(correctText(/Who handed Ronda Rousey her first professional loss/)).toBe("Holly Holm");
    for (const id of ["aldo-13", "holm-rousey"]) {
      expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((question) =>
        question.id.startsWith(`average-fan:ufc:authored-history:${id}:`),
      ), id).toBe(false);
    }
  });

  it("replaces exact final-second memorization with the recognizable UFC 300 opponent", () => {
    const authored = ufcCandidates();
    expect(authored.some((question) =>
      question.id.includes("holloway-gaethje-time"),
    )).toBe(false);
    const revised = authored.find((question) =>
      question.id.includes("holloway-gaethje-last-second"),
    );
    expect(revised).toBeDefined();
    if (revised) {
      expect(revised.answer).toBe("Justin Gaethje");
      expect(revised.prompt).toMatch(/Max Holloway.*one second left.*UFC 300/);
      expect(revised.prompt).not.toMatch(/how much time/i);
      expect(revised.fanMisses).not.toContain(revised.answer);
    }
  });

  it("does not use dated UFC title-fight identity riddles as hard-question filler", () => {
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((question) => question.id.endsWith(":title-identity")))
      .toBe(false);
  });

  it("scopes generated college position true/false facts to the primary college position", () => {
    const positionFacts = AVERAGE_FAN_CONTENT_BANKS.cfb.filter((question) =>
      /^average-fan:cfb:g2:.+:position-tf$/.test(question.id),
    );
    expect(positionFacts.length).toBeGreaterThan(0);
    for (const question of positionFacts) {
      expect(question.prompt, question.id).toMatch(/primary college football position was/);
      expect(question.explanation, question.id).toMatch(/primary college football position was/);
    }
    // Jeanty was a college RB but did play WR in high school: unscoped
    // "Ashton Jeanty played WR" was defensibly true despite a False key.
    const jeanty = positionFacts.find((question) => question.id.includes("ashton-jeanty"));
    if (jeanty) {
      expect(jeanty.prompt).not.toBe("Ashton Jeanty played WR.");
      expect(jeanty.prompt).toMatch(/primary college football position/);
    }
  });

  it("keeps generated UFC opening-grade fighter recall recognition-first", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      if (question.grade !== 2 || question.subject !== "Fighters") continue;
      const match = /^average-fan:ufc:g1:(.+):division$/.exec(question.id);
      if (!match) continue;
      expect(getUfcFactualSubject(match[1]!), question.id).toBeTruthy();
      expect(question.format, question.id).toBe("four-choice");
      expect(question.difficultyNudge, question.id).toBeLessThanOrEqual(-1);
    }
  });

    it("keeps the UFC bank on canonical UFC subjects and authored landmark coverage in rotation", () => {
    const bank = AVERAGE_FAN_CONTENT_BANKS.ufc;
    const validSubjects = new Set(["Fighters", "Fights", "Championships", "Octagon IQ"]);
    for (const question of bank) {
      expect(validSubjects.has(question.subject), question.id).toBe(true);
    }

    const authored = bank.filter((question) => question.id.includes(":authored-history:"));
    expect(authored.length).toBeGreaterThan(0);
    // Duplicated authored title-event facts now live in Bar Trivia; generated
    // ledger-backed title bouts preserve Average Fan championship coverage.
    expect(bank.some((question) => question.subject === "Championships")).toBe(true);
    expect(bank.some((question) => question.subject === "Fights")).toBe(true);
  });

  it("does not repeat the Bar Trivia five-second Masvidal knockout as an inverted Average Fan Final", () => {
    const barFact = BAR_TRIVIA_QUESTION_BANK.find((row) => row.id === "ufc-r3-fastest-ko");
    expect(barFact?.answer).toBe("Jorge Masvidal");
    expect(barFact?.prompt).toMatch(/five-second finish of Ben Askren/i);
    expect(AVERAGE_FAN_CONTENT_BANKS.ufc.some((question) =>
      question.id === "average-fan:ufc:final:authored:final-masvidal-five",
    )).toBe(false);
    expect(AVERAGE_FAN_BANK_TARGETS.ufc).toBe(439);
    expect(AVERAGE_FAN_FINAL_TARGETS.ufc).toBe(29);
  });

  it("retire CFB ordinary facts already protected as authored Finals", () => {
    const retired = [
      "old-brass-spittoon",
      "illibuck",
      "watts-jackson-2015",
    ];
    const bank = AVERAGE_FAN_CONTENT_BANKS.cfb;
    for (const fact of retired) {
      expect(
        bank.filter((question) => question.id.startsWith(`average-fan:cfb:authored:00-g5:${fact}:`)),
        fact,
      ).toEqual([]);
    }
    // Do not backfill three duplicates with unaudited hard questions.
    expect(AVERAGE_FAN_BANK_TARGETS.cfb).toBe(158);
    expect(bank.filter((question) => question.grade === 5 && !question.protectedFinal).length)
      .toBeLessThanOrEqual(23);
  });

  it("uses bounded four-choice answers for generated UFC multi-opponent identity puzzles", () => {
    const generated = AVERAGE_FAN_CONTENT_BANKS.ufc.filter((question) =>
      question.id.endsWith(":three-win-identity")
      || (question.protectedFinal && (question.id.endsWith(":title") || question.id.endsWith(":fight"))),
    );
    expect(generated.length).toBeGreaterThan(0);
    for (const question of generated) {
      expect(question.format, question.id).toBe("four-choice");
      expect(question.choices, question.id).toHaveLength(4);
      expect(question.choices!.filter((choice) => choice === question.answer), question.id).toHaveLength(1);
    }
  });

  it("excludes dual-position college facts and avoids trivial top-grade UFC vocabulary", () => {
    const college = AVERAGE_FAN_CONTENT_BANKS.cfb;
    expect(college.some((question) =>
      question.id.includes("cfb-travis-hunter") && (
        question.id.endsWith(":position")
        || question.id.endsWith(":position-tf")
        || question.id.endsWith(":school-position")
      ),
    )).toBe(false);
    for (const question of college.filter((item) =>
      item.id.endsWith(":position") || item.id.endsWith(":school-position")
    )) {
      expect(question.prompt, question.id).toMatch(/primary college football position/);
    }

    const ufc = AVERAGE_FAN_CONTENT_BANKS.ufc;
    expect(ufc.some((question) => question.id.startsWith("average-fan:ufc:iq:switch-stance:"))).toBe(false);
    expect(ufc.some((question) =>
      question.id.startsWith("average-fan:ufc:iq:feint:") && question.grade === 5,
    )).toBe(false);
  });

  it("does not confuse the Ghost to the Post regulation catch with the overtime touchdown", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.nfl) {
      if (!question.id.includes("ghost-to-post")) continue;
      expect(question.prompt).toMatch(/late in regulation/);
      expect(question.explanation).toMatch(/fourth quarter/);
      expect(question.explanation).toMatch(/double overtime/);
      expect(question.prompt).not.toMatch(/overtime catch/);
    }
  });

  it("states the NFL fourth-down fumble rule without disallowing teammate recovery", () => {
    const question = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
      (row) => row.id === "average-fan:nfl:00-0tf:fourth-down-fumble",
    );
    expect(question, "NFL fourth down editorial row should stay selected").toBeTruthy();
    expect(question?.answer).toBe("False");
    expect(question?.prompt).toMatch(/teammate who recovers a fumble can keep running/);
    expect(question?.explanation).toMatch(/teammate may recover.*ball is dead/);
  });

  it("rejects ambiguous surname-only answers and keeps NFL name Finals recognition-based", () => {
    // Mike Jones was withdrawn for direct overlap with Bar Trivia. Keep
    // recognition/alias coverage on retained uniquely named NFL Finals.
    expect(AVERAGE_FAN_CONTENT_BANKS.nfl.some((row) =>
      row.id === "average-fan:nfl:final-authored:mike-jones",
    )).toBe(false);

    const jacoby = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
      (row) => row.id === "average-fan:nfl:final-authored:jacoby-jones",
    );
    expect(jacoby).toBeTruthy();
    expect(jacoby?.format).toBe("four-choice");
    expect(jacoby?.choices).toEqual(expect.arrayContaining([
      "Jacoby Jones", "Torrey Smith", "Anquan Boldin", "David Reed",
    ]));
    expect(jacoby?.choices).toHaveLength(4);
    expect(jacoby?.choices).not.toContain("Jones");
    expect(jacoby?.choices).not.toContain("Mike Jones");
  });

  it("bounds UFC method and title opponents to one documented fight instead of an incomplete any-opponent ledger", () => {
    const generated = AVERAGE_FAN_CONTENT_BANKS.ufc.filter((question) =>
      /^average-fan:ufc:g4:ufc:[^:]+:(?:method-win|title-opponent)$/.test(question.id),
    );
    expect(generated.length).toBeGreaterThan(10);
    for (const question of generated) {
      const match = /^average-fan:ufc:g4:(ufc:[^:]+):(method-win|title-opponent)$/.exec(question.id)!;
      const fighter = getUfcFactualSubject(match[1]!);
      expect(fighter, question.id).toBeTruthy();
      const dateText = /\bon ([A-Za-z]+ \d{1,2}, \d{4})\?$/.exec(question.prompt)?.[1];
      expect(dateText, question.id).toBeTruthy();
      const matchingFights = fighter!.fights.filter((fight) =>
        new Date(`${fight.date}T12:00:00Z`).toLocaleDateString("en-US", {
          month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
        }) === dateText,
      );
      expect(matchingFights, question.id).toHaveLength(1);
      expect(matchingFights[0]?.opponent, question.id).toBe(question.answer);
      if (match[2] === "method-win") {
        expect(matchingFights[0]?.result, question.id).toBe("win");
      } else {
        expect(matchingFights[0]?.titleFight, question.id).toBe(true);
      }
      expect(question.format, question.id).toBe("four-choice");
      expect(question.aliases, question.id).toEqual([]);
      expect(question.choices?.filter((choice) => choice === question.answer), question.id).toHaveLength(1);
      expect(question.prompt, question.id).not.toMatch(/name one/i);
    }
  });

  it("keeps generated UFC fighter distractors plausible by division and gender", () => {
    const roster = new Map(
      ufcFactualLedgerSubjects.map((fighter) => [fighter.name, fighter]),
    );
    const generatedPattern = /^average-fan:ufc:(?:g3|g5|final):(ufc:[^:]+):(?:opponent|three-win-identity|title|fight)$/;
    const selected = AVERAGE_FAN_CONTENT_BANKS.ufc.filter((question) =>
      generatedPattern.test(question.id),
    );
    expect(selected.length).toBeGreaterThan(10);

    for (const question of selected) {
      expect(question.format, question.id).toBe("four-choice");
      const match = generatedPattern.exec(question.id)!;
      const subject = getUfcFactualSubject(match[1]!);
      expect(subject, question.id).toBeTruthy();
      if (!subject) continue;
      const womens = subject.gender === "women";
      const wrong = question.choices!.filter((choice) => choice !== question.answer);
      expect(wrong, question.id).toHaveLength(3);
      for (const name of wrong) {
        const candidate = roster.get(name);
        expect(candidate, `${question.id}: missing candidate ${name}`).toBeTruthy();
        expect(candidate?.gender === "women", `${question.id}: ${name}`).toBe(womens);
      }
    }

    // This was actually published October 9: Holly Holm and Henry Cejudo
    // were giveaway choices against Cormier's 205-lb title-fight resume.
    const cormier = AVERAGE_FAN_CONTENT_BANKS.ufc.find((question) =>
      question.id === "average-fan:ufc:g3:ufc:daniel-cormier:opponent",
    );
    expect(cormier).toBeTruthy();
    // The named correct opponent changes when the generator favors a
    // recognizable fight. Protect the actual sourced fight and peer quality,
    // not a prior handpicked correct answer from an older version.
    expect(cormier?.choices).toContain(cormier?.answer);
    expect(cormier?.choices).toHaveLength(4);
    expect(cormier?.choices).not.toContain("Holly Holm");
    expect(cormier?.choices).not.toContain("Henry Cejudo");
  });

  it("requires recognized title opponents in every generated UFC championship anchor", () => {
    const normalized = (name: string) => name
      .replace(/[Łł]/g, "l").replace(/[Øø]/g, "o").replace(/[Đđ]/g, "d")
      .normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    const recognized = new Set(ufcFactualLedgerSubjects.map((fighter) => normalized(fighter.name)));
    let checked = 0;
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      const g4 = /^average-fan:ufc:g4:(ufc:[^:]+):title-opponent$/.exec(question.id);
      const g5 = /^average-fan:ufc:g5:(ufc:[^:]+):title-identity$/.exec(question.id);
      const final = /^average-fan:ufc:final:(ufc:[^:]+):title$/.exec(question.id);
      const fighterId = g4?.[1] ?? g5?.[1] ?? final?.[1];
      if (!fighterId) continue;
      const titleOpponent = g4
        ? question.answer
        : g5
          ? /recorded a (?:win|loss|draw|no-contest) against (.*?) in a UFC title fight on /.exec(question.prompt)?.[1]
          : /^Which UFC fighter faced (.*?) in a title fight/.exec(question.prompt)?.[1];
      expect(titleOpponent, question.id).toBeTruthy();
      expect(recognized.has(normalized(titleOpponent ?? "")), question.id).toBe(true);
      const fighter = getUfcFactualSubject(fighterId);
      expect(fighter, question.id).toBeTruthy();
      expect(fighter?.fights.some((fight) =>
        fight.titleFight && normalized(fight.opponent) === normalized(titleOpponent ?? "")
      ), question.id).toBe(true);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(10);
  });

  it("never selects an ambiguous UFC multi-opponent fighter identity", () => {
    const normalized = (name: string) => name.replace(/[Łł]/g, "l")
      .normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
    const fought = (subject: (typeof ufcFactualLedgerSubjects)[number], opponent: string, condition: "beat" | "title" | "faced") =>
      subject.fights.some((fight) =>
        normalized(fight.opponent) === normalized(opponent)
        && (condition === "faced" || (condition === "beat" ? fight.result === "win" : fight.titleFight)));
    let checked = 0;
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      const winMatch = /^average-fan:ufc:g5:(.+):three-win-identity$/.exec(question.id);
      const titleMatch = /^average-fan:ufc:final:(.+):title$/.exec(question.id);
      const fightMatch = /^average-fan:ufc:final:(.+):fight$/.exec(question.id);
      const id = winMatch?.[1] ?? titleMatch?.[1] ?? fightMatch?.[1];
      if (!id) continue;
      const subject = getUfcFactualSubject(id);
      expect(subject, question.id).toBeTruthy();
      if (!subject) continue;
      // Verify the ACTUAL published words, rather than recomputing a stale
      // selection from a pre-editorial version of the generator.
      let constraints: Array<{ opponent: string; condition: "beat" | "title" | "faced" }> = [];
      if (winMatch) {
        const match = /^Which UFC fighter owns wins over (.*?), (.*?), and (.*?), including the \d{4} win over (.*?)\?$/.exec(question.prompt);
        expect(match, question.id).toBeTruthy();
        if (!match) continue;
        expect(normalized(match[1]!), question.id).toBe(normalized(match[4]!));
        constraints = match.slice(1, 4).map((opponent) => ({ opponent: opponent!, condition: "beat" }));
      } else if (titleMatch) {
        const match = /^Which UFC fighter faced (.*?) in a title fight(?: and also fought (.*))?\?$/.exec(question.prompt);
        expect(match, question.id).toBeTruthy();
        if (!match) continue;
        constraints = [{ opponent: match[1]!, condition: "title" }];
        if (match[2]) constraints.push(...match[2].split(" and ").map((opponent) => ({
          opponent, condition: "faced" as const,
        })));
      } else if (fightMatch) {
        const match = /^Which UFC fighter faced (.*?), (.*?), and (.*?)\?$/.exec(question.prompt);
        expect(match, question.id).toBeTruthy();
        if (!match) continue;
        constraints = match.slice(1, 4).map((opponent) => ({ opponent: opponent!, condition: "faced" }));
      }
      expect(constraints.length, question.id).toBeGreaterThanOrEqual(titleMatch ? 2 : 3);
      expect(constraints.every(({ opponent, condition }) => fought(subject, opponent, condition)), question.id).toBe(true);
      const colliders = ufcFactualLedgerSubjects.filter((other) => other.id !== id
        && constraints.every(({ opponent, condition }) => fought(other, opponent, condition)));
      expect(colliders.map((row) => row.name), question.id).toEqual([]);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(10);
  });

  it("keeps UFC hard identity prompts specific enough to avoid two-opponent ambiguity", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      if (question.id.includes(":three-win-identity")) {
        expect((question.prompt.match(/,/g) ?? []).length, question.id).toBeGreaterThanOrEqual(1);
        expect(question.prompt.includes(" and "), question.id).toBe(true);
      }
      if (question.protectedFinal && question.id.endsWith(":fight")) {
        expect((question.prompt.match(/,/g) ?? []).length, question.id).toBeGreaterThanOrEqual(1);
        expect(question.prompt.includes(" and "), question.id).toBe(true);
      }
    }
  });


  it("recognizes nested fighter and player IDs when deduplicating question facts", () => {
    const division = {
      id: "average-fan:ufc:g1:ufc:jon-jones:division",
    } as AverageFanQuestion;
    const divisionTf = {
      id: "average-fan:ufc:g2:ufc:jon-jones:division-tf",
    } as AverageFanQuestion;
    expect(averageFanQuestionFactKey(division))
      .toBe("ufc:fighter:ufc:jon-jones:division");
    expect(averageFanQuestionFactKey(divisionTf))
      .toBe(averageFanQuestionFactKey(division));

    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc.filter((q) =>
      q.id.endsWith(":division") || q.id.endsWith(":division-tf")
    )) {
      expect(averageFanQuestionFactKey(question), question.id).not.toBeNull();
    }
  });

  it("does not select the same player fact twice using alternate formats or grades", () => {
    for (const sport of sports) {
      const keys = AVERAGE_FAN_CONTENT_BANKS[sport]
        .map(averageFanQuestionFactKey)
        .filter((key): key is string => key != null);
      expect(new Set(keys).size, sport).toBe(keys.length);
    }
  });

  it("blocks identical and high-confidence near-duplicate facts inside selected Average Fan banks", () => {
    const entries: DailyContentAuditEntry[] = sports.flatMap((sport) =>
      AVERAGE_FAN_CONTENT_BANKS[sport].map((question) => ({
        sport,
        game: "average_fan",
        questionId: question.id,
        prompt: question.prompt,
        answer: question.answer,
        factKey: averageFanQuestionFactKey(question) ?? undefined,
      })),
    );
    const overlaps = findDailyContentOverlaps(entries)
      .filter((item) => item.scope === "within_game");
    expect(overlaps.map((item) => ({
      reason: item.reason, first: item.left.questionId, second: item.right.questionId,
    }))).toEqual([]);
  });

  it("withdraws screened NFL fact-family repeats rather than restating Bar Trivia or Millionaire", () => {
    const formerSources = [
      "average-fan:nfl:00-player:beast-mode:",
      "average-fan:nfl:00-player:megatron:",
      "average-fan:nfl:00-player:gronk:",
      "average-fan:nfl:00-player:prime-time:",
      "average-fan:nfl:00-player:sheriff:",
      "average-fan:nfl:00-player:emmitt-record:",
      "average-fan:nfl:00-player:mahomes-drafted-chiefs:",
      "average-fan:nfl:00-team:lambeau:",
      "average-fan:nfl:00-team:arrowhead:",
      "average-fan:nfl:00-team:dawg-pound:",
      "average-fan:nfl:00-team:steel-curtain:",
      "average-fan:nfl:00-team:monsters-midway:",
      "average-fan:nfl:00-team:orange-crush:",
      "average-fan:nfl:00-team:hogs:",
      "average-fan:nfl:00-team:85-bears:",
      "average-fan:nfl:00-team:cowboys-three-four:",
      "average-fan:nfl:00-history:holy-roller:",
      "average-fan:nfl:00-history:first-sb-touchdown:",
      "average-fan:nfl:00-final-regraded:bucs-home",
      "average-fan:nfl:final-authored:mike-jones",
    ];
    expect(formerSources).toHaveLength(20);
    for (const id of formerSources) {
      expect(AVERAGE_FAN_CONTENT_BANKS.nfl.some((question) => question.id.startsWith(id)), id)
        .toBe(false);
    }
  });

  it("never makes NFL unordered team pairs an exact-spelling short answer", () => {
    const pairFacts = [
      ["average-fan:nfl:00-team:six-super-bowls:", "Pittsburgh Steelers and New England Patriots"],
      ["average-fan:nfl:00-history:ice-bowl-teams:", "Green Bay Packers and Dallas Cowboys"],
      ["average-fan:nfl:00-history:first-mnf:", "Cleveland Browns and New York Jets"],
    ] as const;
    let selected = 0;
    for (const [prefix, correct] of pairFacts) {
      const question = AVERAGE_FAN_CONTENT_BANKS.nfl.find((row) => row.id.startsWith(prefix));
      if (!question) continue; // Quality-driven caps may leave a valid candidate unselected.
      selected += 1;
      expect(question.id, prefix).toBe(`${prefix}choice`);
      expect(question.format, prefix).toBe("four-choice");
      expect(question.choices, prefix).toContain(correct);
      expect(new Set(question.choices).size, prefix).toBe(4);
    }
    expect(selected).toBeGreaterThan(0);
  });

  it("withdraws 20 newly reviewed Bar Trivia wave fact repeats across all three sports", () => {
    const sourcePairs = [
      ["nfl", "average-fan:nfl:00-team:who-dat:", "nfl-r1-who-dat"],
      ["nfl", "average-fan:nfl:00-team:bills-mafia:", "nfl-r1-bills-mafia"],
      ["nfl", "average-fan:nfl:00-team:skol-vikings:", "nfl-r1-skol"],
      ["nfl", "average-fan:nfl:00-team:fly-eagles-fly:", "nfl-r1-fly-eagles-fly"],
      ["nfl", "average-fan:nfl:00-team:bengals-who-dey:", "nfl-r1-who-dey"],
      ["nfl", "average-fan:nfl:00-history:wide-right:", "nfl-r2-wide-right-norwood"],
      ["cfb", "average-fan:cfb:tradition:white-out:", "cfb-easy-white-out"],
      ["cfb", "average-fan:cfb:tradition:midnight-yell:", "cfb-r1-midnight-yell"],
      ["cfb", "average-fan:cfb:tradition:script-ohio:", "cfb-r1-script-ohio"],
      ["cfb", "average-fan:cfb:authored:00-g5:renfrow-title-catch:", "cfb-r2-2016-title-catch"],
      ["ufc", "average-fan:ufc:iq:title-rounds:", "ufc-easy2-title-rounds"],
      ["ufc", "average-fan:ufc:authored-history:ufc3-winner:", "ufc-r1-ufc3-winner"],
      ["ufc", "average-fan:ufc:authored-history:ufc4-final:", "ufc-r2-ufc4-final"],
      ["ufc", "average-fan:ufc:authored-history:ufc6-winner:", "ufc-r1-ufc6-winner"],
      ["ufc", "average-fan:ufc:authored-history:first-wheel-kick:", "ufc-r3-first-wheel-kick-ko"],
      ["ufc", "average-fan:ufc:authored-history:gonzaga-crocop:", "ufc-r1-gonzaga-crocop"],
      ["ufc", "average-fan:ufc:authored-history:fox-first:", "ufc-r1-fox-first-winner"],
      ["ufc", "average-fan:ufc:authored-history:lewis-volkov:", "ufc-final-lewis-volkov-quote"],
      ["ufc", "average-fan:ufc:authored-history:daley-koscheck:", "ufc-final-daley-koscheck-release"],
      ["ufc", "average-fan:ufc:authored-history:first-125:", "ufc-r1-first-125-fight"],
    ] as const;
    expect(sourcePairs).toHaveLength(20);
    for (const [sport, averagePrefix, barId] of sourcePairs) {
      const bar = BAR_TRIVIA_QUESTION_BANK.find((row) => row.id === barId);
      expect(bar, `Source Bar Trivia question ${barId} must exist`).toBeTruthy();
      expect(bar?.league).toBe(sport);
      expect(AVERAGE_FAN_CONTENT_BANKS[sport].some((row) => row.id.startsWith(averagePrefix)), averagePrefix)
        .toBe(false);
    }
    // UFC candidate generation remains intact; only future final-bank selection
    // retires the specific overlap. No historical Daily setups are touched.
    expect(ufcCandidates().some((row) =>
      row.id.startsWith("average-fan:ufc:authored-history:ufc3-winner:"),
    )).toBe(true);
  });

  it("does not copy Bar Trivia questions into Average Fan in any sport", () => {
    const authored = [...BAR_TRIVIA_QUESTION_BANK, ...BAR_TRIVIA_CURRENT_EVENT_QUESTIONS];
    const entries: DailyContentAuditEntry[] = [
      ...authored.map((question) => ({
        sport: question.league as "nfl" | "cfb" | "ufc",
        game: "bar_trivia",
        questionId: question.id,
        prompt: question.prompt,
        answer: question.answer,
      })),
      ...sports.flatMap((sport) => AVERAGE_FAN_CONTENT_BANKS[sport].map((question) => ({
        sport,
        game: "average_fan",
        questionId: question.id,
        prompt: question.prompt,
        answer: question.answer,
      }))),
    ];
    const overlaps = findDailyContentOverlaps(entries)
      .filter((item) => item.scope === "across_games");
    expect(overlaps.map((item) => ({
      reason: item.reason, left: item.left.questionId, right: item.right.questionId,
    }))).toEqual([]);

    for (const sport of sports) {
      const average = AVERAGE_FAN_CONTENT_BANKS[sport];
      const borrowedIds = average.filter((question) =>
        question.id.includes(":current:") || (
          sport === "cfb" && authored.some((original) =>
            question.id === `average-fan:cfb:authored:${original.id}`
          )
        )
      );
      expect(borrowedIds.map((question) => question.id)).toEqual([]);
    }
  });

  it("does not publish the same question as Millionaire and Average Fan", () => {
    const entries: DailyContentAuditEntry[] = [
      ...sports.flatMap((sport) => Array.from(
        { length: MILLIONAIRE_DAILY_RUN_COUNT },
        (_, runIndex) => millionaireDailyRun(sport, runIndex).map((question) => ({
          sport,
          game: "millionaire",
          questionId: question.id,
          prompt: question.prompt,
          answer: question.choices.find((choice) => choice.id === question.correctChoiceId)!.text,
        })),
      ).flat()),
      ...sports.flatMap((sport) => AVERAGE_FAN_CONTENT_BANKS[sport].map((question) => ({
        sport,
        game: "average_fan",
        questionId: question.id,
        prompt: question.prompt,
        answer: question.answer,
      }))),
    ];
    const overlaps = findDailyContentOverlaps(entries)
      .filter((item) => item.scope === "across_games");
    expect(overlaps.map((item) => ({
      reason: item.reason,
      left: item.left.questionId,
      right: item.right.questionId,
    }))).toEqual([]);
  });

  it("keeps current events inside the locked grade totals rather than inflating the bank", () => {
    for (const sport of sports) {
      const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
      expect(bank.length, sport).toBeLessThanOrEqual(AVERAGE_FAN_BANK_TARGETS[sport]);
      for (const question of bank.filter((row) => row.contentType === "current-event")) {
        expect(question.protectedFinal, question.id).toBe(false);
        expect(question.grade, question.id).toBeGreaterThanOrEqual(3);
      }
    }
  });


  it("keeps internal data-owner language out of player-facing copy", () => {
    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        expect(question.prompt, question.id).not.toMatch(/\b(?:HQ|canonical|ledger|registry)\b/i);
        expect(question.explanation, question.id).not.toMatch(/\b(?:HQ|canonical|ledger|registry|internal id|sourceId|verifiedAt|difficultyNudge|protectedFinal|fanMisses)\b/i);
      }
    }
  });

  it("keeps dated upper-grade identity trivia modern-heavy instead of making old eras the difficulty proxy", () => {
    for (const sport of sports) {
      const identitySubject = sport === "ufc" ? "Fighters" : "Players";
      const dated = AVERAGE_FAN_CONTENT_BANKS[sport]
        .filter((question) => question.grade === 5 && question.subject === identitySubject)
        .map((question) => ({
          question,
          years: [...question.prompt.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0])),
        }))
        .filter((row) => row.years.length > 0);

      expect(dated.length, sport).toBeGreaterThan(0);
      const modernThreshold = sport === "ufc" ? 2010 : 2000;
      const modern = dated.filter((row) => Math.max(...row.years) >= modernThreshold).length;
      expect(modern / dated.length, sport).toBeGreaterThanOrEqual(0.65);
    }
  });

  it("never ships an expiring current-event record without an expiry date", () => {
    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        if (question.contentType !== "current-event") continue;
        expect(question.expiresAt, question.id).toBeTruthy();
        expect(question.sourceId, question.id).toBeTruthy();
      }
    }
  });

  it("keeps the reviewed CFB Final pool harder than the removed signature-result questions", () => {
    const finals = AVERAGE_FAN_CONTENT_BANKS.cfb.filter((question) => question.protectedFinal);
    const banned = [
      "average-fan:cfb:authored:cfb-final-00-program-indiana",
      "average-fan:cfb:authored:cfb-final-01-program-texas-rose",
      "average-fan:cfb:authored:cfb-final-02-program-boise-fiesta",
      "average-fan:cfb:authored:cfb-final-03-program-app-state",
    ];
    expect(finals.some((question) => banned.includes(question.id))).toBe(false);
    expect(finals.filter((question) => question.id.includes(":authored:cfb-final-")).every(
      (question) => question.difficultyNudge === 3,
    )).toBe(true);
  });

    it("keeps protected Finals fifth-grade and out of the ordinary grade counts", () => {
    for (const sport of sports) {
      const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
      for (const question of bank.filter((row) => row.protectedFinal)) {
        expect(question.grade).toBe(5);
      }
      const ordinary = bank.filter((row) => !row.protectedFinal);
      expect(ordinary.length).toBeLessThanOrEqual(
        AVERAGE_FAN_BANK_TARGETS[sport] - AVERAGE_FAN_FINAL_TARGETS[sport],
      );
    }
  });
  it("keeps the Super Bowl XL receiver distractors position-plausible", () => {
    const question = AVERAGE_FAN_CONTENT_BANKS.nfl.find(
      (row) => row.id === "average-fan:nfl:00-history:randle-el:choice",
    );
    expect(question?.format).toBe("four-choice");
    expect(new Set(question?.choices)).toEqual(new Set([
      "Antwaan Randle El",
      "Santonio Holmes",
      "Cedrick Wilson",
      "Nate Washington",
    ]));
  });

  it("keeps accepted answers and aliases out of distractors and malformed choice sets", () => {
    const normalize = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");
    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        const accepted = new Set([question.answer, ...question.aliases].map(normalize));
        if (question.format === "four-choice") {
          expect(question.choices, question.id).toHaveLength(4);
          const acceptedChoices = question.choices!.filter((choice) => accepted.has(normalize(choice)));
          expect(acceptedChoices, question.id).toHaveLength(1);
          expect(normalize(acceptedChoices[0]!), question.id).toBe(normalize(question.answer));
        } else {
          expect(question.choices, question.id).toBeUndefined();
        }
        for (const miss of question.fanMisses ?? []) {
          expect(accepted.has(normalize(miss)), question.id).toBe(false);
        }
      }
    }
  });

  it("spreads four-choice correct answers across all four card positions", () => {
    for (const sport of sports) {
      const positions = new Set(
        AVERAGE_FAN_CONTENT_BANKS[sport]
          .filter((question) => question.format === "four-choice")
          .map((question) => question.choices!.indexOf(question.answer)),
      );
      expect([...positions].sort((a, b) => a - b), sport).toEqual([0, 1, 2, 3]);
    }
  });

  it("rejects mechanically detectable near-duplicate facts with the same answer", () => {
    const stop = new Set(["the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "was", "is", "did", "which", "who", "what", "name"]);
    const tokens = (prompt: string) => new Set(
      prompt.toLocaleLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter((token) => token.length > 2 && !stop.has(token)),
    );
    const answerKey = (value: string) => value.trim().toLocaleLowerCase().replace(/\s+/g, " ");

    for (const sport of sports) {
      const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
      for (let i = 0; i < bank.length; i += 1) {
        for (let j = i + 1; j < bank.length; j += 1) {
          const left = bank[i]!;
          const right = bank[j]!;
          if (answerKey(left.answer) !== answerKey(right.answer)) continue;
          const leftTokens = tokens(left.prompt);
          const rightTokens = tokens(right.prompt);
          const union = new Set([...leftTokens, ...rightTokens]);
          if (union.size < 4) continue;
          const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
          const similarity = intersection / union.size;
          expect(similarity, `${left.id} <> ${right.id}`).toBeLessThan(0.9);
        }
      }
    }
  });


});

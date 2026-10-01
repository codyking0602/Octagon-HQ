import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_BANK_TARGETS,
  AVERAGE_FAN_CONTENT_BANKS,
  AVERAGE_FAN_CURRENT_EVENT_POOL_TARGETS,
  AVERAGE_FAN_FINAL_TARGETS,
  averageFanBankSummary,
} from "./averageFanContentBanks";
import { queryFootballSubjects } from "../back-room/footballSubjectRegistry";
import { getUfcFactualSubject } from "../back-room/ufcFactualLedger";
import { BAR_TRIVIA_CURRENT_EVENT_QUESTIONS } from "../play/barTriviaCurrentEvents";
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
  it("hits the locked six-month bank sizes and protected Final counts", () => {
    for (const sport of sports) {
      const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
      expect(bank).toHaveLength(AVERAGE_FAN_BANK_TARGETS[sport]);
      expect(bank.filter((question) => question.protectedFinal))
        .toHaveLength(AVERAGE_FAN_FINAL_TARGETS[sport]);
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
    expect(globalIds.size).toBe(880);
  });

  it("runs every banked short answer through tolerant human-input grading without accepting authored misses", () => {
    let shortAnswerCount = 0;
    let typoCount = 0;

    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        if (question.format !== "short-answer") continue;
        shortAnswerCount += 1;

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

    expect(shortAnswerCount).toBeGreaterThanOrEqual(300);
    expect(typoCount).toBeGreaterThan(220);
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

    expect(surnameVariantCount).toBeGreaterThan(60);
    expect(surnameTypoCount).toBeGreaterThan(35);
  });

  it("regresses the exact Weidman false-negative from owner preview", () => {
    const question = AVERAGE_FAN_CONTENT_BANKS.ufc.find(
      (row) => row.id === "average-fan:ufc:authored-history:silva-weidman:short",
    );
    expect(question).toBeTruthy();
    expect(question?.answer).toBe("Chris Weidman");
    expect(question?.aliases).toContain("Weidman");
    expect(averageFanAnswersMatch(question!, "weidman")).toBe(true);
    expect(averageFanAnswersMatch(question!, "weidmn")).toBe(true);
    expect(averageFanAnswersMatch(question!, "Chris")).toBe(false);
  });

  it("regrades the durable banks to the four playable grades", () => {
    expect(averageFanBankSummary("nfl").grades).toEqual({
      2: 40, 3: 40, 4: 40, 5: 85,
    });
    expect(averageFanBankSummary("cfb").grades).toEqual({
      2: 40, 3: 40, 4: 40, 5: 85,
    });
    expect(averageFanBankSummary("ufc").grades).toEqual({
      2: 80, 3: 80, 4: 80, 5: 170,
    });

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

  it("keeps short answer dominant while retaining both alternate formats", () => {
    for (const sport of sports) {
      const summary = averageFanBankSummary(sport);
      const shortShare = Number(summary.formats["short-answer"]) / summary.total;
      const choiceShare = Number(summary.formats["four-choice"]) / summary.total;
      const trueFalseShare = Number(summary.formats["true-false"]) / summary.total;

      expect(shortShare).toBeGreaterThanOrEqual(0.3);
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
    expect(ordinary).toHaveLength(205);
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
      Players: 4,
      Teams: 4,
      "NFL History": 4,
      "X’s & O’s": 3,
    });
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

  it("keeps rivalry-trophy name recall out of short answer", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.cfb) {
      if (!/play for which (?:rivalry )?trophy/i.test(question.prompt)) continue;
      expect(question.format, question.id).toBe("four-choice");
    }
  });

    it("never uses another valid UFC opponent as a wrong opponent choice", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc) {
      const match = /^average-fan:ufc:g3:(.+):opponent$/.exec(question.id);
      if (!match || !question.choices) continue;
      const fighter = getUfcFactualSubject(match[1]!);
      expect(fighter, question.id).toBeTruthy();
      if (!fighter) continue;
      const wins = fighter.fights.filter((fight) => fight.result === "win");
      const validOpponents = new Set(
        (wins.length ? wins : fighter.fights).map((fight) => fight.opponent),
      );
      const validChoices = question.choices.filter((choice) => validOpponents.has(choice));
      expect(validChoices, question.id).toEqual([question.answer]);
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

  it("uses natural UFC title-fight year wording instead of raw ISO dates", () => {
    for (const question of AVERAGE_FAN_CONTENT_BANKS.ufc.filter((row) => row.id.includes(":title-identity"))) {
      expect(question.prompt, question.id).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
      expect(question.explanation, question.id).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
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
    expect(authored.length).toBeGreaterThanOrEqual(20);
    expect(authored.some((question) => question.subject === "Championships")).toBe(true);
    expect(authored.some((question) => question.subject === "Fights")).toBe(true);
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


  it("reuses the newest verified Bar Trivia current-event pool without letting stale rows grow the bank", () => {
    for (const sport of sports) {
      const source = BAR_TRIVIA_CURRENT_EVENT_QUESTIONS
        .filter((question) => question.league === sport)
        .sort((a, b) => {
          const activeCompare = (b.activeFrom ?? "").localeCompare(a.activeFrom ?? "");
          return activeCompare || b.id.localeCompare(a.id);
        })
        .slice(0, AVERAGE_FAN_CURRENT_EVENT_POOL_TARGETS[sport]);
      const bankCurrent = AVERAGE_FAN_CONTENT_BANKS[sport].filter(
        (question) => question.contentType === "current-event",
      );
      expect(bankCurrent).toHaveLength(source.length);
      expect(source.length).toBeGreaterThan(0);

      const bankBySourceId = new Map(bankCurrent.map((question) => [question.sourceId, question]));
      for (const sourceQuestion of source) {
        expect(sourceQuestion.sourceId, sourceQuestion.id).toBeTruthy();
        expect(sourceQuestion.sourceUrl, sourceQuestion.id).toBeTruthy();
        expect(sourceQuestion.verifiedAt, sourceQuestion.id).toBeTruthy();

        const adapted = bankBySourceId.get(sourceQuestion.sourceId);
        expect(adapted, sourceQuestion.id).toBeTruthy();
        expect(adapted?.activeFrom, sourceQuestion.id).toBe(sourceQuestion.activeFrom);
        expect(adapted?.expiresAt, sourceQuestion.id).toBe(sourceQuestion.expiresAt);
        expect(adapted?.verifiedAt, sourceQuestion.id).toBe(sourceQuestion.verifiedAt);
        expect(adapted?.sourceUrl, sourceQuestion.id).toBe(sourceQuestion.sourceUrl);
        expect(adapted?.protectedFinal, sourceQuestion.id).toBe(false);
      }
    }
  });

  it("keeps current events inside the locked grade totals rather than inflating the bank", () => {
    for (const sport of sports) {
      const bank = AVERAGE_FAN_CONTENT_BANKS[sport];
      expect(bank).toHaveLength(AVERAGE_FAN_BANK_TARGETS[sport]);
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
      expect(ordinary.length).toBe(
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

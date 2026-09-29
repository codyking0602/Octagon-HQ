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
import { validateAverageFanQuestion, type AverageFanSport } from "./averageFanEngine";

const sports: readonly AverageFanSport[] = ["nfl", "cfb", "ufc"];

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

  it("preserves the locked ordinary grade shape", () => {
    expect(averageFanBankSummary("nfl").grades).toEqual({
      1: 40, 2: 40, 3: 40, 4: 40, 5: 45,
    });
    expect(averageFanBankSummary("cfb").grades).toEqual({
      1: 40, 2: 40, 3: 40, 4: 40, 5: 45,
    });
    expect(averageFanBankSummary("ufc").grades).toEqual({
      1: 80, 2: 80, 3: 80, 4: 80, 5: 90,
    });
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
      const choiceShare = Number(summary.formats["three-choice"]) / summary.total;
      const trueFalseShare = Number(summary.formats["true-false"]) / summary.total;

      expect(shortShare).toBeGreaterThanOrEqual(0.5);
      expect(shortShare).toBeLessThanOrEqual(0.75);
      expect(choiceShare).toBeGreaterThanOrEqual(0.12);
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

  it("keeps the selected NFL bank authored-first and player-facing", () => {
    const ordinary = AVERAGE_FAN_CONTENT_BANKS.nfl.filter((question) => !question.protectedFinal);
    const authored = ordinary.filter((question) => question.id.startsWith("average-fan:nfl:00-"));
    expect(authored.length).toBeGreaterThanOrEqual(130);

    for (const question of AVERAGE_FAN_CONTENT_BANKS.nfl) {
      const playerFacingCopy = (question.prompt + " " + question.explanation).toLocaleLowerCase();
      expect(playerFacingCopy, question.id).not.toMatch(/\b(?:canonical|registry|ledger|internal id|hq factual)\b/);
    }
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
      }
    }
  });


  it("keeps internal data-owner language out of player-facing copy", () => {
    for (const sport of sports) {
      for (const question of AVERAGE_FAN_CONTENT_BANKS[sport]) {
        expect(question.prompt, question.id).not.toMatch(/\b(?:HQ|canonical|ledger|registry)\b/i);
        expect(question.explanation, question.id).not.toMatch(/\b(?:HQ|canonical|ledger|registry)\b/i);
      }
    }
  });

  it("keeps dated upper-grade identity trivia modern-heavy instead of making old eras the difficulty proxy", () => {
    for (const sport of sports) {
      const dated = AVERAGE_FAN_CONTENT_BANKS[sport]
        .filter((question) => question.grade >= 4)
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
      }
    }
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
});

import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_BANK_TARGETS,
  AVERAGE_FAN_CONTENT_BANKS,
  AVERAGE_FAN_FINAL_TARGETS,
  averageFanBankSummary,
} from "./averageFanContentBanks";
import { queryFootballSubjects } from "../back-room/footballSubjectRegistry";
import { getUfcFactualSubject } from "../back-room/ufcFactualLedger";
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

  it("keeps the selected NFL bank authored-first and player-facing", () => {\n    const ordinary = AVERAGE_FAN_CONTENT_BANKS.nfl.filter((question) => !question.protectedFinal);\n    const authored = ordinary.filter((question) => question.id.startsWith("average-fan:nfl:00-"));\n    expect(authored.length).toBeGreaterThanOrEqual(130);\n\n    for (const question of AVERAGE_FAN_CONTENT_BANKS.nfl) {\n      const playerFacingCopy = (question.prompt + " " + question.explanation).toLocaleLowerCase();\n      expect(playerFacingCopy, question.id).not.toMatch(/\b(?:canonical|registry|ledger|internal id|hq factual)\b/);\n    }\n  });\n\n  it("uses a distinct authored NFL Final set across football subjects", () => {\n    const finals = AVERAGE_FAN_CONTENT_BANKS.nfl.filter((question) => question.protectedFinal);\n    expect(finals.every((question) => question.id.startsWith("average-fan:nfl:final-authored:"))).toBe(true);\n    expect(\n      finals.reduce<Record<string, number>>((counts, question) => {\n        counts[question.subject] = (counts[question.subject] ?? 0) + 1;\n        return counts;\n      }, {}),\n    ).toEqual({\n      Players: 4,\n      Teams: 4,\n      "NFL History": 4,\n      "X’s & O’s": 3,\n    });\n  });\n  it("keeps CFB conference choices to exactly one program from the requested conference", () => {
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

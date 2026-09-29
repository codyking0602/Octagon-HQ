import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_BANK_TARGETS,
  AVERAGE_FAN_CONTENT_BANKS,
  AVERAGE_FAN_FINAL_TARGETS,
  averageFanBankSummary,
} from "./averageFanContentBanks";
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

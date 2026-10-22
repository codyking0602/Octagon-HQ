import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_FANS,
  AVERAGE_FAN_NBA_FANS,
  AVERAGE_FAN_PLAYABLE_GRADES,
  AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_SUBJECTS,
  averageFanAnswersMatch,
  averageFanFanAccuracy,
  scoreAverageFanBoard,
  scoreAverageFanFinal,
  validateAverageFanQuestion,
} from "../games/averageFanEngine";
import { nbaAverageFanQuestionBank } from "../games/nbaAverageFanBank";
import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import { buildAverageFanCasualBoard } from "../play/averageFanCasualBoard";
import { nbaAverageFanChicagoDay, nbaAverageFanPreviewSeed } from "./NbaAverageFanPage";

const bank = nbaAverageFanQuestionBank;
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

describe("NBA Average Fan audited question bank", () => {
  it("contains a durable, balanced 150+ question inventory with four grades and protected Finals", () => {
    expect(bank.length).toBeGreaterThanOrEqual(150);
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
    expect(new Set(bank.map((q) => normalize(q.prompt))).size).toBe(bank.length);
    expect(bank.every((q) => q.sport === "nba")).toBe(true);
    expect(bank.every((q) => q.contentType === "evergreen")).toBe(true);

    const ordinary = bank.filter((q) => !q.protectedFinal);
    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      const tier = ordinary.filter((q) => q.grade === grade);
      expect(tier.length).toBeGreaterThanOrEqual(30);
      for (const subject of AVERAGE_FAN_SUBJECTS.nba) {
        expect(tier.filter((q) => q.subject === subject).length).toBeGreaterThanOrEqual(6);
      }
    }
    const finals = bank.filter((q) => q.protectedFinal);
    expect(finals.length).toBeGreaterThanOrEqual(12);
    expect(finals.every((q) => q.grade === 5)).toBe(true);
  });

  it("validates every answer, choice, short-answer miss, alias, and explanation", () => {
    for (const q of bank) {
      expect(validateAverageFanQuestion(q), q.id).toEqual([]);
      expect(averageFanAnswersMatch(q, q.answer), q.id).toBe(true);
      expect(q.explanation.trim().length, q.id).toBeGreaterThan(28);
      expect(q.sourceUrl, q.id).toMatch(/^https:\/\/(?:www\.|official\.)nba\.com\//);
      if (q.format === "four-choice") {
        expect(q.choices, q.id).toHaveLength(4);
        expect(q.choices!.filter((choice) => choice === q.answer)).toHaveLength(1);
        for (const choice of q.choices!) {
          if (choice !== q.answer) expect(averageFanAnswersMatch(q, choice), q.id).toBe(false);
        }
      } else if (q.format === "short-answer") {
        for (const alias of q.aliases) expect(averageFanAnswersMatch(q, alias), q.id).toBe(true);
        for (const miss of q.fanMisses ?? []) {
          expect(averageFanAnswersMatch(q, miss), `${q.id}: ${miss}`).toBe(false);
        }
      } else {
        expect(q.answer).toMatch(/^(True|False)$/);
        expect(averageFanAnswersMatch(q, q.answer === "True" ? "False" : "True"), q.id).toBe(false);
      }
    }
  });

  it("preserves a single intended answer and explicitly rejects duplicate Finals facts", () => {
    const finals = bank.filter((q) => q.protectedFinal);
    const uniqueFacts = new Set(finals.map((q) => `${normalize(q.answer)}|${normalize(q.prompt)}`));
    expect(uniqueFacts.size).toBe(finals.length);
    expect(finals.filter((q) => /2004 NBA Finals MVP/i.test(q.prompt))).toHaveLength(1);
    expect(finals.filter((q) => /1971 Milwaukee Bucks defeat|Milwaukee sweep/i.test(q.prompt))).toHaveLength(0);
    expect(bank.find((q) => /led the NBA in scoring at age 37/i.test(q.prompt))).toBeUndefined();
  });
});

describe("NBA Average Fan retained gameplay and safe owner preview", () => {
  it("builds 128 seeded Casual boards with two questions per grade and a separate Final", () => {
    const seen = new Set<string>();
    const fingerprints = new Set<string>();
    for (let i = 0; i < 128; i++) {
      const seed = `nba-simulation-${i}`;
      const game = buildAverageFanCasualBoard("nba", seed);
      expect(game.sport).toBe("nba");
      expect(game.questions).toHaveLength(8);
      expect(game.finalQuestion.protectedFinal).toBe(true);
      expect(game.finalQuestion.grade).toBe(5);
      expect(game.questions.every((q) => !q.protectedFinal)).toBe(true);
      const ids = game.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(8);
      expect(ids).not.toContain(game.finalQuestion.id);
      for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
        expect(game.questions.filter((q) => q.grade === grade)).toHaveLength(2);
      }
      for (const question of game.questions) seen.add(question.id);
      const topics = new Set(game.questions.flatMap(averageFanQuestionBoardTopics));
      const finalTopics = averageFanQuestionBoardTopics(game.finalQuestion);
      // A protected Final must not duplicate a named player/team fact already on the board.
      expect(finalTopics.filter((topic) => topics.has(topic)).length).toBe(0);
      fingerprints.add(ids.join(",") + "|" + game.finalQuestion.id);
    }
    expect(fingerprints.size).toBeGreaterThan(100);
    expect(seen.size).toBeGreaterThan(45);
  });

  it("repeats the Daily-style board for the same Central day, but not for other days", () => {
    expect(nbaAverageFanChicagoDay(new Date("2026-10-22T16:00:00Z"))).toBe("2026-10-22");
    const seed = nbaAverageFanPreviewSeed("2026-10-22");
    const first = buildAverageFanCasualBoard("nba", seed);
    const repeat = buildAverageFanCasualBoard("nba", seed);
    expect(first.questions.map((q) => q.id)).toEqual(repeat.questions.map((q) => q.id));
    expect(first.finalQuestion.id).toBe(repeat.finalQuestion.id);
    const anotherDay = buildAverageFanCasualBoard("nba", nbaAverageFanPreviewSeed("2026-10-23"));
    expect(first.questions.map((q) => q.id)).not.toEqual(anotherDay.questions.map((q) => q.id));
  });

  it("retains fan strength equality, lifeline accuracy, and canonical 0–100 scoring", () => {
    expect(AVERAGE_FAN_NBA_FANS).toHaveLength(5);
    expect(AVERAGE_FAN_NBA_FANS).toContain("nnamdi");
    expect(AVERAGE_FAN_NBA_FANS).not.toContain("troy");
    expect(AVERAGE_FAN_FANS).toContain("troy");
    for (const fan of AVERAGE_FAN_NBA_FANS) {
      const row = AVERAGE_FAN_REPORT_CARDS.nba[fan];
      expect(Object.keys(row).sort()).toEqual([...AVERAGE_FAN_SUBJECTS.nba].sort());
      expect(averageFanFanAccuracy(bank.find((q) => q.grade === 2)!, fan)).toBeGreaterThan(60);
    }
    expect(scoreAverageFanBoard([])).toBe(90);
    expect(scoreAverageFanBoard([1])).toBe(70);
    expect(scoreAverageFanBoard([8])).toBe(84);
    expect(scoreAverageFanFinal(90, "correct")).toBe(100);
    expect(scoreAverageFanFinal(90, "wrong")).toBe(80);
    expect(scoreAverageFanFinal(80, "walk-away")).toBe(80);
  });

  it("keeps owner-only routing, NBA navigation, and the locked landscape presentation", () => {
    const router = readFileSync("src/app/router.tsx", "utf8");
    const lobby = readFileSync("src/features/nba/NbaPlayPage.tsx", "utf8");
    const prototype = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");
    const css = readFileSync("src/features/play/AverageFanPrototypePage.css", "utf8");
    const official = readFileSync("src/features/play/averageFanDailyRuntime.ts", "utf8");

    expect(router).toContain('path: "nba/average-fan", element: <NbaWhoAmIOwnerGate><NbaAverageFanPage /></NbaWhoAmIOwnerGate>');
    expect(lobby).toContain('to="/nba/average-fan"');
    expect(lobby).toContain('to="/nba/average-fan?mode=daily"');
    expect(prototype).toContain('lockedSport ? "fan-select" : "sport-select"');
    expect(prototype).toContain('sport === "nba" ? AVERAGE_FAN_NBA_FANS : FAN_ORDER');
    expect(prototype).toContain("average-fan-card__pending");
    expect(prototype).toContain('const exitRoute = casualSport === "nba" ? "/nba"');
    expect(prototype).toContain('const AVERAGE_FAN_GAMEPLAY_STAGE_WIDTH = 1536;');
    expect(prototype).toContain('const AVERAGE_FAN_GAMEPLAY_STAGE_HEIGHT = 864;');
    expect(css).toContain(".average-fan-game-stage");
    expect(official).toContain('type AverageFanDailySport = "nfl" | "cfb" | "ufc"');
    expect(router).not.toContain("nba/average-fan-daily");
  });
});

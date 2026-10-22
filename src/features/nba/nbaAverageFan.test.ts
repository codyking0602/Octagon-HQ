import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  AVERAGE_FAN_FANS, AVERAGE_FAN_PLAYABLE_GRADES, AVERAGE_FAN_REPORT_CARDS,
  AVERAGE_FAN_SUBJECTS, averageFanAnswersMatch, averageFanFanAccuracy,
  scoreAverageFanBoard, scoreAverageFanFinal, validateAverageFanQuestion,
} from "../games/averageFanEngine";
import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import { nbaAverageFanQuestionBank } from "../games/nbaAverageFanBank";
import { buildAverageFanCasualBoard } from "../play/averageFanCasualBoard";
import { nbaAverageFanPreviewSeed } from "./NbaAverageFanPage";

const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
const questions = nbaAverageFanQuestionBank.filter((question) => !question.protectedFinal);
const finals = nbaAverageFanQuestionBank.filter((question) => question.protectedFinal);
const router = readFileSync("src/app/router.tsx", "utf8");
const playPage = readFileSync("src/features/nba/NbaPlayPage.tsx", "utf8");
const screen = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");

describe("NBA Average Fan curated question bank", () => {
  it("has substantial grade, subject and Final inventories without quota filler", () => {
    expect(questions.length).toBeGreaterThanOrEqual(105);
    expect(finals.length).toBeGreaterThanOrEqual(12);
    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      const selection = questions.filter((question) => question.grade === grade);
      expect(selection.length).toBeGreaterThanOrEqual(25);
      for (const subject of AVERAGE_FAN_SUBJECTS.nba) {
        expect(selection.filter((question) => question.subject === subject).length).toBeGreaterThanOrEqual(6);
      }
    }
    for (const item of finals) expect(item.grade).toBe(5);
  });

  it("validates every question, answer, choice, spelling alias and documentary source", () => {
    const ids = new Set<string>();
    const prompts = new Set<string>();
    for (const question of nbaAverageFanQuestionBank) {
      expect(validateAverageFanQuestion(question), question.id).toEqual([]);
      expect(ids.has(question.id), question.id).toBe(false);
      expect(prompts.has(normalize(question.prompt)), question.id).toBe(false);
      ids.add(question.id);
      prompts.add(normalize(question.prompt));
      expect(question.sport).toBe("nba");
      expect(question.sourceUrl).toMatch(/^https:\/\/(www\.nba\.com|official\.nba\.com)\//);
      expect(question.explanation.length).toBeGreaterThan(20);
      expect(averageFanAnswersMatch(question, question.answer), question.id).toBe(true);
      if (question.format === "four-choice") {
        expect(question.choices).toHaveLength(4);
        expect(question.choices?.filter((choice) => choice === question.answer)).toHaveLength(1);
        for (const choice of question.choices ?? []) if (choice !== question.answer) {
          expect(averageFanAnswersMatch(question, choice), question.id).toBe(false);
        }
      }
      if (question.format === "short-answer") {
        for (const alias of question.aliases) expect(averageFanAnswersMatch(question, alias)).toBe(true);
        for (const miss of question.fanMisses ?? []) expect(averageFanAnswersMatch(question, miss)).toBe(false);
      }
    }
    expect(new Set(nbaAverageFanQuestionBank.map((q) => q.format)).size).toBe(3);
  });

  it("keeps all five fan report cards equal in total ability while strengths vary by subject", () => {
    const center = AVERAGE_FAN_REPORT_CARDS.nba;
    const grades = Object.fromEntries(AVERAGE_FAN_FANS.map((fan) => [
      fan, AVERAGE_FAN_SUBJECTS.nba.map((subject) =>
        averageFanFanAccuracy({ sport: "nba", grade: 3, subject, difficultyNudge: 0 }, fan)),
    ]));
    const means = Object.values(grades).map((ratings) =>
      (ratings as number[]).reduce((sum, rating) => sum + rating, 0));
    expect(new Set(means).size).toBe(1);
    expect(new Set(Object.values(center).map((report) => report.Players)).size).toBeGreaterThan(1);
  });

  it("retains the established 90-point board and plus/minus 10 Final scoring", () => {
    expect(scoreAverageFanBoard([])).toBe(90);
    expect(scoreAverageFanBoard([1])).toBe(70);
    expect(scoreAverageFanBoard([4])).toBe(76);
    expect(scoreAverageFanBoard([8])).toBe(84);
    expect(scoreAverageFanFinal(90, "correct")).toBe(100);
    expect(scoreAverageFanFinal(80, "wrong")).toBe(70);
    expect(scoreAverageFanFinal(80, "walk-away")).toBe(80);
  });
});

describe("NBA Average Fan owner-only game integration", () => {
  it("produces eight distinct board tiles and a protected Final with proper grade balance", () => {
    for (let n = 0; n < 180; n++) {
      const board = buildAverageFanCasualBoard("nba", `nba-replay-${n}`, "2026-10-22T12:00:00.000Z");
      expect(board.questions).toHaveLength(8);
      expect(new Set(board.questions.map((q) => q.id)).size).toBe(8);
      expect(board.questions.every((q) => q.sport === "nba" && !q.protectedFinal)).toBe(true);
      expect(board.finalQuestion.protectedFinal).toBe(true);
      expect(board.questions.some((q) => q.id === board.finalQuestion.id)).toBe(false);
      for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) expect(board.questions.filter((q) => q.grade === grade)).toHaveLength(2);
      const subjects = board.questions.map((q) => q.subject);
      expect(new Set(subjects).size).toBe(4);
      const topicList = board.questions.flatMap(averageFanQuestionBoardTopics);
      expect(topicList.every((topic) => topic.startsWith("nba:"))).toBe(true);
    }
  });

  it("changes randomized Casual lineups, but repeats Daily preview lineups for a fixed day", () => {
    const selected = Array.from({ length: 90 }, (_, n) =>
      buildAverageFanCasualBoard("nba", `casual-${n}`, "2026-10-22T12:00:00.000Z").questions.map(q => q.id).join("|"));
    expect(new Set(selected).size).toBeGreaterThan(50);
    const seed = nbaAverageFanPreviewSeed("2026-10-22");
    const first = buildAverageFanCasualBoard("nba", seed).questions.map(q => q.id);
    const replay = buildAverageFanCasualBoard("nba", seed).questions.map(q => q.id);
    const other = buildAverageFanCasualBoard("nba", nbaAverageFanPreviewSeed("2026-10-23")).questions.map(q => q.id);
    expect(replay).toEqual(first);
    expect(other).not.toEqual(first);
    expect(() => nbaAverageFanPreviewSeed("not-a-day")).toThrow();
  });

  it("uses the approved gameplay, fan selection and results without a duplicate NBA engine", () => {
    expect(screen).toContain('lockedSport?: "nba"');
    expect(screen).toContain("<AverageFanGame");
    expect(screen).toContain("onRestart=");
    expect(screen).toContain("FinalDecision");
    expect(screen).toContain("useAverageFanGameplayStageLayout");
    expect(router).toContain('path: "nba/average-fan", element: <NbaWhoAmIOwnerGate><NbaAverageFanPage /></NbaWhoAmIOwnerGate>');
    expect(router).not.toContain('path: "play/average-fan", element: <AverageFanPrototypePage');
    expect(playPage).toContain('to="/nba/average-fan"');
    expect(playPage).toContain('to="/nba/average-fan?mode=daily"');
  });

  it("does not route NBA preview through official Daily, scoring or public challenges", () => {
    const page = readFileSync("src/features/nba/NbaAverageFanPage.tsx", "utf8");
    expect(page).toContain('lockedSport="nba"');
    expect(page).toContain("nbaAverageFanPreviewSeed");
    expect(page).not.toMatch(/repository|submit|leaderboard|saveAttempt|supabase/i);
  });
});

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
import { NBA_MILLIONAIRE_QUESTION_BANK } from "./nbaMillionaireBank";
import { NBA_SPORTS_FEUD_MAIN, NBA_SPORTS_FEUD_FAST } from "./nbaSportsFeudBank";
import { averageFanQuestionBoardTopics } from "../games/averageFanContentBanks";
import { buildAverageFanCasualBoard } from "../play/averageFanCasualBoard";
import { nbaAverageFanChicagoDay, nbaAverageFanPreviewSeed } from "./NbaAverageFanPage";

const bank = nbaAverageFanQuestionBank;
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

describe("NBA Average Fan audited question bank", () => {
  it("keeps a quality-first replayable NBA inventory after removing repeated Millionaire facts", () => {
    expect(bank.length).toBeGreaterThanOrEqual(100);
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
    expect(new Set(bank.map((q) => normalize(q.prompt))).size).toBe(bank.length);
    expect(bank.every((q) => q.sport === "nba")).toBe(true);
    expect(bank.every((q) => q.contentType === "evergreen")).toBe(true);

    const ordinary = bank.filter((q) => !q.protectedFinal);
    for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
      const tier = ordinary.filter((q) => q.grade === grade);
      expect(tier.length).toBeGreaterThanOrEqual(20);
      for (const subject of AVERAGE_FAN_SUBJECTS.nba) {
        expect(tier.filter((q) => q.subject === subject).length).toBeGreaterThanOrEqual(3);
      }
    }
    const finals = bank.filter((q) => q.protectedFinal);
    expect(finals.length).toBeGreaterThanOrEqual(8);
    expect(finals.every((q) => q.grade === 5)).toBe(true);
  });

  it("preserves the editorial grade calibration and protects against returning to Millionaire award trivia", () => {
    const gradeOf = (prompt: string) => bank.find((q) => q.prompt === prompt)?.grade;
    const calibrated: Array<[string, number]> = [
      ["An NBA game has four regulation quarters of 12 minutes each.", 2],
      ["The NBA regular season typically includes 82 games per team.", 2],
      ["Which 2000s-era NBA icon was nicknamed T-Mac?", 3],
      ["What does a flagrant 2 foul typically trigger for the offending player?", 3],
      ["How many free throws are normally awarded for a shooting foul on a missed three-point attempt?", 3],
      ["Giannis Antetokounmpo won the 2017 Most Improved Player award.", 4],
      ["What is a stretch five?", 4],
      ["Which No. 8 seed eliminated top-seeded San Antonio in the 2011 first round?", 5],
      ["In pick-and-roll defense, what does drop coverage generally ask the screener's defender to do?", 5],
      ["In NBA defensive terminology, what is the goal of ICE coverage on a side pick-and-roll?", 5],
    ];
    for (const [prompt, grade] of calibrated) expect(gradeOf(prompt), prompt).toBe(grade);
    const retiredFacts = [
      "Which 76ers icon was nicknamed The Answer?",
      "Which current NBA star is widely called the Joker?",
      "Who received the 2023 regular-season NBA MVP award?",
      "Which team did Michael Jordan lead to six NBA titles in the 1990s?",
      "Who won the regular-season NBA MVP award in 1993 as a Phoenix Sun?",
      "Which NBA Finals MVP was awarded to a player on the losing team in 1969?",
      "Which NBA franchise was home to the early-1990s trio known as Run TMC?",
      "Which NBA franchise became famous for the mid-2000s Seven Seconds or Less offense?",
      "Which early-1990s Charlotte Hornets star was nicknamed Grandmama?",
      "Which Hall of Fame center made the Dream Shake a signature post move?",
    ];
    for (const prompt of retiredFacts) expect(bank.some((q) => q.prompt === prompt), prompt).toBe(false);
  });

  it("keeps choice pills short and specific NBA moment sources tied to their questions", () => {
    for (const question of bank) {
      for (const choice of question.choices ?? []) {
        expect(choice.length, `${question.id}: ${choice}`).toBeLessThanOrEqual(45);
      }
    }
    const namedMoments = [
      "Which Cleveland guard defended Michael Jordan's famous 1989 playoff-winning shot?",
      "Who caught Kobe Bryant's famous alley-oop in the Lakers' 2000 West finals Game 7 comeback?",
      "Who made the chasedown block on Andre Iguodala late in Game 7 of the 2016 Finals?",
      "Which Pacers star scored eight points in 8.9 seconds against the Knicks in the 1995 playoffs?",
      "Which season was the first to use the three-point line in the NBA?",
    ];
    for (const prompt of namedMoments) {
      const q = bank.find((item) => item.prompt === prompt);
      expect(q?.sourceUrl, prompt).toMatch(/^https:\/\/www\.nba\.com\//);
      expect(q?.sourceUrl, prompt).not.toBe("https://www.nba.com/history");
      expect(q?.sourceUrl, prompt).not.toBe("https://www.nba.com/news/history-season-recaps-index");
    }
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
    expect(finals.filter((q) => /2004 NBA Finals MVP/i.test(q.prompt))).toHaveLength(0);
    expect(finals.filter((q) => /1971 Milwaukee Bucks defeat|Milwaukee sweep/i.test(q.prompt))).toHaveLength(0);
    expect(bank.find((q) => /led the NBA in scoring at age 37/i.test(q.prompt))).toBeUndefined();
  });
});


  it("guards NBA Average Fan from repeated locked Millionaire facts and identical Sports Feud prompts", () => {
    const normalizeFact = (value: string) => normalize(value)
      .replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    const stop = new Set(["which", "the", "with", "this", "that", "played", "name", "award",
      "season", "from", "when", "what", "player", "team", "game", "were", "regular", "finals"]);
    const words = (prompt: string) => new Set(normalizeFact(prompt).split(" ").filter((word) =>
      word.length >= 4 && !stop.has(word)));
    const millionaire = NBA_MILLIONAIRE_QUESTION_BANK.flat();
    const feud = [...NBA_SPORTS_FEUD_MAIN, ...NBA_SPORTS_FEUD_FAST];
    const overlap: string[] = [];
    for (const q of bank) {
      const prompt = normalizeFact(q.prompt);
      const tokens = words(q.prompt);
      for (const other of millionaire) {
        const otherPrompt = normalizeFact(other.prompt);
        if (prompt === otherPrompt) {
          overlap.push(`${q.id} repeats Millionaire ${other.id}`);
          continue;
        }
        if (normalizeFact(q.answer) !== normalizeFact(other.answer)) continue;
        const otherTokens = words(other.prompt);
        const union = new Set([...tokens, ...otherTokens]);
        const shared = [...tokens].filter((word) => otherTokens.has(word)).length;
        if (union.size && shared / union.size >= 0.37) {
          overlap.push(`${q.id} repeats Millionaire ${other.id}`);
        }
      }
      for (const other of feud) {
        if (prompt === normalizeFact(other.prompt)) overlap.push(`${q.id} repeats Sports Feud ${other.id}`);
      }
    }
    expect(overlap).toEqual([]);
  });

  it("keeps the NBA content evergreen until verified current events can be added without cross-game reuse", () => {
    const events = bank.filter((q) => q.contentType === "current-event");
    for (const event of events) {
      expect(event.sourceId).toBeTruthy();
      expect(event.sourceUrl).toMatch(/^https:\/\//);
      expect(event.verifiedAt).toBeTruthy();
      expect(event.expiresAt).toBeTruthy();
      expect(event.grade).toBeGreaterThan(2);
    }
    // A separate vetted NBA editorial pipeline is required before any story can enter the bank.
    const example = { ...bank[0]!, id: "nba-unverified-event", sport: "nba" as const,
      grade: 3 as const, contentType: "current-event" as const,
      sourceId: undefined, sourceUrl: undefined, verifiedAt: undefined,
      expiresAt: "2026-11-01T12:00:00.000Z" };
    expect(validateAverageFanQuestion(example)).toContain("NBA current events require a sourceId");
    expect(validateAverageFanQuestion(example)).toContain("NBA current events require an HTTPS sourceUrl");
    expect(validateAverageFanQuestion(example)).toContain("NBA current events require a valid verifiedAt");

    const vetted = { ...example, sourceId: "nba-2026-story-example",
      sourceUrl: "https://www.nba.com/news", verifiedAt: "2026-10-22T12:00:00.000Z" };
    expect(validateAverageFanQuestion(vetted)).toEqual([]);
    expect(validateAverageFanQuestion({ ...vetted, grade: 2 })).toContain("NBA current events must not appear in 2nd Grade");

    // NBA Daily is not officially published; no verified current-event candidates exist yet.
    expect(events).toHaveLength(0);
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
    const shell = readFileSync("src/app/AppShell.tsx", "utf8");
    const prototype = readFileSync("src/features/play/AverageFanPrototypePage.tsx", "utf8");
    const css = readFileSync("src/features/play/AverageFanPrototypePage.css", "utf8");
    const official = readFileSync("src/features/play/averageFanDailyRuntime.ts", "utf8");

    expect(router).toContain('path: "nba/average-fan", element: <NbaWhoAmIOwnerGate><NbaAverageFanPage /></NbaWhoAmIOwnerGate>');
    expect(lobby).toContain('to="/nba/average-fan"');
    expect(lobby).toContain('to="/nba/average-fan?mode=daily"');
    // Both Casual and date-seeded Daily previews share the same pathname.
    // The canonical immersive-game predicate must also suppress header, bottom nav and pull-to-refresh.
    const immersivePredicate = shell.match(/const isAverageFanGame = ([^;]+);/)?.[1];
    expect(immersivePredicate).toContain('location.pathname === "/nba/average-fan"');
    expect(immersivePredicate).toContain('location.pathname === "/play/average-fan"');
    expect(immersivePredicate).toContain('location.pathname === "/play/average-fan-preview"');
    expect(shell).toContain('const isGame = isPlayGame || isFootballGame || isMillionaireGame || isAverageFanGame');
    expect(shell).toContain('isMillionaireGame || isAverageFanGame ? null : isMlbSeries');
    expect(shell).toContain('{isAverageFanGame ? (');
    expect(shell).toContain('isBackRoom || isMillionaireGame || isAverageFanGame ? null : <BottomNavigation');
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

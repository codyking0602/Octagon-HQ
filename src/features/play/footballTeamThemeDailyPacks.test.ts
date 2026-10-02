import { describe, expect, it } from "vitest";
import {
  assertFamilyFeudPack,
  matchFamilyFeudAnswer,
} from "../games/familyFeudEngine";
import type { MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import { buildBarTriviaDailySetup } from "./barTriviaDailyRuntime";
import { buildMillionaireDailySetup } from "./millionaireDailyRuntime";
import {
  buildSportsFeudPack,
  footballSportsFeudDomainForDay,
} from "./sportsFeudDailyBanks";
import {
  buildFootballTodayPersistenceSetup,
  footballTodayGameForDay,
} from "./footballTodayChallengeSession";

describe("Football team-themed Daily packs", () => {
  it("keeps the normal rotation and swaps only the Oct. 10 Texas-Oklahoma Millionaire content", () => {
    expect(footballTodayGameForDay("2026-10-10")).toBe("millionaire");

    const setup = buildFootballTodayPersistenceSetup("2026-10-10");
    const run = setup.privateSetupEvidence.run as MillionaireRuntimeQuestion[];

    expect(setup.gameType).toBe("millionaire");
    expect(setup.publicSetup.league).toBe("cfb");
    expect(run).toHaveLength(8);
    expect(run.every((question) => question.id.startsWith("theme-texas-ou-2026-"))).toBe(true);
    expect(run.map((question) => question.level)).toEqual([
      "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8",
    ]);
    expect(run.find((question) => question.level === "Q4")?.choices.find((choice) => choice.id === run.find((question) => question.level === "Q4")?.correctChoiceId)?.text).toBe("Sam Bradford");
    expect(run.find((question) => question.level === "Q8")?.statSheet).toBeNull();

    const normal = buildMillionaireDailySetup("football", "2026-10-03", "football-daily-v20-resume-v18-oct3");
    const normalRun = normal.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
    expect(normalRun.some((question) => question.id.startsWith("theme-"))).toBe(false);
  });

  it("uses the Cowboys pack for the Oct. 26 NFL Millionaire without changing the scheduled game", () => {
    expect(footballTodayGameForDay("2026-10-26")).toBe("millionaire");

    const setup = buildFootballTodayPersistenceSetup("2026-10-26");
    const run = setup.privateSetupEvidence.run as MillionaireRuntimeQuestion[];

    expect(setup.publicSetup.league).toBe("nfl");
    expect(run).toHaveLength(8);
    expect(run.every((question) => question.id.startsWith("theme-cowboys-eagles-2026-"))).toBe(true);
    expect(run.map((question) => question.choices.find((choice) => choice.id === question.correctChoiceId)?.text))
      .toEqual([
        "AT&T Stadium",
        "Emmitt Smith",
        "Tony Romo",
        "Jimmy Johnson",
        "Bob Lilly",
        "Chuck Howley",
        "Randy White",
        "Everson Walls",
      ]);
  });

  it("publishes a valid Longhorns two-board plus five-question Feud pack on Texas-A&M day", () => {
    expect(footballTodayGameForDay("2026-11-27")).toBe("sports_feud");
    expect(footballSportsFeudDomainForDay("2026-11-27")).toBe("cfb");

    const pack = buildSportsFeudPack("cfb", "2026-11-27");
    expect(() => assertFamilyFeudPack(pack)).not.toThrow();
    expect(pack.mainBoards).toHaveLength(2);
    expect(pack.fastMoney).toHaveLength(5);
    expect(pack.mainBoards.every((question) => question.id.startsWith("theme-texas-am-2026-"))).toBe(true);
    expect(pack.fastMoney.every((question) => question.id.startsWith("theme-texas-am-2026-"))).toBe(true);

    const quarterbacks = pack.mainBoards.find((question) => question.id.endsWith("main-quarterbacks"))!;
    expect(matchFamilyFeudAnswer(pack, quarterbacks, "VY").status).toBe("matched");

    const seasons = pack.mainBoards.find((question) => question.id.endsWith("main-seasons"))!;
    expect(matchFamilyFeudAnswer(pack, seasons, "2005").status).toBe("matched");

    const showdown = pack.fastMoney.find((question) => question.id.endsWith("fast-lone-star-showdown"))!;
    expect(matchFamilyFeudAnswer(pack, showdown, "12th Man").status).toBe("matched");

    const rivals = pack.fastMoney.find((question) => question.id.endsWith("fast-rivals"))!;
    expect(matchFamilyFeudAnswer(pack, rivals, "A&M").status).toBe("matched");

    const traditions = pack.fastMoney.find((question) => question.id.endsWith("fast-traditions"))!;
    expect(matchFamilyFeudAnswer(pack, traditions, "Hook em").status).toBe("matched");

    const fastAnswerNames = pack.fastMoney.flatMap((question) =>
      question.answers.map((ranked) =>
        pack.entities.find((entity) => entity.id === ranked.entityId)?.displayName ?? "",
      ),
    );
    expect(new Set(fastAnswerNames).size).toBe(fastAnswerNames.length);

    const normal = buildSportsFeudPack("cfb", "2026-11-26");
    expect([...normal.mainBoards, ...normal.fastMoney].some((question) => question.id.startsWith("theme-"))).toBe(false);
  });

  it("uses the ten-question Cowboys Bar Trivia card for the Dec. 7 Seattle game", () => {
    expect(footballTodayGameForDay("2026-12-07")).toBe("bar_trivia");

    const setup = buildFootballTodayPersistenceSetup("2026-12-07");
    const run = setup.privateSetupEvidence.questions as Array<Record<string, unknown>>;

    expect(setup.publicSetup.league).toBe("nfl");
    expect(run).toHaveLength(10);
    expect(run.every((question) => String(question.id).startsWith("theme-cowboys-seahawks-2026-"))).toBe(true);
    expect(run.map((question) => question.round)).toEqual([
      "round1", "round1", "round1",
      "round2", "round2", "round2",
      "round3", "round3", "round3",
      "last-call",
    ]);
    expect(run[6]).toMatchObject({
      answer: "Terrance Williams",
      category: "Cowboys-Seahawks",
    });
    expect(run[8]).toMatchObject({
      answer: "Robert Newhouse",
      category: "Super Bowl History",
    });
    expect(run[9]).toMatchObject({
      answer: "Craig Morton",
      round: "last-call",
    });

    const millionaire = buildFootballTodayPersistenceSetup("2026-10-26");
    const millionaireRun = millionaire.privateSetupEvidence.run as MillionaireRuntimeQuestion[];
    const millionaireAnswers = new Set(
      millionaireRun.map((question) =>
        question.choices.find((choice) => choice.id === question.correctChoiceId)?.text,
      ),
    );
    const barTriviaAnswers = new Set(run.map((question) => String(question.answer)));
    expect([...barTriviaAnswers].filter((answer) => millionaireAnswers.has(answer))).toEqual([]);

    const normal = buildBarTriviaDailySetup("nfl", "2026-09-29", "football-daily-v17-bar-trivia-sep29");
    const normalRun = normal.privateSetupEvidence.questions as Array<Record<string, unknown>>;
    expect(normalRun.some((question) => String(question.id).startsWith("theme-"))).toBe(false);
  });
});

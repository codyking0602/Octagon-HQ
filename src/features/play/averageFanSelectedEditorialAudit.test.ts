import { describe, expect, it } from "vitest";
import { buildAverageFanDailySetup } from "./averageFanDailyRuntime";
import { lockedWeightedGameForDay } from "./dailyChallengeRotation";
import {
  AVERAGE_FAN_BOARD_QUESTION_COUNT,
  AVERAGE_FAN_PLAYABLE_GRADES,
  type AverageFanQuestion,
} from "../games/averageFanEngine";
import { averageFanQuestionNamedTopics } from "../games/averageFanContentBanks";

type DailySport = "nfl" | "cfb" | "ufc";
type HistoryRow = {
  day: string;
  sport: DailySport;
  question_ids: string[];
  final_question_id: string;
};

/** Captures the actual chosen player-facing prompts, not merely candidate counts.
 * This editorial proof can be read verbatim in the exact-head CI test log. */
describe("Average Fan final selected-board editorial evidence", () => {
  it("prints five exact selected boards per sport and validates 180 days of published compositions", () => {
    const captured: Record<DailySport, number> = { nfl: 0, cfb: 0, ufc: 0 };
    let scheduled = 0;
    const repeatedNamedTopics: string[] = [];

    for (const scope of ["football", "ufc"] as const) {
      const history: HistoryRow[] = [];
      for (let offset = 0; offset < 180; offset += 1) {
        const day = new Date(Date.UTC(2026, 9, 16 + offset)).toISOString().slice(0, 10);
        if (lockedWeightedGameForDay(scope, day) !== "average_fan") continue;
        const publication = buildAverageFanDailySetup(scope, day, "average-fan-stage2-final-editorial", history);
        const sport = publication.publicSetup.sport as DailySport;
        const questions = publication.privateSetupEvidence.questions as AverageFanQuestion[];
        const final = publication.privateSetupEvidence.final_question as AverageFanQuestion;
        scheduled += 1;

        expect(questions, `${sport} ${day}`).toHaveLength(AVERAGE_FAN_BOARD_QUESTION_COUNT);
        expect(new Set([...questions.map((question) => question.id), final.id]).size, day).toBe(9);
        expect(final.protectedFinal, day).toBe(true);
        for (const grade of AVERAGE_FAN_PLAYABLE_GRADES) {
          expect(questions.filter((question) => question.grade === grade), `${sport} ${day} G${grade}`).toHaveLength(2);
        }
        const topics = new Map<string, string>();
        // Alabama is incidental opponent context in two distinct iconic
        // events: Clemson's 2016 CFP title (Deshaun Watson) and Auburn's
        // 2013 Kick Six (Chris Davis). Sharing the losing school does not
        // make them two questions about the same incident or featured player.
        const independentAlabamaEvents = new Set([
          "average-fan:cfb:authored:00-g5:watson-2016-title-420:short",
          "average-fan:cfb:authored:00-g5:kick-six-chris-davis:short",
        ]);
        for (const question of [...questions, final]) {
          expect(question.sport, question.id).toBe(sport);
          expect(question.prompt.trim().length, question.id).toBeGreaterThan(0);
          expect(question.answer.trim().length, question.id).toBeGreaterThan(0);
          for (const topic of averageFanQuestionNamedTopics(question)) {
            const earlierId = topics.get(topic);
            if (earlierId && !(
              topic === "cfb:alabama"
              && independentAlabamaEvents.has(earlierId)
              && independentAlabamaEvents.has(question.id)
            )) {
              repeatedNamedTopics.push(`${sport} ${day}: ${topic} in ${earlierId} and ${question.id}`);
            }
            if (!earlierId) topics.set(topic, question.id);
          }
          if (question.format === "four-choice") {
            expect(question.choices, question.id).toHaveLength(4);
            expect(question.choices?.filter((value) => value === question.answer), question.id).toHaveLength(1);
            expect(new Set(question.choices).size, question.id).toBe(4);
          }
        }

        if (captured[sport] < 5) {
          const board = [...questions, final].map((question) => ({
            grade: question.protectedFinal ? "Final" : question.grade,
            subject: question.subject,
            format: question.format,
            prompt: question.prompt,
            answer: question.answer,
            choices: question.choices ?? null,
            aliases: question.aliases,
          }));
          console.info(`AVERAGE_FAN_EDITORIAL_BOARD ${JSON.stringify({ sport, day, board })}`);
          captured[sport] += 1;
        }
        history.push({
          day, sport,
          question_ids: questions.map((question) => question.id),
          final_question_id: final.id,
        });
      }
    }

    for (const sport of ["nfl", "cfb", "ufc"] as const) expect(captured[sport], sport).toBe(5);
    expect(scheduled).toBeGreaterThan(30);
    // Report every repeat in one run instead of hiding all but the first.
    expect(repeatedNamedTopics, "Repeated person/program or incident in selected Daily boards").toEqual([]);
  });
});

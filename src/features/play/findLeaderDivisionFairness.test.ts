import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import {
  buildFindLeaderBoard,
  dailyFindLeaderBoard,
  findLeaderDailyContentVersionForDay,
  findLeaderQuestions,
} from "./findLeaderEngine";
import { deriveUfcCareerStats } from "./ufcCareerStats";

const divisionDefinitions = findLeaderQuestions.filter((question) => question.scope?.division);
const bySlug = new Map(canonicalRankingInputs.fighters.map((fighter) => [fighter.presentation.slug, fighter]));

function divisionStats(slug: string, division: string) {
  const fighter = bySlug.get(slug);
  expect(fighter, `Missing canonical fighter ${slug}`).toBeDefined();
  const fights = fighter!.facts.fights.filter((fight) =>
    fight.division?.trim().toLowerCase() === division.toLowerCase());
  return deriveUfcCareerStats(fights, "scoring");
}

describe("UFC Find the Leader divisional statistical integrity", () => {
  it("preserves the published October 22 heavyweight board and all older daily versions", () => {
    const october22 = dailyFindLeaderBoard("2026-10-22")!;
    expect(october22.definitionId).toBe("heavyweight-ufc-finishes-all-time");
    expect(october22.leaderId).toBe("jon-jones");
    expect(october22.leaderValue).toBe(12);
    expect(october22.version).toBe("find-leader-daily-v2");
    expect(october22.statLabel).toBe("UFC finishes by a heavyweight");
    expect(findLeaderDailyContentVersionForDay("2026-10-23")).toBe("find-leader-daily-v3-division-bout-scoped");
  });


  it("audits all eight weight-class-filtered questions, not just today's heavyweight board", () => {
    expect(divisionDefinitions).toHaveLength(8);
    for (const question of divisionDefinitions) {
      expect(question.metric === "wins" || question.metric === "finishes").toBe(true);
      expect(question.statLabel).toContain(`at ${question.scope!.division!.toLowerCase()}`);
      expect(question.statLabel).not.toMatch(/by a (heavyweight|lightweight|welterweight|middleweight|bantamweight|featherweight)/);
    }
  });

  it("does not credit light-heavyweight finishes to Jon Jones's heavyweight record", () => {
    const jones = bySlug.get("jon-jones")!;
    const career = deriveUfcCareerStats(jones.facts.fights, "scoring").finishes;
    const heavyweightFinishes = divisionStats("jon-jones", "Heavyweight").finishes;
    const ngannouFinishes = divisionStats("francis-ngannou", "Heavyweight").finishes;

    expect(heavyweightFinishes).toBe(2);
    expect(career).toBeGreaterThan(heavyweightFinishes);
    expect(ngannouFinishes).toBeGreaterThan(heavyweightFinishes);
  });

  it.each(divisionDefinitions.map((question) => [question.id] as const))(
    "counts only bouts in the stated division for %s",
    (id) => {
      const question = divisionDefinitions.find((row) => row.id === id)!;
      const board = buildFindLeaderBoard(question, `division-fairness|${id}`, "2026-10-23");
      expect(board, `No playable board for ${id}`).not.toBeNull();
      if (!board) return;

      expect(board.candidates).toHaveLength(10);
      expect(board.question.toLowerCase()).toContain(`at ${question.scope!.division!.toLowerCase()}`);
      expect(board.context.toLowerCase()).toContain("only bouts contested");
      expect(board.context).toContain("fights in other divisions do not");

      for (const candidate of board.candidates) {
        const scoped = divisionStats(candidate.id, question.scope!.division!);
        expect(candidate.value, `Wrong ${question.scope!.division} count for ${candidate.name}`).toBe(
          question.metric === "wins" ? scoped.wins : scoped.finishes,
        );
      }
      const winner = board.candidates.find((row) => row.id === board.leaderId)!;
      expect(winner.value).toBe(board.leaderValue);
      expect(board.candidates.every((candidate) => candidate.value <= winner.value)).toBe(true);
    },
  );

  it("keeps unrestricted career categories career-wide", () => {
    const question = findLeaderQuestions.find((row) => row.id === "ufc-finishes-all-time")!;
    const board = buildFindLeaderBoard(question, "career-scope-regression", "2026-10-23")!;
    expect(board).not.toBeNull();
    for (const candidate of board.candidates) {
      expect(candidate.value).toBe(
        deriveUfcCareerStats(bySlug.get(candidate.id)!.facts.fights, "scoring").finishes,
      );
    }
  });
});

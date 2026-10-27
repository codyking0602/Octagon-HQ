import { describe, expect, it } from "vitest";
import {
  footballFindLeaderFeaturedQuestions,
  footballFindLeaderQuestions,
} from "../back-room/footballFindLeaderModel";
import { FOOTBALL_FIND_LEADER_FEATURED_START_DAY } from "../back-room/footballFindLeaderStats";
import { buildFootballDailyPersistenceSetup } from "./footballDailyPublicationFindLeader";
import {
  footballTodayGameForDay,
  footballTodayScheduleVersionForDay,
} from "./footballTodayChallengeSession";

function dayAt(index: number) {
  const date = new Date("2026-10-28T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
}

describe("Football Find the Leader six-month best-of-best Daily gate", () => {
  it("switches only future official Dailies to the curated 21-metric slate", () => {
    expect(FOOTBALL_FIND_LEADER_FEATURED_START_DAY).toBe("2026-10-28");
    const featuredQuestions = new Set(footballFindLeaderFeaturedQuestions.map((row) => row.question));
    expect(footballFindLeaderQuestions.length).toBeGreaterThan(featuredQuestions.size);

    const lineupIds = new Set<string>();
    const seenQuestions = new Set<string>();
    let dailyDates = 0;
    for (let index = 0; index < 180; index += 1) {
      const day = dayAt(index);
      if (footballTodayGameForDay(day) !== "find_leader") continue;
      dailyDates += 1;
      const scheduleVersion = footballTodayScheduleVersionForDay(day);
      const publication = buildFootballDailyPersistenceSetup(day, scheduleVersion, "find_leader");
      const rounds = publication.publicSetup.rounds as Array<{
        question: string;
        league: string;
        candidates: Array<{ id: string }>;
      }>;
      const revealRounds = publication.revealSetup.rounds as Array<{
        leader_id: string;
        candidates: Array<{ id: string; value: number }>;
      }>;
      expect(rounds).toHaveLength(2);
      expect(revealRounds).toHaveLength(2);
      expect(new Set(rounds.map((round) => round.league))).toEqual(new Set(["NFL", "CFB"]));
      rounds.forEach((round, child) => {
        expect(featuredQuestions.has(round.question), `${day}:${child}:${round.question}`).toBe(true);
        expect(round.candidates).toHaveLength(10);
        expect(new Set(round.candidates.map((row) => row.id)).size).toBe(10);
        const reveal = revealRounds[child]!;
        expect(reveal.candidates).toHaveLength(10);
        expect(reveal.candidates.some((row) => row.id === reveal.leader_id)).toBe(true);
        const candidateValues = reveal.candidates.map((row) => row.value);
        expect(candidateValues.every(Number.isFinite)).toBe(true);
        seenQuestions.add(round.question);
        lineupIds.add(round.candidates.map((row) => row.id).sort().join("|"));
      });
    }
    expect(dailyDates).toBeGreaterThanOrEqual(16);
    expect(dailyDates).toBeLessThanOrEqual(23);
    expect(seenQuestions.size).toBeGreaterThanOrEqual(10);
    expect(lineupIds.size).toBeGreaterThanOrEqual(dailyDates * 1.5);
  }, 60_000);
});

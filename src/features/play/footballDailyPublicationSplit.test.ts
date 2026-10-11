import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup as buildAverageFan } from "./footballDailyPublicationAverageFan";
import { buildFootballDailyPersistenceSetup as buildBarTrivia } from "./footballDailyPublicationBarTrivia";
import { buildFootballDailyPersistenceSetup as buildBlindResume } from "./footballDailyPublicationBlindResume";
import { buildFootballDailyPersistenceSetup as buildComparison } from "./footballDailyPublicationComparison";
import { buildFootballDailyPersistenceSetup as buildFindLeader, curateOfficialQbSeasonBoard } from "./footballDailyPublicationFindLeader";
import { buildFootballFindLeaderBoard, footballFindLeaderMetricRows, footballFindLeaderQuestions } from "../back-room/footballFindLeaderModel";
import { buildFootballDailyPersistenceSetup as buildHitNumber } from "./footballDailyPublicationHitNumber";
import { buildFootballDailyPersistenceSetup as buildMillionaire } from "./footballDailyPublicationMillionaire";
import { buildFootballDailyPersistenceSetup as buildSportsFeud } from "./footballDailyPublicationSportsFeud";
import { buildFootballDailyPersistenceSetup as buildWavelength } from "./footballDailyPublicationWavelength";
import { buildFootballDailyPersistenceSetup as buildWhoAmI } from "./footballDailyPublicationWhoAmI";
import {
  buildFootballTodayPersistenceSetup,
  footballAverageFanLocalHistory,
  footballTodayGameForDay,
  footballTodayScheduleVersionForDay,
} from "./footballTodayChallengeSession";
import { buildFootballOfficialDailySetup } from "./footballTodayChallengeRuntime";
import type { OfficialDailyGameType } from "./todaysChallengeRuntime";

const builderFor = (gameType: OfficialDailyGameType) => {
  switch (gameType) {
    case "who_am_i": return buildWhoAmI;
    case "wavelength": return buildWavelength;
    case "find_leader": return buildFindLeader;
    case "blind_resume": return buildBlindResume;
    case "hit_the_number": return buildHitNumber;
    case "millionaire": return buildMillionaire;
    case "sports_feud": return buildSportsFeud;
    case "bar_trivia": return buildBarTrivia;
    case "average_fan": return buildAverageFan;
    case "blind_rank_5":
    case "keep_4_cut_4":
      return buildComparison;
  }
};

function addDays(day: string, offset: number) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

describe("split Football Daily publication runtimes", () => {
  it("matches the canonical persisted setup across the live future rotation", () => {
    for (let offset = 0; offset < 40; offset += 1) {
      const day = addDays("2026-09-13", offset);
      const gameType = footballTodayGameForDay(day);
      const scheduleVersion = footballTodayScheduleVersionForDay(day);
      const expected = buildFootballTodayPersistenceSetup(day);
      const builder = builderFor(gameType);
      expect(builder).toBeTypeOf("function");
      const actual = builder!(
        day,
        scheduleVersion,
        gameType,
        gameType === "average_fan" ? footballAverageFanLocalHistory(day) : undefined,
      );
      expect(actual).toEqual(expected);
    }
  }, 60_000);

  it("compares landmark NFL QB passing seasons in Daily, including Peyton Manning's 2013 record", () => {
    const question = footballFindLeaderQuestions.find((row) => row.metricId === "qb-season-passing-yards");
    expect(question).toBeDefined();
    const casual = buildFootballFindLeaderBoard(question!, "daily-record-anchor-regression");
    expect(casual).not.toBeNull();
    const curated = curateOfficialQbSeasonBoard(casual!, "daily-record-anchor-regression");
    const topRecord = footballFindLeaderMetricRows("qb-season-passing-yards")[0];
    expect(topRecord?.name).toBe("Peyton Manning 2013");
    expect(curated.candidates).toHaveLength(10);
    expect(new Set(curated.candidates.map((candidate) => candidate.id)).size).toBe(10);
    expect(new Set(curated.candidates.map((candidate) => candidate.displayName)).size).toBe(10);
    expect(curated.candidates.every(({ name }) => /\\s\\d{4}$/.test(name))).toBe(true);
    expect(curated.candidates.map(({ name }) => name)).toContain("Peyton Manning 2013");
    expect(curated.leaderId).toBe(topRecord?.id);
    expect(curated.leaderValue).toBe(topRecord?.value);
    expect(curateOfficialQbSeasonBoard(casual!, "daily-record-anchor-regression")).toEqual(curated);

    const persisted = buildFindLeader("2026-10-11", "football-daily-v20-resume-v18-oct3", "find_leader");
    const publicRounds = persisted.publicSetup.rounds as Array<{ candidates: Array<{ name: string }>; question: string }>;
    expect(publicRounds).toHaveLength(2);
    expect(publicRounds[0]?.question).toContain("passing yards");
    expect(publicRounds[0]?.candidates.map(({ name }) => name)).toContain("Peyton Manning 2013");
    expect(publicRounds[1]?.question).toContain("point differential");
  });

  it("keeps Casual challenge boards and non-QB-season Daily questions unchanged", () => {
    const question = footballFindLeaderQuestions.find((row) => row.metricId === "cfb-point-differential");
    expect(question).toBeDefined();
    const source = buildFootballFindLeaderBoard(question!, "cfb-unchanged-regression");
    expect(source).not.toBeNull();
    expect(curateOfficialQbSeasonBoard(source!, "cfb-unchanged-regression")).toBe(source);
  });

  it("preserves standalone Blind Resume and Blind Rank publication semantics", () => {
    const day = "2026-09-21";
    const scheduleVersion = footballTodayScheduleVersionForDay(day);

    for (const gameType of ["blind_resume", "blind_rank_5"] as const) {
      const expected = {
        gameType,
        scheduleVersion,
        ...buildFootballOfficialDailySetup(gameType, day, scheduleVersion),
      };
      const builder = builderFor(gameType);
      expect(builder).toBeTypeOf("function");
      expect(builder!(day, scheduleVersion, gameType)).toEqual(expected);
    }
  });
});

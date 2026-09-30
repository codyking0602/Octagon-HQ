import { describe, expect, it } from "vitest";
import { buildFootballDailyPersistenceSetup as buildAverageFan } from "./footballDailyPublicationAverageFan";
import { buildFootballDailyPersistenceSetup as buildBarTrivia } from "./footballDailyPublicationBarTrivia";
import { buildFootballDailyPersistenceSetup as buildBlindResume } from "./footballDailyPublicationBlindResume";
import { buildFootballDailyPersistenceSetup as buildComparison } from "./footballDailyPublicationComparison";
import { buildFootballDailyPersistenceSetup as buildFindLeader } from "./footballDailyPublicationFindLeader";
import { buildFootballDailyPersistenceSetup as buildHitNumber } from "./footballDailyPublicationHitNumber";
import { buildFootballDailyPersistenceSetup as buildMillionaire } from "./footballDailyPublicationMillionaire";
import { buildFootballDailyPersistenceSetup as buildSportsFeud } from "./footballDailyPublicationSportsFeud";
import { buildFootballDailyPersistenceSetup as buildWavelength } from "./footballDailyPublicationWavelength";
import { buildFootballDailyPersistenceSetup as buildWhoAmI } from "./footballDailyPublicationWhoAmI";
import {
  buildFootballTodayPersistenceSetup,
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

function averageFanHistoryBefore(day: string) {
  const rows: Array<Record<string, unknown>> = [];
  for (let offset = 0; addDays("2026-10-01", offset) < day; offset += 1) {
    const priorDay = addDays("2026-10-01", offset);
    if (footballTodayGameForDay(priorDay) !== "average_fan") continue;
    rows.push({
      day: priorDay,
      sport: rows.length % 2 === 0 ? "cfb" : "nfl",
      question_ids: [],
      final_question_id: null,
    });
  }
  return rows;
}

function buildSplitPublication(gameType: OfficialDailyGameType, day: string, scheduleVersion: string) {
  if (gameType === "average_fan") {
    return buildAverageFan(day, scheduleVersion, gameType, averageFanHistoryBefore(day));
  }
  return builderFor(gameType)(day, scheduleVersion, gameType);
}

describe("split Football Daily publication runtimes", () => {
  it("matches the canonical persisted setup across the live future rotation", () => {
    for (let offset = 0; offset < 40; offset += 1) {
      const day = addDays("2026-09-13", offset);
      const gameType = footballTodayGameForDay(day);
      const scheduleVersion = footballTodayScheduleVersionForDay(day);
      const expected = buildFootballTodayPersistenceSetup(day);
      const actual = buildSplitPublication(gameType, day, scheduleVersion);
      expect(actual).toEqual(expected);
    }
  }, 60_000);

  it("preserves standalone Blind Resume and Blind Rank publication semantics", () => {
    const day = "2026-09-21";
    const scheduleVersion = footballTodayScheduleVersionForDay(day);

    for (const gameType of ["blind_resume", "blind_rank_5"] as const) {
      const expected = {
        gameType,
        scheduleVersion,
        ...buildFootballOfficialDailySetup(gameType, day, scheduleVersion),
      };
      expect(builderFor(gameType)(day, scheduleVersion, gameType)).toEqual(expected);
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  MLB_POSTSEASON_CHALLENGE_SCHEDULE,
  mlbCentralDateKey,
  resolveMlbFeaturedChallenge,
} from "./mlbChallengeSchedule";

describe("MLB postseason challenge schedule", () => {
  it("locks the sixteen-game every-other-day cadence through October 27", () => {
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.date)).toEqual([
      "2026-09-27",
      "2026-09-29",
      "2026-10-01",
      "2026-10-03",
      "2026-10-05",
      "2026-10-07",
      "2026-10-09",
      "2026-10-11",
      "2026-10-13",
      "2026-10-15",
      "2026-10-17",
      "2026-10-19",
      "2026-10-21",
      "2026-10-23",
      "2026-10-25",
      "2026-10-27",
    ]);
    expect(new Set(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.id)).size).toBe(16);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.filter((challenge) => challenge.ready)).toHaveLength(11);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.filter((challenge) => !challenge.ready).map((challenge) => challenge.id)).toEqual([
      "mlb-2026-play-12",
      "mlb-2026-play-13",
      "mlb-2026-play-14",
      "mlb-2026-play-15",
      "mlb-2026-play-16",
    ]);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.every((challenge) => challenge.route === "/mlb/challenge")).toBe(true);
  });

  it("uses the America/Chicago calendar boundary", () => {
    expect(mlbCentralDateKey(new Date("2026-09-27T04:59:59Z"))).toBe("2026-09-26");
    expect(mlbCentralDateKey(new Date("2026-09-27T05:00:00Z"))).toBe("2026-09-27");
  });

  it("preserves the two already-played challenge identities", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-09-27T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-01",
      game_type: "find_leader",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-09-29T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-02",
      game_type: "wavelength",
      ready: true,
      is_live: true,
    });
  });

  it("uses the balanced approved rotation after September 29", () => {
    const expected = [
      ["2026-10-01", "mlb-2026-play-03", "millionaire"],
      ["2026-10-03", "mlb-2026-play-04", "who_am_i"],
      ["2026-10-05", "mlb-2026-play-06", "sports_feud"],
      ["2026-10-07", "mlb-2026-play-12", "average_fan"],
      ["2026-10-09", "mlb-2026-play-05", "blind_resume"],
      ["2026-10-11", "mlb-2026-play-11", "bar_trivia"],
      ["2026-10-13", "mlb-2026-play-13", "find_leader"],
      ["2026-10-15", "mlb-2026-play-08", "millionaire"],
      ["2026-10-17", "mlb-2026-play-07", "hit_the_number"],
      ["2026-10-19", "mlb-2026-play-14", "who_am_i"],
      ["2026-10-21", "mlb-2026-play-09", "wavelength"],
      ["2026-10-23", "mlb-2026-play-15", "average_fan"],
      ["2026-10-25", "mlb-2026-play-10", "sports_feud"],
      ["2026-10-27", "mlb-2026-play-16", "bar_trivia"],
    ] as const;

    for (const [date, id, gameType] of expected) {
      expect(resolveMlbFeaturedChallenge(new Date(`${date}T12:00:00Z`))).toMatchObject({
        id,
        game_type: gameType,
        is_live: true,
      });
    }
  });
});

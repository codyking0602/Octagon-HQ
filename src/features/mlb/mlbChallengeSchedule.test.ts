import { describe, expect, it } from "vitest";
import {
  MLB_POSTSEASON_CHALLENGE_SCHEDULE,
  mlbCentralDateKey,
  resolveMlbFeaturedChallenge,
} from "./mlbChallengeSchedule";

describe("MLB postseason challenge schedule", () => {
  it("locks the approved 16-game every-other-day cadence through October 27", () => {
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
    expect(new Set(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.slot)).size).toBe(16);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.every((challenge) => challenge.route === "/mlb/challenge")).toBe(true);

    const notReady = MLB_POSTSEASON_CHALLENGE_SCHEDULE
      .filter((challenge) => !challenge.ready)
      .map((challenge) => challenge.id);
    expect(notReady).toEqual([
      "mlb-2026-play-12",
      "mlb-2026-play-15",
    ]);
  });

  it("keeps the approved final game-type mix balanced", () => {
    const counts = MLB_POSTSEASON_CHALLENGE_SCHEDULE.reduce<Record<string, number>>((acc, challenge) => {
      acc[challenge.game_type] = (acc[challenge.game_type] ?? 0) + 1;
      return acc;
    }, {});

    expect(counts).toEqual({
      find_leader: 2,
      wavelength: 2,
      millionaire: 2,
      who_am_i: 2,
      sports_feud: 2,
      average_fan: 2,
      blind_resume: 1,
      bar_trivia: 2,
      hit_the_number: 1,
    });
  });

  it("uses the America/Chicago calendar boundary", () => {
    expect(mlbCentralDateKey(new Date("2026-09-27T04:59:59Z"))).toBe("2026-09-26");
    expect(mlbCentralDateKey(new Date("2026-09-27T05:00:00Z"))).toBe("2026-09-27");
  });

  it("advances existing production games onto their moved dates", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-05T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-06",
      game_type: "sports_feud",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-11T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-11",
      game_type: "bar_trivia",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-21T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-09",
      game_type: "wavelength",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-25T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-10",
      game_type: "sports_feud",
      ready: true,
      is_live: true,
    });
  });

  it("keeps only the two Average Fan dates reserved while the three authored additions are ready", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-07T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-12",
      game_type: "average_fan",
      ready: false,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-13T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-13",
      game_type: "find_leader",
      ready: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-19T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-14",
      game_type: "who_am_i",
      ready: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-23T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-15",
      game_type: "average_fan",
      ready: false,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-27T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-16",
      game_type: "bar_trivia",
      ready: true,
      is_live: true,
    });
  });
});

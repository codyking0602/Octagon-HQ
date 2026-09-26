import { describe, expect, it } from "vitest";
import {
  MLB_POSTSEASON_CHALLENGE_SCHEDULE,
  mlbCentralDateKey,
  resolveMlbFeaturedChallenge,
} from "./mlbChallengeSchedule";

describe("MLB postseason challenge schedule", () => {
  it("locks all ten approved postseason dates in order", () => {
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.date)).toEqual([
      "2026-09-29",
      "2026-10-01",
      "2026-10-03",
      "2026-10-06",
      "2026-10-09",
      "2026-10-12",
      "2026-10-15",
      "2026-10-18",
      "2026-10-23",
      "2026-10-27",
    ]);
    expect(new Set(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.id)).size).toBe(10);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE
      .filter((challenge) => challenge.ready)
      .map((challenge) => challenge.id)).toEqual([
        "mlb-2026-play-01",
        "mlb-2026-play-02",
        "mlb-2026-play-03",
        "mlb-2026-play-04",
        "mlb-2026-play-05",
        "mlb-2026-play-06",
        "mlb-2026-play-09",
        "mlb-2026-play-10",
      ]);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.every((challenge) => challenge.route === "/mlb/challenge")).toBe(true);
  });

  it("uses the America/Chicago calendar boundary", () => {
    expect(mlbCentralDateKey(new Date("2026-09-29T04:59:59Z"))).toBe("2026-09-28");
    expect(mlbCentralDateKey(new Date("2026-09-29T05:00:00Z"))).toBe("2026-09-29");
  });

  it("keeps the first challenge locked before launch and activates it at midnight Central", () => {
    const before = resolveMlbFeaturedChallenge(new Date("2026-09-29T04:59:59Z"));
    const live = resolveMlbFeaturedChallenge(new Date("2026-09-29T05:00:00Z"));

    expect(before).toMatchObject({
      id: "mlb-2026-play-01",
      game_type: "find_leader",
      ready: true,
      is_live: false,
    });
    expect(live).toMatchObject({
      id: "mlb-2026-play-01",
      game_type: "find_leader",
      ready: true,
      is_live: true,
    });
  });

  it("automatically advances both Wavelength dates without a manual flip", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-01T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-02",
      game_type: "wavelength",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-23T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-09",
      game_type: "wavelength",
      ready: true,
      is_live: true,
    });
  });

  it("activates the two production Sports Feud dates with the approved spacing", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-12T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-06",
      game_type: "sports_feud",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-27T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-10",
      game_type: "sports_feud",
      ready: true,
      is_live: true,
    });
  });

  it("moves Hit the Number and Millionaire forward without marking unfinished content ready", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-15T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-07",
      game_type: "hit_the_number",
      ready: false,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-18T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-08",
      game_type: "millionaire",
      ready: false,
      is_live: true,
    });
  });

  it("automatically activates the production Millionaire challenge on October 3", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-03T04:59:59Z"))).toMatchObject({
      id: "mlb-2026-play-02",
      game_type: "wavelength",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-03T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-03",
      game_type: "millionaire",
      ready: true,
      is_live: true,
    });
  });

  it("automatically activates the production Who Am I challenge on October 6", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-06T04:59:59Z"))).toMatchObject({
      id: "mlb-2026-play-03",
      game_type: "millionaire",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-06T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-04",
      game_type: "who_am_i",
      ready: true,
      is_live: true,
    });
  });

  it("automatically activates the production Blind Resume challenge on October 9", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-09T04:59:59Z"))).toMatchObject({
      id: "mlb-2026-play-04",
      game_type: "who_am_i",
      ready: true,
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-09T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-05",
      game_type: "blind_resume",
      ready: true,
      is_live: true,
    });
  });

});

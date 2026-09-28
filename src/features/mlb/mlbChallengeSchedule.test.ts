import { describe, expect, it } from "vitest";
import {
  MLB_POSTSEASON_CHALLENGE_SCHEDULE,
  mlbCentralDateKey,
  resolveMlbFeaturedChallenge,
} from "./mlbChallengeSchedule";

describe("MLB postseason challenge schedule", () => {
  it("locks the pulled-forward eleven-challenge cadence in order", () => {
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.date)).toEqual([
      "2026-09-27",
      "2026-09-29",
      "2026-10-01",
      "2026-10-03",
      "2026-10-06",
      "2026-10-09",
      "2026-10-12",
      "2026-10-15",
      "2026-10-18",
      "2026-10-21",
      "2026-10-23",
    ]);
    expect(new Set(MLB_POSTSEASON_CHALLENGE_SCHEDULE.map((challenge) => challenge.id)).size).toBe(11);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.every((challenge) => challenge.ready)).toBe(true);
    expect(MLB_POSTSEASON_CHALLENGE_SCHEDULE.every((challenge) => challenge.route === "/mlb/challenge")).toBe(true);
  });

  it("uses the America/Chicago calendar boundary", () => {
    expect(mlbCentralDateKey(new Date("2026-09-27T04:59:59Z"))).toBe("2026-09-26");
    expect(mlbCentralDateKey(new Date("2026-09-27T05:00:00Z"))).toBe("2026-09-27");
  });

  it("starts Find the Leader on September 27 and advances to Wavelength on September 29", () => {
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

  it("advances the middle postseason run without manual flips", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-01T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-03",
      game_type: "millionaire",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-03T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-04",
      game_type: "who_am_i",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-06T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-05",
      game_type: "blind_resume",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-09T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-06",
      game_type: "sports_feud",
      is_live: true,
    });
  });

  it("keeps the pulled-forward back half and leaves October 27 open for a future game", () => {
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-12T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-07",
      game_type: "hit_the_number",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-15T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-08",
      game_type: "millionaire",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-18T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-09",
      game_type: "wavelength",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-21T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-11",
      game_type: "bar_trivia",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-23T05:00:00Z"))).toMatchObject({
      id: "mlb-2026-play-10",
      game_type: "sports_feud",
      is_live: true,
    });
    expect(resolveMlbFeaturedChallenge(new Date("2026-10-27T12:00:00Z"))?.id).toBe("mlb-2026-play-10");
  });
});

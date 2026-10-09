import { describe, expect, it, vi } from "vitest";
import {
  loadSportChampionship,
  parseSportChampionship,
  SPORT_CHAMPIONSHIP_PLACEMENTS,
  SPORT_CHAMPIONSHIP_WEIGHTS,
} from "./sportChampionshipRepository";

const cody = "11111111-1111-4111-8111-111111111111";

function makeProjection(sport: "football" | "ufc") {
  const featured = sport === "football";
  const entry = {
    profile_id: cody,
    display_name: "Cody",
    initials: "CK",
    is_current_user: true,
    rank: 1,
    rating: 88,
    picks_rating: 90,
    daily_rating: 80,
    featured_rating: featured ? 100 : 0,
    picks_rank: 1,
    daily_rank: 2,
    featured_rank: 1,
    picks_played: 3,
    daily_played: 7,
    featured_played: featured ? 1 : 0,
  };
  return {
    sport,
    season: 2026,
    field_size: 6,
    weights: featured
      ? { picks: 60, daily: 30, featured: 10 }
      : { picks: 60, daily: 40, featured: 0 },
    event_counts: {
      picks: 3,
      daily: 7,
      featured: featured ? 1 : 0,
    },
    entries: [entry],
    own: entry,
  };
}

describe("Football and UFC Championship projection", () => {
  it("locks the placement curve and 60/30/10 formula", () => {
    expect(SPORT_CHAMPIONSHIP_PLACEMENTS).toEqual([100, 92, 85, 79, 74, 70]);
    expect(SPORT_CHAMPIONSHIP_WEIGHTS).toEqual({
      picks: 60, daily: 30, featured: 10,
    });
    expect(90 * .6 + 80 * .3 + 100 * .1).toBe(88);
  });

  it.each(["football", "ufc"] as const)(
    "loads and validates %s Championship independently of weekly trophies",
    async (sport) => {
      const projected = makeProjection(sport);
      const rpc = vi.fn().mockResolvedValue({ data: projected, error: null });
      const result = await loadSportChampionship(sport, 2026, { rpc });
      expect(rpc).toHaveBeenCalledWith("get_sport_championship", {
        p_sport: sport, p_season: 2026,
      });
      expect(result).toEqual(projected);
      expect(result.own?.profile_id).toBe(cody);
      expect(result.weights.picks + result.weights.daily + result.weights.featured)
        .toBe(100);
    },
  );

  it("rejects invalid/malformed Championship data instead of showing fictitious ratings", () => {
    expect(() => parseSportChampionship({
      ...makeProjection("football"),
      entries: [{ ...makeProjection("football").entries[0], rank: -1 }],
    })).toThrow();
  });

  it("propagates backend failures cleanly", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null, error: { message: "Championship RPC unavailable" },
    });
    await expect(loadSportChampionship("football", 2026, { rpc }))
      .rejects.toThrow("Championship RPC unavailable");
  });
});

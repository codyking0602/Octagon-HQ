import { describe, expect, it, vi } from "vitest";
import { createWeeklyChampionshipRecapRepository } from "./weeklyChampionshipRecapRepository";

describe("weekly championship recap repository", () => {
  it("loads the sport-scoped recap and acknowledges the exact completed week", async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({
        data: {
          sport: "football",
          week_start: "2026-09-15",
          week_end: "2026-09-21",
          entries: [{
            rank: 1,
            profile_id: "11111111-1111-4111-8111-111111111111",
            display_name: "Shane",
            initials: "SH",
            avatar_photo_data: null,
            wins: 4,
            played: 7,
            average_score: 84.7,
            is_current_user: false,
          }],
          auction_bonus: {
            profile_id: "22222222-2222-4222-8222-222222222222",
            display_name: "Cody",
            subject_key: "cfb-best-teams-since-2000",
            subject_label: "Best CFB Teams Since 2000",
          },
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: true, error: null });

    const repository = createWeeklyChampionshipRecapRepository({ rpc });
    const recap = await repository!.load("football");

    expect(recap?.weekStart).toBe("2026-09-15");
    expect(recap?.entries[0]).toMatchObject({ displayName: "Shane", wins: 4, played: 7 });
    expect(recap?.auctionBonus?.displayName).toBe("Cody");

    await repository!.acknowledge("football", "2026-09-15");
    expect(rpc).toHaveBeenNthCalledWith(1, "get_my_daily_challenge_weekly_recap", {
      p_sport: "football",
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "acknowledge_my_daily_challenge_weekly_recap", {
      p_sport: "football",
      p_week_start: "2026-09-15",
    });
  });

  it("returns null when the member has no eligible unseen recap", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    const repository = createWeeklyChampionshipRecapRepository({ rpc });
    await expect(repository!.load("ufc")).resolves.toBeNull();
  });
});

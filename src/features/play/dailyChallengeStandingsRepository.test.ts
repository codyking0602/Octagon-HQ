import { describe, expect, it, vi } from "vitest";
import { createTodayChallengeRepository } from "./todayChallengeRepository";

describe("Daily Challenge Standings repository", () => {
  it("uses the existing generalized repository owner and maps all approved standings fields", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        player_count: 2,
        current_user_rank: 1,
        current_user_wins: 8,
        current_week_start: "2026-08-17",
        current_week_end: "2026-08-23",
        entries: [{
          rank: 1,
          profile_id: "11111111-1111-4111-8111-111111111111",
          display_name: "Cody",
          initials: "CK",
          avatar_photo_data: "data:image/webp;base64,cody",
          wins: 8,
          played: 13,
          average_score: 84.6,
          current_streak: 6,
          best_streak: 13,
          game_averages: {
            find_leader: 84.1,
            wavelength: 78.4,
            blind_resume: 90.6,
            blind_rank_5: 82,
            keep_4_cut_4: 87.5,
          },
          is_current_user: true,
          weekly_rank: 1,
          weekly_wins: 4,
          weekly_played: 6,
          weekly_average_score: 88.2,
          total_wins: 8,
          all_time_played: 13,
          all_time_average_score: 84.6,
          longest_streak: 13,
          weekly_titles: 3,
        }],
      },
      error: null,
    });
    const repository = createTodayChallengeRepository({
      functions: { invoke: vi.fn() },
      rpc,
    } as never)!;

    await expect(repository.loadStandings()).resolves.toEqual({
      playerCount: 2,
      currentUserRank: 1,
      currentUserWins: 8,
      currentWeekStart: "2026-08-17",
      currentWeekEnd: "2026-08-23",
      entries: [{
        rank: 1,
        profileId: "11111111-1111-4111-8111-111111111111",
        displayName: "Cody",
        initials: "CK",
        avatarPhotoData: "data:image/webp;base64,cody",
        wins: 8,
        played: 13,
        averageScore: 84.6,
        currentStreak: 6,
        bestStreak: 13,
        gameAverages: {
          findLeader: 84.1,
          wavelength: 78.4,
          blindResume: 90.6,
          blindRank5: 82,
          keep4Cut4: 87.5,
          hitTheNumber: null,
        },
        isCurrentUser: true,
        weeklyRank: 1,
        weeklyWins: 4,
        weeklyPlayed: 6,
        weeklyAverageScore: 88.2,
        weeklyTitles: 3,
      }],
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("get_daily_challenge_standings", undefined);
  });
});

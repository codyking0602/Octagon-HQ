import { describe, expect, it, vi } from "vitest";
import { createTodayChallengeRepository } from "./todayChallengeRepository";

describe("Daily Challenge Standings repository", () => {
  it("uses the existing generalized repository owner and maps all approved standings fields", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        player_count: 2,
        current_user_rank: 1,
        current_user_wins: 8,
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
        },
        isCurrentUser: true,
      }],
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("get_daily_challenge_standings", undefined);
  });
});

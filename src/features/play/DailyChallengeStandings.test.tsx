import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DailyChallengeStandings } from "./DailyChallengeStandings";
import type { TodayChallengeStandings, TodayChallengeStandingsEntry } from "./todayChallengeRepository";

function member(overrides: Partial<TodayChallengeStandingsEntry>): TodayChallengeStandingsEntry {
  return {
    rank: 1, profileId: "11111111-1111-4111-8111-111111111111", displayName: "Cody", initials: "CK",
    avatarPhotoData: null, wins: 25, played: 30, averageScore: 84.6, currentStreak: 6, bestStreak: 13,
    gameAverages: { findLeader: 84, wavelength: null, blindResume: 90, blindRank5: 82, keep4Cut4: 87 },
    isCurrentUser: false, weeklyRank: 1, weeklyWins: 4, weeklyPlayed: 6, weeklyAverageScore: 88.2, weeklyTitles: 2,
    ...overrides,
  };
}

describe("Daily Challenge championship standings", () => {
  it("makes titles the career rank, preserves backend weekly rank, and hides inactive members", () => {
    const standings: TodayChallengeStandings = {
      playerCount: 4, currentUserRank: 1, currentUserWins: 25,
      currentWeekStart: "2026-08-17", currentWeekEnd: "2026-08-23",
      entries: [
        member({ isCurrentUser: true }),
        member({ profileId: "22222222-2222-4222-8222-222222222222", displayName: "Shane", initials: "SH", wins: 40, weeklyTitles: 2, weeklyRank: 2, weeklyWins: 2 }),
        member({ profileId: "33333333-3333-4333-8333-333333333333", displayName: "Alex", initials: "AL", wins: 50, weeklyTitles: 1, weeklyPlayed: 0 }),
        member({ profileId: "44444444-4444-4444-8444-444444444444", displayName: "Inactive", initials: "IN", wins: 0, played: 0, averageScore: 0, weeklyTitles: 0, weeklyPlayed: 0 }),
      ],
    };
    const { container } = render(<DailyChallengeStandings standings={standings} loading={false} error={null} onRefresh={vi.fn()} />);
    fireEvent.click(screen.getByText("Championship Standings"));
    expect(container.querySelector(".daily-standings__summary-status")?.textContent).toContain("YOUR RANK #1 · 2 WEEKLY TITLES");
    expect(container.querySelector(".daily-standings__career-title")?.textContent).toBe("CAREER STANDINGS");
    expect(screen.getByText("THIS WEEK · AUG 17–23")).toBeInTheDocument();
    const week = screen.getByRole("region", { name: "Current week race" });
    expect(within(week).getByText("#2")).toBeInTheDocument();
    expect(within(week).getByText("2 wins")).toBeInTheDocument();
    expect(screen.getAllByText("#1").length).toBeGreaterThan(1);
    expect(container.querySelectorAll(".daily-standings__titles")).toHaveLength(3);
    expect(screen.getAllByText("6d")).not.toHaveLength(0);
    expect(screen.getAllByText("13d")).not.toHaveLength(0);
    expect(container.querySelector(".daily-standings__header")?.textContent).not.toContain("Played");
    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "SHOW 1 INACTIVE" }));
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });
});

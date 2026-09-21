import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeeklyChampionshipRecap } from "./WeeklyChampionshipRecap";
import type { DailyChallengeWeeklyRecap } from "./todayChallengeRepository";

const footballRecap: Extract<DailyChallengeWeeklyRecap, { available: true }> = {
  available: true, sport: "football", weekStart: "2026-09-15", weekEnd: "2026-09-21",
  entries: [
    { rank: 1, profileId: "11111111-1111-4111-8111-111111111111", displayName: "Shane", initials: "SH", avatarPhotoData: null, wins: 4, played: 7, averageScore: 84.7, isChampion: true, isCurrentUser: false },
    { rank: 2, profileId: "22222222-2222-4222-8222-222222222222", displayName: "Cody", initials: "CK", avatarPhotoData: null, wins: 3, played: 7, averageScore: 81.3, isChampion: false, isCurrentUser: true },
  ],
  auctionBonus: { profileId: "22222222-2222-4222-8222-222222222222", displayName: "Cody", wins: 1, label: "Best CFB Teams Since 2000 Champion" },
};

describe("weekly Play championship recap", () => {
  it("matches the Football Play recap contract and requires OK to acknowledge", () => {
    const onAcknowledge = vi.fn();
    render(<WeeklyChampionshipRecap recap={footballRecap} sport="football" busy={false} error={null} onAcknowledge={onAcknowledge} />);
    expect(screen.getByRole("heading", { name: "FOOTBALL WEEKLY CHAMPION" })).toBeInTheDocument();
    expect(screen.getByText("Week of Sep 15–21")).toBeInTheDocument();
    expect(screen.getByText("Cody +1 win")).toBeInTheDocument();
    expect(screen.getByText("Best CFB Teams Since 2000 Champion")).toBeInTheDocument();
    expect(screen.getByText("YOU")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /close/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onAcknowledge).toHaveBeenCalledTimes(1);
  });
  it("uses the same native layout for UFC without an auction bonus", () => {
    render(<WeeklyChampionshipRecap recap={{ ...footballRecap, sport: "ufc", weekStart: "2026-09-14", weekEnd: "2026-09-20", auctionBonus: null }} sport="ufc" busy={false} error={null} onAcknowledge={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "UFC WEEKLY CHAMPION" })).toBeInTheDocument();
    expect(screen.getByText("Week of Sep 14–20")).toBeInTheDocument();
    expect(screen.queryByText("WEEKLY AUCTION BONUS")).not.toBeInTheDocument();
  });
});

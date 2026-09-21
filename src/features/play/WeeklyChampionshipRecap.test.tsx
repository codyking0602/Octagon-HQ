import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeeklyChampionshipRecap } from "./WeeklyChampionshipRecap";
import type {
  WeeklyChampionshipRecapRepository,
} from "./weeklyChampionshipRecapRepository";

function repository(): WeeklyChampionshipRecapRepository {
  return {
    load: vi.fn().mockResolvedValue({
      sport: "football",
      weekStart: "2026-09-15",
      weekEnd: "2026-09-21",
      entries: [
        {
          rank: 1,
          profileId: "11111111-1111-4111-8111-111111111111",
          displayName: "Shane",
          initials: "SH",
          avatarPhotoData: null,
          wins: 4,
          played: 7,
          averageScore: 84.7,
          isCurrentUser: false,
        },
        {
          rank: 2,
          profileId: "22222222-2222-4222-8222-222222222222",
          displayName: "Cody",
          initials: "CK",
          avatarPhotoData: null,
          wins: 3,
          played: 7,
          averageScore: 81.3,
          isCurrentUser: true,
        },
      ],
      auctionBonus: {
        profileId: "22222222-2222-4222-8222-222222222222",
        displayName: "Cody",
        subjectKey: "cfb-best-teams-since-2000",
        subjectLabel: "Best CFB Teams Since 2000",
      },
    }),
    acknowledge: vi.fn().mockResolvedValue(undefined),
  };
}

describe("WeeklyChampionshipRecap", () => {
  it("renders a native Football recap and permanently acknowledges it with OK", async () => {
    const repo = repository();
    render(<WeeklyChampionshipRecap sport="football" repository={repo} />);

    expect(await screen.findByText("FOOTBALL WEEKLY CHAMPION")).toBeInTheDocument();
    expect(screen.getAllByText("Shane")).toHaveLength(2);
    expect(screen.getByText("Week of Sep 15–21")).toBeInTheDocument();
    const bonus = screen.getByText("WEEKLY AUCTION BONUS").closest("aside");
    expect(bonus).not.toBeNull();
    expect(within(bonus as HTMLElement).getByText("Cody")).toBeInTheDocument();
    expect(within(bonus as HTMLElement).getByText("+1 win")).toBeInTheDocument();
    expect(within(bonus as HTMLElement).getByText(/Best CFB Teams Since 2000/)).toBeInTheDocument();
    expect(screen.getByText("YOU")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(() => {
      expect(repo.acknowledge).toHaveBeenCalledWith("football", "2026-09-15");
    });
    await waitFor(() => {
      expect(screen.queryByText("FOOTBALL WEEKLY CHAMPION")).not.toBeInTheDocument();
    });
  });

  it("does not invent an auction section for UFC", async () => {
    const repo = repository();
    vi.mocked(repo.load).mockResolvedValueOnce({
      sport: "ufc",
      weekStart: "2026-09-14",
      weekEnd: "2026-09-20",
      entries: [{
        rank: 1,
        profileId: "11111111-1111-4111-8111-111111111111",
        displayName: "Amy",
        initials: "AM",
        avatarPhotoData: null,
        wins: 5,
        played: 7,
        averageScore: 86.2,
        isCurrentUser: false,
      }],
      auctionBonus: null,
    });

    render(<WeeklyChampionshipRecap sport="ufc" repository={repo} />);
    expect(await screen.findByText("UFC WEEKLY CHAMPION")).toBeInTheDocument();
    expect(screen.queryByText("WEEKLY AUCTION BONUS")).not.toBeInTheDocument();
  });
});

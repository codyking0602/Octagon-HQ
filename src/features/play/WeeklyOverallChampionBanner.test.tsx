import { act, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeeklyOverallChampionBanner } from "./WeeklyOverallChampionBanner";
import { loadSportChampionshipWeekly, loadUfcMonthlyChampionship } from "./sportChampionshipRepository";

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ profile: { id: "11111111-1111-4111-8111-111111111111" } }),
}));
vi.mock("./sportChampionshipRepository", () => ({
  loadSportChampionshipWeekly: vi.fn(),
  loadUfcMonthlyChampionship: vi.fn(),
}));

const profileId = "11111111-1111-4111-8111-111111111111";
const day = (offset: number) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);

function championship(start: string, end: string) {
  const winner = {
    profile_id: profileId,
    display_name: "First Place",
    is_current_user: true,
    rank: 1,
    rating: 97,
  };
  return { latest: { week_start: start, week_end: end, winner, entries: [winner] } };
}

function mountBanner() {
  return render(<MemoryRouter><WeeklyOverallChampionBanner sport="football" /></MemoryRouter>);
}

describe("Football weekly winner announcement acknowledgement", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(loadUfcMonthlyChampionship).mockResolvedValue({ latest: null } as never);
  });

  it("respects the old acknowledgement key after the UFC monthly namespace update", async () => {
    const start = day(7);
    vi.mocked(loadSportChampionshipWeekly).mockResolvedValue(championship(start, day(1)) as never);
    window.localStorage.setItem(
      "the-hq:overall-week-champion:v1:football:" + start + ":" + profileId,
      "seen",
    );
    await act(async () => { mountBanner(); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(loadSportChampionshipWeekly).toHaveBeenCalledWith("football", 2026);
  });

  it("persists a newly dismissed champion for the current key", async () => {
    const start = day(7);
    vi.mocked(loadSportChampionshipWeekly).mockResolvedValue(championship(start, day(1)) as never);
    const mounted = mountBanner();
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "CONTINUE" }));
    expect(window.localStorage.getItem("the-hq:overall-champion:v2:football:" + start + ":" + profileId))
      .toBe("seen");
    mounted.unmount();
    await act(async () => { mountBanner(); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not reannounce an old weekly winner after the announcement window", async () => {
    vi.mocked(loadSportChampionshipWeekly).mockResolvedValue(championship(day(14), day(8)) as never);
    await act(async () => { mountBanner(); });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

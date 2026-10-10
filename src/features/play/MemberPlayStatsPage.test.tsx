// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemberPlayStatsPage } from "./PlayV2StatsPage";

const mocked = vi.hoisted(() => ({
  profile: null as null | { id: string; displayName: string; canControlPicks: boolean },
  history: vi.fn(),
}));

vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ status: "ready", profile: mocked.profile }),
}));
vi.mock("./usePlayV2History", () => ({
  usePlayV2History: (...args: unknown[]) => mocked.history(...args),
}));

function visit(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/members/:memberName/play-stats/:sport" element={<MemberPlayStatsPage />} />
        <Route path="/football" element={<p>Football sign-in destination</p>} />
        <Route path="/play" element={<p>UFC sign-in destination</p>} />
        <Route path="/members/:memberName" element={<p>Member profile destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocked.profile = { id: "11111111-1111-4111-8111-111111111111", displayName: "CODY", canControlPicks: false };
  mocked.history.mockReset();
  mocked.history.mockReturnValue({
    performance: {
      count: 2, average: 82.5, best: 95, lastFiveAverage: null, previousFiveAverage: null,
      recent: [{ day: "2026-10-08", gameType: "sports_feud",
        completedAt: "2026-10-08T18:00:00Z", normalizedScore: 95 }],
      byGame: [{ gameType: "sports_feud", title: "Sports Feud", count: 2,
        average: 82.5, best: 95, latest: 95 }],
    },
    loading: false, error: null, refresh: vi.fn(),
  });
});
afterEach(cleanup);

describe("member Full Play Stats", () => {
  it("lets an ordinary signed-in member inspect another profile's official football stats", () => {
    visit("/members/SHANE/play-stats/football");
    expect(screen.getByRole("heading", { name: "SHANE’s Performance" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "All-time daily performance" })).toHaveTextContent("82.5");
    expect(screen.getByRole("region", { name: "Scores by game" })).toHaveTextContent("Sports Feud");
    expect(screen.getByRole("region", { name: "Recent daily results" })).toHaveTextContent("95");
    expect(screen.getByRole("link", { name: /back to profile/i })).toHaveAttribute("href", "/members/SHANE");
    expect(mocked.history).toHaveBeenCalledWith(
      "football", "11111111-1111-4111-8111-111111111111", "SHANE",
    );
  });

  it("uses own private history for the member's own profile and keeps UFC distinct", () => {
    visit("/members/CODY/play-stats/ufc");
    expect(screen.getByRole("heading", { name: "Your Performance" })).toBeInTheDocument();
    expect(mocked.history).toHaveBeenCalledWith("ufc", "11111111-1111-4111-8111-111111111111", null);
  });

  it("redirects signed-out visitors instead of exposing member results", () => {
    mocked.profile = null;
    visit("/members/SHANE/play-stats/football");
    expect(screen.getByText("Football sign-in destination")).toBeInTheDocument();
    expect(screen.queryByText("SHANE’s Performance")).not.toBeInTheDocument();
  });

  it("refuses unsupported sport identifiers", () => {
    visit("/members/SHANE/play-stats/mlb");
    expect(screen.getByText("Member profile destination")).toBeInTheDocument();
    expect(mocked.history).not.toHaveBeenCalled();
  });
});

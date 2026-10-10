// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import MemberPlayV2StatsPage from "./MemberPlayV2StatsPage";

const mocks = vi.hoisted(() => ({ history: vi.fn() }));
vi.mock("../identity/IdentityProvider", () => ({
  useIdentity: () => ({ status: "ready", profile: { id: "visitor", canControlPicks: false } }),
}));
vi.mock("./usePlayV2History", () => ({
  usePlayV2History: (...args: unknown[]) => mocks.history(...args),
}));

describe("Member Full Play Stats", () => {
  it("reuses official Football stats for a different member without owner access", () => {
    mocks.history.mockReturnValue({
      performance: { count: 2, average: 80, best: 90, lastFiveAverage: null, previousFiveAverage: null,
        byGame: [{ gameType: "sports_feud", title: "Sports Feud", count: 2, average: 80, best: 90, latest: 90 }],
        recent: [{ gameType: "sports_feud", day: "2026-10-09", completedAt: "2026-10-09T19:00:00Z", normalizedScore: 90 }] },
      loading: false, error: null, refresh: vi.fn(),
    });
    render(<MemoryRouter initialEntries={["/members/SHANE/play-stats/football"]}>
      <Routes><Route path="/members/:memberName/play-stats/:sport" element={<MemberPlayV2StatsPage />} /></Routes>
    </MemoryRouter>);
    expect(screen.getByRole("heading", { name: "SHANE's Performance" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "UFC" })).toHaveAttribute("href", "/members/SHANE/play-stats/ufc");
    expect(screen.getByRole("link", { name: /BACK TO PROFILE/ })).toHaveAttribute("href", "/members/SHANE");
    expect(mocks.history).toHaveBeenCalledWith("football", "visitor", "SHANE");
  });
});

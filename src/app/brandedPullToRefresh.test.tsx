import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshMocks = vi.hoisted(() => ({
  notifications: vi.fn(),
  whatsNew: vi.fn(),
  picks: vi.fn(),
  challenges: vi.fn(),
  profilePreferences: vi.fn(),
  findLeader: vi.fn(),
  leaderboard: vi.fn(),
}));

vi.mock("../features/notifications/NotificationProvider", () => ({
  useNotifications: () => ({ refresh: refreshMocks.notifications }),
}));
vi.mock("../features/whats-new/WhatsNewProvider", () => ({
  useWhatsNew: () => ({ refresh: refreshMocks.whatsNew }),
}));
vi.mock("../features/picks/PicksProvider", () => ({
  usePicks: () => ({ refresh: refreshMocks.picks }),
}));
vi.mock("../features/challenges/ChallengeProvider", () => ({
  usePlayChallenges: () => ({ refresh: refreshMocks.challenges }),
}));
vi.mock("../features/profile/ProfilePreferencesProvider", () => ({
  useProfilePreferences: () => ({ refresh: refreshMocks.profilePreferences }),
}));
vi.mock("../features/play/FindLeaderHistoryProvider", () => ({
  useFindLeaderHistory: () => ({
    refresh: refreshMocks.findLeader,
    dailyLeaderboardDay: "2026-07-31",
    loadDailyLeaderboard: refreshMocks.leaderboard,
  }),
}));

import { BrandedPullToRefresh } from "./BrandedPullToRefresh";
import {
  PULL_REFRESH_HOLD_DISTANCE,
  PULL_REFRESH_MAX_DISTANCE,
  PULL_REFRESH_THRESHOLD,
  pullRefreshReady,
  resistedPullDistance,
  verticalPullIntent,
} from "./pullRefreshModel";

const appShell = readFileSync("src/app/AppShell.tsx", "utf8");
const component = readFileSync("src/app/BrandedPullToRefresh.tsx", "utf8");
const styles = readFileSync("src/styles/pull-to-refresh.css", "utf8");

function resetRefreshMocks() {
  refreshMocks.notifications.mockReset().mockResolvedValue(true);
  refreshMocks.whatsNew.mockReset().mockResolvedValue(true);
  refreshMocks.picks.mockReset().mockResolvedValue(undefined);
  refreshMocks.challenges.mockReset().mockResolvedValue(undefined);
  refreshMocks.profilePreferences.mockReset().mockResolvedValue(undefined);
  refreshMocks.findLeader.mockReset().mockResolvedValue(undefined);
  refreshMocks.leaderboard.mockReset().mockResolvedValue(undefined);
}

function renderRefresh(pathname = "/fighters/jon-jones") {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <BrandedPullToRefresh>
        <main>Page content</main>
      </BrandedPullToRefresh>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  resetRefreshMocks();
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
  });
});

afterEach(cleanup);

describe("branded pull-to-refresh", () => {
  it("waits for a deliberate vertical pull and applies resistance", () => {
    expect(verticalPullIntent(2, 7)).toBe(false);
    expect(verticalPullIntent(4, 40)).toBe(true);
    expect(verticalPullIntent(40, 20)).toBe(false);
    expect(resistedPullDistance(100)).toBe(52);
    expect(pullRefreshReady(resistedPullDistance(100))).toBe(false);
    expect(pullRefreshReady(resistedPullDistance(132))).toBe(true);
    expect(resistedPullDistance(1_000)).toBe(PULL_REFRESH_MAX_DISTANCE);
  });

  it("keeps the fixed shell outside the gesture and shows no refresh copy", () => {
    const opening = appShell.indexOf("<BrandedPullToRefresh>");
    const closing = appShell.indexOf("</BrandedPullToRefresh>");
    const header = appShell.indexOf("<header");
    const bottomNavigation = appShell.indexOf("<BottomNavigation />");

    expect(header).toBeGreaterThan(-1);
    expect(header).toBeLessThan(opening);
    expect(closing).toBeLessThan(bottomNavigation);
    expect(component).toContain('content.addEventListener("touchmove", onTouchMove, { passive: false })');
    expect(component).not.toContain("document.addEventListener");
    expect(component).not.toContain("pullRefreshScope");
    expect(component).not.toContain("PULL TO REFRESH");
    expect(component).not.toContain("RELEASE TO REFRESH");
    expect(component).not.toContain("REFRESHING HQ");
    expect(component).not.toContain("UPDATED");
    expect(styles).toContain("transform: translate3d(0, var(--pull-refresh-distance), 0)");
    expect(styles).toContain("pull-refresh-logo-flash");
  });

  it("moves the page content with the finger and refreshes through the existing owners", async () => {
    let finishNotification!: (value: boolean) => void;
    refreshMocks.notifications.mockImplementationOnce(() => new Promise<boolean>((resolve) => {
      finishNotification = resolve;
    }));

    const { container } = renderRefresh();
    const region = container.querySelector<HTMLElement>(".pull-refresh-region");
    const content = container.querySelector<HTMLElement>(".pull-refresh-content");
    expect(region).not.toBeNull();
    expect(content).not.toBeNull();

    fireEvent.touchStart(content!, {
      touches: [{ clientX: 24, clientY: 20 }],
    });
    fireEvent.touchMove(content!, {
      touches: [{ clientX: 26, clientY: 180 }],
    });

    expect(Number.parseFloat(region!.style.getPropertyValue("--pull-refresh-distance")))
      .toBeGreaterThanOrEqual(PULL_REFRESH_THRESHOLD);
    expect(region).toHaveClass("pull-refresh-region--ready");
    expect(screen.queryByText(/pull to refresh|release to refresh|refreshing hq|updated/i)).toBeNull();

    fireEvent.touchEnd(content!);

    expect(region).toHaveClass("pull-refresh-region--refreshing");
    expect(region!.style.getPropertyValue("--pull-refresh-distance"))
      .toBe(`${PULL_REFRESH_HOLD_DISTANCE}px`);
    expect(refreshMocks.notifications).toHaveBeenCalledTimes(1);
    expect(refreshMocks.whatsNew).toHaveBeenCalledTimes(1);
    expect(refreshMocks.picks).toHaveBeenCalledTimes(1);
    expect(refreshMocks.challenges).toHaveBeenCalledTimes(1);
    expect(refreshMocks.profilePreferences).toHaveBeenCalledTimes(1);
    expect(refreshMocks.findLeader).toHaveBeenCalledTimes(1);
    expect(refreshMocks.leaderboard).toHaveBeenCalledWith("2026-07-31");

    finishNotification(true);
    await waitFor(() => {
      expect(region).toHaveClass("pull-refresh-region--idle");
      expect(region!.style.getPropertyValue("--pull-refresh-distance")).toBe("0px");
    });
  });

  it("never captures a tab outside the page-content region", () => {
    const tabClick = vi.fn();
    const { container } = render(
      <MemoryRouter initialEntries={["/rankings"]}>
        <BrandedPullToRefresh>
          <main>Page content</main>
        </BrandedPullToRefresh>
        <button type="button" onClick={tabClick}>Rankings tab</button>
      </MemoryRouter>,
    );
    const tab = screen.getByRole("button", { name: "Rankings tab" });
    const region = container.querySelector<HTMLElement>(".pull-refresh-region");

    fireEvent.touchStart(tab, {
      touches: [{ clientX: 20, clientY: 20 }],
    });
    fireEvent.touchMove(tab, {
      touches: [{ clientX: 20, clientY: 180 }],
    });
    fireEvent.touchEnd(tab);
    fireEvent.click(tab);

    expect(tabClick).toHaveBeenCalledTimes(1);
    expect(refreshMocks.notifications).not.toHaveBeenCalled();
    expect(region!.style.getPropertyValue("--pull-refresh-distance")).toBe("");
  });
});

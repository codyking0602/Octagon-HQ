import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  PULL_REFRESH_MAX_DISTANCE,
  PULL_REFRESH_THRESHOLD,
  pullRefreshReady,
  pullRefreshScope,
  resistedPullDistance,
} from "./pullRefreshModel";

const appShell = readFileSync("src/app/AppShell.tsx", "utf8");
const component = readFileSync("src/app/BrandedPullToRefresh.tsx", "utf8");
const entry = readFileSync("src/main.tsx", "utf8");
const styles = readFileSync("src/styles/pull-to-refresh.css", "utf8");

describe("branded pull-to-refresh", () => {
  it("only enables the gesture on authenticated screens with canonical refresh owners", () => {
    expect(pullRefreshScope("/")).toBe("home");
    expect(pullRefreshScope("/picks")).toBe("picks");
    expect(pullRefreshScope("/play")).toBe("play");
    expect(pullRefreshScope("/play/find-leader")).toBe("find-leader");
    expect(pullRefreshScope("/notifications")).toBe("notifications");
    expect(pullRefreshScope("/whats-new")).toBe("whats-new");

    expect(pullRefreshScope("/fighters/jon-jones")).toBeNull();
    expect(pullRefreshScope("/members/cody")).toBeNull();
    expect(pullRefreshScope("/intelligence")).toBeNull();
    expect(pullRefreshScope("/play/wavelength")).toBeNull();
    expect(pullRefreshScope("/war-room")).toBeNull();
  });

  it("uses a resisted release threshold instead of triggering on a casual scroll", () => {
    expect(resistedPullDistance(0)).toBe(0);
    expect(resistedPullDistance(100)).toBe(50);
    expect(pullRefreshReady(resistedPullDistance(100))).toBe(false);
    expect(resistedPullDistance(144)).toBe(PULL_REFRESH_THRESHOLD);
    expect(pullRefreshReady(resistedPullDistance(144))).toBe(true);
    expect(resistedPullDistance(1_000)).toBe(PULL_REFRESH_MAX_DISTANCE);
  });

  it("mounts one app-shell gesture owner and reuses existing provider refresh functions", () => {
    expect(appShell).toContain("<BrandedPullToRefresh />");
    expect(entry).toContain('import "./styles/pull-to-refresh.css";');
    expect(component).toContain("const eligible = Boolean(identity.profile && scope)");
    expect(component).toContain("Promise.allSettled(tasks)");
    expect(component).toContain("notifications.refresh()");
    expect(component).toContain("whatsNew.refresh()");
    expect(component).toContain("picks.refresh()");
    expect(component).toContain("challenges.refresh()");
    expect(component).toContain("profilePreferences.refresh()");
    expect(component).toContain("findLeader.refresh()");
    expect(component).toContain("findLeader.loadDailyLeaderboard");
  });

  it("provides branded progress, optional haptics, and exactly one release action without another data owner", () => {
    expect(component).toContain("navigator.vibrate");
    expect(component).toContain("RELEASE TO REFRESH");
    expect(component).toContain("REFRESHING HQ");
    expect(component).toContain("brand.logoUrl");
    expect(component).toContain('document.addEventListener("touchmove", onTouchMove, { passive: false })');
    expect(component).toContain("refreshingRef.current = true");
    expect(component).not.toContain("getSupabaseClient");
    expect(component).not.toContain("invalidateQueries");
    expect(component).not.toContain("dispatchEvent");
    expect(component).not.toContain("window.location");
    expect(component).not.toContain("document.location");
    expect(component).not.toContain("queryClient");
    expect(component).not.toContain("setInterval");
    expect(component).not.toContain("fetch(");

    expect(styles).toContain("overscroll-behavior-y: contain");
    expect(styles).toContain("pull-refresh-logo-pulse");
    expect(styles).toContain("pull-refresh-flash");
    expect(styles).toContain("prefers-reduced-motion: reduce");
  });
});

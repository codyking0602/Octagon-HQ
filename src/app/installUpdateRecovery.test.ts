import { afterEach, describe, expect, it, vi } from "vitest";
import {
  forceRefreshLatestBuild,
  installUpdateRecovery,
  isRecoverableRouteLoadError,
  recoverRouteLoadError,
} from "./installUpdateRecovery";

const RUNNING_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const PRODUCTION_ORIGIN = "https://the.hq-app.workers.dev";

describe("deployment update recovery", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("reloads once when a stale lazy chunk cannot be loaded", () => {
    const reload = vi.fn();
    const remove = installUpdateRecovery({ reload, now: () => 20_000, runningSha: "" });
    const event = new Event("vite:preloadError", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    remove();
  });

  it("prevents a rapid reload loop when the same deployment is unavailable", () => {
    const reload = vi.fn();
    const remove = installUpdateRecovery({ reload, now: () => 20_000, runningSha: "" });

    window.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));
    window.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));

    expect(reload).toHaveBeenCalledTimes(1);
    remove();
  });

  it("reloads when the live deployment is newer than the running bundle", async () => {
    const reload = vi.fn();
    const fetchDeploymentSha = vi.fn().mockResolvedValue(NEXT_SHA);
    const remove = installUpdateRecovery({
      reload,
      now: () => 20_000,
      runningSha: RUNNING_SHA,
      fetchDeploymentSha,
    });

    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    expect(window.sessionStorage.getItem("octagon-hq:update-target-sha")).toBe(NEXT_SHA);
    remove();
  });

  it("does not loop when the reloaded page still receives the same stale bundle", async () => {
    const reload = vi.fn();
    const fetchDeploymentSha = vi.fn().mockResolvedValue(NEXT_SHA);
    const remove = installUpdateRecovery({
      reload,
      now: () => 20_000,
      runningSha: RUNNING_SHA,
      fetchDeploymentSha,
    });

    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event("pageshow"));
    await vi.waitFor(() => expect(fetchDeploymentSha).toHaveBeenCalledTimes(2));
    expect(reload).toHaveBeenCalledTimes(1);
    remove();
  });

  it("clears the pending target after the running bundle catches up", async () => {
    window.sessionStorage.setItem("octagon-hq:update-target-sha", RUNNING_SHA);
    const reload = vi.fn();
    const remove = installUpdateRecovery({
      reload,
      runningSha: RUNNING_SHA,
      fetchDeploymentSha: vi.fn().mockResolvedValue(RUNNING_SHA),
    });

    await vi.waitFor(() => {
      expect(window.sessionStorage.getItem("octagon-hq:update-target-sha")).toBeNull();
    });
    expect(reload).not.toHaveBeenCalled();
    remove();
  });

  it("checks again when an installed app returns to the foreground", async () => {
    const reload = vi.fn();
    const fetchDeploymentSha = vi.fn()
      .mockResolvedValueOnce(RUNNING_SHA)
      .mockResolvedValueOnce(NEXT_SHA);
    const remove = installUpdateRecovery({
      reload,
      now: () => 40_000,
      runningSha: RUNNING_SHA,
      fetchDeploymentSha,
    });

    await vi.waitFor(() => expect(fetchDeploymentSha).toHaveBeenCalledTimes(1));
    window.dispatchEvent(new Event("pageshow"));
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    remove();
  });

  it("recognizes the Safari lazy-route failure shown when an open app crosses a deployment", () => {
    expect(isRecoverableRouteLoadError(new TypeError("Importing a module script failed."))).toBe(true);
    expect(isRecoverableRouteLoadError(new TypeError("Failed to fetch dynamically imported module: /assets/WhoAmIPage-old.js"))).toBe(true);
    expect(isRecoverableRouteLoadError(new Error("Who Am I generated 9 clues; expected 10."))).toBe(false);
  });

  it("automatically cache-busts a stale lazy route once instead of leaving the game on the update screen", () => {
    const navigate = vi.fn();

    const recovered = recoverRouteLoadError({
      error: new TypeError("Importing a module script failed."),
      href: "https://the.hq-app.workers.dev/play/who-am-i",
      storage: window.sessionStorage,
      navigate,
      now: () => 41_000,
      productionOrigin: PRODUCTION_ORIGIN,
    });

    expect(recovered).toBe(true);
    expect(window.sessionStorage.getItem("octagon-hq:route-load-recovery-at")).toBe("41000");
    expect(navigate).toHaveBeenCalledWith(
      "https://the.hq-app.workers.dev/play/who-am-i?hq-update=41000",
    );

    expect(recoverRouteLoadError({
      error: new TypeError("Importing a module script failed."),
      href: "https://the.hq-app.workers.dev/football/who-am-i",
      storage: window.sessionStorage,
      navigate,
      now: () => 42_000,
      productionOrigin: PRODUCTION_ORIGIN,
    })).toBe(false);
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("preserves the Football Who Am I route during the same automatic recovery", () => {
    const navigate = vi.fn();

    expect(recoverRouteLoadError({
      error: new TypeError("Failed to fetch dynamically imported module: /assets/FootballWhoAmIPage-old.js"),
      href: "https://the.hq-app.workers.dev/football/who-am-i?mode=casual#round",
      storage: window.sessionStorage,
      navigate,
      now: () => 43_000,
      productionOrigin: PRODUCTION_ORIGIN,
    })).toBe(true);

    expect(navigate).toHaveBeenCalledWith(
      "https://the.hq-app.workers.dev/football/who-am-i?mode=casual&hq-update=43000#round",
    );
  });

  it("does not turn a real route bug into an automatic refresh loop", () => {
    const navigate = vi.fn();

    expect(recoverRouteLoadError({
      error: new Error("Who Am I generated 9 clues; expected 10."),
      href: "https://the.hq-app.workers.dev/play/who-am-i",
      storage: window.sessionStorage,
      navigate,
      now: () => 41_000,
      productionOrigin: PRODUCTION_ORIGIN,
    })).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("forces the update screen through a cache-busted shell URL instead of repeating a cached reload", () => {
    const navigate = vi.fn();
    window.sessionStorage.setItem("octagon-hq:update-reload-at", "40000");
    window.sessionStorage.setItem("octagon-hq:update-target-sha", NEXT_SHA);

    forceRefreshLatestBuild({
      href: "https://the.hq-app.workers.dev/play/20-questions?mode=casual#round",
      storage: window.sessionStorage,
      navigate,
      now: () => 42_000,
      productionOrigin: PRODUCTION_ORIGIN,
    });

    expect(window.sessionStorage.getItem("octagon-hq:update-reload-at")).toBeNull();
    expect(window.sessionStorage.getItem("octagon-hq:update-target-sha")).toBeNull();
    expect(navigate).toHaveBeenCalledWith(
      "https://the.hq-app.workers.dev/play/20-questions?mode=casual&hq-update=42000#round",
    );
  });

  it("escapes a legacy installed origin while preserving the route and query", () => {
    const navigate = vi.fn();

    forceRefreshLatestBuild({
      href: "https://octagon.hq-app.workers.dev/play?tab=casual#games",
      storage: window.sessionStorage,
      navigate,
      now: () => 43_000,
      productionOrigin: PRODUCTION_ORIGIN,
    });

    expect(navigate).toHaveBeenCalledWith(
      "https://the.hq-app.workers.dev/play?tab=casual&hq-update=43000#games",
    );
  });
});

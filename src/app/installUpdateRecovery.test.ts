import { afterEach, describe, expect, it, vi } from "vitest";
import { installUpdateRecovery } from "./installUpdateRecovery";

const RUNNING_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT_SHA = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

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
    window.dispatchEvent(new PageTransitionEvent("pageshow"));
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
    window.dispatchEvent(new PageTransitionEvent("pageshow"));
    await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    remove();
  });
});

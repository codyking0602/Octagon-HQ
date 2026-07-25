import { afterEach, describe, expect, it, vi } from "vitest";
import { installUpdateRecovery } from "./installUpdateRecovery";

describe("deployment update recovery", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("reloads once when a stale lazy chunk cannot be loaded", () => {
    const reload = vi.fn();
    const remove = installUpdateRecovery({ reload, now: () => 20_000 });
    const event = new Event("vite:preloadError", { cancelable: true });

    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    remove();
  });

  it("prevents a rapid reload loop when the same deployment is unavailable", () => {
    const reload = vi.fn();
    const remove = installUpdateRecovery({ reload, now: () => 20_000 });

    window.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));
    window.dispatchEvent(new Event("vite:preloadError", { cancelable: true }));

    expect(reload).toHaveBeenCalledTimes(1);
    remove();
  });
});

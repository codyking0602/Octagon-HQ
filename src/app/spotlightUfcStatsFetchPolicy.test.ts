import { describe, expect, it, vi } from "vitest";
import {
  fetchUfcStatsHtml,
  isRetryableUfcStatsStatus,
  UfcStatsFetchError,
} from "../../supabase/functions/build-pick-spotlight/ufcStatsFetch.ts";

const noDelay = vi.fn(async () => undefined);

describe("UFCStats Spotlight fetch resilience", () => {
  it("retries bounded transient network failures before succeeding", async () => {
    let attempt = 0;
    const fetchImpl = vi.fn(async () => {
      attempt += 1;
      if (attempt < 3) throw new TypeError("temporary network failure");
      return new Response("<html>fighter</html>", { status: 200 });
    });
    const delay = vi.fn(async () => undefined);

    await expect(fetchUfcStatsHtml("https://ufcstats.com/test", "fighter profile", fetchImpl, delay))
      .resolves.toBe("<html>fighter</html>");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(delay.mock.calls).toEqual([[200], [500]]);
  });

  it("retries transient HTTP responses but fails fast on permanent client errors", async () => {
    const transientFetch = vi.fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const transientDelay = vi.fn(async () => undefined);

    await expect(fetchUfcStatsHtml("https://ufcstats.com/test", "fighter index", transientFetch, transientDelay))
      .resolves.toBe("ok");
    expect(transientFetch).toHaveBeenCalledTimes(2);
    expect(transientDelay).toHaveBeenCalledTimes(1);

    const permanentFetch = vi.fn(async () => new Response("missing", { status: 404 }));
    await expect(fetchUfcStatsHtml("https://ufcstats.com/test", "fighter index", permanentFetch, noDelay))
      .rejects.toBeInstanceOf(UfcStatsFetchError);
    expect(permanentFetch).toHaveBeenCalledTimes(1);
  });

  it("stops after three retryable failures and keeps the existing safe error boundary", async () => {
    const fetchImpl = vi.fn(async () => new Response("rate limited", { status: 429 }));
    const delay = vi.fn(async () => undefined);

    await expect(fetchUfcStatsHtml("https://ufcstats.com/test", "fighter profile", fetchImpl, delay))
      .rejects.toThrow("fighter profile could not be loaded from UFCStats.");
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(delay.mock.calls).toEqual([[200], [500]]);
    expect(isRetryableUfcStatsStatus(408)).toBe(true);
    expect(isRetryableUfcStatsStatus(425)).toBe(true);
    expect(isRetryableUfcStatsStatus(429)).toBe(true);
    expect(isRetryableUfcStatsStatus(500)).toBe(true);
    expect(isRetryableUfcStatsStatus(404)).toBe(false);
  });
});

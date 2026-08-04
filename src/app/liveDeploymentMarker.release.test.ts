import { expect, it } from "vitest";

const EXPECTED_SHA = "ee458c12443e0da61ba4b958f29e229ae0eafec3";
const MARKER_URL = "https://octagon.hq-app.workers.dev/deployment.json";

it("serves the exact current main SHA in production", async () => {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const response = await fetch(`${MARKER_URL}?verify=${Date.now()}-${attempt}`, {
        headers: { "cache-control": "no-cache" },
      });
      expect(response.ok).toBe(true);
      const marker = await response.json() as { sha?: unknown };
      console.log(`Observed production SHA: ${String(marker.sha)}`);
      expect(marker.sha).toBe(EXPECTED_SHA);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 12) await new Promise((resolve) => setTimeout(resolve, 5_000));
    }
  }

  throw lastError;
}, 90_000);

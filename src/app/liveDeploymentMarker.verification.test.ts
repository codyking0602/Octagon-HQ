import { describe, expect, it } from "vitest";

const EXPECTED_SHA = "ee458c12443e0da61ba4b958f29e229ae0eafec3";
const DEPLOYMENT_URL = "https://octagon.hq-app.workers.dev/deployment.json";

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

describe("exact live Octagon HQ deployment", () => {
  it("serves the merged main SHA from the production deployment marker", async () => {
    let observedSha = "";
    let lastError = "";

    for (let attempt = 1; attempt <= 36; attempt += 1) {
      try {
        const response = await fetch(`${DEPLOYMENT_URL}?verify=${Date.now()}-${attempt}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const marker = await response.json() as { sha?: string };
        observedSha = marker.sha ?? "";
        if (observedSha === EXPECTED_SHA) break;
        lastError = `Observed ${observedSha || "an empty SHA"}`;
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
      await delay(5_000);
    }

    expect(observedSha, lastError).toBe(EXPECTED_SHA);
  }, 190_000);
});

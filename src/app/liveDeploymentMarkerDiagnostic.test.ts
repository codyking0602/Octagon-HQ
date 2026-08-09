import { expect, it } from "vitest";

it("confirms the exact current production deployment marker", async () => {
  const expectedSha = "b3339524f833caf4af217123dfac95b75b493dfd";
  const response = await fetch(
    `https://octagon.hq-app.workers.dev/deployment.json?verify=${Date.now()}`,
    { headers: { "cache-control": "no-cache" } },
  );

  expect(response.ok).toBe(true);
  const marker = (await response.json()) as { sha?: string };
  console.log(`LIVE_DEPLOYMENT_SHA=${marker.sha ?? "missing"}`);
  expect(marker.sha).toBe(expectedSha);
}, 30_000);

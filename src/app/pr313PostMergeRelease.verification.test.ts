import { expect, it } from "vitest";

const EXPECTED_SHA = "2e0e247dc9a83074fa5ac150ba0f9c979d76c39d";
const PRODUCTION_ORIGIN = "https://octagon.hq-app.workers.dev";

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchLiveMarker() {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 36; attempt += 1) {
    try {
      const response = await fetch(
        `${PRODUCTION_ORIGIN}/deployment.json?proof=${Date.now()}-${attempt}`,
        { cache: "no-store", headers: { Accept: "application/json" } },
      );
      expect(response.ok).toBe(true);
      const marker = await response.json() as { sha?: unknown; asset?: unknown };
      expect(marker.sha).toBe(EXPECTED_SHA);
      expect(typeof marker.asset).toBe("string");
      return marker as { sha: string; asset: string };
    } catch (error) {
      lastError = error;
      if (attempt < 36) await delay(5_000);
    }
  }

  throw lastError;
}

it("serves PR 313 from the exact live frontend and daily runtime deployment", async () => {
  const marker = await fetchLiveMarker();
  const assetResponse = await fetch(new URL(marker.asset, PRODUCTION_ORIGIN), {
    cache: "no-store",
  });
  expect(assetResponse.ok).toBe(true);
  const asset = await assetResponse.text();
  const supabaseOrigin = asset.match(/https:\/\/[a-z0-9-]+\.supabase\.co/i)?.[0];
  expect(supabaseOrigin).toBeTruthy();

  const runtimeEndpoint = `${supabaseOrigin}/functions/v1/daily-challenge-runtime`;
  const deploymentResponse = await fetch(runtimeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: PRODUCTION_ORIGIN,
    },
    body: JSON.stringify({ mode: "deployment-info" }),
  });
  expect(deploymentResponse.status).toBe(200);
  expect(deploymentResponse.headers.get("x-octagon-backend-sha")).toBe(EXPECTED_SHA);
  expect(await deploymentResponse.json()).toMatchObject({ deployment_sha: EXPECTED_SHA });

  const unauthorizedResponse = await fetch(runtimeEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "get-today" }),
  });
  expect(unauthorizedResponse.status).toBe(401);
  expect(await unauthorizedResponse.json()).toMatchObject({
    code: "SIGN_IN_REQUIRED",
    deployment_sha: EXPECTED_SHA,
  });
}, 210_000);

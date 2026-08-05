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
      const marker = await response.json() as { sha?: unknown };
      expect(marker.sha).toBe(EXPECTED_SHA);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 36) await delay(5_000);
    }
  }

  throw lastError;
}

async function fetchLiveApplicationAsset() {
  const htmlResponse = await fetch(`${PRODUCTION_ORIGIN}/?proof=${Date.now()}`, {
    cache: "no-store",
    headers: { Accept: "text/html" },
  });
  expect(htmlResponse.ok).toBe(true);
  const html = await htmlResponse.text();
  const assetPath = html.match(/<script[^>]+src=["']([^"']+\/assets\/[^"']+\.js)["']/i)?.[1];
  expect(assetPath).toBeTruthy();

  const assetResponse = await fetch(new URL(assetPath!, PRODUCTION_ORIGIN), {
    cache: "no-store",
  });
  expect(assetResponse.ok).toBe(true);
  return assetResponse.text();
}

it("serves PR 313 from the exact live frontend and daily runtime deployment", async () => {
  await fetchLiveMarker();
  const asset = await fetchLiveApplicationAsset();
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

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Cloudflare live deployment marker", () => {
  const workerSource = readFileSync("worker/index.ts", "utf8");
  const workerBuildSource = readFileSync("vite.worker.config.ts", "utf8");
  const wrangler = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as {
    assets?: { run_worker_first?: string[] };
  };

  it("routes deployment.json through the deployed Worker instead of the static asset cache", () => {
    expect(wrangler.assets?.run_worker_first).toContain("/deployment.json");
    expect(workerSource).toContain('requestUrl.pathname === "/deployment.json"');
    expect(workerSource).toContain("serveDeploymentMarker()");
  });

  it("stamps the exact source SHA into the Worker-owned marker with no-store delivery", () => {
    expect(workerBuildSource).toContain("__OCTAGON_DEPLOYMENT_SHA__");
    expect(workerBuildSource).toContain("process.env.SOURCE_SHA");
    expect(workerSource).toContain("{ sha: __OCTAGON_DEPLOYMENT_SHA__ }");
    expect(workerSource).toContain('"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"');
    expect(workerSource).toContain('"Access-Control-Allow-Origin": "*"');
  });
});

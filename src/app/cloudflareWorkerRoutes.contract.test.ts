import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type WranglerConfig = {
  assets?: {
    run_worker_first?: string[];
  };
};

describe("Cloudflare worker-first routes", () => {
  it("always forwards the numbered UFC calendar endpoint to server-owned Worker code", () => {
    const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as WranglerConfig;
    expect(config.assets?.run_worker_first).toContain("/api/ufc/next-numbered-event");

    // The Worker code is not invoked at all for routes left to SPA fallback.
    const workerSource = readFileSync("worker/index.ts", "utf8");
    expect(workerSource).toContain('requestUrl.pathname === "/api/ufc/next-numbered-event"');
    expect(workerSource).toContain("serveNextNumberedUfcEvent(request, context)");
  });

  it("does not include a trailing-slash route already covered by its wildcard", () => {
    const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as WranglerConfig;
    const routes = config.assets?.run_worker_first ?? [];
    const redundantRoutes = routes.filter(
      (route) => route.endsWith("/") && routes.includes(`${route}*`),
    );

    expect(routes).toContain("/api/ufc/next-numbered-event");
    expect(routes).toContain("/play");
    expect(routes).toContain("/play/*");
    expect(redundantRoutes).toEqual([]);
  });
});

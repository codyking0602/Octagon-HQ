import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type WranglerConfig = {
  assets?: {
    run_worker_first?: string[];
  };
};

describe("Cloudflare worker-first routes", () => {
  it("does not include a trailing-slash route already covered by its wildcard", () => {
    const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as WranglerConfig;
    const routes = config.assets?.run_worker_first ?? [];
    const redundantRoutes = routes.filter(
      (route) => route.endsWith("/") && routes.includes(`${route}*`),
    );

    expect(routes).toContain("/play");
    expect(routes).toContain("/play/*");
    expect(redundantRoutes).toEqual([]);
  });
});

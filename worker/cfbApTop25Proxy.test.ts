import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Wheel of Football AP Top 25 proxy", () => {
  const workerSource = readFileSync("worker/index.ts", "utf8");
  const wrangler = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as {
    assets?: { run_worker_first?: string[] };
  };

  it("routes AP rankings through the Worker before static assets", () => {
    expect(wrangler.assets?.run_worker_first).toContain("/api/football/cfb-ap-top25");
    expect(workerSource).toContain('requestUrl.pathname === "/api/football/cfb-ap-top25"');
    expect(workerSource).toContain("serveCfbApTop25()");
  });

  it("uses ESPN AP Top 25 and refuses incomplete ranking payloads", () => {
    expect(workerSource).toContain("/sports/football/college-football/rankings");
    expect(workerSource).toContain("/ap\\s+top\\s*25/i");
    expect(workerSource).toContain("normalized.length !== 25");
  });

  it("allows Boise State current-roster loading for the ranked pool", () => {
    expect(workerSource).toContain('"68", "333"');
  });
});

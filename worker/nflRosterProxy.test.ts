import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Wheel of Football NFL roster proxy", () => {
  const workerSource = readFileSync("worker/index.ts", "utf8");
  const wrangler = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as {
    assets?: { run_worker_first?: string[] };
  };

  it("routes the current-roster request through the Worker before static assets", () => {
    expect(wrangler.assets?.run_worker_first).toContain("/api/football/nfl-roster");
    expect(workerSource).toContain('requestUrl.pathname === "/api/football/nfl-roster"');
    expect(workerSource).toContain("serveNflRoster(requestUrl)");
  });

  it("uses a fixed ESPN NFL roster upstream and a reviewed 32-team allowlist", () => {
    expect(workerSource).toContain("site.api.espn.com/apis/site/v2/sports/football/nfl/teams/");
    expect(workerSource).toContain('"dal"');
    expect(workerSource).toContain('"wsh"');
    expect(workerSource).toContain("NFL_ROSTER_TEAM_CODES");
    expect(workerSource).toContain('"Cache-Control", "public, max-age=300, stale-while-revalidate=900"');
  });
  it("routes reviewed CFB roster requests through the Worker, including Top 25-only Boise State", () => {
    expect(wrangler.assets?.run_worker_first).toContain("/api/football/cfb-roster");
    expect(workerSource).toContain('requestUrl.pathname === "/api/football/cfb-roster"');
    expect(workerSource).toContain("serveCfbRoster(requestUrl)");
    expect(workerSource).toContain("site.api.espn.com/apis/site/v2/sports/football/college-football/teams/");
    expect(workerSource).toContain("CFB_ROSTER_ESPN_IDS");
    expect(workerSource).toContain('"333"');
    expect(workerSource).toContain('"87"');
    expect(workerSource).toContain('"68"');
  });

});

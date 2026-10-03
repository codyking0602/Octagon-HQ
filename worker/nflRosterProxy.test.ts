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

  it("uses reviewed ESPN identities for all 32 NFL teams and augments roster data with depth/injury context", () => {
    expect(workerSource).toContain("site.api.espn.com/apis/site/v2/sports/football/nfl/teams/");
    expect(workerSource).toContain('dal: "6"');
    expect(workerSource).toContain('wsh: "28"');
    expect(workerSource).toContain("NFL_ESPN_TEAM_IDS");
    expect(workerSource).toContain("/depthcharts");
    expect(workerSource).toContain("/injuries");
    expect(workerSource).toContain('ordering: depthChart ? "espn-depth-chart" : "roster-fallback"');
    expect(workerSource).toContain('"Cache-Control", "public, max-age=300, stale-while-revalidate=900"');

    const mapSource = workerSource.match(
      /export const NFL_ESPN_TEAM_IDS:[\\s\\S]*?= \\{([\\s\\S]*?)\\n\\};/,
    )?.[1] ?? "";
    const reviewedPairs = mapSource.match(/\\b[a-z]{2,3}: "\\d+"/g) ?? [];
    expect(new Set(reviewedPairs).size).toBe(32);
  });
});

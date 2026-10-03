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

  it("uses reviewed ESPN team ids and combines roster, depth-chart, and injury context", () => {
    expect(workerSource).toContain("site.api.espn.com/apis/site/v2/sports/football/nfl/teams/");
    expect(workerSource).toContain("sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/");
    expect(workerSource).toContain("NFL_WHEEL_SEASON = 2026");
    expect(workerSource).toContain("dal: 6");
    expect(workerSource).toContain("wsh: 28");
    expect(workerSource).toContain("NFL_ESPN_TEAM_IDS");
    expect(workerSource).toContain("/depthcharts");
    expect(workerSource).toContain("/injuries");
    expect(workerSource).toContain('depthChartSource: depthChart ? "ESPN depth chart" : "roster fallback"');
    expect(workerSource).toContain('"Cache-Control": "public, max-age=300, stale-while-revalidate=900"');
  });

  it("keeps all 32 NFL teams mapped to one ESPN team id", () => {
    const idPairs = workerSource.match(/\b(?:ari|atl|bal|buf|car|chi|cin|cle|dal|den|det|gb|hou|ind|jax|kc|lac|lar|lv|mia|min|ne|no|nyg|nyj|phi|pit|sea|sf|tb|ten|wsh): \d+/g) ?? [];
    expect(idPairs).toHaveLength(32);
    expect(new Set(idPairs.map((pair) => pair.split(":")[0]))).toHaveLength(32);
  });
});

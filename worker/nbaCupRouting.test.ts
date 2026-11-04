import {describe,expect,it} from "vitest";
import {readFileSync} from "node:fs";

describe("NBA Cup score route reaches the Cloudflare Worker before SPA fallback",()=>{
  it("routes the API through the Worker in the canonical production config",()=>{
    const config=JSON.parse(readFileSync("wrangler.jsonc","utf8"));
    const path="/api/nba/cup-2026-scoreboard";
    expect(config.assets.not_found_handling).toBe("single-page-application");
    expect(config.assets.run_worker_first).toContain(path);
    const worker=readFileSync("worker/index.ts","utf8");
    expect(worker).toContain('requestUrl.pathname === "/api/nba/cup-2026-scoreboard"');
    expect(worker).toContain("serveNbaCupScoreboard(requestUrl)");
    const client=readFileSync("src/features/nba/nbaCupScoresRepository.ts","utf8");
    expect(client).toContain('fetch("/api/nba/cup-2026-scoreboard"');
  });
  it("verifies the actual production API rather than an HTML route or a static mock",()=>{
    const workflow=readFileSync(".github/workflows/verify-live-frontend-delivery.yml","utf8");
    expect(workflow).toContain("node scripts/verify-live-nba-cup-scoreboard.mjs");
    const smoke=readFileSync("scripts/verify-live-nba-cup-scoreboard.mjs","utf8");
    expect(smoke).toContain("application\\/json");
    expect(smoke).toContain("2026-10-30|DET|BKN");
    expect(smoke).toContain("[110,94]");
    expect(smoke).toContain("opening.length,10");
  });
});

import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync("src/features/picks/FootballPicksRoute.tsx", "utf8");
const router = readFileSync("src/app/router.tsx", "utf8");
const picksPage = readFileSync("src/features/picks/PicksPage.tsx", "utf8");

describe("Football Picks UI architecture", () => {
  it("requests Football through the shared sport-aware Picks runtime", () => {
    expect(route).toContain('<PicksProvider sport="football">');
    expect(router).toContain('path: "football/picks"');
  });

  it("does not introduce a Football provider, repository, or query owner", () => {
    const files = readdirSync("src/features/picks");
    expect(files).not.toContain("FootballPicksProvider.tsx");
    expect(files).not.toContain("footballPicksRepository.ts");
    expect(route).not.toMatch(/createPicksRepository|getSupabaseClient|\.rpc\(/);
  });

  it("leaves the UFC Picks product on its existing page", () => {
    expect(router).toContain('{ path: "picks", element: <PicksPage /> }');
    expect(picksPage).toContain("Call the fights");
    expect(picksPage).toContain("UNDERDOG LOCK");
  });
});

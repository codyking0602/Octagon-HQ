import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("PR 9 ownership contracts", () => {
  it("uses the canonical sport-aware daily runtime without adding a challenge repository or persistence path on Home", () => {
    const home = source("./HomePage.tsx");

    expect(home).toContain('sport: "football"');
    expect(home).toContain('to="/football/today"');
    expect(home).not.toContain("createTodayChallengeRepository");
    expect(home).not.toContain("localStorage");
    expect(home).not.toContain("useSport");
    expect(home).not.toContain("SportProvider");
  });

  it("keeps one app-level Picks owner and the existing route-scoped Football provider instead of mounting another provider on Home", () => {
    const home = source("./HomePage.tsx");
    const providers = source("../../app/providers.tsx");
    const footballRoute = source("../picks/FootballPicksRoute.tsx");
    const picksProvider = source("../picks/PicksProvider.tsx");

    expect(home).not.toContain("<PicksProvider");
    expect(home).not.toContain("createPicksRepository");
    expect(providers.match(/<PicksProvider>/g)).toHaveLength(1);
    expect(footballRoute.match(/<PicksProvider sport="football">/g)).toHaveLength(1);
    expect(picksProvider).toContain('repository.loadMySummary(season, "football")');
  });

  it("does not let the new Football daily read change PR 8 Up Next loading or priority ownership", () => {
    const home = source("./HomePage.tsx");
    const loadingStart = home.indexOf("const upNextLoading");
    const actionStart = home.indexOf("const upNext =", loadingStart);
    const loadingBlock = home.slice(loadingStart, actionStart);

    expect(loadingStart).toBeGreaterThan(-1);
    expect(actionStart).toBeGreaterThan(loadingStart);
    expect(loadingBlock).toContain("dailyLoading");
    expect(loadingBlock).not.toContain("footballDailyRuntime");
    expect(loadingBlock).not.toContain("footballDailyError");
    expect(home).toContain("buildUpNextAction({");
  });

  it("leaves PR 10-11 Home business slots alone and preserves UFC-only Rankings/Intelligence shell ownership", () => {
    const home = source("./HomePage.tsx");
    const shell = source("../../app/AppShell.tsx");

    expect(home).toContain('<WhatsNewPreview />');
    expect(home).toMatch(/aria-label="Football HQ"[\s\S]*?\/>/);
    expect(shell).toContain('return { sport: "ufc", section: "RANKINGS", switchable: false }');
    expect(shell).toContain('return { sport: "ufc", section: "INTELLIGENCE", switchable: false }');
    expect(shell).toContain('pathname === "/"');
    expect(shell).toContain('return "neutral"');
  });
});

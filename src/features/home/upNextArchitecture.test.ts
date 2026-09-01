import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const providers = readFileSync("src/app/providers.tsx", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

describe("PR 8 Up Next ownership", () => {
  it("composes canonical Home state without adding a second data owner", () => {
    expect(home).toContain("usePicks()");
    expect(home).toContain("useTodayChallengeRuntime");
    expect(home).toContain("usePlayChallenges()");
    expect(home).toContain("useWhatsNew()");
    expect(home).toContain("buildUpNextAction");

    expect(home).not.toContain("createPicksRepository");
    expect(home).not.toContain("createChallengeRepository");
    expect(home).not.toContain("createWhatsNewRepository");
    expect(home).not.toContain("footballTodayChallengeRepository");
    expect(home).not.toContain("<PicksProvider");
    expect(home).not.toContain("localStorage");
  });

  it("keeps the existing provider stack and single style initialization owner", () => {
    expect(providers.match(/<PicksProvider(?:\s|>)/g)).toHaveLength(1);
    expect(providers.match(/<SportProvider>/g)).toHaveLength(1);
    expect(providers.match(/<WhatsNewProvider>/g)).toHaveLength(1);
    expect(main.match(/styles\/home-up-next\.css/g)).toHaveLength(1);
  });

  it("renders one priority hero destination rather than parallel Home CTAs", () => {
    const upNextSection = home.slice(
      home.indexOf('data-home-section="up-next"'),
      home.indexOf('data-home-section="todays-challenges"'),
    );

    expect(upNextSection).toContain("data-up-next-kind={upNext.kind}");
    expect(upNextSection.match(/<Link/g)).toHaveLength(1);
    expect(upNextSection).not.toContain("FootballPicksRoute");
  });
});

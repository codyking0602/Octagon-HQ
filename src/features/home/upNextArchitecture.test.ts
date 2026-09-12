import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const home = readFileSync("src/features/home/HomePage.tsx", "utf8");
const footballHome = readFileSync("src/features/home/FootballHq.tsx", "utf8");
const providers = readFileSync("src/app/providers.tsx", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

describe("retired Up Next ownership", () => {
  it("removes the retired priority hero without adding a second Home data owner", () => {
    expect(home).toContain("usePicks()");
    expect(home).toContain("useTodayChallengeRuntime");
    expect(home).not.toContain("<WhatsNewPreview />");
    expect(home).not.toContain("usePlayChallenges()");
    expect(home).not.toContain("useWhatsNew()");
    expect(home).not.toContain("buildUpNextAction");
    expect(home).not.toContain('data-home-section="up-next"');

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
    expect(main).not.toContain('styles/home-up-next.css');
  });

  it("keeps only Your HQ and the two canonical sport HQ owners on Home", () => {
    expect(home).toContain('data-home-section="your-hq"');
    expect(home).toContain('data-home-section="ufc-hq"');
    expect(footballHome).toContain('data-home-section="football-hq"');
    expect(home).not.toContain('data-home-section="whats-new"');
    expect(home).not.toContain('data-home-section="todays-challenges"');
    expect(home).toContain("isFootballSeason()");
    expect(home).toContain("{footballHq}");
    expect(home).toContain("{ufcHq}");
  });
});

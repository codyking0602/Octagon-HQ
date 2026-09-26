import { describe, expect, it } from "vitest";
import { bracketComplete } from "./mlbBracket";
import { MLB_OWNER_PREVIEW_CHAMPIONSHIP, MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";

describe("MLB owner preview", () => {
  it("renders a complete 12-team postseason bracket without touching public rollout", () => {
    expect(MLB_OWNER_PREVIEW_HUB.publicEnabled).toBe(false);
    expect(MLB_OWNER_PREVIEW_HUB.fieldReady).toBe(true);
    expect(MLB_OWNER_PREVIEW_HUB.bracketTemplate.teams).toHaveLength(12);
    expect(MLB_OWNER_PREVIEW_HUB.bracketTemplate.nodes).toHaveLength(11);
    expect(bracketComplete(
      MLB_OWNER_PREVIEW_HUB.bracketTemplate,
      MLB_OWNER_PREVIEW_HUB.ownBracket ?? {},
    )).toBe(true);
  });

  it("uses recognizable current contenders for visual QA", () => {
    const names = MLB_OWNER_PREVIEW_HUB.bracketTemplate.teams.map((team) => team.name);
    expect(names).toEqual(expect.arrayContaining([
      "Tampa Bay Rays",
      "New York Yankees",
      "Milwaukee Brewers",
      "Los Angeles Dodgers",
      "Chicago Cubs",
      "Chicago White Sox",
    ]));
  });

  it("includes four Wild Card series and a populated spotlight", () => {
    expect(MLB_OWNER_PREVIEW_HUB.series).toHaveLength(4);
    expect(MLB_OWNER_PREVIEW_HUB.series.every((series) => series.round === "wild_card")).toBe(true);
    expect(MLB_OWNER_PREVIEW_HUB.spotlight?.title).toBe("Yankees vs. Red Sox");
    expect(MLB_OWNER_PREVIEW_HUB.spotlight?.series_id).toBe("al-wc-2");
    expect(MLB_OWNER_PREVIEW_HUB.bracketTemplate.teams.every((team) => Boolean(team.logo_url))).toBe(true);
  });
  it("presents the October 15 Hit the Number card exactly as a live challenge", () => {
    expect(MLB_OWNER_PREVIEW_HUB.featuredChallenge).toMatchObject({
      id: "mlb-2026-play-07",
      title: "Hit the Number",
      date: "2026-10-15",
      route: "/mlb/challenge",
      game_type: "hit_the_number",
      ready: true,
      is_live: true,
    });
    expect(MLB_OWNER_PREVIEW_HUB.featuredChallenge?.description).not.toMatch(/preview|demo|test|tuning|prototype/i);
  });

  it("previews one calibrated MLB Championship without exposing challenge content", () => {
    expect(MLB_OWNER_PREVIEW_CHAMPIONSHIP.totalMax).toBe(100);
    expect(MLB_OWNER_PREVIEW_CHAMPIONSHIP.seriesMax).toBe(43);
    expect(MLB_OWNER_PREVIEW_CHAMPIONSHIP.bracketMax).toBe(32);
    expect(MLB_OWNER_PREVIEW_CHAMPIONSHIP.playMax).toBe(25);
    expect(MLB_OWNER_PREVIEW_CHAMPIONSHIP.standings).toHaveLength(6);
    expect(MLB_OWNER_PREVIEW_CHAMPIONSHIP.own?.overall_rank).toBe(2);
    expect(MLB_OWNER_PREVIEW_HUB.bracketTemplate.nodes.find((node) => node.round === "championship_series")?.points).toBe(5);
    expect(MLB_OWNER_PREVIEW_HUB.bracketTemplate.nodes.find((node) => node.round === "world_series")?.points).toBe(10);
  });
});

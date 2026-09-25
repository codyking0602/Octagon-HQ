import { describe, expect, it } from "vitest";
import { bracketComplete } from "./mlbBracket";
import { MLB_OWNER_PREVIEW_HUB } from "./mlbOwnerPreview";

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
});

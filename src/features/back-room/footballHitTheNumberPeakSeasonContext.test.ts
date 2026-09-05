import { describe, expect, it } from "vitest";
import { getFootballFact } from "./footballFactualStats";
import {
  FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG,
  footballHitTheNumberSubjects,
} from "./footballHitTheNumberModel";
import { footballHitTheNumberPeakSeasons } from "./footballHitTheNumberPeakSeasonContext";

describe("Football Hit the Number peak-season context", () => {
  it("provides metric-specific years for every playable CFB peak-season fact", () => {
    const peakMetricIds = FOOTBALL_HIT_THE_NUMBER_METRIC_CATALOG
      .filter((row) => row.group === "cfb-player-peak" && row.metricId.startsWith("cfb-best-season-"))
      .map((row) => row.metricId);
    const peakSubjects = footballHitTheNumberSubjects.filter((subject) => subject.group === "cfb-player-peak");

    let checked = 0;
    for (const subject of peakSubjects) {
      for (const metricId of peakMetricIds) {
        if (!getFootballFact(subject.id, metricId)) continue;
        const seasons = footballHitTheNumberPeakSeasons(subject.id, metricId);
        expect(seasons.length, `${subject.id}:${metricId}`).toBeGreaterThan(0);
        expect(seasons.every((season) => Number.isInteger(season) && season >= 1900 && season <= 2025)).toBe(true);
        checked += 1;
      }
    }

    expect(checked).toBeGreaterThan(50);
  });

  it("uses the year for the current metric instead of one generic player peak", () => {
    expect(footballHitTheNumberPeakSeasons("cfb-calvin-johnson", "cfb-best-season-receiving-yards")).toEqual([2006]);
    expect(footballHitTheNumberPeakSeasons("cfb-christian-mccaffrey", "cfb-best-season-rushing-yards")).toEqual([2015]);
    expect(footballHitTheNumberPeakSeasons("cfb-christian-mccaffrey", "cfb-best-season-rushing-touchdowns")).toEqual([2016]);
  });

  it("keeps tied peak seasons honest", () => {
    expect(footballHitTheNumberPeakSeasons("cfb-braelon-allen", "cfb-best-season-rushing-touchdowns")).toEqual([2021, 2023]);
    expect(footballHitTheNumberPeakSeasons("cfb-aaron-donald", "cfb-best-season-sacks")).toEqual([2011, 2013]);
  });
});

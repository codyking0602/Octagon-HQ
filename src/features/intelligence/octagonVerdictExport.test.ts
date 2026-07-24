import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { divisionRankingReport } from "../rankings/rankingControls";
import { allTime } from "../rankings/rankingModel";
import { buildOctagonVerdictExport } from "./octagonVerdictExport";

const exported = buildOctagonVerdictExport({
  fighters: allTime,
  inputs: canonicalRankingInputs,
  divisionReport: divisionRankingReport,
  generatedAt: "2026-07-24T00:00:00.000Z",
});
const feed = exported.feed as any;
const fighters = exported.fighters as any[];

describe("V2 Octagon Verdict exporter", () => {
  it("exports the complete calculated fighter set without creating a second ranking owner", () => {
    expect(feed.source).toBe("octagon-hq-v2-calculated-typescript");
    expect(feed.fighterCount).toBe(80);
    expect(fighters.filter((fighter) => fighter.group === "men")).toHaveLength(65);
    expect(fighters.filter((fighter) => fighter.group === "women")).toHaveLength(15);
    expect(new Set(fighters.map((fighter) => fighter.slug)).size).toBe(80);

    const jon = fighters.find((fighter) => fighter.slug === "jon-jones")!;
    expect(jon.rank).toBe(1);
    expect(jon.appOvr).toBe(99);
    expect(jon.totalScore).toBe(allTime.find((fighter) => fighter.slug === "jon-jones")!.rawScore);
    expect(jon.categories).toEqual(expect.objectContaining({
      championship: allTime.find((fighter) => fighter.slug === "jon-jones")!.championship,
      lossPenalty: 0,
    }));
  });

  it("exports calculated division boards and fighter division entries", () => {
    expect(feed.divisionBoards.Heavyweight?.[0]?.fighter).toBe("Stipe Miocic");
    expect(feed.divisionBoards["Light Heavyweight"]?.[0]?.fighter).toBe("Jon Jones");

    const jon = fighters.find((fighter) => fighter.slug === "jon-jones")!;
    const heavyweight = jon.divisionBoards.find((row: any) => row.division === "Heavyweight");
    const lightHeavyweight = jon.divisionBoards.find((row: any) => row.division === "Light Heavyweight");
    expect(heavyweight).toBeTruthy();
    expect(lightHeavyweight).toBeTruthy();
    expect(lightHeavyweight?.divisionScore).toBeGreaterThan(heavyweight?.divisionScore ?? 0);
  });

  it("derives real ranked-fighter head-to-head ledgers from canonical fight facts", () => {
    expect(exported.matchups.length).toBeGreaterThan(0);
    expect(new Set(exported.matchups.map((matchup) => matchup.pairKey)).size).toBe(exported.matchups.length);

    const gspHughes = exported.matchups.find((matchup) =>
      matchup.fighters.includes("Georges St-Pierre") && matchup.fighters.includes("Matt Hughes"),
    )!;
    expect(gspHughes).toBeTruthy();
    expect(gspHughes.headToHead.fights).toBe(3);
    expect(gspHughes.headToHead.seriesWinner).toBe("Georges St-Pierre");
    expect(gspHughes.verdictWinner).toBe("Georges St-Pierre");
  });

  it("keeps head-to-head results as context when they conflict with the GOAT ranking", () => {
    const silvaWeidman = exported.matchups.find((matchup) =>
      matchup.fighters.includes("Anderson Silva") && matchup.fighters.includes("Chris Weidman"),
    )!;
    expect(silvaWeidman).toBeTruthy();
    expect(silvaWeidman.headToHead.seriesWinner).toBe("Chris Weidman");
    expect(silvaWeidman.verdictWinner).toBe("Anderson Silva");
    expect(silvaWeidman.headToHead.contextOnly).toBe(true);
    expect(silvaWeidman.headToHead.doesNotOverrideVerdict).toBe(true);
  });

  it("renders one upload-ready knowledge document from the same export package", () => {
    expect(exported.knowledgeMarkdown).toContain("# Octagon Verdict — UFC-Only GOAT Knowledge");
    expect(exported.knowledgeMarkdown).toContain("1. Jon Jones — 99 OVR");
    expect(exported.knowledgeMarkdown).toContain("### Anderson Silva vs. Chris Weidman");
    expect(exported.knowledgeMarkdown).toContain("The head-to-head result is context only");
  });
});

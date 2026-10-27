import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalRankingInputs, historicalRankingMigrationInputs } from "./rankingInputs";
import { nataliaSilvaRankingInput } from "./nataliaSilvaRanking";
import { v2RankingRoster } from "./v2RankingRoster";
import { calculatedRankingProjection, womenAllTime } from "../rankingModel";
import { calculateWeightedScore } from "../engine/rankingEngine";
import { rankingContract } from "../engine/rankingContract";

const name = "Natalia Silva";
const asOf = "2026-10-27";

describe("Natalia Silva UFC V2 all-time ranking dossier", () => {
  const fighter = canonicalRankingInputs.fighters.find((entry) => entry.fighter === name);
  const board = calculatedRankingProjection.women;
  const projected = board.find((entry) => entry.fighter === name);

  it("adds one woman without rewriting sealed or existing UFC V2 fighter inputs", () => {
    expect(historicalRankingMigrationInputs.counts).toEqual({ fighters: 80, men: 65, women: 15 });
    expect(canonicalRankingInputs.counts).toEqual({ fighters: 83, men: 67, women: 16 });
    expect(v2RankingRoster.additions.map((row) => (row as { fighter: string }).fighter)).toContain(name);
    expect(canonicalRankingInputs.source.modelAsOfDate).toBe(asOf);
    expect(fighter?.board).toBe("women");
    expect(fighter?.presentation.slug).toBe("natalia-silva");
    expect(new Set(canonicalRankingInputs.fighters.map((entry) => entry.fighter)).size).toBe(83);
    for (const historical of historicalRankingMigrationInputs.fighters) {
      expect(v2RankingRoster.replacements).toHaveProperty(historical.fighter);
    }
  });

  it("contains exactly nine chronologically accurate 2022-2026 UFC wins", () => {
    expect(fighter).toBeDefined();
    const fights = fighter!.facts.fights;
    expect(fights).toHaveLength(9);
    expect(fights.map((fight) => [fight.date, fight.opponent])).toEqual([
      ["2022-06-18", "Jasmine Jasudavicius"],
      ["2022-11-19", "Tereza Bleda"],
      ["2023-05-20", "Victoria Leonardo"],
      ["2023-08-19", "Andrea Lee"],
      ["2024-02-03", "Viviane Araujo"],
      ["2024-09-07", "Jessica Andrade"],
      ["2025-05-10", "Alexa Grasso"],
      ["2026-01-24", "Rose Namajunas"],
      ["2026-10-03", "Wang Cong"],
    ]);
    expect(fights.every((fight) => fight.officialResult === "win" && fight.scoringDisposition === "count-win")).toBe(true);
    expect(fights.filter((fight) => fight.methodCategory === "ko-tko")).toHaveLength(2);
    expect(new Set(fights.map((fight) => fight.id)).size).toBe(9);
    expect(fights.every((fight) => fight.division === "Flyweight")).toBe(true);
    expect(fighter!.facts.primeWindow).toEqual({
      startFightId: "2022-06-18-jasmine-jasudavicius",
      endFightId: null,
      open: true,
    });
  });

  it("credits the verified vacant title once and grants zero defenses", () => {
    const title = fighter!.facts.fights.filter((fight) => fight.championshipType !== "none");
    expect(title).toHaveLength(1);
    expect(title[0]).toMatchObject({
      date: "2026-10-03",
      opponent: "Wang Cong",
      championshipType: "vacant-undisputed",
      championshipManualCredit: 0.85,
      methodCategory: "decision",
      rounds: { status: "audited", won: 3, lost: 2 },
    });
    expect(fighter!.judgments.championship.inputs).toHaveLength(1);
    expect(fighter!.judgments.championship.inputs[0]).toMatchObject({
      fightId: title[0].id,
      officialTitleFight: true,
      finalAdjustedCredit: 0.85,
    });
    expect(projected?.metadata?.visibleStats.titleFightWins).toBe(1);
    expect(projected?.metadata?.visibleStats.ufcRecord).toBe("9-0");
  });

  it("keeps opponent and apex judgments linked to scored canonical fight ids", () => {
    const ids = new Set(fighter!.facts.fights.map((fight) => fight.id));
    expect(fighter!.judgments.opponentQuality.inputs).toHaveLength(9);
    expect(fighter!.judgments.opponentQuality.inputs.every((win) => ids.has(String(win.fightId)))).toBe(true);
    expect(fighter!.judgments.apex.performances).toHaveLength(2);
    expect(fighter!.judgments.apex.performances.every((performance) => ids.has(performance.fightId))).toBe(true);
    expect(fighter!.judgments.opponentQuality.inputs.find((win) => win.opponent === "Rose Namajunas")?.finalCredit).toBeLessThan(
      fighter!.judgments.opponentQuality.inputs.find((win) => win.opponent === "Alexa Grasso")!.finalCredit,
    );
    expect(fighter!.eraDepth.approvedAdjustment).toBe(0.18);
    expect(nataliaSilvaRankingInput.judgments.apex.components.twoPerformanceStrength).toBe(1.89);
  });

  it("projects the women board with the actual engine and renders existing Natalia Silva media", () => {
    expect(projected).toBeDefined();
    expect(womenAllTime).toHaveLength(16);
    expect(womenAllTime.find((entry) => entry.fighter === name)).toBeDefined();
    expect(projected!.rank).toBe(board.findIndex((entry) => entry.fighter === name) + 1);
    expect(projected!.totals.totalScore).toBe(
      calculateWeightedScore(projected!.categories, projected!.modifiers, rankingContract).totalScore,
    );
    expect(projected!.totals.totalScore).toBeGreaterThan(25);
    expect(projected!.totals.totalScore).toBeLessThan(55);
    expect(fighter!.presentation.whyNotHigher).toMatch(/has yet to defend it/i);
    expect(projected!.categories).toEqual({ championship: 1.75, opponentQuality: 10.78, primeDominance: 22.18, longevity: 11.18 });
    expect(projected!.modifiers).toEqual({ apex: 4.44, penalty: 0, eraDepth: 0.18 });
    expect(projected!.totals.totalScore).toBe(41.55);
    expect(projected!.ovr).toBe(88);
    expect(fighter!.presentation.photoUrl).toBe("assets/fighters/natalia-silva-profile.webp");
    expect(existsSync(resolve("public", fighter!.presentation.photoUrl!))).toBe(true);
    expect(existsSync(resolve("public", fighter!.presentation.thumbUrl!))).toBe(true);
    console.info("NATALIA_SILVA_ENGINE_RESULT", JSON.stringify({
      rank: projected!.rank,
      score: projected!.totals.totalScore,
      ovr: projected!.ovr,
      categories: projected!.categories,
      modifiers: projected!.modifiers,
      neighbors: board.slice(Math.max(0, projected!.rank - 2), projected!.rank + 1).map((entry) => ({
        fighter: entry.fighter,
        rank: entry.rank,
        score: entry.totals.totalScore,
      })),
    }));
  });
});

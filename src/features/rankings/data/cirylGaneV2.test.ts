import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./rankingInputs";
import { cirylGaneV2 } from "./cirylGaneV2";
import { v2RankingRoster } from "./v2RankingRoster";
import { calculatedRankingProjection, getFighter } from "../rankingModel";
import { divisionRankingReport } from "../rankingControls";
import { rankingContract } from "../engine/rankingContract";
import { calculateWeightedScore } from "../engine/rankingEngine";

const current = canonicalRankingInputs.fighters.find((f) => f.fighter === "Ciryl Gane");
const projected = calculatedRankingProjection.men.find((f) => f.fighter === "Ciryl Gane");

describe("October 2026 isolated Ciryl Gane V2 all-time addition", () => {
  it("has unique canonical fighter identity and exactly one era membership", () => {
    expect(current).toBeDefined();
    expect(cirylGaneV2.fighter).toBe("Ciryl Gane");
    expect(v2RankingRoster.additions.filter((fighter: any) => fighter.fighter === "Ciryl Gane")).toHaveLength(1);
    expect(canonicalRankingInputs.filters.eraMembership["Ciryl Gane"]).toEqual({
      primary: "new-blood",
      secondary: null,
    });
    expect(canonicalRankingInputs.counts.fighters).toBe(83);
    expect(canonicalRankingInputs.counts.men).toBe(
      canonicalRankingInputs.fighters.filter((f) => f.board === "men").length,
    );
    expect(current?.presentation.slug).toBe("ciryl-gane");
    expect(current?.presentation.photoUrl).toBe("assets/fighters/ciryl-gane-thumb.webp");
    expect(current?.presentation.thumbUrl).toBe("assets/fighters/ciryl-gane-thumb.webp");
    expect(current?.presentation.watchUrl).toBe("https://www.youtube.com/watch?v=5kk1024Kwb4");
    expect(canonicalRankingInputs.source.modelAsOfDate).toBe("2026-09-19");
    expect(getFighter("ciryl-gane")?.fighter).toBe("Ciryl Gane");
  });

  it("reconciles 14 chronological UFC fights without phantom fights or wins", () => {
    const fights = current!.facts.fights;
    expect(fights).toHaveLength(14);
    expect(new Set(fights.map((fight) => fight.id)).size).toBe(14);
    expect(fights.map((fight) => fight.date)).toEqual(fights.map((fight) => fight.date).sort());
    expect(fights.filter((fight) => fight.officialResult === "win")).toHaveLength(11);
    expect(fights.filter((fight) => fight.officialResult === "loss")).toHaveLength(2);
    expect(fights.filter((fight) => fight.officialResult === "no-contest")).toHaveLength(1);
    expect(fights.every((fight) => fight.division === "Heavyweight")).toBe(true);
    expect(fights.every((fight) => fight.date <= "2026-10-27")).toBe(true);
    expect(fights.some((fight) => fight.opponent === "Josh Hokit")).toBe(false);
    expect(fights.filter((fight) => fight.opponent === "Alexander Volkov")).toHaveLength(2);
    expect(fights.filter((fight) => fight.opponent === "Alex Pereira")).toHaveLength(1);
    expect(getFighter("ciryl-gane")?.visibleStats.ufcRecord).toBe("11-2, 1 NC");
  });

  it("credits precisely two interim wins, zero defense wins, two title losses and one excluded title NC", () => {
    const titleFights = current!.facts.fights.filter((f) => f.championshipType !== "none");
    expect(titleFights).toHaveLength(5);
    expect(titleFights.filter((f) => f.championshipType === "interim" && f.officialResult === "win").map((f) => f.opponent)).toEqual(["Derrick Lewis", "Alex Pereira"]);
    expect(titleFights.filter((f) => f.officialResult === "loss").map((f) => f.opponent)).toEqual(["Francis Ngannou", "Jon Jones"]);
    const aspinall = titleFights.find((f) => f.opponent === "Tom Aspinall");
    expect(aspinall).toMatchObject({
      officialResult: "no-contest",
      scoringDisposition: "excluded-no-contest",
      championshipType: "normal",
      rounds: { status: "unavailable" },
    });
    expect(getFighter("ciryl-gane")?.visibleStats.titleFightWins).toBe(2);
    expect(current!.judgments.championship.inputs).toHaveLength(2);
    expect(current!.judgments.championship.inputs.map((x) => x.finalAdjustedCredit)).toEqual([0.65, 0.75]);
    expect(current!.presentation.keyJudgmentCalls.some((x) => x.includes("elevation"))).toBe(true);
  });

  it("has fight-keyed, source-reviewed opponent and apex inputs; losses do not earn win credits", () => {
    const ledger = new Map(current!.facts.fights.map((fight) => [fight.id, fight]));
    for (const row of current!.judgments.opponentQuality.inputs) {
      const ref = ledger.get(String(row.fightId));
      expect(ref?.officialResult).toBe("win");
      expect(ref?.opponent).toBe(row.opponent);
      expect(ref?.date).toBe(row.date);
    }
    expect(current!.judgments.opponentQuality.inputs).toHaveLength(11);
    expect(new Set(current!.judgments.opponentQuality.inputs.map((row) => row.fightId)).size).toBe(11);
    for (const perf of current!.judgments.apex.performances) {
      expect(ledger.get(perf.fightId)?.officialResult).toBe("win");
    }
    expect(current!.judgments.apex.performances.map((p) => p.opponent)).toEqual(["Derrick Lewis", "Alex Pereira"]);
    expect(current!.facts.primeWindow.startFightId).toBe("2021-02-27-jairzinho-rozenstruik");
  });

  it("reports a real model-calculated rank and score, including heavyweight neighbors", () => {
    expect(projected).toBeDefined();
    expect(Number.isFinite(projected!.totals.totalScore)).toBe(true);
    expect(projected!.rank).toBe(calculatedRankingProjection.men.findIndex((r) => r.fighter === "Ciryl Gane") + 1);
    const independent = calculateWeightedScore(projected!.categories, projected!.modifiers, rankingContract);
    expect(projected!.totals.totalScore).toBe(independent.totalScore);
    expect(getFighter("ciryl-gane")?.rawScore).toBe(projected!.totals.totalScore);
    expect(divisionRankingReport.passed).toBe(true);
    const heavyweights = divisionRankingReport.boards.Heavyweight ?? [];
    const heavyIndex = heavyweights.findIndex((r) => r.fighter.fighter === "Ciryl Gane");
    expect(heavyIndex).toBeGreaterThanOrEqual(0);
    expect(heavyweights[heavyIndex].rank).toBe(heavyIndex + 1);
    console.info("[GANE_V2_CALCULATED] " + JSON.stringify({
      totalScore: projected!.totals.totalScore,
      overallRank: projected!.rank,
      menTotal: calculatedRankingProjection.men.length,
      above: calculatedRankingProjection.men[projected!.rank - 2]?.fighter ?? null,
      below: calculatedRankingProjection.men[projected!.rank]?.fighter ?? null,
      heavyweightRank: heavyIndex + 1,
      heavyweightAbove: heavyweights[heavyIndex - 1]?.fighter.fighter ?? null,
      heavyweightBelow: heavyweights[heavyIndex + 1]?.fighter.fighter ?? null,
      categories: projected!.categories,
      modifiers: projected!.modifiers,
    }));
  });
});

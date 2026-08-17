import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalRankingInputs,
  historicalRankingMigrationInputs,
} from "./rankingInputs";
import { v2RankingRoster } from "./v2RankingRoster";

const projectRoot = resolve(process.cwd());
const refreshedRankingData = new Set([
  "Dricus du Plessis",
  "Kamaru Usman",
  "Mackenzie Dern",
  "Conor McGregor",
  "Islam Makhachev",
]);

describe("V2 ranking roster overlay", () => {
  it("owns one intentional presentation replacement for every baseline fighter", () => {
    expect(Object.keys(v2RankingRoster.replacements)).toHaveLength(
      historicalRankingMigrationInputs.fighters.length,
    );
    expect(new Set(Object.keys(v2RankingRoster.replacements))).toEqual(
      new Set(
        historicalRankingMigrationInputs.fighters.map(({ fighter }) => fighter),
      ),
    );
    expect(v2RankingRoster.additions).toHaveLength(1);
    expect(canonicalRankingInputs.counts.fighters).toBe(
      canonicalRankingInputs.fighters.length,
    );
  });

  it("changes no canonical calculation data for editorial-only replacements", () => {
    for (const historical of historicalRankingMigrationInputs.fighters) {
      if (refreshedRankingData.has(historical.fighter)) continue;
      const current = canonicalRankingInputs.fighters.find(
        ({ fighter }) => fighter === historical.fighter,
      );
      expect(current, historical.fighter).toBeDefined();
      expect(current?.facts, `${historical.fighter} facts`).toEqual(
        historical.facts,
      );
      expect(current?.judgments, `${historical.fighter} judgments`).toEqual(
        historical.judgments,
      );
      expect(current?.era, `${historical.fighter} era`).toEqual(historical.era);
      expect(current?.eraDepth, `${historical.fighter} eraDepth`).toEqual(
        historical.eraDepth,
      );
      expect(
        current?.presentation,
        `${historical.fighter} unrelated presentation`,
      ).toEqual({
        ...historical.presentation,
        oneLiner: current?.presentation.oneLiner,
        whyRankedHere: current?.presentation.whyRankedHere,
        whyNotHigher: current?.presentation.whyNotHigher,
      });
    }
  });

  it("keeps generated migration evidence sealed and runtime assets available", () => {
    expect(
      existsSync(
        resolve(
          projectRoot,
          "src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json",
        ),
      ),
    ).toBe(true);
    expect(existsSync(resolve(projectRoot, "public/assets/fighters"))).toBe(
      true,
    );
  });

  it("retains the current source versions and Rafael dos Anjos addition", () => {
    expect(v2RankingRoster).toMatchObject({
      modelAsOfDate: "2026-08-16",
      factsVersion: "octagon-hq-v2-rankings-refresh-facts-20260816",
    });
    expect(
      canonicalRankingInputs.fighters.some(
        ({ fighter }) => fighter === "Rafael dos Anjos",
      ),
    ).toBe(true);
  });
});

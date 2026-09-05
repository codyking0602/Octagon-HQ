import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  createFootballHitTheNumberPlan,
  footballHitTheNumberPlanQuality,
  footballHitTheNumberSelectionSatisfies,
} from "../back-room/footballHitTheNumberModel";
import { getFootballFact } from "../back-room/footballFactualStats";
import { GAME_SOURCE_AUTHORITY } from "../games/gameSourceAuthority";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { hitTheNumberStatRows } from "./hitTheNumberEngine";
import { createQualityGatedHitTheNumberFormatPlan, hitTheNumberRandomPoolQuality } from "./hitTheNumberPoolQuality";

describe("Hit the Number PR7 cross-sport parity", () => {
  it("keeps UFC and Football facts on their declared canonical owners", () => {
    expect(GAME_SOURCE_AUTHORITY["hit-the-number"].UFC.owners).toEqual(["ufc-factual-ledger"]);
    expect(GAME_SOURCE_AUTHORITY["hit-the-number"].Football.owners).toEqual(["football-factual-registry"]);

    const canonicalUfcIds = new Set(canonicalRankingInputs.fighters.map((fighter) => fighter.presentation.slug));
    expect(new Set(hitTheNumberStatRows.map((row) => row.fighterId))).toEqual(canonicalUfcIds);

    const ufcRuntime = readFileSync("src/features/play/hitTheNumberEngine.ts", "utf8");
    const footballRuntime = readFileSync("src/features/back-room/footballHitTheNumberModel.ts", "utf8");
    expect(ufcRuntime).toContain('from "../rankings/data/rankingInputs"');
    expect(ufcRuntime).toContain("deriveUfcCareerStats");
    expect(footballRuntime).toContain('from "./footballFactualStats"');
    expect(footballRuntime).toContain("getFootballFact");
  });

  it("quality-gates a large deterministic UFC Random Pool sample across every mature format", () => {
    const formats = new Set<string>();

    for (let index = 0; index < 320; index += 1) {
      const seed = `pr7-ufc-random-${index}`;
      const first = createQualityGatedHitTheNumberFormatPlan({ seed, boardType: "random-pool" });
      const replay = createQualityGatedHitTheNumberFormatPlan({ seed, boardType: "random-pool" });
      const quality = hitTheNumberRandomPoolQuality(first);

      expect(replay).toEqual(first);
      expect(quality.passes, `${seed}:${first.format.formatId}:${first.statId}`).toBe(true);
      expect(first.fighterIds.length).toBeGreaterThan(first.pickCount);
      formats.add(first.format.formatId);
    }

    expect(formats).toEqual(new Set(["classic", "themed-lineup", "one-from-each", "build-the-team"]));
  }, 90_000);

  it("keeps Football deterministic, quality-gated, broad, and fact-backed over a large sample", () => {
    const formats = new Set<string>();
    let nfl = 0;
    let cfb = 0;

    for (let index = 0; index < 240; index += 1) {
      const seed = `pr7-football-random-${index}`;
      const first = createFootballHitTheNumberPlan(seed, "random-pool");
      const replay = createFootballHitTheNumberPlan(seed, "random-pool");

      expect(replay).toEqual(first);
      expect(footballHitTheNumberPlanQuality(first).passes).toBe(true);
      expect(footballHitTheNumberSelectionSatisfies(first, first.solutionSubjectIds)).toBe(true);
      formats.add(first.formatId);
      if (first.league === "NFL") nfl += 1;
      if (first.league === "CFB") cfb += 1;

      for (const subjectId of first.subjectIds) {
        const fact = getFootballFact(subjectId, first.metricId);
        expect(fact, `${first.metricId}:${subjectId}`).not.toBeNull();
        expect(fact!.sources.length).toBeGreaterThan(0);
      }
    }

    expect(formats).toEqual(new Set(["classic", "themed-lineup", "one-from-each", "build-the-team"]));
    expect(nfl).toBeGreaterThan(0);
    expect(cfb).toBeGreaterThan(0);
  }, 90_000);

  it("keeps result, replay, and challenge actions aligned across UFC and Football", () => {
    const ufcPage = readFileSync("src/features/play/HitTheNumberPage.tsx", "utf8");
    const footballPage = readFileSync("src/features/back-room/FootballHitTheNumberPage.tsx", "utf8");

    for (const page of [ufcPage, footballPage]) {
      expect(page).toContain("<GameResultActions");
      expect(page).toContain("onReplay={replay}");
      expect(page).toContain("seed:");
      expect(page).toContain("board");
    }

    expect(ufcPage).toContain('replayLabel={shared ? "REPLAY CHALLENGE" : "NEW LINEUP"}');
    expect(footballPage).toContain('replayLabel={shared ? "REPLAY CHALLENGE" : "NEW BOARD"}');
  });
});

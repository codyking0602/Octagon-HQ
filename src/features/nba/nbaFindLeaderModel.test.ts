import { describe, expect, it } from "vitest";
import { NBA_HIT_STAT_CATALOG, nbaHitSubjectById, nbaHitValue } from "./nbaHitTheNumberStats";
import {
  NBA_FIND_LEADER_CANDIDATE_COUNT, NBA_FIND_LEADER_MAX_RETRIES,
  buildNbaFindLeaderBoard, createNbaFindLeaderBoard, createNbaFindLeaderDailyPreviewRun,
  nbaFindLeaderBoardQuality, nbaFindLeaderDefinitions, nbaFindLeaderHeadshot, nbaFindLeaderReplayAudit,
} from "./nbaFindLeaderModel";

describe("NBA Find the Leader owner-preview quality contract", () => {
  it("launches with the six approved regular-season per-game statistics", () => {
    expect(new Set(nbaFindLeaderDefinitions.map(def => def.metricId))).toEqual(new Set(NBA_HIT_STAT_CATALOG.map(stat => stat.id)));
    expect(nbaFindLeaderDefinitions.every(def => /regular.season/i.test(def.question))).toBe(true);
    expect(nbaFindLeaderDefinitions.every(def => /career|2024–25|2025–26/i.test(def.question))).toBe(true);
  });
  it("produces ten recognizable distinct players, one superior group leader, and factual stat values", () => {
    for (let seed = 0; seed < 300; seed += 1) {
      const board = createNbaFindLeaderBoard("nba-quality-" + seed);
      expect(board.candidates).toHaveLength(NBA_FIND_LEADER_CANDIDATE_COUNT);
      expect(new Set(board.candidates.map(row => row.id)).size).toBe(10);
      expect(nbaFindLeaderBoardQuality(board).eligible).toBe(true);
      expect(board.leaderValue).toBe(Math.max(...board.candidates.map(row => row.value)));
      expect(board.candidates.filter(row => row.id === board.leaderId)).toHaveLength(1);
      for (const row of board.candidates) {
        const canonical = nbaHitSubjectById.get(row.id);
        expect(canonical).toBeDefined();
        expect(row.value).toBe(nbaHitValue(canonical!, board.metricId));
        expect(row.displayName).toBe(canonical!.name);
        if (canonical!.scope === "season") {
          expect(row.season).toMatch(/^20(24–25|25–26)$/);
          expect(row.name).toContain(row.season!);
        } else expect(row.season).toBeUndefined();
      }
    }
  });
  it("keeps an immutable day-specific preview board without publishing an official attempt", () => {
    const a = createNbaFindLeaderDailyPreviewRun("2026-10-19");
    const b = createNbaFindLeaderDailyPreviewRun("2026-10-19");
    expect(a.board).toEqual(b.board);
    expect(a.identity.type).toBe("daily");
    expect(a.identity.scopeId).toBe("owner-preview");
  });
  it("uses the same tested headshot source as approved NBA Hit the Number", () => {
    expect(nbaFindLeaderHeadshot("career:Magic Johnson")).toContain("/77142.png");
    expect(nbaFindLeaderHeadshot("season-2026:Luka Dončić")).toContain("/1629029.png");
  });
  it("audits at least 1000 playable seeds with no invalid boards", () => {
    expect(NBA_FIND_LEADER_MAX_RETRIES).toBeLessThanOrEqual(24);
    const audit = nbaFindLeaderReplayAudit(1000);
    expect(audit.invalid).toBe(0);
    expect(audit.metrics).toBeGreaterThanOrEqual(6);
    expect(audit.definitions).toBeGreaterThanOrEqual(12);
    expect(audit.uniqueBoardShare).toBeGreaterThan(0.90);
    expect(audit.subjects).toBeGreaterThan(70);
  });
  it("disables low-quality or undersized definitions instead of relaxing core rules", () => {
    for (const definition of nbaFindLeaderDefinitions) {
      const board = buildNbaFindLeaderBoard(definition, "definition-check");
      if (board) expect(nbaFindLeaderBoardQuality(board).eligible).toBe(true);
    }
  });
});

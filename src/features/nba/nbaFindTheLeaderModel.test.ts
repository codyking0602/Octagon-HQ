import { describe, expect, it } from "vitest";
import { NBA_FIND_HISTORICAL_SEASONS } from "./nbaFindTheLeaderHistoricalSeasons";
import {
  NBA_FIND_LEADER_DEFINITIONS, NBA_FIND_LEADER_GAME_ID,
  buildNbaFindLeaderBoard, createNbaFindLeaderBoard,
  createNbaFindLeaderChallenge, createNbaFindLeaderDailyPreview,
  formatNbaFindLeaderValue, nbaFindLeaderAudit, nbaFindLeaderSubjects,
  nbaFindLeaderDefinitionWeight, nbaFindLeaderHeadshot,
} from "./nbaFindTheLeaderModel";

describe("NBA Find the Leader factual and gameplay quality", () => {
  it("uses the six intuitive per-game metric/scope combinations", () => {
    expect(new Set(NBA_FIND_LEADER_DEFINITIONS.map(d => d.scope + ":" + d.metric))).toEqual(new Set([
      "career:points", "career:assists", "career:rebounds",
      "season:points", "season:assists", "season:rebounds",
    ]));
    expect(NBA_FIND_LEADER_DEFINITIONS.every(d => /per game/.test(d.question))).toBe(true);
  });
  it("reuses the approved roster across historical eras without fabricating partial seasons", () => {
    expect(NBA_FIND_HISTORICAL_SEASONS.length).toBeGreaterThan(400);
    expect(new Set(NBA_FIND_HISTORICAL_SEASONS.map(s => s[0])).size).toBeGreaterThan(9);
    expect(NBA_FIND_HISTORICAL_SEASONS.every(row => row[6] != null)).toBe(true);
    expect(nbaFindLeaderSubjects.some(s => s.season === 2025)).toBe(true);
    expect(nbaFindLeaderSubjects.some(s => s.season === 2026)).toBe(true);
    expect(new Set(nbaFindLeaderSubjects.map(s => s.id)).size).toBe(nbaFindLeaderSubjects.length);
    for (const subject of nbaFindLeaderSubjects) {
      if (subject.season == null) continue;
      expect(subject.games).toBeGreaterThanOrEqual(45);
      expect(subject.seasonLabel).toMatch(/^\d{4}–\d{2}$/);
      expect(Object.values(subject.values).every(v => Number.isFinite(v) && Math.abs(v * 10 - Math.round(v * 10)) < 1e-8)).toBe(true);
    }
  });
  it("preserves verified standout reference seasons", () => {
    const jordan = nbaFindLeaderSubjects.find(s => s.name === "Michael Jordan" && s.season === 1988);
    const russell = nbaFindLeaderSubjects.find(s => s.name === "Russell Westbrook" && s.season === 2017);
    expect(jordan?.values).toMatchObject({ points: 35.0, rebounds: 5.5, assists: 5.9 });
    expect(russell?.values).toMatchObject({ points: 31.6, rebounds: 10.7, assists: 10.4 });
    // The historical CSV calls Tim Hardaway Jr. "Tim Hardaway"; do not bind those seasons to his father.
    expect(nbaFindLeaderSubjects.some(s => s.name === "Tim Hardaway" && (s.season === 2014 || s.season === 2017))).toBe(false);
  });
  it("generates correct distinct ten-person boards with a sole visible leader", () => {
    for (let index = 0; index < 200; index++) {
      const seed = "nba-quality-" + index;
      const board = createNbaFindLeaderBoard(seed);
      expect(board.candidates, seed).toHaveLength(10);
      expect(new Set(board.candidates.map(c => c.id)).size, seed).toBe(10);
      expect(new Set(board.candidates.map(c => c.name)).size, seed).toBe(10);
      expect(board.candidates.filter(c => c.value === board.leaderValue), seed).toHaveLength(1);
      expect(board.candidates.every(c => c.value <= board.leaderValue), seed).toBe(true);
      expect(new Set(board.candidates.map(c => c.value)).size, seed).toBeGreaterThanOrEqual(6);
      expect(createNbaFindLeaderBoard(seed), seed).toEqual(board);
      for (const row of board.candidates) {
        if (row.season == null) continue;
        expect(row.seasonLabel, seed).toMatch(/^\d{4}–\d{2}$/);
      }
    }
  });
  it("makes modern seasons the everyday experience, with classic boards as throwbacks", () => {
    expect(nbaFindLeaderDefinitionWeight(NBA_FIND_LEADER_DEFINITIONS.find(d => d.id === "season:2025:assists")!))
      .toBeGreaterThan(10 * nbaFindLeaderDefinitionWeight(NBA_FIND_LEADER_DEFINITIONS.find(d => d.id === "season:1972:assists")!));
    const boards = Array.from({ length: 240 }, (_, i) => createNbaFindLeaderBoard("modern-mix-" + i));
    const oldSeasons = boards.filter(b => /^season:(1972|1977|1982|1988):/.test(b.definitionId));
    const modernSeasons = boards.filter(b => /^season:(1993|1996|2001|2006|2011|2014|2017|2025|2026):/.test(b.definitionId) ||
      /^season:(nineties|millennium|twenty-tens|recent):/.test(b.definitionId));
    expect(oldSeasons.length).toBeLessThan(40);
    expect(modernSeasons.length).toBeGreaterThan(110);
    for (const board of boards) {
      expect(board.question).not.toContain("player-season");
      expect(new Set(board.candidates.map(c => c.subtitle)).size).toBe(1);
      expect(board.candidates[0]?.subtitle).toBe("NBA regular season");
      const year = /^season:(\d{4}):/.exec(board.definitionId)?.[1];
      if (year) expect(board.question).toContain((Number(year)-1) + "–" + year.slice(-2));
    }
  });
  it("uses verified player photos and fixes the Gail Goodrich silhouette", () => {
    expect(nbaFindLeaderHeadshot({ name: "Gail Goodrich", nbaId: 76832 }))
      .toBe("https://cdn.nba.com/manage/2021/08/GettyImages-1148261504.jpg");
    expect(nbaFindLeaderHeadshot({ name: "John Havlicek", nbaId: 76970 }))
      .toBe("https://cdn.nba.com/headshots/nba/latest/1040x760/76970.png");
    expect(nbaFindLeaderHeadshot({ name: "Kareem Abdul-Jabbar", nbaId: 76003 }))
      .toBe("https://cdn.nba.com/headshots/nba/latest/1040x760/76003.png");
  });
  it("supports deterministic owner daily previews and identical challenge reconstructions", () => {
    const daily = createNbaFindLeaderDailyPreview("2026-10-19");
    const replay = createNbaFindLeaderDailyPreview("2026-10-19");
    expect(daily.board).toEqual(replay.board);
    expect(daily.identity.type).toBe("daily");
    expect(daily.identity.gameId).toBe(NBA_FIND_LEADER_GAME_ID);
    const definition = NBA_FIND_LEADER_DEFINITIONS.find(d => d.id === daily.board.definitionId)!;
    expect(buildNbaFindLeaderBoard(definition, daily.identity.seed)).toEqual(daily.board);
    const challenge = createNbaFindLeaderChallenge(daily.identity.seed, definition.id, "TEST1234");
    expect(challenge?.board).toEqual(daily.board);
    expect(formatNbaFindLeaderValue(10.24)).toBe("10.2");
  });
  it("passes broad deterministic board-quality simulations", () => {
    const audit = nbaFindLeaderAudit(250);
    expect(audit.invalid).toBe(0);
    expect(audit.uniqueBoards).toBeGreaterThan(180);
    expect(audit.definitions).toBeGreaterThan(10);
  });
});

import { describe, expect, it } from "vitest";
import type { PlayLineupHistory } from "../play/lineupModel";
import {
  createFootballFindLeaderBoard,
  footballFindLeaderCategoryLabel,
} from "./footballFindLeaderModel";

const emptyHistory: PlayLineupHistory = {
  entries: [],
  recentItemIds: [],
  recentFighterIds: [],
  lastLineup: [],
};

describe("Football Find the Leader expanded-domain regressions", () => {
  it("surfaces the broader CFB team-season pool on its deterministic rotation slot", () => {
    const board = createFootballFindLeaderBoard(
      "football-find-leader-aaaaaaaa-aaaa-4aaa-8aaa-abcd00000009",
      emptyHistory,
    );

    expect(board.domainId).toBe("cfb-team-season");
    expect(board.metricId).toBe("cfb-team-season-wins");
    expect(board.candidates).toHaveLength(10);
  });

  it("surfaces recognizable CFB rushing depth on its deterministic rotation slot", () => {
    const board = createFootballFindLeaderBoard(
      "football-find-leader-aaaaaaaa-aaaa-4aaa-8aaa-abcd00000003",
      emptyHistory,
    );

    expect(board.domainId).toBe("cfb-player-rushing");
    expect(["cfb-player-rushing-yards", "cfb-player-rushing-touchdowns"]).toContain(board.metricId);
    expect(board.candidates).toHaveLength(10);
  });

  it("labels every catalog domain accurately, including quality-gated depth", () => {
    expect(footballFindLeaderCategoryLabel("nfl-qb-career")).toBe("NFL QB CAREERS");
    expect(footballFindLeaderCategoryLabel("nfl-rb-career")).toBe("NFL RB CAREERS");
    expect(footballFindLeaderCategoryLabel("nfl-qb-season")).toBe("NFL QB SEASONS");
    expect(footballFindLeaderCategoryLabel("nfl-team-season")).toBe("NFL TEAM SEASONS");
    expect(footballFindLeaderCategoryLabel("nfl-receiving-career")).toBe("NFL RECEIVING CAREERS");
    expect(footballFindLeaderCategoryLabel("nfl-defense-career")).toBe("NFL DEFENSIVE CAREERS");
    expect(footballFindLeaderCategoryLabel("cfb-champion-season")).toBe("CFB CHAMPION SEASONS");
    expect(footballFindLeaderCategoryLabel("cfb-team-season")).toBe("CFB TEAM SEASONS");
    expect(footballFindLeaderCategoryLabel("cfb-player-rushing")).toBe("CFB RUSHING SEASONS");
    expect(footballFindLeaderCategoryLabel("cfb-player-receiving")).toBe("CFB RECEIVING SEASONS");
    expect(footballFindLeaderCategoryLabel("cfb-coach-career")).toBe("CFB COACH CAREERS");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlayLineupHistory } from "../play/lineupModel";
import {
  createFootballFindLeaderBoard,
  createFootballFindLeaderRun,
} from "./footballFindLeaderModel";
import { footballFindLeaderLeagueForDomain } from "./footballFindLeaderStats";
import { footballSubjects } from "./footballSubjectRegistry";

const emptyHistory: PlayLineupHistory = {
  entries: [],
  recentItemIds: [],
  recentFighterIds: [],
  lastLineup: [],
};

type Uuid = `${string}-${string}-${string}-${string}-${string}`;

function uuidForOrdinal(ordinal: number): Uuid {
  return `00000000-0000-4000-8000-${ordinal.toString(16).padStart(12, "0")}` as Uuid;
}

describe("Football Find the Leader projected replay validation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("lets real replay runs surface projected NFL and CFB ledger subjects", () => {
    const curatedIds = new Set(footballSubjects.map((subject) => subject.id));
    const projectedSeedByLeague = new Map<"nfl" | "cfb", Uuid>();

    for (let ordinal = 0; ordinal < 80 && projectedSeedByLeague.size < 2; ordinal += 1) {
      const uuid = uuidForOrdinal(ordinal);
      const board = createFootballFindLeaderBoard(`football-find-leader-${uuid}`, emptyHistory);
      const league = footballFindLeaderLeagueForDomain(board.domainId);
      if (board.candidates.some((candidate) => !curatedIds.has(candidate.id))) {
        projectedSeedByLeague.set(league, uuid);
      }
    }

    expect(projectedSeedByLeague.has("nfl")).toBe(true);
    expect(projectedSeedByLeague.has("cfb")).toBe(true);

    const randomUuid = vi.spyOn(globalThis.crypto, "randomUUID");
    for (const league of ["nfl", "cfb"] as const) {
      window.localStorage.clear();
      randomUuid.mockReturnValue(projectedSeedByLeague.get(league)!);
      const run = createFootballFindLeaderRun();
      expect(footballFindLeaderLeagueForDomain(run.board.domainId)).toBe(league);
      expect(run.board.candidates.some((candidate) => !curatedIds.has(candidate.id))).toBe(true);
    }
  });
});

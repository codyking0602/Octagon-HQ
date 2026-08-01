import { beforeEach, describe, expect, it } from "vitest";
import {
  curatedLineupIdentity,
  dailyLineupIdentity,
  dailyLineupSeed,
  loadLineupHistory,
  recordLineupCompletion,
  replayLabelFor,
  selectReplayLineup,
  validLineupPool,
  validateLineupIds,
} from "./lineupModel";

beforeEach(() => {
  window.localStorage.clear();
});

describe("shared Play lineup owner", () => {
  it("keeps daily identity and seed deterministic with fixed replay behavior", () => {
    const first = dailyLineupIdentity("find-leader", "2026-07-29");
    const second = dailyLineupIdentity("find-leader", "2026-07-29");
    expect(first).toEqual(second);
    expect(first.type).toBe("daily");
    expect(first.seed).toBe("daily|2026-07-29");
    expect(first.seed).toBe(dailyLineupSeed("2026-07-29"));
    expect(first.replayBehavior).toBe("same-daily-lineup");
    expect(replayLabelFor(first.type)).toBe("REPLAY TODAY");
  });

  it("keeps curated challenges on one stable identity", () => {
    const identity = curatedLineupIdentity("blind-rank", "ABC123", ["a", "b", "c"]);
    expect(identity.type).toBe("curated");
    expect(identity.challengeId).toContain("ABC123");
    expect(replayLabelFor(identity.type)).toBe("REPLAY CHALLENGE");
  });

  it("filters one canonical pool with division restrictions and no duplicate ids", () => {
    const pool = [
      { id: "a", divisions: ["Lightweight"] },
      { id: "a", divisions: ["Lightweight"] },
      { id: "b", divisions: ["Welterweight"] },
      { id: "c", divisions: ["Lightweight", "Welterweight"] },
    ];
    const valid = validLineupPool(pool, {
      getId: (row) => row.id,
      getDivisions: (row) => row.divisions,
      requiredDivisions: ["Lightweight"],
    });
    expect(valid.map((row) => row.id)).toEqual(["a", "c"]);
  });

  it("rejects wrong sizes, duplicates, and ids outside the valid pool", () => {
    expect(validateLineupIds(["a"], 2).reason).toBe("wrong-size");
    expect(validateLineupIds(["a", "a"], 2).reason).toBe("duplicate-items");
    expect(validateLineupIds(["a", "b"], 2, new Set(["a"])).reason).toBe("outside-pool");
  });

  it("deprioritizes the immediately previous lineup on replay", () => {
    const seeds = ["first", "repeat", "fresh"];
    const first = selectReplayLineup({
      gameId: "test-game",
      lineupSize: 2,
      attempts: 1,
      seedFactory: () => seeds[0],
      build: () => ({ value: "first", itemIds: ["a", "b"], fighterIds: ["a", "b"] }),
    });
    expect(first.itemIds).toEqual(["a", "b"]);

    const next = selectReplayLineup({
      gameId: "test-game",
      lineupSize: 2,
      attempts: 2,
      seedFactory: (attempt) => seeds[attempt + 1],
      build: (seed) => seed === "repeat"
        ? { value: "repeat", itemIds: ["a", "b"], fighterIds: ["a", "b"] }
        : { value: "fresh", itemIds: ["c", "d"], fighterIds: ["c", "d"] },
    });

    expect(next.value).toBe("fresh");
    expect(next.itemIds).toEqual(["c", "d"]);
  });

  it("records a defined completion state on the selected challenge identity", () => {
    const selected = selectReplayLineup({
      gameId: "history-game",
      lineupSize: 1,
      attempts: 1,
      seedFactory: () => "history-seed",
      build: () => ({ value: "round", itemIds: ["fighter-a"], fighterIds: ["fighter-a"] }),
    });
    recordLineupCompletion(selected.identity, { score: 4 });
    const history = loadLineupHistory("history-game");
    expect(history.entries[0]?.completedAt).toBeTruthy();
    expect(history.entries[0]?.result).toEqual({ score: 4 });
  });
});

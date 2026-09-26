import { describe, expect, it } from "vitest";
import { MLB_BLIND_RESUME_OWNER_ROUNDS } from "./MlbBlindResumeOwnerRun";
import {
  MLB_BLIND_RESUME_PRODUCTION_CHALLENGE_KEY,
  MLB_BLIND_RESUME_PRODUCTION_DATE,
  MLB_BLIND_RESUME_PRODUCTION_ROUNDS,
  MLB_BLIND_RESUME_PRODUCTION_SOURCE_NOTES,
} from "./mlbBlindResumeProduction";
import { MLB_WHO_AM_I_PRODUCTION_ROUNDS } from "./mlbWhoAmIProduction";

describe("MLB Blind Resume October 9 production content", () => {
  it("locks the scheduled five-round production card", () => {
    expect(MLB_BLIND_RESUME_PRODUCTION_CHALLENGE_KEY).toBe("mlb-2026-play-05");
    expect(MLB_BLIND_RESUME_PRODUCTION_DATE).toBe("2026-10-09");
    expect(MLB_BLIND_RESUME_PRODUCTION_ROUNDS).toHaveLength(5);
    expect(MLB_BLIND_RESUME_PRODUCTION_ROUNDS.every((round) => round.stats.length === 8)).toBe(true);

    const players = MLB_BLIND_RESUME_PRODUCTION_ROUNDS.flatMap((round) => [round.playerA, round.playerB]);
    expect(new Set(players.map((player) => player.name)).size).toBe(10);
    expect(players.every((player) => player.id.startsWith("mlb-"))).toBe(true);
  });

  it("never reuses burned owner-review players or the October 6 production identities", () => {
    const burnedOwnerNames = new Set(
      MLB_BLIND_RESUME_OWNER_ROUNDS.flatMap((round) => [round.playerA.name, round.playerB.name]),
    );
    const priorProductionNames = new Set(
      MLB_WHO_AM_I_PRODUCTION_ROUNDS.map((round) => round.hiddenSubject.name),
    );
    const productionNames = MLB_BLIND_RESUME_PRODUCTION_ROUNDS.flatMap(
      (round) => [round.playerA.name, round.playerB.name],
    );

    expect(productionNames.every((name) => !burnedOwnerNames.has(name))).toBe(true);
    expect(productionNames.every((name) => !priorProductionNames.has(name))).toBe(true);
  });

  it("uses career WAR as the final objective anchor in every matchup", () => {
    MLB_BLIND_RESUME_PRODUCTION_ROUNDS.forEach((round) => {
      const war = round.stats.at(-1);
      expect(war?.label).toBe("CAREER WAR");
      const a = Number(war?.valueA);
      const b = Number(war?.valueB);
      expect(Number.isFinite(a) && Number.isFinite(b)).toBe(true);
      expect(round.winnerId).toBe(a > b ? round.playerA.id : round.playerB.id);
    });
  });

  it("keeps one verified authority note for every production player", () => {
    const productionNames = MLB_BLIND_RESUME_PRODUCTION_ROUNDS.flatMap(
      (round) => [round.playerA.name, round.playerB.name],
    );
    expect(MLB_BLIND_RESUME_PRODUCTION_SOURCE_NOTES).toHaveLength(10);
    expect(new Set(MLB_BLIND_RESUME_PRODUCTION_SOURCE_NOTES.map((source) => source.player))).toEqual(
      new Set(productionNames),
    );
    expect(MLB_BLIND_RESUME_PRODUCTION_SOURCE_NOTES.every((source) => (
      source.authority === "Baseball-Reference"
      && source.url.startsWith("https://www.baseball-reference.com/players/")
      && source.verifiedAt === "2026-09-25"
    ))).toBe(true);
  });
});

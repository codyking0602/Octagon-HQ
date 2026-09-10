import { describe, expect, it } from "vitest";
import { queryFootballSubjects } from "../back-room/footballSubjectRegistry";
import {
  FOOTBALL_WHO_AM_I_PLAYER_TARGETS,
  createUfcWhoAmIRound,
  footballWhoAmIPositionGroup,
  getFootballWhoAmILaunchPool,
  getFootballWhoAmIUniverse,
} from "./whoAmIAuthority";
import {
  WHO_AM_I_MODERN_ERA_SHARE,
  createWhoAmIRound,
  type WhoAmICandidate,
} from "./whoAmIEngine";

const LEAGUES = ["NFL", "CFB"] as const;

function tenClueCandidate(id: string, eraBand: "modern" | "legacy"): WhoAmICandidate {
  return {
    id,
    name: id,
    kind: "player",
    eraBand,
    clues: Array.from({ length: 10 }, (_value, index) => ({
      id: `${id}:${index}`,
      text: `${id} clue ${index}`,
      band: "helpful" as const,
    })),
  };
}

describe("Who Am I Football launch pools", () => {
  it.each(LEAGUES)("locks the %s launch census at 180 players, 20 coaches, and 200 identities", (league) => {
    const pool = getFootballWhoAmILaunchPool(league);
    expect(pool.players).toHaveLength(180);
    expect(pool.coaches).toHaveLength(20);
    expect(pool.subjects).toHaveLength(200);
    expect(pool.players.every((subject) => subject.kind === "player-career")).toBe(true);
    expect(pool.coaches.every((subject) => subject.kind === "coach")).toBe(true);
  });

  it.each(LEAGUES)("matches the exact %s player position distribution", (league) => {
    const pool = getFootballWhoAmILaunchPool(league);
    const counts = Object.fromEntries(
      Object.keys(FOOTBALL_WHO_AM_I_PLAYER_TARGETS[league]).map((group) => [group, 0]),
    ) as Record<keyof typeof FOOTBALL_WHO_AM_I_PLAYER_TARGETS[typeof league], number>;

    for (const subject of pool.players) {
      const group = footballWhoAmIPositionGroup(subject.position);
      expect(group).not.toBeNull();
      counts[group!] += 1;
    }

    expect(counts).toEqual(FOOTBALL_WHO_AM_I_PLAYER_TARGETS[league]);
  });

  it.each(LEAGUES)("excludes kickers and punters from the %s launch pool", (league) => {
    const pool = getFootballWhoAmILaunchPool(league);
    expect(pool.players.some((subject) => subject.position === "K" || subject.position === "P")).toBe(false);
  });

  it.each(LEAGUES)("selects only canonical A/B recognition subjects for %s", (league) => {
    const pool = getFootballWhoAmILaunchPool(league);
    expect(pool.subjects.every((subject) => subject.recognizabilityTier === "A" || subject.recognizabilityTier === "B")).toBe(true);
  });

  it("keeps reviewed league-context recognition corrections scoped to the NFL identities", () => {
    const nflRecognized = queryFootballSubjects({
      league: "NFL",
      recognizabilityTiers: ["A", "B"],
      includeProjectedSourceSubjects: true,
      includeProjectedCanonicalRecognition: true,
    });
    for (const name of ["Johnny Manziel", "Tim Tebow", "Vince Young"] as const) {
      const subject = nflRecognized.find((candidate) => candidate.kind === "player-career" && candidate.name === name);
      expect(subject?.recognizabilityTier).toBe("B");
    }

    const nfl = getFootballWhoAmILaunchPool("NFL");
    expect(nfl.coaches.some((subject) => subject.name === "Nick Saban" || subject.name === "Urban Meyer")).toBe(false);

    const cfb = getFootballWhoAmILaunchPool("CFB");
    for (const name of ["Johnny Manziel", "Tim Tebow", "Vince Young", "Nick Saban", "Urban Meyer"] as const) {
      expect(cfb.subjects.find((subject) => subject.name === name)?.recognizabilityTier).toBe("A");
    }
  });

  it.each(LEAGUES)("keeps %s launch selection deterministic", (league) => {
    const first = getFootballWhoAmILaunchPool(league).subjects.map((subject) => subject.id);
    const second = getFootballWhoAmILaunchPool(league).subjects.map((subject) => subject.id);
    expect(second).toEqual(first);
  });

  it("preserves the established 75% modern-era round-selection behavior", () => {
    expect(WHO_AM_I_MODERN_ERA_SHARE).toBe(0.75);
    const universe = {
      sport: "football" as const,
      league: "NFL" as const,
      candidates: [
        tenClueCandidate("modern", "modern"),
        tenClueCandidate("legacy", "legacy"),
      ],
    };
    expect(createWhoAmIRound(universe, () => 0.74).hiddenSubject.id).toBe("modern");
    expect(createWhoAmIRound(universe, () => 0.75).hiddenSubject.id).toBe("legacy");
  });

  it("keeps UFC, NFL, and CFB Who Am I rounds playable", () => {
    expect(createUfcWhoAmIRound(() => 0).clues).toHaveLength(10);
    expect(createWhoAmIRound(getFootballWhoAmIUniverse("NFL"), () => 0).clues).toHaveLength(10);
    expect(createWhoAmIRound(getFootballWhoAmIUniverse("CFB"), () => 0).clues).toHaveLength(10);
  });
});

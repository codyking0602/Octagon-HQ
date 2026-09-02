import { describe, expect, it } from "vitest";
import type { PickEvent } from "./picksModel";
import { FOOTBALL_MATCHUP_BREAKDOWNS, footballMatchupBoutForBreakdown, footballMatchupBreakdownsForEvent } from "./footballMatchupBreakdowns";

function footballEvent(teamPairs: Array<[string, string, string, string]>): PickEvent {
  return {
    eventId: "football-week-1",
    sport: "football",
    name: "Football Week 1",
    subtitle: "",
    venue: "Multiple venues",
    location: "Nationwide",
    startsAt: "2026-09-05T16:00:00Z",
    locksAt: "2026-09-05T16:00:00Z",
    season: 2026,
    status: "upcoming",
    bouts: teamPairs.map(([homeSlug, homeName, awaySlug, awayName], index) => ({
      boutId: `${awaySlug}-${homeSlug}`,
      position: index + 1,
      weightClass: "COLLEGE-FOOTBALL ATS",
      redFighterSlug: homeSlug,
      redFighterName: homeName,
      blueFighterSlug: awaySlug,
      blueFighterName: awayName,
      homeTeamSlug: homeSlug,
      awayTeamSlug: awaySlug,
      redAmericanOdds: null,
      blueAmericanOdds: null,
      winnerFighterSlug: null,
      resultStatus: "pending",
    })),
  };
}

describe("football matchup breakdowns", () => {
  it("discovers authored featured matchups from the canonical slate games without an event-id map", () => {
    const event = footballEvent([
      ["lsu", "LSU Tigers", "clemson", "Clemson Tigers"],
      ["ole-miss", "Ole Miss Rebels", "louisville", "Louisville Cardinals"],
      ["texas", "Texas Longhorns", "texas-state", "Texas State Bobcats"],
    ]);

    expect(footballMatchupBreakdownsForEvent(event).map((breakdown) => breakdown.id)).toEqual([
      "2026-lsu-clemson",
      "2026-louisville-ole-miss",
    ]);
    expect(footballMatchupBoutForBreakdown(event, FOOTBALL_MATCHUP_BREAKDOWNS[1])?.boutId).toBe("louisville-ole-miss");
  });

  it("does not surface a breakdown for an unrelated slate", () => {
    const event = footballEvent([["texas", "Texas Longhorns", "texas-state", "Texas State Bobcats"]]);
    expect(footballMatchupBreakdownsForEvent(event)).toEqual([]);
    expect(footballMatchupBoutForBreakdown(event, FOOTBALL_MATCHUP_BREAKDOWNS[0])).toBeNull();
  });

  it("keeps the locked editorial structure, limits The HQ Edge to opposing units, and carries no final read or score", () => {
    for (const breakdown of FOOTBALL_MATCHUP_BREAKDOWNS) {
      expect(breakdown.keyMatchups).toHaveLength(3);
      expect(breakdown.pathsToWin).toHaveLength(2);
      expect(breakdown.playersToWatch).toHaveLength(2);
      expect(breakdown.unitEdges).toHaveLength(2);
      expect(breakdown.unitEdges.every((unit) => unit.title.includes("OFFENSE vs."))).toBe(true);
      expect(breakdown).not.toHaveProperty("hqRead");
      expect(breakdown).not.toHaveProperty("prediction");
    }
  });
});

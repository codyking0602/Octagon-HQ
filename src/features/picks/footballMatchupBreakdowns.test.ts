import { describe, expect, it } from "vitest";
import type { PickEvent } from "./picksModel";
import { FOOTBALL_MATCHUP_BREAKDOWNS, footballMatchupBreakdownsForEvent } from "./footballMatchupBreakdowns";

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
  it("discovers this week's authored featured matchups from the canonical slate games without an event-id map", () => {
    const event = footballEvent([
      ["usc-trojans", "USC Trojans", "oregon-ducks", "Oregon Ducks"],
      ["new-orleans-saints", "New Orleans Saints", "las-vegas-raiders", "Las Vegas Raiders"],
      ["texas", "Texas Longhorns", "texas-state", "Texas State Bobcats"],
    ]);

    expect(footballMatchupBreakdownsForEvent(event).map((breakdown) => breakdown.id)).toEqual([
      "2026-oregon-usc",
      "2026-raiders-saints",
    ]);
  });

  it("frames LSU-Ole Miss around Lane Kiffin's return to Oxford", () => {
    const breakdown = FOOTBALL_MATCHUP_BREAKDOWNS.find((item) => item.id === "2026-lsu-ole-miss");
    const setup = breakdown?.setup.join(" ") ?? "";

    expect(setup).toContain("Lane Kiffin’s return to Oxford is the story before the ball is even kicked");
    expect(setup).toContain("There won’t be much warmth waiting for him");
    expect(setup).toContain("make the game about execution instead of emotion");
  });

  it("does not surface a breakdown for an unrelated slate", () => {
    const event = footballEvent([["texas", "Texas Longhorns", "texas-state", "Texas State Bobcats"]]);
    expect(footballMatchupBreakdownsForEvent(event)).toEqual([]);
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

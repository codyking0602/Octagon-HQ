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
      ["seattle-seahawks", "Seattle Seahawks", "san-francisco-49ers", "San Francisco 49ers"],
      ["alabama-crimson-tide", "Alabama Crimson Tide", "georgia-bulldogs", "Georgia Bulldogs"],
      ["texas", "Texas Longhorns", "texas-state", "Texas State Bobcats"],
    ]);

    expect(footballMatchupBreakdownsForEvent(event).map((breakdown) => breakdown.id)).toEqual([
      "2026-49ers-seahawks",
      "2026-georgia-alabama",
    ]);
  });

  it("frames LSU-Ole Miss around Lane Kiffin's return to Oxford", () => {
    const breakdown = FOOTBALL_MATCHUP_BREAKDOWNS.find((item) => item.id === "2026-lsu-ole-miss");
    const setup = breakdown?.setup?.join(" ") ?? "";

    expect(setup).toContain("Lane Kiffin’s return to Oxford is the story before the ball is even kicked");
    expect(setup).toContain("There won’t be much warmth waiting for him");
    expect(setup).toContain("make the game about execution instead of emotion");
  });

  it("does not surface a breakdown for an unrelated slate", () => {
    const event = footballEvent([["texas", "Texas Longhorns", "texas-state", "Texas State Bobcats"]]);
    expect(footballMatchupBreakdownsForEvent(event)).toEqual([]);
  });

  it("also discovers Alabama-Mississippi State from its real upcoming slate matchup", () => {
    const event = footballEvent([[
      "mississippi-state-bulldogs",
      "Mississippi State Bulldogs",
      "alabama-crimson-tide",
      "Alabama Crimson Tide",
    ]]);

    expect(footballMatchupBreakdownsForEvent(event).map((breakdown) => breakdown.id)).toEqual([
      "2026-alabama-mississippi-state",
    ]);
  });

  it("uses the current AP poll and compact editorial structure for Alabama-Mississippi State", () => {
    const breakdown = FOOTBALL_MATCHUP_BREAKDOWNS.find((item) => item.id === "2026-alabama-mississippi-state");
    expect(breakdown?.compact?.rankingSource).toBe("AP");
    expect(breakdown?.teams.map((team) => team.rank)).toEqual([7, 16]);
    expect(breakdown?.teams.map((team) => team.record)).toEqual(["4–0", "4–0"]);
    expect(breakdown?.compact?.things).toHaveLength(3);
    expect(breakdown?.compact?.setup.map((part) => part.text).join("")).not.toContain("No. 7");
    expect(breakdown?.teams.map((team) => team.sportsReferenceUrl)).toEqual([
      "https://www.sports-reference.com/cfb/schools/alabama/2026.html",
      "https://www.sports-reference.com/cfb/schools/mississippi-state/2026.html",
    ]);
  });

  it("uses the compact NFL treatment for Chiefs-Raiders with 2026 team links", () => {
    const breakdown = FOOTBALL_MATCHUP_BREAKDOWNS.find((item) => item.id === "2026-chiefs-raiders");
    expect(breakdown?.title).toBe("Chiefs at Raiders");
    expect(breakdown?.kickoffAt).toBe("2026-10-04T20:25:00Z");
    expect(breakdown?.compact?.leagueLabel).toBe("NFL");
    expect(breakdown?.compact?.rankingSource).toBeUndefined();
    expect(breakdown?.teams.map((team) => team.record)).toEqual(["3–0", "3–0"]);
    expect(breakdown?.teams.map((team) => team.sportsReferenceUrl)).toEqual([
      "https://www.pro-football-reference.com/teams/kan/2026.htm",
      "https://www.pro-football-reference.com/teams/rai/2026.htm",
    ]);
    expect(breakdown?.compact?.things).toHaveLength(3);
  });

  it("uses the locked compact NFL treatment for 49ers-Seahawks with team logos and player links", () => {
    const breakdown = FOOTBALL_MATCHUP_BREAKDOWNS.find((item) => item.id === "2026-49ers-seahawks");

    expect(breakdown?.title).toBe("49ers at Seahawks");
    expect(breakdown?.kickoffAt).toBe("2026-10-11T20:25:00Z");
    expect(breakdown?.compact?.leagueLabel).toBe("NFL");
    expect(breakdown?.teams.map((team) => team.record)).toEqual(["4–0", "3–1"]);
    expect(breakdown?.teams.every((team) => Boolean(team.logoUrl))).toBe(true);
    expect(breakdown?.compact?.things).toHaveLength(3);
    expect(breakdown?.compact?.things.flatMap((thing) => thing.body).some((part) => part.href?.includes("PurdBr00"))).toBe(true);
    expect(breakdown?.compact?.things.flatMap((thing) => thing.body).some((part) => part.href?.includes("SmitJa06"))).toBe(true);
  });

  it("uses the current AP ranks and locked compact CFB treatment for Georgia-Alabama", () => {
    const breakdown = FOOTBALL_MATCHUP_BREAKDOWNS.find((item) => item.id === "2026-georgia-alabama");

    expect(breakdown?.title).toBe("Georgia at Alabama");
    expect(breakdown?.kickoffAt).toBe("2026-10-10T23:30:00Z");
    expect(breakdown?.compact?.rankingSource).toBe("AP");
    expect(breakdown?.teams.map((team) => team.rank)).toEqual([2, 6]);
    expect(breakdown?.teams.map((team) => team.record)).toEqual(["5–0", "5–0"]);
    expect(breakdown?.teams.every((team) => Boolean(team.logoUrl))).toBe(true);
    expect(breakdown?.compact?.things).toHaveLength(3);
    expect(breakdown?.compact?.things.flatMap((thing) => thing.body).some((part) => part.href?.includes("gunner-stockton-1"))).toBe(true);
    expect(breakdown?.compact?.things.flatMap((thing) => thing.body).some((part) => part.href?.includes("keelon-russell-1"))).toBe(true);
  });

  it("keeps legacy editorial contracts while allowing the approved compact matchup format", () => {
    for (const breakdown of FOOTBALL_MATCHUP_BREAKDOWNS) {
      if (breakdown.compact) {
        expect(breakdown.compact.things).toHaveLength(3);
        expect(breakdown.pathsToWin).toBeUndefined();
        expect(breakdown.playersToWatch).toBeUndefined();
        expect(breakdown.unitEdges).toBeUndefined();
      } else {
        expect(breakdown.keyMatchups).toHaveLength(3);
        expect(breakdown.pathsToWin).toHaveLength(2);
        expect(breakdown.playersToWatch).toHaveLength(2);
        expect(breakdown.unitEdges).toHaveLength(2);
        expect(breakdown.unitEdges?.every((unit) => unit.title.includes("OFFENSE vs."))).toBe(true);
      }
      expect(breakdown).not.toHaveProperty("hqRead");
      expect(breakdown).not.toHaveProperty("prediction");
    }
  });
});

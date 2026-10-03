import { describe, expect, it } from "vitest";
import {
  WHEEL_FOOTBALL_DIVISIONS,
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  wheelFootballCandidatesFromEspn,
  wheelFootballEligibleSlots,
  wheelFootballPoolTeams,
  wheelFootballTeams,
} from "./wheelFootballModel";

describe("Wheel of Football current-NFL model", () => {
  it("owns the complete NFL conference and division wheel pools", () => {
    expect(wheelFootballTeams).toHaveLength(32);
    expect(wheelFootballPoolTeams("NFL")).toHaveLength(32);
    expect(wheelFootballPoolTeams("AFC")).toHaveLength(16);
    expect(wheelFootballPoolTeams("NFC")).toHaveLength(16);

    for (const division of WHEEL_FOOTBALL_DIVISIONS) {
      expect(wheelFootballPoolTeams("DIVISION", division)).toHaveLength(4);
    }

    expect(new Set(wheelFootballTeams.map((team) => team.code)).size).toBe(32);
    expect(wheelFootballTeams.find((team) => team.code === "DAL")).toMatchObject({
      primaryColor: "#003594",
      secondaryColor: "#869397",
    });
    expect(WHEEL_FOOTBALL_ROSTER_SLOTS).toEqual([
      "QB",
      "RB",
      "WR",
      "Flex",
      "Front Seven",
      "Secondary",
      "Head Coach",
    ]);
  });

  it("maps only eligible current-player positions into the seven Superteam slots", () => {
    expect(wheelFootballEligibleSlots("QB")).toEqual(["QB"]);
    expect(wheelFootballEligibleSlots("RB")).toEqual(["RB", "Flex"]);
    expect(wheelFootballEligibleSlots("WR")).toEqual(["WR", "Flex"]);
    expect(wheelFootballEligibleSlots("TE")).toEqual(["Flex"]);
    expect(wheelFootballEligibleSlots("DE")).toEqual(["Front Seven"]);
    expect(wheelFootballEligibleSlots("DT")).toEqual(["Front Seven"]);
    expect(wheelFootballEligibleSlots("LB")).toEqual(["Front Seven"]);
    expect(wheelFootballEligibleSlots("CB")).toEqual(["Secondary"]);
    expect(wheelFootballEligibleSlots("S")).toEqual(["Secondary"]);
    expect(wheelFootballEligibleSlots("HC")).toEqual(["Head Coach"]);
    expect(wheelFootballEligibleSlots("OT")).toEqual([]);
    expect(wheelFootballEligibleSlots("K")).toEqual([]);
  });

  it("preserves ESPN roster order inside a slot instead of alphabetizing away depth/relevance", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      athletes: [{
        position: "Defense",
        items: [
          { id: "starter", displayName: "Starter Star", position: { abbreviation: "S", displayName: "Safety" } },
          { id: "backup", displayName: "Backup Alpha", position: { abbreviation: "S", displayName: "Safety" } },
        ],
      }],
    });

    expect(candidates.map((candidate) => candidate.name)).toEqual([
      "Starter Star",
      "Backup Alpha",
    ]);
  });

  it("parses current ESPN roster groups into selectable players and the head coach", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      athletes: [
        {
          position: "Offense",
          items: [
            { id: "qb1", displayName: "Quarterback One", position: { abbreviation: "QB", displayName: "Quarterback" } },
            { id: "rb1", displayName: "Running Back One", position: { abbreviation: "RB", displayName: "Running Back" } },
            { id: "wr1", displayName: "Receiver One", position: { abbreviation: "WR", displayName: "Wide Receiver" } },
            { id: "te1", displayName: "Tight End One", position: { abbreviation: "TE", displayName: "Tight End" } },
            { id: "ot1", displayName: "Tackle One", position: { abbreviation: "OT", displayName: "Offensive Tackle" } },
          ],
        },
        {
          position: "Defense",
          items: [
            { id: "edge1", displayName: "Edge One", position: { abbreviation: "DE", displayName: "Defensive End" } },
            { id: "cb1", displayName: "Corner One", position: { abbreviation: "CB", displayName: "Cornerback" } },
          ],
        },
      ],
      coach: [{ id: "coach1", firstName: "Coach", lastName: "One" }],
    });

    expect(candidates.map((candidate) => candidate.id)).toEqual([
      "qb1",
      "rb1",
      "wr1",
      "te1",
      "edge1",
      "cb1",
      "coach:coach1",
    ]);
    expect(candidates.find((candidate) => candidate.id === "rb1")?.eligibleSlots).toEqual(["RB", "Flex"]);
    expect(candidates.find((candidate) => candidate.id === "edge1")?.eligibleSlots).toEqual(["Front Seven"]);
    expect(candidates.find((candidate) => candidate.id === "cb1")?.eligibleSlots).toEqual(["Secondary"]);
    expect(candidates.at(-1)).toMatchObject({
      name: "Coach One",
      positionAbbreviation: "HC",
      eligibleSlots: ["Head Coach"],
    });
  });
});

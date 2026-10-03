import { describe, expect, it } from "vitest";
import {
  WHEEL_FOOTBALL_DIVISIONS,
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  wheelFootballCandidatesFromEspn,
  wheelFootballEligibleSlots,
  wheelFootballPoolTeams,
  wheelFootballShortlist,
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

  it("uses ESPN depth rank instead of raw roster order, including the Dallas regression", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      roster: {
        athletes: [{
          position: "Offense",
          items: [
            { id: "howell", displayName: "Sam Howell", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 4 } },
            { id: "milton", displayName: "Joe Milton III", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 2 } },
            { id: "dak", displayName: "Dak Prescott", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 10 } },
            { id: "wr-depth", displayName: "Depth Receiver", position: { abbreviation: "WR", displayName: "Wide Receiver" }, experience: { years: 1 } },
            { id: "pickens", displayName: "George Pickens", position: { abbreviation: "WR", displayName: "Wide Receiver" }, experience: { years: 5 } },
            { id: "lamb", displayName: "CeeDee Lamb", position: { abbreviation: "WR", displayName: "Wide Receiver" }, experience: { years: 7 } },
            { id: "slot", displayName: "Ryan Flournoy", position: { abbreviation: "WR", displayName: "Wide Receiver" }, experience: { years: 3 } },
          ],
        }],
      },
      depthChart: {
        positions: [
          {
            position: { abbreviation: "QB" },
            athletes: [
              { rank: 1, athlete: { id: "dak", displayName: "Dak Prescott" } },
              { rank: 2, athlete: { id: "howell", displayName: "Sam Howell" } },
              { rank: 3, athlete: { id: "milton", displayName: "Joe Milton III" } },
            ],
          },
          {
            position: { abbreviation: "LWR" },
            athletes: [
              { rank: 1, athlete: { id: "pickens", displayName: "George Pickens" } },
              { rank: 2, athlete: { id: "wr-depth", displayName: "Depth Receiver" } },
            ],
          },
          {
            position: { abbreviation: "RWR" },
            athletes: [{ rank: 1, athlete: { id: "lamb", displayName: "CeeDee Lamb" } }],
          },
          {
            position: { abbreviation: "SWR" },
            athletes: [{ rank: 1, athlete: { id: "slot", displayName: "Ryan Flournoy" } }],
          },
        ],
      },
    });

    expect(wheelFootballShortlist(candidates, "QB").map((candidate) => candidate.name)).toEqual([
      "Dak Prescott",
    ]);
    expect(wheelFootballShortlist(candidates, "WR").map((candidate) => candidate.name)).toEqual([
      "George Pickens",
      "CeeDee Lamb",
      "Ryan Flournoy",
    ]);
  });

  it("accepts the ESPN core depth-chart object shape as a fallback", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      roster: {
        athletes: [{
          position: "Offense",
          items: [
            { id: "starter", displayName: "Starter One", position: { abbreviation: "RB", displayName: "Running Back" }, experience: { years: 4 } },
            { id: "backup", displayName: "Backup One", position: { abbreviation: "RB", displayName: "Running Back" }, experience: { years: 2 } },
          ],
        }],
      },
      depthChart: {
        depthCharts: [{
          positions: {
            rb: {
              position: { abbreviation: "RB" },
              athletes: [
                { rank: 1, athlete: { id: "starter", displayName: "Starter One" } },
                { rank: 2, athlete: { id: "backup", displayName: "Backup One" } },
              ],
            },
          },
        }],
      },
    });

    expect(wheelFootballShortlist(candidates, "RB").map((candidate) => candidate.name)).toEqual([
      "Starter One",
      "Backup One",
    ]);
  });

  it("treats ESPN injured-reserve roster groups as injury protection even without a separate injury feed", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      roster: {
        athletes: [
          {
            position: "Offense",
            items: [
              { id: "temporary", displayName: "Temporary QB", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 2 } },
            ],
          },
          {
            position: "injuredReserveOrOut",
            items: [
              { id: "established", displayName: "Established QB", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 8 } },
            ],
          },
        ],
      },
      depthChart: {
        positions: [{
          position: { abbreviation: "QB" },
          athletes: [{ rank: 1, athlete: { id: "temporary", displayName: "Temporary QB" } }],
        }],
      },
    });

    expect(wheelFootballShortlist(candidates, "QB").map((candidate) => candidate.name)).toEqual([
      "Temporary QB",
      "Established QB",
    ]);
  });

  it("keeps an established injured current-roster player available even when a temporary starter leads the live depth chart", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      roster: {
        athletes: [{
          position: "Offense",
          items: [
            { id: "backup", displayName: "Temporary Starter", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 2 } },
            { id: "star", displayName: "Established Starter", position: { abbreviation: "QB", displayName: "Quarterback" }, experience: { years: 8 } },
          ],
        }],
      },
      depthChart: {
        positions: [{
          position: { abbreviation: "QB" },
          athletes: [{ rank: 1, athlete: { id: "backup", displayName: "Temporary Starter" } }],
        }],
      },
      injuries: {
        injuries: [{
          athlete: { id: "star", displayName: "Established Starter" },
          status: "Out",
        }],
      },
    });

    expect(wheelFootballShortlist(candidates, "QB").map((candidate) => candidate.name)).toEqual([
      "Temporary Starter",
      "Established Starter",
    ]);
  });

  it("keeps Wheel choices intentionally small while allowing rare meaningful extra options", () => {
    const candidate = (
      id: string,
      positionAbbreviation: string,
      eligibleSlots: readonly (typeof WHEEL_FOOTBALL_ROSTER_SLOTS)[number][],
      experienceYears: number | null,
    ) => ({
      id,
      name: id,
      positionLabel: positionAbbreviation,
      positionAbbreviation,
      headshotUrl: null,
      eligibleSlots,
      experienceYears,
    });

    expect(wheelFootballShortlist([
      candidate("qb1", "QB", ["QB"], 7),
      candidate("qb2", "QB", ["QB"], 6),
    ], "QB").map((item) => item.id)).toEqual(["qb1"]);

    expect(wheelFootballShortlist([
      candidate("rookie-qb", "QB", ["QB"], 0),
      candidate("veteran-qb", "QB", ["QB"], 8),
      candidate("qb3", "QB", ["QB"], 3),
    ], "QB").map((item) => item.id)).toEqual(["rookie-qb", "veteran-qb"]);

    expect(wheelFootballShortlist([
      candidate("rb1", "RB", ["RB", "Flex"], 4),
      candidate("rb2", "RB", ["RB", "Flex"], 2),
      candidate("rb3", "RB", ["RB", "Flex"], 4),
      candidate("rb4", "RB", ["RB", "Flex"], 1),
    ], "RB").map((item) => item.id)).toEqual(["rb1", "rb2", "rb3"]);

    expect(wheelFootballShortlist([
      candidate("wr1", "WR", ["WR", "Flex"], 5),
      candidate("wr2", "WR", ["WR", "Flex"], 4),
      candidate("wr3", "WR", ["WR", "Flex"], 3),
      candidate("wr4", "WR", ["WR", "Flex"], 2),
      candidate("wr5", "WR", ["WR", "Flex"], 5),
    ], "WR")).toHaveLength(4);

    const secondary = Array.from({ length: 8 }, (_, index) => candidate(
      `db${index + 1}`,
      index % 2 ? "S" : "CB",
      ["Secondary"],
      index === 5 ? 3 : 1,
    ));
    expect(wheelFootballShortlist(secondary, "Secondary")).toHaveLength(6);

    const frontSeven = Array.from({ length: 8 }, (_, index) => candidate(
      `front${index + 1}`,
      "LB",
      ["Front Seven"],
      index === 5 ? 1 : 4,
    ));
    expect(wheelFootballShortlist(frontSeven, "Front Seven")).toHaveLength(5);

    const flex = [
      candidate("flex1", "RB", ["RB", "Flex"], 4),
      candidate("flex2", "RB", ["RB", "Flex"], 3),
      candidate("flex3", "WR", ["WR", "Flex"], 5),
      candidate("flex4", "WR", ["WR", "Flex"], 2),
      candidate("flex5", "TE", ["Flex"], 5),
    ];
    expect(wheelFootballShortlist(flex, "Flex").map((item) => item.id)).toEqual([
      "flex1",
      "flex3",
      "flex4",
      "flex5",
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

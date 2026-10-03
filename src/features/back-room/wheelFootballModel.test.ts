import { describe, expect, it } from "vitest";
import wheelPriorityJson from "../../../data/generated/football/wheel-football-priorities.json";
import {
  WHEEL_FOOTBALL_DIVISIONS,
  WHEEL_FOOTBALL_ROSTER_SLOTS,
  wheelFootballCandidatesFromEspn,
  wheelFootballEligibleSlots,
  wheelFootballPoolTeams,
  wheelFootballShortlist,
  wheelFootballTeams,
  type WheelFootballCandidate,
} from "./wheelFootballModel";

function candidate(
  id: string,
  name: string,
  positionAbbreviation: string,
  eligibleSlots: readonly (typeof WHEEL_FOOTBALL_ROSTER_SLOTS)[number][],
  experienceYears: number | null,
  rosterOrder: number,
): WheelFootballCandidate {
  return {
    id,
    name,
    positionLabel: positionAbbreviation,
    positionAbbreviation,
    headshotUrl: null,
    eligibleSlots,
    experienceYears,
    rosterOrder,
  };
}

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
  });

  it("keeps the seven locked Superteam slots and position eligibility", () => {
    expect(WHEEL_FOOTBALL_ROSTER_SLOTS).toEqual([
      "QB", "RB", "WR", "Flex", "Front Seven", "Secondary", "Head Coach",
    ]);
    expect(wheelFootballEligibleSlots("QB")).toEqual(["QB"]);
    expect(wheelFootballEligibleSlots("RB")).toEqual(["RB", "Flex"]);
    expect(wheelFootballEligibleSlots("WR")).toEqual(["WR", "Flex"]);
    expect(wheelFootballEligibleSlots("TE")).toEqual(["Flex"]);
    expect(wheelFootballEligibleSlots("DE")).toEqual(["Front Seven"]);
    expect(wheelFootballEligibleSlots("LB")).toEqual(["Front Seven"]);
    expect(wheelFootballEligibleSlots("CB")).toEqual(["Secondary"]);
    expect(wheelFootballEligibleSlots("S")).toEqual(["Secondary"]);
    expect(wheelFootballEligibleSlots("HC")).toEqual(["Head Coach"]);
    expect(wheelFootballEligibleSlots("OT")).toEqual([]);
  });

  it("parses ESPN only as current roster/headshot authority and preserves source order", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      athletes: [{
        position: "Offense",
        items: [
          { id: "qb2", displayName: "Backup Quarterback", position: { abbreviation: "QB", displayName: "Quarterback" } },
          { id: "qb1", displayName: "Starting Quarterback", position: { abbreviation: "QB", displayName: "Quarterback" } },
          { id: "rb1", displayName: "Running Back One", position: { abbreviation: "RB", displayName: "Running Back" } },
          { id: "wr1", displayName: "Receiver One", position: { abbreviation: "WR", displayName: "Wide Receiver" } },
          { id: "te1", displayName: "Tight End One", position: { abbreviation: "TE", displayName: "Tight End" } },
          { id: "ot1", displayName: "Tackle One", position: { abbreviation: "OT", displayName: "Offensive Tackle" } },
        ],
      }],
      coach: [{ id: "coach1", firstName: "Coach", lastName: "One" }],
    });
    expect(candidates.map((item) => item.id)).toEqual([
      "qb2", "qb1", "rb1", "wr1", "te1", "coach:coach1",
    ]);
    expect(candidates.find((item) => item.id === "rb1")?.eligibleSlots).toEqual(["RB", "Flex"]);
  });

  it("audits all 32 teams and locks the Cowboys obvious names", () => {
    expect(Object.keys(wheelPriorityJson.teams)).toHaveLength(32);
    expect(Object.keys(wheelPriorityJson.teams).sort()).toEqual(
      wheelFootballTeams.map((team) => team.code).sort(),
    );
    expect(wheelPriorityJson.teams.DAL.QB).toEqual(["Dak Prescott"]);
    expect(wheelPriorityJson.teams.DAL.WR.slice(0, 2)).toEqual(["CeeDee Lamb", "George Pickens"]);
    for (const [code, team] of Object.entries(wheelPriorityJson.teams)) {
      expect(team.QB.length, `${code} QB`).toBeGreaterThanOrEqual(1);
      expect(team.QB.length, `${code} QB`).toBeLessThanOrEqual(2);
      expect(team.RB.length, `${code} RB`).toBeGreaterThanOrEqual(2);
      expect(team.RB.length, `${code} RB`).toBeLessThanOrEqual(3);
      expect(team.WR.length, `${code} WR`).toBeGreaterThanOrEqual(3);
      expect(team.WR.length, `${code} WR`).toBeLessThanOrEqual(4);
      expect(team["Front Seven"].length, `${code} front seven`).toBeGreaterThanOrEqual(5);
      expect(team["Front Seven"].length, `${code} front seven`).toBeLessThanOrEqual(6);
      expect(team.Secondary.length, `${code} secondary`).toBeGreaterThanOrEqual(5);
      expect(team.Secondary.length, `${code} secondary`).toBeLessThanOrEqual(6);
      expect(team.Flex.length, `${code} flex`).toBe(4);
      expect(team["Head Coach"].length, `${code} head coach`).toBe(1);
    }
  });

  it("uses the audited Dallas order instead of raw ESPN roster order", () => {
    const roster = [
      candidate("howell", "Sam Howell", "QB", ["QB"], 4, 0),
      candidate("dak", "Dak Prescott", "QB", ["QB"], 10, 1),
      candidate("depth", "Depth Receiver", "WR", ["WR", "Flex"], 2, 2),
      candidate("pickens", "George Pickens", "WR", ["WR", "Flex"], 5, 3),
      candidate("lamb", "CeeDee Lamb", "WR", ["WR", "Flex"], 7, 4),
      candidate("flournoy", "Ryan Flournoy", "WR", ["WR", "Flex"], 3, 5),
    ];
    expect(wheelFootballShortlist(roster, "QB", "DAL").map((item) => item.name)).toEqual([
      "Dak Prescott",
    ]);
    expect(wheelFootballShortlist(roster, "WR", "DAL").map((item) => item.name)).toEqual([
      "CeeDee Lamb", "George Pickens", "Ryan Flournoy",
    ]);
  });

  it("locks the manually reviewed Cowboys and Rams football-priority ordering", () => {
    expect(wheelPriorityJson.teams.DAL["Front Seven"]).toEqual([
      "Quinnen Williams",
      "Rashan Gary",
      "Kenny Clark",
      "DeMarvion Overshown",
      "Donovan Ezeiruaku",
      "Dee Winters",
    ]);
    expect(wheelPriorityJson.teams.DAL.Secondary).toEqual([
      "DaRon Bland",
      "Joey Porter Jr.",
      "Caleb Downs",
      "Malik Hooker",
      "Markquese Bell",
    ]);

    expect(wheelPriorityJson.teams.LAR.WR).toEqual([
      "Puka Nacua",
      "Davante Adams",
      "Konata Mumpfield",
    ]);
    expect(wheelPriorityJson.teams.LAR["Front Seven"]).toEqual([
      "Myles Garrett",
      "Aaron Donald",
      "Kobie Turner",
      "Braden Fiske",
      "Byron Young",
      "Nate Landman",
    ]);
    expect(wheelPriorityJson.teams.LAR.Secondary).toEqual([
      "Trent McDuffie",
      "Quentin Lake",
      "Kam Curl",
      "Jaylen Watson",
      "Kamren Kinchens",
    ]);
  });

  it("locks notable corrections from the final four-chat 32-team audit", () => {
    expect(wheelPriorityJson.teams.BUF["Front Seven"]).toContain("Bradley Chubb");
    expect(wheelPriorityJson.teams.MIA["Front Seven"].slice(0, 2)).toEqual([
      "Zach Sieler", "Chop Robinson",
    ]);
    expect(wheelPriorityJson.teams.NYJ.Flex).toEqual([
      "Breece Hall", "Garrett Wilson", "Adonai Mitchell", "Mason Taylor",
    ]);
    expect(wheelPriorityJson.teams.BAL.WR).toEqual([
      "Zay Flowers", "Rashod Bateman", "Ja'Kobi Lane",
    ]);
    expect(wheelPriorityJson.teams.BAL["Front Seven"]).toEqual([
      "Trey Hendrickson", "Roquan Smith", "Nnamdi Madubuike",
      "Tavius Robinson", "Calais Campbell", "Trenton Simpson",
    ]);
    expect(wheelPriorityJson.teams.CIN.WR).toEqual([
      "Ja'Marr Chase", "Tee Higgins", "Andrei Iosivas",
    ]);
    expect(wheelPriorityJson.teams.CLE.RB).toEqual([
      "Quinshon Judkins", "Dylan Sampson",
    ]);
    expect(wheelPriorityJson.teams.CLE.WR).toEqual([
      "Jerry Jeudy", "KC Concepcion Jr.", "Denzel Boston",
    ]);
    expect(wheelPriorityJson.teams.CLE["Front Seven"]).toEqual([
      "Jared Verse",
      "Mason Graham",
      "Jeremiah Owusu-Koramoah",
      "Quincy Williams",
      "Carson Schwesinger",
      "Isaiah McGuire",
    ]);
    expect(wheelPriorityJson.teams.HOU["Front Seven"]).toEqual([
      "Will Anderson Jr.",
      "Danielle Hunter",
      "Azeez Al-Shaair",
      "Jadeveon Clowney",
      "Sheldon Rankins",
      "Henry To'oTo'o",
    ]);
    expect(wheelPriorityJson.teams.IND.WR).toEqual([
      "Keenan Allen", "Josh Downs", "Alec Pierce", "Darius Slayton",
    ]);
    expect(wheelPriorityJson.teams.JAX.WR).toEqual([
      "Brian Thomas Jr.", "Travis Hunter", "Jakobi Meyers", "Parker Washington",
    ]);
    expect(wheelPriorityJson.teams.LAC["Front Seven"].slice(0, 3)).toEqual([
      "Khalil Mack", "Tuli Tuipulotu", "Daiyan Henley",
    ]);
    expect(wheelPriorityJson.teams.DET.Secondary).toEqual([
      "Brian Branch", "Kerby Joseph", "D.J. Reed", "Roger McCreary", "Ennis Rakestraw Jr.",
    ]);
    expect(wheelPriorityJson.teams.SF["Front Seven"]).toContain("Osa Odighizuwa");
    expect(wheelPriorityJson.teams.SF["Front Seven"]).not.toContain("Matthew Judon");
    expect(wheelPriorityJson.teams.SF.Secondary).toContain("Malik Mustapha");
    expect(wheelPriorityJson.teams.SEA.RB).toEqual(["Jadarian Price", "Zach Charbonnet"]);
    expect(wheelPriorityJson.teams.ARI.RB).toEqual([
      "Jeremiyah Love", "Tyler Allgeier", "James Conner",
    ]);
    expect(wheelPriorityJson.teams.ARI.RB).not.toContain("Trey Benson");
    expect(wheelPriorityJson.teams.CIN.Secondary).toEqual([
      "Dax Hill", "DJ Turner II", "Jordan Battle", "Bryan Cook", "Tacario Davis",
    ]);
    expect(wheelPriorityJson.teams.PIT.Secondary).toEqual([
      "Jalen Ramsey", "Jamel Dean", "Asante Samuel Jr.", "DeShon Elliott", "Jaquan Brisker",
    ]);
    expect(wheelPriorityJson.teams.ATL.Flex).toEqual([
      "Bijan Robinson", "Drake London", "Kyle Pitts Sr.", "Jahan Dotson",
    ]);
    expect(wheelPriorityJson.teams.ATL["Front Seven"]).toEqual([
      "James Pearce Jr.", "Gervon Dexter Sr.", "Za'Darius Smith",
      "Jalon Walker", "Divine Deablo", "Maason Smith",
    ]);
    expect(wheelPriorityJson.teams.ATL.Secondary).toEqual([
      "Jessie Bates III", "A.J. Terrell Jr.", "Xavier Watts",
      "Mike Hughes", "C.J. Henderson", "Billy Bowman Jr.",
    ]);
  });

  it("retains intentionally protected injury/reserve players while ESPN still says they are on the roster", () => {
    const giants = [
      candidate("winston", "Jameis Winston", "QB", ["QB"], 11, 0),
      candidate("dart", "Jaxson Dart", "QB", ["QB"], 1, 1),
      candidate("third", "Third Quarterback", "QB", ["QB"], 2, 2),
    ];
    expect(wheelFootballShortlist(giants, "QB", "NYG").map((item) => item.name)).toEqual([
      "Jaxson Dart", "Jameis Winston",
    ]);

    const dolphins = [
      candidate("other", "Other Back", "RB", ["RB", "Flex"], 3, 0),
      candidate("wright", "Jaylen Wright", "RB", ["RB", "Flex"], 3, 1),
      candidate("achane", "De'Von Achane", "RB", ["RB", "Flex"], 5, 2),
    ];
    expect(wheelFootballShortlist(dolphins, "RB", "MIA").map((item) => item.name)).toEqual([
      "De'Von Achane", "Jaylen Wright",
    ]);
  });

  it("never reintroduces a stale audited player who is absent from the current ESPN roster", () => {
    const roster = [
      candidate("replacement", "Current Replacement", "QB", ["QB"], 4, 0),
      candidate("backup", "Current Backup", "QB", ["QB"], 3, 1),
    ];
    expect(wheelFootballShortlist(roster, "QB", "DAL")).toEqual([]);
  });

  it("keeps generic fallback pools small when no audited team identity is supplied", () => {
    expect(wheelFootballShortlist([
      candidate("qb1", "qb1", "QB", ["QB"], 7, 0),
      candidate("qb2", "qb2", "QB", ["QB"], 6, 1),
    ], "QB").map((item) => item.id)).toEqual(["qb1"]);

    expect(wheelFootballShortlist([
      candidate("rookie", "rookie", "QB", ["QB"], 0, 0),
      candidate("veteran", "veteran", "QB", ["QB"], 8, 1),
    ], "QB").map((item) => item.id)).toEqual(["rookie", "veteran"]);

    expect(wheelFootballShortlist([
      candidate("rb1", "rb1", "RB", ["RB", "Flex"], 4, 0),
      candidate("rb2", "rb2", "RB", ["RB", "Flex"], 2, 1),
      candidate("rb3", "rb3", "RB", ["RB", "Flex"], 4, 2),
    ], "RB")).toHaveLength(3);

    const secondary = Array.from({ length: 8 }, (_, index) => (
      candidate(`db${index}`, `db${index}`, "S", ["Secondary"], index === 5 ? 3 : 1, index)
    ));
    expect(wheelFootballShortlist(secondary, "Secondary")).toHaveLength(6);
  });

  it("builds Flex from one RB, two WRs, and one TE when those current players exist", () => {
    const roster = [
      candidate("rb", "Javonte Williams", "RB", ["RB", "Flex"], 6, 0),
      candidate("wr1", "George Pickens", "WR", ["WR", "Flex"], 5, 1),
      candidate("wr2", "CeeDee Lamb", "WR", ["WR", "Flex"], 7, 2),
      candidate("wr3", "Ryan Flournoy", "WR", ["WR", "Flex"], 3, 3),
      candidate("te", "Jake Ferguson", "TE", ["Flex"], 5, 4),
    ];
    expect(wheelFootballShortlist(roster, "Flex", "DAL").map((item) => item.name)).toEqual([
      "Javonte Williams", "CeeDee Lamb", "George Pickens", "Jake Ferguson",
    ]);
  });
  it("does not let injury metadata knock a curated current-roster star out of Wheel", () => {
    const candidates = wheelFootballCandidatesFromEspn({
      athletes: [{
        position: "Offense",
        items: [
          { id: "howell", displayName: "Sam Howell", position: { abbreviation: "QB", displayName: "Quarterback" } },
          { id: "dak", displayName: "Dak Prescott", position: { abbreviation: "QB", displayName: "Quarterback" } },
        ],
      }],
      injuries: [{ athlete: { id: "dak", displayName: "Dak Prescott" }, status: "Out" }],
      depthCharts: [{ positions: [{ athletes: [{ athlete: { id: "howell" } }] }] }],
    });

    expect(wheelFootballShortlist(candidates, "QB", "DAL").map((item) => item.name)).toEqual([
      "Dak Prescott",
    ]);
  });

  it("uses the curated head coach instead of a raw coach ordering fallback", () => {
    const coaches = [
      candidate("coach:other", "Assistant Coach", "HC", ["Head Coach"], null, 0),
      candidate("coach:dallas", "Brian Schottenheimer", "HC", ["Head Coach"], null, 1),
    ];
    expect(wheelFootballShortlist(coaches, "Head Coach", "DAL").map((item) => item.name)).toEqual([
      "Brian Schottenheimer",
    ]);
  });

});

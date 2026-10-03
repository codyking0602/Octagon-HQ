import { describe, expect, it } from "vitest";
import {
  CFB_CURRENT_SCHOOLS_2026,
  CFB_CURRENT_SCHOOL_BY_NAME_2026,
  CFB_CURRENT_SCHOOL_SCOPE_SEASON,
} from "./footballCfbCurrentSchoolScope";

const EXPECTED_BY_CONFERENCE = {
  "SEC": [
    "Alabama",
    "Arkansas",
    "Auburn",
    "Florida",
    "Georgia",
    "Kentucky",
    "LSU",
    "Mississippi State",
    "Missouri",
    "Oklahoma",
    "Ole Miss",
    "South Carolina",
    "Tennessee",
    "Texas",
    "Texas A&M",
    "Vanderbilt"
  ],
  "Big Ten": [
    "Illinois",
    "Indiana",
    "Iowa",
    "Maryland",
    "Michigan",
    "Michigan State",
    "Minnesota",
    "Nebraska",
    "Northwestern",
    "Ohio State",
    "Oregon",
    "Penn State",
    "Purdue",
    "Rutgers",
    "UCLA",
    "USC",
    "Washington",
    "Wisconsin"
  ],
  "Big 12": [
    "Arizona",
    "Arizona State",
    "Baylor",
    "BYU",
    "Cincinnati",
    "Colorado",
    "Houston",
    "Iowa State",
    "Kansas",
    "Kansas State",
    "Oklahoma State",
    "TCU",
    "Texas Tech",
    "UCF",
    "Utah",
    "West Virginia"
  ],
  "ACC": [
    "Boston College",
    "California",
    "Clemson",
    "Duke",
    "Florida State",
    "Georgia Tech",
    "Louisville",
    "Miami",
    "NC State",
    "North Carolina",
    "Pittsburgh",
    "SMU",
    "Stanford",
    "Syracuse",
    "Virginia",
    "Virginia Tech",
    "Wake Forest"
  ],
  "Independent": [
    "Notre Dame"
  ]
} as const;

describe("2026 current CFB school scope", () => {
  it("locks the approved 68-school Power Four plus Notre Dame universe", () => {
    expect(CFB_CURRENT_SCHOOL_SCOPE_SEASON).toBe(2026);
    expect(CFB_CURRENT_SCHOOLS_2026).toHaveLength(68);

    for (const [conference, expectedSchools] of Object.entries(EXPECTED_BY_CONFERENCE)) {
      expect(
        CFB_CURRENT_SCHOOLS_2026
          .filter((entry) => entry.conference === conference)
          .map((entry) => entry.school)
          .sort(),
      ).toEqual([...expectedSchools].sort());
    }

    expect(
      Object.fromEntries(
        Object.keys(EXPECTED_BY_CONFERENCE).map((conference) => [
          conference,
          CFB_CURRENT_SCHOOLS_2026.filter((entry) => entry.conference === conference).length,
        ]),
      ),
    ).toEqual({
      SEC: 16,
      "Big Ten": 18,
      "Big 12": 16,
      ACC: 17,
      Independent: 1,
    });
  });

  it("requires stable identity, colors, logo, roster source, and membership source for every school", () => {
    const ids = new Set<string>();
    const espnIds = new Set<string>();

    for (const entry of CFB_CURRENT_SCHOOLS_2026) {
      expect(ids.has(entry.id), `duplicate school id: ${entry.id}`).toBe(false);
      expect(espnIds.has(entry.espnId), `duplicate ESPN id: ${entry.espnId}`).toBe(false);
      ids.add(entry.id);
      espnIds.add(entry.espnId);

      expect(entry.season).toBe(2026);
      expect(entry.primaryColor).toMatch(/^#[0-9A-F]{6}$/);
      expect(entry.secondaryColor).toMatch(/^#[0-9A-F]{6}$/);
      expect(entry.logoUrl).toBe(
        `https://a.espncdn.com/i/teamlogos/ncaa/500/${entry.espnId}.png`,
      );
      expect(entry.rosterSource).toEqual({
        provider: "ESPN",
        url: `https://www.espn.com/college-football/team/roster/_/id/${entry.espnId}`,
      });
      expect(entry.membershipSourceUrl).toMatch(/^https:\/\//);
      expect(CFB_CURRENT_SCHOOL_BY_NAME_2026[entry.school]).toBe(entry);
    }
  });

  it("keeps Notre Dame independent from the ACC football pool", () => {
    const notreDame = CFB_CURRENT_SCHOOL_BY_NAME_2026["Notre Dame"];
    expect(notreDame?.conference).toBe("Independent");
    expect(notreDame?.scope).toBe("independent");
    expect(
      CFB_CURRENT_SCHOOLS_2026
        .filter((entry) => entry.conference === "ACC")
        .map((entry) => entry.school),
    ).not.toContain("Notre Dame");
  });
});

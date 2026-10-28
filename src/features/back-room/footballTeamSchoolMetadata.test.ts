import { describe, expect, it } from "vitest";
import {
  footballHistoricalConferenceForProgram,
  footballTeamSchoolMetadataFor,
} from "./footballTeamSchoolMetadata";

describe("football team and school metadata", () => {
  it("owns NFL conference, division, colors, and geography through canonical aliases", () => {
    expect(footballTeamSchoolMetadataFor("DAL")).toMatchObject({
      name: "Dallas Cowboys",
      level: "NFL",
      nflConference: "NFC",
      nflDivision: "East",
      region: "Southwest",
    });
    expect(footballTeamSchoolMetadataFor("DAL")?.colors).toContain("navy");
    expect(footballTeamSchoolMetadataFor("KC")).toMatchObject({
      name: "Kansas City Chiefs",
      nflConference: "AFC",
      nflDivision: "West",
    });
  });

  it("owns reusable CFB colors and geography", () => {
    expect(footballTeamSchoolMetadataFor("Texas")).toMatchObject({
      name: "Texas",
      level: "CFB",
      region: "Southwest",
    });
    expect(footballTeamSchoolMetadataFor("Texas")?.colors).toContain("orange");
    expect(footballTeamSchoolMetadataFor("Miami (FL)")?.name).toBe("Miami");
  });

  it("resolves conference membership by the season instead of the school's current conference", () => {
    expect(footballHistoricalConferenceForProgram("Texas", 1995)).toBe("SWC");
    expect(footballHistoricalConferenceForProgram("Texas", 1996)).toBe("Big 12");
    expect(footballHistoricalConferenceForProgram("Texas", 2023)).toBe("Big 12");
    expect(footballHistoricalConferenceForProgram("Texas", 2024)).toBe("SEC");

    expect(footballHistoricalConferenceForProgram("Oklahoma", 2000)).toBe("Big 12");
    expect(footballHistoricalConferenceForProgram("Oklahoma", 2024)).toBe("SEC");
    expect(footballHistoricalConferenceForProgram("Nebraska", 2010)).toBe("Big 12");
    expect(footballHistoricalConferenceForProgram("Nebraska", 2011)).toBe("Big Ten");
    expect(footballHistoricalConferenceForProgram("Miami", 2003)).toBe("Big East");
    expect(footballHistoricalConferenceForProgram("Miami", 2004)).toBe("ACC");
  });

  it("keeps western conference history era-correct across the PCC breakup and later renames", () => {
    expect(footballHistoricalConferenceForProgram("USC", 1958)).toBe("PCC");
    expect(footballHistoricalConferenceForProgram("USC", 1959)).toBe("AAWU");
    expect(footballHistoricalConferenceForProgram("USC", 1968)).toBe("Pac-8");
    expect(footballHistoricalConferenceForProgram("USC", 1978)).toBe("Pac-10");
    expect(footballHistoricalConferenceForProgram("USC", 2011)).toBe("Pac-12");
    expect(footballHistoricalConferenceForProgram("USC", 2024)).toBe("Big Ten");

    expect(footballHistoricalConferenceForProgram("Oregon", 1960)).toBe("Independent");
    expect(footballHistoricalConferenceForProgram("Oregon", 1964)).toBe("AAWU");
    expect(footballHistoricalConferenceForProgram("Washington State", 1961)).toBe("Independent");
    expect(footballHistoricalConferenceForProgram("Washington State", 1962)).toBe("AAWU");
  });

  it("returns unknown rather than inventing a conference or metadata record", () => {
    expect(footballHistoricalConferenceForProgram("Unknown Tech", 1999)).toBeNull();
    expect(footballTeamSchoolMetadataFor("Unknown Team")).toBeNull();
  });
});

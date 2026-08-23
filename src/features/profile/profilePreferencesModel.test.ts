import { describe, expect, it } from "vitest";
import { FOOTBALL_TEAMS, parseFootballTeam } from "./profilePreferencesModel";

describe("Football profile preference model", () => {
  it("accepts only the two supported Football HQ teams", () => {
    expect(FOOTBALL_TEAMS).toEqual(["cowboys", "longhorns"]);
    expect(parseFootballTeam("cowboys")).toBe("cowboys");
    expect(parseFootballTeam("longhorns")).toBe("longhorns");
    expect(parseFootballTeam(null)).toBeNull();
    expect(parseFootballTeam("ufc")).toBeNull();
    expect(parseFootballTeam("football")).toBeNull();
  });
});

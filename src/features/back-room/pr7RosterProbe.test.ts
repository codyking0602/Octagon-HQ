import { describe, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "../games/whoAmIAuthority";

describe("PR7 roster probe", () => {
  it("prints the canonical NFL B-tier launch roster", () => {
    const roster = getFootballWhoAmILaunchPool("NFL").subjects
      .filter((subject) => subject.recognizabilityTier === "B")
      .map((subject) => ({ id: subject.id, name: subject.name, role: subject.position ?? subject.kind }));
    console.log("PR7_ROSTER=" + JSON.stringify(roster));
  });
});

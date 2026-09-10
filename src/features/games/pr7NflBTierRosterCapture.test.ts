import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "./whoAmIAuthority";

describe("PR7 canonical NFL B-tier roster capture", () => {
  it("prints the sorted canonical launch population for one-time integration", () => {
    const subjects = getFootballWhoAmILaunchPool("NFL").subjects
      .filter((subject) => subject.recognizabilityTier === "B")
      .sort((left, right) => left.name.toLowerCase().localeCompare(right.name.toLowerCase()) || left.id.localeCompare(right.id));
    console.log("PR7_NFL_B_TIER=" + JSON.stringify(subjects.map(({ id, name, kind, position }) => ({ id, name, kind, position }))));
    expect(subjects).toHaveLength(-1);
  });
});

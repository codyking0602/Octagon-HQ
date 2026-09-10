import { describe, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "../games/whoAmIAuthority";

describe("temporary NFL A-tier diagnostic", () => {
  it("prints the canonical A-tier launch identities", () => {
    const aTier = getFootballWhoAmILaunchPool("NFL").subjects
      .filter((subject) => subject.recognizabilityTier === "A")
      .map((subject) => ({ id: subject.id, name: subject.name, kind: subject.kind, position: subject.position }))
      .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));

    throw new Error(`NFL_A_TIER=${JSON.stringify(aTier)}`);
  });
});
import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "../games/whoAmIAuthority";

describe("temporary PR9 canonical population probe", () => {
  it("reports the exact current CFB B launch population", () => {
    const rows = getFootballWhoAmILaunchPool("CFB").subjects
      .filter((subject) => subject.recognizabilityTier === "B")
      .map((subject) => ({ id: subject.id, name: subject.name, kind: subject.kind, position: subject.position }));
    expect(rows).toHaveLength(129);
    throw new Error(`PR9_CFB_B_POPULATION=${JSON.stringify(rows)}`);
  });
});

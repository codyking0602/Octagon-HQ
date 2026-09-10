import { describe, expect, it } from "vitest";
import { getFootballWhoAmILaunchPool } from "../games/whoAmIAuthority";
import { getFootballSubject } from "./footballSubjectRegistry";

describe("PR8 CFB A probe", () => {
  it("prints exact launch and canonical ids", () => {
    const rows = getFootballWhoAmILaunchPool("CFB").subjects
      .filter((subject) => subject.recognizabilityTier === "A")
      .map((subject) => ({
        launchId: subject.id,
        name: subject.name,
        kind: subject.kind,
        launchLeague: subject.league,
        canonicalId: getFootballSubject(subject.id)?.id ?? null,
        canonicalLeague: getFootballSubject(subject.id)?.league ?? null,
      }));
    console.log("PR8_CFB_A_PROBE=" + JSON.stringify(rows));
    expect(rows).toEqual([]);
  });
});

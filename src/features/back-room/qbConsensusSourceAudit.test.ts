import { describe, expect, it } from "vitest";
import { getFootballRankFivePack } from "./footballRankFivePlayableModel";

describe("QB consensus source audit", () => {
  it("prints the exact runtime QB pool for source matching", () => {
    const pack = getFootballRankFivePack("nfl-quarterbacks");
    const rows = pack.items.map((item) => ({ id: item.id, name: item.name }));

    console.log("QB_CONSENSUS_SOURCE_AUDIT_BEGIN");
    console.log(JSON.stringify(rows));
    console.log("QB_CONSENSUS_SOURCE_AUDIT_END");

    expect(rows).toHaveLength(122);
  });
});

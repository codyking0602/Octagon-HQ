import { describe, expect, it } from "vitest";
import {
  CFB_BEST_TEAM_SEASON_COUNT,
  cfbBestTeamBoardLabel,
  cfbBestTeamSeasonPresentation,
  cfbBestTeamSeasonReferenceFromItemReference,
  cfbBestTeamSeasonVisualIdentity,
} from "./cfbBestTeamSeasonPresentation";

describe("Best CFB Teams presentation", () => {
  it("locks all 132 approved team-seasons and keeps the year in the identity", () => {
    expect(CFB_BEST_TEAM_SEASON_COUNT).toBe(132);
    const item = "cfb-best-lsu-2019--board--single__SEC__none__no";
    expect(cfbBestTeamSeasonReferenceFromItemReference(item)).toBe("cfb-best-lsu-2019");
    expect(cfbBestTeamSeasonPresentation(item)).toMatchObject({
      school: "LSU",
      year: 2019,
      conference: "SEC",
      summary: "15-0 · National Champion",
    });
  });

  it("decodes single, split, and Notre Dame wildcard board headers", () => {
    expect(cfbBestTeamBoardLabel("cfb-best-lsu-2019--board--single__SEC__none__no")).toBe("SEC Teams");
    expect(cfbBestTeamBoardLabel("cfb-best-ohio-state-2014--board--split__SEC__Big%20Ten__no")).toBe("SEC + Big Ten");
    expect(cfbBestTeamBoardLabel("cfb-best-notre-dame-2024--board--split__ACC__Big%2012__nd")).toBe("ACC + Big 12 + Notre Dame");
  });

  it("reuses canonical school marks with subtle school identity", () => {
    const identity = cfbBestTeamSeasonVisualIdentity("cfb-best-miami-2001--board--single__ACC__none__no");
    expect(identity?.teamName).toBe("Miami · 2001");
    expect(identity?.primary).toBe("#F47321");
    expect(identity?.logoSrc).toContain("teamlogos/ncaa");
  });

  it("keeps locked top-curve display subjects available", () => {
    expect(cfbBestTeamSeasonPresentation("cfb-best-lsu-2019")?.summary).toContain("National Champion");
    expect(cfbBestTeamSeasonPresentation("cfb-best-miami-2001")?.summary).toContain("National Champion");
    expect(cfbBestTeamSeasonPresentation("cfb-best-indiana-2025")?.summary).toBe("16-0 · National Champion");
  });
});

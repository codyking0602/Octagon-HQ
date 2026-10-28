import { describe, expect, it } from "vitest";
import { footballGreatnessTierForItem } from "./footballGreatnessTier";
import { buildFootballKeepCutLineup } from "./footballKeepCutModel";
import {
  footballReviewedItemsForComparison,
  resolveFootballProgramEraReviewedItem,
} from "./footballProgramEraComparisonReadiness";
import {
  buildFootballRankFiveLineup,
  getFootballRankFivePack as getFootballPlayableRankFivePack,
} from "./footballRankFivePlayableModel";
import { getFootballRankFivePack as getFootballReviewedRankFivePack } from "./footballRankFiveModel";
import { getFootballSubject } from "./footballSubjectRegistry";

function canonicalTeamIds(items: readonly { id: string }[]) {
  return items.map((item) => {
    const subject = getFootballSubject(item.id);
    expect(subject, `${item.id} should resolve to a canonical Program Era subject`).toBeDefined();
    expect(subject?.teamId, `${item.id} should expose canonical team identity`).toBeDefined();
    return String(subject!.teamId);
  });
}

describe("Football Program Era comparison readiness", () => {
  it("reconciles safe legacy windows to the tightest canonical coach era and fails closed across coaches", () => {
    expect(resolveFootballProgramEraReviewedItem({ id: "alabama-2009-2020", name: "Alabama 2009–2020" })?.id)
      .toBe("alabama-2008-2023");
    expect(resolveFootballProgramEraReviewedItem({ id: "georgia-2021-2024", name: "Georgia 2021–2024" })?.id)
      .toBe("georgia-2017-2025");
    expect(resolveFootballProgramEraReviewedItem({ id: "clemson-2015-2020", name: "Clemson 2015–2020" })?.id)
      .toBe("clemson-2011-2025");
    expect(resolveFootballProgramEraReviewedItem({ id: "ohio-state-2012-2024", name: "Ohio State 2012–2024" }))
      .toBeNull();
  });

  it("feeds canonical Program Era identities into runtime comparison calibration", () => {
    const reviewedPack = getFootballReviewedRankFivePack("college-program-eras");
    const reconciled = footballReviewedItemsForComparison(reviewedPack.id, reviewedPack.items);
    const reconciledIds = new Set(reconciled.map((item) => item.id));

    expect(reconciledIds.has("alabama-2008-2023")).toBe(true);
    expect(reconciledIds.has("georgia-2017-2025")).toBe(true);
    expect(reconciledIds.has("clemson-2011-2025")).toBe(true);
    expect(reconciledIds.has("alabama-2009-2020")).toBe(false);
    expect(reconciledIds.has("ohio-state-2012-2024")).toBe(false);

    const runtime = getFootballPlayableRankFivePack("college-program-eras").items;
    const alabama = runtime.find((item) => item.id === "alabama-2008-2023");
    expect(alabama).toBeDefined();
    expect(alabama?.rating).toBe(100);
  });

  it("keeps every Blind 5 and Keep 4 Program Era board to one era per canonical school", () => {
    for (let index = 0; index < 16; index += 1) {
      const seed = `program-era-readiness-${index}`;
      const blind = buildFootballRankFiveLineup("college-program-eras", seed);
      const keepCut = buildFootballKeepCutLineup("college-program-eras", seed);

      expect(blind).toHaveLength(5);
      expect(keepCut).toHaveLength(8);

      const blindTeams = canonicalTeamIds(blind);
      const keepCutTeams = canonicalTeamIds(keepCut);
      expect(new Set(blindTeams).size).toBe(blindTeams.length);
      expect(new Set(keepCutTeams).size).toBe(keepCutTeams.length);
    }
  });

  it("locks Quinn Ewers to the approved Average tier", () => {
    expect(footballGreatnessTierForItem({ id: "cfb-quinn-ewers", rating: 100 })).toBe("average");
  });
});

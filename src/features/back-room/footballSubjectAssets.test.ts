import { describe, expect, it } from "vitest";
import { footballRankFivePacks } from "./footballRankFiveModel";
import { footballSubjectAsset, footballSubjectAssets, footballTeamAssets } from "./footballSubjectAssets";
import { getFootballSubject } from "./footballSubjectRegistry";

const TEAM_MEDIA_KINDS = new Set(["player-season", "team-season", "program", "program-era"]);

describe("footballSubjectAssets", () => {
  it("routes every current comparison subject through the canonical media owner", () => {
    const ids = footballRankFivePacks.flatMap((pack) => pack.items.map((item) => item.id));
    expect(ids).toHaveLength(350);
    expect(new Set(ids).size).toBe(350);

    for (const id of ids) {
      const subject = getFootballSubject(id);
      expect(subject, id).toBeDefined();

      const asset = footballSubjectAsset(id);
      if (subject && TEAM_MEDIA_KINDS.has(subject.kind)) {
        expect(subject.teamId, id).toBeDefined();
        expect(asset, id).toBe(footballTeamAssets[subject.teamId!]);
        expect(footballSubjectAssets[id], id).toBeUndefined();
      } else {
        expect(asset, id).toBe(footballSubjectAssets[id] ?? null);
      }
    }
  });
});

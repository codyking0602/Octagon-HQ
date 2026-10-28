import { describe, expect, it } from "vitest";
import { footballHitTheNumberSubjects } from "./footballHitTheNumberModel";
import { footballRankFivePacks } from "./footballRankFiveModel";
import { footballSubjectAsset, footballSubjectAssets, footballTeamAssets } from "./footballSubjectAssets";
import { getFootballSubject } from "./footballSubjectRegistry";

const TEAM_MEDIA_KINDS = new Set(["player-season", "team-season", "program", "program-era"]);

describe("footballSubjectAssets", () => {
  it("routes every current comparison subject through the canonical media owner", () => {
    const ids = footballRankFivePacks.flatMap((pack) => pack.items.map((item) => item.id));
    expect(footballRankFivePacks).toHaveLength(12);
    expect(ids.length).toBeGreaterThan(250);
    expect(new Set(ids).size).toBe(ids.length);

    for (const id of ids) {
      const subject = getFootballSubject(id);
      expect(subject, id).toBeDefined();

      const asset = footballSubjectAsset(id);
      const usesCanonicalTeamMedia = subject && TEAM_MEDIA_KINDS.has(subject.kind);
      if (usesCanonicalTeamMedia) {
        expect(subject.teamId, id).toBeDefined();
        expect(asset, id).toBe(footballTeamAssets[subject.teamId!]);
        expect(footballSubjectAssets[id], id).toBeUndefined();
      } else {
        expect(asset, id).toBe(footballSubjectAssets[id] ?? null);
      }
    }
  });

  it("resolves NFL Team Era subjects through the existing franchise marks", () => {
    for (const id of ["nfl-era-49ers-montana-walsh", "nfl-era-patriots-belichick-brady"]) {
      const subject = getFootballSubject(id);
      expect(subject, id).not.toBeNull();
      expect(subject?.teamId, id).toBeDefined();
      expect(footballSubjectAsset(id), id).toBe(footballTeamAssets[subject!.teamId!]);
    }
  });

  it("gives every Hit the Number season subject canonical team media", () => {
    const seasonSubjects = footballHitTheNumberSubjects.filter((subject) => (
      subject.kind === "player-season" || subject.kind === "team-season"
    ));
    expect(seasonSubjects.length).toBeGreaterThanOrEqual(30);
    expect(new Set(seasonSubjects.map((subject) => subject.id)).size).toBe(seasonSubjects.length);

    for (const subject of seasonSubjects) {
      const canonical = getFootballSubject(subject.id);
      expect(canonical, subject.id).toBeDefined();
      expect(canonical?.teamId, subject.id).toBeDefined();
      expect(footballSubjectAsset(subject.id), subject.id).not.toBeNull();
    }
  });
});

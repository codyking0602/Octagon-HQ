import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BUILD_QB_GENERATION_WEIGHT_BY_RARITY, BUILD_QB_RESEARCH_LEVEL_RATING } from "./footballPositionTraitRatings";
import {
  CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY,
  CFB_BUILD_QB_TRAIT_RATING_BY_LEVEL,
  buildFootballCfbBuildQbTraitProfiles,
} from "./footballCfbBuildQbTraitRatings";
import { footballCareerAffiliationHistoryFor } from "./footballCareerAffiliationProjection";
import { getFootballSubject } from "./footballSubjectRegistry";
import { generatedCfbBuildQbCatalog } from "../play/generated/cfbBuildQbCatalog";

type ColumnarTable = {
  columns: string[];
  rows: unknown[][];
};

function rowSignal(row: unknown[], indexes: Record<string, number>) {
  const value = (column: string) => Number(row[indexes[column]!] ?? 0) || 0;
  return value("gamesPlayed") * 100
    + value("passAttempts")
    + value("rushAttempts")
    + value("receptions")
    + value("sacks") * 10
    + value("defensiveInterceptions") * 20
    + value("passBreakups") * 5;
}

describe("CFB Build a QB canonical peak-season audit", () => {
  const profiles = buildFootballCfbBuildQbTraitProfiles();

  it("uses the existing Build a QB calibration and generation owners", () => {
    expect(CFB_BUILD_QB_TRAIT_RATING_BY_LEVEL).toBe(BUILD_QB_RESEARCH_LEVEL_RATING);
    expect(CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY).toBe(BUILD_QB_GENERATION_WEIGHT_BY_RARITY);
  });

  it("binds every model entry to an exact registered CFB QB identity", () => {
    for (const profile of profiles) {
      const subject = getFootballSubject(profile.canonicalPlayerId);
      expect(subject, profile.canonicalPlayerId).toBeTruthy();
      expect(subject).toMatchObject({
        kind: "player-career",
        league: "CFB",
        position: "QB",
      });
    }
  });

  it("proves every source-backed modern peak season belongs to the selected school", () => {
    for (const profile of profiles.filter((candidate) => candidate.sourceProvider === "cfbfastR")) {
      const subject = getFootballSubject(profile.canonicalPlayerId)!;
      const history = footballCareerAffiliationHistoryFor(subject);
      const peakAffiliations = history?.seasons
        .filter((season) => season.season === profile.peakSeason)
        .map((season) => season.affiliation) ?? [];
      expect(peakAffiliations, `${profile.name} ${profile.peakSeason}`).toContain(profile.school);
    }
  });

  it("audits modern peak seasons against the pinned player-season statistics without display-name inference", () => {
    const raw = JSON.parse(
      readFileSync("data/generated/football/cfb/player-seasons-2014-2025.json", "utf8"),
    ) as ColumnarTable;
    const indexes = Object.fromEntries(raw.columns.map((column, index) => [column, index])) as Record<string, number>;

    for (const profile of profiles.filter((candidate) => candidate.sourceProvider === "cfbfastR")) {
      const sourceId = /^cfbfast-r-player-(\d+)-/.exec(profile.canonicalPlayerId)?.[1];
      expect(sourceId, profile.canonicalPlayerId).toBeTruthy();

      const seasonRows = raw.rows.filter((row) =>
        String(row[indexes.sourcePlayerId] ?? "") === sourceId
        && Number(row[indexes.season]) === profile.peakSeason,
      );
      const selectedRows = seasonRows.filter((row) => String(row[indexes.team] ?? "") === profile.school);
      expect(selectedRows.length, `${profile.name} ${profile.peakSeason} ${profile.school}`).toBeGreaterThan(0);

      const selected = [...selectedRows].sort((left, right) => rowSignal(right, indexes) - rowSignal(left, indexes))[0]!;
      expect(Number(selected[indexes.passAttempts] ?? 0), profile.name).toBeGreaterThan(0);
      expect(
        rowSignal(selected, indexes),
        `${profile.name} peak-school row must own the strongest exact player-season signal`,
      ).toBe(Math.max(...seasonRows.map((row) => rowSignal(row, indexes))));
    }
  });

  it("keeps transfer peak-season school ownership exact", () => {
    const expected = new Map([
      ["Jalen Hurts", [2019, "Oklahoma"]],
      ["Joe Burrow", [2019, "LSU"]],
      ["Jayden Daniels", [2023, "LSU"]],
      ["Bo Nix", [2023, "Oregon"]],
      ["Michael Penix Jr.", [2023, "Washington"]],
    ] as const);

    for (const [name, [season, school]] of expected) {
      expect(profiles.find((profile) => profile.name === name)).toMatchObject({
        peakSeason: season,
        school,
      });
    }
  });

  it("keeps the generated catalog synchronized with exact peak-season identity and calculated grades", () => {
    expect(generatedCfbBuildQbCatalog).toHaveLength(profiles.length);
    for (const profile of profiles) {
      const projected = generatedCfbBuildQbCatalog.find((candidate) => candidate.itemReference === profile.catalogId);
      expect(projected).toMatchObject({
        displayLabel: profile.name,
        peakSeason: profile.peakSeason,
        school: profile.school,
        canonicalPlayerId: profile.canonicalPlayerId,
        rarityBand: profile.qualityBand,
        generationWeight: profile.generationWeight,
        gradingInputs: { ...profile.traits, overall: profile.overall },
      });
    }
  });

  it("keeps the shipped repair append-only and out of shared deck-generation ownership", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310104_stage12_cfb_build_qb_competitive_audit.sql",
      "utf8",
    );
    expect(migration).toContain("football-draft-room-2026-09-v4");
    expect(migration).toContain("football-draft-room-rarity-2026-09-v3");
    expect(migration).toContain("football-build-qb-traits-2026-09-v1");
    expect(migration).not.toContain("create or replace function private.generate_auction_deck");

    for (const profile of profiles) {
      const values = [
        profile.traits.Arm,
        profile.traits.Accuracy,
        profile.traits.Processing,
        profile.traits.Mobility,
        profile.traits.Clutch,
        profile.overall,
      ].join(", ");
      expect(migration).toContain(`('${profile.catalogId}', ${values})`);
      expect(migration).toContain(profile.canonicalPlayerId);
    }
  });
});

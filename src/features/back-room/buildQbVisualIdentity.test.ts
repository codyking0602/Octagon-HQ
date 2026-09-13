import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BUILD_QB_HERO_IMAGE,
  BUILD_QB_TEAM_BY_ITEM_REFERENCE,
  buildQbVisualIdentity,
} from "./buildQbVisualIdentity";

describe("Build a QB visual identity", () => {
  it("covers the exact refreshed 60-item server catalog without display-name inference", () => {
    const baselineMigration = readFileSync(
      "supabase/migrations/202612310102_stage12_build_qb_competitive_model.sql",
      "utf8",
    );
    const rotationMigration = readFileSync(
      "supabase/migrations/202612310104_stage12_build_qb_roster_refresh.sql",
      "utf8",
    );
    const removedReferences = new Set([
      "build-qb-johnny-unitas",
      "build-qb-bob-griese",
      "build-qb-dan-fouts",
      "build-qb-trent-green",
      "build-qb-ken-anderson",
      "build-qb-ken-stabler",
      "build-qb-sonny-jurgensen",
      "build-qb-len-dawson",
      "build-qb-rich-gannon",
      "build-qb-mark-brunell",
      "build-qb-matt-schaub",
    ]);
    const baselineReferences = [...baselineMigration.matchAll(
      /'football-draft-room-2026-09-v2','build-qb','([^']+)'/g,
    )].map((match) => match[1]!);
    const replacementReferences = [...rotationMigration.matchAll(
      /'football-draft-room-2026-09-v4','build-qb','([^']+)'/g,
    )].map((match) => match[1]!);
    const serverReferences = [
      ...baselineReferences.filter((reference) => !removedReferences.has(reference)),
      ...replacementReferences,
    ].sort();
    const visualReferences = Object.keys(BUILD_QB_TEAM_BY_ITEM_REFERENCE).sort();

    expect(baselineReferences).toHaveLength(60);
    expect(replacementReferences).toHaveLength(11);
    expect(serverReferences).toHaveLength(60);
    expect(new Set(serverReferences).size).toBe(60);
    expect(visualReferences).toEqual(serverReferences);
    expect(serverReferences.every((reference) => buildQbVisualIdentity(reference) !== null)).toBe(true);
    expect(buildQbVisualIdentity("Joe Burrow")).toBeNull();
  });

  it("keeps approved iconic franchise treatments stable for key quarterbacks", () => {
    expect(buildQbVisualIdentity("build-qb-andrew-luck")?.teamCode).toBe("IND");
    expect(buildQbVisualIdentity("build-qb-joe-burrow")?.teamCode).toBe("CIN");
    expect(buildQbVisualIdentity("build-qb-tom-brady")?.teamCode).toBe("NE");
    expect(buildQbVisualIdentity("build-qb-patrick-mahomes")?.teamCode).toBe("KC");
    expect(buildQbVisualIdentity("build-qb-jay-cutler")?.teamCode).toBe("CHI");
    expect(buildQbVisualIdentity("build-qb-trevor-lawrence")?.teamCode).toBe("JAX");
    expect(buildQbVisualIdentity("build-qb-jayden-daniels")?.teamCode).toBe("WAS");
    expect(buildQbVisualIdentity("build-qb-nick-foles")?.teamCode).toBe("PHI");
  });

  it("keeps the Draft Room hero on the dedicated Andrew Luck asset", () => {
    expect(BUILD_QB_HERO_IMAGE).toBe("/assets/football/build-qb-andrew-luck-hero.webp");
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BUILD_QB_HERO_IMAGE,
  BUILD_QB_TEAM_BY_ITEM_REFERENCE,
  buildQbVisualIdentity,
} from "./buildQbVisualIdentity";

describe("Build a QB visual identity", () => {
  it("covers the exact 60-item v2 server catalog without display-name inference", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310102_stage12_build_qb_competitive_model.sql",
      "utf8",
    );
    const serverReferences = [...migration.matchAll(
      /'football-draft-room-2026-09-v2','build-qb','([^']+)'/g,
    )].map((match) => match[1]!).sort();
    const visualReferences = Object.keys(BUILD_QB_TEAM_BY_ITEM_REFERENCE).sort();

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
  });

  it("keeps the Draft Room hero on the dedicated Andrew Luck asset", () => {
    expect(BUILD_QB_HERO_IMAGE).toBe("/assets/football/build-qb-andrew-luck-hero.webp");
  });
});

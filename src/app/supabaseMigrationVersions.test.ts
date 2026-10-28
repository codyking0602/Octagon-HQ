import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationFiles = readdirSync("supabase/migrations")
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

describe("Supabase migration versions", () => {
  it("assigns one unique 12-digit version to every migration", () => {
    const versions = migrationFiles.map((fileName) => {
      const match = fileName.match(/^(\d{12})_/);
      expect(match, `${fileName} must start with a 12-digit migration version`).not.toBeNull();
      return match?.[1] ?? "";
    });

    const duplicates = [...new Set(
      versions.filter((version, index) => versions.indexOf(version) !== index),
    )];

    expect(duplicates, `Duplicate migration versions: ${duplicates.join(", ")}`).toEqual([]);
  });
});

import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migrationFiles = readdirSync("supabase/migrations")
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

describe("Supabase migration versions", () => {
  it("assigns every migration one unique numeric version", () => {
    const versions = migrationFiles.map((fileName) => {
      const match = /^(\d+)_/.exec(fileName);
      expect(match, `Migration filename is missing a numeric version: ${fileName}`).not.toBeNull();
      return match![1];
    });

    const duplicates = versions.filter((version, index) => versions.indexOf(version) !== index);
    expect([...new Set(duplicates)], "Duplicate migration versions block production db push").toEqual([]);
  });
});

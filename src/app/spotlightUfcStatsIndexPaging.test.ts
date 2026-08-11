import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const builder = readFileSync("supabase/functions/build-pick-spotlight/index.ts", "utf8");

describe("UFCStats Spotlight fighter-index lookup", () => {
  it("uses bounded normal pages instead of the oversized page=all request", () => {
    expect(builder).toContain("const UFCSTATS_FIGHTER_INDEX_MAX_PAGES = 20;");
    expect(builder).toContain("page <= UFCSTATS_FIGHTER_INDEX_MAX_PAGES");
    expect(builder).toContain("&page=${page}");
    expect(builder).not.toContain("page=all");
  });

  it("stops on the exact fighter and shares fetched index pages across both fighters", () => {
    expect(builder).toContain("if (unique.length === 1) return unique[0]!");
    expect(builder).toContain("if (fighterRows === 0) break;");
    expect(builder).toContain("const key = `${letter}:${page}`;");
    expect(builder).toContain("const indexCache = new Map<string, Promise<string>>();");
  });
});

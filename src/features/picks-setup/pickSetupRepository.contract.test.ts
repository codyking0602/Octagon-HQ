import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Football Picks setup ownership contract", () => {
  it("keeps the existing sync-next-football-event Edge Function as the only Football setup ingestion owner", () => {
    const source = readFileSync("src/features/picks-setup/pickSetupRepository.ts", "utf8");
    const ownerCalls = source.match(/functions\.invoke\("sync-next-football-event"/g) ?? [];

    expect(ownerCalls).toHaveLength(1);
    expect(source).not.toMatch(/functions\.invoke\("(?!sync-next-football-event)[^"]*football[^"]*"/);
  });
});

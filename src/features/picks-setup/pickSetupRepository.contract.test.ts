import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Football Picks setup ownership contract", () => {
  it("keeps one sync-next-football-event invocation owner for single-game, weekly preview, and weekly staging modes", () => {
    const source = readFileSync("src/features/picks-setup/pickSetupRepository.ts", "utf8");
    const ownerCalls = source.match(/invoke\("sync-next-football-event"/g) ?? [];

    expect(ownerCalls).toHaveLength(1);
    expect(source).toContain('mode: "week-preview"');
    expect(source).toContain('mode: "week-apply"');
    expect(source).not.toMatch(/invoke\("(?!sync-next-football-event)[^"]*football[^"]*"/);
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("CFB GM binding NIL offer reactivity", () => {
  it("re-evaluates the portal school wheel after an accepted retention price changes", () => {
    const source = readFileSync("src/features/back-room/FootballCfbGmPage.tsx", "utf8");
    const eligibleMemo = source.match(/const eligible = useMemo\([\s\S]*?\n  const wheelTeams/);
    expect(eligibleMemo).not.toBeNull();
    expect(eligibleMemo![0]).toContain("run.seed, run.retentionOffers]);");
    expect(eligibleMemo![0]).toContain("run.seed, run.retentionOffers)");
  });
});

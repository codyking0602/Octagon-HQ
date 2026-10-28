import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { WHEEL_NFL_GM_AUTHORITY } from "./wheelFootballNflCurrentAuthority";

const generated = readdirSync("data/generated/football");

function latest(pattern: RegExp) {
  const matches = generated.filter((name) => pattern.test(name)).sort();
  const value = matches.at(-1);
  if (!value) throw new Error(`No generated artifact matched ${pattern}`);
  return value;
}

describe("Wheel NFL -> GM current authority binding", () => {
  it("binds GM to the latest checked-in Wheel grade artifacts", () => {
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.QB).toBe(latest(/^wheel-nfl-qb-grades-\d{4}-\d{2}-\d{2}\.json$/));
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.RB).toBe(latest(/^wheel-nfl-rb-grades-\d{4}-\d{2}-\d{2}\.json$/));
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.WR).toBe(latest(/^wheel-nfl-wr-grades-\d{4}-\d{2}-\d{2}\.json$/));
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.TE).toBe(latest(/^wheel-nfl-te-grades-\d{4}-\d{2}-\d{2}\.json$/));
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles["Front Seven"]).toBe(latest(/^wheel-nfl-front-seven-grades-\d{4}-\d{2}-\d{2}\.json$/));
    expect(WHEEL_NFL_GM_AUTHORITY.gradeFiles.Secondary).toBe(latest(/^wheel-nfl-secondary-grades-\d{4}-\d{2}-\d{2}\.json$/));
  });

  it("binds GM to the latest checked-in contract snapshot", () => {
    expect(WHEEL_NFL_GM_AUTHORITY.contractFile).toBe(latest(/^wheel-nfl-gm-contracts-\d{4}-\d{2}-\d{2}\.json$/));
  });
});

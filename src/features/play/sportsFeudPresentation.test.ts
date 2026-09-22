import { describe, expect, it } from "vitest";
import {
  SPORTS_FEUD_FAST_MONEY_STAGE_ASSET,
  SPORTS_FEUD_HOSTS,
  SPORTS_FEUD_MAIN_STAGE_ASSET,
  sportsFeudHostAsset,
  sportsFeudHostNumber,
} from "./sportsFeudPresentation";

describe("Sports Feud presentation assets", () => {
  it("uses the two uploaded blank stage plates", () => {
    expect(SPORTS_FEUD_MAIN_STAGE_ASSET).toBe("/assets/sports-feud-main-stage.png");
    expect(SPORTS_FEUD_FAST_MONEY_STAGE_ASSET).toBe("/assets/sports-feud-fast-money-stage.png");
  });

  it("registers exactly three rotating hosts for UFC, NFL, and CFB", () => {
    expect(SPORTS_FEUD_HOSTS.ufc).toEqual([
      "/assets/1ufc.png",
      "/assets/2ufc.png",
      "/assets/3ufc.png",
    ]);
    expect(SPORTS_FEUD_HOSTS.nfl).toEqual([
      "/assets/1nfl.png",
      "/assets/2nfl.png",
      "/assets/3nfl.png",
    ]);
    expect(SPORTS_FEUD_HOSTS.cfb).toEqual([
      "/assets/1cfb.png",
      "/assets/2cfb.png",
      "/assets/3cfb.png",
    ]);
  });

  it("rotates deterministically by Central-date key", () => {
    for (const sport of ["ufc", "nfl", "cfb"] as const) {
      const first = sportsFeudHostNumber(sport, "2026-09-20");
      const second = sportsFeudHostNumber(sport, "2026-09-21");
      expect(first).toBeGreaterThanOrEqual(1);
      expect(first).toBeLessThanOrEqual(3);
      expect(second).toBe(first === 3 ? 1 : first + 1);
      expect(sportsFeudHostAsset(sport, "2026-09-20")).toBe(
        SPORTS_FEUD_HOSTS[sport][first - 1],
      );
    }
  });
});

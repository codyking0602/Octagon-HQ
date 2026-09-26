import { describe, expect, it } from "vitest";
import {
  SPORTS_FEUD_FAST_MONEY_STAGE_ASSET,
  SPORTS_FEUD_HOSTS,
  SPORTS_FEUD_MAIN_STAGE_ASSET,
  SPORTS_FEUD_MLB_HOST,
  sportsFeudHostAppearanceIndex,
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

  it("uses the uploaded MLB host as the fixed MLB Sports Feud host", () => {
    expect(SPORTS_FEUD_MLB_HOST).toBe("/assets/MLB.webp");
    expect(sportsFeudHostNumber("mlb", "2026-10-15")).toBe(1);
    expect(sportsFeudHostAsset("mlb", "2026-10-15")).toBe("/assets/MLB.webp");
  });

  it("locks the September 23 launch hosts to UFC #1 and CFB #3", () => {
    expect(sportsFeudHostNumber("ufc", "2026-09-23")).toBe(1);
    expect(sportsFeudHostAsset("ufc", "2026-09-23")).toBe("/assets/1ufc.png");
    expect(sportsFeudHostNumber("cfb", "2026-09-23")).toBe(3);
    expect(sportsFeudHostAsset("cfb", "2026-09-23")).toBe("/assets/3cfb.png");
  });

  it("advances UFC one host per actual UFC Sports Feud appearance", () => {
    expect(sportsFeudHostAppearanceIndex("ufc", "2026-09-23")).toBe(0);
    expect(sportsFeudHostNumber("ufc", "2026-09-23")).toBe(1);
    expect(sportsFeudHostNumber("ufc", "2026-09-24")).toBe(2);
    expect(sportsFeudHostNumber("ufc", "2026-10-02")).toBe(3);
    expect(sportsFeudHostNumber("ufc", "2026-10-10")).toBe(1);
    expect(sportsFeudHostNumber("ufc", "2026-10-18")).toBe(2);
  });

  it("advances CFB and NFL hosts independently on actual Football Sports Feud appearances", () => {
    expect(sportsFeudHostNumber("cfb", "2026-09-23")).toBe(3);
    expect(sportsFeudHostNumber("cfb", "2026-09-30")).toBe(1);
    expect(sportsFeudHostNumber("cfb", "2026-10-14")).toBe(2);

    expect(sportsFeudHostNumber("nfl", "2026-09-25")).toBe(1);
    expect(sportsFeudHostNumber("nfl", "2026-10-06")).toBe(2);
    expect(sportsFeudHostNumber("nfl", "2026-10-21")).toBe(3);
  });
});

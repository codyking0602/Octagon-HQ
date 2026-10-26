import { describe, expect, it } from "vitest";
import { contractsArtifact } from "./wheelFootballNflCurrentAuthority";
import { FOOTBALL_GM_PLAYER_POOL, FOOTBALL_GM_CAP } from "./footballGmEngine";

describe("verified Oct 26 NFL GM contract corrections", () => {
  it("preserves the 594-person curated NFL GM population", () => {
    expect(contractsArtifact.players).toHaveLength(594);
    expect(FOOTBALL_GM_PLAYER_POOL).toHaveLength(594);
  });

  it("applies Gervon Dexter's confirmed extension without misreading void years", () => {
    const row = contractsArtifact.players.find(x => x.team === "ATL" && x.player === "Gervon Dexter Sr.");
    expect(row).toMatchObject({
      salaryApy: 19_500_000,
      realContractEndSeason: 2030,
      gameContract: "3YR",
      source: { otcId: 10877, yearSigned: 2026, years: 4 },
    });
    const runtime = FOOTBALL_GM_PLAYER_POOL.find(x => x.team === "ATL" && x.name === "Gervon Dexter Sr.");
    expect(runtime).toBeDefined();
    expect(runtime?.salaryApy).toBe(19_500_000);
    expect(runtime?.gameContract).toBe("3YR");
  });

  it("applies Tank Dell's verified one-year 2026 salary without giving him a multi-year deal", () => {
    const row = contractsArtifact.players.find(x => x.team === "HOU" && x.player === "Tank Dell");
    expect(row).toMatchObject({
      salaryApy: 2_195_000,
      realContractEndSeason: 2026,
      gameContract: "1YR",
      source: { otcId: 10893, yearSigned: 2026, years: 1 },
    });
    const runtime = FOOTBALL_GM_PLAYER_POOL.find(x => x.team === "HOU" && x.name === "Tank Dell");
    expect(runtime?.salaryApy).toBe(2_195_000);
    expect(runtime?.gameContract).toBe("1YR");
    expect(FOOTBALL_GM_CAP).toBeGreaterThan(0);
  });
});

import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./rankingInputs";

const current = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find(
    (candidate) => candidate.fighter === name,
  );
  if (!fighter) throw new Error(`Missing current fighter ${name}.`);
  return fighter;
};

describe("reviewed fighter profile copy protection", () => {
  it("preserves presentation during data-only ranking refreshes", async () => {
    const { rankingDataRefresh } = await import("./v2RankingRoster");
    const fighter = current("Mackenzie Dern");
    const refreshed = rankingDataRefresh(fighter, { facts: fighter.facts });
    expect(refreshed.presentation).toBe(fighter.presentation);
  });

  it("keeps the approved calibration profiles", () => {
    expect(current("Jon Jones").presentation.oneLiner).toBe(
      "Jones is the UFC's ultimate problem-solver: freakishly long, creative, ruthless in the clinch, elite in wrestling, and brilliant at adapting mid-fight. His dominance, longevity, aura, and controversies are inseparable from a career that has defined multiple eras.",
    );
    expect(current("Glover Teixeira").presentation.oneLiner).toContain(
      "becoming UFC champion at 42",
    );
    expect(current("Conor McGregor").presentation.oneLiner).toContain(
      "UFC's biggest superstar",
    );
    expect(current("Mackenzie Dern").presentation.whyRankedHere).toContain(
      "12-5 UFC record",
    );
  });

  it("keeps refreshed ranking data while presentation stays locked", () => {
    expect(
      current("Dricus du Plessis").facts.fights.filter(
        (fight) => fight.id === "2026-07-18-kamaru-usman",
      ),
    ).toHaveLength(1);
    expect(
      current("Kamaru Usman").facts.fights.filter(
        (fight) => fight.id === "2026-07-18-dricus-du-plessis",
      ),
    ).toHaveLength(1);
    expect(
      current("Mackenzie Dern").facts.fights.filter(
        (fight) => fight.id === "2026-08-15-gillian-robertson",
      ),
    ).toHaveLength(1);
    expect(
      current("Islam Makhachev").facts.fights.filter(
        (fight) => fight.id === "2026-08-15-ian-machado-garry",
      ),
    ).toHaveLength(1);
    expect(
      current("Conor McGregor").facts.fights.find(
        (fight) => fight.id === "2026-07-11-max-holloway",
      )?.methodCategory,
    ).toBe("ko-tko");
  });
});

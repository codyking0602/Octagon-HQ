import { describe, expect, it } from "vitest";
import {
  canonicalRankingInputs,
  historicalRankingMigrationInputs,
} from "./rankingInputs";

const current = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find((candidate) => candidate.fighter === name);
  if (!fighter) throw new Error(`Missing current fighter ${name}.`);
  return fighter;
};

const historical = (name: string) => {
  const fighter = historicalRankingMigrationInputs.fighters.find((candidate) => candidate.fighter === name);
  if (!fighter) throw new Error(`Missing historical fighter ${name}.`);
  return fighter;
};

describe("reviewed fighter profile copy protection", () => {
  it("preserves presentation during data-only ranking refreshes", () => {
    for (const name of [
      "Dricus du Plessis",
      "Kamaru Usman",
      "Mackenzie Dern",
      "Conor McGregor",
    ]) {
      expect(current(name).presentation).toEqual(historical(name).presentation);
    }

    const islamHistorical = historical("Islam Makhachev");
    expect(current("Islam Makhachev").presentation).toEqual({
      ...islamHistorical.presentation,
      oneLiner:
        "Islam's peak combines suffocating control with rare finishing efficiency. He dictates where fights happen through pressure, wrestling, and top control, then forces mistakes with submissions or dangerous striking. He can dominate rounds without giving up the threat of a finish.",
      whyRankedHere:
        "Islam has a 17-1 UFC record, six title-fight wins, and a 10-0 prime run. He submitted Charles Oliveira for the lightweight belt, defended it four times, including twice against Alexander Volkanovski, then beat Jack Della Maddalena over five rounds to become welterweight champion. That championship volume and elite-win quality separate him from the tier below.",
      whyNotHigher:
        "The strongest case against moving Islam higher is career length, not peak quality. His elite run is still shorter than the sustained championship eras of the UFC greats above him. The Adriano Martins knockout is a UFC loss, even if it came well before his prime. He is still active at an elite level, so that longevity deficit can shrink.",
    });
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

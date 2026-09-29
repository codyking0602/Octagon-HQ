import { describe, expect, it } from "vitest";
import { getFighter } from "../rankingModel";
import { canonicalRankingInputs } from "./rankingInputs";

const input = (name: string) => {
  const fighter = canonicalRankingInputs.fighters.find(
    (candidate) => candidate.fighter === name,
  );
  if (!fighter) throw new Error(`Missing ${name}`);
  return fighter;
};

const fight = (fighter: string, opponent: string, date: string) =>
  input(fighter).facts.fights.filter(
    (candidate) => candidate.opponent === opponent && candidate.date === date,
  );

describe("September 12, 2026 Noche ranking repair", () => {
  it("adds Moreno's Morales win once without reopening his sealed prime", () => {
    expect(fight("Brandon Moreno", "Joseph Morales", "2026-09-12")).toEqual([
      expect.objectContaining({
        officialResult: "win",
        methodCategory: "decision",
        qualityTier: "solid",
        rounds: { status: "audited", won: 3, lost: 0, drawn: 0 },
      }),
    ]);
    expect(input("Brandon Moreno").facts.primeWindow).toEqual({
      startFightId: "2020-03-14-jussier-formiga",
      endFightId: "2025-12-06-tatsuro-taira",
      open: false,
    });
    expect(getFighter("brandon-moreno")?.visibleStats).toMatchObject({
      ufcRecord: "12-7-2",
      primeRecord: "7-4-1",
    });
  });

  it("adds Grasso's number-two Fiorot win once as current prime evidence", () => {
    expect(fight("Alexa Grasso", "Manon Fiorot", "2026-09-12")).toEqual([
      expect.objectContaining({
        officialResult: "win",
        methodCategory: "decision",
        qualityTier: "top-five",
        rounds: { status: "audited", won: 2, lost: 1, drawn: 0 },
      }),
    ]);
    expect(input("Alexa Grasso").facts.primeWindow.open).toBe(true);
    expect(getFighter("alexa-grasso")?.visibleStats).toMatchObject({
      ufcRecord: "10-5-1",
      topFiveWins: 4,
      rankedWins: 7,
      primeRecord: "6-2-1",
    });
  });

  it("gives Fiorot one reviewed opponent-quality credit and updates Grasso's Apex pair", () => {
    const grasso = input("Alexa Grasso");
    expect(
      grasso.judgments.opponentQuality.inputs.filter(
        (row) => row.fightId === "2026-09-12-manon-fiorot",
      ),
    ).toEqual([
      expect.objectContaining({
        opponent: "Manon Fiorot",
        finalCredit: 1,
        judgmentSource: "octagon-hq-2026-09-29-noche-repair",
        judgmentStatus: "audited",
      }),
    ]);
    expect(grasso.judgments.apex.performances).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          opponent: "Valentina Shevchenko",
          rating: 9.8,
        }),
        expect.objectContaining({
          fightId: "2026-09-12-manon-fiorot",
          opponent: "Manon Fiorot",
          rating: 9.2,
        }),
      ]),
    );
    expect(grasso.judgments.apex.components.twoPerformanceStrength).toBe(1.9);
  });

  it("keeps the model cutoff at September 19 while advancing repair versions", () => {
    expect(canonicalRankingInputs.source).toMatchObject({
      modelAsOfDate: "2026-09-19",
      factsVersion: "octagon-hq-v2-noche-repair-facts-20260929",
      judgmentVersion: "octagon-hq-v2-noche-repair-judgments-20260929",
    });
  });
});

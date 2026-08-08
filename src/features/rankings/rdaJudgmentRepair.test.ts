import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "./data/rankingInputs";
import { v2RankingRoster } from "./data/v2RankingRoster";

const rda = canonicalRankingInputs.fighters.find(
  (fighter) => fighter.fighter === "Rafael dos Anjos",
);

function fight(opponent: string) {
  return rda?.facts.fights.find((entry) => entry.opponent === opponent);
}

describe("Rafael dos Anjos approved ranking judgments", () => {
  it("extends the canonical calculation window through Leon Edwards", () => {
    expect(rda).toBeDefined();
    expect(rda?.facts.primeWindow).toMatchObject({
      startFightId: "2014-08-23-benson-henderson",
      endFightId: "2019-07-20-leon-edwards",
      open: false,
    });
    expect(rda?.era.window).toEqual({
      start: "2014-08-23",
      end: "2019-07-20",
    });
  });

  it("treats the Colby Covington and Kamaru Usman losses as home-division welterweight losses", () => {
    expect(fight("Colby Covington")?.lossClassification?.divisionContext).toBe("home");
    expect(fight("Kamaru Usman")?.lossClassification?.divisionContext).toBe("home");
    expect(fight("Leon Edwards")?.lossClassification?.divisionContext).toBe("home");
  });

  it("uses the approved opponent-quality credits", () => {
    const credits = Object.fromEntries(
      (rda?.judgments.opponentQuality.inputs ?? []).map((entry) => [
        `${entry.date}:${entry.opponent}`,
        entry.finalCredit,
      ]),
    );

    expect(credits).toEqual({
      "2015-03-14:Anthony Pettis": 1.25,
      "2014-08-23:Benson Henderson": 1.25,
      "2017-12-16:Robbie Lawler": 1,
      "2015-12-19:Donald Cerrone": 1,
      "2013-08-28:Donald Cerrone": 0.85,
      "2014-12-13:Nate Diaz": 0.85,
      "2019-05-18:Kevin Lee": 0.85,
      "2017-09-09:Neil Magny": 0.85,
      "2020-11-14:Paul Felder": 0.85,
      "2011-07-02:George Sotiropoulos": 0.85,
      "2022-03-05:Renato Moicano": 0.65,
      "2012-11-17:Mark Bocek": 0.65,
      "2013-05-18:Evan Dunham": 0.65,
      "2017-06-17:Tarec Saffiedine": 0.65,
      "2014-06-07:Jason High": 0.45,
      "2022-12-03:Bryan Barberena": 0.45,
      "2010-04-10:Terry Etim": 0.45,
      "2012-07-11:Anthony Njokuani": 0.45,
      "2009-09-19:Rob Emerson": 0.25,
      "2010-01-11:Kyle Bradley": 0.25,
      "2012-05-15:Kamal Shalorus": 0.25,
    });
  });

  it("leaves Apex and era-depth judgments untouched and advances the judgment version", () => {
    expect(rda?.judgments.apex.performances.map((entry) => entry.rating)).toEqual([9.7, 9.6]);
    expect(rda?.eraDepth.depthIndex).toBe(0.92);
    expect(v2RankingRoster.judgmentVersion).toBe("octagon-hq-v2-rda-judgments-20260807");
  });
});

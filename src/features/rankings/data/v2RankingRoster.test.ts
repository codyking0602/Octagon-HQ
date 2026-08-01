import { existsSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { getFighter } from "../rankingModel";
import {
  canonicalRankingInputs,
  historicalRankingMigrationInputs,
} from "./rankingInputs";
import {
  v2RankingRoster,
  type V2RankingRosterOverlay,
} from "./v2RankingRoster";

const projectRoot = `${process.cwd()}/`;

const sourceOverrides: Pick<
  V2RankingRosterOverlay,
  | "modelAsOfDate"
  | "factsVersion"
  | "judgmentVersion"
  | "eraLedgerVersion"
  | "eraDepthVersion"
  | "eraDepthResolutionVersion"
> = {
  modelAsOfDate: v2RankingRoster.modelAsOfDate,
  factsVersion: v2RankingRoster.factsVersion,
  judgmentVersion: v2RankingRoster.judgmentVersion,
  eraLedgerVersion: v2RankingRoster.eraLedgerVersion,
  eraDepthVersion: v2RankingRoster.eraDepthVersion,
  eraDepthResolutionVersion: v2RankingRoster.eraDepthResolutionVersion,
};

describe("V2 ranking roster overlay", () => {
  it("adds Rafael dos Anjos without changing the sealed baseline", () => {
    expect(v2RankingRoster.additions).toHaveLength(1);
    expect(Object.keys(v2RankingRoster.replacements)).toEqual(["Stipe Miocic"]);
    expect(sourceOverrides).toMatchObject({
      factsVersion: "octagon-hq-v2-rda-20260730",
      judgmentVersion: "octagon-hq-v2-stipe-profile-20260731",
      eraDepthVersion: "octagon-hq-v2-rda-20260730",
      eraDepthResolutionVersion: "octagon-hq-v2-rda-20260730",
    });
    expect(canonicalRankingInputs.counts).toEqual({
      fighters: 81,
      men: 66,
      women: 15,
    });

    const input = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Rafael dos Anjos",
    );
    expect(input).toBeDefined();
    expect(input?.facts.fights).toHaveLength(34);
    expect(
      input?.facts.fights.filter((fight) => fight.officialResult === "win"),
    ).toHaveLength(20);
    expect(
      input?.facts.fights.filter((fight) => fight.officialResult === "loss"),
    ).toHaveLength(14);
    expect(input?.facts.primeWindow).toEqual({
      startFightId: "2014-08-23-benson-henderson",
      endFightId: "2019-05-18-kevin-lee",
      open: false,
    });
    expect(canonicalRankingInputs.filters.eraMembership["Rafael dos Anjos"]).toEqual({
      primary: "golden-age",
      secondary: "superstar",
    });
  });

  it("replaces only Stipe Miocic's approved profile reasoning", () => {
    const historical = historicalRankingMigrationInputs.fighters.find(
      (fighter) => fighter.fighter === "Stipe Miocic",
    );
    const current = canonicalRankingInputs.fighters.find(
      (fighter) => fighter.fighter === "Stipe Miocic",
    );

    expect(historical).toBeDefined();
    expect(current).toBeDefined();
    expect(current?.facts).toEqual(historical?.facts);
    expect(current?.era).toEqual(historical?.era);
    expect(current?.judgments).toEqual(historical?.judgments);
    expect(current?.eraDepth).toEqual(historical?.eraDepth);
    expect(current?.presentation).toEqual({
      ...historical?.presentation,
      whyRankedHere: "Stipe built the greatest heavyweight resume in UFC history through sustained championship success rather than one dominant run. He owns the division's record for consecutive title defenses, reclaimed the belt after defeat, defeated Daniel Cormier twice in their trilogy, and consistently beat championship-caliber heavyweights across multiple eras. No UFC heavyweight combines championship accomplishment, elite wins, and longevity as completely.",
      whyNotHigher: "Heavyweight has never offered the week-to-week depth or sustained elite competition of divisions like welterweight or lightweight, limiting how high even its greatest champion can climb. Stipe also lacks the extended championship dominance of the fighters above him, and his prime includes decisive losses to Daniel Cormier and Francis Ngannou before the late-career Jon Jones defeat.",
    });
    expect(
      `${current?.presentation.whyRankedHere}${current?.presentation.whyNotHigher}`,
    ).toMatch(/^[\x00-\x7F]+$/);
  });

  it("calculates Rafael dos Anjos through the canonical engine", () => {
    const fighter = getFighter("rafael-dos-anjos");
    expect(fighter).toBeDefined();
    expect(fighter?.visibleStats.ufcRecord).toBe("20-14");
    expect(fighter?.visibleStats.primeRecord).toBe("8-4");
    expect(fighter?.visibleStats.titleFightWins).toBe(2);
    expect(fighter?.rank).toBeGreaterThan(0);
    expect(fighter?.ovr).toBeLessThanOrEqual(99);

    const colby = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Colby Covington",
    );
    const usman = fighter?.traces.penalty.events.find(
      (event) => event.opponent === "Kamaru Usman",
    );
    expect(colby).toMatchObject({ phase: "prime", upwardDivision: true });
    expect(usman).toMatchObject({ phase: "prime", upwardDivision: true });
  });

  it("uses the existing local Rafael dos Anjos assets", () => {
    expect(
      existsSync(
        `${projectRoot}public/assets/fighters/rafael-dos-anjos-thumb.webp`,
      ),
    ).toBe(true);
    expect(
      existsSync(
        `${projectRoot}public/assets/fighters/rafael-dos-anjos-profile.webp`,
      ),
    ).toBe(true);
  });
});

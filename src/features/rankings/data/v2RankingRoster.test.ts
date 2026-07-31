import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { getFighter } from "../rankingModel";
import { canonicalRankingInputs } from "./rankingInputs";
import {
  v2RankingRoster,
  type V2RankingRosterOverlay,
} from "./v2RankingRoster";

const projectRoot = fileURLToPath(new URL("../../../../", import.meta.url));

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

describe("Rafael dos Anjos V2 roster addition", () => {
  it("adds one complete men's fighter without changing the sealed baseline", () => {
    expect(v2RankingRoster.additions).toHaveLength(1);
    expect(v2RankingRoster.replacements).toEqual({});
    expect(sourceOverrides).toMatchObject({
      factsVersion: "octagon-hq-v2-rda-20260730",
      judgmentVersion: "octagon-hq-v2-rda-20260730",
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

  it("calculates the profile through the canonical engine", () => {
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

  it("uses the existing local thumbnail and profile assets", () => {
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

import { describe, expect, it } from "vitest";
import {
  nbaGmDevAssignRoster,
  nbaGmDevCanAdd,
  nbaGmDevCandidates,
  nbaGmDevSpend,
  type NbaGmDevPlayer,
  type NbaGmDevRun,
} from "./nbaGmDevModel";

const cap = [155_000_000, 155_000_000, 155_000_000] as const;
const makePlayer = (
  id: string, position: "PG" | "SG" | "SF" | "PF" | "C",
  salaries: readonly [number, number, number], contract: "1YR" | "3YR" = "1YR",
): NbaGmDevPlayer => ({
  id, name: id, teamCode: "GSW", positions: [position],
  currentGrade: 80,
  skills: { scoring: 80, shooting: 80, playmaking: 80,
    perimeterDefense: 80, interiorDefense: 80, rebounding: 80 },
  salaries, gameContract: contract,
  pricingKind: "SIGNED_REAL_SALARY_WINDOW",
  eligibilityKind: "PROVISIONAL_EDITORIAL",
  officialNbaPlayerId: null,
  officialRosterPosition: position,
  positionReview: "unverified", reviewFlags: [],
});
const tyson = makePlayer("tyson", "SG", [4_650_030, 18_500_000, 18_500_000]);
const murray = makePlayer("murray", "SF", [26_068_967, 26_068_967, 26_068_967], "3YR");
const deni = makePlayer("deni", "PF", [12_500_000, 45_000_000, 45_000_000]);
const curry = makePlayer("curry", "PG", [59_481_053, 59_481_053, 59_481_053], "3YR");
const baba = makePlayer("baba", "C", [2_231_454, 2_231_454, 2_231_454]);
const bruce = makePlayer("bruce", "PG", [2_115_499, 2_115_499, 2_115_499]);
const cam = makePlayer("cam", "PF", [1_819_437, 1_819_437, 1_819_437]);
const pool = [tyson, murray, deni, curry, baba, bruce, cam];
const selected = nbaGmDevAssignRoster([tyson.id, murray.id, deni.id], pool)!;

describe("NBA GM NFL Season 1-only draft cap parity", () => {
  it("permits the live Steph roster pattern in Season 1 despite expensive Year 2 renewals", () => {
    expect(selected).toHaveLength(3);
    expect(nbaGmDevCanAdd(selected, curry, pool, cap, "draft")).toBe(true);
    const next = nbaGmDevAssignRoster([...selected.map(p => p.playerId), curry.id], pool)!;
    expect(nbaGmDevSpend(next, pool)[0]).toBeLessThan(cap[0]);
    const run: NbaGmDevRun = {
      version:"nba-gm-dev-v2",seed:"synthetic-year1",phase:"draft",picks:selected,
      yearOnePicks:[],pendingTeam:"GSW",pendingSlot:null,spinIndex:4,caps:cap,results:[],
      shopPlayerId:null,tradeTeam:null,tradeAttempts:0,tradesUsed:0,
      freeAgencyTeam:null,freeAgencyVisits:0,releasedIds:[],
    };
    expect(nbaGmDevCandidates(run,pool).some(p => p.id === curry.id)).toBe(true);
  });

  it("retains hard Year 1 cap and requires an affordable distinct-position completion", () => {
    expect(nbaGmDevCanAdd(selected, curry, pool, [100_000_000,cap[1],cap[2]], "draft")).toBe(false);
    const six = nbaGmDevAssignRoster([tyson.id,murray.id,deni.id,curry.id,baba.id,bruce.id],pool)!;
    expect(nbaGmDevCanAdd(six,cam,pool,cap,"draft")).toBe(true);
    const seven = nbaGmDevAssignRoster([...six.map(p => p.playerId),cam.id],pool)!;
    const spent = nbaGmDevSpend(seven,pool);
    expect(spent[0]).toBeLessThanOrEqual(cap[0]);
    expect(spent[1]).toBeGreaterThan(cap[1]);
    expect(spent[2]).toBeGreaterThan(cap[2]);
    expect(nbaGmDevCanAdd(six,cam,pool,cap,"offseason")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { ufcFactualLedgerSubjects } from "../back-room/ufcFactualLedger";
import { getFootballWhoAmILaunchPool } from "./whoAmIAuthority";
import {
  WHO_AM_I_IDENTITY_FACT_FAMILIES,
  WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET,
  WHO_AM_I_IDENTITY_FACT_PREFERRED_TARGET,
  footballWhoAmIIdentityFactBank,
  ufcWhoAmIIdentityFactBank,
} from "./whoAmIIdentityFacts";

const CANONICAL_SOURCE_OWNERS = new Set([
  "ufc-factual-ledger",
  "football-subject-registry",
  "football-factual-stats",
  "football-career-affiliation",
]);

describe("Who Am I canonical identity facts", () => {
  it("locks the approved fact-family vocabulary before enrichment", () => {
    expect(WHO_AM_I_IDENTITY_FACT_FAMILIES).toEqual([
      "role-position",
      "era",
      "school-team",
      "recognition",
      "draft-path",
      "awards",
      "championships",
      "postseason",
      "career-production",
      "career-path",
      "relationships",
      "rivalry-moment",
      "nickname",
      "style-archetype",
      "nationality",
      "sport-specific",
    ]);
    expect(WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET).toBe(15);
    expect(WHO_AM_I_IDENTITY_FACT_PREFERRED_TARGET).toBe(20);
  });

  it("keeps canonical facts structured and presentation-neutral", () => {
    const bank = ufcWhoAmIIdentityFactBank(ufcFactualLedgerSubjects[0]!);
    for (const fact of bank.facts) {
      expect("text" in fact).toBe(false);
      expect("band" in fact).toBe(false);
      expect("strength" in fact).toBe(false);
      expect("order" in fact).toBe(false);
      expect(CANONICAL_SOURCE_OWNERS.has(fact.source.owner)).toBe(true);
      expect(fact.source.subjectId).toBe(bank.subjectId);
    }
  });

  it("projects UFC identity facts deterministically from the canonical factual ledger", () => {
    const subject = ufcFactualLedgerSubjects.find((candidate) => (
      candidate.fights.some((fight) => ufcFactualLedgerSubjects.some((other) => other.name === fight.opponent))
    ))!;
    const first = ufcWhoAmIIdentityFactBank(subject);
    const second = ufcWhoAmIIdentityFactBank(subject);

    expect(second).toEqual(first);
    expect(first.sport).toBe("ufc");
    expect(first.league).toBe("UFC");
    expect(first.facts.some((fact) => fact.id === "primary-division" && fact.family === "role-position")).toBe(true);
    expect(first.facts.some((fact) => fact.id === "career-window" && fact.family === "era")).toBe(true);
    expect(first.facts.some((fact) => fact.family === "career-production")).toBe(true);
    expect(first.facts.some((fact) => fact.family === "relationships")).toBe(true);
    expect(first.facts.every((fact) => fact.source.owner === "ufc-factual-ledger")).toBe(true);
  });

  it.each(["NFL", "CFB"] as const)("projects every locked %s launch identity through one structured fact model", (league) => {
    const pool = getFootballWhoAmILaunchPool(league);
    const banks = pool.subjects.map(footballWhoAmIIdentityFactBank);

    expect(banks).toHaveLength(200);
    for (const bank of banks) {
      expect(bank.sport).toBe("football");
      expect(bank.league).toBe(league);
      expect(bank.facts.length).toBeGreaterThan(0);
      expect(new Set(bank.facts.map((fact) => fact.id)).size).toBe(bank.facts.length);
      expect(bank.facts.some((fact) => fact.family === "role-position")).toBe(true);
      expect(bank.facts.every((fact) => CANONICAL_SOURCE_OWNERS.has(fact.source.owner))).toBe(true);
    }

    expect(banks.some((bank) => bank.facts.some((fact) => fact.source.owner === "football-factual-stats"))).toBe(true);
    expect(banks.some((bank) => bank.facts.some((fact) => fact.source.owner === "football-career-affiliation"))).toBe(true);
  });

  it("keeps enrichment depth as a quality target instead of changing current playability", () => {
    const footballBanks = (["NFL", "CFB"] as const).flatMap((league) => (
      getFootballWhoAmILaunchPool(league).subjects.map(footballWhoAmIIdentityFactBank)
    ));
    expect(footballBanks.some((bank) => bank.facts.length < WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET)).toBe(true);
  });
});

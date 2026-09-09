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

  it("reuses the canonical NFL affiliation owner for modern A-tier linemen without enriching B-tier subjects", () => {
    const nflLaunchPool = getFootballWhoAmILaunchPool("NFL");
    for (const subjectId of ["nfl-jason-kelce", "nfl-joe-thomas"] as const) {
      const subject = nflLaunchPool.subjects.find((candidate) => candidate.id === subjectId)!;
      expect(subject.recognizabilityTier).toBe("A");
      const bank = footballWhoAmIIdentityFactBank(subject);
      expect(bank.facts.some((fact) => (
        fact.family === "career-path" && fact.source.owner === "football-career-affiliation"
      ))).toBe(true);
      expect(bank.facts.some((fact) => fact.id === "metric:nfl-career-games")).toBe(true);
      expect(bank.facts.some((fact) => fact.id === "metric:nfl-first-team-all-pros")).toBe(true);
    }

    const bTierSubject = nflLaunchPool.subjects.find((subject) => subject.recognizabilityTier === "B")!;
    const bTierBank = footballWhoAmIIdentityFactBank(bTierSubject);
    expect(bTierBank.facts.some((fact) => fact.id === "career-span-seasons")).toBe(false);
    expect(bTierBank.facts.some((fact) => fact.id === "draft-selection-band")).toBe(false);
  });

  it("audits NFL A-tier launch depth from canonical owners without a duplicated subject list", () => {
    const nflLaunchPool = getFootballWhoAmILaunchPool("NFL");
    const auditedSubjects = nflLaunchPool.subjects.filter((subject) => subject.recognizabilityTier === "A");
    const banks = auditedSubjects.map(footballWhoAmIIdentityFactBank);
    const counts = banks.map((bank) => bank.facts.length).sort((left, right) => left - right);
    const belowMinimum = banks
      .filter((bank) => bank.facts.length < WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET)
      .map((bank) => ({ subjectId: bank.subjectId, factCount: bank.facts.length }));
    const average = counts.reduce((total, count) => total + count, 0) / counts.length;
    const middle = Math.floor(counts.length / 2);
    const median = counts.length % 2 === 0
      ? (counts[middle - 1]! + counts[middle]!) / 2
      : counts[middle]!;
    const summary = {
      auditedIdentities: banks.length,
      minimumFacts: counts[0],
      averageFacts: Number(average.toFixed(2)),
      medianFacts: median,
      atMinimum: counts.filter((count) => count >= WHO_AM_I_IDENTITY_FACT_MINIMUM_TARGET).length,
      atPreferred: counts.filter((count) => count >= WHO_AM_I_IDENTITY_FACT_PREFERRED_TARGET).length,
      belowMinimum,
    };

    expect(auditedSubjects.length).toBeGreaterThan(0);
    expect(auditedSubjects.every((subject) => (
      subject.league === "NFL" && subject.recognizabilityTier === "A"
    ))).toBe(true);
    expect(new Set(banks.map((bank) => bank.subjectId)).size).toBe(auditedSubjects.length);
    expect(banks.map((bank) => bank.subjectId)).toEqual(auditedSubjects.map((subject) => subject.id));

    for (const bank of banks) {
      expect(new Set(bank.facts.map((fact) => fact.id)).size).toBe(bank.facts.length);
      for (const fact of bank.facts) {
        expect(CANONICAL_SOURCE_OWNERS.has(fact.source.owner)).toBe(true);
        expect(fact.source.subjectId).toBe(bank.subjectId);
        expect("text" in fact || "band" in fact || "strength" in fact || "order" in fact).toBe(false);
        if (fact.value.type === "scalar") {
          expect(typeof fact.value.value === "string" ? fact.value.value.trim().length : Number.isFinite(Number(fact.value.value))).toBeTruthy();
        } else if (fact.value.type === "list") {
          expect(fact.value.values.length).toBeGreaterThan(0);
          expect(fact.value.values.every((value) => (
            typeof value === "string" ? value.trim().length > 0 : Number.isFinite(value)
          ))).toBe(true);
        } else if (fact.value.type === "window") {
          expect(Number.isFinite(fact.value.start) && Number.isFinite(fact.value.end)).toBe(true);
          expect(fact.value.end).toBeGreaterThanOrEqual(fact.value.start);
        } else {
          expect(fact.value.name.trim().length).toBeGreaterThan(0);
        }
      }
    }

    console.info("Who Am I NFL A-tier canonical fact-depth audit", JSON.stringify(summary));
    expect(summary.auditedIdentities).toBe(auditedSubjects.length);
    expect(summary.atMinimum + summary.belowMinimum.length).toBe(summary.auditedIdentities);
    expect(summary.belowMinimum).toEqual([]);
  });
});
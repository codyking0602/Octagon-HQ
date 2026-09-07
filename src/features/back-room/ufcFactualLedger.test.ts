import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { ufcFactualExpansion, ufcFactualLedgerSubjects } from "./ufcFactualLedger";

const normalize = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");

describe("UFC factual ledger", () => {
  it("extends the ranked factual core to the configured launch target without changing rankings", () => {
    const ranked = ufcFactualLedgerSubjects.filter((subject) => subject.scope === "ranked-core");
    const expansion = ufcFactualLedgerSubjects.filter((subject) => subject.scope === "recognizable-expansion");

    expect(ranked).toHaveLength(canonicalRankingInputs.counts.fighters);
    expect(canonicalRankingInputs.counts.fighters).toBe(ufcFactualExpansion.rankedSubjectCountAtGeneration);
    expect(expansion).toHaveLength(ufcFactualExpansion.expansionSubjectCount);
    expect(ufcFactualLedgerSubjects).toHaveLength(ufcFactualExpansion.targetTotalSubjects);
    expect(ranked.map((subject) => subject.name)).toEqual(canonicalRankingInputs.fighters.map((fighter) => fighter.fighter));
  });

  it("keeps the recognizable expansion A-tier, modern-leaning, source-backed, and identity-unique", () => {
    const expansion = ufcFactualLedgerSubjects.filter((subject) => subject.scope === "recognizable-expansion");
    const legacy = expansion.filter((subject) => Number(subject.activeTo.slice(0, 4)) < ufcFactualExpansion.policy.modernActivityYear);
    const modernShare = expansion.length ? (expansion.length - legacy.length) / expansion.length : 1;

    expect(expansion.every((subject) => subject.recognizabilityTier === "A")).toBe(true);
    expect(legacy.length).toBeLessThanOrEqual(ufcFactualExpansion.policy.maximumLegacySubjects);
    expect(modernShare).toBeGreaterThanOrEqual(ufcFactualExpansion.policy.minimumModernShare);
    expect(expansion.every((subject) => subject.fights.length > 0)).toBe(true);
    expect(expansion.every((subject) => subject.fights.every((fight) =>
      Boolean(fight.id && fight.date && fight.opponent && fight.division && fight.result && fight.methodCategory),
    ))).toBe(true);

    expect(new Set(ufcFactualLedgerSubjects.map((subject) => subject.id)).size).toBe(ufcFactualLedgerSubjects.length);
    expect(new Set(ufcFactualLedgerSubjects.map((subject) => subject.slug)).size).toBe(ufcFactualLedgerSubjects.length);
    expect(new Set(ufcFactualLedgerSubjects.map((subject) => normalize(subject.name))).size).toBe(ufcFactualLedgerSubjects.length);
  });
});

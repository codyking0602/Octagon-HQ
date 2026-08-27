import fs from "node:fs";

const file = "src/features/back-room/footballFactualStatsCore.ts";
let text = fs.readFileSync(file, "utf8");
const before = `/**
 * Canonical reusable quantitative Football ledger.
 * Retired-player and champion-season facts are normalized from canonical source rows; broader families live in
 * a data-only expansion partition but use this module's metrics, sources, evidence and lookup owner.
 * Alias/cross-level rows are collapsed onto the same canonical subject identity here.
 */
export const footballFactualRecords: readonly FootballFactualRecord[] = mergeCanonicalFactualRecords([
  ...compatibilityFactualRecords,
  ...expandedFootballFactualRecords,
  ...footballFindLeaderProjectedFactualRecords,
]);`;
const after = `function projectedGapFillRecords(
  projected: readonly FootballFactualRecord[],
  owned: readonly FootballFactualRecord[],
) {
  const ownedFactKeys = new Set(
    owned.flatMap((record) => record.facts.map((fact) => record.subjectId + ":" + fact.metricId)),
  );
  return projected.flatMap((record) => {
    const subjectId = canonicalFactSubjectId(record.subjectId);
    const facts = record.facts.filter((fact) => !ownedFactKeys.has(subjectId + ":" + fact.metricId));
    return facts.length ? [{ ...record, subjectId, facts }] : [];
  });
}

const preFindLeaderFactualRecords = mergeCanonicalFactualRecords([
  ...compatibilityFactualRecords,
  ...expandedFootballFactualRecords,
]);
const findLeaderGapFillFactualRecords = projectedGapFillRecords(
  footballFindLeaderProjectedFactualRecords,
  preFindLeaderFactualRecords,
);

/**
 * Canonical reusable quantitative Football ledger.
 * Reviewed/curated facts retain ownership of subject+metric keys they already define. PR7 source projection is an
 * explicit gap-fill only: it may deepen missing facts but cannot compete with an existing canonical fact. The final
 * strict merge still rejects any conflicting facts that survive that ownership boundary.
 */
export const footballFactualRecords: readonly FootballFactualRecord[] = mergeCanonicalFactualRecords([
  ...preFindLeaderFactualRecords,
  ...findLeaderGapFillFactualRecords,
]);`;
if (!text.includes(before)) throw new Error("Expected Football factual ledger export block not found");
text = text.replace(before, after);
fs.writeFileSync(file, text);

import { readFileSync, writeFileSync } from "node:fs";

const sourcePath = "data/curated/football/cfb/gm-2026-classification-evidence.json";
const targetPath = "data/generated/football/cfb-gm-classification-runtime-2026.json";
const ledger = JSON.parse(readFileSync(sourcePath, "utf8"));
if (ledger.population !== 468 || ledger.players.length !== ledger.population) {
  throw Error("CFB GM candidate universe changed: audit roster and Wheel authority first");
}
const players = ledger.players.map((row) => ({
  id: row.id,
  classification: row.classification,
  remainingEligibility: row.remainingEligibility,
  earliestDraftYear: row.earliestDraftYear,
  draftEligible2027: row.draftEligible2027,
  ...(row.nilMarketEvidence ? {nilMarket: {
    year1: row.nilMarketEvidence.year1,
    year2Baseline: row.nilMarketEvidence.year2Baseline,
    providerRank: row.nilMarketEvidence.providerRank,
    confidence: row.nilMarketEvidence.confidence,
  }} : {}),
  ...(row.calibration ? {calibration: {
    status: row.calibration.status,
    development: row.calibration.development,
    draftDeclarationProbability: row.calibration.draftDeclarationProbability,
    portalExitProbability: row.calibration.portalExitProbability,
    ...(row.calibration.nil ? {nil: row.calibration.nil} : {}),
  }} : {}),
}));
if (new Set(players.map((row) => row.id)).size !== players.length) {
  throw Error("Duplicate CFB GM classification identity");
}
for (const row of players) {
  if (row.nilMarket) {
    if (![row.nilMarket.year1, row.nilMarket.year2Baseline].every((value) => Number.isInteger(value) && value >= 150_000 && value % 25_000 === 0))
      throw Error("Invalid externally sourced NIL market estimate " + row.id);
    if (!Number.isInteger(row.nilMarket.providerRank) || row.nilMarket.providerRank < 1 || row.nilMarket.providerRank > 100)
      throw Error("Invalid externally sourced NIL rank " + row.id);
  }
  if (!row.calibration) continue;
  const p = row.calibration.development;
  if (![p.breakout, p.improve, p.steady, p.decline].every((n) => Number.isInteger(n) && n >= 0)
    || p.breakout + p.improve + p.steady + p.decline !== 100
    || !Number.isInteger(p.maxGain) || p.maxGain < 0 || p.maxGain > 9
    || !Number.isInteger(p.maxLoss) || p.maxLoss < 0 || p.maxLoss > 9
    || !["LOW", "MEDIUM", "HIGH"].includes(p.volatility)) throw Error("Invalid reviewed development profile for " + row.id);
  for (const probability of [row.calibration.draftDeclarationProbability, row.calibration.portalExitProbability]) {
    if (probability !== null && (!Number.isFinite(probability) || probability < 0 || probability > 1))
      throw Error("Invalid departure probability for " + row.id);
  }
  if (row.calibration.nil) {
    const n = row.calibration.nil;
    if (![n.year1, n.year2Baseline].every((value) => Number.isInteger(value) && value >= 150_000 && value % 25_000 === 0))
      throw Error("Invalid NIL market override for " + row.id);
  }
}
const projection = {
  schemaVersion: 2,
  source: "gm-2026-classification-evidence.json",
  population: ledger.population,
  classified: ledger.classified,
  players,
};
writeFileSync(targetPath, JSON.stringify(projection, null, 2) + "\n");
console.log("CFB GM class projection:", projection.population, "players;",
  projection.classified, "classified");

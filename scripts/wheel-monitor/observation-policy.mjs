// Read-only observations provide a comparison baseline while grade/source
// certification is review-blocked. NEVER treat them as certified checkpoints.
import { identity, assert } from "./core.mjs";

export function validateObservation(raw, now = Date.now()) {
  if (raw == null) return null;
  assert(raw.schema === 3 && raw.status === "read-only-observation",
    "Untrusted previous monitoring observation schema/status");
  const timestamp = Date.parse(raw.checkedAt);
  assert(Number.isFinite(timestamp) && timestamp <= now + 300000,
    "Previous monitoring observation has invalid timestamp");
  // Long gaps require a fresh baseline, not false claims about weekly changes.
  if (now - timestamp > 45 * 86400000) return null;
  assert(Array.isArray(raw.identities) && raw.identities.length > 0 &&
    raw.identities.length <= 10000 && raw.catalogCounts &&
    ["nfl","cfb","ufc"].every(sport => Number.isInteger(raw.catalogCounts[sport]) &&
      raw.catalogCounts[sport] > 0 &&
      raw.identities.filter(row => row?.sport === sport).length === raw.catalogCounts[sport]),
    "Incomplete previous monitoring observation census");
  const keys = new Set();
  for (const row of raw.identities) {
    assert(row && ["nfl","cfb","ufc"].includes(row.sport) &&
      typeof row.name === "string" && row.name.length > 0 &&
      typeof row.sourceStatus === "string" &&
      (row.team || row.division) && !("grade" in row) &&
      !("hidden_grade" in row) && !("salaryApy" in row),
      "Malformed or rating-bearing observation identity");
    const key=identity(row);
    assert(!keys.has(key),"Duplicate observation identity: "+key);
    keys.add(key);
  }
  return raw;
}

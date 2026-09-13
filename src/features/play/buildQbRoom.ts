import type { GeneratedBuildQbCatalogRow } from "./generated/buildQbCatalog";

const ROOM_COUNTS = { 5: 1, 4: 2, 3: 4, 2: 2, 1: 1 } as const;

function shuffled<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error("Random source must return [0, 1)");
    const swap = Math.floor(value * (index + 1));
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
}

/** Mode-specific policy layered on the canonical catalog/deck model. */
export function sampleBuildQbRoom(
  catalog: readonly GeneratedBuildQbCatalogRow[],
  random: () => number,
): GeneratedBuildQbCatalogRow[] {
  if (new Set(catalog.map((row) => row.subjectId)).size !== catalog.length) throw new Error("QB identities must be unique");
  const room = ([5, 4, 3, 2, 1] as const).flatMap((band) => {
    const candidates = catalog.filter((row) => row.rarityBand === band);
    const count = ROOM_COUNTS[band];
    if (candidates.length < count) throw new Error(`Rarity band ${band} cannot fill a room`);
    return shuffled(candidates, random).slice(0, count);
  });
  return shuffled(room, random);
}

export type FootballEntrySurface = "play" | "picks";

export type FootballEntryState = {
  footballEntry: FootballEntrySurface;
};

const revealedSurfaces = new Set<FootballEntrySurface>();

export function nextFootballEntryState(surface: FootballEntrySurface): FootballEntryState | undefined {
  if (revealedSurfaces.has(surface)) return undefined;
  revealedSurfaces.add(surface);
  return { footballEntry: surface };
}

export function resetFootballEntrySessionForTests() {
  revealedSurfaces.clear();
}

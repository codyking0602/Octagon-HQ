export type FootballEntrySurface = "play" | "picks";

export type FootballEntryState = {
  footballEntry: FootballEntrySurface;
};

let footballRevealPlayed = false;

export function nextFootballEntryState(surface: FootballEntrySurface): FootballEntryState | undefined {
  if (footballRevealPlayed) return undefined;
  footballRevealPlayed = true;
  return { footballEntry: surface };
}

export function resetFootballEntrySessionForTests() {
  footballRevealPlayed = false;
}

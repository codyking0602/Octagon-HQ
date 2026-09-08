export type FootballEntrySurface = "play" | "picks";

export type FootballEntryState = {
  footballEntry: FootballEntrySurface;
};

const footballRevealPlayed: Record<FootballEntrySurface, boolean> = {
  play: false,
  picks: false,
};

export function nextFootballEntryState(surface: FootballEntrySurface): FootballEntryState | undefined {
  if (footballRevealPlayed[surface]) return undefined;
  footballRevealPlayed[surface] = true;
  return { footballEntry: surface };
}

export function resetFootballEntrySessionForTests() {
  footballRevealPlayed.play = false;
  footballRevealPlayed.picks = false;
}

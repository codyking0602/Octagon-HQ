/** Explicit elimination outcomes in both the season reveal and final recap. */
export function nbaGmPlayoffFinishText(finish: string): string {
  switch (finish) {
    case "First Round": return "Lost First Round";
    case "Conference Semifinals": return "Lost Conference Semifinals";
    case "Conference Finals": return "Lost Conference Finals";
    case "Finals": return "Lost NBA Finals";
    default: return finish;
  }
}

import type { FootballCanonicalSubject } from "./footballFactualStatsCatalog";
import type { FootballRecognizabilityTier } from "./footballSubjectEligibility";

export interface FootballHistoricalProgramEraSeed {
  id: string;
  name: string;
  school: string;
  startSeason: number;
  endSeason: number;
  titleSelectionSeasons: readonly number[];
  tier: Extract<FootballRecognizabilityTier, "A" | "B">;
}

const activeDecades = (startSeason: number, endSeason: number) => Array.from(
  { length: Math.floor(endSeason / 10) - Math.floor(startSeason / 10) + 1 },
  (_, index) => (Math.floor(startSeason / 10) + index) * 10,
);

/**
 * Reviewed historical CFB era identities derived from the official NCAA FBS championship-history table.
 * The seed owns only recognition identity, bounded era windows, and NCAA title-selection seasons.
 * It does not assert a subjective "dynasty" label or invent wins/losses outside source coverage.
 */
export const footballHistoricalProgramEraSeeds: readonly FootballHistoricalProgramEraSeed[] = [
  { id: "minnesota-1936-1941", name: "Minnesota 1936–1941", school: "Minnesota", startSeason: 1936, endSeason: 1941, titleSelectionSeasons: [1936, 1940, 1941], tier: "A" },
  { id: "notre-dame-1943-1949", name: "Notre Dame 1943–1949", school: "Notre Dame", startSeason: 1943, endSeason: 1949, titleSelectionSeasons: [1943, 1946, 1947, 1949], tier: "A" },
  { id: "army-1944-1945", name: "Army 1944–1945", school: "Army", startSeason: 1944, endSeason: 1945, titleSelectionSeasons: [1944, 1945], tier: "A" },
  { id: "oklahoma-1955-1956", name: "Oklahoma 1955–1956", school: "Oklahoma", startSeason: 1955, endSeason: 1956, titleSelectionSeasons: [1955, 1956], tier: "A" },
  { id: "alabama-1961-1965", name: "Alabama 1961–1965", school: "Alabama", startSeason: 1961, endSeason: 1965, titleSelectionSeasons: [1961, 1964, 1965], tier: "A" },
  { id: "nebraska-1970-1971", name: "Nebraska 1970–1971", school: "Nebraska", startSeason: 1970, endSeason: 1971, titleSelectionSeasons: [1970, 1971], tier: "A" },
  { id: "usc-1972-1978", name: "USC 1972–1978", school: "USC", startSeason: 1972, endSeason: 1978, titleSelectionSeasons: [1972, 1974, 1978], tier: "A" },
  { id: "oklahoma-1974-1975", name: "Oklahoma 1974–1975", school: "Oklahoma", startSeason: 1974, endSeason: 1975, titleSelectionSeasons: [1974, 1975], tier: "A" },
  { id: "alabama-1978-1979", name: "Alabama 1978–1979", school: "Alabama", startSeason: 1978, endSeason: 1979, titleSelectionSeasons: [1978, 1979], tier: "A" },
  { id: "penn-state-1982-1986", name: "Penn State 1982–1986", school: "Penn State", startSeason: 1982, endSeason: 1986, titleSelectionSeasons: [1982, 1986], tier: "B" },
  { id: "miami-1983-1991", name: "Miami 1983–1991", school: "Miami", startSeason: 1983, endSeason: 1991, titleSelectionSeasons: [1983, 1987, 1989, 1991], tier: "A" },
  { id: "nebraska-1994-1997", name: "Nebraska 1994–1997", school: "Nebraska", startSeason: 1994, endSeason: 1997, titleSelectionSeasons: [1994, 1995, 1997], tier: "A" },
] as const;

export const footballHistoricalProgramEraSubjects: readonly FootballCanonicalSubject[] =
  footballHistoricalProgramEraSeeds.map((seed) => ({
    id: seed.id,
    name: seed.name,
    kind: "program-era",
    league: "CFB",
    school: seed.school,
    startSeason: seed.startSeason,
    endSeason: seed.endSeason,
    activeDecades: activeDecades(seed.startSeason, seed.endSeason),
  }));

const seedById = new Map(footballHistoricalProgramEraSeeds.map((seed) => [seed.id, seed]));

export function footballHistoricalProgramEraRecognitionFor(subject: FootballCanonicalSubject) {
  if (subject.kind !== "program-era" || subject.league !== "CFB") return null;
  return seedById.get(subject.id) ?? null;
}

import type { SpotlightStatsFighter } from "../../../src/features/picks/spotlightContent.ts";

export type UfcStatsSnapshotFighter = Omit<SpotlightStatsFighter, "fighterSlug">;

// Canonical checked-in UFCStats snapshot for the fights currently eligible for
// owner-authored Spotlights. Values are copied from the fighters' UFCStats
// profiles so Spotlight creation does not depend on UFCStats uptime.
const fighters: Record<string, UfcStatsSnapshotFighter> = {
  "islam makhachev": {
    name: "Islam Makhachev",
    record: "28-1-0",
    dob: "1991-10-27",
    height: "5' 10\"",
    reach: "70\"",
    stance: "Southpaw",
    slpm: 2.45,
    strikingAccuracy: 58,
    sapm: 1.45,
    strikingDefense: 61,
    takedownAverage: 3.1,
    takedownAccuracy: 56,
    takedownDefense: 91,
    submissionAverage: 1.0,
  },
  "ian machado garry": {
    name: "Ian Machado Garry",
    record: "17-1-0",
    dob: "1997-11-17",
    height: "6' 3\"",
    reach: "74\"",
    stance: "Orthodox",
    slpm: 4.78,
    strikingAccuracy: 54,
    sapm: 2.86,
    strikingDefense: 52,
    takedownAverage: 0.92,
    takedownAccuracy: 31,
    takedownDefense: 80,
    submissionAverage: 0.4,
  },
  "mackenzie dern": {
    name: "Mackenzie Dern",
    record: "16-5-0",
    dob: "1993-03-24",
    height: "5' 4\"",
    reach: "63\"",
    stance: "Orthodox",
    slpm: 3.47,
    strikingAccuracy: 41,
    sapm: 3.93,
    strikingDefense: 51,
    takedownAverage: 0.93,
    takedownAccuracy: 18,
    takedownDefense: 37,
    submissionAverage: 1.1,
  },
  "gillian robertson": {
    name: "Gillian Robertson",
    record: "17-8-0",
    dob: "1995-05-17",
    height: "5' 5\"",
    reach: "63\"",
    stance: "Orthodox",
    slpm: 2.71,
    strikingAccuracy: 48,
    sapm: 2.86,
    strikingDefense: 56,
    takedownAverage: 2.76,
    takedownAccuracy: 40,
    takedownDefense: 38,
    submissionAverage: 0.9,
  },
  "anthony hernandez": {
    name: "Anthony Hernandez",
    record: "15-3-0 (1 NC)",
    dob: "1993-10-18",
    height: "6' 0\"",
    reach: "75\"",
    stance: "Orthodox",
    slpm: 4.57,
    strikingAccuracy: 60,
    sapm: 3.1,
    strikingDefense: 51,
    takedownAverage: 5.88,
    takedownAccuracy: 48,
    takedownDefense: 68,
    submissionAverage: 1.6,
  },
  "gregory rodrigues": {
    name: "Gregory Rodrigues",
    record: "19-6-0",
    dob: "1992-02-17",
    height: "6' 3\"",
    reach: "75\"",
    stance: "Orthodox",
    slpm: 5.53,
    strikingAccuracy: 51,
    sapm: 4.78,
    strikingDefense: 50,
    takedownAverage: 1.9,
    takedownAccuracy: 34,
    takedownDefense: 75,
    submissionAverage: 0.4,
  },
};

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getUfcStatsSnapshotFighter(name: string) {
  return fighters[normalizeName(name)] ?? null;
}

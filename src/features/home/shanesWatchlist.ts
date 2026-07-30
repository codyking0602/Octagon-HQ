export type ShaneWatchStatus = "Rising" | "Holding" | "Concern" | "Inactive";

export interface ShaneWatchFighter {
  id: string;
  rank: number;
  previousRank: number | null;
  name: string;
  nickname: string;
  status: ShaneWatchStatus;
  added: string;
  lastReviewed: string;
  division: string;
  age: number;
  country: string;
  proRecord: string;
  ufcRecord: string;
  winStreak: string;
  finishes: string;
  highlight: string;
  scoutingNote: string;
  comparison: string;
  photoUrl: string | null;
  ufcUrl: string;
}

export interface ShaneFormerPick {
  id: string;
  name: string;
  peakRank: number;
  added: string;
  removed: string;
  exitNote: string;
}

export function watchMovement(fighter: ShaneWatchFighter) {
  if (fighter.previousRank === null) return { label: "NEW", direction: "new" } as const;
  if (fighter.previousRank > fighter.rank) {
    return { label: `↑${fighter.previousRank - fighter.rank}`, direction: "up" } as const;
  }
  if (fighter.previousRank < fighter.rank) {
    return { label: `↓${fighter.rank - fighter.previousRank}`, direction: "down" } as const;
  }
  return { label: "—", direction: "same" } as const;
}

export const shanesWatchlist = {
  curator: "Shane",
  title: "Shane’s Fighters to Watch",
  subtitle: "A living Top 15 of early prospect calls, updated as their careers progress.",
  capacity: 15,
  lastUpdated: "July 2026",
  fighters: [
    {
      id: "gable-steveson",
      rank: 1,
      previousRank: null,
      name: "Gable Steveson",
      nickname: "",
      status: "Rising",
      added: "July 2026",
      lastReviewed: "July 2026",
      division: "Heavyweight",
      age: 26,
      country: "United States",
      proRecord: "4–0",
      ufcRecord: "1–0",
      winStreak: "4",
      finishes: "4",
      highlight: "First-round UFC debut knockout",
      scoutingNote: "Olympic wrestling with heavyweight explosiveness. He has the highest ceiling on the board.",
      comparison: "Justin Gaethje",
      photoUrl: null,
      ufcUrl: "https://www.ufc.com/athlete/gable-steveson",
    },
    {
      id: "fatima-kline",
      rank: 2,
      previousRank: 1,
      name: "Fatima Kline",
      nickname: "The Archangel",
      status: "Rising",
      added: "July 2026",
      lastReviewed: "July 2026",
      division: "Women’s Strawweight",
      age: 26,
      country: "United States",
      proRecord: "10–1",
      ufcRecord: "4–1",
      winStreak: "4",
      finishes: "5",
      highlight: "Four straight UFC wins",
      scoutingNote: "Fighter to watch: The Archangel.",
      comparison: "",
      photoUrl: "/assets/fighters/fatima-kline-thumb.webp",
      ufcUrl: "https://www.ufc.com/athlete/fatima-kline",
    },
    {
      id: "abdul-rakhman-yakhyaev",
      rank: 3,
      previousRank: 2,
      name: "Abdul Rakhman Yakhyaev",
      nickname: "The Hunter",
      status: "Rising",
      added: "July 2026",
      lastReviewed: "July 2026",
      division: "Light Heavyweight",
      age: 25,
      country: "Türkiye",
      proRecord: "10–0",
      ufcRecord: "3–0",
      winStreak: "10",
      finishes: "9",
      highlight: "8-second UFC knockout",
      scoutingNote: "This guy could be the real deal.",
      comparison: "Khamzat Chimaev",
      photoUrl: "/assets/fighters/abdul-rakhman-yakhyaev-thumb.webp",
      ufcUrl: "https://www.ufc.com/athlete/abdulrakhman-yakhyaev",
    },
    {
      id: "daniil-donchenko",
      rank: 4,
      previousRank: 3,
      name: "Daniil Donchenko",
      nickname: "",
      status: "Rising",
      added: "July 2026",
      lastReviewed: "July 2026",
      division: "Welterweight",
      age: 24,
      country: "Ukraine",
      proRecord: "15–2",
      ufcRecord: "3–0",
      winStreak: "8",
      finishes: "12",
      highlight: "10 knockouts · 2 submissions",
      scoutingNote: "A young welterweight with an unbeaten UFC start and real finishing momentum.",
      comparison: "",
      photoUrl: "/assets/fighters/daniil-donchenko-thumb.webp",
      ufcUrl: "https://www.ufc.com/athlete/daniil-donchenko",
    },
  ] satisfies ShaneWatchFighter[],
  formerFighters: [] as ShaneFormerPick[],
};

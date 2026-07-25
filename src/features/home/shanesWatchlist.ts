export interface ShaneWatchFighter {
  id: string;
  name: string;
  nickname: string;
  status: string;
  added: string;
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
  photoUrl: string;
  ufcUrl: string;
}

export const shanesWatchlist = {
  curator: "Shane",
  title: "Shane’s Fighters to Watch",
  subtitle: "Early prospect calls, tracked from the moment Shane picked them.",
  fighters: [
    {
      id: "fatima-kline",
      name: "Fatima Kline",
      nickname: "The Archangel",
      status: "Latest call",
      added: "July 2026",
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
      name: "Abdul Rakhman Yakhyaev",
      nickname: "The Hunter",
      status: "On the rise",
      added: "July 2026",
      division: "Light Heavyweight",
      age: 25,
      country: "Türkiye",
      proRecord: "10–0",
      ufcRecord: "3–0",
      winStreak: "10",
      finishes: "9",
      highlight: "8-second UFC knockout",
      scoutingNote: "This guy could be the real deal.",
      comparison: "Magomed Ankalaev",
      photoUrl: "/assets/fighters/abdul-rakhman-yakhyaev-thumb.webp",
      ufcUrl: "https://www.ufc.com/athlete/abdulrakhman-yakhyaev",
    },
    {
      id: "daniil-donchenko",
      name: "Daniil Donchenko",
      nickname: "",
      status: "Watching",
      added: "July 2026",
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
} as const;

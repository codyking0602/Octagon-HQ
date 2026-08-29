export type ShaneWatchStatus = "Rising" | "Holding" | "Concern" | "Inactive";
export type ShaneWatchPronoun = "he" | "she";

export interface ShaneWatchFighter {
  id: string;
  rank: number;
  previousRank: number | null;
  name: string;
  nickname: string;
  status: ShaneWatchStatus;
  subjectPronoun: ShaneWatchPronoun;
  added: string;
  lastReviewed: string;
  division: string;
  age: number;
  country: string;
  ufcRecord: string;
  ufcWinStreak: string;
  ufcFinishes: string;
  whyOnBoard: string;
  boardNote: string;
  scoutingSnapshot: string;
  photoUrl: string | null;
  videoUrl: string;
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
  title: "Shane King’s Contender Series",
  subtitle: "A living Top 15 of UFC prospects to watch as their careers develop.",
  capacity: 15,
  lastUpdated: "August 2026",
  fighters: [
    {
      id: "gable-steveson",
      rank: 1,
      previousRank: 1,
      name: "Gable Steveson",
      nickname: "",
      status: "Rising",
      subjectPronoun: "he",
      added: "July 2026",
      lastReviewed: "August 2026",
      division: "Heavyweight",
      age: 26,
      country: "United States",
      ufcRecord: "1–0",
      ufcWinStreak: "1",
      ufcFinishes: "1",
      whyOnBoard: "Olympic-level wrestling with a first-round knockout in his UFC debut.",
      boardNote: "Olympic wrestling with heavyweight explosiveness. He has the highest ceiling on the board.",
      scoutingSnapshot: "Steveson brings an Olympic-level wrestling base and rare explosiveness to heavyweight, but his UFC debut showed he doesn’t need to wrestle just to be dangerous. He overwhelmed Elisha Ellison with offense and scored a first-round knockout at 2:31, moving to 1–0 in the UFC. The upside is obvious, but with only one Octagon appearance, he’s still the biggest projection on Shane’s board.",
      photoUrl: "/assets/fighters/gable-steveson-thumb.webp",
      videoUrl: "https://youtube.com/shorts/2V8eGAiUZaU?is=b2fwdTJ5f9m1LVZ5",
    },
    {
      id: "quillan-salkilld",
      rank: 2,
      previousRank: null,
      name: "Quillan Salkilld",
      nickname: "",
      status: "Rising",
      subjectPronoun: "he",
      added: "August 2026",
      lastReviewed: "August 2026",
      division: "Lightweight",
      age: 26,
      country: "Australia",
      ufcRecord: "6–0",
      ufcWinStreak: "6",
      ufcFinishes: "5",
      whyOnBoard: "A 6–0 UFC start capped by a first-round submission of Mateusz Gamrot.",
      boardNote: "Long, composed and dangerous everywhere, Salkilld looks like a lightweight built to climb the rankings fast.",
      scoutingSnapshot: "Salkilld has quickly shown one of the most complete games among the UFC’s young lightweights, with the ability to hurt opponents standing or take over a grappling exchange. He’s now 6–0 in the UFC with five finishes, including back-to-back wins over Beneil Dariush and Mateusz Gamrot—the latter coming by rear-naked choke against one of the division’s most accomplished grapplers. At this point he’s gone beyond being an interesting prospect; he’s starting to look like a legitimate threat near the top of the division.",
      photoUrl: "/assets/fighters/quillan-salkilld-thumb.webp",
      videoUrl: "https://youtube.com/shorts/ivb3NbPsnYg?is=y2ti4vYuCvUdFroV",
    },
    {
      id: "abdul-rakhman-yakhyaev",
      rank: 3,
      previousRank: 4,
      name: "Abdul Rakhman Yakhyaev",
      nickname: "The Hunter",
      status: "Rising",
      subjectPronoun: "he",
      added: "July 2026",
      lastReviewed: "August 2026",
      division: "Light Heavyweight",
      age: 25,
      country: "Türkiye",
      ufcRecord: "3–0",
      ufcWinStreak: "3",
      ufcFinishes: "3",
      whyOnBoard: "Three straight first-round UFC finishes, including an eight-second knockout.",
      boardNote: "This guy could be the real deal.",
      scoutingSnapshot: "Yakhyaev has been pure destruction through his first three UFC fights, attacking aggressively without sacrificing the ability to finish on the ground. All three wins have ended in the first round—two by rear-naked choke and his latest by an eight-second knockout of Julius Walker. We still haven’t seen what happens when somebody drags him into a difficult, extended fight, but so far nobody in the UFC has come close to making him show it.",
      photoUrl: "/assets/fighters/abdul-rakhman-yakhyaev-thumb.webp",
      videoUrl: "https://youtube.com/shorts/k5En_QDBACA?is=KeKmxuwmh7N1yb1N",
    },
    {
      id: "bilal-hasan",
      rank: 4,
      previousRank: 5,
      name: "Bilal Hasan",
      nickname: "The IndoNinja",
      status: "Rising",
      subjectPronoun: "he",
      added: "August 2026",
      lastReviewed: "August 2026",
      division: "Flyweight",
      age: 25,
      country: "Indonesia",
      ufcRecord: "1–0",
      ufcWinStreak: "1",
      ufcFinishes: "1",
      whyOnBoard: "A 10–0 flyweight who followed a 45-second Contender Series TKO with a second-round knockout in his UFC debut.",
      boardNote: "Statement UFC debut. He knocked out Nilson Rojas with a right hand at 2:28 of Round 2 and moves up to #4.",
      scoutingSnapshot: "Hasan is now 10–0 overall and 1–0 in the UFC after knocking out Nilson Rojas with a right hand at 2:28 of Round 2 in Shanghai. The debut backed up the finishing instincts that earned him a contract with a 45-second Contender Series stoppage of Mridul Saikia. He still has plenty to prove against established UFC flyweights, but the first Octagon sample was a strong one: speed, creativity and clean finishing power against another unbeaten prospect.",
      photoUrl: "/assets/fighters/bilal-hasan-thumb.webp",
      videoUrl: "https://youtube.com/shorts/AIW7VVg4N4g?is=Zagfzf_n_J80-Ard",
    },
    {
      id: "fatima-kline",
      rank: 5,
      previousRank: 3,
      name: "Fatima Kline",
      nickname: "The Archangel",
      status: "Rising",
      subjectPronoun: "she",
      added: "July 2026",
      lastReviewed: "August 2026",
      division: "Women’s Strawweight",
      age: 26,
      country: "United States",
      ufcRecord: "4–1",
      ufcWinStreak: "4",
      ufcFinishes: "2",
      whyOnBoard: "Four straight UFC wins with victories over Angela Hill and Tabatha Ricci.",
      boardNote: "A fast-rising strawweight whose game keeps looking more complete against better UFC competition.",
      scoutingSnapshot: "Kline has developed into a remarkably well-rounded strawweight, blending sharp striking with increasingly effective wrestling and physicality. Since dropping her UFC debut, she has won four straight inside the Octagon, including convincing decisions over experienced contenders Angela Hill and Tabatha Ricci. The most encouraging part is that she keeps finding different ways to control fights, making her look less like a prospect with one standout weapon and more like a future contender.",
      photoUrl: "/assets/fighters/fatima-kline-thumb.webp",
      videoUrl: "https://youtu.be/E3Eat8_BBjM?is=69fExP5AoinR5Xdt",
    },
    {
      id: "daniil-donchenko",
      rank: 6,
      previousRank: 4,
      name: "Daniil Donchenko",
      nickname: "",
      status: "Rising",
      subjectPronoun: "he",
      added: "July 2026",
      lastReviewed: "August 2026",
      division: "Welterweight",
      age: 24,
      country: "Ukraine",
      ufcRecord: "3–0",
      ufcWinStreak: "3",
      ufcFinishes: "2",
      whyOnBoard: "A 3–0 UFC start with two finishes and a decision win over Alex Morono.",
      boardNote: "A young welterweight with an unbeaten UFC start and real finishing momentum.",
      scoutingSnapshot: "Donchenko is an aggressive, high-output kickboxer who puts opponents under constant pressure without taking nearly as much damage back. He’s opened his UFC career 3–0, finishing Rodrigo Sezinando and Theodor Berggren while also showing he could comfortably go the distance against veteran Alex Morono. The combination of pace, accuracy and finishing ability makes him especially interesting at just 24, with the next step being proving it against the division’s ranked welterweights.",
      photoUrl: "/assets/fighters/daniil-donchenko-thumb.webp",
      videoUrl: "https://youtube.com/shorts/hAPpKy3ZALk?is=MWDtVBsFxcT0IV2L",
    },
  ] satisfies ShaneWatchFighter[],
  formerFighters: [] as ShaneFormerPick[],
};

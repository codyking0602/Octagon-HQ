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
  lastUpdated: "October 2026",
  fighters: [
    {
      id: "quillan-salkilld",
      rank: 1,
      previousRank: 1,
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
      id: "raul-rosas-jr",
      rank: 2,
      previousRank: 2,
      name: "Raul Rosas Jr.",
      nickname: "El Nino Problema",
      status: "Rising",
      subjectPronoun: "he",
      added: "September 2026",
      lastReviewed: "September 2026",
      division: "Bantamweight",
      age: 21,
      country: "United States",
      ufcRecord: "6–1",
      ufcWinStreak: "5",
      ufcFinishes: "3",
      whyOnBoard: "A five-fight UFC win streak capped by a dominant unanimous decision over veteran contender Rob Font.",
      boardNote: "Still only 21, already ranked, and his wrestling pressure keeps translating against better competition.",
      scoutingSnapshot: "Rosas has turned the lone loss of his UFC run into five straight wins and the best victory of his career. At UFC 326 he repeatedly grounded veteran Rob Font on the way to a unanimous 30–27 sweep, moving to 6–1 in the UFC and into the bantamweight rankings. He is still only 21, and the combination of chain wrestling, back-taking pressure and rapid improvement gives him one of the clearest long-term ceilings on Shane’s board.",
      photoUrl: "/assets/fighters/raul-rosas-jr-thumb.webp",
      videoUrl: "https://youtu.be/Nf6Kb6c3uq8?si=fN5vhUPEhtkHbBto",
    },
    {
      id: "abdul-rakhman-yakhyaev",
      rank: 3,
      previousRank: 3,
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
      previousRank: 4,
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
      whyOnBoard: "A statement UFC debut capped by a second-round knockout of unbeaten Nilson Rojas.",
      boardNote: "One UFC fight, one clean knockout. The debut backed up the Contender Series hype.",
      scoutingSnapshot: "Hasan entered the UFC unbeaten after earning his contract with a 45-second Contender Series TKO, then immediately validated the hype in Shanghai. Nilson Rojas gave him real resistance early, but Hasan stayed composed and ended the fight with a clean right hand at 2:28 of Round 2. He is now 1–0 in the UFC with one finish, and the combination of speed, creativity and real knockout power makes him one of the fastest-rising names on Shane’s board.",
      photoUrl: "/assets/fighters/bilal-hasan-thumb.webp",
      videoUrl: "https://youtu.be/qj6dK0cfWds?si=02KWqe1Vj2WAwbiP",
    },
    {
      id: "fatima-kline",
      rank: 5,
      previousRank: 6,
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
      previousRank: 7,
      name: "Daniil Donchenko",
      nickname: "",
      status: "Rising",
      subjectPronoun: "he",
      added: "July 2026",
      lastReviewed: "September 2026",
      division: "Welterweight",
      age: 25,
      country: "Ukraine",
      ufcRecord: "4–0",
      ufcWinStreak: "4",
      ufcFinishes: "2",
      whyOnBoard: "A 4–0 UFC start capped by a dominant decision over Punahele Soriano in Paris.",
      boardNote: "Still #6 after a mature three-round win over Soriano. He keeps showing he can win even when the finish does not come.",
      scoutingSnapshot: "Donchenko keeps adding layers to the pressure-heavy kickboxing that first put him on Shane’s board. After stopping Theodor Berggren in June, he went to Paris and controlled Punahele Soriano over three rounds for a unanimous decision, moving to 4–0 in the UFC. At 25, the pace, accuracy and improved composure make him one of the more complete young welterweights on the board, even with the next jump in competition still ahead.",
      photoUrl: "/assets/fighters/daniil-donchenko-thumb.webp",
      videoUrl: "https://youtu.be/bAlhi6r7X2U?si=hI6nBaMAqJAKKB5B",
    },
    {
      id: "damian-pinas",
      rank: 7,
      previousRank: null,
      name: "Damian Pinas",
      nickname: "The Baba Yaga",
      status: "Rising",
      subjectPronoun: "he",
      added: "October 2026",
      lastReviewed: "October 2026",
      division: "Middleweight",
      age: 24,
      country: "Aruba",
      ufcRecord: "3–0",
      ufcWinStreak: "3",
      ufcFinishes: "3",
      whyOnBoard: "Three straight first-round UFC knockouts, capped by a 75-second uppercut KO of Andrey Pulyaev at UFC 332.",
      boardNote: "Three UFC fights, three first-round knockouts. The power is real, and the Pulyaev finish earns him a spot at #7.",
      scoutingSnapshot: "Pinas has turned his UFC arrival into three straight first-round knockouts, and the latest was his loudest statement yet. At UFC 332, the 24-year-old flattened Andrey Pulyaev with a right uppercut just 75 seconds into Round 1, following first-round finishes of Wes Schultz and Cesar Almeida. He is now 3–0 in the UFC, and the combination of patient pressure, long-range power and genuine one-shot danger is enough for Shane to put him directly at #7.",
      photoUrl: "/assets/fighters/damian-pinas-thumb.webp",
      videoUrl: "https://youtu.be/R0ezmb8925I?is=YLuGZgdBomuHdQ7l",
    },
    {
      id: "ty-miller",
      rank: 8,
      previousRank: 8,
      name: "Ty Miller",
      nickname: "Thriller",
      status: "Rising",
      subjectPronoun: "he",
      added: "September 2026",
      lastReviewed: "September 2026",
      division: "Welterweight",
      age: 26,
      country: "United States",
      ufcRecord: "2–0",
      ufcWinStreak: "2",
      ufcFinishes: "2",
      whyOnBoard: "An unbeaten welterweight who opened his UFC run with back-to-back knockouts of Adam Fugitt and Billy Ray Goff.",
      boardNote: "Long, busy boxer with real finishing pop. Two UFC fights, two knockouts.",
      scoutingSnapshot: "Miller earned his UFC contract with a unanimous decision over Jimmy Drago on the 2025 Contender Series, then turned his first two UFC appearances into knockouts. He stopped Adam Fugitt at 4:59 of Round 1 and Billy Ray Goff just 15 seconds into Round 3, moving to 2–0 in the UFC and 8–0 overall. At 6'2\" with a 77.5-inch reach and a boxing-first game, he gives Shane’s board another young welterweight with size, volume and real finishing upside.",
      photoUrl: "/assets/fighters/ty-miller-thumb.webp",
      videoUrl: "https://youtu.be/wodu318-nm0?si=KYM3qd6RKriviD6U",
    },
    {
      id: "ateba-gautier",
      rank: 9,
      previousRank: 5,
      name: "Ateba Gautier",
      nickname: "The Storm",
      status: "Concern",
      subjectPronoun: "he",
      added: "October 2026",
      lastReviewed: "October 2026",
      division: "Middleweight",
      age: 24,
      country: "Cameroon",
      ufcRecord: "5–1",
      ufcWinStreak: "0",
      ufcFinishes: "4",
      whyOnBoard: "A 5–1 UFC start with four knockouts and elite physical tools, now facing his first major reset after a Round 1 TKO loss to Roman Kopylov.",
      boardNote: "Still a serious physical talent, but the Kopylov loss was a real step-back. Now we need to see the response.",
      scoutingSnapshot: "Gautier’s unbeaten UFC run ended at UFC 332 when Roman Kopylov stopped him by TKO at 3:12 of Round 1. The 24-year-old still owns rare middleweight size and real finishing power, with four knockouts in his first five UFC wins, but the Kopylov step-up exposed a meaningful defensive checkpoint against experienced opposition. Shane keeps him on the board because the physical ceiling is still high, but the loss drops him to #9 until he shows how he responds.",
      photoUrl: "/assets/fighters/ateba-gautier-thumb.webp",
      videoUrl: "https://youtube.com/shorts/NwjKZahYvbw?is=PXQ2DXkjJvRt8bVm",
    },
    {
      id: "gable-steveson",
      rank: 10,
      previousRank: 9,
      name: "Gable Steveson",
      nickname: "",
      status: "Concern",
      subjectPronoun: "he",
      added: "July 2026",
      lastReviewed: "September 2026",
      division: "Heavyweight",
      age: 26,
      country: "United States",
      ufcRecord: "1–1",
      ufcWinStreak: "0",
      ufcFinishes: "1",
      whyOnBoard: "Olympic-gold wrestling still gives him rare upside, but a 12-second knockout loss to Sean Sharaf resets the projection.",
      boardNote: "The wrestling ceiling is still elite, but the Sharaf loss means he has to rebuild from the bottom of the board.",
      scoutingSnapshot: "Steveson’s Olympic wrestling still gives him an unmatched base for a heavyweight prospect, and his UFC debut showed real finishing explosiveness. That projection took a major hit at UFC 331 when Sean Sharaf knocked him out with a left hand just 12 seconds into Round 1, dropping Steveson to 1–1 in the UFC. He stays on Shane’s board because the wrestling ceiling remains rare, but he falls to the bottom until he shows how he responds to the first major setback of his MMA career.",
      photoUrl: "/assets/fighters/gable-steveson-thumb.webp",
      videoUrl: "https://youtube.com/shorts/2V8eGAiUZaU?is=b2fwdTJ5f9m1LVZ5",
    },
    {
      id: "alice-pereira",
      rank: 11,
      previousRank: null,
      name: "Alice Pereira",
      nickname: "Golden Girl",
      status: "Rising",
      subjectPronoun: "she",
      added: "October 2026",
      lastReviewed: "October 2026",
      division: "Women’s Bantamweight",
      age: 20,
      country: "Brazil",
      ufcRecord: "2–1",
      ufcWinStreak: "2",
      ufcFinishes: "2",
      whyOnBoard: "At just 20 years old and 8–1 as a professional, she stopped UFC #15 Daria Zhelezniakova after one round with damaging ground-and-pound elbows.",
      boardNote: "Only 20, already beat a ranked bantamweight. The first-round stoppage over #15 earns the Golden Girl a spot at #11.",
      scoutingSnapshot: "Pereira became the youngest woman to compete in the UFC and has already built an 8–1 professional record behind her sharp kickboxing and finishing instincts. After dropping a split decision in her UFC debut, she knocked out Hailey Cowan in Round 2 and then overwhelmed #15 Daria Zhelezniakova with elbows on the ground at UFC Vegas 122; Zhelezniakova could not continue after the first round. Now 2–1 in the UFC with two consecutive stoppage wins, the 20-year-old Brazilian has earned #11 on Shane’s board, with plenty of room to develop against deeper competition.",
      photoUrl: "https://gidstats.com/img/fighters/0/0/2-1505.png",
      videoUrl: "https://www.sherdog.com/videos/highlightreels/UFC-Vegas-122-highlight-video-Alice-Pereira-opens-up-nasty-cut-on-Darya-Zheleznyakova-23840",
    },
  ] satisfies ShaneWatchFighter[],
  formerFighters: [] as ShaneFormerPick[],
};

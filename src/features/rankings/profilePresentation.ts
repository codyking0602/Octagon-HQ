import { categoryBoard, type CategoryGender, type RankingCategory } from "./rankingControls";
import { categoryDisplayRating } from "./rankingDisplay";
import type { RankingFighter } from "./rankingModel";

export type ProfileCategoryKey = RankingCategory;

export const profileCategories = [
  {
    key: "championship",
    label: "Championship Resume",
    description: "UFC championship wins, title-fight success, and sustained control at the top.",
    whatItMeans: "Measures sustained UFC championship accomplishment through title-fight wins, championship record, reign strength, and repeated control at the top.",
  },
  {
    key: "opponentQuality",
    label: "Quality Wins",
    description: "Elite UFC wins, top-five victories, opponent timing, and divisional strength.",
    whatItMeans: "Rewards elite UFC wins based on opponent level, timing, divisional strength, and whether the opponent was still near their prime.",
  },
  {
    key: "primeDominance",
    label: "Prime Dominance",
    description: "Prime winning, round control, finishes, separation, and durability.",
    whatItMeans: "Measures how thoroughly the fighter controlled UFC opponents during the approved prime window through winning, rounds, finishes, and durability.",
  },
  {
    key: "longevity",
    label: "Elite Longevity",
    description: "How long the fighter repeatedly proved elite UFC status.",
    whatItMeans: "Measures how long the fighter repeatedly proved elite UFC status, rather than simply counting calendar years on the roster.",
  },
  {
    key: "apexPeak",
    label: "Peak Apex",
    description: "The fighter’s strongest two-performance UFC stretch.",
    whatItMeans: "Grades the fighter’s strongest two-performance UFC stretch using opponent quality, stakes, separation, proof, and championship-level aura.",
  },
  {
    key: "penalty",
    label: "Loss Context",
    description: "How much competitive UFC losses damage the resume after context.",
    whatItMeans: "Measures how much competitive UFC losses damage the resume after accounting for career timing, opponent quality, finishes, and division changes.",
  },
] as const;

export type ProfileCategory = (typeof profileCategories)[number];

const profileDisplayNameBySlug: Record<string, string> = {
  "jon-jones": "Jon “Bones” Jones",
  "georges-st-pierre": "Georges “Rush” St-Pierre",
  "demetrious-johnson": "Demetrious “Mighty Mouse” Johnson",
  "anderson-silva": "Anderson “The Spider” Silva",
  "khabib-nurmagomedov": "Khabib “The Eagle” Nurmagomedov",
  "daniel-cormier": "Daniel “DC” Cormier",
  "amanda-nunes": "Amanda “The Lioness” Nunes",
  "valentina-shevchenko": "Valentina “Bullet” Shevchenko",
  "israel-adesanya": "Israel “The Last Stylebender” Adesanya",
  "charles-oliveira": "Charles “Do Bronx” Oliveira",
  "chan-sung-jung": "“The Korean Zombie” Chan Sung Jung",
  "mauricio-rua": "Maurício “Shogun” Rua",
  "brandon-moreno": "Brandon “The Assassin Baby” Moreno",
  "anthony-pettis": "Anthony “Showtime” Pettis",
  "alex-pantoja": "Alexandre “The Cannibal” Pantoja",
  "alex-pereira": "Alex “Poatan” Pereira",
  "alexander-volkanovski": "Alexander “The Great” Volkanovski",
  "aljamain-sterling": "Aljamain “Funk Master” Sterling",
  "benson-henderson": "Benson “Smooth” Henderson",
  "bj-penn": "B.J. “The Prodigy” Penn",
  "carla-esparza": "Carla “Cookie Monster” Esparza",
  "chael-sonnen": "Chael “The American Gangster” Sonnen",
  "chris-weidman": "Chris “The All-American” Weidman",
  "chuck-liddell": "Chuck “The Iceman” Liddell",
  "conor-mcgregor": "Conor “The Notorious” McGregor",
  "dan-henderson": "Dan “Hendo” Henderson",
  "deiveson-figueiredo": "Deiveson “Deus da Guerra” Figueiredo",
  "dominick-cruz": "Dominick “The Dominator” Cruz",
  "dricus-du-plessis": "Dricus “Stillknocks” du Plessis",
  "dustin-poirier": "Dustin “The Diamond” Poirier",
  "fabricio-werdum": "Fabricio “Vai Cavalo” Werdum",
  "francis-ngannou": "Francis “The Predator” Ngannou",
  "frankie-edgar": "Frankie “The Answer” Edgar",
  "henry-cejudo": "Henry “Triple C” Cejudo",
  "holly-holm": "Holly “The Preacher’s Daughter” Holm",
  "ilia-topuria": "Ilia “El Matador” Topuria",
  "jessica-andrade": "Jéssica “Bate Estaca” Andrade",
  "julianna-pena": "Julianna “The Venezuelan Vixen” Peña",
  "junior-dos-santos": "Junior “Cigano” dos Santos",
  "justin-gaethje": "Justin “The Highlight” Gaethje",
  "kamaru-usman": "Kamaru “The Nigerian Nightmare” Usman",
  "khamzat-chimaev": "Khamzat “Borz” Chimaev",
  "leon-edwards": "Leon “Rocky” Edwards",
  "lyoto-machida": "Lyoto “The Dragon” Machida",
  "max-holloway": "Max “Blessed” Holloway",
  "merab-dvalishvili": "Merab “The Machine” Dvalishvili",
  "michael-bisping": "Michael “The Count” Bisping",
  "miesha-tate": "Miesha “Cupcake” Tate",
  "paddy-pimblett": "Paddy “The Baddy” Pimblett",
  "petr-yan": "Petr “No Mercy” Yan",
  "quinton-jackson": "Quinton “Rampage” Jackson",
  "randy-couture": "Randy “The Natural” Couture",
  "rashad-evans": "“Suga” Rashad Evans",
  "robbie-lawler": "“Ruthless” Robbie Lawler",
  "robert-whittaker": "Robert “The Reaper” Whittaker",
  "ronda-rousey": "“Rowdy” Ronda Rousey",
  "rose-namajunas": "“Thug” Rose Namajunas",
  "sean-omalley": "Sean “Suga” O’Malley",
  "sean-strickland": "Sean “Tarzan” Strickland",
  "shogun-rua": "Maurício “Shogun” Rua",
  "tito-ortiz": "Tito “The Huntington Beach Bad Boy” Ortiz",
  "tony-ferguson": "Tony “El Cucuy” Ferguson",
  "tyron-woodley": "Tyron “The Chosen One” Woodley",
  "vitor-belfort": "Vitor “The Phenom” Belfort",
  "zhang-weili": "Zhang “Magnum” Weili",
};

export function profileDisplayName(fighter: RankingFighter) {
  return profileDisplayNameBySlug[fighter.slug] ?? fighter.name;
}

export function tierForRating(rating: number) {
  if (rating >= 97) return "Legendary";
  if (rating >= 90) return "Elite";
  if (rating >= 85) return "Great";
  if (rating >= 80) return "Good";
  return "Average";
}

export function relativeStanding(rank: number, boardSize: number) {
  return boardSize <= 1 ? 1 : 1 - (rank - 1) / (boardSize - 1);
}

export function categoryBarFillPercent(rank: number, boardSize: number) {
  return Math.max(10, Math.min(100, Math.round((10 + relativeStanding(rank, boardSize) * 90) * 10) / 10));
}

function genderForFighter(fighter: RankingFighter): CategoryGender {
  return fighter.board === "women" ? "women" : "men";
}

export function profileCategoryRows(fighter: RankingFighter) {
  const gender = genderForFighter(fighter);
  return profileCategories.map((category) => {
    const board = categoryBoard(gender, category.key);
    const rank = board.findIndex((row) => row.slug === fighter.slug) + 1;
    const rating = categoryDisplayRating(gender, category.key, fighter);
    return {
      ...category,
      rating,
      rank,
      boardSize: board.length,
      tier: tierForRating(rating),
      barFillPercent: categoryBarFillPercent(rank, board.length),
      evidence: evidenceForCategory(fighter, category.key),
    };
  });
}

function fmtPct(value: number) {
  return `${value.toFixed(1)}%`;
}

function times(value: number) {
  return value === 1 ? "1 time" : `${value} times`;
}

function evidenceForCategory(fighter: RankingFighter, key: ProfileCategoryKey) {
  const stats = fighter.visibleStats;
  const evidence = fighter.profileEvidence;
  switch (key) {
    case "championship":
      return [
        ["UFC Title-Fight Wins", String(stats.titleFightWins)],
        ["Championship Record", evidence.championshipRecord],
      ];
    case "opponentQuality":
      return [
        ["Top-5 Wins", String(stats.topFiveWins)],
        ["Best UFC Wins", evidence.bestUfcWins],
      ];
    case "primeDominance":
      return [
        ["Prime UFC Record", stats.primeRecord],
        ["Rounds Won", fmtPct(stats.roundsWonPct)],
        ["Finish Rate", fmtPct(stats.finishRatePct)],
        ["Finished During Prime", times(stats.timesFinishedPrime)],
      ];
    case "longevity":
      return [
        ["Active Elite Years", stats.activeEliteYears.toFixed(1)],
        ["Elite Window", evidence.eliteWindow],
      ];
    case "apexPeak":
      return evidence.apexPerformances.slice(0, 2).map((performance) => [performance.opponent, performance.summary]);
    case "penalty":
      return [
        ["Prime Losses", evidence.primeLosses],
        ["Post-Prime Losses", String(evidence.postPrimeLosses)],
      ];
  }
}

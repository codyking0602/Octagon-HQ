import { allTime, categoryRating, type RankingFighter } from "./rankingModel";

export type ProfileCategoryKey = "championship" | "opponentQuality" | "primeDominance" | "longevity" | "penalty";

export const profileCategories = [
  {
    key: "championship",
    label: "Title Reign",
    description: "UFC title-level résumé: championship wins, defenses, two-division value, and sustained title control.",
    whatItMeans: "How much championship weight this fighter built inside the UFC.",
  },
  {
    key: "opponentQuality",
    label: "Quality Wins",
    description: "Elite UFC wins, top-five victories, ranked depth, and prime-opponent value.",
    whatItMeans: "How strong the wins were, with the most credit reserved for elite UFC opposition.",
  },
  {
    key: "primeDominance",
    label: "Prime Dominance",
    description: "Prime winning, round control, finishes, and separation while the fighter was at their best.",
    whatItMeans: "How dominant the fighter looked during the approved UFC prime window.",
  },
  {
    key: "longevity",
    label: "Elite Longevity",
    description: "How long the fighter stayed elite across UFC years, title relevance, and high-level results.",
    whatItMeans: "How much high-end UFC value the fighter sustained over time.",
  },
  {
    key: "penalty",
    label: "Loss Context",
    description: "How clean or damaging the UFC loss ledger is after opponent, timing, and finish context.",
    whatItMeans: "Whether losses meaningfully limit the résumé, especially during prime or title-level windows.",
  },
] as const;

export type ProfileCategory = (typeof profileCategories)[number];

const categoryMaximums: Record<ProfileCategoryKey, number> = {
  championship: 30,
  opponentQuality: 30,
  primeDominance: 30,
  longevity: 30,
  penalty: 20,
};

const nicknameBySlug: Record<string, string> = {
  "jon-jones": "Bones",
  "georges-st-pierre": "Rush",
  "demetrious-johnson": "Mighty Mouse",
  "anderson-silva": "The Spider",
  "khabib-nurmagomedov": "The Eagle",
  "daniel-cormier": "DC",
  "amanda-nunes": "The Lioness",
  "valentina-shevchenko": "Bullet",
  "brandon-moreno": "The Assassin Baby",
  "anthony-pettis": "Showtime",
};

export function profileNickname(fighter: RankingFighter) {
  return nicknameBySlug[fighter.slug] ?? null;
}

export function tierForRating(rating: number) {
  if (rating >= 97) return "Legendary";
  if (rating >= 90) return "Elite";
  if (rating >= 85) return "Great";
  if (rating >= 80) return "Good";
  return "Average";
}

export function categoryBarFillPercent(rank: number, boardSize: number) {
  const relativePosition = boardSize <= 1 ? 1 : 1 - (rank - 1) / (boardSize - 1);
  return Math.max(10, Math.min(100, Math.round((10 + relativePosition * 90) * 10) / 10));
}

function categoryValue(fighter: RankingFighter, key: ProfileCategoryKey) {
  if (key === "penalty") return Math.max(0, 20 + fighter.penalty);
  return fighter[key];
}

export function profileCategoryRows(fighter: RankingFighter) {
  return profileCategories.map((category) => {
    const board = allTime
      .map((row) => ({ slug: row.slug, value: categoryValue(row, category.key) }))
      .sort((a, b) => b.value - a.value);
    const rank = board.findIndex((row) => row.slug === fighter.slug) + 1;
    const value = categoryValue(fighter, category.key);
    const rating = categoryRating(value, categoryMaximums[category.key]);
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

function evidenceForCategory(fighter: RankingFighter, key: ProfileCategoryKey) {
  switch (key) {
    case "championship":
      return [
        ["Title-fight wins", String(fighter.visibleStats.titleFightWins)],
        ["Adjusted title credit", fighter.visibleStats.adjustedTitleWins.toFixed(1)],
      ];
    case "opponentQuality":
      return [
        ["Top-5 wins", String(fighter.visibleStats.topFiveWins)],
        ["Ranked wins", String(fighter.visibleStats.rankedWins)],
      ];
    case "primeDominance":
      return [
        ["Prime UFC record", fighter.visibleStats.primeRecord],
        ["Rounds won", fmtPct(fighter.visibleStats.roundsWonPct)],
      ];
    case "longevity":
      return [
        ["Active elite years", fighter.visibleStats.activeEliteYears.toFixed(1)],
        ["UFC record", fighter.visibleStats.ufcRecord],
      ];
    case "penalty":
      return [
        ["Prime finishes suffered", String(fighter.visibleStats.timesFinishedPrime)],
        ["Prime sample", `${fighter.visibleStats.throughPrimeUfcFights} fights`],
      ];
  }
}

import {
  categoryBoard,
  rankingCategoryValue,
  type CategoryGender,
  type RankingCategory,
} from "./rankingControls";
import type { RankingFighter } from "./rankingModel";

const divisionAbbreviations: Record<string, string> = {
  heavyweight: "HW",
  "light heavyweight": "LHW",
  middleweight: "MW",
  welterweight: "WW",
  lightweight: "LW",
  featherweight: "FW",
  bantamweight: "BW",
  flyweight: "FLW",
  strawweight: "SW",
  openweight: "OW",
  catchweight: "CW",
};

const categoryLabels: Record<RankingCategory, string> = {
  championship: "CHAMP",
  opponentQuality: "OPP Q",
  primeDominance: "PRIME",
  longevity: "LONG",
  apexPeak: "PEAK",
  penalty: "LOSS",
};

export function abbreviateDivisionLabel(value: string) {
  return String(value || "")
    .split("/")
    .map((part) => {
      const clean = part.trim().replace(/^women['’]s\s+/i, "");
      return divisionAbbreviations[clean.toLowerCase()] ?? clean;
    })
    .filter(Boolean)
    .join(" / ");
}

export function categoryBadgeLabel(category: RankingCategory) {
  return categoryLabels[category];
}

export function categoryDisplayRating(
  gender: CategoryGender,
  category: RankingCategory,
  fighter: RankingFighter,
) {
  const board = categoryBoard(gender, category);
  const values = board.map((row) => rankingCategoryValue(row, category));
  const best = values[0] ?? 0;
  const worst = values.at(-1) ?? best;
  const value = rankingCategoryValue(fighter, category);
  if (Math.abs(best - worst) < 0.0001) return 99;
  const normalized = Math.max(0, Math.min(1, (value - worst) / (best - worst)));
  return Math.round(70 + normalized * 29);
}

export function categorySupportCopy(fighter: RankingFighter, category: RankingCategory) {
  const stats = fighter.visibleStats;
  switch (category) {
    case "championship":
      return `${stats.adjustedTitleWins.toFixed(1)} adjusted title wins · ${stats.titleFightWins} title-fight wins`;
    case "opponentQuality":
      return `${stats.topFiveWins} Top-5 wins · ${stats.rankedWins} ranked wins`;
    case "primeDominance":
      return `${stats.primeRecord} prime · ${Math.round(stats.roundsWonPct)}% rounds won`;
    case "longevity":
      return `${stats.activeEliteYears.toFixed(1)} active elite years`;
    case "apexPeak":
      return `${fighter.apexPeak.toFixed(1)} / 6 calculated peak`;
    case "penalty":
      return fighter.penalty === 0
        ? "No counted UFC loss penalty"
        : `${Math.abs(fighter.penalty).toFixed(1)} calculated loss penalty`;
  }
}

export function divisionRoleLabel(role: "primary" | "secondary" | "crossover") {
  if (role === "primary") return "Primary UFC division";
  if (role === "secondary") return "Second-division resume";
  return "Crossover UFC resume";
}

export function shortEraName(name: string) {
  return name.replace(/ Era$/i, "");
}

export const WHEEL_UFC_ROSTER_SLOTS = [
  "Flyweight",
  "Bantamweight",
  "Featherweight",
  "Lightweight",
  "Welterweight",
  "Middleweight",
  "Light Heavyweight",
  "Heavyweight",
] as const;

export type WheelUfcRosterSlot = (typeof WHEEL_UFC_ROSTER_SLOTS)[number];

export const WHEEL_UFC_CATEGORY_WEIGHTS = {
  CHAMPION: 5,
  TOP_5: 10,
  SIX_TO_FIFTEEN: 15,
  UNRANKED: 20,
  COUNTRY: 20,
  YOUNG_GUN: 15,
  VETERAN: 15,
} as const;

export type WheelUfcCategory = keyof typeof WHEEL_UFC_CATEGORY_WEIGHTS;

export const WHEEL_UFC_CATEGORIES: readonly {
  id: WheelUfcCategory;
  label: string;
  shortLabel: string;
  detail: string;
  weight: number;
  color: string;
}[] = [
  { id: "CHAMPION", label: "Champion", shortLabel: "CHAMP", detail: "Undisputed champion", weight: 5, color: "#c99022" },
  { id: "TOP_5", label: "Top 5", shortLabel: "TOP 5", detail: "#1–#5 contender", weight: 10, color: "#d3353d" },
  { id: "SIX_TO_FIFTEEN", label: "6–15", shortLabel: "6–15", detail: "#6–#15 contender", weight: 15, color: "#9e2630" },
  { id: "UNRANKED", label: "Unranked", shortLabel: "UR", detail: "Outside the Top 15", weight: 20, color: "#681a22" },
  { id: "COUNTRY", label: "Country", shortLabel: "WORLD", detail: "Country drawn", weight: 20, color: "#6d398d" },
  { id: "YOUNG_GUN", label: "Young Gun", shortLabel: "U25", detail: "Under 25", weight: 15, color: "#137f72" },
  { id: "VETERAN", label: "Veteran", shortLabel: "VET", detail: "10+ UFC fights", weight: 15, color: "#50545d" },
];

const CATEGORY_BY_ID = new Map(WHEEL_UFC_CATEGORIES.map((category) => [category.id, category]));

export function wheelUfcCategory(category: WheelUfcCategory) {
  return CATEGORY_BY_ID.get(category)!;
}

export function wheelUfcCategoryLabel(category: WheelUfcCategory) {
  return wheelUfcCategory(category).label;
}

export const WHEEL_UFC_VISUAL_SLICES: readonly WheelUfcCategory[] =
  WHEEL_UFC_CATEGORIES.map((category) => category.id);

function wheelUfcCategoryStartDegrees(category: WheelUfcCategory) {
  let weightBefore = 0;
  for (const row of WHEEL_UFC_CATEGORIES) {
    if (row.id === category) break;
    weightBefore += row.weight;
  }
  return weightBefore * 3.6;
}

export function wheelUfcCategoryMidDegrees(category: WheelUfcCategory) {
  return wheelUfcCategoryStartDegrees(category) + wheelUfcCategory(category).weight * 1.8;
}

export const WHEEL_UFC_SLOT_ABBREVIATIONS: Readonly<Record<WheelUfcRosterSlot, string>> = {
  Flyweight: "FLW",
  Bantamweight: "BW",
  Featherweight: "FW",
  Lightweight: "LW",
  Welterweight: "WW",
  Middleweight: "MW",
  "Light Heavyweight": "LHW",
  Heavyweight: "HW",
};

export function wheelUfcSpinDisplay(
  category: WheelUfcCategory,
  countryName: string | null | undefined,
) {
  if (category === "COUNTRY" && countryName) return `COUNTRY · ${countryName.toUpperCase()}`;
  return wheelUfcCategory(category).label.toUpperCase();
}

export function wheelUfcSliceBackground() {
  let weightBefore = 0;
  const stops = WHEEL_UFC_CATEGORIES.flatMap((category) => {
    const start = weightBefore * 3.6;
    weightBefore += category.weight;
    const end = weightBefore * 3.6;
    return [`${category.color} ${start}deg`, `${category.color} ${end}deg`];
  });
  return `conic-gradient(from 0deg, ${stops.join(", ")})`;
}

export function wheelUfcTargetAngle(category: WheelUfcCategory) {
  return wheelUfcCategoryMidDegrees(category);
}

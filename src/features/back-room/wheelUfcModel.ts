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
  { id: "CHAMPION", label: "Champion", shortLabel: "CHAMP", detail: "Current undisputed champion", weight: 5, color: "#c99022" },
  { id: "TOP_5", label: "Top 5", shortLabel: "TOP 5", detail: "Current #1–#5 contender", weight: 10, color: "#d3353d" },
  { id: "SIX_TO_FIFTEEN", label: "6–15", shortLabel: "6–15", detail: "Current #6–#15 contender", weight: 15, color: "#9e2630" },
  { id: "UNRANKED", label: "Unranked", shortLabel: "UR", detail: "Current UFC fighter outside the traditional Top 15", weight: 20, color: "#681a22" },
  { id: "COUNTRY", label: "Country", shortLabel: "WORLD", detail: "A country is drawn after the spin", weight: 20, color: "#6d398d" },
  { id: "YOUNG_GUN", label: "Young Gun", shortLabel: "U25", detail: "Under 25 years old", weight: 15, color: "#137f72" },
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
  WHEEL_UFC_CATEGORIES.flatMap((category) =>
    Array.from({ length: category.weight / 5 }, () => category.id),
  );

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
  const slice = 360 / WHEEL_UFC_VISUAL_SLICES.length;
  const stops = WHEEL_UFC_VISUAL_SLICES.flatMap((category, index) => {
    const color = wheelUfcCategory(category).color;
    return [`${color} ${index * slice}deg`, `${color} ${(index + 1) * slice}deg`];
  });
  return `conic-gradient(from ${-slice / 2}deg, ${stops.join(", ")})`;
}

export function wheelUfcTargetSlice(category: WheelUfcCategory, turnCount: number) {
  const matches = WHEEL_UFC_VISUAL_SLICES
    .map((sliceCategory, index) => ({ sliceCategory, index }))
    .filter((row) => row.sliceCategory === category);
  return matches[Math.abs(turnCount) % matches.length]?.index ?? 0;
}

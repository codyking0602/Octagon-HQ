import {
  FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS,
  type FootballWavelengthCategory,
} from "./footballWavelengthModel";

export function footballWavelengthCategoryLabel(category: FootballWavelengthCategory) {
  return category === "MEDIA ENERGY" ? "ENTERTAINMENT VALUE" : category;
}

export function footballWavelengthCluePrompt(category: FootballWavelengthCategory) {
  const question = category === "MEDIA ENERGY"
    ? "How entertaining or compelling is this subject to football fans?"
    : FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS.find((anchor) => anchor.category === category)?.ratingQuestion
      ?? "Where does it land on the Football HQ scale?";

  return `${question} Rate it on Football HQ’s calibrated 1–100 opinion scale.`;
}

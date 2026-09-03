import type { FootballWavelengthCategory } from "./footballWavelengthModel";

export function footballWavelengthCategoryLabel(category: FootballWavelengthCategory) {
  return category === "MEDIA ENERGY" ? "ENTERTAINMENT VALUE" : category;
}

export function footballWavelengthCluePrompt(category: FootballWavelengthCategory) {
  if (category === "MEDIA ENERGY") {
    return "How entertaining or compelling is this subject to football fans? Rate it on Football HQ’s calibrated 1–100 opinion scale.";
  }
  return "Where does it land on Football HQ’s calibrated 1–100 football opinion scale?";
}

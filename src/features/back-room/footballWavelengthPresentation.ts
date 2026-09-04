import {
  FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS,
  type FootballWavelengthCategory,
} from "./footballWavelengthModel";

export function footballWavelengthCategoryLabel(category: FootballWavelengthCategory) {
  return category === "MEDIA ENERGY" ? "ENTERTAINMENT VALUE" : category;
}

const FOOTBALL_WAVELENGTH_CLUE_DESCRIPTORS = {
  "NFL LEGACY": "NFL legacy",
  GUNSLINGER: "gunslinger instinct",
  "QB CARRY JOB": "quarterback carry-job level",
  "OFFENSIVE CHAOS": "offensive chaos",
  "FANBASE INSANITY": "fanbase insanity",
  "PROGRAM TRADITION": "program tradition",
  "UNIFORM QUALITY": "uniform quality",
  "STADIUM ATMOSPHERE": "home-field atmosphere",
  "RIVALRY HATRED": "rivalry hatred",
  "SYSTEM QB PERCEPTION": "system-QB perception",
  "COACHING CHAOS": "coaching chaos",
  "OFFENSIVE INNOVATION": "offensive innovation",
  "DEFENSIVE TERROR": "defensive terror",
  "DRAFT BUST": "draft-bust reputation",
  "CLUTCH REPUTATION": "clutch reputation",
  "CHOKE REPUTATION": "choke reputation",
  "FRANCHISE TRADITION": "franchise tradition",
  "FOOTBALL WEIRDNESS": "football weirdness",
  "MEDIA ENERGY": "entertainment value",
  "TAILGATE CULTURE": "tailgate culture",
  "COACHING GENIUS": "coaching genius",
  "HOME-FIELD ADVANTAGE": "home-field advantage",
  "FOOTBALL VILLAINY": "football villainy",
  "FRANCHISE DYSFUNCTION": "franchise dysfunction",
  "OFFENSIVE FIREPOWER": "offensive firepower",
  "BIG ARM TALENT": "big-arm talent",
  "ATHLETIC FREAK": "raw football athleticism",
} as const satisfies Record<FootballWavelengthCategory, string>;

export function footballWavelengthClueDescriptor(category: FootballWavelengthCategory) {
  return FOOTBALL_WAVELENGTH_CLUE_DESCRIPTORS[category];
}

export function footballWavelengthCluePrompt(category: FootballWavelengthCategory) {
  const question = category === "MEDIA ENERGY"
    ? "How entertaining or compelling is this subject to football fans?"
    : FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS.find((anchor) => anchor.category === category)?.ratingQuestion
      ?? "Where does it land on the Football HQ scale?";

  return `${question} Rate it on Football HQ’s calibrated 1–100 opinion scale.`;
}

import {
  FOOTBALL_WAVELENGTH_CATEGORY_ANCHORS,
  type FootballWavelengthCategory,
} from "./footballWavelengthModel";

export function footballWavelengthCategoryLabel(category: FootballWavelengthCategory) {
  return category === "MEDIA ENERGY" ? "ENTERTAINMENT VALUE" : category;
}

const FOOTBALL_WAVELENGTH_CLUE_DESCRIPTORS: Record<FootballWavelengthCategory, string> = {
  "ATHLETIC FREAK": "raw football athleticism",
  "BIG-GAME NERVES": "big-game pressure level",
  "QB TRUST": "quarterback trust level",
  "COACH ENERGY": "sideline coaching energy",
  "OFFENSE WATCHABILITY": "offensive watchability",
  "DEFENSIVE MENACE": "defensive menace",
  "FRANCHISE AURA": "franchise aura",
  "STADIUM ATMOSPHERE": "home-field atmosphere",
  "PLAYOFF FEAR": "playoff fear factor",
  "COLLEGE MYTHOLOGY": "college football mythology",
  "FANBASE CHAOS": "fanbase chaos",
  "UNIFORM HEAT": "uniform appeal",
  "MEDIA ENERGY": "entertainment value",
  "TRASH-TALK LEVEL": "trash-talk level",
  "CLUTCH KICKER DREAD": "clutch-kicker dread",
  "COORDINATOR INFLUENCE": "coordinator influence",
  "LATE-GAME COACHING TRUST": "late-game coaching trust",
  "QB-COACH SYNERGY": "QB-coach synergy",
  "ROAD-ENVIRONMENT HOSTILITY": "road-environment hostility",
  "PLAYOFF ATMOSPHERE CARRYOVER": "playoff atmosphere carryover",
  "FRANCHISE PRESSURE": "franchise pressure",
  "ROOKIE EXPECTATION HEAT": "rookie expectation pressure",
  "VETERAN LEADERSHIP": "veteran leadership",
  "COLD-WEATHER IDENTITY": "cold-weather identity",
  "PLAYOFF SCAR TISSUE": "playoff scar tissue",
  "HOME-FIELD SWING": "home-field swing",
  "MOMENTUM-CONTEXT SWING": "momentum-context swing",
};

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

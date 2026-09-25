import { desiredWavelengthCorrection } from "../play/wavelengthEngine";

export type MlbProductionWavelengthCategory =
  | "OCTOBER LEGACY"
  | "CONTACT HITTING"
  | "DEFENSIVE GREATNESS"
  | "ACE INTIMIDATION"
  | "CLUTCH REPUTATION"
  | "ICON STATUS"
  | "DURABILITY"
  | "BALLPARK QUIRKINESS"
  | "MANAGER LEGACY"
  | "SHOWMANSHIP";

export type MlbProductionWavelengthClue = {
  id: string;
  category: MlbProductionWavelengthCategory;
  text: string;
  rating: number;
};

export type MlbProductionWavelengthGameDefinition = {
  id: string;
  challengeDate: "2026-10-01" | "2026-10-27";
  target: number;
  openingClueId: string;
};

export type MlbProductionWavelengthRound = {
  target: number;
  clues: MlbProductionWavelengthClue[];
};

function clue(
  id: string,
  category: MlbProductionWavelengthCategory,
  text: string,
  rating: number,
): MlbProductionWavelengthClue {
  return { id, category, text, rating };
}

/**
 * Shared production bank for both scheduled MLB Wavelength dates.
 * All four games draw adaptively from these same 100 authored clues.
 */
export const MLB_WAVELENGTH_PRODUCTION_BANK: readonly MlbProductionWavelengthClue[] = [
  clue("october-yogi-berra", "OCTOBER LEGACY", "Yogi Berra", 100),
  clue("october-mariano-rivera", "OCTOBER LEGACY", "Mariano Rivera", 99),
  clue("october-madison-bumgarner", "OCTOBER LEGACY", "Madison Bumgarner", 96),
  clue("october-corey-seager", "OCTOBER LEGACY", "Corey Seager", 92),
  clue("october-bill-mazeroski", "OCTOBER LEGACY", "Bill Mazeroski", 91),
  clue("october-kirk-gibson", "OCTOBER LEGACY", "Kirk Gibson", 90),
  clue("october-joe-carter", "OCTOBER LEGACY", "Joe Carter", 89),
  clue("october-david-freese", "OCTOBER LEGACY", "David Freese", 88),
  clue("october-jack-morris", "OCTOBER LEGACY", "Jack Morris", 82),
  clue("october-mike-trout", "OCTOBER LEGACY", "Mike Trout", 22),

  clue("contact-ichiro", "CONTACT HITTING", "Ichiro Suzuki", 100),
  clue("contact-rod-carew", "CONTACT HITTING", "Rod Carew", 98),
  clue("contact-wade-boggs", "CONTACT HITTING", "Wade Boggs", 96),
  clue("contact-luis-arraez", "CONTACT HITTING", "Luis Arraez", 93),
  clue("contact-george-brett", "CONTACT HITTING", "George Brett", 91),
  clue("contact-roberto-clemente", "CONTACT HITTING", "Roberto Clemente", 90),
  clue("contact-vladimir-guerrero", "CONTACT HITTING", "Vladimir Guerrero Sr.", 86),
  clue("contact-dustin-pedroia", "CONTACT HITTING", "Dustin Pedroia", 82),
  clue("contact-adam-dunn", "CONTACT HITTING", "Adam Dunn", 18),
  clue("contact-joey-gallo", "CONTACT HITTING", "Joey Gallo", 12),

  clue("defense-ozzie-smith", "DEFENSIVE GREATNESS", "Ozzie Smith", 100),
  clue("defense-brooks-robinson", "DEFENSIVE GREATNESS", "Brooks Robinson", 100),
  clue("defense-nolan-arenado", "DEFENSIVE GREATNESS", "Nolan Arenado", 98),
  clue("defense-ivan-rodriguez", "DEFENSIVE GREATNESS", "Ivan Rodriguez", 97),
  clue("defense-andruw-jones", "DEFENSIVE GREATNESS", "Andruw Jones", 96),
  clue("defense-andrelton-simmons", "DEFENSIVE GREATNESS", "Andrelton Simmons", 95),
  clue("defense-johnny-bench", "DEFENSIVE GREATNESS", "Johnny Bench", 94),
  clue("defense-keith-hernandez", "DEFENSIVE GREATNESS", "Keith Hernandez", 92),
  clue("defense-ryan-howard", "DEFENSIVE GREATNESS", "Ryan Howard", 30),
  clue("defense-prince-fielder", "DEFENSIVE GREATNESS", "Prince Fielder", 25),

  clue("ace-nolan-ryan", "ACE INTIMIDATION", "Nolan Ryan", 100),
  clue("ace-max-scherzer", "ACE INTIMIDATION", "Max Scherzer", 96),
  clue("ace-justin-verlander", "ACE INTIMIDATION", "Justin Verlander", 95),
  clue("ace-jacob-degrom", "ACE INTIMIDATION", "Jacob deGrom", 94),
  clue("ace-chris-sale", "ACE INTIMIDATION", "Chris Sale", 92),
  clue("ace-felix-hernandez", "ACE INTIMIDATION", "Felix Hernandez", 90),
  clue("ace-cc-sabathia", "ACE INTIMIDATION", "CC Sabathia", 88),
  clue("ace-tim-lincecum", "ACE INTIMIDATION", "Tim Lincecum", 86),
  clue("ace-bartolo-colon", "ACE INTIMIDATION", "Bartolo Colon", 62),
  clue("ace-jamie-moyer", "ACE INTIMIDATION", "Jamie Moyer", 38),

  clue("clutch-reggie-jackson", "CLUTCH REPUTATION", "Reggie Jackson", 100),
  clue("clutch-edgar-martinez", "CLUTCH REPUTATION", "Edgar Martinez", 94),
  clue("clutch-jose-bautista", "CLUTCH REPUTATION", "Jose Bautista", 90),
  clue("clutch-paul-konerko", "CLUTCH REPUTATION", "Paul Konerko", 83),
  clue("clutch-kris-bryant", "CLUTCH REPUTATION", "Kris Bryant", 82),
  clue("clutch-mike-piazza", "CLUTCH REPUTATION", "Mike Piazza", 81),
  clue("clutch-nelson-cruz", "CLUTCH REPUTATION", "Nelson Cruz", 80),
  clue("clutch-chase-utley", "CLUTCH REPUTATION", "Chase Utley", 78),
  clue("clutch-david-wright", "CLUTCH REPUTATION", "David Wright", 72),
  clue("clutch-albert-belle", "CLUTCH REPUTATION", "Albert Belle", 60),

  clue("icon-babe-ruth", "ICON STATUS", "Babe Ruth", 100),
  clue("icon-jackie-robinson", "ICON STATUS", "Jackie Robinson", 100),
  clue("icon-willie-mays", "ICON STATUS", "Willie Mays", 99),
  clue("icon-mickey-mantle", "ICON STATUS", "Mickey Mantle", 98),
  clue("icon-joe-dimaggio", "ICON STATUS", "Joe DiMaggio", 98),
  clue("icon-lou-gehrig", "ICON STATUS", "Lou Gehrig", 97),
  clue("icon-pete-rose", "ICON STATUS", "Pete Rose", 92),
  clue("icon-ernie-banks", "ICON STATUS", "Ernie Banks", 90),
  clue("icon-bo-jackson", "ICON STATUS", "Bo Jackson", 88),
  clue("icon-fernando-valenzuela", "ICON STATUS", "Fernando Valenzuela", 85),

  clue("durability-yastrzemski", "DURABILITY", "Carl Yastrzemski", 98),
  clue("durability-eddie-murray", "DURABILITY", "Eddie Murray", 96),
  clue("durability-phil-niekro", "DURABILITY", "Phil Niekro", 96),
  clue("durability-don-sutton", "DURABILITY", "Don Sutton", 95),
  clue("durability-craig-biggio", "DURABILITY", "Craig Biggio", 94),
  clue("durability-rafael-palmeiro", "DURABILITY", "Rafael Palmeiro", 92),
  clue("durability-omar-vizquel", "DURABILITY", "Omar Vizquel", 91),
  clue("durability-julio-franco", "DURABILITY", "Julio Franco", 90),
  clue("durability-harold-baines", "DURABILITY", "Harold Baines", 90),
  clue("durability-mark-prior", "DURABILITY", "Mark Prior", 20),

  clue("park-wrigley", "BALLPARK QUIRKINESS", "Wrigley Field", 96),
  clue("park-coors", "BALLPARK QUIRKINESS", "Coors Field", 94),
  clue("park-oracle", "BALLPARK QUIRKINESS", "Oracle Park", 88),
  clue("park-camden", "BALLPARK QUIRKINESS", "Camden Yards", 82),
  clue("park-pnc", "BALLPARK QUIRKINESS", "PNC Park", 70),
  clue("park-kauffman", "BALLPARK QUIRKINESS", "Kauffman Stadium", 55),
  clue("park-rogers-centre", "BALLPARK QUIRKINESS", "Rogers Centre", 48),
  clue("park-citizens-bank", "BALLPARK QUIRKINESS", "Citizens Bank Park", 45),
  clue("park-globe-life", "BALLPARK QUIRKINESS", "Globe Life Field", 40),
  clue("park-target", "BALLPARK QUIRKINESS", "Target Field", 38),

  clue("manager-connie-mack", "MANAGER LEGACY", "Connie Mack", 100),
  clue("manager-joe-torre", "MANAGER LEGACY", "Joe Torre", 98),
  clue("manager-tony-la-russa", "MANAGER LEGACY", "Tony La Russa", 97),
  clue("manager-bruce-bochy", "MANAGER LEGACY", "Bruce Bochy", 96),
  clue("manager-bobby-cox", "MANAGER LEGACY", "Bobby Cox", 95),
  clue("manager-sparky-anderson", "MANAGER LEGACY", "Sparky Anderson", 94),
  clue("manager-terry-francona", "MANAGER LEGACY", "Terry Francona", 92),
  clue("manager-dusty-baker", "MANAGER LEGACY", "Dusty Baker", 90),
  clue("manager-jim-leyland", "MANAGER LEGACY", "Jim Leyland", 89),
  clue("manager-joe-maddon", "MANAGER LEGACY", "Joe Maddon", 86),

  clue("show-fernando-tatis", "SHOWMANSHIP", "Fernando Tatis Jr.", 96),
  clue("show-ronald-acuna", "SHOWMANSHIP", "Ronald Acuna Jr.", 95),
  clue("show-manny-ramirez", "SHOWMANSHIP", "Manny Ramirez", 93),
  clue("show-yasiel-puig", "SHOWMANSHIP", "Yasiel Puig", 92),
  clue("show-javier-baez", "SHOWMANSHIP", "Javier Baez", 90),
  clue("show-tim-anderson", "SHOWMANSHIP", "Tim Anderson", 88),
  clue("show-juan-soto", "SHOWMANSHIP", "Juan Soto", 86),
  clue("show-ozzie-guillen", "SHOWMANSHIP", "Ozzie Guillen", 84),
  clue("show-deion-sanders", "SHOWMANSHIP", "Deion Sanders", 82),
  clue("show-vladimir-guerrero-jr", "SHOWMANSHIP", "Vladimir Guerrero Jr.", 80),
] as const;

export const MLB_WAVELENGTH_PRODUCTION_GAMES: readonly MlbProductionWavelengthGameDefinition[] = [
  {
    id: "mlb-2026-10-01-wavelength-1",
    challengeDate: "2026-10-01",
    target: 67,
    openingClueId: "park-pnc",
  },
  {
    id: "mlb-2026-10-01-wavelength-2",
    challengeDate: "2026-10-01",
    target: 38,
    openingClueId: "ace-jamie-moyer",
  },
  {
    id: "mlb-2026-10-27-wavelength-1",
    challengeDate: "2026-10-27",
    target: 81,
    openingClueId: "clutch-paul-konerko",
  },
  {
    id: "mlb-2026-10-27-wavelength-2",
    challengeDate: "2026-10-27",
    target: 56,
    openingClueId: "park-kauffman",
  },
] as const;

const DESCRIPTORS: Record<MlbProductionWavelengthCategory, string> = {
  "OCTOBER LEGACY": "October legacy",
  "CONTACT HITTING": "contact-hitting reputation",
  "DEFENSIVE GREATNESS": "defensive greatness",
  "ACE INTIMIDATION": "ace intimidation",
  "CLUTCH REPUTATION": "clutch reputation",
  "ICON STATUS": "baseball icon status",
  "DURABILITY": "career durability",
  "BALLPARK QUIRKINESS": "ballpark quirkiness",
  "MANAGER LEGACY": "manager legacy",
  "SHOWMANSHIP": "baseball showmanship",
};

const CLUE_BY_ID = new Map(MLB_WAVELENGTH_PRODUCTION_BANK.map((item) => [item.id, item]));

export function mlbProductionWavelengthCategoryLabel(category: string) {
  return category;
}

export function mlbProductionWavelengthClueDescriptor(category: string) {
  return DESCRIPTORS[category as MlbProductionWavelengthCategory] ?? "MLB scale";
}

export function mlbProductionWavelengthGamesForDate(date: string) {
  return MLB_WAVELENGTH_PRODUCTION_GAMES.filter((game) => game.challengeDate === date);
}

function nearest(clues: readonly MlbProductionWavelengthClue[], desiredRating: number) {
  return [...clues].sort((left, right) => (
    Math.abs(left.rating - desiredRating) - Math.abs(right.rating - desiredRating)
    || left.id.localeCompare(right.id)
  ))[0]!;
}

export function createMlbProductionWavelengthRound(
  definition: MlbProductionWavelengthGameDefinition,
): MlbProductionWavelengthRound {
  const opener = CLUE_BY_ID.get(definition.openingClueId);
  if (!opener) throw new Error(`Unknown MLB Wavelength opening clue: ${definition.openingClueId}`);
  return { target: definition.target, clues: [opener] };
}

export function nextMlbProductionWavelengthClue(
  definition: MlbProductionWavelengthGameDefinition,
  lastGuess: number,
  nextClueIndex: number,
  usedClueIds: readonly string[],
  unavailableClueIds: readonly string[] = [],
): MlbProductionWavelengthClue {
  if (nextClueIndex < 1 || nextClueIndex > 3) {
    throw new Error("MLB Wavelength requested a clue outside the four-clue game.");
  }

  const blocked = new Set([...usedClueIds, ...unavailableClueIds]);
  const usedCategories = new Set(
    usedClueIds
      .map((id) => CLUE_BY_ID.get(id)?.category)
      .filter((category): category is MlbProductionWavelengthCategory => Boolean(category)),
  );
  const available = MLB_WAVELENGTH_PRODUCTION_BANK.filter((item) => !blocked.has(item.id));
  const varied = available.filter((item) => !usedCategories.has(item.category));
  const pool = varied.length ? varied : available;
  const direction = Math.sign(definition.target - lastGuess);
  const directional = direction > 0
    ? pool.filter((item) => item.rating > definition.target)
    : direction < 0
      ? pool.filter((item) => item.rating < definition.target)
      : pool;
  const desiredRating = desiredWavelengthCorrection(definition.target, lastGuess, nextClueIndex);
  return nearest(directional.length ? directional : pool, desiredRating);
}

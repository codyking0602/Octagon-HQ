import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { allTime, type RankingFighter } from "../rankings/rankingModel";

export type PlayGender = "men" | "women";
export type BlindRankPackId =
  | "ufc-careers"
  | "all-careers"
  | "womens-careers"
  | "lightweight"
  | "welterweight"
  | "heavyweight"
  | "striking"
  | "wrestling-grappling";

export interface PlayFighter {
  id: string;
  name: string;
  gender: PlayGender;
  divisions: string[];
  mainEra: string;
  thumbUrl: string;
  profileUrl: string;
  model: RankingFighter | null;
  ratings: {
    career: number;
    striking: number;
    grappling: number;
  };
}

export interface RankedPlayFighter extends PlayFighter {
  model: RankingFighter;
}

const strikingAnchors: Record<string, number> = {
  "Anderson Silva": 99, "Israel Adesanya": 98, "Alex Pereira": 97, "Jose Aldo": 96,
  "Max Holloway": 96, "Joanna Jedrzejczyk": 95, "Valentina Shevchenko": 95,
  "Alexander Volkanovski": 94, "Conor McGregor": 94, "Ilia Topuria": 93, "Petr Yan": 92,
  "Sean O'Malley": 91, "Dustin Poirier": 90, "Lyoto Machida": 90, "Zhang Weili": 89,
  "Amanda Nunes": 89, "Justin Gaethje": 88, "Robert Whittaker": 88, "Demetrious Johnson": 88,
  "Jon Jones": 87, "Leon Edwards": 87, "Anthony Pettis": 87, "Georges St-Pierre": 86,
  "Charles Oliveira": 81, "Stipe Miocic": 81, "Francis Ngannou": 81, "Tony Ferguson": 81,
  "Islam Makhachev": 80, "B.J. Penn": 80, "Dominick Cruz": 84, "Rafael dos Anjos": 79,
  "T.J. Dillashaw": 84, "Deiveson Figueiredo": 83, "Brandon Moreno": 83,
  "Dricus du Plessis": 78, "Tyron Woodley": 78, "Chris Weidman": 72, "Luke Rockhold": 76,
  "Cain Velasquez": 73, "Daniel Cormier": 70, "Kamaru Usman": 76, "Henry Cejudo": 77,
  "Benson Henderson": 77, "Eddie Alvarez": 79, "Alexandre Pantoja": 78,
  "Aljamain Sterling": 70, "Merab Dvalishvili": 68, "Khabib Nurmagomedov": 72,
  "Matt Hughes": 62, "Randy Couture": 60, "Frankie Edgar": 81, "Urijah Faber": 70,
  "Ronda Rousey": 52, "Miesha Tate": 58, "Julianna Pena": 57, "Carla Esparza": 48,
  "Alexa Grasso": 82, "Kayla Harrison": 58, "Mackenzie Dern": 62, "Rose Namajunas": 84,
  "Holly Holm": 85, "Junior dos Santos": 84, "Brock Lesnar": 45, "Fabricio Werdum": 60,
  "Frank Mir": 55, "Royce Gracie": 25, "Ken Shamrock": 36, "Frank Shamrock": 68,
  "Mark Coleman": 35, "Tito Ortiz": 58, "Rashad Evans": 72, "Glover Teixeira": 66,
  "Mauricio Rua": 82, "Chuck Liddell": 88, "Quinton Jackson": 86,
};

const grapplingAnchors: Record<string, number> = {
  "Khabib Nurmagomedov": 99, "Islam Makhachev": 98, "Georges St-Pierre": 97,
  "Demetrious Johnson": 97, "Jon Jones": 96, "Charles Oliveira": 96, "Fabricio Werdum": 95,
  "Daniel Cormier": 95, "Ronda Rousey": 95, "Matt Hughes": 94, "Henry Cejudo": 94,
  "Alexandre Pantoja": 94, "Aljamain Sterling": 93, "Merab Dvalishvili": 92, "B.J. Penn": 91,
  "Cain Velasquez": 91, "Urijah Faber": 90, "Valentina Shevchenko": 90, "Kamaru Usman": 90,
  "Randy Couture": 88, "Amanda Nunes": 88, "Glover Teixeira": 88, "Chris Weidman": 87,
  "Frank Mir": 87, "T.J. Dillashaw": 86, "Alexander Volkanovski": 86, "Ilia Topuria": 85,
  "Benson Henderson": 84, "Rafael dos Anjos": 84, "Frankie Edgar": 84, "Zhang Weili": 83,
  "Rose Namajunas": 82, "Miesha Tate": 82, "Deiveson Figueiredo": 81, "Brandon Moreno": 81,
  "Tony Ferguson": 80, "Petr Yan": 78, "Dominick Cruz": 79, "Jose Aldo": 82,
  "Dustin Poirier": 74, "Justin Gaethje": 67, "Max Holloway": 72, "Anderson Silva": 72,
  "Israel Adesanya": 62, "Alex Pereira": 57, "Conor McGregor": 64, "Robert Whittaker": 78,
  "Stipe Miocic": 76, "Francis Ngannou": 66, "Junior dos Santos": 62, "Brock Lesnar": 86,
  "Tito Ortiz": 86, "Rashad Evans": 84, "Frank Shamrock": 88, "Ken Shamrock": 84,
  "Royce Gracie": 94, "Mark Coleman": 88, "Mauricio Rua": 67, "Chuck Liddell": 58,
  "Quinton Jackson": 55, "Lyoto Machida": 66, "Tyron Woodley": 78, "Leon Edwards": 74,
  "Holly Holm": 62, "Joanna Jedrzejczyk": 70, "Alexa Grasso": 72, "Julianna Pena": 78,
  "Carla Esparza": 86, "Kayla Harrison": 96, "Mackenzie Dern": 95,
};

const playOnlyFighters: readonly PlayFighter[] = [
  {
    id: "cm-punk",
    name: "CM Punk",
    gender: "men",
    divisions: ["Welterweight"],
    mainEra: "2015–2019",
    thumbUrl: "/assets/fighters/cm-punk-thumb.webp",
    profileUrl: "",
    model: null,
    ratings: { career: 5, striking: 5, grappling: 8 },
  },
  {
    id: "kimbo-slice",
    name: "Kimbo Slice",
    gender: "men",
    divisions: ["Heavyweight"],
    mainEra: "2005–2009",
    thumbUrl: "/assets/fighters/kimbo-slice-thumb.webp",
    profileUrl: "",
    model: null,
    ratings: { career: 25, striking: 45, grappling: 20 },
  },
] as const;

const ERA_BUCKETS = [
  { start: 1993, end: 1999, label: "1993–1999" },
  { start: 2000, end: 2004, label: "2000–2004" },
  { start: 2005, end: 2009, label: "2005–2009" },
  { start: 2010, end: 2014, label: "2010–2014" },
  { start: 2015, end: 2019, label: "2015–2019" },
  { start: 2020, end: 2099, label: "2020s" },
] as const;

const fightDatesByName = new Map(
  canonicalRankingInputs.fighters.map((input) => [input.fighter, input.facts.fights.map((fight) => fight.date)]),
);

function mainEraFor(name: string) {
  const dates = fightDatesByName.get(name) ?? [];
  const counts = ERA_BUCKETS.map((bucket) => ({
    ...bucket,
    count: dates.filter((date) => {
      const year = Number(date.slice(0, 4));
      return year >= bucket.start && year <= bucket.end;
    }).length,
  }));
  const winner = counts.sort((left, right) => right.count - left.count || right.start - left.start)[0];
  return winner?.count ? winner.label : "—";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizedName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .toLowerCase();
}

function anchoredRating(anchors: Record<string, number>, name: string) {
  const target = normalizedName(name);
  const match = Object.entries(anchors).find(([anchor]) => normalizedName(anchor) === target);
  return match?.[1];
}

function derivedStriking(fighter: RankingFighter) {
  const finish = fighter.visibleStats.finishRatePct;
  const prime = Math.min(100, (fighter.primeDominance / 30) * 100);
  const apex = Math.min(100, 55 + (fighter.apexPeak / 6) * 44);
  return clamp((prime * 0.45) + (finish * 0.3) + (apex * 0.25));
}

function derivedGrappling(fighter: RankingFighter) {
  const quality = Math.min(100, (fighter.opponentQuality / 30) * 100);
  const championship = Math.min(100, (fighter.championship / 30) * 100);
  const control = fighter.visibleStats.roundsWonPct;
  return clamp((quality * 0.32) + (championship * 0.28) + (control * 0.4));
}

function divisionsFor(fighter: RankingFighter) {
  return [fighter.primaryDivision, ...fighter.secondaryDivision.split("/")]
    .map((division) => division.trim())
    .filter(Boolean);
}

export const rankedPlayFighters: readonly RankedPlayFighter[] = allTime.map((fighter) => ({
  id: fighter.slug,
  name: fighter.name,
  gender: fighter.board,
  divisions: divisionsFor(fighter),
  mainEra: mainEraFor(fighter.name),
  thumbUrl: fighter.thumbUrl,
  profileUrl: fighter.profileUrl,
  model: fighter,
  ratings: {
    career: fighter.ovr,
    striking: anchoredRating(strikingAnchors, fighter.name) ?? derivedStriking(fighter),
    grappling: anchoredRating(grapplingAnchors, fighter.name) ?? derivedGrappling(fighter),
  },
}));

const rankedIds = new Set(rankedPlayFighters.map((fighter) => fighter.id));

export const playFighters: readonly PlayFighter[] = [
  ...rankedPlayFighters,
  ...playOnlyFighters.filter((fighter) => !rankedIds.has(fighter.id)),
];

const byId = new Map(playFighters.map((fighter) => [fighter.id, fighter]));

export function getPlayFighter(id: string) {
  return byId.get(id);
}

export function blindRankRating(fighter: PlayFighter, packId: BlindRankPackId) {
  if (packId === "striking") return fighter.ratings.striking;
  if (packId === "wrestling-grappling") return fighter.ratings.grappling;
  return fighter.ratings.career;
}

export function blindRankPool(packId: BlindRankPackId) {
  return playFighters.filter((fighter) => {
    if (packId === "ufc-careers") return fighter.gender === "men";
    if (packId === "womens-careers") return fighter.gender === "women";
    if (packId === "lightweight") return fighter.gender === "men" && fighter.divisions.includes("Lightweight");
    if (packId === "welterweight") return fighter.gender === "men" && fighter.divisions.includes("Welterweight");
    if (packId === "heavyweight") return fighter.gender === "men" && fighter.divisions.includes("Heavyweight");
    return true;
  });
}

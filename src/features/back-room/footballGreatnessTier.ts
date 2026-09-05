import {
  getFootballRatingBand,
  type FootballRatingBand,
} from "./footballContentContract";
import type { FootballRankFiveItem } from "./footballRankFiveModel";
import { OFFICIAL_COMPARISON_GRADING_RULES } from "../play/officialScoreContract";

export type FootballGreatnessTier =
  | "goat"
  | "legendary"
  | "elite"
  | "near-elite"
  | "great"
  | "good"
  | "average"
  | "below-average"
  | "bad";

export const FOOTBALL_GREATNESS_TIER_LABELS = {
  goat: "GOAT",
  legendary: "LEGENDARY",
  elite: "ELITE",
  "near-elite": "NEAR ELITE",
  great: "GREAT",
  good: "GOOD",
  average: "AVERAGE",
  "below-average": "BELOW AVERAGE",
  bad: "BAD",
} as const satisfies Record<FootballGreatnessTier, string>;

const FOOTBALL_GREATNESS_TIER_ORDER: readonly FootballGreatnessTier[] = [
  "goat",
  "legendary",
  "elite",
  "near-elite",
  "great",
  "good",
  "average",
  "below-average",
  "bad",
];

const FOOTBALL_GREATNESS_TIER_STRENGTH = new Map(
  FOOTBALL_GREATNESS_TIER_ORDER.map((tier, index) => [tier, FOOTBALL_GREATNESS_TIER_ORDER.length - index]),
);

/**
 * Approved editorial anchors live here because this module is the canonical gameplay
 * greatness-tier owner. Ratings remain calculated/ranked evidence; these overrides are
 * the human-approved tier truth used by grading and reveal order.
 */
const FOOTBALL_GREATNESS_TIER_OVERRIDES = {
  // NFL QB careers
  "tom-brady": "goat",
  "drew-brees": "great",
  "eli-manning": "good",

  // NFL RB careers
  "jim-brown": "elite",
  "derrick-henry": "great",
  "frank-gore": "good",

  // NFL WR careers
  "jerry-rice": "goat",
  "randy-moss": "legendary",
  "antonio-brown": "elite",
  "julio-jones": "elite",

  // NFL TE careers
  "tony-gonzalez": "elite",
  "shannon-sharpe": "near-elite",
  "jason-witten": "near-elite",

  // NFL Front Seven
  "lawrence-taylor": "elite",
  "reggie-white": "elite",
  "aaron-donald": "elite",
  "ray-lewis": "elite",
  "jj-watt": "elite",
  "bruce-smith": "elite",
  "myles-garrett": "elite",
  "joe-greene": "elite",
  "dick-butkus": "elite",
  "tj-watt": "elite",
  "michael-strahan": "elite",
  "von-miller": "elite",
  "luke-kuechly": "elite",
  "derrick-brooks": "great",
  "junior-seau": "great",
  "terrell-suggs": "great",
  "patrick-willis": "great",
  "ndamukong-suh": "great",
  "clay-matthews": "good",
  "ryan-kerrigan": "good",
  "donta-hightower": "good",
  "justin-houston": "good",
  "jadeveon-clowney": "average",
  "aj-hawk": "average",
  "brian-cushing": "average",
  "bud-dupree": "average",
  "clelin-ferrell": "below-average",
  "solomon-thomas": "below-average",
  "barkevious-mingo": "below-average",
  "dion-jordan": "bad",
  "vernon-gholston": "bad",

  // NFL Secondary
  "deion-sanders": "elite",
  "ed-reed": "elite",
  "ronnie-lott": "elite",
  "rod-woodson": "elite",
  "charles-woodson": "elite",
  "darrelle-revis": "elite",
  "troy-polamalu": "elite",
  "champ-bailey": "elite",
  "brian-dawkins": "great",
  "ronde-barber": "great",
  "richard-sherman": "great",
  "earl-thomas": "great",
  "steve-atwater": "great",
  "ty-law": "great",
  "patrick-peterson": "great",
  "kam-chancellor": "good",
  "aqib-talib": "good",
  "eric-berry": "good",
  "malcolm-jenkins": "good",
  "devin-mccourty": "good",
  "chris-harris-jr": "good",
  "joe-haden": "average",
  "janoris-jenkins": "average",
  "landon-collins": "average",
  "marcus-peters": "average",
  "xavier-rhodes": "average",
  "eli-apple": "below-average",
  "vernon-hargreaves": "below-average",
  "morris-claiborne": "below-average",
  "justin-gilbert": "bad",
  "dee-milliner": "bad",

  // NFL head coaches
  "bill-belichick": "elite",
  "vince-lombardi": "elite",
  "don-shula": "elite",
  "bill-walsh": "elite",
  "andy-reid": "near-elite",
  "chuck-noll": "near-elite",
  "tom-landry": "near-elite",
  "paul-brown": "near-elite",
  "mike-tomlin": "great",
  "kliff-kingsbury": "below-average",

  // NFL team eras
  "nfl-era-patriots-belichick-brady": "goat",
  "nfl-era-49ers-montana-walsh": "elite",
  "nfl-era-steelers-steel-curtain": "elite",
  "nfl-era-cowboys-triplets": "elite",
  "nfl-era-chiefs-mahomes-reid": "elite",
  "nfl-era-packers-lombardi": "elite",
  "nfl-era-washington-gibbs": "great",
  "nfl-era-raiders-madden-flores": "great",
  "nfl-era-steelers-roethlisberger": "great",
  "nfl-era-colts-peyton-manning": "great",
  "nfl-era-packers-rodgers": "great",
  "nfl-era-seahawks-legion-of-boom": "great",

  // College QB careers
  "cam-newton-cfb": "elite",
  "lamar-jackson-cfb": "great",
  "matt-leinart-cfb": "great",
  "baker-mayfield-cfb": "great",
  "trevor-lawrence-cfb": "good",
  "jake-fromm-cfb": "average",

  // College RB careers
  "herschel-walker-cfb": "elite",
  "barry-sanders-cfb": "elite",
  "tony-dorsett-cfb": "elite",
  "ricky-williams-cfb": "elite",
  "bo-jackson-cfb": "elite",
  "marcus-allen-cfb": "elite",
  "ron-dayne-cfb": "elite",
  "reggie-bush-cfb": "elite",
  "earl-campbell-cfb": "elite",
  "jonathan-taylor-cfb": "elite",
  "adrian-peterson-cfb": "great",
  "oj-simpson-cfb": "great",
  "derrick-henry-cfb": "great",
  "ladainian-tomlinson-cfb": "great",
  "archie-griffin-cfb": "great",
  "christian-mccaffrey-cfb": "great",
  "saquon-barkley-cfb": "great",
  "darren-mcfadden-cfb": "great",
  "billy-sims-cfb": "great",
  "eddie-george-cfb": "great",
  "mark-ingram-cfb": "great",
  "melvin-gordon-cfb": "great",
  "bijan-robinson-cfb": "great",
  "trent-richardson-cfb": "good",

  // CFB head coaches / program eras
  "nick-saban-cfb": "goat",
  "gary-patterson-cfb": "good",
  "kyle-whittingham-cfb": "good",
  "mark-richt-cfb": "good",
  "boise-state-petersen-era": "average",
} as const satisfies Record<string, FootballGreatnessTier>;

export function footballGreatnessTierForRating(rating: number): FootballRatingBand {
  return getFootballRatingBand(rating);
}

export function footballGreatnessTierForItem(
  item: Pick<FootballRankFiveItem, "id" | "rating">,
): FootballGreatnessTier {
  return FOOTBALL_GREATNESS_TIER_OVERRIDES[item.id] ?? footballGreatnessTierForRating(item.rating);
}

export function footballGreatnessTierLabel(tier: FootballGreatnessTier) {
  return FOOTBALL_GREATNESS_TIER_LABELS[tier];
}

export function compareFootballGreatnessTiers(
  left: FootballGreatnessTier,
  right: FootballGreatnessTier,
) {
  return (FOOTBALL_GREATNESS_TIER_STRENGTH.get(left) ?? 0)
    - (FOOTBALL_GREATNESS_TIER_STRENGTH.get(right) ?? 0);
}

export function compareFootballGreatnessItems(
  left: Pick<FootballRankFiveItem, "id" | "rating">,
  right: Pick<FootballRankFiveItem, "id" | "rating">,
) {
  return compareFootballGreatnessTiers(
    footballGreatnessTierForItem(left),
    footballGreatnessTierForItem(right),
  );
}

export interface FootballTierComparisonScore {
  correctComparisons: number;
  normalizedScore: number;
}

/**
 * Football Blind Rank has ten pairwise relationships. A stronger tier above a weaker
 * tier is correct, and same-tier order is intentionally neutral/full credit.
 */
export function scoreFootballBlindRankTierOrder(
  orderedItems: readonly FootballRankFiveItem[],
): FootballTierComparisonScore {
  if (orderedItems.length !== 5) {
    throw new RangeError("Football Blind Rank tier scoring requires exactly five items.");
  }

  const rules = OFFICIAL_COMPARISON_GRADING_RULES["blind-rank"];
  let correctComparisons = 0;
  for (let leftIndex = 0; leftIndex < orderedItems.length - 1; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < orderedItems.length; rightIndex += 1) {
      if (compareFootballGreatnessItems(orderedItems[leftIndex]!, orderedItems[rightIndex]!) >= 0) {
        correctComparisons += 1;
      }
    }
  }

  return {
    correctComparisons,
    normalizedScore: correctComparisons * rules.normalizedPointsPerComparison,
  };
}

/**
 * Football Keep/Cut has sixteen kept-v-cut relationships. Same-tier choices are
 * interchangeable, so only keeping a genuinely weaker tier over a stronger tier
 * costs points.
 */
export function scoreFootballKeepCutTierSelection(
  keptItems: readonly FootballRankFiveItem[],
  cutItems: readonly FootballRankFiveItem[],
): FootballTierComparisonScore {
  if (keptItems.length !== 4 || cutItems.length !== 4) {
    throw new RangeError("Football Keep/Cut tier scoring requires exactly four kept and four cut items.");
  }

  const rules = OFFICIAL_COMPARISON_GRADING_RULES["keep-cut"];
  let correctComparisons = 0;
  for (const kept of keptItems) {
    for (const cut of cutItems) {
      if (compareFootballGreatnessItems(kept, cut) >= 0) correctComparisons += 1;
    }
  }

  return {
    correctComparisons,
    normalizedScore: Math.max(
      0,
      Math.min(100, Math.round(correctComparisons * rules.normalizedPointsPerComparison)),
    ),
  };
}

/** Tier-only reveal order. Source order breaks same-tier ties without asserting a ranking. */
export function orderFootballItemsByGreatnessTier<T extends FootballRankFiveItem>(
  items: readonly T[],
): T[] {
  return items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort((left, right) => (
      compareFootballGreatnessItems(right.item, left.item)
      || left.sourceIndex - right.sourceIndex
    ))
    .map(({ item }) => item);
}

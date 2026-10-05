import type {
  FamilyFeudEntity,
  FamilyFeudEntityKind,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";

const MAIN_POINTS = [10, 8, 7, 5, 4, 4, 3, 3, 2, 2, 2, 2] as const;
const FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1, 1, 1] as const;

export const MLB_SPORTS_FEUD_OCT12_DATE = "2026-10-05" as const;
export const MLB_SPORTS_FEUD_OCT12_KEY = "mlb-2026-play-06" as const;
export const MLB_SPORTS_FEUD_OCT12_VERSION = "mlb-sports-feud-oct12-v2" as const;
export const MLB_SPORTS_FEUD_OCT27_DATE = "2026-10-25" as const;
export const MLB_SPORTS_FEUD_OCT27_KEY = "mlb-2026-play-10" as const;
export const MLB_SPORTS_FEUD_OCT27_VERSION = "mlb-sports-feud-oct27-v2" as const;

type EntityRow = readonly [
  id: string,
  displayName: string,
  aliases?: readonly string[],
  kind?: FamilyFeudEntityKind,
];

function entity(
  prefix: string,
  [id, displayName, aliases = [], kind = "person"]: EntityRow,
): FamilyFeudEntity {
  return {
    id: `${prefix}-${id}`,
    displayName,
    aliases,
    kind,
  };
}

function question(
  prefix: string,
  id: string,
  prompt: string,
  answerIds: readonly string[],
  points: readonly number[],
  alsoAcceptedIds: readonly string[] = [],
): FamilyFeudQuestion {
  const candidateIds = [...answerIds, ...alsoAcceptedIds].map((entityId) => `${prefix}-${entityId}`);
  return {
    id: `${prefix}-${id}`,
    prompt,
    candidateIds,
    answers: answerIds.map((entityId, index) => ({
      entityId: `${prefix}-${entityId}`,
      points: points[index]!,
    })),
    ...(alsoAcceptedIds.length
      ? { alsoAcceptedEntityIds: alsoAcceptedIds.map((entityId) => `${prefix}-${entityId}`) }
      : {}),
  };
}

const EASY_TEAM_ROWS: readonly EntityRow[] = [
  ["yankees", "New York Yankees", ["Yankees", "NYY"], "team"],
  ["dodgers", "Los Angeles Dodgers", ["Dodgers", "LAD"], "team"],
  ["red-sox", "Boston Red Sox", ["Red Sox", "Boston"], "team"],
  ["cubs", "Chicago Cubs", ["Cubs"], "team"],
  ["cardinals", "St. Louis Cardinals", ["Cardinals", "Cards", "St Louis"], "team"],
  ["braves", "Atlanta Braves", ["Braves"], "team"],
  ["giants", "San Francisco Giants", ["Giants", "SF Giants"], "team"],
  ["mets", "New York Mets", ["Mets"], "team"],
  ["astros", "Houston Astros", ["Astros"], "team"],
  ["phillies", "Philadelphia Phillies", ["Phillies"], "team"],
  ["white-sox", "Chicago White Sox", ["White Sox"], "team"],
  ["rangers", "Texas Rangers", ["Rangers"], "team"],
  ["orioles", "Baltimore Orioles", ["Orioles", "O's", "Os"], "team"],
  ["padres", "San Diego Padres", ["Padres"], "team"],
  ["reds", "Cincinnati Reds", ["Reds"], "team"],
  ["angels", "Los Angeles Angels", ["Angels"], "team"],
  ["nationals", "Washington Nationals", ["Nationals", "Nats"], "team"],
  ["guardians", "Cleveland Guardians", ["Guardians"], "team"],
  ["diamondbacks", "Arizona Diamondbacks", ["Diamondbacks", "D-backs", "Dbacks"], "team"],
];

const EASY_PLAYER_ROWS: readonly EntityRow[] = [
  ["ohtani", "Shohei Ohtani", ["Ohtani"]],
  ["judge", "Aaron Judge", ["Judge"]],
  ["jeter", "Derek Jeter", ["Jeter"]],
  ["arod", "Alex Rodriguez", ["A-Rod", "A Rod", "ARod"]],
  ["trout", "Mike Trout", ["Trout"]],
  ["pujols", "Albert Pujols", ["Pujols"]],
  ["ortiz", "David Ortiz", ["Big Papi", "Papi", "Ortiz"]],
  ["griffey", "Ken Griffey Jr.", ["Ken Griffey", "Griffey", "The Kid"]],
  ["harper", "Bryce Harper", ["Harper"]],
  ["betts", "Mookie Betts", ["Mookie", "Betts"]],
  ["bonds", "Barry Bonds", ["Bonds"]],
  ["soto", "Juan Soto", ["Soto"]],
  ["acuna", "Ronald Acuna Jr.", ["Ronald Acuña Jr.", "Ronald Acuna", "Ronald Acuña", "Acuna", "Acuña"]],
  ["lindor", "Francisco Lindor", ["Lindor"]],
  ["tatis", "Fernando Tatis Jr.", ["Fernando Tatis", "Tatis", "Tatís"]],
  ["freeman", "Freddie Freeman", ["Freeman"]],
  ["ruth", "Babe Ruth", ["Ruth", "Babe"]],
  ["aaron", "Hank Aaron", ["Aaron"]],
  ["jackie", "Jackie Robinson", ["Jackie", "Robinson"]],
  ["mantle", "Mickey Mantle", ["Mantle"]],
  ["mays", "Willie Mays", ["Mays"]],
  ["ted-williams", "Ted Williams", ["Williams"]],
  ["nolan-ryan", "Nolan Ryan", ["Ryan"]],
  ["pete-rose", "Pete Rose", ["Rose"]],
  ["clemente", "Roberto Clemente", ["Clemente"]],
  ["ichiro", "Ichiro Suzuki", ["Ichiro"]],
  ["mcgwire", "Mark McGwire", ["McGwire", "Big Mac"]],
  ["sosa", "Sammy Sosa", ["Sosa"]],
  ["stanton", "Giancarlo Stanton", ["Stanton"]],
  ["rivera", "Mariano Rivera", ["Rivera", "Mo"]],
  ["gehrig", "Lou Gehrig", ["Gehrig"]],
  ["dimaggio", "Joe DiMaggio", ["DiMaggio", "Joe D"]],
  ["cole", "Gerrit Cole", ["Cole"]],
  ["kershaw", "Clayton Kershaw", ["Kershaw"]],
  ["verlander", "Justin Verlander", ["Verlander"]],
  ["randy-johnson", "Randy Johnson", ["Randy", "Big Unit", "The Big Unit"]],
  ["pedro", "Pedro Martinez", ["Pedro", "Pedro Martínez"]],
  ["scherzer", "Max Scherzer", ["Scherzer"]],
  ["clemens", "Roger Clemens", ["Clemens", "Rocket", "The Rocket"]],
  ["maddux", "Greg Maddux", ["Maddux"]],
  ["degrom", "Jacob deGrom", ["deGrom", "Degrom"]],
  ["koufax", "Sandy Koufax", ["Koufax"]],
  ["valenzuela", "Fernando Valenzuela", ["Fernando", "Valenzuela"]],
  ["piazza", "Mike Piazza", ["Piazza"]],
  ["manny", "Manny Ramirez", ["Manny", "Ramirez"]],
  ["devers", "Rafael Devers", ["Devers"]],
  ["yaz", "Carl Yastrzemski", ["Yastrzemski", "Yaz"]],
  ["nomar", "Nomar Garciaparra", ["Nomar", "Garciaparra"]],
  ["sale", "Chris Sale", ["Sale"]],
  ["damon", "Johnny Damon", ["Damon"]],
  ["guerrero-jr", "Vladimir Guerrero Jr.", ["Vlad Jr", "Vlad Guerrero Jr", "Guerrero Jr"]],
];

const OCT12_PREFIX = "mlb-oct12-feud";
const oct12Entities = [...EASY_TEAM_ROWS, ...EASY_PLAYER_ROWS].map((row) => entity(OCT12_PREFIX, row));

export const MLB_SPORTS_FEUD_OCT12_PACK: FamilyFeudPack = {
  id: "mlb-sports-feud-oct12-production-v2",
  sport: "mlb",
  entities: oct12Entities,
  mainBoards: [
    question(
      OCT12_PREFIX,
      "main-famous-franchise",
      "Name an MLB team you think of as one of baseball's most famous franchises.",
      [
        "yankees", "dodgers", "red-sox", "cubs", "cardinals", "braves",
        "giants", "mets", "astros", "phillies", "white-sox", "rangers",
      ],
      MAIN_POINTS,
      ["orioles", "padres"],
    ),
    question(
      OCT12_PREFIX,
      "main-modern-superstar",
      "Name a baseball superstar from the 2000s or later that almost every sports fan knows.",
      [
        "ohtani", "judge", "jeter", "arod", "trout", "pujols",
        "ortiz", "griffey", "harper", "betts", "bonds", "soto",
      ],
      MAIN_POINTS,
      ["acuna", "lindor", "tatis"],
    ),
  ],
  fastMoney: [
    question(
      OCT12_PREFIX,
      "fast-famous-yankee",
      "Name a famous New York Yankees player.",
      [
        "jeter", "judge", "ruth", "arod", "rivera",
        "mantle", "gehrig", "dimaggio", "cole", "soto",
      ],
      FAST_POINTS,
    ),
    question(
      OCT12_PREFIX,
      "fast-famous-dodger",
      "Name a famous Los Angeles Dodgers player.",
      [
        "ohtani", "kershaw", "betts", "freeman", "jackie",
        "koufax", "valenzuela", "piazza", "scherzer", "manny",
      ],
      FAST_POINTS,
    ),
    question(
      OCT12_PREFIX,
      "fast-home-runs",
      "Name a baseball player you immediately think of when you hear \"home runs.\"",
      [
        "ruth", "bonds", "judge", "aaron", "griffey",
        "mcgwire", "sosa", "ohtani", "pujols", "arod",
      ],
      FAST_POINTS,
      ["stanton", "ortiz"],
    ),
    question(
      OCT12_PREFIX,
      "fast-famous-pitcher",
      "Name a famous MLB pitcher.",
      [
        "kershaw", "verlander", "randy-johnson", "pedro", "nolan-ryan",
        "scherzer", "clemens", "maddux", "rivera", "degrom",
      ],
      FAST_POINTS,
      ["cole"],
    ),
    question(
      OCT12_PREFIX,
      "fast-october-team",
      "Name an MLB team you would expect to see playing in October.",
      [
        "dodgers", "yankees", "astros", "braves", "phillies",
        "red-sox", "cardinals", "cubs", "rangers", "giants",
      ],
      FAST_POINTS,
      ["mets", "padres"],
    ),
  ],
};

const OCT27_PREFIX = "mlb-oct27-feud";
const oct27Entities = [...EASY_TEAM_ROWS, ...EASY_PLAYER_ROWS].map((row) => entity(OCT27_PREFIX, row));

export const MLB_SPORTS_FEUD_OCT27_PACK: FamilyFeudPack = {
  id: "mlb-sports-feud-oct27-production-v2",
  sport: "mlb",
  entities: oct27Entities,
  mainBoards: [
    question(
      OCT27_PREFIX,
      "main-all-time-legend",
      "Name an all-time baseball legend almost everybody has heard of.",
      [
        "ruth", "jackie", "aaron", "jeter", "griffey", "bonds",
        "mantle", "mays", "ted-williams", "nolan-ryan", "pete-rose", "clemente",
      ],
      MAIN_POINTS,
      ["ichiro", "ohtani"],
    ),
    question(
      OCT27_PREFIX,
      "main-current-superstar",
      "Name a current MLB superstar.",
      [
        "ohtani", "judge", "soto", "harper", "betts", "acuna",
        "lindor", "tatis", "trout", "freeman", "guerrero-jr", "devers",
      ],
      MAIN_POINTS,
    ),
  ],
  fastMoney: [
    question(
      OCT27_PREFIX,
      "fast-famous-red-sox",
      "Name a famous Boston Red Sox player.",
      [
        "ortiz", "pedro", "manny", "betts", "ted-williams",
        "yaz", "clemens", "devers", "nomar", "sale",
      ],
      FAST_POINTS,
      ["damon"],
    ),
    question(
      OCT27_PREFIX,
      "fast-red-team",
      "Name an MLB team you associate with the color red.",
      [
        "red-sox", "reds", "cardinals", "phillies", "angels",
        "nationals", "braves", "guardians", "diamondbacks", "rangers",
      ],
      FAST_POINTS,
    ),
    question(
      OCT27_PREFIX,
      "fast-beyond-baseball",
      "Name a baseball player who became famous well beyond baseball.",
      [
        "jeter", "arod", "ohtani", "griffey", "ruth",
        "judge", "bonds", "ortiz", "jackie", "pete-rose",
      ],
      FAST_POINTS,
      ["ichiro", "harper"],
    ),
    question(
      OCT27_PREFIX,
      "fast-recognizable-logo",
      "Name an MLB team with a logo or hat you think almost everyone would recognize.",
      [
        "yankees", "dodgers", "red-sox", "cubs", "white-sox",
        "giants", "braves", "cardinals", "mets", "astros",
      ],
      FAST_POINTS,
      ["phillies", "padres"],
    ),
    question(
      OCT27_PREFIX,
      "fast-non-fan-recognition",
      "Name a baseball player you would expect a non-baseball fan to recognize.",
      [
        "ohtani", "judge", "jeter", "arod", "ruth",
        "griffey", "bonds", "ortiz", "jackie", "trout",
      ],
      FAST_POINTS,
      ["harper", "ichiro"],
    ),
  ],
};

export const MLB_SPORTS_FEUD_PRODUCTION_CONFIGS = [
  {
    challengeKey: MLB_SPORTS_FEUD_OCT12_KEY,
    challengeDate: MLB_SPORTS_FEUD_OCT12_DATE,
    scheduleVersion: MLB_SPORTS_FEUD_OCT12_VERSION,
    pack: MLB_SPORTS_FEUD_OCT12_PACK,
  },
  {
    challengeKey: MLB_SPORTS_FEUD_OCT27_KEY,
    challengeDate: MLB_SPORTS_FEUD_OCT27_DATE,
    scheduleVersion: MLB_SPORTS_FEUD_OCT27_VERSION,
    pack: MLB_SPORTS_FEUD_OCT27_PACK,
  },
] as const;

export function mlbSportsFeudProductionConfig(challengeKey: string, challengeDate: string) {
  return MLB_SPORTS_FEUD_PRODUCTION_CONFIGS.find((config) => (
    config.challengeKey === challengeKey && config.challengeDate === challengeDate
  )) ?? null;
}

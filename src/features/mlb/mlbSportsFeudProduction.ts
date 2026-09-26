import type {
  FamilyFeudEntity,
  FamilyFeudEntityKind,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";

const MAIN_POINTS = [10, 8, 7, 5, 4, 4, 3, 3, 2, 2, 2, 2] as const;
const FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1, 1, 1] as const;

export const MLB_SPORTS_FEUD_OCT12_DATE = "2026-10-12" as const;
export const MLB_SPORTS_FEUD_OCT12_KEY = "mlb-2026-play-06" as const;
export const MLB_SPORTS_FEUD_OCT12_VERSION = "mlb-sports-feud-oct12-v1" as const;
export const MLB_SPORTS_FEUD_OCT27_DATE = "2026-10-27" as const;
export const MLB_SPORTS_FEUD_OCT27_KEY = "mlb-2026-play-10" as const;
export const MLB_SPORTS_FEUD_OCT27_VERSION = "mlb-sports-feud-oct27-v1" as const;

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

const OCT12_PREFIX = "mlb-oct12-feud";
const oct12Rows: readonly EntityRow[] = [
  ["yadier-molina", "Yadier Molina", ["Yadi"]],
  ["salvador-perez", "Salvador Perez", ["Salvy", "Sal Perez"]],
  ["ivan-rodriguez", "Ivan Rodriguez", ["Pudge", "Pudge Rodriguez", "Iván Rodríguez"]],
  ["jorge-posada", "Jorge Posada"],
  ["jason-varitek", "Jason Varitek", ["Varitek"]],
  ["mike-piazza", "Mike Piazza", ["Piazza"]],
  ["jt-realmuto", "J.T. Realmuto", ["JT Realmuto", "Realmuto"]],
  ["brian-mccann", "Brian McCann", ["McCann"]],
  ["russell-martin", "Russell Martin"],
  ["yasmani-grandal", "Yasmani Grandal", ["Grandal"]],
  ["willson-contreras", "Willson Contreras", ["Contreras"]],
  ["adley-rutschman", "Adley Rutschman", ["Adley"]],
  ["aj-pierzynski", "A.J. Pierzynski", ["AJ Pierzynski", "Pierzynski"]],
  ["christian-vazquez", "Christian Vazquez", ["Christian Vázquez", "Vazquez", "Vázquez"]],
  ["victor-martinez", "Victor Martinez", ["Víctor Martínez", "V-Mart", "V Mart"]],

  ["craig-kimbrel", "Craig Kimbrel", ["Kimbrel"]],
  ["kenley-jansen", "Kenley Jansen", ["Jansen"]],
  ["aroldis-chapman", "Aroldis Chapman", ["Chapman"]],
  ["josh-hader", "Josh Hader", ["Hader"]],
  ["edwin-diaz", "Edwin Diaz", ["Edwin Díaz", "Diaz", "Díaz"]],
  ["emmanuel-clase", "Emmanuel Clase", ["Clase"]],
  ["liam-hendriks", "Liam Hendriks", ["Hendriks"]],
  ["raisel-iglesias", "Raisel Iglesias", ["Iglesias"]],
  ["ryan-pressly", "Ryan Pressly", ["Pressly"]],
  ["trevor-rosenthal", "Trevor Rosenthal", ["Rosenthal"]],
  ["david-robertson", "David Robertson", ["D-Rob", "DRob", "Robertson"]],
  ["brad-hand", "Brad Hand"],
  ["wade-davis", "Wade Davis"],
  ["dellin-betances", "Dellin Betances", ["Betances"]],
  ["camilo-doval", "Camilo Doval", ["Doval"]],

  ["francisco-lindor", "Francisco Lindor", ["Lindor"]],
  ["carlos-correa", "Carlos Correa", ["Correa"]],
  ["corey-seager", "Corey Seager", ["Seager"]],
  ["trea-turner", "Trea Turner", ["Trea"]],
  ["xander-bogaerts", "Xander Bogaerts", ["Xander"]],
  ["trevor-story", "Trevor Story", ["Story"]],
  ["javier-baez", "Javier Baez", ["Javier Báez", "Javy", "El Mago"]],
  ["dansby-swanson", "Dansby Swanson", ["Dansby"]],
  ["tim-anderson", "Tim Anderson"],
  ["bo-bichette", "Bo Bichette", ["Bo"]],
  ["marcus-semien", "Marcus Semien", ["Semien"]],
  ["kyle-seager", "Kyle Seager"],

  ["billy-hamilton", "Billy Hamilton"],
  ["dee-gordon", "Dee Gordon", ["Dee Strange-Gordon", "Dee Strange Gordon"]],
  ["jose-reyes", "Jose Reyes", ["José Reyes", "Reyes"]],
  ["jacoby-ellsbury", "Jacoby Ellsbury", ["Ellsbury"]],
  ["starling-marte", "Starling Marte", ["Starling"]],
  ["elvis-andrus", "Elvis Andrus", ["Andrus"]],
  ["michael-bourn", "Michael Bourn", ["Bourn"]],
  ["rajai-davis", "Rajai Davis", ["Rajai"]],
  ["carlos-gomez", "Carlos Gomez", ["Carlos Gómez", "Gomez", "Gómez"]],
  ["ben-revere", "Ben Revere"],
  ["jean-segura", "Jean Segura"],

  ["juan-soto", "Juan Soto", ["Soto"]],
  ["jose-ramirez", "Jose Ramirez", ["José Ramírez", "J-Ram", "J Ram"]],
  ["rafael-devers", "Rafael Devers", ["Devers"]],
  ["fernando-tatis-jr", "Fernando Tatis Jr.", ["Fernando Tatis", "Fernando Tatís Jr.", "Tatis", "Tatís"]],
  ["ketel-marte", "Ketel Marte", ["Ketel"]],
  ["marcell-ozuna", "Marcell Ozuna", ["Ozuna"]],
  ["teoscar-hernandez", "Teoscar Hernandez", ["Teoscar Hernández", "Teoscar"]],
  ["sandy-alcantara", "Sandy Alcantara", ["Sandy"]],
  ["framber-valdez", "Framber Valdez", ["Framber"]],
  ["luis-castillo", "Luis Castillo", ["Castillo"]],

  ["nolan-arenado", "Nolan Arenado", ["Arenado"]],
  ["manny-machado", "Manny Machado", ["Machado"]],
  ["josh-donaldson", "Josh Donaldson", ["Donaldson"]],
  ["kris-bryant", "Kris Bryant", ["KB"]],
  ["alex-bregman", "Alex Bregman", ["Bregman"]],
  ["matt-chapman", "Matt Chapman", ["Chapman"]],
  ["anthony-rendon", "Anthony Rendon", ["Rendon"]],
  ["eugenio-suarez", "Eugenio Suarez", ["Eugenio Suárez", "Suarez", "Suárez"]],

  ["ozzie-albies", "Ozzie Albies", ["Albies"]],
  ["anthony-santander", "Anthony Santander", ["Santander"]],
  ["bryan-reynolds", "Bryan Reynolds", ["Reynolds"]],
  ["ian-happ", "Ian Happ", ["Happ"]],
  ["tommy-edman", "Tommy Edman", ["Edman"]],
  ["josh-bell", "Josh Bell"],
  ["jurickson-profar", "Jurickson Profar", ["Profar"]],
];

const oct12Entities = oct12Rows.map((row) => entity(OCT12_PREFIX, row));

export const MLB_SPORTS_FEUD_OCT12_PACK: FamilyFeudPack = {
  id: "mlb-sports-feud-oct12-production-v1",
  sport: "mlb",
  entities: oct12Entities,
  mainBoards: [
    question(
      OCT12_PREFIX,
      "main-playoff-catcher",
      "Name an MLB catcher since 2000 you would want behind the plate for a playoff series.",
      [
        "yadier-molina", "ivan-rodriguez", "salvador-perez", "jorge-posada",
        "jason-varitek", "mike-piazza", "jt-realmuto", "brian-mccann",
        "russell-martin", "yasmani-grandal", "willson-contreras", "adley-rutschman",
      ],
      MAIN_POINTS,
      ["aj-pierzynski", "christian-vazquez", "victor-martinez"],
    ),
    question(
      OCT12_PREFIX,
      "main-modern-closer",
      "Name a closer whose MLB career began after 2005 that you would trust with a one-run lead.",
      [
        "craig-kimbrel", "kenley-jansen", "aroldis-chapman", "josh-hader",
        "edwin-diaz", "emmanuel-clase", "liam-hendriks", "raisel-iglesias",
        "ryan-pressly", "trevor-rosenthal", "david-robertson", "brad-hand",
      ],
      MAIN_POINTS,
      ["wade-davis", "dellin-betances", "camilo-doval"],
    ),
  ],
  fastMoney: [
    question(
      OCT12_PREFIX,
      "fast-2010s-shortstop",
      "Name a shortstop who debuted in the 2010s and became an MLB star.",
      [
        "francisco-lindor", "carlos-correa", "corey-seager", "trea-turner",
        "xander-bogaerts", "trevor-story", "javier-baez", "dansby-swanson",
        "tim-anderson", "bo-bichette",
      ],
      FAST_POINTS,
      ["marcus-semien"],
    ),
    question(
      OCT12_PREFIX,
      "fast-2010s-speed",
      "Name an MLB player you remember as a major stolen-base threat in the 2010s.",
      [
        "billy-hamilton", "trea-turner", "dee-gordon", "jose-reyes",
        "starling-marte", "jacoby-ellsbury", "elvis-andrus", "michael-bourn",
        "rajai-davis", "carlos-gomez",
      ],
      FAST_POINTS,
      ["ben-revere", "jean-segura"],
    ),
    question(
      OCT12_PREFIX,
      "fast-dominican-debut",
      "Name a Dominican-born MLB star who debuted after 2009.",
      [
        "juan-soto", "jose-ramirez", "fernando-tatis-jr", "rafael-devers",
        "ketel-marte", "starling-marte", "sandy-alcantara", "teoscar-hernandez",
        "framber-valdez", "luis-castillo",
      ],
      FAST_POINTS,
      ["marcell-ozuna"],
    ),
    question(
      OCT12_PREFIX,
      "fast-2010s-third-base",
      "Name a third baseman who debuted in the 2010s and became an MLB star.",
      [
        "nolan-arenado", "manny-machado", "josh-donaldson", "jose-ramirez",
        "kris-bryant", "rafael-devers", "alex-bregman", "matt-chapman",
        "anthony-rendon", "eugenio-suarez",
      ],
      FAST_POINTS,
      ["kyle-seager"],
    ),
    question(
      OCT12_PREFIX,
      "fast-2020s-switch-hitter",
      "Name a switch-hitting MLB star from the 2020s.",
      [
        "jose-ramirez", "francisco-lindor", "ketel-marte", "ozzie-albies",
        "anthony-santander", "adley-rutschman", "bryan-reynolds", "ian-happ",
        "tommy-edman", "josh-bell",
      ],
      FAST_POINTS,
      ["jurickson-profar"],
    ),
  ],
};

const OCT27_PREFIX = "mlb-oct27-feud";
const oct27Rows: readonly EntityRow[] = [
  ["jose-altuve", "Jose Altuve", ["José Altuve", "Altuve"]],
  ["robinson-cano", "Robinson Cano", ["Robinson Canó", "Cano", "Canó"]],
  ["chase-utley", "Chase Utley", ["Utley"]],
  ["dustin-pedroia", "Dustin Pedroia", ["Pedroia"]],
  ["marcus-semien", "Marcus Semien", ["Semien"]],
  ["ian-kinsler", "Ian Kinsler", ["Kinsler"]],
  ["dj-lemahieu", "DJ LeMahieu", ["D.J. LeMahieu", "LeMahieu"]],
  ["brandon-phillips", "Brandon Phillips", ["Phillips"]],
  ["jeff-kent", "Jeff Kent", ["Kent"]],
  ["ben-zobrist", "Ben Zobrist", ["Zobrist"]],
  ["ozzie-albies", "Ozzie Albies", ["Albies"]],
  ["brian-roberts", "Brian Roberts", ["Roberts"]],
  ["howie-kendrick", "Howie Kendrick", ["Kendrick"]],
  ["gleyber-torres", "Gleyber Torres", ["Gleyber"]],
  ["dan-uggla", "Dan Uggla", ["Uggla"]],

  ["bruce-bochy", "Bruce Bochy", ["Bochy"]],
  ["joe-torre", "Joe Torre", ["Torre"]],
  ["terry-francona", "Terry Francona", ["Tito Francona", "Tito"]],
  ["tony-la-russa", "Tony La Russa", ["La Russa", "LaRussa"]],
  ["dusty-baker", "Dusty Baker", ["Dusty"]],
  ["joe-maddon", "Joe Maddon", ["Maddon"]],
  ["bobby-cox", "Bobby Cox", ["Cox"]],
  ["dave-roberts", "Dave Roberts", ["Roberts"]],
  ["jim-leyland", "Jim Leyland", ["Leyland"]],
  ["mike-scioscia", "Mike Scioscia", ["Scioscia"]],
  ["aj-hinch", "A.J. Hinch", ["AJ Hinch", "Hinch"]],
  ["ron-washington", "Ron Washington", ["Wash", "Washington"]],
  ["kevin-cash", "Kevin Cash", ["Cash"]],
  ["craig-counsell", "Craig Counsell", ["Counsell"]],

  ["jose-abreu", "Jose Abreu", ["José Abreu", "Abreu"]],
  ["yordan-alvarez", "Yordan Alvarez", ["Yordan Álvarez", "Yordan"]],
  ["yoenis-cespedes", "Yoenis Cespedes", ["Yoenis Céspedes", "Cespedes", "Céspedes"]],
  ["aroldis-chapman", "Aroldis Chapman", ["Chapman"]],
  ["randy-arozarena", "Randy Arozarena", ["Arozarena"]],
  ["yasiel-puig", "Yasiel Puig", ["Puig"]],
  ["jorge-soler", "Jorge Soler", ["Soler"]],
  ["yuli-gurriel", "Yuli Gurriel", ["Yulieski Gurriel", "Gurriel"]],
  ["luis-robert-jr", "Luis Robert Jr.", ["Luis Robert", "La Pantera"]],
  ["yoan-moncada", "Yoan Moncada", ["Yoán Moncada", "Moncada"]],
  ["lourdes-gurriel-jr", "Lourdes Gurriel Jr.", ["Lourdes Gurriel", "Gurriel Jr"]],
  ["raisel-iglesias", "Raisel Iglesias", ["Iglesias"]],

  ["emmanuel-clase", "Emmanuel Clase", ["Clase"]],
  ["edwin-diaz", "Edwin Diaz", ["Edwin Díaz", "Diaz", "Díaz"]],
  ["jhoan-duran", "Jhoan Duran", ["Duran", "Durán"]],
  ["andres-munoz", "Andres Munoz", ["Andrés Muñoz", "Munoz", "Muñoz"]],
  ["jordan-hicks", "Jordan Hicks", ["Hicks"]],
  ["ryan-helsley", "Ryan Helsley", ["Helsley"]],
  ["mason-miller", "Mason Miller", ["Miller"]],
  ["camilo-doval", "Camilo Doval", ["Doval"]],
  ["brusdar-graterol", "Brusdar Graterol", ["Graterol"]],
  ["gregory-soto", "Gregory Soto", ["Soto"]],

  ["nolan-arenado", "Nolan Arenado", ["Arenado"]],
  ["manny-machado", "Manny Machado", ["Machado"]],
  ["josh-donaldson", "Josh Donaldson", ["Donaldson"]],
  ["kris-bryant", "Kris Bryant", ["KB"]],
  ["jose-ramirez", "Jose Ramirez", ["José Ramírez", "J-Ram", "J Ram"]],
  ["rafael-devers", "Rafael Devers", ["Devers"]],
  ["alex-bregman", "Alex Bregman", ["Bregman"]],
  ["matt-chapman", "Matt Chapman", ["Chapman"]],
  ["anthony-rendon", "Anthony Rendon", ["Rendon"]],
  ["eugenio-suarez", "Eugenio Suarez", ["Eugenio Suárez", "Suarez", "Suárez"]],

  ["chris-taylor", "Chris Taylor", ["CT3", "Taylor"]],
  ["kike-hernandez", "Kike Hernandez", ["Kiké Hernández", "Enrique Hernandez", "Enrique Hernández", "Kike"]],
  ["marwin-gonzalez", "Marwin Gonzalez", ["Marwin González", "Marwin"]],
  ["whit-merrifield", "Whit Merrifield", ["Whit"]],
  ["tommy-edman", "Tommy Edman", ["Edman"]],
  ["jurickson-profar", "Jurickson Profar", ["Profar"]],
  ["brock-holt", "Brock Holt", ["Brockstar"]],
  ["josh-harrison", "Josh Harrison", ["J-Hay", "J Hay"]],
  ["brandon-drury", "Brandon Drury", ["Drury"]],

  ["fernando-tatis-jr", "Fernando Tatis Jr.", ["Fernando Tatis", "Fernando Tatís Jr.", "Tatis", "Tatís"]],
  ["carlos-correa", "Carlos Correa", ["Correa"]],
  ["oneil-cruz", "Oneil Cruz", ["Cruz"]],
  ["elly-de-la-cruz", "Elly De La Cruz", ["Elly", "De La Cruz"]],
  ["javier-baez", "Javier Baez", ["Javier Báez", "Javy", "El Mago"]],
  ["francisco-lindor", "Francisco Lindor", ["Lindor"]],
  ["trevor-story", "Trevor Story", ["Story"]],

  ["charlie-blackmon", "Charlie Blackmon", ["Chuck Nazty", "Blackmon"]],
  ["brian-wilson", "Brian Wilson", ["The Beard"]],
  ["rollie-fingers", "Rollie Fingers", ["Fingers"]],
  ["dallas-keuchel", "Dallas Keuchel", ["Keuchel"]],
  ["justin-turner", "Justin Turner", ["JT"]],
  ["jayson-werth", "Jayson Werth", ["Werth"]],
  ["mike-napoli", "Mike Napoli", ["Napoli"]],
  ["matt-carpenter", "Matt Carpenter", ["Carpenter", "Carp"]],
  ["goose-gossage", "Goose Gossage", ["Rich Gossage", "Goose"]],
  ["brandon-marsh", "Brandon Marsh", ["Marsh"]],
];

const oct27Entities = oct27Rows.map((row) => entity(OCT27_PREFIX, row));

export const MLB_SPORTS_FEUD_OCT27_PACK: FamilyFeudPack = {
  id: "mlb-sports-feud-oct27-production-v1",
  sport: "mlb",
  entities: oct27Entities,
  mainBoards: [
    question(
      OCT27_PREFIX,
      "main-second-baseman",
      "Name an MLB second baseman since 2000 you would want for one season at his peak.",
      [
        "jose-altuve", "robinson-cano", "chase-utley", "dustin-pedroia",
        "marcus-semien", "ian-kinsler", "dj-lemahieu", "brandon-phillips",
        "jeff-kent", "ben-zobrist", "ozzie-albies", "brian-roberts",
      ],
      MAIN_POINTS,
      ["howie-kendrick", "gleyber-torres", "dan-uggla"],
    ),
    question(
      OCT27_PREFIX,
      "main-october-manager",
      "Name an MLB manager since 2000 you would trust in a winner-take-all playoff game.",
      [
        "bruce-bochy", "joe-torre", "terry-francona", "tony-la-russa",
        "dusty-baker", "joe-maddon", "bobby-cox", "jim-leyland",
        "dave-roberts", "mike-scioscia", "aj-hinch", "ron-washington",
      ],
      MAIN_POINTS,
      ["kevin-cash", "craig-counsell"],
    ),
  ],
  fastMoney: [
    question(
      OCT27_PREFIX,
      "fast-cuban-star",
      "Name a Cuban-born MLB star from the 2010s or 2020s.",
      [
        "jose-abreu", "yordan-alvarez", "yoenis-cespedes", "aroldis-chapman",
        "randy-arozarena", "yasiel-puig", "jorge-soler", "yuli-gurriel",
        "luis-robert-jr", "yoan-moncada",
      ],
      FAST_POINTS,
      ["lourdes-gurriel-jr", "raisel-iglesias"],
    ),
    question(
      OCT27_PREFIX,
      "fast-100-mph-reliever",
      "Name a reliever from the 2010s or 2020s known for throwing 100 mph.",
      [
        "aroldis-chapman", "emmanuel-clase", "edwin-diaz", "jhoan-duran",
        "andres-munoz", "jordan-hicks", "ryan-helsley", "mason-miller",
        "camilo-doval", "brusdar-graterol",
      ],
      FAST_POINTS,
      ["gregory-soto"],
    ),
    question(
      OCT27_PREFIX,
      "fast-modern-third-baseman",
      "Name a third baseman who debuted after 2009 and became an MLB star.",
      [
        "nolan-arenado", "manny-machado", "josh-donaldson", "jose-ramirez",
        "kris-bryant", "rafael-devers", "alex-bregman", "matt-chapman",
        "anthony-rendon", "eugenio-suarez",
      ],
      FAST_POINTS,
    ),
    question(
      OCT27_PREFIX,
      "fast-utility-player",
      "Name an MLB player from the 2010s or 2020s known for playing all over the field.",
      [
        "ben-zobrist", "chris-taylor", "kike-hernandez", "marwin-gonzalez",
        "whit-merrifield", "tommy-edman", "jurickson-profar", "brock-holt",
        "josh-harrison", "brandon-drury",
      ],
      FAST_POINTS,
    ),
    question(
      OCT27_PREFIX,
      "fast-facial-hair",
      "Name an MLB player whose facial hair became part of his baseball identity.",
      [
        "charlie-blackmon", "brian-wilson", "rollie-fingers", "dallas-keuchel",
        "justin-turner", "jayson-werth", "mike-napoli", "matt-carpenter",
        "goose-gossage", "brandon-marsh",
      ],
      FAST_POINTS,
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

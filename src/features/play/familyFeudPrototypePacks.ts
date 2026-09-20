import type {
  FamilyFeudEntity,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";

const MAIN_POINTS = [30, 24, 18, 13, 9, 6] as const;
const FAST_POINTS = [40, 30, 20, 15, 10, 5] as const;

function entity(
  id: string,
  displayName: string,
  aliases: readonly string[] = [],
): FamilyFeudEntity {
  return { id, displayName, kind: "person", aliases };
}

function question(
  id: string,
  prompt: string,
  candidateIds: readonly string[],
  answerIds: readonly string[],
  points: readonly number[],
): FamilyFeudQuestion {
  return {
    id,
    prompt,
    candidateIds,
    answers: answerIds.map((entityId, index) => ({
      entityId,
      points: points[index]!,
    })),
  };
}

const footballEntities: readonly FamilyFeudEntity[] = [
  entity("stafford", "Matthew Stafford"),
  entity("goff", "Jared Goff"),
  entity("maye", "Drake Maye"),
  entity("prescott", "Dak Prescott", ["Dak"]),
  entity("lawrence", "Trevor Lawrence"),
  entity("caleb-williams", "Caleb Williams", ["Caleb"]),
  entity("darnold", "Sam Darnold"),
  entity("nix", "Bo Nix"),
  entity("herbert", "Justin Herbert"),
  entity("mayfield", "Baker Mayfield"),
  entity("josh-allen", "Josh Allen"),
  entity("mahomes", "Patrick Mahomes", ["Mahomes"]),
  entity("cook", "James Cook"),
  entity("henry", "Derrick Henry"),
  entity("taylor", "Jonathan Taylor"),
  entity("bijan", "Bijan Robinson", ["Bijan"]),
  entity("achane", "De'Von Achane", ["Devon Achane", "Achane"]),
  entity("kyren", "Kyren Williams", ["Kyren"]),
  entity("gibbs", "Jahmyr Gibbs"),
  entity("mccaffrey", "Christian McCaffrey", ["CMC"]),
  entity("javonte", "Javonte Williams", ["Javonte"]),
  entity("walker", "Kenneth Walker III", ["Kenneth Walker", "K9"]),
  entity("jsn", "Jaxon Smith-Njigba", ["JSN", "Jaxon Smith Njigba"]),
  entity("nacua", "Puka Nacua", ["Puka"]),
  entity("pickens", "George Pickens"),
  entity("chase", "Ja'Marr Chase", ["Jamarr Chase"]),
  entity("st-brown", "Amon-Ra St. Brown", ["Amon Ra", "Amon Ra St Brown", "St Brown"]),
  entity("mcbride", "Trey McBride"),
  entity("flowers", "Zay Flowers"),
  entity("olave", "Chris Olave"),
  entity("lamb", "CeeDee Lamb", ["Ceedee Lamb"]),
  entity("jefferson", "Justin Jefferson", ["JJ"]),
];

const footballPassingCandidates = [
  "stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams",
  "darnold", "nix", "herbert", "mayfield", "josh-allen", "mahomes",
] as const;

const footballRushingCandidates = [
  "cook", "henry", "taylor", "bijan", "achane", "kyren",
  "gibbs", "mccaffrey", "javonte", "walker",
] as const;

const footballReceivingCandidates = [
  "jsn", "nacua", "pickens", "chase", "st-brown", "mcbride",
  "flowers", "olave", "lamb", "jefferson",
] as const;

export const FOOTBALL_FAMILY_FEUD_PROTOTYPE: FamilyFeudPack = {
  id: "football-prototype-2025-leaders",
  sport: "football",
  entities: footballEntities,
  mainBoards: [
    question(
      "football-2025-passing-tds",
      "Name the 6 QBs with the most passing TDs in the 2025 NFL season.",
      footballPassingCandidates,
      ["stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams"],
      MAIN_POINTS,
    ),
    question(
      "football-2025-rushing-yards",
      "Name the 6 players with the most rushing yards in the 2025 NFL season.",
      footballRushingCandidates,
      ["cook", "henry", "taylor", "bijan", "achane", "kyren"],
      MAIN_POINTS,
    ),
  ],
  fastMoney: [
    question(
      "football-fast-passing-tds",
      "Name one of the 6 QBs with the most passing TDs in 2025.",
      footballPassingCandidates,
      ["stafford", "goff", "maye", "prescott", "lawrence", "caleb-williams"],
      FAST_POINTS,
    ),
    question(
      "football-fast-rushing-yards",
      "Name one of the 6 players with the most rushing yards in 2025.",
      footballRushingCandidates,
      ["cook", "henry", "taylor", "bijan", "achane", "kyren"],
      FAST_POINTS,
    ),
    question(
      "football-fast-receiving-yards",
      "Name one of the 6 players with the most receiving yards in 2025.",
      footballReceivingCandidates,
      ["jsn", "nacua", "pickens", "chase", "st-brown", "mcbride"],
      FAST_POINTS,
    ),
    question(
      "football-fast-passing-yards",
      "Name one of the 6 QBs with the most passing yards in 2025.",
      footballPassingCandidates,
      ["stafford", "goff", "prescott", "maye", "darnold", "lawrence"],
      FAST_POINTS,
    ),
    question(
      "football-fast-rushing-first-downs",
      "Name one of the 6 players with the most rushing first downs in 2025.",
      footballRushingCandidates,
      ["taylor", "henry", "kyren", "mccaffrey", "cook", "javonte"],
      FAST_POINTS,
    ),
  ],
};

const ufcEntities: readonly FamilyFeudEntity[] = [
  entity("jim-miller", "Jim Miller"),
  entity("oliveira", "Charles Oliveira", ["Do Bronx"]),
  entity("magny", "Neil Magny"),
  entity("holloway", "Max Holloway", ["Blessed"]),
  entity("arlovski", "Andrei Arlovski"),
  entity("cerrone", "Donald Cerrone", ["Cowboy", "Cowboy Cerrone"]),
  entity("maia", "Demian Maia"),
  entity("jon-jones", "Jon Jones", ["Bones"]),
  entity("poirier", "Dustin Poirier", ["Diamond", "The Diamond"]),
  entity("rda", "Rafael Dos Anjos", ["RDA", "Rafael dos Anjos"]),
  entity("lewis", "Derrick Lewis", ["Black Beast"]),
  entity("matt-brown", "Matt Brown"),
  entity("luque", "Vicente Luque"),
  entity("anderson", "Anderson Silva", ["Spider", "The Spider"]),
  entity("mir", "Frank Mir"),
  entity("lauzon", "Joe Lauzon"),
  entity("glover", "Glover Teixeira"),
  entity("meerschaert", "Gerald Meerschaert", ["GM3"]),
  entity("nate-diaz", "Nate Diaz"),
  entity("chiesa", "Michael Chiesa"),
  entity("gsp", "Georges St-Pierre", ["GSP", "Georges St Pierre"]),
  entity("dj", "Demetrious Johnson", ["Mighty Mouse"]),
  entity("nunes", "Amanda Nunes", ["Lioness"]),
  entity("valentina", "Valentina Shevchenko", ["Bullet", "The Bullet"]),
  entity("matt-hughes", "Matt Hughes"),
  entity("couture", "Randy Couture"),
  entity("aldo", "Jose Aldo", ["José Aldo"]),
  entity("volkanovski", "Alexander Volkanovski", ["Volk"]),
  entity("adesanya", "Israel Adesanya", ["Izzy"]),
  entity("guida", "Clay Guida"),
  entity("stephens", "Jeremy Stephens"),
  entity("barboza", "Edson Barboza"),
];

const ufcWinCandidates = [
  "jim-miller", "oliveira", "magny", "holloway", "arlovski", "cerrone",
  "maia", "jon-jones", "poirier", "rda",
] as const;

const ufcSubmissionCandidates = [
  "oliveira", "jim-miller", "maia", "meerschaert", "nate-diaz", "chiesa",
  "mir", "gsp", "jon-jones", "rda",
] as const;

const ufcFinishCandidates = [
  "oliveira", "jim-miller", "cerrone", "lewis", "matt-brown", "poirier",
  "luque", "anderson", "holloway", "mir", "lauzon", "glover",
] as const;

const ufcTitleWinCandidates = [
  "jon-jones", "gsp", "dj", "anderson", "nunes", "valentina",
  "matt-hughes", "couture", "aldo", "volkanovski", "adesanya",
] as const;

const ufcFightCandidates = [
  "jim-miller", "arlovski", "cerrone", "magny", "guida", "oliveira",
  "rda", "stephens", "maia", "barboza", "holloway",
] as const;

export const UFC_FAMILY_FEUD_PROTOTYPE: FamilyFeudPack = {
  id: "ufc-prototype-record-book",
  sport: "ufc",
  entities: ufcEntities,
  mainBoards: [
    question(
      "ufc-most-wins",
      "Name the 6 fighters with the most wins in UFC history.",
      ufcWinCandidates,
      ["jim-miller", "oliveira", "magny", "holloway", "arlovski", "cerrone"],
      [30, 22, 22, 14, 6, 6],
    ),
    question(
      "ufc-submission-wins",
      "Name the 6 fighters with the most submission wins in UFC history.",
      ufcSubmissionCandidates,
      ["oliveira", "jim-miller", "maia", "meerschaert", "nate-diaz", "chiesa"],
      [30, 24, 16, 16, 9, 5],
    ),
  ],
  fastMoney: [
    question(
      "ufc-fast-wins",
      "Name one of the 6 fighters with the most UFC wins.",
      ufcWinCandidates,
      ["jim-miller", "oliveira", "magny", "holloway", "arlovski", "cerrone"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-finishes",
      "Name one of the 6 fighters with the most UFC finishes.",
      ufcFinishCandidates,
      ["oliveira", "jim-miller", "cerrone", "lewis", "matt-brown", "poirier"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-submissions",
      "Name one of the 6 fighters with the most UFC submission wins.",
      ufcSubmissionCandidates,
      ["oliveira", "jim-miller", "maia", "meerschaert", "nate-diaz", "chiesa"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-title-wins",
      "Name one of the 6 fighters with the most UFC title-fight wins.",
      ufcTitleWinCandidates,
      ["jon-jones", "gsp", "dj", "anderson", "nunes", "valentina"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-fights",
      "Name one of the 6 fighters with the most UFC fights.",
      ufcFightCandidates,
      ["jim-miller", "arlovski", "cerrone", "magny", "guida", "oliveira"],
      FAST_POINTS,
    ),
  ],
};

export function familyFeudPrototypePack(scope: "ufc" | "football") {
  return scope === "ufc" ? UFC_FAMILY_FEUD_PROTOTYPE : FOOTBALL_FAMILY_FEUD_PROTOTYPE;
}

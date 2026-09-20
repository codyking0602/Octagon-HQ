import type {
  FamilyFeudEntity,
  FamilyFeudEntityKind,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";

const MAIN_POINTS = [10, 8, 7, 5, 5, 4, 4, 3, 3, 2, 2, 2] as const;
const FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1, 1, 1] as const;

function entity(
  id: string,
  displayName: string,
  aliases: readonly string[] = [],
  kind: FamilyFeudEntityKind = "person",
): FamilyFeudEntity {
  return { id, displayName, kind, aliases };
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
  entity("ceedee", "CeeDee Lamb", ["Ceedee Lamb", "CeeDee"]),
  entity("micah", "Micah Parsons", ["Micah"]),
  entity("dak", "Dak Prescott", ["Dak"]),
  entity("trevon", "Trevon Diggs"),
  entity("pollard", "Tony Pollard"),
  entity("amari", "Amari Cooper"),
  entity("zeke", "Ezekiel Elliott", ["Zeke"]),
  entity("turpin", "KaVontae Turpin", ["Kavontae Turpin"]),
  entity("bland", "DaRon Bland", ["Daron Bland"]),
  entity("ferguson", "Jake Ferguson"),
  entity("dlaw", "DeMarcus Lawrence", ["Tank Lawrence", "Tank"]),
  entity("zack-martin", "Zack Martin"),
  entity("schultz", "Dalton Schultz"),

  entity("brady", "Tom Brady", ["TB12"]),
  entity("rodgers", "Aaron Rodgers"),
  entity("mahomes", "Patrick Mahomes", ["Mahomes"]),
  entity("brees", "Drew Brees"),
  entity("peyton", "Peyton Manning"),
  entity("russ", "Russell Wilson", ["Russ"]),
  entity("big-ben", "Ben Roethlisberger", ["Big Ben"]),
  entity("luck", "Andrew Luck"),
  entity("eli", "Eli Manning"),
  entity("cam", "Cam Newton"),
  entity("matt-ryan", "Matt Ryan"),
  entity("rivers", "Philip Rivers"),
  entity("romo", "Tony Romo"),
  entity("flacco", "Joe Flacco"),
  entity("stafford", "Matthew Stafford"),

  entity("garrett", "Myles Garrett"),
  entity("tj-watt", "T.J. Watt", ["TJ Watt"]),
  entity("nick-bosa", "Nick Bosa"),
  entity("crosby", "Maxx Crosby", ["Max Crosby"]),
  entity("chris-jones", "Chris Jones"),
  entity("hendrickson", "Trey Hendrickson"),
  entity("hutchinson", "Aidan Hutchinson"),
  entity("khalil-mack", "Khalil Mack"),
  entity("brian-burns", "Brian Burns"),

  entity("tyreek", "Tyreek Hill", ["Cheetah"]),
  entity("jefferson", "Justin Jefferson", ["JJ"]),
  entity("henry", "Derrick Henry", ["King Henry"]),
  entity("saquon", "Saquon Barkley"),
  entity("cmc", "Christian McCaffrey", ["CMC"]),
  entity("chase", "Ja'Marr Chase", ["Jamarr Chase"]),
  entity("bijan", "Bijan Robinson", ["Bijan"]),
  entity("davante", "Davante Adams"),

  entity("burrow", "Joe Burrow", ["Joe Brrr"]),
  entity("vince-young", "Vince Young"),
  entity("tebow", "Tim Tebow"),
  entity("lamar", "Lamar Jackson"),
  entity("caleb", "Caleb Williams", ["Caleb"]),
  entity("kyler", "Kyler Murray"),
  entity("leinart", "Matt Leinart"),
  entity("manziel", "Johnny Manziel", ["Johnny Football"]),
  entity("deshaun", "Deshaun Watson"),

  entity("adrian-peterson", "Adrian Peterson", ["AP", "All Day"]),
  entity("marshawn", "Marshawn Lynch", ["Beast Mode"]),
  entity("bettis", "Jerome Bettis", ["The Bus"]),
  entity("lt", "LaDainian Tomlinson", ["LT", "Ladanian Tomlinson"]),
  entity("gore", "Frank Gore"),
  entity("jamal-lewis", "Jamal Lewis"),
  entity("steven-jackson", "Steven Jackson"),

  entity("calvin", "Calvin Johnson", ["Megatron"]),
  entity("julio", "Julio Jones"),
  entity("hopkins", "DeAndre Hopkins", ["DHop", "D Hop"]),
  entity("fitzgerald", "Larry Fitzgerald", ["Larry Fitz"]),
  entity("dez", "Dez Bryant"),
  entity("antonio-brown", "Antonio Brown", ["AB"]),
  entity("aj-green", "A.J. Green", ["AJ Green"]),
  entity("demaryius", "Demaryius Thomas"),
  entity("brandon-marshall", "Brandon Marshall"),
  entity("mike-evans", "Mike Evans"),
];

const cowboysCandidates = [
  "ceedee", "micah", "dak", "trevon", "pollard", "amari", "zeke", "turpin",
  "bland", "ferguson", "dlaw", "zack-martin", "schultz",
] as const;

const clutchQbCandidates = [
  "brady", "rodgers", "mahomes", "brees", "peyton", "russ", "big-ben", "luck",
  "eli", "cam", "matt-ryan", "rivers", "romo", "flacco", "stafford",
] as const;

const passRushCandidates = [
  "garrett", "tj-watt", "micah", "nick-bosa", "crosby", "chris-jones",
  "hendrickson", "hutchinson", "khalil-mack", "brian-burns",
] as const;

const mustWatchCandidates = [
  "tyreek", "jefferson", "henry", "saquon", "cmc", "chase", "ceedee", "bijan",
  "davante", "pollard",
] as const;

const collegeQbCandidates = [
  "cam", "burrow", "vince-young", "tebow", "lamar", "caleb", "kyler", "leinart",
  "manziel", "deshaun",
] as const;

const shortYardageCandidates = [
  "henry", "adrian-peterson", "marshawn", "bettis", "lt", "gore", "zeke", "saquon",
  "jamal-lewis", "steven-jackson",
] as const;

const contestedCatchCandidates = [
  "calvin", "julio", "hopkins", "fitzgerald", "dez", "antonio-brown", "aj-green",
  "demaryius", "brandon-marshall", "mike-evans",
] as const;

export const FOOTBALL_FAMILY_FEUD_PROTOTYPE: FamilyFeudPack = {
  id: "football-prototype-hq-opinion-v2",
  sport: "football",
  entities: footballEntities,
  mainBoards: [
    question(
      "football-electric-cowboys-2020s",
      "Who are the most electric Cowboys players of the 2020s?",
      cowboysCandidates,
      ["ceedee", "micah", "dak", "trevon", "pollard", "amari", "zeke", "turpin", "bland", "ferguson"],
      MAIN_POINTS,
    ),
    question(
      "football-clutch-qbs-2010s",
      "Which QBs from the 2010s would you want down 4 late?",
      clutchQbCandidates,
      ["brady", "rodgers", "mahomes", "brees", "peyton", "russ", "big-ben", "luck", "eli", "cam", "matt-ryan"],
      MAIN_POINTS,
    ),
  ],
  fastMoney: [
    question(
      "football-fast-pass-rushers",
      "Name an NFL pass rusher from the 2020s you least want one-on-one.",
      passRushCandidates,
      ["garrett", "tj-watt", "micah", "nick-bosa", "crosby", "chris-jones", "hendrickson", "hutchinson"],
      FAST_POINTS,
    ),
    question(
      "football-fast-must-watch",
      "Name an NFL skill player from the 2020s you would call must-watch TV.",
      mustWatchCandidates,
      ["tyreek", "jefferson", "henry", "saquon", "cmc", "chase", "ceedee", "bijan"],
      FAST_POINTS,
    ),
    question(
      "football-fast-college-qb-peak",
      "Name a college QB since 2000 whose peak season felt unstoppable.",
      collegeQbCandidates,
      ["cam", "burrow", "vince-young", "tebow", "lamar", "caleb", "kyler", "leinart"],
      FAST_POINTS,
    ),
    question(
      "football-fast-one-yard",
      "Name an NFL running back since 2000 you would trust for one must-have yard.",
      shortYardageCandidates,
      ["henry", "adrian-peterson", "marshawn", "bettis", "lt", "gore", "zeke", "saquon"],
      FAST_POINTS,
    ),
    question(
      "football-fast-contested-catch",
      "Name a receiver from the 2010s you would want for one contested catch.",
      contestedCatchCandidates,
      ["calvin", "julio", "hopkins", "fitzgerald", "dez", "antonio-brown", "aj-green", "demaryius"],
      FAST_POINTS,
    ),
  ],
};

const ufcEntities: readonly FamilyFeudEntity[] = [
  entity("ngannou", "Francis Ngannou", ["Francis"]),
  entity("derrick-lewis", "Derrick Lewis", ["Black Beast", "The Black Beast"]),
  entity("jds", "Junior dos Santos", ["JDS", "Junior Dos Santos"]),
  entity("mark-hunt", "Mark Hunt", ["Super Samoan"]),
  entity("stipe", "Stipe Miocic", ["Stipe"]),
  entity("overeem", "Alistair Overeem", ["Overeem"]),
  entity("carwin", "Shane Carwin"),
  entity("cain", "Cain Velasquez"),
  entity("roy-nelson", "Roy Nelson", ["Big Country"]),
  entity("werdum", "Fabricio Werdum"),
  entity("arlovski", "Andrei Arlovski"),
  entity("dos-anjos", "Rafael dos Anjos", ["RDA", "Rafael Dos Anjos"]),

  entity("gaethje", "Justin Gaethje", ["Highlight", "The Highlight"]),
  entity("poirier", "Dustin Poirier", ["Diamond", "The Diamond"]),
  entity("ferguson", "Tony Ferguson", ["El Cucuy"]),
  entity("mcgregor", "Conor McGregor", ["Conor", "Notorious", "The Notorious"]),
  entity("barboza", "Edson Barboza"),
  entity("pettis", "Anthony Pettis", ["Showtime"]),
  entity("cerrone", "Donald Cerrone", ["Cowboy", "Cowboy Cerrone"]),
  entity("nate", "Nate Diaz"),
  entity("eddie", "Eddie Alvarez"),
  entity("khabib", "Khabib Nurmagomedov", ["Khabib"]),
  entity("oliveira", "Charles Oliveira", ["Do Bronx"]),
  entity("dos-anjos-lw", "Rafael dos Anjos", ["RDA"]),

  entity("jon-jones", "Jon Jones", ["Bones"]),
  entity("gsp", "Georges St-Pierre", ["GSP", "Georges St Pierre"]),
  entity("dj", "Demetrious Johnson", ["Mighty Mouse"]),
  entity("nunes", "Amanda Nunes", ["Lioness"]),
  entity("anderson", "Anderson Silva", ["Spider", "The Spider"]),
  entity("volk", "Alexander Volkanovski", ["Volk"]),
  entity("usman", "Kamaru Usman", ["Nigerian Nightmare"]),
  entity("adesanya", "Israel Adesanya", ["Izzy"]),
  entity("aldo", "Jose Aldo", ["José Aldo"]),
  entity("dc", "Daniel Cormier", ["DC"]),

  entity("rumble", "Anthony Johnson", ["Rumble", "Rumble Johnson"]),
  entity("pereira", "Alex Pereira", ["Poatan"]),
  entity("hendo", "Dan Henderson", ["Hendo"]),
  entity("rampage", "Quinton Jackson", ["Rampage", "Rampage Jackson"]),

  entity("maia", "Demian Maia"),
  entity("jacare", "Ronaldo Souza", ["Jacare", "Jacaré"]),
  entity("mir", "Frank Mir"),
  entity("ortega", "Brian Ortega", ["T City", "T-City"]),
  entity("burns", "Gilbert Burns", ["Durinho"]),
  entity("bj-penn", "B.J. Penn", ["BJ Penn"]),
  entity("tonon", "Garry Tonon"),

  entity("machida", "Lyoto Machida", ["The Dragon"]),
  entity("glover", "Glover Teixeira"),
  entity("figueiredo", "Deiveson Figueiredo", ["Deiveson"]),

  entity("chael", "Chael Sonnen"),
  entity("tito", "Tito Ortiz"),
  entity("chuck", "Chuck Liddell", ["Iceman", "The Iceman"]),
];

const heavyweightPuncherCandidates = [
  "ngannou", "derrick-lewis", "jds", "mark-hunt", "stipe", "overeem", "carwin",
  "cain", "roy-nelson", "werdum", "arlovski",
] as const;

const entertainingLightweightCandidates = [
  "gaethje", "poirier", "ferguson", "mcgregor", "barboza", "pettis", "cerrone",
  "nate", "eddie", "khabib", "oliveira", "dos-anjos-lw",
] as const;

const fiveRoundCandidates = [
  "jon-jones", "gsp", "dj", "nunes", "anderson", "volk", "usman", "adesanya",
  "aldo", "dc",
] as const;

const knockoutCandidates = [
  "ngannou", "rumble", "pereira", "derrick-lewis", "mcgregor", "anderson", "hendo",
  "rampage", "jds", "mark-hunt",
] as const;

const submissionCandidates = [
  "oliveira", "maia", "werdum", "jacare", "mir", "ortega", "burns", "bj-penn",
  "gsp", "tonon",
] as const;

const brazilianChampionCandidates = [
  "anderson", "aldo", "oliveira", "pereira", "nunes", "machida", "glover", "werdum",
  "figueiredo", "dos-anjos",
] as const;

const rivalryCandidates = [
  "mcgregor", "nate", "jon-jones", "dc", "khabib", "chael", "anderson", "tito",
  "chuck", "gsp",
] as const;

export const UFC_FAMILY_FEUD_PROTOTYPE: FamilyFeudPack = {
  id: "ufc-prototype-hq-opinion-v2",
  sport: "ufc",
  entities: ufcEntities,
  mainBoards: [
    question(
      "ufc-scary-heavyweight-punchers-2010s",
      "Who were the scariest UFC heavyweight punchers of the 2010s?",
      heavyweightPuncherCandidates,
      ["ngannou", "derrick-lewis", "jds", "mark-hunt", "stipe", "overeem", "carwin", "cain", "roy-nelson", "werdum"],
      MAIN_POINTS,
    ),
    question(
      "ufc-entertaining-lightweights-2010s",
      "Who were the most entertaining UFC lightweights of the 2010s?",
      entertainingLightweightCandidates,
      ["gaethje", "poirier", "ferguson", "mcgregor", "barboza", "pettis", "cerrone", "nate", "eddie", "khabib"],
      MAIN_POINTS,
    ),
  ],
  fastMoney: [
    question(
      "ufc-fast-five-round",
      "Name a UFC fighter you would trust most in a five-round title fight.",
      fiveRoundCandidates,
      ["jon-jones", "gsp", "dj", "nunes", "anderson", "volk", "usman", "adesanya"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-knockout-power",
      "Name a UFC knockout artist whose power could change the fight instantly.",
      knockoutCandidates,
      ["ngannou", "rumble", "pereira", "derrick-lewis", "mcgregor", "anderson", "hendo", "rampage"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-submission-threat",
      "Name a UFC submission threat you never wanted to grapple with.",
      submissionCandidates,
      ["oliveira", "maia", "werdum", "jacare", "mir", "ortega", "burns", "bj-penn"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-brazilian-champs",
      "Name an iconic Brazilian UFC champion.",
      brazilianChampionCandidates,
      ["anderson", "aldo", "oliveira", "pereira", "nunes", "machida", "glover", "werdum"],
      FAST_POINTS,
    ),
    question(
      "ufc-fast-personal-rivalry",
      "Name a fighter from a UFC rivalry that felt truly personal.",
      rivalryCandidates,
      ["mcgregor", "nate", "jon-jones", "dc", "khabib", "chael", "anderson", "tito", "chuck"],
      FAST_POINTS,
    ),
  ],
};

export function familyFeudPrototypePack(scope: "ufc" | "football") {
  return scope === "ufc" ? UFC_FAMILY_FEUD_PROTOTYPE : FOOTBALL_FAMILY_FEUD_PROTOTYPE;
}

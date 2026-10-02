import {
  barTriviaQuestion,
  type BarTriviaQuestion,
} from "../games/barTriviaEngine";
import type { MillionaireRun } from "../games/millionaireEngine";
import {
  MILLIONAIRE_CHOICE_IDS,
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  type MillionaireChoiceId,
  type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import type {
  SportsFeudAuthoredAnswer,
  SportsFeudAuthoredQuestion,
  SportsFeudBankDomain,
} from "./sportsFeudBankTypes";

type ThemedMillionaireSeed = {
  type: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  answer: string;
  explanation: string;
  statSheet: string | null;
};

function themedMillionaireRun(prefix: string, seeds: readonly ThemedMillionaireSeed[]): MillionaireRun {
  if (seeds.length !== 8) throw new Error(prefix + " Millionaire theme must contain exactly eight questions.");

  return seeds.map((seed, index) => {
    const level = MILLIONAIRE_LEVELS[index]!;
    const answerIndex = seed.choices.indexOf(seed.answer);
    if (answerIndex < 0) throw new Error(prefix + " " + level + " answer is missing from its choices.");

    const correctChoiceId = MILLIONAIRE_CHOICE_IDS[answerIndex]!;
    const survivor = MILLIONAIRE_CHOICE_IDS[(answerIndex + 1) % MILLIONAIRE_CHOICE_IDS.length]!;
    const removalChoiceIds = MILLIONAIRE_CHOICE_IDS.filter(
      (id) => id !== correctChoiceId && id !== survivor,
    ) as [MillionaireChoiceId, MillionaireChoiceId];
    const q8 = level === "Q8";

    return {
      id: prefix + "-" + level.toLowerCase(),
      sport: "football",
      level,
      money: MILLIONAIRE_MONEY_BY_LEVEL[level],
      type: seed.type,
      prompt: seed.prompt,
      choices: MILLIONAIRE_CHOICE_IDS.map((id, choiceIndex) => ({
        id,
        text: seed.choices[choiceIndex]!,
      })) as unknown as MillionaireRuntimeQuestion["choices"],
      correctChoiceId,
      explanation: seed.explanation,
      statSheet: q8 ? null : seed.statSheet,
      fiftyFifty: {
        survivorChoiceIds: [correctChoiceId, survivor],
        removalChoiceIds,
      },
      lifelineCompatibility: {
        fiftyFifty: !q8,
        statSheet: !q8,
        doubleDip: !q8,
      },
    } satisfies MillionaireRuntimeQuestion;
  }) as unknown as MillionaireRun;
}

const TEXAS_OKLAHOMA_MILLIONAIRE = themedMillionaireRun("theme-texas-ou-2026", [
  {
    type: "rivalry-venue",
    prompt: "Texas and Oklahoma traditionally play the Red River Rivalry at which stadium?",
    choices: ["AT&T Stadium", "Cotton Bowl", "DKR-Texas Memorial Stadium", "Gaylord Family Oklahoma Memorial Stadium"],
    answer: "Cotton Bowl",
    explanation: "The Red River Rivalry has long been staged at the Cotton Bowl in Dallas during the State Fair of Texas.",
    statSheet: "The rivalry has been played in Dallas annually since 1912.",
  },
  {
    type: "tradition",
    prompt: "What is the name of the live longhorn mascot associated with Texas athletics?",
    choices: ["Bevo", "Smokey", "Reveille", "Uga"],
    answer: "Bevo",
    explanation: "Bevo is the live longhorn mascot of the University of Texas.",
    statSheet: "The mascot is a live Texas longhorn steer.",
  },
  {
    type: "championship",
    prompt: "Which quarterback led Texas to the 2005 national championship?",
    choices: ["Colt McCoy", "Vince Young", "Major Applewhite", "Chris Simms"],
    answer: "Vince Young",
    explanation: "Vince Young led the unbeaten Longhorns through the 2005 season and the Rose Bowl win over USC.",
    statSheet: "The quarterback also won the Maxwell and Davey O'Brien awards that season.",
  },
  {
    type: "awards",
    prompt: "Which Texas running back won the 1998 Heisman Trophy?",
    choices: ["Earl Campbell", "Cedric Benson", "Ricky Williams", "Jamaal Charles"],
    answer: "Ricky Williams",
    explanation: "Ricky Williams won the 1998 Heisman Trophy after a record-setting senior season at Texas.",
    statSheet: "He became the second Longhorn to win the Heisman Trophy.",
  },
  {
    type: "coaching-history",
    prompt: "Who was Texas' head coach during the 2005 national championship season?",
    choices: ["Darrell Royal", "Mack Brown", "Fred Akers", "Steve Sarkisian"],
    answer: "Mack Brown",
    explanation: "Mack Brown coached Texas to a 13-0 season and the 2005 national championship.",
    statSheet: "His Longhorns ended USC's 34-game winning streak in the Rose Bowl.",
  },
  {
    type: "championship-opponent",
    prompt: "Which team did Texas beat 41-38 in the Rose Bowl to win the 2005 national championship?",
    choices: ["USC", "Ohio State", "Oklahoma", "Michigan"],
    answer: "USC",
    explanation: "Texas beat USC 41-38 in the Rose Bowl to finish the 2005 season undefeated.",
    statSheet: "The opponent entered the game on a 34-game winning streak.",
  },
  {
    type: "defensive-awards",
    prompt: "Which Longhorn won both the Butkus Award and the Bronko Nagurski Trophy in 2004?",
    choices: ["Michael Huff", "Brian Orakpo", "Derrick Johnson", "Aaron Ross"],
    answer: "Derrick Johnson",
    explanation: "Derrick Johnson won both the Butkus Award and the Bronko Nagurski Trophy in 2004.",
    statSheet: "He was a linebacker and unanimous All-American for Texas.",
  },
  {
    type: "heisman-history",
    prompt: "Who became the first Texas Longhorn to win the Heisman Trophy?",
    choices: ["Ricky Williams", "Earl Campbell", "Tommy Nobis", "Vince Young"],
    answer: "Earl Campbell",
    explanation: "Earl Campbell became Texas' first Heisman Trophy winner in 1977.",
    statSheet: null,
  },
]);

const COWBOYS_EAGLES_MILLIONAIRE = themedMillionaireRun("theme-cowboys-eagles-2026", [
  {
    type: "stadium",
    prompt: "What is the home stadium of the Dallas Cowboys?",
    choices: ["AT&T Stadium", "Cotton Bowl", "NRG Stadium", "Ford Field"],
    answer: "AT&T Stadium",
    explanation: "The Cowboys play their home games at AT&T Stadium in Arlington, Texas.",
    statSheet: "The venue opened for the Cowboys in 2009.",
  },
  {
    type: "records",
    prompt: "Which Cowboys legend is the NFL's all-time leading rusher?",
    choices: ["Tony Dorsett", "Emmitt Smith", "Ezekiel Elliott", "Herschel Walker"],
    answer: "Emmitt Smith",
    explanation: "Emmitt Smith retired as the NFL's all-time leading rusher with 18,355 yards.",
    statSheet: "Dallas drafted him in the first round in 1990.",
  },
  {
    type: "iconic-play",
    prompt: "Who caught Roger Staubach's famous 1975 'Hail Mary' pass?",
    choices: ["Drew Pearson", "Tony Hill", "Golden Richards", "Billy Joe DuPree"],
    answer: "Drew Pearson",
    explanation: "Drew Pearson caught Staubach's game-winning touchdown against Minnesota, the play that popularized the 'Hail Mary' name.",
    statSheet: "The catch came in a 1975 playoff win at Minnesota.",
  },
  {
    type: "dynasty",
    prompt: "Which quarterback started for Dallas in all three of its Super Bowl wins during the 1990s?",
    choices: ["Danny White", "Troy Aikman", "Tony Romo", "Roger Staubach"],
    answer: "Troy Aikman",
    explanation: "Troy Aikman quarterbacked Dallas to Super Bowl wins following the 1992, 1993 and 1995 seasons.",
    statSheet: "He was the No. 1 overall pick in the 1989 NFL Draft.",
  },
  {
    type: "coaching-history",
    prompt: "Who was the first head coach in Dallas Cowboys history?",
    choices: ["Jimmy Johnson", "Tom Landry", "Barry Switzer", "Bill Parcells"],
    answer: "Tom Landry",
    explanation: "Tom Landry became the Cowboys' first head coach in 1960 and held the job for 29 seasons.",
    statSheet: "He coached Dallas to its first two Super Bowl championships.",
  },
  {
    type: "draft-history",
    prompt: "Who was the first official draft pick in Cowboys franchise history?",
    choices: ["Bob Lilly", "Roger Staubach", "Mel Renfro", "Don Meredith"],
    answer: "Bob Lilly",
    explanation: "Dallas selected TCU defensive tackle Bob Lilly with the 13th pick of the 1961 NFL Draft.",
    statSheet: "The Hall of Famer became known as 'Mr. Cowboy.'",
  },
  {
    type: "super-bowl-awards",
    prompt: "Which Cowboys cornerback won MVP of Super Bowl XXX after intercepting two passes?",
    choices: ["Deion Sanders", "Larry Brown", "Everson Walls", "Mel Renfro"],
    answer: "Larry Brown",
    explanation: "Larry Brown intercepted two Neil O'Donnell passes and was named MVP of Dallas' Super Bowl XXX win.",
    statSheet: "Both interceptions helped set up Dallas touchdowns against Pittsburgh.",
  },
  {
    type: "super-bowl-history",
    prompt: "Which Cowboys defensive end shared Super Bowl XII MVP honors with Randy White?",
    choices: ["Ed 'Too Tall' Jones", "Harvey Martin", "Charles Haley", "DeMarcus Ware"],
    answer: "Harvey Martin",
    explanation: "Harvey Martin and Randy White were named co-MVPs of Super Bowl XII after Dallas' defense overwhelmed Denver.",
    statSheet: null,
  },
]);

export function footballThemedMillionaireRunForDay(day: string): MillionaireRun | null {
  if (day === "2026-10-10") return TEXAS_OKLAHOMA_MILLIONAIRE;
  if (day === "2026-10-26") return COWBOYS_EAGLES_MILLIONAIRE;
  return null;
}

const COWBOYS_SEAHAWKS_BAR_TRIVIA: readonly BarTriviaQuestion[] = [
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-emmitt-number",
    league: "nfl",
    round: "round1",
    category: "Cowboys Icons",
    prompt: "What jersey number did Emmitt Smith wear for the Cowboys?",
    choices: ["21", "22", "24", "33"],
    answer: "22",
    explanation: "Emmitt Smith wore No. 22 throughout his Cowboys career.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-stadium",
    league: "nfl",
    round: "round1",
    category: "Home Field",
    prompt: "The Cowboys play their home games at which stadium?",
    choices: ["NRG Stadium", "AT&T Stadium", "Cotton Bowl", "Ford Field"],
    answer: "AT&T Stadium",
    explanation: "AT&T Stadium in Arlington has been the Cowboys' home since 2009.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-thanksgiving",
    league: "nfl",
    round: "round1",
    category: "Traditions",
    prompt: "Dallas is one of the NFL's traditional hosts on which holiday?",
    choices: ["Christmas", "New Year's Day", "Thanksgiving", "Labor Day"],
    answer: "Thanksgiving",
    explanation: "The Cowboys became a regular Thanksgiving Day host in 1966.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r2-88",
    league: "nfl",
    round: "round2",
    category: "Jersey Tradition",
    prompt: "Drew Pearson, Michael Irvin, Dez Bryant and CeeDee Lamb have all worn which Cowboys jersey number?",
    choices: ["80", "82", "84", "88"],
    answer: "88",
    explanation: "No. 88 has become a signature Cowboys receiver number across multiple eras.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r2-hail-mary",
    league: "nfl",
    round: "round2",
    category: "Iconic Plays",
    prompt: "Who caught Roger Staubach's famous 1975 'Hail Mary' touchdown?",
    choices: ["Drew Pearson", "Tony Hill", "Butch Johnson", "Golden Richards"],
    answer: "Drew Pearson",
    explanation: "Drew Pearson caught the game-winning playoff touchdown against Minnesota.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r2-emmitt-college",
    league: "nfl",
    round: "round2",
    category: "Before Dallas",
    prompt: "Which college did Emmitt Smith play for before the Cowboys drafted him?",
    choices: ["Florida State", "Florida", "Miami", "Auburn"],
    answer: "Florida",
    explanation: "Smith starred at Florida before Dallas selected him in the first round of the 1990 draft.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-seattle-catch",
    league: "nfl",
    round: "round3",
    category: "Cowboys-Seahawks",
    prompt: "Who made the toe-tapping third-and-20 catch that helped Dallas win at Seattle in 2014?",
    choices: ["Dez Bryant", "Jason Witten", "Terrance Williams", "Cole Beasley"],
    answer: "Terrance Williams",
    explanation: "Terrance Williams' 23-yard sideline catch extended the late drive in Dallas' 30-23 win at Seattle.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-first-pick",
    league: "nfl",
    round: "round3",
    category: "Draft History",
    prompt: "Who was the first official draft pick in Dallas Cowboys history?",
    choices: ["Mel Renfro", "Bob Lilly", "Roger Staubach", "Don Meredith"],
    answer: "Bob Lilly",
    explanation: "Dallas selected Bob Lilly 13th overall in the 1961 NFL Draft.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-super-bowl-xxx",
    league: "nfl",
    round: "round3",
    category: "Super Bowl History",
    prompt: "Which Cowboys cornerback was named MVP of Super Bowl XXX?",
    choices: ["Deion Sanders", "Larry Brown", "Kevin Smith", "Darren Woodson"],
    answer: "Larry Brown",
    explanation: "Larry Brown's two interceptions helped Dallas beat Pittsburgh 27-17 in Super Bowl XXX.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-final-first-sb-qb",
    league: "nfl",
    round: "last-call",
    category: "Quarterback History",
    prompt: "Who started at quarterback for Dallas in the franchise's first Super Bowl appearance?",
    choices: ["Roger Staubach", "Don Meredith", "Craig Morton", "Danny White"],
    answer: "Craig Morton",
    explanation: "Craig Morton started Super Bowl V, Dallas' first Super Bowl appearance.",
    sourceId: "cowboys-theme-history",
  }),
];

export function footballThemedBarTriviaRunForDay(day: string): readonly BarTriviaQuestion[] | null {
  return day === "2026-12-07" ? COWBOYS_SEAHAWKS_BAR_TRIVIA : null;
}

function answer(name: string, aliases?: readonly string[]): SportsFeudAuthoredAnswer {
  return aliases?.length ? { name, aliases } : { name };
}

const TEXAS_AM_SPORTS_FEUD_MAIN: readonly SportsFeudAuthoredQuestion[] = [
  {
    id: "theme-texas-am-2026-main-quarterbacks",
    category: "Texas Quarterbacks",
    entityKind: "person",
    collisionGroup: "texas-quarterbacks",
    prompt: "Name a Texas Longhorn quarterback fans remember.",
    answers: [
      answer("Vince Young", ["VY"]),
      answer("Colt McCoy"),
      answer("Sam Ehlinger"),
      answer("Quinn Ewers"),
      answer("Bobby Layne"),
      answer("Major Applewhite"),
      answer("Chris Simms"),
      answer("James Street"),
    ],
    alsoAcceptedAnswers: [
      answer("Arch Manning"),
      answer("Case McCoy"),
      answer("Peter Gardere"),
      answer("Marty Akins"),
    ],
  },
  {
    id: "theme-texas-am-2026-main-running-backs",
    category: "Texas Running Backs",
    entityKind: "person",
    collisionGroup: "texas-running-backs",
    prompt: "Name a Texas Longhorn running back fans remember.",
    answers: [
      answer("Ricky Williams"),
      answer("Earl Campbell"),
      answer("Jamaal Charles"),
      answer("Bijan Robinson"),
      answer("Cedric Benson"),
      answer("D'Onta Foreman"),
      answer("Priest Holmes"),
      answer("Roosevelt Leaks"),
    ],
    alsoAcceptedAnswers: [
      answer("Chris Gilbert"),
      answer("Steve Worster"),
      answer("Roschon Johnson"),
      answer("Jonathon Brooks"),
    ],
  },
];

const TEXAS_AM_SPORTS_FEUD_FAST: readonly SportsFeudAuthoredQuestion[] = [
  {
    id: "theme-texas-am-2026-fast-coaches",
    category: "Texas Coaches",
    entityKind: "person",
    collisionGroup: "texas-coaches",
    prompt: "Name a Texas head football coach fans remember.",
    answers: [
      answer("Darrell Royal", ["Darrell K Royal", "DKR"]),
      answer("Mack Brown"),
      answer("Steve Sarkisian", ["Sark"]),
      answer("Fred Akers"),
      answer("Dana X. Bible", ["Dana Bible"]),
      answer("John Mackovic"),
      answer("Tom Herman"),
      answer("Charlie Strong"),
    ],
  },
  {
    id: "theme-texas-am-2026-fast-pass-catchers",
    category: "Texas Pass Catchers",
    entityKind: "person",
    collisionGroup: "texas-pass-catchers",
    prompt: "Name a memorable Texas Longhorn receiver or tight end.",
    answers: [
      answer("Roy Williams"),
      answer("Jordan Shipley"),
      answer("Xavier Worthy"),
      answer("Quan Cosby"),
      answer("Limas Sweed"),
      answer("Ja'Tavion Sanders"),
      answer("David Thomas"),
      answer("Lil'Jordan Humphrey"),
    ],
    alsoAcceptedAnswers: [
      answer("Adonai Mitchell", ["AD Mitchell", "A.D. Mitchell"]),
      answer("Collin Johnson"),
      answer("Jaxon Shipley"),
    ],
  },
  {
    id: "theme-texas-am-2026-fast-defenders",
    category: "Texas Defense",
    entityKind: "person",
    collisionGroup: "texas-defenders",
    prompt: "Name a notable Texas Longhorn defensive player.",
    answers: [
      answer("Derrick Johnson"),
      answer("Tommy Nobis"),
      answer("Michael Huff"),
      answer("Brian Orakpo"),
      answer("Aaron Ross"),
      answer("Kenneth Sims"),
      answer("Casey Hampton"),
      answer("T'Vondre Sweat"),
    ],
    alsoAcceptedAnswers: [
      answer("Quandre Diggs"),
      answer("Earl Thomas"),
      answer("Sam Acho"),
      answer("Jackson Jeffcoat"),
    ],
  },
  {
    id: "theme-texas-am-2026-fast-rivals",
    category: "Texas Rivals",
    entityKind: "school",
    collisionGroup: "texas-rivals",
    prompt: "Name a football opponent Texas fans recognize as a historic or regional rival.",
    answers: [
      answer("Oklahoma", ["OU", "Oklahoma Sooners", "Sooners"]),
      answer("Texas A&M", ["A&M", "Texas A and M", "Aggies"]),
      answer("Arkansas", ["Arkansas Razorbacks", "Razorbacks"]),
      answer("Baylor", ["Baylor Bears", "Bears"]),
      answer("TCU", ["TCU Horned Frogs", "Horned Frogs"]),
      answer("Texas Tech", ["Texas Tech Red Raiders", "Red Raiders"]),
      answer("Nebraska", ["Nebraska Cornhuskers", "Cornhuskers"]),
      answer("Rice", ["Rice Owls", "Owls"]),
    ],
  },
  {
    id: "theme-texas-am-2026-fast-traditions",
    category: "Texas Traditions",
    entityKind: "other",
    collisionGroup: "texas-traditions",
    prompt: "Name something strongly associated with Texas Longhorns football game day.",
    answers: [
      answer("Bevo"),
      answer("Hook 'em Horns", ["Hook em", "Hook 'em", "Hookem Horns"]),
      answer("Burnt orange", ["Burnt Orange"]),
      answer("DKR-Texas Memorial Stadium", ["DKR", "Texas Memorial Stadium", "Darrell K Royal-Texas Memorial Stadium"]),
      answer("Texas Fight"),
      answer("The Eyes of Texas", ["Eyes of Texas"]),
      answer("Smokey the Cannon", ["Smokey"]),
      answer("Longhorn Band", ["The Longhorn Band", "LHB"]),
    ],
  },
];

export interface FootballThemedSportsFeudPack {
  domain: SportsFeudBankDomain;
  main: readonly SportsFeudAuthoredQuestion[];
  fastMoney: readonly SportsFeudAuthoredQuestion[];
}

const TEXAS_AM_SPORTS_FEUD_PACK: FootballThemedSportsFeudPack = {
  domain: "cfb",
  main: TEXAS_AM_SPORTS_FEUD_MAIN,
  fastMoney: TEXAS_AM_SPORTS_FEUD_FAST,
};

export function footballThemedSportsFeudPackForDay(
  domain: SportsFeudBankDomain,
  day: string,
): FootballThemedSportsFeudPack | null {
  if (day === "2026-11-27" && domain === "cfb") return TEXAS_AM_SPORTS_FEUD_PACK;
  return null;
}

export const FOOTBALL_THEMED_SPORTS_FEUD_QUESTIONS: readonly {
  domain: SportsFeudBankDomain;
  question: SportsFeudAuthoredQuestion;
}[] = [
  ...TEXAS_AM_SPORTS_FEUD_MAIN.map((question) => ({ domain: "cfb" as const, question })),
  ...TEXAS_AM_SPORTS_FEUD_FAST.map((question) => ({ domain: "cfb" as const, question })),
];

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
    type: "awards",
    prompt: "Which Texas running back won the 1998 Heisman Trophy?",
    choices: ["Earl Campbell", "Cedric Benson", "Ricky Williams", "Jamaal Charles"],
    answer: "Ricky Williams",
    explanation: "Ricky Williams won the 1998 Heisman Trophy after a record-setting senior season at Texas.",
    statSheet: "He also won the Walter Camp Award and Doak Walker Award that season.",
  },
  {
    type: "championship",
    prompt: "Which quarterback led Texas to the 2005 national championship?",
    choices: ["Colt McCoy", "Vince Young", "Major Applewhite", "Chris Simms"],
    answer: "Vince Young",
    explanation: "Vince Young led the unbeaten Longhorns through the 2005 season and the Rose Bowl win over USC.",
    statSheet: "He won the Maxwell and Davey O'Brien awards that season.",
  },
  {
    type: "defensive-awards",
    prompt: "Which Longhorn became Texas' first Jim Thorpe Award winner?",
    choices: ["Aaron Ross", "Michael Huff", "Quandre Diggs", "Earl Thomas"],
    answer: "Michael Huff",
    explanation: "Michael Huff became Texas' first Jim Thorpe Award winner in 2005 as the nation's top defensive back.",
    statSheet: "He was also the Defensive MVP of Texas' national championship victory over USC.",
  },
  {
    type: "championship-history",
    prompt: "Which quarterback led Texas through its undefeated 1969 national championship season?",
    choices: ["James Street", "Bobby Layne", "Marty Akins", "Eddie Phillips"],
    answer: "James Street",
    explanation: "James Street quarterbacked Texas during its unbeaten 1969 national championship season.",
    statSheet: "He helped engineer the famous 15-14 comeback victory at Arkansas.",
  },
  {
    type: "defensive-awards",
    prompt: "Which Longhorn won both the Butkus Award and the Bronko Nagurski Trophy in 2004?",
    choices: ["Michael Huff", "Brian Orakpo", "Derrick Johnson", "Aaron Ross"],
    answer: "Derrick Johnson",
    explanation: "Derrick Johnson won both the Butkus Award and the Bronko Nagurski Trophy in 2004.",
    statSheet: "He was a unanimous All-American and Big 12 Defensive Player of the Year.",
  },
  {
    type: "award-history",
    prompt: "Which Longhorn became Texas' first Lombardi Award winner and later the No. 1 overall pick in the NFL Draft?",
    choices: ["Kenneth Sims", "Tommy Nobis", "Scott Appleton", "Brad Shearer"],
    answer: "Kenneth Sims",
    explanation: "Kenneth Sims won the Lombardi Award in 1981 and was selected first overall in the 1982 NFL Draft.",
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
    type: "player-path",
    prompt: "Which longtime Cowboys quarterback joined Dallas as an undrafted free agent in 2003?",
    choices: ["Tony Romo", "Dak Prescott", "Drew Bledsoe", "Quincy Carter"],
    answer: "Tony Romo",
    explanation: "Tony Romo went undrafted in 2003 before signing with Dallas and eventually becoming the Cowboys' starting quarterback.",
    statSheet: "He became one of the most accomplished undrafted players in franchise history.",
  },
  {
    type: "coaching-history",
    prompt: "Who was the Cowboys' head coach for their first two Super Bowl championships of the 1990s?",
    choices: ["Tom Landry", "Jimmy Johnson", "Barry Switzer", "Bill Parcells"],
    answer: "Jimmy Johnson",
    explanation: "Jimmy Johnson coached Dallas to consecutive Super Bowl championships following the 1992 and 1993 seasons.",
    statSheet: "He coached the Cowboys from 1989 through 1993.",
  },
  {
    type: "hall-of-fame-history",
    prompt: "Which Cowboys legend known as 'Mr. Cowboy' was the franchise's first Pro Football Hall of Fame inductee?",
    choices: ["Bob Lilly", "Roger Staubach", "Mel Renfro", "Don Meredith"],
    answer: "Bob Lilly",
    explanation: "Bob Lilly, the first player drafted by Dallas, became the first Cowboys player inducted into the Pro Football Hall of Fame.",
    statSheet: "The defensive tackle was the franchise's first-ever draft pick in 1961.",
  },
  {
    type: "super-bowl-history",
    prompt: "Which Cowboys linebacker won Super Bowl V MVP even though Dallas lost the game?",
    choices: ["Chuck Howley", "Lee Roy Jordan", "Randy White", "D.D. Lewis"],
    answer: "Chuck Howley",
    explanation: "Chuck Howley became the first defensive player to win Super Bowl MVP and remains the only winner from the losing team.",
    statSheet: "He intercepted two passes in Dallas' 16-13 loss to Baltimore.",
  },
  {
    type: "super-bowl-awards",
    prompt: "Which Cowboys defensive tackle shared Super Bowl XII MVP honors with Harvey Martin?",
    choices: ["Randy White", "Bob Lilly", "Jethro Pugh", "Ed 'Too Tall' Jones"],
    answer: "Randy White",
    explanation: "Randy White and Harvey Martin were named co-MVPs after Dallas' defense dominated Denver in Super Bowl XII.",
    statSheet: "They remain the only co-MVP winners in Super Bowl history.",
  },
  {
    type: "franchise-records",
    prompt: "Which Cowboys defensive back holds the franchise record for career interceptions?",
    choices: ["Everson Walls", "Mel Renfro", "Darren Woodson", "Charlie Waters"],
    answer: "Mel Renfro",
    explanation: "Mel Renfro recorded 52 interceptions with Dallas, the most in franchise history.",
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
    id: "theme-cowboys-seahawks-2026-r1-aikman-number",
    league: "nfl",
    round: "round1",
    category: "Cowboys Icons",
    prompt: "What jersey number did Troy Aikman wear for the Cowboys?",
    choices: ["7", "8", "9", "12"],
    answer: "8",
    explanation: "Troy Aikman wore No. 8 during his Hall of Fame career with Dallas.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-texas-stadium-city",
    league: "nfl",
    round: "round1",
    category: "Home Field",
    prompt: "Texas Stadium, the Cowboys' home from 1971 through 2008, was located in which city?",
    choices: ["Dallas", "Arlington", "Irving", "Fort Worth"],
    answer: "Irving",
    explanation: "Texas Stadium stood in Irving and served as the Cowboys' home for 38 seasons.",
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
    id: "theme-cowboys-seahawks-2026-r2-irvin-college",
    league: "nfl",
    round: "round2",
    category: "Before Dallas",
    prompt: "Which college did Michael Irvin play for before the Cowboys drafted him?",
    choices: ["Florida State", "Miami", "Florida", "Notre Dame"],
    answer: "Miami",
    explanation: "Michael Irvin starred at Miami before Dallas selected him in the first round of the 1988 NFL Draft.",
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
    id: "theme-cowboys-seahawks-2026-r3-too-tall",
    league: "nfl",
    round: "round3",
    category: "Nicknames",
    prompt: "Which Cowboys defensive lineman was famously nicknamed 'Too Tall'?",
    choices: ["Ed Jones", "Harvey Martin", "Randy White", "Jethro Pugh"],
    answer: "Ed Jones",
    explanation: "Ed 'Too Tall' Jones became one of the most recognizable members of the Cowboys' defensive front.",
    sourceId: "cowboys-theme-history",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-walls-rookie-picks",
    league: "nfl",
    round: "round3",
    category: "Defensive Records",
    prompt: "Which Cowboys rookie intercepted 11 passes in 1981?",
    choices: ["Dennis Thurman", "Everson Walls", "Michael Downs", "Charlie Waters"],
    answer: "Everson Walls",
    explanation: "Undrafted rookie Everson Walls led the NFL with 11 interceptions in 1981.",
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
    id: "theme-texas-am-2026-main-seasons",
    category: "Texas Seasons",
    entityKind: "other",
    collisionGroup: "texas-seasons",
    prompt: "Name a Texas football season fans remember.",
    answers: [
      answer("2005 national championship", ["2005", "2005 season", "2005 title team"]),
      answer("2009 national title run", ["2009", "2009 season"]),
      answer("2008 one-loss season", ["2008", "2008 season"]),
      answer("1969 national championship", ["1969", "1969 season", "1969 title team"]),
      answer("2023 CFP season", ["2023", "2023 season", "2023 playoff season"]),
      answer("1963 national championship", ["1963", "1963 season", "1963 title team"]),
      answer("1970 national championship", ["1970", "1970 season", "1970 title team"]),
      answer("2024 CFP season", ["2024", "2024 season", "2024 playoff season"]),
    ],
    alsoAcceptedAnswers: [
      answer("1977 Earl Campbell season", ["1977", "1977 season"]),
      answer("1998 Ricky Williams season", ["1998", "1998 season"]),
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
    id: "theme-texas-am-2026-fast-lone-star-showdown",
    category: "Lone Star Showdown",
    entityKind: "other",
    collisionGroup: "texas-am-rivalry",
    prompt: "Name something associated with the Texas-Texas A&M football rivalry.",
    answers: [
      answer("Lone Star Showdown", ["Lone Star rivalry"]),
      answer("Thanksgiving"),
      answer("12th Man", ["The 12th Man"]),
      answer("Bevo"),
      answer("Reveille"),
      answer("Kyle Field"),
      answer("DKR-Texas Memorial Stadium", ["DKR", "Texas Memorial Stadium"]),
      answer("Burnt orange vs. maroon", ["Burnt orange and maroon", "Orange vs maroon"]),
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

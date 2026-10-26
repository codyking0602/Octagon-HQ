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
    type: "rivalry-awards",
    prompt: "Which Oklahoma quarterback edged Texas' Colt McCoy for the 2008 Heisman Trophy?",
    choices: ["Jason White", "Sam Bradford", "Baker Mayfield", "Landry Jones"],
    answer: "Sam Bradford",
    explanation: "Sam Bradford won the 2008 Heisman Trophy, finishing ahead of Texas quarterback Colt McCoy.",
    statSheet: "McCoy finished as the Heisman runner-up after a 12-1 season for Texas.",
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
    type: "defensive-records",
    prompt: "Which Cowboys cornerback led the NFL with 11 interceptions in the 2021 season?",
    choices: ["Trevon Diggs", "Anthony Brown", "Jourdan Lewis", "Byron Jones"],
    answer: "Trevon Diggs",
    explanation: "Trevon Diggs led the NFL with 11 interceptions in 2021, tying a Cowboys single-season record.",
    statSheet: "The Dallas cornerback returned two of his league-leading picks for touchdowns in 2021.",
  },
  {
    type: "rookie-awards",
    prompt: "Which Cowboys player edged teammate Ezekiel Elliott for the 2016 AP Offensive Rookie of the Year award?",
    choices: ["Tony Romo", "Dak Prescott", "Cole Beasley", "Dez Bryant"],
    answer: "Dak Prescott",
    explanation: "Dak Prescott won 2016 AP Offensive Rookie of the Year after replacing the injured Tony Romo, finishing ahead of teammate Ezekiel Elliott.",
    statSheet: "The winning quarterback started all 16 regular-season games as a fourth-round rookie.",
  },
  {
    type: "postseason-moments",
    prompt: "Which Cowboys kicker missed four extra-point attempts in Dallas's January 2023 playoff win over Tampa Bay?",
    choices: ["Dan Bailey", "Brandon Aubrey", "Brett Maher", "Kai Forbath"],
    answer: "Brett Maher",
    explanation: "Brett Maher missed his first four extra-point attempts in Dallas's 31–14 wild-card win over the Buccaneers, then converted his fifth.",
    statSheet: "Dallas won the wild-card game 31–14 despite the unprecedented run of missed extra points.",
  },
  {
    type: "cowboys-eagles-rivalry",
    prompt: "Which Cowboys receiver caught three touchdowns, including the overtime winner, against Philadelphia in December 2018?",
    choices: ["Dez Bryant", "Michael Gallup", "Cole Beasley", "Amari Cooper"],
    answer: "Amari Cooper",
    explanation: "Amari Cooper scored all three of his touchdowns in the fourth quarter and overtime as Dallas beat the Eagles 29–23 on December 9, 2018.",
    statSheet: null,
  },
]);

export function footballThemedMillionaireRunForDay(day: string): MillionaireRun | null {
  if (day === "2026-10-10") return TEXAS_OKLAHOMA_MILLIONAIRE;
  if (day === "2026-10-26") return COWBOYS_EAGLES_MILLIONAIRE;
  return null;
}

// Future-only December 7 edition: approachable opening, then progressively
// more specific 2014–2023 football moments. Avoid pre-2000 specialist trivia.
const COWBOYS_SEAHAWKS_BAR_TRIVIA: readonly BarTriviaQuestion[] = [
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-aikman-number",
    league: "nfl",
    round: "round1",
    category: "Cowboys Icons",
    prompt: "What jersey number did Troy Aikman wear for the Cowboys?",
    choices: ["7","8","9","12"],
    answer: "8",
    explanation: "Troy Aikman wore No. 8 during his Hall of Fame career with Dallas.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.profootballhof.com/players/troy-aikman/",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-the-star-city",
    league: "nfl",
    round: "round1",
    category: "Cowboys Home Base",
    prompt: "In which Texas city did the Cowboys open their team headquarters at The Star in 2016?",
    choices: ["Frisco","Arlington","Irving","Plano"],
    answer: "Frisco",
    explanation: "The Cowboys opened The Star, their headquarters and practice complex, in Frisco in August 2016.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/with-first-practice-ribbon-cutting-ceremony-the-star-officially-opens-410826",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r1-elliott-draft",
    league: "nfl",
    round: "round1",
    category: "Dallas Draft Picks",
    prompt: "Which running back did Dallas select with the No. 4 overall pick in the 2016 NFL Draft?",
    choices: ["Tony Pollard","Ezekiel Elliott","DeMarco Murray","Darren McFadden"],
    answer: "Ezekiel Elliott",
    explanation: "Dallas selected Ohio State running back Ezekiel Elliott fourth overall in the 2016 NFL Draft.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/cowboys-take-ohio-state-s-ezekiel-elliott-with-no-4-overall-pick-402976",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r2-88",
    league: "nfl",
    round: "round2",
    category: "Jersey Tradition",
    prompt: "Drew Pearson, Michael Irvin, Dez Bryant and CeeDee Lamb have all worn which Cowboys jersey number?",
    choices: ["80","82","84","88"],
    answer: "88",
    explanation: "No. 88 has become a signature Cowboys receiver number across multiple eras.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/ceedee-lamb-latest-cowboys-wr-to-wear-88",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r2-mccarthy-2020",
    league: "nfl",
    round: "round2",
    category: "Sideline Changes",
    prompt: "Which former Packers coach was hired to lead the Cowboys ahead of the 2020 season?",
    choices: ["Mike McCarthy","Jason Garrett","Sean Payton","Dan Quinn"],
    answer: "Mike McCarthy",
    explanation: "Dallas hired former Packers head coach Mike McCarthy in January 2020.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/mike-mccarthy-officially-hired-as-head-coach",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r2-bland-pick-sixes",
    league: "nfl",
    round: "round2",
    category: "Recent NFL Records",
    prompt: "Which Cowboys cornerback set the NFL single-season record with five interception-return touchdowns in 2023?",
    choices: ["Trevon Diggs","DaRon Bland","Stephon Gilmore","Jourdan Lewis"],
    answer: "DaRon Bland",
    explanation: "DaRon Bland set the NFL record with his fifth pick-six in the 2023 Thanksgiving win over Washington.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/daron-bland-on-record-setting-int-wasn-t-gonna-be-denied",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-seattle-three-scores",
    league: "nfl",
    round: "round3",
    category: "Cowboys–Seahawks",
    prompt: "Which Seattle receiver caught three touchdown passes against Dallas in the teams' 2023 meeting?",
    choices: ["Tyler Lockett","Jaxon Smith-Njigba","DK Metcalf","Jake Bobo"],
    answer: "DK Metcalf",
    explanation: "Seattle's DK Metcalf scored three receiving touchdowns against Dallas on November 30, 2023, although the Cowboys won 41–35.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/game-recap-cowboys-win-tough-battle-41-35",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-seattle-catch",
    league: "nfl",
    round: "round3",
    category: "Cowboys–Seahawks",
    prompt: "Who made the toe-tapping third-and-20 catch that helped Dallas win at Seattle in 2014?",
    choices: ["Dez Bryant","Jason Witten","Terrance Williams","Cole Beasley"],
    answer: "Terrance Williams",
    explanation: "Terrance Williams' 23-yard sideline catch extended Dallas's fourth-quarter comeback drive in its 30–23 win at Seattle.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/cowboys-overcome-miscues-run-over-seattle-for-5th-win-358606",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-r3-seattle-2019-wildcard",
    league: "nfl",
    round: "round3",
    category: "Cowboys Playoff Moments",
    prompt: "Which Cowboys receiver caught Dak Prescott's touchdown pass just before halftime in Dallas's January 2019 playoff win over Seattle?",
    choices: ["Allen Hurns","Michael Gallup","Cole Beasley","Amari Cooper"],
    answer: "Michael Gallup",
    explanation: "Rookie Michael Gallup caught an 11-yard touchdown pass with 24 seconds left in the first half of Dallas's 24–22 wild-card win.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/game-recap-cowboys-win-wild-card-game-24-22",
    verifiedAt: "2026-10-26",
  }),
  barTriviaQuestion({
    id: "theme-cowboys-seahawks-2026-final-seattle-2023-two-point",
    league: "nfl",
    round: "last-call",
    category: "Cowboys–Seahawks",
    prompt: "Who caught the two-point conversion that put Dallas ahead 38–35 in its fourth-quarter comeback against Seattle in November 2023?",
    choices: ["CeeDee Lamb","Jake Ferguson","Brandin Cooks","Michael Gallup"],
    answer: "Brandin Cooks",
    explanation: "Brandin Cooks caught the two-point conversion after Jake Ferguson's go-ahead touchdown as Dallas rallied to win 41–35.",
    sourceId: "cowboys-seahawks-modern-editorial-20261026",
    sourceUrl: "https://www.dallascowboys.com/news/game-recap-cowboys-win-tough-battle-41-35",
    verifiedAt: "2026-10-26",
  }),
];

export function footballThemedBarTriviaRunForDay(day: string): readonly BarTriviaQuestion[] | null {
  return day === "2026-12-07" ? COWBOYS_SEAHAWKS_BAR_TRIVIA : null;
}

function answer(name: string, aliases?: readonly string[]): SportsFeudAuthoredAnswer {
  return aliases?.length ? { name, aliases } : { name };
}

// Feud does not have a hard Q1-to-Q8 ladder: broad Main boards and generous
// accepted answers come first, then a diverse modern-era Fast Money set.
// Modern means identifiable since 2000, not a history-book memory test.
const TEXAS_AM_SPORTS_FEUD_MAIN: readonly SportsFeudAuthoredQuestion[] = [
  {
    id: "theme-texas-am-2026-main-quarterbacks",
    category: "Texas Quarterbacks",
    entityKind: "person",
    collisionGroup: "texas-quarterbacks",
    prompt: "Name a Texas Longhorn quarterback who played for Texas since 2000.",
    answers: [
      answer("Vince Young", ["VY"]),
      answer("Colt McCoy"),
      answer("Quinn Ewers"),
      answer("Arch Manning"),
      answer("Sam Ehlinger"),
      answer("Chris Simms"),
      answer("Case McCoy"),
      answer("Shane Buechele"),
    ],
    alsoAcceptedAnswers: [
      answer("David Ash"),
      answer("Major Applewhite"),
      answer("Garrett Gilbert"),
      answer("Tyrone Swoopes"),
      answer("Jerrod Heard"),
      answer("Hudson Card"),
      answer("Casey Thompson"),
      answer("Maalik Murphy"),
    ],
  },
  {
    id: "theme-texas-am-2026-main-seasons",
    category: "Texas Seasons",
    entityKind: "other",
    collisionGroup: "texas-seasons",
    prompt: "Name a memorable Texas Longhorn football season from 2005 onward.",
    answers: [
      answer("2005 national championship", ["2005", "2005 season", "2005 title team"]),
      answer("2023 CFP season", ["2023", "2023 season", "2023 playoff season"]),
      answer("2024 CFP semifinal season", ["2024", "2024 season", "2024 playoff season"]),
      answer("2009 national title run", ["2009", "2009 season"]),
      answer("2018 Sugar Bowl season", ["2018", "2018 season", "2018 Sugar Bowl"]),
      answer("2008 one-loss season", ["2008", "2008 season"]),
      answer("2022 Alabama close-call season", ["2022", "2022 season", "2022 Alabama game"]),
      answer("2016 Notre Dame opener", ["2016", "2016 season", "2016 Notre Dame game"]),
    ],
    alsoAcceptedAnswers: [
      answer("2019 Alamo Bowl season", ["2019", "2019 season", "2019 Alamo Bowl"]),
      answer("2020 Alamo Bowl season", ["2020", "2020 season", "2020 Alamo Bowl"]),
    ],
  },
];

const TEXAS_AM_SPORTS_FEUD_FAST: readonly SportsFeudAuthoredQuestion[] = [
  {
    id: "theme-texas-am-2026-fast-offense",
    category: "Longhorn Offensive Stars",
    entityKind: "person",
    collisionGroup: "texas-offense-since-2000",
    prompt: "Name a notable Texas running back or receiver who played since 2000.",
    answers: [
      answer("Bijan Robinson", ["Bijan"]),
      answer("Jamaal Charles"),
      answer("Xavier Worthy"),
      answer("Cedric Benson"),
      answer("Jordan Shipley"),
      answer("D'Onta Foreman", ["Donta Foreman"]),
      answer("Roschon Johnson"),
      answer("Jonathon Brooks", ["Jonathan Brooks"]),
    ],
    alsoAcceptedAnswers: [
      answer("Jaydon Blue"),
      answer("Tre Wisner"),
      answer("Malcolm Brown"),
      answer("Fozzy Whittaker"),
      answer("Devin Duvernay"),
      answer("Marquise Goodwin"),
      answer("Jaxon Shipley"),
      answer("Jordan Whittington"),
      answer("Adonai Mitchell"),
      answer("Keilan Robinson"),
    ],
  },
  {
    id: "theme-texas-am-2026-fast-defenders",
    category: "Texas Defense",
    entityKind: "person",
    collisionGroup: "texas-defenders-since-2000",
    prompt: "Name a notable Texas Longhorn defensive player who played since 2000.",
    answers: [
      answer("Derrick Johnson"),
      answer("Brian Orakpo"),
      answer("Earl Thomas"),
      answer("Quandre Diggs"),
      answer("T'Vondre Sweat", ["TVondre Sweat"]),
      answer("Jahdae Barron"),
      answer("Byron Murphy II", ["Byron Murphy"]),
      answer("Michael Huff"),
    ],
    alsoAcceptedAnswers: [
      answer("Aaron Ross"),
      answer("Sam Acho"),
      answer("Jordan Hicks"),
      answer("Joseph Ossai"),
      answer("DeMarvion Overshown"),
      answer("Anthony Hill Jr.", ["Anthony Hill"]),
      answer("Michael Taaffe"),
      answer("Jackson Jeffcoat"),
      answer("Malik Jefferson"),
      answer("Collin Simmons"),
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
      answer("Reveille"),
      answer("Kyle Field"),
      answer("2011 final Big 12 meeting", ["2011", "2011 game", "2011 farewell game"]),
      answer("2024 rivalry return", ["2024", "2024 return", "2024 renewal"]),
      answer("Justin Tucker's 2011 winner", ["Justin Tucker", "Tucker field goal", "2011 field goal"]),
    ],
  },
  {
    id: "theme-texas-am-2026-fast-rivals",
    category: "Texas Opponents",
    entityKind: "school",
    collisionGroup: "texas-recent-opponents",
    prompt: "Name a major opponent Texas faced from 2016 through the 2024 football season.",
    answers: [
      answer("Oklahoma", ["OU", "Oklahoma Sooners", "Sooners"]),
      answer("Texas A&M", ["A&M", "Texas A and M", "Aggies"]),
      answer("Alabama", ["Alabama Crimson Tide", "Crimson Tide"]),
      answer("Georgia", ["Georgia Bulldogs", "UGA"]),
      answer("Michigan", ["Michigan Wolverines", "Wolverines"]),
      answer("Washington", ["Washington Huskies", "Huskies"]),
      answer("Clemson", ["Clemson Tigers"]),
      answer("Ohio State", ["Ohio State Buckeyes", "Buckeyes"]),
    ],
    alsoAcceptedAnswers: [
      answer("Arkansas", ["Arkansas Razorbacks", "Razorbacks"]),
      answer("TCU", ["Horned Frogs"]),
      answer("Baylor", ["Baylor Bears"]),
      answer("Texas Tech", ["Texas Tech Red Raiders", "Red Raiders"]),
      answer("Notre Dame", ["Fighting Irish"]),
      answer("LSU", ["LSU Tigers"]),
      answer("Florida", ["Florida Gators"]),
      answer("Arizona State", ["ASU", "Sun Devils"]),
      answer("Oklahoma State", ["Oklahoma State Cowboys"]),
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

import {
  MILLIONAIRE_LEVELS,
  MILLIONAIRE_MONEY_BY_LEVEL,
  type MillionaireChoiceId,
  type MillionaireRuntimeQuestion,
} from "../games/millionaireAuthority";
import {
  millionaireCheckpointMoney,
  millionaireScoreAfterLifelines,
  millionaireScoreForCompletedQuestions,
  currentMillionaireQuestion,
  type MillionaireRun,
  type MillionaireState,
  type MillionaireTransitionResult,
} from "../games/millionaireEngine";

export type MillionaireLeague = "ufc" | "nfl" | "cfb" | "mlb";

export const MILLIONAIRE_TIME_BANK_MS = 120_000;

export const MILLIONAIRE_REVEAL_DELAY_MS = {
  Q1: 90,
  Q2: 90,
  Q3: 90,
  Q4: 750,
  Q5: 750,
  Q6: 750,
  Q7: 1_250,
  Q8: 1_750,
} as const;

export const MILLIONAIRE_ANSWER_REVEAL_HOLD_MS = 900;
export const MILLIONAIRE_DOUBLE_DIP_MISS_MS = 450;

export const MILLIONAIRE_BASE_PTS = {
  Q1: 25,
  Q2: 35,
  Q3: 45,
  Q4: 55,
  Q5: 68,
  Q6: 80,
  Q7: 90,
  Q8: 100,
} as const;

export const MILLIONAIRE_HOSTS: Record<MillionaireLeague, readonly [string, string, string]> = {
  cfb: [
    "/assets/millionaire/Cfb1.png",
    "/assets/millionaire/Cfb2.png",
    "/assets/millionaire/Cfb3.png",
  ],
  nfl: [
    "/assets/millionaire/Nfl1.png",
    "/assets/millionaire/Nfl2.png",
    "/assets/millionaire/wide_cinematic_studio_shot_of_a_game_show_set_with.png",
  ],
  ufc: [
    "/assets/millionaire/Ufc1.png",
    "/assets/millionaire/Ufc2.png",
    "/assets/millionaire/Ufc3.png",
  ],
  mlb: [
    "/assets/millionaire/1mlb.webp",
    "/assets/millionaire/1mlb.webp",
    "/assets/millionaire/1mlb.webp",
  ],
};

export function millionaireCentralDateKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function millionaireHostNumber(league: MillionaireLeague, dateKey = millionaireCentralDateKey()) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const epochDay = Math.floor(Date.UTC(year || 1970, Math.max(0, (month || 1) - 1), day || 1) / 86_400_000);
  const offset = league === "cfb" ? 0 : league === "nfl" ? 1 : league === "ufc" ? 2 : 0;
  return ((epochDay + offset) % 3 + 3) % 3 + 1;
}

export function millionaireHostAsset(league: MillionaireLeague, dateKey?: string) {
  return MILLIONAIRE_HOSTS[league][millionaireHostNumber(league, dateKey) - 1];
}

export function millionaireLeagueLabel(league: MillionaireLeague) {
  return league.toUpperCase();
}

type QuestionSeed = {
  prompt: string;
  choices: readonly [string, string, string, string];
  correct: MillionaireChoiceId;
  explanation: string;
  statSheet: string | null;
  fiftyFifty: readonly [MillionaireChoiceId, MillionaireChoiceId];
  type: string;
};

const ids = ["A", "B", "C", "D"] as const;

function question(
  league: MillionaireLeague,
  index: number,
  seed: QuestionSeed,
): MillionaireRuntimeQuestion {
  const level = MILLIONAIRE_LEVELS[index]!;
  const q8 = level === "Q8";
  const sport = league === "ufc" ? "ufc" : "football";
  const removalChoiceIds = ids.filter((id) => !seed.fiftyFifty.includes(id)) as [MillionaireChoiceId, MillionaireChoiceId];
  return {
    id: `millionaire-${league.toLowerCase()}-${level.toLowerCase()}-casual-a`,
    sport,
    level,
    money: MILLIONAIRE_MONEY_BY_LEVEL[level],
    type: seed.type,
    prompt: seed.prompt,
    choices: ids.map((id, choiceIndex) => ({ id, text: seed.choices[choiceIndex]! })) as [
      { id: "A"; text: string },
      { id: "B"; text: string },
      { id: "C"; text: string },
      { id: "D"; text: string },
    ],
    correctChoiceId: seed.correct,
    explanation: seed.explanation,
    statSheet: q8 ? null : seed.statSheet,
    fiftyFifty: {
      survivorChoiceIds: seed.fiftyFifty,
      removalChoiceIds,
    },
    lifelineCompatibility: {
      fiftyFifty: !q8,
      statSheet: !q8,
      doubleDip: !q8,
    },
  };
}

const cfbSeeds: readonly QuestionSeed[] = [
  {
    prompt: "Who won the 2019 Heisman Trophy?",
    choices: ["Joe Burrow", "Jalen Hurts", "Justin Fields", "Chase Young"],
    correct: "A",
    explanation: "Joe Burrow won the 2019 Heisman Trophy after leading LSU through an undefeated championship season.",
    statSheet: "The winner led LSU to an undefeated national championship season.",
    fiftyFifty: ["A", "B"],
    type: "awards",
  },
  {
    prompt: "Who won the first College Football Playoff national championship?",
    choices: ["Ohio State", "Oregon", "Alabama", "Florida State"],
    correct: "A",
    explanation: "Ohio State won the first College Football Playoff national championship after the 2014 season.",
    statSheet: "The champion entered the four-team playoff as the No. 4 seed.",
    fiftyFifty: ["A", "C"],
    type: "championship",
  },
  {
    prompt: "Who did Clemson defeat to win the 2016 national championship?",
    choices: ["Alabama", "Ohio State", "Oklahoma", "Florida State"],
    correct: "A",
    explanation: "Clemson defeated Alabama 35-31 to win the 2016 national championship.",
    statSheet: "Deshaun Watson threw the winning touchdown with one second left.",
    fiftyFifty: ["A", "B"],
    type: "championship",
  },
  {
    prompt: "Which of these Heisman winners won the award most recently?",
    choices: ["Marcus Mariota", "Baker Mayfield", "Joe Burrow", "Bryce Young"],
    correct: "D",
    explanation: "Bryce Young won the Heisman Trophy in 2021, later than the other three choices.",
    statSheet: "The answer became Alabama's first quarterback to win the Heisman.",
    fiftyFifty: ["C", "D"],
    type: "chronology",
  },
  {
    prompt: "Which school produced consecutive Heisman winners in 2004 and 2005?",
    choices: ["USC", "Oklahoma", "Florida", "Alabama"],
    correct: "A",
    explanation: "USC produced Matt Leinart in 2004 and Reggie Bush in 2005.",
    statSheet: "Both winners played offense for Pete Carroll.",
    fiftyFifty: ["A", "B"],
    type: "awards-history",
  },
  {
    prompt: "Which Heisman-winning quarterback did NOT win his conference championship in his Heisman season?",
    choices: ["Cam Newton", "Joe Burrow", "Baker Mayfield", "Lamar Jackson"],
    correct: "D",
    explanation: "Lamar Jackson won the 2016 Heisman at Louisville, but Clemson won the ACC championship that season.",
    statSheet: "The answer became Louisville's first Heisman Trophy winner.",
    fiftyFifty: ["C", "D"],
    type: "awards-postseason",
  },
  {
    prompt: "Which CFP national champion did NOT win its conference championship?",
    choices: ["2014 Ohio State", "2016 Clemson", "2017 Alabama", "2019 LSU"],
    correct: "C",
    explanation: "2017 Alabama did not win the SEC championship before going on to win the College Football Playoff national title.",
    statSheet: "The answer won the national title on Tua Tagovailoa's overtime touchdown pass to DeVonta Smith.",
    fiftyFifty: ["A", "C"],
    type: "playoff-history",
  },
  {
    prompt: "Which Heisman-winning quarterback threw the fewest touchdown passes in his Heisman season?",
    choices: ["Tim Tebow 2007", "Cam Newton 2010", "Johnny Manziel 2012", "Lamar Jackson 2016"],
    correct: "C",
    explanation: "Johnny Manziel threw 26 touchdown passes in 2012, fewer than the other three quarterbacks listed.",
    statSheet: null,
    fiftyFifty: ["A", "C"],
    type: "stat-comparison",
  },
];

const nflSeeds: readonly QuestionSeed[] = [
  { prompt: "Which NFL team plays its home games in Green Bay, Wisconsin?", choices: ["Packers", "Vikings", "Bears", "Lions"], correct: "A", explanation: "The Green Bay Packers play at Lambeau Field in Green Bay, Wisconsin.", statSheet: "The franchise is the league's only community-owned, nonprofit major-league team.", fiftyFifty: ["A", "C"], type: "team-identity" },
  { prompt: "What position did Jerry Rice play in the NFL?", choices: ["Wide receiver", "Running back", "Cornerback", "Tight end"], correct: "A", explanation: "Jerry Rice played wide receiver and became the NFL's career leader in major receiving categories.", statSheet: "He won three Super Bowls with San Francisco and wore No. 80.", fiftyFifty: ["A", "D"], type: "player-position" },
  { prompt: "In which round of the 2000 NFL Draft was Tom Brady selected?", choices: ["Sixth", "Fourth", "Second", "Seventh"], correct: "A", explanation: "New England selected Tom Brady in the sixth round of the 2000 NFL Draft.", statSheet: "He was the 199th overall pick after playing college football at Michigan.", fiftyFifty: ["A", "D"], type: "draft" },
  { prompt: "Which team drafted John Elway first overall in 1983 before trading him to Denver?", choices: ["Baltimore Colts", "New York Giants", "San Diego Chargers", "Seattle Seahawks"], correct: "A", explanation: "The Baltimore Colts selected John Elway first overall in 1983 and later traded him to Denver.", statSheet: "Elway had made clear before the draft that he did not want to play for the club that held the No. 1 pick.", fiftyFifty: ["A", "C"], type: "draft-history" },
  { prompt: "Which franchise won each of the first two Super Bowls?", choices: ["Green Bay Packers", "Kansas City Chiefs", "Dallas Cowboys", "Oakland Raiders"], correct: "A", explanation: "Green Bay won Super Bowls I and II under Vince Lombardi.", statSheet: "The championship trophy now bears the name of the coach who led those teams.", fiftyFifty: ["A", "B"], type: "championship-history" },
  { prompt: "Who set the NFL single-season receiving-yardage record with 1,964 yards in 2012?", choices: ["Calvin Johnson", "Julio Jones", "Jerry Rice", "Antonio Brown"], correct: "A", explanation: "Calvin Johnson recorded 1,964 receiving yards for Detroit in 2012.", statSheet: "The Hall of Fame receiver was nicknamed Megatron and spent his entire NFL career with the Lions.", fiftyFifty: ["A", "B"], type: "record" },
  { prompt: "Which team completed the NFL's only perfect season including a Super Bowl victory?", choices: ["1972 Miami Dolphins", "1985 Chicago Bears", "2007 New England Patriots", "1978 Pittsburgh Steelers"], correct: "A", explanation: "The 1972 Miami Dolphins finished 17-0 and won Super Bowl VII.", statSheet: "Don Shula coached the team, which defeated Washington in the Super Bowl.", fiftyFifty: ["A", "C"], type: "team-season" },
  { prompt: "Who is the only player to win Super Bowl MVP while playing for the losing team?", choices: ["Chuck Howley", "Larry Brown", "Randy White", "Harvey Martin"], correct: "A", explanation: "Dallas linebacker Chuck Howley won MVP of Super Bowl V despite the Cowboys losing to Baltimore.", statSheet: null, fiftyFifty: ["A", "C"], type: "super-bowl-history" },
];

const ufcSeeds: readonly QuestionSeed[] = [
  { prompt: "Which UFC weight class has a championship limit of 155 pounds?", choices: ["Lightweight", "Featherweight", "Welterweight", "Bantamweight"], correct: "A", explanation: "The UFC lightweight championship limit is 155 pounds.", statSheet: "It sits between featherweight and welterweight in the UFC men's divisional ladder.", fiftyFifty: ["A", "C"], type: "division" },
  { prompt: "Which UFC star is known by the nickname 'The Notorious'?", choices: ["Conor McGregor", "Nate Diaz", "Dustin Poirier", "Max Holloway"], correct: "A", explanation: "Conor McGregor is known as The Notorious.", statSheet: "He became a UFC champion in both the featherweight and lightweight divisions.", fiftyFifty: ["A", "B"], type: "fighter-identity" },
  { prompt: "Who ended Anderson Silva's long middleweight title reign at UFC 162?", choices: ["Chris Weidman", "Vitor Belfort", "Chael Sonnen", "Michael Bisping"], correct: "A", explanation: "Chris Weidman knocked out Anderson Silva at UFC 162 to win the middleweight title.", statSheet: "The challenger entered the fight undefeated and later won their immediate rematch.", fiftyFifty: ["A", "C"], type: "title-change" },
  { prompt: "Which fighter won UFC championships at both featherweight and lightweight?", choices: ["Conor McGregor", "Jose Aldo", "Khabib Nurmagomedov", "B.J. Penn"], correct: "A", explanation: "Conor McGregor won UFC titles at featherweight and lightweight.", statSheet: "His lightweight title victory came at UFC 205 in Madison Square Garden.", fiftyFifty: ["A", "D"], type: "championships" },
  { prompt: "Who did Khabib Nurmagomedov defeat for the vacant lightweight title at UFC 223?", choices: ["Al Iaquinta", "Dustin Poirier", "Justin Gaethje", "Edson Barboza"], correct: "A", explanation: "Khabib Nurmagomedov defeated Al Iaquinta by unanimous decision at UFC 223 to win the vacant lightweight title.", statSheet: "The opponent was a late replacement after a turbulent fight week in Brooklyn.", fiftyFifty: ["A", "D"], type: "title-fight" },
  { prompt: "Who became the UFC's first women's champion?", choices: ["Ronda Rousey", "Miesha Tate", "Cris Cyborg", "Joanna Jedrzejczyk"], correct: "A", explanation: "Ronda Rousey became the UFC's inaugural women's bantamweight champion.", statSheet: "She entered the UFC as the reigning Strikeforce bantamweight champion and headlined UFC 157.", fiftyFifty: ["A", "B"], type: "title-history" },
  { prompt: "Who did Matt Serra upset at UFC 69 to win the welterweight championship?", choices: ["Georges St-Pierre", "Matt Hughes", "B.J. Penn", "Carlos Condit"], correct: "A", explanation: "Matt Serra stopped Georges St-Pierre at UFC 69 to win the UFC welterweight title.", statSheet: "Serra earned the title shot by winning The Ultimate Fighter 4.", fiftyFifty: ["A", "B"], type: "upset" },
  { prompt: "Which champion did T.J. Dillashaw defeat at UFC 173 to win the bantamweight title?", choices: ["Renan Barao", "Dominick Cruz", "Cody Garbrandt", "Urijah Faber"], correct: "A", explanation: "T.J. Dillashaw stopped Renan Barao at UFC 173 to capture the bantamweight championship.", statSheet: null, fiftyFifty: ["A", "B"], type: "title-fight-history" },
];


export const MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS = [
  "Which MLB team plays its home games at Fenway Park?",
  "Which baseball legend was nicknamed the Great Bambino?",
  "Which franchise ended an 86-year World Series championship drought in 2004?",
  "Who holds MLB's career home run record?",
  "Whose 56-game hitting streak in 1941 remains the MLB record?",
  "Who became the first unanimous selection to the Baseball Hall of Fame?",
  "Which player was the first to win league MVP honors in both the American and National Leagues?",
  "Which pitcher won Cy Young Awards in both leagues and later threw a perfect game at age 40?",
] as const;

const mlbSeeds: readonly QuestionSeed[] = [
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[0],
    choices: ["New York Yankees", "Boston Red Sox", "Chicago Cubs", "Los Angeles Dodgers"],
    correct: "B",
    explanation: "Fenway Park has been the home of the Boston Red Sox since 1912.",
    statSheet: "The ballpark is famous for the Green Monster in left field.",
    fiftyFifty: ["A", "B"],
    type: "ballpark",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[1],
    choices: ["Willie Mays", "Lou Gehrig", "Hank Aaron", "Babe Ruth"],
    correct: "D",
    explanation: "Babe Ruth was famously known as the Great Bambino.",
    statSheet: "The player starred for both Boston and New York and became baseball's first great home run icon.",
    fiftyFifty: ["B", "D"],
    type: "nickname",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[2],
    choices: ["Boston Red Sox", "Chicago Cubs", "Cleveland Guardians", "San Francisco Giants"],
    correct: "A",
    explanation: "Boston swept St. Louis in the 2004 World Series to end its championship drought.",
    statSheet: "The title came after the club rallied from a 3-0 ALCS deficit against New York.",
    fiftyFifty: ["A", "B"],
    type: "championship-history",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[3],
    choices: ["Hank Aaron", "Babe Ruth", "Barry Bonds", "Albert Pujols"],
    correct: "C",
    explanation: "Barry Bonds finished his career with 762 home runs, the MLB record.",
    statSheet: "The record holder passed Hank Aaron's career total during the 2007 season.",
    fiftyFifty: ["A", "C"],
    type: "career-record",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[4],
    choices: ["Ted Williams", "Joe DiMaggio", "Pete Rose", "Ty Cobb"],
    correct: "B",
    explanation: "Joe DiMaggio hit safely in 56 consecutive games for the Yankees in 1941.",
    statSheet: "The record was set by a Yankees center fielder during the same season Ted Williams hit .406.",
    fiftyFifty: ["A", "B"],
    type: "record-history",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[5],
    choices: ["Derek Jeter", "Ken Griffey Jr.", "Greg Maddux", "Mariano Rivera"],
    correct: "D",
    explanation: "Mariano Rivera became the first player elected unanimously to the Hall of Fame in 2019.",
    statSheet: "The answer is MLB's career saves leader and spent his entire career with the Yankees.",
    fiftyFifty: ["A", "D"],
    type: "hall-of-fame",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[6],
    choices: ["Reggie Jackson", "Pete Rose", "Frank Robinson", "Rickey Henderson"],
    correct: "C",
    explanation: "Frank Robinson won the NL MVP with Cincinnati and later the AL MVP with Baltimore.",
    statSheet: "The answer won the Triple Crown in his first season with Baltimore.",
    fiftyFifty: ["A", "C"],
    type: "awards-history",
  },
  {
    prompt: MLB_MILLIONAIRE_OWNER_REVIEW_PROMPTS[7],
    choices: ["Randy Johnson", "Roger Clemens", "Pedro Martinez", "Max Scherzer"],
    correct: "A",
    explanation: "Randy Johnson won Cy Young Awards in both leagues and threw a perfect game for Arizona in 2004 at age 40.",
    statSheet: null,
    fiftyFifty: ["A", "B"],
    type: "pitching-history",
  },
];

const seedsByLeague: Record<MillionaireLeague, readonly QuestionSeed[]> = { cfb: cfbSeeds, nfl: nflSeeds, ufc: ufcSeeds, mlb: mlbSeeds };

export function millionaireCasualRun(league: MillionaireLeague): MillionaireRun {
  return seedsByLeague[league].map((seed, index) => question(league, index, seed)) as unknown as MillionaireRun;
}

export function millionaireTimeoutTransition(run: MillionaireRun, state: MillionaireState): MillionaireTransitionResult {
  if (state.status !== "playing") throw new Error("Millionaire run is already settled.");
  const current = currentMillionaireQuestion(run, state);
  if (!current) throw new Error("Millionaire current question is unavailable.");
  const settledCompletedQuestions = current.level === "Q8" ? 6 : state.completedQuestions;
  const baseScore = millionaireScoreForCompletedQuestions(settledCompletedQuestions);
  const score = millionaireScoreAfterLifelines(baseScore, state.lifelinesUsed);
  return {
    state: { ...state, status: "lost", finalMoney: millionaireCheckpointMoney(state.completedQuestions), baseScore, score },
    questionReveal: { questionId: current.id, correctChoiceId: current.correctChoiceId, explanation: current.explanation },
    lifelineReveal: null,
    answerOutcome: "wrong",
  };
}

export function millionaireMoneyLabel(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

export function millionaireTimeLabel(milliseconds: number) {
  const safe = Math.max(0, Math.ceil(milliseconds / 1_000));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

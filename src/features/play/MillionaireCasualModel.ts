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

export type MillionaireLeague = "ufc" | "nfl" | "cfb";

export const MILLIONAIRE_TIME_BANK_MS = 150_000;

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
  const offset = league === "cfb" ? 0 : league === "nfl" ? 1 : 2;
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
  { prompt: "Which school is nicknamed the Crimson Tide?", choices: ["Alabama", "Auburn", "Georgia", "Oklahoma"], correct: "A", explanation: "Alabama's athletic teams are known as the Crimson Tide.", statSheet: "The program plays its home games at Bryant-Denny Stadium in Tuscaloosa.", fiftyFifty: ["A", "C"], type: "program-identity" },
  { prompt: "Which trophy is awarded annually to college football's most outstanding player?", choices: ["Heisman Trophy", "Lombardi Trophy", "Butkus Trophy", "Maxwell Club Cup"], correct: "A", explanation: "The Heisman Trophy honors the most outstanding player in college football.", statSheet: "Its ceremony is traditionally held in New York, and the award dates to the 1930s.", fiftyFifty: ["A", "C"], type: "award" },
  { prompt: "At which college did Peyton Manning play his football?", choices: ["Tennessee", "Ole Miss", "LSU", "Florida"], correct: "A", explanation: "Manning played quarterback at Tennessee from 1994 through 1997.", statSheet: "He wore No. 16 and finished his college career as an SEC champion.", fiftyFifty: ["A", "B"], type: "player-school" },
  { prompt: "Which team won the 2005 season national title behind quarterback Vince Young?", choices: ["Texas", "USC", "Oklahoma", "Florida"], correct: "A", explanation: "Texas beat USC in the Rose Bowl to finish the 2005 season undefeated and win the national championship.", statSheet: "The title game ended with a famous fourth-down touchdown in the Rose Bowl.", fiftyFifty: ["A", "B"], type: "championship" },
  { prompt: "Which coach led Clemson to national titles in the 2016 and 2018 seasons?", choices: ["Dabo Swinney", "Jimbo Fisher", "Kirby Smart", "Brian Kelly"], correct: "A", explanation: "Dabo Swinney coached Clemson to national championships in the 2016 and 2018 seasons.", statSheet: "Both championship runs ended with victories over Alabama.", fiftyFifty: ["A", "C"], type: "coach" },
  { prompt: "Who won the 2019 Heisman Trophy while leading LSU to a 15-0 season?", choices: ["Joe Burrow", "Tua Tagovailoa", "Jalen Hurts", "Trevor Lawrence"], correct: "A", explanation: "Joe Burrow won the 2019 Heisman and quarterbacked LSU to a 15-0 national-title season.", statSheet: "He transferred to Baton Rouge after beginning his college career at Ohio State.", fiftyFifty: ["A", "C"], type: "award-season" },
  { prompt: "Which team beat Miami in double overtime to win the national championship at the 2003 Fiesta Bowl?", choices: ["Ohio State", "Florida State", "Nebraska", "USC"], correct: "A", explanation: "Ohio State defeated Miami 31-24 in double overtime in the 2003 Fiesta Bowl.", statSheet: "The Buckeyes entered the title game unbeaten under second-year coach Jim Tressel.", fiftyFifty: ["A", "D"], type: "championship-game" },
  { prompt: "Which program finished No. 1 in the final AP poll for the 1990 season?", choices: ["Colorado", "Georgia Tech", "Miami", "Washington"], correct: "A", explanation: "Colorado finished No. 1 in the final AP poll for the 1990 season, while Georgia Tech topped the Coaches poll.", statSheet: null, fiftyFifty: ["A", "B"], type: "historical-ranking" },
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

const seedsByLeague: Record<MillionaireLeague, readonly QuestionSeed[]> = { cfb: cfbSeeds, nfl: nflSeeds, ufc: ufcSeeds };

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

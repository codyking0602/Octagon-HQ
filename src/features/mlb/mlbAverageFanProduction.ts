import {
  assertAverageFanQuestion,
  type AverageFanGrade,
  type AverageFanQuestion,
  type AverageFanQuestionFormat,
  type AverageFanSubject,
} from "../games/averageFanEngine";

export const MLB_AVERAGE_FAN_FIRST_CHALLENGE_KEY = "mlb-2026-play-12" as const;
export const MLB_AVERAGE_FAN_FIRST_DATE = "2026-10-07" as const;
export const MLB_AVERAGE_FAN_SECOND_CHALLENGE_KEY = "mlb-2026-play-15" as const;
export const MLB_AVERAGE_FAN_SECOND_DATE = "2026-10-23" as const;

type QuestionSeed = {
  id: string;
  grade: AverageFanGrade;
  subject: AverageFanSubject;
  format: AverageFanQuestionFormat;
  prompt: string;
  answer: string;
  aliases?: readonly string[];
  choices?: readonly [string, string, string, string];
  fanMisses?: readonly string[];
  explanation: string;
  difficultyNudge?: number;
  protectedFinal?: boolean;
};

function q(seed: QuestionSeed): AverageFanQuestion {
  return assertAverageFanQuestion({
    id: seed.id,
    sport: "mlb",
    grade: seed.grade,
    subject: seed.subject,
    format: seed.format,
    prompt: seed.prompt,
    answer: seed.answer,
    aliases: seed.aliases ?? [],
    ...(seed.choices ? { choices: seed.choices } : {}),
    ...(seed.fanMisses ? { fanMisses: seed.fanMisses } : {}),
    explanation: seed.explanation,
    contentType: "evergreen",
    difficultyNudge: seed.difficultyNudge ?? 0,
    protectedFinal: seed.protectedFinal ?? false,
    sourceId: "mlb-evergreen",
  });
}

const FIRST_BOARD = [
  q({
    id: "mlb-average-fan-oct7-g1-ohtani",
    grade: 1,
    subject: "Players",
    format: "four-choice",
    prompt: "Which modern star became famous for excelling in MLB as both a pitcher and a hitter?",
    answer: "Shohei Ohtani",
    choices: ["Shohei Ohtani", "Aaron Judge", "Mookie Betts", "Mike Trout"],
    explanation: "Shohei Ohtani became a superstar while performing at an elite level as both a pitcher and a hitter.",
    difficultyNudge: -2,
  }),
  q({
    id: "mlb-average-fan-oct7-g1-fenway",
    grade: 1,
    subject: "Teams",
    format: "short-answer",
    prompt: "Which MLB team plays its home games at Fenway Park?",
    answer: "Boston Red Sox",
    aliases: ["Red Sox", "Boston"],
    fanMisses: ["New York Yankees", "Chicago Cubs", "Baltimore Orioles"],
    explanation: "Fenway Park is the longtime home of the Boston Red Sox.",
    difficultyNudge: -2,
  }),
  q({
    id: "mlb-average-fan-oct7-g2-jackie",
    grade: 2,
    subject: "MLB History",
    format: "short-answer",
    prompt: "Who broke Major League Baseball’s modern color barrier with the Brooklyn Dodgers in 1947?",
    answer: "Jackie Robinson",
    aliases: ["Robinson"],
    fanMisses: ["Satchel Paige", "Hank Aaron", "Willie Mays"],
    explanation: "Jackie Robinson debuted for Brooklyn in 1947 and broke MLB’s modern color barrier.",
    difficultyNudge: -1,
  }),
  q({
    id: "mlb-average-fan-oct7-g2-nine-innings",
    grade: 2,
    subject: "Baseball IQ",
    format: "true-false",
    prompt: "A standard regulation Major League game is scheduled for nine innings.",
    answer: "True",
    explanation: "A regulation MLB game is scheduled for nine innings unless rules or circumstances shorten it.",
    difficultyNudge: -1,
  }),
  q({
    id: "mlb-average-fan-oct7-g3-judge-62",
    grade: 3,
    subject: "Players",
    format: "short-answer",
    prompt: "Who hit 62 home runs in 2022 to set the American League single-season record?",
    answer: "Aaron Judge",
    aliases: ["Judge"],
    fanMisses: ["Shohei Ohtani", "Giancarlo Stanton", "Mike Trout"],
    explanation: "Aaron Judge hit 62 home runs for the Yankees in 2022.",
  }),
  q({
    id: "mlb-average-fan-oct7-g3-cubs-2016",
    grade: 3,
    subject: "Teams",
    format: "four-choice",
    prompt: "Which franchise won the 2016 World Series to end a 108-year championship drought?",
    answer: "Chicago Cubs",
    choices: ["Cleveland Guardians", "Chicago Cubs", "Boston Red Sox", "Kansas City Royals"],
    explanation: "The Chicago Cubs won the 2016 World Series, their first championship since 1908.",
  }),
  q({
    id: "mlb-average-fan-oct7-g4-dimaggio-56",
    grade: 4,
    subject: "MLB History",
    format: "short-answer",
    prompt: "Whose 56-game hitting streak in 1941 remains the Major League record?",
    answer: "Joe DiMaggio",
    aliases: ["DiMaggio", "Joe Dimaggio"],
    fanMisses: ["Pete Rose", "Ted Williams", "Stan Musial"],
    explanation: "Joe DiMaggio hit safely in 56 consecutive games in 1941.",
    difficultyNudge: 1,
  }),
  q({
    id: "mlb-average-fan-oct7-g4-whip",
    grade: 4,
    subject: "Baseball IQ",
    format: "short-answer",
    prompt: "What pitching statistic abbreviates walks plus hits allowed per inning pitched?",
    answer: "WHIP",
    aliases: ["Walks and hits per inning pitched", "Walks plus hits per inning pitched"],
    fanMisses: ["ERA", "FIP", "OPS"],
    explanation: "WHIP stands for walks plus hits per inning pitched.",
    difficultyNudge: 1,
  }),
  q({
    id: "mlb-average-fan-oct7-g5-ryan-strikeouts",
    grade: 5,
    subject: "Players",
    format: "four-choice",
    prompt: "Who is MLB’s career strikeout leader with 5,714?",
    answer: "Nolan Ryan",
    choices: ["Randy Johnson", "Roger Clemens", "Nolan Ryan", "Steve Carlton"],
    explanation: "Nolan Ryan recorded 5,714 strikeouts, the most in Major League history.",
    difficultyNudge: 2,
  }),
  q({
    id: "mlb-average-fan-oct7-g5-williams-406",
    grade: 5,
    subject: "MLB History",
    format: "short-answer",
    prompt: "Who hit .406 in 1941 and remains the last Major Leaguer to bat .400 in a season?",
    answer: "Ted Williams",
    aliases: ["Williams"],
    fanMisses: ["Tony Gwynn", "George Brett", "Joe DiMaggio"],
    explanation: "Ted Williams batted .406 in 1941.",
    difficultyNudge: 2,
  }),
] as const;

const FIRST_FINAL = q({
  id: "mlb-average-fan-oct7-final-career-hits",
  grade: 5,
  subject: "MLB History",
  format: "short-answer",
  prompt: "Who holds the Major League career hits record with 4,256?",
  answer: "Pete Rose",
  aliases: ["Rose"],
  fanMisses: ["Ty Cobb", "Hank Aaron", "Derek Jeter"],
  explanation: "Pete Rose finished his Major League career with a record 4,256 hits.",
  difficultyNudge: 3,
  protectedFinal: true,
});

const SECOND_BOARD = [
  q({
    id: "mlb-average-fan-oct23-g1-big-papi",
    grade: 1,
    subject: "Players",
    format: "short-answer",
    prompt: "Which Red Sox slugger was famously known as “Big Papi”?",
    answer: "David Ortiz",
    aliases: ["Ortiz", "Big Papi"],
    fanMisses: ["Manny Ramirez", "Pedro Martinez", "Nomar Garciaparra"],
    explanation: "David Ortiz became one of Boston’s most recognizable stars as “Big Papi.”",
    difficultyNudge: -2,
  }),
  q({
    id: "mlb-average-fan-oct23-g1-wrigley",
    grade: 1,
    subject: "Teams",
    format: "four-choice",
    prompt: "Which team plays its home games at Wrigley Field?",
    answer: "Chicago Cubs",
    choices: ["Chicago Cubs", "Chicago White Sox", "Milwaukee Brewers", "St. Louis Cardinals"],
    explanation: "Wrigley Field is the home of the Chicago Cubs.",
    difficultyNudge: -2,
  }),
  q({
    id: "mlb-average-fan-oct23-g2-ruth-pitcher",
    grade: 2,
    subject: "MLB History",
    format: "true-false",
    prompt: "Babe Ruth was a successful Major League pitcher before becoming baseball’s most famous home-run slugger.",
    answer: "True",
    explanation: "Ruth was an outstanding pitcher with Boston before becoming a full-time slugger.",
    difficultyNudge: -1,
  }),
  q({
    id: "mlb-average-fan-oct23-g2-three-strikes",
    grade: 2,
    subject: "Baseball IQ",
    format: "short-answer",
    prompt: "How many strikes normally make a strikeout?",
    answer: "3",
    aliases: ["Three"],
    fanMisses: ["2", "4", "5"],
    explanation: "Three strikes normally retire the batter on a strikeout.",
    difficultyNudge: -1,
  }),
  q({
    id: "mlb-average-fan-oct23-g3-canseco-4040",
    grade: 3,
    subject: "Players",
    format: "four-choice",
    prompt: "Who became the first MLB player with 40 home runs and 40 stolen bases in the same season?",
    answer: "Jose Canseco",
    aliases: ["José Canseco"],
    choices: ["Barry Bonds", "Jose Canseco", "Alex Rodriguez", "Alfonso Soriano"],
    explanation: "Jose Canseco became the first member of the 40-40 club in 1988.",
  }),
  q({
    id: "mlb-average-fan-oct23-g3-giants-three",
    grade: 3,
    subject: "Teams",
    format: "short-answer",
    prompt: "Which team won the World Series in 2010, 2012 and 2014?",
    answer: "San Francisco Giants",
    aliases: ["Giants", "SF Giants"],
    fanMisses: ["Boston Red Sox", "St. Louis Cardinals", "Los Angeles Dodgers"],
    explanation: "San Francisco won three championships in five seasons: 2010, 2012 and 2014.",
  }),
  q({
    id: "mlb-average-fan-oct23-g4-larsen-perfect",
    grade: 4,
    subject: "MLB History",
    format: "short-answer",
    prompt: "Who threw the only perfect game in World Series history?",
    answer: "Don Larsen",
    aliases: ["Larsen"],
    fanMisses: ["Sandy Koufax", "Bob Gibson", "Whitey Ford"],
    explanation: "Don Larsen threw a perfect game for the Yankees in Game 5 of the 1956 World Series.",
    difficultyNudge: 1,
  }),
  q({
    id: "mlb-average-fan-oct23-g4-ops",
    grade: 4,
    subject: "Baseball IQ",
    format: "four-choice",
    prompt: "Which common hitting statistic adds on-base percentage and slugging percentage?",
    answer: "OPS",
    choices: ["ERA", "OPS", "WHIP", "WAR"],
    explanation: "OPS stands for on-base plus slugging.",
    difficultyNudge: 1,
  }),
  q({
    id: "mlb-average-fan-oct23-g5-rickey-steals",
    grade: 5,
    subject: "Players",
    format: "short-answer",
    prompt: "Who holds the Major League career stolen-base record with 1,406?",
    answer: "Rickey Henderson",
    aliases: ["Henderson", "Rickey"],
    fanMisses: ["Lou Brock", "Tim Raines", "Vince Coleman"],
    explanation: "Rickey Henderson stole a record 1,406 bases in his Major League career.",
    difficultyNudge: 2,
  }),
  q({
    id: "mlb-average-fan-oct23-g5-ripken-streak",
    grade: 5,
    subject: "MLB History",
    format: "short-answer",
    prompt: "Who played in a record 2,632 consecutive Major League games?",
    answer: "Cal Ripken Jr.",
    aliases: ["Cal Ripken", "Ripken"],
    fanMisses: ["Lou Gehrig", "Pete Rose", "Eddie Murray"],
    explanation: "Cal Ripken Jr. played in 2,632 consecutive games from 1982 through 1998.",
    difficultyNudge: 2,
  }),
] as const;

const SECOND_FINAL = q({
  id: "mlb-average-fan-oct23-final-triple-crown",
  grade: 5,
  subject: "Players",
  format: "short-answer",
  prompt: "Who won the 2012 American League Triple Crown?",
  answer: "Miguel Cabrera",
  aliases: ["Cabrera", "Miggy"],
  fanMisses: ["Mike Trout", "Albert Pujols", "Josh Hamilton"],
  explanation: "Miguel Cabrera led the American League in batting average, home runs and RBI in 2012.",
  difficultyNudge: 3,
  protectedFinal: true,
});

export type MlbAverageFanProductionConfig = {
  challengeKey: string;
  challengeDate: string;
  questions: readonly AverageFanQuestion[];
  finalQuestion: AverageFanQuestion;
};

export const MLB_AVERAGE_FAN_PRODUCTION_RUNS: readonly MlbAverageFanProductionConfig[] = [
  {
    challengeKey: MLB_AVERAGE_FAN_FIRST_CHALLENGE_KEY,
    challengeDate: MLB_AVERAGE_FAN_FIRST_DATE,
    questions: FIRST_BOARD,
    finalQuestion: FIRST_FINAL,
  },
  {
    challengeKey: MLB_AVERAGE_FAN_SECOND_CHALLENGE_KEY,
    challengeDate: MLB_AVERAGE_FAN_SECOND_DATE,
    questions: SECOND_BOARD,
    finalQuestion: SECOND_FINAL,
  },
] as const;

export function mlbAverageFanProductionConfig(
  challengeKey: string,
  challengeDate: string,
): MlbAverageFanProductionConfig | null {
  return MLB_AVERAGE_FAN_PRODUCTION_RUNS.find((run) => (
    run.challengeKey === challengeKey && run.challengeDate === challengeDate
  )) ?? null;
}

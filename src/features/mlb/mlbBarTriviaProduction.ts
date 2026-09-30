import { barTriviaQuestion, type BarTriviaDoubleRound, type BarTriviaQuestion } from "../games/barTriviaEngine";

export const MLB_BAR_TRIVIA_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-11";
export const MLB_BAR_TRIVIA_PRODUCTION_DATE = "2026-10-11";
export const MLB_BAR_TRIVIA_DOUBLE_ROUND: BarTriviaDoubleRound = "round2";

export const MLB_BAR_TRIVIA_PRODUCTION_RUN = [
  barTriviaQuestion({
    id: "mlb-prod-r1-two-way-star",
    league: "mlb",
    round: "round1",
    category: "Modern Stars",
    prompt: "Which modern superstar is famous for starring as both a pitcher and a hitter?",
    choices: ["Aaron Judge", "Shohei Ohtani", "Mookie Betts", "Mike Trout"],
    answer: "Shohei Ohtani",
    explanation: "Shohei Ohtani became a global star by performing at an elite level as both a starting pitcher and a power hitter.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r1-fenway",
    league: "mlb",
    round: "round1",
    category: "Ballparks",
    prompt: "Which team plays its home games at Fenway Park?",
    choices: ["Boston Red Sox", "New York Mets", "Philadelphia Phillies", "Baltimore Orioles"],
    answer: "Boston Red Sox",
    explanation: "Fenway Park has been the home of the Boston Red Sox since 1912.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r1-judge-62",
    league: "mlb",
    round: "round1",
    category: "Home Runs",
    prompt: "Who hit 62 home runs in 2022 to set the American League single-season record?",
    choices: ["Mike Trout", "Giancarlo Stanton", "Vladimir Guerrero Jr.", "Aaron Judge"],
    answer: "Aaron Judge",
    explanation: "Aaron Judge hit 62 home runs in 2022, breaking Roger Maris' long-standing American League record.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r2-cubs-2016",
    league: "mlb",
    round: "round2",
    category: "World Series",
    prompt: "Which team won the 2016 World Series to end a 108-year championship drought?",
    choices: ["Cleveland Guardians", "Kansas City Royals", "Chicago Cubs", "Houston Astros"],
    answer: "Chicago Cubs",
    explanation: "The Chicago Cubs won the 2016 World Series, their first championship since 1908.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r2-big-papi",
    league: "mlb",
    round: "round2",
    category: "Nicknames",
    prompt: "Which Red Sox slugger was famously known as “Big Papi”?",
    choices: ["David Ortiz", "Manny Ramirez", "Pedro Martinez", "Nomar Garciaparra"],
    answer: "David Ortiz",
    explanation: "David Ortiz became one of Boston's most recognizable stars under the nickname “Big Papi.”",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r2-big-unit",
    league: "mlb",
    round: "round2",
    category: "Nicknames",
    prompt: "Which Hall of Fame pitcher was nicknamed “The Big Unit”?",
    choices: ["Greg Maddux", "Pedro Martinez", "Curt Schilling", "Randy Johnson"],
    answer: "Randy Johnson",
    explanation: "At 6-foot-10 with an overpowering fastball, Randy Johnson became famous as “The Big Unit.”",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r3-first-40-40",
    league: "mlb",
    round: "round3",
    category: "Milestones",
    prompt: "Who became the first MLB player to hit 40 home runs and steal 40 bases in the same season?",
    choices: ["Barry Bonds", "Jose Canseco", "Alex Rodriguez", "Alfonso Soriano"],
    answer: "Jose Canseco",
    explanation: "Jose Canseco became the first member of the 40-40 club in 1988.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r3-giants-dynasty",
    league: "mlb",
    round: "round3",
    category: "World Series",
    prompt: "Which team won World Series titles in 2010, 2012, and 2014?",
    choices: ["Boston Red Sox", "St. Louis Cardinals", "San Francisco Giants", "New York Yankees"],
    answer: "San Francisco Giants",
    explanation: "San Francisco won three championships in five seasons: 2010, 2012, and 2014.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-r3-last-400",
    league: "mlb",
    round: "round3",
    category: "Batting Records",
    prompt: "Who remains the last MLB player to hit .400 or better in a season?",
    choices: ["Tony Gwynn", "George Brett", "Rod Carew", "Ted Williams"],
    answer: "Ted Williams",
    explanation: "Ted Williams hit .406 in 1941 and remains the last Major Leaguer to finish a season at .400 or better.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod-last-cy-young",
    league: "mlb",
    round: "last-call",
    category: "Awards",
    prompt: "Which pitcher won a record seven Cy Young Awards?",
    choices: ["Randy Johnson", "Roger Clemens", "Greg Maddux", "Steve Carlton"],
    answer: "Roger Clemens",
    explanation: "Roger Clemens won seven Cy Young Awards, the most in Major League history.",
    sourceId: "mlb-evergreen",
  }),
] as const satisfies readonly BarTriviaQuestion[];


export const MLB_BAR_TRIVIA_SECOND_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-16";
export const MLB_BAR_TRIVIA_SECOND_PRODUCTION_DATE = "2026-10-27";
export const MLB_BAR_TRIVIA_SECOND_DOUBLE_ROUND: BarTriviaDoubleRound = "round3";

export const MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN = [
  barTriviaQuestion({
    id: "mlb-prod2-r1-bambino",
    league: "mlb",
    round: "round1",
    category: "Nicknames",
    prompt: "Which baseball legend was famously nicknamed “The Bambino”?",
    choices: ["Joe DiMaggio", "Lou Gehrig", "Babe Ruth", "Mickey Mantle"],
    answer: "Babe Ruth",
    explanation: "Babe Ruth was famously known as both “The Bambino” and “The Sultan of Swat.”",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r1-jeter-number",
    league: "mlb",
    round: "round1",
    category: "Yankees",
    prompt: "What number did longtime Yankees captain Derek Jeter wear?",
    choices: ["2", "7", "13", "23"],
    answer: "2",
    explanation: "Derek Jeter wore No. 2 throughout his Yankees career, and the club retired it in 2017.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r1-wrigley",
    league: "mlb",
    round: "round1",
    category: "Ballparks",
    prompt: "Which MLB team plays its home games at Wrigley Field?",
    choices: ["Chicago White Sox", "St. Louis Cardinals", "Milwaukee Brewers", "Chicago Cubs"],
    answer: "Chicago Cubs",
    explanation: "Wrigley Field has been the home of the Chicago Cubs since 1916.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r2-dimaggio-streak",
    league: "mlb",
    round: "round2",
    category: "Records",
    prompt: "Whose 56-game hitting streak in 1941 remains the MLB record?",
    choices: ["Ted Williams", "Joe DiMaggio", "Pete Rose", "Stan Musial"],
    answer: "Joe DiMaggio",
    explanation: "Joe DiMaggio hit safely in 56 consecutive games in 1941, a record that still stands.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r2-ryan-strikeouts",
    league: "mlb",
    round: "round2",
    category: "Pitching Records",
    prompt: "Who is MLB’s all-time career strikeout leader with 5,714?",
    choices: ["Randy Johnson", "Roger Clemens", "Nolan Ryan", "Steve Carlton"],
    answer: "Nolan Ryan",
    explanation: "Nolan Ryan struck out 5,714 batters, the most in Major League history.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r2-jackie-42",
    league: "mlb",
    round: "round2",
    category: "Baseball History",
    prompt: "Whose No. 42 is retired across all of Major League Baseball?",
    choices: ["Jackie Robinson", "Hank Aaron", "Willie Mays", "Roberto Clemente"],
    answer: "Jackie Robinson",
    explanation: "MLB retired Jackie Robinson’s No. 42 across the league in 1997.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r3-cabrera-triple-crown",
    league: "mlb",
    round: "round3",
    category: "Awards",
    prompt: "Who won the 2012 American League Triple Crown?",
    choices: ["Mike Trout", "Albert Pujols", "Josh Hamilton", "Miguel Cabrera"],
    answer: "Miguel Cabrera",
    explanation: "Miguel Cabrera led the AL in batting average, home runs and RBI in 2012.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r3-larsen-perfect",
    league: "mlb",
    round: "round3",
    category: "World Series",
    prompt: "Who threw the only perfect game in World Series history?",
    choices: ["Sandy Koufax", "Don Larsen", "Bob Gibson", "Whitey Ford"],
    answer: "Don Larsen",
    explanation: "Don Larsen pitched a perfect game for the Yankees in Game 5 of the 1956 World Series.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-r3-ripken-streak",
    league: "mlb",
    round: "round3",
    category: "Iron Men",
    prompt: "Who played in a record 2,632 consecutive Major League games?",
    choices: ["Lou Gehrig", "Pete Rose", "Cal Ripken Jr.", "Eddie Murray"],
    answer: "Cal Ripken Jr.",
    explanation: "Cal Ripken Jr. played in 2,632 straight games from 1982 through 1998.",
    sourceId: "mlb-evergreen",
  }),
  barTriviaQuestion({
    id: "mlb-prod2-last-rickey-steals",
    league: "mlb",
    round: "last-call",
    category: "Career Records",
    prompt: "Who is MLB’s all-time career stolen-base leader?",
    choices: ["Rickey Henderson", "Lou Brock", "Tim Raines", "Vince Coleman"],
    answer: "Rickey Henderson",
    explanation: "Rickey Henderson stole 1,406 bases in his career, the Major League record.",
    sourceId: "mlb-evergreen",
  }),
] as const satisfies readonly BarTriviaQuestion[];

export type MlbBarTriviaProductionConfig = {
  challengeKey: string;
  challengeDate: string;
  run: readonly BarTriviaQuestion[];
  doubleRound: BarTriviaDoubleRound;
};

export function mlbBarTriviaProductionConfig(
  challengeKey: string,
  challengeDate: string,
): MlbBarTriviaProductionConfig | null {
  if (
    challengeKey === MLB_BAR_TRIVIA_PRODUCTION_CHALLENGE_KEY
    && challengeDate === MLB_BAR_TRIVIA_PRODUCTION_DATE
  ) {
    return {
      challengeKey,
      challengeDate,
      run: MLB_BAR_TRIVIA_PRODUCTION_RUN,
      doubleRound: MLB_BAR_TRIVIA_DOUBLE_ROUND,
    };
  }

  if (
    challengeKey === MLB_BAR_TRIVIA_SECOND_PRODUCTION_CHALLENGE_KEY
    && challengeDate === MLB_BAR_TRIVIA_SECOND_PRODUCTION_DATE
  ) {
    return {
      challengeKey,
      challengeDate,
      run: MLB_BAR_TRIVIA_SECOND_PRODUCTION_RUN,
      doubleRound: MLB_BAR_TRIVIA_SECOND_DOUBLE_ROUND,
    };
  }

  return null;
}

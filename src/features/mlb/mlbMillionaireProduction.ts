import type { MillionaireChoiceId, MillionaireRuntimeQuestion } from "../games/millionaireAuthority";
import type { MillionaireRun } from "../games/millionaireEngine";

export const MLB_MILLIONAIRE_PRODUCTION_DATE = "2026-10-03" as const;
export const MLB_MILLIONAIRE_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-03" as const;

type SourceNote = {
  questionId: string;
  authority: "MLB.com";
  url: string;
  verifiedAt: "2026-09-25";
};

function question({
  id,
  level,
  money,
  type,
  prompt,
  choices,
  correct,
  explanation,
  statSheet,
  fiftyFifty,
}: {
  id: string;
  level: MillionaireRuntimeQuestion["level"];
  money: number;
  type: string;
  prompt: string;
  choices: readonly [string, string, string, string];
  correct: MillionaireChoiceId;
  explanation: string;
  statSheet: string | null;
  fiftyFifty: readonly [MillionaireChoiceId, MillionaireChoiceId];
}): MillionaireRuntimeQuestion {
  const ids = ["A", "B", "C", "D"] as const;
  const survivorSet = new Set<MillionaireChoiceId>(fiftyFifty);
  const removalChoiceIds = ids.filter((choiceId) => !survivorSet.has(choiceId)) as [MillionaireChoiceId, MillionaireChoiceId];
  const q8 = level === "Q8";

  return {
    id,
    // The shared Millionaire engine currently models sport scope as UFC vs. football.
    // MLB supplies its own presentation/run while using the non-UFC engine branch.
    sport: "football",
    level,
    money,
    type,
    prompt,
    choices: ids.map((choiceId, index) => ({ id: choiceId, text: choices[index]! })) as [
      { id: "A"; text: string },
      { id: "B"; text: string },
      { id: "C"; text: string },
      { id: "D"; text: string },
    ],
    correctChoiceId: correct,
    explanation,
    statSheet,
    fiftyFifty: {
      survivorChoiceIds: fiftyFifty,
      removalChoiceIds,
    },
    lifelineCompatibility: {
      fiftyFifty: !q8,
      statSheet: !q8,
      doubleDip: !q8,
    },
  };
}

/**
 * Spoiler-protected production run for the first scheduled MLB Millionaire challenge.
 * This bank is intentionally separate from the owner-review prompts in
 * MillionaireCasualModel.ts.
 */
export const MLB_MILLIONAIRE_PRODUCTION_RUN_2026_10_03: MillionaireRun = [
  question({
    id: "mlb-2026-10-03-millionaire-q1",
    level: "Q1",
    money: 500,
    type: "rules",
    prompt: "How many strikes normally make a strikeout?",
    choices: ["Two", "Three", "Four", "Five"],
    correct: "B",
    explanation: "A strikeout is recorded when a hitter accumulates three strikes.",
    statSheet: "A strikeout is scored with the letter K.",
    fiftyFifty: ["B", "C"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q2",
    level: "Q2",
    money: 1_000,
    type: "history",
    prompt: "MLB retired No. 42 across every club in honor of which player?",
    choices: ["Roberto Clemente", "Satchel Paige", "Hank Aaron", "Jackie Robinson"],
    correct: "D",
    explanation: "Major League Baseball retired No. 42 across the sport in honor of Jackie Robinson.",
    statSheet: "The honor was announced in 1997, 50 years after he broke MLB's color barrier with Brooklyn.",
    fiftyFifty: ["A", "D"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q3",
    level: "Q3",
    money: 5_000,
    type: "modern-history",
    prompt: "Who became the first MLB player with 50 home runs and 50 stolen bases in one season?",
    choices: ["Ronald Acuna Jr.", "Aaron Judge", "Shohei Ohtani", "Mookie Betts"],
    correct: "C",
    explanation: "Shohei Ohtani established MLB's first 50-homer, 50-steal season in 2024.",
    statSheet: "He reached the milestone in his first season with the Dodgers.",
    fiftyFifty: ["A", "C"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q4",
    level: "Q4",
    money: 10_000,
    type: "championship-history",
    prompt: "Which team ended a 108-year World Series championship drought in 2016?",
    choices: ["Chicago Cubs", "Cleveland", "New York Mets", "Detroit Tigers"],
    correct: "A",
    explanation: "The Chicago Cubs won the 2016 World Series, their first championship since 1908.",
    statSheet: "They won Game 7 in extra innings after a brief rain delay.",
    fiftyFifty: ["A", "B"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q5",
    level: "Q5",
    money: 50_000,
    type: "career-record",
    prompt: "Whose streak of 2,632 consecutive games played is the MLB record?",
    choices: ["Lou Gehrig", "Pete Rose", "Cal Ripken Jr.", "Ichiro Suzuki"],
    correct: "C",
    explanation: "Cal Ripken Jr. played 2,632 consecutive games from 1982 through 1998.",
    statSheet: "The Orioles star passed Lou Gehrig's long-standing mark in 1995.",
    fiftyFifty: ["A", "C"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q6",
    level: "Q6",
    money: 100_000,
    type: "career-record",
    prompt: "Who holds MLB's career stolen-base record with 1,406?",
    choices: ["Tim Raines", "Rickey Henderson", "Lou Brock", "Vince Coleman"],
    correct: "B",
    explanation: "Rickey Henderson finished his career with an MLB-record 1,406 stolen bases.",
    statSheet: "He also set the modern single-season record with 130 steals in 1982.",
    fiftyFifty: ["B", "C"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q7",
    level: "Q7",
    money: 500_000,
    type: "pitching-record",
    prompt: "Which pitcher threw seven no-hitters, the most in MLB history?",
    choices: ["Sandy Koufax", "Justin Verlander", "Cy Young", "Nolan Ryan"],
    correct: "D",
    explanation: "Nolan Ryan holds the individual MLB record with seven no-hitters.",
    statSheet: "The next-highest total is four.",
    fiftyFifty: ["A", "D"],
  }),
  question({
    id: "mlb-2026-10-03-millionaire-q8",
    level: "Q8",
    money: 1_000_000,
    type: "team-season",
    prompt: "Which team won 116 regular-season games in 2001, tying the MLB single-season record?",
    choices: ["Seattle Mariners", "New York Yankees", "Atlanta Braves", "Oakland Athletics"],
    correct: "A",
    explanation: "The 2001 Seattle Mariners finished 116-46, tying the MLB single-season wins record.",
    statSheet: null,
    fiftyFifty: ["A", "D"],
  }),
];

export const MLB_MILLIONAIRE_PRODUCTION_SOURCE_NOTES: readonly SourceNote[] = [
  {
    questionId: "mlb-2026-10-03-millionaire-q1",
    authority: "MLB.com",
    url: "https://www.mlb.com/glossary/standard-stats/strikeout",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q2",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/every-mlb-team-s-retired-numbers-c300753386",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q3",
    authority: "MLB.com",
    url: "https://www.mlb.com/press-release/press-release-shohei-ohtani-becomes-first-50-50-player-in-mlb-history",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q4",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/chicago-cubs-win-2016-world-series-c207938228",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q5",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/amazing-facts-about-cal-ripken-jr-s-games-played-streak",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q6",
    authority: "MLB.com",
    url: "https://www.mlb.com/player/rickey-henderson-115749",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q7",
    authority: "MLB.com",
    url: "https://www.mlb.com/news/no-hitter-facts-and-figures",
    verifiedAt: "2026-09-25",
  },
  {
    questionId: "mlb-2026-10-03-millionaire-q8",
    authority: "MLB.com",
    url: "https://www.mlb.com/mariners/history/timeline-2000s",
    verifiedAt: "2026-09-25",
  },
] as const;

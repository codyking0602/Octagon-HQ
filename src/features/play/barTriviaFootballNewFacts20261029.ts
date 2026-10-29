import { barTriviaQuestion, type BarTriviaQuestion } from "../games/barTriviaEngine";

/**
 * Four sourced, distinct football moments replacing administrative minutiae.
 * Each fact was checked against the existing selectable Bar Trivia,
 * Millionaire candidate and Average Fan question text (lightweight, not exhaustive).
 * In particular, Mecole Hardman, Kadarius Toney and Isaiah Bond proposals were
 * rejected because the same moments and answers already appear in another game.
 */
export const FOOTBALL_BAR_TRIVIA_QUALITY_NEW_QUESTIONS: readonly BarTriviaQuestion[] = [
  barTriviaQuestion({
    id: "nfl-q29-hard-miami-miracle-drake",
    league: "nfl",
    round: "round3",
    category: "Iconic Finishes",
    prompt: "Which Dolphins running back finished the 2018 Miami Miracle's final-play laterals with a game-winning touchdown against New England?",
    choices: ["Kenyan Drake", "Frank Gore", "Kenny Stills", "DeVante Parker"],
    answer: "Kenyan Drake",
    explanation: "Kenyan Drake raced into the end zone after receiving a lateral from DeVante Parker on the 69-yard, walk-off play against the Patriots.",
    sourceId: "nfl-2018-miami-miracle-drake",
    sourceUrl: "https://www.nfl.com/news/ryan-tannehill-on-miami-miracle-pretty-amazing-0ap3000000997916",
    verifiedAt: "2026-10-29",
  }),
  barTriviaQuestion({
    id: "nfl-q29-hard-hail-murray-hopkins",
    league: "nfl",
    round: "round3",
    category: "Iconic Catches",
    prompt: "Which Cardinals receiver caught Kyler Murray's game-winning Hail Mary over three Bills defenders in 2020?",
    choices: ["DeAndre Hopkins", "Larry Fitzgerald", "Christian Kirk", "Andy Isabella"],
    answer: "DeAndre Hopkins",
    explanation: "DeAndre Hopkins won the jump ball over three Buffalo defenders on a 43-yard touchdown late in Arizona's November 2020 win.",
    sourceId: "nfl-2020-hail-murray-hopkins",
    sourceUrl: "https://www.nfl.com/news/cardinals-wr-deandre-hopkins-on-hail-mary-td-they-were-in-position-it-was-just-a",
    verifiedAt: "2026-10-29",
  }),
  barTriviaQuestion({
    id: "cfb-q29-hard-alabama-tennessee-kicker",
    league: "cfb",
    round: "round3",
    category: "Rivalry Thrillers",
    prompt: "Which Tennessee kicker hit the walk-off 40-yard field goal to beat Alabama 52–49 in October 2022?",
    choices: ["Chase McGrath", "Will Reichard", "Harrison Mevis", "Jack Podlesny"],
    answer: "Chase McGrath",
    explanation: "Chase McGrath made the 40-yard game winner as time expired, ending Tennessee's 15-game losing streak to Alabama.",
    sourceId: "tennessee-2022-bama-winning-field-goal",
    sourceUrl: "https://utsports.com/sports/football/roster/chase-mcgrath/14967",
    verifiedAt: "2026-10-29",
  }),
  barTriviaQuestion({
    id: "cfb-q29-hard-lsu-chase-clemson",
    league: "cfb",
    round: "round3",
    category: "National Title Moments",
    prompt: "Which LSU receiver caught nine passes for 221 yards and two touchdowns against Clemson in the 2019-season national title game?",
    choices: ["Ja'Marr Chase", "Justin Jefferson", "Terrace Marshall Jr.", "Thaddeus Moss"],
    answer: "Ja'Marr Chase",
    explanation: "Ja'Marr Chase produced 221 receiving yards and two scores as LSU beat Clemson 42–25 in January 2020.",
    sourceId: "lsu-2019-title-chase-221",
    sourceUrl: "https://lsusports.net/news/2020/01/13/lsu-football-national-championship-game-recap",
    verifiedAt: "2026-10-29",
  }),
];

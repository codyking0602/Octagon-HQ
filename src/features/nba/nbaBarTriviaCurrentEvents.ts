import { barTriviaQuestion, type BarTriviaQuestion } from "../games/barTriviaEngine";

/**
 * Editorially approved NBA current events, never an automatic news-question generator.
 * Ingest new rows only after checking the league report, choices, and factual result.
 * Each story has a short explicit window. Expired stories are never playable.
 */
export const NBA_BAR_TRIVIA_CURRENT_EVENTS: readonly BarTriviaQuestion[] = [
  // November 10 editorial rerun; timed to the first November 19 NBA Bar Trivia appearance.
  barTriviaQuestion({
    id: "nba-current-2026-11-04-wembanyama-52-24",
    league: "nba",
    round: "round1",
    difficulty: "easy",
    category: "Star Performances",
    prompt: "Which NBA star put up 52 points, 24 rebounds and eight blocks in a November 4 win over Dallas?",
    choices: ["Victor Wembanyama","Giannis Antetokounmpo","Nikola Jokić","Joel Embiid"],
    answer: "Victor Wembanyama",
    explanation: "Victor Wembanyama set career highs with 52 points and 24 rebounds, adding eight blocks as San Antonio beat Dallas 112–111 on November 4, 2026.",
    contentType: "current-event",
    activeFrom: "2026-11-10T00:00:00-06:00",
    expiresAt: "2026-11-25T23:59:59-06:00",
    sourceId: "nba-2026-11-04-wembanyama-mavs-52-24",
    sourceUrl: "https://www.nba.com/game/DAL-vs-SAS-0022600184",
    verifiedAt: "2026-11-10",
  }),

  barTriviaQuestion({
    id: "nba-current-2026-11-07-warriors-seven-straight",
    league: "nba",
    round: "round2",
    difficulty: "medium",
    category: "Early-Season Turnarounds",
    prompt: "Which NBA team followed an 0–3 start to 2026–27 by winning seven consecutive games by November 7?",
    choices: ["Golden State Warriors","New York Knicks","Miami Heat","Phoenix Suns"],
    answer: "Golden State Warriors",
    explanation: "Golden State rebounded from an 0–3 start with seven consecutive wins, capped by Stephen Curry's 41-point overtime performance against Orlando on November 7, 2026.",
    contentType: "current-event",
    activeFrom: "2026-11-10T00:00:00-06:00",
    expiresAt: "2026-11-25T23:59:59-06:00",
    sourceId: "nba-2026-11-07-gsw-seven-after-zero-three",
    sourceUrl: "https://www.nba.com/warriors/news/gameday-recap-20261107",
    verifiedAt: "2026-11-10",
  }),

  barTriviaQuestion({
    id: "nba-current-2026-sixers-29-point-comeback",
    league: "nba",
    round: "round1",
    difficulty: "easy",
    category: "Historic Comebacks",
    prompt: "Which NBA team erased a 29-point deficit to beat Cleveland during opening week of the 2026–27 season?",
    choices: ["Philadelphia 76ers", "New York Knicks", "Boston Celtics", "Indiana Pacers"],
    answer: "Philadelphia 76ers",
    explanation: "Philadelphia rallied from 29 points down to defeat Cleveland 114–106 on October 22, 2026, the largest comeback of LeBron James' career.",
    contentType: "current-event",
    activeFrom: "2026-10-27T00:00:00-05:00",
    expiresAt: "2026-11-07T23:59:59-06:00",
    sourceId: "nba-2026-10-22-sixers-cavs-comeback",
    sourceUrl: "https://www.nba.com/news/4-takeaways-76ers-cavaliers-2026-27",
    verifiedAt: "2026-10-27",
  }),

  barTriviaQuestion({"id":"nba-current-2026-opening-lebron-sixers","round":"round1","category":"Opening Week Moves","prompt":"Which team did LeBron James debut for in the 2026-27 NBA season after leaving the Lakers?","choices":["Philadelphia 76ers","Cleveland Cavaliers","New York Knicks","Miami Heat"],"answer":"Philadelphia 76ers","explanation":"LeBron James opened 2026-27 as a 76er and had 14 points, nine rebounds and seven assists in his first game with Philadelphia.","league":"nba","contentType":"current-event","activeFrom":"2026-10-23T00:00:00-05:00","expiresAt":"2026-11-06T23:59:59-06:00","sourceId":"nba-current-2026-opening-lebron-sixers","sourceUrl":"https://www.nba.com/news/starting-5-october-22-2026","verifiedAt":"2026-10-23"}),
  barTriviaQuestion({"id":"nba-current-2026-opening-kawhi-raptors","round":"round1","category":"Opening Week Returns","prompt":"Which former Finals MVP returned to the Raptors for their 2026-27 season opener against Chicago?","choices":["Kawhi Leonard","Pascal Siakam","DeMar DeRozan","Fred VanVleet"],"answer":"Kawhi Leonard","explanation":"Kawhi Leonard received a standing ovation on his Toronto return and scored 23 points in a 135-92 win over Chicago.","league":"nba","contentType":"current-event","activeFrom":"2026-10-23T00:00:00-05:00","expiresAt":"2026-11-06T23:59:59-06:00","sourceId":"nba-current-2026-opening-kawhi-raptors","sourceUrl":"https://www.nba.com/news/starting-5-october-22-2026","verifiedAt":"2026-10-23"}),
  barTriviaQuestion({"id":"nba-current-2026-opening-ad-wizards","round":"round1","category":"Opening Week Debuts","prompt":"Which team received 34 points from Anthony Davis in his 2026-27 season-opening debut against Milwaukee?","choices":["Washington Wizards","Los Angeles Lakers","Dallas Mavericks","Brooklyn Nets"],"answer":"Washington Wizards","explanation":"Anthony Davis scored 34 points and grabbed 12 rebounds in his first game for Washington, a 128-116 win over the Bucks.","league":"nba","contentType":"current-event","activeFrom":"2026-10-23T00:00:00-05:00","expiresAt":"2026-11-06T23:59:59-06:00","sourceId":"nba-current-2026-opening-ad-wizards","sourceUrl":"https://www.nba.com/news/starting-5-october-22-2026","verifiedAt":"2026-10-23"}),
  barTriviaQuestion({"id":"nba-current-2026-opening-lillard-blazers","round":"round2","category":"Opening Week Comebacks","prompt":"Which returning Portland star scored 25 points and hit six threes in the Blazers' 2026-27 opener?","choices":["Damian Lillard","Anfernee Simons","CJ McCollum","Jrue Holiday"],"answer":"Damian Lillard","explanation":"Damian Lillard opened his second Portland stint with 25 points and six three-pointers in a 124-83 victory over Phoenix.","league":"nba","contentType":"current-event","activeFrom":"2026-10-23T00:00:00-05:00","expiresAt":"2026-11-06T23:59:59-06:00","sourceId":"nba-current-2026-opening-lillard-blazers","sourceUrl":"https://www.nba.com/news/starting-5-october-22-2026","verifiedAt":"2026-10-23"}),
  barTriviaQuestion({"id":"nba-current-2026-opening-ty-jerome","round":"round2","category":"Opening Week Records","prompt":"Which Grizzlies player scored a career-high 45 points in Memphis' 2026-27 opener against Utah?","choices":["Ty Jerome","Ja Morant","Zach Edey","Jaren Jackson Jr."],"answer":"Ty Jerome","explanation":"Ty Jerome scored 45 points against the Jazz, setting a Grizzlies record for points in a season-opening game.","league":"nba","contentType":"current-event","activeFrom":"2026-10-23T00:00:00-05:00","expiresAt":"2026-11-06T23:59:59-06:00","sourceId":"nba-current-2026-opening-ty-jerome","sourceUrl":"https://www.nba.com/news/starting-5-october-22-2026","verifiedAt":"2026-10-23"}),
];

/** A gated staging contract; prevents accidental evergreen/news mixing and stale publishing. */
export function validateNbaBarTriviaCurrentEvents(events: readonly BarTriviaQuestion[]) {
  const ids = new Set<string>();
  for (const q of events) {
    const start = Date.parse(q.activeFrom ?? "");
    const end = Date.parse(q.expiresAt ?? "");
    const verified = Date.parse(q.verifiedAt ?? "");
    if (q.league !== "nba" || q.contentType !== "current-event" || !q.id.startsWith("nba-current-") ||
      ids.has(q.id) || q.choices.length !== 4 || new Set(q.choices).size !== 4 ||
      !q.choices.includes(q.answer) || !q.prompt || q.explanation.length < 60 ||
      !q.sourceUrl?.startsWith("https://www.nba.com/") || !q.verifiedAt ||
      !Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(verified) ||
      !(end > start) || end - start > 21 * 86_400_000 || verified > end) {
      throw new Error(`NBA Bar Trivia current-event editorial check failed: ${q.id}`);
    }
    ids.add(q.id);
  }
}

validateNbaBarTriviaCurrentEvents(NBA_BAR_TRIVIA_CURRENT_EVENTS);

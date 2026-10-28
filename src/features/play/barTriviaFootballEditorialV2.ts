import { barTriviaQuestion, type BarTriviaQuestion, type BarTriviaQuestionSeed } from "../games/barTriviaEngine";

/** Future selection only. The original rows remain available to historic official setup snapshots. */
export const FOOTBALL_BAR_TRIVIA_V2_RETIREMENTS: ReadonlySet<string> = new Set([
  "nfl-easy2-lambeau-home",
  "nfl-easy2-music-city-team",
  "nfl-r1-texans-final-name",
  "nfl-r3-texans-other-finalist",
  "nfl-r2-first-regular-outside-us-teams",
  "nfl-r2-first-regular-outside-na-teams",
  "nfl-r3-first-black-pro", // Tony Dungy fact duplicates active NFL Average Fan; preserve archived source only.
  "nfl-r3-first-national-radio-announcer",
  "nfl-final-first-radio-game-year",
  "nfl-r2-radio-helmet-quarterback",
  "nfl-final-radio-helmet-test-year",
  "nfl-r3-boston-braves-year",
  "nfl-r3-tebow-ot-seconds",
  "nfl-r3-one-yard-short-player",
  "nfl-r3-philly-special-snap",
  "nfl-r2-helmet-catch-qb",
  "nfl-r3-thanksgiving-1934-opponent",
  "nfl-r2-immaculate-number-one",
  "nfl-final-cardinals-name-quote",
  "nfl-r3-sb-i-attendance",
  "nfl-r3-first-female-super-bowl-official",
  "nfl-r3-lombardi-renamed-year",
  "nfl-final-lombardi-old-name",
  "nfl-r3-first-tv-network",
  "nfl-final-first-tv-stadium",
  "nfl-r3-pro-bowl-honolulu",
  "nfl-r3-first-all-games-televised",
  "nfl-final-first-national-thanksgiving-tv",
  "nfl-final-first-american-bowl",
  "nfl-r3-dayton-triangles",
  "nfl-r3-first-night-game",
  "nfl-r3-first-indoor-game",
  "nfl-r3-touchdown-six-points",
  "cfb-r1-army-mascot",
  "cfb-r1-navy-mascot",
  "cfb-r2-traveler-debut-year",
  "cfb-r2-osceola-start-year",
  "cfb-r2-reck-car",
  "cfb-r2-wave-born",
  "cfb-r3-blue-first-nongreen",
  "cfb-r3-blue-first-game",
  "cfb-r3-heisman-first-wr-school",
  "cfb-r3-heisman-first-freshman-school",
  "cfb-r3-heisman-first-defensive-school",
  "cfb-final-heisman-threeway-player",
  "cfb-final-egg-trophy-introduced",
  "cfb-final-reck-original-newspaper",
  "cfb-r2-rose-football-return",
  "cfb-r2-rose-stadium-first-game",
  "cfb-r3-rose-first-transcontinental-radio",
  "cfb-final-rose-first-local-tv-year",
  "cfb-r1-army-navy-first-year",
  "cfb-r2-heisman-renamed",
  "cfb-r2-flutie-rb-streak",
  "cfb-r3-hornung-record",
  "cfb-r3-ernie-davis-school",
  "cfb-r3-first-live-heisman-winner",
  "cfb-r3-first-heisman-finalists",
  "cfb-final-first-finalists-year",
  "cfb-r3-heisman-trust-born",
  "cfb-r3-heisman-online-only",
  "cfb-final-terry-baker-sport",
  "cfb-final-1984-orange-score",
  "cfb-final-1971-game-century-score",
  "cfb-r3-1992-alabama-opponent",
  "cfb-r3-first-bcs-loser",
  "cfb-r3-2013-fsu-qb",
  "cfb-r3-1996-spurrier-title",
  "cfb-r3-1988-notre-dame",
  "cfb-final-army-navy-travel-cents",
  "cfb-final-first-heisman-original-name",
  "cfb-final-heisman-number-99"
]);

/** These are NEW distinct historical moments; never duplicate an existing ID. */
const LAST_CALL_SEEDS: readonly BarTriviaQuestionSeed[] = [
  {
    "id": "nfl-v2-final-ice-bowl",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Packers quarterback scored the winning sneak in the 1967 Ice Bowl?",
    "choices": [
      "Bart Starr",
      "Don Meredith",
      "Fran Tarkenton",
      "Daryle Lamonica"
    ],
    "answer": "Bart Starr",
    "explanation": "Bart Starr scored from one yard out with seconds remaining to defeat Dallas in the Ice Bowl.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/100/originals/100-greatest/detail.html?slug=plays-8",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-manningham",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Who made the remarkable sideline catch for the Giants late in Super Bowl XLVI?",
    "choices": [
      "Mario Manningham",
      "Hakeem Nicks",
      "Victor Cruz",
      "David Tyree"
    ],
    "answer": "Mario Manningham",
    "explanation": "Mario Manningham caught Eli Manning's deep sideline throw on the Giants' winning drive against New England.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/news/giants-execution-too-perfect-for-patriots-to-defend-09000d5d826be806",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-epic-miami",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Chargers tight end starred despite exhaustion in the 1981 playoff thriller nicknamed the Epic in Miami?",
    "choices": [
      "Kellen Winslow",
      "Antonio Gates",
      "Wes Chandler",
      "Charlie Joiner"
    ],
    "answer": "Kellen Winslow",
    "explanation": "Kellen Winslow caught 13 passes in San Diego's overtime victory over Miami.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/news/the-best-trick-plays-in-nfl-history-0ap2000000338664",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-red-right-88",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Browns quarterback threw the late end-zone interception on the play known as Red Right 88?",
    "choices": [
      "Brian Sipe",
      "Bernie Kosar",
      "Otto Graham",
      "Mike Phipps"
    ],
    "answer": "Brian Sipe",
    "explanation": "Brian Sipe's end-zone pass was intercepted by Oakland in Cleveland's 1980-season playoff loss.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/news/pain-rankings-no-1-the-cleveland-browns-0ap3000000503270",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-jacoby-jones",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Ravens returner took the second-half kickoff of Super Bowl XLVII for a touchdown?",
    "choices": [
      "Jacoby Jones",
      "Torrey Smith",
      "Anquan Boldin",
      "Ed Reed"
    ],
    "answer": "Jacoby Jones",
    "explanation": "Jacoby Jones returned the kickoff 108 yards in Baltimore's win over San Francisco.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/news/jacoby-jones-108-yard-return-td-a-super-bowl-record-0ap1000000135302",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-fitzgerald-sb",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Cardinals receiver scored a go-ahead touchdown late in Super Bowl XLIII before Pittsburgh's winning drive?",
    "choices": [
      "Larry Fitzgerald",
      "Anquan Boldin",
      "Steve Breaston",
      "Early Doucet"
    ],
    "answer": "Larry Fitzgerald",
    "explanation": "Larry Fitzgerald scored on a 64-yard pass before the Steelers answered with Santonio Holmes' catch.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/news/pro-football-hall-of-fame-class-of-2026-revealed-at-nfl-honors",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-tuck-super-bowl-sacks",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Giants defensive lineman sacked Tom Brady twice in their Super Bowl XLII upset?",
    "choices": [
      "Justin Tuck",
      "Osi Umenyiora",
      "Michael Strahan",
      "Mathias Kiwanuka"
    ],
    "answer": "Justin Tuck",
    "explanation": "Justin Tuck recorded two sacks in the Giants' defensive upset of New England.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.giants.com/news/10-best-giants-super-bowl-moments-14868540",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "nfl-v2-final-doug-williams",
    "league": "nfl",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Washington quarterback threw four second-quarter touchdowns in Super Bowl XXII?",
    "choices": [
      "Doug Williams",
      "Joe Theismann",
      "Mark Rypien",
      "Jay Schroeder"
    ],
    "answer": "Doug Williams",
    "explanation": "Doug Williams led Washington's 1987-season championship comeback against Denver.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.nfl.com/news/young-leads-quarterbacks-in-super-bowl-performances-09000d5d81e04e03",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-flutie-hail-mary",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Who caught Doug Flutie's winning 1984 Hail Mary against Miami?",
    "choices": [
      "Gerard Phelan",
      "Brian Brennan",
      "Mark Chmura",
      "Troy Brown"
    ],
    "answer": "Gerard Phelan",
    "explanation": "Gerard Phelan caught Flutie's 48-yard game-winner for Boston College.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.espn.com/college-football/story/_/id/29260553/kordell-stewart-doug-flutie-epic-hail-marys-our-wildest-college-football-finishes",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-kick-six",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Auburn player returned Alabama's missed field goal for the famous 2013 Kick Six?",
    "choices": [
      "Chris Davis",
      "Ricardo Louis",
      "Tre Mason",
      "Nick Marshall"
    ],
    "answer": "Chris Davis",
    "explanation": "Chris Davis returned the missed field goal 109 yards to win the Iron Bowl.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.espn.com/college-football/recap?gameId=401520427",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-band-play",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Who scored the final touchdown of Cal's famous 1982 five-lateral play against Stanford?",
    "choices": [
      "Kevin Moen",
      "Dwight Garner",
      "Richard Rodgers",
      "Joe Kapp"
    ],
    "answer": "Kevin Moen",
    "explanation": "Kevin Moen took the last lateral into the end zone as the Stanford band entered the field.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://calbears.com/sports/2002/4/4/207752459",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-fiesta-johnson",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Boise State running back scored the winning Statue of Liberty two-point conversion against Oklahoma?",
    "choices": [
      "Ian Johnson",
      "Jared Zabransky",
      "Jerard Rabb",
      "Doug Martin"
    ],
    "answer": "Ian Johnson",
    "explanation": "Ian Johnson scored the two-point conversion to beat Oklahoma at the 2007 Fiesta Bowl.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://www.espn.com/blog/ncfnation/post/_/id/106731/boise-state-hopes-vizio-fiesta-bowl-win-is-a-first-step",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-vince-fourth-five",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Who scored the fourth-and-five touchdown that gave Texas the 2005-season BCS title over USC?",
    "choices": [
      "Vince Young",
      "Jamaal Charles",
      "David Thomas",
      "Limas Sweed"
    ],
    "answer": "Vince Young",
    "explanation": "Vince Young scrambled for the decisive touchdown with 19 seconds remaining in the Rose Bowl.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://texaslonghorns.com/news/2017/9/16/football-in-their-words-the-2005-national-championship-game",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-second-26",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Alabama quarterback threw the championship-winning second-and-26 pass in overtime after the 2017 season?",
    "choices": [
      "Tua Tagovailoa",
      "Jalen Hurts",
      "Mac Jones",
      "AJ McCarron"
    ],
    "answer": "Tua Tagovailoa",
    "explanation": "Freshman Tua Tagovailoa hit DeVonta Smith to beat Georgia for the national title.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://rolltide.com/news/2020/7/31/general-crimson-tide-student-athletes-set-for-summer-commencement-ceremonies",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-bama-onside",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Alabama kicker executed the surprise onside kick against Clemson in the 2015-season national championship game?",
    "choices": [
      "Adam Griffith",
      "Will Reichard",
      "Cade Foster",
      "Jeremy Shelley"
    ],
    "answer": "Adam Griffith",
    "explanation": "Adam Griffith's onside kick helped swing Alabama's 2016 title game win over Clemson.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://rolltide.com/news/2016/1/11/Alabama_Wins_CFP_National_Championship_With_45_40_Win_Over_Clemson",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-ringo-pick-six",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Georgia defender returned an interception for the clinching touchdown in the 2021-season title win over Alabama?",
    "choices": [
      "Kelee Ringo",
      "Nakobe Dean",
      "Jordan Davis",
      "Travon Walker"
    ],
    "answer": "Kelee Ringo",
    "explanation": "Kelee Ringo returned Bryce Young's pass for a late pick-six in Georgia's national championship victory.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://georgiadogs.com/news/2022/1/15/football-a-new-standard-of-excellence-has-been-set",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-bush-push",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which USC quarterback scored on the controversial goal-line play remembered as the Bush Push against Notre Dame?",
    "choices": [
      "Matt Leinart",
      "Reggie Bush",
      "Mark Sanchez",
      "Carson Palmer"
    ],
    "answer": "Matt Leinart",
    "explanation": "Matt Leinart scored the winning sneak after Reggie Bush pushed him toward the end zone in 2005.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://usctrojans.com/news/2005/12/7/Bush_And_Leinart_Are_Among_Three_Heisman_Finalists",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-schlesinger",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Nebraska fullback scored twice late against Miami to win the Orange Bowl for the 1994-season title?",
    "choices": [
      "Cory Schlesinger",
      "Lawrence Phillips",
      "Ahman Green",
      "Tommie Frazier"
    ],
    "answer": "Cory Schlesinger",
    "explanation": "Cory Schlesinger scored two fourth-quarter touchdowns in Nebraska's 24–17 win.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://huskers.com/sports/football/roster/player/cory-schlesinger",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-haskins-five",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which Michigan running back scored five rushing touchdowns against Ohio State in 2021?",
    "choices": [
      "Hassan Haskins",
      "Blake Corum",
      "Donovan Edwards",
      "Mike Hart"
    ],
    "answer": "Hassan Haskins",
    "explanation": "Hassan Haskins powered Michigan's breakthrough win over Ohio State with five rushing scores.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://mgoblue.com/sports/football/roster/hassan-haskins/21992",
    "verifiedAt": "2026-10-24"
  },
  {
    "id": "cfb-v2-final-ohio-state-maurice",
    "league": "cfb",
    "round": "last-call",
    "category": "Iconic football history",
    "prompt": "Which freshman running back starred for Ohio State during its undefeated 2002 national championship season?",
    "choices": [
      "Maurice Clarett",
      "Eddie George",
      "Beanie Wells",
      "Trey Sermon"
    ],
    "answer": "Maurice Clarett",
    "explanation": "Maurice Clarett was a pivotal freshman for Ohio State's 2002 championship team.",
    "sourceId": "football-v2-verified-reference",
    "sourceUrl": "https://ohiostatebuckeyes.com/news/2026/9/1/football-clarett-to-serve-as-first-victory-bell-ringer-of-2026-season",
    "verifiedAt": "2026-10-24"
  }
];
export const FOOTBALL_BAR_TRIVIA_V2_LAST_CALL: readonly BarTriviaQuestion[] = LAST_CALL_SEEDS.map(barTriviaQuestion);

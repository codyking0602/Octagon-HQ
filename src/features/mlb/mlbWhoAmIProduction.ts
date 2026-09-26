import type { WhoAmIClue, WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";

export const MLB_WHO_AM_I_PRODUCTION_DATE = "2026-10-06" as const;
export const MLB_WHO_AM_I_PRODUCTION_CHALLENGE_KEY = "mlb-2026-play-04" as const;
export const MLB_WHO_AM_I_PRODUCTION_SCHEDULE_VERSION = "mlb-who-am-i-oct6-v1" as const;
export const MLB_WHO_AM_I_PRODUCTION_SCRIPT_IDS = [
  "mlb-2026-10-06-round-1",
  "mlb-2026-10-06-round-2",
] as const;

const subjects: readonly WhoAmISubject[] = [
  { id: "mlb-ken-griffey-jr", name: "Ken Griffey Jr.", kind: "player", eraBand: "modern" },
  { id: "mlb-david-ortiz", name: "David Ortiz", kind: "player", eraBand: "modern" },
  { id: "mlb-randy-johnson", name: "Randy Johnson", kind: "player", eraBand: "modern" },
  { id: "mlb-derek-jeter", name: "Derek Jeter", kind: "player", eraBand: "modern" },
  { id: "mlb-mariano-rivera", name: "Mariano Rivera", kind: "player", eraBand: "modern" },
  { id: "mlb-pedro-martinez", name: "Pedro Martinez", kind: "player", eraBand: "modern" },
  { id: "mlb-greg-maddux", name: "Greg Maddux", kind: "player", eraBand: "modern" },
  { id: "mlb-cal-ripken-jr", name: "Cal Ripken Jr.", kind: "player", eraBand: "modern" },
  { id: "mlb-tony-gwynn", name: "Tony Gwynn", kind: "player", eraBand: "modern" },
  { id: "mlb-frank-thomas", name: "Frank Thomas", kind: "player", eraBand: "modern" },
  { id: "mlb-chipper-jones", name: "Chipper Jones", kind: "player", eraBand: "modern" },
  { id: "mlb-albert-pujols", name: "Albert Pujols", kind: "player", eraBand: "modern" },
  { id: "mlb-ichiro-suzuki", name: "Ichiro Suzuki", kind: "player", eraBand: "modern" },
  { id: "mlb-miguel-cabrera", name: "Miguel Cabrera", kind: "player", eraBand: "modern" },
  { id: "mlb-clayton-kershaw", name: "Clayton Kershaw", kind: "player", eraBand: "modern" },
  { id: "mlb-justin-verlander", name: "Justin Verlander", kind: "player", eraBand: "modern" },
  { id: "mlb-mike-trout", name: "Mike Trout", kind: "player", eraBand: "modern" },
  { id: "mlb-bryce-harper", name: "Bryce Harper", kind: "player", eraBand: "modern" },
  { id: "mlb-aaron-judge", name: "Aaron Judge", kind: "player", eraBand: "modern" },
  { id: "mlb-shohei-ohtani", name: "Shohei Ohtani", kind: "player", eraBand: "modern" },
  { id: "mlb-manny-ramirez", name: "Manny Ramirez", kind: "player", eraBand: "modern" },
  { id: "mlb-alex-rodriguez", name: "Alex Rodriguez", kind: "player", eraBand: "modern" },
  { id: "mlb-vladimir-guerrero", name: "Vladimir Guerrero", kind: "player", eraBand: "modern" },
  { id: "mlb-roy-halladay", name: "Roy Halladay", kind: "player", eraBand: "modern" },
  { id: "mlb-cc-sabathia", name: "CC Sabathia", kind: "player", eraBand: "modern" },
  { id: "mlb-adrian-beltre", name: "Adrian Beltre", kind: "player", eraBand: "modern" },
  { id: "mlb-joe-mauer", name: "Joe Mauer", kind: "player", eraBand: "modern" },
  { id: "mlb-buster-posey", name: "Buster Posey", kind: "player", eraBand: "modern" },
  { id: "mlb-yadier-molina", name: "Yadier Molina", kind: "player", eraBand: "modern" },
  { id: "mlb-freddie-freeman", name: "Freddie Freeman", kind: "player", eraBand: "modern" },
  { id: "mlb-mookie-betts", name: "Mookie Betts", kind: "player", eraBand: "modern" },
  { id: "mlb-max-scherzer", name: "Max Scherzer", kind: "player", eraBand: "modern" },
  { id: "mlb-andy-pettitte", name: "Andy Pettitte", kind: "player", eraBand: "modern" },
  { id: "mlb-curt-schilling", name: "Curt Schilling", kind: "player", eraBand: "modern" },
  { id: "mlb-sammy-sosa", name: "Sammy Sosa", kind: "player", eraBand: "modern" },
  { id: "mlb-mark-mcgwire", name: "Mark McGwire", kind: "player", eraBand: "modern" },
] as const;

function clue(id: string, text: string, band: WhoAmIClue["band"]): WhoAmIClue {
  return { id, text, band };
}

function subject(id: string) {
  const row = subjects.find((candidate) => candidate.id === id);
  if (!row) throw new Error(`Unknown MLB Who Am I production subject: ${id}`);
  return row;
}

/**
 * Spoiler-protected October 6 production identities.
 * These are intentionally different from both identities used in the owner review.
 */
export const MLB_WHO_AM_I_PRODUCTION_ROUNDS: readonly [WhoAmIRound, WhoAmIRound] = [
  {
    sport: "mlb",
    league: "MLB",
    subjects,
    hiddenSubject: subject("mlb-ken-griffey-jr"),
    clues: [
      clue("mlb-oct6-r1-01", "I was an outfielder whose Major League career lasted 22 seasons.", "broad"),
      clue("mlb-oct6-r1-02", "I reached the majors as a teenager.", "broad"),
      clue("mlb-oct6-r1-03", "I was selected to 13 All-Star Games.", "helpful"),
      clue("mlb-oct6-r1-04", "I won 10 consecutive Gold Glove Awards.", "helpful"),
      clue("mlb-oct6-r1-05", "I was the unanimous American League MVP in 1997.", "strong"),
      clue("mlb-oct6-r1-06", "I led the American League in home runs four times.", "strong"),
      clue("mlb-oct6-r1-07", "I finished my career with 630 home runs.", "strong"),
      clue("mlb-oct6-r1-08", "I was selected first overall in the 1987 MLB Draft.", "strong"),
      clue("mlb-oct6-r1-09", "I became the first player inducted into the Hall of Fame with a Seattle Mariners cap on my plaque.", "giveaway"),
      clue("mlb-oct6-r1-10", "Baseball fans knew me by the nickname “The Kid.”", "giveaway"),
    ],
  },
  {
    sport: "mlb",
    league: "MLB",
    subjects,
    hiddenSubject: subject("mlb-david-ortiz"),
    clues: [
      clue("mlb-oct6-r2-01", "I had a 20-season Major League career as a left-handed hitter.", "broad"),
      clue("mlb-oct6-r2-02", "I spent most of my career as a designated hitter.", "broad"),
      clue("mlb-oct6-r2-03", "I was selected to 10 All-Star Games.", "helpful"),
      clue("mlb-oct6-r2-04", "I finished my career with 541 home runs.", "helpful"),
      clue("mlb-oct6-r2-05", "I won three World Series championships with the same franchise.", "strong"),
      clue("mlb-oct6-r2-06", "I helped Boston erase a 3-0 ALCS deficit in 2004 with walk-off RBIs in Games 4 and 5.", "strong"),
      clue("mlb-oct6-r2-07", "I was the 2013 World Series MVP after batting .688 in the series.", "strong"),
      clue("mlb-oct6-r2-08", "I set the Red Sox single-season home run record with 54 in 2006.", "strong"),
      clue("mlb-oct6-r2-09", "Boston retired my No. 34 less than a year after my final season.", "giveaway"),
      clue("mlb-oct6-r2-10", "My nickname was “Big Papi.”", "giveaway"),
    ],
  },
] as const;

export const MLB_WHO_AM_I_PRODUCTION_SOURCE_NOTES = [
  {
    round: 1,
    authority: "MLB.com",
    url: "https://www.mlb.com/mariners/fans/hall-of-fame/members/griffey",
    verifiedAt: "2026-09-25",
  },
  {
    round: 1,
    authority: "MLB.com",
    url: "https://www.mlb.com/press-release/griffey-jr-piazza-elected-to-hall-of-fame-161282168",
    verifiedAt: "2026-09-25",
  },
  {
    round: 2,
    authority: "MLB.com",
    url: "https://www.mlb.com/press-release/press-release-david-ortiz-elected-to-hall-of-fame-in-first-year-of-eligibility",
    verifiedAt: "2026-09-25",
  },
  {
    round: 2,
    authority: "MLB.com",
    url: "https://www.mlb.com/news/red-sox-retired-numbers-c300556838",
    verifiedAt: "2026-09-25",
  },
  {
    round: 2,
    authority: "MLB.com",
    url: "https://www.mlb.com/awards/2013",
    verifiedAt: "2026-09-25",
  },
] as const;

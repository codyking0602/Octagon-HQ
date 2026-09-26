import type {
  FamilyFeudEntity,
  FamilyFeudEntityKind,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import MlbSportsFeudChallenge from "./MlbSportsFeudChallenge";

const MAIN_POINTS = [10, 8, 7, 5, 4, 4, 3, 3, 2, 2, 2, 2] as const;
const FAST_POINTS = [8, 7, 6, 5, 4, 3, 2, 1, 1, 1] as const;

function entity(
  id: string,
  displayName: string,
  aliases: readonly string[] = [],
  kind: FamilyFeudEntityKind = "person",
): FamilyFeudEntity {
  return { id: `mlb-owner-feud-${id}`, displayName, aliases, kind };
}

function question(
  id: string,
  prompt: string,
  candidateIds: readonly string[],
  answerIds: readonly string[],
  points: readonly number[],
): FamilyFeudQuestion {
  return {
    id: `mlb-owner-feud-${id}`,
    prompt,
    candidateIds: candidateIds.map((candidateId) => `mlb-owner-feud-${candidateId}`),
    answers: answerIds.map((answerId, index) => ({
      entityId: `mlb-owner-feud-${answerId}`,
      points: points[index]!,
    })),
  };
}

const entities: readonly FamilyFeudEntity[] = [
  entity("ortiz", "David Ortiz", ["Big Papi", "Papi"]),
  entity("pujols", "Albert Pujols"),
  entity("jeter", "Derek Jeter"),
  entity("cabrera", "Miguel Cabrera", ["Miggy"]),
  entity("manny", "Manny Ramirez", ["Manny"]),
  entity("judge", "Aaron Judge", ["Judge"]),
  entity("ohtani", "Shohei Ohtani", ["Ohtani"]),
  entity("harper", "Bryce Harper", ["Harper"]),
  entity("trout", "Mike Trout", ["Trout"]),
  entity("ichiro", "Ichiro Suzuki", ["Ichiro"]),
  entity("chipper", "Chipper Jones", ["Chipper"]),
  entity("vlad", "Vladimir Guerrero", ["Vlad", "Vlad Guerrero"]),
  entity("randy", "Randy Johnson", ["Big Unit", "The Big Unit"]),
  entity("pedro", "Pedro Martinez", ["Pedro"]),
  entity("scherzer", "Max Scherzer", ["Scherzer"]),
  entity("verlander", "Justin Verlander", ["Verlander"]),
  entity("kershaw", "Clayton Kershaw", ["Kershaw"]),
  entity("halladay", "Roy Halladay", ["Doc Halladay", "Doc"]),
  entity("sabathia", "CC Sabathia", ["C.C. Sabathia", "CC"]),
  entity("maddux", "Greg Maddux", ["Maddux"]),
  entity("clemens", "Roger Clemens", ["Clemens", "Rocket", "The Rocket"]),
  entity("degrom", "Jacob deGrom", ["deGrom", "Degrom"]),
  entity("cole", "Gerrit Cole", ["Cole"]),
  entity("greinke", "Zack Greinke", ["Greinke"]),
  entity("bonds", "Barry Bonds", ["Bonds"]),
  entity("sosa", "Sammy Sosa", ["Sosa"]),
  entity("mcgwire", "Mark McGwire", ["McGwire", "Big Mac"]),
  entity("stanton", "Giancarlo Stanton", ["Stanton"]),
  entity("griffey", "Ken Griffey Jr.", ["Ken Griffey", "Griffey", "The Kid"]),
  entity("arod", "Alex Rodriguez", ["A-Rod", "A Rod", "ARod"]),
  entity("felix", "Felix Hernandez", ["King Felix", "Felix"]),
  entity("mccutchen", "Andrew McCutchen", ["Cutch", "McCutchen"]),
  entity("alonso", "Pete Alonso", ["Polar Bear", "Alonso"]),
  entity("sale", "Chris Sale", ["Sale"]),
  entity("yankees", "New York Yankees", ["Yankees", "NYY"], "team"),
  entity("dodgers", "Los Angeles Dodgers", ["Dodgers", "LAD"], "team"),
  entity("red-sox", "Boston Red Sox", ["Red Sox", "Boston"], "team"),
  entity("cubs", "Chicago Cubs", ["Cubs"], "team"),
  entity("braves", "Atlanta Braves", ["Braves"], "team"),
  entity("cardinals", "St. Louis Cardinals", ["Cardinals", "Cards", "St Louis Cardinals"], "team"),
  entity("giants", "San Francisco Giants", ["Giants", "SF Giants"], "team"),
  entity("mets", "New York Mets", ["Mets"], "team"),
  entity("phillies", "Philadelphia Phillies", ["Phillies"], "team"),
  entity("astros", "Houston Astros", ["Astros"], "team"),
];

const clutchHitters = [
  "ortiz", "pujols", "jeter", "cabrera", "manny", "judge",
  "ohtani", "harper", "trout", "ichiro", "chipper", "vlad",
] as const;

const mustWinPitchers = [
  "randy", "pedro", "scherzer", "verlander", "kershaw", "halladay",
  "sabathia", "maddux", "clemens", "degrom", "cole", "greinke",
] as const;

const eventHomeRuns = [
  "judge", "ohtani", "ortiz", "pujols", "bonds", "sosa", "mcgwire", "harper", "trout", "stanton",
] as const;

const famousTeams = [
  "yankees", "dodgers", "red-sox", "cubs", "braves", "cardinals", "giants", "mets", "phillies", "astros",
] as const;

const famousNicknames = [
  "ortiz", "arod", "griffey", "randy", "cabrera", "felix", "mccutchen", "alonso", "scherzer", "ohtani",
] as const;

const strikeoutPitchers = [
  "randy", "scherzer", "verlander", "pedro", "clemens", "kershaw", "degrom", "cole", "sale", "sabathia",
] as const;

const recognizableSwings = [
  "griffey", "ichiro", "pujols", "ortiz", "bonds", "manny", "arod", "harper", "judge", "trout",
] as const;

// Every question and answer set in this owner card is burned after review.
// The real Oct. 15 challenge must use a separate pack.
export const MLB_SPORTS_FEUD_OWNER_PACK: FamilyFeudPack = {
  id: "mlb-owner-sports-feud-2026-10-15-v1",
  sport: "mlb",
  entities,
  mainBoards: [
    question(
      "main-clutch-hitter",
      "Name an MLB hitter since 2000 you would trust most with the season on the line.",
      clutchHitters,
      clutchHitters,
      MAIN_POINTS,
    ),
    question(
      "main-must-win-pitcher",
      "Name a pitcher since 2000 you would want starting a must-win game.",
      mustWinPitchers,
      mustWinPitchers,
      MAIN_POINTS,
    ),
  ],
  fastMoney: [
    question(
      "fast-event-home-run",
      "Name an MLB slugger since 2000 whose home runs felt like an event.",
      eventHomeRuns,
      eventHomeRuns,
      FAST_POINTS,
    ),
    question(
      "fast-famous-team",
      "Name an MLB team a casual sports fan would recognize immediately.",
      famousTeams,
      famousTeams,
      FAST_POINTS,
    ),
    question(
      "fast-famous-nickname",
      "Name an MLB player since 2000 with a nickname almost as famous as his real name.",
      famousNicknames,
      famousNicknames,
      FAST_POINTS,
    ),
    question(
      "fast-strikeouts",
      "Name a pitcher since 2000 known for piling up strikeouts.",
      strikeoutPitchers,
      strikeoutPitchers,
      FAST_POINTS,
    ),
    question(
      "fast-recognizable-swing",
      "Name an MLB star since 2000 whose swing or batting stance was instantly recognizable.",
      recognizableSwings,
      recognizableSwings,
      FAST_POINTS,
    ),
  ],
};

const OWNER_DAY = "2026-10-12";
const OWNER_SCHEDULE_VERSION = "mlb-sports-feud-owner-run-v1";
const OWNER_CHALLENGE_KEY = "mlb-owner-sports-feud-review";

export default function MlbSportsFeudOwnerRun() {
  return (
    <MlbSportsFeudChallenge
      mode="owner_review"
      config={{
        pack: MLB_SPORTS_FEUD_OWNER_PACK,
        challengeDate: OWNER_DAY,
        scheduleVersion: OWNER_SCHEDULE_VERSION,
        challengeKey: OWNER_CHALLENGE_KEY,
      }}
    />
  );
}

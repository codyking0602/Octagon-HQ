import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  FamilyFeudEntity,
  FamilyFeudEntityKind,
  FamilyFeudPack,
  FamilyFeudQuestion,
} from "../games/familyFeudEngine";
import OfficialSportsFeudDailyView from "../play/OfficialSportsFeudDailyView";
import {
  advanceFamilyFeudDailyRuntime,
  buildFamilyFeudDailySetup,
} from "../play/familyFeudDailyRuntime";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";

type JsonRecord = Record<string, unknown>;

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

const OWNER_DAY = "2026-10-15";
const OWNER_SCHEDULE_VERSION = "mlb-sports-feud-owner-run-v1";

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

export default function MlbSportsFeudOwnerRun() {
  const navigate = useNavigate();
  const publication = useMemo(
    () => buildFamilyFeudDailySetup(MLB_SPORTS_FEUD_OWNER_PACK, OWNER_DAY, OWNER_SCHEDULE_VERSION),
    [],
  );
  const [publicState, setPublicState] = useState<JsonRecord>(
    () => record(publication.publicSetup.initial_state),
  );
  const [submissionState, setSubmissionState] = useState<JsonRecord>({});
  const [attempt, setAttempt] = useState<TodayChallengeProjection["officialAttempt"]>(null);
  const [revision, setRevision] = useState(0);

  const projection = useMemo<TodayChallengeProjection>(() => ({
    available: true,
    id: "00000000-0000-4000-8000-000000001015",
    centralDay: OWNER_DAY,
    scheduleVersion: OWNER_SCHEDULE_VERSION,
    gameType: "sports_feud",
    setupKey: publication.setupKey,
    contentVersion: publication.contentVersion,
    scoringVersion: publication.scoringVersion,
    fallbackReason: null,
    publicSetup: publication.publicSetup,
    progressRevision: revision,
    publicState,
    revealSetup: attempt ? publication.revealSetup : null,
    officialAttempt: attempt,
    deploymentSha: "mlb-sports-feud-owner-run",
  }), [attempt, publicState, publication, revision]);

  function advance(action: Record<string, unknown>) {
    if (attempt) return;
    const next = advanceFamilyFeudDailyRuntime({
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      submissionState,
    }, action);

    setSubmissionState(next.submissionState);
    setPublicState(next.publicState);
    setRevision((value) => value + 1);

    if (next.complete && next.finalSubmission) {
      const final = next.finalSubmission;
      const nativeScore = Number(final.native_score ?? 0);
      const normalizedScore = Number(final.normalized_score ?? 0);
      setAttempt({
        nativeScore,
        normalizedScore,
        completedAt: new Date().toISOString(),
        publicResult: {
          main_points: Number(final.main_points ?? 0),
          fast_money_points: Number(final.fast_money_points ?? 0),
          fast_money_time_remaining_ms: Number(final.fast_money_time_remaining_ms ?? 0),
        },
      });
    }
  }

  return (
    <OfficialSportsFeudDailyView
      projection={projection}
      busy={false}
      onAdvance={advance}
      onExit={() => navigate("/mlb")}
    />
  );
}

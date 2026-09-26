import { useMemo, useState } from "react";
import type { WhoAmIClue, WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";
import { OfficialWhoAmIDailyView } from "../play/OfficialWhoAmIDailyView";
import type { TodayChallengeProjection } from "../play/todayChallengeRepository";
import {
  OFFICIAL_DAILY_RUNTIME_VERSION,
  OFFICIAL_DAILY_SCORING_VERSION,
  type OfficialDailyRuntimeContext,
} from "../play/todaysChallengeRuntime";
import {
  advanceTwoRoundWhoAmIDailyRuntime,
  buildTwoRoundWhoAmIDailyPublication,
} from "../play/whoAmITwoRoundDailyRuntime";

type JsonRecord = Record<string, unknown>;

const subjects: readonly WhoAmISubject[] = [
  { id: "mlb-randy-johnson", name: "Randy Johnson", kind: "player", eraBand: "modern" },
  { id: "mlb-derek-jeter", name: "Derek Jeter", kind: "player", eraBand: "modern" },
  { id: "mlb-ken-griffey-jr", name: "Ken Griffey Jr.", kind: "player", eraBand: "modern" },
  { id: "mlb-mariano-rivera", name: "Mariano Rivera", kind: "player", eraBand: "modern" },
  { id: "mlb-pedro-martinez", name: "Pedro Martinez", kind: "player", eraBand: "modern" },
  { id: "mlb-greg-maddux", name: "Greg Maddux", kind: "player", eraBand: "modern" },
  { id: "mlb-cal-ripken-jr", name: "Cal Ripken Jr.", kind: "player", eraBand: "modern" },
  { id: "mlb-tony-gwynn", name: "Tony Gwynn", kind: "player", eraBand: "modern" },
  { id: "mlb-frank-thomas", name: "Frank Thomas", kind: "player", eraBand: "modern" },
  { id: "mlb-chipper-jones", name: "Chipper Jones", kind: "player", eraBand: "modern" },
  { id: "mlb-david-ortiz", name: "David Ortiz", kind: "player", eraBand: "modern" },
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
] as const;

function clue(id: string, text: string, band: WhoAmIClue["band"]): WhoAmIClue {
  return { id, text, band };
}

function subject(id: string) {
  const row = subjects.find((candidate) => candidate.id === id);
  if (!row) throw new Error(`Unknown MLB Who Am I owner subject: ${id}`);
  return row;
}

// Disposable owner-review identities. These subjects/clues are burned after review
// and must never be reused for the scheduled October 6 production challenge.
export const MLB_WHO_AM_I_OWNER_ROUNDS: readonly [WhoAmIRound, WhoAmIRound] = [
  {
    sport: "mlb",
    league: "MLB",
    subjects,
    hiddenSubject: subject("mlb-randy-johnson"),
    clues: [
      clue("owner-rj-01", "I was a left-handed starting pitcher who spent more than two decades in the majors.", "broad"),
      clue("owner-rj-02", "I appeared for six MLB franchises during my career.", "broad"),
      clue("owner-rj-03", "I was selected to 10 All-Star Games.", "helpful"),
      clue("owner-rj-04", "I won five Cy Young Awards.", "helpful"),
      clue("owner-rj-05", "I won four straight National League Cy Young Awards from 1999 through 2002.", "strong"),
      clue("owner-rj-06", "I shared World Series MVP honors after helping Arizona win the 2001 championship.", "strong"),
      clue("owner-rj-07", "I threw a perfect game in 2004 at age 40.", "strong"),
      clue("owner-rj-08", "I finished my career with 4,875 strikeouts, second-most in MLB history.", "strong"),
      clue("owner-rj-09", "At 6-foot-10, I was one of the tallest pitchers in major-league history.", "giveaway"),
      clue("owner-rj-10", "My nickname was “The Big Unit.”", "giveaway"),
    ],
  },
  {
    sport: "mlb",
    league: "MLB",
    subjects,
    hiddenSubject: subject("mlb-derek-jeter"),
    clues: [
      clue("owner-dj-01", "I spent my entire 20-season MLB career with one franchise.", "broad"),
      clue("owner-dj-02", "I was a right-handed hitting shortstop in the American League.", "broad"),
      clue("owner-dj-03", "I was selected to 14 All-Star Games.", "helpful"),
      clue("owner-dj-04", "I won five Gold Gloves and five Silver Slugger Awards.", "helpful"),
      clue("owner-dj-05", "I was part of five World Series championship teams.", "strong"),
      clue("owner-dj-06", "I became the 28th player in MLB history to reach 3,000 hits.", "strong"),
      clue("owner-dj-07", "My 3,000th career hit was a home run.", "strong"),
      clue("owner-dj-08", "I was the American League Rookie of the Year in 1996.", "strong"),
      clue("owner-dj-09", "I wore No. 2 for the New York Yankees.", "giveaway"),
      clue("owner-dj-10", "I served as Yankees captain from 2003 through my final season in 2014.", "giveaway"),
    ],
  },
] as const;

const OWNER_DAY = "2026-10-06";
const OWNER_SCHEDULE_VERSION = "mlb-who-am-i-owner-run-v1";

const publication = buildTwoRoundWhoAmIDailyPublication(
  [
    { round: MLB_WHO_AM_I_OWNER_ROUNDS[0], scriptId: "mlb-owner-round-1" },
    { round: MLB_WHO_AM_I_OWNER_ROUNDS[1], scriptId: "mlb-owner-round-2" },
  ],
  OWNER_DAY,
  OWNER_SCHEDULE_VERSION,
  OFFICIAL_DAILY_RUNTIME_VERSION,
  OFFICIAL_DAILY_SCORING_VERSION,
);

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function initialState() {
  return record(publication.publicSetup.initial_state);
}

export default function MlbWhoAmIOwnerRun() {
  const [publicState, setPublicState] = useState<JsonRecord>(() => initialState());
  const [submissionState, setSubmissionState] = useState<JsonRecord>({ rounds: [], final_submission: null });
  const [attempt, setAttempt] = useState<TodayChallengeProjection["officialAttempt"]>(null);
  const [revision, setRevision] = useState(0);

  const projection = useMemo<TodayChallengeProjection>(() => ({
    available: true,
    id: "00000000-0000-4000-8000-000000000406",
    centralDay: OWNER_DAY,
    scheduleVersion: OWNER_SCHEDULE_VERSION,
    gameType: "who_am_i",
    setupKey: publication.setupKey,
    contentVersion: publication.contentVersion,
    scoringVersion: publication.scoringVersion,
    fallbackReason: null,
    publicSetup: publication.publicSetup,
    progressRevision: revision,
    publicState,
    revealSetup: attempt ? publication.revealSetup : null,
    officialAttempt: attempt,
    deploymentSha: "owner-run",
  }), [attempt, publicState, revision]);

  function advance(action: JsonRecord) {
    if (attempt) return;
    const context: OfficialDailyRuntimeContext = {
      gameType: "who_am_i",
      setupKey: publication.setupKey,
      publicSetup: publication.publicSetup,
      revealSetup: publication.revealSetup,
      privateSetupEvidence: publication.privateSetupEvidence,
      privateGradingEvidence: publication.privateGradingEvidence,
      submissionState,
      publicState,
    };
    const next = advanceTwoRoundWhoAmIDailyRuntime(context, action);
    setSubmissionState(next.submissionState);
    setPublicState(next.publicState);
    setRevision((value) => value + 1);

    if (next.complete) {
      const rounds = Array.isArray(next.publicState.completed_rounds)
        ? next.publicState.completed_rounds.filter((row): row is JsonRecord => Boolean(row) && typeof row === "object" && !Array.isArray(row))
        : [];
      const score = Number(next.publicState.score ?? 0);
      setAttempt({
        nativeScore: score,
        normalizedScore: score,
        completedAt: new Date().toISOString(),
        publicResult: { rounds },
      });
    }
  }

  return (
    <OfficialWhoAmIDailyView
      projection={projection}
      busy={false}
      onAdvance={advance}
    />
  );
}

import MlbBlindResumeChallenge from "./MlbBlindResumeChallenge";
import {
  MLB_BLIND_RESUME_PRODUCTION_DATE,
  MLB_BLIND_RESUME_PRODUCTION_ROUNDS,
  MLB_BLIND_RESUME_PRODUCTION_SCHEDULE_VERSION,
} from "./mlbBlindResumeProduction";

export default function MlbBlindResumeProductionChallenge({
  challengeKey,
  season,
}: {
  challengeKey: string;
  season: number;
}) {
  return (
    <MlbBlindResumeChallenge
      mode="production"
      rounds={MLB_BLIND_RESUME_PRODUCTION_ROUNDS}
      challengeDate={MLB_BLIND_RESUME_PRODUCTION_DATE}
      scheduleVersion={MLB_BLIND_RESUME_PRODUCTION_SCHEDULE_VERSION}
      challengeKey={challengeKey}
      season={season}
    />
  );
}

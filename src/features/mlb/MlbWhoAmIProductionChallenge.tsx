import MlbWhoAmIChallenge from "./MlbWhoAmIChallenge";
import {
  MLB_WHO_AM_I_PRODUCTION_DATE,
  MLB_WHO_AM_I_PRODUCTION_ROUNDS,
  MLB_WHO_AM_I_PRODUCTION_SCHEDULE_VERSION,
  MLB_WHO_AM_I_PRODUCTION_SCRIPT_IDS,
} from "./mlbWhoAmIProduction";

export default function MlbWhoAmIProductionChallenge({
  challengeKey,
  season,
}: {
  challengeKey: string;
  season: number;
}) {
  return (
    <MlbWhoAmIChallenge
      mode="production"
      rounds={MLB_WHO_AM_I_PRODUCTION_ROUNDS}
      scriptIds={MLB_WHO_AM_I_PRODUCTION_SCRIPT_IDS}
      challengeDate={MLB_WHO_AM_I_PRODUCTION_DATE}
      scheduleVersion={MLB_WHO_AM_I_PRODUCTION_SCHEDULE_VERSION}
      challengeKey={challengeKey}
      season={season}
    />
  );
}

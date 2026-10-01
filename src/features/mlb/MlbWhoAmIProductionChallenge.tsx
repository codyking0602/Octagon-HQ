import MlbWhoAmIChallenge from "./MlbWhoAmIChallenge";
import type { MlbWhoAmIProductionConfig } from "./mlbWhoAmIProduction";

export default function MlbWhoAmIProductionChallenge({
  config,
  season,
}: {
  config: MlbWhoAmIProductionConfig;
  season: number;
}) {
  return (
    <MlbWhoAmIChallenge
      mode="production"
      rounds={config.rounds}
      scriptIds={config.scriptIds}
      challengeDate={config.challengeDate}
      scheduleVersion={config.scheduleVersion}
      challengeKey={config.challengeKey}
      season={season}
    />
  );
}

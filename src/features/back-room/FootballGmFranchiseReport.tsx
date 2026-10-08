import "../../styles/football-gm-final.css";
import { FootballGmFinalExperience } from "./FootballGmFinalExperience";
import type { FootballGmRosterEntry } from "./footballGmEngine";
import type { FootballGmNegotiationConsequences, FootballGmSeasonResultV2 } from "./footballGmStrategy";

export interface FootballGmReportRun {
  seed: string;
  roster: readonly FootballGmRosterEntry[];
  finalRoster: readonly FootballGmRosterEntry[];
  negotiationConsequences: FootballGmNegotiationConsequences;
  resolvedSeasons?: readonly FootballGmSeasonResultV2[];
}

/** The same approved final result presentation powers solo and multiplayer. */
export function FootballGmFranchiseReport({
  name,
  run,
  opponentName,
  opponentRun,
}: {
  name: string;
  run: FootballGmReportRun;
  opponentName?: string | null;
  opponentRun?: FootballGmReportRun | null;
}) {
  return (
    <FootballGmFinalExperience
      name={name}
      run={run}
      opponentName={opponentName}
      opponentRun={opponentRun}
    />
  );
}

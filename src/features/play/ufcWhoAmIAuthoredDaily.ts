import {
  ufcWhoAmIAuthoredLaunchPool,
} from "../games/ufcWhoAmIAuthoredLaunchPool";
import type { UfcWhoAmIAuthoredScriptId } from "../games/ufcWhoAmIAuthoredScripts";
import type { WhoAmIRound } from "../games/whoAmIEngine";
import {
  buildUfcWhoAmIAuthoredRound,
  ufcWhoAmIAuthoredScriptIds,
  ufcWhoAmIAuthoredSubject,
} from "./ufcWhoAmIAuthoredRound";
import {
  appendWhoAmIAuthoredHistory,
  selectWhoAmIAuthoredIdentity,
  type WhoAmIAuthoredPublicationHistoryEntry,
  type WhoAmIAuthoredSelectionCandidate,
} from "./whoAmIAuthoredDailySelection";

export const UFC_WHO_AM_I_AUTHORED_DAILY_VERSION = "ufc-who-am-i-authored-v1";

export interface UfcWhoAmIAuthoredDailyRound {
  round: WhoAmIRound;
  scriptId: UfcWhoAmIAuthoredScriptId;
}

function selectionCandidates() {
  return ufcWhoAmIAuthoredLaunchPool.map(
    (identity): WhoAmIAuthoredSelectionCandidate<UfcWhoAmIAuthoredScriptId> => ({
      subjectId: identity.subjectId,
      earlyRotation: identity.earlyRotation,
      scriptIds: ufcWhoAmIAuthoredScriptIds(identity),
    }),
  );
}

function ufcHistory(history: readonly WhoAmIAuthoredPublicationHistoryEntry[]) {
  return history.filter((entry) => entry.league === "UFC");
}

export function createUfcWhoAmIAuthoredDailyRounds(
  day: string,
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
): readonly [UfcWhoAmIAuthoredDailyRound, UfcWhoAmIAuthoredDailyRound] {
  const prior = ufcHistory(history);
  const firstSelection = selectWhoAmIAuthoredIdentity(
    selectionCandidates(),
    prior,
    [UFC_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "slot-1"],
  );
  const withFirst = appendWhoAmIAuthoredHistory(prior, {
    day,
    roundIndex: 0,
    subjectId: firstSelection.subjectId,
    league: "UFC",
    scriptId: firstSelection.scriptId,
  });
  const secondSelection = selectWhoAmIAuthoredIdentity(
    selectionCandidates(),
    withFirst,
    [UFC_WHO_AM_I_AUTHORED_DAILY_VERSION, day, "slot-2"],
  );

  if (secondSelection.subjectId === firstSelection.subjectId) {
    throw new Error("UFC Who Am I authored Daily must use two different fighters.");
  }

  return [
    { scriptId: firstSelection.scriptId, round: buildUfcWhoAmIAuthoredRound(firstSelection) },
    { scriptId: secondSelection.scriptId, round: buildUfcWhoAmIAuthoredRound(secondSelection) },
  ] as const;
}

export function extendUfcWhoAmIHistoryForDaily(
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
  day: string,
  rounds: readonly UfcWhoAmIAuthoredDailyRound[],
) {
  let next = [...history];
  rounds.forEach((entry, roundIndex) => {
    next = appendWhoAmIAuthoredHistory(next, {
      day,
      roundIndex,
      subjectId: entry.round.hiddenSubject.id,
      league: "UFC",
      scriptId: entry.scriptId,
    });
  });
  return next;
}

export function ufcWhoAmIAuthoredBindingAudit() {
  return ufcWhoAmIAuthoredLaunchPool.map((identity) => ({
    name: identity.name,
    subjectId: identity.subjectId,
    subjectName: ufcWhoAmIAuthoredSubject(identity).name,
    earlyRotation: identity.earlyRotation,
    scriptIds: ufcWhoAmIAuthoredScriptIds(identity),
  }));
}

import {
  ufcWhoAmIAuthoredLaunchPool,
} from "../games/ufcWhoAmIAuthoredLaunchPool";
import type {
  UfcWhoAmIAuthoredIdentity,
  UfcWhoAmIAuthoredScriptId,
} from "../games/ufcWhoAmIAuthoredScripts";
import { getUfcWhoAmIUniverse } from "../games/ufcWhoAmIAuthority";
import type { WhoAmIRound, WhoAmISubject } from "../games/whoAmIEngine";
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

function subjectFromCandidate(
  candidate: ReturnType<typeof getUfcWhoAmIUniverse>["candidates"][number],
): WhoAmISubject {
  const { id, name, kind, eraBand, rescueGroup } = candidate;
  return {
    id,
    name,
    kind,
    ...(eraBand ? { eraBand } : {}),
    ...(rescueGroup ? { rescueGroup } : {}),
  };
}

function authoredSubject(identity: UfcWhoAmIAuthoredIdentity): WhoAmISubject {
  const existing = getUfcWhoAmIUniverse().candidates.find(
    (candidate) => candidate.id === identity.subjectId,
  );
  if (!existing) {
    throw new Error(`Authored UFC Who Am I subject ${identity.subjectId} is outside the canonical UFC universe.`);
  }
  if (existing.name !== identity.name) {
    throw new Error(
      `Authored UFC Who Am I subject id ${identity.subjectId} belongs to ${existing.name}, not ${identity.name}.`,
    );
  }
  return subjectFromCandidate(existing);
}

function ufcSubjects() {
  return getUfcWhoAmIUniverse().candidates.map(subjectFromCandidate);
}

function scriptIds(identity: UfcWhoAmIAuthoredIdentity) {
  return (["A", "B", "C"] as const).filter((id) => Boolean(identity.scripts[id]));
}

function selectionCandidates() {
  return ufcWhoAmIAuthoredLaunchPool.map(
    (identity): WhoAmIAuthoredSelectionCandidate<UfcWhoAmIAuthoredScriptId> => ({
      subjectId: identity.subjectId,
      earlyRotation: identity.earlyRotation,
      scriptIds: scriptIds(identity),
    }),
  );
}

function authoredRound(
  selection: { subjectId: string; scriptId: UfcWhoAmIAuthoredScriptId },
): UfcWhoAmIAuthoredDailyRound {
  const identity = ufcWhoAmIAuthoredLaunchPool.find(
    (row) => row.subjectId === selection.subjectId,
  );
  if (!identity) {
    throw new Error(`Authored UFC Who Am I subject ${selection.subjectId} is unavailable.`);
  }

  const script = identity.scripts[selection.scriptId];
  if (!script || script.clues.length !== 10) {
    throw new Error(
      `Authored UFC Who Am I script ${selection.scriptId} is unavailable for ${identity.subjectId}.`,
    );
  }

  return {
    scriptId: selection.scriptId,
    round: {
      sport: "ufc",
      league: "UFC",
      subjects: ufcSubjects(),
      hiddenSubject: authoredSubject(identity),
      clues: script.clues.map((clue) => ({
        id: clue.id,
        text: clue.text,
        band: clue.band,
      })),
    },
  };
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
    authoredRound(firstSelection),
    authoredRound(secondSelection),
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
    subjectName: authoredSubject(identity).name,
    earlyRotation: identity.earlyRotation,
    scriptIds: scriptIds(identity),
  }));
}

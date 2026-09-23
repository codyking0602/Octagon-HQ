import { seededLineupRandom } from "./lineupModel";

export const WHO_AM_I_AUTHORED_RECENCY_COOLDOWN = 6;
export const WHO_AM_I_AUTHORED_EARLY_ROTATION_WINDOW = 8;

export interface WhoAmIAuthoredPublicationHistoryEntry {
  day: string;
  roundIndex: number;
  subjectId: string;
  league: "UFC" | "NFL" | "CFB";
  scriptId: string | null;
}

export interface WhoAmIAuthoredSelectionCandidate<TScriptId extends string = string> {
  subjectId: string;
  earlyRotation: "normal" | "deprioritized";
  scriptIds: readonly TScriptId[];
}

export interface WhoAmIAuthoredSelection<TScriptId extends string = string> {
  subjectId: string;
  scriptId: TScriptId;
}

function requireUniqueCandidates<TScriptId extends string>(
  candidates: readonly WhoAmIAuthoredSelectionCandidate<TScriptId>[],
) {
  if (!candidates.length) throw new Error("Who Am I authored selection requires candidates.");
  const ids = candidates.map((candidate) => candidate.subjectId);
  if (new Set(ids).size !== ids.length) throw new Error("Who Am I authored candidate ids must be unique.");
  for (const candidate of candidates) {
    if (!candidate.subjectId || !candidate.scriptIds.length) {
      throw new Error("Who Am I authored candidate metadata is incomplete.");
    }
    if (new Set(candidate.scriptIds).size !== candidate.scriptIds.length) {
      throw new Error(`Who Am I authored scripts repeat for ${candidate.subjectId}.`);
    }
  }
}

function weightedPick<TScriptId extends string>(
  candidates: readonly WhoAmIAuthoredSelectionCandidate<TScriptId>[],
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
  seedParts: readonly (string | number)[],
) {
  const recent = new Set(
    history.slice(-WHO_AM_I_AUTHORED_RECENCY_COOLDOWN).map((entry) => entry.subjectId),
  );
  const eligible = candidates.filter((candidate) => !recent.has(candidate.subjectId));
  if (!eligible.length) {
    throw new Error(
      `Who Am I authored pool needs more than ${WHO_AM_I_AUTHORED_RECENCY_COOLDOWN} cooldown-safe identities.`,
    );
  }

  const authoredAppearances = history.filter((entry) => entry.scriptId).length;
  const weighted = eligible.map((candidate) => {
    let lastIndex = -1;
    for (let index = history.length - 1; index >= 0; index -= 1) {
      if (history[index]!.subjectId === candidate.subjectId) {
        lastIndex = index;
        break;
      }
    }

    const unseen = lastIndex < 0;
    const appearancesSince = unseen ? Number.POSITIVE_INFINITY : history.length - 1 - lastIndex;
    const recencyWeight = unseen
      ? 5
      : 1 + Math.min(
          3,
          Math.max(0, appearancesSince - WHO_AM_I_AUTHORED_RECENCY_COOLDOWN)
            / WHO_AM_I_AUTHORED_RECENCY_COOLDOWN,
        );
    const earlyWeight = candidate.earlyRotation === "deprioritized"
      && authoredAppearances < WHO_AM_I_AUTHORED_EARLY_ROTATION_WINDOW
      ? 0.01
      : 1;
    return { candidate, weight: recencyWeight * earlyWeight };
  });

  const total = weighted.reduce((sum, row) => sum + row.weight, 0);
  const random = seededLineupRandom("who-am-i-authored-selection-v1", ...seedParts);
  let cursor = random() * total;
  for (const row of weighted) {
    cursor -= row.weight;
    if (cursor < 0) return row.candidate;
  }
  return weighted.at(-1)!.candidate;
}

function nextScriptId<TScriptId extends string>(
  candidate: WhoAmIAuthoredSelectionCandidate<TScriptId>,
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
) {
  const prior = [...history].reverse().find((entry) => (
    entry.subjectId === candidate.subjectId
    && entry.scriptId
    && candidate.scriptIds.includes(entry.scriptId as TScriptId)
  ));
  if (!prior?.scriptId) return candidate.scriptIds[0]!;

  const priorIndex = candidate.scriptIds.indexOf(prior.scriptId as TScriptId);
  if (priorIndex < 0) return candidate.scriptIds[0]!;
  return candidate.scriptIds[(priorIndex + 1) % candidate.scriptIds.length]!;
}

export function selectWhoAmIAuthoredIdentity<TScriptId extends string>(
  candidates: readonly WhoAmIAuthoredSelectionCandidate<TScriptId>[],
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
  seedParts: readonly (string | number)[],
): WhoAmIAuthoredSelection<TScriptId> {
  requireUniqueCandidates(candidates);
  const candidate = weightedPick(candidates, history, seedParts);
  return {
    subjectId: candidate.subjectId,
    scriptId: nextScriptId(candidate, history),
  };
}

export function appendWhoAmIAuthoredHistory(
  history: readonly WhoAmIAuthoredPublicationHistoryEntry[],
  entry: WhoAmIAuthoredPublicationHistoryEntry,
) {
  return [...history, entry];
}

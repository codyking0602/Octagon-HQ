import type { ChallengeJson } from "../challenges/challengeModel";
import { getFootballWhoAmIUniverse, getUfcWhoAmIUniverse } from "../games/whoAmIAuthority";
import { resolveFootballWhoAmIAuthoredSharedRound } from "./footballWhoAmIAuthoredRound";
import { resolveUfcWhoAmIAuthoredSharedRound } from "./ufcWhoAmIAuthoredRound";
import {
  WHO_AM_I_CLUE_LIMIT,
  type WhoAmICandidate,
  type WhoAmIClue,
  type WhoAmILeague,
  type WhoAmIRound,
  type WhoAmISport,
  type WhoAmISubject,
} from "../games/whoAmIEngine";

export const WHO_AM_I_CHALLENGE_SETUP_VERSION = "who-am-i-challenge-v1";

export type WhoAmIChallengeOutcome = "correct" | "rescued" | "incorrect";

export interface WhoAmICompletedResult {
  score: number;
  outcome: WhoAmIChallengeOutcome;
  outcomeLabel: string;
  cluesUsed: number;
  naturalMisses: number;
  rescueMisses: number;
  answerId: string;
  answerName: string;
  league: WhoAmILeague;
}

function record(value: ChallengeJson | undefined): { [key: string]: ChallengeJson } | null {
  return value && !Array.isArray(value) && typeof value === "object" ? value : null;
}

function stringValue(value: ChallengeJson | undefined) {
  return typeof value === "string" ? value : null;
}

function numberValue(value: ChallengeJson | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function subjectFromJson(value: ChallengeJson): WhoAmISubject | null {
  const row = record(value);
  const id = stringValue(row?.id);
  const name = stringValue(row?.name);
  const kind = stringValue(row?.kind);
  if (!id || !name || (kind !== "fighter" && kind !== "player" && kind !== "coach")) return null;

  const eraBand = stringValue(row?.eraBand);
  const rescueGroup = stringValue(row?.rescueGroup);
  return {
    id,
    name,
    kind,
    ...(eraBand === "modern" || eraBand === "legacy" ? { eraBand } : {}),
    ...(rescueGroup ? { rescueGroup } : {}),
  };
}

function clueFromJson(value: ChallengeJson): WhoAmIClue | null {
  const row = record(value);
  const id = stringValue(row?.id);
  const text = stringValue(row?.text);
  const band = stringValue(row?.band);
  if (!id || !text || !band || !["broad", "helpful", "strong", "giveaway"].includes(band)) return null;

  const conceptId = stringValue(row?.conceptId);
  const facet = stringValue(row?.facet);
  const revealPriority = numberValue(row?.revealPriority);
  const knowledgeSubjectId = stringValue(row?.knowledgeSubjectId);
  const sourceFactId = stringValue(row?.sourceFactId);
  return {
    id,
    text,
    band: band as WhoAmIClue["band"],
    ...(conceptId ? { conceptId } : {}),
    ...(facet && [
      "role",
      "era",
      "background",
      "style",
      "career-path",
      "accomplishments",
      "relationships",
      "nickname",
      "off-field",
      "production",
      "identity",
    ].includes(facet) ? { facet: facet as WhoAmIClue["facet"] } : {}),
    ...(revealPriority !== null ? { revealPriority } : {}),
    ...(row?.identityKnowledge === true ? { identityKnowledge: true } : {}),
    ...(knowledgeSubjectId ? { knowledgeSubjectId } : {}),
    ...(sourceFactId ? { sourceFactId } : {}),
  };
}

export function whoAmIChallengeGameVersion(sport: WhoAmISport) {
  return `${sport}-who-am-i-v1`;
}

export function whoAmIChallengePath(sport: WhoAmISport) {
  return sport === "football" ? "/football/who-am-i" : "/play/who-am-i";
}

function subjectFromCandidate(candidate: WhoAmICandidate): WhoAmISubject {
  const { id, name, kind, eraBand, rescueGroup } = candidate;
  return {
    id,
    name,
    kind,
    ...(eraBand ? { eraBand } : {}),
    ...(rescueGroup ? { rescueGroup } : {}),
  };
}

function encodeSharedRound(round: WhoAmIRound) {
  const payload = JSON.stringify({
    league: round.league,
    answerId: round.hiddenSubject.id,
    clueIds: round.clues.map((clue) => clue.id),
  });
  return btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeSharedRound(value: string) {
  if (!/^[A-Za-z0-9_-]{8,4096}$/.test(value)) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const parsed = JSON.parse(atob(padded)) as Record<string, unknown>;
    const league = typeof parsed.league === "string" ? parsed.league : "";
    const answerId = typeof parsed.answerId === "string" ? parsed.answerId : "";
    const clueIds = Array.isArray(parsed.clueIds)
      ? parsed.clueIds.filter((id): id is string => typeof id === "string" && Boolean(id))
      : [];
    if (!answerId || clueIds.length !== WHO_AM_I_CLUE_LIMIT || new Set(clueIds).size !== clueIds.length) return null;
    return { league, answerId, clueIds };
  } catch {
    return null;
  }
}

export function whoAmISharedChallengeUrl(round: WhoAmIRound, origin: string) {
  const url = new URL(whoAmIChallengePath(round.sport), origin);
  url.searchParams.set("round", encodeSharedRound(round));
  return url.toString();
}

export function sharedWhoAmIRound(
  searchParams: URLSearchParams,
  expectedSport: WhoAmISport,
): WhoAmIRound | null {
  const shared = decodeSharedRound(searchParams.get("round")?.trim() ?? "");
  if (!shared) return null;

  if (expectedSport === "football" && (shared.league === "NFL" || shared.league === "CFB")) {
    const authoredRound = resolveFootballWhoAmIAuthoredSharedRound(
      shared.league,
      shared.answerId,
      shared.clueIds,
    );
    if (authoredRound) return authoredRound;
  }

  if (expectedSport === "ufc" && shared.league === "UFC") {
    const authoredRound = resolveUfcWhoAmIAuthoredSharedRound(shared.answerId, shared.clueIds);
    if (authoredRound) return authoredRound;
  }

  if (expectedSport === "ufc" && shared.league === "UFC") {
    const authoredRound = resolveUfcWhoAmIAuthoredSharedRound(shared.answerId, shared.clueIds);
    if (authoredRound) return authoredRound;
  }

  const universe = expectedSport === "ufc"
    ? shared.league === "UFC" ? getUfcWhoAmIUniverse() : null
    : shared.league === "NFL" || shared.league === "CFB" ? getFootballWhoAmIUniverse(shared.league) : null;
  if (!universe) return null;

  const candidate = universe.candidates.find((entry) => entry.id === shared.answerId);
  if (!candidate) return null;

  const cluesById = new Map(candidate.clues.map((clue) => [clue.id, clue]));
  const clues = shared.clueIds.map((id) => cluesById.get(id) ?? null);
  if (clues.some((clue) => !clue)) return null;

  return {
    sport: expectedSport,
    league: universe.league as WhoAmILeague,
    subjects: universe.candidates.map(subjectFromCandidate),
    hiddenSubject: subjectFromCandidate(candidate),
    clues: clues as WhoAmIClue[],
  };
}

export function whoAmIChallengeSetup(round: WhoAmIRound): ChallengeJson {
  return JSON.parse(JSON.stringify({
    version: WHO_AM_I_CHALLENGE_SETUP_VERSION,
    round,
  })) as ChallengeJson;
}

export function storedWhoAmIChallengeRound(
  value: ChallengeJson | undefined,
  expectedSport: WhoAmISport,
): WhoAmIRound | null {
  const setup = record(value);
  if (setup?.version !== WHO_AM_I_CHALLENGE_SETUP_VERSION) return null;

  const storedRound = record(setup.round);
  const sport = stringValue(storedRound?.sport);
  const league = stringValue(storedRound?.league);
  const subjectRows = Array.isArray(storedRound?.subjects) ? storedRound.subjects : [];
  const clueRows = Array.isArray(storedRound?.clues) ? storedRound.clues : [];
  const hiddenRow = storedRound?.hiddenSubject;

  if (sport !== expectedSport) return null;
  if (
    (expectedSport === "ufc" && league !== "UFC")
    || (expectedSport === "football" && league !== "NFL" && league !== "CFB")
  ) return null;
  if (subjectRows.length < 5 || clueRows.length !== WHO_AM_I_CLUE_LIMIT || !hiddenRow) return null;

  const subjects = subjectRows.map(subjectFromJson);
  const clues = clueRows.map(clueFromJson);
  const hiddenSubject = subjectFromJson(hiddenRow);
  if (subjects.some((subject) => !subject) || clues.some((clue) => !clue) || !hiddenSubject) return null;

  const resolvedSubjects = subjects as WhoAmISubject[];
  const resolvedClues = clues as WhoAmIClue[];
  if (!resolvedSubjects.some((subject) => subject.id === hiddenSubject.id)) return null;
  if (new Set(resolvedSubjects.map((subject) => subject.id)).size !== resolvedSubjects.length) return null;
  if (new Set(resolvedClues.map((clue) => clue.id)).size !== resolvedClues.length) return null;

  return {
    sport: expectedSport,
    league: league as WhoAmILeague,
    subjects: resolvedSubjects,
    hiddenSubject,
    clues: resolvedClues,
  };
}

export function whoAmIChallengeResultJson(result: WhoAmICompletedResult): ChallengeJson {
  return JSON.parse(JSON.stringify(result)) as ChallengeJson;
}

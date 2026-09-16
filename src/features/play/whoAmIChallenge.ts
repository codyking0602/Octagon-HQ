import type { ChallengeJson } from "../challenges/challengeModel";
import {
  WHO_AM_I_CLUE_LIMIT,
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

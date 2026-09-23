export type FamilyFeudSport = "ufc" | "football";
export type FamilyFeudEntityKind = "person" | "team" | "school" | "other";

export interface FamilyFeudEntity {
  id: string;
  displayName: string;
  kind: FamilyFeudEntityKind;
  aliases?: readonly string[];
}

export interface FamilyFeudRankedAnswer {
  entityId: string;
  points: number;
}

export interface FamilyFeudQuestion {
  id: string;
  prompt: string;
  candidateIds: readonly string[];
  answers: readonly FamilyFeudRankedAnswer[];
  alsoAcceptedEntityIds?: readonly string[];
}

export interface FamilyFeudPack {
  id: string;
  sport: FamilyFeudSport;
  entities: readonly FamilyFeudEntity[];
  mainBoards: readonly FamilyFeudQuestion[];
  fastMoney: readonly FamilyFeudQuestion[];
}

export const FAMILY_FEUD_MAIN_BOARD_COUNT = 2;
export const FAMILY_FEUD_BOARD_ANSWER_COUNT = 4;
export const FAMILY_FEUD_STRIKES_PER_BOARD = 3;
export const FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT = 5;
export const FAMILY_FEUD_FAST_MONEY_TIME_MS = 50_000;
export const FAMILY_FEUD_MAIN_BOARD_MAX = 30;
export const FAMILY_FEUD_MAIN_RAW_MAX = 60;
export const FAMILY_FEUD_FAST_MONEY_QUESTION_MAX = 8;
export const FAMILY_FEUD_FAST_MONEY_RAW_MAX = 40;
export const FAMILY_FEUD_RAW_MAX = 100;

export type FamilyFeudPhase = "main" | "fast-money" | "complete";

export interface FamilyFeudMainBoardState {
  revealedEntityIds: string[];
  submittedEntityIds: string[];
  submittedUnrecognized: string[];
  strikes: number;
}

export interface FamilyFeudFastMoneyResult {
  questionId: string;
  submittedText: string;
  entityId: string | null;
  points: number;
  matchKind: FamilyFeudMatchKind | "unrecognized";
}

export interface FamilyFeudState {
  phase: FamilyFeudPhase;
  mainBoardIndex: number;
  mainBoards: FamilyFeudMainBoardState[];
  fastMoneyIndex: number;
  fastMoneyResults: FamilyFeudFastMoneyResult[];
  fastMoneyTimeRemainingMs: number;
}

export type FamilyFeudMatchKind = "exact" | "alias" | "surname" | "typo";

export type FamilyFeudMatchResult =
  | { status: "matched"; entityId: string; kind: FamilyFeudMatchKind }
  | { status: "ambiguous"; entityIds: string[] }
  | { status: "unrecognized" }
  | { status: "empty" };

export type FamilyFeudOutcome =
  | {
      type: "board-correct";
      boardIndex: number;
      entityId: string;
      displayName: string;
      slotIndex: number;
      points: number;
    }
  | { type: "board-strike"; boardIndex: number; strikes: number }
  | {
      type: "board-also-accepted";
      boardIndex: number;
      entityId: string;
      displayName: string;
    }
  | { type: "ambiguous"; boardIndex: number | null }
  | { type: "already-guessed"; boardIndex: number; entityId: string | null }
  | {
      type: "fast-money-answer";
      questionIndex: number;
      entityId: string | null;
      points: number;
    }
  | { type: "fast-money-timeout" };

export interface FamilyFeudTransition {
  state: FamilyFeudState;
  outcome: FamilyFeudOutcome;
}

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) throw new Error(label + " is required.");
}

function assertUnique(values: readonly string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(label + " must be unique.");
}

function assertDescendingPoints(answers: readonly FamilyFeudRankedAnswer[], label: string) {
  for (let index = 1; index < answers.length; index += 1) {
    if (answers[index]!.points > answers[index - 1]!.points) {
      throw new Error(label + " must be ordered from highest to lowest points.");
    }
  }
}

export function assertFamilyFeudPack(pack: FamilyFeudPack) {
  assertNonEmpty(pack.id, "Family Feud pack id");
  if (pack.mainBoards.length !== FAMILY_FEUD_MAIN_BOARD_COUNT) {
    throw new Error("Family Feud requires exactly two main boards.");
  }
  if (pack.fastMoney.length !== FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT) {
    throw new Error("Family Feud requires exactly five Fast Money questions.");
  }

  const entityIds = pack.entities.map((entity) => entity.id);
  assertUnique(entityIds, "Family Feud entity ids");
  const entityIdSet = new Set(entityIds);
  for (const entity of pack.entities) {
    assertNonEmpty(entity.id, "Family Feud entity id");
    assertNonEmpty(entity.displayName, "Family Feud entity display name");
  }

  const allQuestions = [...pack.mainBoards, ...pack.fastMoney];
  assertUnique(allQuestions.map((question) => question.id), "Family Feud question ids");

  allQuestions.forEach((question, questionIndex) => {
    assertNonEmpty(question.id, "Family Feud question id");
    assertNonEmpty(question.prompt, "Family Feud question prompt");
    if (question.answers.length < FAMILY_FEUD_BOARD_ANSWER_COUNT) {
      throw new Error("Family Feud questions need at least four accepted answers.");
    }
    if (question.candidateIds.length < question.answers.length) {
      throw new Error("Family Feud candidate universes must contain every accepted answer.");
    }

    assertUnique(question.candidateIds, "Family Feud candidate ids");
    assertUnique(question.answers.map((answer) => answer.entityId), "Family Feud answer ids");
    assertDescendingPoints(question.answers, "Family Feud answer points");
    const alsoAcceptedEntityIds = question.alsoAcceptedEntityIds ?? [];
    assertUnique(alsoAcceptedEntityIds, "Family Feud also-accepted ids");
    const answerIdSet = new Set(question.answers.map((answer) => answer.entityId));

    for (const candidateId of question.candidateIds) {
      if (!entityIdSet.has(candidateId)) {
        throw new Error("Family Feud candidate " + candidateId + " is missing from the entity registry.");
      }
    }
    for (const answer of question.answers) {
      if (!question.candidateIds.includes(answer.entityId)) {
        throw new Error("Family Feud answer " + answer.entityId + " is outside its candidate universe.");
      }
      if (!Number.isInteger(answer.points) || answer.points <= 0) {
        throw new Error("Family Feud answer points must be positive integers.");
      }
    }
    for (const entityId of alsoAcceptedEntityIds) {
      if (!question.candidateIds.includes(entityId)) {
        throw new Error("Family Feud also-accepted answer " + entityId + " is outside its candidate universe.");
      }
      if (answerIdSet.has(entityId)) {
        throw new Error("Family Feud also-accepted answers cannot duplicate live board answers.");
      }
    }

    if (questionIndex < FAMILY_FEUD_MAIN_BOARD_COUNT) {
      const bestFour = question.answers
        .slice(0, FAMILY_FEUD_BOARD_ANSWER_COUNT)
        .reduce((sum, answer) => sum + answer.points, 0);
      if (bestFour !== FAMILY_FEUD_MAIN_BOARD_MAX) {
        throw new Error("The four highest-value main-board answers must total 30 HQ points.");
      }
    } else if (question.answers[0]!.points !== FAMILY_FEUD_FAST_MONEY_QUESTION_MAX) {
      throw new Error("Each Fast Money prompt must have a top answer worth 8 HQ points.");
    }
  });
}

export function normalizeFamilyFeudInput(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function personSurname(displayName: string) {
  const tokens = normalizeFamilyFeudInput(displayName).split(" ").filter(Boolean);
  while (tokens.length > 1 && ["jr", "sr", "ii", "iii", "iv", "v"].includes(tokens[tokens.length - 1]!)) {
    tokens.pop();
  }
  return tokens.at(-1) ?? "";
}

function editDistance(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let prior = Array.from({ length: right.length + 1 }, (_value, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = prior[rightIndex - 1]! + Number(left[leftIndex - 1] !== right[rightIndex - 1]);
      current[rightIndex] = Math.min(
        current[rightIndex - 1]! + 1,
        prior[rightIndex]! + 1,
        substitution,
      );
    }
    prior = current;
  }
  return prior[right.length]!;
}

function typoAllowance(value: string) {
  if (value.length < 5) return 0;
  if (value.length < 9) return 1;
  return 2;
}

interface MatchTerm {
  entityId: string;
  term: string;
  kind: "exact" | "alias" | "surname";
}

function questionEntities(pack: FamilyFeudPack, question: FamilyFeudQuestion) {
  const byId = new Map(pack.entities.map((entity) => [entity.id, entity]));
  return question.candidateIds.map((id) => {
    const entity = byId.get(id);
    if (!entity) throw new Error("Family Feud entity " + id + " is unavailable.");
    return entity;
  });
}

function matchTerms(pack: FamilyFeudPack, question: FamilyFeudQuestion) {
  const terms: MatchTerm[] = [];
  for (const entity of questionEntities(pack, question)) {
    terms.push({
      entityId: entity.id,
      term: normalizeFamilyFeudInput(entity.displayName),
      kind: "exact",
    });
    for (const alias of entity.aliases ?? []) {
      const term = normalizeFamilyFeudInput(alias);
      if (term) terms.push({ entityId: entity.id, term, kind: "alias" });
    }
    if (entity.kind === "person") {
      const surname = personSurname(entity.displayName);
      if (surname) terms.push({ entityId: entity.id, term: surname, kind: "surname" });
    }
  }
  return terms;
}

export function matchFamilyFeudAnswer(
  pack: FamilyFeudPack,
  question: FamilyFeudQuestion,
  input: string,
): FamilyFeudMatchResult {
  const normalized = normalizeFamilyFeudInput(input);
  if (!normalized) return { status: "empty" };

  const terms = matchTerms(pack, question);
  const exactMatches = terms.filter((row) => row.term === normalized);
  if (exactMatches.length) {
    const ids = [...new Set(exactMatches.map((row) => row.entityId))];
    if (ids.length > 1) return { status: "ambiguous", entityIds: ids };
    const matchingTerms = exactMatches.filter((row) => row.entityId === ids[0]);
    const kind = matchingTerms.some((row) => row.kind === "exact")
      ? "exact"
      : matchingTerms.some((row) => row.kind === "alias")
        ? "alias"
        : "surname";
    return { status: "matched", entityId: ids[0]!, kind };
  }

  const allowance = typoAllowance(normalized);
  if (allowance === 0) return { status: "unrecognized" };

  const byEntity = new Map<string, number>();
  for (const row of terms) {
    if (row.term.length < 5) continue;
    const distance = editDistance(normalized, row.term);
    if (distance > allowance) continue;
    const previous = byEntity.get(row.entityId);
    if (previous == null || distance < previous) byEntity.set(row.entityId, distance);
  }
  if (!byEntity.size) return { status: "unrecognized" };

  const ranked = [...byEntity.entries()].sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]));
  const bestDistance = ranked[0]![1];
  const bestIds = ranked.filter((row) => row[1] === bestDistance).map((row) => row[0]);
  if (bestIds.length > 1) return { status: "ambiguous", entityIds: bestIds };

  const secondDistance = ranked[1]?.[1];
  if (secondDistance != null && secondDistance - bestDistance < 2) {
    return {
      status: "ambiguous",
      entityIds: ranked
        .filter((row) => row[1] <= bestDistance + 1)
        .map((row) => row[0]),
    };
  }

  return { status: "matched", entityId: bestIds[0]!, kind: "typo" };
}

export function createFamilyFeudState(): FamilyFeudState {
  return {
    phase: "main",
    mainBoardIndex: 0,
    mainBoards: Array.from({ length: FAMILY_FEUD_MAIN_BOARD_COUNT }, () => ({
      revealedEntityIds: [],
      submittedEntityIds: [],
      submittedUnrecognized: [],
      strikes: 0,
    })),
    fastMoneyIndex: 0,
    fastMoneyResults: [],
    fastMoneyTimeRemainingMs: FAMILY_FEUD_FAST_MONEY_TIME_MS,
  };
}

function cloneState(state: FamilyFeudState): FamilyFeudState {
  return {
    ...state,
    mainBoards: state.mainBoards.map((board) => ({
      revealedEntityIds: [...board.revealedEntityIds],
      submittedEntityIds: [...board.submittedEntityIds],
      submittedUnrecognized: [...board.submittedUnrecognized],
      strikes: board.strikes,
    })),
    fastMoneyResults: state.fastMoneyResults.map((result) => ({ ...result })),
  };
}

function boardIsComplete(board: FamilyFeudMainBoardState) {
  return board.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
    || board.strikes >= FAMILY_FEUD_STRIKES_PER_BOARD;
}

function advanceMainPhase(state: FamilyFeudState) {
  const board = state.mainBoards[state.mainBoardIndex]!;
  if (!boardIsComplete(board)) return;
  if (state.mainBoardIndex + 1 < FAMILY_FEUD_MAIN_BOARD_COUNT) {
    state.mainBoardIndex += 1;
  } else {
    state.phase = "fast-money";
    state.fastMoneyIndex = 0;
    state.fastMoneyTimeRemainingMs = FAMILY_FEUD_FAST_MONEY_TIME_MS;
  }
}

function entityDisplayName(pack: FamilyFeudPack, entityId: string) {
  return pack.entities.find((entity) => entity.id === entityId)?.displayName ?? entityId;
}

export function familyFeudMainBoardScore(
  pack: FamilyFeudPack,
  state: FamilyFeudState,
  boardIndex: number,
) {
  const question = pack.mainBoards[boardIndex];
  const board = state.mainBoards[boardIndex];
  if (!question || !board) return 0;
  const revealed = new Set(board.revealedEntityIds);
  return question.answers.reduce(
    (sum, answer) => sum + (revealed.has(answer.entityId) ? answer.points : 0),
    0,
  );
}

export function familyFeudMainRawScore(pack: FamilyFeudPack, state: FamilyFeudState) {
  return pack.mainBoards.reduce(
    (total, _question, index) => total + familyFeudMainBoardScore(pack, state, index),
    0,
  );
}

export function familyFeudFastMoneyRawScore(state: FamilyFeudState) {
  return state.fastMoneyResults.reduce((total, result) => total + result.points, 0);
}

export function familyFeudRawScore(pack: FamilyFeudPack, state: FamilyFeudState) {
  return familyFeudMainRawScore(pack, state) + familyFeudFastMoneyRawScore(state);
}

export function familyFeudHqScore(rawScore: number) {
  return Math.round(Math.max(0, Math.min(FAMILY_FEUD_RAW_MAX, rawScore)));
}

export function familyFeudScore(pack: FamilyFeudPack, state: FamilyFeudState) {
  const main = familyFeudMainRawScore(pack, state);
  const fastMoney = familyFeudFastMoneyRawScore(state);
  const raw = main + fastMoney;
  return {
    main,
    fastMoney,
    raw,
    hq: familyFeudHqScore(raw),
  };
}

export function submitFamilyFeudMainAnswer(
  pack: FamilyFeudPack,
  current: FamilyFeudState,
  input: string,
): FamilyFeudTransition {
  assertFamilyFeudPack(pack);
  if (current.phase !== "main") throw new Error("Family Feud is not on a main board.");

  const state = cloneState(current);
  const boardIndex = state.mainBoardIndex;
  const question = pack.mainBoards[boardIndex]!;
  const board = state.mainBoards[boardIndex]!;
  const match = matchFamilyFeudAnswer(pack, question, input);

  if (match.status === "ambiguous" || match.status === "empty") {
    return { state, outcome: { type: "ambiguous", boardIndex } };
  }

  if (match.status === "matched" && board.submittedEntityIds.includes(match.entityId)) {
    return {
      state,
      outcome: { type: "already-guessed", boardIndex, entityId: match.entityId },
    };
  }
  if (match.status === "unrecognized") {
    const normalized = normalizeFamilyFeudInput(input);
    if (board.submittedUnrecognized.includes(normalized)) {
      return {
        state,
        outcome: { type: "already-guessed", boardIndex, entityId: null },
      };
    }
    board.submittedUnrecognized.push(normalized);
  }
  if (match.status === "matched") board.submittedEntityIds.push(match.entityId);

  const answerIndex = match.status === "matched"
    ? question.answers.findIndex((answer) => answer.entityId === match.entityId)
    : -1;

  if (answerIndex >= 0 && match.status === "matched") {
    const answer = question.answers[answerIndex]!;
    const displaySlotIndex = board.revealedEntityIds.length;
    board.revealedEntityIds.push(answer.entityId);
    const outcome: FamilyFeudOutcome = {
      type: "board-correct",
      boardIndex,
      entityId: answer.entityId,
      displayName: entityDisplayName(pack, answer.entityId),
      slotIndex: displaySlotIndex,
      points: answer.points,
    };
    advanceMainPhase(state);
    return { state, outcome };
  }

  if (
    match.status === "matched"
    && (question.alsoAcceptedEntityIds ?? []).includes(match.entityId)
  ) {
    return {
      state,
      outcome: {
        type: "board-also-accepted",
        boardIndex,
        entityId: match.entityId,
        displayName: entityDisplayName(pack, match.entityId),
      },
    };
  }

  board.strikes = Math.min(FAMILY_FEUD_STRIKES_PER_BOARD, board.strikes + 1);
  const strikes = board.strikes;
  advanceMainPhase(state);
  return { state, outcome: { type: "board-strike", boardIndex, strikes } };
}

function clampFastMoneyTime(state: FamilyFeudState, requestedTimeRemainingMs?: number) {
  if (requestedTimeRemainingMs == null) return state.fastMoneyTimeRemainingMs;
  if (!Number.isFinite(requestedTimeRemainingMs)) throw new Error("Fast Money time remaining must be finite.");
  return Math.max(
    0,
    Math.min(
      state.fastMoneyTimeRemainingMs,
      FAMILY_FEUD_FAST_MONEY_TIME_MS,
      Math.floor(requestedTimeRemainingMs),
    ),
  );
}

function settleFastMoneyIfComplete(state: FamilyFeudState) {
  if (
    state.fastMoneyIndex >= FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT
    || state.fastMoneyTimeRemainingMs <= 0
  ) {
    state.phase = "complete";
  }
}

export function submitFamilyFeudFastMoneyAnswer(
  pack: FamilyFeudPack,
  current: FamilyFeudState,
  input: string,
  requestedTimeRemainingMs?: number,
): FamilyFeudTransition {
  assertFamilyFeudPack(pack);
  if (current.phase !== "fast-money") throw new Error("Family Feud is not in Fast Money.");

  const state = cloneState(current);
  state.fastMoneyTimeRemainingMs = clampFastMoneyTime(state, requestedTimeRemainingMs);
  if (state.fastMoneyTimeRemainingMs <= 0) {
    state.phase = "complete";
    return { state, outcome: { type: "fast-money-timeout" } };
  }

  const questionIndex = state.fastMoneyIndex;
  const question = pack.fastMoney[questionIndex]!;
  const match = matchFamilyFeudAnswer(pack, question, input);

  if (match.status === "ambiguous" || match.status === "empty") {
    return { state, outcome: { type: "ambiguous", boardIndex: null } };
  }

  let entityId: string | null = null;
  let points = 0;
  let matchKind: FamilyFeudFastMoneyResult["matchKind"] = "unrecognized";
  if (match.status === "matched") {
    entityId = match.entityId;
    matchKind = match.kind;
    points = question.answers.find((answer) => answer.entityId === match.entityId)?.points ?? 0;
  }

  state.fastMoneyResults.push({
    questionId: question.id,
    submittedText: input.trim(),
    entityId,
    points,
    matchKind,
  });
  state.fastMoneyIndex += 1;
  settleFastMoneyIfComplete(state);

  return {
    state,
    outcome: {
      type: "fast-money-answer",
      questionIndex,
      entityId,
      points,
    },
  };
}

export function timeoutFamilyFeudFastMoney(
  current: FamilyFeudState,
): FamilyFeudTransition {
  if (current.phase !== "fast-money") throw new Error("Family Feud is not in Fast Money.");
  const state = cloneState(current);
  state.fastMoneyTimeRemainingMs = 0;
  state.phase = "complete";
  return { state, outcome: { type: "fast-money-timeout" } };
}

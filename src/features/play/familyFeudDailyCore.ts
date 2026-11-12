import {
  FAMILY_FEUD_BOARD_ANSWER_COUNT,
  FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
  FAMILY_FEUD_FAST_MONEY_RAW_MAX,
  FAMILY_FEUD_FAST_MONEY_TIME_MS,
  FAMILY_FEUD_MAIN_ALSO_ACCEPTED_POINTS,
  FAMILY_FEUD_MAIN_BOARD_MAX,
  FAMILY_FEUD_MAIN_RAW_MAX,
  FAMILY_FEUD_RAW_MAX,
  FAMILY_FEUD_STRIKES_PER_BOARD,
  assertFamilyFeudPack,
  normalizeFamilyFeudInput,
  createFamilyFeudState,
  familyFeudScore,
  submitFamilyFeudFastMoneyAnswer,
  submitFamilyFeudMainAnswer,
  timeoutFamilyFeudFastMoney,
  type FamilyFeudOutcome,
  type FamilyFeudPack,
  type FamilyFeudRankedAnswer,
  type FamilyFeudState,
} from "../games/familyFeudEngine";
import { standardSportsFeudAliases } from "./sportsFeudAuthoredHelpers";


export const FAMILY_FEUD_DAILY_CONTENT_VERSION = "family-feud-daily-v2" as const;
export const FAMILY_FEUD_DAILY_SCORING_VERSION = "family-feud-score-v2" as const;

export interface FamilyFeudDailyPublication {
  setupKey: string;
  contentVersion: typeof FAMILY_FEUD_DAILY_CONTENT_VERSION;
  scoringVersion: typeof FAMILY_FEUD_DAILY_SCORING_VERSION;
  publicSetup: Record<string, unknown>;
  revealSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  privateGradingEvidence: Record<string, unknown>;
}

export interface FamilyFeudDailyRuntimeContext {
  setupKey: string;
  publicSetup: Record<string, unknown>;
  privateSetupEvidence: Record<string, unknown>;
  submissionState: Record<string, unknown>;
}

export interface FamilyFeudDailyAdvanceResult {
  submissionState: Record<string, unknown>;
  publicState: Record<string, unknown>;
  complete: boolean;
  finalSubmission: Record<string, unknown> | null;
}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown, label: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(label + " must be an object.");
  }
  return value as JsonRecord;
}

function entityPresentation(pack: FamilyFeudPack, entityId: string) {
  const entity = pack.entities.find((row) => row.id === entityId);
  if (!entity) throw new Error("Family Feud entity " + entityId + " is unavailable.");
  return {
    id: entity.id,
    display_name: entity.displayName,
  };
}

function boardSettled(state: FamilyFeudState, boardIndex: number) {
  const board = state.mainBoards[boardIndex]!;
  return board.revealedEntityIds.length >= FAMILY_FEUD_BOARD_ANSWER_COUNT
    || board.strikes >= FAMILY_FEUD_STRIKES_PER_BOARD;
}

function answerById(
  pack: FamilyFeudPack,
  questionIndex: number,
  entityId: string,
): FamilyFeudRankedAnswer {
  const question = pack.mainBoards[questionIndex]!;
  const answer = question.answers.find((row) => row.entityId === entityId);
  if (answer) return answer;
  if ((question.alsoAcceptedEntityIds ?? []).includes(entityId)) {
    return { entityId, points: FAMILY_FEUD_MAIN_ALSO_ACCEPTED_POINTS };
  }
  throw new Error("Family Feud revealed answer is outside its board.");
}

function mainBoardPublicState(
  pack: FamilyFeudPack,
  state: FamilyFeudState,
  boardIndex: number,
) {
  const question = pack.mainBoards[boardIndex]!;
  const board = state.mainBoards[boardIndex]!;
  const foundIds = new Set(board.revealedEntityIds);
  const settled = boardSettled(state, boardIndex);
  const foundAnswers = board.revealedEntityIds.map((entityId) => answerById(pack, boardIndex, entityId));
  const displayAnswers = foundAnswers;

  return {
    id: question.id,
    prompt: question.prompt,
    strikes: board.strikes,
    strike_limit: FAMILY_FEUD_STRIKES_PER_BOARD,
    required_answers: FAMILY_FEUD_BOARD_ANSWER_COUNT,
    max_points: FAMILY_FEUD_MAIN_BOARD_MAX,
    settled,
    // Past runs retain only normalized misses; new runs preserve exact guess text and award.
    recorded_guesses: settled
      ? (board.attempts?.length
        ? board.attempts.map((attempt) => ({
            submitted_answer: attempt.submittedText,
            matched_answer: attempt.entityId ? entityPresentation(pack, attempt.entityId).display_name : null,
            points: attempt.points,
            accepted: attempt.status === "accepted",
          }))
        : board.submittedUnrecognized.map((text) => ({
            submitted_answer: text,
            matched_answer: null,
            points: 0,
            accepted: false,
          })))
      : [],
    answer_reveal: settled
      ? question.answers.map((answer) => ({
          entity: entityPresentation(pack, answer.entityId),
          points: answer.points,
          found: foundIds.has(answer.entityId),
        }))
      : null,
    slots: Array.from({ length: FAMILY_FEUD_BOARD_ANSWER_COUNT }, (_value, slotIndex) => {
      const answer = displayAnswers[slotIndex] ?? null;
      const found = Boolean(answer && foundIds.has(answer.entityId));
      return {
        slot_index: slotIndex,
        points: answer?.points ?? null,
        revealed: Boolean(answer),
        found,
        entity: answer ? entityPresentation(pack, answer.entityId) : null,
      };
    }),
  };
}

function fastMoneyReveal(pack: FamilyFeudPack, state: FamilyFeudState) {
  if (state.phase !== "complete") return [];
  return pack.fastMoney.map((question, index) => {
    const result = state.fastMoneyResults[index];
    const canonical = result?.entityId ? entityPresentation(pack, result.entityId) : null;
    const submitted = canonical?.display_name ?? result?.submittedText ?? "NO ANSWER";
    const rankedAnswerIndex = result?.entityId
      ? question.answers.findIndex((answer) => answer.entityId === result.entityId)
      : -1;
    return {
      question_id: question.id,
      prompt: question.prompt,
      submitted_answer: submitted,
      counted: Boolean(result && result.points > 0),
      points: result?.points ?? 0,
      board_rank: rankedAnswerIndex >= 0 ? rankedAnswerIndex + 1 : null,
      accepted_answers: question.answers.map((answer) => ({
        entity: entityPresentation(pack, answer.entityId),
        points: answer.points,
      })),
    };
  });
}

function publicFeedback(pack: FamilyFeudPack, outcome?: FamilyFeudOutcome | null) {
  if (!outcome) return null;
  switch (outcome.type) {
    case "board-correct":
      return {
        type: "correct",
        board_index: outcome.boardIndex,
        slot_index: outcome.slotIndex,
        entity: entityPresentation(pack, outcome.entityId),
        points: outcome.points,
      };
    case "board-strike":
      return {
        type: "strike",
        board_index: outcome.boardIndex,
        strikes: outcome.strikes,
      };
    case "board-also-accepted":
      return {
        type: "correct",
        board_index: outcome.boardIndex,
        slot_index: outcome.slotIndex,
        entity: entityPresentation(pack, outcome.entityId),
        points: outcome.points,
        message: "GOOD ANSWER",
      };
    case "ambiguous":
      return {
        type: "ambiguous",
        message: "BE MORE SPECIFIC",
      };
    case "already-guessed":
      return {
        type: "already-guessed",
        message: "ALREADY GUESSED",
      };
    case "fast-money-answer":
      return {
        type: "accepted",
      };
    case "fast-money-timeout":
      return {
        type: "timeout",
      };
  }
}

export function familyFeudDailyPublicState(
  pack: FamilyFeudPack,
  state: FamilyFeudState,
  outcome?: FamilyFeudOutcome | null,
) {
  const score = familyFeudScore(pack, state);
  const complete = state.phase === "complete";
  const currentFastMoney = state.phase === "fast-money"
    ? pack.fastMoney[state.fastMoneyIndex] ?? null
    : null;

  return {
    complete,
    phase: state.phase,
    main_board_index: state.mainBoardIndex,
    main_boards: pack.mainBoards.map((_board, index) => mainBoardPublicState(pack, state, index)),
    main_points: score.main,
    fast_money: {
      question_count: FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
      answered_count: state.fastMoneyResults.length,
      question_index: state.phase === "fast-money" ? state.fastMoneyIndex : null,
      current_question: currentFastMoney
        ? { id: currentFastMoney.id, prompt: currentFastMoney.prompt }
        : null,
      time_remaining_ms: state.fastMoneyTimeRemainingMs,
      submitted_answers: state.fastMoneyResults.map((result) => ({
        submitted_answer: result.entityId
          ? entityPresentation(pack, result.entityId).display_name
          : result.submittedText || "NO ANSWER",
      })),
      results: fastMoneyReveal(pack, state),
      points: complete ? score.fastMoney : null,
    },
    raw_points: complete ? score.raw : null,
    hq_score: complete ? score.hq : null,
    last_feedback: publicFeedback(pack, outcome),
  };
}

function proofFor(
  pack: FamilyFeudPack,
  day: string,
  scheduleVersion: string,
) {
  const questionSignature = [...pack.mainBoards, ...pack.fastMoney]
    .map((question) => question.id + ":" + question.answers.map((answer) => answer.entityId + "=" + answer.points).join(","))
    .join("|");
  return [
    FAMILY_FEUD_DAILY_CONTENT_VERSION,
    pack.sport,
    day,
    scheduleVersion,
    pack.id,
    questionSignature,
  ].join("|");
}

export function buildFamilyFeudDailySetup(
  pack: FamilyFeudPack,
  day: string,
  scheduleVersion: string,
): FamilyFeudDailyPublication {
  assertFamilyFeudPack(pack);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error("Family Feud daily day must use YYYY-MM-DD.");
  }
  if (!scheduleVersion.trim()) throw new Error("Family Feud daily schedule version is required.");

  const state = createFamilyFeudState();
  const proof = proofFor(pack, day, scheduleVersion);

  return {
    setupKey: [
      FAMILY_FEUD_DAILY_CONTENT_VERSION,
      scheduleVersion,
      day,
      pack.sport,
      pack.id,
    ].join(":"),
    contentVersion: FAMILY_FEUD_DAILY_CONTENT_VERSION,
    scoringVersion: FAMILY_FEUD_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: FAMILY_FEUD_DAILY_CONTENT_VERSION,
      sport: pack.sport,
      pack_id: pack.id,
      presentation_domain: pack.sport === "mlb"
        ? "mlb"
        : pack.sport === "nba"
          ? "nba"
        : pack.id.includes("-cfb-")
          ? "cfb"
          : pack.id.includes("-nfl-")
            ? "nfl"
            : pack.sport === "football"
              ? "nfl"
              : "ufc",
      main_board_count: pack.mainBoards.length,
      answers_required_per_board: FAMILY_FEUD_BOARD_ANSWER_COUNT,
      strike_limit: FAMILY_FEUD_STRIKES_PER_BOARD,
      main_board_max_points: FAMILY_FEUD_MAIN_BOARD_MAX,
      main_max_points: FAMILY_FEUD_MAIN_RAW_MAX,
      fast_money_question_count: FAMILY_FEUD_FAST_MONEY_QUESTION_COUNT,
      fast_money_time_ms: FAMILY_FEUD_FAST_MONEY_TIME_MS,
      fast_money_max_points: FAMILY_FEUD_FAST_MONEY_RAW_MAX,
      hq_score_max: FAMILY_FEUD_RAW_MAX,
      main_boards: pack.mainBoards.map((question) => ({
        id: question.id,
        prompt: question.prompt,
      })),
      fast_money_prompts: pack.fastMoney.map((question) => ({
        id: question.id,
        prompt: question.prompt,
      })),
      initial_state: familyFeudDailyPublicState(pack, state),
    },
    revealSetup: {
      main_boards: pack.mainBoards.map((question) => ({
        id: question.id,
        accepted_answers: question.answers.map((answer, rankIndex) => ({
          rank: rankIndex + 1,
          entity: entityPresentation(pack, answer.entityId),
          points: answer.points,
        })),
      })),
      fast_money: pack.fastMoney.map((question) => ({
        id: question.id,
        accepted_answers: question.answers.map((answer, rankIndex) => ({
          rank: rankIndex + 1,
          entity: entityPresentation(pack, answer.entityId),
          points: answer.points,
        })),
      })),
    },
    privateSetupEvidence: {
      proof,
      pack,
    },
    privateGradingEvidence: {
      proof,
      raw_max: FAMILY_FEUD_RAW_MAX,
    },
  };
}

function stateFromSubmission(context: FamilyFeudDailyRuntimeContext) {
  const raw = context.submissionState.engine_state;
  if (raw == null) return createFamilyFeudState();
  const row = asRecord(raw, "Family Feud persisted state");

  if (!["main", "fast-money", "complete"].includes(String(row.phase ?? ""))) {
    throw new Error("Family Feud persisted phase is invalid.");
  }

  return structuredClone(row) as unknown as FamilyFeudState;
}

// Refresh known fair-answer omissions in already-published daily packs without
// changing their ranked answers, immutable setup proof, or completed scores.
function hydrateUfcGrapplingAcceptance(pack: FamilyFeudPack): FamilyFeudPack {
  const eligible = /^ufc-(?:main-04|fast1-09|fast5-08)-[1-5]$/;
  const entities = [...pack.entities];
  const correct = (question: FamilyFeudPack["mainBoards"][number]) => {
    if (!eligible.test(question.id)) return question;
    if (question.candidateIds.some((id) => entities.some(
      (entity) => entity.id === id && entity.displayName === "Khamzat Chimaev"
    ))) return question;
    // Legacy packs can have gaps in v-IDs after a subject was removed, while
    // newer authored packs may already use later slots. Never replace a prior
    // identity when hydrating this missing valid wrestler.
    let nextVariant = (question.alsoAcceptedEntityIds ?? []).length + 1;
    let entityId = `${question.id}:v${nextVariant}`;
    while (entities.some((entity) => entity.id === entityId)) {
      nextVariant += 1;
      entityId = `${question.id}:v${nextVariant}`;
    }
    entities.push({ id: entityId, displayName: "Khamzat Chimaev", kind: "person", aliases: ["Khamzat", "Chimaev"] });
    return {
      ...question,
      candidateIds: [...question.candidateIds, entityId],
      alsoAcceptedEntityIds: [...(question.alsoAcceptedEntityIds ?? []), entityId],
    };
  };
  return {
    ...pack,
    entities,
    mainBoards: pack.mainBoards.map(correct),
    fastMoney: pack.fastMoney.map(correct),
  };
}


/**
 * Correct two November 12 UFC Fast Money omissions without rewriting the
 * published answer ladder or proof. These IDs recur in future UFC rotations.
 * "Got Up Quick" means the ranked "Fighter stood back up" (6), while a kick
 * landing is a distinct valid fight sound worth the off-board minimum (1).
 * Keep this specific to the two audited UFC question identities.
 */
export function hydrateUfcFeudFairAnswers(pack: FamilyFeudPack): FamilyFeudPack {
  if (pack.sport !== "ufc" || !pack.fastMoney.some(
    (question) => question.id === "ufc-v2-fast13-close-stoppage-debate"
      || question.id === "ufc-v2-fast-fight-sounds",
  )) return pack;

  const entities = pack.entities.map((entity) => ({ ...entity }));
  let changed = false;
  const addAliases = (entityId: string, aliases: readonly string[]) => {
    const target = entities.find((entity) => entity.id === entityId);
    if (!target) throw new Error("UFC Feud fair-answer identity is missing: " + entityId);
    const merged = [...new Set([...(target.aliases ?? []), ...aliases])];
    if (merged.length !== (target.aliases ?? []).length) {
      target.aliases = merged;
      changed = true;
    }
  };

  const fastMoney = pack.fastMoney.map((question) => {
    if (question.id === "ufc-v2-fast13-close-stoppage-debate") {
      const ranked = question.answers.find((answer) =>
        entities.some((entity) => entity.id === answer.entityId
          && entity.displayName === "Fighter stood back up"));
      if (!ranked || ranked.points !== 6) {
        throw new Error("UFC Feud stoppage ranked answer has changed");
      }
      addAliases(ranked.entityId, [
        "Got Up Quick", "Got Back Up", "Stood Up Quickly",
        "Back On Their Feet", "Got Up Immediately",
      ]);
      return question;
    }
    if (question.id !== "ufc-v2-fast-fight-sounds") return question;

    const aliases = ["Kick", "Kicking", "Kick impact", "Sound of a kick"];
    const existing = entities.find((entity) =>
      question.candidateIds.includes(entity.id) && entity.displayName === "Kick landing");
    if (existing) {
      if (!(question.alsoAcceptedEntityIds ?? []).includes(existing.id)) {
        throw new Error("UFC Feud kick sound must remain an off-board answer");
      }
      addAliases(existing.id, aliases);
      return question;
    }

    let suffix = 1;
    let id = question.id + ":fair" + suffix;
    while (entities.some((entity) => entity.id === id)) {
      suffix += 1;
      id = question.id + ":fair" + suffix;
    }
    entities.push({ id, displayName: "Kick landing", kind: "other", aliases });
    changed = true;
    return {
      ...question,
      candidateIds: [...question.candidateIds, id],
      alsoAcceptedEntityIds: [...(question.alsoAcceptedEntityIds ?? []), id],
    };
  });
  return changed ? { ...pack, entities, fastMoney } : pack;
}

/** Supply fair off-board answers to already-published NBA broadcast boards.
 * The official board/proof/ranked top eight remain untouched. */
function hydrateNbaBroadcastAnswers(pack: FamilyFeudPack): FamilyFeudPack {
  if (pack.sport !== "nba") return pack;
  const id = "nba-feud-nba-tv-broadcast";
  if (!pack.fastMoney.some((question) => question.id === id)) return pack;
  const entities = [...pack.entities];
  const fastMoney = pack.fastMoney.map((question) => {
    if (question.id !== id) return question;
    const candidateIds = [...question.candidateIds];
    const alsoAcceptedEntityIds = [...(question.alsoAcceptedEntityIds ?? [])];
    const additions: ReadonlyArray<readonly [string, readonly string[]]> = [["Three-pointer",["3 pointer","3pt","3 point shot","Three point shot","Three"]],["Dunk",["Slam dunk","Dunk shot"]],["Free throw",["Foul shot"]],["Layup",["Lay up"]],["Buzzer-beater",["Buzzer beater","Game-winning shot"]],["Referee whistle",["Whistle"]],["Crowd cheering",["Fans cheering"]],["Basketball action",["Game action","Live basketball"]]];
    for (const [name, aliases] of additions) {
      const existingIndex = entities.findIndex((entity) =>
        candidateIds.includes(entity.id) && entity.displayName.toLowerCase() === name.toLowerCase());
      if (existingIndex >= 0) {
        const existing = entities[existingIndex]!;
        entities[existingIndex] = { ...existing, aliases: [...new Set([...(existing.aliases ?? []), ...aliases])] };
        continue;
      }
      let suffix = 9;
      while (entities.some((entity) => entity.id === id + ":v" + suffix)) suffix += 1;
      const entityId = id + ":v" + suffix;
      entities.push({ id: entityId, displayName: name, kind: "other", aliases });
      candidateIds.push(entityId);
      alsoAcceptedEntityIds.push(entityId);
    }
    return { ...question, candidateIds, alsoAcceptedEntityIds };
  });
  return { ...pack, entities, fastMoney };
}

/** Restore the well-established nickname in already-published NBA Daily packs.
 * The server's lean runtime intentionally does not load the full NBA alias bank. */
function hydrateNbaBirdmanAcceptance(pack: FamilyFeudPack): FamilyFeudPack {
  if (pack.sport !== "nba" || !pack.mainBoards.some(
    (board) => board.id === "nba-feud-distinctive-looks",
  )) return pack;
  const candidateIds = new Set(pack.mainBoards.find(
    (board) => board.id === "nba-feud-distinctive-looks",
  )?.candidateIds ?? []);
  return {
    ...pack,
    entities: pack.entities.map((entity) =>
      candidateIds.has(entity.id) && entity.displayName === "Chris Andersen"
        ? { ...entity, aliases: [...new Set([...(entity.aliases ?? []), "Birdman", "The Birdman"])] }
        : entity),
  };
}

/**
 * Known factual and semantic omissions in the November 6 NFL Feud boards.
 * A published setup is immutable: only add eligible unranked candidates and
 * explicit synonyms at grading time. Never alter its ranked ladder or proof.
 * The same fix applies if either board is drawn again in a future Daily.
 */
export function hydrateFootballFeudFairAnswers(pack: FamilyFeudPack): FamilyFeudPack {
  if (pack.sport !== "football") return pack;
  const additions: Readonly<Record<string, ReadonlyArray<{
    name: string; kind: FamilyFeudPack["entities"][number]["kind"]; aliases?: readonly string[];
  }>>> = {
    "nfl-feud-r2-main-career-100-sacks": [
      // Official NFL career sacks (since 1982): Lawrence Taylor 132.5.
      { name: "Lawrence Taylor", kind: "person", aliases: ["L.T.", "LT"] },
      { name: "Richard Dent", kind: "person" },
      { name: "John Abraham", kind: "person" },
      { name: "Leslie O'Neal", kind: "person" },
      { name: "Rickey Jackson", kind: "person" },
      { name: "Derrick Thomas", kind: "person" },
      { name: "Dwight Freeney", kind: "person" },
      { name: "Robert Mathis", kind: "person" },
      { name: "Simeon Rice", kind: "person" },
      { name: "Clyde Simmons", kind: "person" },
      { name: "Sean Jones", kind: "person" },
      { name: "Cameron Jordan", kind: "person" },
      { name: "Danielle Hunter", kind: "person" },
      { name: "Calais Campbell", kind: "person" },
      { name: "Khalil Mack", kind: "person" },
      { name: "Justin Houston", kind: "person" },
      { name: "Greg Townsend", kind: "person" },
      { name: "Pat Swilling", kind: "person" },
      { name: "Neil Smith", kind: "person" },
      { name: "Kevin Carter", kind: "person" },
      { name: "Elvis Dumervil", kind: "person" },
      { name: "Trace Armstrong", kind: "person" },
      { name: "Jim Jeffcoat", kind: "person" },
      { name: "Robert Quinn", kind: "person" },
      { name: "William Fuller", kind: "person" },
      { name: "Charles Haley", kind: "person" },
      { name: "Carlos Dunlap", kind: "person" },
      { name: "Andre Tippett", kind: "person" },
    ],
    "nfl-main-11-1": [
      { name: "Cowboys-Giants", kind: "other",
        aliases: ["Cowboys Giants", "Giants Cowboys", "Dallas Cowboys New York Giants",
          "New York Giants Dallas Cowboys", "Dallas Giants", "Dallas Cowboys vs New York Giants"] },
      { name: "Patriots-Giants", kind: "other",
        aliases: ["Patriots Giants", "Giants Patriots", "New England Giants",
          "New England Patriots vs New York Giants", "New York Giants New England Patriots"] },
      { name: "Jets-Giants", kind: "other",
        aliases: ["Jets Giants", "Giants Jets", "New York Jets New York Giants",
          "New York Giants New York Jets", "New York Jets vs New York Giants"] },
    ],
  };
  const entities = pack.entities.map((entity) => ({ ...entity }));
  let changed = false;
  const mainBoards = pack.mainBoards.map((board) => {
    const needed = additions[board.id];
    if (!needed) return board;
    const candidateIds = [...board.candidateIds];
    const alsoAcceptedEntityIds = [...(board.alsoAcceptedEntityIds ?? [])];
    for (const item of needed) {
      // Reuse existing identity when a later published pack already has it.
      const existing = entities.find((entity) => candidateIds.includes(entity.id)
        && normalizeFamilyFeudInput(entity.displayName) === normalizeFamilyFeudInput(item.name));
      if (existing) {
        if (item.aliases?.length) {
          existing.aliases = [...new Set([...(existing.aliases ?? []), ...item.aliases])];
          changed = true;
        }
        continue;
      }
      let suffix = 1;
      let entityId = `${board.id}:fair${suffix}`;
      while (entities.some((entity) => entity.id === entityId)) {
        suffix += 1;
        entityId = `${board.id}:fair${suffix}`;
      }
      entities.push({ id: entityId, displayName: item.name, kind: item.kind,
        aliases: item.aliases ?? [] });
      candidateIds.push(entityId);
      alsoAcceptedEntityIds.push(entityId);
      changed = true;
    }
    return { ...board, candidateIds, alsoAcceptedEntityIds };
  });
  // November 11 CFB Fast Money: do not treat the same pregame picks
  // as a ranked eight-point answer AND a separate one-point answer.
  // Hydrate already-published, immutable packs as well as future publications.
  const fastCorrections: Readonly<Record<string, {
    rankedName: string;
    aliases: readonly string[];
    duplicateName?: string;
  }>> = {
    "cfb-feud-r2-fast-cfb-pregame-segments": {
      rankedName: "Game predictions",
      aliases: ["Picks", "Analyst picks", "Game picks", "Pregame picks", "Predictions"],
      duplicateName: "Analyst picks",
    },
    "cfb-feud-r2-fast-college-injury-sideline": {
      rankedName: "Wrap injury",
      aliases: ["Tape", "Tape up", "Apply tape", "Tape ankle", "Taping"],
    },
  };
  const fastMoney = pack.fastMoney.map((question) => {
    const correction = fastCorrections[question.id];
    if (!correction) return question;
    const ranked = question.answers.find((answer) =>
      entities.some((entity) => entity.id === answer.entityId
        && entity.displayName === correction.rankedName));
    if (!ranked) throw new Error("Football Feud ranked identity changed: " + question.id);
    const entity = entities.find((candidate) => candidate.id === ranked.entityId)!;
    const aliases = [...new Set([...(entity.aliases ?? []), ...correction.aliases])];
    if (aliases.length !== (entity.aliases ?? []).length) {
      entity.aliases = aliases;
      changed = true;
    }
    const duplicateIds = new Set(entities
      .filter((candidate) => (question.alsoAcceptedEntityIds ?? []).includes(candidate.id)
        && candidate.displayName === correction.duplicateName)
      .map((candidate) => candidate.id));
    if (!duplicateIds.size) return question;
    changed = true;
    return {
      ...question,
      candidateIds: question.candidateIds.filter((id) => !duplicateIds.has(id)),
      alsoAcceptedEntityIds: (question.alsoAcceptedEntityIds ?? [])
        .filter((id) => !duplicateIds.has(id)),
    };
  });
  return changed ? { ...pack, entities, mainBoards, fastMoney } : pack;
}

export type FamilyFeudEntityMetadataLookup = (
  id: string,
  displayName: string,
) => { kind?: FamilyFeudPack["entities"][number]["kind"]; aliases?: readonly string[] } | null;

function privatePack(
  context: FamilyFeudDailyRuntimeContext,
  lookup: FamilyFeudEntityMetadataLookup,
) {
  const raw = context.privateSetupEvidence.pack;
  const persisted = asRecord(raw, "Family Feud private pack") as unknown as FamilyFeudPack;
  const pack: FamilyFeudPack = {
    ...persisted,
    entities: persisted.entities.map((entity) => {
      const current = lookup(entity.id, entity.displayName);
      const aliases = [
        ...new Set([
          ...(entity.aliases ?? []),
          ...standardSportsFeudAliases(entity.displayName),
          ...(current?.aliases ?? []),
        ]),
      ];
      return {
        ...entity,
        kind: current?.kind ?? entity.kind,
        aliases,
      };
    }),
  };
  const corrected = hydrateFootballFeudFairAnswers(hydrateNbaBirdmanAcceptance(hydrateNbaBroadcastAnswers(hydrateUfcFeudFairAnswers(hydrateUfcGrapplingAcceptance(pack)))));
  assertFamilyFeudPack(corrected);
  return corrected;
}

function finalSubmission(
  context: FamilyFeudDailyRuntimeContext,
  pack: FamilyFeudPack,
  state: FamilyFeudState,
) {
  const score = familyFeudScore(pack, state);
  return {
    proof: String(context.privateSetupEvidence.proof ?? ""),
    native_score: score.raw,
    normalized_score: score.hq,
    main_points: score.main,
    fast_money_points: score.fastMoney,
    fast_money_time_remaining_ms: state.fastMoneyTimeRemainingMs,
  };
}

export function advanceFamilyFeudDailyCore(
  context: FamilyFeudDailyRuntimeContext,
  actionValue: unknown,
  lookup: FamilyFeudEntityMetadataLookup = () => null,
): FamilyFeudDailyAdvanceResult {
  const pack = privatePack(context, lookup);
  const action = asRecord(actionValue, "Family Feud action");
  const state = stateFromSubmission(context);
  if (state.phase === "complete") throw new Error("Family Feud run is already settled.");

  const type = String(action.type ?? "");
  let transition;
  if (type === "timeout") {
    if (state.phase !== "fast-money") throw new Error("Family Feud timeout is only valid in Fast Money.");
    transition = timeoutFamilyFeudFastMoney(state);
  } else if (type === "answer") {
    const answer = typeof action.answer === "string" ? action.answer : "";
    if (state.phase === "main") {
      transition = submitFamilyFeudMainAnswer(pack, state, answer);
    } else {
      const currentQuestion = pack.fastMoney[state.fastMoneyIndex];
      const requestedQuestionId = action.question_id == null ? null : String(action.question_id);
      const requestedQuestionIndex = action.question_index == null
        ? null
        : Number(action.question_index);
      if (
        (requestedQuestionId && currentQuestion?.id !== requestedQuestionId)
        || (requestedQuestionIndex != null && requestedQuestionIndex !== state.fastMoneyIndex)
      ) {
        throw new Error("Fast Money question changed before this answer could sync.");
      }
      const timeRemaining = action.time_remaining_ms == null
        ? undefined
        : Number(action.time_remaining_ms);
      transition = submitFamilyFeudFastMoneyAnswer(
        pack,
        state,
        answer,
        timeRemaining,
        { consumeAmbiguous: true },
      );
    }
  } else {
    throw new Error("Family Feud action is invalid.");
  }

  const complete = transition.state.phase === "complete";
  const final = complete ? finalSubmission(context, pack, transition.state) : null;
  return {
    submissionState: {
      engine_state: transition.state,
      final_submission: final,
    },
    publicState: familyFeudDailyPublicState(pack, transition.state, transition.outcome),
    complete,
    finalSubmission: final,
  };
}

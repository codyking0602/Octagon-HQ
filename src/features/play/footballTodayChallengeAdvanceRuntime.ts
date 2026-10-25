import { advanceHitTheNumber, scoreFootballHitNumberTwoGameChild } from "./footballHitNumberAdvanceCore";
import {
  footballBlindResumeNextRevealCount,
  footballBlindResumeRevealStage,
  footballBlindResumeRoundPoints,
} from "../back-room/footballBlindResumeModel";
import {
  footballWavelengthClues,
  nextFootballWavelengthClue,
  type FootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { wavelengthScore } from "./wavelengthEngine";
import {
  advanceTwoGameDailyRuntime,
  isTwoGameDailyContext,
} from "./dailyTwoGameRuntime";
import { advanceCanonicalWhoAmIDailyRuntime } from "./whoAmITwoRoundDailyRuntime";
import { advanceMillionaireDailyRuntime } from "./millionaireDailyRuntime";
import { advanceFamilyFeudDailyRuntime } from "./familyFeudDailyRuntime";
import { advanceBarTriviaDailyRuntime } from "./barTriviaDailyRuntime";
import { advanceAverageFanDailyRuntime } from "./averageFanDailyRuntime";
import { advanceFootballHigherLowerDailyRuntime } from "./footballHigherLowerDailyRuntime";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyRuntimeContext,
} from "./todaysChallengeRuntime";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Football daily evidence must be an object.");
  }
  return value as JsonRecord;
}

function recordArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function stringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) {
    throw new Error(`${label} must be a string array.`);
  }
  return value as string[];
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return Number(value);
}

function presentationFor(evidence: JsonRecord, id: string) {
  const presentations = asRecord(evidence.presentations);
  return asRecord(presentations[id]);
}

function cluePresentation(clue: FootballWavelengthClue) {
  return { id: clue.id, category: clue.category, text: clue.text };
}

function clueFor(id: string) {
  const clue = footballWavelengthClues.find((row) => row.id === id);
  if (!clue) throw new Error(`Football Wavelength clue ${id} is unavailable.`);
  return clue;
}

function blindResumeRevealCounts(round: JsonRecord): readonly [number, number, number] {
  const raw = round.reveal_counts;
  if (!Array.isArray(raw) || raw.length !== 3 || raw.some((value) => !Number.isInteger(value))) {
    throw new Error("Football Blind Resume reveal stages are invalid.");
  }
  const counts = raw.map(Number) as [number, number, number];
  if (!(counts[0] > 0 && counts[0] < counts[1] && counts[1] < counts[2])) {
    throw new Error("Football Blind Resume reveal stages must increase.");
  }
  return counts;
}

function visibleBlindResumeRound(round: JsonRecord, revealedCount: number) {
  const allStats = recordArray(round.stats, "Football Blind Resume stats");
  const revealCounts = blindResumeRevealCounts(round);
  const stage = footballBlindResumeRevealStage({ revealCounts }, revealedCount);
  return {
    prompt: round.prompt,
    league: round.league,
    context_label: round.context_label,
    revealed_count: revealedCount,
    reveal_stage: stage + 1,
    reveal_counts: [...revealCounts],
    max_revealed_count: allStats.length,
    stats: allStats.slice(0, revealedCount),
  };
}

function advanceFindLeader(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const candidateIds = stringArray(context.privateSetupEvidence.candidate_ids, "Football Find the Leader candidates");
  const leaderId = String(context.privateSetupEvidence.leader_id ?? "");
  const prior = stringArray(context.submissionState.eliminated_ids ?? [], "Football Find the Leader progress");
  const eliminatedId = String(action.eliminated_id ?? "");
  if (!candidateIds.includes(eliminatedId) || prior.includes(eliminatedId)) throw new Error("That subject cannot be eliminated.");
  const eliminated = [...prior, eliminatedId];
  const complete = eliminatedId === leaderId || eliminated.length === candidateIds.length - 1;
  const finalSubmission = complete ? { eliminated_ids: eliminated } : null;
  const revealedCandidates = recordArray(context.revealSetup.candidates, "Football Find the Leader reveal candidates")
    .filter((candidate) => eliminated.includes(String(candidate.id ?? "")) && String(candidate.id ?? "") !== leaderId)
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      subtitle: candidate.subtitle,
      value: candidate.value,
    }));
  return {
    submissionState: { eliminated_ids: eliminated, final_submission: finalSubmission },
    publicState: {
      complete,
      eliminated_ids: eliminated,
      native_progress: complete && eliminatedId !== leaderId ? 10 : eliminated.length,
      revealed_candidates: revealedCandidates,
    },
    complete,
    finalSubmission,
  };
}

function advanceWavelength(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const target = integer(context.privateSetupEvidence.target, "Football Wavelength target", 1, 100);
  const seed = String(context.privateSetupEvidence.seed ?? "");
  const guesses = Array.isArray(context.submissionState.guesses) ? context.submissionState.guesses.map((value) => integer(value, "Football Wavelength guess", 1, 100)) : [];
  if (guesses.length >= 4) throw new Error("The Football Wavelength round is complete.");
  const guess = integer(action.guess, "Football Wavelength guess", 1, 100);
  const nextGuesses = [...guesses, guess];
  const clueIds = stringArray(context.submissionState.clue_ids ?? [String(context.privateSetupEvidence.opening_clue_id ?? "")], "Football Wavelength clues");
  let nextClueIds = [...clueIds];
  if (nextGuesses.length < 4) {
    const round = { target, clues: clueIds.map(clueFor) };
    const clue = nextFootballWavelengthClue(round, guess, nextGuesses.length, seed, guesses);
    nextClueIds = [...nextClueIds, clue.id];
  }
  const complete = nextGuesses.length === 4;
  const finalSubmission = complete ? { guesses: nextGuesses } : null;
  return {
    submissionState: { guesses: nextGuesses, clue_ids: nextClueIds, final_submission: finalSubmission },
    publicState: { complete, guesses: nextGuesses, clues: nextClueIds.map((id) => cluePresentation(clueFor(id))), next_guess_number: complete ? null : nextGuesses.length + 1, reveal: complete ? { target, clues: nextClueIds.map((id) => ({ ...cluePresentation(clueFor(id)), rating: clueFor(id).rating })) } : null },
    complete,
    finalSubmission,
  };
}

function advanceBlindResume(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const rounds = recordArray(context.privateSetupEvidence.rounds, "Football Blind Resume rounds");
  const answers = recordArray(context.submissionState.answers ?? [], "Football Blind Resume answers");
  if (answers.length >= rounds.length) throw new Error("The Football Blind Resume card is complete.");
  const round = rounds[answers.length]!;
  const publicRound = asRecord(context.publicState.current_round);
  const revealCounts = blindResumeRevealCounts(round);
  const revealedCount = integer(publicRound.revealed_count, "Football Blind Resume reveal count", revealCounts[0], revealCounts[2]);
  const stage = footballBlindResumeRevealStage({ revealCounts }, revealedCount);
  const priorResults = recordArray(context.publicState.results ?? [], "Football Blind Resume results");
  const priorRaw = Number(context.publicState.raw_points ?? 0);
  if (!Number.isFinite(priorRaw)) throw new Error("Football Blind Resume raw score is invalid.");

  if (action.reveal === true) {
    const next = footballBlindResumeNextRevealCount({ revealCounts }, revealedCount);
    if (next === null) throw new Error("All Football Blind Resume facts are already revealed.");
    return {
      submissionState: { answers, final_submission: null },
      publicState: { complete: false, round_index: answers.length, results: priorResults, raw_points: priorRaw, current_round: visibleBlindResumeRound(round, next) },
      complete: false,
      finalSubmission: null,
    };
  }

  const side = String(action.choice ?? "").toUpperCase();
  if (side !== "A" && side !== "B") throw new Error("Football Blind Resume choice must be A or B.");
  const pickedId = side === "A" ? String(round.left_id) : String(round.right_id);
  const correct = pickedId === String(round.winner_id);
  const points = footballBlindResumeRoundPoints(stage, correct);
  const rawPoints = priorRaw + points;
  const nextAnswers = [...answers, { choice: pickedId, reveal_stage: stage + 1, revealed_count: revealedCount }];
  const results = [...priorResults, {
    round_index: answers.length,
    context_label: round.context_label,
    picked_side: side,
    picked_id: pickedId,
    winner_id: round.winner_id,
    correct,
    reveal_stage: stage + 1,
    revealed_count: revealedCount,
    points_awarded: points,
    left: { id: round.left_id, name: round.left_name, subtitle: round.left_subtitle },
    right: { id: round.right_id, name: round.right_name, subtitle: round.right_subtitle },
  }];
  const complete = nextAnswers.length === rounds.length;
  const finalSubmission = complete ? { answers: nextAnswers } : null;
  const nextRound = complete ? null : rounds[nextAnswers.length]!;
  return {
    submissionState: { answers: nextAnswers, final_submission: finalSubmission },
    publicState: {
      complete,
      round_index: complete ? rounds.length : nextAnswers.length,
      results,
      raw_points: rawPoints,
      current_round: nextRound ? visibleBlindResumeRound(nextRound, blindResumeRevealCounts(nextRound)[0]) : null,
    },
    complete,
    finalSubmission,
  };
}

function advanceBlindRank(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const ids = stringArray(context.privateSetupEvidence.fighter_ids, "Football Blind Rank ids");
  const assignments = recordArray(context.submissionState.assignments ?? [], "Football Blind Rank assignments");
  if (assignments.length >= ids.length) throw new Error("The Football Blind Rank board is complete.");
  const slot = integer(action.slot, "Football Blind Rank slot", 1, 5);
  if (assignments.some((row) => row.slot === slot)) throw new Error("That Football Blind Rank slot is already locked.");
  const id = ids[assignments.length]!;
  const nextAssignments = [...assignments, { fighter_id: id, slot }];
  const slots: Array<JsonRecord | null> = [null, null, null, null, null];
  nextAssignments.forEach((row) => { slots[integer(row.slot, "Stored Football Blind Rank slot", 1, 5) - 1] = presentationFor(context.privateSetupEvidence, String(row.fighter_id)); });
  const complete = nextAssignments.length === ids.length;
  const orderedIds = complete ? [...nextAssignments].sort((a, b) => Number(a.slot) - Number(b.slot)).map((row) => String(row.fighter_id)) : null;
  const finalSubmission = orderedIds ? { ordered_ids: orderedIds } : null;
  return { submissionState: { assignments: nextAssignments, final_submission: finalSubmission }, publicState: { complete, reveal_index: nextAssignments.length, slots, current_subject: complete ? null : presentationFor(context.privateSetupEvidence, ids[nextAssignments.length]!), reveal: complete ? context.revealSetup : null }, complete, finalSubmission };
}

function advanceKeepCut(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const ids = stringArray(context.privateSetupEvidence.fighter_ids, "Football Keep Cut ids");
  const choices = stringArray(context.submissionState.choices ?? [], "Football Keep Cut choices");
  if (choices.length >= ids.length) throw new Error("The Football Keep Cut board is complete.");
  const choice = String(action.choice ?? "").toLowerCase();
  if (choice !== "keep" && choice !== "cut") throw new Error("Football Keep Cut choice must be keep or cut.");
  const keptCount = choices.filter((row) => row === "keep").length;
  const cutCount = choices.filter((row) => row === "cut").length;
  if ((choice === "keep" && keptCount >= 4) || (choice === "cut" && cutCount >= 4)) throw new Error("That Football Keep Cut side is full.");
  const nextChoices = [...choices, choice];
  const decided = ids.slice(0, nextChoices.length);
  const kept = decided.filter((_id, index) => nextChoices[index] === "keep");
  const cut = decided.filter((_id, index) => nextChoices[index] === "cut");
  const complete = nextChoices.length === ids.length;
  const finalSubmission = complete ? { kept_ids: kept } : null;
  return { submissionState: { choices: nextChoices, final_submission: finalSubmission }, publicState: { complete, reveal_index: nextChoices.length, kept: kept.map((id) => presentationFor(context.privateSetupEvidence, id)), cut: cut.map((id) => presentationFor(context.privateSetupEvidence, id)), current_subject: complete ? null : presentationFor(context.privateSetupEvidence, ids[nextChoices.length]!), forced_choice: complete ? null : kept.length === 4 ? "cut" : cut.length === 4 ? "keep" : null, reveal: complete ? context.revealSetup : null }, complete, finalSubmission };
}

function advanceSingleFootballOfficialDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  const parsed = asRecord(action);
  switch (context.gameType) {
    case "find_leader": return advanceFindLeader(context, parsed);
    case "wavelength": return advanceWavelength(context, parsed);
    case "blind_resume": return advanceBlindResume(context, parsed);
    case "blind_rank_5": return advanceBlindRank(context, parsed);
    case "keep_4_cut_4": return advanceKeepCut(context, parsed);
    case "hit_the_number": return advanceHitTheNumber(context, parsed);
    case "who_am_i": return advanceCanonicalWhoAmIDailyRuntime(context, parsed);
    case "millionaire": return advanceMillionaireDailyRuntime(context, parsed);
    case "sports_feud": return advanceFamilyFeudDailyRuntime(context, parsed);
    case "bar_trivia": return advanceBarTriviaDailyRuntime(context, parsed);
    case "average_fan": return advanceAverageFanDailyRuntime(context, parsed);
    case "higher_lower": return advanceFootballHigherLowerDailyRuntime(context, parsed);
    default: throw new Error(`Unsupported Football official daily game ${String(context.gameType)}.`);
  }
}

function scoreTwoGameFootballChild(
  context: OfficialDailyRuntimeContext,
  advanced: OfficialDailyAdvanceResult,
) {
  if (context.gameType === "higher_lower") {
    return Number(advanced.finalSubmission?.normalized_score);
  }
  if (context.gameType === "find_leader") {
    return Number(advanced.publicState.native_progress ?? 0) * 10;
  }
  if (context.gameType === "wavelength") {
    const guesses = Array.isArray(advanced.submissionState.guesses)
      ? advanced.submissionState.guesses.map(Number)
      : [];
    const finalGuess = guesses.at(-1);
    const target = Number(context.privateSetupEvidence.target);
    if (!Number.isFinite(finalGuess) || !Number.isFinite(target)) {
      throw new Error("Football two-game Wavelength score evidence is unavailable.");
    }
    return wavelengthScore(Number(finalGuess), target);
  }
  if (context.gameType === "hit_the_number") {
    return scoreFootballHitNumberTwoGameChild(context, advanced);
  }
  throw new Error(`Unsupported Football two-game Daily score for ${String(context.gameType)}.`);
}

export function advanceFootballOfficialDailyRuntime(
  context: OfficialDailyRuntimeContext,
  action: unknown,
): OfficialDailyAdvanceResult {
  return isTwoGameDailyContext(context)
    ? advanceTwoGameDailyRuntime(
        context,
        action,
        advanceSingleFootballOfficialDailyRuntime,
        scoreTwoGameFootballChild,
      )
    : advanceSingleFootballOfficialDailyRuntime(context, action);
}

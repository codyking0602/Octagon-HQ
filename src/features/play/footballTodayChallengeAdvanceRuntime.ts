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
import { advanceWhoAmIDailyRuntime } from "./whoAmIDailyRuntime";
import { advanceMillionaireDailyRuntime } from "./millionaireDailyRuntime";
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

function hitTheNumberPlanEvidence(context: OfficialDailyRuntimeContext) {
  const ids = stringArray(context.privateSetupEvidence.fighter_ids, "Football Hit the Number ids");
  const pickCount = integer(context.privateSetupEvidence.pick_count, "Football Hit the Number pick count", 4, 6);
  const plan = asRecord(context.privateSetupEvidence.plan);
  const subjectIds = stringArray(plan.subjectIds, "Football Hit the Number canonical plan subjects");
  if (
    subjectIds.length !== ids.length
    || subjectIds.some((id, index) => id !== ids[index])
    || Number(plan.pickCount) !== pickCount
  ) {
    throw new Error("Football Hit the Number canonical plan is unavailable.");
  }

  const formatId = String(plan.formatId ?? "");
  const progression = formatId === "one-from-each" || formatId === "build-the-team";
  const slots = Array.isArray(plan.slots)
    ? recordArray(plan.slots, "Football Hit the Number slots")
    : [];
  let progressionSlotSubjectIds: string[][] = [];
  if (progression) {
    const raw = context.privateSetupEvidence.progression_slot_subject_ids;
    if (!Array.isArray(raw) || raw.length !== pickCount) {
      throw new Error("Football Hit the Number persisted slot eligibility is unavailable.");
    }
    progressionSlotSubjectIds = raw.map((row, index) =>
      stringArray(row, `Football Hit the Number slot ${index + 1} eligibility`));
    if (progressionSlotSubjectIds.some((row) => row.some((id) => !ids.includes(id)))) {
      throw new Error("Football Hit the Number persisted slot eligibility is invalid.");
    }
  }

  return { ids, pickCount, plan, progression, slots, progressionSlotSubjectIds };
}

function hitTheNumberSelectionSatisfiesPersisted(
  context: OfficialDailyRuntimeContext,
  selectedIds: readonly string[],
) {
  const evidence = hitTheNumberPlanEvidence(context);
  if (selectedIds.length !== evidence.pickCount) return false;
  if (new Set(selectedIds).size !== selectedIds.length) return false;
  if (selectedIds.some((id) => !evidence.ids.includes(id))) return false;
  if (!evidence.progression) return true;
  return selectedIds.every((id, index) => evidence.progressionSlotSubjectIds[index]?.includes(id));
}

function hitTheNumberPublicStatePersisted(
  context: OfficialDailyRuntimeContext,
  selectedIds: readonly string[],
  complete = false,
) {
  const evidence = hitTheNumberPlanEvidence(context);
  const activeIndex = !complete && evidence.progression && selectedIds.length < evidence.pickCount
    ? selectedIds.length
    : null;
  const activeSlot = activeIndex == null ? null : evidence.slots[activeIndex] ?? null;
  const activeSlotSubjectIds = activeIndex == null
    ? []
    : evidence.progressionSlotSubjectIds[activeIndex] ?? [];
  const availableIds = complete || activeSlot == null
    ? [...evidence.ids]
    : activeSlotSubjectIds.filter((id) => !selectedIds.includes(id));

  return {
    complete,
    selected_ids: [...selectedIds],
    available_subject_ids: availableIds,
    active_slot: activeSlot
      ? { ...activeSlot, index: activeIndex }
      : null,
  };
}

function advanceHitTheNumber(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const evidence = hitTheNumberPlanEvidence(context);
  const eligible = new Set(evidence.ids);
  const selected = stringArray(context.submissionState.selected_ids ?? [], "Football Hit the Number selections");

  if (action.lock === true) {
    if (!hitTheNumberSelectionSatisfiesPersisted(context, selected)) {
      throw new Error("Football Hit the Number selections do not satisfy this board.");
    }
    const finalSubmission = { selected_ids: [...selected] };
    return {
      submissionState: { selected_ids: [...selected], final_submission: finalSubmission },
      publicState: hitTheNumberPublicStatePersisted(context, selected, true),
      complete: true,
      finalSubmission,
    };
  }

  if (Number.isInteger(action.rewind_to)) {
    if (!evidence.progression) throw new Error("This Football Hit the Number board does not use progression slots.");
    const index = integer(action.rewind_to, "Football Hit the Number rewind slot", 0, Math.max(0, selected.length - 1));
    const next = selected.slice(0, index);
    return {
      submissionState: { selected_ids: next, final_submission: null },
      publicState: hitTheNumberPublicStatePersisted(context, next),
      complete: false,
      finalSubmission: null,
    };
  }

  const id = String(action.fighter_id ?? "");
  if (!eligible.has(id)) throw new Error("That subject is not on the Football Hit the Number board.");

  let next: string[];
  if (selected.includes(id)) {
    if (evidence.progression && selected.at(-1) !== id) {
      throw new Error("Football Hit the Number progression can only rewind from the latest slot.");
    }
    next = evidence.progression ? selected.slice(0, -1) : selected.filter((row) => row !== id);
  } else {
    if (selected.length >= evidence.pickCount) {
      throw new Error(`Football Hit the Number allows exactly ${evidence.pickCount} selections.`);
    }
    if (
      evidence.progression
      && !evidence.progressionSlotSubjectIds[selected.length]!.includes(id)
    ) {
      throw new Error("That subject is not eligible for the active Football Hit the Number slot.");
    }
    next = [...selected, id];
  }

  return {
    submissionState: { selected_ids: next, final_submission: null },
    publicState: hitTheNumberPublicStatePersisted(context, next),
    complete: false,
    finalSubmission: null,
  };
}

export function advanceFootballOfficialDailyRuntime(
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
    case "who_am_i": return advanceWhoAmIDailyRuntime(context, parsed);
    case "millionaire": return advanceMillionaireDailyRuntime(context, parsed);
    default: throw new Error(`Unsupported Football official daily game ${String(context.gameType)}.`);
  }
}

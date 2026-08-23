import {
  buildFootballBlindResumeRounds,
  footballBlindResumeRoundPoints,
  FOOTBALL_BLIND_RESUME_REVEAL_COUNTS,
  type FootballBlindResumeRevealCount,
} from "../back-room/footballBlindResumeModel";
import {
  buildFootballFindLeaderBoard,
  footballFindLeaderQuestions,
} from "../back-room/footballFindLeaderModel";
import { footballFindLeaderLeagueForDomain } from "../back-room/footballFactualStats";
import {
  createFootballHitTheNumberPlan,
  footballHitTheNumberValue,
  getFootballHitTheNumberSubject,
} from "../back-room/footballHitTheNumberModel";
import {
  buildFootballKeepCutLineup,
  footballKeepCutPacks,
} from "../back-room/footballKeepCutModel";
import {
  buildFootballRankFiveLineup,
  footballRankFivePacks,
  type FootballLeague,
  type FootballRankFiveItem,
  type FootballRankFivePackId,
} from "../back-room/footballRankFiveModel";
import {
  createFootballWavelengthRound,
  footballWavelengthClues,
  nextFootballWavelengthClue,
  type FootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import {
  OFFICIAL_SCORE_CONTRACT_VERSION,
  WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION,
} from "./officialScoreContract";
import type {
  OfficialDailyAdvanceResult,
  OfficialDailyGameType,
  OfficialDailyRuntimeContext,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const FOOTBALL_DAILY_RUNTIME_VERSION = "football-official-daily-v1" as const;
export const FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION = "football-blind-resume-daily-v1" as const;
export const FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION = "play-official-score-v3" as const;
export const FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION = "football-hit-the-number-daily-v1" as const;

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Football daily evidence must be an object.");
  return value as JsonRecord;
}

function recordArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function stringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => typeof row !== "string")) throw new Error(`${label} must be a string array.`);
  return value as string[];
}

function integer(value: unknown, label: string, min: number, max: number) {
  if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new Error(`${label} must be an integer from ${min} through ${max}.`);
  }
  return Number(value);
}

function footballItemPresentation(item: FootballRankFiveItem) {
  return { id: item.id, name: item.name, subtitle: item.subtitle, league: item.league };
}

function itemMap(items: readonly FootballRankFiveItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, footballItemPresentation(item)]));
}

function presentationFor(evidence: JsonRecord, id: string) {
  const presentations = asRecord(evidence.presentations);
  return asRecord(presentations[id]);
}

function dailyLeague(day: string, salt: string): FootballLeague {
  return stableLineupHash(`${FOOTBALL_DAILY_RUNTIME_VERSION}|${salt}|${day}`) % 2 === 0 ? "NFL" : "CFB";
}

function packLeague(pack: { items: readonly FootballRankFiveItem[] }) {
  return pack.items[0]?.league ?? "NFL";
}

function dailyComparisonPack(day: string, scheduleVersion: string, half: "rank" | "keep") {
  const rankLeague = dailyLeague(day, "daily-double");
  const league: FootballLeague = half === "rank" ? rankLeague : rankLeague === "NFL" ? "CFB" : "NFL";
  const source = half === "rank" ? footballRankFivePacks : footballKeepCutPacks;
  const candidates = source.filter((pack) => packLeague(pack) === league);
  if (!candidates.length) throw new Error(`Football ${half} daily has no ${league} pack.`);
  const random = seededLineupRandom(FOOTBALL_DAILY_RUNTIME_VERSION, "daily-double", scheduleVersion, day, half);
  return candidates[Math.floor(random() * candidates.length)]!;
}

function buildFindLeaderSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const desiredLeague = dailyLeague(day, "find-leader").toLowerCase();
  const questions = footballFindLeaderQuestions.filter((question) =>
    footballFindLeaderLeagueForDomain(question.domainId) === desiredLeague);
  const start = stableLineupHash(`${scheduleVersion}|${day}|football-find-leader`) % questions.length;
  let board = null;
  for (let offset = 0; offset < questions.length; offset += 1) {
    const question = questions[(start + offset) % questions.length]!;
    board = buildFootballFindLeaderBoard(question, `${FOOTBALL_DAILY_RUNTIME_VERSION}|${scheduleVersion}|${day}|${offset}`);
    if (board) break;
  }
  if (!board) throw new Error("Football Find the Leader could not build the official board.");
  const candidates = board.candidates.map(({ id, name, subtitle }) => ({ id, name, subtitle }));
  return {
    setupKey: `football-find-leader:${scheduleVersion}:${day}:${board.definitionId}`,
    contentVersion: board.version,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      league: desiredLeague.toUpperCase(),
      question: board.question,
      context: board.context,
      stat_label: board.statLabel,
      candidates,
      initial_state: { complete: false, eliminated_ids: [], native_progress: 0 },
    },
    revealSetup: { leader_id: board.leaderId, leader_value: board.leaderValue, candidates: board.candidates },
    privateSetupEvidence: { candidate_ids: board.candidates.map((row) => row.id), leader_id: board.leaderId },
    privateGradingEvidence: { candidate_ids: board.candidates.map((row) => row.id), leader_id: board.leaderId },
  };
}

function cluePresentation(clue: FootballWavelengthClue) {
  return { id: clue.id, category: clue.category, text: clue.text };
}

function clueFor(id: string) {
  const clue = footballWavelengthClues.find((row) => row.id === id);
  if (!clue) throw new Error(`Football Wavelength clue ${id} is unavailable.`);
  return clue;
}

function buildWavelengthSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|wavelength|${scheduleVersion}|${day}`;
  const round = createFootballWavelengthRound(seed);
  const opening = round.clues[0]!;
  return {
    setupKey: `football-wavelength:${scheduleVersion}:${day}`,
    contentVersion: FOOTBALL_DAILY_RUNTIME_VERSION,
    scoringVersion: WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      initial_state: { complete: false, guesses: [], clues: [cluePresentation(opening)], next_guess_number: 1, reveal: null },
    },
    revealSetup: {},
    privateSetupEvidence: { seed, target: round.target, opening_clue_id: opening.id },
    privateGradingEvidence: { target: round.target },
  };
}

function visibleBlindResumeRound(round: JsonRecord, revealedCount: number) {
  const stats = recordArray(round.stats, "Football Blind Resume stats").slice(0, revealedCount);
  return {
    prompt: round.prompt,
    league: round.league,
    revealed_count: revealedCount,
    max_revealed_count: 8,
    stats,
  };
}

function buildBlindResumeSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const rounds = buildFootballBlindResumeRounds(`${FOOTBALL_DAILY_RUNTIME_VERSION}|blind-resume|${scheduleVersion}|${day}`);
  const privateRounds = rounds.map((round) => ({
    id: round.id,
    prompt: round.prompt,
    league: round.league,
    left_id: round.leftId,
    right_id: round.rightId,
    left_name: round.leftName,
    right_name: round.rightName,
    left_subtitle: round.leftSubtitle,
    right_subtitle: round.rightSubtitle,
    winner_id: round.winnerId,
    stats: round.stats.map((stat) => ({ label: stat.label, value_a: stat.valueA, value_b: stat.valueB })),
  }));
  return {
    setupKey: `${FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}`,
    contentVersion: FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
    scoringVersion: FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      round_count: privateRounds.length,
      league_mix: rounds.reduce<Record<string, number>>((acc, round) => ({ ...acc, [round.league]: (acc[round.league] ?? 0) + 1 }), {}),
      initial_state: { complete: false, round_index: 0, results: [], current_round: visibleBlindResumeRound(privateRounds[0]!, 2) },
    },
    revealSetup: {},
    privateSetupEvidence: { rounds: privateRounds },
    privateGradingEvidence: { correct_choices: rounds.map((round) => round.winnerId) },
  };
}

function buildBlindRankSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const pack = dailyComparisonPack(day, scheduleVersion, "rank");
  const lineup = buildFootballRankFiveLineup(pack.id as FootballRankFivePackId, `${FOOTBALL_DAILY_RUNTIME_VERSION}|rank|${scheduleVersion}|${day}`);
  const presentations = itemMap(lineup);
  const ratings = Object.fromEntries(lineup.map((item) => [item.id, item.rating]));
  return {
    setupKey: `football-blind-rank:${scheduleVersion}:${day}:${pack.id}`,
    contentVersion: FOOTBALL_DAILY_RUNTIME_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      pack: { id: pack.id, name: pack.name, prompt: pack.prompt, intro: pack.intro, league: packLeague(pack) },
      initial_state: { complete: false, reveal_index: 0, slots: [null, null, null, null, null], current_subject: footballItemPresentation(lineup[0]!) },
    },
    revealSetup: { subjects: lineup.map((item) => ({ ...footballItemPresentation(item), rating: item.rating })) },
    privateSetupEvidence: { fighter_ids: lineup.map((item) => item.id), presentations },
    privateGradingEvidence: { fighter_ids: lineup.map((item) => item.id), ratings, tolerance: 1 },
  };
}

function buildKeepCutSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const pack = dailyComparisonPack(day, scheduleVersion, "keep");
  const lineup = buildFootballKeepCutLineup(pack.id, `${FOOTBALL_DAILY_RUNTIME_VERSION}|keep|${scheduleVersion}|${day}`);
  const presentations = itemMap(lineup);
  const ratings = Object.fromEntries(lineup.map((item) => [item.id, item.rating]));
  return {
    setupKey: `football-keep-cut:${scheduleVersion}:${day}:${pack.id}`,
    contentVersion: FOOTBALL_DAILY_RUNTIME_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      pack: { id: pack.id, name: pack.name, prompt: pack.prompt, intro: pack.intro, league: packLeague(pack) },
      initial_state: { complete: false, reveal_index: 0, kept: [], cut: [], current_subject: footballItemPresentation(lineup[0]!), forced_choice: null },
    },
    revealSetup: { subjects: lineup.map((item) => ({ ...footballItemPresentation(item), rating: item.rating })) },
    privateSetupEvidence: { fighter_ids: lineup.map((item) => item.id), presentations },
    privateGradingEvidence: { fighter_ids: lineup.map((item) => item.id), ratings, tolerance: 1 },
  };
}

function buildIntegerHitTheNumberPlan(day: string, scheduleVersion: string) {
  const desiredLeague = dailyLeague(day, "hit-the-number");
  for (let attempt = 0; attempt < 128; attempt += 1) {
    const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|hit-the-number|${scheduleVersion}|${day}|${attempt}`;
    const plan = createFootballHitTheNumberPlan(seed, "open-roster");
    if (plan.league !== desiredLeague || !Number.isInteger(plan.target)) continue;
    const values = plan.subjectIds.map((id) => footballHitTheNumberValue(id, plan.metricId));
    if (values.every((value) => Number.isInteger(value) && value >= 0)) return { plan, values };
  }
  throw new Error("Football Hit the Number could not build an integer-compatible official board.");
}

function buildHitTheNumberSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const { plan, values } = buildIntegerHitTheNumberPlan(day, scheduleVersion);
  const candidates = plan.subjectIds.map((id) => {
    const subject = getFootballHitTheNumberSubject(id);
    if (!subject) throw new Error(`Football Hit the Number subject ${id} is unavailable.`);
    return { id: subject.id, name: subject.name, subtitle: subject.subtitle };
  });
  const valueMap = Object.fromEntries(plan.subjectIds.map((id, index) => [id, values[index]]));
  return {
    setupKey: `${FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}:${plan.metricId}:${plan.pickCount}`,
    contentVersion: FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION,
    scoringVersion: OFFICIAL_SCORE_CONTRACT_VERSION,
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      league: plan.league,
      metric_label: plan.metricLabel,
      domain_label: plan.domainLabel,
      target: plan.target,
      pick_count: plan.pickCount,
      candidates,
      initial_state: { complete: false, selected_ids: [] },
    },
    revealSetup: { target: plan.target, values: valueMap },
    privateSetupEvidence: { fighter_ids: [...plan.subjectIds], pick_count: plan.pickCount },
    privateGradingEvidence: { fighter_ids: [...plan.subjectIds], target: plan.target, pick_count: plan.pickCount, values: valueMap },
  };
}

export function buildFootballOfficialDailySetup(
  gameType: OfficialDailyGameType,
  day: string,
  scheduleVersion: string,
): OfficialDailySetupPublication {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Football official daily day must use YYYY-MM-DD.");
  switch (gameType) {
    case "find_leader": return buildFindLeaderSetup(day, scheduleVersion);
    case "wavelength": return buildWavelengthSetup(day, scheduleVersion);
    case "blind_resume": return buildBlindResumeSetup(day, scheduleVersion);
    case "blind_rank_5": return buildBlindRankSetup(day, scheduleVersion);
    case "keep_4_cut_4": return buildKeepCutSetup(day, scheduleVersion);
    case "hit_the_number": return buildHitTheNumberSetup(day, scheduleVersion);
    default: throw new Error(`Unsupported Football official daily game ${String(gameType)}.`);
  }
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
  return { submissionState: { eliminated_ids: eliminated, final_submission: finalSubmission }, publicState: { complete, eliminated_ids: eliminated, native_progress: complete && eliminatedId !== leaderId ? 10 : eliminated.length }, complete, finalSubmission };
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
  const revealedCount = integer(publicRound.revealed_count, "Football Blind Resume reveal count", 2, 8) as FootballBlindResumeRevealCount;
  if (!FOOTBALL_BLIND_RESUME_REVEAL_COUNTS.includes(revealedCount)) throw new Error("Unsupported Football Blind Resume reveal stage.");
  const priorResults = recordArray(context.publicState.results ?? [], "Football Blind Resume results");
  if (action.reveal === true) {
    if (revealedCount >= 8) throw new Error("All Football Blind Resume stats are already revealed.");
    const next = (revealedCount + 2) as FootballBlindResumeRevealCount;
    return { submissionState: { answers, final_submission: null }, publicState: { complete: false, round_index: answers.length, results: priorResults, current_round: visibleBlindResumeRound(round, next) }, complete: false, finalSubmission: null };
  }
  const side = String(action.choice ?? "").toUpperCase();
  if (side !== "A" && side !== "B") throw new Error("Football Blind Resume choice must be A or B.");
  const pickedId = side === "A" ? String(round.left_id) : String(round.right_id);
  const correct = pickedId === String(round.winner_id);
  const points = footballBlindResumeRoundPoints(revealedCount, correct);
  const nextAnswers = [...answers, { choice: pickedId, revealed_count: revealedCount }];
  const results = [...priorResults, { round_index: answers.length, picked_side: side, picked_id: pickedId, winner_id: round.winner_id, correct, revealed_count: revealedCount, points_awarded: points, left: { id: round.left_id, name: round.left_name, subtitle: round.left_subtitle }, right: { id: round.right_id, name: round.right_name, subtitle: round.right_subtitle } }];
  const complete = nextAnswers.length === rounds.length;
  const finalSubmission = complete ? { answers: nextAnswers } : null;
  return { submissionState: { answers: nextAnswers, final_submission: finalSubmission }, publicState: { complete, round_index: complete ? rounds.length : nextAnswers.length, results, current_round: complete ? null : visibleBlindResumeRound(rounds[nextAnswers.length]!, 2) }, complete, finalSubmission };
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

function advanceHitTheNumber(context: OfficialDailyRuntimeContext, action: JsonRecord): OfficialDailyAdvanceResult {
  const ids = stringArray(context.privateSetupEvidence.fighter_ids, "Football Hit the Number ids");
  const eligible = new Set(ids);
  const pickCount = integer(context.privateSetupEvidence.pick_count, "Football Hit the Number pick count", 4, 7);
  const selected = stringArray(context.submissionState.selected_ids ?? [], "Football Hit the Number selections");
  if (action.lock === true) {
    if (selected.length !== pickCount) throw new Error(`Football Hit the Number requires exactly ${pickCount} selections before lock.`);
    const finalSubmission = { selected_ids: [...selected] };
    return { submissionState: { selected_ids: [...selected], final_submission: finalSubmission }, publicState: { complete: true, selected_ids: [...selected] }, complete: true, finalSubmission };
  }
  const id = String(action.fighter_id ?? "");
  if (!eligible.has(id)) throw new Error("That subject is not on the Football Hit the Number board.");
  const next = selected.includes(id) ? selected.filter((row) => row !== id) : [...selected, id];
  if (next.length > pickCount) throw new Error(`Football Hit the Number allows exactly ${pickCount} selections.`);
  return { submissionState: { selected_ids: next, final_submission: null }, publicState: { complete: false, selected_ids: next }, complete: false, finalSubmission: null };
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
    default: throw new Error(`Unsupported Football official daily game ${String(context.gameType)}.`);
  }
}

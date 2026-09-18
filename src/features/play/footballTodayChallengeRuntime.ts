import { createFootballWhoAmIDailyRound } from "../games/footballWhoAmIDailyAuthority";
import {
  buildFootballBlindResumeRounds,
  footballBlindResumeRevealStage,
  FOOTBALL_BLIND_RESUME_CORRECT_POINTS,
  FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  FOOTBALL_BLIND_RESUME_MISS_POINTS,
} from "../back-room/footballBlindResumeModel";
import {
  buildFootballFindLeaderBoard,
  footballFindLeaderQuestions,
} from "../back-room/footballFindLeaderModel";
import { footballFindLeaderLeagueForDomain } from "../back-room/footballFactualStats";
import {
  createFootballHitTheNumberPlan,
  footballHitTheNumberActiveProgressionSlot,
  footballHitTheNumberAvailableProgressionSubjectIds,
  footballHitTheNumberProgressionSlotSubjectIds,
  footballHitTheNumberRandomPoolSize,
  footballHitTheNumberValue,
  getFootballHitTheNumberSubject,
  type FootballHitTheNumberPlan,
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
} from "../back-room/footballRankFivePlayableModel";
import {
  createFootballWavelengthRound,
  type FootballWavelengthClue,
} from "../back-room/footballWavelengthModel";
import { seededLineupRandom, stableLineupHash } from "./lineupModel";
import { buildWhoAmIDailyPublication } from "./whoAmIDailyRuntime";
import { buildMillionaireDailySetup } from "./millionaireDailyRuntime";
import {
  OFFICIAL_SCORE_CONTRACT_VERSION,
  WAVELENGTH_OFFICIAL_SCORE_CONTRACT_VERSION,
} from "./officialScoreContract";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";

export const FOOTBALL_DAILY_RUNTIME_VERSION = "football-official-daily-v1" as const;
export const FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION = "football-blind-resume-daily-v4" as const;
export const FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION = "football-blind-resume-score-v4" as const;
export const FOOTBALL_HIT_THE_NUMBER_DAILY_CONTENT_VERSION = "football-hit-the-number-daily-v3" as const;

type JsonRecord = Record<string, unknown>;

function recordArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object" || Array.isArray(row))) {
    throw new Error(`${label} must be an object array.`);
  }
  return value as JsonRecord[];
}

function footballItemPresentation(item: FootballRankFiveItem) {
  return { id: item.id, name: item.name, subtitle: item.subtitle, league: item.league };
}

function itemMap(items: readonly FootballRankFiveItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, footballItemPresentation(item)]));
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

function buildBlindResumeSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const rounds = buildFootballBlindResumeRounds(
    `${FOOTBALL_DAILY_RUNTIME_VERSION}|blind-resume|${scheduleVersion}|${day}`,
    FOOTBALL_BLIND_RESUME_DAILY_DIFFICULTIES,
  );
  const privateRounds = rounds.map((round) => ({
    id: round.id,
    prompt: round.prompt,
    league: round.league,
    context_label: round.contextLabel,
    left_id: round.leftId,
    right_id: round.rightId,
    left_name: round.leftName,
    right_name: round.rightName,
    left_subtitle: round.leftSubtitle,
    right_subtitle: round.rightSubtitle,
    winner_id: round.winnerId,
    reveal_counts: [...round.revealCounts],
    stats: round.stats.map((stat) => ({ label: stat.label, value_a: stat.valueA, value_b: stat.valueB })),
  }));
  const scoringLadder = FOOTBALL_BLIND_RESUME_CORRECT_POINTS.map((correct, index) => ({
    stage: index + 1,
    correct,
    wrong: FOOTBALL_BLIND_RESUME_MISS_POINTS[index],
  }));
  const openingCount = blindResumeRevealCounts(privateRounds[0]!)[0];
  return {
    setupKey: `${FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION}:${scheduleVersion}:${day}`,
    contentVersion: FOOTBALL_BLIND_RESUME_DAILY_CONTENT_VERSION,
    scoringVersion: FOOTBALL_BLIND_RESUME_DAILY_SCORING_VERSION as OfficialDailySetupPublication["scoringVersion"],
    publicSetup: {
      runtime_version: FOOTBALL_DAILY_RUNTIME_VERSION,
      round_count: privateRounds.length,
      scoring_ladder: scoringLadder,
      league_mix: rounds.reduce<Record<string, number>>((acc, round) => ({ ...acc, [round.league]: (acc[round.league] ?? 0) + 1 }), {}),
      initial_state: { complete: false, round_index: 0, results: [], raw_points: 0, current_round: visibleBlindResumeRound(privateRounds[0]!, openingCount) },
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

function buildDailyHitTheNumberPlan(day: string, scheduleVersion: string) {
  const desiredLeague = dailyLeague(day, "hit-the-number");
  for (let attempt = 0; attempt < 128; attempt += 1) {
    const seed = `${FOOTBALL_DAILY_RUNTIME_VERSION}|hit-the-number|${scheduleVersion}|${day}|${attempt}`;
    const plan = createFootballHitTheNumberPlan(seed, "random-pool");
    if (plan.league !== desiredLeague) continue;
    if (plan.subjectIds.length !== footballHitTheNumberRandomPoolSize(plan.pickCount)) continue;
    const values = plan.subjectIds.map((id) => footballHitTheNumberValue(id, plan.metricId));
    if (values.every((value) => Number.isFinite(value))) return { plan, values };
  }
  throw new Error("Football Hit the Number could not build the official capped board.");
}

function hitTheNumberPublicState(plan: FootballHitTheNumberPlan, selectedIds: readonly string[], complete = false) {
  const activeSlot = complete ? null : footballHitTheNumberActiveProgressionSlot(plan, selectedIds);
  const availableIds = complete
    ? [...plan.subjectIds]
    : activeSlot
      ? footballHitTheNumberAvailableProgressionSubjectIds(plan, selectedIds)
      : [...plan.subjectIds];
  return {
    complete,
    selected_ids: [...selectedIds],
    available_subject_ids: availableIds,
    active_slot: activeSlot
      ? { ...activeSlot, index: selectedIds.length }
      : null,
  };
}

function buildHitTheNumberSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const { plan, values } = buildDailyHitTheNumberPlan(day, scheduleVersion);
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
      metric_id: plan.metricId,
      metric_label: plan.metricLabel,
      domain_label: plan.domainLabel,
      configuration_label: plan.configurationLabel,
      format_id: plan.formatId,
      target: plan.target,
      pick_count: plan.pickCount,
      slots: plan.slots,
      candidates,
      initial_state: hitTheNumberPublicState(plan, []),
    },
    revealSetup: { target: plan.target, values: valueMap },
    privateSetupEvidence: {
      fighter_ids: [...plan.subjectIds],
      pick_count: plan.pickCount,
      plan,
      progression_slot_subject_ids: footballHitTheNumberProgressionSlotSubjectIds(plan),
    },
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
    case "millionaire": return buildMillionaireDailySetup("football", day, scheduleVersion);
    case "who_am_i": return buildWhoAmIDailyPublication(
      createFootballWhoAmIDailyRound(
        seededLineupRandom(FOOTBALL_DAILY_RUNTIME_VERSION, "who-am-i", scheduleVersion, day, "round"),
      ),
      day,
      scheduleVersion,
      FOOTBALL_DAILY_RUNTIME_VERSION,
      OFFICIAL_SCORE_CONTRACT_VERSION,
    );
    default: throw new Error(`Unsupported Football official daily game ${String(gameType)}.`);
  }
}

export { advanceFootballOfficialDailyRuntime } from "./footballTodayChallengeAdvanceRuntime";

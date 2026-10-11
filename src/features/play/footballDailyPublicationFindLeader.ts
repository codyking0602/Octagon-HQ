import {
  buildFootballFindLeaderBoard,
  footballFindLeaderMetricRows,
  footballFindLeaderQuestions,
  type FootballFindLeaderBoard,
} from "../back-room/footballFindLeaderModel";
import { footballFindLeaderLeagueForDomain } from "../back-room/footballFindLeaderStats";
import { seededLineupRandom, shuffleLineup, stableLineupHash } from "./lineupModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import { dailyUsesTwoGameAverage } from "./dailyTwoGameContract";
import { buildTwoGameDailyPublication } from "./dailyTwoGameRuntime";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_RUNTIME_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

function dailyLeague(day: string, gameIndex = 0) {
  const first = stableLineupHash(`${FOOTBALL_DAILY_RUNTIME_VERSION}|find-leader|${day}`) % 2 === 0 ? "NFL" : "CFB";
  return gameIndex === 0 ? first : first === "NFL" ? "CFB" : "NFL";
}

/**
 * Official NFL QB season volume boards should compare genuine landmark seasons,
 * not random mid-pack 4,000-yard seasons. Keep one top season per QB so the year
 * stays part of the identity and the all-time standard is always represented.
 *
 * This is Daily-only: never change seeded Casual/Profile Challenge replays.
 */
export function curateOfficialQbSeasonBoard(board: FootballFindLeaderBoard, seed: string): FootballFindLeaderBoard {
  if (board.domainId !== "nfl-qb-season"
    || (board.metricId !== "qb-season-passing-yards" && board.metricId !== "qb-season-passing-touchdowns")) {
    return board;
  }
  const uniquePlayers = new Set<string>();
  const topSeasons: FootballFindLeaderBoard["candidates"] = [];
  for (const row of footballFindLeaderMetricRows(board.metricId)) {
    const player = (row.displayName ?? row.name.replace(/\s+\d{4}$/, "")).toLowerCase();
    if (uniquePlayers.has(player) || row.season == null) continue;
    uniquePlayers.add(player);
    topSeasons.push({
      id: row.id,
      name: row.name,
      displayName: row.displayName,
      season: row.season,
      subtitle: row.subtitle,
      value: row.value,
    });
    if (topSeasons.length === 10) break;
  }
  if (topSeasons.length < 10) return board;
  return {
    ...board,
    leaderId: topSeasons[0]!.id,
    leaderValue: topSeasons[0]!.value,
    candidates: shuffleLineup(topSeasons, seededLineupRandom("football-daily-elite-qb-seasons-v1", seed, board.definitionId)),
  };
}

function buildFindLeaderSetup(day: string, scheduleVersion: string, gameIndex = 0): OfficialDailySetupPublication {
  const desiredLeague = dailyLeague(day, gameIndex).toLowerCase();
  const questions = footballFindLeaderQuestions.filter((question) =>
    footballFindLeaderLeagueForDomain(question.domainId) === desiredLeague);
  const startSeed = gameIndex === 0
    ? `${scheduleVersion}|${day}|football-find-leader`
    : `${scheduleVersion}|${day}|football-find-leader|game-2`;
  const start = stableLineupHash(startSeed) % questions.length;
  let board = null;
  for (let offset = 0; offset < questions.length; offset += 1) {
    const question = questions[(start + offset) % questions.length]!;
    board = buildFootballFindLeaderBoard(
      question,
      gameIndex === 0
        ? `${FOOTBALL_DAILY_RUNTIME_VERSION}|${scheduleVersion}|${day}|${offset}`
        : `${FOOTBALL_DAILY_RUNTIME_VERSION}|${scheduleVersion}|${day}|game-2|${offset}`,
    );
    if (board) break;
  }
  if (!board) throw new Error("Football Find the Leader could not build the official board.");
  board = curateOfficialQbSeasonBoard(board, `${scheduleVersion}|${day}|${gameIndex}`);
  const candidates = board.candidates.map(({ id, name, subtitle }) => ({ id, name, subtitle }));
  return {
    setupKey: gameIndex === 0
      ? `football-find-leader:${scheduleVersion}:${day}:${board.definitionId}`
      : `football-find-leader:${scheduleVersion}:${day}:game-2:${board.definitionId}`,
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
    revealSetup: {
      leader_id: board.leaderId,
      leader_value: board.leaderValue,
      candidates: board.candidates,
    },
    privateSetupEvidence: {
      candidate_ids: board.candidates.map((row) => row.id),
      leader_id: board.leaderId,
    },
    privateGradingEvidence: {
      candidate_ids: board.candidates.map((row) => row.id),
      leader_id: board.leaderId,
    },
  };
}

export function buildFootballDailyPersistenceSetup(
  day: string,
  scheduleVersion: string,
  gameType: OfficialDailyGameType,
) {
  if (gameType !== "find_leader") throw new Error("Football Find the Leader publication runtime received the wrong game type.");
  const publication = dailyUsesTwoGameAverage(gameType, day)
    ? buildTwoGameDailyPublication({
        sport: "football",
        gameType,
        day,
        scheduleVersion,
        children: [
          buildFindLeaderSetup(day, scheduleVersion, 0),
          buildFindLeaderSetup(day, scheduleVersion, 1),
        ],
      })
    : buildFindLeaderSetup(day, scheduleVersion);
  return persistenceSetup(gameType, day, scheduleVersion, publication);
}

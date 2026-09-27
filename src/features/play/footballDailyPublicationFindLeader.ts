import {
  buildFootballFindLeaderBoard,
  footballFindLeaderQuestions,
} from "../back-room/footballFindLeaderModel";
import { footballFindLeaderLeagueForDomain } from "../back-room/footballFindLeaderStats";
import { stableLineupHash } from "./lineupModel";
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

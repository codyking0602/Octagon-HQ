import {
  buildFootballFindLeaderBoard,
  footballFindLeaderQuestions,
} from "../back-room/footballFindLeaderModel";
import { footballFindLeaderLeagueForDomain } from "../back-room/footballFindLeaderStats";
import { stableLineupHash } from "./lineupModel";
import { OFFICIAL_SCORE_CONTRACT_VERSION } from "./officialScoreContract";
import type {
  OfficialDailyGameType,
  OfficialDailySetupPublication,
} from "./todaysChallengeRuntime";
import {
  FOOTBALL_DAILY_RUNTIME_VERSION,
  persistenceSetup,
} from "./footballDailyPublicationShared";

function dailyLeague(day: string) {
  return stableLineupHash(`${FOOTBALL_DAILY_RUNTIME_VERSION}|find-leader|${day}`) % 2 === 0 ? "NFL" : "CFB";
}

function buildFindLeaderSetup(day: string, scheduleVersion: string): OfficialDailySetupPublication {
  const desiredLeague = dailyLeague(day).toLowerCase();
  const questions = footballFindLeaderQuestions.filter((question) =>
    footballFindLeaderLeagueForDomain(question.domainId) === desiredLeague);
  const start = stableLineupHash(`${scheduleVersion}|${day}|football-find-leader`) % questions.length;
  let board = null;
  for (let offset = 0; offset < questions.length; offset += 1) {
    const question = questions[(start + offset) % questions.length]!;
    board = buildFootballFindLeaderBoard(
      question,
      `${FOOTBALL_DAILY_RUNTIME_VERSION}|${scheduleVersion}|${day}|${offset}`,
    );
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
  return persistenceSetup(gameType, day, scheduleVersion, buildFindLeaderSetup(day, scheduleVersion));
}
